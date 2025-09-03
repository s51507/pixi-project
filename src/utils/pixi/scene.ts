/**
 * 場景管理相關工具函數
 */

// 場景狀態枚舉
export enum SceneState {
  IDLE = 'idle',           // 待機狀態
  READY = 'ready',         // 準備狀態（可以上車）
  COUNTDOWN = 'countdown', // 倒數階段
  FLYING = 'flying',       // 飛行中
  EXPLODED = 'exploded'    // 爆炸結束
}

// 角色類型
export enum CharacterType {
  PLAYER = 'player',       // 玩家角色
  PREMIUM = 'premium',     // 高級角色
  NPC = 'npc'             // NPC
}

// 音效類型
export interface AudioAssets {
  into: string // 角色進艙門
  button_bet: string // 下注按鈕
  button_normal: string // 其他按鈕
  bgm_open: string // 起飛前背景音樂
  bgm_fly: string // 飛行背景音樂
  countdown_5_sec: string // 倒數5秒
  countdown_10_sec: string // 倒數10秒
  rocket_prelaunch: string // 火箭發射
  user_jump: string // 玩家跳躍
  other_jump: string // 其他人跳躍
  win: string // 獲勝
  rocket_explode: string // 火箭爆炸
  return: string // 重新開始
}

// 場景配置
export interface SceneConfig {
  countdownDuration: number  // 倒數時間（秒）
  audioAssets: AudioAssets
  logger?: (message: string) => void
}

// 音頻管理器
export class AudioManager {
  private audioCache = new Map<string, HTMLAudioElement>()
  private activeBGMs = new Map<string, HTMLAudioElement>() // 支援多個 BGM 同時播放
  private logger?: (message: string) => void

  constructor(assets: AudioAssets, logger?: (message: string) => void) {
    this.logger = logger
    this.preloadAudio(assets)
  }

  private preloadAudio(assets: AudioAssets): void {
    Object.entries(assets).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      this.audioCache.set(key, audio)
      this.log(`音頻已預載入: ${key}`)
    })
  }

  playBGM(key: string, loop: boolean = true): void {
    // 如果這個 BGM 已經在播放，先停止
    this.stopBGM(key)
    
    const audio = this.audioCache.get(key)
    if (audio) {
      // 創建新的音頻實例以支援同時播放多個 BGM
      const bgmInstance = audio.cloneNode() as HTMLAudioElement
      bgmInstance.loop = loop
      bgmInstance.currentTime = 0
      // 確保新實例使用當前音量設定
      bgmInstance.volume = audio.volume
      bgmInstance.play().catch(e => this.log(`BGM 播放失敗: ${e}`))
      
      // 儲存到活躍 BGM 列表
      this.activeBGMs.set(key, bgmInstance)
      this.log(`🎵 BGM 播放: ${key} (目前播放 ${this.activeBGMs.size} 個 BGM)`)
    }
  }

  stopBGM(key?: string): void {
    if (key) {
      // 停止特定的 BGM
      const bgm = this.activeBGMs.get(key)
      if (bgm) {
        bgm.pause()
        bgm.currentTime = 0
        this.activeBGMs.delete(key)
        this.log(`🎵 BGM 已停止: ${key}`)
      }
    } else {
      // 停止所有 BGM
      this.activeBGMs.forEach((bgm, bgmKey) => {
        bgm.pause()
        bgm.currentTime = 0
        this.log(`🎵 BGM 已停止: ${bgmKey}`)
      })
      this.activeBGMs.clear()
      this.log('🎵 所有 BGM 已停止')
    }
  }

  playSound(key: string): void {
    const audio = this.audioCache.get(key)
    if (audio) {
      // 創建新的實例以支援重疊播放
      const soundInstance = audio.cloneNode() as HTMLAudioElement
      soundInstance.currentTime = 0
      // 確保新實例使用當前音量設定
      soundInstance.volume = audio.volume
      soundInstance.play().catch(e => this.log(`音效播放失敗: ${e}`))
      this.log(`🔊 音效播放: ${key}`)
    }
  }

  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume))
    
    // 設置預載入音頻的音量
    this.audioCache.forEach(audio => {
      audio.volume = normalizedVolume
    })
    
    // 設置正在播放的 BGM 音量
    this.activeBGMs.forEach(bgm => {
      bgm.volume = normalizedVolume
    })
  }

  private log(message: string): void {
    this.logger?.(message)
  }

  dispose(): void {
    // 停止所有 BGM
    this.stopBGM()
    
    // 清理預載入音頻
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    this.audioCache.clear()
    
    this.log('🗑️ 音頻管理器已清理')
  }
}

// 倒數計時器
export class CountdownTimer {
  private startTime: number = 0
  private duration: number = 0
  private isRunning: boolean = false
  private animationId: number | null = null
  private onTick?: (remaining: number) => void
  private onComplete?: () => void
  private logger?: (message: string) => void

  constructor(logger?: (message: string) => void) {
    this.logger = logger
  }

