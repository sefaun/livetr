import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/studio',
    name: 'StudioLayout',
    component: () => import('@/layouts/Studio.vue'),
    children: [
      {
        path: '/studio',
        name: 'Studio',
        component: () => import('@/views/Studio.vue'),
        children: [],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
