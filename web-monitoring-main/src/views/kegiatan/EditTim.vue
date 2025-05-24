<script setup="setup">
    import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ref, watch } from 'vue';

    const props = defineProps({
        visible: {
            type: Boolean,
            required: true
        },
        teamMember: {
            type: Object,
            required: true
        }
    });

    const emits = defineEmits(['update:visible', 'save']);

    const submitted = ref(false);
    const localTeamMember = ref({
        ...props.teamMember
    });

    watch(() => props.teamMember, (newValue) => {
        localTeamMember.value = {
            ...newValue
        };
    });

    function handleUpdateVisible(val) {
        emits('update:visible', val);
    }

    function hideDialog() {
        submitted.value = false;
        emits('update:visible', false);
    }

    function save() {
        submitted.value = true;

        if (!localTeamMember.value.nama || !localTeamMember.value.role) {
            return;
        }

        emits('save', localTeamMember.value);
        submitted.value = false;
    }

    const roleOptions = ref([
        {
            label: 'Koordinator',
            value: 'Koordinator'
        }, {
            label: 'Anggota',
            value: 'Anggota'
        }
    ]);

    const anggotaOptions = ref([
        {
            label: 'Anggota 1',
            value: 'anggota1'
        }, {
            label: 'Anggota 2',
            value: 'anggota2'
        }, {
            label: 'Anggota 3',
            value: 'anggota3'
        }, {
            label: 'Anggota 4',
            value: 'anggota4'
        }, {
            label: 'Anggota 5',
            value: 'anggota5'
        }, {
            label: 'Anggota 6',
            value: 'anggota6'
        }, {
            label: 'Anggota 7',
            value: 'anggota7'
        }, {
            label: 'Anggota 8',
            value: 'anggota8'
        }
    ]);

    function getAnggotaLabel(anggota) {
        const anggotaOption = anggotaOptions.value.find(option => option.value === anggota);
        return anggotaOption ? anggotaOption.label : '';
    }

    function handleRoleChange() {
        if (newTeamMember.value.role === 'Koordinator') {
            newTeamMember.value.anggotaKoordinator = '';
        } else if (newTeamMember.value.role === 'Anggota') {
            newTeamMember.value.anggotaAnggota = '';
        }
    }

</script>

<template>
    <Dialog
        :visible="visible"
        header="Edit Tim"
        :style="{ width: '450px' }"
        modal="modal"
        @update:visible="handleUpdateVisible"
        @hide="hideDialog">
        <div class="flex flex-col gap-4">
            <div>
                <label for="role" class="block font-bold mb-2">Role</label>
                <Dropdown
                    id="role"
                    v-model="localTeamMember.role"
                    :options="roleOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Role"
                    required="required"
                    class="w-full"
                    @change="handleRoleChange"/>
                <small v-if="submitted && !localTeamMember.role" class="text-red-500">Role wajib diisi.</small>
            </div>

            <div v-if="localTeamMember.role === 'Koordinator'">
                <label for="anggota" class="block font-bold mb-2">Anggota</label>
                <Dropdown
                    id="anggota"
                    v-model="localTeamMember.anggota"
                    :options="anggotaOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Anggota"
                    required="required"
                    class="w-full"/>
                <small v-if="submitted && !localTeamMember.anggota" class="text-red-500">Anggota wajib diisi.</small>
            </div>

            <div v-else-if="localTeamMember.role === 'Anggota'">
                <label for="anggota" class="block font-bold mb-2">Anggota</label>
                <MultiSelect
                    id="anggota"
                    v-model="localTeamMember.anggota"
                    :options="anggotaOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Anggota"
                    class="w-full"
                    :filter="true"
                    :multiple="true"
                    :metaKeySelection="false"
                />
                <small v-if="submitted && localTeamMember.anggota.length === 0" class="text-red-500">Anggota wajib diisi.</small>
            </div>
        </div>

        <div v-if="newTeamMember.anggota && newTeamMember.anggota.length" class="mt-2">
            <h4 class="font-bold mb-2 text-gray-600">Anggota yang dipilih:</h4>
            <div class="flex flex-wrap gap-2">
                <div v-for="(anggota, index) in newTeamMember.anggota" :key="index" class="bg-gray-200 text-gray-600 px-3 py-2 rounded-md shadow-sm">
                    {{ getAnggotaLabel(anggota) }}
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="hideDialog"/>
            <Button label="Save" icon="pi pi-check" @click="save"/>
        </template>
    </Dialog>
</template>

<style scoped="scoped">
    .w-full {
        width: 100%;
    }
</style>