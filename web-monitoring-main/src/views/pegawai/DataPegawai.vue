<script setup="setup">
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import DetailPegawai from './DetailPegawai.vue';

    const toast = useToast();
    const dt = ref();
    const employees = ref([]);
    const fetchUser = async () => {
    try {
        // Request ke API Laravel
        const response = await axios.get('/api/user');
        employees.value = response.data.users.map((employee, index) => ({
            ...employee,
            no: index + 1
        }));
    } catch (error) {
        // Jika terjadi error saat fetching data
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch employees data', life: 3000 });
        console.error('Error fetching tasks:', error);
    }
};
    onMounted(()=>{
        fetchUser();
    });


    const nextId = ref(employees.value.length + 1);
    const tambahPegawaiDialog = ref(false);
    const editPegawaiDialog = ref(false);
    const deleteEmployeeDialog = ref(false);
    const detailPegawaiDialog = ref(false);
    const employee = ref({});
    const selectedEmployees = ref();
    const filters = ref({
        global: {
            value: null,
            matchMode: 'contains'
        }
    });
    const submitted = ref(false);

    function viewDetailPegawai(emp) {
    console.log("Opening Detail Dialog for Employee:", emp);
    employee.value = { ...emp };
    detailPegawaiDialog.value = true;
    console.log("Dialog Visible State:", detailPegawaiDialog.value);
    }

    function saveEmployee(updatedEmployee) {
        submitted.value = true;

        if (
            updatedEmployee
                ?.nama
                    ?.trim()
        ) {
            if (updatedEmployee.id) {
                const index = employees
                    .value
                    .findIndex(e => e.id === updatedEmployee.id);
                if (index !== -1) {
                    employees.value[index] = updatedEmployee;
                }
                toast.add(
                    {severity: 'success', summary: 'Successful', detail: 'Pegawai Updated', life: 3000}
                );
            } else {
                updatedEmployee.id = nextId.value++;
                employees
                    .value
                    .push(updatedEmployee);
                toast.add(
                    {severity: 'success', summary: 'Successful', detail: 'Pegawai Created', life: 3000}
                );
            }

            tambahPegawaiDialog.value = false;
            editPegawaiDialog.value = false;
            employee.value = {};
        }
    }

    function deleteEmployee() {
        employees.value = employees
            .value
            .filter((val) => val.id !== employee.value.id);
        deleteEmployeeDialog.value = false;
        employee.value = {};
        toast.add(
            {severity: 'success', summary: 'Successful', detail: 'Pegawai Deleted', life: 3000}
        );
    }

    function exportEmployees() {
        const csvContent = [
            [
                "NO", "NAMA", "NIP", "JABATAN", "BIDANG"
            ],
            ...employees
                .value
                .map(emp => [emp.no, emp.name, emp.nip, emp.occupation.name, emp.occupation.sector.name]) // Data rows
        ]
            .map(e => e.join(";"))
            .join("\n");

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'employees.csv');
        document
            .body
            .appendChild(link);
        link.click();
        document
            .body
            .removeChild(link);
    }
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <h4 class="m-0">
                        <b>DATA PEGAWAI</b>
                    </h4>
                </template>
                <template #end>
                    <div class="flex items-center gap-4">
                        <span class="p-input-icon-left">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search"/>
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..."/>
                            </IconField>
                        </span>
                        <Button
                            class="p-button-rounded !text-sm !px-4 !py-2"
                            label="Export"
                            icon="pi pi-upload"
                            severity="warning"
                            @click="exportEmployees"
                            :style="{ backgroundColor: 'gold', borderColor: 'gold', color: 'white' }"/>
                    </div>
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedEmployees"
                :value="employees"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pegawai">
                <Column field="no" header="NO"></Column>
                <Column field="name" header="NAMA" sortable="sortable"></Column>
                <Column field="nip" header="NIP" sortable="sortable"></Column>
                <Column field="occupation.name" header="JABATAN" sortable="sortable"></Column>
                <Column field="occupation.sector.name" header="BIDANG" sortable="sortable"></Column>
                <Column header="AKSI">
                    <template #body="slotProps">
                        <Button
                            icon="pi pi-eye"
                            outlined="outlined"
                            rounded="rounded"
                            class="mr-2 blue-btn p-tag-info"
                            severity="info"
                            :style="{color:'blue', borderColor: 'blue'}"
                            @click="viewDetailPegawai(slotProps.data)"/>
                    </template>
                </Column>
            </DataTable>
        </div>

        <DetailPegawai
            :visible="detailPegawaiDialog"
            @update:visible="detailPegawaiDialog = $event"
            :employee="employee"/>

        <Dialog
            v-model:visible="deleteEmployeeDialog"
            :style="{ width: '450px' }"
            header="Confirm"
            :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl"/>
                <span v-if="employee">Are you sure you want to delete
                    <b>{{ employee.nama }}</b>?</span>
            </div>
            <template #footer>
                <Button
                    label="No"
                    icon="pi pi-times"
                    text="text"
                    @click="deleteEmployeeDialog = false"/>
                <Button label="Yes" icon="pi pi-check" @click="deleteEmployee"/>
            </template>
        </Dialog>
    </div>
</template>