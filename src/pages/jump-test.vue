<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🦘 角色跳躍測試
        </h1>
        <p class="text-xl text-gray-300">
          從基本的 Spine 跳躍動畫開始，一步一步添加文字跟隨功能
        </p>
      </div>

      <!-- 狀態顯示 -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
        <div v-if="loading" class="flex items-center gap-2 text-blue-400">
          <div class="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          {{ status }}
        </div>
        <div v-else-if="error" class="text-red-400">
          ❌ {{ errorMessage }}
        </div>
        <div v-else-if="loaded" class="text-green-400">
          ✅ 跳躍動畫載入完成
        </div>
      </div>

      <!-- 軌道追蹤狀態 -->
      <div v-if="loaded" class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div :class="['px-3 py-1 rounded-full text-sm font-medium', textVisible ? 'bg-yellow-600' : 'bg-gray-600']">
              📝 文字: {{ textVisible ? '顯示' : '隱藏' }}
              </div>
            <div :class="['px-3 py-1 rounded-full text-sm font-medium', isFollowing ? 'bg-green-600' : 'bg-gray-600']">
              🎯 跟隨: {{ isFollowing ? '啟用' : '停用' }}
            </div>
            <div :class="['px-3 py-1 rounded-full text-sm font-medium', isBoneTracking ? 'bg-pink-600' : 'bg-gray-600']">
              🦴 骨骼追蹤: {{ isBoneTracking ? '啟用' : '停用' }}
            </div>
              </div>
          <div class="text-sm text-gray-300">
            軌道追蹤系統
            </div>
                  </div>
      </div>

      <!-- 素材包切換 -->
      <AssetPackSwitch v-if="loaded" class="mb-6" />

      <!-- 文字設定 -->
      <div v-if="loaded" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
        <h2 class="text-xl font-semibold mb-4">📝 文字設定</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">自定義文字內容：</label>
            <div class="flex gap-3">
              <input 
                v-model="customText"
                @input="updateTextContent"
                type="text" 
                placeholder="輸入要顯示的文字..."
                class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              <button
                @click="resetTextContent"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                🔄 重置
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              當前顯示：<span class="text-yellow-300 font-medium">{{ currentDisplayText }}</span>
            </p>
          </div>

          <!-- 文字偏移量控制 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-3">文字偏移量設置：</label>
            <div class="grid grid-cols-2 gap-4">
              <!-- X 軸偏移 (左右) -->
              <div>
                <label class="block text-xs text-gray-400 mb-2">
                  X 軸偏移 (左右): {{ textOffsetX }}px
                </label>
                <input 
                  v-model="textOffsetX"
                  @input="updateTextOffset"
                  type="range" 
                  min="-100" 
                  max="100" 
                  step="5"
                  class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                >
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>← 左 100px</span>
                  <span>右 100px →</span>
                </div>
              </div>

              <!-- Y 軸偏移 (上下) -->
              <div>
                <label class="block text-xs text-gray-400 mb-2">
                  Y 軸偏移 (上下): {{ textOffsetY }}px
                </label>
                <input 
                  v-model="textOffsetY"
                  @input="updateTextOffset"
                  type="range" 
                  min="-100" 
                  max="100" 
                  step="5"
                  class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                >
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>↑ 上 100px</span>
                  <span>下 100px ↓</span>
                </div>
              </div>
            </div>

            <!-- 偏移量預設按鈕 -->
            <div class="mt-3 flex gap-2 flex-wrap">
              <button
                @click="setTextOffsetPreset('top')"
                class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                頭頂
              </button>
              <button
                @click="setTextOffsetPreset('bottom')"
                class="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                腳下
              </button>
              <button
                @click="setTextOffsetPreset('left')"
                class="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                左側
              </button>
              <button
                @click="setTextOffsetPreset('right')"
                class="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                右側
              </button>
              <button
                @click="setTextOffsetPreset('center')"
                class="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                中心
              </button>
            </div>

            <p class="text-xs text-gray-400 mt-2">
              當前偏移：X={{ textOffsetX }}px, Y={{ textOffsetY }}px
            </p>
          </div>
        </div>
      </div>

      <!-- 動畫控制 -->
      <div v-if="loaded" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
        <h2 class="text-xl font-semibold mb-4">🎮 動畫控制</h2>
        <div class="flex gap-4">
          <button
            @click="playJumpAnimation"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
          >
            🦘 播放跳躍動畫
          </button>
          <button 
            @click="stopAnimation"
            class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
          >
            ⏹️ 停止動畫
          </button>
          <button
            @click="resetPosition"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            🔄 重置位置
          </button>
          <button
            @click="toggleText"
            :class="[
              'px-6 py-3 rounded-lg transition-colors font-medium',
              textVisible ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
            ]"
          >
            {{ textVisible ? '📝 隱藏文字' : '📝 顯示文字' }}
          </button>
          <button
            @click="toggleFollowing"
            :class="[
              'px-6 py-3 rounded-lg transition-colors font-medium',
              isFollowing ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
            ]"
          >
            {{ isFollowing ? '🎯 停止跟隨' : '🎯 跟隨軌道' }}
          </button>
          <button
            @click="checkBonePositions"
            class="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors font-medium"
          >
            🦴 檢查骨骼
          </button>
          <button
            @click="toggleBoneTracking"
            :class="[
              'px-6 py-3 rounded-lg transition-colors font-medium',
              isBoneTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'
            ]"
          >
            {{ isBoneTracking ? '🦴 停止骨骼追蹤' : '🦴 追蹤骨骼' }}
          </button>
          <button
            @click="detectMovingBones"
            class="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-medium"
          >
            🔍 檢測移動骨骼
          </button>
        </div>
            </div>
            
      <!-- Canvas 顯示區域 -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 class="text-xl font-semibold mb-4">🎭 動畫展示</h2>
        <div class="border border-gray-600 rounded-lg overflow-hidden bg-gray-800">
          <canvas ref="canvasRef" class="block mx-auto"></canvas>
              </div>
            </div>
            
      <!-- 返回按鈕 -->
      <div class="mt-8 text-center">
        <RouterLink 
          to="/spine-showcase" 
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          ← 返回 Spine 展示
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as PIXI from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v8'
import { createBoneTracker as createBoneTrackerUtil, type BoneTracker } from '@/utils/pixi/boneTracker'
import { 
  createPixiText, 
  addTextToStage, 
  TEXT_PRESETS,
  type CreateTextResult,
  type TextConfig 
} from '@/utils/pixi/text'
import type { TextOffset } from '@/utils/pixi/boneTracker'
import AssetPackSwitch from '@/components/AssetPackSwitch.vue'
import { useAssetPackStore } from '@/stores/assetPack'

