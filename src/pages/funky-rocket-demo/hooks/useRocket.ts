import { 
  createSpineAnimation,
  playSpineAnimation,
  playSpineAnimationWithTrack,
  applySpineTransform,
  clearSpineState,
  clearSpineStateWithTrack,
} from '@/utils/pixi'
import { createLogger } from '@/utils/pixi/logger'
import { createFloatEffect, type EffectState } from '@/utils/pixi/effects'
import { useBaseConfig } from './useBaseConfig'

const logger = createLogger()

export const useRocket = (getApp: () => any) => {
  // 基礎配置
  const {
    gameWidth,
    gameHeight,
    scaleFactorX,
    scaleFactorY,
    baseOffsetY,
    baseScale
  } = useBaseConfig()

  // 火箭實例
  let rocketSpine: any = null
  let rocketFloatEffect: EffectState | null = null

  // 初始化火箭
  const initializeRocket = async (): Promise<any> => {
    const app = getApp()
    if (!app) return null

    try {
      logger.info('🚀 開始創建火箭 Spine 動畫...')
      const spineResult = await createSpineAnimation({
        skelPath: '/funkyRocket/spine/rocket/rocket.skel',
        atlasPath: '/funkyRocket/spine/rocket/rocket.atlas',
        imagePath: '/funkyRocket/spine/rocket/rocket.png'
      })
      
      rocketSpine = spineResult.spine
      rocketSpine.zIndex = 1
      app.stage.addChild(rocketSpine)
      
      // 設置火箭位置（居中，考慮縮放因子）
      applySpineTransform(rocketSpine, {
        x: gameWidth.value / 2,
        y: gameHeight.value / 2 + baseOffsetY.value,
        scaleX: baseScale.value,
        scaleY: baseScale.value
      })

      // 播放火箭初始動畫（launch）
      if (spineResult.animations.includes('launch')) {
        playSpineAnimation(rocketSpine, 'launch', true)
      }

      logger.info('✅ 火箭創建完成')
      return rocketSpine
      
    } catch (error) {
      logger.error(`❌ 火箭創建失敗: ${error}`)
      return null
    }
  }

  // 開始火箭漂浮效果
  const startRocketFloat = (): void => {
    if (!rocketSpine || rocketFloatEffect?.isActive) return
    
    logger.info('🌊 開始火箭漂浮效果')

    rocketFloatEffect = createFloatEffect(
      rocketSpine,
      {
        range: 15 * Math.min(scaleFactorX.value, scaleFactorY.value), // 漂浮範圍根據縮放因子調整
        speed: 1.2, // 漂浮速度
        baseX: rocketSpine.x,
        baseY: rocketSpine.y
      }
      // 移除回調函數，讓 createFloatEffect 內部直接處理位置更新
    )
  }

  // 停止火箭漂浮效果
  const stopRocketFloat = (): void => {
    if (!rocketFloatEffect) return
    
    logger.info('⏹️ 停止火箭漂浮效果')
    rocketFloatEffect.isActive = false
    
    if (rocketFloatEffect.animationId) {
      cancelAnimationFrame(rocketFloatEffect.animationId)
      rocketFloatEffect.animationId = null
    }
    
    rocketFloatEffect = null
  }

  // 播放火箭動畫
  const playRocketAnimation = (animationName: string, loop: boolean = false): void => {
    if (!rocketSpine) return
    playSpineAnimation(rocketSpine, animationName, loop)
  }

  // 播放火箭動畫（帶軌道）
  const playRocketAnimationWithTrack = (animationName: string, loop: boolean = false, trackIndex: number = 0): any => {
    if (!rocketSpine) return null
    return playSpineAnimationWithTrack(rocketSpine, animationName, loop, trackIndex)
  }

  // 清理火箭狀態
  const clearRocketState = (): void => {
    if (!rocketSpine) return
    clearSpineState(rocketSpine)
  }

  // 清理火箭狀態（帶軌道）
  const clearRocketStateWithTrack = (trackIndex: number = 1): void => {
    if (!rocketSpine) return
    clearSpineStateWithTrack(rocketSpine, trackIndex)
  }

  // 重置火箭位置和動畫
  const resetRocket = (): void => {
    if (!rocketSpine) return

    clearSpineState(rocketSpine)
    
    // 恢復火箭到原始大小和位置
    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value,
      scaleY: baseScale.value
    })

    // 播放重置動畫
    playRocketAnimation('restart', false)
    logger.info('🚀 火箭開始震動')
    
    // 0.6 秒後切換到 launch 動畫
    setTimeout(() => {
      if (rocketSpine) {
        clearSpineState(rocketSpine)
        playRocketAnimation('launch', true)
        logger.info('🚀 火箭切換到 launch 動畫')
      }
    }, 600)
  }

  // 更新火箭縮放
  const updateRocketScale = (): void => {
    if (!rocketSpine) return

    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value,
      scaleY: baseScale.value
    })
  }

  // 設置火箭縮放（手動指定位置）
  const setRocketScale = (x?: number, y?: number): void => {
    if (!rocketSpine) return

    applySpineTransform(rocketSpine, {
      x: x !== undefined ? x : gameWidth.value / 2,
      y: y !== undefined ? y : gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value,
      scaleY: baseScale.value
    })
  }

  // 清理火箭資源
  const destroyRocket = (): void => {
    const app = getApp()
    
    stopRocketFloat()
    
    if (rocketSpine && app) {
      if (app.stage.getChildIndex(rocketSpine) !== -1) {
        app.stage.removeChild(rocketSpine)
      }
    }
    
    rocketSpine = null
    logger.info('🧹 火箭已清理')
  }

  // 獲取火箭實例
  const getRocketSpine = (): any => {
    return rocketSpine
  }

  return {
    // 方法
    initializeRocket,
    startRocketFloat,
    stopRocketFloat,
    playRocketAnimation,
    playRocketAnimationWithTrack,
    clearRocketState,
    clearRocketStateWithTrack,
    resetRocket,
    updateRocketScale,
    setRocketScale,
    destroyRocket,
    getRocketSpine
  }
}
