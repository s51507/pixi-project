
import { getRandomNum } from '@/utils'
import { 
  createSpineAnimation,
  playSpineAnimation,
  applySpineTransform,
} from '@/utils/pixi'
import { createLogger } from '@/utils/pixi/logger'
import { createFollowText } from '@/utils/pixi/textFollower'
import type { CharacterType, Character } from '../types'
import { useBaseConfig } from './useBaseConfig'

const logger = createLogger()

export const useCharacters = (getApp: () => any, getRocketSpine: () => any) => {
  // 基礎配置
  const {
    gameWidth,
    gameHeight,
    scaleFactorX,
    // scaleFactorY,
    baseScale,
    baseOffsetY
  } = useBaseConfig()
  // 角色實例管理
  const characters: Map<string, Character> = new Map()

  // 固定使用 funkyRocket 的 getSpineAssets 函數
  const getSpineAssets = (animationName: string) => {
    return {
      skelPath: `/funkyRocket/spine/${animationName}/${animationName}.skel`,
      atlasPath: `/funkyRocket/spine/${animationName}/${animationName}.atlas`,
      imagePath: `/funkyRocket/spine/${animationName}/${animationName}.png`
    }
  }

  // 創建角色（走路動畫）
  const createCharacterWalk = async (type: CharacterType, id: string): Promise<Character | null> => {
    const app = getApp()
    if (!app) return null
  
    try {
      logger.info(`👤 創建角色: ${type} (${id})`)
      
      // 所有角色都使用統一的上車動畫
      const animationName = 'walk'
      
      const characterAssets = getSpineAssets(animationName)
      const spineResult = await createSpineAnimation({
        skelPath: characterAssets.skelPath,
        atlasPath: characterAssets.atlasPath,
        imagePath: characterAssets.imagePath
      })
      
      const spine = spineResult.spine
      // spine.zIndex = 2 // 角色在火箭之上
      
      // 設定角色起始位置 - 所有角色都從正中間開始 (考慮縮放因子)
      const scale = baseScale.value * 1.1  // 放大角色，讓它更明顯
      const startX = gameWidth.value / 2 // 從正中間開始
      const startY = gameHeight.value / 2 + baseOffsetY.value  // 接近地面位置 + 基礎偏移量
      
      logger.info(`🎯 角色起始位置: (${startX}, ${startY}), 畫面大小: ${gameWidth.value}x${gameHeight.value}`)
      
      // 玩家和主播需要鏡像反轉
      const shouldFlip = type === 'player' || type === 'streamer'
      
      applySpineTransform(spine, {
        x: startX,
        y: startY,
        scaleX: shouldFlip ? -scale : scale, // 負值表示左右反轉
        scaleY: scale
      })
      
      app.stage.addChild(spine)

      const character: Character = {
        id,
        type,
        spine,
        position: { x: startX, y: startY },
        isVisible: true
      }
      
      characters.set(id, character)
      logger.info(`✅ 角色創建成功: ${type} (${id})`)
      
      return character
      
    } catch (error) {
      logger.error(`❌ 角色創建失敗 ${type}: ${error}`)
      return null
    }
  }

  // 角色動畫 - 上車
  const animateCharacterWalk = async (character: Character, _direction: 'left' | 'right'): Promise<void> => {
    if (!character.spine) return
    
    return new Promise<void>((resolve, reject) => {
      try {
        const app = getApp()
        if (!app) return reject(new Error('App not available'))

        const isNpc = _direction !== 'left'
        const animationName = isNpc ? 'others_walk' : 'me_walk'
        
        // 播放跳躍動畫（原地跳躍）
        playSpineAnimation(character.spine, animationName, false)
        
        // 移動到火箭附近的地面位置 (考慮縮放因子)
        const directionOffsetX = (isNpc ? 10 : -10) * scaleFactorX.value // 偏移量也要縮放
        const targetX = gameWidth.value / 2 + directionOffsetX // 畫面水平中心點
        const targetY = gameHeight.value / 2 + baseOffsetY.value  // 畫面中心 + 基礎偏移量
        
        const startX = character.position.x
        const startY = character.position.y
        const duration = 3000 // 3秒
        const startTime = Date.now()
        
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          const easeOut = 1 - Math.pow(1 - progress, 3)
          const currentX = startX + (targetX - startX) * easeOut
          const currentY = startY + (targetY - startY) * easeOut
          
          applySpineTransform(character.spine, {
            x: currentX,
            y: currentY,
            scaleX: isNpc ? baseScale.value : -baseScale.value,
            scaleY: baseScale.value
          })
          
          character.position.x = currentX
          character.position.y = currentY
          
          if (progress < 1) requestAnimationFrame(animate)
          else {
            // 動畫完成，移除角色
            if (app && app.stage.getChildIndex(character.spine) !== -1) {
              app.stage.removeChild(character.spine)
            }
            characters.delete(character.id)
            logger.info(`✅ ${character.type} 上車完成，角色已移除`)
            
            // 🆕 動畫完成後 resolve Promise
            resolve()
          }
        }
        
        animate()
        
      } catch (error) {
        logger.error(`❌ ${character.type} 上車動畫失敗: ${error}`)
        reject(error)
      }
    })
  }

  // 創建下車角色（使用 jump 動畫）
  const createCharacterJump = async (type: CharacterType, id: string, followText: string = ''): Promise<Character | null> => {
    const app = getApp()
    const rocketSpine = getRocketSpine()
    if (!app) return null
    
    try {
      logger.info(`🎯 創建下車角色 ${type} (${id})`)
      
      const isNpc = type === 'npc'
      const animationName = 'jump'
      const characterAssets = getSpineAssets(animationName)
      const spineResult = await createSpineAnimation({
        skelPath: characterAssets.skelPath,
        atlasPath: characterAssets.atlasPath,
        imagePath: characterAssets.imagePath
      })
      
      const spine = spineResult.spine
      
      // 從火箭的實際位置開始 (考慮縮放因子)
      const startX = rocketSpine ? rocketSpine.x : gameWidth.value / 2
      const startY = rocketSpine ? rocketSpine.y : gameHeight.value / 2 + baseOffsetY.value
      
      // 初始設置
      applySpineTransform(spine, {
        x: startX,
        y: startY,
        scaleX: isNpc ? -baseScale.value : baseScale.value,
        scaleY: baseScale.value
      })
      
      app.stage.addChild(spine)
      
      // 為角色創建文字跟隨（如果需要）
      const { textResult, boneTracker } = await createFollowText(app, spine, startX, startY, followText)
      
      const character: Character = {
        id,
        type,
        spine,
        position: { x: startX, y: startY },
        isVisible: true,
        boneTracker,
        textResult
      }
      
      characters.set(id, character)
      logger.info(`✅ 下車角色創建成功: ${type} (${id})`)
      
      return character
      
    } catch (error) {
      logger.error(`❌ 下車角色創建失敗 ${type}: ${error}`)
      return null
    }
  }

  // 角色動畫 - 下車（跳躍）
  const animateCharacterJump = async (character: Character): Promise<void> => {
    const app = getApp()
    if (!character.spine || !app) return
    
    try {
      logger.info(`🎯 開始 ${character.type} 下車動畫，起始位置: (${character.position.x}, ${character.position.y})`)
      
      const isNpc = character.type === 'npc'
      const randomAnimationNumber = ['', 2, 3][getRandomNum(0, 3)]
      const animationName = isNpc ? `jump_others${randomAnimationNumber}` : `jump_me${randomAnimationNumber}`

      // 播放跳躍動畫（原地跳躍）
      playSpineAnimation(character.spine, animationName, false)

      const scale = baseScale.value
      
      // 設置 Spine 的縮放，但保持位置不變
      applySpineTransform(character.spine, {
        x: character.spine.x,  // 保持原位置
        y: character.spine.y,  // 保持原位置
        scaleX: isNpc ? -scale : scale,
        scaleY: scale
      })

      // 啟動骨骼追蹤器並顯示文字
      if (character.boneTracker && character.textResult) {
        character.boneTracker.startTracking()
        
        // 等一個 frame 讓骨骼追蹤器計算位置，然後顯示文字
        requestAnimationFrame(() => {
          character.textResult!.textObject.visible = true
        })
      }
      
      const duration = 3000 // 3秒跳躍動畫
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 檢查動畫是否完成
        if (progress < 1) requestAnimationFrame(animate)
        else {
          // 動畫完成，清理資源
          if (character.boneTracker) {
            character.boneTracker.stopTracking()
            character.boneTracker.dispose()
          }

          if (character.textResult && app && app.stage.getChildIndex(character.textResult.textObject) !== -1) {
            app.stage.removeChild(character.textResult.textObject)
            character.textResult.destroy()
          }

          // 移除 Spine
          if (app && app.stage.getChildIndex(character.spine) !== -1) {
            app.stage.removeChild(character.spine)
          }

          characters.delete(character.id)
          logger.info(`✅ ${character.type} 下車完成`)
        }
      }

      animate()

    } catch (error) {
      logger.error(`❌ ${character.type} 下車動畫失敗: ${error}`)
    }
  }

  // 更新現有角色縮放
  const updateCharactersScale = (): void => {
    for (const character of characters.values()) {
      if (character.spine) {
        const isNpc = character.type === 'npc'
        applySpineTransform(character.spine, {
          x: character.spine.x, // 保持當前位置
          y: character.spine.y, // 保持當前位置
          scaleX: isNpc ? -baseScale.value : (character.type === 'player' || character.type === 'streamer') ? -baseScale.value : baseScale.value,
          scaleY: baseScale.value
        })
      }
    }
  }

  // 清理所有角色
  const destroyAllCharacters = (): void => {
    const app = getApp()
    if (!app) return

    for (const character of characters.values()) {
      if (character.boneTracker) {
        character.boneTracker.stopTracking()
        character.boneTracker.dispose()
      }

      if (character.textResult && app.stage.getChildIndex(character.textResult.textObject) !== -1) {
        app.stage.removeChild(character.textResult.textObject)
        character.textResult.destroy()
      }

      if (app.stage.getChildIndex(character.spine) !== -1) {
        app.stage.removeChild(character.spine)
      }
    }
    characters.clear()

    logger.info('🧹 所有角色已清理')
  }

  // 等待所有角色動畫完成
  const waitForAllCharactersComplete = async (): Promise<void> => {
    while (characters.size > 0) {
      logger.info(`⏳ 等待上車動畫完成，剩餘角色: ${characters.size}`)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  // 獲取指定角色
  const getCharacter = (id: string): Character | undefined => {
    return characters.get(id)
  }

  // 獲取所有角色
  const getAllCharacters = (): Character[] => {
    return Array.from(characters.values())
  }

  // 獲取角色數量
  const getCharacterCount = (): number => {
    return characters.size
  }

  return {
    // 方法
    createCharacterWalk,
    createCharacterJump,
    animateCharacterWalk,
    animateCharacterJump,
    updateCharactersScale,
    destroyAllCharacters,
    waitForAllCharactersComplete,
    getCharacter,
    getAllCharacters,
    getCharacterCount
  }
}
