/**
 * 文字跟隨工具
 * 結合文字管理和骨骼追蹤功能，提供完整的文字跟隨解決方案
 */

import type { Application } from 'pixi.js'
import type { Spine } from '@esotericsoftware/spine-pixi-v8'
import { createPixiText, addTextToStage, type CreateTextResult, type TextConfig, type TextTransform } from './text'
import { createBoneTracker, type BoneTracker, type TextOffset } from './boneTracker'

export interface TextFollowerConfig {
  /** PixiJS 應用實例 */
  app: Application
  /** Spine 動畫實例 */
  spine: Spine
  /** 文字配置 */
  textConfig?: Partial<TextConfig>
  /** 文字初始變換 */
  textTransform?: TextTransform
  /** 文字相對於骨骼的偏移量（X/Y 軸） */
  textOffset?: TextOffset
  /** 文字相對於骨骼的 Y 軸偏移（向後兼容，建議使用 textOffset） */
  textOffsetY?: number
  /** 是否啟用調試日誌 */
  enableDebugLog?: boolean
  /** 調試日誌輸出頻率 (0-1) */
  debugLogFrequency?: number
  /** 日誌函數 */
  logger?: (message: string) => void
}

export interface TextFollowerResult {
  /** 文字管理結果 */
  textResult: CreateTextResult
  /** 骨骼追蹤器 */
  boneTracker: BoneTracker
  /** 開始跟隨 */
  startFollowing: () => void
  /** 停止跟隨 */
  stopFollowing: () => void
  /** 是否正在跟隨 */
  isFollowing: () => boolean
  /** 更新文字內容 */
  updateText: (newText: string) => void
  /** 設置文字可見性 */
  setVisible: (visible: boolean) => void
  /** 更新文字偏移量 */
  updateTextOffset: (offset: TextOffset) => void
  /** 獲取當前文字偏移量 */
  getTextOffset: () => TextOffset
  /** 檢查所有骨骼位置 */
  checkBonePositions: () => void
  /** 檢測移動骨骼 */
  detectMovingBones: (duration?: number) => Promise<any>
  /** 銷毀所有資源 */
  dispose: () => void
}

/**
 * 創建文字跟隨系統
 * 這是一個高級工具，整合了文字創建、舞台管理和骨骼追蹤功能
 */
export function createTextFollower(config: TextFollowerConfig): TextFollowerResult {
  const log = config.logger || (() => {})
  
  try {
    log('🚀 創建文字跟隨系統')
    
    // 1. 創建文字物件
    const defaultTextConfig = {
      text: 'Follow Text',
      fontSize: 32,
      fill: 0xffffff,
      strokeColor: 0x000000,
      strokeWidth: 2,
      dropShadow: true
    }
    
    const finalTextConfig = { ...defaultTextConfig, ...config.textConfig }
    const textResult = createPixiText(finalTextConfig, log)
    
    // 2. 添加文字到舞台
    const defaultTransform = {
      x: config.app.screen.width / 2,
      y: config.app.screen.height / 2,
      anchorX: 0.5,
      anchorY: 0.5,
      zIndex: 10,
      visible: true
    }
    
    const finalTransform = { ...defaultTransform, ...config.textTransform }
    addTextToStage(config.app, textResult, finalTransform, log)
    
    // 3. 創建骨骼追蹤器
    const boneTracker = createBoneTracker({
      textObject: textResult.textObject,
      spine: config.spine,
      textOffset: config.textOffset || { x: 0, y: config.textOffsetY || 60 },
      textOffsetY: config.textOffsetY, // 保持向後兼容
      enableDebugLog: config.enableDebugLog || false,
      debugLogFrequency: config.debugLogFrequency || 0.3
    })
    
    log('✅ 文字跟隨系統創建完成')
    
    // 返回管理接口
    return {
      textResult,
      boneTracker,
      
      startFollowing() {
        log('🎯 開始文字跟隨')
        boneTracker.startTracking()
      },
      
      stopFollowing() {
        log('⏹️ 停止文字跟隨')
        boneTracker.stopTracking()
      },
      
      isFollowing() {
        return boneTracker.isTrackingActive()
      },
      
      updateText(newText: string) {
        textResult.updateText(newText)
        log(`📝 文字內容已更新: "${newText}"`)
      },
      
      setVisible(visible: boolean) {
        textResult.setVisible(visible)
        log(`👁️ 文字${visible ? '顯示' : '隱藏'}`)
      },
      
      updateTextOffset(offset: TextOffset) {
        boneTracker.updateTextOffset(offset)
        log(`📍 文字偏移量已更新: X=${offset.x || 0}, Y=${offset.y || 0}`)
      },
      
      getTextOffset() {
        return boneTracker.getTextOffset()
      },
      
      checkBonePositions() {
        log('🔍 檢查骨骼位置')
        return boneTracker.checkAllBonePositions()
      },
      
      async detectMovingBones(duration = 2000) {
        log(`🔍 開始檢測移動骨骼 (${duration}ms)`)
        return await boneTracker.detectMovingBones(duration)
      },
      
      dispose() {
        log('🗑️ 銷毀文字跟隨系統')
        boneTracker.dispose()
        textResult.destroy()
      }
    }
    
  } catch (err) {
    log(`❌ 創建文字跟隨系統失敗: ${err}`)
    throw err
  }
}

/**
 * 簡化版文字跟隨創建函數
 * 使用預設配置快速創建文字跟隨系統
 */
export function createSimpleTextFollower(
  app: Application,
  spine: Spine,
  text: string = 'Follow Me!',
  logger?: (message: string) => void
): TextFollowerResult {
  return createTextFollower({
    app,
    spine,
    textConfig: { text },
    enableDebugLog: true,
    debugLogFrequency: 0.2,
    logger
  })
}

/**
 * 為現有的 PixiJS 文字物件添加骨骼跟隨功能
 * 適用於已經創建了文字物件，只需要添加跟隨功能的情況
 */
export function addFollowingToExistingText(
  textObject: any, // PIXI.Text
  spine: Spine,
  config?: {
    textOffsetY?: number
    enableDebugLog?: boolean
    debugLogFrequency?: number
    logger?: (message: string) => void
  }
): Pick<TextFollowerResult, 'boneTracker' | 'startFollowing' | 'stopFollowing' | 'isFollowing' | 'checkBonePositions' | 'detectMovingBones'> {
  
  const log = config?.logger || (() => {})
  
  const boneTracker = createBoneTracker({
    textObject,
    spine,
    textOffsetY: config?.textOffsetY || 60,
    enableDebugLog: config?.enableDebugLog || false,
    debugLogFrequency: config?.debugLogFrequency || 0.3
  })
  
  log('✅ 為現有文字添加跟隨功能完成')
  
  return {
    boneTracker,
    
    startFollowing() {
      log('🎯 開始文字跟隨')
      boneTracker.startTracking()
    },
    
    stopFollowing() {
      log('⏹️ 停止文字跟隨')
      boneTracker.stopTracking()
    },
    
    isFollowing() {
      return boneTracker.isTrackingActive()
    },
    
    checkBonePositions() {
      log('🔍 檢查骨骼位置')
      return boneTracker.checkAllBonePositions()
    },
    
    async detectMovingBones(duration = 2000) {
      log(`🔍 開始檢測移動骨骼 (${duration}ms)`)
      return await boneTracker.detectMovingBones(duration)
    }
  }
}
