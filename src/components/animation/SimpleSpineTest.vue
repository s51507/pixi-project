<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">🎮 Spine 動畫播放器</h3>
    
    <!-- 狀態顯示 -->
    <div class="mb-4">
      <div v-if="loading" class="flex items-center gap-2 text-blue-400">
        <div class="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        {{ status }}
      </div>
      <div v-else-if="error" class="text-red-400">
        ❌ {{ errorMessage }}
      </div>
      <div v-else-if="loaded" class="text-green-400">
        ✅ 動畫載入完成
      </div>
    </div>
    
    <!-- 動畫控制 -->
    <div v-if="loaded && animations.length > 0" class="mb-4 space-y-4">
      <!-- 動畫選擇 -->
      <div>
        <label class="block text-sm font-medium mb-2">選擇動畫:</label>
        <select 
          v-model="selectedAnim" 
          @change="playAnimation(selectedAnim)"
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        >
          <option v-for="anim in animations" :key="anim" :value="anim">
            {{ anim }}
          </option>
        </select>
      </div>
      
      <!-- 播放控制 -->
      <div class="flex gap-2">
        <button 
          @click="playAnimation(selectedAnim)"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
        >
          ▶️ 播放
        </button>
        <button 
          @click="stopAnimation"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          ⏹️ 停止
        </button>
        <button 
          @click="resetTransform"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          🔄 重置
        </button>
        <button 
          @click="randomTransform"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
        >
          🎲 隨機
        </button>
        <button 
          @click="toggleFloating"
          :class="[
            'px-4 py-2 rounded-md transition-colors',
            isFloating ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
          ]"
        >
          {{ isFloating ? '🌊 停止漂浮' : '🌊 漂浮效果' }}
        </button>
        <button 
          @click="triggerShake"
          :class="[
            'px-4 py-2 rounded-md transition-colors',
            isShaking 
              ? 'bg-red-600 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700'
          ]"
          :disabled="isShaking"
        >
          {{ isShaking ? '🚀 震動中...' : '🚀 起飛震動' }}
        </button>
      </div>

      <!-- 變換控制 -->
      <div class="bg-gray-700 rounded-lg p-4 space-y-3">
        <h4 class="text-sm font-medium text-gray-300">🎛️ 變換控制</h4>
        
        <!-- 縮放控制 -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">
            縮放: {{ Number(scale).toFixed(2) }}x
          </label>
          <input 
            type="range" 
            v-model="scale" 
            @input="updateTransform"
            min="0.1" 
            max="3" 
            step="0.1"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1x</span>
            <span>3.0x</span>
          </div>
        </div>

        <!-- 位置控制 -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">
              X 位置: {{ Number(offsetX) }}
            </label>
            <input 
              type="range" 
              v-model="offsetX" 
              @input="updateTransform"
              min="-400" 
              max="400" 
              step="1"
              class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">
              Y 位置: {{ Number(offsetY) }}
            </label>
            <input 
              type="range" 
              v-model="offsetY" 
              @input="updateTransform"
              min="-300" 
              max="300" 
              step="1"
              class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>
        </div>

        <!-- 旋轉控制 -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">
            旋轉: {{ Number(rotation) }}°
          </label>
          <input 
            type="range" 
            v-model="rotation" 
            @input="updateTransform"
            min="-180" 
            max="180" 
            step="5"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>-180°</span>
            <span>+180°</span>
          </div>
        </div>

        <!-- 翻轉控制 -->
        <div>
          <label class="block text-xs text-gray-400 mb-2">翻轉控制</label>
          <button 
            @click="flipX = !flipX; updateTransform()"
            :class="[
              'w-full px-3 py-2 rounded-md text-xs font-medium transition-colors',
              flipX 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            ]"
          >
            {{ flipX ? '🔄 已翻轉' : '↔️ 水平翻轉' }}
          </button>
        </div>

        <!-- 速度控制 -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">
            播放速度: {{ speedDisplay }}x
          </label>
          <input 
            type="range" 
            v-model="animationSpeed" 
            @input="updateSpeed"
            min="0.1" 
            max="3" 
            step="0.1"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1x</span>
            <span>1.0x</span>
            <span>3.0x</span>
          </div>
        </div>

        <!-- 漂浮效果控制 -->
        <div v-if="isFloating" class="bg-gray-800 rounded-lg p-3 space-y-2">
          <h5 class="text-xs font-medium text-yellow-300">🌊 漂浮設置</h5>
          
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-gray-400 mb-1">
                漂浮範圍: {{ floatRangeDisplay }}px
              </label>
              <input 
                type="range" 
                v-model="floatRange" 
                min="5" 
                max="50" 
                step="5"
                class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              >
            </div>
            <div>
              <label class="block text-gray-400 mb-1">
                漂浮速度: {{ floatSpeedDisplay }}x
              </label>
              <input 
                type="range" 
                v-model="floatSpeed" 
                min="0.3" 
                max="3" 
                step="0.1"
                class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              >
            </div>
          </div>
        </div>

      <!-- 震動效果設置 -->
      <div class="bg-gray-800 rounded-lg p-3 space-y-2">
        <h5 class="text-xs font-medium text-orange-300">🚀 震動設置</h5>
        
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block text-gray-400 mb-1">
              震動強度: {{ shakeIntensityDisplay }}px
            </label>
            <input 
              type="range" 
              v-model="shakeIntensity" 
              min="5" 
              max="30" 
              step="1"
              class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>
          <div>
            <label class="block text-gray-400 mb-1">
              持續時間: {{ shakeDurationDisplay }}ms
            </label>
            <input 
              type="range" 
              v-model="shakeDuration" 
              min="1000" 
              max="5000" 
              step="250"
              class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>
        </div>
      </div>

      </div>
    </div>
    
    <!-- Canvas -->
    <div class="border border-gray-600 rounded-lg overflow-hidden">
      <canvas ref="canvasRef" class="block"></canvas>
    </div>
    
    <!-- 調試日誌 -->
    <div v-if="debugLog.length > 0" class="mt-4">
      <details class="bg-gray-900 rounded-lg p-3">
        <summary class="cursor-pointer text-sm font-medium text-gray-300">
          調試日誌 ({{ debugLog.length }} 條)
        </summary>
        <div class="mt-2 max-h-40 overflow-y-auto text-xs font-mono text-gray-400 space-y-1">
          <div v-for="(log, index) in debugLog" :key="index" class="whitespace-pre-wrap">
            {{ log }}
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as PIXI from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v8'

