<template>
    <div class="p-3 text-sm">
        <!-- Header -->
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">
            Curriculum and Subjects
        </h2>

        <!-- Curriculum Dropdown -->
        <div class="max-w-md mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">
                Select Curriculum
            </label>
            <select v-model="selectedCurriculum" @change="onCurriculumChange"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                <option value="" disabled>Select Curriculum</option>
                <option v-for="curr in curriculums" :key="curr.id" :value="curr.id">
                    {{ curr.course.name }} — {{ curr.year_start }}–{{ curr.year_end }}
                </option>
            </select>
        </div>

        <!-- Subjects Table -->
        <div class="flex items-center py-2 justify-between">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                Subjects under Selected Curriculum
            </h3>
            <button
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-xs font-medium cursor-pointer">
                + ADD SUBJECT
            </button>
        </div>

        <div class="bg-white rounded-lg shadow px-6 pb-6 h-[300px] overflow-y-auto">

            <!-- Loader -->
            <div v-if="isLoadingSubjects" class="mt-4">
                <TableLoader :rows="5" />
            </div>

            <div class="flex h-full flex-col" v-else>
                <table v-if="subjects.length"
                    class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden">
                    <thead class="bg-white sticky top-0">
                        <tr>
                            <th class="px-4 py-2 text-left">Code</th>
                            <th class="px-4 py-2 text-left">Subject Name</th>
                            <th class="px-4 py-2 text-left">Units</th>
                            <th class="px-4 py-2 text-left">Semester</th>
                            <th class="px-4 py-2 text-left">Year Level</th>
                            <th class="px-4 py-2 text-left">Prerequisites</th>
                            <th class="px-4 py-2 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="subject in subjects" :key="subject.id"
                            class="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition">
                            <td class="px-4 py-2">{{ subject.code }}</td>
                            <td class="px-4 py-2">{{ subject.name }}</td>
                            <td class="px-4 py-2">{{ subject.units }}</td>
                            <td class="px-4 py-2">{{ subject.semester || '—' }}</td>
                            <td class="px-4 py-2">{{ subject.year_level || '—' }}</td>
                            <td class="px-4 py-2">
                                <span v-if="subject.prerequisites?.length">
                                    {{subject.prerequisites.map(p => p.code).join(', ')}}
                                </span>
                                <span v-else>—</span>
                            </td>
                            <td class="px-4 py-2">
                                <button
                                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Empty State -->
                <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-center">No subjects found for the selected curriculum.</p>
                </div>
            </div>
            <!-- Subjects Table -->
        </div>

        <!-- Tor Dropdown -->
        <div class="flex gap-2 my-6 bg-white p-4 rounded-lg hover:shadow-md w-full h-[600px]">
            <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Select Transcript of Records (TOR)
                </label>
                <div class="flex gap-2">
                    <select v-model="selectedTor"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                        <option value="" disabled>Select Transcript Of Records</option>
                        <option v-for="tor in torsData" :key="tor.id" :value="tor.id">
                            {{ tor.user?.first_name }} {{ tor.user?.last_name }} — {{ new
                                Date(tor.created_at).toLocaleDateString() }}
                        </option>
                    </select>
                    <button
                        class="w-2/6 text-white font-bold bg-blue-500 rounded-md hover:bg-blue-600 cursor-pointer duration-200"
                        @click="processTor()" :disabled="isProcessing">
                        {{ isProcessing ? 'Processing...' : 'Process TOR' }}
                    </button>
                </div>

                <h3 class="py-3 font-bold">Extracted Subject</h3>

                <div class="bg-white rounded-lg shadow px-6 pb-6">
                    <!-- Loader -->
                    <div v-if="isProcessing" class="mt-4">
                        <TableLoader :rows="5" />
                    </div>

                    <div class="flex flex-col h-[300px] overflow-y-auto" v-else>
                        <div v-if="extractedSubjects.length">
                            <table
                                class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden">
                                <thead class="bg-white sticky top-0">
                                    <tr>
                                        <th class="px-4 py-2 text-left">Code</th>
                                        <th class="px-4 py-2 text-left">Subject Name</th>
                                        <th class="px-4 py-2 text-left">Units</th>
                                        <th class="px-4 py-2 text-left">Credited</th>
                                        <th class="px-4 py-2 text-left">Credited To</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="subject in extractedSubjects" :key="subject.id"
                                        class="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition">
                                        <td class="px-4 py-2">{{ subject.code }}</td>
                                        <td class="px-4 py-2">{{ subject.title }}</td>
                                        <td class="px-4 py-2">{{ subject.credits }}</td>
                                        <td class="px-4 py-2">{{ subject.grade }}</td>
                                        <td class="px-4 py-2">
                                            <!-- {{ subject.is_credited }} -->
                                            <input type="checkbox" v-model="subject.is_credited" />
                                        </td>
                                        <!-- <td class="px-4 py-2">{{ subject.credited_code }}</td> -->
                                        <td class="px-4 py-2">
                                            <!-- <input type="checkbox" v-model="subject.is_credited" class="mr-2" /> -->
                                            <p v-if="!subject.is_credited && !subject.credited_id"></p>
                                            <select v-model="subject.credited_id" v-else
                                                class="border border-gray-300 rounded px-2 py-1 text-xs w-full"
                                                :disabled="!subject.is_credited">
                                                <option value="" disabled>Select subject</option>
                                                <option v-for="s in subjects" :key="s.id" :value="s.id">
                                                    {{ s.code }}
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- Empty State -->
                        <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p class="text-center">No subjects found.</p>
                        </div>
                    </div>
                    <!-- Subjects Table -->


                    <div class="flex flex-col items-end justify-center py-2 text-gray-700">
                        <p>Total Credited Units: <span class="font-bold">{{ totalCreditedUnits }}</span></p>
                        <button
                            class="my-3 p-2 bg-blue-500 hover:bg-blue-600 w-50 cursor-pointer rounded-md duration-200 text-white"
                            @click="submitCreditedSubjects">
                            SUBMIT
                        </button>
                    </div>
                </div>
            </div>

            <!-- Image Preview -->
            <div
                class="w-5/12 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center justify-center">
                <!-- When image is not yet selected -->
                <div v-if="!imageUrl"
                    class="flex flex-col items-center justify-center w-full h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-gray-400 mb-2" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 11l2.293 2.293a1 1 0 001.414 0L16 10m-8 4h8" />
                    </svg>
                    <p class="text-gray-500 text-sm">No image selected</p>
                </div>

                <!-- When image is selected -->
                <div v-else
                    class="relative w-full h-full hover:shadow-md duration-200 cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
                    title="Click to view full image" @click="openFile()">
                    <img :src="imageUrl" alt="Preview" class="object-contain w-full h-full" />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchAllCurriculums, fetchAllSubjects, fetchAllTors, Tesseract, saveGrades } from '@/services/apiService';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';

