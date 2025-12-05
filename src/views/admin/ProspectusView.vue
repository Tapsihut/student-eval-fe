<template>
  <div class="p-4">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-gray-500">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
      <p>Loading prospectus data...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

    <!-- Prospectus Table -->
    <div v-else>
      <div class="mb-4 text-center">
        <h1 class="font-bold text-xl">Republic of the Philippines</h1>
        <h2 class="font-semibold">AGUSAN DEL SUR STATE COLLEGE OF AGRICULTURE AND TECHNOLOGY</h2>
        <h2 class="font-semibold">COLLEGE OF ENGINEERING AND INFORMATION TECHNOLOGY</h2>
        <p>Bunawan, Agusan del Sur</p>
        <h2 class="font-bold mt-2">{{ curriculum?.name || 'Curriculum' }}</h2>
        <p>Revised Curriculum to conform with CMO NO. 25 Series 2015 and CMO NO. 20 Series 2013</p>
        <p>Effective AY 2022-2023</p>
        <h3 class="mt-4 font-semibold">I. Program of Study</h3>
      </div>

      <ProspectusTable :subjects="subjects" :programName="curriculum?.name || ''" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ProspectusTable from '@/components/ProspectusTable.vue';
import { useRoute, useRouter } from 'vue-router';

// Router
const router = useRouter();
const route = useRoute();

// Accept userId from route (for admin) or fallback to logged-in user
const userId = ref(route.params.userId || JSON.parse(localStorage.getItem('user') || '{}')?.id);
if (!userId.value) {
  alert('User ID is missing.');
  router.push('/');
}

const subjects = ref([]);
const curriculum = ref(null);
const loading = ref(true);
const error = ref('');

// Fetch prospectus for a given userId
const fetchProspectus = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await axios.get(`/api/student/${userId.value}/subjects`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    curriculum.value = response.data.curriculum;
    subjects.value = response.data.subjects;

  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || err.message || 'Failed to fetch prospectus';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProspectus);
</script>
