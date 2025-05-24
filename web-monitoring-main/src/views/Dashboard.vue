<script setup="setup">
    import { useLayout } from '@/layout/composables/layout';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/vue3';
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';


    console.log ('lokal', localStorage);

    const router = useRouter();
    const userCount = ref(0);
    const programCount = ref(0);
    const inProgressCount = ref(0);
    const endedCount = ref(0);
    

    const programCountSector=ref(0);
    const inProgressCountSector=ref(0);
    const endedCountSector = ref(0);

    const programCountUser=ref(0);
    const inProgressCountUser=ref(0);
    const endedCountUser= ref(0);

    const userRole = localStorage.getItem('role');

    const inProgressValue = computed(() => {
    if (userRole === 'admin') {
        return inProgressCount.value;
    } else if (userRole === 'supervisor') {
        return inProgressCountSector.value;
    } else if (userRole === 'user') {
        return inProgressCountUser.value;
    }
});

function calculateProgress(completed, total) {
        if (!total || total === 0) return 0; 
        return Math.round((completed / total) * 100);
    }

const programCountValue = computed(() => {
    if (userRole === 'admin') {
        return programCount.value;
    } else if (userRole === 'supervisor') {
        return programCountSector.value;
    } else if (userRole === 'user') {
        return programCountUser.value;
    }
});

const programEndedValue = computed(() => {
    if (userRole === 'admin') {
        return endedCount.value;
    } else if (userRole === 'supervisor') {
        return endedCountSector.value;
    } else if (userRole === 'user') {
        return endedCountUser.value;
    }
});

// ADMIN
if (userRole === 'admin') {
    onMounted(async () => {
        try {
            const response = await axios.get('/api/user/count');
            userCount.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah pegawai:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/program/in-progress/count');
            inProgressCount.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program in-progress:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/program/count');
            programCount.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/program/ended/count');
            endedCount.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program selesai:', error);
        }
    });
}

// SUPERVISOR
if (userRole === 'supervisor') {
    onMounted(async () => {
        try {
            const response = await axios.get('/api/program/in-progress/sector');
            inProgressCountSector.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program progress dalam sector:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/program/count/sector');
            programCountSector.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program dalam sector:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/program/ended/count/sector');
            endedCountSector.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program selesai:', error);
        }
    });
}

