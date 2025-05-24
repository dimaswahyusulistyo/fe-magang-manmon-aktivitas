<script setup="setup">
import axios from 'axios';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

const toast = useToast();

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save', 'hide']);

const activity = ref({
    program: '',
    kegiatan: '',
    tanggal: '',
    tempat: '',
    anggota: [],
    deskripsi: '',
    waktu: '00:00:00',
    penyelenggara: '',
    lokasi: 'dalam_kota'
});

const getAnggotaLabel = (anggotaId) => {
    const foundAnggota = activity.value.anggotaOptions.find((option) => option.value === anggotaId);
    return foundAnggota ? foundAnggota.label : '';
};
const selectedFiles = ref([]);

function onFileSelect(event) {
    selectedFiles.value = event.files; // Simpan file yang dipilih
}

const submitted = ref(false);

const formattedDate = computed({
    get: () => activity.value.tanggal,
    set: (value) => {
        const date = new Date(value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        activity.value.tanggal = formattedDate;
    }
});
const availablePrograms = ref([]);

async function fetchPrograms() {
    try {
        const response = await axios.get('/api/program/sector');
        const programsFromAPI = response.data.programs || [];
        availablePrograms.value = programsFromAPI.map((program) => ({
            label: program.name,
            value: program.id
        }));
        console.log('Data dari API:', response.data);
        console.log('Available Programs:', availablePrograms.value);
    } catch (error) {
        console.error('Failed to fetch programs:', error.message);
    }
}

const fetchProgramAnggota = async (programId) => {
    try {
        const response = await axios.get(`/api/program/${programId}`);
        activity.value.anggotaOptions = response.data.program.users.map((user) => ({
            label: user.name,
            value: user.id
        }));
        console.log('Anggota Program:', activity.value.anggotaOptions);
    } catch (error) {
        console.error('Failed to fetch program detail:', error.message);
    }
};

watch(
    () => activity.value.program,
    async (newProgramId) => {
        if (newProgramId) {
            await fetchProgramAnggota(newProgramId);
        } else {
            activity.value.anggotaOptions = [];
        }
    }
);

watch(
    () => activity.value.anggota,
    (newAnggota) => {
        console.log('Anggota yang dipilih:', newAnggota);
    }
);

onMounted(fetchPrograms);

function setDefaultSeconds() {
    if (activity.value.waktu && !activity.value.waktu.includes(':')) {
        activity.value.waktu = `${activity.value.waktu}:00`; // Menambahkan detik jika tidak ada
    } else if (activity.value.waktu && activity.value.waktu.length === 5) {
        activity.value.waktu = `${activity.value.waktu}:00`; // Menambahkan detik default jika hanya ada jam dan menit
    }
}

function handleUpdateVisible(val) {
    emit('update:visible', val);
    if (!val) {
        resetForm();
    }
}

function hideDialog() {
    emit('update:visible', false);
    emit('hide');
    resetForm();
}

function saveActivity() {
    submitted.value = true;
    console.log(activity.value);

    if (activity.value.lokasi === 'luar_kota' || (activity.value.lokasi === 'dalam_kota' && activity.value.tempat.trim())) {
        if (
            activity.value.program.trim() &&
            activity.value.kegiatan.trim() &&
            activity.value.tanggal &&
            (activity.value.lokasi === 'luar_kota' || activity.value.tempat.trim()) &&
            activity.value.anggota.length > 0 &&
            activity.value.deskripsi.trim() &&
            activity.value.waktu.trim() &&
            activity.value.penyelenggara.trim()
        ) {
            sendActivity();
        }
    } else {
        // Menampilkan pesan error jika validasi lokasi gagal
        toast.add({
            severity: 'error',
            summary: 'Validasi Gagal',
            detail: 'Tempat harus diisi jika lokasi dalam kota.',
            life: 3000
        });
    }
}

async function sendActivity() {
    const formData = new FormData();
    // Menambahkan data kegiatan
    formData.append('program_id', activity.value.program);
    formData.append('name', activity.value.kegiatan);
    formData.append('date', activity.value.tanggal);
    formData.append('host', activity.value.penyelenggara);
    formData.append('location_type', activity.value.lokasi);
    formData.append('description', activity.value.deskripsi);
    formData.append('time', `${activity.value.waktu}`);
    if (activity.value.lokasi === 'luar_kota') {
        formData.append('location', 'Luar Kota');
    } else {
        formData.append('location', activity.value.tempat);
    }

    // Menambahkan anggota sebagai array dari ID anggota
    activity.value.anggota.forEach((anggotaId) => {
        formData.append('users[]', anggotaId);
    });

    // Menambahkan file ke FormData
    selectedFiles.value.forEach((file) => {
        formData.append('file', file);
    });

    console.log('FormData:', formData);
    console.log('File yang akan diupload:', selectedFiles);

    try {
        // Mengirim data kegiatan dan file
        const response = await axios.post('/api/task', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response:', response.data);

        if (response.data && response.data.task) {
            const savedTask = response.data.task;

            // Kirim data anggota ke API attachTeam
            await sendTeamMembers(savedTask.id, activity.value.anggota);

            // Emit event dan tutup dialog
            emit('save', savedTask);
            emit('refresh');
            hideDialog();
        } else {
            throw new Error('Kegiatan tidak valid');
        }
    } catch (error) {
        console.error('Error Response:', error.response?.data || error.message);

        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menambahkan kegiatan.',
            life: 3000
        });
    }
}

