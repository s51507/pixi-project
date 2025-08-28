# 🎮 Spine 動畫系統

基於 **Vue 3** + **PixiJS v8** + **Spine Runtime v8** 的現代化動畫平台，提供完整的 Spine 骨骼動畫解決方案。

## ✨ 主要特色

- 🦴 **完整骨骼動畫系統** - 支援 Spine 官方運行時
- ⚡ **WebGL/WebGPU 渲染** - 高性能硬件加速
- 🎯 **模組化架構** - 易於維護和擴展
- 🔧 **豐富的工具集** - 包含骨骼追蹤、特效管理等實用工具
- 📱 **響應式設計** - 適配各種螢幕尺寸
- 🎭 **多場景展示** - 從單獨動畫到完整遊戲場景

## 🚀 快速開始

### 安裝依賴

```bash
pnpm install
```

### 啟動開發服務器

```bash
pnpm run dev
```

### 構建生產版本

```bash
pnpm run build
```

## 📁 專案結構

```
src/
├── components/           # Vue 組件
│   └── animation/       # 動畫相關組件
│       └── SimpleSpineRefactored.vue # Spine 動畫播放器
├── pages/               # 頁面組件
│   ├── (home).vue       # 主頁
│   ├── spine-showcase.vue  # Spine 動畫展示
│   ├── jump-test.vue    # 骨骼追蹤測試頁面
│   ├── assets-gallery.vue # 資源庫
│   ├── integrated-scene.vue # 完整場景展示
│   └── refactored-demo.vue  # 重構演示
├── utils/               # 工具函數
│   └── pixi/           # PixiJS 專用工具模組 ⭐
│       ├── application.ts  # PixiJS 應用管理
│       ├── assets.ts      # 資源載入管理
│       ├── background.ts  # 背景管理
│       ├── boneTracker.ts # 骨骼追蹤工具
│       ├── effects.ts     # 特效系統
│       ├── logger.ts      # 日誌工具
│       ├── renderer.ts    # 渲染器檢測
│       ├── scene.ts       # 場景管理
│       ├── spine.ts       # Spine 動畫工具
│       └── index.ts       # 統一導出
├── router/              # Vue Router 配置
└── main.ts             # 應用入口
```

## 🛠️ Utils/Pixi 工具模組詳解

### 核心理念

utils/pixi 是本專案的核心工具集，將 PixiJS 和 Spine 的複雜操作封裝成簡單易用的函數，實現：

- **關注點分離** - 邏輯與 UI 分離
- **可重用性** - 函數可在多個組件中使用
- **類型安全** - 完整的 TypeScript 支持
- **統一接口** - 一致的 API 設計

### 📄 模組說明

#### 1. application.ts - PixiJS 應用管理

```typescript
// 創建 PixiJS 應用
const result = await createPixiApp({
  canvas: canvasElement,
  width: 800,
  height: 600,
  backgroundColor: 0x1a1a1a,
  antialias: true,
  logger: logFunction
})

// 銷毀應用
destroyPixiApp(app, logFunction)
```

**主要功能：**

- 自動檢測最佳渲染器（WebGPU > WebGL）
- 錯誤處理和資源清理
- 統一的配置接口

#### 2. spine.ts - Spine 動畫工具

```typescript
// 創建 Spine 動畫
const result = await createSpineAnimation({
  skelPath: '/path/to/skeleton.skel',
  atlasPath: '/path/to/skeleton.atlas',
  imagePath: '/path/to/skeleton.png',
  logger: logFunction
})

// 播放動畫
playSpineAnimation(spine, 'walk', true, logFunction)

// 設置變換
applySpineTransform(spine, {
  x: 400,
  y: 300,
  scaleX: 0.5,
  scaleY: 0.5,
  rotation: Math.PI / 4
}, logFunction)
```

**主要功能：**

- 統一的 Spine 創建流程
- 動畫播放控制
- 變換管理
- 錯誤處理

#### 3. effects.ts - 特效系統

```typescript
// 創建漂浮效果
const floatState = createFloatEffect(
  spine,
  {
    range: 20,
    speed: 1.0,
    baseX: 400,
    baseY: 300
  },
  (x, y, rotation) => {
    // 位置更新回調
  }
)

// 創建震動效果
const shakeState = createShakeEffect(
  spine,
  {
    intensity: 15,
    duration: 2000,
    baseX: 400,
    baseY: 300
  },
  (progress, x, y) => {
    // 進度回調
  },
  () => {
    // 完成回調
  }
)

// 使用特效管理器
const effectManager = new EffectManager()
effectManager.addEffect('float', floatState)
effectManager.stopEffect('float')
```

