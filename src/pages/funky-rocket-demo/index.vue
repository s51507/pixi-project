<template>
  <div class="h-screen text-white relative overflow-hidden" :style="{ backgroundImage: pageBackgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <!-- PixiJS Canvas 游戲本體 - 保持寬度比例，高度100vh -->
    <canvas 
      ref="canvasRef" 
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      :style="{ width: gameWidth + 'px', height: gameHeight + 'px' }"
    ></canvas>
    
    <!-- 右上角漢堡選單 -->
    <HamburgerMenu 
      :currentState="currentState"
      :charactersOnBoard="charactersOnBoard"
      :countdown="countdown"
      @updateVolume="updateVolume"
      @toggleBGM="toggleBGM"
      @toggleSoundEffect="toggleSoundEffect"
      @resetGame="resetGame"
    />

    <!-- Bottom Sheet 控制區域 -->
    <BottomSheet 
      :currentState="currentState"
      :charactersOnBoard="charactersOnBoard"
      :isAnimating="isAnimating"
      :scrollSpeed="scrollSpeed"
      :isScrolling="isScrolling"
      @startGame="startGame"
      @playerBoard="playerBoard"
      @streamerBoard="streamerBoard"
      @npcBoard="npcBoard"
      @startCountdown="startCountdown"
      @playerDisembark="playerDisembark"
      @streamerDisembark="streamerDisembark"
      @npcDisembark="npcDisembark"
      @explodeRocket="explodeRocket"
      @resetGame="resetGame"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HamburgerMenu from './components/HamburgerMenu.vue'
import BottomSheet from './components/BottomSheet.vue'
// 注意：此頁面固定使用 funkyRocket 素材包，不需要 useAssetPackStore

// 引入場景管理相關工具
import type { Application } from 'pixi.js'
import { getRandomNum } from '@/utils'
import { 
  createPixiApp, 
  destroyPixiApp,
  createSpineAnimation,
  playSpineAnimation,
  playSpineAnimationWithTrack,
  applySpineTransform,
  clearSpineState,
  clearSpineStateWithTrack,
} from '@/utils/pixi'
import { createLogger } from '@/utils/pixi/logger'
import { CountdownTimer } from '@/utils/pixi/scene'
import { createFloatEffect, type EffectState } from '@/utils/pixi/effects'
import { createBoneTracker } from '@/utils/pixi/boneTracker'
import { createPixiText } from '@/utils/pixi/text'
import { GameState, type CharacterType, type Character, type FollowTextResult } from './types'
import { useAudio } from './hooks/useAudio'
import { useGameState } from './hooks/useGameState'
import { useBackground } from './hooks/useBackground'

// 注意：此頁面固定使用 funkyRocket 素材包

// Canvas 引用
const canvasRef = ref<HTMLCanvasElement>()

// 遊戲狀態管理
const {
  currentState,
  countdown,
  isAnimating,
  hasPlayedLaunchPlayer,
  charactersOnBoard,
  setState,
  setCountdown,
  setAnimating,
  setLaunchPlayerPlayed,
  addCharacterToBoard,
  removeCharacterFromBoard,
  resetGameState
} = useGameState()

// 使用音效 hooks
const {
  initializeAudio,
  updateVolume,
  toggleBGM,
  toggleSoundEffect,
  playBGM,
  playSound,
  stopBGM,
  stopAllAudio,
  destroyAudio,
  bgmEnabled
} = useAudio()

// 遊戲尺寸 - 保持 540:958 比例，高度跟 body 一樣
const gameWidth = ref(540)
const gameHeight = ref(958)

// 設計基準尺寸 (設計稿的原始尺寸)
const DESIGN_WIDTH = 540
const DESIGN_HEIGHT = 958

// 縮放因子
const scaleFactorX = computed(() => gameWidth.value / DESIGN_WIDTH)
const scaleFactorY = computed(() => gameHeight.value / DESIGN_HEIGHT)

// 基礎偏移量，都要浮上來一點 (會根據縮放因子調整)
const baseOffsetY = computed(() => -35 * scaleFactorY.value)
// 基礎縮放，所有角色都會縮放這個值 (會根據縮放因子調整)
const baseScale = computed(() => 0.65 * Math.min(scaleFactorX.value, scaleFactorY.value))

