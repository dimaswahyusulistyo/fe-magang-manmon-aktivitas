<script setup="setup">
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import EditKegiatan from './EditKegiatan.vue';
import TambahKegiatan from './TambahKegiatan.vue';

const toast = useToast();
const dt = ref();
const activities = ref([]);

const fetchTasks = async () => {
    try {
        const userRole = localStorage.getItem('role');
        let apiUrl = '/api/task';

        if (userRole === 'admin') {
            apiUrl = '/api/task';
        } else if (userRole === 'user') {
            apiUrl = '/api/user/task';
        } else if (userRole === 'supervisor') {
            apiUrl = '/api/task/sector';
        }
        const response = await axios.get(apiUrl);
        activities.value = response.data.tasks.map((task, index) => ({
            ...task,
            no: index + 1
        }));
        console.log('TASK HASIL :', activities.value);
    } catch (error) {
        // Jika terjadi error saat fetching data
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks', life: 3000 });
        console.error('Error fetching tasks:', error);
    }
};

onMounted(() => {
    fetchTasks();
});

const emit = defineEmits(['update:visible', 'save', 'refresh']);
const nextId = ref(activities.value.length + 1);
const tambahKegiatanDialog = ref(false);
const editKegiatanDialog = ref(false);
const deleteKegiatanDialog = ref(false);
const kegiatan = ref({});
const selectedKegiatan = ref();
const role = ref(localStorage.getItem('role'));
const filters = ref({
    global: {
        value: null,
        matchMode: 'contains'
    }
});
const submitted = ref(false);

function openNew() {
    kegiatan.value = {};
    submitted.value = false;
    tambahKegiatanDialog.value = true;
}

function hideDialog() {
    tambahKegiatanDialog.value = false;
    editKegiatanDialog.value = false;
    deleteKegiatanDialog.value = false;
    submitted.value = false;
}

function saveKegiatan(savedTask) {
    submitted.value = true;
    console.log(savedTask.value);

    if (savedTask.name.trim()) {
        if (savedTask.id) {
            const index = activities.value.findIndex((p) => p.id === savedTask.id);
            if (index !== -1) {
                activities.value[index] = { ...activities.value[index], ...savedTask };
            }

            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Kegiatan Diperbarui',
                life: 3000
            });
        } else {
            savedTask.id = nextId.value++;
            activities.value.push(savedTask);

            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Kegiatan Ditambahkan',
                life: 3000
            });
        }

        tambahKegiatanDialog.value = false;
        editKegiatanDialog.value = false;
        kegiatan.value = {};
    }
}

function editKegiatanFn(act) {
    selectedKegiatan.value = act;
    kegiatan.value = {
        ...act
    };
    editKegiatanDialog.value = true;
}

function confirmDeleteKegiatan(prod) {
    console.log(activities.value);
    kegiatan.value = prod;
    deleteKegiatanDialog.value = true;
}

function deleteKegiatan() {
    axios
        .delete(`http://127.0.0.1:8000/api/task/${kegiatan.value.id}`) // Kirim ID program
        .then(() => {
            activities.value = activities.value.filter((val) => val.id !== kegiatan.value.id);
            deleteKegiatanDialog.value = false;
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Kegiatan Dihapus',
                life: 3000
            });
        })
        .catch((error) => {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: 'Gagal menghapus kegiatan. Silakan coba lagi.',
                life: 3000
            });
        });
}

function exportKegiatan() {
    const csvContent = [['NO', 'KEGIATAN', 'TANGGAL', 'TEMPAT', 'ANGGOTA', 'PROGRESS'], ...activities.value.map((act) => [act.id, act.name, act.date, act.location, act.users.map((user) => user.name).join(', '), act.progress])]
        .map((e) => e.join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kegiatans.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <h4 class="m-0">
                    <b>RINCIAN KEGIATAN</b>
                </h4>
            </template>
            <template #end>
                <div class="flex items-center gap-4">
                    <span class="p-input-icon-left">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </span>
                    <Button v-if="role === 'supervisor'" class="p-button-rounded !text-sm !px-4 !py-2" label="Tambah Kegiatan" icon="pi pi-plus" severity="warning" @click="openNew" />
                    <Button class="p-button-rounded !text-sm !px-4 !py-2" label="Export" icon="pi pi-upload" severity="warning" @click="exportKegiatan" :style="{ backgroundColor: 'gold', borderColor: 'gold', color: 'white' }" />
                </div>
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            v-model:selection="selectedKegiatan"
            :value="activities"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kegiatan"
        >
            <Column field="no" header="NO"></Column>
            <Column field="name" header="RINCIAN KEGIATAN" sortable="sortable"></Column>
            <Column field="date" header="TANGGAL" sortable="sortable"></Column>
            <Column field="location" header="TEMPAT" sortable="sortable"></Column>
            <Column v-if="role === 'admin'|| role === 'supervisor'" header="ANGGOTA ">
                <template #body="slotProps">
                    <!-- Menampilkan semua nama tasks yang terkait sebagai daftar -->
                    {{ slotProps.data.users.map((user) => user.name).join(', ') }}
                </template>
            </Column>
            <!-- <Column v-if="role === 'admin'|| role === 'supervisor'" field="progress" header="PROGRESS" sortable="sortable"></Column> -->
            <Column header="AKSI">
                <template #body="slotProps">
                    <Button v-if="role === 'supervisor'" icon="pi pi-pencil" outlined="outlined" rounded="rounded" class="mr-2" severity="warn" :style="{ borderColor: 'gold', color: 'gold' }" @click="editKegiatanFn(slotProps.data)" />

                    <router-link :to="{ path: '/DetailKegiatan', query: { id: slotProps.data.id } }">
                        <Button icon="pi pi-eye" outlined="outlined" rounded="rounded" class="mr-2 blue-btn p-tag-info" severity="info" :style="{ color: 'blue', borderColor: 'blue' }" />
                    </router-link>
                    <Button v-if="role === 'supervisor'" icon="pi pi-trash" outlined="outlined" rounded="rounded" severity="danger" @click="confirmDeleteKegiatan(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>

    <TambahKegiatan :visible="tambahKegiatanDialog" @update:visible="tambahKegiatanDialog = $event" @save="saveKegiatan" @hide="tambahKegiatanDialog = false" @refresh="fetchTasks" />

    <EditKegiatan
        :visible="editKegiatanDialog"
        @update:visible="editKegiatanDialog = $event"
        :kegiatan="kegiatan"
        :activityId="selectedKegiatan ? selectedKegiatan.id : null"
        :submitted="submitted"
        @hide="hideDialog"
        @save="saveKegiatan"
        @refresh="fetchTasks"
    />

    <Dialog :visible="deleteKegiatanDialog" :style="{ width: '450px' }" header="Confirm" :modal="true" @hide="deleteKegiatanDialog = false">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="kegiatan"
                >Are you sure you want to delete <b>{{ kegiatan.kegiatan }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text="text" @click="deleteKegiatanDialog = false" />
            <Button label="Yes" icon="pi pi-check" @click="deleteKegiatan" />
        </template>
    </Dialog>

    <Dialog :visible="deleteActivitiesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true" @hide="deleteActivitiesDialog = false">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="selectedKegiatan && selectedKegiatan.length"> Are you sure you want to delete the selected activities? </span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text="text" @click="deleteActivitiesDialog = false" />
            <Button label="Yes" icon="pi pi-check" text="text" @click="deleteSelectedActivities" />
        </template>
    </Dialog>
</template>

<style>
.card {
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: var(--surface-card);
}
</style>
