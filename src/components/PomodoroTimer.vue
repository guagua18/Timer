<template>
  <f7-page name="home">
    <f7-navbar title="Pomodoro Timer" large>
      <template #right>
        <f7-link sheet-open=".settings-sheet">
          <f7-icon f7="gear" size="24px"></f7-icon>
        </f7-link>
        <f7-icon f7="timer" size="28px" class="margin-left"></f7-icon>
      </template>
    </f7-navbar>
    <div class="timer-container">
      <div class="mode-switcher">
        <f7-segmented raised round>
          <f7-button :active="mode === 'work'" @click="setMode('work')" round>Work focus</f7-button>
          <f7-button :active="mode === 'break'" @click="setMode('break')" round>Short break</f7-button>
        </f7-segmented>
      </div>

      <div class="timer-circle-wrapper">
        <div class="timer-circle" :class="{ 'is-running': isRunning, 'is-break': mode === 'break' }">
          <div class="time-display">{{ formattedTime }}</div>
          <div class="mode-label">{{ mode === 'work' ? 'Focus Time' : 'Relax' }}</div>
        </div>
      </div>

      <div class="controls">
        <f7-button fill round large @click="toggleTimer" class="control-btn" :color="isRunning ? 'orange' : 'green'">
          <f7-icon :f7="isRunning ? 'pause_fill' : 'play_fill'"></f7-icon>
          {{ isRunning ? 'Pause' : 'Start' }}
        </f7-button>
        <f7-button outline round large @click="resetTimer" class="control-btn" color="red">
          <f7-icon f7="arrow_counterclockwise"></f7-icon>
          Reset
        </f7-button>
      </div>
    </div>

    <f7-sheet class="settings-sheet" style="height: auto" swipe-to-close backdrop @sheet:closed="onSettingsClosed" @sheet:opened="onSheetOpened">
      <f7-toolbar>
        <div class="left"></div>
        <div class="right">
          <f7-link sheet-close @click="onSettingsClosed">Done</f7-link>
        </div>
      </f7-toolbar>
      <f7-page-content>
        <f7-block-title>Timer Settings (Minutes)</f7-block-title>
        <f7-block-title>Work Duration (min)</f7-block-title>
        <f7-block strong-ios outline-ios class="no-padding">
          <div id="work-picker" style="height: 180px; margin: 0 auto;"></div>
        </f7-block>

        <f7-block-title>Break Duration (min)</f7-block-title>
        <f7-block strong-ios outline-ios class="no-padding">
          <div id="break-picker" style="height: 180px; margin: 0 auto;"></div>
        </f7-block>
      </f7-page-content>
    </f7-sheet>
  </f7-page>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'
import { f7, f7ready } from 'framework7-vue'

const mode = ref<'work' | 'break'>('work')

// Configuration in minutes
const workTimeMinutes = ref(25)
const breakTimeMinutes = ref(5)

// The active target time depending on mode
const currentTargetTime = computed(() => {
  return mode.value === 'work' ? workTimeMinutes.value * 60 : breakTimeMinutes.value * 60
})

const timeLeft = ref(currentTargetTime.value)
const isRunning = ref(false)
let timerInterval: number | null = null

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const setMode = (newMode: 'work' | 'break') => {
  if (mode.value !== newMode) {
    mode.value = newMode
  }
  pauseTimer()
  timeLeft.value = currentTargetTime.value
}

const saveHistory = (completedMode: 'work' | 'break', duration: number) => {
  const record = {
    mode: completedMode,
    duration: duration,
    timestamp: Date.now()
  }
  const existing = localStorage.getItem('pomodoro_history')
  const history = existing ? JSON.parse(existing) : []
  history.push(record)
  localStorage.setItem('pomodoro_history', JSON.stringify(history))
  
  // Custom event to trigger History page hot reload
  window.dispatchEvent(new Event('history-updated'))
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  if (timerInterval) return
  isRunning.value = true
  timerInterval = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      pauseTimer()
      // Save full session length based on configured duration
      saveHistory(mode.value, mode.value === 'work' ? workTimeMinutes.value : breakTimeMinutes.value)
      setMode(mode.value === 'work' ? 'break' : 'work')
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = currentTargetTime.value
}

// When settings are closed, if not running, reset time to new target just in case it was changed
const onSettingsClosed = () => {
  if (!isRunning.value) {
    timeLeft.value = currentTargetTime.value
  }
}

watch([workTimeMinutes, breakTimeMinutes], () => {
  if (!isRunning.value) {
    timeLeft.value = currentTargetTime.value
  }
})

let workPicker: any = null
let breakPicker: any = null

const onSheetOpened = () => {
  if (!workPicker) {
    workPicker = f7.picker.create({
      containerEl: '#work-picker',
      inline: true,
      value: [workTimeMinutes.value.toString()],
      cols: [
        {
          textAlign: 'center',
          values: Array.from({length: 120}, (_, i) => (i + 1).toString()),
        }
      ],
      on: {
        change: function (picker: any, values: any) {
          if (values[0]) {
            workTimeMinutes.value = Number(values[0])
          }
        }
      }
    });
  }

  if (!breakPicker) {
    breakPicker = f7.picker.create({
      containerEl: '#break-picker',
      inline: true,
      value: [breakTimeMinutes.value.toString()],
      cols: [
        {
          textAlign: 'center',
          values: Array.from({length: 60}, (_, i) => (i + 1).toString()),
        }
      ],
      on: {
        change: function (picker: any, values: any) {
          if (values[0]) {
            breakTimeMinutes.value = Number(values[0])
          }
        }
      }
    });
  }
}

onUnmounted(() => {
  pauseTimer()
  if (workPicker) workPicker.destroy()
  if (breakPicker) breakPicker.destroy()
})
</script>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 100px);
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.mode-switcher {
  width: 100%;
  max-width: 320px;
  margin-bottom: 50px;
}

.timer-circle-wrapper {
  margin-bottom: 60px;
}

.timer-circle {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 12px solid var(--f7-theme-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f5 100%);
  position: relative;
}

.timer-circle::before {
  content: '';
  position: absolute;
  top: -16px;
  left: -16px;
  right: -16px;
  bottom: -16px;
  border-radius: 50%;
  border: 2px dashed rgba(0,0,0,0.1);
  animation: rotate 20s linear infinite;
  opacity: 0;
  transition: opacity 0.3s;
}

.timer-circle.is-running::before {
  opacity: 1;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

.timer-circle.is-running {
  box-shadow: 0 0 45px rgba(0, 122, 255, 0.4);
  transform: scale(1.02);
}

.timer-circle.is-break {
  border-color: var(--f7-color-green);
}

.timer-circle.is-break.is-running {
  box-shadow: 0 0 45px rgba(52, 199, 89, 0.4);
}

.time-display {
  font-size: 78px;
  font-weight: 800;
  color: #1c1c1e;
  line-height: 1;
  letter-spacing: -2px;
}

.mode-label {
  margin-top: 12px;
  font-size: 16px;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 320px;
}

.control-btn {
  flex: 1;
  font-weight: bold;
  height: 50px;
  font-size: 16px;
}
</style>
