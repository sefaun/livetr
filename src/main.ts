import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import i18n from '@/locales/i18n'
import '@/assets/styles/tailwind.css'
import '@/assets/styles/elementPlus.scss'
import '@/assets/styles/elementPlusDark.scss'

const app = createApp(App)

app.use(router).use(i18n).mount('#app')
