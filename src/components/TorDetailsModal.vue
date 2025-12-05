<template>
  <div class="fixed inset-0 bg-black/20 z-50 flex justify-center items-start overflow-hidden">
    <div class="bg-white flex gap-2 w-screen overflow-hidden">

      <div class="bg-white shadow-lg w-11/12 md:w-3/4 lg:w-6/6 relative h-screen overflow-y-auto">
        <!-- Close Button -->
        <div class="sticky top-0 z-40 bg-white p-6 shadow-lg">
          <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">
            &times;
          </button>

          <!-- Header -->
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">TOR Details</h2>
          <p class="text-gray-600 text-sm mb-6">
            Student:
            <span class="font-semibold">{{ tor.user?.first_name }} {{ tor.user?.last_name }}</span><br />
            Category:
            <span class="font-semibold">{{ tor.user?.other_info?.category }}</span><br />
            Status:
            <span class="font-semibold">{{ tor.user?.other_info?.status || 'pending' }}</span><br />
            Curriculum:
            <span class="font-semibold">{{ tor.curriculum?.course?.name || 'N/A' }}</span>
          </p>
        </div>


        <div class="mb-5 p-3">
          <CurriculumSubjects :subjects="creditedCurriculumSubjects" />
          <!-- <div class="flex justify-end pe-5 pt-5">
            <button @click="printForCredited" :disabled="!isActionDisabled" class="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200
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
                {{ props.tor.status === 'approved'
                  ? 'Print Credited Subjects'
                  : 'Awaiting Approval...' }}
              </span>
            </button>

          </div> -->
        </div>

        <div class="mb-5 p-3">
          <ExtractedSubjects :torGrades="tor.tor_grades" v-model:torGrades="torGrades"
            :curriculumSubjects="curriculumSubjects" :tor="tor" />
        </div>

        <!-- Advising -->
        <div class="mb-5 p-3">
          <AdvisingSubjects :advising="filteredAdvising" v-model:selectedSemester="selectedSemester"
            v-model:selectedSchoolYear="selectedSchoolYear" />
          <!-- <div class="flex justify-end pe-5 pt-5">
            <button @click="printForAdvising" :disabled="!isActionDisabled" class="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200
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
                {{ props.tor.status === 'approved'
                  ? 'Print Credited Subjects'
                  : 'Awaiting Approval...' }}
              </span>
            </button>

          </div> -->
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-3 p-3 pb-10">
          <button @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Close
          </button>

          <button @click="submitApproveTor" :disabled="isActionDisabled" :class="[
            'px-4 py-2 rounded text-white transition',
            isActionDisabled
              ? 'bg-green-400 cursor-not-allowed opacity-70'
              : 'bg-green-600 hover:bg-green-700'
          ]">
            {{ isSubmitting ? 'Approving...' : 'Approve' }}

          </button>

          <button @click="submitRejectTor" :disabled="isActionDisabled" :class="[
            'px-4 py-2 rounded text-white transition',
            isActionDisabled
              ? 'bg-red-400 cursor-not-allowed opacity-70'
              : 'bg-red-600 hover:bg-red-700'
          ]">
            Reject
          </button>
        </div>
        <!-- 
      <div>
        <RemainingYears :remainingProgress="remainingProgress" />
      </div> -->

      </div>
      <div class="h-screen w-5/12 p-5 flex items-center justify-center">
        <ImageDrag :src="tor.file_path" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { fetchAllSubjects, fetchSubjectsByCurriculum, approveTor, computeRemainingYears, rejectTor } from '@/services/apiService'