// Store
const assetPackStore = useAssetPackStore()

// 狀態管理
const loading = ref(true)
const loaded = ref(false)
const error = ref(false)
const errorMessage = ref('')
const status = ref('初始化...')

// PIXI 和 Spine
const canvasRef = ref<HTMLCanvasElement>()
let app: PIXI.Application | null = null
let spine: any = null
let textResult: CreateTextResult | null = null

// 文字控制
const textVisible = ref(false)
const isFollowing = ref(false)
const isBoneTracking = ref(false)
const customText = ref('ABC')
const currentDisplayText = ref('ABC')

// 文字偏移量
const textOffsetX = ref(0)
const textOffsetY = ref(60)

// 軌道追蹤
let trackingAnimationId: number | null = null

// 骨骼追蹤器
let boneTracker: BoneTracker | null = null

// 響應式跳躍動畫資源路徑 - 會根據當前素材包自動更新
const JUMP_ANIMATION = computed(() => {
  return assetPackStore.getSpineAssets('me-default1-jump_v3')
})

/**
 * 初始化 PIXI 和 Spine
 */
async function init(): Promise<void> {
  try {
    if (!canvasRef.value) {
      throw new Error('Canvas 元素未找到')
    }

    console.log('🚀 開始初始化角色跳躍動畫')
    
    // 1. 創建 PIXI 應用
    status.value = '創建 PIXI 應用...'
    app = new PIXI.Application()
    await app.init({
      canvas: canvasRef.value,
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a1a,
      antialias: true
    })
    console.log('✅ PIXI 應用創建成功')
    
    // 2. 預載入跳躍動畫資源
    status.value = '載入跳躍動畫資源...'
    const skelKey = `jump-skel-${Date.now()}`
    const atlasKey = `jump-atlas-${Date.now()}`
    
    PIXI.Assets.add({ alias: skelKey, src: JUMP_ANIMATION.value.skelPath })
    PIXI.Assets.add({ alias: atlasKey, src: JUMP_ANIMATION.value.atlasPath })
    await PIXI.Assets.load([skelKey, atlasKey])
    console.log('✅ 跳躍動畫資源載入完成')
    
    // 3. 創建 Spine 跳躍角色
    status.value = '創建 Spine 角色...'
    spine = await Spine.from({
      skeleton: JUMP_ANIMATION.value.skelPath,
      atlas: JUMP_ANIMATION.value.atlasPath
    })
    console.log('✅ Spine 角色創建成功')
    
    // 4. 設置角色位置和大小
    spine.x = app.screen.width / 2
    spine.y = app.screen.height / 2 + 100  // 稍微偏下一點
    spine.scale.set(0.5) // 適當縮放
    
    // 5. 添加到舞台
    app.stage.addChild(spine)
    console.log('✅ 角色已添加到舞台')
    
    // 6. 檢查可用動畫
    if (spine.skeleton?.data?.animations) {
      const animations = spine.skeleton.data.animations.map((a: any) => a.name)
      console.log('📋 可用動畫:', animations)
    }
    
    // 7. 創建文字物件
    createTextObject()
    
    // 8. 創建骨骼追蹤器
    createBoneTracker()
    
    loaded.value = true
    status.value = '準備就緒'
    console.log('🎉 初始化完成！')
    
  } catch (err) {
    console.error('💥 初始化錯誤:', err)
    error.value = true
    errorMessage.value = String(err)
  } finally {
    loading.value = false
  }
}

