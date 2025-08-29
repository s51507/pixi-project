<template>
  <div class="h-screen text-white relative overflow-hidden" :style="{ backgroundImage: pageBackgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <!-- PixiJS Canvas 游戲本體 - 保持寬度比例，高度100vh -->
    <canvas 
      ref="canvasRef" 
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      :style="{ width: gameWidth + 'px', height: gameHeight + 'px' }"
    ></canvas>
    
    <!-- 右上角漢堡選單 -->
    <div class="absolute top-4 right-4 z-50">
      <button 
        @click="showMenu = !showMenu"
        class="bg-black/80 backdrop-blur-sm hover:bg-black/90 p-3 rounded-lg transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      
      <!-- 選單內容 -->
      <div v-if="showMenu" class="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-lg font-bold text-yellow-400">🎸 Funky Rocket 遊戲</h1>
          <div class="flex items-center gap-2">
            <button 
              @click="resetGame"
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
        
        <!-- 遊戲狀態 -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs text-gray-400">狀態:</span>
            <span :class="getStateColor(currentState)" class="text-xs font-medium">
              {{ getStateText(currentState) }}
            </span>
          </div>
          <div v-if="charactersOnBoard.length > 0" class="text-xs text-green-400">
            乘客: {{ charactersOnBoard.length }}
          </div>
        </div>
        
        <!-- 倒數計時顯示 -->
        <div v-if="countdown > 0" class="text-center mb-4">
          <span class="text-3xl font-bold text-red-400">{{ Math.ceil(countdown) }}</span>
          <div class="text-xs text-gray-400">秒後發射</div>
        </div>

        <!-- 音量控制 -->
        <div class="mb-4">
          <label class="text-xs text-gray-400 block mb-2">🔊 音量控制</label>
          <div class="flex items-center gap-2">
            <input 
              type="range" 
              v-model="volume" 
              @input="updateVolume"
              min="0" 
              max="100" 
              class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            >
            <span class="text-xs text-gray-400 w-10">{{ volume }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Sheet 控制區域 -->
    <div class="fixed bottom-0 left-0 right-0 z-40">
      <!-- Bottom Sheet 拖拉把手和背景 -->
      <div 
        class="bg-black/90 backdrop-blur-sm rounded-t-2xl transition-all duration-300 ease-out"
        :class="{ 'translate-y-0': showBottomSheet, 'translate-y-[calc(100%-60px)]': !showBottomSheet }"
      >
        <!-- 拖拉把手 -->
        <div 
          @click="showBottomSheet = !showBottomSheet"
          class="flex items-center justify-center py-3 cursor-pointer hover:bg-white/10 rounded-t-2xl transition-colors"
        >
          <div class="w-10 h-1 bg-gray-400 rounded-full"></div>
          <span class="ml-3 text-sm text-gray-300">
            {{ showBottomSheet ? '收起控制面板' : '展開控制面板' }}
          </span>
        </div>
        
        <!-- 控制面板內容 -->
        <div class="px-4 pb-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <!-- 階段一：開始遊戲 -->
          <div v-if="currentState === GameState.IDLE" class="space-y-4">
            <div class="text-center">
              <button 
                @click="startGame"
                class="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-bold text-lg w-full max-w-sm"
              >
                🚀 開始遊戲
              </button>
            </div>
          </div>

          <!-- 階段二：上車階段和倒數階段 -->
          <div v-if="currentState === GameState.BOARDING || currentState === GameState.COUNTDOWN" class="space-y-4">
            <h2 class="text-lg font-semibold text-center text-yellow-400">
              {{ currentState === GameState.COUNTDOWN ? '⏰ 倒數中 - 快上車！' : '🚌 乘客上車' }}
            </h2>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="playerBoard"
                class="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-semibold"
              >
                👤 玩家上車
              </button>
              <button 
                @click="streamerBoard"
                class="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors font-semibold"
              >
                📺 主播上車
              </button>
              <button 
                @click="npcBoard"
                class="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors font-semibold"
              >
                🤖 NPC上車
              </button>
              <button 
                @click="startCountdown"
                :disabled="currentState === GameState.COUNTDOWN"
                class="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition-colors font-semibold"
              >
                ⏰ 倒數5秒
              </button>
            </div>
          </div>

          <!-- 階段三：下車階段 -->
          <div v-if="currentState === GameState.DISEMBARKING" class="space-y-4">
            <h2 class="text-lg font-semibold text-center text-yellow-400">🪂 乘客下車</h2>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="playerDisembark"
                class="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-semibold"
              >
                👤 玩家下車
              </button>
              <button 
                @click="streamerDisembark"
                class="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors font-semibold"
              >
                📺 主播下車
              </button>
              <button 
                @click="npcDisembark"
                class="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors font-semibold"
              >
                🤖 NPC下車
              </button>
              <button 
                @click="explodeRocket"
                :disabled="isAnimating"
                class="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition-colors font-semibold"
              >
                💥 爆炸
              </button>
            </div>
          </div>

          <!-- 階段四：重新開始 -->
          <div v-if="currentState === GameState.COMPLETED" class="space-y-4">
            <div class="text-center">
              <h2 class="text-xl font-bold mb-4 text-yellow-400">🎉 遊戲結束</h2>
              <button 
                @click="resetGame"
                class="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-bold text-lg w-full max-w-sm"
              >
                🔄 重新開始
              </button>
            </div>
          </div>

          <!-- 底部狀態信息 -->
          <div class="border-t border-gray-700 pt-4">
            <div class="grid grid-cols-2 gap-4 text-xs mb-3">
              <div>
                <span class="text-gray-400">素材包:</span>
                <span class="ml-1 font-medium text-yellow-400">Funky Rocket</span>
              </div>
              <div>
                <span class="text-gray-400">遊戲階段:</span>
                <span class="ml-1 font-medium text-green-400">{{ currentState }}</span>
              </div>
              <div>
                <span class="text-gray-400">乘客數量:</span>
                <span class="ml-1 font-medium text-blue-400">{{ charactersOnBoard.length }}</span>
              </div>
              <div>
                <span class="text-gray-400">動畫狀態:</span>
                <span class="ml-1 font-medium text-purple-400">{{ isAnimating ? '播放中' : '待機' }}</span>
              </div>
            </div>
            
            <!-- 角色狀態 -->
            <div v-if="charactersOnBoard.length > 0" class="text-xs">
              <div class="flex flex-wrap gap-2">
                <span class="text-gray-400">在場角色:</span>
                <span v-for="character in charactersOnBoard" :key="character" :class="getCharacterColor(character)" class="font-medium">
                  {{ getCharacterName(character) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
// 注意：此頁面固定使用 funkyRocket 素材包，不需要 useAssetPackStore

// 引入場景管理相關工具
import type { Application, Sprite } from 'pixi.js'
import { Assets } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { 
  createPixiApp, 
  destroyPixiApp,
  createSpineAnimation,
  playSpineAnimation,
  applySpineTransform,
  clearSpineState
} from '@/utils/pixi'
import { createLogger } from '@/utils/pixi/logger'
import { CountdownTimer, AudioManager, type AudioAssets } from '@/utils/pixi/scene'
import { createFloatEffect, type EffectState } from '@/utils/pixi/effects'
import { createBoneTracker, type BoneTracker } from '@/utils/pixi/boneTracker'
import { createPixiText, type CreateTextResult } from '@/utils/pixi/text'

// 遊戲狀態枚舉
enum GameState {
  IDLE = 'IDLE',
  BOARDING = 'BOARDING',
  COUNTDOWN = 'COUNTDOWN',
  LAUNCHING = 'LAUNCHING',
  FLYING = 'FLYING',
  DISEMBARKING = 'DISEMBARKING',
  EXPLODING = 'EXPLODING',
  COMPLETED = 'COMPLETED'
}

// 角色類型
type CharacterType = 'player' | 'streamer' | 'npc'

// 角色數據結構
interface Character {
  id: string
  type: CharacterType
  spine: any
  position: { x: number; y: number }
  isVisible: boolean
  textResult?: CreateTextResult // 文字物件（可選）
  boneTracker?: BoneTracker // 骨骼追蹤器（可選）
}

// 注意：此頁面固定使用 funkyRocket 素材包

// Canvas 引用
const canvasRef = ref<HTMLCanvasElement>()

// UI 狀態
const showMenu = ref(false)
const showBottomSheet = ref(true) // 預設展開控制面板

// 遊戲狀態
const currentState = ref<GameState>(GameState.IDLE)
const countdown = ref(0)
const isAnimating = ref(false)
const charactersOnBoard = ref<CharacterType[]>([])
const volume = ref(50)

// 遊戲尺寸 - 保持 540:958 比例，高度跟 body 一樣
const gameWidth = ref(540)
const gameHeight = ref(958)

// 基礎偏移量，都要浮上來一點
const baseOffsetY = ref(-35)
// 基礎縮放，所有角色都會縮放這個值
const baseScale = ref(0.65)

// PixiJS 相關實例
let app: Application | null = null
let defaultBackgroundSprite: Sprite | null = null
let cycleBackgroundSprites: Sprite[] = [] // 多個循環背景精靈
let frontCloudSprite: Sprite | null = null // 前景雲朵
let countdownTimer: CountdownTimer | null = null
let rocketSpine: any = null
let rocketFloatEffect: EffectState | null = null // 火箭漂浮效果
const characters: Map<string, Character> = new Map()
const logger = createLogger()

// 背景滾動狀態
const isScrolling = ref(false)
const scrollSpeed = 5 // 滾動速度 (加快飛行感)

// 音效管理 - 使用 AudioManager
let audioManager: AudioManager | null = null

// 響應式音效資源配置 - 固定使用 funkyRocket
const audioAssets = computed<AudioAssets>(() => ({
  bgm_open: '/funkyRocket/mp3/assets/bgm_open-DYI02Dgc.mp3',
  bgm_fly: '/funkyRocket/mp3/assets/bgm_fly-DX4muDxO.mp3',
  countdown: '/funkyRocket/mp3/assets/countdown-S5DFRcF0.mp3',
  rocket_prelaunch_beginning: '/funkyRocket/mp3/assets/rocket_prelaunch_beginning-CBWMXJzv.mp3',
  rocket_prelaunch_launching: '/funkyRocket/mp3/assets/rocket_prelaunch_launching-CbFaD9b4.mp3',
  rocket_fly: '/funkyRocket/mp3/assets/rocket_fly-B0Tde6-n.mp3',
  rocket_explode: '/funkyRocket/mp3/assets/rocket_explode-DyCSKWjQ.mp3',
  user_hop_on: '/funkyRocket/mp3/assets/user_hop_on-D1L_1wBN.mp3',
  user_hop_off: '/funkyRocket/mp3/assets/user_hop_off-jltqlRTg.mp3',
  others_hop_on: '/funkyRocket/mp3/assets/others_hop_on-BZB6aVMn.mp3',
  others_hop_off: '/funkyRocket/mp3/assets/others_hop_off-B0ltzgMH.mp3',
  click: '/funkyRocket/mp3/assets/click-yOjLuJq2.mp3'
}))

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

// 固定使用 funkyRocket 的 getSpineAssets 函數
function getSpineAssets(animationName: string) {
  return {
    skelPath: `/funkyRocket/spine/${animationName}/skeleton.skel`,
    atlasPath: `/funkyRocket/spine/${animationName}/skeleton.atlas`,
    imagePath: `/funkyRocket/spine/${animationName}/skeleton.png`
  }
}

// 狀態顯示函數
function getStateColor(state: GameState): string {
  switch (state) {
    case GameState.IDLE: return 'text-gray-400'
    case GameState.BOARDING: return 'text-blue-400'
    case GameState.COUNTDOWN: return 'text-yellow-400'
    case GameState.LAUNCHING: return 'text-orange-400'
    case GameState.FLYING: return 'text-green-400'
    case GameState.DISEMBARKING: return 'text-purple-400'
    case GameState.EXPLODING: return 'text-red-400'
    case GameState.COMPLETED: return 'text-cyan-400'
    default: return 'text-gray-400'
  }
}

function getStateText(state: GameState): string {
  switch (state) {
    case GameState.IDLE: return '待機中 (Launch動畫)'
    case GameState.BOARDING: return '乘客上車 (Launch動畫)'
    case GameState.COUNTDOWN: return '倒數計時 (Launch動畫)'
    case GameState.LAUNCHING: return '發射準備 (Rocket_shake動畫)'
    case GameState.FLYING: return '火箭飛行 (Flying_loop動畫)'
    case GameState.DISEMBARKING: return '乘客下車 (Flying_loop動畫)'
    case GameState.EXPLODING: return '火箭爆炸 (Explosion動畫)'
    case GameState.COMPLETED: return '遊戲結束'
    default: return '未知狀態'
  }
}

function getCharacterColor(character: CharacterType): string {
  switch (character) {
    case 'player': return 'text-blue-400'
    case 'streamer': return 'text-purple-400'
    case 'npc': return 'text-orange-400'
    default: return 'text-gray-400'
  }
}

function getCharacterName(character: CharacterType): string {
  switch (character) {
    case 'player': return '👤 玩家'
    case 'streamer': return '📺 主播'
    case 'npc': return '🤖 NPC'
    default: return '未知角色'
  }
}

// === 背景管理函數 ===

// 設置默認背景
async function setDefaultBackground(): Promise<void> {
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
    defaultBackgroundSprite.x = (gameWidth.value - texture.width * scale) / 2
    defaultBackgroundSprite.y = (gameHeight.value - texture.height * scale) / 2
    defaultBackgroundSprite.zIndex = -10 // 在最底層
    
    app.stage.addChild(defaultBackgroundSprite)
    
    logger.info('✅ 默認背景設置完成')
    
  } catch (error) {
    logger.error(`❌ 默認背景載入失敗: ${error}`)
  }
}

// 設置前景雲朵 - 高度最多到螢幕一半
async function setFrontCloud(): Promise<void> {
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
async function initCycleBackground(): Promise<void> {
  if (!app) return
  
  try {
    logger.info(`🔄 初始化循環背景`)
    
    const texture = await Assets.load(cycleBackground.value)
    
    // 設置背景寬度適應畫布，保持比例
    const scale = gameWidth.value / texture.width
    const scaledHeight = texture.height * scale
    
    // 創建多個背景精靈用於循環，從畫面頂部開始接續 bgDefault
    const numSprites = Math.ceil((gameHeight.value * 2) / scaledHeight) + 2 // 足夠的精靈確保循環
    
    for (let i = 0; i < numSprites; i++) {
      const sprite = new PIXI.Sprite(texture)
      
      sprite.scale.set(scale)
      sprite.x = 0
      // 第一個精靈從畫面上方外開始，滾動時會從上方進入
      // 後續精靈依序向上排列，形成滾動隊列
      sprite.y = -scaledHeight - (i * scaledHeight)
      sprite.zIndex = -5 // 在默認背景之上，但在其他元素之下
      
      cycleBackgroundSprites.push(sprite)
      app.stage.addChild(sprite)
    }
    
    app.stage.sortChildren()
    logger.info(`✅ 循環背景初始化完成，${numSprites} 個精靈`)
    
  } catch (error) {
    logger.error(`❌ 循環背景初始化失敗: ${error}`)
  }
}

// 啟動背景滾動（包含默認背景和循環背景）
function startBackgroundScroll(): void {
  if (isScrolling.value) return
  
  isScrolling.value = true
  logger.info('🌀 開始背景滾動')
  
  const scroll = () => {
    if (!isScrolling.value || !app) return
    
    // 滾動默認背景（bgDefault）
    if (defaultBackgroundSprite) {
      defaultBackgroundSprite.y += scrollSpeed
      
      // 當默認背景移出下方時，移動到循環背景隊列上方
      if (defaultBackgroundSprite.y > gameHeight.value) {
        const topY = Math.min(...cycleBackgroundSprites.map(s => s.y))
        defaultBackgroundSprite.y = topY - defaultBackgroundSprite.height
      }
    }
    
    // 滾動前景雲朵，跟著 bgDefault 一起移動
    if (frontCloudSprite) {
      frontCloudSprite.y += scrollSpeed
      // 前景雲朵滾出螢幕後就不再回來
    }
    
    // 滾動循環背景（bgCycle）
    cycleBackgroundSprites.forEach(sprite => {
      sprite.y += scrollSpeed // 背景向下移動（y座標增加），創造火箭向上飛的效果
      
      // 當精靈完全移出下方時，移動到隊列最上方繼續循環
      if (sprite.y > gameHeight.value) {
        // 找到最上方的精靈位置（包含默認背景）
        const allSprites = [...cycleBackgroundSprites].filter(s => s !== null)
        const topY = Math.min(...allSprites.map(s => s!.y))
        sprite.y = topY - sprite.height
      }
    })
    
    requestAnimationFrame(scroll)
  }
  
  scroll()
}

// 停止背景滾動
function stopBackgroundScroll(): void {
  isScrolling.value = false
  logger.info('🛑 停止背景滾動')
}

// 開始火箭漂浮效果
function startRocketFloat(): void {
  if (!rocketSpine || rocketFloatEffect?.isActive) return
  
  logger.info('🌊 開始火箭漂浮效果')
  
  rocketFloatEffect = createFloatEffect(
    rocketSpine,
    {
      range: 15,    // 漂浮範圍 15px
      speed: 1.2,   // 漂浮速度
      baseX: rocketSpine.x,
      baseY: rocketSpine.y + baseOffsetY.value
    },
    (x, y, _rotation) => {
      // 只更新位置，不更新旋轉
      rocketSpine.x = x
      rocketSpine.y = y
      // 不使用 rotation，保持火箭原本的朝向
      // rocketSpine.rotation = rotation
    }
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

// 初始化 AudioManager
function createAudioManager(): AudioManager {
  return new AudioManager(audioAssets.value, logger.createLogFunction())
}

// 音量控制
function updateVolume(): void {
  if (audioManager) {
    audioManager.setVolume(volume.value / 100)
    logger.info(`🔊 音量設置: ${volume.value}%`)
  }
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
    const availableAnimations = spineResult.animations
    spine.zIndex = 2 // 角色在火箭之上
    
    // 設定角色起始位置 - 所有角色都從正中間開始
    const scale = baseScale.value * 1  // 放大角色，讓它更明顯
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
    
    // 播放一次上車動畫（不循環）
    if (availableAnimations.length > 0) {
      const firstAnimation = availableAnimations[0]
      playSpineAnimation(spine, firstAnimation, false) // false = 不循環，播放一次就好
      logger.info(`🎬 播放上車動畫: ${firstAnimation}`)
    } else {
      logger.warn('⚠️ 沒有找到可用的動畫')
    }
    
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
  
  try {
    // 角色已在創建時播放 walk 動畫，這裡只需要移動

    const directionOffsetX = direction === 'left' ? -20 : 20
    
    // 移動到火箭附近的地面位置
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
        scaleX: shouldFlip ? -baseScale.value * 1 : baseScale.value * 1,
        scaleY: baseScale.value * 1
      })
      
      character.position.x = currentX
      character.position.y = currentY
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 動畫完成，移除角色
        if (app && app.stage.getChildIndex(character.spine) !== -1) {
          app.stage.removeChild(character.spine)
        }
        characters.delete(character.id)
        charactersOnBoard.value.push(character.type)
        logger.info(`✅ ${character.type} 上車完成，角色已移除`)
      }
    }
    
    animate()
    
  } catch (error) {
    logger.error(`❌ 角色上車動畫失敗: ${error}`)
  }
}

// 創建文字跟隨功能
interface FollowTextResult {
  textResult?: CreateTextResult
  boneTracker?: BoneTracker
}

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
    textResult.textObject.zIndex = 15
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
    spine.zIndex = 2 // 角色在火箭之上

    // 從火箭的實際位置開始
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
    const animationName = isNpc ? 'jump_others' : 'jump_me'

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
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
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
        if (index > -1) {
          charactersOnBoard.value.splice(index, 1)
        }
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
    audioManager = createAudioManager()
    updateVolume() // 設置初始音量

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
    
    // 設置火箭位置（居中）
    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value * 1,
      scaleY: baseScale.value * 1
    })
    
    // 播放火箭初始動畫（launch）
    if (spineResult.animations.includes('launch')) {
      playSpineAnimation(rocketSpine, 'launch', true)
    }

    // 5. 初始化倒數計時器
    countdownTimer = new CountdownTimer()
    
    currentState.value = GameState.IDLE
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
  currentState.value = GameState.BOARDING
}

