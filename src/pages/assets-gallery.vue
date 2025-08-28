<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 頁面標題 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">🎨 CashOrCrash2 資源庫</h1>
        <p class="text-gray-400">
          探索項目中的所有靜態資源，包含圖片、音效和動畫文件
        </p>
      </div>

      <!-- 資源統計 -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-600/30 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🖼️</span>
            <h3 class="text-lg font-semibold text-blue-300">AVIF 圖片</h3>
          </div>
          <p class="text-3xl font-bold text-blue-400">{{ imageFiles.length }}</p>
          <p class="text-sm text-gray-400 mt-1">高壓縮比的現代圖片格式</p>
        </div>

        <div class="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-600/30 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🎵</span>
            <h3 class="text-lg font-semibold text-green-300">MP3 音效</h3>
          </div>
          <p class="text-3xl font-bold text-green-400">{{ audioFiles.length }}</p>
          <p class="text-sm text-gray-400 mt-1">遊戲音效和背景音樂</p>
        </div>

        <div class="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-600/30 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🦴</span>
            <h3 class="text-lg font-semibold text-purple-300">Spine 動畫</h3>
          </div>
          <p class="text-3xl font-bold text-purple-400">{{ spineAnimations.length }}</p>
          <p class="text-sm text-gray-400 mt-1">骨骼動畫文件集合</p>
        </div>
      </div>

      <!-- 分類選項 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="activeCategory = category.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeCategory === category.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>

      <!-- 圖片資源展示 -->
      <div v-if="activeCategory === 'images'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">🖼️ AVIF 圖片資源</h2>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-400">搜尋:</label>
            <input 
              v-model="imageSearch"
              type="text" 
              placeholder="輸入關鍵字..."
              class="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="image in filteredImages" 
            :key="image.name"
            class="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer group"
            @click="selectedImage = image"
          >
            <div class="aspect-square bg-gray-700 rounded mb-2 overflow-hidden">
              <img 
                :src="image.path" 
                :alt="image.name"
                class="w-full h-full object-contain group-hover:scale-105 transition-transform"
                @error="onImageError"
                loading="lazy"
              >
            </div>
            <p class="text-xs text-gray-300 truncate">{{ image.displayName }}</p>
            <p class="text-xs text-gray-500">{{ image.category }}</p>
          </div>
        </div>

        <div v-if="filteredImages.length === 0" class="text-center py-12 text-gray-500">
          沒有找到匹配的圖片資源
        </div>
      </div>

      <!-- 音效資源展示 -->
      <div v-if="activeCategory === 'audio'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">🎵 MP3 音效資源</h2>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-400">搜尋:</label>
            <input 
              v-model="audioSearch"
              type="text" 
              placeholder="輸入關鍵字..."
              class="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            >
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="audio in filteredAudio" 
            :key="audio.name"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">{{ audio.icon }}</span>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-white truncate">{{ audio.displayName }}</h3>
                <p class="text-sm text-gray-400">{{ audio.category }}</p>
              </div>
            </div>
            
            <audio 
              :src="audio.path" 
              controls 
              preload="none"
              class="w-full h-8"
              style="filter: invert(1) hue-rotate(180deg);"
            >
              您的瀏覽器不支援音頻播放
            </audio>
            
            <p class="text-xs text-gray-500 mt-2">{{ audio.description }}</p>
          </div>
        </div>

        <div v-if="filteredAudio.length === 0" class="text-center py-12 text-gray-500">
          沒有找到匹配的音效資源
        </div>
      </div>

      <!-- Spine 動畫展示 -->
      <div v-if="activeCategory === 'spine'" class="space-y-6">
        <h2 class="text-xl font-semibold">🦴 Spine 動畫資源</h2>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="spine in spineAnimations" 
            :key="spine.name"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">{{ spine.icon }}</span>
              <div class="flex-1">
                <h3 class="font-medium text-white">{{ spine.displayName }}</h3>
                <p class="text-sm text-gray-400">{{ spine.description }}</p>
              </div>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">骨骼文件:</span>
                <span class="text-green-400">{{ spine.skelFile }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Atlas 文件:</span>
                <span class="text-blue-400">{{ spine.atlasFile }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">紋理文件:</span>
                <span class="text-purple-400">{{ spine.textureFile }}</span>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-gray-600">
              <RouterLink 
                :to="`/spine-showcase?anim=${spine.name}`"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                在播放器中查看 →
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 資源使用說明 -->
      <div v-if="activeCategory === 'usage'" class="space-y-6">
        <h2 class="text-xl font-semibold">📋 資源使用指南</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-300 mb-4">🖼️ 圖片資源</h3>
            <div class="space-y-3 text-sm">
              <div>
                <h4 class="font-medium text-white mb-1">AVIF 格式優勢</h4>
                <p class="text-gray-300">提供比 JPEG 和 WebP 更好的壓縮率，文件更小，加載更快</p>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">使用方式</h4>
                <code class="text-green-400 bg-gray-900 px-2 py-1 rounded text-xs">
                  &lt;img src="/cashorcrash2/avif/assets/filename.avif" /&gt;
                </code>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">主要分類</h4>
                <p class="text-gray-300">UI 元件、背景、特效、角色、道具等遊戲視覺資源</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-green-300 mb-4">🎵 音效資源</h3>
            <div class="space-y-3 text-sm">
              <div>
                <h4 class="font-medium text-white mb-1">音效分類</h4>
                <p class="text-gray-300">背景音樂、UI 音效、遊戲音效、語音提示等</p>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">使用方式</h4>
                <code class="text-green-400 bg-gray-900 px-2 py-1 rounded text-xs">
                  new Audio('/cashorcrash2/mp3/assets/filename.mp3')
                </code>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">整合建議</h4>
                <p class="text-gray-300">配合動畫事件觸發，創造沉浸式的遊戲體驗</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-purple-300 mb-4">🦴 Spine 動畫</h3>
            <div class="space-y-3 text-sm">
              <div>
                <h4 class="font-medium text-white mb-1">文件結構</h4>
                <p class="text-gray-300">.skel (骨骼)、.atlas (紋理映射)、.png (紋理圖片)</p>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">使用方式</h4>
                <code class="text-green-400 bg-gray-900 px-2 py-1 rounded text-xs">
                  createSpineAnimation({ skelPath, atlasPath })
                </code>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">動畫特色</h4>
                <p class="text-gray-300">流暢的骨骼動畫，支援多種狀態和過渡效果</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-300 mb-4">🎬 整合場景</h3>
            <div class="space-y-3 text-sm">
              <div>
                <h4 class="font-medium text-white mb-1">資源組合</h4>
                <p class="text-gray-300">將圖片、音效、動畫組合成完整的遊戲場景</p>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">同步控制</h4>
                <p class="text-gray-300">使用時間軸管理不同資源的播放時機</p>
              </div>
              <div>
                <h4 class="font-medium text-white mb-1">性能優化</h4>
                <p class="text-gray-300">按需載入資源，避免記憶體浪費</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回連結 -->
      <div class="mt-12 text-center">
        <RouterLink 
          to="/" 
          class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
        >
          ← 返回主頁
        </RouterLink>
      </div>
    </div>

    <!-- 圖片預覽彈窗 -->
    <div 
      v-if="selectedImage" 
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click="selectedImage = null"
    >
      <div class="max-w-4xl max-h-full bg-gray-800 rounded-lg overflow-hidden" @click.stop>
        <div class="p-4 border-b border-gray-600">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ selectedImage.displayName }}</h3>
            <button 
              @click="selectedImage = null"
              class="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p class="text-sm text-gray-400 mt-1">{{ selectedImage.category }}</p>
        </div>
        <div class="p-4">
          <img 
            :src="selectedImage.path" 
            :alt="selectedImage.name"
            class="max-w-full max-h-96 mx-auto object-contain"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

