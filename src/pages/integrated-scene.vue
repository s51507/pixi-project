<template>
  <div class="min-h-screen text-white relative overflow-hidden" :style="{ backgroundImage: backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <!-- PixiJS Canvas 游戲本體尺寸 540x950 居中 -->
    <canvas 
      ref="canvasRef" 
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      :style="{ width: gameWidth + 'px', height: gameHeight + 'px' }"
    ></canvas>
    
    <!-- UI 層覆蓋在 Canvas 上方 -->
    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- 頂部控制區 -->
      <div class="p-3 space-y-3 md:p-6">
        <!-- 頂部信息條 -->
        <div class="bg-black/80 backdrop-blur-sm rounded-lg p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h1 class="text-lg font-bold text-yellow-400">🚀 火箭發射</h1>
                          <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">狀態:</span>
              <span :class="getStateColor(currentState)" class="text-xs font-medium">
                {{ getStateText(currentState) }}
              </span>
              <!-- 背景狀態調試資訊 -->
              <span v-if="backgroundManager" class="text-xs text-blue-400 ml-2">
                {{ backgroundManager.getStatus() }}
              </span>
            </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="resetScene"
                class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                🔄
              </button>
              <RouterLink 
                to="/"
                class="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              >
                ←
              </RouterLink>
            </div>
          </div>
          
          <div v-if="countdown > 0" class="text-center mt-2">
            <span class="text-2xl font-bold text-yellow-400">{{ Math.ceil(countdown) }}</span>
          </div>
        </div>

        <!-- 素材包切換 -->
        <AssetPackSwitch />

        <!-- 音量控制 -->
        <div class="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-3">
          <span class="text-xs text-gray-400">🔊</span>
          <input 
            type="range" 
            v-model="volume" 
            @input="updateVolume"
            min="0" 
            max="100" 
            class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          >
          <span class="text-xs text-gray-400 w-8">{{ volume }}%</span>
        </div>

        <!-- 飛行速度控制 -->
        <div class="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-3">
          <span class="text-xs text-gray-400">🚀</span>
          <input 
            type="range" 
            v-model="flyingSpeed" 
            @input="updateFlyingSpeed"
            min="1" 
            max="10" 
            step="0.5"
            class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          >
          <span class="text-xs text-gray-400 w-8">{{ flyingSpeed }}x</span>
        </div>
      </div>

      <!-- 主場景區域（透明，讓 Canvas 顯示） -->
      <div class="flex-1 relative">
        <!-- 這裡保持空白，讓背景的 Canvas 顯示 -->
      </div>

      <!-- 底部控制區 -->
      <div class="p-3 bg-transparent">
        <div class="max-w-lg mx-auto space-y-4">
          
          <!-- 待機狀態：進入準備狀態 -->
          <div v-if="currentState === 'idle'" class="text-center">
            <button 
              @click="enterReadyState"
              class="px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 rounded-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              🛸 進入發射準備
            </button>
          </div>

          <!-- 準備狀態：可以上車和手動開始倒數 -->
          <div v-if="currentState === 'ready'" class="text-center space-y-3">
            <div class="text-lg font-semibold text-green-400 mb-2">🟢 發射準備就緒</div>
            <button 
              @click="startCountdownManually"
              class="px-6 py-3 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 rounded-lg transition-all transform hover:scale-105 shadow-2xl animate-pulse"
            >
              🚀 開始 5 秒倒數
            </button>
          </div>

          <!-- 飛行狀態：爆炸按鈕 -->
          <div v-if="currentState === 'flying'" class="text-center mb-4">
            <button 
              @click="explodeRocket"
              class="px-6 py-3 text-lg font-bold bg-gradient-to-r from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 rounded-lg transition-all transform hover:scale-105 shadow-2xl animate-pulse"
            >
              💥 爆炸
            </button>
          </div>

          <!-- 爆炸狀態：重新開始 -->
          <div v-if="currentState === 'exploded'" class="text-center">
            <div class="text-3xl mb-2 animate-bounce">💥</div>
            <div class="text-lg font-bold text-red-400 mb-3">火箭爆炸了！</div>
            <button 
              @click="startNextRound"
              class="px-6 py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              🚀 重新開始
            </button>
          </div>

          <!-- 角色控制區 -->
          <div v-if="['ready', 'countdown', 'flying'].includes(currentState)">
            <h3 class="text-base font-semibold mb-3 text-center">
              {{ 
                currentState === 'ready' ? '👥 角色準備上車' :
                currentState === 'countdown' ? '👥 角色上車' : 
                '🦘 角色跳船' 
              }}
            </h3>
            
            <div class="grid grid-cols-2 gap-3">
              <!-- 玩家角色 -->
              <button 
                @click="handleCharacterAction('player', 'player')"
                :disabled="isCharacterDisabled('player')"
                :class="[
                  'p-3 rounded-lg text-center transition-all',
                  isCharacterDisabled('player') 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                ]"
              >
                <div class="text-xl mb-1">🧑</div>
                <div class="text-xs font-medium">玩家角色</div>
                <div class="text-xs text-gray-300">
                  {{ currentState === 'ready' || currentState === 'countdown' ? '上車' : '跳船' }}
                </div>
              </button>

              <!-- 高級角色 -->
              <button 
                @click="handleCharacterAction('premium', 'premium')"
                :disabled="isCharacterDisabled('premium')"
                :class="[
                  'p-3 rounded-lg text-center transition-all',
                  isCharacterDisabled('premium') 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                ]"
              >
                <div class="text-xl mb-1">⭐</div>
                <div class="text-xs font-medium">高級角色</div>
                <div class="text-xs text-gray-300">
                  {{ currentState === 'ready' || currentState === 'countdown' ? '上車' : '跳船' }}
                </div>
              </button>

              <!-- NPC 角色 -->
              <button 
                @click="handleCharacterAction('npc', 'npc')"
                :disabled="isCharacterDisabled('npc')"
                :class="[
                  'p-3 rounded-lg text-center transition-all',
                  isCharacterDisabled('npc') 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'
                ]"
              >
                <div class="text-xl mb-1">👥</div>
                <div class="text-xs font-medium">NPC 角色</div>
                <div class="text-xs text-gray-300">
                  {{ currentState === 'ready' || currentState === 'countdown' ? '上車' : '跳船' }}
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 調試日誌面板 -->
    <div 
      v-if="showDebug"
      class="fixed bottom-16 left-2 right-2 md:bottom-4 md:right-4 md:left-auto md:w-80 bg-black/95 backdrop-blur-sm rounded-lg p-3 max-h-48 overflow-y-auto text-xs z-50"
    >
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-gray-300">調試日誌</h4>
        <button 
          @click="logger.clear()" 
          class="text-gray-500 hover:text-white transition-colors"
        >
          清空
        </button>
      </div>
      <div class="space-y-1">
        <div 
          v-for="(entry, index) in logger.getLogs().value" 
          :key="index"
          :class="[
            'text-xs break-words',
            entry.level === 'error' ? 'text-red-400' : 
            entry.level === 'warn' ? 'text-yellow-400' : 'text-green-400'
          ]"
        >
          [{{ entry.timestamp }}] {{ entry.message }}
        </div>
      </div>
    </div>

    <!-- 調試切換按鈕 -->
    <button 
      @click="showDebug = !showDebug"
      class="fixed bottom-2 left-2 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors z-50"
    >
      {{ showDebug ? '隱藏' : '調試' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import AssetPackSwitch from '@/components/AssetPackSwitch.vue'
import { useAssetPackStore } from '@/stores/assetPack'
import type { Application } from 'pixi.js'
import type { Spine } from '@esotericsoftware/spine-pixi-v8'
import { 
  createPixiApp, 
  destroyPixiApp,
  createSpineAnimation,
  playSpineAnimation,
  applySpineTransform,
  createLogger,
  BackgroundManager
} from '@/utils/pixi'
import { 
  SceneState, 
  CharacterType, 
  AudioManager, 
  CountdownTimer,
  CharacterAnimationManager,
  SceneStateManager,
  type AudioAssets
} from '@/utils/pixi/scene'

// 響應式狀態
const canvasRef = ref<HTMLCanvasElement>()
const currentState = ref<SceneState>(SceneState.IDLE)
const countdown = ref(0)
const volume = ref(70)
const showDebug = ref(false)
const flyingSpeed = ref(5) // 飛行背景速度（預設 5x）

// Store
const assetPackStore = useAssetPackStore()

// 游戲本體尺寸（540x950比例）
const gameWidth = ref(540)
const gameHeight = ref(950)

// 響應式背景圖片
const backgroundImage = computed(() => {
  return `url(${assetPackStore.getImagePath('bg/full_bg-B3-suPnV.avif')})`
})

// 響應式調整游戲尺寸
const updateGameSize = () => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const gameRatio = 540 / 950
  
  // 高度填滿視窗，寬度根據比例計算
  gameHeight.value = viewportHeight
  gameWidth.value = viewportHeight * gameRatio
  
  // 如果計算出的寬度超過視窗寬度，則以寬度為準
  if (gameWidth.value > viewportWidth) {
    gameWidth.value = viewportWidth
    gameHeight.value = viewportWidth / gameRatio
  }
}

// 場景實例
let app: Application | null = null
let rocketSpine: Spine | null = null
let backgroundManager: BackgroundManager | null = null

// 管理器實例
const logger = createLogger(50)
const sceneStateManager = new SceneStateManager(logger.createLogFunction())
const countdownTimer = new CountdownTimer(logger.createLogFunction())
const characterManager = new CharacterAnimationManager(logger.createLogFunction())

// 響應式音頻資源配置
const audioAssets = computed<AudioAssets>(() => ({
  bgm_open: assetPackStore.getAudioPath('bgm_open-DYI02Dgc.mp3'),
  bgm_fly: assetPackStore.getAudioPath('bgm_fly-DX4muDxO.mp3'),
  rocket_prelaunch_beginning: assetPackStore.getAudioPath('rocket_prelaunch_beginning-CBWMXJzv.mp3'),
  rocket_prelaunch_launching: assetPackStore.getAudioPath('rocket_prelaunch_launching-CbFaD9b4.mp3'),
  countdown: assetPackStore.getAudioPath('countdown-S5DFRcF0.mp3'),
  user_hop_on: assetPackStore.getAudioPath('user_hop_on-D1L_1wBN.mp3'),
  user_hop_off: assetPackStore.getAudioPath('user_hop_off-jltqlRTg.mp3'),
  others_hop_on: assetPackStore.getAudioPath('others_hop_on-BZB6aVMn.mp3'),
  others_hop_off: assetPackStore.getAudioPath('others_hop_off-B0ltzgMH.mp3'),
  rocket_explode: assetPackStore.getAudioPath('rocket_explode-DyCSKWjQ.mp3'),
  click: assetPackStore.getAudioPath('click-yOjLuJq2.mp3')
}))

// 初始化函數
function createAudioManager() {
  return new AudioManager(audioAssets.value, logger.createLogFunction())
}

let audioManager = createAudioManager()

// 角色狀態追蹤
const characterStates = reactive({
  player: { active: false, onRocket: false },
  premium: { active: false, onRocket: false },
  npc: { active: false, onRocket: false }
})

// 場景配置已內聯到使用位置

// 初始化場景
async function initScene(): Promise<void> {
  if (!canvasRef.value) {
    logger.error('Canvas 元素未找到')
    return
  }

  try {
    logger.info('=== 開始初始化整合場景 ===')

    // 1. 創建 PixiJS 應用 - 使用固定游戲尺寸 540x950
    updateGameSize()
    
    const result = await createPixiApp({
      canvas: canvasRef.value,
      width: gameWidth.value,
      height: gameHeight.value,
      backgroundColor: 0x000000,
      backgroundAlpha: 0, // 設置背景為透明，讓外部背景圖顯示
      antialias: true,
      logger: logger.createLogFunction()
    })
    
    app = result.app

    // 2. 初始化背景管理器
    backgroundManager = new BackgroundManager({
      app,
      logger: logger.createLogFunction()
    })
    await backgroundManager.initialize()
    
    // 確保初始背景顯示
    logger.info('🔄 強制設置初始地面背景')
    await backgroundManager.setGroundBackground()

    // 3. 創建火箭動畫
    const rocketAssets = assetPackStore.getSpineAssets('rocket_v6')
    const rocketResult = await createSpineAnimation({
      skelPath: rocketAssets.skelPath,
      atlasPath: rocketAssets.atlasPath,
      imagePath: rocketAssets.imagePath,
      logger: logger.createLogFunction()
    })
    
    rocketSpine = rocketResult.spine
    app.stage.addChild(rocketSpine)
    
    // 確保火箭在背景之上
    rocketSpine.zIndex = 100
    
    // 設置火箭位置和大小 - 基於 540x950 設計
    const rocketScale = 0.5 // 調小火箭尺寸
    
    // 設置火箭的錨點到底部中心
    if ((rocketSpine as any).anchor) {
      (rocketSpine as any).anchor.set(0.5, 1.0) // 錨點在底部中心
    }
    
    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value * 0.45, // 火箭底部往上調整到中間水平線
      scaleX: rocketScale,
      scaleY: rocketScale
    }, logger.createLogFunction())
    logger.info(`🚀 火箭設置 - 游戲尺寸: ${gameWidth.value}x${gameHeight.value}, 縮放: ${rocketScale.toFixed(2)}, 位置: (${gameWidth.value / 2}, ${gameHeight.value * 0.45}), 錨點: 底部中心`)

    // 記錄可用動畫
    const availableAnimations = rocketResult.animations
    logger.info(`火箭可用動畫: ${availableAnimations.join(', ')}`)

    // 初始狀態播放 launch 動畫並暫停在第一幀
    playSpineAnimation(rocketSpine, 'launch', false, logger.createLogFunction())
    if (rocketSpine.state) {
      rocketSpine.state.timeScale = 0 // 暫停動畫
    }
    logger.info('初始化：火箭播放 launch 動畫並暫停在第一幀')

    // 4. 設置音量
    audioManager.setVolume(volume.value / 100)

    // 5. 監聽狀態變化
    sceneStateManager.onStateChanged((state) => {
      currentState.value = state
      handleStateChange(state)
    })

    logger.info('✅ 整合場景初始化完成')

  } catch (error) {
    logger.error(`場景初始化失敗: ${error}`)
  }
}

