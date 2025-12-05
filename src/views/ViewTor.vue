<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">
                Transcript of Records Details
            </h2>

            <!-- Loader -->
            <div v-if="isLoading" class="flex justify-center items-center py-10">
                <!-- <OcrLoader :show="true" /> -->
            </div>

            <div v-else>
                <div v-if="subjects.length">
                    <div class="flex justify-between p-2">
                        <h3 class="text-sm font-semibold text-gray-700 mb-2">Curriculum Subjects</h3>
                        <div class="p-1 font-semibold text-center text-white shadow-sm" :class="{
                            'bg-yellow-500': torData.status === 'submitted',
                            'bg-green-600': torData.status === 'approved',
                            'bg-red-600': torData.status === 'rejected',
                        }">
                            {{ torData.status.toUpperCase() }}
                        </div>
                    </div>
                    <StudentCurriculumSubjects :subjects="creditedCurriculumSubjects" />
                </div>

                <!-- <div class="flex justify-end pe-5 pt-5">
                    <button onclick="window.print()"
                        class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 9V2h12v7m-6 4h6m-6 4h6M6 20h12v-6H6v6z" />
                        </svg>
                        Print
                    </button>

                </div> -->

                <div class="flex justify-end pe-5 pt-5" v-if='torData.user?.other_info?.category !== "New"'>
                    <button @click="printForCredited" :disabled="torData.status !== 'approved'" class="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200
                            cursor-pointer
                            text-white
                            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-400
                            bg-indigo-600 hover:bg-indigo-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 9V2h12v7m-6 4h6m-6 4h6M6 20h12v-6H6v6z" />
                        </svg>
                        <span>
                            {{ torData.status === 'approved'
                                ? 'Print Credited Subjects'
                                : 'Awaiting Approval...' }}
                        </span>
                    </button>

                </div>


                <div class="mt-8">
                    <div v-if="torGrades.length">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Extracted TOR Grades</h3>
                        <AdvisingExtractedSubjects :torGrades="torGrades" :curriculumSubjects="subjects" />
                    </div>
                    <div>
                        <AdvisingSubjectsList :advising="advising" />
                        <div class="flex justify-end pe-5 pt-5">
                            <button @click="printForAdvising" :disabled="torData.status !== 'approved'" class="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200
                            cursor-pointer
                            text-white
                            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-400
                            bg-indigo-600 hover:bg-indigo-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 9V2h12v7m-6 4h6m-6 4h6M6 20h12v-6H6v6z" />
                                </svg>
                                <span>
                                    {{ torData.status === 'approved'
                                        ? 'Print Advised Subjects'
                                        : 'Awaiting Approval...' }}
                                </span>
                            </button>

                        </div>
                    </div>
                </div>

                <div v-if="!subjects.length && !torGrades.length && !isLoading" class="text-gray-500 text-center mt-10">
                    No TOR data found for this ID.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchSubjectsByCurriculum, fetchTor, fetchMyInfo } from '@/services/apiService'

import OcrLoader from '@/components/OcrLoader.vue'
import StudentCurriculumSubjects from '@/components/StudentCurriculumSubjects.vue'
import AdvisingExtractedSubjects from '@/components/AdvisingExtractedSubjects.vue'
import AdvisingSubjectsList from '@/components/AdvisingSubjectsList.vue'

const route = useRoute()
const toast = useToast()
const myInfo = ref({})

const torId = ref(route.query.tor)
const torData = ref({})
const subjects = ref([])
const isLoading = ref(false)

const torGrades = computed(() => torData.value?.tor_grades || [])
const advising = computed(() => torData.value?.advising || [])
const schoolYear = computed(() => advising.value[0]?.school_year || '2024-2025')
watch(() => advising.value, (newVal) => {
    console.log('Advising data updated:', newVal)
})

const creditedCurriculumSubjects = computed(() => {
    if (!subjects.value.length) return []
    const ocrRecords = torGrades.value || []

    return subjects.value.map(sub => {
        const creditedInfo = ocrRecords.find(
            rec => rec.is_credited && Number(rec.credited_id) === Number(sub.id)
        )

        return {
            ...sub,
            credited: !!creditedInfo,
            grade: creditedInfo?.grade ?? null,
            extracted_code: creditedInfo?.extracted_code ?? null,
            extracted_title: creditedInfo?.title ?? null,
            extracted_units: creditedInfo?.credits ?? null,
        }
    })
})