// PixiJS 相關實例
let app: Application | null = null
let countdownTimer: CountdownTimer | null = null
let rocketSpine: any = null

let rocketFloatEffect: EffectState | null = null // 火箭漂浮效果
const characters: Map<string, Character> = new Map()
const logger = createLogger()

// 獲取 PixiJS app 實例的函數
const getApp = () => app

// 背景管理
const {
  isScrolling,
  scrollSpeed,
  baseScrollSpeed,
  pageBackgroundImage,
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
} = useBackground(getApp, gameWidth, gameHeight)

// 固定使用 funkyRocket 的 getSpineAssets 函數
function getSpineAssets(animationName: string) {
  return {
    skelPath: `/funkyRocket/spine/${animationName}/${animationName}.skel`,
    atlasPath: `/funkyRocket/spine/${animationName}/${animationName}.atlas`,
    imagePath: `/funkyRocket/spine/${animationName}/${animationName}.png`
  }
}


// 開始火箭漂浮效果
function startRocketFloat(): void {
  if (!rocketSpine || rocketFloatEffect?.isActive) return
  
  logger.info('🌊 開始火箭漂浮效果')

  rocketFloatEffect = createFloatEffect(
    rocketSpine,
    {
      range: 15 * Math.min(scaleFactorX.value, scaleFactorY.value),    // 漂浮範圍根據縮放因子調整
      speed: 1.2,   // 漂浮速度
      baseX: rocketSpine.x,
      baseY: rocketSpine.y
    }
    // 移除回調函數，讓 createFloatEffect 內部直接處理位置更新
  )
}

// 停止火箭漂浮效果
function stopRocketFloat(): void {
  if (!rocketFloatEffect) return
  
  logger.info('⏹️ 停止火箭漂浮效果')
  rocketFloatEffect.isActive = false
  
  if (rocketFloatEffect.animationId) {
    cancelAnimationFrame(rocketFloatEffect.animationId)
    rocketFloatEffect.animationId = null
  }
  
  rocketFloatEffect = null
}




// 創建角色
async function createCharacterWalk(type: CharacterType, id: string): Promise<Character | null> {
  if (!app) return null
  
  try {
    logger.info(`👤 創建角色: ${type} (${id})`)
    
    // 所有角色都使用統一的上車動畫
    const animationName = 'walk'
    
    const characterAssets = getSpineAssets(animationName)
    const spineResult = await createSpineAnimation({
      skelPath: characterAssets.skelPath,
      atlasPath: characterAssets.atlasPath,
      imagePath: characterAssets.imagePath
    })
    
    const spine = spineResult.spine
    // spine.zIndex = 2 // 角色在火箭之上
    
    // 設定角色起始位置 - 所有角色都從正中間開始 (考慮縮放因子)
    const scale = baseScale.value * 1.1  // 放大角色，讓它更明顯
    const startX = gameWidth.value / 2 // 從正中間開始
    const startY = gameHeight.value / 2 + baseOffsetY.value  // 接近地面位置 + 基礎偏移量
    
    logger.info(`🎯 角色起始位置: (${startX}, ${startY}), 畫面大小: ${gameWidth.value}x${gameHeight.value}`)
    
    // 玩家和主播需要鏡像反轉
    const shouldFlip = type === 'player' || type === 'streamer'
    
    applySpineTransform(spine, {
      x: startX,
      y: startY,
      scaleX: shouldFlip ? -scale : scale, // 負值表示左右反轉
      scaleY: scale
    })
    
    app.stage.addChild(spine)

    const character: Character = {
      id,
      type,
      spine,
      position: { x: startX, y: startY },
      isVisible: true
    }
    
    characters.set(id, character)
    logger.info(`✅ 角色創建成功: ${type} (${id})`)
    
    return character
    
  } catch (error) {
    logger.error(`❌ 角色創建失敗 ${type}: ${error}`)
    return null
  }
}

