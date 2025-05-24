<script setup="setup">
    import axios from 'axios';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';

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

    const emit = defineEmits(['save', 'hideDialog', 'update:visible']);
    const mapElement = ref(null);

    const laporan = ref({
        lokasi: '',
        koordinator: '',
        alamat: '',
        dokumen: null,
        foto: [],
        keterangan: '',
        tanggal:''
    });

    const isFormValid = computed(() => {
        return laporan
            .value
            .lokasi
            .trim() !== '' && laporan
            .value
            .koordinator
            .trim() !== '' && laporan
            .value
            .alamat
            .trim() !== '' && laporan.value.dokumen !== null && laporan.value.foto.length > 0 && laporan
            .value
            .keterangan
            .trim() !== '';
    });
    const selectedFiles = ref([]);
    const selectedFoto = ref([]);

    function onFileSelect(event) {
        selectedFiles.value = event.files; 
    }

    const onUploadFoto = (event) => {
        selectedFoto.value = event.files;
    };

    const submitLaporan = async () => {
    try {
        const formData = new FormData();
        const tanggal = laporan.value.tanggal ? new Date(laporan.value.tanggal).toISOString().split('T')[0] : '';
        const [lat, lng] = laporan.value.lokasi.replace('Lat: ', '').replace('Lng: ', '').split(', ');
        formData.append('latitude', lat);
        formData.append('longitude', lng);
        formData.append('description', laporan.value.keterangan);
        formData.append('task_id', props.taskId);

        console.log('task id :', props.taskId);

        // Kirim dokumen (file)
        selectedFiles.value.forEach((file) => {
            formData.append('documents[]', file);
        });

        // Kirim tanggal dalam format yyyy-mm-dd
        formData.append('date', tanggal);

        // Kirim foto
        selectedFoto.value.forEach((file) => {
            formData.append('photo', file);  // Gunakan 'foto[]' untuk foto
        });

        // Menampilkan semua data dalam formData di console
        console.log('Data yang akan dikirim:');
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        const response = await axios.post('/api/report', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Laporan berhasil dikirim:', response.data);
        emit('save', response.data);
        emit('update:visible', false);
        hideDialog();
       
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Laporan berhasil dikirim.',
            life: 3000,
        });
    } catch (error) {
        console.error('Gagal mengirim laporan:', error.response?.data || error.message);
        
        // Menampilkan notifikasi gagal
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.',
            life: 3000,
        });

        // Menampilkan alert sebagai fallback
        alert('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
    }
};



    const hideDialog = () => {
        laporan.value = {
            lokasi: '',
            koordinator: '',
            alamat: '',
            dokumen: null,
            foto: [],
            keterangan: ''
        };
        emit('hideDialog');
        emit('update:visible', false);
    };

    watch(() => props.visible, (newVal) => {
        if (!newVal) {
            laporan.value = {
                lokasi: '',
                koordinator: '',
                alamat: '',
                dokumen: null,
                foto: [],
                keterangan: ''
            };
        }
    });

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
        if (!mapElement.value) return; // Pastikan elemen peta ada

        const map = L.map(mapElement.value).setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

        // Update lokasi saat marker digeser
        marker.on('dragend', (event) => {
            const newLatLng = event.target.getLatLng();
            laporan.value.lokasi = `Lat: ${newLatLng.lat}, Lng: ${newLatLng.lng}`;
            getGeocodedAddress(newLatLng.lat, newLatLng.lng);
        });
    };

    function handleUpdateVisible(val) {
        console.log('handleUpdateVisible dipanggil dengan nilai:', val);
        emit('update:visible', val);
        if (!val) {
            resetForm();
        }
    }

    const setToday = () => {
        laporan.value.tanggal = new Date();
    };
</script>

<template>
    <Dialog
        :visible="visible"
        :modal="true"
        :style="{ width: '80vw' }"
        header="Tambah Laporan Kegiatan"
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
                        uploadLabel="Unggah"/>
                    
                        <div class="field col-span-1 md:col-span-1 mt-4">
                            <label for="tanggal">Tanggal Laporan</label>
                            <div class="flex items-center">
                                <div class="flex-grow">
                                    <Calendar 
                                        id="tanggal" 
                                        v-model="laporan.tanggal" 
                                        :showIcon="true" 
                                        :dateFormat="'dd-mm-yy'" 
                                        placeholder="Pilih tanggal" 
                                        required="required"/>
                                        <Button label="Today" icon="pi pi-calendar" @click="setToday" class="p-button-sm ml-2"/>
                                </div>
                            </div>
                        </div>
                </div>

                <div class="field col-span-1 md:col-span-2">
                    <label for="alamat">Alamat</label>
                    <InputText
                        id="alamat"
                        v-model="laporan.alamat"
                        placeholder="Masukkan atau cari alamat otomatis"
                        required="required"/>
                </div>

                <div class="field col-span-1 md:col-span-2">
                    <label for="foto">Foto</label>
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
                        />
                </div>

                <div class="field col-span-1 md:col-span-2">
                    <label for="keterangan">Keterangan</label>
                    <textarea
                        id="keterangan"
                        v-model="laporan.keterangan"
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
                <Button label="Simpan" icon="pi pi-check" type="submit" class="ml-2"/>
            </div>
        </form>
    </Dialog>
</template>

<style scoped="scoped">
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
</style>