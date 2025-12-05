<template>
    <div class="bg-white rounded-xl shadow-md p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Curriculum Subjects
            </h3>

            <div class="flex flex-wrap items-center gap-2">
                <!-- Search -->
                <input v-model="searchQuery" type="text" placeholder="Search code or title..."
                    class="border rounded-lg text-xs px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                <!-- Year Filter -->
                <select v-model="filterYear"
                    class="border rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">All Years</option>
                    <option v-for="year in uniqueYears" :key="year" :value="year">
                        Year {{ year }}
                    </option>
                </select>

                <!-- Semester Filter -->
                <select v-model="filterSemester"
                    class="border rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">All Semesters</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                </select>

                <!-- Credited Only -->
                <label class="flex items-center text-xs text-gray-600 space-x-1 cursor-pointer">
                    <input type="checkbox" v-model="showCreditedOnly" class="rounded accent-blue-500" />
                    <span>Show credited only</span>
                </label>
            </div>
        </div>

        <!-- Table -->
        <div class="border rounded-lg overflow-y-auto max-h-[300px]">
            <table class="min-w-full text-xs text-gray-700 border-collapse">
                <thead class="bg-gray-100 sticky top-0">
                    <tr>
                        <th v-for="header in headers" :key="header.key" @click="toggleSort(header.key)"
                            class="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider cursor-pointer select-none">
                            <div class="flex items-center gap-1">
                                {{ header.label }}
                                <span v-if="sortKey === header.key">
                                    <svg v-if="sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg"
                                        class="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 15l7-7 7 7" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-500"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="subject in sortedSubjects" :key="subject.id"
                        class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition">
                        <td class="px-4 py-2 font-medium">{{ subject.id }}</td>
                        <td class="px-4 py-2 font-medium">{{ subject.code }}</td>
                        <td class="px-4 py-2">{{ subject.name }}</td>
                        <td class="px-4 py-2 text-center">{{ subject.year_level }}</td>
                        <td class="px-4 py-2 text-center">{{ subject.semester }}</td>
                        <td class="px-4 py-2 text-center">{{ subject.units }}</td>
                        <td class="px-4 py-2 text-center">
                            <span v-if="subject.credited" class="text-green-600 font-semibold">Yes</span>
                            <span v-else class="text-gray-400">No</span>
                        </td>
                        <td class="px-4 py-2 text-center">{{ subject.extracted_code }}</td>
                        <td class="px-4 py-2 text-center">{{ subject.extracted_title }}</td>
                        <td class="px-4 py-2 text-center">
                            <span v-if="subject.grade">{{ subject.grade }}</span>
                            <span v-else class="text-gray-400">—</span>
                        </td>
                    </tr>

                    <tr v-if="!sortedSubjects.length">
                        <td colspan="10" class="px-4 py-3 text-center text-gray-400">No subjects found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Footer: Yearly Unit Summary -->
        <div class="flex flex-col sm:flex-row sm:justify-between mt-4 gap-2 flex-wrap bg-slate-100 p-2 rounded">
            <div v-for="year in [1, 2, 3, 4]" :key="year" class="text-xs text-gray-600">
                <span class="font-semibold text-gray-800">{{ yearLabel(year) }}: </span>
                <span class="text-blue-600 font-semibold">{{ creditedUnits(year) }}</span>
                /
                <span class="font-semibold">{{ totalUnits(year) }}</span>
                units credited
            </div>

            <div class="text-xs text-gray-600 sm:text-right">
                <span class="font-semibold text-blue-600">{{ creditedCount }}</span> /
                <span class="font-semibold">{{ totalSubjects }}</span> subjects credited
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    subjects: {
        type: Array,
        default: () => [],
    },
})

// Filters
const searchQuery = ref('')
const filterYear = ref('')
const filterSemester = ref('')
const showCreditedOnly = ref(false)

// Sorting
const sortKey = ref('year_level')
const sortOrder = ref('asc')

const headers = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Title' },
    { key: 'year_level', label: 'Year' },
    { key: 'semester', label: 'Semester' },
    { key: 'units', label: 'Units' },
    { key: 'credited', label: 'Credited' },
    { key: 'extracted_code', label: 'Extracted Code' },
    { key: 'extracted_title', label: 'Extracted Title' },
    { key: 'grade', label: 'Grade' },
]

function toggleSort(key) {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = key
        sortOrder.value = 'asc'
    }
}

const uniqueYears = computed(() => {
    const years = props.subjects.map((s) => s.year_level).filter(Boolean)
    return [...new Set(years)].sort((a, b) => a - b)
})

// Helper: Convert number to year label
const yearLabel = (year) => {
  const suffixes = { 1: '1st', 2: '2nd', 3: '3rd' }
  return `${suffixes[year] || year + 'th'} Year`
}

// Filter subjects
const filteredSubjects = computed(() => {
    return props.subjects.filter((s) => {
        const matchesSearch =
            s.code?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            s.name?.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesYear = filterYear.value ? s.year_level == filterYear.value : true
        const matchesSem = filterSemester.value ? s.semester == filterSemester.value : true
        const matchesCredited = showCreditedOnly.value ? s.credited : true

        return matchesSearch && matchesYear && matchesSem && matchesCredited
    })
})

// Sort subjects
const sortedSubjects = computed(() => {
    return [...filteredSubjects.value].sort((a, b) => {
        let valA = a[sortKey.value]
        let valB = b[sortKey.value]

        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()

        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
    })
})

// Unit & Subject Summary
const totalSubjects = computed(() => props.subjects.length)
const creditedCount = computed(() => props.subjects.filter((s) => s.credited).length)

// Compute total units per year
const totalUnits = (year) =>
    props.subjects
        .filter((s) => s.year_level == year)
        .reduce((sum, s) => sum + Number(s.units || 0), 0)

// Compute credited units per year
const creditedUnits = (year) =>
    props.subjects
        .filter((s) => s.year_level == year && s.credited)
        .reduce((sum, s) => sum + Number(s.units || 0), 0)
</script>
