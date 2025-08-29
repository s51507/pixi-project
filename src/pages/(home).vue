<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(120,119,198,0.3)_0%,_transparent_50%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(255,119,198,0.3)_0%,_transparent_50%)]"></div>
    
    <div class="relative container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-6">
          <div class="text-6xl mb-4 animate-bounce">🎮</div>
          <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Spine 動畫系統
          </h1>
          <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            基於 <span class="text-blue-400 font-semibold">Vue 3</span> + <span class="text-green-400 font-semibold">PixiJS</span> + <span class="text-purple-400 font-semibold">Spine Runtime</span> 的現代化動畫平台
          </p>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto mt-4">
            從單獨動畫控制到完整場景整合，提供專業級的骨骼動畫解決方案
          </p>
        </div>
        
        <!-- 技術徽章 -->
        <div class="flex flex-wrap justify-center gap-3 mb-8">
          <span class="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium">
            Vue 3 Composition API
          </span>
          <span class="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm font-medium">
            PixiJS v8
          </span>
          <span class="px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-sm font-medium">
            Spine Runtime v8
          </span>
          <span class="px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full text-yellow-300 text-sm font-medium">
            TypeScript
          </span>
        </div>

        <!-- 素材包切換 -->
        <div class="mb-8">
          <AssetPackSwitch />
        </div>

        <!-- 主要特色 -->
        <div class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold mb-4 text-emerald-400">✨ 真正的 Spine 骨骼動畫</h2>
          <div class="grid md:grid-cols-2 gap-4 text-left">
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-green-400">✓</span>
                完整的骨骼動畫系統
              </div>
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-green-400">✓</span>
                時間軸動畫控制
              </div>
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-green-400">✓</span>
                多動畫切換和混合
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-green-400">✓</span>
                WebGL 硬件加速渲染
              </div>
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-green-400">✓</span>
                實時動畫參數調整
              </div>
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-green-400">✓</span>
                高性能 60fps 播放
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能展示 -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div class="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🦴</div>
          <h3 class="text-xl font-semibold mb-3 text-blue-300">骨骼系統</h3>
          <p class="text-slate-300 text-sm">
            完整的骨骼層次結構，支援父子關係和變換繼承
          </p>
        </div>

        <div class="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⏱️</div>
          <h3 class="text-xl font-semibold mb-3 text-purple-300">時間軸動畫</h3>
          <p class="text-slate-300 text-sm">
            基於關鍵幀的動畫系統，支援多種插值模式
          </p>
        </div>

        <div class="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
          <h3 class="text-xl font-semibold mb-3 text-green-300">實時控制</h3>
          <p class="text-slate-300 text-sm">
            動態調整速度、縮放、循環等播放參數
          </p>
        </div>

        <div class="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
          <h3 class="text-xl font-semibold mb-3 text-yellow-300">高性能</h3>
          <p class="text-slate-300 text-sm">
            WebGL 渲染引擎，流暢的動畫播放體驗
          </p>
        </div>
      </div>

      <!-- 動畫展示區 -->
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
          🎭 動畫展示
        </h2>
        
        <div class="max-w-4xl mx-auto mb-8">
          <div class="space-y-8">
            <!-- 單獨動畫展示 -->
            <RouterLink 
              to="/spine-showcase" 
              class="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-400/30 hover:border-purple-300/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl block"
            >
              <div class="flex items-start gap-6">
                <div class="text-6xl group-hover:scale-110 transition-transform duration-300">🚀</div>
                <div class="flex-1 text-left">
                  <h4 class="text-2xl font-bold mb-3 text-purple-300">單獨動畫展示</h4>
                  <p class="text-slate-300 text-base mb-4 leading-relaxed">
                    完整的 Spine 動畫播放器，包含專業級變換控制、動態特效系統和實時調試功能
                  </p>
                  <div class="flex flex-wrap gap-3 mb-4">
                    <span class="px-3 py-1.5 bg-purple-500/30 rounded-full text-sm text-purple-300 font-medium">🎛️ 變換控制</span>
                    <span class="px-3 py-1.5 bg-blue-500/30 rounded-full text-sm text-blue-300 font-medium">🌊 漂浮效果</span>
                    <span class="px-3 py-1.5 bg-orange-500/30 rounded-full text-sm text-orange-300 font-medium">🚀 震動效果</span>
                    <span class="px-3 py-1.5 bg-cyan-500/30 rounded-full text-sm text-cyan-300 font-medium">🔄 水平翻轉</span>
                  </div>
                  <div class="inline-flex items-center gap-2 text-purple-400 font-semibold text-lg">
                    立即體驗 <span class="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </RouterLink>

            <!-- Funky Rocket 動態背景 -->
            <RouterLink 
              to="/funky-rocket-demo"
              class="group bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-300/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl block"
            >
              <div class="absolute top-4 right-4 bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                🎸 新功能
              </div>
              <div class="flex items-start gap-6">
                <div class="text-6xl group-hover:scale-110 transition-transform duration-300">🎸</div>
                <div class="flex-1 text-left">
                  <h4 class="text-2xl font-bold mb-3 text-yellow-300">Funky Rocket 動態背景</h4>
                  <p class="text-slate-300 text-base mb-4 leading-relaxed">
                    展示 funkyRocket 素材包的動態背景切換功能：起飛前使用 bgDefault.png，起飛後循環播放 bgCycle.png
                  </p>
                  <div class="flex flex-wrap gap-3 mb-4">
                    <span class="px-3 py-1.5 bg-yellow-500/30 rounded-full text-sm text-yellow-300 font-medium">🖼️ 動態背景</span>
                    <span class="px-3 py-1.5 bg-orange-500/30 rounded-full text-sm text-orange-300 font-medium">🚀 起飛序列</span>
                    <span class="px-3 py-1.5 bg-purple-500/30 rounded-full text-sm text-purple-300 font-medium">🔄 背景循環</span>
                    <span class="px-3 py-1.5 bg-pink-500/30 rounded-full text-sm text-pink-300 font-medium">📦 素材包展示</span>
                  </div>
                  <div class="inline-flex items-center gap-2 text-yellow-400 font-semibold text-lg">
                    立即體驗 <span class="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </RouterLink>

            <!-- Funky Rocket 動畫展示 -->
            <RouterLink 
              to="/funky-rocket-showcase"
              class="group bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg rounded-3xl p-8 border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl block"
            >
              <div class="absolute top-4 right-4 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                🆕 全新素材
              </div>
              <div class="flex items-start gap-6">
                <div class="text-6xl group-hover:scale-110 transition-transform duration-300">🎸</div>
                <div class="flex-1 text-left">
                  <h4 class="text-2xl font-bold mb-3 text-blue-300">Funky Rocket 動畫展示</h4>
                  <p class="text-slate-300 text-base mb-4 leading-relaxed">
                    專門展示 Funky Rocket 素材包的全新三個核心動畫：walk、jump、rocket
                  </p>
                  <div class="flex flex-wrap gap-3 mb-4">
                    <span class="px-3 py-1.5 bg-blue-500/30 rounded-full text-sm text-blue-300 font-medium">🚶 行走動畫</span>
                    <span class="px-3 py-1.5 bg-green-500/30 rounded-full text-sm text-green-300 font-medium">🦘 跳躍動畫</span>
                    <span class="px-3 py-1.5 bg-red-500/30 rounded-full text-sm text-red-300 font-medium">🚀 火箭動畫</span>
                    <span class="px-3 py-1.5 bg-purple-500/30 rounded-full text-sm text-purple-300 font-medium">📦 簡化結構</span>
                  </div>
                  <div class="inline-flex items-center gap-2 text-blue-400 font-semibold text-lg">
                    查看動畫 <span class="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </RouterLink>

            <!-- 整合場景 -->
            <RouterLink 
              to="/integrated-scene"
              class="group bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-lg rounded-3xl p-8 border border-emerald-400/30 hover:border-emerald-300/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl block"
            >
              <div class="absolute top-4 right-4 bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                ✨ 全新上線
              </div>
              <div class="flex items-start gap-6">
                <div class="text-6xl group-hover:scale-110 transition-transform duration-300">🎬</div>
                <div class="flex-1 text-left">
                  <h4 class="text-2xl font-bold mb-3 text-emerald-300">整合場景展示</h4>
                  <p class="text-slate-300 text-base mb-4 leading-relaxed">
                    完整的火箭發射場景體驗，整合背景音效、精準時間軸控制和震撼爆炸特效
                  </p>
                  <div class="flex flex-wrap gap-3 mb-4">
                    <span class="px-3 py-1.5 bg-emerald-500/30 rounded-full text-sm text-emerald-300 font-medium">🌌 場景背景</span>
                    <span class="px-3 py-1.5 bg-red-500/30 rounded-full text-sm text-red-300 font-medium">💥 爆炸特效</span>
                    <span class="px-3 py-1.5 bg-blue-500/30 rounded-full text-sm text-blue-300 font-medium">🎵 音效同步</span>
                    <span class="px-3 py-1.5 bg-purple-500/30 rounded-full text-sm text-purple-300 font-medium">⏰ 時間軸控制</span>
                  </div>
                  <div class="inline-flex items-center gap-2 text-emerald-400 font-semibold text-lg">
                    立即體驗 <span class="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- 快速導航 -->
        <div class="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 class="text-lg font-semibold mb-4 text-slate-300">🚀 使用指南</h3>
          <div class="grid md:grid-cols-2 gap-6 text-sm">
            <div class="text-center">
              <div class="text-3xl mb-3">🎯</div>
              <h4 class="font-semibold mb-2 text-purple-400">現在體驗</h4>
              <p class="text-slate-300 leading-relaxed">
                立即進入 <span class="text-purple-400 font-semibold">單獨動畫展示</span>，體驗完整的 Spine 動畫控制系統，包含變換、特效和實時調試功能
              </p>
            </div>
            <div class="text-center">
              <div class="text-3xl mb-3">🌟</div>
              <h4 class="font-semibold mb-2 text-emerald-400">即將推出</h4>
              <p class="text-slate-300 leading-relaxed">
                期待 <span class="text-emerald-400 font-semibold">整合場景展示</span> 帶來的完整火箭發射體驗，包含背景、音效和爆炸特效的完美融合
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 技術架構 -->
      <div class="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h2 class="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🛠️ 技術架構
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-3xl mb-3">🎨</div>
            <h3 class="font-semibold mb-2 text-blue-300">前端框架</h3>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>Vue 3 Composition API</li>
              <li>TypeScript 類型安全</li>
              <li>Vite 構建工具</li>
              <li>TailwindCSS v4 樣式</li>
            </ul>
          </div>
          
          <div class="text-center">
            <div class="text-3xl mb-3">🎮</div>
            <h3 class="font-semibold mb-2 text-purple-300">動畫引擎</h3>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>PixiJS v8 WebGL 渲染</li>
              <li>Spine Runtime v8 骨骼動畫</li>
              <li>Atlas 文件解析</li>
              <li>實時動畫控制</li>
            </ul>
          </div>
          
          <div class="text-center">
            <div class="text-3xl mb-3">⚡</div>
            <h3 class="font-semibold mb-2 text-green-300">性能優化</h3>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>WebGL 硬件加速</li>
              <li>資源緩存管理</li>
              <li>組件懶加載</li>
              <li>60fps 流暢渲染</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 開發者鏈接 -->
      <div class="text-center mt-12">
        <div class="inline-flex items-center gap-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/10">
          <span class="text-slate-400 text-sm">🔧 開發者工具：</span>
          <RouterLink 
            to="/refactored-demo" 
            class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            重構演示頁面 →
          </RouterLink>
          <RouterLink 
            to="/assets-gallery" 
            class="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
          >
            資源庫 →
          </RouterLink>
          <RouterLink 
            to="/jump-test" 
            class="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            跳躍測試 →
          </RouterLink>
          <RouterLink 
            to="/funky-rocket-demo" 
            class="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
          >
            動態背景 →
          </RouterLink>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-8 text-slate-400 text-sm">
        <p>使用現代化技術棧構建的 Spine 動畫展示項目</p>
        <p class="mt-2">支援完整的骨骼動畫、時間軸控制和實時渲染</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AssetPackSwitch from '@/components/AssetPackSwitch.vue'
</script>