<template>
  <div class="p-4">
    <!-- Print Button -->
    <div class="flex justify-end mb-4">
      <button
        @click="printTable"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 17H7v-6h10v6zm0-8H7V3h10v6zM5 21h14v-4H5v4z"/>
        </svg>
        Print
      </button>
    </div>
    <!-- Curriculum Table -->
    <div class="overflow-x-auto">
      <div v-for="(semesters, year) in groupedSubjects" :key="year" class="mb-6">
        <h2 class="font-bold text-lg mb-2">{{ yearLabel(year) }}</h2>

        <div v-for="(subjects, semester) in semesters" :key="semester" class="mb-4">
          <h3 class="font-semibold mb-1">{{ semester }} Semester</h3>
          <table class="w-full border-collapse border border-gray-400 text-sm">
            <thead class="bg-blue-600 text-white">
              <tr>
                <th class="border p-1">Grade</th>
                <th class="border p-1">Descriptive Title</th>
                <th class="border p-1">Course No.</th>
                <th class="border p-1">LEC</th>
                <th class="border p-1">LAB</th>
                <th class="border p-1">Units</th>
                <th class="border p-1">Pre-requisite(s)</th>
                <th class="border p-1">Co-requisite(s)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(subject, index) in subjects"
                :key="subject.id"
                :class="[
                  index % 2 === 0 ? 'bg-gray-100' : '',
                  subject.grade ? 'bg-green-100 font-bold' : ''
                ]"
              >
                <td class="border p-1 text-center">{{ subject.grade || subject.status }}</td>
                <td class="border p-1">{{ subject.name }}</td>
                <td class="border p-1 text-center">{{ subject.code }}</td>
                <td class="border p-1 text-center">{{ subject.lec || 0 }}</td>
                <td class="border p-1 text-center">{{ subject.lab || 0 }}</td>
                <td class="border p-1 text-center">{{ subject.units || 0 }}</td>
                <td class="border p-1 text-center">
                  <span v-if="subject.prerequisites && subject.prerequisites.length">
                    {{ subject.prerequisites.map(p => p.code).join(', ') }}
                  </span>   
                  <span v-else>-</span>
                </td>
                <td class="border p-1 text-center">
                  <span v-if="subject.corequisites && subject.corequisites.length">
                    {{ subject.corequisites.map(c => c.code).join(', ') }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
              <tr class="font-bold bg-blue-200">
                <td colspan="3" class="border p-1 text-right">Total</td>
                <td class="border p-1 text-center">{{ totalLEC(subjects) }}</td>
                <td class="border p-1 text-center">{{ totalLAB(subjects) }}</td>
                <td class="border p-1 text-center">{{ totalUnits(subjects) }}</td>
                <td colspan="2" class="border p-1"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  subjects: { type: Array, default: () => [] },
  programName: { type: String, default: '' },
  logoUrl: { type: String, default: '/assets/asscat-logo.jpg' }
});

const groupedSubjects = computed(() => {
  const grouped = {};
  props.subjects.forEach(s => {
    const year = s.year_level || 1;
    const semester = s.semester || '1st';
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][semester]) grouped[year][semester] = [];
    grouped[year][semester].push(s);
  });
  return grouped;
});

const yearLabel = (year) => {
  const suffixes = { 1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth' };
  return `${suffixes[year] || year} Year`;
};

const totalLEC = (subjects) => subjects.reduce((sum, s) => sum + (s.lec || 0), 0);
const totalLAB = (subjects) => subjects.reduce((sum, s) => sum + (s.lab || 0), 0);
const totalUnits = (subjects) => subjects.reduce((sum, s) => sum + (s.units || 0), 0);

const printTable = () => {
  const printContent = document.querySelector('.overflow-x-auto').innerHTML;
  const printWindow = window.open('', '', 'width=1000,height=800');

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Curriculum</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header { text-align: center; }
          .header img { width: 80px; margin-bottom: 10px; }
          h1,h2,h3,p{margin:2px;} 
          h1{font-size:18px;font-weight:bold;} 
          h2{font-size:16px;} 
          h3{font-size:14px;font-weight:bold;} 
          p{font-size:12px;}
          table { width:100%; border-collapse: collapse; margin-top:20px; }
          th,td{border:1px solid black; padding:4px; text-align:center; font-size:12px; }
          th{background-color:#4f81bd;color:white;}
          tbody tr:nth-child(even){background-color:#f0f0f0;}
          tfoot tr{background-color:#d9e1f2;font-weight:bold;}
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${props.logoUrl}" alt="Logo" />
          <h1>Republic of the Philippines</h1>
          <h2>AGUSAN DEL SUR STATE COLLEGE OF AGRICULTURE AND TECHNOLOGY</h2>
          <h2>COLLEGE OF ENGINEERING AND INFORMATION TECHNOLOGY</h2>
          <p>Bunawan, Agusan del Sur</p>
          <h3>${props.programName || 'Bachelor Program'}</h3>
          <p>Revised Curriculum to conform with</p>
          <p>CMO NO. 25 Series 2015 and CMO NO. 20 Series 2013</p>
          <p>Effective AY 2022-2023</p>
          <h3>I. Program of Study</h3>
        </div>
        ${printContent.replace(/`/g, '\\`')}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};
</script>