// 處理狀態變化
function handleStateChange(state: SceneState): void {
  switch (state) {
    case SceneState.READY:
      // 準備狀態：維持地面背景，火箭準備發射
      audioManager.playBGM('bgm_open', true)
      
      if (backgroundManager) {
        backgroundManager.setGroundBackground().then(() => {
          logger.info('準備狀態：地面背景已設置')
        }).catch(error => {
          logger.error(`設置地面背景失敗: ${error}`)
        })
      }
      
      // 準備狀態播放 launch 動畫並暫停在第一幀
      if (rocketSpine) {
        playSpineAnimation(rocketSpine, 'launch', false, logger.createLogFunction())
        if (rocketSpine.state) {
          rocketSpine.state.timeScale = 0 // 暫停動畫
        }
        logger.info('準備狀態：播放 launch 動畫並暫停在第一幀')
      }
      break

    case SceneState.COUNTDOWN:
      audioManager.playBGM('bgm_open', true)
      
      // 確保倒數階段顯示地面背景
      if (backgroundManager) {
        backgroundManager.setGroundBackground().then(() => {
          logger.info('倒數階段：地面背景已設置')
        }).catch(error => {
          logger.error(`設置地面背景失敗: ${error}`)
        })
      }
      
      // 倒數階段播放 launch 動畫並暫停在第一幀
      if (rocketSpine) {
        playSpineAnimation(rocketSpine, 'launch', false, logger.createLogFunction())
        if (rocketSpine.state) {
          rocketSpine.state.timeScale = 0 // 暫停動畫
        }
        logger.info('倒數階段：播放 launch 動畫並暫停在第一幀')
      }
      startCountdown()
      break
    
    case SceneState.FLYING:
      // 切換到飛行背景音樂
      audioManager.playBGM('bgm_fly', true)
      
      // 注意：背景滾動動畫應該等火箭真正起飛後才開始
      // 背景滾動由火箭動畫序列控制，不在狀態切換時立即觸發
      // 火箭動畫由 startCountdown 中的倒數結束邏輯處理
      break
    
    case SceneState.EXPLODED:
      audioManager.stopBGM()
      
      // 注意：爆炸音效、動畫和背景停止邏輯由 explodeRocket 函數處理
      // 這裡不再重複處理，避免衝突
      break
    
    case SceneState.IDLE:
      // 待機狀態確保顯示地面背景
      if (backgroundManager) {
        backgroundManager.setGroundBackground().then(() => {
          logger.info('待機狀態：地面背景已設置')
        }).catch(error => {
          logger.error(`設置地面背景失敗: ${error}`)
        })
      }
      break
      
    // 移除不需要的 PRELAUNCH 和 LAUNCHING 狀態
  }
}

