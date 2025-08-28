import * as PIXI from 'pixi.js'
import type { Application, Sprite } from 'pixi.js'

export interface BackgroundConfig {
  app: Application
  logger?: (message: string) => void
}

export interface BackgroundLayer {
  sprite: Sprite
  speed: number
  isActive: boolean
}

/**
 * 背景管理器 - 處理滾動背景動畫
 */
export class BackgroundManager {
  private app: Application
  private logger?: (message: string) => void
  private backgroundLayers: BackgroundLayer[] = []
  private animationId: number | null = null
  private currentPhase: 'ground' | 'takeoff' | 'flying' = 'ground'
  private takeoffIndex = 0
  private flyingIndex = 0
  
  // 背景素材路徑
  private readonly groundBg = '/cashorcrash2/avif/assets/bg/low_altitude_bg_5.avif'
  private readonly takeoffBgs = [
    '/cashorcrash2/avif/assets/bg/low_altitude_bg_4.avif',
    '/cashorcrash2/avif/assets/bg/low_altitude_bg_3.avif',
    '/cashorcrash2/avif/assets/bg/low_altitude_bg_2.avif',
    '/cashorcrash2/avif/assets/bg/low_altitude_bg_1.avif'
  ]
  private readonly flyingBgs = [
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_8.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_7.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_6.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_5.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_4.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_3.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_2.avif',
    '/cashorcrash2/avif/assets/bg/high_altitude_bg_1.avif'
  ]

  constructor(config: BackgroundConfig) {
    this.app = config.app
    this.logger = config.logger
    
    // 啟用 zIndex 排序
    this.app.stage.sortableChildren = true
  }

  /**
   * 初始化背景系統
   */
  async initialize(): Promise<void> {
    try {
      this.log('🎨 初始化背景管理器')
      
      // 預載所有背景圖片
      await this.preloadAssets()
      
      // 設置初始背景（地面）
      await this.setGroundBackground()
      
      this.log('✅ 背景管理器初始化完成')
    } catch (error) {
      this.log(`❌ 背景初始化失敗: ${error}`)
    }
  }

  /**
   * 預載所有背景資源
   */
  private async preloadAssets(): Promise<void> {
    const allAssets = [
      this.groundBg,
      ...this.takeoffBgs,
      ...this.flyingBgs
    ]

    this.log(`📦 開始預載 ${allAssets.length} 個背景資源`)
    
    for (const asset of allAssets) {
      PIXI.Assets.add(asset, asset)
    }
    
    await PIXI.Assets.load(allAssets)
    this.log('✅ 背景資源預載完成')
  }

