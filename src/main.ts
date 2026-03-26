import { createApp } from 'vue'
// @ts-ignore
import Framework7 from 'framework7/lite-bundle'
// @ts-ignore
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle'

// @ts-ignore
import 'framework7/css/bundle'
// @ts-ignore
import 'framework7-icons/css/framework7-icons.css'
import './style.css'

import App from './App.vue'

Framework7.use(Framework7Vue)

const app = createApp(App)
registerComponents(app)
app.mount('#app')
