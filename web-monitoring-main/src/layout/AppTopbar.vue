<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-topbar" style="background-color: #1D5B79;">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action text-white" @click="onMenuToggle">
                <i class="pi pi-bars text-white"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <div class="flex justify-center" style="height: 30px; width: auto;">
                    <img src="/favicon.png" alt="Logo" style="max-height: 100%; width: auto;">
                </div>
                <span class="text-white">MONITORING</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action text-white" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon text-white': isDarkTheme, 'pi-sun text-white': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight text-white"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action text-white"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <router-link to="/Profile" class="layout-topbar-action text-white">
                        <i class="pi pi-user text-white"></i>
                        <span>Profile</span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
