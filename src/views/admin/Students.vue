<template>
  <div class="p-6 bg-gray-50 min-h-screen text-xs">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Student Management</h1>
        <p class="text-sm text-gray-500">Manage and track all students.</p>
      </div>
      <button
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        + Add Student
      </button>
    </div>
    <!-- Search & Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search student name..."
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="filterType"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        <option value="New">New</option>
        <option value="Shiftee">Shiftee</option>
        <option value="Transferee">Transferee</option>
      </select>
      <select
        v-model="filterYear"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Years</option>
        <option v-for="year in yearLevels" :key="year" :value="year">
          {{
            year === 1
              ? '1st Year'
              : year === 2
                ? '2nd Year'
                : year === 3
                  ? '3rd Year'
                  : year === 4
                    ? '4th Year'
                    : year
          }}
        </option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
      <div v-if="isLoadingUsers" class="mt-4">
        <TableLoader :rows="6" />
      </div>

      <div v-else>
        <table class="w-full text-sm text-left text-gray-600 min-h-[400px]">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3">Student ID</th>
              <th class="px-4 py-3">First Name</th>
              <th class="px-4 py-3">Last Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Year Level</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Is Active</th>
              <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
              v-for="student in paginatedStudents"
              :key="student.id"
              class="border-b border-slate-200 hover:bg-gray-50 transition"
            >
              <td class="px-4 py-3">{{ student.student_id || '__' }}</td>
              <td class="px-4 py-3">{{ student.first_name || '__' }}</td>
              <td class="px-4 py-3">{{ student.last_name || '__' }}</td>
              <td class="px-4 py-3">{{ student.email || '__' }}</td>
              <td class="px-4 py-3">{{ student.category || '__' }}</td>
              <td class="px-4 py-3">
                                {{
                  student.year_level == 1
                    ? '1st Year'
                    : student.year_level == 2
                      ? '2nd Year'
                      : student.year_level == 3
                        ? '3rd Year'
                        : student.year_level == 4
                          ? '4th Year'
                          : '__'
                }}
              </td>
              <td class="px-4 py-3">{{ student.type || '__' }}</td>
              <td class="px-4 py-3">{{ student.status || 'Pending' }}</td>
              <td class="px-4 py-3">{{ student.is_deleted === 0 ? 'Active' : 'Inactive' }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button
                  @click="openModal(student)"
                  class="text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <button
                  @click="toggleActiveStatus(student)"
                  class="text-red-600 hover:underline cursor-pointer"
                >
                  {{ student.is_deleted ? 'Activate' : 'Deactivate' }}
                </button>
              </td>
            </tr>

            <tr v-if="!filteredStudents.length">
              <td colspan="10" class="text-center py-6 text-gray-400">
                No students found.
              </td>
            </tr>
          </tbody>
        </table>
 <!-- Pagination Controls -->
        <div
          v-if="totalPages > 1"
          class="flex justify-between items-center mt-4 px-2 text-sm text-gray-700"
        >
          <span>
            Showing <b>{{ startItem }}</b> - <b>{{ endItem }}</b> of
            <b>{{ filteredStudents.length }}</b>
          </span>

          <div class="flex space-x-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-lg border',
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
              class="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✨ Modal -->
    <ModalOverlay v-if="showModal">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        {{ editMode ? 'Edit Student' : 'Add Student' }}
      </h2>

      <form @submit.prevent="saveStudent" class="space-y-4">
        <div>
          <label class="block text-xs text-gray-600 mb-1">Student ID</label>
          <input v-model="form.student_id" type="text" class="input" placeholder="Enter Student ID" required />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">First Name</label>
          <input v-model="form.first_name" type="text" class="input" placeholder="Enter first name" required />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">Last Name</label>
          <input v-model="form.last_name" type="text" class="input" placeholder="Enter last name" required />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="Enter email" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Category</label>
            <select v-model="form.category" class="input" required>
              <option value="">Select Type</option>
              <option value="New">New</option>
              <option value="Transferee">Transferee</option>
              <option value="Shiftee">Shiftee</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Status</label>
            <select v-model="form.status" class="input" required>
              <option value="Pending">Pending</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">Year Level</label>
          <select v-model="form.year_level" class="input" required>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            {{ editMode ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </ModalOverlay>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { fetchUsers } from "@/services/apiService";
import TableLoader from "@/components/TableLoader.vue";
import ModalOverlay from "@/components/ModalOverlay.vue";
import { useToast } from "vue-toastification";

const isLoadingUsers = ref(false);
const students = ref([]);
const currentUser = ref(JSON.parse(localStorage.getItem("user")) || {});
const search = ref("");
const filterType = ref("");
const filterYear = ref("");
const yearLevels = [1, 2, 3, 4];

const showModal = ref(false);
const editMode = ref(false);
const form = ref({
  id: null,
  student_id: "",
  first_name: "",
  last_name: "",
  year_level: "1",
  email: "",
  category: "",
  status: "Pending",
  year: "",
});


// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const loadUsers = async () => {
  isLoadingUsers.value = true;
  try {
    const response = await fetchUsers();
    console.log("All Users:", response);

    const adminCourse = currentUser.value?.course?.toLowerCase() || "";
    students.value = response.filter((s) =>
      (s.course || "").toLowerCase() === adminCourse && s.role === "user"
    );
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    isLoadingUsers.value = false;
  }
};

// Activate / Deactivate student
const toggleActiveStatus = async (student) => {
  const action = student.is_deleted === 0 ? "deactivate" : "activate";

  if (!confirm(`Are you sure you want to ${action} this student?`)) return;

  try {
    // ✅ Call backend endpoint
    const response = await toggleActiveUser(student.id);

    // ✅ Update local data with new status
    student.is_deleted = response.user.is_deleted;

    toast.success(
      `Student successfully ${student.is_deleted === 1 ? "deactivated" : "activated"
      }!`
    );
  } catch (error) {
    console.error("Error updating student status:", error);
    toast.error("Failed to update student status.");
  }
};

// Filters
const filteredStudents = computed(() => {
  const searchTerm = search.value.trim().toLowerCase();
  return students.value.filter((s) => {
    const fullName = `${s.first_name?.toLowerCase() || ""} ${s.last_name?.toLowerCase() || ""}`;
    const matchesSearch =
      !searchTerm ||
      fullName.includes(searchTerm) ||
      s.email?.toLowerCase().includes(searchTerm) ||
      s.id?.toString().includes(searchTerm) ||
      s.student_id?.toString().includes(searchTerm);

    const matchesType = !filterType.value || s.category === filterType.value;
    const matchesYear = !filterYear.value || s.year_level == filterYear.value;

    return matchesSearch && matchesType && matchesYear;
  });
});

// Pagination computed
const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage.value));
const startItem = computed(() =>
  filteredStudents.value.length ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0
);
const endItem = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, filteredStudents.value.length)
);
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredStudents.value.slice(start, start + itemsPerPage.value);
});

