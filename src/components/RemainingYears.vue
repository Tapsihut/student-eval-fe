<template>
    <div v-if="remainingProgress"
        class="mt-8 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-sm relative overflow-hidden">

        <!-- Decorative floating icons -->
        <div class="absolute top-2 right-2 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-400 animate-pulse" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M13 16h-1v-4h-1m1-4h.01M12 20h9" />
            </svg>
        </div>

        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Remaining Course Progress
        </h3>

        <div class="space-y-4">
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div class="h-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700 ease-out"
                    :style="{ width: remainingProgress.percent + '%' }">
                </div>
            </div>

            <!-- Text Summary -->
            <div class="flex justify-between items-center text-sm text-gray-700">
                <p><span class="font-semibold text-blue-700">{{ remainingProgress.percent }}%</span>
                    completed</p>
                <p>
                    Remaining:
                    <span class="font-semibold">{{ remainingProgress.remaining_units }}</span> units /
                    <span class="font-semibold">{{ remainingProgress.remaining_years }}</span> years
                </p>
            </div>

            <!-- Animated summary cards -->
            <!-- remaining years  -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                <div
                    class="bg-white border border-gray-200 rounded-lg p-3 flex items-center shadow-sm hover:shadow-md transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2 animate-bounce"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                    <div>
                        <p class="text-xs text-gray-500">Total Units</p>
                        <p class="font-semibold text-gray-800">{{ remainingProgress.total_units }}</p>
                    </div>
                </div>

                <div
                    class="bg-white border border-gray-200 rounded-lg p-3 flex items-center shadow-sm hover:shadow-md transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 animate-pulse"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p class="text-xs text-gray-500">Completed Units</p>
                        <p class="font-semibold text-gray-800">{{ remainingProgress.completed_units }}</p>
                    </div>
                </div>

                <div
                    class="bg-white border border-gray-200 rounded-lg p-3 flex items-center shadow-sm hover:shadow-md transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500 mr-2 animate-spin-slow"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p class="text-xs text-gray-500">Remaining Semesters</p>
                        <p class="font-semibold text-gray-800">{{ remainingProgress.remaining_semesters }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { computed } from 'vue'

const props = defineProps({
    remainingProgress: {
        type: Object,
        required: false,
        default: null
    }
})

const remainingProgress = computed(() => props.remainingProgress)

</script>