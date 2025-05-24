<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const backgrounds = [
    '/karanganyar-1.jpg',
    '/karanganyar-2.jpg',
    '/karanganyar-3.jpg',
    '/karanganyar-5.jpg'
];

const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

const email = ref('');
const password = ref('');
const checked = ref(false);
const isLoggedIn = ref(false);
const errorMessage = ref('');

const router = useRouter();

// Login Function

const login = async () => {
    try {
        const response = await axios.post('/api/login', {
            email: email.value,
            password: password.value
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.guard);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        isLoggedIn.value = true;
        errorMessage.value = '';

        // Directly redirect to the dashboard
        await router.push('/dashboard');
    } catch (error) {
        errorMessage.value = error.response.data.message || 'Login failed. Please try again.';
    }
};



// Logout function (blm jadi)
const logout = async () => {
    try {
        await axios.get('/api/logout', {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        handleLogout();
    } catch (error) {
        errorMessage.value = 'Failed to logout'; 
    }
};

// Handle logout
const handleLogout = () => {
    localStorage.removeItem('token');
    isLoggedIn.value = false;
    router.push('/auth/login');
};

</script>

<template>
    <FloatingConfigurator />
    <div :style="{ backgroundImage: `url(${randomBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }" class="flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden relative">

        <div class="absolute inset-0 bg-black opacity-50 z-0"></div>

        <div class="relative flex flex-col items-center justify-center z-10">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full py-20 px-8 sm:px-20 bg-white bg-opacity-100 dark:bg-surface-900" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="flex justify-center mb-4" style="height: 70px; width: auto;">
                            <img src="/favicon.png" alt="Logo" style="max-height: 100%; width: auto;">
                        </div>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to Monitoring!</div>
                        <span class="text-muted-color font-medium">Sign in to continue</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <!-- <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <router-link to="/auth/forgotpassword">
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                            </router-link>
                        </div> -->
                    </br>
                        <Button label="Sign In" class="w-full" @click="login"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.bg-image {
    background-size: cover;
    background-position: center;
    filter: brightness(50%);
}
</style>