// 進入準備狀態
function enterReadyState(): void {
  logger.info('🛸 進入發射準備狀態')
  sceneStateManager.setState(SceneState.READY)
}

// 手動開始倒數
function startCountdownManually(): void {
  logger.info('🚀 手動開始 5 秒倒數')
  sceneStateManager.setState(SceneState.COUNTDOWN)
}

    // 開始倒數
function startCountdown(): void {
  let lastPlayedSecond = -1 // 記錄上次播放音效的秒數，避免重複播放
  
  countdownTimer.start(
    5, // 倒數時間
    (remaining) => {
      countdown.value = remaining
      
      // 最後5秒播放倒數音效（每秒只播放一次）
      const currentSecond = Math.ceil(remaining)
      if (remaining <= 5 && remaining > 0 && currentSecond !== lastPlayedSecond) {
        audioManager.playSound('countdown')
        lastPlayedSecond = currentSecond
        logger.info(`🔊 倒數音效: ${currentSecond} 秒`)
      }
      
      // 倒數階段保持 launch 動畫暫停在第一幀
    },
    () => {
      countdown.value = 0
      logger.info('倒數結束：等待玩家和NPC上車後開始發射序列')
      
      // 倒數為 0 時，先等玩家和NPC上車，然後開始播放launch動畫
      // 這裡檢查是否有角色已上車（簡化處理，實際可能需要更複雜的邏輯）
      waitForPlayersAndStartLaunch()
      
      sceneStateManager.setState(SceneState.FLYING)
    }
  )
}

