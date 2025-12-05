<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 my-4">
            Uploaded Transcript of Records
            <p class="text-sm text-gray-500">Manage and view all uploaded Transcript.</p>
        </h2>


<!-- 🔍 TOR Search + Status Filter -->
<div class="flex flex-wrap items-center gap-2 mb-4">
    <input v-model="searchQuery" type="text" placeholder="Search by TOR ID, Student ID, or Student Name..."
        class="w-full md:w-1/2 px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none" />

    <select v-model="statusFilter" class="px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none">
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
    </select>
</div>

        <!-- Table -->
        <div class="bg-white rounded-lg hover:shadow-md duration-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Uploaded TORs</h3>

            <table class="min-w-full border border-slate-200 text-xs text-gray-700">
                <thead class="bg-gray-100 text-gray-800">
                    <tr>
                        <th class="border border-slate-200 px-4 py-2 text-center">ID</th>
                        <th class="border border-slate-200 px-4 py-2 text-center">Category</th>
                        <th class="border border-slate-200 px-4 py-2 text-center">Course</th>
                        <th class="border border-slate-200 px-4 py-2 text-center">Student ID</th>
                        <th class="border border-slate-200 px-7 py-2 text-center">Uploaded By</th>
                        <th class="border border-slate-200 px-4 py-2 text-center">No. of Credited</th>
                        <th class="border border-slate-200 px-4 py-2 text-center">Status</th>
                        <th class="border border-slate-200 px-4 py-2 text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="tor in paginatedTors" :key="tor.id" class="hover:bg-gray-50">
                        <td class="border border-slate-200 px-4 py-2">{{ tor.id }}</td>
                        <!-- <td class="border border-slate-200 px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                            @click="!isNewStudent(tor) && openImage(tor.file_path)">
                            <span v-if="!isNewStudent(tor)">
                                {{ tor.file_path ? 'Show File' : 'Invalid' }}
                            </span>
                            <span v-else>
                                New Student
                            </span>
                        </td> -->
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.user.other_info?.category || __ }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.curriculum?.course?.name || 'N/A' }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.user.student_id ?? '__' }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.user?.first_name }} {{ tor.user?.last_name }}
                        </td>

                        <td class="border border-slate-200 px-4 py-2">
                            <span v-if="tor.status === 'rejected'">
                                __
                            </span>
                            <span v-else>
                                <!-- Show credited summary -->
                                {{ getCreditedSummary(tor.tor_grades) }}
                            </span>
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            <span :class="{
                                'px-2 py-1 rounded-full text-white text-xs font-semibold': true,
                                'bg-gray-400': tor.status === 'submitted',
                                'bg-blue-500': tor.status === 'processing',
                                'bg-yellow-400 text-gray-800': tor.status === 'advising',
                                'bg-green-500': tor.status === 'done' || tor.status === 'approved',
                                'bg-red-500': tor.status === 'rejected' || tor.status === 'failed'
                            }">
                                {{ tor.status }}
                            </span>
                        </td>
                        <td class="flex items-center border border-slate-200 px-4 py-2 space-x-2 text-xs">
                            <button @click="openDetails(tor)"
                                class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 cursor-pointer">
                                View Details
                            </button>
                            <button v-if="tor.status === 'approved' && tor.user.other_info?.category !== 'New'" @click="printForCredited(tor)" class="inline-flex items-center px-2 py-1 rounded shadow-md transition-all duration-200
                            cursor-pointer
                            text-white
                            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-400
                            bg-indigo-600 hover:bg-indigo-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 9V2h12v7m-6 4h6m-6 4h6M6 20h12v-6H6v6z" />
                                </svg>
                                <span>PRINT CREDITED</span>
                            </button>
                            <button
                            v-if="tor.status === 'approved' && tor.user.other_info?.category !== 'New'"
                            @click="goToProspectus(tor)"
                            class="inline-flex items-center px-2 py-1 rounded shadow-md transition-all duration-200
                                    cursor-pointer text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-400
                                    bg-indigo-600 hover:bg-indigo-700"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 9V2h12v7m-6 4h6m-6 4h6M6 20h12v-6H6v6z" />
                            </svg>
                            <span>PRINT PROSPECTUS</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="flex justify-end items-center mt-4 space-x-2">
                <button :disabled="currentPage === 1" @click="currentPage--"
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                    Prev
                </button>
                <span class="px-2 text-xs text-gray-600">
                    Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button :disabled="currentPage === totalPages" @click="currentPage++"
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                    Next
                </button>
            </div>

            <!-- Modal -->
            <TorDetailsModal v-if="showModal" :tor="selectedTor" @close="showModal = false"
                @refresh="getUploadedTor()" />
        </div>
    </div>
