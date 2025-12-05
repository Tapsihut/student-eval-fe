<template>
  <div class="p-6 bg-white min-h-screen text-xs">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Curriculum Management</h1>
        <p class="text-sm text-gray-500">Manage all course curriculums.</p>
      </div>
    </div>

    <!-- Table -->
<div class="bg-white rounded-xl shadow-sm p-4 overflow-hidden border border-gray-100">
  <div v-if="isLoading" class="mt-4">
    <TableLoader :rows="6" />
  </div>

  <div v-else>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-600">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th class="px-3 py-2 w-[35%]">Course</th>
            <th class="px-3 py-2 w-[10%] text-center">Code</th>
            <th class="px-3 py-2 w-[20%] text-center">Years</th>
            <th class="px-3 py-2 w-[15%] text-center">Status</th>
            <th class="px-3 py-2 w-[20%] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="curriculum in paginatedCurriculums"
            :key="curriculum.id"
            class="border-b border-slate-200 hover:bg-gray-50 transition"
          >
            <td class="px-3 py-2 truncate">{{ curriculum.course?.name }}</td>
            <td class="px-3 py-2 text-center">{{ curriculum.course?.code }}</td>
            <td class="px-3 py-2 text-center">
              {{ curriculum.year_start }} - {{ curriculum.year_end }}
            </td>
            <td class="px-3 py-2 text-center">
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="curriculum.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'"
              >
                {{ curriculum.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-3 py-2 text-right space-x-2">
              <button @click="openModal(curriculum)" class="text-blue-600 hover:underline">
                Edit
              </button>
              <button @click="deleteCurriculumById(curriculum.id)" class="text-red-600 hover:underline">
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="!filteredCurriculums.length">
            <td colspan="5" class="text-center py-6 text-gray-400">
              No curriculums found for your course.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex justify-between items-center mt-3 px-2 text-xs text-gray-600"
    >
      <span>
        Showing <b>{{ startItem }}</b> - <b>{{ endItem }}</b> of
        <b>{{ filteredCurriculums.length }}</b>
      </span>
      <div class="flex space-x-1">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-2 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-2 py-1 rounded-md border text-xs',
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white hover:bg-gray-100 border-gray-300',
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-2 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</div>


    <!-- Modal -->
    <ModalOverlay v-if="showModal">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        {{ editMode ? 'Edit Curriculum' : 'Add Curriculum' }}
      </h2>

      <form @submit.prevent="saveCurriculum" class="space-y-4">
        <div class="">
          <input v-model="form.course_code" type="text" placeholder="Course Code ex: BSIT" class="input" />
        </div>

        <div class="">
          <input v-model="form.course_name" type="text" placeholder="Course Name" class="input" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Start Year</label>
            <input v-model="form.year_start" type="text" class="input" placeholder="2025" required />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">End Year</label>
            <input v-model="form.year_end" type="text" class="input" placeholder="2029" required />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-600 mb-1">Status</label>
          <select v-model="form.is_active" class="input">
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            {{ editMode ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </ModalOverlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import TableLoader from "@/components/TableLoader.vue"
import ModalOverlay from "@/components/ModalOverlay.vue"
import {
  fetchAllCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  fetchAllCourses,
} from "@/services/apiService"
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
const user = auth.user || JSON.parse(localStorage.getItem("user"))

// 🧩 Data
const curriculums = ref([])
const courses = ref([])
const isLoading = ref(false)
const search = ref("")

const showModal = ref(false)
const editMode = ref(false)
const form = ref({
  id: null,
  course_id: "",
  course_name: "",
  course_code: "",
  name: "",
  year_start: "",
  year_end: "",
  is_active: true,
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 🧠 Computed: filter by admin’s course and search
const filteredCurriculums = computed(() => {
  // Detect course code reliably
  const adminCourseCode =
    user?.course_code ||
    user?.course?.code ||
    user?.course ||
    null

  console.log("Filtering for course:", adminCourseCode)

  return curriculums.value
    .filter((c) => {
      // ✅ Only show if curriculum course matches user's course
      if (adminCourseCode) {
        return c.course?.code?.toLowerCase() === adminCourseCode?.toLowerCase()
      }
      return true
    })
    .filter((c) => {
      const searchText = search.value.toLowerCase()
      return (
        c.course?.name?.toLowerCase().includes(searchText) ||
        c.course?.code?.toLowerCase().includes(searchText) ||
        c.year_start?.toString().includes(searchText) ||
        c.year_end?.toString().includes(searchText)
      )
    })
})

const totalPages = computed(() => Math.ceil(filteredCurriculums.value.length / itemsPerPage.value))
const startItem = computed(() =>
  filteredCurriculums.value.length ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0
)
const endItem = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, filteredCurriculums.value.length)
)
const paginatedCurriculums = computed(() =>
  filteredCurriculums.value.slice(startItem.value - 1, endItem.value)
)

// Pagination controls
const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// CRUD
const openModal = (curriculum = null) => {
  if (curriculum) {
    editMode.value = true
    form.value = {
      ...curriculum,
      course_id: curriculum.course_id || "",
      is_active: !!curriculum.is_active,
      course_name: curriculum.course.name,
      course_code: curriculum.course.code,
      course_id: curriculum.course.id,
    }
  } else {
    editMode.value = false
    form.value = {
      id: null,
      course_id: "",
      course_name: "",
      course_code: "",
      name: "",
      year_start: "",
      year_end: "",
      is_active: true,
    }
  }
  showModal.value = true
}

const closeModal = () => (showModal.value = false)

const saveCurriculum = async () => {
  try {
    const payload = { ...form.value }
    if (editMode.value) await updateCurriculum(payload.id, payload)
    else await createCurriculum(payload)
    await loadCurriculums()
    closeModal()
  } catch (error) {
    console.error("Error saving curriculum:", error)
  }
}

const deleteCurriculumById = async (id) => {
  if (confirm("Are you sure you want to delete this curriculum?")) {
    await deleteCurriculum(id)
    await loadCurriculums()
  }
}

// Fetch Data
const loadCurriculums = async () => {
  isLoading.value = true
  try {
    curriculums.value = await fetchAllCurriculums()
    console.log("Admin course:", user?.course_code || user?.course?.code || user?.course)
  } catch (err) {
    console.error("getCurriculums", err)
  } finally {
    isLoading.value = false
  }
}

const loadCourses = async () => {
  try {
    courses.value = await fetchAllCourses()
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await loadCourses()
  await loadCurriculums()
})
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
