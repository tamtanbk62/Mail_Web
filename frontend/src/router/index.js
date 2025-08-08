import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import SendMail from '@/components/SendMail.vue'
import MailList from '@/components/MailList.vue'
import MailDetail from '@/components/MailDetail.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/',
    component: MainView,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/inbox' },
      { path: 'inbox', component: MailList },
      { path: 'compose', component: SendMail },
      { path: 'sent', component: MailList },
      { path: 'drafts', component: MailList },
      { path: 'starred', component: MailList },
      {
        path: '/inbox/:uid',
        name: 'MailDetail',
        component: MailDetail
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/inbox');
  } else {
    next();
  }
})

export default router;