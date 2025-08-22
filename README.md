# 🚀 Spine 動畫系統

一個基於 **Vue 3** + **PixiJS** + **TypeScript** 的專業級 Spine 動畫平台，從單獨動畫控制到完整場景整合，提供現代化的骨骼動畫解決方案。

## ✨ 核心特色

### 🦴 **真正的 Spine 動畫**
- 使用官方 `@esotericsoftware/spine-pixi-v8` Runtime
- 完整的骨骼動畫系統，支援父子關係和變換繼承  
- 基於關鍵幀的時間軸動畫，支援多種插值模式
- 動態調整速度、縮放、循環等播放參數

### ⚡ **高性能渲染**
- PixiJS v8 WebGL 硬件加速渲染
- 支援 60fps 流暢動畫播放
- 智能資源緩存和管理
- 實時動畫狀態控制

### 🎨 **現代化 UI**
- 使用 TailwindCSS v4 的響應式設計
- 毛玻璃效果和漸變設計語言
- 直觀的動畫控制界面
- 完整的調試工具和錯誤提示

## 🚀 快速開始

### 環境要求

- Node.js 18+ 
- npm/pnpm/yarn
- 現代瀏覽器 (支援 WebGL)

### 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 pnpm (推薦)
pnpm install

# 或使用 yarn  
yarn install
```

### 開發模式

```bash
npm run dev
```

訪問 `http://localhost:5173` 查看應用

### 生產構建

```bash
npm run build
```

## 📁 項目結構

```
├── public/cashorcrash2/          # 靜態動畫資源
│   ├── spine/                    # Spine 動畫文件
│   │   ├── rocket_v6/           # 🚀 火箭發射動畫
│   │   ├── bonus/               # 🎁 獎勵特效動畫  
│   │   ├── me-default1-walk_v4/ # 🚶 角色行走動畫
│   │   └── ...                  # 其他動畫
│   ├── avif/                    # 圖片資源
│   └── mp3/                     # 音頻資源
├── src/
│   ├── components/animation/     # 動畫組件
│   │   └── SimpleSpineTest.vue  # 🎮 Spine 動畫播放器
│   ├── pages/                   # 頁面組件
│   │   ├── (home).vue          # 🏠 主頁
│   │   ├── spine-showcase.vue   # ⭐ Spine 動畫展示
│   │   ├── cashorcrash-animation.vue # 📊 動畫對比
│   │   └── rocket-debug.vue     # 🔧 調試工具
│   ├── utils/                   # 工具函數
│   │   └── atlasParser.ts       # Atlas 解析器
│   └── router/                  # 路由配置
└── ...
```

## 🎯 主要功能

### 🎮 **現在體驗**

| 功能 | 路由 | 特色描述 |
|------|------|----------|
| **主頁** | `/` | 項目介紹和導航中心 |
| **單獨動畫展示** ⭐ | `/spine-showcase` | 完整的 Spine 動畫播放器，包含專業級控制系統 |

#### 🎛️ **動畫控制系統**
- **變換控制**: 縮放、位置、旋轉、速度調整
- **🌊 漂浮效果**: 自然的正弦波漂浮動畫
- **🚀 震動效果**: 劇烈的起飛震動模擬
- **🔄 水平翻轉**: 一鍵翻轉動畫方向
- **🎲 隨機變換**: 快速隨機化所有參數
- **🔄 一鍵重置**: 恢復所有預設值

### 🎬 **即將推出**

| 功能 | 狀態 | 計劃特色 |
|------|------|----------|
| **整合場景展示** 🚧 | 開發中 | 完整火箭發射場景體驗 |

#### 🌟 **預期功能**
- **🌌 場景背景**: 完整的太空發射場景
- **💥 爆炸特效**: 震撼的視覺爆炸效果
- **🎵 音效同步**: 背景音樂和音效整合
- **⏰ 時間軸控制**: 精準的發射時序控制

## 🎮 支援的動畫

系統包含多種 CashOrCrash2 遊戲動畫：

