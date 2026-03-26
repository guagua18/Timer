<template>
  <f7-app v-bind="f7Params">
    <!-- Views/Tabs container -->
    <f7-views tabs class="safe-areas">
      <!-- Tabbar for switching views-tabs -->
      <f7-toolbar tabbar bottom>
        <f7-link tab-link="#view-timer" tab-link-active icon-f7="timer" text="Timer"></f7-link>
        <f7-link tab-link="#view-history" icon-f7="list_dash" text="History"></f7-link>
      </f7-toolbar>

      <!-- Main Timer View -->
      <f7-view id="view-timer" main tab tab-active url="/"></f7-view>

      <!-- History View -->
      <f7-view id="view-history" name="history" tab url="/history/"></f7-view>
    </f7-views>
  </f7-app>
</template>

<script setup lang="ts">
import PomodoroTimer from './components/PomodoroTimer.vue'
import HistoryPage from './components/History.vue'

const f7Params = {
  name: 'Pomodoro App',
  theme: 'ios',
  routes: [
    {
      path: '/',
      component: PomodoroTimer,
    },
    {
      path: '/history/',
      component: HistoryPage,
    },
  ],
}
</script>
