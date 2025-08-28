import './assets/main.css'

import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PiniaColada)
app.use(router)

// 掛載應用
app.mount('#app')

// 在下一個 tick 中安全地初始化 store
nextTick(async () => {
  try {
    const { useAssetPackStore } = await import('./stores/assetPack')
    const assetPackStore = useAssetPackStore()
    assetPackStore.initialize()
    console.log('✅ 素材包 store 初始化完成')
  } catch (err) {
    console.warn('⚠️ 素材包 store 初始化失敗:', err)
  }
})