// 玩家上車
async function playerBoard(): Promise<void> {
  const character = await createCharacterWalk('player', `player-${Date.now()}`)
  if (character) {
    await animateCharacterWalk(character, 'left')
    audioManager?.playSound('user_hop_on') // 玩家上車音效
  }
}

// 主播上車
async function streamerBoard(): Promise<void> {
  
  const character = await createCharacterWalk('streamer', `streamer-${Date.now()}`)
  if (character) {
    await animateCharacterWalk(character, 'left')
    audioManager?.playSound('others_hop_on') // 其他人上車音效
  }
}

// NPC上車
async function npcBoard(): Promise<void> {
  
  const character = await createCharacterWalk('npc', `npc-${Date.now()}`)
  if (character) {
    await animateCharacterWalk(character, 'right')
    audioManager?.playSound('others_hop_on') // 其他人上車音效
  }
}

// 開始倒數計時
function startCountdown(): void {
  if (currentState.value === GameState.COUNTDOWN || !countdownTimer) return
  
  logger.info('⏰ 開始倒數計時')
  currentState.value = GameState.COUNTDOWN
  
  let lastSecond = -1 // 追蹤上一秒的值
  
  countdownTimer.start(5, (remaining) => {
    const currentSecond = Math.ceil(remaining)
    countdown.value = remaining
    
    // 只在秒數變化時播放音效
    if (currentSecond !== lastSecond && currentSecond > 0) {
      audioManager?.playSound('countdown')
      logger.info(`🔊 倒數: ${currentSecond}`)
      lastSecond = currentSecond
    }
  }, async () => {
    countdown.value = 0
    await launchRocket()
  })
}

