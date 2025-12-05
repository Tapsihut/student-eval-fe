<template>
  <div
    class="relative overflow-hidden border rounded-lg bg-gray-100 w-full h-full select-none"
    @mousedown="startPress"
    @mouseup="stopPress"
    @mouseleave="stopPress"
    @mousemove="onDrag"
    @wheel.prevent="onWheel"
  >
    <img
      :src="imageUrl"
      alt="Zoomable Image"
      class="absolute top-0 left-0 transition-transform duration-75 ease-linear select-none"
      :style="{
        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        cursor: dragging ? 'grabbing' : isPressing ? 'grab' : 'grab',
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})

const imageUrl = ref(props.src)
const zoom = ref(1)
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const pressTimer = ref(null)
const isPressing = ref(false)

function onWheel(e) {
  const zoomSpeed = 0.1
  if (e.deltaY < 0) zoom.value = Math.min(zoom.value + zoomSpeed, 5)
  else zoom.value = Math.max(zoom.value - zoomSpeed, 0.5)
}

function startPress(e) {
  // Start detecting long press
  isPressing.value = true
  pressTimer.value = setTimeout(() => {
    if (isPressing.value) {
      dragging.value = true
      dragStart.value = {
        x: e.clientX - position.value.x,
        y: e.clientY - position.value.y,
      }
    }
  }, 150)
}

function stopPress() {
  clearTimeout(pressTimer.value)
  isPressing.value = false
  dragging.value = false
}

function onDrag(e) {
  if (!dragging.value) return
  position.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  }
}

// ensure mouseup stops drag even outside
onMounted(() => window.addEventListener('mouseup', stopPress))
onBeforeUnmount(() => window.removeEventListener('mouseup', stopPress))
</script>

<style scoped>
img {
  transform-origin: center center;
}
</style>
