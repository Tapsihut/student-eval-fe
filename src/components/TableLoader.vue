<template>
    <div class="w-full animate-pulse">
        <div v-for="n in rows" :key="n" class="flex items-center space-x-4 mb-3 bg-white/50 rounded-lg p-3 shadow-sm">
            <!-- Circle (e.g., avatar) -->
            <!-- <div class="w-10 h-10 rounded-full bg-gray-300"></div> -->

            <!-- Text placeholders -->

            <div class="h-3 bg-gray-200 rounded" :style="{ width: randomWidths[n - 1]?.line2 + '%' }"></div>
            <!-- <div class="flex-1">
                <div
          class="h-3 bg-gray-300 rounded mb-2"
          :style="{ width: randomWidths[n - 1]?.line1 + '%' }"
        ></div>
            </div> -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
    rows: {
        type: Number,
        default: 5,
    },
});

const randomWidths = ref([]);

onMounted(() => {
    randomWidths.value = Array.from({ length: props.rows }, () => ({
        line1: Math.floor(Math.random() * 40) + 60, // 60–100%
        line2: Math.floor(Math.random() * 30) + 40, // 40–70%
    }));
});
</script>

<style scoped>
/* Optional: smooth fade shimmer effect */
@keyframes shimmer {
    0% {
        background-position: -200px 0;
    }

    100% {
        background-position: calc(200px + 100%) 0;
    }
}

.animate-pulse>div>div.bg-gray-300,
.animate-pulse>div>div.bg-gray-200 {
    background: linear-gradient(90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}
</style>
