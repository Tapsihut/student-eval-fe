<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center animate-fade-in-up">
        <!-- Spinner -->
        <div class="flex justify-center mb-6">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 rounded-full border-4 border-blue-300 border-t-blue-600 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-8 h-8 text-blue-600 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 10l4.553 2.276A1 1 0 0120 13.118V19a1 1 0 01-1.447.894L15 17.618M9 10L4.447 12.276A1 1 0 004 13.118V19a1 1 0 001.447.894L9 17.618m6-7.236V19m-6-8v8" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Text -->
        <h2 class="text-xl font-semibold text-gray-800 mb-2">
          Processing your TOR using OCR...
        </h2>
        <p class="text-gray-600 mb-6">
          This may take a while — please wait while we analyze your uploaded document.
        </p>

        <!-- Info box -->
        <div class="bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-lg border border-blue-100">
          📸 <span class="font-medium">Tip:</span> The result quality depends on how clear your uploaded image or PDF is.
          Make sure it’s readable and well-aligned.
        </div>

        <!-- Animated dots (bottom) -->
        <div class="mt-6 flex justify-center space-x-2">
          <div v-for="n in 3" :key="n" class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
            :style="{ animationDelay: `${n * 0.2}s` }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}
</style>