// USER
if (userRole === 'user') {
    onMounted(async () => {
        try {
            const response = await axios.get('/api/user/program/in-progress');
            inProgressCountUser.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program progress user:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/count/program');
            programCountUser.value = response.data.countProgram;
        } catch (error) {
            console.error('Gagal mengambil jumlah program user:', error);
        }
    });

    onMounted(async () => {
        try {
            const response = await axios.get('/api/user/program/ended');
            endedCountUser.value = response.data.count;
        } catch (error) {
            console.error('Gagal mengambil jumlah program selesai:', error);
        }
    });
}



    const programs = ref([]);

    const fetchPrograms = async () => {
        try {
            const userRole = localStorage.getItem('role');
            
            let apiUrl = '/api/program/upcoming'; 

            if (userRole === 'admin') {
                apiUrl = '/api/program/upcoming'; 
            } else if (userRole === 'user') {
                apiUrl = '/api/user/program/upcoming'; 
            } else if (userRole === 'supervisor') {
                apiUrl = '/api/program/upcoming/sector'; 
            }
            const response = await axios.get(apiUrl);
            programs.value = response
                .data
                .programs
                .map((program, index) => ({
                    ...program,
                    no: index + 1
                }));
                console.log('data program upcoming dari api :', programs);
        } catch (error) {
            // Jika terjadi error saat fetching data
            toast.add(
                {severity: 'error', summary: 'Error', detail: 'Failed to fetch programs', life: 3000}
            );
            console.error('Error fetching programs:', error);
        }
    };
    onMounted(() => {
        fetchPrograms();
    });
    const activities = ref([]);

    const fetchTasks = async () => {
        try {
            const userRole = localStorage.getItem('role');
            
            let apiUrl = ''; 

            if (userRole === 'admin') {
                apiUrl = '/api/task/upcoming'; 
            } else if (userRole === 'user') {
                apiUrl = '/api/user/task/upcoming'; 
            } else if (userRole === 'supervisor') {
                apiUrl = '/api/task/sector/upcoming'; 
            }
            const response = await axios.get(apiUrl);
            activities.value = response
                .data
                .tasks
                .map((task, index) => ({
                    ...task,
                    no: index + 1
                }));
        } catch (error) {
            // Jika terjadi error saat fetching data
            toast.add(
                {severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks', life: 3000}
            );
            console.error('Error fetching tasks:', error);
        }
    };
    onMounted(() => {
        fetchTasks();
        fetchCalendarEvents();
    });

    const {getPrimary, getSurface, isDarkTheme} = useLayout();

    const chartData = ref(null);
    const chartOptions = ref(null);

    const items = ref([
        {
            label: 'Add New',
            icon: 'pi pi-fw pi-plus'
        }, {
            label: 'Remove',
            icon: 'pi pi-fw pi-trash'
        }
    ]);

    function setChartData() {
        const documentStyle = getComputedStyle(document.documentElement);

        return {
            labels: [
                'Q1', 'Q2', 'Q3', 'Q4'
            ],
            datasets: [
                {
                    type: 'bar',
                    label: 'Subscriptions',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: [
                        4000, 10000, 15000, 4000
                    ],
                    barThickness: 32
                }, {
                    type: 'bar',
                    label: 'Advertising',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    data: [
                        2100, 8400, 2400, 7500
                    ],
                    barThickness: 32
                }, {
                    type: 'bar',
                    label: 'Affiliate',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: [
                        4100, 5200, 3400, 7400
                    ],
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8
                    },
                    borderSkipped: true,
                    barThickness: 32
                }
            ]
        };
    }

    const calendarOptions = ref({
        plugins: [dayGridPlugin],
        initialView: "dayGridMonth",
        events: [], 
        eventRender: (info) => {
            const titleElement = info.el.querySelector('.fc-event-title');
            if (titleElement) {
                titleElement.style.whiteSpace = 'normal';
                titleElement.style.wordWrap = 'break-word';
                titleElement.style.overflow = 'visible';
            }
        },
        eventClick: (info) => {
            const taskId = info.event.id;
            navigateToDetailPage(taskId);
        }
    });

    function navigateToDetailPage(taskId) {
    router.push({ path: '/DetailKegiatan', query: { id: taskId } });
}

