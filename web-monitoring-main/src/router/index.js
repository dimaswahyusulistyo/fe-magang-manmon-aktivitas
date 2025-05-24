import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: () => import('@/views/Landing.vue'),
            meta: { breadcrumb: [{ label: 'Home', to: '/' }] }
        },
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                   
                },
                {
                    path: 'program',
                    name: 'Program',
                    component: () => import('@/views/program/Program.vue')
                },
                {
                    path: 'detailProgram',
                    name: 'DetailProgram',
                    meta: { breadcrumb: [{ label: 'Program', to: '/' }, { label: 'Detail Program' }] },
                    component: () => import('@/views/program/DetailProgram.vue')
                },
                {
                    path: 'datapegawai',
                    name: 'DataPegawai',
                    component: () => import('@/views/pegawai/DataPegawai.vue')
                },
                {
                    path: 'kegiatan',
                    name: 'Kegiatan',
                    component: () => import('@/views/kegiatan/Kegiatan.vue')
                },
                {
                    path: 'detailKegiatan',
                    name: 'DetailKegiatan',
                    meta: { breadcrumb: [{ label: 'Kegiatan', to: '/' }, { label: 'Detail Kegiatan' }] },
                    component: () => import('@/views/kegiatan/DetailKegiatan.vue')
                },
                {
                    path: 'detailKegiatanPegawai',
                    name: 'DetailKegiatanPegawai',
                    meta: { breadcrumb: [{ label: 'Kegiatan', to: '/' }, { label: 'Detail Kegiatan Pegawai' }] },
                    component: () => import('@/views/kegiatan/DetailKegiatanPegawai.vue')
                },
                {
                    path: 'laporan',
                    name: 'Laporan',
                    meta: { breadcrumb: [{ label: 'Kegiatan', to: '/' }, { label: 'Laporan' }] },
                    component: () => import('@/views/kegiatan/Laporan.vue')
                },
                {
                    path: 'Tambahlaporan',
                    name: 'TambahLaporan',
                    meta: { breadcrumb: [{ label: 'Kegiatan', to: '/' }, { label: 'Tambah Laporan' }] },
                    component: () => import('@/views/kegiatan/TambahLaporan.vue')
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    meta: { breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Profile' }] },
                    component: () => import('@/views/pegawai/Profile.vue')
                },
                {
                    path: '/downloadlaporan/:taskId',
                    name: 'DownloadLaporan',
                    component: () => import('@/views/kegiatan/DownloadLaporan.vue')
                },
            ]
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/auth/Login.vue')
        },
        {
            path: '/auth/forgotpassword',
            name: 'forgotpassword',
            component: () => import('@/views/auth/ForgotPassword.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/auth/Error.vue')
        }
    ]
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage
    const role = localStorage.getItem('role');

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next({ path: '/auth/login' });
        } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(role)) {
            next({ path: '/auth/access' }); // Halaman jika akses ditolak
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