  /**
   * 設置地面背景（靜態）
   */
  async setGroundBackground(): Promise<void> {
    try {
      this.log(`🔄 開始設置地面背景: ${this.groundBg}`)
      this.clearBackgrounds()
      this.currentPhase = 'ground'
      
      // 檢查資源是否已預載
      let texture = PIXI.Assets.get(this.groundBg)
      if (!texture) {
        this.log('⏳ 地面背景未預載，正在載入...')
        try {
          texture = await PIXI.Assets.load(this.groundBg)
        } catch (loadError) {
          this.log(`❌ 地面背景載入失敗: ${loadError}`)
          // 創建一個純色背景作為備用
          const graphics = new PIXI.Graphics()
          graphics.rect(0, 0, this.app.screen.width, this.app.screen.height)
          graphics.fill(0x1a4a6b) // 深藍色背景
          texture = this.app.renderer.generateTexture(graphics)
          this.log('🔧 使用純色背景作為備用')
        }
      }
      
      if (!texture) {
        this.log('❌ 地面背景載入失敗：材質為空')
        return
      }
      
      const sprite = new PIXI.Sprite(texture)
      this.log(`📐 地面背景原始尺寸: ${texture.width}x${texture.height}`)
      
      // 設置背景填滿畫面
      this.setupSpriteSize(sprite)
      
      // 檢查縮放後的背景是否能完全覆蓋畫面高度
      if (sprite.height < this.app.screen.height) {
        // 如果背景高度不足，使用 TilingSprite 來重複填滿
        this.log(`⚠️ 背景高度不足 (${sprite.height} < ${this.app.screen.height})，使用重複模式`)
        const tilingSprite = new PIXI.TilingSprite(sprite.texture, this.app.screen.width, this.app.screen.height)
        tilingSprite.anchor.set(0.5, 0.5)
        tilingSprite.x = this.app.screen.width / 2
        tilingSprite.y = this.app.screen.height / 2
        
        // 替換原始 sprite
        this.app.stage.removeChild(sprite)
        this.app.stage.addChildAt(tilingSprite, 0)
        tilingSprite.zIndex = -1000
        
        this.backgroundLayers = [{
          sprite: tilingSprite as any, // TilingSprite 可以當作 Sprite 使用
          speed: 0,
          isActive: true
        }]
        
        this.log(`✅ 地面背景設置完成（重複模式） - 位置: (${tilingSprite.x}, ${tilingSprite.y}), 尺寸: ${tilingSprite.width}x${tilingSprite.height}`)
        return
      }
      
      // 如果背景高度足夠，使用正常模式
      // 由於使用了 anchor(0.5, 0.5)，調整Y位置
      sprite.y = this.app.screen.height / 2
      
      // 添加到最底層
      this.app.stage.addChildAt(sprite, 0)
      
      // 確保背景在最底層顯示
      sprite.zIndex = -1000
      
      this.backgroundLayers = [{
        sprite,
        speed: 0, // 地面背景不移動
        isActive: true
      }]
      
      this.log(`✅ 地面背景設置完成 - 位置: (${sprite.x}, ${sprite.y}), 尺寸: ${sprite.width}x${sprite.height}, zIndex: ${sprite.zIndex}`)
      this.log(`📊 當前 Stage 子項數量: ${this.app.stage.children.length}`)
    } catch (error) {
      this.log(`❌ 設置地面背景失敗: ${error}`)
    }
  }

  /**
   * 開始起飛背景動畫
   */
  async startTakeoffAnimation(flyingSpeed: number = 5): Promise<void> {
    this.currentPhase = 'takeoff'
    this.takeoffIndex = 0
    
    this.log('🚀 開始起飛背景動畫')
    
    // 移除地面背景，準備銜接滾動背景
    this.removeGroundBackground()
    
    // 立即添加第一個起飛背景
    const firstBg = this.takeoffBgs[0]
    await this.addScrollingBackground(firstBg, flyingSpeed)
    this.takeoffIndex = 1
    
    // 計算第一個背景的切換時間
    const scrollTime = (this.app.screen.height * 1.5) / flyingSpeed * 16
    const nextTriggerTime = scrollTime * 0.4
    
    setTimeout(() => {
      if (this.currentPhase === 'takeoff') {
        this.switchToNextTakeoffBackground(flyingSpeed)
      }
    }, nextTriggerTime)
  }

  /**
   * 切換到下一個起飛背景
   */
  private async switchToNextTakeoffBackground(flyingSpeed: number = 5): Promise<void> {
    if (this.takeoffIndex >= this.takeoffBgs.length) {
      // 起飛階段完成，進入飛行階段
      await this.startFlyingAnimation(flyingSpeed)
      return
    }

    const bgPath = this.takeoffBgs[this.takeoffIndex]
    await this.addScrollingBackground(bgPath, flyingSpeed) // 使用統一的飛行速度
    
    this.takeoffIndex++
    
    // 計算起飛背景的切換時間（基於滾動速度）
    const scrollTime = (this.app.screen.height * 1.5) / flyingSpeed * 16 // 使用統一的飛行速度
    const nextTriggerTime = scrollTime * 0.25 // 在25%滾動完成時觸發下一個，確保更緊密銜接
    
    setTimeout(() => {
      if (this.currentPhase === 'takeoff') {
        this.switchToNextTakeoffBackground(flyingSpeed)
      }
    }, nextTriggerTime)
  }