// 等待玩家和NPC上車後開始發射
function waitForPlayersAndStartLaunch(): void {
  // 簡化邏輯：延遲0.5秒等待角色上車動作完成，然後開始播放launch
  setTimeout(() => {
    logger.info('🚀 開始播放launch動畫（解除暫停）')
    
    if (rocketSpine) {
      // 解除launch動畫的暫停，讓其正常播放
      if (rocketSpine.state) {
        rocketSpine.state.timeScale = 1 // 恢復正常播放速度
      }
      
      // 監聽launch動畫播放完成事件
      const checkLaunchComplete = () => {
        if (rocketSpine && rocketSpine.state) {
          const currentTrack = rocketSpine.state.tracks[0]
          if (currentTrack && currentTrack.animation && currentTrack.animation.name === 'launch') {
            // 檢查動畫是否播放完成
            if (currentTrack.isComplete()) {
              logger.info('🚀 launch動畫播放完成，緊接播放rocket_shake')
              
              // 立即播放rocket_shake
              playSpineAnimation(rocketSpine, 'rocket_shake', false, logger.createLogFunction())
              
              // rocket_shake 播放完後自動播放 flying，同時開始背景滾動
              setTimeout(() => {
                if (rocketSpine && currentState.value === SceneState.FLYING) {
                  playSpineAnimation(rocketSpine, 'flying', false, logger.createLogFunction())
                  logger.info('🚀 播放 flying 動畫')
                  
                  // 此時火箭開始真正起飛，啟動背景滾動動畫
                  if (backgroundManager) {
                    backgroundManager.startTakeoffAnimation(flyingSpeed.value)
                    logger.info('🌄 火箭起飛，開始背景滾動動畫')
                  }
                  
                  // flying 播放 1.5 秒後切換到 flying_loop 循環
                  setTimeout(() => {
                    if (rocketSpine && currentState.value === SceneState.FLYING) {
                      playSpineAnimation(rocketSpine, 'flying_loop', true, logger.createLogFunction())
                      logger.info('🚀 1.5 秒後切換到 flying_loop 循環播放')
                    }
                  }, 1500)
                }
              }, 800) // rocket_shake 動畫時間，設為 0.8 秒
              
              return
            }
          }
        }
        
        // 如果還沒完成，繼續檢查
        requestAnimationFrame(checkLaunchComplete)
      }
      
      // 開始檢查launch動畫完成狀態
      requestAnimationFrame(checkLaunchComplete)
    }
  }, 500) // 等待0.5秒讓角色上車動作完成
}

