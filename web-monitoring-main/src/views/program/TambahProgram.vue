<script setup="setup">
import axios from 'axios';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save']);

const toast = useToast();
const submitted = ref(false);
const availableSectors = ref([]);

async function fetchSectors() {
    try {
        const response = await axios.get('/api/sectorUser');
        const sector = response.data.sector; // Ambil objek sector langsung
        if (sector) {
            localProgram.value.bidang = sector.id; // Setel bidang dari API
            localProgram.value.kepalabidang = sector.user.name || ''; // Setel kepala bidang jika ada
        }
        console.log('Data sektor dari API:', sector);
    } catch (error) {
        console.error('Gagal mengambil sektor:', error.message);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal memuat bidang.',
            life: 3000
        });
    }
}



onMounted(fetchSectors);

const localProgram = ref({
    program: '',
    startDate: '',
    endDate: '',

    bidang: '',
    kepalabidang: '',
    deskripsi: ''
});

const formattedStartDate = computed({
    get: () => localProgram.value.startDate,
    set: (value) => {
        const date = new Date(value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        localProgram.value.startDate = formattedDate;
    }
});

const formattedEndDate = computed({
    get: () => localProgram.value.endDate,
    set: (value) => {
        const date = new Date(value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        localProgram.value.endDate = formattedDate;
    }
});

watch(
    () => props.visible,
    (newVal) => {
        if (!newVal) {
            submitted.value = false;
            localProgram.value = {
                program: '',
                startDate: '',
                endDate: '',
                bidang: '',
                kepalabidang: '',
                deskripsi: ''
            };
        }
    }
);
watch(
    () => localProgram.value.bidang,
    (newVal) => {
        if (newVal) {
            // Cari sektor yang sesuai berdasarkan ID
            const selectedSector = availableSectors.value.find((sector) => sector.id === newVal);
            if (selectedSector && selectedSector.user) {
                // Tetapkan nama supervisor jika ada
                localProgram.value.kepalabidang = selectedSector.user.name || '';
            } else {
                // Jika tidak ada supervisor, kosongkan field
                localProgram.value.kepalabidang = '';
            }
        }
    }
);

function hideDialog() {
    emit('update:visible', false);
}

async function sendProgram() {
    const payload = {
        name: localProgram.value.program,
        sector_id: localProgram.value.bidang,
        description: localProgram.value.deskripsi,
        start_date: localProgram.value.startDate,
        end_date: localProgram.value.endDate
    };

    console.log("Payload yang dikirim:", payload); // Debugging

    try {
        const response = await axios.post('/api/program', payload);
        console.log('Response:', response.data);

        if (response.data && response.data.program) {
            const savedProgram = response.data.program;
            console.log('Program berhasil disimpan:', savedProgram);

            emit('save', savedProgram);
            emit('refresh');

            hideDialog();
        } else {
            throw new Error('Program tidak valid');
        }
    } catch (error) {
        console.error('Error Response:', error.response?.data || error.message);

        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menambahkan program.',
            life: 3000
        });
    }
}

function saveProgram() {
    submitted.value = true;

    // Validasi input
    if (
        typeof localProgram.value.program === 'string' &&
        localProgram.value.program.trim() &&
        localProgram.value.startDate &&
        localProgram.value.endDate &&
        typeof localProgram.value.bidang === 'string' &&
        localProgram.value.bidang.trim() &&
        typeof localProgram.value.deskripsi === 'string' &&
        localProgram.value.deskripsi.trim()
    ) {
        sendProgram();
    }
}
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" header="Tambah Program Kerja" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="program" class="block font-bold mb-3">Program Kerja</label>
                <InputText id="program" v-model.trim="localProgram.program" required="required" autofocus="autofocus" :class="{ 'p-invalid': submitted && !localProgram.program }" class="w-full" />
                <small v-if="submitted && !localProgram.program" class="p-error">Program is required.</small>
            </div>

            <div>
                <label for="startDate" class="block font-bold mb-3">Start Date</label>
                <Calendar id="startDate" v-model="formattedStartDate" dateFormat="dd-mm-yy" required="required" :class="{ 'p-invalid': submitted && !localProgram.startDate }" class="w-full" />
                <small v-if="submitted && !localProgram.startDate" class="p-error">Start Date is required.</small>
            </div>

            <div>
                <label for="endDate" class="block font-bold mb-3">End Date</label>
                <Calendar id="endDate" v-model="formattedEndDate" dateFormat="dd-mm-yy" required="required" :class="{ 'p-invalid': submitted && !localProgram.endDate }" class="w-full" />
                <small v-if="submitted && !localProgram.endDate" class="p-error">End Date is required.</small>
            </div>


            <div>
                <label for="Deskripsi" class="block font-bold mb-3">Deskripsi</label>
                <InputText id="deskripsi" v-model.trim="localProgram.deskripsi" required="required" :class="{ 'p-invalid': submitted && !localProgram.deskripsi }" class="w-full" />
                <small v-if="submitted && !localProgram.deskripsi" class="p-error">Deskripsi is required.</small>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveProgram" />
        </template>
    </Dialog>
</template>

<style scoped="scoped">
.field {
    margin-bottom: 1rem;
}
.w-full {
    width: 100%;
}
.p-error {
    color: #f44336;
}
</style>
