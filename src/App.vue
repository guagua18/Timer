<template>
  <f7-app v-bind="f7Params">
    <f7-view main url="/"></f7-view>
  </f7-app>
</template>

<script setup lang="ts">
import PomodoroTimer from './components/PomodoroTimer.vue'

const f7Params = {
  name: 'Pomodoro App',
  theme: 'ios',
  routes: [
    {
      path: '/',
      component: PomodoroTimer,
    },
  ],
}
</script>
