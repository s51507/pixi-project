<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          🎸 Funky Rocket 動畫展示
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          展示 Funky Rocket 素材包的全新三個核心動畫：walk、jump、rocket
        </p>
        <div class="mt-4 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg max-w-2xl mx-auto">
          <p class="text-blue-200 text-sm">
            ✨ <strong>全新素材</strong>：簡化的檔案結構，統一的動畫體驗
          </p>
        </div>
      </div>

      <!-- 功能特色 -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="text-3xl mb-4">🚶</div>
          <h3 class="text-xl font-semibold mb-3">行走動畫</h3>
          <p class="text-gray-300 text-sm">
            流暢的角色移動動畫，適用於所有角色類型
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="text-3xl mb-4">🦘</div>
          <h3 class="text-xl font-semibold mb-3">跳躍動畫</h3>
          <p class="text-gray-300 text-sm">
            動感的跳躍動作，包含完整的起跳和落地
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="text-3xl mb-4">🚀</div>
          <h3 class="text-xl font-semibold mb-3">火箭動畫</h3>
          <p class="text-gray-300 text-sm">
            完整的火箭動畫系統，支援多種狀態
          </p>
        </div>
      </div>

      <!-- 動畫選擇 -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
        <h2 class="text-2xl font-semibold mb-6">選擇動畫</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="animation in animations"
            :key="animation.name"
            @click="selectAnimation(animation)"
            :class="[
              'p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105',
              selectedAnimationName === animation.name
                ? 'border-blue-400 bg-blue-400/20 shadow-lg'
                : 'border-white/30 hover:border-white/50 hover:bg-white/10'
            ]"
          >
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">{{ animation.icon }}</span>
              <h3 class="font-semibold">{{ animation.displayName }}</h3>
            </div>
            <p class="text-sm text-gray-300">{{ animation.description }}</p>
            <div class="mt-2 text-xs text-gray-400">
              {{ animation.features.join(' • ') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 動畫播放器 -->
      <div v-if="selectedAnimationData" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-semibold flex items-center gap-3">
              <span class="text-3xl">{{ selectedAnimationData.icon }}</span>
              {{ selectedAnimationData.displayName }}
            </h2>
            <p class="text-gray-300 mt-1">{{ selectedAnimationData.description }}</p>
          </div>
          
          <div class="text-right">
            <div class="text-sm text-gray-400">
              特色功能: {{ selectedAnimationData.features.join(' • ') }}
            </div>
          </div>
        </div>
        
        <div class="flex justify-center">
          <SimpleSpineRefactored
            :atlas-path="selectedAnimationData.atlasPath"
            :image-path="selectedAnimationData.imagePath"
            :skel-path="selectedAnimationData.skelPath"
            :width="800"
            :height="600"
          />
        </div>
      </div>

      <div v-else class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
        <div class="text-6xl mb-4">🎸</div>
        <h3 class="text-2xl font-semibold mb-2">選擇一個動畫開始體驗</h3>
        <p class="text-gray-300">點擊上方的動畫卡片來載入和播放 Funky Rocket 動畫</p>
      </div>

      <!-- 素材包說明 -->
      <div class="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 class="text-xl font-semibold mb-4">📦 素材包資訊</h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 class="font-semibold text-blue-300 mb-2">檔案結構</h4>
            <ul class="space-y-1 text-gray-300">
              <li>• /public/funkyRocket/spine/walk/</li>
              <li>• /public/funkyRocket/spine/jump/</li>
              <li>• /public/funkyRocket/spine/rocket/</li>
              <li>• 簡化的命名方式</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-cyan-300 mb-2">動畫特色</h4>
            <ul class="space-y-1 text-gray-300">
              <li>• 統一的角色動畫系統</li>
              <li>• 高質量的骨骼動畫</li>
              <li>• 流暢的動作表現</li>
              <li>• 適合遊戲場景使用</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 遊戲演示連結 -->
      <div class="mt-8 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30">
        <div class="text-center">
          <h3 class="text-xl font-semibold mb-3 text-blue-300">🎮 完整遊戲體驗</h3>
          <p class="text-gray-300 mb-4">
            這些動畫已經整合到完整的遊戲演示中，體驗角色上車、火箭發射、下車的完整流程
          </p>
          <RouterLink 
            to="/funky-rocket-demo"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🚀 體驗完整遊戲
          </RouterLink>
        </div>
      </div>

      <!-- 返回按鈕 -->
      <div class="mt-8 text-center">
        <RouterLink 
          to="/" 
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          ← 返回主頁
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import SimpleSpineRefactored from '@/components/animation/SimpleSpineRefactored.vue'

interface AnimationData {
  name: string
  displayName: string
  description: string
  icon: string
  features: string[]
  atlasPath: string
  imagePath: string
  skelPath: string
}

const selectedAnimationName = ref<string | null>(null)

// Funky Rocket 專用動畫配置（固定使用 funkyRocket 素材包）
const animationConfigs = [
  {
    name: 'walk',
    displayName: '行走動畫',
    description: '角色的標準行走動畫，適用於上車和移動場景',
    icon: '🚶',
    features: ['循環播放', '平滑動作', '通用角色'],
    spineFolder: 'walk'
  },
  {
    name: 'jump',
    displayName: '跳躍動畫',
    description: '動感的跳躍動作，用於角色下車和特殊動作',
    icon: '🦘',
    features: ['單次播放', '拋物線動作', '著地效果'],
    spineFolder: 'jump'
  },
  {
    name: 'rocket',
    displayName: '火箭動畫',
    description: '完整的火箭動畫系統，包含 launch、flying、explosion 等狀態',
    icon: '🚀',
    features: ['多狀態切換', '複雜動畫', '粒子效果'],
    spineFolder: 'rocket'
  }
]

// 動畫列表 - 固定使用 funkyRocket 路徑
const animations = computed<AnimationData[]>(() => {
  return animationConfigs.map(config => {
    const basePath = `/funkyRocket/spine/${config.spineFolder}`
    return {
      name: config.name,
      displayName: config.displayName,
      description: config.description,
      icon: config.icon,
      features: config.features,
      atlasPath: `${basePath}/${config.spineFolder}.atlas`,
      imagePath: `${basePath}/${config.spineFolder}.png`,
      skelPath: `${basePath}/${config.spineFolder}.skel`
    }
  })
})

// 選中的動畫數據
const selectedAnimationData = computed<AnimationData | null>(() => {
  if (!selectedAnimationName.value) return null
  return animations.value.find(anim => anim.name === selectedAnimationName.value) || null
})

/**
 * 選擇動畫
 */
function selectAnimation(animation: AnimationData): void {
  selectedAnimationName.value = animation.name
}
</script>
