<template>
    <div class="p-6 bg-white rounded-xl shadow-md">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 animate-bounce-slow" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2v4m8 0v-4c0-1.104-.896-2-2-2s-2 .896-2 2v4M5 20h14M12 4v4" />
            </svg>
            Request for Advising
        </h2>

        <!-- Curriculum Selector -->
        <div class="relative mb-6 w-full sm:w-1/2">
            <div class="border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer flex justify-between items-center hover:border-blue-400 transition"
                @click="toggleCurriculumDropdown">
                <span>{{ selectedCurriculum?.course?.name ?? 'Select Curriculum' }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <!-- Dropdown -->
            <div v-if="showCurriculumDropdown"
                class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                <input v-model="curriculumSearch" type="text" placeholder="Search curriculum..."
                    class="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none" />

                <ul class="max-h-56 overflow-y-auto">
                    <li v-for="curriculum in filteredCurriculums" :key="curriculum.id"
                        @click="selectCurriculum(curriculum)"
                        class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm transition">
                        {{ curriculum.course?.name }} ({{ curriculum.year_start }} - {{ curriculum.year_end }})
                    </li>
                    <li v-if="!filteredCurriculums.length" class="px-3 py-2 text-gray-400 text-sm">
                        No results found.
                    </li>
                </ul>
            </div>
        </div>

        <!-- Curriculum Subjects Display (Filtered) -->
        <div class="mb-5" v-if="filteredSubjects.length">
            <CurriculumForAdvising :subjects="filteredSubjects" />
        </div>

        <!-- Advising Result -->
        <div v-if="subjects.length != 0">
            <div class="flex justify-end mb-5">
                <button @click="handleRequestAdvising"
                    class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.03] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isLoading">

                    <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-pulse" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4"
                            d="M4 12a8 8 0 018-8" />
                    </svg>

                    {{ isLoading ? 'Requesting...' : 'Request Advising' }}
                </button>
            </div>

            <!-- === First Semester Advising === -->
            <div v-if="advising.first_sem?.length">
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
                        <tr v-for="subject in advising.first_sem" :key="subject.id"
                            class="odd:bg-white even:bg-blue-50">
                            <td class="px-4 py-2">{{ subject.code }}</td>
                            <td class="px-4 py-2">{{ subject.name }}</td>
                            <td class="px-4 py-2">{{ subject.units }}</td>
                            <td class="px-4 py-2">{{ subject.semester }}</td>
                            <td class="px-4 py-2">{{ subject.year_level }}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="text-sm text-gray-500">
                    Total units (1st sem):
                    <span class="font-semibold text-blue-700">
                        {{ advising.first_sem.reduce((sum, s) => sum + (parseFloat(s.units) || 0), 0) }}
                    </span>
                </p>
            </div>

            <!-- === Second Semester Advising === -->
            <div v-if="advising.second_sem?.length" class="mt-6">
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
                        <tr v-for="subject in advising.second_sem" :key="subject.id"
                            class="odd:bg-white even:bg-blue-50">
                            <td class="px-4 py-2">{{ subject.code }}</td>
                            <td class="px-4 py-2">{{ subject.name }}</td>
                            <td class="px-4 py-2">{{ subject.units }}</td>
                            <td class="px-4 py-2">{{ subject.semester }}</td>
                            <td class="px-4 py-2">{{ subject.year_level }}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="text-sm text-gray-500">
                    Total units (2nd sem):
                    <span class="font-semibold text-blue-700">
                        {{ advising.second_sem.reduce((sum, s) => sum + (parseFloat(s.units) || 0), 0) }}
                    </span>
                </p>
            </div>

        </div>

        <!-- Loader -->
        <div v-if="isLoading && !advising.first_sem?.length" class="flex justify-center items-center mt-6">
            <TableLoader :rows="6" />
        </div>

        <div class="flex justify-end pe-5" v-if="advising.first_sem">
            <button
                class="w-52 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed duration-200 cursor-pointer p-2 text-white rounded-md flex items-center justify-center gap-2"
                @click="handleSubmit" :disabled="isSubmitting">
                <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>{{ isSubmitting ? "Submitting..." : "SUBMIT" }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from "vue-toastification"
import { fetchAllCurriculums, fetchSubjectsByCurriculum, newAdvising } from '@/services/apiService'
import CurriculumForAdvising from '@/components/CurriculumForAdvising.vue'

const toast = useToast()

const isLoadingSubject = ref(false)
const curriculums = ref([])
const showCurriculumDropdown = ref(false)
const selectedCurriculum = ref(null)
const curriculumSearch = ref("")
const subjects = ref([])
const advising = ref({})
const isLoading = ref(false)
const isSubmitting = ref(false)

/* ⭐ New filtering states */
const selectedYear = ref("")        // empty = include 1-4
const selectedSemester = ref("")    // empty = include 1st & 2nd sem


/* ⭐ Filtered subjects computed */
const filteredSubjects = computed(() => {
    return subjects.value.filter(s => {
        // Include all years (1-4) if selectedYear is empty, otherwise filter by selectedYear
        const yearMatch = selectedYear.value
            ? s.year_level == selectedYear.value
            : ["1","2","3","4"].includes(s.year_level?.toString())

        // Include second semester or first semester depending on selectedSemester
        const semMatch = selectedSemester.value
            ? s.semester == selectedSemester.value
            : ["1st","2nd"].includes(s.semester)

        return yearMatch && semMatch
    })
})


const filteredCurriculums = computed(() =>
    curriculums.value.filter(c =>
        c.course?.name?.toLowerCase().includes(curriculumSearch.value.toLowerCase())
    )
)

const toggleCurriculumDropdown = () => (showCurriculumDropdown.value = !showCurriculumDropdown.value)

const selectCurriculum = async curriculum => {
    selectedCurriculum.value = curriculum
    showCurriculumDropdown.value = false
    getSubjects(curriculum.id)
}

const getCurriculums = async () => {
    try {
        curriculums.value = await fetchAllCurriculums()
    } catch {
        toast.error("Failed to load curriculums")
    }
}

const getSubjects = async curriculum_id => {
    isLoadingSubject.value = true
    try {
        subjects.value = await fetchSubjectsByCurriculum(curriculum_id)
    } catch {
        toast.error("Failed to fetch subjects")
    } finally {
        isLoadingSubject.value = false
    }
}

const handleRequestAdvising = async () => {
    if (!selectedCurriculum.value) {
        return toast.warning("Please select a curriculum first.")
    }

    isLoading.value = true

    try {
        const result = await newAdvising(selectedCurriculum.value.id)
        advising.value = result
        toast.success("Advising generated successfully!")
    } catch (error) {
        console.error(error)
        toast.error("Failed to generate advising.")
    } finally {
        isLoading.value = false
    }
}
const handleSubmit = async () => {
    try {
        isSubmitting.value = true
        await newAdvising(selectedCurriculum.value.id)
        toast.success("Advising request submitted successfully!")
        advising.value = {}
    } catch (error) {
        toast.error("Something went wrong while submitting.")
    } finally {
        isSubmitting.value = false
    }
}

onMounted(getCurriculums)
</script>
