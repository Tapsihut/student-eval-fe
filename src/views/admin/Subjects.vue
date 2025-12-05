<template>
  <div class="p-6 bg-white min-h-screen text-xs">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Subjects Management</h1>
        <p class="text-sm text-gray-500">Manage all curriculum subjects.</p>
      </div>
      <div>
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-3 py-1 rounded"
        >
          + New Subject
        </button>
      </div>
    </div>

    <!-- Curriculum Dropdown (kept as earlier) -->
    <div
      v-if="showCurriculumDropdown"
      class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
    >
      <input
        v-model="curriculumSearch"
        type="text"
        placeholder="Search curriculum..."
        class="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
      />

      <ul class="max-h-56 overflow-y-auto">
        <li
          v-for="curriculum in filteredCurriculums"
          :key="curriculum.id"
          @click="selectCurriculum(curriculum)"
          class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
        >
          {{ curriculum.course?.name }} ({{ curriculum.year_start }} - {{ curriculum.year_end }})
        </li>
        <li v-if="!filteredCurriculums.length" class="px-3 py-2 text-gray-400 text-sm">
          No results found.
        </li>
      </ul>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search by subject code or title..."
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="filterSemester"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Semesters</option>
        <option value="1st">1st Semester</option>
        <option value="2nd">2nd Semester</option>
      </select>
      <select
        v-model="filterYear"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Years</option>
        <option v-for="year in yearLevels" :key="year" :value="year">Year: {{ year }}</option>
      </select>
    </div>

    <!-- Subjects Table -->
    <div class="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
      <div v-if="isLoading" class="mt-4">
        <TableLoader :rows="6" />
      </div>

      <div v-else>
        <table class="w-full text-sm text-left text-gray-600 min-h-[400px]">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-3 py-2">Code</th>
              <th class="px-3 py-2">Title</th>
              <th class="px-3 py-2 text-center">Units</th>
              <th class="px-3 py-2 text-center">Year</th>
              <th class="px-3 py-2 text-center">Semester</th>
              <th class="px-3 py-2">Prerequisite</th>
              <th class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="subject in paginatedSubjects"
              :key="subject.id"
              class="border-b border-slate-200 hover:bg-gray-50 transition"
            >
              <td class="px-3 py-2">{{ subject.code }}</td>
              <td class="px-3 py-2">{{ subject.name }}</td>
              <td class="px-3 py-2 text-center">{{ subject.units }}</td>
              <td class="px-3 py-2 text-center">{{ subject.year_level }}</td>
              <td class="px-3 py-2 text-center">{{ subject.semester }}</td>

              <td class="px-3 py-2 text-xs">
                <div v-if="subject.prerequisites?.length">
                  <div v-for="(pre, i) in subject.prerequisites" :key="i" class="text-gray-700">
                    <span class="font-medium">{{ pre.code }}</span> : <span>{{ pre.name }}</span>
                  </div>
                </div>
                <span v-else class="text-gray-400 italic">—</span>
              </td>

              <td class="px-3 py-2 text-right space-x-2">
                <button @click="openModal(subject)" class="text-blue-600 hover:underline">Edit</button>
                <button @click="deleteSubjectById(subject.id)" class="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>

            <tr v-if="!filteredSubjects.length">
              <td colspan="7" class="text-center py-6 text-gray-400">No subjects found.</td>
            </tr>
          </tbody>
        </table>

        <!-- Summary -->
        <div class="flex justify-end mt-4 pr-2 text-sm text-gray-700 bg-slate-50 p-2">
          <div class="flex gap-5 text-right">
            <p>Total Subjects: <b>{{ filteredSubjects.length }}</b></p>
            <p>Total Units: <b>{{ totalUnits }}</b></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit Subject -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg w-[720px] max-w-full p-6 shadow-lg">
        <h3 class="text-lg font-semibold mb-4">{{ editMode ? 'Edit Subject' : 'Create Subject' }}</h3>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-600">Code</label>
            <input v-model="form.code" class="border rounded px-2 py-1 w-full" />
          </div>

          <div>
            <label class="block text-xs text-gray-600">Units</label>
            <input v-model.number="form.units" type="number" min="0" class="border rounded px-2 py-1 w-full" />
          </div>

          <div class="col-span-2">
            <label class="block text-xs text-gray-600">Name</label>
            <input v-model="form.name" class="border rounded px-2 py-1 w-full" />
          </div>

          <div>
            <label class="block text-xs text-gray-600">Year Level</label>
            <select v-model="form.year_level" class="border rounded px-2 py-1 w-full">
              <option value="">Select year</option>
              <option v-for="y in yearLevels" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs text-gray-600">Semester</label>
            <select v-model="form.semester" class="border rounded px-2 py-1 w-full">
              <option value="">Select semester</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

