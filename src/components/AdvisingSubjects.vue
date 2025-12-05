<template>
  <div class="bg-white rounded-lg shadow px-6 pb-6">
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">
        Advising Records
      </h3>

      <!-- Filters -->
      <div class="flex items-center gap-2">
        <!-- Semester Filter -->
        <select v-model="selectedSemester" class="text-xs border rounded px-2 py-1">
          <option value="">All Semesters</option>
          <option value="first_sem">First Semester</option>
          <option value="second_sem">Second Semester</option>
        </select>

        <!-- School Year Filter -->
        <select v-model="selectedSchoolYear" class="text-xs border rounded px-2 py-1">
          <option value="">Select School Year</option>
          <option value="2024-2025">2024-2025 </option>
          <option value="2025-2026">2025-2026</option>
          <option value="2026-2027">2026-2027</option>
          <option value="2027-2028">2027-2028</option>
          <option value="2028-2029">2028-2029</option>
          <option value="2029-2030">2029-2030</option>
        </select>
      </div>
    </div>

    <div class="h-[350px] overflow-y-auto border rounded">
      <table class="min-w-full text-xs text-gray-700 border-collapse">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Subject Code</th>
            <th class="px-4 py-2 text-left">Title</th>
            <th class="px-4 py-2 text-left">Units</th>
            <th class="px-4 py-2 text-left">Semester</th>
            <th class="px-4 py-2 text-left">Year Level</th>
            <th class="px-4 py-2 text-left">Advice For</th>
            <th class="px-4 py-2 text-left">School Year</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="adv in filteredAdvising" :key="adv.id" class="odd:bg-white even:bg-gray-50 hover:bg-blue-50">
            <td class="px-4 py-2">{{ adv.subject?.id }}</td>
            <td class="px-4 py-2">{{ adv.subject?.code }}</td>
            <td class="px-4 py-2">{{ adv.subject?.name }}</td>
            <td class="px-4 py-2">{{ adv.subject?.units }}</td>
            <td class="px-4 py-2 capitalize">{{ adv.subject?.semester?.replace('_', ' ') }}</td>
            <td class="px-4 py-2">
              {{
                adv.subject?.year_level === 1 ? '1st Year' :
                  adv.subject?.year_level === 2 ? '2nd Year' :
                    adv.subject?.year_level === 3 ? '3rd Year' :
                      adv.subject?.year_level === 4 ? '4th Year' :
                        adv.subject?.year_level || '__'
              }}
            </td>
            <td class="px-4 py-2 capitalize">{{ adv.semester?.replace('_', ' ') }}</td>
            <td class="px-4 py-2">{{ adv.school_year || '—' }}</td>
          </tr>

          <tr v-if="!filteredAdvising.length">
            <td colspan="8" class="px-4 py-2 text-center text-gray-400">
              No advising records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total Units -->
    <div class="text-right text-xs mt-3 font-semibold text-gray-700">
      Total Units: {{ totalUnits }}
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

const emit = defineEmits(['update:selectedSemester', 'update:selectedSchoolYear'])

const selectedSemester = ref('')
const selectedSchoolYear = ref('')

// Emit changes to parent
watch(selectedSemester, (newValue) => emit('update:selectedSemester', newValue))
watch(selectedSchoolYear, (newValue) => emit('update:selectedSchoolYear', newValue))

// Extract unique school years dynamically
const uniqueSchoolYears = computed(() => {
  const years = props.advising.map((a) => a.school_year).filter(Boolean)
  return [...new Set(years)].sort((a, b) => b.localeCompare(a))
})

// Filter logic
const filteredAdvising = computed(() => {
  return props.advising.filter((adv) => {
    const semesterMatch = !selectedSemester.value || adv.semester?.toLowerCase().includes(selectedSemester.value.toLowerCase())
    // const yearMatch = !selectedSchoolYear.value || adv.school_year === selectedSchoolYear.value
    return semesterMatch
  })
})

// Total Units
const totalUnits = computed(() =>
  filteredAdvising.value.reduce((sum, adv) => sum + Number(adv.subject?.units || 0), 0)
)
</script>
