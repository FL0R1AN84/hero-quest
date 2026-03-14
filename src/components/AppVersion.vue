<script lang="ts" setup>
import packageJson from '../../package.json'

const version = packageJson.version
</script>

<template>
  <p class="text-sm">Version {{ version }}</p>
</template>

<style scoped></style>