  /**
   * 開始飛行背景動畫（循環）
   */
  async startFlyingAnimation(speed: number = 5): Promise<void> {
    this.currentPhase = 'flying'
    this.flyingIndex = 0
    
    this.log('✈️ 開始飛行背景動畫')
    this.cycleFlyingBackgrounds(speed)
  }

  /**
   * 循環播放飛行背景
   */
  private cycleFlyingBackgrounds(speed: number = 5): void {
    if (this.currentPhase !== 'flying') return

    const bgPath = this.flyingBgs[this.flyingIndex]
    this.addScrollingBackground(bgPath, speed) // 使用傳入的飛行速度
    
    this.flyingIndex = (this.flyingIndex + 1) % this.flyingBgs.length
    
    // 時間間隔現在由 addScrollingBackground 中動態計算
  }

  /**
   * 添加滾動背景
   */
  private async addScrollingBackground(imagePath: string, speed: number): Promise<void> {
    try {
      const texture = await PIXI.Assets.load(imagePath)
      const sprite = new PIXI.Sprite(texture)
      
      // 設置背景大小和位置
      this.setupSpriteSize(sprite)
      // 由於使用了 anchor(0.5, 0.5)，讓背景從畫面頂部上方開始進入
      sprite.y = -sprite.height / 2 // 背景從畫面頂部上方開始滾動進入
      
      // 添加到背景層的最頂層
      this.app.stage.addChildAt(sprite, this.backgroundLayers.length)
      
      // 確保背景在最底層顯示
      sprite.zIndex = -1000 + this.backgroundLayers.length
      
      const layer: BackgroundLayer = {
        sprite,
        speed,
        isActive: true
      }
      
      this.backgroundLayers.push(layer)
      
      // 開始滾動動畫
      this.startScrolling()
      
      this.log(`🌄 添加滾動背景: ${imagePath.split('/').pop()} (速度: ${speed}, 起始Y: ${sprite.y})`)
      
      // 只在飛行階段計算動態時間間隔
      if (this.currentPhase === 'flying') {
        const scrollTime = (sprite.height + this.app.screen.height) / speed * 16 // 更精確的滾動時間
        const nextTriggerTime = scrollTime * 0.3 // 在30%滾動完成時觸發下一個，確保更緊密銜接
        
        setTimeout(() => {
          if (this.currentPhase === 'flying') {
            this.cycleFlyingBackgrounds(speed)
          }
        }, nextTriggerTime)
      }
    } catch (error) {
      this.log(`❌ 添加背景失敗: ${error}`)
    }
  }

  /**
   * 設置 Sprite 大小以填滿畫面
   */
  private setupSpriteSize(sprite: Sprite): void {
    const screenWidth = this.app.screen.width
    const screenHeight = this.app.screen.height
    
    // 計算縮放比例
    const scaleX = screenWidth / sprite.texture.width
    const scaleY = screenHeight / sprite.texture.height
    
    // 針對窄長比例 (540x950) 優化：以寬度為基準縮放
    // 這樣確保背景寬度完全填滿，高度可以超出畫面進行滾動
    const gameRatio = screenWidth / screenHeight // 目標比例 (約 0.57)
    const imageRatio = sprite.texture.width / sprite.texture.height // 圖片比例
    
    let scale: number
    if (gameRatio < 0.8) { // 窄長比例 (像 540x950)
      scale = scaleX // 以寬度為基準
    } else {
      scale = Math.max(scaleX, scaleY) // 寬屏保持原邏輯
    }
    
    sprite.scale.set(scale)
    
    // 重新計算位置以確保居中
    sprite.anchor.set(0.5, 0.5) // 設置錨點為中心
    sprite.x = screenWidth / 2   // 水平居中
    
    this.log(`📐 背景縮放: ${sprite.texture.width}x${sprite.texture.height} -> ${sprite.width}x${sprite.height}, scale: ${scale.toFixed(2)}, 游戲比例: ${gameRatio.toFixed(2)}, 圖片比例: ${imageRatio.toFixed(2)}`)
  }

