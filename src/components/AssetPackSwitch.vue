<!--
  簡潔的素材包切換組件
  用於在各個頁面快速切換素材包
-->

<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
    <div class="flex items-center justify-between">
      <!-- 當前素材包信息 -->
      <div class="flex items-center gap-3">
        <div class="text-2xl">📦</div>
        <div>
          <div class="text-white font-medium text-sm">當前素材包</div>
          <div class="text-gray-300 text-xs">
            {{ currentPackInfo.icon }} {{ currentPackInfo.name }}
          </div>
        </div>
      </div>

      <!-- 切換按鈕 -->
      <button
        @click="handleToggle"
        :disabled="switching"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors text-white font-medium text-sm flex items-center gap-2"
      >
        <span v-if="switching" class="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></span>
        <span v-else>🔄</span>
        {{ switching ? '切換中...' : `切換到 ${otherPack.icon} ${otherPack.name}` }}
      </button>
    </div>

    <!-- 切換狀態提示 -->
    <div v-if="switching" class="mt-2 text-xs text-yellow-400 flex items-center gap-1">
      <div class="animate-pulse">⚡</div>
      正在切換素材包，請稍候...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssetPackStore } from '@/stores/assetPack'

// Props
interface Props {
  onSwitch?: (newPack: string, oldPack: string) => Promise<void> | void
}

const props = withDefaults(defineProps<Props>(), {
  onSwitch: undefined
})

// Store
const assetPackStore = useAssetPackStore()

// 狀態
const switching = ref(false)

// Computed
const currentPackInfo = computed(() => assetPackStore.currentPackInfo)
const otherPack = computed(() => assetPackStore.otherPack)

// Methods
async function handleToggle() {
  if (switching.value) return

  const oldPack = assetPackStore.currentPack
  console.log(`🔧 準備切換素材包，當前: ${oldPack}`)
  
  try {
    switching.value = true
    
    // 切換 store 狀態
    console.log(`📦 調用 togglePack()`)
    assetPackStore.togglePack()
    
    const newPack = assetPackStore.currentPack
    
    console.log(`✅ 素材包切換完成: ${oldPack} → ${newPack}`)
    console.log(`📋 當前 store 狀態:`, {
      currentPack: assetPackStore.currentPack,
      currentPackInfo: assetPackStore.currentPackInfo,
      otherPack: assetPackStore.otherPack
    })
    
    // 測試路徑生成
    const testAssets = assetPackStore.getSpineAssets('rocket_v6')
    console.log(`🧪 測試資源路徑:`, testAssets)
    
    // 如果有自定義處理函數，調用它
    if (props.onSwitch) {
      console.log(`🔄 調用自定義處理函數`)
      await props.onSwitch(newPack, oldPack)
    }
    
  } catch (err) {
    console.error('❌ 素材包切換失敗:', err)
    
    // 切換失敗時回滾
    assetPackStore.switchToPack(oldPack)
    
  } finally {
    switching.value = false
  }
}
</script>
