<script lang="ts" setup>
import AppVersion from '@/components/AppVersion.vue'
import AppWhatsNew from '@/components/AppWhatsNew.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen font-body">
    <RouterView />
    <footer class="app-footer text-center text-xs font-body" style="color: var(--hq-footer)">
      <AppVersion />
    </footer>
    <AppWhatsNew />
  </div>
</template>

<style scoped>
.app-footer {
  padding-block: var(--space-4);
}

@media (min-width: 480px) {
  .app-footer {
    padding-block: var(--space-2);
  }
}
</style>