interface Props {
  atlasPath: string
  imagePath: string
  skelPath: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600
})

// 狀態
const loading = ref(true)
const loaded = ref(false)
const error = ref(false)
const errorMessage = ref('')
const status = ref('初始化...')

// PIXI 和 Spine
const canvasRef = ref<HTMLCanvasElement>()
let app: PIXI.Application | null = null
let spine: any = null

// 動畫控制
const animations = ref<string[]>([])
const selectedAnim = ref('')

// 變換控制
const scale = ref(0.3)
const offsetX = ref(0) 
const offsetY = ref(0) 
const rotation = ref(0)
const animationSpeed = ref(1.0)
const flipX = ref(false)

// 漂浮效果控制
const isFloating = ref(false)
const floatRange = ref(20)
const floatSpeed = ref(1.0)
let floatAnimationId: number | null = null

// 起飛震動效果狀態
const isShaking = ref(false)
const shakeIntensity = ref(15)
const shakeDuration = ref(2000)
let shakeAnimationId: number | null = null

// 調試
const debugLog = ref<string[]>([])

// 計算屬性
const speedDisplay = computed(() => Number(animationSpeed.value).toFixed(1))
const floatRangeDisplay = computed(() => Number(floatRange.value))
const floatSpeedDisplay = computed(() => Number(floatSpeed.value).toFixed(1))
const shakeIntensityDisplay = computed(() => Number(shakeIntensity.value))
const shakeDurationDisplay = computed(() => Number(shakeDuration.value))

function log(message: string, ...args: any[]): void {
  console.log(message, ...args)
  debugLog.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
  if (debugLog.value.length > 50) {
    debugLog.value = debugLog.value.slice(-30) // 只保留最後 30 條
  }
}