/**
 * 播放跳躍動畫
 */
function playJumpAnimation(): void {
  if (!spine?.state) {
    console.error('❌ Spine 或 state 不存在')
    return
  }
  
  try {
    console.log('🦘 播放跳躍動畫')
    
    // 尋找跳躍動畫（可能的名稱）
    const possibleNames = ['jump', 'Jump', 'JUMP', 'jumping', 'Jumping']
    let animationName = ''
    
    if (spine.skeleton?.data?.animations) {
      const animations = spine.skeleton.data.animations.map((a: any) => a.name)
      animationName = possibleNames.find(name => animations.includes(name)) || animations[0]
      console.log(`🎯 使用動畫: ${animationName}`)
    }
    
    if (animationName) {
      spine.state.setAnimation(0, animationName, false) // 不循環，播放一次
      console.log('✅ 跳躍動畫開始播放')
      
      // 根據啟用的追蹤模式開始對應的追蹤
      if (isBoneTracking.value && textVisible.value && boneTracker) {
        boneTracker.startTracking()
      } else if (isFollowing.value && textVisible.value) {
        startTrackingAnimation()
      }
    } else {
      console.warn('⚠️ 未找到跳躍動畫')
    }
    
  } catch (err) {
    console.error('❌ 播放動畫失敗:', err)
  }
}

/**
 * 停止動畫
 */
function stopAnimation(): void {
  if (!spine?.state) return
  
  try {
    console.log('⏹️ 停止動畫')
    spine.state.clearTracks()
    stopTrackingAnimation() // 停止軌道追蹤
    
    // 停止骨骼追蹤
    if (boneTracker) {
      boneTracker.stopTracking()
      boneTracker.stopDetection()
    }
    
    console.log('✅ 動畫已停止')
  } catch (err) {
    console.error('❌ 停止動畫失敗:', err)
  }
}

/**
 * 重置角色位置
 */
function resetPosition(): void {
  if (!spine || !app) return
  
  try {
    console.log('🔄 重置角色位置')
    spine.x = app.screen.width / 2
    spine.y = app.screen.height / 2 + 100
    spine.scale.set(0.5)
    spine.rotation = 0
    console.log('✅ 位置已重置')
  } catch (err) {
    console.error('❌ 重置位置失敗:', err)
  }
}

/**
 * 創建文字物件
 */
function createTextObject(): void {
  if (!app) {
    console.error('❌ PIXI 應用不存在，無法創建文字')
    return
  }
  
  try {
    console.log('📝 創建文字物件')
    
    // 使用工具函數創建文字物件
    const textConfig: Partial<TextConfig> = {
      ...TEXT_PRESETS.subtitle,
      text: customText.value
    }
    
    textResult = createPixiText(textConfig, (message) => console.log(message))
    
    // 添加到舞台並設置初始變換
    addTextToStage(
      app,
      textResult,
      {
        x: app.screen.width / 2,
        y: app.screen.height / 2 - 50,
        anchorX: 0.5,
        anchorY: 0.5,
        zIndex: 10,
        visible: false
      },
      (message) => console.log(message)
    )
    
    currentDisplayText.value = textResult.textObject.text
    console.log('✅ 文字物件創建完成')
    
  } catch (err) {
    console.error('❌ 創建文字物件失敗:', err)
  }
}

