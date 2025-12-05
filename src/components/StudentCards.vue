<template>
    <div class="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <!-- Header -->
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-800">🎓 Student Dashboard</h1>
            <p class="text-gray-500 mt-1">Overview of your academic progress</p>
        </div>

        <!-- Not Enrolled Placeholder -->
        <div v-if="authStore.user.other_info?.status !== 'enrolled'" class="text-center py-10">
            <div class="bg-white shadow-md rounded-2xl p-8 inline-block">
                <div class="text-red-500 mb-4">
                    <GraduationCap class="w-16 h-16 mx-auto opacity-80" />
                </div>
                <h2 class="text-xl font-semibold text-gray-700 mb-2">Not Enrolled</h2>
                <p class="text-gray-500">
                    You are currently not enrolled this semester. Please process your enrollment.
                </p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="text-center text-gray-500 py-20">
            <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3">
            </div>
            <p>Loading dashboard data...</p>
        </div>

        <!-- Stats Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Subjects -->
            <div
                class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">Total Subjects</p>
                        <h2 class="text-4xl font-bold text-blue-600 mt-2">
                            {{ stats.totalSubjects || 0 }}
                        </h2>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full text-blue-600">
                        <BookOpen class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- Completed Subjects -->
            <div
                class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">Completed Subjects</p>
                        <h2 class="text-4xl font-bold text-green-600 mt-2">
                            {{ stats.completedSubjects || 0 }}
                        </h2>
                    </div>
                    <div class="p-3 bg-green-100 rounded-full text-green-600">
                        <CheckCircle2 class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- Enrolled Subjects -->
            <div
                class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">Enrolled Subjects</p>
                        <h2 class="text-4xl font-bold text-yellow-600 mt-2">
                            {{ stats.enrolled_subjects || 0 }}
                        </h2>
                    </div>
                    <div class="p-3 bg-yellow-100 rounded-full text-yellow-600">
                        <ClipboardList class="w-7 h-7" />
                    </div>
                </div>
            </div>

            <!-- Remaining Semesters -->
            <div
                class="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">Remaining Semesters</p>
                        <h2 class="text-4xl font-bold text-red-600 mt-2">
                            {{ stats.remaining_semesters || 0 }}
                        </h2>
                    </div>
                    <div class="p-3 bg-red-100 rounded-full text-red-600">
                        <Calendar class="w-7 h-7" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary Section -->
        <div v-if="authStore.user.other_info?.status === 'enrolled' && !loading"
            class="mt-10 bg-white shadow rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp class="w-5 h-5 text-blue-600" />
                Academic Summary
            </h3>

            <div class="grid sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Completion Rate</p>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="bg-green-500 h-3 transition-all duration-500"
                            :style="{ width: completionRate + '%' }"></div>
                    </div>
                    <p class="text-sm mt-1 text-gray-500">
                        {{ completionRate.toFixed(1) }}% of total subjects completed
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600 mb-1">Current Standing</p>
                    <div class="px-4 py-2 rounded-lg inline-block font-medium" :class="{
                        'bg-green-100 text-green-700': completionRate >= 75,
                        'bg-yellow-100 text-yellow-700': completionRate >= 40 && completionRate < 75,
                        'bg-red-100 text-red-700': completionRate < 40
                    }">
                        {{
                            completionRate >= 75
                                ? 'Almost Graduating 🎓'
                                : completionRate >= 40
                                    ? 'Halfway There 💪'
                                    : 'Just Getting Started 🚀'
                        }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
    BookOpen,
    CheckCircle2,
    ClipboardList,
    Calendar,
    TrendingUp,
    GraduationCap
} from 'lucide-vue-next'
import { fetchStudentSummary } from '@/services/apiService'

const authStore = useAuthStore()
const stats = ref({
    totalSubjects: 0,
    done_subjects: 0,
    enrolled_subjects: 0,
    remaining_semesters: 0,
})
const loading = ref(true)

const fetchStats = async () => {
    try {
        if (authStore?.user.other_info?.status === 'enrolled') {
            const data  = await fetchStudentSummary()
            stats.value = data || {}
        }
    } catch (error) {
        console.error('Dashboard fetch error:', error)
    } finally {
        loading.value = false
    }
}

// Computed for progress bar
const completionRate = computed(() => {
    if (!stats.value.totalSubjects) return 0
    return (stats.value.done_subjects / stats.value.totalSubjects) * 100
})

onMounted(fetchStats)
</script>