// 分類選項
const categories = [
  { id: 'images', name: '圖片資源', icon: '🖼️' },
  { id: 'audio', name: '音效資源', icon: '🎵' },
  { id: 'spine', name: 'Spine 動畫', icon: '🦴' },
  { id: 'usage', name: '使用指南', icon: '📋' }
]

const activeCategory = ref('images')
const imageSearch = ref('')
const audioSearch = ref('')
const selectedImage = ref<ImageResource | null>(null)

// 類型定義
interface ImageResource {
  name: string
  displayName: string
  path: string
  category: string
}

interface AudioResource {
  name: string
  displayName: string
  path: string
  category: string
  icon: string
  description: string
}

interface SpineResource {
  name: string
  displayName: string
  description: string
  icon: string
  skelFile: string
  atlasFile: string
  textureFile: string
}

// 圖片資源數據
const imageFiles: ImageResource[] = [
  // UI 元件
  { name: 'auto_btn', displayName: '自動按鈕', path: '/cashorcrash2/avif/assets/auto_btn-C1gkCpkL.avif', category: 'UI 元件' },
  { name: 'popUp_button', displayName: '彈窗按鈕', path: '/cashorcrash2/avif/assets/popUp_button-Cg0SOdCO.avif', category: 'UI 元件' },
  { name: 'sound_icon', displayName: '音效圖標', path: '/cashorcrash2/avif/assets/sound_icon-BzrAZiwd.avif', category: 'UI 元件' },
  { name: 'boost_pressed', displayName: '加速按鈕', path: '/cashorcrash2/avif/assets/boost_pressed-D_rVqV-8.avif', category: 'UI 元件' },
  
  // 背景元素
  { name: 'horizon', displayName: '地平線', path: '/cashorcrash2/avif/assets/horizon-ddpSJfpk.avif', category: '背景元素' },
  { name: 'boostBg', displayName: '加速背景', path: '/cashorcrash2/avif/assets/boostBg-DW-l0ynO.avif', category: '背景元素' },
  { name: 'diagramBg', displayName: '圖表背景', path: '/cashorcrash2/avif/assets/diagramBg-BwJWoQve.avif', category: '背景元素' },
  { name: 'skins_bg_active', displayName: '皮膚背景', path: '/cashorcrash2/avif/assets/skins_bg_active-BLRQO9Ux.avif', category: '背景元素' },
  
  // 特效元素
  { name: 'bonus_light', displayName: '獎勵光效', path: '/cashorcrash2/avif/assets/bonus_light-Cu4TCLyK.avif', category: '特效元素' },
  { name: 'bonus_time', displayName: '獎勵時間', path: '/cashorcrash2/avif/assets/bonus_time-DbFuewU0.avif', category: '特效元素' },
  { name: 'multiplierX10', displayName: '10倍乘數', path: '/cashorcrash2/avif/assets/multiplierX10-Ce62ig_P.avif', category: '特效元素' },
  
  // 角色元素
  { name: 'default1_full', displayName: '預設角色', path: '/cashorcrash2/avif/assets/default1_full-D7I8VrNi.avif', category: '角色元素' },
  { name: 'rare', displayName: '稀有角色', path: '/cashorcrash2/avif/assets/rare-DjZDV1WT.avif', category: '角色元素' },
  { name: 'common', displayName: '普通角色', path: '/cashorcrash2/avif/assets/common-C0-QEBFp.avif', category: '角色元素' },
  
  // 道具元素
  { name: 'locker', displayName: '鎖定道具', path: '/cashorcrash2/avif/assets/locker-eT2g1lBH.avif', category: '道具元素' },
  { name: 'you_got', displayName: '獲得提示', path: '/cashorcrash2/avif/assets/you_got-Cck-STMY.avif', category: '道具元素' },
  { name: 'unlocked_item_bg', displayName: '解鎖道具背景', path: '/cashorcrash2/avif/assets/unlocked_item_bg-DccZyiCC.avif', category: '道具元素' },
  { name: 'timeFreeze_disable', displayName: '時間凍結禁用', path: '/cashorcrash2/avif/assets/timeFreeze_disable-DvHOp30K.avif', category: '道具元素' },
]

