<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800">
    <!-- Header -->
    <header class="fixed top-0 left-0 w-full bg-white shadow-sm z-50 transition-all duration-300"
      :class="{ 'py-2': isScrolled, 'py-4': !isScrolled }">
      <div class="container mx-auto flex items-center justify-between px-4 md:px-10">
        <!-- Logo + School Info -->
        <div class="flex items-center space-x-3">
          <img src="@/assets/ccis-logo.jpg" class="h-16 w-16 md:h-20 md:w-20 object-contain" alt="CCIS Logo" />
          <img src="@/assets/asscat-logo.jpg" class="h-16 w-16 md:h-20 md:w-20 object-contain" alt="ASSCAT Logo" />
          <div class="flex flex-col leading-tight">
            <h1 class="text-green-700 font-bold text-sm sm:text-lg">
              Agusan del Sur State College of Agriculture and Technology
            </h1>
            <p class="text-gray-600 text-xs sm:text-sm">College of Computing and Information Sciences</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8 font-medium text-sm">
          <a href="#about" class="hover:text-green-700 transition">About</a>
          <a href="#features" class="hover:text-green-700 transition">Features</a>
          <a href="#contact" class="hover:text-green-700 transition">Contact</a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      class="flex flex-col items-center justify-center text-center pt-40 pb-20 px-6 bg-gradient-to-b from-white to-green-50">
      <h2 class="text-3xl sm:text-5xl font-extrabold text-green-700 leading-tight">
        Simplify Subject Evaluation for
        <span class="block text-gray-900">Transferees and Shiftees</span>
      </h2>
      <p class="mt-4 max-w-2xl text-sm sm:text-base text-gray-700">
        A modern web-based platform designed to automate and streamline the student evaluation process —
        ensuring accuracy, efficiency, and ease of use.
      </p>
      <button @click="showLogin = true"
        class="mt-8 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 cursor-pointer">
        Get Started
      </button>
    </section>

    <!-- About Section -->
    <section id="about" class="py-16 px-6 sm:px-12 bg-white scroll-mt-24">
      <div class="container mx-auto text-center">
        <h3 class="text-2xl font-bold text-green-700 mb-6">About the System</h3>
        <p class="max-w-3xl mx-auto text-gray-700 leading-relaxed">
          The Subject Evaluation System for Transferees is a project developed by the College of Computing and
          Information Sciences to simplify academic evaluation. It enhances efficiency, reduces manual work, and helps
          advisers focus on accurate course validation.
        </p>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 px-6 sm:px-12 bg-green-50 scroll-mt-24">
      <div class="container mx-auto text-center">
        <h3 class="text-2xl font-bold text-green-700 mb-12">Key Features</h3>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
            <h4 class="font-semibold text-lg text-green-700 mb-2">Automated Evaluation</h4>
            <p class="text-sm text-gray-700">
              Automatically compare subjects and prerequisites — reducing human error and saving time.
            </p>
          </div>
          <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
            <h4 class="font-semibold text-lg text-green-700 mb-2">Centralized Data</h4>
            <p class="text-sm text-gray-700">
              Securely store, manage, and retrieve student records through an integrated database system.
            </p>
          </div>
          <div class="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
            <h4 class="font-semibold text-lg text-green-700 mb-2">Responsive Interface</h4>
            <p class="text-sm text-gray-700">
              Access the system anytime, anywhere — optimized for desktop, tablet, and mobile devices.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact / Footer -->
    <footer id="contact" class="bg-white border-t py-10 text-center text-sm text-gray-600">
      <p>© 2025 Agusan del Sur State College of Agriculture and Technology — CCIS</p>
      <p class="mt-2">Developed for Academic Purposes</p>
    </footer>

    <!-- Modals -->
    <LoginModal v-if="showLogin" :show="showLogin" @update:show="handleCloseLogin"  @update:show-registration="handleOpenRegister" />
    <RegistrationModal v-if="showRegister" :show="showRegister" @update:show="handleCloseRegister"/>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import LoginModal from "@/components/LoginModal.vue";
import RegistrationModal from "@/components/RegistrationModal.vue";

const showLogin = ref(false);
const showRegister = ref(false);
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;
};

const handleOpenRegister = () => {
  showLogin.value = false;
  showRegister.value = true;
};

const handleCloseRegister = () => {
  showRegister.value = false;
};

const handleCloseLogin = () => {
  showLogin.value = false;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>
