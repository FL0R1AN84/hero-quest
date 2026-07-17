<script lang="ts" setup>
import AppVersion from '@/components/AppVersion.vue'
import AppUpdatePrompt from '@/components/AppUpdatePrompt.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen font-body">
    <RouterView />
    <footer class="text-center py-2 text-xs font-body" style="color: var(--hq-footer)">
      <AppVersion />
    </footer>
    <AppUpdatePrompt />
  </div>
</template>

<style scoped></style>