// 處理角色行動
function handleCharacterAction(characterId: string, characterType: string): void {
  audioManager.playSound('click')
  
  const character = characterStates[characterId as keyof typeof characterStates]
  if (!character) return

  if (currentState.value === SceneState.READY || currentState.value === SceneState.COUNTDOWN) {
    // 準備狀態或倒數階段：角色上車（可重複上車）
    character.active = true
    character.onRocket = true
    
    // 為每個角色實例生成唯一ID
    const uniqueId = `${characterId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    logger.info(`🎯 點擊上車: ${characterId} -> ${uniqueId}`)
    
    // 創建角色並移動到火箭
    createAndMoveCharacter(uniqueId, characterType as CharacterType, true)
  } else if (currentState.value === SceneState.FLYING) {
    // 飛行階段：角色跳船（可重複跳船）
    if (character.active) {
      // 為每個角色實例生成唯一ID
      const uniqueId = `${characterId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 創建角色並讓其跳船
      createAndMoveCharacter(uniqueId, characterType as CharacterType, false)
    }
  }
}

// 創建並移動角色
async function createAndMoveCharacter(characterId: string, type: CharacterType, toRocket: boolean): Promise<void> {
  if (!app) return

  try {
    // 根據角色類型和行動選擇動畫
    let animationPath = ''
    switch (type) {
      case CharacterType.PLAYER:
        animationPath = toRocket ? 'me-default1-walk_v4' : 'me-default1-jump_v3'
        break
      case CharacterType.PREMIUM:
        animationPath = toRocket ? 'me-default2-walk_v4' : 'me-unlocked1-jump_v1'
        break
      case CharacterType.NPC:
        animationPath = toRocket ? 'others-default1-walk_v4' : 'me-default1-jump_v3'
        break
    }

    // 創建角色動畫
    const characterAssets = assetPackStore.getSpineAssets(animationPath)
    const characterResult = await createSpineAnimation({
      skelPath: characterAssets.skelPath,
      atlasPath: characterAssets.atlasPath,
      imagePath: characterAssets.imagePath,
      logger: logger.createLogFunction()
    })
    
    const characterSpine = characterResult.spine
    
    // 完全停止所有 Spine 動畫更新，防止位置衝突
    if (characterSpine.state) {
      characterSpine.state.clearTracks() // 清除動畫軌道
      characterSpine.state.timeScale = 0 // 暫停動畫時間更新
    }
    
    app.stage.addChild(characterSpine)
    
    // 設置角色的層級：在火箭之上（角色站在火箭上）
    characterSpine.zIndex = 150
    
    // 根據游戲尺寸設置初始位置和縮放
    const canvasWidth = gameWidth.value
    const canvasHeight = gameHeight.value
    
    // 計算適合 540x950 的縮放比例
    const characterScale = 0.3 // 調小角色尺寸，與火箭協調
    
    let initialX: number
    let initialY: number
    
    if (toRocket) {
      // 上車：從螢幕邊緣開始，距離應該對稱
      const edgeOffset = canvasWidth * 0.15 // 邊緣偏移為螢幕寬度的 15%
      initialX = type === CharacterType.NPC ? canvasWidth - edgeOffset : -edgeOffset
      initialY = canvasHeight * 0.75 // 調整Y位置，因為錨點改為中心了
    } else {
      // 跳船：從火箭位置開始
      initialX = canvasWidth / 2 // 火箭的 x 位置
      initialY = canvasHeight * 0.5 // 從火箭位置開始跳離
    }
    
    // 設置角色的錨點為中心，與火箭對齊
    // Spine 對象沒有 anchor 屬性，需要設置 pivot
    try {
      if ('pivot' in characterSpine) {
        characterSpine.pivot.set(characterSpine.width / 2, characterSpine.height / 2)
        logger.info(`🔧 角色 pivot 設置成功`)
      } else {
        logger.info(`ℹ️ 角色無需設置錨點，使用默認設置`)
      }
    } catch (error) {
      logger.warn(`⚠️ 角色錨點設置失敗: ${error}`)
    }
    
    applySpineTransform(characterSpine, {
      x: initialX,
      y: initialY,
      scaleX: characterScale,
      scaleY: characterScale
    }, logger.createLogFunction())
    
    // 立即驗證位置設置是否成功
    logger.info(`🔧 位置設置後立即驗證: (${characterSpine.x}, ${characterSpine.y}), 預期: (${initialX}, ${initialY})`)
    
    // 延遲驗證角色是否開始移動
    setTimeout(() => {
      logger.info(`✅ 100ms後位置驗證: (${characterSpine.x}, ${characterSpine.y}), 預期: (${initialX}, ${initialY})`)
      logger.info(`🎭 角色移動狀態: ${(characterSpine as any)._isMoving ? '移動中' : '靜止'}`)
      logger.info(`🎭 動畫狀態: timeScale=${characterSpine.state?.timeScale || 'unknown'}`)
    }, 100)
    
    logger.info(`🎭 角色設置 - 螢幕: ${canvasWidth}x${canvasHeight}, 縮放: ${characterScale.toFixed(2)}, 初始位置: (${initialX}, ${initialY})`)
    logger.info(`🎭 螢幕中心位置: (${canvasWidth / 2}, ${canvasHeight / 2})`)
    logger.info(`🎭 角色類型: ${type}, 動作: ${toRocket ? '上車' : '跳船'}`)

    // 添加到角色管理器並開始移動
    characterManager.addCharacter(characterId, characterSpine, type)
    
    logger.info(`📍 準備開始角色動作: ${toRocket ? '上車' : '跳船'}`)
    
    if (toRocket) {
      // 上車：移動到火箭，傳遞游戲尺寸
      characterManager.moveToRocket(characterId, audioManager, gameWidth.value, gameHeight.value)
    } else {
      // 跳船：從火箭跳離
      characterManager.jumpOff(characterId, audioManager)
    }
    
    logger.info(`✅ 角色動作指令已發送`)

  } catch (error) {
    logger.error(`創建角色失敗: ${error}`)
  }
}

