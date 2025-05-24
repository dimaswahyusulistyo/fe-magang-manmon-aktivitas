<script setup>
import axios from 'axios';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { ref, watch } from 'vue';

const toast = useToast();
// Define props untuk menerima 'visible' dan 'activityId' dari induk
const props = defineProps({
    visible: Boolean,
    activityId: {
        type: Number,
        required: true
    },
    programOptions: Array,
});


const emit = defineEmits(['update:visible', 'save', 'error']);

const program_id = ref('');
const kegiatan = ref('');
const host = ref('');
const deskripsi = ref('');
const lokasi = ref('');
const tanggal = ref('');
const waktu = ref('');

// State utama untuk activity
const activity = ref({
    program: '',
    kegiatan: '',
    tanggal: '',
    waktu: '00:00',
    lokasi: '',
    tempat: '',
    anggota: [],
    file: [],
    host: '',
    deskripsi: '',
    penyelenggara: ''
});

const availablePrograms = ref([]); // State untuk opsi program
const submitted = ref(false);
const previousActivity = ref(null);

// Fungsi untuk memuat data kegiatan berdasarkan `activityId`
async function loadActivityData() {
    try {
        const response = await axios.get(`/api/task/${props.activityId}`);
        const task = response.data.task; // Ensure this is the correct path

        const programResponse = await axios.get(`/api/program/${task.program_id}`);
        const program = programResponse.data.program;

        // Simpan data sebelumnya di sini
        previousActivity.value = { ...task }; // Menyimpan seluruh data aktivitas yang dimuat

        if (task.location) {
            activity.value.lokasi = 'dalam_kota';
        } else {
            activity.value.lokasi = 'luar_kota';
        }

        activity.value = {
            program: task.program_id || '',
            kegiatan: task.name || '',
            tanggal: task.date || '',
            waktu: task.time ? task.time.substring(0, 5) : '00:00',
            lokasi: activity.value.lokasi,
            tempat: task.location || '',
            anggota: task.anggota || [],
            file: task.files ? task.files.map(file => ({ name: file.name, url: file.url })) : [],
            deskripsi: task.description || '',
            penyelenggara: task.host || ''
        };

        availablePrograms.value = [{ label: program.name, value: program.id }];
    } catch (error) {
        emit('error', 'Gagal memuat data kegiatan.');
        console.error('Error loading activity data:', error);
    }
}

const saveActivity = async () => {
    try {
        submitted.value = true; // Memulai validasi
        if (!activity.value.program || !activity.value.kegiatan || !activity.value.tanggal || !activity.value.waktu) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Gagal',
                detail: 'Harap isi semua field yang wajib.',
                life: 3000,
            });
            return;
        }

        // Log data yang akan disimpan
        console.log('Data yang akan disimpan sebelum dikonversi ke FormData:', {
            program_id: activity.value.program,
            name: activity.value.kegiatan,
            host: activity.value.penyelenggara,
            description: activity.value.deskripsi,
            location: activity.value.tempat,
            date: activity.value.tanggal,
            time: activity.value.waktu,
            file: activity.value.file
        });

        const formData = new FormData();
        formData.append('program_id', activity.value.program || '');
        formData.append('name', activity.value.kegiatan || '');
        formData.append('host', activity.value.penyelenggara || '');
        formData.append('description', activity.value.deskripsi || '');
        formData.append('location', activity.value.tempat || '');
        formData.append('date', activity.value.tanggal || '');
        formData.append('time', activity.value.waktu || '');

        if (activity.value.file.length > 0) {
      for (const file of activity.value.file) {
        formData.append('file', file); 
      }
    }

        // Log isi FormData secara rinci
        console.log('Isi FormData yang akan dikirim:');
        formData.forEach((value, key) => {
            console.log(`${key}:`, value);
        });

        const response = await axios.put(`/api/task/${props.activityId}`, formData, {
            headers: { 'Content-Type': 'application/json' },
        });

        emit('save', response.data.task);
        emit('refresh');
        emit('update:visible', false);
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Kegiatan berhasil diperbarui.',
            life: 3000,
        });
    } catch (error) {
        if (error.response) {
            const errorMsg = error.response.data.message || 'Terjadi kesalahan.';
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMsg,
                life: 3000,
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal terhubung ke server.',
                life: 3000,
            });
        }
    }
};


