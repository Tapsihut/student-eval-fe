import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import axios from 'axios';
import { useToast } from 'vue-toastification'

import App from './App.vue'
import router from './router'

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const toast = useToast();
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Toast, {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: "Vue-Toastification__fade",
    maxToasts: 1,         // only one toast visible
    filterBeforeCreate: (toastInstance, toasts) => {
        toast.clear();
        return toastInstance
    }
})

app.mount('#app')