const fetchCalendarEvents = async () => {
    try {
        let taskResponse;
        if (typeof userRole === 'undefined') {
            throw new Error('userRole tidak terdefinisi');
        }

        if (userRole === 'admin') {
            taskResponse = await axios.get('/api/task');
        } else if (userRole === 'supervisor') {
            taskResponse = await axios.get('/api/task/sector');
        } else if (userRole === 'user') {
            taskResponse = await axios.get('/api/user/task')
        } else {
            throw new Error('Role tidak dikenali');
        }

        console.log('taskrespon:', taskResponse);
        const tasks = taskResponse
            .data  
            .tasks
            .map(
                (task) => ({id: task.id, title: `Kegiatan: ${task.name}`, start: task.date, end: task.date, color: "rgba(76, 175, 80, 0.6)"})
            );

        calendarOptions.value.events = [...tasks];
        console.log('Events for calendar:', calendarOptions.value.events);
    } catch (error) {
        console.error('Error fetching calendar events:', error);
    }
};


    onMounted(async () => {
        try {
            const [userResponse, programResponse, inProgressResponse, endedResponse] = await Promise.all(
                [axios.get('/api/user/count'), axios.get('/api/program/count'), axios.get('/api/program/in-progress/count'), axios.get('/api/program/ended/count')]
            );
            userCount.value = userResponse.data.count;
            programCount.value = programResponse.data.count;
            inProgressCount.value = inProgressResponse.data.count;
            endedCount.value = endedResponse.data.count;
        } catch (error) {
            console.error('Error fetching counts:', error);
        }

        await fetchPrograms();
        await fetchTasks();
        await fetchCalendarEvents();
    });

    function setChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        return {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    watch([
        getPrimary, getSurface, isDarkTheme
    ], () => {
        chartData.value = setChartData();
        chartOptions.value = setChartOptions();
    });
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Jumlah Program</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ programCountValue }}</div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-folder-open text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ programCountValue }}
                </span>
                <span class="text-muted-color">
                    total program</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Program Dalam Pengerjaan</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ inProgressValue }}</div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-spinner text-yellow-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ inProgressValue }}
                </span>
                <span class="text-muted-color">
                    sedang dalam pengerjaan</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Program Terselesaikan</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ programEndedValue }}</div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-circle text-green-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ programEndedValue }}
                </span>
                <span class="text-muted-color">
                    program terselesaikan</span>
            </div>
        </div>

        <div v-if="userRole === 'admin'" class="col-span-12 lg:col-span-6 xl:col-span-3" >
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Jumlah Pegawai</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ userCount }}</div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ userCount }}</span>
                <span class="text-muted-color">
                    pegawai aktif</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Program Terdekat</div>
                <DataTable
                    ref="dt"
                    v-model:selection="selectedProducts"
                    :value="programs"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} programs">

                    <Column field="no" header="NO" sortable="sortable"></Column>
                    <Column field="name" header="PROGRAM" sortable="sortable"></Column>
                    <Column field="start_date" header="TANGGAL MULAI" sortable="sortable"></Column>
                    <Column field="end_date" header="TANGGAL BERAKHIR" sortable="sortable"></Column>
                    <Column  v-if="userRole === 'admin' || userRole === 'supervisor'" header="KEGIATAN">
                        <template #body="slotProps">
                            {{ slotProps.data.tasks.map(task => task.name).join(', ') }}
                        </template>
                    </Column>
                    <Column  v-if="userRole === 'admin' " header="AKSI">
                        <template #body="slotProps">
                            <Button
                                icon="pi pi-pencil"
                                outlined="outlined"
                                rounded="rounded"
                                class="mr-2"
                                @click="editProduct(slotProps.data)"/>
                            <Button
                                icon="pi pi-trash"
                                outlined="outlined"
                                rounded="rounded"
                                severity="danger"
                                @click="confirmDeleteProduct(slotProps.data)"/>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Kegiatan Terdekat</div>
                <DataTable
                    ref="dt"
                    v-model:selection="selectedActivities"
                    :value="activities"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kegiatan">
                    <Column field="no" header="NO" sortable="sortable"></Column>
                    <Column field="name" header="KEGIATAN" sortable="sortable"></Column>
                    <Column field="date" header="TANGGAL" sortable="sortable"></Column>
                    <Column field="location" header="TEMPAT" sortable="sortable"></Column>
                    <Column  v-if="userRole === 'admin' || userRole === 'supervisor'" header="ANGGOTA">
                        <template #body="slotProps">
                            <!-- Menampilkan semua nama tasks yang terkait sebagai daftar -->
                            {{ slotProps.data.users.map(user => user.name).join(', ') }}
                        </template>
                    </Column>
                    <Column  v-if="userRole === 'admin'" header="AKSI">
                        <template #body="slotProps">
                            <Button
                                icon="pi pi-pencil"
                                outlined="outlined"
                                rounded="rounded"
                                class="mr-2"
                                @click="editActivity(slotProps.data)"/>
                            <Button
                                icon="pi pi-trash"
                                outlined="outlined"
                                rounded="rounded"
                                severity="danger"
                                @click="confirmDeleteActivity(slotProps.data)"/>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-50">
            <div class="card">
                <FullCalendar :options="calendarOptions"/>
            </div>
        </div>
    </div>
</template>

<style scoped="scoped">
    .card {
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background-color: var(--surface-card);
    }
    .text-muted-color {
        color: var(--text-color-secondary);
    }
    .text-primary {
        color: var(--p-primary-500);
    }
    .text-surface-900 {
        color: var(--text-color);
    }
    .text-surface-700 {
        color: var(--text-color-secondary);
    }
    .text-surface-0 {
        color: white;
    }
    .fc-event-title {
        white-space: normal;
        word-wrap: break-word;
        overflow: visible;
        font-size: 12px;
    }
</style>