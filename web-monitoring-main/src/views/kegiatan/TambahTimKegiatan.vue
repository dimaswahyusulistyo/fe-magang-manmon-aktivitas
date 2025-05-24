<script setup>
import axios from 'axios';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import MultiSelect from 'primevue/multiselect';
import { computed, ref } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    users: {
        type: Array,
        required: true
    },
    taskId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save']);

const newTeamMember = ref({ anggota: [] });
const submitted = ref(false);
const successMessage = ref('');

const anggotaOptions = computed(() => props.users.map((user) => ({ label: user.name, value: user.id })));

function hideDialog() {
    emit('update:visible', false);
    resetForm();
}

function saveTeam() {
    submitted.value = true;

    if (!newTeamMember.value.anggota.length) {
        console.error('Setidaknya satu anggota harus dipilih.');
        return;
    }

    const dataToSend = {
        ids: newTeamMember.value.anggota,
        task_id: props.taskId
    };

    handleSaveManyTeams(dataToSend);
    hideDialog();
    showSuccessMessage();
}

function handleSaveManyTeams(data) {
    axios
        .post(`/api/task/${data.task_id}/attachTeam`, {
            id: data.ids
        })
        .then((response) => {
            console.log('Data berhasil disimpan:', response.data);
        })
        .catch((error) => {
            console.error('Gagal menyimpan data:', error);
        });
}

function showSuccessMessage() {
    successMessage.value = 'Data berhasil disimpan!';
    setTimeout(() => {
        successMessage.value = '';
    }, 3000);
}

function resetForm() {
    newTeamMember.value = { anggota: [] };
    submitted.value = false;
}
</script>

<template>
    <Dialog :visible="visible" :style="{ width: '450px' }" header="Tambah Tim" :modal="true" @update:visible="hideDialog" @hide="hideDialog">
        <div class="flex flex-col gap-6">
            <div>
                <label for="anggota" class="block font-bold mb-2">Anggota</label>
                <MultiSelect id="anggota" v-model="newTeamMember.anggota" :options="anggotaOptions" optionLabel="label" optionValue="value" placeholder="Pilih Anggota" class="w-full" :filter="true" :multiple="true" :metaKeySelection="false" />
                <small v-if="submitted && !newTeamMember.anggota.length" class="text-red-500"> Setidaknya satu anggota harus dipilih. </small>
            </div>

            <div v-if="newTeamMember.anggota.length" class="mt-2">
                <h4 class="font-bold mb-2 text-gray-600">Anggota yang dipilih:</h4>
                <div class="flex flex-wrap gap-2">
                    <div v-for="(anggota, index) in newTeamMember.anggota" :key="index" class="bg-gray-200 text-gray-600 px-3 py-2 rounded-md shadow-sm">
                        {{ anggotaOptions.find((option) => option.value === anggota)?.label }}
                    </div>
                </div>
            </div>

            <div v-if="successMessage" class="bg-green-500 text-white p-2 rounded mt-4">
                {{ successMessage }}
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveTeam" />
        </template>
    </Dialog>
</template>

<style scoped="scoped"></style>
