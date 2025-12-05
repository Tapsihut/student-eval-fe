<template>
    <div class="bg-white rounded-xl shadow-md p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Extracted Subjects / Grades
            </h3>

            <div class="flex flex-wrap items-center gap-2">
                <!-- Search -->
                <input v-model="searchQuery" type="text" placeholder="Search extracted code or title..."
                    class="border rounded-lg text-xs px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                <!-- Filter: Credited -->
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
                        <td class="px-4 py-2 font-medium">{{ subject.extracted_code}}</td>
                        <td class="px-4 py-2">{{ subject.title }}</td>
                        <td class="px-4 py-2 text-center">{{ subject.credits }}</td>
                        <td class="px-4 py-2 text-center">{{ subject.grade || '—' }}</td>

                        <!-- ✅ Icon instead of checkbox -->
                        <td class="px-4 py-2 text-center">
                            <span v-if="subject.is_credited" class="text-green-600 font-bold">✓</span>
                            <span v-else class="text-red-500 font-bold">✕</span>
                        </td>

                        <!-- ✅ Credited To (read-only text) -->
                        <td class="px-4 py-2 text-gray-700">
                            {{ getCreditedSubjectName(subject.credited_id) || '—' }}
                        </td>
                    </tr>

                    <tr v-if="!sortedSubjects.length">
                        <td colspan="6" class="px-4 py-3 text-center text-gray-400">No extracted subjects found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    torGrades: {
        type: Array,
        default: () => [],
    },
    curriculumSubjects: {
        type: Array,
        default: () => [],
    },
})

// Filters
const searchQuery = ref('')
const showCreditedOnly = ref(false)

// Sorting
const sortKey = ref('extracted_code')
const sortOrder = ref('asc')

const headers = [
    { key: 'extracted_code', label: 'Extracted Code' },
    { key: 'title', label: 'Title' },
    { key: 'credits', label: 'Units' },
    { key: 'grade', label: 'Grade' },
    { key: 'is_credited', label: 'Credited' },
    { key: 'credited_id', label: 'Credited To' },
]

// Sorting toggle
function toggleSort(key) {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = key
        sortOrder.value = 'asc'
    }
}

// Get credited subject name
function getCreditedSubjectName(id) {
    const subj = props.curriculumSubjects.find((s) => s.id === id)
    return subj ? `${subj.code} - ${subj.name}` : null
}

// Filtered subjects
const filteredSubjects = computed(() => {
    return props.torGrades.filter((s) => {
        const matchesSearch =
            s.units?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            s.title?.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesCredited = showCreditedOnly.value ? s.is_credited : true

        return matchesSearch && matchesCredited
    })
})

// Sorted subjects
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
</script>
