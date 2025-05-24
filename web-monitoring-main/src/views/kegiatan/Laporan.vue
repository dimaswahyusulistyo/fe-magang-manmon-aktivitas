<script setup>
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { onMounted, ref, watch } from 'vue';

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
const role = ref(localStorage.getItem('role'));
const emit = defineEmits(['update:visible']);
const comment = ref('');
const baseURL = 'http://127.0.0.1:8000/';
// Initialize state
const laporan = ref(null);
const user = ref(null);
const taskData = ref(null);
const errorMessage = ref('');
const isDialogVisible = ref(false); // Initialize with false
const currentStatus = ref('Diterima');
const selectedStatus = ref(null);
const isEditStatusDialogVisible = ref(false);
const modifiedByName = ref('');
const activities = ref([]);
const files = ref([]);
const photoUrl = ref('');
const selectedFile = ref('');
const reportId = ref('');
const photos = ref([]);

// Map data
const zoom = ref(13);
const latitude = ref(null);
const longitude = ref(null);

// Status options
const statusOptions = [
    { label: 'Dikembalikan', value: 'Dikembalikan' },
    { label: 'Diterima', value: 'Diterima' }
];

const fetchTaskData = async () => {
    try {
        const response = await axios.get(`/api/task/${props.taskId}`);
        console.log('Task data received:', response.data);

        if (response.data && response.data.task) {
            taskData.value = response.data.task;

            // Ambil data anggota tim
            activities.value = response.data.task_users.map((user, index) => {
                const programUser = response.data.program_users.find((programUser) => programUser.id === user.id);

                return {
                    user_id: user.id,
                    anggota: user.name, // Nama user
                    role: programUser?.pivot?.role || 'Tidak ada role', // Role dari program_users (pivot)
                    no: index + 1 // Nomor urut
                };
            });

            console.log('Anggota Program:', activities.value);
        }
    } catch (error) {
        console.error('Error fetching task:', error);
    }
};

// Methods
const fetchReport = async () => {
    try {
        const response = await axios.get(`/api/report/${props.taskId}`);
        console.log('Report data received:', response.data);

        if (response.data && response.data.report) {
            laporan.value = response.data.report;
            latitude.value = laporan.value.latitude;
            longitude.value = laporan.value.longitude;
            photoUrl.value = laporan.value.photo;
            user.value = response.data.user;
            comment.value = laporan.value.id;
            reportId.value = laporan.value.id;

            // Cek apakah response.data.files ada sebelum melakukan map
            if (Array.isArray(response.data.files)) {
                files.value = response.data.files.map((file) => ({
                    id: file.id,
                    name: file.name,
                    created_at: file.created_at
                }));
            } else {
                files.value = []; // Beri default array kosong jika tidak ada files
            }

            errorMessage.value = '';
            console.log('NAMA FILE PERTAMA:', files.value[0]?.name);
            console.log('URL :', baseURL);

            if (response.data.user) {
                modifiedByName.value = response.data.user.name;
            } else {
                modifiedByName.value = 'N/A';
            }

            selectedFile.value = files.value[0]?.path;
        } else {
            errorMessage.value = 'Tidak ada data laporan ditemukan';
        }
    } catch (error) {
        console.error('Error fetching report:', error);

        // Cek apakah error adalah 500 dan mengandung pesan terkait "files"
        if (error.response && error.response.status === 500 && error.response.data?.message?.includes('files')) {
            errorMessage.value = 'Laporan belum tersedia';
        } else {
            errorMessage.value = 'Gagal memuat laporan';
        }
    }
};

