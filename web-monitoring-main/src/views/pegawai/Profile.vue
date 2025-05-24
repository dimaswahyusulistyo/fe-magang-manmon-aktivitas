<script setup="setup">
    import axios from 'axios';
import { onMounted, ref } from 'vue';


    const nama = ref('');
    const nip = ref('');
    const jabatan = ref('');
    const bidang = ref('');
    const email = ref('');
    const imageUrl = ref("/profile.jpg");
    const logout = () => {
    console.log('Logout clicked');
    localStorage.removeItem('userId'); // Hapus ID pengguna dari localStorage
    window.location.href = 'auth/login'; // Redirect ke halaman login
    };

    const gantiPassword = () => {
        console.log('Ganti Password clicked');
    };

    const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token tidak ditemukan.');
        return;
    }

    try {
        const response = await axios.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
            nama.value = response.data.name || 'Tidak ada nama';
            nip.value = response.data.nip || 'Tidak ada NIP';
            jabatan.value = response.data.jabatan || 'Tidak ada jabatan';
            bidang.value = response.data.bidang || 'Tidak ada bidang';
            email.value = response.data.email || 'Tidak ada email';
            imageUrl.value = response.data.imageUrl || "/profile.jpg";
        } else {
            console.error('Data user tidak ditemukan.');
        }
    } catch (error) {
        console.error('Gagal mengambil data profil:', error);
        alert("Terjadi kesalahan pada server, coba lagi nanti.");
    }
};


onMounted(() => {
    if (!localStorage.getItem('userId')) {
    } else {
        fetchUserData();
    }
});

</script>

<template>
    <div class="col-span-12 lg:col-span-6">
        <div class="card">
            <div class="flex flex-col items-center justify-center">
                <div class="profile-card">
                    <div class="header">
                        <div class="flex justify-center mb-4">
                            <img :src="imageUrl" alt="Profile Picture" class="profile-image"/>
                        </div>
                        <h2 class="text-surface-900 dark:text-surface-0 text-3xl font-medium">{{ nama }}</h2>
                        <span class="text-muted-color font-medium">Profile Information</span>
                    </div>

                    <div class="profile-details">
                        <div class="detail-row">
                            <span class="label">NIP:</span>
                            <span class="value">{{ nip }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Jabatan:</span>
                            <span class="value">{{ jabatan }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Bidang:</span>
                            <span class="value">{{ bidang }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Email:</span>
                            <span class="value">{{ email }}</span>
                        </div>
                    </div>

                    <div class="profile-actions flex justify-between">
                        <Button
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Logout"
                            icon="pi pi-sign-out"
                            severity="warning"
                            @click="logout" />
                        <!-- <Button
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Ganti Password"
                            icon="pi pi-key"
                            severity="warning"
                            @click="gantiPassword" /> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
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