// 火箭發射序列
async function launchRocket(): Promise<void> {
  logger.info('🚀 火箭發射序列開始')
  
  // 等待所有上車動畫完成 - 檢查是否還有角色在移動中
  while (characters.size > 0) {
    logger.info(`⏳ 等待上車動畫完成，剩餘角色: ${characters.size}`)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  try {
    // 1. 發射準備階段 - 播放 rocket_shake 動畫
    currentState.value = GameState.LAUNCHING
    
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'rocket_shake', false)
    }
    audioManager?.playSound('rocket_prelaunch_beginning')
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 2. 發射啟動階段 - 播放 flying 動畫並開始背景滾動
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'flying', false)
    }
    audioManager?.playSound('rocket_prelaunch_launching')
    
    // 初始化循環背景並開始滾動 (flying 動畫開始時才滾動)
    await initCycleBackground()
    startBackgroundScroll()
    
    // 等待1.5秒
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 3. 飛行階段 - 播放 flying_loop 動畫並放大火箭
    currentState.value = GameState.FLYING
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'flying_loop', true)
      
      // 開始火箭漂浮效果
      startRocketFloat()

      // 飛行後火箭動畫偏上
      const flyingOffsetY = -60

      // 飛行時火箭動畫縮小
      const flyingScale = baseScale.value * 0.68
      
      // 飛行時縮小火箭
      applySpineTransform(rocketSpine, {
        x: gameWidth.value / 2,
        y: gameHeight.value / 2 + baseOffsetY.value + flyingOffsetY,
        scaleX: flyingScale,
        scaleY: flyingScale
      })
    }
    audioManager?.playBGM('rocket_fly', true) // 循環播放火箭飛行音效
    
    // 進入下車階段
    currentState.value = GameState.DISEMBARKING
    logger.info('✅ 火箭發射完成，進入下車階段')
    
  } catch (error) {
    logger.error(`❌ 火箭發射失敗: ${error}`)
  }
}