// 音效資源數據
const audioFiles: AudioResource[] = [
  // 背景音樂
  { name: 'bgm_fly', displayName: '飛行背景音樂', path: '/cashorcrash2/mp3/assets/bgm_fly-DX4muDxO.mp3', category: '背景音樂', icon: '🎼', description: '火箭飛行時的背景音樂' },
  { name: 'bgm_open', displayName: '開場背景音樂', path: '/cashorcrash2/mp3/assets/bgm_open-DYI02Dgc.mp3', category: '背景音樂', icon: '🎼', description: '遊戲開始時的背景音樂' },
  
  // 火箭音效
  { name: 'rocket_explode', displayName: '火箭爆炸', path: '/cashorcrash2/mp3/assets/rocket_explode-DyCSKWjQ.mp3', category: '火箭音效', icon: '🚀', description: '火箭爆炸時的音效' },
  { name: 'rocket_fly', displayName: '火箭飛行', path: '/cashorcrash2/mp3/assets/rocket_fly-B0Tde6-n.mp3', category: '火箭音效', icon: '🚀', description: '火箭飛行時的音效' },
  { name: 'rocket_prelaunch_beginning', displayName: '發射準備', path: '/cashorcrash2/mp3/assets/rocket_prelaunch_beginning-CBWMXJzv.mp3', category: '火箭音效', icon: '🚀', description: '火箭發射前的準備音效' },
  { name: 'rocket_prelaunch_launching', displayName: '發射啟動', path: '/cashorcrash2/mp3/assets/rocket_prelaunch_launching-CbFaD9b4.mp3', category: '火箭音效', icon: '🚀', description: '火箭發射啟動音效' },
  
  // 獎勵音效
  { name: 'bonus_accumulate', displayName: '獎勵累積', path: '/cashorcrash2/mp3/assets/bonus_accumulate-D3P8dgMI.mp3', category: '獎勵音效', icon: '🎁', description: '獎勵點數累積音效' },
  { name: 'bonus_reveal', displayName: '獎勵揭曉', path: '/cashorcrash2/mp3/assets/bonus_reveal-C_3rhldl.mp3', category: '獎勵音效', icon: '🎁', description: '獎勵揭曉音效' },
  { name: 'bonus_reveal_fail', displayName: '獎勵失敗', path: '/cashorcrash2/mp3/assets/bonus_reveal_fail-odj-AqHS.mp3', category: '獎勵音效', icon: '🎁', description: '獎勵獲取失敗音效' },
  { name: 'bonus_time', displayName: '獎勵時間', path: '/cashorcrash2/mp3/assets/bonus_time-CntR1-ac.mp3', category: '獎勵音效', icon: '🎁', description: '獎勵時間音效' },
  { name: 'winning', displayName: '獲勝音效', path: '/cashorcrash2/mp3/assets/winning-_MaDcpoI.mp3', category: '獎勵音效', icon: '🏆', description: '獲勝時的慶祝音效' },
  
  // UI 音效
  { name: 'click', displayName: '點擊音效', path: '/cashorcrash2/mp3/assets/click-yOjLuJq2.mp3', category: 'UI 音效', icon: '👆', description: '按鈕點擊音效' },
  { name: 'play', displayName: '播放音效', path: '/cashorcrash2/mp3/assets/play-R-fW3JvX.mp3', category: 'UI 音效', icon: '▶️', description: '播放按鈕音效' },
  { name: 'popup_event', displayName: '事件彈窗', path: '/cashorcrash2/mp3/assets/popup_event-Bc_v_lS_.mp3', category: 'UI 音效', icon: '📢', description: '事件彈窗音效' },
  { name: 'popup_error', displayName: '錯誤彈窗', path: '/cashorcrash2/mp3/assets/popup_error-Dqi5VTrS.mp3', category: 'UI 音效', icon: '❌', description: '錯誤提示音效' },
  
  // 遊戲音效
  { name: 'boosting', displayName: '加速音效', path: '/cashorcrash2/mp3/assets/boosting-MRzlIner.mp3', category: '遊戲音效', icon: '⚡', description: '加速道具音效' },
  { name: 'countdown', displayName: '倒數計時', path: '/cashorcrash2/mp3/assets/countdown-S5DFRcF0.mp3', category: '遊戲音效', icon: '⏰', description: '倒數計時音效' },
  { name: 'stake_plus', displayName: '加注音效', path: '/cashorcrash2/mp3/assets/stake_plus-R_vub2_R.mp3', category: '遊戲音效', icon: '➕', description: '增加下注音效' },
  { name: 'stake_minus', displayName: '減注音效', path: '/cashorcrash2/mp3/assets/stake_minus-bVdOU9CR.mp3', category: '遊戲音效', icon: '➖', description: '減少下注音效' },
  
  // 角色音效
  { name: 'user_hop_on', displayName: '玩家上車', path: '/cashorcrash2/mp3/assets/user_hop_on-D1L_1wBN.mp3', category: '角色音效', icon: '🧑', description: '玩家加入遊戲音效' },
  { name: 'user_hop_off', displayName: '玩家下車', path: '/cashorcrash2/mp3/assets/user_hop_off-jltqlRTg.mp3', category: '角色音效', icon: '🧑', description: '玩家離開遊戲音效' },
  { name: 'others_hop_on', displayName: '其他人上車', path: '/cashorcrash2/mp3/assets/others_hop_on-BZB6aVMn.mp3', category: '角色音效', icon: '👥', description: '其他玩家加入音效' },
  { name: 'others_hop_off', displayName: '其他人下車', path: '/cashorcrash2/mp3/assets/others_hop_off-B0ltzgMH.mp3', category: '角色音效', icon: '👥', description: '其他玩家離開音效' },
]

