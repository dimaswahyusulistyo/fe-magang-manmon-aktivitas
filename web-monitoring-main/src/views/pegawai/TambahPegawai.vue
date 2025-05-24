<script setup="setup">
    import { defineEmits, defineProps, ref, watch } from 'vue';

    const props = defineProps(
        {visible: Boolean, employee: Object, submitted: Boolean}
    );

    const emit = defineEmits(['update:visible', 'save', 'hide']);

    const localEmployee = ref({
        ...props.employee
    });
    const employeeType = ref('asn');

    watch(() => props.employee, (newVal) => {
        localEmployee.value = {
            ...newVal
        };
    }, {deep: true});

    function hideDialog() {
        emit('hide');
    }

    function saveEmployee() {
        emit('save', localEmployee.value);
    }

    function onUpload(event) {}
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :style="{ width: '450px' }"
        header="Tambah Pegawai"
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
                    required="true"
                    autofocus="autofocus"
                    :invalid="submitted && !localEmployee.nama"
                    fluid="fluid"/>
                <small v-if="submitted && !localEmployee.nama" class="text-red-500">Nama is required.</small>
            </div>

            <div v-if="employeeType === 'asn'">
                <label for="nip" class="block font-bold mb-3">NIP</label>
                <InputText
                    id="nip"
                    v-model.trim="localEmployee.nip"
                    required="true"
                    fluid="fluid"/>
            </div>

            <div>
                <label for="jabatan" class="block font-bold mb-3">Jabatan</label>
                <InputText
                    id="jabatan"
                    v-model.trim="localEmployee.jabatan"
                    required="true"
                    fluid="fluid"/>
            </div>

            <div>
                <label for="bidang" class="block font-bold mb-3">Bidang</label>
                <InputText
                    id="bidang"
                    v-model.trim="localEmployee.bidang"
                    required="true"
                    fluid="fluid"/>
            </div>

            <div>
                <label for="email" class="block font-bold mb-3">Email</label>
                <InputText
                    id="email"
                    v-model.trim="localEmployee.email"
                    required="true"
                    fluid="fluid"/>
            </div>

            <div>
                <label for="alamat" class="block font-bold mb-3">Alamat</label>
                <InputText
                    id="alamat"
                    v-model.trim="localEmployee.alamat"
                    required="true"
                    fluid="fluid"/>
            </div>

            <div>
                <label for="tanggalLahir" class="block font-bold mb-3">Tanggal Lahir</label>
                <InputText
                    id="tanggalLahir"
                    v-model.trim="localEmployee.tanggalLahir"
                    required="true"
                    fluid="fluid"/>
            </div>

            <div>
                <label for="foto" class="block font-bold mb-3">Foto</label>
                <FileUpload
                    mode="basic"
                    name="foto"
                    url="/upload"
                    accept="image/*"
                    maxFileSize="1000000"
                    auto="auto"
                    customUpload="customUpload"
                    :onUpload="onUpload"/>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text="text" @click="hideDialog"/>
            <Button label="Save" icon="pi pi-check" @click="saveEmployee"/>
        </template>
    </Dialog>
</template>