// 角色動畫 - 上車
async function animateCharacterWalk(character: Character, direction: 'left' | 'right'): Promise<void> {
  if (!character.spine) return
  
  return new Promise<void>((resolve, reject) => {
    try {
      // 角色已在創建時播放 walk 動畫，這裡只需要移動

      const isNpc = direction !== 'left'
      const directionOffsetX = (isNpc ? 10 : -10) * scaleFactorX.value // 偏移量也要縮放

      const animationName = isNpc ? 'others_walk' : 'me_walk'

      // 播放跳躍動畫（原地跳躍）
      playSpineAnimation(character.spine, animationName, false)
      
      // 移動到火箭附近的地面位置 (考慮縮放因子)
      const targetX = gameWidth.value / 2 + directionOffsetX // 畫面水平中心點
      const targetY = gameHeight.value / 2 + baseOffsetY.value  // 畫面中心 + 基礎偏移量
      
      const startX = character.position.x
      const startY = character.position.y
      const duration = 3000 // 3秒
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentX = startX + (targetX - startX) * easeOut
        const currentY = startY + (targetY - startY) * easeOut
        
        // 保持角色的反轉狀態
        const shouldFlip = character.type === 'player' || character.type === 'streamer'
        
        applySpineTransform(character.spine, {
          x: currentX,
          y: currentY,
          scaleX: shouldFlip ? -baseScale.value : baseScale.value,
          scaleY: baseScale.value
        })
        
        character.position.x = currentX
        character.position.y = currentY
        
        if (progress < 1) requestAnimationFrame(animate)
        else {
          // 動畫完成，移除角色
          if (app && app.stage.getChildIndex(character.spine) !== -1) {
            app.stage.removeChild(character.spine)
          }
          characters.delete(character.id)
          charactersOnBoard.value.push(character.type)
          logger.info(`✅ ${character.type} 上車完成，角色已移除`)
          
          // 🆕 動畫完成後 resolve Promise
          resolve()
        }
      }
      
      animate()
      
    } catch (error) {
      logger.error(`❌ 角色上車動畫失敗: ${error}`)
      reject(error)
    }
  })
}

// 創建文字跟隨功能

async function createFollowText(
  spine: any, 
  startX: number, 
  startY: number, 
  followText: string
): Promise<FollowTextResult> {
  // 沒有文字或沒有 app 則返回 undefined
  if (!followText || !app) return { textResult: undefined, boneTracker: undefined }

  try {
    // 1. 創建文字物件
    const textResult = createPixiText({
      text: followText,
      fontSize: 20,
      fill: 0xffffff,  // 白色文字
      strokeColor: 0x000000, // 黑色描邊
      strokeWidth: 1,
      dropShadow: false
    }, logger.createLogFunction())
    
    // 2. 暫時隱藏文字，等骨骼追蹤器計算出正確位置再顯示
    textResult.textObject.x = startX
    textResult.textObject.y = startY
    textResult.textObject.anchor.set(0.5, 0.5)
    // textResult.textObject.zIndex = 15
    textResult.textObject.visible = false  // 先隱藏
    app.stage.addChild(textResult.textObject)
    app.stage.sortChildren()
    
    // 3. 創建骨骼追蹤器
    const boneTracker = createBoneTracker({
      textObject: textResult.textObject,
      spine,
      textOffset: { x: 0, y: 60 }, // 文字在動畫下方
      // enableDebugLog: true,
      // debugLogFrequency: 0.3
    })
    
    // 4. 不立即開始追蹤，等動畫播放時再開始
    logger.info('✅ 文字跟隨創建成功（等待動畫開始）')
    
    return { textResult, boneTracker }
    
  } catch (error) {
    logger.error(`❌ 文字跟隨創建失敗: ${error}`)
    return { textResult: undefined, boneTracker: undefined }
  }
}

// 創建下車角色（使用 jump 動畫）
async function createCharacterJump(type: CharacterType, id: string, followText: string = ''): Promise<Character | null> {
  if (!app) return null
  
  try {
    logger.info(`🪂 創建下車角色: ${type} (${id})`)
    
    // 下車使用 jump 動畫
    const animationName = 'jump'
    
    const characterAssets = getSpineAssets(animationName)
    const spineResult = await createSpineAnimation({
      skelPath: characterAssets.skelPath,
      atlasPath: characterAssets.atlasPath,
      imagePath: characterAssets.imagePath
    })
    
    const spine = spineResult.spine
    // spine.zIndex = 2 // 角色在火箭之上

    // 從火箭的實際位置開始 (考慮縮放因子)
    const scale = baseScale.value
    const startX = rocketSpine ? rocketSpine.x : gameWidth.value / 2
    const startY = rocketSpine ? rocketSpine.y : gameHeight.value / 2 + baseOffsetY.value
    
    applySpineTransform(spine, {
      x: startX,
      y: startY,
      scaleX: scale,
      scaleY: scale
    })
    
    app.stage.addChild(spine)
    
    // 為角色創建文字跟隨（如果需要）
    const { textResult, boneTracker } = await createFollowText(spine, startX, startY, followText)
    
    const character: Character = {
      id,
      type,
      spine,
      position: { x: startX, y: startY },
      isVisible: true,
      textResult,
      boneTracker
    }
    
    characters.set(id, character)
    logger.info(`✅ 下車角色創建成功: ${type} (${id})`)
    
    return character
    
  } catch (error) {
    logger.error(`❌ 下車角色創建失敗 ${type}: ${error}`)
    return null
  }
}





