<script setup>
import axios from 'axios';
import html2canvas from 'html2canvas';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';


const props = defineProps({
    taskId: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        default: false
    }
});


const isGeneratingPDF = ref(false);
const pdfError = ref(null);
const baseURL = 'http://127.0.0.1:8000/';
const route = useRoute(); 
const taskId = ref(route.params.taskId);
const latitude = ref(null);
const longitude = ref(null);
const files = ref([]);
const photos = ref([]);
const laporan = ref({}); 
const modifiedByName = ref('');
const activities = ref([]);
const errorMessage = ref('');
const photoUrl = ref('');
const user = ref(null);
const taskData = ref(null);

const fetchReport = async () => {
    try {
        const response = await axios.get(`/api/report/${taskId.value}`);
        console.log('Report data received:', response.data);
        
        if (response.data && response.data.report) {
            laporan.value = response.data.report;
            latitude.value = laporan.value.latitude;
            longitude.value = laporan.value.longitude;
            photoUrl.value = laporan.value.photo;
            user.value = response.data.user;
            files.value =response.data.files.map(file => ({
                id: file.id,
                name: file.name,
                created_at: file.created_at,
            }));
            errorMessage.value = '';

            const userId = laporan.value.modified_by;
            console.log('NAMA FILE PERTAMA:', files.value[0]?.name);
            console.log ('URL :', baseURL);

            if (response.data.user) {
                modifiedByName.value = response.data.user.name; 
            } else {
                modifiedByName.value = 'N/A';  
            }
        } else {
            errorMessage.value = 'Tidak ada data laporan ditemukan';
        }
    } catch (error) {
        console.error('Error fetching report:', error);
        errorMessage.value = 'Gagal memuat laporan';
    }
};

const fetchTaskData = async () => {
    try {
        const response = await axios.get(`/api/task/${taskId.value}`);
        console.log('Task data received:', response.data);
        
        if (response.data && response.data.task) {
            taskData.value = response.data.task;

            activities.value = response.data.task_users.map((user, index) => {
                const programUser  = response.data.program_users.find(
                    (programUser ) => programUser .id === user.id
                );

                return {
                    user_id: user.id,
                    anggota: user.name, 
                    role: programUser ?.pivot?.role || "Tidak ada role", 
                    no: index + 1,
                };
            });

            console.log('Anggota Program:', activities.value);
        }
    } catch (error) {
        console.error('Error fetching task:', error);
    }
};

onMounted(() => {
    fetchReport();
    fetchTaskData();
    getCurrentLocation();
});

const cetakLembar = () => {
    generatePDF();
};

const generatePDF = async () => {
    try {
        isGeneratingPDF.value = true;
        
        // Configuration for PDF generation
        const options = {
            margin: [10, 10],
            filename: 'Laporan.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: { 
                unit: 'pt', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            }
        };

        // Get all iframes
        const iframes = document.querySelectorAll('iframe');
        
        // Convert each iframe to an image using html2canvas
        for (const iframe of iframes) {
            try {
                // Create a container for the preview
                const container = document.createElement('div');
                container.style.width = '100%';
                container.style.marginBottom = '20px';

                // Capture the iframe content as an image
                const canvas = await html2canvas(iframe, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 2,
                    windowWidth: iframe.width,
                    windowHeight: iframe.height,
                    logging: false
                });

                // Convert canvas to image
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/jpeg', 0.98);
                img.style.width = '100%';
                img.style.maxHeight = '500px';
                img.style.objectFit = 'contain';
                container.appendChild(img);

                // Replace iframe with the preview image
                iframe.parentNode.replaceChild(container, iframe);
            } catch (error) {
                console.error('Error converting iframe:', error);
                // Create an error placeholder
                const errorDiv = document.createElement('div');
                errorDiv.style.padding = '20px';
                errorDiv.style.backgroundColor = '#fff3f3';
                errorDiv.style.borderRadius = '4px';
                errorDiv.innerHTML = `
                    <div style="text-align: center; color: #666;">
                        <p>Preview dokumen tidak dapat dimuat</p>
                    </div>
                `;
                iframe.parentNode.replaceChild(errorDiv, iframe);
            }
        }

        // Wait for all images to load
        const images = document.querySelectorAll('img');
        await Promise.all([...images].map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));

        const element = document.getElementById('printTable');
        
        // Generate PDF
        const pdf = await html2pdf().set(options).from(element).save();
        
        isGeneratingPDF.value = false;
        return pdf;

    } catch (error) {
        console.error('Error generating PDF:', error);
        isGeneratingPDF.value = false;
        throw error;
    }
};
const getGeocodedAddress = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        if (data && data.display_name) {
            laporan.value.alamat = data.display_name;
        } else {
            laporan.value.alamat = 'Alamat tidak ditemukan';
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        laporan.value.alamat = 'Error fetching address';
    }
};