const fetchUserData = async (userId) => {
    try {
        const response = await axios.get(`/api/users/${userId}`); // Ganti dengan endpoint yang sesuai
        if (response.data && response.data.user) {
            modifiedByName.value = response.data.user.name; // Ambil nama pengguna
        } else {
            modifiedByName.value = 'N/A'; // Jika tidak ada pengguna ditemukan
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        modifiedByName.value = 'N/A'; // Jika terjadi kesalahan
    }
};

const openEditStatusDialog = () => {
    isEditStatusDialogVisible.value = true;
    selectedStatus.value = statusOptions.find((option) => option.label === currentStatus.value);
};

const saveStatus = async () => {
    try {
        if (!selectedStatus.value) {
            return;
        }

        // Pastikan reportId.value adalah nilai yang valid
        if (!reportId.value) {
            console.error('Report ID tidak valid');
            return;
        }

        const payload = {
            status: selectedStatus.value.label,
            comment: comment.value
        };

        // Gunakan reportId.value langsung (bukan reportId)
        const response = await axios.post(`/api/report/${reportId.value}/status`, payload);

        if (response.data) {
            currentStatus.value = selectedStatus.value.label;
            isEditStatusDialogVisible.value = false;

            // Refresh data laporan setelah update
            await fetchReport();
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
};

const hideDialog = () => {
    emit('update:visible', false);
};

// Watch for changes in props.visible
watch(
    () => props.visible,
    (newValue) => {
        isDialogVisible.value = newValue;
        if (newValue && props.taskId) {
            fetchReport();
            fetchTaskData();
        }
    },
    { immediate: true }
); // Add immediate: true to run on mount

// Watch for changes in isDialogVisible
watch(
    () => isDialogVisible.value,
    (newValue) => {
        if (newValue !== props.visible) {
            emit('update:visible', newValue);
        }
    }
);

// Mounted hook
onMounted(() => {
    isDialogVisible.value = props.visible;
    if (props.visible && props.taskId) {
        fetchReport();
        fetchTaskData();
    }
});
</script>

<template>
    <Dialog :visible="isDialogVisible" :modal="true" :style="{ width: '80vw' }" header="Laporan Kegiatan" @update:visible="$emit('update:visible', $event)" @hide="hideDialog">
        <div v-if="errorMessage" class="p-4 mb-4 bg-red-100 text-red-700 rounded">
            {{ errorMessage }}
        </div>
        <div class="grid grid-cols-2 gap-8">
            <div>
                <div class="card mb-6">
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="font-semibold">Status</div>
                        </template>
                        <template #end>
                            <Tag class="mr-2" :class="tagClass" :value="laporan?.status || currentStatus" :rounded="true"></Tag>
                            <Button v-if="role === 'admin'" class="mr-2 p-button-rounded !text-sm !px-2 !py-1" label="Edit Status" icon="pi pi-pencil" severity="warning" @click="openEditStatusDialog" />
                        </template>
                    </Toolbar>
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="font-semibold">Note:</div>
                        </template>
                        <template #end>
                            <span class="text-primary font-bold"> {{ laporan?.comment || 'N/A' }} </span>
                        </template>
                    </Toolbar>
                    <Dialog header="Edit Status" v-model:visible="isEditStatusDialogVisible" modal="modal">
                        <Dropdown v-model="selectedStatus" :options="statusOptions" option-label="label" placeholder="Pilih Status" />
                        <div class="mt-4">
                            <InputText v-model="comment" rows="4" placeholder="Komentar (opsional)" class="w-full" />
                        </div>
                        <div class="flex justify-end mt-4">
                            <Button label="Simpan" icon="pi pi-check" @click="saveStatus" />
                        </div>
                    </Dialog>

                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-info-circle !text-xl text-yellow-500"></i>
                            </div>

                            <div class="font-semibold text-xl">Pelaporan Oleh:</div>
                        </template>
                        <template #end>
                            <Chip :label="user" class="mr-2"></Chip>
                        </template>
                    </Toolbar>
                    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                        <li class="flex items-center py-2 border-b border-surface">
                            <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-gray-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-users !text-xl text-green-500"></i>
                            </div>
                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Anggota:</strong>
                                <span class="text-primary font-bold">
                                    <ul>
                                        <li v-for="activity in activities" :key="activity.user_id">{{ activity.no }}. {{ activity.anggota }} - {{ activity.role }}</li>
                                    </ul>
                                </span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-tag !text-xl text-green-500"></i>
                            </div>

                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Nama Kegiatan:</strong>
                                <span class="text-primary font-bold"> {{ taskData?.name || 'N/A' }} </span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-calendar !text-xl text-purple-500"></i>
                            </div>
                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Tanggal Pelaporan:</strong>
                                <span class="text-primary font-bold">{{ laporan?.date || 'N/A' }}</span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div class="flex items-center">
                                <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                                    <i class="pi pi-info-circle !text-xl text-orange-500"></i>
                                </div>
                                <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                    <strong>Keterangan:</strong>
                                    <span class="text-primary font-bold">{{ laporan?.description || 'Keterangan tidak tersedia.' }}</span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div>
                <div class="card mb-6">
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-map !text-xl text-green-500"></i>
                            </div>

                            <div class="font-semibold text-xl">Lokasi Kegiatan</div>
                        </template>
                    </Toolbar>
                    <div class="map">
                        <LMap :zoom="zoom" :center="[latitude, longitude]" style="height: 260px">
                            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors" />
                            <LMarker :lat-lng="[latitude, longitude]" />
                        </LMap>
                    </div>
                </div>
            </div>

            <div class="col-span-2">
                <div class="card mb-6">
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-file !text-xl text-blue-500"></i>
                            </div>

                            <div class="font-semibold text-xl">Laporan Dokumen</div>
                        </template>
                    </Toolbar>
                    <div class="pdf-container center">
                        <div class="pdf-wrapper">
                            <div>
                                <div v-if="files.length">
                                    <div v-for="file in files" :key="file.id" class="mb-4">
                                        <iframe :src="baseURL + 'storage/' + file.name" width="100%" height="500px" frameborder="0" class="border rounded shadow"> </iframe>
                                    </div>
                                </div>
                                <div v-else>
                                    <p>Tidak ada dokumen tersedia.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Foto -->
            <div class="col-span-2">
                <div class="card mb-6">
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-image !text-xl text-red-500"></i>
                            </div>

                            <div class="font-semibold text-xl">Foto</div>
                        </template>
                    </Toolbar>
                    <div class="flex justify-center">
                        <img :src="baseURL + `storage/${photoUrl}`" alt="Photo" class="w-32 h-32 object-cover" />
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style>
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

.card {
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: var(--surface-card);
}
</style>