| 動畫 | 描述 | 特色 |
|------|------|------|
| 🚀 **火箭發射** | 完整的火箭發射序列 | 多階段動畫、粒子效果、複雜時間軸 |
| 🎁 **獎勵特效** | 華麗的獎勵動畫 | 光效動畫、彈性效果、循環播放 |
| 🚶 **角色行走** | 流暢的角色行走動畫 | 骨骼動畫、循環動作、平滑過渡 |
| 🦘 **角色跳躍** | 動態的跳躍動作 | 動態動作、重力效果、多階段 |
| ⭐ **高級角色** | 解鎖角色的特殊動畫 | 特殊效果、高級動畫、獨特設計 |
| 👥 **NPC 角色** | 其他角色的行走動畫 | NPC 動作、風格化、背景角色 |

## 💻 技術棧

### 前端框架
- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 完整類型安全
- **Vite** - 快速構建工具 + HMR
- **Vue Router** - 文件路由系統

### 樣式系統  
- **TailwindCSS v4** - 原子化 CSS
- **現代設計語言** - 毛玻璃、漸變、動畫

### 動畫引擎
- **PixiJS v8** - WebGL 渲染引擎
- **@esotericsoftware/spine-pixi-v8** - 官方 Spine Runtime
- **Canvas API** - 2D 渲染支援

### 狀態管理
- **Pinia** - 狀態管理
- **Pinia Colada** - 數據獲取

## 🔧 使用方法

### 🎮 **體驗動畫系統**

1. **啟動開發服務器**
   ```bash
   pnpm run dev
   ```

2. **訪問主頁**: `http://localhost:5173`

3. **進入單獨動畫展示**: 點擊「🚀 單獨動畫展示」卡片

4. **體驗完整功能**:
   - 選擇不同動畫 (火箭、獎勵、角色等)
   - 調整變換參數 (縮放、位置、旋轉、速度)
   - 啟動特效 (🌊 漂浮、🚀 震動、🔄 翻轉)
   - 使用快速操作 (🎲 隨機、🔄 重置)

### 💻 **基本 Spine 動畫播放**

```vue
<template>
  <SimpleSpineTest
    :atlas-path="'/cashorcrash2/spine/rocket_v6/skeleton.atlas'"
    :image-path="'/cashorcrash2/spine/rocket_v6/skeleton.png'"
    :skel-path="'/cashorcrash2/spine/rocket_v6/skeleton.skel'"
    :width="800"
    :height="600"
  />
</template>

<script setup>
import SimpleSpineTest from '@/components/animation/SimpleSpineTest.vue'
</script>
```

### 🎯 **動態動畫切換**

```vue
<template>
  <div>
    <select v-model="selectedAnimation" @change="changeAnimation">
      <option value="all">完整動畫</option>
      <option value="launch">發射</option>
      <option value="flying">飛行</option>
      <option value="explosion">爆炸</option>
    </select>
    
    <SimpleSpineTest
      :key="selectedAnimation"
      :atlas-path="animationConfig.atlasPath"
      :image-path="animationConfig.imagePath"
      :skel-path="animationConfig.skelPath"
      :width="800"
      :height="600"
    />
  </div>
</template>
```

### Atlas 數據解析

```typescript
import { parseAtlas } from '@/utils/atlasParser'

// 解析 Atlas 文件
const response = await fetch('/cashorcrash2/spine/rocket_v6/skeleton.atlas')
const atlasContent = await response.text()
const atlasData = parseAtlas(atlasContent)

console.log('Atlas 信息:', {
  imagePath: atlasData.imagePath,
  size: `${atlasData.width} × ${atlasData.height}`,
  regions: atlasData.regions.length
})
```

## 🛠️ 開發指南

### 添加新動畫

1. **準備動畫文件**
   ```bash
   public/cashorcrash2/spine/your-animation/
   ├── skeleton.atlas  # Atlas 文件
   ├── skeleton.png    # 紋理圖片
   └── skeleton.skel   # 骨骼數據
   ```