async function init(): Promise<void> {
  try {
    if (!canvasRef.value) {
      throw new Error('Canvas 元素未找到')
    }

    log('=== 開始 Spine 動畫初始化 ===')
    log(`PIXI 版本: ${PIXI.VERSION}`)
    
    // 檢查瀏覽器支援
    const hasWebGL = !!window.WebGLRenderingContext
    const hasWebGPU = !!navigator.gpu
    log(`WebGL 支援: ${hasWebGL}`)
    log(`WebGPU 支援: ${hasWebGPU}`)
    
    if (hasWebGPU) {
      try {
        const adapter = await navigator.gpu.requestAdapter()
        log(`WebGPU 適配器: ${adapter ? '可用' : '不可用'}`)
      } catch (e) {
        log(`WebGPU 檢查失敗: ${e}`)
      }
    }

    // 1. 創建 PIXI 應用
    status.value = '創建 PIXI 應用...'
    app = new PIXI.Application()
    await app.init({
      canvas: canvasRef.value,
      width: props.width,
      height: props.height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      preference: hasWebGPU ? 'webgpu' : 'webgl' // 優先使用 WebGPU，回退到 WebGL
    })
    log('✅ PIXI 應用創建成功')
    log(`渲染器類型代碼: ${app.renderer.type}`)
    log(`渲染器名稱: ${app.renderer.name}`)
    
    // 檢查 PIXI 渲染器類型常量
    log('PIXI 渲染器類型常量:')
    log(`- WEBGL: ${PIXI.RendererType.WEBGL}`)
    log(`- WEBGPU: ${PIXI.RendererType.WEBGPU}`)
    
    const rendererTypes = {
      [PIXI.RendererType.WEBGL]: 'WebGL', 
      [PIXI.RendererType.WEBGPU]: 'WebGPU',
    }
    
    const rendererTypeName = rendererTypes[app.renderer.type as keyof typeof rendererTypes] || `未知類型(${app.renderer.type})`
    log(`渲染器類型: ${rendererTypeName}`)
    
    // 顯示渲染器的額外信息
    if (app.renderer.type === PIXI.RendererType.WEBGPU) {
      log('🚀 使用最新的 WebGPU 渲染器！')
    } else if (app.renderer.type === PIXI.RendererType.WEBGL) {
      log('📊 使用穩定的 WebGL 渲染器')
    } else {
      log(`❓ 使用未知的渲染器類型: ${app.renderer.type}`)
    }

    // 2. 預載入資源（必要步驟，即使使用路徑對象也需要）
    status.value = '預載入資源...'
    const skelKey = `skel-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const atlasKey = `atlas-${Date.now()}-${Math.random().toString(36).slice(2)}`
    
    log('註冊並載入資源到緩存...')
    PIXI.Assets.add({ alias: skelKey, src: props.skelPath })
    PIXI.Assets.add({ alias: atlasKey, src: props.atlasPath })
    await PIXI.Assets.load([skelKey, atlasKey])
    log('✅ 資源預載入完成')
    
    // 3. 創建 Spine 動畫（使用路徑對象，但依賴緩存）
    status.value = '創建 Spine 動畫...'
    log('創建 Spine 動畫...')
    
    spine = await Spine.from({
      skeleton: props.skelPath,
      atlas: props.atlasPath
    })
    log('✅ Spine 創建成功')
    
    // 4. 設置 Spine
    status.value = '設置動畫...'
    // 應用初始變換
    updateTransform()
    
    // 5. 獲取動畫列表
    log('檢查 Spine 對象結構:', spine)
    
    if (spine && spine.skeleton && spine.skeleton.data && spine.skeleton.data.animations) {
      animations.value = spine.skeleton.data.animations.map((a: any) => a.name)
      log(`動畫列表: ${animations.value.join(', ')}`)
    } else {
      log('⚠️ 無法找到動畫數據，檢查 spine 對象:')
      log('- spine:', !!spine)
      log('- spine.skeleton:', !!spine?.skeleton)
      log('- spine.skeleton.data:', !!spine?.skeleton?.data)
      log('- spine.skeleton.data.animations:', !!spine?.skeleton?.data?.animations)
      
      // 嘗試其他可能的路徑
      if (spine?.spineData?.animations) {
        animations.value = spine.spineData.animations.map((a: any) => a.name)
        log(`從 spineData 找到動畫列表: ${animations.value.join(', ')}`)
      } else if (spine?.state?.data?.skeletonData?.animations) {
        animations.value = spine.state.data.skeletonData.animations.map((a: any) => a.name)
        log(`從 state.data.skeletonData 找到動畫列表: ${animations.value.join(', ')}`)
      } else {
        log('❌ 未找到任何動畫數據')
        // 輸出完整的 spine 對象結構用於調試
        console.log('完整 spine 對象:', spine)
      }
    }
    
    // 6. 添加到舞台
    app.stage.addChild(spine)
    log('✅ 添加到舞台成功')
    
    // 7. 播放第一個動畫
    if (animations.value.length > 0) {
      selectedAnim.value = animations.value[0]
      playAnimation(selectedAnim.value)
      // 確保初始速度生效
      updateSpeed()
    }
    
    loaded.value = true
    log('🎉 初始化完成！')
    
  } catch (err) {
    log(`💥 錯誤: ${err}`)
    error.value = true
    errorMessage.value = String(err)
  } finally {
    loading.value = false
  }
}

function playAnimation(animName: string): void {
  if (!spine || !animName) {
    log('❌ 無法播放動畫: spine 或 animName 為空')
    return
  }
  
  try {
    log(`播放動畫: ${animName}`)
    
    // 檢查 state 是否存在
    if (!spine.state) {
      log('❌ spine.state 不存在')
      console.log('spine 對象:', spine)
      return
    }
    
    spine.state.setAnimation(0, animName, true)
    // 應用當前速度設置
    spine.state.timeScale = Number(animationSpeed.value)
    log('✅ 動畫設置成功')
  } catch (err) {
    log(`❌ 播放動畫失敗: ${err}`)
    console.log('播放動畫時的 spine 對象:', spine)
  }
}

function stopAnimation(): void {
  if (!spine) return
  
  try {
    log('停止動畫')
    spine.state.clearTracks()
    log('✅ 動畫停止成功')
  } catch (err) {
    log(`❌ 停止動畫失敗: ${err}`)
  }
}

// 變換控制函數
function updateTransform(): void {
  if (!spine) return
  
  try {
    // 如果漂浮效果正在運行，重新啟動以使用新的基準位置
    if (isFloating.value) {
      startFloating()
    } else {
      // 更新位置
      spine.x = (props.width / 2) + Number(offsetX.value)
      spine.y = (props.height / 2) + Number(offsetY.value)
      
      // 更新縮放和翻轉
      const scaleValue = Number(scale.value)
      const xScale = flipX.value ? -scaleValue : scaleValue
      spine.scale.set(xScale, scaleValue)
      
      // 更新旋轉 (轉換為弧度)
      spine.rotation = (Number(rotation.value) * Math.PI) / 180
    }
    
    // 縮放不受漂浮影響，總是更新（包括翻轉）
    const scaleValue = Number(scale.value)
    const xScale = flipX.value ? -scaleValue : scaleValue
    spine.scale.set(xScale, scaleValue)
    
    log(`變換更新: 位置(${spine.x}, ${spine.y}), 縮放(${xScale}, ${scaleValue}), 旋轉(${rotation.value}°), 翻轉: ${flipX.value}`)
  } catch (err) {
    log(`❌ 變換更新失敗: ${err}`)
  }
}

function updateSpeed(): void {
  if (!spine || !spine.state) return
  
  try {
    spine.state.timeScale = Number(animationSpeed.value)
    log(`速度更新: ${animationSpeed.value}x`)
  } catch (err) {
    log(`❌ 速度更新失敗: ${err}`)
  }
}

function resetTransform(): void {
  scale.value = 0.3
  offsetX.value = 0
  offsetY.value = 0
  rotation.value = 0
  animationSpeed.value = 1.0
  flipX.value = false
  
  // 停止漂浮效果
  if (isFloating.value) {
    isFloating.value = false
    stopFloating()
  }
  
  // 停止震動效果
  if (isShaking.value) {
    isShaking.value = false
    stopShaking()
  }
  
  updateTransform()
  updateSpeed()
  log('🔄 所有設置已重置')
}

function randomTransform(): void {
  scale.value = Math.random() * 2 + 0.5 // 0.5 - 2.5
  offsetX.value = Math.random() * 600 - 300 // -300 to 300
  offsetY.value = Math.random() * 400 - 200 // -200 to 200  
  rotation.value = Math.random() * 360 - 180 // -180 to 180
  animationSpeed.value = Math.random() * 2.5 + 0.3 // 0.3 - 2.8
  flipX.value = Math.random() > 0.5 // 50% 機率翻轉
  updateTransform()
  updateSpeed()
  log('🎲 隨機變換和速度已應用（包含翻轉）')
}

// 漂浮效果相關函數
function toggleFloating(): void {
  isFloating.value = !isFloating.value
  
  if (isFloating.value) {
    startFloating()
    log('🌊 漂浮效果已啟動')
  } else {
    stopFloating()
    log('🌊 漂浮效果已停止')
  }
}

function startFloating(): void {
  if (!spine) return
  
  stopFloating() // 確保沒有重複的動畫
  
  const baseX = (props.width / 2) + Number(offsetX.value)
  const baseY = (props.height / 2) + Number(offsetY.value)
  let startTime = Date.now()
  
  function animate() {
    if (!isFloating.value || !spine) return
    
    const elapsed = (Date.now() - startTime) * Number(floatSpeed.value) / 1000
    const range = Number(floatRange.value)
    
    // 使用不同的正弦波創建自然的漂浮效果
    const floatX = Math.sin(elapsed * 1.2) * range * 0.8
    const floatY = Math.cos(elapsed * 0.8) * range
    const floatRotation = Math.sin(elapsed * 1.5) * 5 // 輕微的旋轉晃動
    
    // 應用漂浮偏移
    spine.x = baseX + floatX
    spine.y = baseY + floatY
    spine.rotation = ((Number(rotation.value) + floatRotation) * Math.PI) / 180
    
    floatAnimationId = requestAnimationFrame(animate)
  }
  
  animate()
}

function stopFloating(): void {
  if (floatAnimationId !== null) {
    cancelAnimationFrame(floatAnimationId)
    floatAnimationId = null
  }
  
  // 恢復到原始位置
  if (spine) {
    updateTransform()
  }
}

// 震動效果函數
function triggerShake(): void {
  if (!spine) {
    log('❌ spine 實例不存在，無法震動')
    return
  }
  
  log(`🚀 開始震動 - 強度: ${Number(shakeIntensity.value)}, 持續: ${Number(shakeDuration.value)}ms`)
  
  // 震動期間停止漂浮效果避免干擾
  const wasFloating = isFloating.value
  if (wasFloating) {
    stopFloating()
  }
  
  // 先停止之前的震動動畫（不改變狀態）
  if (shakeAnimationId) {
    cancelAnimationFrame(shakeAnimationId)
    shakeAnimationId = null
  }
  
  isShaking.value = true
  
  const startTime = Date.now()
  const duration = Number(shakeDuration.value)
  
  function animate() {
    if (!isShaking.value || !spine) {
      log('⚠️ 震動被中斷')
      return
    }
    
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration
    
    if (progress >= 1) {
      // 震動結束，恢復原位
      log('✅ 震動結束，恢復原位')
      stopShaking()
      updateTransform() // 恢復正常變換
      
      // 如果之前有漂浮效果，重新啟動
      if (wasFloating) {
        isFloating.value = true
        startFloating()
      }
      return
    }
    
    // 震動強度隨時間遞減（模擬引擎點火到穩定的過程）
    const intensityFactor = Math.max(0.2, 1 - progress * 0.5) // 調整衰減曲線
    const intensity = Number(shakeIntensity.value) * intensityFactor
    
    // 使用高頻隨機震動
    const shakeX = (Math.random() - 0.5) * intensity * 3 // 增強震動幅度
    const shakeY = (Math.random() - 0.5) * intensity * 3
    const shakeRotation = (Math.random() - 0.5) * intensity * 0.8 // 增強旋轉震動
    
    // 基礎位置
    const baseX = (props.width / 2) + Number(offsetX.value)
    const baseY = (props.height / 2) + Number(offsetY.value)
    
    // 應用震動
    const newX = baseX + shakeX
    const newY = baseY + shakeY
    const newRotation = ((Number(rotation.value) + shakeRotation) * Math.PI) / 180
    
    spine.x = newX
    spine.y = newY
    spine.rotation = newRotation
    
    // 應用縮放和翻轉
    const scaleValue = Number(scale.value)
    const xScale = flipX.value ? -scaleValue : scaleValue
    spine.scale.set(xScale, scaleValue)
    
    // 每隔一段時間輸出調試信息
    if (Math.floor(elapsed / 100) !== Math.floor((elapsed - 16) / 100)) {
      log(`🔥 震動中 - 進度: ${(progress * 100).toFixed(1)}%, 強度: ${intensity.toFixed(1)}, 位置: (${newX.toFixed(1)}, ${newY.toFixed(1)})`)
    }
    
    shakeAnimationId = requestAnimationFrame(animate)
  }
  
  animate()
}

function stopShaking(): void {
  if (shakeAnimationId) {
    cancelAnimationFrame(shakeAnimationId)
    shakeAnimationId = null
  }
  isShaking.value = false
}



onMounted(() => {
  init()
})

onUnmounted(() => {
  // 清理漂浮動畫
  stopFloating()
  // 清理震動動畫
  stopShaking()
  
  if (app) {
    app.destroy()
    app = null
    spine = null
  }
})
</script>

<style scoped>
/* 自定義滑桿樣式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #4f46e5;
  transform: scale(1.1);
}

.slider::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: #374151;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: #374151;
}
</style>