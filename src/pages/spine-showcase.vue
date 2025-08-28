<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🎮 真正的 Spine 動畫展示
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          使用 PixiJS + @esotericsoftware/spine-pixi-v8 實現的完整 Spine 動畫播放器，支援所有 Spine 功能
        </p>
        <div class="mt-4 p-4 bg-green-900/30 border border-green-600/50 rounded-lg max-w-2xl mx-auto">
          <p class="text-green-200 text-sm">
            ✅ <strong>完整實現</strong>：真正的骨骼動畫、時間軸控制、插值計算
          </p>
        </div>
      </div>

      <!-- 功能特色 -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="text-3xl mb-4">🦴</div>
          <h3 class="text-xl font-semibold mb-3">骨骼系統</h3>
          <p class="text-gray-300 text-sm">
            完整的骨骼層次結構，支援父子關係和變換繼承
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="text-3xl mb-4">⏱️</div>
          <h3 class="text-xl font-semibold mb-3">時間軸動畫</h3>
          <p class="text-gray-300 text-sm">
            基於關鍵幀的動畫系統，支援多種插值模式
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="text-3xl mb-4">🎯</div>
          <h3 class="text-xl font-semibold mb-3">實時控制</h3>
          <p class="text-gray-300 text-sm">
            動態調整速度、縮放、循環等播放參數
          </p>
        </div>
      </div>

      <!-- 素材包切換 -->
      <AssetPackSwitch class="mb-8" />

      <!-- 動畫選擇 -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
        <h2 class="text-2xl font-semibold mb-6">選擇動畫</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="animation in animations"
            :key="animation.name"
            @click="selectAnimation(animation)"
            :class="[
              'p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105',
              selectedAnimationName === animation.name
                ? 'border-yellow-400 bg-yellow-400/20 shadow-lg'
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
        <div class="text-6xl mb-4">🎭</div>
        <h3 class="text-2xl font-semibold mb-2">選擇一個動畫開始體驗</h3>
        <p class="text-gray-300">點擊上方的動畫卡片來載入和播放 Spine 動畫</p>
      </div>

      <!-- 技術說明 -->
      <div class="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 class="text-xl font-semibold mb-4">🛠️ 技術實現</h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 class="font-semibold text-blue-300 mb-2">核心技術</h4>
            <ul class="space-y-1 text-gray-300">
              <li>• PixiJS v8 - WebGL 渲染引擎</li>
              <li>• @esotericsoftware/spine-pixi-v8 v8 - 官方 Spine Runtime</li>
              <li>• Vue 3 Composition API</li>
              <li>• TypeScript 類型安全</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-green-300 mb-2">支援功能</h4>
            <ul class="space-y-1 text-gray-300">
              <li>• 完整骨骼動畫系統</li>
              <li>• 多動畫切換和混合</li>
              <li>• 實時參數調整</li>
              <li>• 高性能 WebGL 渲染</li>
            </ul>
          </div>
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
import AssetPackSwitch from '@/components/AssetPackSwitch.vue'

import { useAssetPackStore } from '@/stores/assetPack'

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

// Store
const assetPackStore = useAssetPackStore()

const selectedAnimationName = ref<string | null>(null)

// 響應式的選中動畫數據，會隨素材包變化自動更新路徑
const selectedAnimationData = computed<AnimationData | null>(() => {
  if (!selectedAnimationName.value) return null
  return animations.value.find(anim => anim.name === selectedAnimationName.value) || null
})

// 動畫基礎配置（不包含路徑）
const animationConfigs = [
  {
    name: 'rocket',
    displayName: '火箭發射',
    description: '完整的火箭發射序列，包含門開啟、點火、升空和爆炸效果',
    icon: '🚀',
    features: ['多階段動畫', '粒子效果', '複雜時間軸'],
    spineFolder: 'rocket_v6'
  },
  {
    name: 'bonus',
    displayName: '獎勵特效',
    description: '華麗的獎勵動畫，展示光效和慶祝元素',
    icon: '🎁',
    features: ['光效動畫', '彈性效果', '循環播放'],
    spineFolder: 'bonus'
  },
  {
    name: 'character-walk',
    displayName: '角色行走',
    description: '流暢的角色行走動畫，展示骨骼動畫的細膩表現',
    icon: '🚶',
    features: ['骨骼動畫', '循環動作', '平滑過渡'],
    spineFolder: 'me-default1-walk_v4'
  },
  {
    name: 'character-jump',
    displayName: '角色跳躍',
    description: '動態的跳躍動作，包含起跳、空中和落地階段',
    icon: '🦘',
    features: ['動態動作', '重力效果', '多階段'],
    spineFolder: 'me-default1-jump_v3'
  },
  {
    name: 'character-premium',
    displayName: '高級角色',
    description: '解鎖角色的特殊動畫，展示更豐富的視覺效果',
    icon: '⭐',
    features: ['特殊效果', '高級動畫', '獨特設計'],
    spineFolder: 'me-default2-walk_v4'
  },
  {
    name: 'npc-character',
    displayName: 'NPC 角色',
    description: '其他角色的行走動畫，展示不同的動作風格',
    icon: '👥',
    features: ['NPC 動作', '風格化', '背景角色'],
    spineFolder: 'others-default1-walk_v4'
  }
]

// 響應式動畫列表 - 會根據當前素材包自動更新路徑
const animations = computed<AnimationData[]>(() => {
  return animationConfigs.map(config => {
    const assets = assetPackStore.getSpineAssets(config.spineFolder)
    return {
      name: config.name,
      displayName: config.displayName,
      description: config.description,
      icon: config.icon,
      features: config.features,
      atlasPath: assets.atlasPath,
      imagePath: assets.imagePath,
      skelPath: assets.skelPath
    }
  })
})

/**
 * 選擇動畫
 */
function selectAnimation(animation: AnimationData): void {
  selectedAnimationName.value = animation.name
}
</script>