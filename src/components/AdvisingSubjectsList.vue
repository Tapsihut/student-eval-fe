<template>
    <!-- Advising Section -->
    <div v-if="advising.first_sem?.length || advising.second_sem?.length"
        class="bg-blue-50 border border-blue-200 rounded-lg mt-6 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 20h9" />
            </svg>
            Advising Recommendation
        </h3>

        <!-- 1st Semester -->
        <div v-if="advising.first_sem?.length" class="mb-6">
            <h4 class="text-md font-semibold text-blue-700 mb-2">First Semester</h4>
            <table class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
                <thead class="bg-blue-100">
                    <tr>
                        <th class="px-4 py-2 text-left">Code</th>
                        <th class="px-4 py-2 text-left">Subject Name</th>
                        <th class="px-4 py-2 text-left">Units</th>
                        <th class="px-4 py-2 text-left">Semester</th>
                        <th class="px-4 py-2 text-left">Year Level</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in advising.first_sem" :key="data.subject.id" class="odd:bg-white even:bg-blue-50">
                        <td class="px-4 py-2">{{ data.subject.code }}</td>
                        <td class="px-4 py-2">{{ data.subject.name }}</td>
                        <td class="px-4 py-2">{{ data.subject.units }}</td>
                        <td class="px-4 py-2">{{ data.subject.semester }}</td>
                        <td class="px-4 py-2">{{ data.subject?.year_level }}</td>
                        <td class="px-4 py-2">{{ data.subject?.prerequisite?.name }}</td>
                    </tr>
                </tbody>
            </table>
            <p class="text-sm text-gray-500">Total units (1st sem):
                <span class="font-semibold text-blue-700">
                    {{advising.first_sem.reduce((sum, s) => sum + (parseFloat(s.subject.units) || 0), 0)}}
                </span>
            </p>
        </div>

        <!-- 2nd Semester -->
        <div v-if="advising.second_sem?.length">
            <h4 class="text-md font-semibold text-blue-700 mb-2">Second Semester</h4>
            <table class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
                <thead class="bg-blue-100">
                    <tr>
                        <th class="px-4 py-2 text-left">Code</th>
                        <th class="px-4 py-2 text-left">Subject Name</th>
                        <th class="px-4 py-2 text-left">Units</th>
                        <th class="px-4 py-2 text-left">Semester</th>
                        <th class="px-4 py-2 text-left">Year Level</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in advising.second_sem" :key="data.subject.id" class="odd:bg-white even:bg-blue-50">
                        <td class="px-4 py-2">{{ data.subject.code }}</td>
                        <td class="px-4 py-2">{{ data.subject.name }}</td>
                        <td class="px-4 py-2">{{ data.subject.units }}</td>
                        <td class="px-4 py-2">{{ data.subject.semester }}</td>
                        <td class="px-4 py-2">{{ data.subject.year_level }}</td>
                    </tr>
                </tbody>
            </table>
            <p class="text-sm text-gray-500">Total units (2nd sem):
                <span class="font-semibold text-blue-700">
                    {{advising.second_sem.reduce((sum, s) => sum + (parseFloat(s.subject.units) || 0), 0)}}
                </span>
            </p>
        </div>

        <div v-if="advising.total_units" class="mt-4 text-right text-sm text-gray-600">
            <p>Total Suggested Load:
                <span class="font-semibold text-gray-800">{{ advising.total_units }}</span> units
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    advising: {
        type: Array,
        default: () => [],
    },
})

const advising = computed(() => {
    const data = Array.isArray(props.advising) ? props.advising : []

    const first_sem = data.filter(item => item.semester === 'first_sem')
    const second_sem = data.filter(item => item.semester === 'second_sem')

    const total_units =
        first_sem.reduce((sum, s) => sum + (parseFloat(s.subject.units) || 0), 0) +
        second_sem.reduce((sum, s) => sum + (parseFloat(s.subject.units) || 0), 0)

    console.log(first_sem, second_sem, total_units)

    return {
        first_sem,
        second_sem,
        total_units,
    }
})


console.log(props.advising)

</script>