2. **更新動畫配置**
   ```typescript
   // 在 spine-showcase.vue 中添加
   const animations = [
     // ... 現有動畫
     {
       name: 'your-animation',
       displayName: '你的動畫',
       description: '動畫描述',
       icon: '🎭',
       features: ['特色1', '特色2'],
       atlasPath: '/cashorcrash2/spine/your-animation/skeleton.atlas',
       imagePath: '/cashorcrash2/spine/your-animation/skeleton.png', 
       skelPath: '/cashorcrash2/spine/your-animation/skeleton.skel'
     }
   ]
   ```

### 調試和測試

1. **使用調試頁面** (`/rocket-debug`)
   - Atlas 解析測試
   - 區域信息查看
   - 錯誤診斷

2. **控制台調試**
   ```javascript
   // 查看 Spine 對象
   console.log('Spine 實例:', spine)
   console.log('動畫列表:', spine.skeleton.data.animations)
   console.log('骨骼信息:', spine.skeleton.bones)
   ```

3. **性能監控**
   ```javascript
   // 啟用 PixiJS 調試
   window.PIXI = PIXI
   console.log('PixiJS 版本:', PIXI.VERSION)
   ```

## 🌟 核心亮點

### 🎯 **技術創新**
- **官方 Runtime** - 使用 Esoteric Software 官方 Spine Runtime v8
- **最新技術棧** - Vue 3 Composition API + PixiJS v8 + TypeScript
- **智能渲染** - WebGL/WebGPU 自動選擇 + 硬件加速
- **類型安全** - 完整的 TypeScript 類型定義

### 🎨 **專業級控制系統**
- **🎛️ 實時變換** - 縮放、位置、旋轉、速度即時調整
- **🌊 動態特效** - 漂浮、震動、翻轉等視覺特效
- **🎲 快速操作** - 隨機變換、一鍵重置、批量控制
- **📊 即時反饋** - 參數顯示、狀態監控、錯誤診斷

### 🚀 **未來願景**
- **🎬 場景整合** - 從單獨控制到完整場景體驗
- **🌌 沉浸體驗** - 背景、音效、特效的完美融合
- **⏰ 精準控制** - 時間軸管理、事件觸發、序列編排
- **🎯 專業工具** - 為動畫師和開發者打造的專業平台

## 📈 性能特性

- ⚡ **60fps 流暢播放** - WebGL 硬件加速渲染
- 🚀 **快速載入** - 智能資源預載入和緩存
- 💾 **內存優化** - 自動資源管理和垃圾回收
- 📱 **設備適應** - 自動調整渲染品質

## 🔗 相關鏈接

- [Spine 官方文檔](https://zh.esotericsoftware.com/spine-user-guide)
- [PixiJS 官方文檔](https://pixijs.com/)
- [Vue 3 官方文檔](https://vuejs.org/)
- [TailwindCSS 文檔](https://tailwindcss.com/)

## 📄 授權說明

本項目僅作為技術演示和學習使用：
- 代碼部分使用 MIT 授權
- 動畫資源版權歸原開發者所有
- 請勿用於商業用途

---

## 🎉 立即體驗

### 🚀 **快速啟動**

```bash
git clone <repository-url>
cd spine-animation-project
pnpm install
pnpm run dev
```

### 🎮 **使用流程**

1. **打開瀏覽器** 訪問 `http://localhost:5173`
2. **瀏覽主頁** 了解項目功能和特色
3. **進入動畫展示** 點擊「🚀 單獨動畫展示」
4. **體驗完整功能** 嘗試各種動畫和控制選項
5. **期待更多** 關注即將推出的整合場景功能

### 🎯 **推薦體驗路徑**

1. **火箭動畫** → 啟動 🚀 震動效果 → 感受引擎點火
2. **角色動畫** → 開啟 🌊 漂浮效果 → 體驗太空失重
3. **獎勵動畫** → 使用 🔄 水平翻轉 → 查看動畫對稱性
4. **隨機效果** → 點擊 🎲 隨機 → 探索無限可能

---

💡 **提示**: 
- 如遇到問題，請檢查瀏覽器控制台的詳細日誌
- 所有控制參數都有即時的視覺反饋
- 系統支援 WebGL 和 WebGPU 渲染，性能表現優異