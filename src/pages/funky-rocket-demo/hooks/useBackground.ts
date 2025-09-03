import { ref, computed } from 'vue'
import type { Sprite } from 'pixi.js'
import { Assets } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { createLogger } from '@/utils/pixi/logger'
import { useBaseConfig } from './useBaseConfig'

const logger = createLogger()

export const useBackground = (getApp: () => any) => {
  // 基礎配置
  const {
    gameWidth,
    gameHeight,
    scaleFactorX,
    scaleFactorY
  } = useBaseConfig()
  // 背景精靈實例
  let defaultBackgroundSprite: Sprite | null = null
  let cycleBackgroundSprites: Sprite[] = [] // 多個循環背景精靈
  let frontCloudSprite: Sprite | null = null // 前景雲朵

  // 背景滾動狀態
  const isScrolling = ref(false)
  const scrollSpeed = ref(5) // 滾動速度 (初始值)
  
  // 計算屬性：滾動相關參數（根據縮放因子調整）
  const baseScrollSpeed = computed(() => 5 * Math.min(scaleFactorX.value, scaleFactorY.value))
  const speedIncrease = computed(() => 0.02 * Math.min(scaleFactorX.value, scaleFactorY.value))
  const maxScrollSpeed = computed(() => 20 * Math.min(scaleFactorX.value, scaleFactorY.value))

  // 響應式資源路徑 - 固定使用 funkyRocket
  const defaultBackground = computed(() => 
    '/funkyRocket/png/bgDefault.png'
  )

  const cycleBackground = computed(() => 
    '/funkyRocket/png/bgCycle.png'
  )

  const frontCloud = computed(() => 
    '/funkyRocket/png/frontCloud.png'
  )

  const pageBackgroundImage = computed(() => 
    `url('/funkyRocket/avif/assets/bg/full_bg-B3-suPnV.avif')`
  )

  // 設置默認背景
  const setDefaultBackground = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    try {
      logger.info(`🖼️ 載入默認背景`)
      
      const texture = await Assets.load(defaultBackground.value)
      defaultBackgroundSprite = new PIXI.Sprite(texture)
      
      // 設置背景尺寸以適應畫布，保持比例
      const scaleX = gameWidth.value / texture.width
      const scaleY = gameHeight.value / texture.height
      const scale = Math.max(scaleX, scaleY) // 確保完全覆蓋
      
      defaultBackgroundSprite.scale.set(scale)
      // 使用整數座標避免像素縫隙
      defaultBackgroundSprite.x = Math.floor((gameWidth.value - texture.width * scale) / 2)
      defaultBackgroundSprite.y = Math.floor((gameHeight.value - texture.height * scale) / 2)
      defaultBackgroundSprite.zIndex = -10 // 在最底層
      
      app.stage.addChild(defaultBackgroundSprite)
      
      logger.info('✅ 默認背景設置完成')
      
    } catch (error) {
      logger.error(`❌ 默認背景載入失敗: ${error}`)
    }
  }

  // 設置前景雲朵 - 高度最多到螢幕一半
  const setFrontCloud = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    try {
      logger.info('☁️ 設置前景雲朵')
      const texture = await Assets.load(frontCloud.value)
      
      if (frontCloudSprite && app.stage.getChildIndex(frontCloudSprite) !== -1) {
        app.stage.removeChild(frontCloudSprite)
      }
      
      frontCloudSprite = new PIXI.Sprite(texture)
      
      // 設置雲朵寬度填滿螢幕，但限制高度最多到螢幕一半
      const scale = gameWidth.value / texture.width
      const scaledHeight = texture.height * scale
      const maxHeight = gameHeight.value * 0.5  // 最多螢幕一半高度
      
      // 寬度始終填滿螢幕
      frontCloudSprite.width = gameWidth.value
      frontCloudSprite.x = 0
      
      // 高度限制在螢幕一半
      frontCloudSprite.height = Math.min(scaledHeight, maxHeight)
      
      // 靠下對齊 - 放在畫面底部
      frontCloudSprite.y = gameHeight.value - frontCloudSprite.height
      frontCloudSprite.zIndex = 10 // 在所有元素前面
      
      app.stage.addChild(frontCloudSprite)
      app.stage.sortChildren()
      
      logger.info('✅ 前景雲朵設置完成')
    } catch (error) {
      logger.error(`❌ 前景雲朵設置失敗: ${error}`)
    }
  }

  // 初始化循環背景 - 在默認背景上方接續
  const initCycleBackground = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    try {
      logger.info(`🔄 初始化循環背景`)
      
      const texture = await Assets.load(cycleBackground.value)
      
      // 設置背景寬度適應畫布，保持比例
      const scale = gameWidth.value / texture.width
      const scaledHeight = texture.height * scale
      
      // 創建足夠的精靈來填滿和覆蓋畫面高度（考慮滾動）
      const spriteCount = Math.ceil(gameHeight.value / scaledHeight) + 2
      
      for (let i = 0; i < spriteCount; i++) {
        const sprite = new PIXI.Sprite(texture)
        sprite.scale.set(scale)
        sprite.x = 0
        // 在默認背景上方排列，使用整數座標避免像素縫隙
        sprite.y = Math.floor(-scaledHeight * (i + 1))
        sprite.zIndex = -5 // 在默認背景之上，但在其他元素之下
        
        cycleBackgroundSprites.push(sprite)
        app.stage.addChild(sprite)
      }
      
      app.stage.sortChildren()
      logger.info(`✅ 創建了 ${spriteCount} 個循環背景精靈`)
      
    } catch (error) {
      logger.error(`❌ 循環背景設置失敗: ${error}`)
    }
  }

  // 啟動背景滾動（包含默認背景和循環背景）
  const startBackgroundScroll = (): void => {
    if (isScrolling.value) return
    
    isScrolling.value = true
    // 重置速度到初始值
    scrollSpeed.value = baseScrollSpeed.value
    
    logger.info('🌊 開始背景滾動')
    
    const scroll = () => {
      if (!isScrolling.value) return
      
      // 漸進式加速，直到達到最大速度
      if (scrollSpeed.value < maxScrollSpeed.value) {
        scrollSpeed.value = Math.min(scrollSpeed.value + speedIncrease.value, maxScrollSpeed.value)
      }
      
      // 滾動默認背景（bgDefault）
      if (defaultBackgroundSprite) {
        defaultBackgroundSprite.y += scrollSpeed.value
      }
      
      // 滾動前景雲朵，跟著 bgDefault 一起移動
      if (frontCloudSprite) {
        frontCloudSprite.y += scrollSpeed.value
        // 前景雲朵滾出螢幕後就不再回來
      }
      
      // 滾動循環背景（bgCycle）
      cycleBackgroundSprites.forEach(sprite => {
        sprite.y += scrollSpeed.value
        
        // 當精靈完全移出下方時，移動到隊列最上方繼續循環
        if (sprite.y > gameHeight.value + sprite.height) {
          // 找到所有精靈中最上方的位置（包含默認背景）
          const allSprites = [defaultBackgroundSprite, ...cycleBackgroundSprites].filter(s => s !== null && s !== sprite)
          if (allSprites.length > 0) {
            const topY = Math.min(...allSprites.map(s => s!.y))
            // 確保無縫銜接，使用整數座標避免像素縫隙
            sprite.y = Math.floor(topY - sprite.height) + scrollSpeed.value
          }
        }
      })
      
      if (isScrolling.value) {
        requestAnimationFrame(scroll)
      }
    }
    
    scroll()
  }

  // 停止背景滾動
  const stopBackgroundScroll = (): void => {
    isScrolling.value = false
    logger.info('🛑 停止背景滾動')
  }

  // 背景淡入 + 前景浮現動畫
  const animateBackgroundFloatUp = (
    oldCycleSprites: any[] = [], 
    oldDefaultBackground: any = null, 
    oldFrontCloud: any = null
  ): void => {
    const app = getApp()
    if (!defaultBackgroundSprite && !frontCloudSprite) return
    
    // 保存原始位置
    const originalCloudY = frontCloudSprite?.y || 0
    
    // 背景淡入設置 - 保持在原位置，但設為透明
    if (defaultBackgroundSprite) {
      defaultBackgroundSprite.alpha = 0 // 初始透明
    }
    
    // 前景浮現設置 - 移到螢幕下方
    if (frontCloudSprite) {
      frontCloudSprite.y = gameHeight.value + frontCloudSprite.height
    }
    
    const duration = 500 // 0.5秒動畫
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用 easeOutCubic 緩動函數，讓動畫更自然
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      // 背景淡入動畫
      if (defaultBackgroundSprite) {
        defaultBackgroundSprite.alpha = easeProgress // 從 0 淡入到 1
      }
      
      // 前景浮現動畫
      if (frontCloudSprite) {
        const startY = gameHeight.value + frontCloudSprite.height
        const endY = originalCloudY
        frontCloudSprite.y = startY + (endY - startY) * easeProgress
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 動畫完成，清理舊背景
        if (!app) return
 
        // 清理舊循環背景
        oldCycleSprites.forEach(sprite => {
          if (app && app.stage.getChildIndex(sprite) !== -1) {
            app.stage.removeChild(sprite)
          }
        })
        
        // 清理舊默認背景
        if (oldDefaultBackground && app.stage.getChildIndex(oldDefaultBackground) !== -1) {
          app.stage.removeChild(oldDefaultBackground)
        }
        
        // 清理舊前景雲朵
        if (oldFrontCloud && app.stage.getChildIndex(oldFrontCloud) !== -1) {
          app.stage.removeChild(oldFrontCloud)
        }
        
        // 重新排序子元素
        app.stage.sortChildren()
        
        logger.info('✅ 背景淡入 + 前景浮現動畫完成，舊背景已清理')
      }
    }
    
    logger.info('🎬 開始背景淡入 + 前景浮現動畫')
    animate()
  }

  // 更新背景縮放
  const updateBackgroundScale = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    // 更新默認背景
    if (defaultBackgroundSprite) {
      const texture = defaultBackgroundSprite.texture
      const scaleX = gameWidth.value / texture.width
      const scaleY = gameHeight.value / texture.height
      const scale = Math.max(scaleX, scaleY)
      
      defaultBackgroundSprite.scale.set(scale)
      defaultBackgroundSprite.x = Math.floor((gameWidth.value - texture.width * scale) / 2)
      defaultBackgroundSprite.y = Math.floor((gameHeight.value - texture.height * scale) / 2)
    }
    
    // 更新循環背景
    if (cycleBackgroundSprites.length > 0) {
      const texture = cycleBackgroundSprites[0].texture
      const scale = gameWidth.value / texture.width
      const scaledHeight = texture.height * scale
      
      cycleBackgroundSprites.forEach((sprite, i) => {
        sprite.scale.set(scale)
        sprite.x = 0
        sprite.y = Math.floor(-scaledHeight * (i + 1))
      })
    }
  }

  // 更新前景雲朵縮放
  const updateFrontCloudScale = async (): Promise<void> => {
    const app = getApp()
    if (!app || !frontCloudSprite) return
    
    const texture = frontCloudSprite.texture
    const scale = gameWidth.value / texture.width
    const scaledHeight = texture.height * scale
    const maxHeight = gameHeight.value * 0.5
    
    frontCloudSprite.width = gameWidth.value
    frontCloudSprite.height = Math.min(scaledHeight, maxHeight)
    frontCloudSprite.x = 0
    frontCloudSprite.y = gameHeight.value - frontCloudSprite.height
  }

  // 重置背景（重置遊戲時用）
  const resetBackground = async (): Promise<{
    oldCycleSprites: any[]
    oldDefaultBackground: any
    oldFrontCloud: any
  }> => {
    const app = getApp()
    
    // 保存舊背景引用，稍後在動畫完成後清理
    const oldCycleSprites = [...cycleBackgroundSprites]
    const oldDefaultBackground = defaultBackgroundSprite
    const oldFrontCloud = frontCloudSprite
    
    // 重置引用但不清理實際元素
    cycleBackgroundSprites = []
    
    // 創建新的背景和前景
    if (app) {
      // 先重置引用
      defaultBackgroundSprite = null
      frontCloudSprite = null
      
      // 創建新背景和前景
      await setDefaultBackground()
      await setFrontCloud()
      
      // 確保新背景在所有舊背景上方
      if (defaultBackgroundSprite) {
        (defaultBackgroundSprite as any).zIndex = -1 // 比舊背景(-10)和循環背景(-5)都高
      }
      if (frontCloudSprite) {
        (frontCloudSprite as any).zIndex = 20 // 比舊前景(10)高  
      }
      
      // 立即排序以確保顯示順序正確
      app.stage.sortChildren()
    }

    return { oldCycleSprites, oldDefaultBackground, oldFrontCloud }
  }

  // 清理所有背景
  const destroyBackground = (): void => {
    const app = getApp()
    if (!app) return
    
    // 停止滾動
    stopBackgroundScroll()
    
    // 清理默認背景
    if (defaultBackgroundSprite && app.stage.getChildIndex(defaultBackgroundSprite) !== -1) {
      app.stage.removeChild(defaultBackgroundSprite)
    }
    defaultBackgroundSprite = null
    
    // 清理前景雲朵
    if (frontCloudSprite && app.stage.getChildIndex(frontCloudSprite) !== -1) {
      app.stage.removeChild(frontCloudSprite)
    }
    frontCloudSprite = null
    
    // 清理循環背景
    cycleBackgroundSprites.forEach(sprite => {
      if (app && app.stage.getChildIndex(sprite) !== -1) {
        app.stage.removeChild(sprite)
      }
    })
    cycleBackgroundSprites = []
    
    logger.info('🧹 背景已清理')
  }

  return {
    // 狀態
    isScrolling,
    scrollSpeed,
    
    // 計算屬性
    baseScrollSpeed,
    speedIncrease,
    maxScrollSpeed,
    defaultBackground,
    cycleBackground,
    frontCloud,
    pageBackgroundImage,

    // 方法
    setDefaultBackground,
    setFrontCloud,
    initCycleBackground,
    startBackgroundScroll,
    stopBackgroundScroll,
    animateBackgroundFloatUp,
    updateBackgroundScale,
    updateFrontCloudScale,
    resetBackground,
    destroyBackground
  }
}
