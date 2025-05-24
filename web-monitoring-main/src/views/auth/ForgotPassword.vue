<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';

const email = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const checked = ref(false);
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="flex justify-center mb-4" style="height: 70px; width: auto;">
                            <img src="/favicon.png" alt="Logo" style="max-height: 100%; width: auto;">
                        </div>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Forgot Password</div>
                        <span class="text-muted-color font-medium">Please enter your email to receive a verification code</span>
                    </div>

                    <div>
                        <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <div class="flex items-center mb-8">
                            <InputText id="email" type="email" placeholder="Email address" class="w-full md:w-[30rem] mr-4" v-model="email" />
                            <Button label="Kirimkan Kode" class="bg-blue-500 text-white" @click="sendCode" />
                        </div>


                        <label for="verificationCode" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Verification Code</label>
                        <InputText id="verificationCode" type="text" placeholder="Enter verification code" class="w-full md:w-[30rem] mb-4" v-model="verificationCode" />

                        <label for="newPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">New Password</label>
                        <Password id="newPassword" v-model="newPassword" placeholder="New Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirm New Password</label>
                        <Password id="confirmPassword" v-model="confirmPassword" placeholder="Confirm New Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <Button label="Reset Password" class="w-full" as="router-link" to="/dashboard"></Button>
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
</style>