const goToPage = (page) => (currentPage.value = page);
const prevPage = () => currentPage.value > 1 && currentPage.value--;
const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;

// Modal actions
const openModal = (student = null) => {
  if (student) {
    editMode.value = true;
    form.value = { ...student };
  } else {
    editMode.value = false;
    form.value = {
      id: null,
      student_id: "",
      first_name: "",
      last_name: "",
      year_level: "",
      email: "",
      category: "",
      status: "Pending",
    };
  }
  showModal.value = true;
};
const closeModal = () => (showModal.value = false);

// Save / Update
const saveStudent = async () => {
  const missing = [];
  if (!form.value.first_name.trim()) missing.push("First Name");
  if (!form.value.last_name.trim()) missing.push("Last Name");
  if (!form.value.email.trim()) missing.push("Email");
  if (!form.value.category.trim()) missing.push("Category");

  if (missing.length > 0) {
    toast.error(`Please fill out: ${missing.join(", ")}`);
    return;
  }

  try {
    await saveUpdateUsers(form.value);
    await loadUsers();
    showModal.value = false;
    toast.success(editMode.value ? "Student updated successfully!" : "Student added successfully!");
  } catch (error) {
    console.error(error);
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join("\n");
      toast.error(messages);
    } else {
      toast.error(error.response?.data?.message || "Error saving student");
    }
  }
};

const deleteStudent = (id) => {
  if (confirm("Are you sure you want to delete this student?")) {
    students.value = students.value.filter((s) => s.id !== id);
  }
};

onMounted(loadUsers);
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