// 玩家下車
async function playerDisembark(): Promise<void> {
  logger.info('🎯 玩家下車按鈕被點擊')
  const character = await createCharacterJump('player', `player-disembark-${Date.now()}`, '玩家下車囉')
  if (character) {
    logger.info('🎯 玩家角色創建成功，開始動畫')
    await animateCharacterJump(character)
    audioManager?.playSound('user_hop_off') // 玩家下車音效
  } else {
    logger.error('❌ 玩家角色創建失敗')
  }
}

// 主播下車
async function streamerDisembark(): Promise<void> {
  const character = await createCharacterJump('streamer', `streamer-disembark-${Date.now()}`)
  if (character) {
    await animateCharacterJump(character)
    audioManager?.playSound('others_hop_off') // 其他人下車音效
  }
}

// NPC下車
async function npcDisembark(): Promise<void> {
  const character = await createCharacterJump('npc', `npc-disembark-${Date.now()}`)
  if (character) {
    await animateCharacterJump(character)
    audioManager?.playSound('others_hop_off') // 其他人下車音效
  }
}

// 火箭爆炸
async function explodeRocket(): Promise<void> {
  if (isAnimating.value) return
  
  logger.info('💥 火箭爆炸')
  currentState.value = GameState.EXPLODING
  isAnimating.value = true
  
  try {    
    // 停止火箭飛行音效、背景滾動和漂浮效果
    audioManager?.stopBGM()
    stopBackgroundScroll()
    stopRocketFloat()
    
    // 播放爆炸動畫和音效
    if (rocketSpine) {
      playSpineAnimation(rocketSpine, 'explosion', false)
    }
    audioManager?.playSound('rocket_explode')
    
    // 等待爆炸動畫完成（假設3秒）
    // await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 遊戲結束
    currentState.value = GameState.COMPLETED
    isAnimating.value = false
    logger.info('✅ 遊戲流程完成')
    
  } catch (error) {
    logger.error(`❌ 爆炸序列失敗: ${error}`)
    isAnimating.value = false
  }
}

