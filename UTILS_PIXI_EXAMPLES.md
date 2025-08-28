# Utils/Pixi 工具使用範例

本文檔展示如何使用 `utils/pixi` 中的文字管理和骨骼追蹤工具。

## 📝 文字管理工具 (text.ts)

### 基本用法

```typescript
import { createPixiText, addTextToStage, TEXT_PRESETS } from '@/utils/pixi/text'

// 創建文字物件
const textResult = createPixiText({
  text: 'Hello World',
  ...TEXT_PRESETS.title
}, console.log)

// 添加到舞台
addTextToStage(app, textResult, {
  x: 400,
  y: 300,
  anchorX: 0.5,
  anchorY: 0.5,
  zIndex: 10
})

// 更新文字內容
textResult.updateText('New Text')

// 設置可見性
textResult.setVisible(true)

// 更新樣式
textResult.updateStyle({
  fontSize: 48,
  fill: 0xff0000
})

// 銷毀
textResult.destroy()
```

### 預設樣式

```typescript
// 使用預設樣式
const titleText = createPixiText({
  text: 'Game Title',
  ...TEXT_PRESETS.title
})

const warningText = createPixiText({
  text: 'Warning!',
  ...TEXT_PRESETS.warning
})

const successText = createPixiText({
  text: 'Success!',
  ...TEXT_PRESETS.success
})
```

## 🦴 骨骼追蹤工具 (boneTracker.ts)

### 基本用法

```typescript
import { createBoneTracker } from '@/utils/pixi/boneTracker'

// 創建骨骼追蹤器
const boneTracker = createBoneTracker({
  textObject: pixiTextObject,
  spine: spineInstance,
  textOffsetY: 50,
  enableDebugLog: true,
  debugLogFrequency: 0.3
})

// 開始追蹤
boneTracker.startTracking()

// 檢查骨骼位置
const bones = boneTracker.checkAllBonePositions()
console.log('骨骼數量:', bones.length)

// 檢測移動的骨骼
const result = await boneTracker.detectMovingBones(2000, () => {
  // 在這裡啟動動畫
  playAnimation()
})

console.log('移動的骨骼:', result.movingBones)

// 停止追蹤
boneTracker.stopTracking()

// 清理資源
boneTracker.dispose()
```

## 🎯 文字跟隨工具 (textFollower.ts) ⭐

### 完整解決方案

```typescript
import { createTextFollower } from '@/utils/pixi/textFollower'

// 創建完整的文字跟隨系統
const textFollower = createTextFollower({
  app: pixiApp,
  spine: spineInstance,
  textConfig: {
    text: 'Follow Me!',
    fontSize: 32,
    fill: 0xffffff
  },
  textTransform: {
    x: 400,
    y: 300,
    anchorX: 0.5,
    anchorY: 0.5
  },
  textOffsetY: 60,
  enableDebugLog: true,
  logger: console.log
})

// 開始跟隨
textFollower.startFollowing()

// 更新文字
textFollower.updateText('新文字!')

// 檢查是否正在跟隨
if (textFollower.isFollowing()) {
  console.log('正在跟隨')
}

// 停止跟隨
textFollower.stopFollowing()

// 清理
textFollower.dispose()
```

### 簡化版用法

```typescript
import { createSimpleTextFollower } from '@/utils/pixi/textFollower'

// 快速創建（使用預設配置）
const follower = createSimpleTextFollower(
  app, 
  spine, 
  'Quick Text', 
  console.log
)

follower.startFollowing()
```

### 為現有文字添加跟隨功能

```typescript
import { addFollowingToExistingText } from '@/utils/pixi/textFollower'

// 已有的 PixiJS 文字物件
const existingText = new PIXI.Text('Existing Text')
app.stage.addChild(existingText)

// 添加跟隨功能
const follower = addFollowingToExistingText(existingText, spine, {
  textOffsetY: 40,
  enableDebugLog: true,
  logger: console.log
})

follower.startFollowing()
```

## 🔄 重構前後對比

### 重構前 (jump-test.vue 原始版本)