  /**
   * 開始滾動動畫
   */
  private startScrolling(): void {
    if (this.animationId) return // 已經在運行
    
    const animate = () => {
      // 更新所有活動背景層
      this.backgroundLayers.forEach((layer, index) => {
        if (!layer.isActive) return
        
        layer.sprite.y += layer.speed
        
        // 如果背景完全移出畫面下方，移除它
        // 由於使用了 anchor(0.5, 0.5)，需要考慮 sprite 的一半高度
        if (layer.sprite.y > this.app.screen.height + layer.sprite.height / 2) {
          this.app.stage.removeChild(layer.sprite)
          layer.isActive = false
          this.log(`🗑️ 移除已滾動完成的背景`)
        }
      })
      
      // 清理不活動的背景層
      this.backgroundLayers = this.backgroundLayers.filter(layer => layer.isActive)
      
      // 繼續動畫
      if (this.backgroundLayers.some(layer => layer.speed > 0)) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.animationId = null
      }
    }
    
    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 更新飛行階段的背景速度
   */
  updateFlyingSpeed(newSpeed: number): void {
    if (this.currentPhase === 'flying') {
      // 更新現有背景層的速度
      this.backgroundLayers.forEach(layer => {
        if (layer.speed > 0) { // 只更新移動中的背景
          layer.speed = newSpeed
        }
      })
      this.log(`🎯 飛行速度已更新為: ${newSpeed}x`)
    }
  }

  /**
   * 停止所有背景動畫
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    
    this.currentPhase = 'ground'
    this.log('⏹️ 背景動畫已停止')
  }

  /**
   * 清理所有背景
   */
  /**
   * 移除地面背景
   */
  private removeGroundBackground(): void {
    // 只移除靜態地面背景（speed = 0）
    this.backgroundLayers.forEach((layer, index) => {
      if (layer.speed === 0 && layer.sprite.parent) {
        this.app.stage.removeChild(layer.sprite)
        layer.isActive = false
        this.log(`🗑️ 移除地面背景 ${index}`)
      }
    })
    
    // 清理不活動的背景層
    this.backgroundLayers = this.backgroundLayers.filter(layer => layer.isActive)
  }

  private clearBackgrounds(): void {
    this.log(`🧹 清理背景層，當前數量: ${this.backgroundLayers.length}`)
    this.backgroundLayers.forEach((layer, index) => {
      if (layer.sprite.parent) {
        this.app.stage.removeChild(layer.sprite)
        this.log(`🗑️ 移除背景 ${index}: ${layer.sprite.constructor.name}`)
      }
    })
    this.backgroundLayers = []
    this.log(`✅ 背景清理完成，Stage 子項數量: ${this.app.stage.children.length}`)
  }

  /**
   * 重置背景系統
   */
  async reset(): Promise<void> {
    this.stop()
    this.clearBackgrounds()
    await this.setGroundBackground()
    this.log('🔄 背景系統已重置')
  }

  /**
   * 釋放資源
   */
  dispose(): void {
    this.stop()
    this.clearBackgrounds()
    this.log('🧹 背景管理器已清理')
  }

  /**
   * 獲取背景狀態資訊
   */
  getStatus(): string {
    return `Phase: ${this.currentPhase}, Layers: ${this.backgroundLayers.length}, Active: ${this.backgroundLayers.filter(l => l.isActive).length}`
  }

  private log(message: string): void {
    this.logger?.(`[BackgroundManager] ${message}`)
  }
}

export default BackgroundManager