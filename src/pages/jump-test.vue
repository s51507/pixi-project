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
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as PIXI from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v8'
import { createBoneTracker as createBoneTrackerUtil, type BoneTracker } from '@/utils/pixi/boneTracker'

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
let textObject: PIXI.Text | null = null

// 文字控制
const textVisible = ref(false)
const isFollowing = ref(false)
const isBoneTracking = ref(false)

// 軌道追蹤
let trackingAnimationId: number | null = null

// 骨骼追蹤器
let boneTracker: BoneTracker | null = null

// 跳躍動畫資源路徑
const JUMP_ANIMATION = {
  atlasPath: '/cashorcrash2/spine/me-default1-jump_v3/skeleton.atlas',
  imagePath: '/cashorcrash2/spine/me-default1-jump_v3/skeleton.png',
  skelPath: '/cashorcrash2/spine/me-default1-jump_v3/skeleton.skel'
}

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
    
    PIXI.Assets.add({ alias: skelKey, src: JUMP_ANIMATION.skelPath })
    PIXI.Assets.add({ alias: atlasKey, src: JUMP_ANIMATION.atlasPath })
    await PIXI.Assets.load([skelKey, atlasKey])
    console.log('✅ 跳躍動畫資源載入完成')
    
    // 3. 創建 Spine 跳躍角色
    status.value = '創建 Spine 角色...'
    spine = await Spine.from({
      skeleton: JUMP_ANIMATION.skelPath,
      atlas: JUMP_ANIMATION.atlasPath
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
    
    // 創建文字樣式
    const textStyle = new PIXI.TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 32,
      fill: 0xffffff,
      stroke: {
        color: 0x000000,
        width: 2
      },
      dropShadow: {
        color: 0x000000,
        blur: 4,
        angle: Math.PI / 6,
        distance: 6,
      },
      wordWrap: true,
      wordWrapWidth: 440,
    })
    
    // 創建文字物件
    textObject = new PIXI.Text({
      text: 'ABC',
      style: textStyle
    })
    
    // 設置文字位置（在角色旁邊）
    textObject.x = app.screen.width / 2
    textObject.y = app.screen.height / 2 - 50  // 在角色上方一點
    textObject.anchor.set(0.5, 0.5) // 居中對齊
    textObject.visible = false // 預設隱藏
    textObject.zIndex = 10 // 確保在最上層
    
    // 添加到舞台
    app.stage.addChild(textObject)
    app.stage.sortChildren() // 確保 zIndex 生效
    
    console.log('✅ 文字物件創建成功:', textObject.text)
    
  } catch (err) {
    console.error('❌ 創建文字物件失敗:', err)
  }
}

/**
 * 切換文字顯示/隱藏
 */
function toggleText(): void {
  if (!textObject) {
    console.error('❌ 文字物件不存在')
    return
  }
  
  try {
    textVisible.value = !textVisible.value
    textObject.visible = textVisible.value
    
    console.log(`📝 文字${textVisible.value ? '顯示' : '隱藏'}:`, textObject.text)
    
  } catch (err) {
    console.error('❌ 切換文字顯示失敗:', err)
  }
}

/**
 * 創建骨骼追蹤器
 */
function createBoneTracker(): void {
  if (!spine || !textObject) {
    console.error('❌ Spine 或文字物件不存在，無法創建骨骼追蹤器')
    return
  }

  try {
    boneTracker = createBoneTrackerUtil({
      textObject,
      spine,
      textOffsetY: 60,
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
  if (!spine || !textObject) {
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
    if (!spine || !textObject || !isFollowing.value) {
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
      textObject.x = spineX
      textObject.y = spineY + 80  // 在角色底部
      
      // 檢查位置是否有變化
      const deltaX = Math.abs(spineX - initialSpineX)
      const deltaY = Math.abs(spineY - initialSpineY)
      
      // 添加更詳細的調試信息
      console.log(`🔍 Spine位置: (${spineX.toFixed(1)}, ${spineY.toFixed(1)}) | 文字位置: (${textObject.x.toFixed(1)}, ${textObject.y.toFixed(1)}) | 變化: (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`)
      
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

onUnmounted(() => {
  // 停止所有追蹤
  stopTrackingAnimation()
  
  // 清理骨骼追蹤器
  if (boneTracker) {
    boneTracker.dispose()
    boneTracker = null
  }
  
  if (textObject && app) {
    app.stage.removeChild(textObject)
    textObject = null
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