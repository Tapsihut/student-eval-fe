<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative animate-fadeIn">
      <!-- Close -->
      <button
        @click="emits('update:show', false)"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✖
      </button>

      <h2 class="text-2xl font-bold text-center mb-6">Register</h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input
            v-model="firstName"
            type="text"
            placeholder="Enter first name"
            :class="inputClass(errors.firstName)"
          />
          <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">
            {{ errors.firstName }}
          </p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input
            v-model="lastName"
            type="text"
            placeholder="Enter last name"
            :class="inputClass(errors.lastName)"
          />
          <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">
            {{ errors.lastName }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter email"
            :class="inputClass(errors.email)"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter password"
            :class="inputClass(errors.password)"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">
            {{ errors.password }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            v-model="passwordConfirm"
            type="password"
            placeholder="Confirm password"
            :class="inputClass(errors.passwordConfirm)"
          />
          <p v-if="errors.passwordConfirm" class="text-red-500 text-xs mt-1">
            {{ errors.passwordConfirm }}
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading"
          :class="[
            'w-full py-2 rounded-lg text-white font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-green-300',
            isLoading
              ? 'bg-green-400 opacity-50 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 cursor-pointer'
          ]"
        >
          <span v-if="!isLoading">Register</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              />
            </svg>
            Registering...
          </span>
        </button>

        <button
          type="button"
          @click="emits('update:show', false)"
          class="w-full py-2 mt-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const emits = defineEmits(['update:show', 'update:show-registration'])
const props = defineProps({ show: Boolean })

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const isLoading = ref(false)

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

// ✅ Dynamic input class with red border if invalid
const inputClass = (err) => [
  'w-full px-3 py-2 border rounded-lg focus:ring transition',
  err
    ? 'border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:ring-green-200',
]

// ✅ Validate fields before submission
const validate = () => {
  let valid = true
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  }

  if (!firstName.value.trim()) {
    errors.value.firstName = 'First name is required'
    valid = false
  }

  if (!lastName.value.trim()) {
    errors.value.lastName = 'Last name is required'
    valid = false
  }

  if (!email.value.trim()) {
    errors.value.email = 'Email is required'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Please enter a valid email'
    valid = false
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
    valid = false
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    valid = false
  }

  if (passwordConfirm.value !== password.value) {
    errors.value.passwordConfirm = 'Passwords do not match'
    valid = false
  }

  return valid
}

// ✅ Handle Register
const handleRegister = async () => {
  if (!validate()) return

  isLoading.value = true

  try {
    const res = await auth.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    })

    if (res.success) {
      toast.success('Registration successful!')
      emits('update:show', false)
    } else {
      toast.error(res.message || 'Registration failed')
    }
  } catch (error) {
    console.error(error)
    toast.error('An error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (props.show) {
    document.body.classList.add('modal-open')
  }
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