// 角色動畫 - 下車（跳躍）- 原地跳躍
async function animateCharacterJump(character: Character): Promise<void> {
  if (!character.spine || !app) return
  
  try {
    logger.info(`🎯 開始 ${character.type} 下車動畫，起始位置: (${character.position.x}, ${character.position.y})`)
    
    const isNpc = character.type === 'npc'
    const randomAnimationNumber = ['', 2, 3][getRandomNum(0, 3)]
    const animationName = isNpc ? `jump_others${randomAnimationNumber}` : `jump_me${randomAnimationNumber}`

    // 播放跳躍動畫（原地跳躍）
    playSpineAnimation(character.spine, animationName, false)

    const scale = baseScale.value
    
    // 設置 Spine 的縮放，但保持位置不變
    applySpineTransform(character.spine, {
      x: character.spine.x,  // 保持原位置
      y: character.spine.y,  // 保持原位置
      scaleX: isNpc ? -scale : scale,
      scaleY: scale
    })
    
    // 啟動骨骼追蹤器並顯示文字
    if (character.boneTracker && character.textResult) {
      character.boneTracker.startTracking()
      
      // 等一個 frame 讓骨骼追蹤器計算位置，然後顯示文字
      requestAnimationFrame(() => {
        character.textResult!.textObject.visible = true
      })
    }
    
    const duration = 3000 // 3秒跳躍動畫
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 檢查動畫是否完成
      if (progress < 1) requestAnimationFrame(animate)
      else {
        // 動畫完成，清理資源
        if (character.boneTracker) {
          character.boneTracker.stopTracking()
          character.boneTracker.dispose()
        }
        
        if (character.textResult && app && app.stage.getChildIndex(character.textResult.textObject) !== -1) {
          app.stage.removeChild(character.textResult.textObject)
          character.textResult.destroy()
        }
        
        // 移除 Spine
        if (app && app.stage.getChildIndex(character.spine) !== -1) {
          app.stage.removeChild(character.spine)
        }
        
        characters.delete(character.id)
        const index = charactersOnBoard.value.indexOf(character.type)
        if (index > -1) charactersOnBoard.value.splice(index, 1)

        logger.info(`✅ ${character.type} 下車完成`)
      }
    }
    
    animate()
    
  } catch (error) {
    logger.error(`❌ 角色下車動畫失敗: ${error}`)
  }
}