// Fungsi untuk memuat ulang data setelah dialog ditutup
function resetActivity() {
    activity.value = {
        program: '',
        kegiatan: '',
        tanggal: '',
        waktu: '00:00',
        lokasi: '',
        tempat: '',
        anggota: [],
        file: [],
        host: '',
        deskripsi: '',
        penyelenggara: ''
    };
}

function onFileSelect(event) {
    if (event.files && event.files.length > 0) {
        activity.value.file = event.files;
        console.log('Files selected:', event.files);  // Memastikan file diterima
    }
}

// Watch dialog visibility untuk memuat data
watch(() => props.visible, async (newVal) => {
    if (newVal) {
        if (props.activityId) {
            console.log('Loading activity data for ID:', props.activityId);
            await loadActivityData();
        }
    } else {
        resetActivity();
    }
});


// Fungsi untuk menutup dialog
function onHide() {
    emit('update:visible', false);
}
</script>


<style scoped="scoped">
    .field {
        margin-bottom: 1rem;
    }
    .w-full {
        width: 100%;
    }
</style>

<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :style="{ width: '450px' }"
        header="Edit Kegiatan"
        :modal="true">
        <div class="flex flex-col gap-6">

            <div>
                <label for="program" class="block font-bold mb-3">Program</label>
                <Dropdown
                    v-if="availablePrograms.length > 0"
                    id="program"
                    v-model="activity.program"
                    :options="availablePrograms"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Program"
                    required="required"
                    :invalid="submitted && !activity.program"
                    fluid="fluid"/>
                <small v-if="submitted && !activity.program" class="text-red-500">Program is required.</small>
            </div>

            <div>
                <label for="kegiatan" class="block font-bold mb-3">Kegiatan</label>
                <InputText
                    id="kegiatan"
                    v-model.trim="activity.kegiatan"
                    required="true"
                    autofocus="autofocus"
                    :invalid="submitted && !activity.kegiatan"
                    fluid="fluid"/>
                <small v-if="submitted && !activity.kegiatan" class="text-red-500">Kegiatan is required.</small>
            </div>
            <div>
                <label for="tanggal" class="block font-bold mb-3">Tanggal</label>
                <Calendar
                    id="tanggal"
                    v-model="activity.tanggal"
                    dateFormat="yy-mm-dd"
                    required="true"
                    fluid="fluid"/>
            </div>
            <div>
                <label for="waktu" class="block font-bold mb-3">Waktu</label>
                <InputText
                    id="waktu"
                    v-model="activity.waktu"
                    required="required"
                    class="p-inputtext p-component w-full p-mb-3"
                    type="time"
                    placeholder="Pilih Waktu"/>
                <small v-if="submitted && !activity.waktu" class="text-red-500">Waktu wajib diisi.</small>
            </div>
            <div>
                <label for="lokasi" class="block font-bold mb-3">Lokasi</label>
                <div class="flex gap-4">
                    <div>
                        <input
                            type="radio"
                            id="dalam_kota"
                            value="dalam_kota"
                            v-model="activity.lokasi"/>
                        <label for="dalam_kota" class="ml-2">Dalam Kota</label>
                    </div>
                    <div>
                        <input type="radio" id="luar_kota" value="luar_kota" v-model="activity.lokasi"/>
                        <label for="luar_kota" class="ml-2">Luar Kota</label>
                    </div>
                </div>
            </div>
            <div v-if="activity.lokasi === 'dalam_kota'">
                <label for="tempat" class="block font-bold mb-3">Tempat</label>
                <InputText id="tempat" v-model="activity.tempat" required="true" fluid="fluid"/>
            </div>
            <div>
                <label for="deskripsi" class="block font-bold mb-3">Deskripsi</label>
                <InputText
                    id="deskripsi"
                    v-model.trim="activity.deskripsi"
                    required="true"
                    fluid="fluid"
                    :invalid="submitted && !activity.deskripsi"/>
                <small v-if="submitted && !activity.deskripsi" class="text-red-500">Deskripsi wajib diisi.</small>
            </div>
            <div>
                <label for="penyelenggara" class="block font-bold mb-3">Penyelenggara</label>
                <InputText
                    id="penyelenggara"
                    v-model.trim="activity.penyelenggara"
                    required="true"
                    fluid="fluid"
                    :invalid="submitted && !activity.penyelenggara"/>
                <small v-if="submitted && !activity.penyelenggara" class="text-red-500">Penyelenggara wajib diisi.</small>
            </div>
            </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="onHide"/>
            <Button label="Save" icon="pi pi-check" @click="saveActivity"/>
        </template>
    </Dialog>
</template>