const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                laporan.value.lokasi = `Lat: ${latitude}, Lng: ${longitude}`;
                getGeocodedAddress(latitude, longitude);
                initMap(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location: ", error);
                alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

</script>

<style scoped>
.card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
}

    .pdf-wrapper {
        width: 100%;
        height: auto;
        max-width: 100%;
    }

    img {
        width: 100%;
        height: auto;
    }

    .map {
        width: 100%;
        height: 260px;
    }

</style>

<template>
    <div class="card border mb-4">
      <CCardHeader class="d-flex justify-content-between align-items-center header">
        <div>
          <Button
              icon="pi pi-download"
              class="p-button-rounded !text-sm !px-4 !py-2"
              label="Unduh Laporan"
              severity="success"
              :loading="isGeneratingPDF"
              @click="generatePDF"
            />
        </div>
      </CCardHeader>
      <br />
      <CCardBody>
        <div
          id="printTable"
          style="margin: 20px; padding: 0; display: flex; justify-content: center; background-color: #ffffff;"
        >
          <table
            style="margin-left: -0.25pt; border-collapse: collapse; border-color: black; width: 100%;"
          >
            <tbody style="color: #000000;">
              <!-- Kop Surat -->
                <tr>
                    <td colspan="2" style="border: 1pt solid black; padding: 20px; text-align: center; font-weight: bold;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <img src="/logokra.jpg" alt="Logo Kabupaten Karanganyar" style="width: 80px; height: 80px; margin-right: 15px;"/>
                            <div>
                                <div style="font-size: 20px; margin-bottom: 5px;">PEMERINTAH KAB. KARANGANYAR</div>
                                <div style="font-size: 22px; margin-bottom: 5px;">DISKOMINFO KARANGANYAR</div>
                                <div style="font-size: 18px;">Jl. Lawu No. 385B Karanganyar, Telp (0271) 495039 ext 239</div>
                            </div>
                        </div>
                    </td>
                </tr>
              <!-- Data Laporan -->
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Pelaporan oleh:</strong>
                  {{ user || 'N/A' }}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Anggota:</strong>
                  <ul>
                    <li v-for="activity in activities" :key="activity.user_id">
                      {{ activity.no }}. {{ activity.anggota }} - {{ activity.role }}
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Nama Kegiatan:</strong>
                  {{ taskData?.name || 'N/A' }}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Tanggal Pelaporan:</strong>
                  {{ laporan?.date || 'N/A' }}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Keterangan:</strong>
                  {{ laporan?.description || 'Keterangan tidak tersedia.' }}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Lokasi:</strong>
                  {{ laporan.alamat }}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1pt solid black; padding: 10px;">
                  <strong>Gambar:</strong>
                  <div class="flex justify-center">
                    <img
                      :src="baseURL + 'api/storage/' + photoUrl"
                      alt="Photo"
                      class="w-32 h-32 object-cover"
                      v-if="photoUrl"
                    />
                    <p v-else>Tidak ada foto tersedia.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CCardBody>
    </div>
  </template>
  
  <style scoped>
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }
  
  .pdf-wrapper {
    width: 100%;
    height: auto;
    max-width: 100%;
  }
  
  img {
    width: 100%;
    height: auto;
  }
  
  .map {
    width: 100%;
    height: 260px;
  }
  
  /* Styling Kop Surat */
  .card table td {
    padding: 10px;
    font-size: 16px;
  }
  
  .card table td div {
    text-align: center;
  }
  
  .card table td strong {
    font-weight: bold;
  }
  
  .card table td ul {
    list-style-type: none;
    padding: 0;
  }
  
  .card table td ul li {
    padding: 3px 0;
  }
  </style>
  