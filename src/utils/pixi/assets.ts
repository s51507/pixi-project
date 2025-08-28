/**
 * PixiJS 資源管理相關工具函數
 */
import * as PIXI from 'pixi.js'

export interface SpineAssets {
  skelPath: string
  atlasPath: string
  imagePath?: string
}

export interface LoadedAssets {
  skelKey: string
  atlasKey: string
  imageKey?: string
}

/**
 * 生成唯一的資源鍵名
 */
export function generateAssetKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * 載入 Spine 動畫資源
 */
export async function loadSpineAssets(
  assets: SpineAssets, 
  logger?: (message: string) => void
): Promise<LoadedAssets> {
  const log = logger || console.log
  
  log('開始載入 Spine 動畫資源...')
  
  // 生成唯一鍵名
  const skelKey = generateAssetKey('skel')
  const atlasKey = generateAssetKey('atlas')
  const imageKey = assets.imagePath ? generateAssetKey('image') : undefined
  
  // 註冊資源
  log('註冊並載入資源到緩存...')
  PIXI.Assets.add({ alias: skelKey, src: assets.skelPath })
  PIXI.Assets.add({ alias: atlasKey, src: assets.atlasPath })
  
  const assetsToLoad = [skelKey, atlasKey]
  
  if (assets.imagePath && imageKey) {
    PIXI.Assets.add({ alias: imageKey, src: assets.imagePath })
    assetsToLoad.push(imageKey)
  }
  
  // 載入資源
  await PIXI.Assets.load(assetsToLoad)
  log('✅ Spine 動畫資源載入完成')
  
  return {
    skelKey,
    atlasKey,
    imageKey
  }
}

/**
 * 卸載指定的資源
 */
export async function unloadAssets(
  assetKeys: string[], 
  logger?: (message: string) => void
): Promise<void> {
  const log = logger || console.log
  
  if (assetKeys.length === 0) return
  
  try {
    log(`卸載資源: ${assetKeys.join(', ')}`)
    await PIXI.Assets.unload(assetKeys)
    log('✅ 資源卸載完成')
  } catch (error) {
    log(`❌ 資源卸載失敗: ${error}`)
  }
}

/**
 * 檢查資源是否存在於緩存中
 */
export function checkAssetCache(key: string): boolean {
  return PIXI.Assets.cache.has(key)
}

/**
 * 獲取緩存中的資源
 */
export function getCachedAsset<T = any>(key: string): T | undefined {
  return PIXI.Assets.get(key)
}

/**
 * 清理所有 Spine 相關的緩存資源
 */
export function clearSpineCache(logger?: (message: string) => void): void {
  const log = logger || console.log
  
  const cacheKeys = Array.from((PIXI.Assets.cache as any).keys())
  const spineKeys = cacheKeys.filter((key: any) => 
    key.startsWith('skel-') || 
    key.startsWith('atlas-') || 
    key.startsWith('image-')
  )
  
  if (spineKeys.length > 0) {
    log(`清理 Spine 緩存資源: ${spineKeys.length} 個`)
    spineKeys.forEach(key => {
      (PIXI.Assets.cache as any).delete(key)
    })
    log('✅ Spine 緩存清理完成')
  }
}