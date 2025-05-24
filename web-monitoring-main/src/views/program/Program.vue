<script setup>
import axios from 'axios';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const programs = ref([]);
const progress = ref([]);

const currentPage = ref(1);
const rowsPerPage = ref(10);

const nextId = ref(programs.value.length + 1);
const tambahProgramDialog = ref(false);
const editProgramDialog = ref(false);
const deleteProgramDialog = ref(false);
const deleteProgramsDialog = ref(false);
const program = ref({});
const selectedPrograms = ref();
const emit = defineEmits(['update:visible', 'save', 'refresh']);

let TambahProgram, EditProgram;

const role = ref(localStorage.getItem('role'));

if (role.value === 'admin'||role.value === 'supervisor') {
    // Hanya impor TambahProgram dan EditProgram untuk admin
    TambahProgram = defineAsyncComponent(() => import('./TambahProgram.vue'));
    EditProgram = defineAsyncComponent(() => import('./EditProgram.vue'));
}

const fetchPrograms = async () => {
    try {
        const userRole = localStorage.getItem('role');
        let apiUrl = '/api/program'; // Default API endpoint

        if (userRole === 'admin') {
            apiUrl = '/api/program'; // API untuk admin
        } else if (userRole === 'user') {
            apiUrl = '/api/user/program'; // API untuk user dan supervisor
        } else if (userRole === 'supervisor') {
            apiUrl = '/api/program/sector'; // API untuk user dan supervisor
        }

        const response = await axios.get(apiUrl);
        programs.value = response.data.programs.map((program, index) => ({
            ...program,
            no: index + 1,
            completed_tasks: 0,
            total_tasks: 0
        }));
        console.log('programs:', programs.value);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch programs', life: 3000 });
        console.error('Error fetching programs:', error);
    }
};

const fetchProgress = async () => {
    if (role.value !== 'admin') return; // Hanya fetch progress jika admin
    try {
        const response = await axios.get('/api/programProgress');
        const progressData = response.data.programs;

        programs.value = programs.value.map((program) => {
            const progress = progressData.find((p) => p.id === program.id) || {};
            return {
                ...program,
                completed_tasks: progress.completed_tasks || 0,
                total_tasks: progress.total_tasks || 0
            };
        });

        console.log('updated programs with progress:', programs.value);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch progress', life: 3000 });
        console.error('Error fetching progress:', error);
    }
};

onMounted(async () => {
    await fetchPrograms();
    await fetchProgress();
});

const filters = ref({
    global: {
        value: null,
        matchMode: 'contains'
    }
});
const submitted = ref(false);

function openNew() {
    program.value = {};
    submitted.value = false;
    tambahProgramDialog.value = true;
}

function hideDialog() {
    tambahProgramDialog.value = false;
    editProgramDialog.value = false;
    submitted.value = false;
}

function calculateProgress(completed, total) {
    if (!total || total === 0) return 0; // Hindari pembagian dengan nol
    return Math.round((completed / total) * 100); // Hitung progres dalam persen
}

function saveProgram(savedProgram) {
    submitted.value = true;
    console.log(savedProgram.value);

    if (savedProgram.name.trim()) {
        if (savedProgram.id) {
            const index = programs.value.findIndex((p) => p.id === savedProgram.id);
            if (index !== -1) {
                programs.value[index] = { ...programs.value[index], ...savedProgram };
            }

            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Program Diperbarui',
                life: 3000
            });
        } else {
            savedProgram.id = nextId.value++;
            programs.value.push(savedProgram);

            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Program Ditambahkan',
                life: 3000
            });
        }

        tambahProgramDialog.value = false;
        editProgramDialog.value = false;
        program.value = {};
    }
}

function editProgram(prod) {
    program.value = {
        ...prod
    };
    editProgramDialog.value = true;
}

function confirmDeleteProgram(prod) {
    program.value = prod;
    deleteProgramDialog.value = true;
}

function deleteProgram() {
    axios
        .delete(`http://127.0.0.1:8000/api/program/${program.value.id}`) // Kirim ID program
        .then(() => {
            // Hapus program dari daftar
            programs.value = programs.value.filter((val) => val.id !== program.value.id);
            deleteProgramDialog.value = false; // Tutup dialog
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Program Dihapus',
                life: 3000
            });
        })
        .catch((error) => {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: 'Gagal menghapus program. Silakan coba lagi.',
                life: 3000
            });
        });
}

function deleteSelectedPrograms() {
    programs.value = programs.value.filter((val) => !selectedPrograms.value.includes(val));
    deleteProgramsDialog.value = false;
    selectedPrograms.value = null;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Programs Deleted', life: 3000 });
}

