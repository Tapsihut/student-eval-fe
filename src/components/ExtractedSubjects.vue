<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">
        Extracted Subjects / Grades
      </h3>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search extracted code or title..."
          class="border rounded-lg text-xs px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

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
            <th
              v-for="header in headers"
              :key="header.key"
              @click="toggleSort(header.key)"
              class="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider cursor-pointer select-none"
            >
              <div class="flex items-center gap-1">
                {{ header.label }}
                <span v-if="sortKey === header.key">
                  <svg
                    v-if="sortOrder === 'asc'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="subject in sortedSubjects"
            :key="subject.id"
            class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
          >
            <td class="px-4 py-2 font-medium">{{ subject.extracted_code }}</td>
            <td class="px-4 py-2">{{ subject.title }}</td>
            <td class="px-4 py-2 text-center">{{ subject.credits }}</td>
            <td class="px-4 py-2 text-center">{{ subject.grade || '—' }}</td>
            <td class="px-4 py-2 text-center">
              <input
                v-if="props.tor.status === 'submitted'"
                type="checkbox"
                v-model="subject.is_credited"
                @change="handleCheckChange(subject)">
              <div v-else class="px-4 py-2 text-center">
                <span v-if="subject.is_credited" class="text-green-600 font-semibold">✅</span>
                <span v-else class="text-gray-400">❌</span>
              </div>
            </td>
            <td class="px-4 py-2">
              <select
                v-if="props.tor.status === 'submitted' && subject.is_credited"
                v-model="subject.credited_id"
                @change="updateSelectedCredits()"  
                class="border border-gray-300 rounded px-2 py-1 text-xs w-full focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>Select subject</option>
                <option
                  v-for="s in availableCurriculumSubjects(subject)"
                  :key="s.id"
                  :value="s.id"
                >
                  {{ s.code }} - {{ s.name }}
                </option>
              </select>
            </td>
          </tr>

          <tr v-if="!sortedSubjects.length">
            <td colspan="6" class="px-4 py-3 text-center text-gray-400">
              No extracted subjects found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, reactive } from 'vue'

const emits = defineEmits(['update:torGrades'])

const props = defineProps({
  torGrades: { type: Array, default: () => [] },
  curriculumSubjects: { type: Array, default: () => [] },
  tor: { type: Array }
})

// Local reactive copy
const localTorGrades = reactive(JSON.parse(JSON.stringify(props.torGrades)))

// Sync changes from parent
watch(
  () => props.torGrades,
  (newVal) => {
    Object.assign(localTorGrades, JSON.parse(JSON.stringify(newVal)))
  },
  { deep: true }
)

// Emit changes back to parent
watch(
  localTorGrades,
  (newVal) => {
    emits('update:torGrades', JSON.parse(JSON.stringify(newVal)))
    updateSelectedCredits() // 🟢 keep dropdown updated when changes happen
  },
  { deep: true }
)

const searchQuery = ref('')
const showCreditedOnly = ref(false)
const sortKey = ref('extracted_code')
const sortOrder = ref('asc')
const headers = [
  { key: 'extracted_code', label: 'Code' },
  { key: 'title', label: 'Title' },
  { key: 'credits', label: 'Units' },
  { key: 'grade', label: 'Grade' },
  { key: 'is_credited', label: 'Credited' },
  { key: 'credited_id', label: 'Credited To' },
]

// 🟢 Track all selected credited subject IDs
const selectedCredits = ref([])

// Update selected credited IDs
function updateSelectedCredits() {
  selectedCredits.value = localTorGrades
    .filter((s) => s.is_credited && s.credited_id)
    .map((s) => s.credited_id)
}

// 🟢 When checkbox toggles
function handleCheckChange(subject) {
  if (!subject.is_credited) {
    // If unchecked, clear credited_id and update list
    subject.credited_id = ''
  }
  updateSelectedCredits()
}

// 🟢 Filter dropdown so used subjects don’t appear elsewhere
function availableCurriculumSubjects(currentSubject) {
  return props.curriculumSubjects.filter(
    (s) =>
      !selectedCredits.value.includes(s.id) || s.id === currentSubject.credited_id
  )
}

function toggleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filteredSubjects = computed(() =>
  localTorGrades.filter((s) => {
    const matchesSearch =
      s.extracted_code?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.title?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCredited = showCreditedOnly.value ? s.is_credited : true
    return matchesSearch && matchesCredited
  })
)

const sortedSubjects = computed(() =>
  [...filteredSubjects.value].sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
)
</script>