// 場景初始化
async function initScene(): Promise<void> {
  if (!canvasRef.value) {
    logger.error('Canvas 元素未找到')
    return
  }

  try {
    logger.info('=== 開始初始化 Funky Rocket 遊戲場景 ===')

    // 1. 初始化音效系統
    initializeAudio()

    // 2. 創建 PixiJS 應用
    const pixiResult = await createPixiApp({
      canvas: canvasRef.value,
      width: gameWidth.value,
      height: gameHeight.value,
      backgroundColor: 0x000000
    })
    
    app = pixiResult.app
    app.stage.sortableChildren = true

    // 3. 設置初始背景
    await setDefaultBackground()
    
    // 4. 設置前景雲朵（高度限制在螢幕一半）
    await setFrontCloud()

    // 5. 創建火箭 Spine 動畫
    logger.info('開始創建火箭 Spine 動畫...')
    const rocketAssets = getSpineAssets('rocket')
    const spineResult = await createSpineAnimation({
      skelPath: rocketAssets.skelPath,
      atlasPath: rocketAssets.atlasPath,
      imagePath: rocketAssets.imagePath
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
    if (spineResult.animations.includes('launch')) playSpineAnimation(rocketSpine, 'launch', true)

    // 5. 初始化倒數計時器
    countdownTimer = new CountdownTimer()
    
    setState(GameState.IDLE)
    logger.info('✅ Funky Rocket 遊戲場景初始化完成')
    
  } catch (error) {
    logger.error(`❌ 場景初始化失敗: ${error}`)
  }
}

// ===== 遊戲流程控制函數 =====

// 開始遊戲
function startGame(): void {
  if (currentState.value !== GameState.IDLE) return
  
  logger.info('🎮 開始 Funky Rocket 遊戲')
  setState(GameState.BOARDING)

  // 播放開場BGM（如果開關啟用）
  if (bgmEnabled.value) playBGM('bgm_open', true)
}

// 玩家上車
async function playerBoard(): Promise<void> {
  const character = await createCharacterWalk('player', `player-${Date.now()}`)
  if (!character) return

  addCharacterToBoard('player')
  playSound('button_bet') // 玩家上車音效(投注)
  await animateCharacterWalk(character, 'left')
  playSound('into') // 角色進艙門音效
}

// 主播上車
async function streamerBoard(): Promise<void> {
  
  const character = await createCharacterWalk('streamer', `streamer-${Date.now()}`)
  if (!character) return

  addCharacterToBoard('streamer')
  
  // 等待主播上車動畫完全完成
  await animateCharacterWalk(character, 'left')
  playSound('into') // 角色進艙門音效
  
  // 等待主播上車動畫完全結束後，才播放 launch_player
  // 主播有上車過就不需要再播放了
  if (hasPlayedLaunchPlayer.value) return

  const trackEntry = playSpineAnimationWithTrack(rocketSpine, 'launch_player', false, 1)
  if (trackEntry) {
    // 嘗試設定 mixBlend 為 normal，保持原始效果
    if ((trackEntry as any).mixBlend !== undefined) {
      (trackEntry as any).mixBlend = 'add'
    }
    
    trackEntry.alpha = 1  // 完全不透明
    trackEntry.mixDuration = 0
  }
  setLaunchPlayerPlayed(true)
}

// NPC上車
async function npcBoard(): Promise<void> {
  
  const character = await createCharacterWalk('npc', `npc-${Date.now()}`)
  if (!character) return

  addCharacterToBoard('npc')
  await animateCharacterWalk(character, 'right')
  playSound('into') // 角色進艙門音效
}

// 開始倒數計時
function startCountdown(): void {
  if (currentState.value === GameState.COUNTDOWN || !countdownTimer) return
  
  logger.info('⏰ 開始倒數計時')
  setState(GameState.COUNTDOWN)
  
  let lastSecond = -1 // 追蹤上一秒的值
  
  // 倒數5秒
  playSound('countdown_5_sec')

  countdownTimer.start(5, (remaining) => {
    const currentSecond = Math.ceil(remaining)
    setCountdown(remaining)
    
    // 只在秒數變化時播放音效
    if (currentSecond !== lastSecond && currentSecond > 0) {
      logger.info(`🔊 倒數: ${currentSecond}`)
      lastSecond = currentSecond
    }
  }, async () => {
    setCountdown(0)
    await launchRocket()
  })
}

// 火箭發射序列
async function launchRocket(): Promise<void> {
  logger.info('🚀 火箭發射序列開始')

  // 先停止開場BGM，但保留其他BGM
  stopBGM('bgm_open')
  
  // 等待所有上車動畫完成 - 檢查是否還有角色在移動中
  while (characters.size > 0) {
    logger.info(`⏳ 等待上車動畫完成，剩餘角色: ${characters.size}`)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  try {
    // 1. 發射準備階段 - 播放 rocket_shake 動畫
    setState(GameState.LAUNCHING)
    
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'rocket_shake', false)
    }
    
    playSound('rocket_prelaunch')
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 2. 發射啟動階段 - 播放 flying 動畫並開始背景滾動
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'flying', false)
    }

    // 初始化循環背景並開始滾動 (flying 動畫開始時才滾動)
    await initCycleBackground()
    startBackgroundScroll()
    
    // 等待1.5秒
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 3. 飛行階段 - 播放 flying_loop 動畫
    setState(GameState.FLYING)
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'flying_loop', true)
    }

    // 播放飛行BGM（如果開關啟用）
    if (bgmEnabled.value) {
      playBGM('bgm_fly', true)
    }

    // 播放火箭飛行音效（如果BGM開關啟用）
    if (bgmEnabled.value) {
      playBGM('rocket_fly', true)
    }
    
    // 進入下車階段
    setState(GameState.DISEMBARKING)
    logger.info('✅ 火箭發射完成，進入下車階段')

      // 開始火箭漂浮效果（延遲一小段時間確保位置穩定）
      setTimeout(() => {
        startRocketFloat()
      }, 100)
    
  } catch (error) {
    logger.error(`❌ 火箭發射失敗: ${error}`)
  }
}

