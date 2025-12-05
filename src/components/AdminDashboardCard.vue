<template>
    <div class="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <!-- Header -->
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-800">🧑‍💼 Admin Dashboard</h1>
            <p class="text-gray-500 mt-1">Overview of student enrollment statistics</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-20 text-gray-500">
            <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p>Loading admin dashboard data...</p>
        </div>

        <!-- Dashboard Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <!-- Enrolled -->
            <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">Enrolled Students</p>
                        <h2 class="text-4xl font-bold text-green-600 mt-2">{{ stats.enrolled || 0 }}</h2>
                    </div>
                    <div class="p-3 bg-green-100 rounded-full text-green-600">
                        <GraduationCap class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- Pending -->
            <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">Pending Students</p>
                        <h2 class="text-4xl font-bold text-yellow-600 mt-2">{{ stats.pending || 0 }}</h2>
                    </div>
                    <div class="p-3 bg-yellow-100 rounded-full text-yellow-600">
                        <Clock class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- Transferee -->
            <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">Transferees</p>
                        <h2 class="text-4xl font-bold text-blue-600 mt-2">{{ stats.transferee || 0 }}</h2>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full text-blue-600">
                        <ArrowRightLeft class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- Shiftee -->
            <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">Shiftees</p>
                        <h2 class="text-4xl font-bold text-purple-600 mt-2">{{ stats.shiftee || 0 }}</h2>
                    </div>
                    <div class="p-3 bg-purple-100 rounded-full text-purple-600">
                        <Repeat class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- New Students -->
            <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-500">New Students</p>
                        <h2 class="text-4xl font-bold text-pink-600 mt-2">{{ stats.new || 0 }}</h2>
                    </div>
                    <div class="p-3 bg-pink-100 rounded-full text-pink-600">
                        <UserPlus class="w-7 h-7" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary -->
        <div v-if="!loading" class="mt-10 bg-white shadow rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart3 class="w-5 h-5 text-blue-600" />
                Enrollment Summary
            </h3>
            <div class="grid sm:grid-cols-2 gap-6">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Enrolled Ratio</p>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            class="bg-green-500 h-3 transition-all duration-500"
                            :style="{ width: enrolledRate + '%' }"
                        ></div>
                    </div>
                    <p class="text-sm mt-1 text-gray-500">{{ enrolledRate.toFixed(1) }}% of all students are enrolled</p>
                </div>

                <div>
                    <p class="text-sm text-gray-600 mb-1">Pending Ratio</p>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            class="bg-yellow-500 h-3 transition-all duration-500"
                            :style="{ width: pendingRate + '%' }"
                        ></div>
                    </div>
                    <p class="text-sm mt-1 text-gray-500">{{ pendingRate.toFixed(1) }}% still pending enrollment</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    GraduationCap,
    Clock,
    ArrowRightLeft,
    Repeat,
    UserPlus,
    BarChart3,
} from 'lucide-vue-next'
import { fetchAdminSummary } from '@/services/apiService'

const stats = ref({
    enrolled: 0,
    pending: 0,
    transferee: 0,
    shiftee: 0,
    new: 0,
})
const loading = ref(true)

const fetchStats = async () => {
    try {
        const data  = await fetchAdminSummary()
        console.log(data)
        stats.value = data || {}
    } catch (err) {
        console.error('Admin dashboard fetch error:', err)
    } finally {
        loading.value = false
    }
}

// Computed percentages
const total = computed(() =>
    stats.value.enrolled + stats.value.pending + stats.value.transferee + stats.value.shiftee + stats.value.new
)

const enrolledRate = computed(() => (total.value ? (stats.value.enrolled / total.value) * 100 : 0))
const pendingRate = computed(() => (total.value ? (stats.value.pending / total.value) * 100 : 0))

onMounted(fetchStats)
</script>