/**
 * 切換文字顯示/隱藏
 */
function toggleText(): void {
  if (!textResult) {
    console.error('❌ 文字物件不存在')
    return
  }
  
  try {
    textVisible.value = !textVisible.value
    textResult.setVisible(textVisible.value)
    
    console.log(`📝 文字${textVisible.value ? '顯示' : '隱藏'}:`, currentDisplayText.value)
    
  } catch (err) {
    console.error('❌ 切換文字顯示失敗:', err)
  }
}

/**
 * 更新文字內容
 */
function updateTextContent(): void {
  if (!textResult) {
    console.log('⚠️ 文字物件不存在，跳過更新')
    return
  }
  
  try {
    // 確保輸入不為空
    const newText = customText.value.trim() || 'ABC'
    textResult.updateText(newText)
    currentDisplayText.value = newText
    
    console.log(`📝 文字內容已更新為: "${newText}"`)
    
  } catch (err) {
    console.error('❌ 更新文字內容失敗:', err)
  }
}

/**
 * 重置文字內容
 */
function resetTextContent(): void {
  customText.value = 'ABC'
  updateTextContent()
  console.log('🔄 文字內容已重置為預設值')
}

/**
 * 更新文字偏移量
 */
function updateTextOffset(): void {
  if (!boneTracker) {
    console.log('⚠️ 骨骼追蹤器不存在，跳過偏移量更新')
    return
  }
  
  try {
    const offset: TextOffset = {
      x: Number(textOffsetX.value),
      y: Number(textOffsetY.value)
    }
    
    boneTracker.updateTextOffset(offset)
    console.log(`📍 文字偏移量已更新: X=${offset.x}px, Y=${offset.y}px`)
    
  } catch (err) {
    console.error('❌ 更新文字偏移量失敗:', err)
  }
}

/**
 * 設置文字偏移量預設值
 */
function setTextOffsetPreset(preset: 'top' | 'bottom' | 'left' | 'right' | 'center'): void {
  const presets = {
    top: { x: 0, y: -60 },      // 頭頂
    bottom: { x: 0, y: 80 },    // 腳下
    left: { x: -50, y: 20 },    // 左側
    right: { x: 50, y: 20 },    // 右側
    center: { x: 0, y: 0 }      // 中心
  }
  
  const selectedPreset = presets[preset]
  textOffsetX.value = selectedPreset.x
  textOffsetY.value = selectedPreset.y
  
  updateTextOffset()
  console.log(`🎯 文字偏移量預設已應用: ${preset} (X=${selectedPreset.x}, Y=${selectedPreset.y})`)
}

/**
 * 創建骨骼追蹤器
 */
function createBoneTracker(): void {
  if (!spine || !textResult) {
    console.error('❌ Spine 或文字物件不存在，無法創建骨骼追蹤器')
    return
  }

  try {
    boneTracker = createBoneTrackerUtil({
      textObject: textResult.textObject,
      spine,
      textOffset: {
        x: textOffsetX.value,
        y: textOffsetY.value
      },
      enableDebugLog: true,
      debugLogFrequency: 0.3
    })
    console.log('✅ 骨骼追蹤器創建成功')
  } catch (err) {
    console.error('❌ 創建骨骼追蹤器失敗:', err)
  }
}

/**
 * 切換文字跟隨軌道模式
 */
function toggleFollowing(): void {
  isFollowing.value = !isFollowing.value
  
  if (isFollowing.value) {
    console.log('🎯 啟用軌道跟隨模式')
    // 自動顯示文字
    if (!textVisible.value) {
      toggleText()
    }
  } else {
    console.log('🎯 停用軌道跟隨模式')
    stopTrackingAnimation()
  }
}

/**
 * 開始追蹤動畫軌道
 */
