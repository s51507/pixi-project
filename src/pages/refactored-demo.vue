<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">🔄 重構版 Spine 動畫展示</h1>
        <p class="text-gray-400">
          使用抽取的工具函數重新實現的 Spine 動畫播放器，代碼更簡潔、可維護性更高
        </p>
      </div>

      <!-- 重構版組件 -->
      <div class="bg-gray-800 rounded-lg p-6">
        <SimpleSpineRefactored
          :atlas-path="animationData.atlasPath"
          :image-path="animationData.imagePath"
          :skel-path="animationData.skelPath"
          :width="800"
          :height="600"
        />
      </div>

      <!-- 功能對比說明 -->
      <div class="mt-8 grid md:grid-cols-2 gap-6">
        <div class="bg-green-900/30 border border-green-600/30 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-green-400 mb-4">✅ 重構後的優勢</h3>
          <ul class="space-y-2 text-sm text-green-300">
            <li>• <strong>模組化設計</strong>：PixiJS 和 Spine 邏輯分離到工具函數</li>
            <li>• <strong>可重用性</strong>：工具函數可在多個組件中使用</li>
            <li>• <strong>易於測試</strong>：獨立的函數更容易進行單元測試</li>
            <li>• <strong>統一日誌</strong>：使用專門的日誌工具，格式一致</li>
            <li>• <strong>效果管理</strong>：EffectManager 統一管理各種特效</li>
            <li>• <strong>類型安全</strong>：完整的 TypeScript 類型定義</li>
            <li>• <strong>錯誤處理</strong>：統一的錯誤處理和狀態管理</li>
          </ul>
        </div>

        <div class="bg-blue-900/30 border border-blue-600/30 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-400 mb-4">🛠️ 工具函數結構</h3>
          <ul class="space-y-2 text-sm text-blue-300">
            <li>• <strong>renderer.ts</strong>：渲染器檢測和信息獲取</li>
            <li>• <strong>application.ts</strong>：PixiJS 應用創建和管理</li>
            <li>• <strong>assets.ts</strong>：資源載入和緩存管理</li>
            <li>• <strong>spine.ts</strong>：Spine 動畫創建和控制</li>
            <li>• <strong>effects.ts</strong>：特效系統（漂浮、震動等）</li>
            <li>• <strong>logger.ts</strong>：統一日誌工具</li>
            <li>• <strong>index.ts</strong>：統一導出接口</li>
          </ul>
        </div>
      </div>

      <!-- 技術說明 -->
      <div class="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">📋 重構重點</h3>
        <div class="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 class="font-semibold text-purple-400 mb-2">🎯 關注點分離</h4>
            <p class="text-gray-300">
              將 PixiJS 初始化、Spine 創建、效果管理等邏輯分離到獨立工具函數，
              組件只負責 UI 狀態和用戶交互。
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-green-400 mb-2">🔄 可重用性</h4>
            <p class="text-gray-300">
              抽取的工具函數可以在整合場景頁面、其他動畫組件中重用，
              避免代碼重複，提高開發效率。
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-blue-400 mb-2">🐛 易於調試</h4>
            <p class="text-gray-300">
              統一的日誌系統和錯誤處理，讓問題定位更容易。
              獨立的函數也更容易進行單元測試。
            </p>
          </div>
        </div>
      </div>

      <!-- 返回連結 -->
      <div class="mt-8 text-center">
        <RouterLink 
          to="/" 
          class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
        >
          ← 返回主頁
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SimpleSpineRefactored from '@/components/animation/SimpleSpineRefactored.vue'

// 使用火箭動畫作為演示
const animationData = {
  atlasPath: '/cashorcrash2/spine/rocket_v6/skeleton.atlas',
  imagePath: '/cashorcrash2/spine/rocket_v6/skeleton.png',
  skelPath: '/cashorcrash2/spine/rocket_v6/skeleton.skel'
}
</script>