// 爆炸火箭
function explodeRocket(): void {
  logger.info('💥 火箭爆炸')
  
  // 播放爆炸動畫
  if (rocketSpine) {
    playSpineAnimation(rocketSpine, 'explosion', false, logger.createLogFunction())
    logger.info('💥 播放 explosion 動畫')
  }
  
  // 播放爆炸音效
  audioManager.playSound('rocket_explode')
  
  // 停止背景滾動
  if (backgroundManager) {
    backgroundManager.stop()
    logger.info('💥 停止背景滾動')
  }
  
  sceneStateManager.setState(SceneState.EXPLODED)
}

// 開始下一局
function startNextRound(): void {
  logger.info('🔄 開始下一局')
  
  // 停止所有計時器和音頻
  countdownTimer.stop()
  audioManager.stopBGM()
  
  // 重置背景
  if (backgroundManager) {
    backgroundManager.reset()
  }
  
  // 重置角色狀態（但不清理角色管理器，保持已創建的角色）
  Object.keys(characterStates).forEach(key => {
    const character = characterStates[key as keyof typeof characterStates]
    character.onRocket = false
    // 保持 active 狀態，讓已創建的角色可以繼續使用
  })
  
  // 重置火箭動畫到初始狀態
  if (rocketSpine) {
    playSpineAnimation(rocketSpine, 'launch', true, logger.createLogFunction())
    logger.info('下一局：火箭動畫重置為 launch')
  }
  
  // 重置倒數
  countdown.value = 0
  
  // 回到準備狀態
  sceneStateManager.setState(SceneState.READY)
  
  logger.info('✅ 下一局準備完成')
}

