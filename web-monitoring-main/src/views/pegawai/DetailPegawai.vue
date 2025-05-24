<script setup="setup">
    import axios from 'axios';
import Dialog from 'primevue/dialog';
import { onMounted, ref, watch } from 'vue';

    const visible = ref(false);
    const imageUrl = ref("/profile.jpg");
    const employees = ref([]);
    const props = defineProps(['employee']);
    const submitted = ref(false);

    const handleDialogVisibility = (val) => {
        visible.value = val;
    };

    const hideDialog = () => {
        visible.value = false;
        // editPegawaiDialog.value = false;
    };

    // function editEmployee(emp) {
    //     employee.value = {
    //         ...emp
    //     };
    //     editPegawaiDialog.value = true;
    // }

    const fetchUser = async () => {
    try {
        const response = await axios.get('/api/user');
        employees.value = response.data.users.map((employee, index) => ({
            no: index + 1,
            ...employee,
        }));
        console.log('Employees:', employees.value);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Gagal mengambil data pegawai.');
    }
};

onMounted(() => {
    fetchUser();
});

watch(
    () => props.employee,
    (newVal) => {
        console.log('Employee updated:', newVal);
    },
    { immediate: true }
);

</script>

<template>
    <Dialog
        :visible="visible"
        header="Profil User"
        :style="{ width: '450px' }"
        modal="modal"
        @update:visible="handleDialogVisibility"
        @hide="hideDialog">
        <div class="flex flex-col items-center justify-center">
            <div class="profile-card">
                <div class="header">
                    <div class="flex justify-center mb-4">
                        <img :src="imageUrl" alt="Profile Picture" class="profile-image"/>
                    </div>
                    <h2 class="text-surface-900 dark:text-surface-0 text-3xl font-medium">{{ employee?.name }}</h2>
                    <span class="text-muted-color font-medium">Profile Information</span>
                </div>

                <div class="profile-details">
                    <div class="detail-row">
                        <span class="label">NIP:</span>
                        <span class="value">{{ employee?.nip }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Jabatan:</span>
                        <span class="value">{{ employee?.occupation?.name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Bidang:</span>
                        <span class="value">{{ employee?.occupation?.sector?.name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">{{ employee?.email }}</span>
                    </div>
                </div>

                <div class="profile-actions flex justify-between">
                    <!-- <Button
                        class="p-button-rounded !text-sm !px-4 !py-2"
                        label="Edit"
                        icon="pi pi-pencil"
                        severity="warning"
                        @click="editEmployee"
                        :style="{ backgroundColor: 'gold', borderColor: 'gold', color: 'white' }"/>
                    <Button
                        class="p-button-rounded !text-sm !px-4 !py-2"
                        label="Hapus"
                        icon="pi pi-trash"
                        severity="warning"
                        @click=""
                        :style="{ backgroundColor: 'red', borderColor: 'red', color: 'white' }"/> -->
                </div>
            </div>
        </div>

        <!-- <EditPegawai
            :visible="editPegawaiDialog"
            @update:visible="editPegawaiDialog = $event"
            :employee="employee"
            :submitted="submitted"
            @hide="hideDialog"
            @save="saveEmployee"/> -->

    </Dialog>
</template>

<style scoped="scoped">
    .card {
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background-color: var(--surface-card);
    }
    .profile-card {
        border-radius: 56px;
        padding: 2rem;
        background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%);
        width: 100%;
        max-width: 400px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header {
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .profile-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 5px solid white;
    }

    .profile-details {
        margin-bottom: 2rem;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .label {
        font-weight: bold;
        color: var(--text-primary);
    }

    .value {
        color: var(--text-secondary);
    }

    .profile-actions {
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
    }
</style>