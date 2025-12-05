    <template>
        <div>
            <div>
                <StudentCards />
            </div>
            <!-- Table -->
            <div class="bg-white rounded-lg hover:shadow-md duration-200 px-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Uploaded TORs</h3>

                <table class="min-w-full border border-slate-200 text-xs text-gray-700">
                    <thead class="bg-gray-100 text-gray-800">
                        <tr>
                            <th class="border border-slate-200 px-4 py-2 text-left">ID</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">File</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">Curriculum</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">Student ID</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">Uploaded By</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">Subjects</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">Status</th>
                            <th class="border border-slate-200 px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="tor in paginatedTors" :key="tor.id" class="hover:bg-gray-50">
                            <td class="border border-slate-200 px-4 py-2">{{ tor.id }}</td>
                            <td class="border border-slate-200 px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                                @click="openImage(tor.file_path)">
                                {{ tor.file_path ? 'Show File' : 'Invalid' }}
                            </td>
                            <td class="border border-slate-200 px-4 py-2">
                                {{ tor.curriculum?.course?.name || 'N/A' }}
                            </td>
                            <td class="border border-slate-200 px-4 py-2">
                                {{ tor.user.student_id ?? '__' }}
                            </td>
                            <td class="border border-slate-200 px-4 py-2">
                                {{ tor.user?.first_name }} {{ tor.user?.last_name }}
                            </td>

                            <td class="border border-slate-200 px-4 py-2">
                                <span :class="{
                                    'px-2 py-1 rounded-full text-white text-xs font-semibold': true,
                                    'bg-gray-400': tor.status === 'submitted',
                                    'bg-blue-500': tor.status === 'processing',
                                    'bg-yellow-400 text-gray-800': tor.status === 'advising',
                                    'bg-green-500': tor.status === 'done' || tor.status === 'approved',
                                    'bg-red-500': tor.status === 'rejected' || tor.status === 'failed'
                                }">
                                    {{ tor.status }}
                                </span>
                            </td>
                            <td class="border border-slate-200 px-4 py-2 space-x-2">
                                <button @click="router.push({ path: '/student/view-tor', query: { tor: tor.id } })"
                                    class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- Pagination -->
                <div class="flex justify-end items-center mt-4 space-x-2">
                    <button :disabled="currentPage === 1" @click="currentPage--"
                        class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                        Prev
                    </button>
                    <span class="px-2 text-xs text-gray-600">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>
                    <button :disabled="currentPage === totalPages" @click="currentPage++"
                        class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </template>

    <script setup>
    import { ref, onMounted, computed } from 'vue';
    import { fetchMyTors } from '@/services/apiService';
    import { useRouter } from 'vue-router';
    import StudentCards from '@/components/StudentCards.vue';

    const router = useRouter();

    const isloading = ref(false)

    const torsData = ref([])

    const currentPage = ref(1)
    const perPage = 5

    // Pagination
    const totalPages = computed(() => Math.ceil(torsData.value.length / perPage))
    const paginatedTors = computed(() => {
        const start = (currentPage.value - 1) * perPage
        return torsData.value.slice(start, start + perPage)
    })

    // Fetch Data
    const getUploadedTor = async () => {
        isloading.value = true

        try {
            const response = await fetchMyTors()
            torsData.value = response        // ⚠️ ONLY SHOW submitted, approved, rejected
        torsData.value = response.filter(tor =>
            ['submitted', 'approved', 'rejected'].includes(tor.status))
        } catch (error) {
            console.error('Error fetching uploaded TOR:', error)
        } finally {
            isloading.value = false
        }
    };

    onMounted(() => {
        getUploadedTor()
    });

    </script>