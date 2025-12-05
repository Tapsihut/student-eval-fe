<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
    <h1 class="text-6xl font-bold text-gray-800">404</h1>
    <p class="text-xl text-gray-600 mt-4">Oops! Page not found.</p>
    <p class="text-gray-500 mt-2">
      The page you are looking for doesn’t exist or has been moved.
    </p>

    <button
      @click="goHome"
      class="mt-6 px-6 py-3 bg-blue-500 rounded-lg text-white shadow hover:bg-blue-700 transition cursor-pointer"
    >
      Go Back Home
    </button>
  </div>
</template>
