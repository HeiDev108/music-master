import { createRouter, createWebHistory } from 'vue-router';

// guards are not able to reference *this as it triggers before the component loads
// so we need to import store to allow us to check authentication values
// import store from '@/store';
import store from '@/store';

// instead of regular import, import with webpack as chunks
const Home = () => import('@/views/Home.vue');
const Manage = () => import(/* webpackChunkName: "ManageChunk" */'@/views/Manage.vue');
const Song = () => import(/* webpackChunkName: "songChunk" */'@/views/Song.vue');
const Queue = () => import(/* webpackChunkName: "QueueChunk" */'@/views/Queue.vue');
const Playlists = () => import(/* webpackChunkName: "PlaylistsChunk" */'@/views/Playlists.vue');
const Playlist = () => import(/* webpackChunkName: "PlaylistChunk" */'@/views/Playlist.vue');

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
  },
  {
    name: 'playlists',
    path: '/playlists',
    component: Playlists,
  },
  {
    name: 'queue',
    path: '/queue',
    component: Queue,
  },
  {
    name: 'manage',
    // alias: '/manage', - can use this as an alias
    path: '/manage-music',
    component: Manage,
    meta: { requiresAuth: true },
  },
  {
    // alternatively to alias, we can set up a redirect,
    //  which is often better for SEO to find new/changed urls
    path: '/manage',
    redirect: { name: 'manage' },
  },
  {
    name: 'song',
    path: '/song/:id',
    component: Song,
  },
  {
    name: 'playlist',
    path: '/playlist/:id',
    component: Playlist,
  },
  {
    // a catch-all redirect to redirect visitors to whichever page you like.
    // Can use for 404, or any other redirect
    path: '/:catchAll(.*)*',
    redirect: { name: 'home' },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkExactActiveClass: 'text-yellow-500',
});

// check user auth and redirect them to the home page if they are not authorised
router.beforeEach((to, from, next) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    next();
    return;
  }
  if (store.state.auth.userLoggedIn) {
    next();
  } else {
    next({ name: 'home' });
  }
});

export default router;