const forPrintData = computed(() => {
    return {
        printTorGrades: creditedCurriculumSubjects.value.filter(grade => grade.credited),
    }
})

const printForCredited = () => {
    const printWindow = window.open('', '_blank')
    const { printTorGrades } = forPrintData.value

    if (!printTorGrades.length) {
        toast.info('No credited subjects available to print.')
        return
    }

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
                        <td>${g.is_credited || g.credited ? '✅' : '❌'}</td>
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
                ${printTorGrades.map(s => Number(s.units) || 0).reduce((a, b) => a + b, 0)}
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

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
}

const printForAdvising = () => {
    const printWindow = window.open('', '_blank')
    const yearLevel = myInfo.value?.year_level || '1st'
    const type = myInfo.value?.type || 'Regular'
    const name = myInfo.value?.first_name && myInfo.value?.last_name
        ? `${myInfo.value.first_name} ${myInfo.value.last_name}`
        : 'Student Name'
    const course = myInfo.value?.other_info?.course?.name

    if (!advising?.value?.length) {
        toast.info('No advised subjects to print.')
        return
    }

    const semester = advising.value.semester || '1st'
    const academicYear = advising.value.academic_year || '2025-2026'
    const advisingTotalunits = advising.value.map(sub => Number(sub.subject.units) || 0).reduce((a, b) => a + b, 0)

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

    const advisingPage = `
        ${headerHTML}
        <h2>OFFICE OF THE REGISTRAR
        
        <span style="font-size: 1.5rem; font-weight: 600; display: block;">
        CERTIFICATE OF REGISTRATION
        </span>

        <span style="font-size: 1.5rem; font-weight: 600; display: block;">
        ${semester} Semester, Academic Year 
        </span>
        <span style="font-size: 1.5rem; font-weight: 600; display: block;">
        ${schoolYear.value}
        </span>

        <span style="font-size: 1.25rem; font-weight: 500; display: block; color: #555;">
        </span>
         </h2>
         
        <span><strong>Student Name:</strong> ${name}</span>
        <span style="display: block">Course: ${course}</span>
        <span style="display: block">Student Type: ${type} | Year Level: ${yearLevel}</span>

        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Units</th>
                    <th>Year Level</th>
                    <th>Semester</th>
                </tr>
            </thead>
            <tbody>
                ${advising.value.map(data => `
                    <tr>
                        <td>${data.subject.code}</td>
                        <td>${data.subject.name}</td>
                        <td>${data.subject.units}</td>
                        <td>${data.subject.year_level}</td>
                        <td>${data.subject.semester}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <span><strong>Total Units:</strong> ${advisingTotalunits}</span>

        <div style="margin-top: 50px;">
            <p>Prepared by:</p>
            <p style="margin-top: 40px;">___________________________________</p>
            <div>Academic Adviser Signature</div>
        </div>
        <div class="footer">Generated on ${new Date().toLocaleString()}</div>
    `

    const html = `
        <html>
        <head>
            <title>Advised Subjects</title>
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
            ${advisingPage}
        </body>
        </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
}




async function loadTorData() {
    if (!torId.value) {
        toast.warning('Missing tor_id query parameter.')
        return
    }

    isLoading.value = true
    try {
        const res = await fetchTor(torId.value)
        torData.value = res.data
        // toast.success('TOR data loaded successfully.')

        // fetch curriculum subjects
        const curriculumId = res?.data?.curriculum_id || res?.data?.analysis?.curriculum_id
        if (curriculumId) {
            const subs = await fetchSubjectsByCurriculum(curriculumId)
            console.log(subs)
            subjects.value = subs
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load TOR data.')
    } finally {
        isLoading.value = false
    }
}

watch(forPrintData, (newData) => {
    console.log('Data prepared for printing:', newData)
    console.log('tor grade', torGrades.value)
})

const getMyInfo = async () => {
    try {
        const res = await fetchMyInfo()
        myInfo.value = res.user
    } catch (error) {
        console.error('Failed to fetch user info:', error)
    }
}

onMounted(() => {
    loadTorData()
    getMyInfo()
})
</script>