// 重置遊戲
async function resetGame(): Promise<void> {
  logger.info('🔄 重置 Funky Rocket 遊戲')
  
  // 停止所有動畫、計時器和音效
  if (countdownTimer) {
    countdownTimer.stop()
  }
  audioManager?.stopBGM() // 停止所有背景音樂
  stopRocketFloat() // 停止火箭漂浮效果
  countdown.value = 0
  isAnimating.value = false
  
  // 清理所有角色
  for (const character of characters.values()) {
    if (app && app.stage.getChildIndex(character.spine) !== -1) {
      app.stage.removeChild(character.spine)
    }
  }
  characters.clear()
  charactersOnBoard.value = []
  
  // 重置狀態
  currentState.value = GameState.IDLE
  
  // 重置背景系統
  stopBackgroundScroll()
  
  // 清理循環背景
  cycleBackgroundSprites.forEach(sprite => {
    if (app && app.stage.getChildIndex(sprite) !== -1) {
      app.stage.removeChild(sprite)
    }
  })
  cycleBackgroundSprites = []
  
  // 清理並重新創建默認背景
  if (defaultBackgroundSprite && app && app.stage.getChildIndex(defaultBackgroundSprite) !== -1) {
    app.stage.removeChild(defaultBackgroundSprite)
  }
  defaultBackgroundSprite = null
  
  // 重新創建前景雲朵
  if (frontCloudSprite && app && app.stage.getChildIndex(frontCloudSprite) !== -1) {
    app.stage.removeChild(frontCloudSprite)
  }
  frontCloudSprite = null
  
  // 重新創建默認背景和前景
  if (app) {
    await setDefaultBackground()
    await setFrontCloud()
  }
  
  // 重置火箭動畫和大小
  if (rocketSpine) {
    clearSpineState(rocketSpine)
    playSpineAnimation(rocketSpine, 'launch', true)
    
    // 恢復火箭到原始大小
    applySpineTransform(rocketSpine, {
      x: gameWidth.value / 2,
      y: gameHeight.value / 2 + baseOffsetY.value,
      scaleX: baseScale.value * 1,
      scaleY: baseScale.value * 1
    })
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
  stopBackgroundScroll()
  stopRocketFloat()
  
  if (defaultBackgroundSprite && app && app.stage.getChildIndex(defaultBackgroundSprite) !== -1) {
    app.stage.removeChild(defaultBackgroundSprite)
  }
  defaultBackgroundSprite = null
  
  // 清理前景雲朵
  if (frontCloudSprite && app && app.stage.getChildIndex(frontCloudSprite) !== -1) {
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
  
  // 清理音效
  if (audioManager) {
    audioManager.dispose()
    audioManager = null
  }
  
  if (app) {
    destroyPixiApp(app)
    app = null
    rocketSpine = null
  }
}

// 響應式更新遊戲尺寸 - 保持 540:958 比例，適應視窗高度
function updateGameSize(): void {
  const aspectRatio = 540 / 958 // 原始比例
  const viewportHeight = window.innerHeight
  
  // 以視窗高度為準，按比例計算寬度
  gameHeight.value = viewportHeight
  gameWidth.value = Math.round(viewportHeight * aspectRatio)
  
  // 更新 PixiJS 應用尺寸
  if (app) {
    app.renderer.resize(gameWidth.value, gameHeight.value)
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