// 重置場景
function resetScene(): void {
  logger.info('🔄 重置場景')
  
  // 停止所有計時器和音頻
  countdownTimer.stop()
  audioManager.stopBGM()
  
  // 重置背景
  if (backgroundManager) {
    backgroundManager.reset()
  }
  
  // 重置狀態
  sceneStateManager.setState(SceneState.IDLE)
  countdown.value = 0
  
  // 重置角色狀態
  Object.keys(characterStates).forEach(key => {
    const character = characterStates[key as keyof typeof characterStates]
    character.active = false
    character.onRocket = false
  })
  
  // 清理角色
  characterManager.dispose()
  
  // 重置火箭動畫到初始狀態（launch）
  if (rocketSpine) {
    playSpineAnimation(rocketSpine, 'launch', true, logger.createLogFunction())
    logger.info('重置：火箭動畫重置為 launch')
  }
}

// 更新音量
function updateVolume(): void {
  audioManager.setVolume(volume.value / 100)
  logger.info(`🔊 音量設置為: ${volume.value}%`)
}

// 更新飛行速度
function updateFlyingSpeed(): void {
  logger.info(`🚀 飛行速度設置為: ${flyingSpeed.value}x`)
  // 如果正在飛行階段，實時更新速度
  if (backgroundManager && currentState.value === SceneState.FLYING) {
    backgroundManager.updateFlyingSpeed(flyingSpeed.value)
  }
}