import { ref, watch, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import RemainingYears from './RemainingYears.vue'

import CurriculumSubjects from './CurriculumSubjects.vue'
import ExtractedSubjects from './ExtractedSubjects.vue'
import AdvisingSubjects from './AdvisingSubjects.vue'
import ImageDrag from './ImageDrag.vue'

const props = defineProps({
  tor: Object,
  show: Boolean
})

const emit = defineEmits(['close', 'reject', 'refresh'])

const isSubmitting = ref(false)
const toast = useToast()
const isLoading = ref(false)
const torGrades = ref([])
const advising = ref([])
const subjects = ref([])
const selectedSemester = ref('')
const selectedSchoolYear = ref('')
const remainingYearsData = ref(null)
console.log('TOR DETAILS PROP:', props.tor)
const isActionDisabled = computed(() => props.tor?.status !== 'submitted')

const getSubjects = async () => {
  isLoading.value = true
  try {
    const allSubjects = await fetchSubjectsByCurriculum(props.tor.curriculum.id)
    // subjects.value = allSubjects.filter(s => s.curriculum_id === props.tor.curriculum_id)
    subjects.value = allSubjects;
  } catch (error) {
    console.error('Error fetching subjects:', error)
  } finally {
    isLoading.value = false
  }
}

const getRemainingYears = async () => {
  isLoading.value = true
  try {
    const res = await computeRemainingYears(props.tor.id, props.tor.curriculum.id)
    // subjects.value = res.filter(s => s.curriculum_id === props.tor.curriculum_id)
    remainingYearsData.value = res.remaining_progress;
    // subjects.value = res;
  } catch (error) {
    console.error('Error fetching remaining years:', error)
  } finally {
    isLoading.value = false
  }
}

// 🧮 Remaining Progress Computation
const remainingProgress = computed(() => {
  const progress = remainingYearsData.value
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

onMounted(() => {
  // getRemainingYears()
  getSubjects()
  torGrades.value = props.tor.tor_grades || []
  advising.value = props.tor.advising || []
})

// Curriculum subjects from API
const curriculumSubjects = computed(() => subjects.value || [])

// Merge credited info from torGrades into curriculum subjects
const creditedCurriculumSubjects = computed(() => {
  return curriculumSubjects.value.map(sub => {
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
})

// Advising-eligible subjects (connected to curriculum)
// 🧮 Filter advising subjects — remove those already credited
const filteredAdvising = computed(() => {
  if (!advising.value?.length) return []

  const creditedIds = creditedCurriculumSubjects.value
    .filter(sub => sub.credited)
    .map(sub => sub.id)

  return advising.value.filter(a => !creditedIds.includes(a.subject_id))
})

// Emit actions props.tor)

const submitApproveTor = async () => {
  if (!selectedSemester.value) {
    toast.error('Please select a semester before approving.')
    return
  }
  if (!selectedSchoolYear.value) {
    toast.error('Please select a school year before approving.')
    return
  }


  const payload = {
    tor_id: props.tor.id,
    user_id: props.tor.user_id,
    course_id: props.tor.curriculum.course_id,
    tor_grades: torGrades.value, // includes is_credited flags
    advising: filteredAdvising.value.filter(a => a.semester === selectedSemester.value),
    school_year: selectedSchoolYear.value
  }
  
  isSubmitting.value = true

  try {
    await approveTor(payload);
    emit('refresh')
    emit('close')
    toast.success('TOR approved successfully!')
  } catch (error) {
    console.error('Error approving TOR:', error)
    isSubmitting.value = false
  } finally {
    isSubmitting.value = false
  }

}

const submitRejectTor = async () => {
  // 🛑 Ask user for confirmation
  const confirmReject = window.confirm('Are you sure you want to reject this TOR? This action cannot be undone.')
  if (!confirmReject) return

  try {
    // 📨 Send reject request to API
    const response = await rejectTor(props.tor.id)

    // ✅ Show success alert
    toast.success('TOR has been rejected successfully.')

    emit('refresh')
    emit('close')
  } catch (error) {
    console.error(error)
    toast.error('Failed to reject TOR. Please try again.')
    // toast.error('Failed to reject TOR.')
  }
}

const printForCredited = () => {
  const printWindow = window.open('', '_blank')
  // console.log('TOR GRADES:', props.tor.extra)
  const { printTorGrades } = creditedCurriculumSubjects.value.reduce((acc, subject) => {
    if (subject.credited) {
      acc.printTorGrades.push({
        code: subject.code,
        name: subject.name,
        year_level: subject.year_level,
        semester: subject.semester,
        units: subject.units,
        is_credited: subject.credited,
        extracted_code: subject.extracted_code,
        extracted_title: subject.extracted_title,
        extracted_units: subject.units, // assuming extracted units same as subject units
        grade: subject.grade
      });
    }
    return acc;
  }, { printTorGrades: [] });

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
        <h2>Certificate of Registration (COR) for ${semester} Semester Academic Year ${academicYear}</h2>
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

        <p><strong>Total Units:</strong> ${advisingTotalunits}</p>

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
};



</script>
