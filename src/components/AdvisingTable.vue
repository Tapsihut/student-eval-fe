<template>
    <table class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
        <thead class="bg-blue-100">
            <tr>
                <th class="px-4 py-2 text-left">Code</th>
                <th class="px-4 py-2 text-left">Subject Name</th>
                <th class="px-4 py-2 text-left">Units</th>
                <th class="px-4 py-2 text-left">Semester</th>
                <th class="px-4 py-2 text-left">Year Level</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="subject in subjects" :key="subject.id" class="odd:bg-white even:bg-blue-50">
                <td class="px-4 py-2">{{ subject.code }}</td>
                <td class="px-4 py-2">{{ subject.title }}</td>
                <td class="px-4 py-2">{{ subject.units }}</td>
                <td class="px-4 py-2">{{ subject.semester }}</td>
                <td class="px-4 py-2">{{ subject.year_level }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
defineProps({
    subjects: {
        type: Array,
        default: () => [],
    },
})
</script>
