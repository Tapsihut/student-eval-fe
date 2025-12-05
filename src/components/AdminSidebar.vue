<template>
  <aside class="h-screen w-64 bg-slate-800 text-white flex flex-col">
    <!-- Logo / Title -->
    <div class="flex items-center gap-2 px-6 py-6 border-b border-slate-700">
      <span class="text-2xl">🎓</span>
      <h1 class="text-xl font-bold">Dashboard</h1>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <RouterLink to="/admin/dashboard"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition" active-class="bg-slate-700">
        <span>🏠</span> Dashboard
      </RouterLink>
      

      <RouterLink to="/admin/curriculum"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition" active-class="bg-slate-700">
        <span>📄</span> Curriculums
      </RouterLink>


      <RouterLink to="/admin/subjects"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition" active-class="bg-slate-700">
        <span>📄</span> Subjects
      </RouterLink>

      <RouterLink to="/admin/students"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition" active-class="bg-slate-700">
        <span>⬆️</span> Students
      </RouterLink>

      <RouterLink to="/admin/uploaded-tor"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition" active-class="bg-slate-700">
        <span>⬆️</span> Uploaded TOR
      </RouterLink>

      <RouterLink to="/admin/profile" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition"
        active-class="bg-slate-700">
        <span>👤</span> Profile
      </RouterLink>
      <!-- 
      <RouterLink
        to="/settings"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition"
        active-class="bg-slate-700"
      >
        <span>⚙️</span> Settings
      </RouterLink> -->
    </nav>

    <!-- Logout -->
    <div class="px-4 py-4 border-t border-slate-700">
      <button class="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-700 transition cursor-pointer"
        @click="authStore.logout()">
        <span>↩️</span> Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute();

console.log(route);


</script>