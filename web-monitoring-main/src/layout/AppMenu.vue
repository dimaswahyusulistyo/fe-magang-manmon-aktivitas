<script setup="setup">
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const role = localStorage.getItem('role');
const model = computed(() => {
    if (role === 'admin') {
        return [
            {
                label: 'Kepala Bidang',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
                    { label: 'Program Kerja', icon: 'pi pi-fw pi-folder', to: '/program' },
                    { label: 'Rincian Kegiatan', icon: 'pi pi-fw pi-calendar', to: '/kegiatan' },
                    { label: 'Daftar Pegawai', icon: 'pi pi-fw pi-users', to: '/datapegawai' }
                ]
            }
        ];
    } else if (role === 'supervisor') {
        return [
            {
                label: 'Kepala Dinas',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
                    { label: 'Program Kerja', icon: 'pi pi-fw pi-folder', to: '/program' },
                    { label: 'Rincian Kegiatan', icon: 'pi pi-fw pi-calendar', to: '/kegiatan' }
                ]
            }
        ];
    } else if (role === 'user') {
        return [
            {
                label: 'User Menu',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
                    { label: 'Program Kerja', icon: 'pi pi-fw pi-folder', to: '/program' },
                    { label: 'Rincian Kegiatan', icon: 'pi pi-fw pi-calendar', to: '/kegiatan' }
                ]
            }
        ];
    }
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped="scoped"></style>
