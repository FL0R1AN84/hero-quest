import { createRouter, createWebHistory } from 'vue-router'
import SkillSheet from '@/views/SkillSheet.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'skill-sheet',
      component: SkillSheet,
    },
  ],
})

export default router
