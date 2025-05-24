<script setup="setup">
    function smoothScroll(id) {
        document
            .body
            .click();
        document
            .querySelector(id)
            .scrollIntoView({behavior: 'smooth'});
    }
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div
                class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
                <a class="flex items-center" href="#">
                    <div
                        class="flex justify-center items-center"
                        style="height: 50px; width: auto;">
                        <img
                            src="/favicon-1.png"
                            alt="Logo"
                            style="height: 100%; width: 100%; object-fit: contain;"></div>
                        <span
                            class="text-surface-900 dark:text-surface-0 font-medium text-2xl leading-normal mr-20"></span>
                    </a>

                    <Button
                        class="lg:!hidden"
                        text="text"
                        severity="secondary"
                        rounded="rounded"
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }">
                        <i class="pi pi-bars !text-2xl"></i>
                    </Button>
                    <div
                        class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border">
                        <ul
                            class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
                            <li>
                                <a
                                    @click="smoothScroll('#hero')"
                                    class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                                    <span>Home</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    @click="smoothScroll('#features')"
                                    class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                                    <span>Features</span>
                                </a>
                            </li>
                        </ul>
                        <div
                            class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2">
                            <Button
                                label="Login"
                                text="text"
                                as="router-link"
                                to="/auth/login"
                                rounded="rounded"></Button>
                        </div>
                    </div>
                </div>

                <div
                    class="relative flex items-center justify-center overflow-hidden"
                    :style="{
                background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 400% at 77.36% 40%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%)',
                clipPath: 'ellipse(150% 50% at 50% 30%)',
                height: '100vh'
                }">
                    <div
                        class="absolute inset-0 bg-cover bg-center opacity-15"
                        :style="{
                        backgroundImage: 'url(/karanganyar-9.jpg)',
                        filter: 'blur(5px)'
                    }"/>
                    <div class="relative z-10 text-center">
                        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                            <span class="font-light block">Monitoring</span>
                            Program & Kegiatan
                        </h1>
                        <p class="font-normal text-xl md:text-2xl leading-normal md:mt-4 text-gray-700">
                            Fitur-fitur yang mendukung pengelolaan program dan kegiatan pegawai.
                        </p>
                        <Button
                            label="Get Started"
                            as="router-link"
                            to="/"
                            rounded="rounded"
                            class="!text-xl mt-8 !px-4"></Button>
                    </div>
                </div>

                <div id="features" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20">
                    <div class="grid grid-cols-12 gap-4 justify-center">
                        <div class="col-span-12 text-center mt-20 mb-6">
                            <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Fitur Aplikasi</div>
                            <span class="text-muted-color text-2xl">Fitur-fitur yang mempermudah monitoring kegiatan dan program pemerintah daerah.</span>
                        </div>

                        <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
                            <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                                <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
                                    <div class="flex items-center justify-center bg-blue-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                        <i class="pi pi-fw pi-eye !text-2xl text-blue-700"></i>
                                    </div>
                                    <h5 class="mb-2 text-surface-900 dark:text-surface-0">Pemantauan Progres Kegiatan</h5>
                                    <span class="text-surface-600 dark:text-surface-200">Melacak dan memantau progres setiap kegiatan dari tahap perencanaan hingga pelaporan akhir.</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
                            <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))">
                                <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
                                    <div class="flex items-center justify-center bg-green-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                        <i class="pi pi-fw pi-chart-line !text-2xl text-green-700"></i>
                                    </div>
                                    <h5 class="mb-2 text-surface-900 dark:text-surface-0">Evaluasi Program</h5>
                                    <span class="text-surface-600 dark:text-surface-200">Menyediakan analisis dan evaluasi terhadap program yang berjalan untuk meningkatkan efektivitas kegiatan.</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pb-8 mt-6 lg:mt-0">
                            <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                                <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
                                    <div class="flex items-center justify-center bg-orange-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                        <i class="pi pi-fw pi-folder-open !text-2xl text-orange-700"></i>
                                    </div>
                                    <h5 class="mb-2 text-surface-900 dark:text-surface-0">Laporan Real-Time</h5>
                                    <span class="text-surface-600 dark:text-surface-200">Menampilkan laporan perkembangan kegiatan dan program secara real-time untuk setiap pengguna.</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
                            <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(172, 180, 223, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(246, 158, 188, 0.2))">
                                <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
                                    <div class="flex items-center justify-center bg-purple-200" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                        <i class="pi pi-fw pi-users !text-2xl text-purple-700"></i>
                                    </div>
                                    <h5 class="mb-2 text-surface-900 dark:text-surface-0">Manajemen Tim</h5>
                                    <span class="text-surface-600 dark:text-surface-200">Mengatur anggota tim yang terlibat dalam setiap kegiatan serta mengelola peran dan tanggung jawab.</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pb-8 mt-6 lg:mt-0">
                            <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(162, 222, 208, 0.2), rgba(173, 194, 230, 0.2)), linear-gradient(180deg, rgba(231, 248, 249, 0.2), rgba(194, 229, 232, 0.2))">
                                <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
                                    <div class="flex items-center justify-center bg-blue-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                        <i class="pi pi-fw pi-calendar !text-2xl text-blue-700"></i>
                                    </div>
                                    <h5 class="mb-2 text-surface-900 dark:text-surface-0">Jadwal dan Tahapan Kegiatan</h5>
                                    <span class="text-surface-600 dark:text-surface-200">Mengelola jadwal pelaksanaan kegiatan, memonitor setiap tahapan, dan memastikan penyelesaian sesuai tenggat waktu.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="py-6 px-6 mx-0 mt-20 lg:mx-20">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-2">
                        <a @click="smoothScroll('#home')" class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-4 cursor-pointer">
                            <div class="flex justify-center mb-4" style="height: 30px; width: 30px;">
                                <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: cover;">
                            </div>
                            <h4 class="font-medium text-3xl text-surface-900 dark:text-surface-0"></h4>
                        </a>
                    </div>

                    <div class="col-span-12 md:col-span-10">
                        <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                            <!-- Company Section -->
                            <div class="col-span-12 md:col-span-3">
                                <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Company</h4>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">About Us</a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">News</a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Investor Relations</a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Careers</a>
                                <a class="leading-normal text-xl block cursor-pointer text-surface-700 dark:text-surface-100">Media Kit</a>
                            </div>

                            <!-- Resources Section -->
                            <div class="col-span-12 md:col-span-3">
                                <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Resources</h4>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Get Started</a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Learn</a>
                                <a class="leading-normal text-xl block cursor-pointer text-surface-700 dark:text-surface-100">Case Studies</a>
                            </div>

                            <!-- Community Section -->
                            <div class="col-span-12 md:col-span-3">
                                <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Community</h4>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Discord</a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Events <img src="" class="ml-2" /></a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">FAQ</a>
                                <a class="leading-normal text-xl block cursor-pointer text-surface-700 dark:text-surface-100">Blog</a>
                            </div>

                            <!-- Legal Section -->
                            <div class="col-span-12 md:col-span-3">
                                <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Legal</h4>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Brand Policy</a>
                                <a class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Privacy Policy</a>
                                <a class="leading-normal text-xl block cursor-pointer text-surface-700 dark:text-surface-100">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="layout-footer">
                    Monitoring by
                    <a href="" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">© 2025  Dinas Kominfo Karanganyar with D3TI SV UNS</a>
                </div>
            </div>
        </div>
    </div>
        </template>

        <style scoped="scoped">
            ::-webkit-scrollbar {
                width: 10px;
            }

            ::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            ::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 5px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

            ::-webkit-scrollbar-button:single-button:decrement {
                background-color: #f1f1f1;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #333;
                font-size: 10px;
                height: 20px;
                content: '▲';
            }

            ::-webkit-scrollbar-button:single-button:increment {
                background-color: #f1f1f1;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #333;
                font-size: 10px;
                height: 20px;
                content: '▼';
            }

            .landing-wrapper {
                overflow-y: auto;
                max-height: 100vh;
            }
        </style>