function startTrackingAnimation(): void {
  if (!spine || !textResult) {
    console.error('❌ Spine 或文字物件不存在，無法開始追蹤')
    return
  }
  
  // 停止之前的追蹤
  stopTrackingAnimation()
  
  console.log('🚀 開始追蹤動畫軌道')
  
  // 記錄初始位置
  const initialSpineX = spine.x
  const initialSpineY = spine.y
  
  function trackPosition() {
    if (!spine || !textResult || !isFollowing.value) {
      console.log('⏹️ 停止追蹤：條件不滿足')
      return
    }
    
    // 檢查動畫是否還在播放
    const isAnimating = spine.state?.tracks && spine.state.tracks.length > 0 && spine.state.tracks[0]
    
    if (isAnimating) {
      // 獲取角色當前位置
      const spineX = spine.x
      const spineY = spine.y
      
      // 更新文字位置（在角色底部稍微偏下）
      textResult.setTransform({
        x: spineX,
        y: spineY + 80
      })
      
      // 檢查位置是否有變化
      const deltaX = Math.abs(spineX - initialSpineX)
      const deltaY = Math.abs(spineY - initialSpineY)
      
      // 添加更詳細的調試信息
      console.log(`🔍 Spine位置: (${spineX.toFixed(1)}, ${spineY.toFixed(1)}) | 文字位置: (${textResult.textObject.x.toFixed(1)}, ${textResult.textObject.y.toFixed(1)}) | 變化: (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`)
      
      if (deltaX < 0.1 && deltaY < 0.1) {
        console.log('⚠️ Spine 容器位置沒有變化，這可能是原地動畫')
      }
      
      // 繼續追蹤
      trackingAnimationId = requestAnimationFrame(trackPosition)
    } else {
      console.log('✅ 動畫結束，停止追蹤')
      stopTrackingAnimation()
    }
  }
  
  // 開始追蹤循環
  trackPosition()
}

/**
 * 檢查骨骼位置
 */
function checkBonePositions(): void {
  if (!boneTracker) {
    console.error('❌ 骨骼追蹤器不存在')
    return
  }
  
  boneTracker.checkAllBonePositions()
}

/**
 * 切換骨骼追蹤模式
 */
function toggleBoneTracking(): void {
  isBoneTracking.value = !isBoneTracking.value
  
  if (isBoneTracking.value) {
    console.log('🦴 啟用骨骼追蹤模式')
    // 自動顯示文字
    if (!textVisible.value) {
      toggleText()
    }
    // 停止普通軌道追蹤
    if (isFollowing.value) {
      isFollowing.value = false
      stopTrackingAnimation()
    }
  } else {
    console.log('🦴 停用骨骼追蹤模式')
    if (boneTracker) {
      boneTracker.stopTracking()
    }
  }
}

/**
 * 檢測在動畫中移動的骨骼
 */
async function detectMovingBones(): Promise<void> {
  if (!boneTracker) {
    console.error('❌ 骨骼追蹤器不存在')
    return
  }
  
  const result = await boneTracker.detectMovingBones(2000, () => {
    playJumpAnimation()
  })
  
  console.log(`🎯 檢測完成，找到 ${result.movingBones.length} 個移動骨骼`)
}

/**
 * 停止追蹤動畫軌道
 */
function stopTrackingAnimation(): void {
  if (trackingAnimationId !== null) {
    cancelAnimationFrame(trackingAnimationId)
    trackingAnimationId = null
    console.log('⏹️ 軌道追蹤已停止')
  }
}

// 生命週期
onMounted(() => {
  init()
})

// 監聽素材包變化並重新初始化
watch(() => assetPackStore.currentPack, async (newPack, oldPack) => {
  if (oldPack && newPack !== oldPack) {
    console.log(`🎨 素材包切換: ${oldPack} → ${newPack}，重新初始化動畫`)
    
    // 停止當前所有活動
    stopTrackingAnimation()
    
    // 清理現有資源
    if (boneTracker) {
      boneTracker.dispose()
      boneTracker = null
    }
    
    if (textResult) {
      textResult.destroy()
      textResult = null
    }
    
    if (app) {
      app.destroy()
      app = null
      spine = null
    }
    
    // 重置狀態
    loading.value = true
    loaded.value = false
    error.value = false
    textVisible.value = false
    isFollowing.value = false
    isBoneTracking.value = false
    
    // 重新初始化
    await init()
  }
})

onUnmounted(() => {
  // 停止所有追蹤
  stopTrackingAnimation()
  
  // 清理骨骼追蹤器
  if (boneTracker) {
    boneTracker.dispose()
    boneTracker = null
  }
  
  if (textResult) {
    textResult.destroy()
    textResult = null
  }
    if (app) {
      app.destroy()
    app = null
    spine = null
    }
  console.log('🧹 資源已清理')
})
</script>

<style scoped>
canvas {
  background: linear-gradient(135deg, #2a2a4a 0%, #1a1a3a 100%);
}
</style>