</template>

<script setup>
const statusFilter = ref('submitted') // ✅ default to pending
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { fetchAllTors, fetchMyTors, fetchAllCurriculums, approveTor, fetchSubjectsByCurriculum } from '@/services/apiService'
import { useAuthStore } from '@/stores/auth'
import TorDetailsModal from '@/components/TorDetailsModal.vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()

const route = useRoute();
const showModal = ref(false)
const selectedTor = ref(null)
const subjects = ref([])
const auth = useAuthStore()
const torsData = ref([])
const curriculums = ref([])
const selectedCurriculum = ref(null)
const curriculumSearch = ref('')
const showCurriculumDropdown = ref(false)
const searchQuery = ref(route.query.tor || '')
const currentPage = ref(1)
const perPage = 8;

function goToProspectus(tor) {
  const programName = tor.program_name || '';
  const url = `/admin/prospectus/${tor.user.id}?programName=${encodeURIComponent(programName)}`;
  window.open(url, '_blank'); // opens in a new tab
}


const isNewStudent = (data) => {
    return data.user.other_info.category === 'New'
}

const getCreditedSummary = (grades) => {
    if (!grades || !grades.length) return '0/0 subjects credited'
    const creditedCount = grades.filter(g => g.is_credited).length
    return `${creditedCount}/${grades.length} subjects credited`
}

// 🔍 Filtered by curriculum + search
const filteredTors = computed(() => {
    let result = torsData.value

    // 🔹 Filter by admin course if admin
    if (auth.user.role === 'admin') {
        const adminCourseCode = auth.user.course?.code || auth.user.course || ''
        result = result.filter(t => {
            const curriculum = t.curriculum || curriculums.value.find(c => c.id === t.curriculum_id)
            const courseCode = curriculum?.course?.code || curriculum?.course || ''
            return courseCode.toLowerCase() === adminCourseCode.toLowerCase()
        })
    }

    // 🔹 Filter by status
    if (statusFilter.value) {
        result = result.filter(t => {
            // Map "pending" to your actual field if needed (example: 'submitted' means processing)
            if (statusFilter.value === 'pending') return t.status === 'submitted' || t.status === 'processing'
            return t.status === statusFilter.value
        })
    }

    // 🔹 Filter by search query
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(t =>
            String(t.id).includes(q) ||
            String(t.user.student_id).includes(q) ||
            `${t.user.first_name} ${t.user.last_name}`.toLowerCase().includes(q)
        )
    }

    return result
})


// Pagination
const totalPages = computed(() => Math.ceil(filteredTors.value.length / perPage))
const paginatedTors = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return filteredTors.value.slice(start, start + perPage)
})

const openDetails = (tor) => {
    selectedTor.value = tor
    showModal.value = true
}

// Fetch Data
const getUploadedTor = async () => {
    try {
        const response = auth.user.role === 'admin' ? await fetchAllTors() : await fetchMyTors()
        torsData.value = response

        // 🔹 Debug admin course
        if (auth.user.role === 'admin') {
            console.log('🟦 Admin User:', auth.user)
            console.log('🟦 Admin Course Object:', auth.user.course)
        }

        console.log('SAMPLE TOR DATA:', response[0])
    } catch (error) {
        console.error('Error fetching uploaded TOR:', error)
    }
}



const getCurriculums = async () => {
    try {
        const response = await fetchAllCurriculums()
        curriculums.value = response
    } catch (error) {
        console.error('Error fetching curriculums:', error)
    }
}

const selectCurriculum = (curriculum) => {
    selectedCurriculum.value = curriculum
    showCurriculumDropdown.value = false
    curriculumSearch.value = ''
}

const filteredCurriculums = computed(() => {
    if (!curriculumSearch.value) return curriculums.value
    const search = curriculumSearch.value.toLowerCase()
    return curriculums.value.filter(c =>
        c.course?.name.toLowerCase().includes(search)
    )
})

