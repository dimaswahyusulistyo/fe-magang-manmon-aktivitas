<script setup>
import axios from 'axios';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { defineProps, ref, watch } from 'vue';

const toast = useToast();
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    taskId: {
        type: String,
        required: true
    }
});

const baseURL = 'http://127.0.0.1:8000/';
const emit = defineEmits(['save', 'hideDialog', 'update:visible']);
const mapElement = ref(null);
const submitted = ref(false);

const laporan = ref({
    latitude : null,
    longitude : null,
    koordinator: '',
    dokumen: null,
    foto: [],
    keterangan: '',
    tanggal: ''
});

const selectedFiles = ref([]);
const selectedFoto = ref([]);
const originalLaporan = ref(null);
const photoUrl = ref('');
const files = ref([]);

const fetchReport = async () => {
    try {
        const response = await axios.get(`/api/report/${props.taskId}`);
        console.log('Report data received:', response.data);
        
        if (response.data && response.data.report) {
            originalLaporan.value = { ...response.data.report };
            laporan.value = response.data.report; 

            if (laporan.value.latitude && laporan.value.longitude) {
                laporan.value.lokasi = `Lat: ${laporan.value.latitude}, Lng: ${laporan.value.longitude}`;
                initMap(laporan.value.latitude, laporan.value.longitude); 
            }
            
            selectedFiles.value.forEach((file) => {
                formData.append('documents[]', file);
            });

            if (selectedFoto.value.length > 0) {
                selectedFoto.value.forEach((file) => {
                    formData.append('photo', file); 
                });
            }
            
            photoUrl.value = laporan.value.photo;

            selectedFoto.value.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    file.preview = e.target.result;
                };
                reader.readAsDataURL(file);
            });
            
        } else {
            toast.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Tidak ada data laporan ditemukan.',
                life: 3000,
            });
        }
    } catch (error) {
        console.error('Error fetching report:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat laporan.',
            life: 3000,
        });
    }
};

const deleteDocument = async (documentId) => {
    try {
        await axios.delete(`/api/report/documents/${documentId}`);
        files.value = files.value.filter(file => file.id !== documentId);
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Dokumen berhasil dihapus.',
            life: 3000,
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus dokumen. Silakan coba lagi.',
            life: 3000,
        });
    }
};

watch(() => props.visible, (newVal) => {
    if (newVal) {
        console.log('Opening dialog with taskId:', props.taskId); 
        fetchReport();
    } else {
        hideDialog();
    }
});

const hideDialog = () => {
 laporan.value = {
        lokasi: '',
        koordinator: '',
        alamat: '',
        dokumen: null,
        photoUrl: '',
        keterangan: '',
        tanggal: ''
    };
    emit('hideDialog');
    emit('update:visible', false);
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

const getGeocodedAddress = async (latitude, longitude) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    laporan.value.alamat = data.display_name;
};

const initMap = (latitude, longitude) => {
    if (!mapElement.value) return;

    const map = L.map(mapElement.value).setView([latitude, longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

    marker.on('dragend', (event) => {
        const newLatLng = event.target.getLatLng();
        laporan.value.latitude = newLatLng.lat; 
        laporan.value.longitude = newLatLng.lng;
        laporan.value.lokasi = `Lat: ${newLatLng.lat}, Lng: ${newLatLng.lng}`;
        getGeocodedAddress(newLatLng.lat, newLatLng.lng);
    });
};

const onFileSelect = (event) => {
    selectedFiles.value = event.files;
};

const submitLaporan = async () => {
    submitted.value = true;
    const formData = new FormData();
    formData.append('task_id', props.taskId);

    if (laporan.value.description) {
        formData.append('description', laporan.value.description);
    }
    
    // Handle date
    if (laporan.value.date) {
        const dateValue = new Date(laporan.value.date);
        if (!isNaN(dateValue.getTime())) {
            const formattedDate = dateValue.toLocaleDateString('en-CA');
            formData.append('date', formattedDate);
        }
    }

    // Location
    if (laporan.value.latitude) {
        formData.append('latitude', laporan.value.latitude);
    }
    if (laporan.value.longitude) {
        formData.append('longitude', laporan.value.longitude);
    }

    // Handle documents
    selectedFiles.value.forEach((file) => {
        formData.append('documents[]', file);
    });

    // Handle photos
    if (selectedFoto.value.length > 0) {
        selectedFoto.value.forEach((file) => {
            formData.append('photo', file);
        });
    }

    try {
        const response = await axios.post(`/api/report`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 200) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: response.data.message,
                life: 3000,
            });
            emit('save', response.data.data);
            hideDialog();
        }
    } catch (error) {
        console.error('Error saving report:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menyimpan laporan.',
            life: 3000,
        });
    } finally {
        submitted.value = false;
    }
};
const onUploadFoto = (event) => {
    selectedFoto.value = event.files;
    selectedFoto.value.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            file.preview = e.target.result; 
        };
        reader.readAsDataURL(file);
    });
};