import TableLoader from '@/components/TableLoader.vue';

const toast = useToast();
const isLoadingCurriculums = ref(false);
const isLoadingSubjects = ref(false);
const isProcess = ref(false);
const isProcessing = ref(false);

const route = useRoute();
const curriculums = ref([])
const subjects = ref([])
const selectedCurriculum = ref('');
const torsData = ref([]);
const selectedTor = ref(null);
const imageUrl = ref('');
const extractedData = ref("");

const ADMIN_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// When curriculum changes → fetch related subjects
const onCurriculumChange = async () => {
    isLoadingSubjects.value = true;
    try {
        const allSubjects = await fetchAllSubjects()
        subjects.value = allSubjects.filter(
            (s) => s.curriculum_id === selectedCurriculum.value
        )
    } catch (error) {
        console.error('Error fetching subjects:', error)
    } finally {
        isLoadingSubjects.value = false;
    }
}


// Fetch uploaded TORs
const getUploadedTor = async () => {
    try {
        const response = await fetchAllTors()
        torsData.value = response
    } catch (error) {
        console.error('Error fetching uploaded TOR:', error)
    }
}

// Fetch uploaded TORs
const getAllCurriculums = async () => {
    try {
        const response = await fetchAllCurriculums()
        curriculums.value = response
    } catch (error) {
        console.error('Error fetching curriculums:', error)
    }
}

const processTor = async () => {

    if (!selectedCurriculum.value) {
        toast.error("No curriculum selected.");
        return;
    }

    if (!selectedTor.value) {
        toast.error("No TOR image selected.");
        return;
    }

    isProcessing.value = true;

    console.log(selectedTor.value)

    try {
        const data = await Tesseract(selectedTor.value, selectedCurriculum.value);
        extractedData.value = data;
        console.log("✅ OCR Result:", data.text);
        alert("✅ OCR processing completed! Check console for extracted text.");
    } catch (error) {
        console.error("❌ OCR Error:", error);
        alert("Failed to process TOR. See console for details.");
    } finally {
        isProcessing.value = false;
    }
};

const extractedSubjects = computed(() => {
    return extractedData.value.records || []
});

// ✅ New computed property: total credited units
const totalCreditedUnits = computed(() => {
    return extractedSubjects.value
        .filter(subj => subj.is_credited && subj.credited_id) // Only count if credited and has a credited_id
        .reduce((sum, subj) => sum + (Number(subj.credits) || 0), 0);
});

const submitCreditedSubjects = async () => {
    // Filter only checked subjects with a selected credited_id
    const recordsToSubmit = extractedSubjects.value.filter(
        subj => subj.is_credited && subj.credited_id
    );

    if (!recordsToSubmit.length) {
        toast.error("No credited subjects selected for submission.");
        return;
    }

    try {
        // Example POST request to your API
        const response = await saveGrades(selectedTor.value, recordsToSubmit);

        toast.success("Credited subjects submitted successfully!");
        console.log("Submitted data:", response);

    } catch (error) {
        console.error("Submission failed:", error);
        toast.error("Failed to submit credited subjects. See console for details.");
    }
};


const openFile = () => {
    if (!imageUrl.value) return;
    window.open(imageUrl.value, '_blank')
}

// on tor change, update image preview
watch(selectedTor, (newVal) => {
    const selected = torsData.value.find(tor => tor.id === newVal);
    if (selected) {
        imageUrl.value = selected.file_path;
    } else {
        imageUrl.value = '';
    }
});

// Fetch curriculums on mount
onMounted(async () => {
    getAllCurriculums();
    getUploadedTor();
})
</script>