const formattedStartDate = computed({
    get: () => program.value.startDate,
    set: (value) => {
        const date = new Date(value);
        program.value.startDate = date.toISOString().split('T')[0];
    }
});

const formattedEndDate = computed({
    get: () => program.value.endDate,
    set: (value) => {
        const date = new Date(value);
        program.value.endDate = date.toISOString().split('T')[0];
    }
});

function exportPrograms() {
    const csvContent = [
        ['NO', 'PROGRAM', 'TANGGAL MULAI', 'TANGGAL BERAKHIR', 'KEGIATAN', 'PROGRESS'],
        ...programs.value.map((p) => [p.no, p.name, p.start_date, p.end_date, p.tasks.map((task) => task.name).join(', '), `${calculateProgress(p.completed_tasks, p.total_tasks)}%`])
    ]
        .map((e) => e.join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'programs.csv');
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
                    <b>PROGRAM KERJA</b>
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
                    <Button v-if="role === 'supervisor'" class="p-button-rounded !text-sm !px-4 !py-2" label="Tambah Program" icon="pi pi-plus" severity="warning" @click="openNew" />
                    <Button class="p-button-rounded !text-sm !px-4 !py-2" label="Export" icon="pi pi-upload" severity="warning" @click="exportPrograms" :style="{ backgroundColor: 'gold', borderColor: 'gold', color: 'white' }" />
                </div>
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            v-model:selection="selectedPrograms"
            :value="programs"
            dataKey="id"
            :paginator="true"
            :rows="rowsPerPage"
            :filters="filters"
            v-model:currentPage="currentPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} programs"
        >
            <Column field="no" header="NO"></Column>
            <Column field="name" header="PROGRAM KERJA" sortable="sortable"></Column>
            <Column field="start_date" header="TANGGAL MULAI" sortable="sortable"></Column>
            <Column field="end_date" header="TANGGAL BERAKHIR" sortable="sortable"></Column>
            <Column v-if="role === 'admin'" header="KEGIATAN">
                <template #body="slotProps">
                    {{ slotProps.data.tasks.map((task) => task.name).join(', ') }}
                </template>
            </Column>
            <Column v-if="role === 'admin'" header="PROGRESS">
                <template #body="slotProps">
                    <div class="progress-container" style="position: relative; width: 100%; height: 30px">
                        <ProgressBar :value="calculateProgress(slotProps.data.completed_tasks, slotProps.data.total_tasks)" :showValue="false" class="custom-progress-bar" style="width: 100%; height: 100%" />
                        <div class="progress-text-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: black">
                            <b>{{ slotProps.data.completed_tasks }}</b> / <b>{{ slotProps.data.total_tasks }}</b>
                        </div>
                    </div>
                </template>
            </Column>

            <Column header="AKSI">
                <template #body="slotProps" console.log(slotProps.data)>
                    <Button v-if="role === 'supervisor'" icon="pi pi-pencil" outlined="outlined" rounded="rounded" class="mr-2" severity="warn" :style="{ borderColor: 'gold', color: 'gold' }" @click="editProgram(slotProps.data)" />
                    <router-link :to="{ path: '/DetailProgram', query: { id: slotProps.data.id } }">
                        <Button icon="pi pi-eye" outlined="outlined" rounded="rounded" class="mr-2 blue-btn p-tag-info" severity="info" :style="{ color: 'blue', borderColor: 'blue' }" />
                    </router-link>
                    <Button v-if="role === 'supervisor'" icon="pi pi-trash" outlined="outlined" rounded="rounded" severity="danger" @click="confirmDeleteProgram(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>

    <TambahProgram :visible="tambahProgramDialog" @update:visible="tambahProgramDialog = $event" @hide="hideDialog" @save="saveProgram" @refresh="fetchPrograms" />

    <EditProgram :visible="editProgramDialog" :program="program" @update:visible="editProgramDialog = $event" @hide="hideDialog" @save="saveProgram" @refresh="fetchPrograms" />

    <Dialog v-model:visible="deleteProgramDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span
                >Are you sure you want to delete <b>{{ program.program }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text="text" @click="deleteProgramDialog = false" />
            <Button label="Yes" icon="pi pi-check" text="text" @click="deleteProgram" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProgramsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span>Are you sure you want to delete the selected programs?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text="text" @click="deleteProgramsDialog = false" />
            <Button label="Yes" icon="pi pi-check" text="text" @click="deleteSelectedPrograms" />
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