const setToday = () => {
    const today = new Date();
    laporan.value.date = today;
};

</script>

<template>
    <Dialog
        :visible="visible"
        :modal="true"
        :style="{ width: '80vw' }"
        header="Edit Laporan Kegiatan"
        @update:visible="handleUpdateVisible"
        @hide="hideDialog">
        <form @submit.prevent="submitLaporan">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="lokasi">Lokasi</label>
                    <div class="flex items-center">
                        <InputText
                            id="lokasi"
                            v-model="laporan.lokasi"
                            placeholder="Masukkan atau cari lokasi otomatis"
                            required="required"/>
                        <Button
                            icon="pi pi-map-marker"
                            class="ml-2 p-button-info"
                            label="Cari Lokasi"
                            @click="getCurrentLocation"/>
                    </div>
                    <div ref="mapElement" class="map mt-4"></div>
                </div>

                <div class="field">
                    <label for="dokumen">Dokumen Laporan</label>
                    <FileUpload
                        name="dokumen"
                        :auto="false"
                        :multiple="true"
                        accept=".pdf,.doc,.docx"
                        maxFileSize="10000000"
                        chooseLabel="Pilih Dokumen"
                        :customUpload="false"
                        @select="onFileSelect"
                        cancelLabel="Batal"
                        uploadLabel="Unggah"
                        :files="selectedFiles" />
                    
                        <div v-if="files.length">
                            <div v-for="file in files" :key="file.id" class="mb-4">
                                <iframe 
                                    :src="baseURL + 'storage/' + file.name"
                                    width="100%" 
                                    height="500px" 
                                    frameborder="0" 
                                    class="border rounded shadow">
                                </iframe>
                            </div>
                        </div>

                    <div class="field col-span-1 md:col-span-1 mt-4">
                        <label for="tanggal">Tanggal Laporan</label>
                        <div class="flex items-center">
                            <div class="flex-grow">
                                <Calendar 
                                    id="tanggal" 
                                    v-model="laporan.date" 
                                    :showIcon="true" 
                                    :dateFormat="'yy-mm-dd'" 
                                    placeholder="Pilih tanggal" 
                                    required="required"/>
                                <Button label="Today" icon="pi pi-calendar" @click="setToday" class="p-button-sm ml-2"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="field col-span-1 md:col-span-2">
                    <label for="foto">Foto</label>
                    <div class="flex justify-center mb-4">
                        <label for="foto">* gambar akan terhapus apabila anda menambahkan ulang</label>
                    </div>
                    
                    <div class="flex justify-center mb-4">
                        <img  :src="baseURL + `storage/${photoUrl}`" alt="Photo" class="custom-image" />
                    </div>
                    <FileUpload
                        name="foto"
                        :auto="false"
                        :customUpload="true"
                        accept=".jpg,.jpeg,.png"
                        maxFileSize="10000000"
                        multiple="multiple"
                        chooseLabel="Pilih Foto"
                        cancelLabel="Batal"
                        uploadLabel="Unggah"
                        @select="onUploadFoto"
                        :files="selectedFoto" />
                    </div>
                <div class="field col-span-1 md:col-span-2">
                    <label for="keterangan">Keterangan</label>
                    <textarea
                        id="keterangan"
                        v-model="laporan.description"
                        placeholder="Masukkan keterangan laporan"
                        rows="5"
                        required="required"
                        class="p-inputtext"></textarea>
                </div>
            </div>

            <div class="flex justify-end mt-4">
                <Button
                    label="Batal"
                    icon="pi pi-times"
                    class="p-button-text"
                    @click="hideDialog"/>
                <Button label="Simpan" icon="pi pi-check" @click="submitLaporan" class="ml-2"/>
            </div>
        </form>
    </Dialog>
</template>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

.field label {
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.p-fileupload {
    width: 100%;
}

.map {
    height: 300px;
}

.custom-image {
    max-width: 50%; 
    max-height: full; 
    height: auto; 
    object-fit: cover;
}
</style>