**主要功能：**

- 漂浮效果（正弦波運動）
- 震動效果（隨機震動 + 衰減）
- 特效管理器（統一管理多個特效）
- 可配置的參數

#### 4. boneTracker.ts - 骨骼追蹤工具 ⭐

```typescript
// 創建骨骼追蹤器
const boneTracker = createBoneTracker({
  textObject: pixiText,
  spine: spineInstance,
  textOffsetY: 60,
  enableDebugLog: true,
  debugLogFrequency: 0.3
})

// 開始追蹤
boneTracker.startTracking()

// 檢查所有骨骼
boneTracker.checkAllBonePositions()

// 檢測移動的骨骼
const result = await boneTracker.detectMovingBones(2000, () => {
  // 啟動動畫
  playAnimation()
})

// 停止追蹤
boneTracker.stopTracking()
```

**主要功能：**

- 自動選擇最佳追蹤骨骼
- 實時座標轉換（Spine → PixiJS）
- 移動骨骼檢測
- 調試信息輸出
- 資源自動清理

#### 5. logger.ts - 日誌工具

```typescript
// 創建日誌器
const logger = createLogger(50) // 保留 50 條日誌

// 記錄不同級別的日誌
logger.info('初始化完成')
logger.warn('資源載入較慢')
logger.error('載入失敗')

// 獲取日誌列表（響應式）
const logs = logger.getLogs()

// 清空日誌
logger.clear()

// 創建日誌函數（用於其他工具）
const logFunction = logger.createLogFunction()
```

**主要功能：**

- 分級日誌（info、warn、error）
- 自動時間戳
- 響應式日誌列表
- 數量限制和自動清理

#### 6. assets.ts - 資源管理

```typescript
// 載入 Spine 資源
const assets = await loadSpineAssets({
  skelPath: '/path/to/skeleton.skel',
  atlasPath: '/path/to/skeleton.atlas',
  imagePath: '/path/to/skeleton.png'
}, logFunction)

// 預載入資源到緩存
await preloadAssetsToCache([
  { alias: 'skel', src: '/path/to/skeleton.skel' },
  { alias: 'atlas', src: '/path/to/skeleton.atlas' }
], logFunction)
```

**主要功能：**

- 統一的資源載入接口
- 緩存管理
- 錯誤處理
- 載入進度追蹤

#### 7. background.ts - 背景管理

```typescript
// 創建背景管理器
const backgroundManager = new BackgroundManager({
  app: pixiApp,
  logger: logFunction
})

// 初始化背景
await backgroundManager.initialize()

// 設置地面背景
await backgroundManager.setGroundBackground()

// 開始起飛動畫
backgroundManager.startTakeoffAnimation(5.0) // 5x 速度

// 停止和重置
backgroundManager.stop()
backgroundManager.reset()
```

**主要功能：**

- 地面/天空背景切換
- 滾動動畫效果
- 速度控制
- 狀態管理

#### 8. scene.ts - 場景管理

複雜的場景狀態管理，包含：

- 場景狀態機（idle、ready、countdown、flying、exploded）
- 角色動畫管理
- 音頻管理
- 倒數計時器

### 🎯 使用範例

#### 基本 Spine 動畫播放

```vue
<script setup lang="ts">
import { 
  createPixiApp, 
  createSpineAnimation, 
  playSpineAnimation 
} from '@/utils/pixi'

async function initAnimation() {
  // 1. 創建 PixiJS 應用
  const { app } = await createPixiApp({
    canvas: canvasRef.value,
    width: 800,
    height: 600
  })
  
  // 2. 創建 Spine 動畫
  const { spine } = await createSpineAnimation({
    skelPath: '/spine/character/skeleton.skel',
    atlasPath: '/spine/character/skeleton.atlas'
  })
  
  // 3. 添加到場景並播放
  app.stage.addChild(spine)
  playSpineAnimation(spine, 'walk', true)
}
</script>
```

#### 帶特效的動畫

