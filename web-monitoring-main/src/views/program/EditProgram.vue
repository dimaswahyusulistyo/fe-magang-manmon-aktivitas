<script setup>
import axios from 'axios';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true,
    },
    program: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['update:visible', 'save']);

const toast = useToast();
const submitted = ref(false);
    




const localProgram = ref({
    id: props.program?.id || null,
    name: props.program?.name || '',
    description: props.program?.description || '',
    start_date: props.program?.start_date || '',
    end_date: props.program?.end_date || '',
    kepalabidang: props.program?.end_date || '',
});

const formattedStartDate = computed({
    get: () => localProgram.value.start_date,
    set: (value) => {
        const date = new Date(value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        localProgram.value.start_date = formattedDate;
    },
});

const formattedEndDate = computed({
    get: () => localProgram.value.end_date,
    set: (value) => {
        const date = new Date(value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        localProgram.value.end_date = formattedDate;
    },
});

watch(() => props.visible, (newVal) => {
    if (!newVal) {
        submitted.value = false;
        localProgram.value = {
            id: props.program?.id || null,
            name: props.program?.name || '',
            description: props.program?.description || '',
            start_date: props.program?.start_date || '',
            end_date: props.program?.end_date || '',
        };
    }
});




function hideDialog() {
    emit('update:visible', false);
}
async function saveProgram() {
    submitted.value = true;

    console.log('localProgram before saving:', localProgram.value);


    const name = localProgram.value.name ? localProgram.value.name.trim() : '';
    const description = localProgram.value.description ? localProgram.value.description.trim() : '';

    

    // Validasi input
    if (
        name !== '' &&
        localProgram.value.start_date &&
        localProgram.value.end_date &&
        description !== ''
    ) {
        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/program/${localProgram.value.id}`,
                {
                    name,
                    description,
                    start_date: localProgram.value.start_date,
                    end_date: localProgram.value.end_date,
                }
            );

            console.log('Success response:', response);
            emit('save', response.data.program);
            emit('refresh');
        } catch (error) {
            console.error('Error during save:', error);
        }

        // Paksa status ke success
        hideDialog();

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Program berhasil diperbarui',
            life: 3000,
        });
    } else {
        console.warn('Validation failed for localProgram:', localProgram.value);
    }


}


</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :style="{ width: '450px' }"
        header="Edit Program"
        :modal="true"
    >
        <div class="flex flex-col gap-6">
            <div>
                <label for="name" class="block font-bold mb-3">Program</label>
                <InputText
                    id="name"
                    v-model.trim="localProgram.name"
                    :class="{'p-invalid': submitted && !localProgram.name}"
                    class="w-full"
                />
                <small v-if="submitted && !localProgram.name" class="p-error">Program is required.</small>
            </div>

            <div>
                <label for="start_date" class="block font-bold mb-3">Start Date</label>
                <Calendar
                    id="start_date"
                    v-model="formattedStartDate"
                    dateFormat="yy-mm-dd"
                    :class="{'p-invalid': submitted && !localProgram.start_date}"
                    class="w-full"
                />
                <small v-if="submitted && !localProgram.start_date" class="p-error">Start Date is required.</small>
            </div>

            <div>
                <label for="end_date" class="block font-bold mb-3">End Date</label>
                <Calendar
                    id="end_date"
                    v-model="formattedEndDate"
                    dateFormat="yy-mm-dd"
                    :class="{'p-invalid': submitted && !localProgram.end_date}"
                    class="w-full"
                />
                <small v-if="submitted && !localProgram.end_date" class="p-error">End Date is required.</small>
            </div>
           
            <div>
                <label for="description" class="block font-bold mb-3">Deskripsi</label>
                <InputText
                    id="description"
                    v-model.trim="localProgram.description"
                    :class="{'p-invalid': submitted && !localProgram.description}"
                    class="w-full"
                />
                <small v-if="submitted && !localProgram.description" class="p-error">Deskripsi is required.</small>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveProgram" />
        </template>
    </Dialog>
</template>

<style scoped>
.w-full {
    width: 100%;
}
.p-error {
    color: #f44336;
}
</style>
