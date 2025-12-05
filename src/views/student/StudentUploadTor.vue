<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Select Curriculum Records
        </h2>

        <!-- Curriculum Selector -->
<div class="relative mb-4 w-full">
    <div
        class="border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer"
        @click="toggleCurriculumDropdown"
    >
        {{ selectedCurriculum?.course?.name ?? 'Select Curriculum' }}
    </div>


            <!-- Dropdown -->
            <div v-if="showCurriculumDropdown"
                class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <input v-model="curriculumSearch" type="text" placeholder="Search curriculum..."
                    class="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none" />

                <ul class="max-h-56 overflow-y-auto">
                    <li v-for="curriculum in filteredCurriculums" :key="curriculum.id"
                        @click="selectCurriculum(curriculum)" class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                        {{ curriculum.course?.name }} ({{ curriculum.course?.code }})
                    </li>
                    <li v-if="!filteredCurriculums.length" class="px-3 py-2 text-gray-400 text-sm">No results found.
                    </li>
                </ul>
            </div>
        </div>

        <!-- File Upload -->
        <div class="bg-white p-6 rounded-lg hover:shadow-md duration-200 mb-6">
            <FileUpload @file-selected="handleFileUpload" :clearSignal="clearTrigger" :isProcessing="isProcessing"
                :isSuccess="isSuccess" />
        </div>

        <div class="mb-5" v-if="subjects.length != 0">
            <StudentCurriculumSubjects :subjects="creditedCurriculumSubjects" />
        </div>


        <!-- Results / Loader -->
        <div class="bg-white rounded-lg shadow px-6 pb-6">
            <div v-if="isProcessing" class="mt-4">
                <OcrLoader :show="isProcessing" />
            </div>

            <div class="flex flex-col" v-else>
                <div v-if="extractedSubjects.length">
                    <StudentExtractedSubjects :torGrades="tor_grades" :curriculumSubjects="subjects" />
                </div>
            </div>

            <!-- Advising Section -->
            <div v-if="advising.first_sem?.length || advising.second_sem?.length"
                class="bg-blue-50 border border-blue-200 rounded-lg mt-6 p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M12 20h9" />
                    </svg>
                    Advising Recommendation
                </h3>

                <!-- 1st Semester -->
                <div v-if="advising.first_sem?.length" class="mb-6">
                    <h4 class="text-md font-semibold text-blue-700 mb-2">First Semester</h4>
                    <table
                        class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
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
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.units }}</td>
                                <td class="px-4 py-2">{{ subject.semester }}</td>
                                <td class="px-4 py-2">{{ subject.year_level }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="text-sm text-gray-500">Total units (1st sem):
                        <span class="font-semibold text-blue-700">
                            {{advising.first_sem.reduce((sum, s) => sum + (parseFloat(s.units) || 0), 0)}}
                        </span>
                    </p>
                </div>

                <!-- 2nd Semester -->
                <div v-if="advising.second_sem?.length">
                    <h4 class="text-md font-semibold text-blue-700 mb-2">Second Semester</h4>
                    <table
                        class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
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
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.units }}</td>
                                <td class="px-4 py-2">{{ subject.semester }}</td>
                                <td class="px-4 py-2">{{ subject.year_level }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="text-sm text-gray-500">Total units (2nd sem):
                        <span class="font-semibold text-blue-700">
                            {{advising.second_sem.reduce((sum, s) => sum + (parseFloat(s.units) || 0), 0)}}
                        </span>
                    </p>
                </div>

                <div v-if="advising.total_units" class="mt-4 text-right text-sm text-gray-600">
                    <p>Total Suggested Load:
                        <span class="font-semibold text-gray-800">{{ advising.total_units }}</span> units
                    </p>
                </div>

                <!-- Remaining Progress Section -->
                <div v-if="remainingProgress">
                    <RemainingYears :remainingProgress="remainingProgress" />
                </div>

            </div>

            <div class="flex flex-col items-end justify-center py-2 text-gray-700">
                <!-- <p>Total Credited Units: <span class="font-bold">{{ totalCreditedUnits }}</span></p> -->
                <button
                    :class="['my-3 p-2 bg-blue-500 hover:bg-blue-600 w-50 rounded-md duration-200 text-white', isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
                    @click="submitCreditedSubjects" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { uploadTor, fetchAllTors, fetchMyTors, saveAdvising, fetchAllCurriculums, fetchAllSubjects, fetchSubjectsByCurriculum } from '@/services/apiService'
import { useToast } from "vue-toastification"
import { useAuthStore } from '@/stores/auth'

import OcrLoader from '@/components/OcrLoader.vue'
import FileUpload from '@/components/FileUpload.vue'
import RemainingYears from '@/components/RemainingYears.vue'
import StudentCurriculumSubjects from '@/components/StudentCurriculumSubjects.vue'
import StudentExtractedSubjects from '@/components/StudentExtractedSubjects.vue'

const auth = useAuthStore()
const toast = useToast()

const torsData = ref([])
const extractedData = ref({})
const isProcessing = ref(false)
const isSubjectsLoading = ref(false);
const isSuccess = ref(false);

const curriculums = ref([])
const showCurriculumDropdown = ref(false)
const selectedCurriculum = ref(null)
const curriculumSearch = ref("")
const clearTrigger = ref(false);
const isSubmitting = ref(false);

const subjects = ref([]);

const extractedSubjects = computed(() => extractedData.value?.analysis?.ocr_records || [])
const totalCreditedUnits = computed(() =>
    extractedSubjects.value
        .filter(s => s.is_credited)
        .reduce((sum, s) => sum + (parseFloat(s.credits) || 0), 0)
)
const advising = computed(() => extractedData.value?.analysis?.advising || {})
const tor_grades = computed(() => extractedData.value?.analysis?.ocr_records || [])
// Computed: Filter curriculums
const filteredCurriculums = computed(() => {
    return curriculums.value.filter(c =>
        c.course?.name?.toLowerCase().includes(curriculumSearch.value.toLowerCase())
    )
})

const creditedCurriculumSubjects = computed(() => {
    // Defensive: ensure curriculum subjects exist
    if (!subjects.value?.length) return []

    // Detect OCR source (some APIs put ocr_records under `analysis`)
    const ocrRecords = tor_grades.value || []

    // Map curriculum subjects with credited info
    return subjects.value.map(sub => {
        const creditedInfo = ocrRecords.find(
            rec => rec.is_credited && Number(rec.credited_id) === Number(sub.id)
        )

        return {
            ...sub,
            credited: !!creditedInfo,
            grade: creditedInfo?.grade ?? null,
            extracted_code: creditedInfo?.code ?? null,
            extracted_title: creditedInfo?.title ?? null,
            extracted_units: creditedInfo?.credits ?? null,
        }
    })
})



// Fetch uploaded TORs
async function getUploadedTor() {
    try {
        let response
        if (auth.user.role === 'admin') {
            response = await fetchAllTors()
        } else {
            response = await fetchMyTors()
        }
        torsData.value = response
    } catch (error) {
        console.error('Error fetching uploaded TOR:', error)
    }
}

// Dropdown controls
const toggleCurriculumDropdown = () => (showCurriculumDropdown.value = !showCurriculumDropdown.value)
const selectCurriculum = async (curriculum) => {
    selectedCurriculum.value = curriculum
    getSubjects(curriculum.id);
    showCurriculumDropdown.value = false
}

// Fetch curriculums
async function getcurriculums() {
    try {
        const res = await fetchAllCurriculums()
        curriculums.value = res
    } catch (error) {
        toast.error("Failed to fetch curriculums")
    }
}

const getSubjects = async (curriculum_id) => {
    isSubjectsLoading.value = true
    try {
        const res = await fetchSubjectsByCurriculum(curriculum_id)
        subjects.value = res;
    } catch (error) {
        console.error('Error fetching subjects:', error)
    } finally {
        isSubjectsLoading.value = false
    }
}


onMounted(() => {
    getUploadedTor()
    getcurriculums()
})

// Handle file upload
async function handleFileUpload(selectedFile) {
    if (!selectedFile) return toast.warning("No file selected.")
    if (!selectedCurriculum.value) return toast.warning("Please select a curriculum first.")

    const confirmProceed = window.confirm(
        `You selected curriculum ID ${selectedCurriculum.value.course.name}. Proceed with this curriculum?`
    )
    if (!confirmProceed) return

    try {
        isProcessing.value = true
        toast.info("Uploading and analyzing your file...")

        const res = await uploadTor(selectedFile, selectedCurriculum.value.id)
        // getSubjects(selectedCurriculum.value.id);
        toast.success(res.message || "File uploaded successfully!")
        extractedData.value = res || {}
        getUploadedTor();
        isSuccess.value = true;
    } catch (error) {
        isSuccess.value = false;
        toast.error(error.response?.data?.message || "Upload failed.")
    } finally {
        isProcessing.value = false
    }
}

// 🧮 Remaining Progress Computation
const remainingProgress = computed(() => {
    const progress = extractedData.value?.analysis?.remaining_progress
    if (!progress) return null

    const total = Number(progress.total_units || 0)
    const credited = Number(progress.credited_units || 0)
    const percent = total > 0 ? ((credited / total) * 100).toFixed(1) : 0
    console.log({
        percent,
        total_units: progress.total_units,
        completed_units: progress.credited_units,
        remaining_units: progress.remaining_units,
        remaining_semesters: progress.estimated_semesters_left,
        remaining_years: progress.estimated_years_left
    })
    return {
        percent,
        total_units: progress.total_units,
        completed_units: progress.credited_units,
        remaining_units: progress.remaining_units,
        remaining_semesters: progress.estimated_semesters_left,
        remaining_years: progress.estimated_years_left
    }
})


// Submit credited subjects
async function submitCreditedSubjects() {
    if (!extractedData.value?.analysis?.id && !extractedData.value?.analysis?.tor_id) {
        toast.warning("No TOR data found.")
        return
    }

    isSubmitting.value = true;

    const payload = {
        tor_id: extractedData.value?.analysis?.id || extractedData.value?.analysis?.tor_id,
        curriculum_id: selectedCurriculum.value.id,
        advising: advising.value,
        ocr_records: extractedSubjects.value.map(s => ({
            code: s.code,
            title: s.title,
            credits: s.credits,
            grade: s.grade,
            percent_grade: s.percent_grade,
            is_credited: s.is_credited || false,
            credited_id: s.credited_id || null,
        }))
    }

    try {
        toast.info("Saving advising and OCR records...")
        const res = await saveAdvising(payload)
        toast.success(res.message || "Advising saved successfully!")
        await getUploadedTor()
        await getSubjects(selectedCurriculum.value.id);
        extractedData.value = {};
        isSuccess.value = false;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to save advising.")
        isSuccess.value = true;
        isSubmitting.value = false;
    } finally {
        // Reset clear trigger to notify FileUpload to clear
        isSubmitting.value = false;
        clearTrigger.value = !clearTrigger.value;
        setTimeout(() => {
            clearTrigger.value = false;
        }, 100);
    }
}
</script>