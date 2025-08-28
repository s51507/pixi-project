/**
 * 素材包管理 Store (簡化版)
 * 統一管理當前使用的素材包
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type AssetPackType = 'cashorcrash2' | 'funkyRocket'

export interface AssetPackInfo {
  id: AssetPackType
  name: string
  description: string
  icon: string
}

// 素材包資訊
export const ASSET_PACKS: Record<AssetPackType, AssetPackInfo> = {
  cashorcrash2: {
    id: 'cashorcrash2',
    name: 'Cash or Crash 2',
    description: '原始遊戲素材包',
    icon: '🚀'
  },
  funkyRocket: {
    id: 'funkyRocket',
    name: 'Funky Rocket',
    description: '新版火箭素材包',
    icon: '🎸'
  }
}

export const useAssetPackStore = defineStore('assetPack', () => {
  // 狀態 - 簡單的字符串
  const currentPack = ref<AssetPackType>('cashorcrash2')

  // Getters
  const currentPackInfo = computed(() => ASSET_PACKS[currentPack.value])
  const allPacks = computed(() => Object.values(ASSET_PACKS))
  const otherPack = computed(() => 
    currentPack.value === 'cashorcrash2' ? ASSET_PACKS.funkyRocket : ASSET_PACKS.cashorcrash2
  )

  // Actions
  function switchToPack(packId: AssetPackType) {
    console.log(`🎨 切換素材包: ${ASSET_PACKS[packId].name}`)
    currentPack.value = packId
    
    // 儲存到 localStorage
    try {
      localStorage.setItem('selectedAssetPack', packId)
    } catch (err) {
      console.warn('無法儲存素材包選擇:', err)
    }
  }

  function togglePack() {
    const nextPack: AssetPackType = currentPack.value === 'cashorcrash2' 
      ? 'funkyRocket' 
      : 'cashorcrash2'
    switchToPack(nextPack)
  }

  // 初始化 - 從 localStorage 載入
  function initialize() {
    try {
      const saved = localStorage.getItem('selectedAssetPack') as AssetPackType
      if (saved && ASSET_PACKS[saved]) {
        currentPack.value = saved
        console.log(`📦 載入素材包: ${ASSET_PACKS[saved].name}`)
      }
    } catch (err) {
      console.warn('無法載入素材包選擇:', err)
    }
  }

  // 工具函數 - 生成資源路徑
  function getSpineAssets(animationPath: string) {
    return {
      skelPath: `/${currentPack.value}/spine/${animationPath}/skeleton.skel`,
      atlasPath: `/${currentPack.value}/spine/${animationPath}/skeleton.atlas`,
      imagePath: `/${currentPack.value}/spine/${animationPath}/skeleton.png`
    }
  }

  function getAudioPath(filename: string) {
    return `/${currentPack.value}/mp3/assets/${filename}`
  }

  function getImagePath(filename: string) {
    return `/${currentPack.value}/avif/assets/${filename}`
  }

  function getPngPath(filename: string) {
    return `/${currentPack.value}/png/${filename}`
  }

  return {
    // 狀態
    currentPack,
    
    // Getters
    currentPackInfo,
    allPacks,
    otherPack,
    
    // Actions
    switchToPack,
    togglePack,
    initialize,
    
    // 工具函數
    getSpineAssets,
    getAudioPath,
    getImagePath,
    getPngPath
  }
})