// 玩家下車
async function playerDisembark(): Promise<void> {
  logger.info('🎯 玩家下車按鈕被點擊')
  const character = await createCharacterJump('player', `player-disembark-${Date.now()}`, '玩家下車囉')
  if (!character) return

  removeCharacterFromBoard('player')
  logger.info('🎯 玩家角色創建成功，開始動畫')
  await animateCharacterJump(character)
  playSound('user_jump') // 玩家下車音效
}

// 主播下車
async function streamerDisembark(): Promise<void> {
  if (hasPlayedLaunchPlayer.value) {
    setLaunchPlayerPlayed(false)
    const trackEntry = playSpineAnimationWithTrack(rocketSpine, 'launch_player', false, 1)
    if (trackEntry) {
      // 反轉動畫
      trackEntry.reverse = true
      // 嘗試設定 mixBlend 為 normal，保持原始效果
      if ((trackEntry as any).mixBlend !== undefined) {
        (trackEntry as any).mixBlend = 'add'
      }
      
      trackEntry.alpha = 1
      trackEntry.mixDuration = 0
    }
    // 等launch_player動畫反轉播完
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  const character = await createCharacterJump('streamer', `streamer-disembark-${Date.now()}`, '主播下車囉')
  if (!character) return

  removeCharacterFromBoard('streamer')
  await animateCharacterJump(character)
  playSound('other_jump') // 其他人下車音效
}

// NPC下車
async function npcDisembark(): Promise<void> {
  const character = await createCharacterJump('npc', `npc-disembark-${Date.now()}`)
  if (!character) return

  removeCharacterFromBoard('npc')
  await animateCharacterJump(character)
  playSound('other_jump') // 其他人下車音效
}

// 火箭爆炸
async function explodeRocket(): Promise<void> {
  if (isAnimating.value) return
  
  logger.info('💥 火箭爆炸')
  setState(GameState.EXPLODING)
  setAnimating(true)
  
  try {    
    // 停止火箭飛行音效、背景滾動和漂浮效果
    stopAllAudio()
    stopBackgroundScroll()
    stopRocketFloat()
    
    // 播放爆炸動畫和音效
    if (rocketSpine) {
      clearSpineStateWithTrack(rocketSpine, 1)
      playSpineAnimation(rocketSpine, 'explosion', false)
    }
    playSound('rocket_explode')
    
    // 等待爆炸動畫完成（假設3秒）
    // await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 遊戲結束
    setState(GameState.COMPLETED)
    setAnimating(false)
    logger.info('✅ 遊戲流程完成')
    
  } catch (error) {
    logger.error(`❌ 爆炸序列失敗: ${error}`)
    setAnimating(false)
  }
}

// 重置遊戲
async function resetGame(): Promise<void> {
  logger.info('🔄 重置 Funky Rocket 遊戲')

  // 重新開始音效
  playSound('return')
  
  // 停止所有動畫、計時器和音效
  if (countdownTimer) {
    countdownTimer.stop()
  }
  stopAllAudio() // 停止所有背景音樂
  stopRocketFloat() // 停止火箭漂浮效果
  // 清理所有角色
  for (const character of characters.values()) {
    if (app && app.stage.getChildIndex(character.spine) !== -1) {
      app.stage.removeChild(character.spine)
    }
  }
  characters.clear()
  
  // 重置所有遊戲狀態
  resetGameState()
  
  // 重置背景系統
  stopBackgroundScroll()
  
  // 重置背景並獲取舊背景引用
  const { oldCycleSprites, oldDefaultBackground, oldFrontCloud } = await resetBackground()
  
  // 添加從下往上的浮現動畫，並在完成後清理舊背景
  animateBackgroundFloatUp(oldCycleSprites, oldDefaultBackground, oldFrontCloud)
  
  // 重置火箭動畫和大小 (考慮縮放因子)
  if (rocketSpine) {
    clearSpineState(rocketSpine)
    
    // 恢復火箭到原始大小和位置
    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value,
      scaleY: baseScale.value
    })
    
    // 先播放震動動畫
    playSpineAnimation(rocketSpine, 'restart', false)
    logger.info('🚀 火箭開始震動')
    
    // 0.6 秒後切換到 launch 動畫
    setTimeout(() => {
      if (rocketSpine) {
        clearSpineState(rocketSpine)
        playSpineAnimation(rocketSpine, 'launch', true)
        logger.info('🚀 火箭切換到 launch 動畫')
      }
    }, 600)
  }
  
  logger.info('✅ 遊戲重置完成')
}