// Spine 動畫資源數據
const spineAnimations: SpineResource[] = [
  {
    name: 'rocket_v6',
    displayName: '火箭發射動畫',
    description: '完整的火箭發射序列，包含起飛、飛行、爆炸等階段',
    icon: '🚀',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'bonus',
    displayName: '獎勵特效動畫',
    description: '華麗的獎勵特效，包含光效和粒子動畫',
    icon: '🎁',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'me-default1-walk_v4',
    displayName: '預設角色行走',
    description: '預設角色的行走動畫，流暢的步行循環',
    icon: '🚶',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'me-default1-idle_v4',
    displayName: '預設角色待機',
    description: '預設角色的待機動畫，自然的呼吸和微動作',
    icon: '🧍',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'me-default1-jump_v4',
    displayName: '預設角色跳躍',
    description: '預設角色的跳躍動畫，包含起跳和落地',
    icon: '🦘',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'me-rare-walk_v4',
    displayName: '稀有角色行走',
    description: '稀有角色的特殊行走動畫，更加華麗',
    icon: '⭐',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'me-rare-idle_v4',
    displayName: '稀有角色待機',
    description: '稀有角色的待機動畫，帶有特殊效果',
    icon: '✨',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'me-rare-jump_v4',
    displayName: '稀有角色跳躍',
    description: '稀有角色的跳躍動畫，帶有特效',
    icon: '🌟',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'npc-common-walk_v4',
    displayName: 'NPC 普通行走',
    description: 'NPC 角色的普通行走動畫',
    icon: '👤',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  },
  {
    name: 'npc-rare-walk_v4',
    displayName: 'NPC 稀有行走',
    description: 'NPC 稀有角色的行走動畫',
    icon: '👑',
    skelFile: 'skeleton.skel',
    atlasFile: 'skeleton.atlas',
    textureFile: 'skeleton.png'
  }
]

// 過濾後的資源
const filteredImages = computed(() => {
  if (!imageSearch.value) return imageFiles
  const search = imageSearch.value.toLowerCase()
  return imageFiles.filter(img => 
    img.displayName.toLowerCase().includes(search) || 
    img.category.toLowerCase().includes(search) ||
    img.name.toLowerCase().includes(search)
  )
})

const filteredAudio = computed(() => {
  if (!audioSearch.value) return audioFiles
  const search = audioSearch.value.toLowerCase()
  return audioFiles.filter(audio => 
    audio.displayName.toLowerCase().includes(search) || 
    audio.category.toLowerCase().includes(search) ||
    audio.description.toLowerCase().includes(search)
  )
})

// 錯誤處理
function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  console.warn('圖片載入失敗:', img.src)
}
</script>

<style scoped>
/* 自定義音頻播放器樣式 */
audio::-webkit-media-controls-panel {
  background-color: #374151;
}
</style>