```vue
<script setup lang="ts">
// 需要手動管理所有細節
let textObject: PIXI.Text | null = null
let boneTracker: BoneTracker | null = null

function createTextObject() {
  // 50+ 行代碼創建和配置文字物件
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 32,
    // ... 大量樣式配置
  })
  
  textObject = new PIXI.Text({
    text: customText.value,
    style: textStyle
  })
  
  // 手動設置位置、錨點等
  textObject.x = app.screen.width / 2
  textObject.y = app.screen.height / 2 - 50
  textObject.anchor.set(0.5, 0.5)
  textObject.visible = false
  textObject.zIndex = 10
  
  app.stage.addChild(textObject)
  app.stage.sortChildren()
}

function createBoneTracker() {
  // 手動創建和配置骨骼追蹤器
  boneTracker = createBoneTrackerUtil({
    textObject,
    spine,
    textOffsetY: 60,
    enableDebugLog: true,
    debugLogFrequency: 0.3
  })
}

function updateTextContent() {
  // 手動更新文字內容
  if (!textObject) return
  const newText = customText.value.trim() || 'ABC'
  textObject.text = newText
  currentDisplayText.value = newText
}

// 清理時需要手動管理多個物件
onUnmounted(() => {
  if (boneTracker) {
    boneTracker.dispose()
  }
  if (textObject && app) {
    app.stage.removeChild(textObject)
    textObject = null
  }
})
</script>
```

### 重構後 (使用新工具)

```vue
<script setup lang="ts">
import { createTextFollower } from '@/utils/pixi/textFollower'

let textFollower: TextFollowerResult | null = null

function initTextFollower() {
  // 一行代碼創建完整系統
  textFollower = createTextFollower({
    app,
    spine,
    textConfig: {
      text: customText.value,
      fontSize: 32,
      fill: 0xffffff
    },
    textTransform: {
      x: app.screen.width / 2,
      y: app.screen.height / 2 - 50,
      anchorX: 0.5,
      anchorY: 0.5,
      visible: false
    },
    textOffsetY: 60,
    enableDebugLog: true,
    logger: console.log
  })
}

function updateTextContent() {
  // 簡化的更新邏輯
  if (!textFollower) return
  const newText = customText.value.trim() || 'ABC'
  textFollower.updateText(newText)
  currentDisplayText.value = newText
}

function toggleText() {
  if (!textFollower) return
  textVisible.value = !textVisible.value
  textFollower.setVisible(textVisible.value)
}

function startBoneTracking() {
  if (!textFollower) return
  textFollower.startFollowing()
}

// 清理變得非常簡單
onUnmounted(() => {
  if (textFollower) {
    textFollower.dispose()
  }
})
</script>
```

## 📊 重構收益

### 代碼行數對比

- **原始版本**: ~150 行文字和追蹤相關代碼
- **重構版本**: ~50 行代碼
- **減少**: ~67% 的代碼量

### 功能提升

1. **更好的封裝** - 細節隱藏在工具函數中
2. **更好的錯誤處理** - 統一的錯誤捕獲和日誌
3. **更好的可重用性** - 可以在其他組件中輕鬆使用
4. **更好的維護性** - 修改邏輯只需要更新工具函數
5. **更好的類型安全** - 完整的 TypeScript 支持

### 最佳實踐

1. **優先使用 `createTextFollower`** - 適合新項目
2. **使用 `addFollowingToExistingText`** - 適合改造現有項目
3. **使用 `TEXT_PRESETS`** - 保持視覺一致性
4. **啟用調試日誌** - 開發階段便於調試
5. **記得清理資源** - 避免記憶體洩漏

## 🚀 進階用法

### 動態切換文字樣式

```typescript
const textFollower = createTextFollower(config)

// 根據遊戲狀態動態調整樣式
function updateTextByGameState(state: 'normal' | 'warning' | 'success') {
  const styles = {
    normal: TEXT_PRESETS.normal,
    warning: TEXT_PRESETS.warning,
    success: TEXT_PRESETS.success
  }
  
  textFollower.textResult.updateStyle(styles[state])
}
```

### 多文字跟隨

```typescript
// 創建多個跟隨文字
const followers = [
  createSimpleTextFollower(app, spine, 'Text 1'),
  createSimpleTextFollower(app, spine, 'Text 2'),
  createSimpleTextFollower(app, spine, 'Text 3')
]

// 設置不同的偏移
followers[0].textResult.setTransform({ y: spineY + 20 })
followers[1].textResult.setTransform({ y: spineY + 50 })
followers[2].textResult.setTransform({ y: spineY + 80 })

// 全部開始跟隨
followers.forEach(f => f.startFollowing())
```

### 條件性跟隨

```typescript
const textFollower = createTextFollower(config)

// 只在特定動畫時跟隨
function handleAnimationChange(animationName: string) {
  if (animationName === 'jump' || animationName === 'run') {
    textFollower.startFollowing()
  } else {
    textFollower.stopFollowing()
  }
}
```

這些工具大大簡化了文字跟隨功能的實現，讓開發者可以專注於業務邏輯而不是底層的 PixiJS 和 Spine 操作細節。
