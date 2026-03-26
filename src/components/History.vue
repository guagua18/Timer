<template>
  <f7-page name="history" @page:tabshow="loadHistory">
    <f7-navbar title="History" large></f7-navbar>
    
    <f7-block-title v-if="history.length > 0">Recent Completed Sessions</f7-block-title>
    <f7-list strong-ios outline-ios dividers-ios media-list v-if="history.length > 0">
      <f7-list-item
        v-for="(item, index) in reversedHistory"
        :key="index"
        :title="item.mode === 'work' ? 'Focus Session' : 'Short Break'"
        :after="`${item.duration} min`"
        :subtitle="new Date(item.timestamp).toLocaleString()"
      >
        <template #media>
          <f7-icon 
            :f7="item.mode === 'work' ? 'briefcase_fill' : 'cup_fill'" 
            :color="item.mode === 'work' ? 'blue' : 'green'" 
            size="32px"
          ></f7-icon>
        </template>
      </f7-list-item>
    </f7-list>
    
    <f7-block v-else class="text-align-center text-color-gray" style="margin-top: 50px;">
      <f7-icon f7="clock_badge_xmark" size="64px" color="gray"></f7-icon>
      <p style="font-size: 16px; margin-top: 15px;">No recorded sessions yet.</p>
      <p style="font-size: 14px; opacity: 0.7;">Complete a timer to see it here!</p>
    </f7-block>
  </f7-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface HistoryRecord {
  mode: 'work' | 'break';
  duration: number;
  timestamp: number;
}

const history = ref<HistoryRecord[]>([])

// Create a reversed copy for display so newest is at the top
const reversedHistory = computed(() => {
  return [...history.value].reverse()
})

const loadHistory = () => {
  const saved = localStorage.getItem('pomodoro_history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      console.error("Failed to parse history", e)
      history.value = []
    }
  }
}

onMounted(() => {
  loadHistory()
  window.addEventListener('history-updated', loadHistory)
})

onUnmounted(() => {
  window.removeEventListener('history-updated', loadHistory)
})
</script>