```vue
<script setup lang="ts">
import { 
  createPixiApp, 
  createSpineAnimation,
  createFloatEffect,
  EffectManager 
} from '@/utils/pixi'

const effectManager = new EffectManager()

async function initWithEffects() {
  const { app } = await createPixiApp({ /* ... */ })
  const { spine } = await createSpineAnimation({ /* ... */ })
  
  app.stage.addChild(spine)
  
  // 添加漂浮效果
  const floatState = createFloatEffect(spine, {
    range: 30,
    speed: 1.5
  })
  
  effectManager.addEffect('float', floatState)
}
</script>
```

#### 骨骼追蹤文字跟隨

```vue
<script setup lang="ts">
import { createBoneTracker } from '@/utils/pixi/boneTracker'

async function initBoneTracking() {
  // 創建文字物件
  const textObject = new PIXI.Text('Hello World', textStyle)
  app.stage.addChild(textObject)
  
  // 創建骨骼追蹤器
  const boneTracker = createBoneTracker({
    textObject,
    spine,
    textOffsetY: 50,
    enableDebugLog: true
  })
  
  // 開始追蹤
  boneTracker.startTracking()
}
</script>
```

## 🎮 頁面功能

### 主頁 (/)

- 專案介紹和功能概覽
- 導航到各個展示頁面
- 技術架構說明

### Spine 動畫展示 (/spine-showcase)

- 多種 Spine 動畫展示
- 完整的播放控制面板
- 變換控制（縮放、旋轉、位置）
- 特效系統（漂浮、震動）
- 實時調試日誌

### 骨骼追蹤測試 (/jump-test)

- 骨骼追蹤功能演示
- 文字跟隨動畫軌道
- 移動骨骼檢測
- 座標系統調試

### 整合場景 (/integrated-scene)

- 完整的火箭發射場景
- 背景音樂和音效
- 角色互動系統
- 複雜的狀態管理

### 資源庫 (/assets-gallery)

- 所有 Spine 動畫資源
- 圖片和音效資源
- 資源使用指南

### 重構演示 (/refactored-demo)

- 展示重構後的代碼架構
- 新舊版本對比
- 最佳實踐說明

## 🔧 開發指南

### 添加新的動畫

1. **準備資源**

   ```
   public/cashorcrash2/spine/新動畫名稱/
   ├── skeleton.skel
   ├── skeleton.atlas
   └── skeleton.png
   ```

2. **使用工具函數**

```typescript
   const { spine, animations } = await createSpineAnimation({
     skelPath: '/cashorcrash2/spine/新動畫名稱/skeleton.skel',
     atlasPath: '/cashorcrash2/spine/新動畫名稱/skeleton.atlas',
     imagePath: '/cashorcrash2/spine/新動畫名稱/skeleton.png'
})
```

3. **添加到展示頁面**
   更新 `spine-showcase.vue` 的動畫列表

### 創建新的特效

1. **在 effects.ts 中添加新函數**

   ```typescript
   export function createNewEffect(spine: Spine, config: NewEffectConfig) {
     // 特效邏輯
     return {
       stop: () => { /* 停止邏輯 */ },
       dispose: () => { /* 清理邏輯 */ }
     }
   }
   ```

2. **在組件中使用**

   ```typescript
   const effectState = createNewEffect(spine, config)
   effectManager.addEffect('newEffect', effectState)
   ```

### 調試技巧

1. **啟用日誌**

   ```typescript
   const logger = createLogger(100)
   // 在所有工具函數中傳入 logger.createLogFunction()
   ```

2. **檢查渲染器信息**

   ```typescript
   const rendererInfo = getRendererInfo()
   console.log(rendererInfo)
   ```

3. **骨骼位置調試**

   ```typescript
   boneTracker.checkAllBonePositions()
   ```

## 🚀 性能優化

### 渲染器選擇

- 自動選擇最佳渲染器（WebGPU > WebGL）
- 支援回退機制

### 資源管理

- 自動資源緩存
- 組件銷毀時自動清理
- 避免記憶體洩漏

### 動畫優化

- 按需啟動特效
- 自動停止非活動動畫
- 合理的更新頻率

## 📚 相關文檔

- [PixiJS v8 文檔](https://pixijs.com/8.x/guides)
- [Spine Runtime 文檔](https://esotericsoftware.com/spine-runtimes)
- [Vue 3 文檔](https://vuejs.org/)
- [TypeScript 文檔](https://www.typescriptlang.org/)

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 創建 Pull Request

## 📄 授權

本專案使用 MIT 授權條款。

---

**注意**: 本專案主要用於展示 Spine 動畫技術，所有動畫資源僅供學習和展示使用。