  start(duration: number, onTick?: (remaining: number) => void, onComplete?: () => void): void {
    this.duration = duration
    this.onTick = onTick
    this.onComplete = onComplete
    this.startTime = Date.now()
    this.isRunning = true

    this.log(`⏰ 倒數計時開始: ${duration} 秒`)
    this.tick()
  }

  private tick(): void {
    if (!this.isRunning) return

    const elapsed = (Date.now() - this.startTime) / 1000
    const remaining = Math.max(0, this.duration - elapsed)

    this.onTick?.(remaining)

    if (remaining <= 0) {
      this.stop()
      this.onComplete?.()
      this.log('⏰ 倒數計時完成')
    } else {
      this.animationId = requestAnimationFrame(() => this.tick())
    }
  }

  stop(): void {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  isActive(): boolean {
    return this.isRunning
  }

  private log(message: string): void {
    this.logger?.(message)
  }
}

// 角色動畫管理器
export class CharacterAnimationManager {
  private characters = new Map<string, any>() // Spine 實例
  private logger?: (message: string) => void

  constructor(logger?: (message: string) => void) {
    this.logger = logger
  }

  addCharacter(id: string, spine: any, type: CharacterType): void {
    this.characters.set(id, { spine, type })
    this.log(`角色已添加: ${id} (${type})`)
  }

  removeCharacter(id: string): void {
    this.characters.delete(id)
    this.log(`角色已移除: ${id}`)
  }

  moveToRocket(id: string, audioManager: AudioManager, canvasWidth?: number, canvasHeight?: number): void {
    const character = this.characters.get(id)
    if (!character) {
      this.log(`❌ moveToRocket: 角色 ${id} 不存在`)
      return
    }

    const { spine, type } = character
    
    // 檢查是否已經在移動中
    if (spine._isMoving) {
      this.log(`⚠️ 角色 ${id} 已經在移動中，跳過`)
      return
    }
    
    spine._isMoving = true
    this.log(`🚀 開始移動角色 ${id} 到火箭`)
    
    // 清除所有可能影響位置的動畫軌道
    if (spine.state) {
      spine.state.clearTracks()
      spine.state.timeScale = 1 // 僅在移動時恢復動畫更新
    }
    
    // 播放對應音效
    if (type === CharacterType.NPC) {
      audioManager.playSound('others_hop_on')
    } else {
      audioManager.playSound('user_hop_on')
    }

    // 只播放行走動畫，但不讓動畫影響位置
    this.playCharacterAnimation(spine, 'walk')
    
    // 開始自定義移動動畫
    this.animateCharacterMovement(spine, type, true, canvasWidth, canvasHeight)
    
    this.log(`🚶 角色 ${id} 移動到火箭`)
  }

  jumpOff(id: string, audioManager: AudioManager): void {
    const character = this.characters.get(id)
    if (!character) return

    const { spine, type } = character
    
    // 播放對應音效
    if (type === CharacterType.NPC) {
      audioManager.playSound('others_hop_off')
    } else {
      audioManager.playSound('user_hop_off')
    }

    // 恢復 Spine 動畫更新，讓跳躍動畫正常播放
    if (spine.state) {
      spine.state.timeScale = 1
    }

    // 播放跳躍動畫（讓 Spine 自己處理跳躍效果）
    this.playCharacterAnimation(spine, 'jump')
    
    // 設置角色朝向（NPC往右，玩家往左）
    if (type === CharacterType.NPC) {
      spine.scale.x = Math.abs(spine.scale.x) // 確保面向右邊
    } else {
      spine.scale.x = -Math.abs(spine.scale.x) // 面向左邊
    }
    
    // 延遲後移除角色（讓跳躍動畫播放完）
    setTimeout(() => {
      if (spine.parent) {
        spine.parent.removeChild(spine)
      }
    }, 1000) // 1秒後移除
    
    this.log(`🦘 角色 ${id} 跳離火箭`)
  }

  private playCharacterAnimation(spine: any, animationName: string): void {
    if (!spine || !spine.state || !spine.skeleton) return
    
    try {
      const animations = spine.skeleton.data.animations?.map((anim: any) => anim.name) || []
      
      // 檢查動畫是否存在
      if (animations.includes(animationName)) {
        spine.state.setAnimation(0, animationName, false)
        this.log(`🎬 播放角色動畫: ${animationName}`)
      } else {
        // 智能選擇備用動畫
        let fallbackAnimation = null
        
        // 根據請求的動畫類型選擇合適的備用動畫
        if (animationName === 'idle' || animationName === 'stand') {
          // 尋找待機類型的動畫
          fallbackAnimation = animations.find((name: string) => 
            name.includes('idle') || 
            name.includes('stand') || 
            name.includes('walk')
          )
        } else if (animationName === 'walk') {
          // 尋找行走類型的動畫
          fallbackAnimation = animations.find((name: string) => 
            name.includes('walk') || 
            name.includes('run')
          )
        } else if (animationName === 'jump') {
          // 尋找跳躍類型的動畫
          fallbackAnimation = animations.find((name: string) => 
            name.includes('jump') || 
            name.includes('leap')
          )
        }
        
        // 如果沒有找到合適的，使用第一個動畫
        if (!fallbackAnimation && animations.length > 0) {
          fallbackAnimation = animations[0]
        }
        
        if (fallbackAnimation) {
          spine.state.setAnimation(0, fallbackAnimation, false)
          this.log(`🔄 動畫 "${animationName}" 不存在，使用備用動畫: ${fallbackAnimation}`)
        } else {
          this.log(`❌ 角色沒有可用動畫`)
        }
      }
    } catch (error) {
      this.log(`❌ 播放角色動畫失敗: ${error}`)
    }
  }

