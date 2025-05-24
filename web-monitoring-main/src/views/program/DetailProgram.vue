<script setup="setup">
    import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import EditKegiatan from '../kegiatan/EditKegiatan.vue';
import EditTim from '../kegiatan/EditTim.vue';
import TambahKegiatan from '../kegiatan/TambahKegiatan.vue';
import EditProgram from './EditProgram.vue';
import TambahTim from './TambahTim.vue';

    const route = useRoute();
    const breadcrumbItems = ref(route.meta.breadcrumb || []);

    const toast = useToast();
    const programId = route.query.id;
    const users = ref ([]);

    const programs = ref(null); 
    const sectorId = ref(null);

    const allUsers = ref([]); 
    const programUsers = ref([]); 

    const role = ref(localStorage.getItem('role'));

    const filterUsers = () => {
    
    users.value = allUsers.value.filter(user => !programUsers.value.includes(user.id));
    console.log('user eligibel : ', users);
};


const fetchPrograms = async () => {
    try {
        // Request ke API Laravel
        const response = await axios.get(`/api/program/${programId}`);
        console.log('Data dari API:', response.data);

        // Simpan data objek `program` dari API ke dalam `programs`
        programs.value = response.data.program;

        sectorId.value = programs.value.sector_id;

        // Simpan ID pengguna yang sudah tergabung dalam program
        programUsers.value = programs.value.users.map(user => user.id);

        // Ambil data tasks dari program dan simpan ke activities
        activities.value = programs.value.tasks.map((task, index) => ({
            id: task.id,
            kegiatan: task.name,
            tanggal: task.date,
            tempat: task.location,
            anggota: task.users.map(user => user.name).join(', '),
            progress: 'N/A',
            deskripsi: task.description, 
            no: index + 1, 
        }));

        await fetchUsers();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch program data', life: 3000 });
        console.error('Error fetching programs:', error);
    }
};



const fetchUsers = async () => {
    if (!sectorId.value) {
        console.error('Sector ID tidak ditemukan');
        return;
    }

    try {
        const response = await axios.get(`/api/getUsersBySector/${sectorId.value}`);
        console.log('Semua data user dari API:', response.data);

        // Filter pengguna yang belum bergabung dalam program
        users.value = response.data.users.filter(user => !programUsers.value.includes(user.id));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user data', life: 3000 });
        console.error('Error fetching users:', error);
    }
};

