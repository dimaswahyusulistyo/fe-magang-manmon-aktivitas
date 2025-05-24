<script setup>
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { defineProps, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TambahTimKegiatan from '../kegiatan/TambahTimKegiatan.vue';
import EditKegiatan from './EditKegiatan.vue';
import EditLaporanDialog from './EditLaporan.vue';
import EditTim from './EditTim.vue';
import LaporanDialog from './Laporan.vue';
import TambahLaporanDialog from './TambahLaporan.vue';

const router = useRouter(); // Inisialisasi router
const showEditLaporanDialog = ref(false);
const currentTaskId = ref(null); 
console.log('lokal :', localStorage);
const toast = useToast();
const route = useRoute();
const breadcrumbItems = ref(route.meta.breadcrumb || []);
//kegiatan : detail data task
//activities : detail anggota task
const kegiatan = ref({});
const activities = ref([]);
const taskId = route.query.id; 
const programId = ref(null);
const programs = ref([]);
const availableUsers = ref([]);
const taskUsers = ref([]);
const role = ref(localStorage.getItem('role'));


const laporan = ref({}); // Reactive variable to store report data
const props = defineProps({
    visible: Boolean,
    laporan: Object
});
const fetchReports = async () => {
    try {
        const response = await axios.get(`/api/report/${taskId}`);
        console.log('Data REPORT API:', response.data); // Log the entire response

        // Check if the report exists in the response
        if (response.data && response.data.report) {
            laporan.value = response.data.report; // Ensure this matches your API response structure
            hasReport.value = true; // Set hasReport to true if report data is available
        } else {
            hasReport.value = false; // No report data found
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat laporan', life: 3000 });
    }
};

const openLaporanDialog = (taskId) => {
    console.log('Opening Laporan Dialog for Task ID:', taskId);
    showLaporanDialog.value = true; // Open the dialog
    // You can also set the taskId in a reactive variable if needed
    currentTaskId.value = taskId; // Assuming you have a reactive variable for the current task ID
};

const downloadReport = (taskId) => {
    console.log('Downloading report for Task ID:', taskId);
    if (!taskId) {
        console.error('Error: taskId is not defined.');
        return; // Hentikan eksekusi jika taskId tidak ada
    }
    router.push({ name: 'DownloadLaporan', params: { taskId } }); // Pastikan params diatur dengan benar
};

const fetchTasks = async () => {
    try {
       
        const response = await axios.get(`/api/task/${taskId}`);
        console.log('Data dari API:', response.data);

        kegiatan.value = response.data.task;
        activities.value = response.data.task_users.map((user, index) => {
            const programUser = response.data.program_users.find(
                (programUser) => programUser.id === user.id
            );

            return {
                user_id: user.id,
                anggota: user.name, // Nama user
                role: programUser?.pivot?.role || "Tidak ada role", // Role dari program_users (pivot)
                no: index + 1, // Nomor urut
            };
        });

        programId.value = kegiatan.value.program_id;
        console.log('Program ID:', programId.value);
        console.log('Anggota Program:', activities.value);

       
        await fetchPrograms();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};

const fetchPrograms = async () => {
    try {
       
        const response = await axios.get(`/api/program/${programId.value}`);
        console.log('Data program dari API:', response.data);

       
        programs.value = response.data.program;

      
        availableUsers.value = programs.value.users.filter(user => 
            !activities.value.map(activity => activity.user_id).includes(user.id)
        );

        console.log('User tersedia:', availableUsers.value);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch program data', life: 3000 });
        console.error('Error fetching programs:', error);
    }
};

onMounted(async () => {
    try {
        console.log('Komponen berhasil dimount');
        await fetchTasks();
        if (programId.value) {
            await fetchPrograms(); 
            await fetchReports();
            console.log('Status hasReport:', hasReport.value);
        } else {
            console.error('Program ID tidak ditemukan.');
        }
    } catch (error) {
        console.error('Error saat inisialisasi:', error);
    }
});


const selectedActivities = ref([]);
const selectedKegiatan = ref({});
const selectedTeamMember = ref({});
const showTambahLaporanDialog = ref(false);
const showLaporanDialog=ref(false);

const showEditDialog = ref(false);
const showEditTeamDialog = ref(false); 
const showAddTeamDialog = ref(false);
const hasReport = ref(false);

const editKegiatanFn = (kegiatanData) => {
    selectedKegiatan.value = kegiatanData;
    showEditDialog.value = true;
};

const openTambahLaporanDialog = () => {
    showTambahLaporanDialog.value = true; 
};


const saveLaporan = (laporanData) => {
    console.log('Laporan disimpan:', laporanData);
    showTambahLaporanDialog.value = false;
};

const openEditLaporanDialog = async () => {
    console.log('Opening Edit Laporan Dialog for Task ID:', taskId);
    showEditLaporanDialog.value = true; // Open the edit dialog
    await fetchReports(); // Fetch the report data to populate the form
};

const hideEditLaporanDialog = () => {
    showEditLaporanDialog.value = false; // Close the dialog
};

const hideTambahLaporanDialog = () => {
    showTambahLaporanDialog.value = false; 
};

const saveKegiatan = () => {
    showEditDialog.value = false; 
};

const openAddTeamDialog = () => {
    showAddTeamDialog.value = true; 
};

const editTeamMember = (teamMember) => {
    selectedTeamMember.value = teamMember; 
    showEditTeamDialog.value = true; 
};

const saveTeamMember = () => {
    showEditTeamDialog.value = false;
};

const confirmDeleteKegiatan = () => {
};

const confirmDeleteActivity = async (activity) => {
    try {
        const confirmed = confirm(`Apakah Anda yakin ingin menghapus anggota tim ${activity.anggota}?`);
        if (!confirmed) return;

        const response = await axios.delete(`/api/task/${taskId}/detachTeam`, {
            data: { user_id: activity.id },
        });

        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Anggota berhasil dihapus', life: 3000 });

        activities.value = activities.value.filter((item) => item.id !== activity.id);
    } catch (error) {
        console.error('Error deleting activity:', error);

        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus anggota', life: 3000 });
    }
};


const hideDialog = () => {
    showEditDialog.value = false; 
};

const hideEditTeamDialog = () => {
    showEditTeamDialog.value = false;
};

const hideAddTeamDialog = () => {
    showAddTeamDialog.value = false;
};

</script>

<template>
    <Breadcrumb :model="breadcrumbItems" v-if="breadcrumbItems.length" class="custom-breadcrumb text-white bold" /><br>
    <div class="flex flex-col">
        <div
            class="relative flex flex-col items-center justify-center overflow-hidden"
            :style="{
                background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 400% at 77.36% 40%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%)',
                clipPath: 'ellipse(150% 50% at 50% 30%)',
                height: '40vh',
                borderRadius: '20px'
            }">
            <div
                class="absolute inset-0 bg-cover bg-center opacity-15"
                :style="{
                    backgroundImage: 'url(/karanganyar-9.jpg)',
                    filter: 'blur(5px)'
                }"/>

            <div class="relative z-10 text-center p-4">
                <h2 class="font-semibold text-3xl mb-4">{{ kegiatan.name }}</h2>
                <div class="flex justify-center space-x-4 mb-4">
                    <Button
                        v-if="role === 'supervisor'"
                        class="p-button-rounded !text-sm !px-4 !py-2"
                        label="Hapus Kegiatan"
                        icon="pi pi-trash"
                        severity="danger"
                        @click="confirmDeleteKegiatan" />
                </div>
            </div>
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card">
                <Toolbar class="mb-6">
                    <template #start>
                        <div class="font-semibold text-xl">KELOLA PELAPORAN TIM</div>
                    </template>
                    <template #end>
                        <!-- Tombol untuk Admin atau Supervisor -->
                        <Button
                            v-if="role === 'supervisor'"
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Tambah Tim"
                            icon="pi pi-user-plus"
                            severity="warning"
                            @click="openAddTeamDialog" />

                        <Button
                            v-if="hasReport"
                            icon="pi pi-download"
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Unduh Laporan"
                            severity="success"
                            @click="() => downloadReport(kegiatan.id)" 
                             />
                    </template>
                </Toolbar>
                <Toolbar class="mb-6">
                    <template #start>
                        <div class="font-semibold text-lg text-gray-800">AKSI LAPORAN</div>
                    </template>
                    <template #end>
                        <Button
                            icon="pi pi-eye"
                            outlined
                            rounded
                            class="mr-4"
                            severity="info"
                            @click="openLaporanDialog(kegiatan.id)"
                            :style="{color: 'blue', borderColor: 'blue'}" />
                            <Button
                                v-if="role === 'user' && hasReport"
                                class="p-button-rounded !text-sm !px-4 !py-2"
                                label="Edit Laporan"
                                icon="pi pi-pencil"
                                severity="warn"
                                @click="openEditLaporanDialog" />
                            <Button
                                v-else-if="role === 'user'"
                                class="p-button-rounded !text-sm !px-4 !py-2"
                                label="Tambah Laporan"
                                icon="pi pi-plus"
                                severity="warning"
                                @click="openTambahLaporanDialog" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    v-model:selection="selectedActivities"
                    :value="activities"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kegiatan">
                    <Column field="no" header="NO" sortable></Column>
                    <Column field="anggota" header="NAMA" sortable></Column>
                    <Column field="role" header="ROLE" sortable></Column>
                    <Column v-if="role === 'supervisor'" header="AKSI">
                        <template #body="slotProps">
                            <Button
                                v-if="role === 'supervisor'"
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                @click="confirmDeleteActivity(slotProps.data)"
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        
        <div class="md:w-1/2 mt-6 md:mt-0">
            <div class="card">
                <Toolbar class="mb-6">
                    <template #start>
                        <div class="font-semibold text-xl">Detail Kegiatan</div>
                    </template>
                    <template #end>
                        <Button
                            v-if="role === 'supervisor'"
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Edit Kegiatan"
                            icon="pi pi-pencil"
                            severity="warning"
                            @click="editKegiatanFn(kegiatan)" />
                    </template>
                </Toolbar>

                <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                    <li class="flex items-center py-2 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-tag !text-xl text-purple-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Nama Kegiatan: </strong>
                            <span class="text-primary font-bold">{{ kegiatan.name }}</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-calendar !text-xl text-blue-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Tanggal Kegiatan: </strong>
                            <span class="text-primary font-bold">{{ kegiatan.date }}</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-clock !text-xl text-green-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Waktu: </strong>
                            <span class="text-primary font-bold">{{ kegiatan.time }}</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-map-marker !text-xl text-orange-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Lokasi: </strong>
                            <span class="text-primary font-bold">{{ kegiatan.location }}</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2">
                        <div class="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-building !text-xl text-red-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Penyelenggara: </strong>
                            <span class="text-primary font-bold">{{ kegiatan.host }}</span>
                        </span>
                    </li>
                </ul>

                <Fieldset legend="Deskripsi" :toggleable="true">
                    <p class="leading-normal m-0">
                        {{ kegiatan.description }}
                    </p>
                </Fieldset>
            </div>
        </div>
    </div>

    <EditKegiatan
        :visible="showEditDialog"
        :employee="selectedKegiatan"
        :submitted="submitted"
        @save="saveKegiatan"
        @hide="hideDialog"
        @update:visible="showEditDialog = $event"
    />

    <TambahTimKegiatan
        v-model:visible="showAddTeamDialog"
        :users="availableUsers"
        :programId="selectedProgramId"
        :taskId="taskId"
        @save="saveTeamMember"
        @hide="hideAddTeamDialog"
    />


    <EditTim
        :visible="showEditTeamDialog"
        :member="selectedTeamMember"
        :submitted="submitted"
        @save="saveTeamMember"
        @hide="hideEditTeamDialog"
        @update:visible="showEditTeamDialog = $event"
    />

    <TambahLaporanDialog
        v-model:visible="showTambahLaporanDialog"
        :taskId="taskId"
        @save="saveLaporan"
        @hide="hideTambahLaporanDialog"
    />

    <LaporanDialog
        v-model:visible="showLaporanDialog"
        :laporan="laporan"
        :taskId="taskId"
        @update:visible="isDialogVisible = $event"
    />

    <EditLaporanDialog
        v-model:visible="showEditLaporanDialog"
        :taskId="taskId"
        @save="saveLaporan"
        @hide="hideEditLaporanDialog"
    />

    <div class="card mt-8">
        <Toolbar class="mb-6">
            <template #start>
                <div class="font-semibold text-xl">Dokumen Kegiatan</div>
            </template>
        </Toolbar>
        <div class="pdf-container center">
            <div class="pdf-wrapper">
                <iframe
                    :src="kegiatan.file"
                    style="border: none; width: 100%; height: 100%; max-width: 800px; max-height: 600px;">
                </iframe>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pdf-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.pdf-wrapper {
    width: 100%;
    height: 500px;
}

.button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.custom-breadcrumb {
    background-color: #0E2949;
    border-radius: 20px; 
}

.custom-breadcrumb .p-breadcrumb ul {
    background-color: #0E2949; 
}

.custom-breadcrumb .p-breadcrumb li a {
    color: white !important; 
}

.custom-breadcrumb .p-breadcrumb li .p-breadcrumb-chevron {
    color: #ffffff !important; 
}

</style>
