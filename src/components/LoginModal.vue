<template>
    <div class="fixed w-screen h-screen top-0 z-50">
        <div class="absolute top-0 left-0 w-screen h-screen bg-black opacity-50" @click="emits('update:show', false)">

        </div>
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
                <!-- Close -->
                <button @click="emits('update:show', false)"
                    class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl cursor-pointer">
                    ✖
                </button>

                <!-- Title -->
                <h2 class="text-2xl md:text-3xl font-bold text-center mb-6">
                    Login
                </h2>

                <!-- Form -->
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input v-model="email" type="email" placeholder="Enter your email"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Password</label>
                        <input v-model="password" type="password" placeholder="Enter your password"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200 text-sm" />
                    </div>

                    <div class="flex justify-between items-center text-sm">
                        <a href="#" @click="emits('update:show-registration', false)"
                            class="text-green-600 hover:underline">
                            No account? Register
                        </a>
                    </div>

                    <button type="submit" :disabled="isLoading" :class="['w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold',
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']">
                        {{ isLoading ? "Logging in..." : "Login" }}
                    </button>

                    <button type="button" @click="emits('update:show', false)"
                        class="w-full py-2 mt-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold cursor-pointer">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
const props = defineProps({ show: Boolean });
const emits = defineEmits(['update:show', 'update:show-registration']);

const router = useRouter();
const toast = useToast();
const email = ref('')
const password = ref('')
const isLoading = ref(false);
const auth = useAuthStore()

const handleLogin = async () => {
    isLoading.value = true;

    try {
        const res = await auth.login({ email: email.value, password: password.value });
        if (res.success) {
            toast.success("Login successful!")

            emits('update:show', false)
            console.log(res.data)
            // redirect based on role
            if (res.data.role === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/student/dashboard')
            }
        } else {
            toast.error(res.message)
        }
    } catch (error) {
        toast.error("An error occurred. Please try again.")
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (props.show) {
        document.body.classList.add('modal-open')
    } else {
        document.body.classList.remove('modal-open')
    }
});

onUnmounted(() => {
    document.body.classList.remove('modal-open')
});


// watch(() => props.show, (val) => {
//     alert(val)
//     if (val) {
//         document.body.classList.add('modal-open')
//     } else {
//         document.body.classList.remove('modal-open')
//     }
// });

</script>