const printForCredited = async (tor) => {
    // Ensure reactive/composable data exist
    const isLoading = ref(false)
    const subjects = ref([])
    const curriculumSubjects = ref([])
    const torGrades = ref(tor?.tor_grades || [])

    // Step 1: Fetch subjects from curriculum
    const getSubjects = async () => {
        isLoading.value = true
        try {
            const allSubjects = await fetchSubjectsByCurriculum(tor.curriculum.id)
            subjects.value = allSubjects
            curriculumSubjects.value = allSubjects
        } catch (error) {
            console.error('Error fetching subjects:', error)
            toast.error('Failed to load subjects.')
        } finally {
            isLoading.value = false
        }
    }

    // Wait for subjects before computing anything
    await getSubjects()

    // Step 2: Compute credited subjects
    const creditedCurriculumSubjects = curriculumSubjects.value.map(sub => {
        const creditedInfo = torGrades.value.find(
            t => t.is_credited && Number(t.credited_id) === Number(sub.id)
        )
        return {
            ...sub,
            credited: !!creditedInfo,
            grade: creditedInfo?.grade || null,
            extracted_code: creditedInfo?.extracted_code || null,
            extracted_title: creditedInfo?.title || null,
        }
    })
    console.log({creditedCurriculumSubjects})

    // Step 3: Prepare credited subjects for printing
    const printTorGrades = creditedCurriculumSubjects
        .filter(sub => sub.credited)
        .map(subject => ({
            code: subject.code,
            name: subject.name,
            year_level: subject.year_level,
            semester: subject.semester,
            units: subject.units,
            is_credited: subject.credited,
            extracted_code: subject.extracted_code,
            extracted_title: subject.extracted_title,
            extracted_units: subject.units, // assuming same units
            grade: subject.grade
        }))

    console.log({ printTorGrades })
    if (!printTorGrades.length) {
        toast.info('No credited subjects available to print.')
        return
    }

    // Step 4: Generate printable HTML
    const headerHTML = `
        <div class="header">
            <img src="https://res.cloudinary.com/dbkupn4he/image/upload/v1761050174/ccis-logo_wuw5em.jpg" alt="CCIS Logo" />
            <div class="text">
                <h1>Agusan del Sur State College of Agriculture and Technology</h1>
                <p>College of Computing and Information Sciences</p>
            </div>
            <img src="https://res.cloudinary.com/dbkupn4he/image/upload/v1761050674/asscat-logo_xdzyiy.jpg" alt="ASSCAT Logo" />
        </div>
    `

    const creditedPage = `
        ${headerHTML}
        <h2>Transcript of Records — Credited Subjects</h2>
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Year Level</th>
                    <th>Semester</th>
                    <th>Units</th>
                    <th>Credited</th>
                    <th>Extracted Code</th>
                    <th>Credited Title</th>
                    <th>Extracted Units</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>
                ${printTorGrades.map(g => `
                    <tr>
                        <td>${g.code || ''}</td>
                        <td>${g.name || ''}</td>
                        <td>${g.year_level || '-'}</td>
                        <td>${g.semester || '-'}</td>
                        <td>${g.units ?? ''}</td>
                        <td>${g.is_credited ? '✅' : '❌'}</td>
                        <td>${g.extracted_code || '-'}</td>
                        <td>${g.extracted_title || '-'}</td>
                        <td>${g.extracted_units || '-'}</td>
                        <td>${g.grade ?? ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 30px;">
            <p><strong>Total Credited Subjects:</strong> ${printTorGrades.length}</p>
            <p><strong>Total Units:</strong> 
                ${printTorGrades.reduce((sum, s) => sum + (Number(s.units) || 0), 0)}
            </p>
            <p style="margin-top: 50px;">___________________________________</p>
            <div>Chairperson Signature Over Printed Name</div>
        </div>
        <div class="footer">Generated on ${new Date().toLocaleString()}</div>
    `

    const html = `
        <html>
        <head>
            <title>Credited Subjects</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                h2 { text-align: center; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
                th { background: #f3f4f6; }
                tr:nth-child(even) { background-color: #fafafa; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                .header { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px; }
                .header img { height: 60px; width: 60px; object-fit: contain; }
                .header .text { text-align: center; }
                .header h1 { color: #065f46; font-weight: bold; font-size: 16px; margin: 0; }
                .header p { color: #444; font-size: 13px; margin: 0; }
            </style>
        </head>
        <body>
            ${creditedPage}
        </body>
        </html>
    `

    // Step 5: Open print window
    const printWindow = window.open('', '_blank')
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
}


// Open File
const openImage = (filePath) => {
    if (!filePath) return
    window.open(filePath, '_blank')
}

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
    if (!e.target.closest('.relative')) showCurriculumDropdown.value = false
}

watch(() => route.query, (newVal) => {
    if (newVal.tor) {
        searchQuery.value = newVal.tor
    }
})

onMounted(() => {
    getUploadedTor()
    getCurriculums()
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>