// 檢查角色按鈕是否應該禁用
function isCharacterDisabled(_characterId: string): boolean {
  // 在準備、倒數階段和飛行階段，所有按鈕都可以點擊（允許重複上車和跳船）
  if (currentState.value === SceneState.READY || 
      currentState.value === SceneState.COUNTDOWN || 
      currentState.value === SceneState.FLYING) {
    return false
  }
  
  // 其他狀態禁用按鈕
  return true
}

// 獲取狀態顯示文字
function getStateText(state: SceneState): string {
  switch (state) {
    case SceneState.IDLE: return '待機中'
    case SceneState.READY: return '準備就緒'
    case SceneState.COUNTDOWN: return '倒數階段'
    case SceneState.FLYING: return '飛行中'
    case SceneState.EXPLODED: return '已爆炸'
    default: return '未知狀態'
  }
}

// 獲取狀態顏色
function getStateColor(state: SceneState): string {
  switch (state) {
    case SceneState.IDLE: return 'text-gray-400'
    case SceneState.READY: return 'text-green-400'
    case SceneState.COUNTDOWN: return 'text-yellow-400'
    case SceneState.FLYING: return 'text-blue-400'
    case SceneState.EXPLODED: return 'text-red-600'
    default: return 'text-gray-400'
  }
}

// 清理函數
function cleanup(): void {
  countdownTimer.stop()
  characterManager.dispose()
  audioManager.dispose()
  
  // 清理背景管理器
  if (backgroundManager) {
    backgroundManager.dispose()
    backgroundManager = null
  }
  
  destroyPixiApp(app, logger.createLogFunction())
  app = null
  rocketSpine = null
}

onMounted(() => {
  updateGameSize()
  initScene()
  
  // 監聽窗口調整事件
  window.addEventListener('resize', updateGameSize)
})

// 監聽素材包變化並重新初始化場景
watch(() => assetPackStore.currentPack, async (newPack, oldPack) => {
  if (oldPack && newPack !== oldPack) {
    console.log(`🎨 素材包切換: ${oldPack} → ${newPack}，重新初始化場景`)
    
    // 清理現有場景
    cleanup()
    
    // 重新初始化 audioManager 使用新的素材包路徑
    audioManager = createAudioManager()
    
    // 重置遊戲狀態
    currentState.value = SceneState.IDLE
    countdown.value = 0
    
    // 重新初始化場景
    updateGameSize()
    await initScene()
  }
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', updateGameSize)
})
</script>

<style scoped>
/* 自定義滑桿樣式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 12px;
  width: 12px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
  height: 12px;
  width: 12px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}
</style>