  private animateCharacterMovement(spine: any, type: CharacterType, toRocket: boolean, canvasWidth?: number, canvasHeight?: number): void {
    if (!spine) return

    const startX = spine.x
    
    // 使用傳入的 Canvas 尺寸，或者嘗試獲取
    let finalCanvasWidth = canvasWidth || 400
    let finalCanvasHeight = canvasHeight || 300
    
    if (!canvasWidth || !canvasHeight) {
      if (spine.parent && 'renderer' in spine.parent) {
        // 從 Application 獲取螢幕尺寸
        const app = spine.parent as any
        if (app.screen) {
          finalCanvasWidth = app.screen.width
          finalCanvasHeight = app.screen.height
        }
      }
    }
    
    this.log(`📐 Canvas 尺寸使用 - 寬度: ${finalCanvasWidth}, 高度: ${finalCanvasHeight} (傳入: ${canvasWidth}x${canvasHeight})`)
    
    // 計算目標位置
    let targetX: number
    let targetY: number
    if (toRocket) {
      // 去火箭：移動到火箭底部位置
      const rocketX = finalCanvasWidth / 2 // 火箭在中央
      const rocketY = finalCanvasHeight * 0.45 // 火箭底部位置
      
      // 所有角色都聚集到火箭底部位置
      targetX = rocketX // 直接到畫面中間，不加偏移
      targetY = rocketY // 移動到火箭底部位置
      
      this.log(`🎯 目標位置計算 - 火箭X: ${rocketX}, 目標X: ${targetX}, Canvas寬度: ${finalCanvasWidth}, Canvas高度: ${finalCanvasHeight}`)
    } else {
      // 跳離：NPC往右跳，玩家往左跳
      const edgeOffset = finalCanvasWidth * 0.2
      targetX = type === CharacterType.NPC ? finalCanvasWidth + edgeOffset : -edgeOffset
      targetY = spine.y // 保持當前高度
    }

    const duration = 2000 // 2秒動畫
    const startTime = Date.now()

    const startY = spine.y
    
    // 記錄移動信息
    this.log(`🎯 角色移動 ${toRocket ? '上車' : '跳船'} - 起點: (${startX.toFixed(0)}, ${startY.toFixed(0)}) → 終點: (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`)
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用線性移動，沒有緩動效果
      const currentX = startX + (targetX - startX) * progress
      const currentY = targetY !== startY ? startY + (targetY - startY) * progress : startY
      
      // 強制設置位置，覆蓋任何 Spine 動畫的位置變化
      spine.x = currentX
      spine.y = currentY

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 動畫完成，清除移動標記
        spine._isMoving = false
        
        // 動畫完成，驗證最終位置
        this.log(`✅ 移動完成 - 最終位置: (${spine.x.toFixed(0)}, ${spine.y.toFixed(0)}), 目標位置: (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`)
        
        // 動畫完成後的處理
        if (!toRocket) {
          // 如果是跳船，動畫完成後移除角色
          setTimeout(() => {
            if (spine.parent) {
              spine.parent.removeChild(spine)
            }
          }, 500) // 延遲 0.5 秒後移除
        } else {
          // 如果是上車，停止所有動畫更新以固定位置
          if (spine.state) {
            spine.state.clearTracks()
            spine.state.timeScale = 0 // 暫停動畫時間，防止位置變化
          }
          this.log(`📍 角色已到達目標位置，停止動畫更新`)
        }
      }
    }

    animate()
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  getAllCharacters(): Map<string, any> {
    return this.characters
  }

  private log(message: string): void {
    this.logger?.(message)
  }

  dispose(): void {
    this.characters.clear()
    this.log('🗑️ 角色動畫管理器已清理')
  }
}

// 場景狀態管理器
export class SceneStateManager {
  private state: SceneState = SceneState.IDLE
  private onStateChange?: (state: SceneState) => void
  private logger?: (message: string) => void

  constructor(logger?: (message: string) => void) {
    this.logger = logger
  }

  setState(newState: SceneState): void {
    if (this.state !== newState) {
      const oldState = this.state
      this.state = newState
      this.onStateChange?.(newState)
      this.log(`🔄 場景狀態變更: ${oldState} → ${newState}`)
    }
  }

  getState(): SceneState {
    return this.state
  }

  onStateChanged(callback: (state: SceneState) => void): void {
    this.onStateChange = callback
  }

  private log(message: string): void {
    this.logger?.(message)
  }
}