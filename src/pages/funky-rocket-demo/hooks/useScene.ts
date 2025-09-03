import { ref, onMounted, onUnmounted } from 'vue'
import type { Application } from 'pixi.js'
import { createPixiApp, destroyPixiApp } from '@/utils/pixi'
import { createLogger } from '@/utils/pixi/logger'
import { CountdownTimer } from '@/utils/pixi/scene'
import { useBaseConfig } from './useBaseConfig'

const logger = createLogger()

export const useScene = () => {
  // 基礎配置
  const {
    gameWidth,
    gameHeight,
    scaleFactorX,
    scaleFactorY
  } = useBaseConfig()

  // Canvas 引用
  const canvasRef = ref<HTMLCanvasElement>()

  // PixiJS 相關實例
  let app: Application | null = null
  let countdownTimer: CountdownTimer | null = null

  // 獲取 PixiJS app 實例的函數
  const getApp = () => app

  // 獲取倒數計時器
  const getCountdownTimer = () => countdownTimer

  // 創建 PixiJS 應用
  const createPixiApplication = async (): Promise<void> => {
    if (!canvasRef.value) {
      logger.error('Canvas 元素未找到')
      return
    }

    try {
      logger.info('=== 開始創建 PixiJS 應用 ===')

      const pixiResult = await createPixiApp({
        canvas: canvasRef.value,
        width: gameWidth.value,
        height: gameHeight.value,
        backgroundColor: 0x000000
      })
      
      app = pixiResult.app
      app.stage.sortableChildren = true

      // 初始化倒數計時器
      countdownTimer = new CountdownTimer()
      
      logger.info('✅ PixiJS 應用創建完成')
      
    } catch (error) {
      logger.error(`❌ PixiJS 應用創建失敗: ${error}`)
    }
  }

  // 響應式更新遊戲尺寸 - 保持 540:958 比例，確保完全顯示在螢幕內
  const updateGameSize = (): void => {
    const aspectRatio = 540 / 958 // 原始比例
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // 計算按高度和寬度縮放的尺寸
    const heightBasedWidth = viewportHeight * aspectRatio
    const widthBasedHeight = viewportWidth / aspectRatio
    
    // 使用較小的尺寸來確保完全顯示在螢幕內
    if (heightBasedWidth <= viewportWidth) {
      // 按高度縮放
      gameWidth.value = heightBasedWidth
      gameHeight.value = viewportHeight
    } else {
      // 按寬度縮放
      gameWidth.value = viewportWidth
      gameHeight.value = widthBasedHeight
    }
    
    // 更新 PixiJS 應用尺寸
    if (app) {
      app.renderer.resize(gameWidth.value, gameHeight.value)
    }
    
    logger.info(`🖼️ 遊戲尺寸已更新: ${gameWidth.value}x${gameHeight.value} (視窗: ${viewportWidth}x${viewportHeight})`)
    
    // 重新繪製遊戲內容以適應新的縮放因子
    updateGameContentScale()
  }

  // 更新遊戲內容縮放 - 重新計算所有元素的位置和大小
  const updateGameContentScale = (updateFunctions?: {
    updateRocketScale?: () => void,
    updateBackgroundScale?: () => void,
    updateFrontCloudScale?: () => void,
    updateCharactersScale?: () => void,
    stopRocketFloat?: () => void,
    startRocketFloat?: () => void,
    resetScrollSpeed?: () => void
  }): void => {
    logger.info(`🔄 更新遊戲內容縮放，縮放因子: ${scaleFactorX.value.toFixed(2)}x${scaleFactorY.value.toFixed(2)}`)
    
    if (updateFunctions) {
      // 1. 更新火箭位置和大小
      updateFunctions.updateRocketScale?.()
      
      // 2. 更新背景
      updateFunctions.updateBackgroundScale?.()
      
      // 3. 更新前景雲朵
      updateFunctions.updateFrontCloudScale?.()
      
      // 4. 更新角色
      updateFunctions.updateCharactersScale?.()
      
      // 5. 重置滾動速度
      updateFunctions.resetScrollSpeed?.()
      
      // 6. 更新火箭漂浮效果
      updateFunctions.stopRocketFloat?.()
      updateFunctions.startRocketFloat?.()
    }
  }

  // 清理函數
  const cleanup = (cleanupFunctions?: {
    destroyAllCharacters?: () => void,
    destroyBackground?: () => void,
    destroyRocket?: () => void,
    destroyAudio?: () => void
  }): void => {
    logger.info('🧹 清理 Funky Rocket 遊戲場景')
    
    if (countdownTimer) {
      countdownTimer.stop()
      countdownTimer = null
    }
    
    if (cleanupFunctions) {
      // 清理所有角色
      cleanupFunctions.destroyAllCharacters?.()
      
      // 清理背景和特效
      cleanupFunctions.destroyBackground?.()
      cleanupFunctions.destroyRocket?.()
      
      // 清理音效
      cleanupFunctions.destroyAudio?.()
    }
    
    if (app) {
      destroyPixiApp(app)
      app = null
    }
  }

  // 設置生命週期管理
  const setupLifecycle = (initFunctions?: {
    initScene?: () => Promise<void>,
    updateFunctions?: {
      updateRocketScale?: () => void,
      updateBackgroundScale?: () => void,
      updateFrontCloudScale?: () => void,
      updateCharactersScale?: () => void,
      stopRocketFloat?: () => void,
      startRocketFloat?: () => void,
      resetScrollSpeed?: () => void
    },
    cleanupFunctions?: {
      destroyAllCharacters?: () => void,
      destroyBackground?: () => void,
      destroyRocket?: () => void,
      destroyAudio?: () => void
    }
  }): void => {
    onMounted(async () => {
      logger.info('🎸 Funky Rocket 遊戲頁面已掛載')
      updateGameSize()
      await createPixiApplication()
      await initFunctions?.initScene?.()
      
      // 設置 updateGameContentScale 的更新函數
      const updateWithFunctions = () => {
        updateGameContentScale(initFunctions?.updateFunctions)
      }
      window.addEventListener('resize', updateWithFunctions)
    })

    onUnmounted(() => {
      logger.info('🎸 Funky Rocket 遊戲頁面即將卸載')
      window.removeEventListener('resize', updateGameSize)
      cleanup(initFunctions?.cleanupFunctions)
    })
  }

  return {
    // 引用
    canvasRef,
    
    // 方法
    getApp,
    getCountdownTimer,
    createPixiApplication,
    updateGameSize,
    updateGameContentScale,
    cleanup,
    setupLifecycle
  }
}