// 清理函數
function cleanup(): void {
  logger.info('🧹 清理 Funky Rocket 遊戲場景')
  
  if (countdownTimer) {
    countdownTimer.stop()
    countdownTimer = null
  }
  
  // 清理所有角色
  for (const character of characters.values()) {
    if (character.boneTracker) {
      character.boneTracker.stopTracking()
      character.boneTracker.dispose()
    }
    
    if (character.textResult && app && app.stage.getChildIndex(character.textResult.textObject) !== -1) {
      app.stage.removeChild(character.textResult.textObject)
      character.textResult.destroy()
    }
    
    if (app && app.stage.getChildIndex(character.spine) !== -1) {
      app.stage.removeChild(character.spine)
    }
  }
  characters.clear()
  
  // 清理背景和特效
  destroyBackground()
  stopRocketFloat()
  
  // 清理音效
  destroyAudio()
  
  if (app) {
    destroyPixiApp(app)
    app = null
    rocketSpine = null
  }
}

// 響應式更新遊戲尺寸 - 保持 540:958 比例，確保完全顯示在螢幕內
function updateGameSize(): void {
  const aspectRatio = 540 / 958 // 原始比例
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 計算按高度和寬度縮放的尺寸
  const heightBasedWidth = Math.round(viewportHeight * aspectRatio)
  const widthBasedHeight = Math.round(viewportWidth / aspectRatio)
  
  // 選擇能完全顯示在螢幕內的尺寸
  if (heightBasedWidth <= viewportWidth) {
    // 以高度為準
    gameHeight.value = viewportHeight
    gameWidth.value = heightBasedWidth
  } else {
    // 以寬度為準
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
function updateGameContentScale(): void {
  logger.info(`🔄 更新遊戲內容縮放，縮放因子: ${scaleFactorX.value.toFixed(2)}x${scaleFactorY.value.toFixed(2)}`)
  
  // 1. 更新火箭位置和大小
  if (rocketSpine) {
    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value,
      scaleY: baseScale.value
    })
  }
  
  // 2. 更新背景
  updateBackgroundScale()
  
  // 3. 更新前景雲朵
  updateFrontCloudScale()
  
  // 4. 更新現有角色
  updateCharactersScale()
  
  // 5. 重置滾動速度
  if (isScrolling.value) {
    scrollSpeed.value = baseScrollSpeed.value
  }
  
  // 6. 更新火箭漂浮效果
  if (rocketFloatEffect?.isActive) {
    stopRocketFloat()
    startRocketFloat()
  }
}

// 背景縮放更新函數已移至 useBackground hook

// 更新現有角色縮放
function updateCharactersScale(): void {
  for (const character of characters.values()) {
    if (character.spine) {
      const isNpc = character.type === 'npc'
      applySpineTransform(character.spine, {
        x: character.spine.x, // 保持當前位置
        y: character.spine.y, // 保持當前位置  
        scaleX: isNpc ? -baseScale.value : baseScale.value,
        scaleY: baseScale.value
      })
    }
  }
}



// 注意：此頁面固定使用 funkyRocket 素材包，不需要監聽素材包變化

// 生命週期
onMounted(async () => {
  logger.info('🎸 Funky Rocket 遊戲頁面已掛載')
  updateGameSize()
  await initScene()
  
  window.addEventListener('resize', updateGameSize)
})

onUnmounted(() => {
  logger.info('🎸 Funky Rocket 遊戲頁面即將卸載')
  window.removeEventListener('resize', updateGameSize)
  cleanup()
})
</script>