async function sendTeamMembers(taskId, anggota) {
    try {
        const url = `/api/task/${taskId}/attachTeam`;
        const payload = {
            id: activity.value.anggota // Pastikan anggota adalah array ID pengguna
        };
        console.log('Sending data to server:', payload);

        const response = await axios.post(url, payload);
        console.log('Response:', response.data);

        if (response.data && response.data.message) {
            console.log('Anggota berhasil ditambahkan ke dalam kegiatan.');
        } else {
            throw new Error('Failed to attach team members');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function resetForm() {
    activity.value = {
        program: '',
        kegiatan: '',
        tanggal: '',
        tempat: '',
        anggota: [],
        lokasi: 'dalam_kota'
    };
    submitted.value = false;
}
</script>

<template>
    <Dialog :visible="visible" :style="{ width: '450px' }" header="Tambah Rincian Kegiatan" :modal="true" @update:visible="handleUpdateVisible" @hide="hideDialog">
        <div class="flex flex-col gap-6">
            <div>
                <label for="program" class="block font-bold mb-3">Program Kerja</label>
                <Dropdown id="program" v-model="activity.program" :options="availablePrograms" optionLabel="label" optionValue="value" placeholder="Pilih Program" required="required" :invalid="submitted && !activity.program" fluid="fluid" />
                <small v-if="submitted && !activity.program" class="text-red-500">Program is required.</small>
            </div>

            <div>
                <label for="kegiatan" class="block font-bold mb-3">Rincian Kegiatan</label>
                <InputText id="kegiatan" v-model.trim="activity.kegiatan" required="true" autofocus="autofocus" :invalid="submitted && !activity.kegiatan" fluid="fluid" />
                <small v-if="submitted && !activity.kegiatan" class="text-red-500">Kegiatan is required.</small>
            </div>
            <div>
                <label for="tanggal" class="block font-bold mb-3">Tanggal</label>
                <Calendar id="tanggal" v-model="formattedDate" dateFormat="yyyy-mm-dd" required="true" fluid="fluid" />
            </div>
            <div>
                <label for="waktu" class="block font-bold mb-3">Waktu</label>
                <InputText id="waktu" v-model="activity.waktu" required class="p-inputtext p-component w-full p-mb-3" type="time" placeholder="Pilih Waktu" />
                <small v-if="submitted && !activity.waktu" class="text-red-500">Waktu wajib diisi.</small>
            </div>
            <div>
                <label for="lokasi" class="block font-bold mb-3">Lokasi</label>
                <div class="flex gap-4">
                    <div>
                        <input type="radio" id="dalam_kota" value="dalam_kota" v-model="activity.lokasi" />
                        <label for="dalam_kota" class="ml-2">Dalam Kota</label>
                    </div>
                    <div>
                        <input type="radio" id="luar_kota" value="luar_kota" v-model="activity.lokasi" />
                        <label for="luar_kota" class="ml-2">Luar Kota</label>
                    </div>
                </div>
            </div>
            <div v-if="activity.lokasi === 'dalam_kota'">
                <label for="tempat" class="block font-bold mb-3">Tempat</label>
                <InputText id="tempat" v-model="activity.tempat" required="true" fluid="fluid" />
            </div>
            <div>
                <label for="deskripsi" class="block font-bold mb-3">Deskripsi</label>
                <InputText id="deskripsi" v-model.trim="activity.deskripsi" required="true" fluid="fluid" :invalid="submitted && !activity.deskripsi" />
                <small v-if="submitted && !activity.deskripsi" class="text-red-500">Deskripsi wajib diisi.</small>
            </div>
            <div>
                <label for="penyelenggara" class="block font-bold mb-3">Penyelenggara</label>
                <InputText id="penyelenggara" v-model.trim="activity.penyelenggara" required="true" fluid="fluid" :invalid="submitted && !activity.penyelenggara" />
                <small v-if="submitted && !activity.penyelenggara" class="text-red-500">Penyelenggara wajib diisi.</small>
            </div>
            <div>
                <label for="anggota" class="block font-bold mb-3">Anggota</label>
                <MultiSelect id="anggota" v-model="activity.anggota" :options="activity.anggotaOptions" optionLabel="label" optionValue="value" placeholder="Pilih Anggota" :filter="true" :multiple="true" class="w-full" :maxSelectedLabels="3" />
                <small v-if="submitted && !activity.anggota.length" class="text-red-500">Anggota is required.</small>
                <div v-if="activity.anggota.length" class="mt-2">
                    <h4 class="font-bold mb-2 text-gray-600">Anggota yang dipilih:</h4>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="(anggota, index) in activity.anggota" :key="index" class="bg-gray-200 text-gray-600 px-3 py-2 rounded-md shadow-sm">
                            {{ getAnggotaLabel(anggota) }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="field">
                <label for="dokumen"></label>
                <FileUpload name="dokumen" :auto="false" :multiple="true" accept=".pdf,.doc,.docx" maxFileSize="10000000" chooseLabel="Pilih Dokumen" :customUpload="false" @select="onFileSelect" :showUploadButton="false" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveActivity" />
        </template>
    </Dialog>
</template>
