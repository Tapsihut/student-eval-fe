<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar (fixed height, non-scrollable) -->

    <AdminSidebar v-if="auth.user.role === 'admin'" />
    <StudentSidebar v-else />

    <!-- Main content (scrollable only here) -->
    <main class="flex-1 flex flex-col bg-gray-100 overflow-hidden">
      <Navbar />
      <!-- Content area (scrollable) -->
      <div class="flex-1 overflow-y-auto p-6">
        <router-view />
      </div>

      <!-- Footer stays at bottom -->
      <Footer />
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue' // reuse admin sidebar
import Footer from '@/components/Footer.vue';
import Navbar from '@/components/Navbar.vue';
import StudentSidebar from '@/components/StudentSidebar.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
if (!auth.user) {
  // If not logged in, redirect to landing page
  window.location.href = '/';
}

</script>
