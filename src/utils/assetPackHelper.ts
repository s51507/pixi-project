/**
 * 素材包輔助工具
 * 提供便利的函數來處理素材包切換時的資源重新載入
 */

import type { AssetPackType } from '@/stores/assetPack'
import { nextTick } from 'vue'

export interface AssetReloadOptions {
  /** 是否在切換後自動重新載入頁面 */
  autoReload?: boolean
  /** 切換前的回調 */
  beforeSwitch?: (newPack: AssetPackType, oldPack: AssetPackType) => void | Promise<void>
  /** 切換後的回調 */
  afterSwitch?: (newPack: AssetPackType, oldPack: AssetPackType) => void | Promise<void>
  /** 重新載入資源的回調 */
  reloadAssets?: (newPack: AssetPackType) => void | Promise<void>
  /** 錯誤處理回調 */
  onError?: (error: Error) => void
}

/**
 * 創建帶有資源重新載入功能的素材包切換處理器
 */
export function createAssetPackSwitchHandler(options: AssetReloadOptions = {}) {
  return async function handleAssetPackSwitch(newPack: AssetPackType, oldPack: AssetPackType) {
    try {
      console.log(`🎨 開始切換素材包: ${oldPack} → ${newPack}`)

      // 執行切換前回調
      if (options.beforeSwitch) {
        await options.beforeSwitch(newPack, oldPack)
      }

      // 等待 DOM 更新
      await nextTick()

      // 重新載入資源
      if (options.reloadAssets) {
        console.log(`🔄 重新載入 ${newPack} 素材包的資源`)
        await options.reloadAssets(newPack)
      }

      // 執行切換後回調
      if (options.afterSwitch) {
        await options.afterSwitch(newPack, oldPack)
      }

      // 自動重新載入頁面（如果啟用）
      if (options.autoReload) {
        console.log('🔄 自動重新載入頁面')
        window.location.reload()
      }

      console.log(`✅ 素材包切換完成: ${newPack}`)

    } catch (error) {
      console.error('❌ 素材包切換失敗:', error)
      if (options.onError) {
        options.onError(error as Error)
      } else {
        // 預設錯誤處理：顯示錯誤信息
        console.log(`⚠️ 素材包切換失敗，請手動重新載入頁面`)
        alert(`素材包切換失敗: ${(error as Error).message}`)
      }
    }
  }
}

/**
 * 簡化版本：生成資源路徑工具函數
 * 不依賴 Pinia store，避免初始化問題
 */
export function createAssetPaths(currentPack: string) {
  return {
    getSpineAssets: (animationPath: string) => ({
      skelPath: `/${currentPack}/spine/${animationPath}/skeleton.skel`,
      atlasPath: `/${currentPack}/spine/${animationPath}/skeleton.atlas`,
      imagePath: `/${currentPack}/spine/${animationPath}/skeleton.png`
    }),
    
    getAudioPath: (filename: string) => `/${currentPack}/mp3/assets/${filename}`,
    
    getImagePath: (filename: string) => `/${currentPack}/avif/assets/${filename}`,
    
    getAssetPath: (relativePath: string) => 
      `/${currentPack}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`
  }
}

/**
 * 創建簡化的素材包切換器，只需要提供重新載入函數
 */
export function createSimpleAssetPackHandler(reloadFunction: (newPack: AssetPackType) => void | Promise<void>) {
  return createAssetPackSwitchHandler({
    reloadAssets: reloadFunction,
    onError: (error) => {
      console.error('素材包切換失敗:', error)
      alert('素材包切換失敗，請檢查控制台了解詳情')
    }
  })
}

/**
 * 預設的頁面重新載入處理器
 */
export const defaultAssetPackHandler = createAssetPackSwitchHandler({
  autoReload: true,
  beforeSwitch: async (newPack, oldPack) => {
    console.log(`準備從 ${oldPack} 切換到 ${newPack}`)
  }
})

/**
 * 延遲重新載入處理器（給使用者一些時間看到切換）
 */
export function createDelayedReloadHandler(delay: number = 1000) {
  return createAssetPackSwitchHandler({
    afterSwitch: async () => {
      await new Promise(resolve => setTimeout(resolve, delay))
    },
    autoReload: true
  })
}

/**
 * 檢查素材包資源是否可用
 */
export async function checkAssetPackAvailability(packId: AssetPackType): Promise<boolean> {
  try {
    // 檢查一個代表性的文件是否存在
    const testImagePath = `/${packId}/avif/assets/horizon-ddpSJfpk.avif`
    const response = await fetch(testImagePath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 預載入素材包資源
 */
export async function preloadAssetPack(packId: AssetPackType, sampleFiles: string[] = []) {
  // 預設的樣本文件列表
  const defaultSamples = [
    'horizon-ddpSJfpk.avif',
    'boost_pressed-D_rVqV-8.avif'
  ]
  
  const filesToPreload = sampleFiles.length > 0 ? sampleFiles : defaultSamples
  
  console.log(`🔄 預載入 ${packId} 素材包的資源`)
  
  const preloadPromises = filesToPreload.map(async (filename) => {
    try {
      // 直接生成路徑，避免使用 store
      const imagePath = `/${packId}/avif/assets/${filename}`
      const img = new Image()
      img.src = imagePath
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      console.log(`✅ 預載入成功: ${filename}`)
    } catch (error) {
      console.warn(`⚠️ 預載入失敗: ${filename}`, error)
    }
  })
  
  await Promise.allSettled(preloadPromises)
  console.log(`✅ ${packId} 素材包預載入完成`)
}