onMounted(() => {
    fetchPrograms();
    fetchUsers();
});




    // const nextId = ref(programs.value.length + 1);

    const showAddTeamDialog = ref(false);
    const showEditTeamDialog = ref(false);
    const tambahKegiatanDialog = ref(false);
    const editProgramDialog = ref(false);
    const selectedKegiatan = ref({});
    const showEditDialog = ref(false);

    const teams = ref([
        {}
    ]);

    const activities = ref([
        {}
    ]);

    

    const editKegiatanFn = (kegiatanData) => {
        selectedKegiatan.value = kegiatanData;
        showEditDialog.value = true;
    };

    const nextTeamId = ref(teams.value.length + 1);
    const nextKegiatanId = ref(activities.value.length + 1);

    const selectedTeamMember = ref({});
    const program = ref({});
    const kegiatan = ref({});

    const submitted = ref(false);
    const selectedActivities = ref([]);
    const selectedTeams = ref([]);
    const filters = ref({});

    const items = ref([
        {
            label: 'Save',
            icon: 'pi pi-check'
        }, {
            label: 'Update',
            icon: 'pi pi-upload'
        }, {
            label: 'Delete',
            icon: 'pi pi-trash'
        }, {
            label: 'Home Page',
            icon: 'pi pi-home'
        }, {
            label: 'Edit',
            icon: 'pi pi-pencil'
        }
    ]);

    const cardMenu = ref([
        {
            label: 'Save',
            icon: 'pi pi-fw pi-check'
        }, {
            label: 'Update',
            icon: 'pi pi-fw pi-refresh'
        }, {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash'
        }
    ]);

    const menuRef = ref(null);

    const openAddTeamDialog = () => {
        console.log('Data users sebelum membuka dialog:', users.value);
        console.log('Data id program sebelum membuka dialog:', programId);
        showAddTeamDialog.value = true;
    };

    const hideAddTeamDialog = () => {
        showAddTeamDialog.value = false;
    };

    const editTeamMember = (teamMember) => {
        selectedTeamMember.value = teamMember;
        showEditTeamDialog.value = true;
    };

    const hideEditTeamDialog = () => {
        showEditTeamDialog.value = false;
    };


    
    function toggle(event) {
        menuRef
            .value
            .toggle(event);
    }

    function openNew() {
        kegiatan.value = {};
        submitted.value = false;
        tambahKegiatanDialog.value = true;
    }

    function hideDialog() {
        tambahKegiatanDialog.value = false;
        editProgramDialog.value = false;
        submitted.value = false;
    }
    
    function saveKegiatan(updatedKegiatan) {
        submitted.value = true;

        if (
            updatedKegiatan
                ?.kegiatan
                    ?.trim()
        ) {
            if (updatedKegiatan.id) {
                const index = activities
                    .value
                    .findIndex(e => e.id === updatedKegiatan.id);
                if (index !== -1) {
                    activities.value[index] = {
                        ...updatedKegiatan
                    };
                    toast.add(
                        {severity: 'success', summary: 'Berhasil', detail: 'Kegiatan Diperbarui', life: 3000}
                    );
                }
            } else {
                updatedKegiatan.id = nextKegiatanId.value++;
                activities
                    .value
                    .push({
                        ...updatedKegiatan
                    });
                toast.add(
                    {severity: 'success', summary: 'Berhasil', detail: 'Kegiatan Ditambahkan', life: 3000}
                );
            }

            tambahKegiatanDialog.value = false;
            editProgramDialog.value = false;
            kegiatan.value = {};
            submitted.value = false;
        } else {
            toast.add(
                {severity: 'error', summary: 'Gagal', detail: 'Kegiatan tidak boleh kosong', life: 3000}
            );
        }
    }

    const saveProgram = async (updatedProgram) => {
        console.log('Data yang akan disimpan:', updatedProgram);

        // Validasi data
        if (!updatedProgram || !updatedProgram.name || updatedProgram.name.trim() === '') {
            toast.add({ severity: 'error', summary: 'Gagal', detail: 'Nama program tidak boleh kosong', life: 3000 });
            console.log('Validasi gagal: Nama program kosong.');
            return;
        }
        if (!updatedProgram.sector_id || updatedProgram.sector_id.trim() === '') {
            toast.add({ severity: 'error', summary: 'Gagal', detail: 'Sektor ID tidak boleh kosong', life: 3000 });
            console.log('Validasi gagal: Sektor ID kosong.');
            return;
        }
        if (!updatedProgram.description || updatedProgram.description.trim() === '') {
            toast.add({ severity: 'error', summary: 'Gagal', detail: 'Deskripsi tidak boleh kosong', life: 3000 });
            console.log('Validasi gagal: Deskripsi kosong.');
            return;
        }
        if (!updatedProgram.start_date) {
            toast.add({ severity: 'error', summary: 'Gagal', detail: 'Tanggal mulai tidak boleh kosong', life: 3000 });
            console.log('Validasi gagal: Tanggal mulai kosong.');
            return;
        }
        if (!updatedProgram.end_date) {
            toast.add({ severity: 'error', summary: 'Gagal', detail: 'Tanggal selesai tidak boleh kosong', life: 3000 });
            console.log('Validasi gagal: Tanggal selesai kosong.');
            return;
        }

        // Format data yang akan dikirim
        const dataToSend = {
            name: updatedProgram.name.trim(),
            sector_id: updatedProgram.sector_id.trim(),
            kepala_bidang: updatedProgram.kepala_bidang.trim(),
            description: updatedProgram.description.trim(),
            start_date: updatedProgram.start_date,
            end_date: updatedProgram.end_date,
        };

        console.log('Data yang diformat untuk dikirim:', dataToSend);

        try {
            const response = await axios.put(`/api/program/${updatedProgram.id}`, dataToSend);

            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Program berhasil diperbarui',
                life: 3000,
            });

            fetchPrograms();

            editProgramDialog.value = false;

            console.log('Response dari server:', response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memperbarui program.';
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: errorMessage,
                life: 3000,
            });

            console.error('Error updating program:', error.response || error);
        }
    };

    function editProgram() {
        program.value = { ...programs.value }; 
        editProgramDialog.value = true;
    }

    function editActivity(activity) {
        kegiatan.value = {
            ...activity
        };
        editKegiatanDialog.value = true;
    }

    const confirmDeleteMember = async (user) => {
    const confirmDelete = window.confirm(
        `Apakah Anda yakin ingin menghapus anggota tim "${user.name}"?`
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await axios.delete(`/api/program-${programId}/team`, {
            data: { user_id: user.id },
        });

        // Berikan feedback ke pengguna
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Anggota tim "${user.name}" berhasil dihapus`,
            life: 3000,
        });

        // Hapus data dari daftar lokal
        programs.value.users = programs.value.users.filter(
            (u) => u.id !== user.id
        );
    } catch (error) {
        console.error('Gagal menghapus anggota tim:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat menghapus anggota tim',
            life: 3000,
        });
    }
};

</script>

<template>
    <Toast/>
    <Breadcrumb
        :model="breadcrumbItems"
        v-if="breadcrumbItems.length"
        class="custom-breadcrumb text-white bold"/>
    <br>
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
                    <h2 class="font-semibold text-3xl mb-4">{{ programs?.name || 'null' }}</h2>
                    <div class="flex justify-center space-x-4 mb-4">
                        <Button
                            v-if="role === 'supervisor'"
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Hapus Program"
                            icon="pi pi-trash"
                            severity="danger"/>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-1/2">
                <div class="card">
                    <Toolbar class="mb-6">
                        <template #start>
                            <div class="font-semibold text-xl">TIM</div>
                        </template>
                        <template #end>
                            <Button
                                v-if="role === 'supervisor'"
                                class="p-button-rounded !text-sm !px-4 !py-2"
                                label="Tambah Tim"
                                icon="pi pi-plus"
                                severity="warning"
                                @click="openAddTeamDialog"/>
                        </template>
                    </Toolbar>

                    <DataTable v-if="programs" :value="programs.users"
                    ref="dtTim"
                    v-model:selection="selectedTeams"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} tim">
                    
                    <!-- Kolom Penomoran -->
                    <Column header="NO">
                        <template v-slot:body="slotProps">
                            {{ slotProps.index + 1 }}
                        </template>
                    </Column>


                    <!-- Kolom Nama User -->
                    <Column field="name" header="NAMA" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>

                    <!-- Kolom Role -->
                    <Column header="ROLE">
                        <template #body="slotProps">
                            {{ slotProps.data.pivot.role }}
                        </template>
                    </Column>

                    <!-- Kolom Progress -->
                    <!-- <Column v-if="role === 'admin'" field="progress" header="PROGRESS" sortable></Column> -->

                    <!-- Kolom Aksi -->
                    <Column v-if="role === 'supervisor'" header="AKSI">
                        <template #body="slotProps">
                            <Button
                                v-if="role === 'supervisor'"
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                @click="confirmDeleteMember(slotProps.data)"
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
                            <div class="font-semibold text-xl">Detail Program</div>
                        </template>
                        <template #end>
                            <Button
                                v-if="role === 'supervisor'"
                                class="p-button-rounded !text-sm !px-4 !py-2"
                                label="Edit Program"
                                icon="pi pi-pencil"
                                severity="warning"
                                @click="editProgram"/>
                        </template>
                    </Toolbar>

                    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                        <li class="flex items-center py-2 border-b border-surface">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-tag !text-xl text-red-500"></i>
                            </div>
                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Nama Program: </strong>
                                <span class="text-primary font-bold">{{ programs?.name|| 'Tidak ada program' }}</span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-calendar !text-xl text-blue-500"></i>
                            </div>
                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Tanggal Mulai: </strong>
                                <span class="text-primary font-bold">{{ programs?.start_date || 'Tidak ada data' }}</span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-clock !text-xl text-green-500"></i>
                            </div>
                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Tanggal Berakhir: </strong>
                                <span class="text-primary font-bold">{{ programs?.end_date|| 'Tidak ada data' }}</span>
                            </span>
                        </li>
                    </ul>

                    <Fieldset legend="Deskripsi" :toggleable="true">
                        <p class="leading-normal m-0">
                            {{ programs?.description || 'Tidak ada program' }}
                        </p>
                    </Fieldset>
                </div>
            </div>
        </div>

        <div class="card mt-8">
            <Toolbar class="mb-6">
                <template #start>
                    <div class="font-semibold text-xl">Kegiatan</div>
                </template>
                <template #end>
                    <Button
                        v-if="role === 'supervisor'"
                        label="Tambah Kegiatan"
                        icon="pi pi-plus"
                        class="p-button-rounded !text-sm !px-4 !py-2"
                        severity="warning"
                        @click="openNew"/>
                </template>
            </Toolbar>
            <DataTable
                ref="dtKegiatan"
                v-model:selection="selectedActivities"
                :value="activities"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} kegiatan"
                selectionMode="single"
                :selection="selectedActivity"
                @update:selection="selectedActivity = $event">
                <Column field="no" header="NO" sortable="sortable"></Column>
                <Column field="kegiatan" header="KEGIATAN" sortable="sortable"></Column>
                <Column field="tanggal" header="TANGGAL" sortable="sortable"></Column>
                <Column field="tempat" header="TEMPAT" sortable="sortable"></Column>
                <Column field="anggota" header="ANGGOTA" sortable="sortable"></Column>
                <!-- <Column field="progress" header="PROGRESS" sortable="sortable"></Column> -->
                <Column header="DETAIL">
                    <template #body="slotProps">
                        <router-link :to="{path: '/DetailKegiatan', query: { id: slotProps.data.id }}">
                            <Button
                                icon="pi pi-eye"
                                outlined="outlined"
                                severity="info"
                                :style="{ borderColor:'blue', color:'blue'}"
                                rounded="rounded"
                                class="mr-2"/>
                        </router-link>
                    </template>
                </Column>
                <Column header="AKSI" v-if="role === 'supervisor'">
                    <template #body="slotProps">
                        <Button
                            v-if="role === 'supervisor'"
                            icon="pi pi-pencil"
                            outlined="outlined"
                            rounded="rounded"
                            class="mr-2"
                            @click="editKegiatanFn(kegiatan)"/>
                        <Button
                            v-if="role === 'admin' || role === 'supervisor'"
                            icon="pi pi-trash"
                            outlined="outlined"
                            rounded="rounded"
                            severity="danger"
                            @click="confirmDeleteActivity(slotProps.data)"/>
                    </template>
                </Column>
            </DataTable>
        </div>

        <TambahTim
            v-model:visible="showAddTeamDialog"
            :users="users"
            :programId="programId"
            :submitted="submitted"
            @save="saveTeamMember"
            @hide="hideAddTeamDialog"/>

        <EditTim
            :visible="showEditTeamDialog"
            :member="selectedTeamMember"
            :submitted="submitted"
            @save="saveTeamMember"
            @hide="hideEditTeamDialog"
            @update:visible="showEditTeamDialog = $event"/>

        <TambahKegiatan
            :visible="tambahKegiatanDialog"
            @update:visible="tambahKegiatanDialog = $event"
            @save="saveKegiatan"
            @hide="tambahKegiatanDialog = false"/>

        <EditKegiatan
            :visible="showEditDialog"
            :kegiatan="selectedKegiatan"
            :submitted="submitted"
            @save="saveKegiatan"
            @hide="hideDialog"
            @update:visible="showEditDialog = $event"/>

        <EditProgram
            :visible="editProgramDialog"
            :program="program"
            @update:visible="editProgramDialog = $event"
            @hide="hideDialog"
            @save="saveProgram"/>
    </template>

<style scoped="scoped">
    .card {
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background-color: var(--surface-card);
    }
    .text-muted-color {
        color: var(--text-color-secondary);
    }
    .text-primary {
        color: var(--p-primary-500);
    }
    .text-surface-900 {
        color: var(--text-color);
    }
    .text-surface-700 {
        color: var(--text-color-secondary);
    }
    .text-surface-0 {
        color: white;
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