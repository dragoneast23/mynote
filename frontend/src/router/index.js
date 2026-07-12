import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('../views/Notes.vue')
  },
  {
    path: '/notes/add',
    name: 'AddNote',
    component: () => import('../views/AddNote.vue')
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: () => import('../views/NoteDetail.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/settings/account',
    name: 'Account',
    component: () => import('../views/Account.vue')
  },
  {
    path: '/settings/font',
    name: 'Font',
    component: () => import('../views/Font.vue')
  },
  {
    path: '/settings/export',
    name: 'Export',
    component: () => import('../views/Export.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoginPage = ['Login', 'Register'].includes(to.name)
  
  if (!token && !isLoginPage) {
    next('/')
  } else if (token && isLoginPage) {
    next('/notes')
  } else {
    next()
  }
})

export default router
