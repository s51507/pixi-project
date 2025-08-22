/**
 * API functions for asset loading
 * Following project standards for data fetching
 */

import type { SpineAsset, StaticAsset, AudioAsset, AtlasData } from '@/types/animation'

// Import Spine assets
import bonusAtlas from '@/assets/cashorcrash2/spine/bonus/skeleton.atlas?url'
import bonusPng from '@/assets/cashorcrash2/spine/bonus/skeleton.png'

import jumpAtlas from '@/assets/cashorcrash2/spine/me-default1-jump_v3/skeleton.atlas?url'
import jumpPng from '@/assets/cashorcrash2/spine/me-default1-jump_v3/skeleton.png'

import walkAtlas from '@/assets/cashorcrash2/spine/me-default1-walk_v4/skeleton.atlas?url'
import walkPng from '@/assets/cashorcrash2/spine/me-default1-walk_v4/skeleton.png'

// Import UI assets
import avatar from '@/assets/cashorcrash2/avif/assets/avatar-D662mDCp.avif'
import addNormal from '@/assets/cashorcrash2/avif/assets/add_normal-DepYF-ue.avif'
import autoBg from '@/assets/cashorcrash2/avif/assets/auto_btn-C1gkCpkL.avif'
import balanceBg from '@/assets/cashorcrash2/avif/assets/balance_bg-DDJS2sCZ.avif'

// Import audio assets
import clickSound from '@/assets/cashorcrash2/mp3/assets/click-yOjLuJq2.mp3'
import bgmFly from '@/assets/cashorcrash2/mp3/assets/bgm_fly-DX4muDxO.mp3'
import winningSound from '@/assets/cashorcrash2/mp3/assets/winning-_MaDcpoI.mp3'

export async function fetchSpineAssets(): Promise<SpineAsset[]> {
  return [
    {
      key: 'bonus',
      name: '💰 獎勵動畫',
      atlasUrl: bonusAtlas,
      pngUrl: bonusPng,
      category: 'bonus'
    },
    {
      key: 'jump',
      name: '🦘 跳躍動畫',
      atlasUrl: jumpAtlas,
      pngUrl: jumpPng,
      category: 'character'
    },
    {
      key: 'walk',
      name: '🚶 行走動畫',
      atlasUrl: walkAtlas,
      pngUrl: walkPng,
      category: 'character'
    }
  ]
}

export async function fetchStaticAssets(): Promise<StaticAsset[]> {
  return [
    { key: 'avatar', name: '頭像', path: avatar, category: 'ui' },
    { key: 'addNormal', name: '加號按鈕', path: addNormal, category: 'ui' },
    { key: 'autoBg', name: '自動按鈕', path: autoBg, category: 'ui' },
    { key: 'balanceBg', name: '餘額背景', path: balanceBg, category: 'ui' }
  ]
}

export async function fetchAudioAssets(): Promise<AudioAsset[]> {
  return [
    { key: 'click', name: '點擊音效', path: clickSound, category: 'sfx' },
    { key: 'bgmFly', name: '飛行背景音樂', path: bgmFly, category: 'bgm' },
    { key: 'winning', name: '勝利音效', path: winningSound, category: 'sfx' }
  ]
}

export async function parseAtlasFile(atlasUrl: string): Promise<AtlasData> {
  try {
    // Add cache headers for better performance
    const response = await fetch(atlasUrl, {
      headers: {
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const atlasText = await response.text()
    
    const lines = atlasText.split('\n').map(line => line.trim()).filter(line => line)
    const frames: any[] = []
    
    // Parse first line - image file name
    const imagePath = lines[0]
    
    // Parse size line
    const sizeLine = lines.find(line => line.startsWith('size:'))
    const sizeMatch = sizeLine?.match(/size:(\d+),(\d+)/)
    const size = {
      width: sizeMatch ? parseInt(sizeMatch[1]) : 512,
      height: sizeMatch ? parseInt(sizeMatch[2]) : 512
    }
    
    // Parse frame data
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      
      // Check if this is a frame name line
      if (!line.includes(':') && 
          !line.startsWith('size:') && 
          !line.startsWith('filter:') && 
          !line.startsWith('pma:') &&
          !line.endsWith('.png') &&
          line.trim() !== '') {
        
        const frameName = line
        
        // Look for subsequent property lines
        let boundsLine = ''
        let rotated = false
        let offsets = null
        
        // Look at the next few lines for properties
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const nextLine = lines[j]
          
          if (nextLine.startsWith('bounds:')) {
            boundsLine = nextLine
          } else if (nextLine.trim() === 'rotate:90') {
            rotated = true
          } else if (nextLine.startsWith('offsets:')) {
            const offsetMatch = nextLine.match(/offsets:(-?\d+),(-?\d+),(\d+),(\d+)/)
            if (offsetMatch) {
              offsets = {
                x: parseInt(offsetMatch[1]),
                y: parseInt(offsetMatch[2]),
                width: parseInt(offsetMatch[3]),
                height: parseInt(offsetMatch[4])
              }
            }
          } else if (!nextLine.includes(':') && nextLine.trim() !== '') {
            // If we encounter another frame name, stop looking
            break
          }
        }
        
        if (boundsLine) {
          const boundsMatch = boundsLine.match(/bounds:(\d+),(\d+),(\d+),(\d+)/)
          if (boundsMatch) {
            frames.push({
              name: frameName,
              x: parseInt(boundsMatch[1]),
              y: parseInt(boundsMatch[2]),
              width: parseInt(boundsMatch[3]),
              height: parseInt(boundsMatch[4]),
              rotated,
              offsets
            })
          }
        }
      }
      i++
    }
    
    return {
      imagePath,
      size,
      frames
    }
  } catch (error) {
    throw new Error(`Atlas 解析失敗: ${error}`)
  }
}