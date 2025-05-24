<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import TambahTim from '../program/TambahTim.vue';
import EditKegiatan from './EditKegiatan.vue';
import EditTim from './EditTim.vue';
import LaporanDialog from './Laporan.vue';
import TambahLaporanDialog from './TambahLaporan.vue';

const route = useRoute();
const breadcrumbItems = ref(route.meta.breadcrumb || []);

const kegiatan = ref({
    id: 1,
    nama: 'Perbaikan Jaringan',
    tanggal: '2024-10-01',
    tempat: 'Aula Puskesmas',
    anggota: 'Fatkhul, Hadi',
    deskripsi: 'Kegiatan ini bertujuan untuk memperbaiki jaringan internet di Puskesmas.'
});

const activities = ref([
    { id: 1, nama: 'Fatkhul', role: 'Pemimpin' },
    { id: 2, nama: 'Hadi', role: 'Anggota'},
]);

const selectedActivities = ref([]);
const selectedKegiatan = ref({});
const selectedTeamMember = ref({});
const showTambahLaporanDialog = ref(false);
const showLaporanDialog=ref(false);

const showEditDialog = ref(false);
const showEditTeamDialog = ref(false); 
const showAddTeamDialog = ref(false);

const editKegiatanFn = (kegiatanData) => {
    selectedKegiatan.value = kegiatanData;
    showEditDialog.value = true;
};

const openTambahLaporanDialog = () => {
    showTambahLaporanDialog.value = true; 
};

const openLaporanDialog = () => {
    showLaporanDialog.value = true; 
};


const saveLaporan = (laporanData) => {
    console.log('Laporan disimpan:', laporanData);
    showTambahLaporanDialog.value = false;
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

const confirmDeleteActivity = (activity) => {
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
                <h2 class="font-semibold text-3xl mb-4">{{ kegiatan.nama }}</h2>
                <div class="flex justify-center space-x-4 mb-4">
                    <Button
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
                <Toolbar class="mb-4">
                        <template #start>
                            <div class="font-semibold">Status</div>
                        </template>
                        <template #end>
                            <Tag class="mr-6" severity="success" value="Diterima" :rounded="true"></Tag>
                            <Button
                                icon="pi pi-eye"
                                outlined
                                rounded
                                class="mr-2"
                                severity="info"
                                @click="() => openLaporanDialog()"
                                :style="{color:'blue', borderColor: 'blue'}"/>
                            <Button
                                icon="pi pi-plus"
                                outlined
                                rounded
                                class="mr-2"
                                severity="success"
                                @click="openTambahLaporanDialog"
                                :style="{color:'success', borderColor: 'success'}"/>
                        </template>
                    </Toolbar>
                <Toolbar class="mb-4">
                        <template #start>
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-info-circle !text-xl text-yellow-500"></i>
                            </div>

                            <div class="font-semibold text-xl">Pelaporan Oleh:</div>
                        </template>
                        <template #end>
                            <Chip label="John Doe" :image="'/profile.jpg'" class="mr-2"></Chip>
                        </template>
                    </Toolbar>
                    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                        <li class="flex items-center py-2 border-b border-surface">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-user !text-xl text-gray-500"></i>
                            </div>

                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Koordinator:</strong>
                                <span class="text-primary font-bold">
                                    John Doe</span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-tag !text-xl text-green-500"></i>
                            </div>

                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Nama Kegiatan:</strong>
                                <span class="text-primary font-bold">
                                    Perbaikan Jaringan</span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-full mr-4 shrink-0">
                                <i class="pi pi-calendar !text-xl text-purple-500"></i>
                            </div>
                            <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                <strong>Tanggal Pelaporan:</strong>
                                <span class="text-primary font-bold">14 Oktober 2024</span>
                            </span>
                        </li>
                        <li class="flex items-center py-2 border-b border-surface">
                            <div class="flex items-center">
                                <div
                                    class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                                    <i class="pi pi-info-circle !text-xl text-orange-500"></i>
                                </div>
                                <span class="text-surface-900 dark:text-surface-0 leading-normal">
                                    <strong>Keterangan:</strong>
                                    <span class="text-primary font-bold">Kegiatan berlangsung dengan lancar.</span>
                                </span>
                            </div>
                        </li>
                    </ul>
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
                            <strong>Nama Kegiatan:</strong>
                            <span class="text-primary font-bold">{{ kegiatan.nama }}</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-calendar !text-xl text-blue-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Tanggal Kegiatan:</strong>
                            <span class="text-primary font-bold">{{ kegiatan.tanggal }}</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-clock !text-xl text-green-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Waktu:</strong>
                            <span class="text-primary font-bold">09:00</span>
                        </span>
                    </li>
                    <li class="flex items-center py-2">
                        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-map-marker !text-xl text-orange-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>Lokasi:</strong>
                            <span class="text-primary font-bold">{{ kegiatan.tempat }}</span>
                        </span>
                    </li>
                </ul>

                <Fieldset legend="Deskripsi" :toggleable="true">
                    <p class="leading-normal m-0">
                        {{ kegiatan.deskripsi }}
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

    <TambahTim
        v-model:visible="showAddTeamDialog"
        :submitted="submitted"
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
        @save="saveLaporan"
        @hide="hideTambahLaporanDialog"
    />

    <LaporanDialog
        v-model:visible="showLaporanDialog"
       :laporan="kegiatan"
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
                    src="/sample.pdf"
                    style="border: none; width: 100%; height: 100%; max-width: 800px; max-height: 600px;"></iframe>
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