<div class="col-span-2">
  <label class="block text-xs text-gray-600">Curriculum</label>
  <select v-model="selectedCurriculumId" class="border rounded px-2 py-1 w-full">
    <option value="">Select curriculum</option>
    <option v-for="c in filteredCurriculums" :key="c.id" :value="c.id">
      {{ c.course?.code }} — {{ c.year_start }}-{{ c.year_end }}
    </option>
  </select>
</div>
</div>

        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeModal" class="px-4 py-1 border rounded">Cancel</button>
          <button @click="saveSubject" :disabled="saving" class="px-4 py-1 bg-blue-600 text-white rounded">
            {{ saving ? (editMode ? 'Saving...' : 'Creating...') : (editMode ? 'Save changes' : 'Create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useAuthStore } from "@/stores/auth"
import TableLoader from "@/components/TableLoader.vue"
import {
  fetchAllCurriculums,
  fetchSubjectsByCurriculum,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/apiService"

const auth = useAuthStore()
const user = auth.user

const curriculums = ref([])
const selectedCurriculum = ref(null)
const selectedCurriculumId = ref(null) // used by modal select
const showCurriculumDropdown = ref(false)
const curriculumSearch = ref("")

const subjects = ref([])
const isLoading = ref(false)
const search = ref("")
const filterSemester = ref("1st") // default 1st sem
const filterYear = ref("1") // default 1st year
const yearLevels = ["1", "2", "3", "4"]

const showModal = ref(false)
const editMode = ref(false)
const saving = ref(false)
const form = ref({ id: null, code: "", name: "", units: null, year_level: "", semester: "", curriculum_id: null })

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filter curriculums for the logged-in user's course (unchanged)
const filteredCurriculums = computed(() => {
  const adminCourseCode =
    user?.course_code ||
    user?.course?.code ||
    user?.course ||
    null

  if (!adminCourseCode) return curriculums.value
  return curriculums.value.filter(
    (c) =>
      c.course?.code?.toLowerCase() === adminCourseCode?.toLowerCase() ||
      c.course?.name?.toLowerCase().includes(adminCourseCode?.toLowerCase())
  )
})

// Filtered subjects (search + semester/year)
const filteredSubjects = computed(() => {
  return subjects.value.filter((s) => {
    const lowerSearch = search.value.toLowerCase()
    const matchesSearch =
      (s.code || "").toLowerCase().includes(lowerSearch) ||
      (s.name || "").toLowerCase().includes(lowerSearch)
    const matchesSem = !filterSemester.value || (s.semester || "") == filterSemester.value
    const matchesYear = !filterYear.value || (s.year_level || "") == filterYear.value
    return matchesSearch && matchesSem && matchesYear
  })
})

const totalUnits = computed(() =>
  filteredSubjects.value.reduce((sum, s) => sum + (parseInt(s.units) || 0), 0)
)

const totalPages = computed(() => Math.ceil(filteredSubjects.value.length / itemsPerPage.value))
const startItem = computed(() => (filteredSubjects.value.length ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0))
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredSubjects.value.length))
const paginatedSubjects = computed(() => filteredSubjects.value.slice(startItem.value - 1, endItem.value))

const goToPage = (p) => { if (p >= 1 && p <= totalPages.value) currentPage.value = p }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

// Dropdown controls
const toggleCurriculumDropdown = () => (showCurriculumDropdown.value = !showCurriculumDropdown.value)
const selectCurriculum = async (curriculum) => {
  selectedCurriculum.value = curriculum
  selectedCurriculumId.value = curriculum.id
  showCurriculumDropdown.value = false
  await loadSubjects(curriculum.id)
}

// CRUD: open modal (create or edit)
// - If subject provided -> edit mode; else create mode
const openModal = (subject = null) => {
  if (subject) {
    editMode.value = true
    form.value = {
      id: subject.id,
      code: subject.code ?? "",
      name: subject.name ?? "",
      units: subject.units ?? null,
      year_level: subject.year_level ?? "",
      semester: subject.semester ?? "",
      curriculum_id: subject.curriculum_id ?? (subject.curriculum?.id ?? null)
    }
    selectedCurriculum.value = curriculums.value.find(c => c.id === form.value.curriculum_id) ?? null
    selectedCurriculumId.value = selectedCurriculum.value?.id ?? form.value.curriculum_id
  } else {
    editMode.value = false
    form.value = { id: null, code: "", name: "", units: null, year_level: "", semester: "", curriculum_id: selectedCurriculum.value?.id ?? null }
    selectedCurriculumId.value = selectedCurriculum.value?.id ?? null
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  saving.value = false
}

// saveSubject: handles create & update
const saveSubject = async () => {
  // Basic validation
  if (!form.value.code || !form.value.name || !selectedCurriculumId.value) {
    alert("Please enter subject code, name, and select a curriculum.")
    return
  }

  saving.value = true
  try {
    // Ensure curriculum_id is included (prefer modal select)
    const payload = {
      ...form.value,
      curriculum_id: selectedCurriculumId.value ?? form.value.curriculum_id
    }

    if (editMode.value) {
      // Update
      await updateSubject(payload.id, payload)
    } else {
      // Create
      await createSubject(payload)
    }

    // Reload subjects for the curriculum we just modified/used
    const cid = payload.curriculum_id
    if (cid) await loadSubjects(cid)
    else if (selectedCurriculum.value) await loadSubjects(selectedCurriculum.value.id)

    closeModal()
  } catch (err) {
    console.error("Error saving subject:", err)
    alert("Failed to save subject. See console for details.")
  } finally {
    saving.value = false
  }
}

const deleteSubjectById = async (id) => {
  if (!confirm("Are you sure you want to delete this subject?")) return
  try {
    await deleteSubject(id)
    // reload list (try current selected curriculum)
    if (selectedCurriculum.value) await loadSubjects(selectedCurriculum.value.id)
    else if (curriculums.value.length) await loadSubjects(curriculums.value[0].id)
  } catch (err) {
    console.error("Delete failed:", err)
    alert("Failed to delete subject.")
  }
}

// Load data
const loadCurriculums = async () => {
  try {
    const data = await fetchAllCurriculums()
    curriculums.value = data

    // select a default curriculum (match user's course) if available
    const adminCourseCode = (user?.course_code || user?.course?.code || user?.course || "").toLowerCase()

    const match = data.find(
      (c) =>
        c.course?.code?.toLowerCase() === adminCourseCode ||
        c.course?.name?.toLowerCase().includes(adminCourseCode)
    )

    if (match) {
      selectedCurriculum.value = match
      selectedCurriculumId.value = match.id
      await loadSubjects(match.id)
    } else if (data.length) {
      // fallback to first curriculum
      selectedCurriculum.value = data[0]
      selectedCurriculumId.value = data[0].id
      await loadSubjects(data[0].id)
    }
  } catch (err) {
    console.error("Error loading curriculums:", err)
  }
}

const loadSubjects = async (curriculum_id) => {
  isLoading.value = true
  try {
    const data = await fetchSubjectsByCurriculum(curriculum_id)
    subjects.value = data
  } catch (error) {
    console.error(`Error fetching subjects for curriculum ID ${curriculum_id}:`, error)
  } finally {
    isLoading.value = false
  }
}

// keep selectedCurriculum in sync whenever selectedCurriculumId changes
watch(selectedCurriculumId, (newId) => {
  selectedCurriculum.value = curriculums.value.find(c => c.id === newId) ?? null
})

onMounted(() => loadCurriculums())
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
}
</style>
