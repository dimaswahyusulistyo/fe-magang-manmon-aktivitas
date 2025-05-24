<script setup="setup">
import axios from 'axios';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
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
    programId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save']);

const newTeamMember = ref({ nama: '', role: '' });

const submitted = ref(false);

function handleUpdateVisible(val) {
    console.log('handleUpdateVisible dipanggil dengan nilai:', val);
    emit('update:visible', val);
    if (!val) {
        resetForm();
    }
}

function hideDialog() {
    console.log('hideDialog dipanggil');
    emit('update:visible', false);
    resetForm();
}

function saveTeam() {
    submitted.value = true;

    if (!newTeamMember.value.role.trim()) {
        console.error('Role wajib diisi.');
        return;
    }

    if (newTeamMember.value.role === 'Anggota' && (!newTeamMember.value.anggota || newTeamMember.value.anggota.length === 0)) {
        console.error('Setidaknya satu anggota harus dipilih.');
        return;
    }

    if (newTeamMember.value.role === 'Ketua') {
        // Jika role adalah Ketua, kirim satu anggota
        const dataToSend = {
            role: newTeamMember.value.role,
            id: newTeamMember.value.anggota[0], // Ambil anggota pertama
            program_id: props.programId
        };

        handleSaveTeam(dataToSend);
    } else if (newTeamMember.value.role === 'Anggota') {
        // Jika role adalah Anggota, kirim banyak anggota
        const dataToSend = {
            role: newTeamMember.value.role,
            ids: newTeamMember.value.anggota, // Kirim array anggota
            program_id: props.programId
        };

        handleSaveManyTeams(dataToSend);
    }

    hideDialog();
    showSuccessMessage();
}

function handleSaveManyTeams(data) {
    console.log('Data untuk storeMany:', data);

    axios
        .post(`/api/program-${data.program_id}/team/many/`, {
            id: data.ids, // Array ID anggota
            role: data.role // Role yang dipilih
        })
        .then((response) => {
            console.log('Data berhasil disimpan ke storeMany:', response.data);
        })
        .catch((error) => {
            console.error('Gagal menyimpan data ke storeMany:', error);
        });
}

function showSuccessMessage() {
    // Contoh cara menampilkan pesan sukses menggunakan state
    successMessage.value = 'Data berhasil disimpan!';
    setTimeout(() => {
        successMessage.value = ''; // Hapus pesan setelah beberapa detik
    }, 3000);
}

function handleSaveTeam(data) {
    console.log('Data yang diterima dari child:', data);

    // Kirim data ke API menggunakan axios
    axios
        .post(`/api/program-${data.program_id}/team`, {
            id: data.id, // ID anggota
            role: data.role // Role yang dipilih
        })
        .then((response) => {
            console.log('Data berhasil disimpan:', response.data);
        })
        .catch((error) => {
            console.error('Gagal menyimpan data:', error);
        });
}

function resetForm() {
    newTeamMember.value = {
        role: '',
        anggota: []
    };
    submitted.value = false;
}

const roleOptions = ref([
    {
        label: 'Ketua',
        value: 'Ketua'
    },
    {
        label: 'Anggota',
        value: 'Anggota'
    }
]);

const anggotaOptions = computed(() => {
    return props.users.map((user) => ({ label: user.name, value: user.id }));
});

function getAnggotaLabel(anggota) {
    const anggotaOption = anggotaOptions.value.find((option) => option.value === anggota);
    return anggotaOption ? anggotaOption.label : '';
}

function handleRoleChange() {
    if (newTeamMember.value.role === 'Ketua') {
        newTeamMember.value.anggota = []; // Set sebagai array kosong
    } else if (newTeamMember.value.role === 'Anggota') {
        newTeamMember.value.anggota = []; // Tetap array kosong
    }
    console.log('Role diubah:', newTeamMember.value.role, newTeamMember.value.anggota);
}
</script>

<template>
    <Dialog :visible="visible" @save="handleSaveTeam" :style="{ width: '450px' }" header="Tambah Tim" :modal="true" @update:visible="handleUpdateVisible" @hide="hideDialog">
        <div class="flex flex-col gap-6">
            <div>
                <label for="role" class="block font-bold mb-2">Role</label>
                <Dropdown id="role" v-model="newTeamMember.role" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Pilih Role" required="required" class="w-full" @change="handleRoleChange" />
                <small v-if="submitted && !newTeamMember.role" class="text-red-500">Role wajib diisi.</small>
            </div>

            <div v-if="newTeamMember.role === 'Ketua'">
                <label for="anggota" class="block font-bold mb-2">Anggota</label>
                <Dropdown id="anggota" v-model="newTeamMember.anggota[0]" :options="anggotaOptions" optionLabel="label" optionValue="value" placeholder="Pilih Anggota" required="required" class="w-full" />
                <small v-if="submitted && !newTeamMember.anggota" class="text-red-500">Anggota wajib diisi.</small>
            </div>

            <div v-else-if="newTeamMember.role === 'Anggota'">
                <label for="anggota" class="block font-bold mb-2">Anggota</label>
                <MultiSelect
                    v-if="newTeamMember.role === 'Anggota'"
                    id="anggota"
                    v-model="newTeamMember.anggota"
                    :options="anggotaOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Anggota"
                    class="w-full"
                    :filter="true"
                    :multiple="true"
                    :metaKeySelection="false"
                />
                <small v-if="submitted && newTeamMember.anggota.length === 0" class="text-red-500">Anggota wajib diisi.</small>
            </div>

            <div v-if="newTeamMember.anggota && newTeamMember.anggota.length" class="mt-2">
                <h4 class="font-bold mb-2 text-gray-600">Anggota yang dipilih:</h4>
                <div class="flex flex-wrap gap-2">
                    <div v-for="(anggota, index) in newTeamMember.anggota" :key="index" class="bg-gray-200 text-gray-600 px-3 py-2 rounded-md shadow-sm">
                        {{ getAnggotaLabel(anggota) }}
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
