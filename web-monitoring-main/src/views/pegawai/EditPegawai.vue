<script setup="setup">
    import { useToast } from 'primevue/usetoast';
import { defineEmits, defineProps, ref, watch } from 'vue';

    const toast = useToast();

    const props = defineProps(
        {visible: Boolean, employee: Object, submitted: Boolean}
    );

    const emit = defineEmits(['update:visible', 'save', 'hide']);

    const localEmployee = ref({
        ...props.employee
    });
    const employeeType = ref('asn'); // Default untuk ASN

    watch(() => props.employee, (newVal) => {
        localEmployee.value = {
            ...newVal
        };
    }, {deep: true});

    function onHide() {
        emit('hide');
    }

    function onSave() {
        emit('save', localEmployee.value);
    }

    function onUpload(event) {
        const [file] = event.files;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            localEmployee.value.foto = reader.result;
            toast.add(
                {severity: 'success', summary: 'Success', detail: 'File uploaded', life: 3000}
            );
        };
    }
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :style="{ width: '450px' }"
        header="Edit Pegawai"
        :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label class="block font-bold mb-3">Tipe Pegawai</label>
                <div class="flex gap-4">
                    <div>
                        <input type="radio" id="asn" value="asn" v-model="employeeType"/>
                        <label for="asn" class="ml-2">ASN</label>
                    </div>
                    <div>
                        <input type="radio" id="non-asn" value="non-asn" v-model="employeeType"/>
                        <label for="non-asn" class="ml-2">Non ASN</label>
                    </div>
                </div>
            </div>

            <div>
                <label for="nama" class="block font-bold mb-3">Nama</label>
                <InputText
                    id="nama"
                    v-model.trim="localEmployee.nama"
                    required="required"
                    autofocus="autofocus"
                    :class="{'p-invalid': submitted && !localEmployee.nama}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.nama">Nama is required.</small>
            </div>

            <div v-if="employeeType === 'asn'">
                <label for="nip" class="block font-bold mb-3">NIP</label>
                <InputText
                    id="nip"
                    v-model.trim="localEmployee.nip"
                    required="required"
                    :class="{'p-invalid': submitted && !localEmployee.nip}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.nip">NIP is required.</small>
            </div>

            <div>
                <label for="jabatan" class="block font-bold mb-3">Jabatan</label>
                <InputText
                    id="jabatan"
                    v-model.trim="localEmployee.jabatan"
                    required="required"
                    :class="{'p-invalid': submitted && !localEmployee.jabatan}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.jabatan">Jabatan is required.</small>
            </div>

            <div>
                <label for="bidang" class="block font-bold mb-3">Bidang</label>
                <InputText
                    id="bidang"
                    v-model.trim="localEmployee.bidang"
                    required="required"
                    :class="{'p-invalid': submitted && !localEmployee.bidang}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.bidang">Bidang is required.</small>
            </div>

            <div>
                <label for="email" class="block font-bold mb-3">Email</label>
                <InputText
                    id="email"
                    v-model.trim="localEmployee.email"
                    required="required"
                    :class="{'p-invalid': submitted && !localEmployee.email}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.email">Email is required.</small>
            </div>

            <div>
                <label for="alamat" class="block font-bold mb-3">Alamat</label>
                <Textarea
                    id="alamat"
                    v-model.trim="localEmployee.alamat"
                    rows="3"
                    required="required"
                    :class="{'p-invalid': submitted && !localEmployee.alamat}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.alamat">Alamat is required.</small>
            </div>

            <div>
                <label for="tanggalLahir" class="block font-bold mb-3">Tanggal Lahir</label>
                <Calendar
                    id="tanggalLahir"
                    v-model="localEmployee.tanggalLahir"
                    dateFormat="dd/mm/yy"
                    :showIcon="true"
                    required="required"
                    :class="{'p-invalid': submitted && !localEmployee.tanggalLahir}"
                    fluid="fluid"/>
                <small class="p-error" v-if="submitted && !localEmployee.tanggalLahir">Tanggal Lahir is required.</small>
            </div>

            <div>
                <label for="foto" class="block font-bold mb-3">Foto</label>
                <FileUpload
                    mode="basic"
                    name="foto"
                    url="/api/upload"
                    accept="image/*"
                    :maxFileSize="1000000"
                    @upload="onUpload"
                    :auto="true"
                    class="w-full"/>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="onHide"/>
            <Button label="Save" icon="pi pi-check" @click="onSave"/>
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
</style>