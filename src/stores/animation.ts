/**
 * Pinia store for animation state management
 * Following project standards for global state
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { 
  AnimationState, 
  SpineAsset, 
  StaticAsset, 
  AudioAsset,
  AtlasData,
  AtlasFrame 
} from '@/types/animation'

export const useAnimationStore = defineStore('animation', () => {
  // State
  const selectedAsset = ref<string | null>(null)
  const selectedAnimation = ref<string | null>(null)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentFrame = ref(0)
  const totalFrames = ref(0)
  const playbackSpeed = ref(1.0)
  const scale = ref(1.0)
  const loop = ref(true)
  const showGrid = ref(true)
  const volume = ref(0.5)
  const status = ref('準備就緒')

  // Animation data
  const atlasData = ref<AtlasData | null>(null)
  const currentFrameData = ref<AtlasFrame | null>(null)
  const availableAnimations = ref<string[]>([])

  // Computed
  const animationState = computed((): AnimationState => ({
    selectedAsset: selectedAsset.value,
    selectedAnimation: selectedAnimation.value,
    isPlaying: isPlaying.value,
    isPaused: isPaused.value,
    currentFrame: currentFrame.value,
    totalFrames: totalFrames.value,
    playbackSpeed: playbackSpeed.value,
    scale: scale.value,
    loop: loop.value,
    showGrid: showGrid.value,
    volume: volume.value
  }))

  const canPlay = computed(() => 
    selectedAsset.value && 
    selectedAnimation.value && 
    !isPlaying.value
  )

  const canPause = computed(() => 
    isPlaying.value && !isPaused.value
  )

  const canResume = computed(() => 
    isPlaying.value && isPaused.value
  )

  // Actions
  function setSelectedAsset(assetKey: string | null) {
    selectedAsset.value = assetKey
    if (!assetKey) {
      resetAnimation()
    }
  }

  function setSelectedAnimation(animationName: string | null) {
    selectedAnimation.value = animationName
    if (!animationName) {
      stop()
    }
  }

  function setAtlasData(data: AtlasData | null) {
    atlasData.value = data
    if (data) {
      totalFrames.value = data.frames.length
      availableAnimations.value = data.frames.map(frame => frame.name)
    } else {
      totalFrames.value = 0
      availableAnimations.value = []
    }
  }

  function setCurrentFrame(frameIndex: number) {
    if (atlasData.value && frameIndex >= 0 && frameIndex < atlasData.value.frames.length) {
      currentFrame.value = frameIndex
      currentFrameData.value = atlasData.value.frames[frameIndex]
    }
  }

  function play() {
    if (canPlay.value) {
      isPlaying.value = true
      isPaused.value = false
      status.value = `播放動畫: ${selectedAnimation.value}`
    }
  }

  function pause() {
    if (canPause.value) {
      isPaused.value = true
      status.value = '動畫已暫停'
    }
  }

  function resume() {
    if (canResume.value) {
      isPaused.value = false
      status.value = `繼續播放: ${selectedAnimation.value}`
    }
  }

  function stop() {
    isPlaying.value = false
    isPaused.value = false
    currentFrame.value = 0
    status.value = '動畫已停止'
  }

  function nextFrame() {
    if (atlasData.value) {
      let nextIndex = currentFrame.value + 1
      if (nextIndex >= totalFrames.value) {
        if (loop.value) {
          nextIndex = 0
        } else {
          stop()
          return
        }
      }
      setCurrentFrame(nextIndex)
    }
  }

  function previousFrame() {
    if (atlasData.value) {
      let prevIndex = currentFrame.value - 1
      if (prevIndex < 0) {
        prevIndex = totalFrames.value - 1
      }
      setCurrentFrame(prevIndex)
    }
  }

  function setPlaybackSpeed(speed: number) {
    playbackSpeed.value = Math.max(0.1, Math.min(3.0, speed))
  }

  function setScale(newScale: number) {
    scale.value = Math.max(0.1, Math.min(3.0, newScale))
  }

  function toggleGrid() {
    showGrid.value = !showGrid.value
  }

  function setVolume(newVolume: number) {
    volume.value = Math.max(0, Math.min(1, newVolume))
  }

  function setStatus(message: string) {
    status.value = message
  }

  function resetAnimation() {
    stop()
    setAtlasData(null)
    setSelectedAnimation(null)
    currentFrameData.value = null
  }

  function resetPosition() {
    currentFrame.value = 0
    if (atlasData.value?.frames.length) {
      setCurrentFrame(0)
    }
    status.value = '位置已重置'
  }

  return {
    // State
    selectedAsset,
    selectedAnimation,
    isPlaying,
    isPaused,
    currentFrame,
    totalFrames,
    playbackSpeed,
    scale,
    loop,
    showGrid,
    volume,
    status,
    atlasData,
    currentFrameData,
    availableAnimations,

    // Computed
    animationState,
    canPlay,
    canPause,
    canResume,

    // Actions
    setSelectedAsset,
    setSelectedAnimation,
    setAtlasData,
    setCurrentFrame,
    play,
    pause,
    resume,
    stop,
    nextFrame,
    previousFrame,
    setPlaybackSpeed,
    setScale,
    toggleGrid,
    setVolume,
    setStatus,
    resetAnimation,
    resetPosition
  }
})