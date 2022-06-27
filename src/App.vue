<template>
  <app-header />
  <!-- giving router-view these parameters and ghost component
       as well as transition components allows for route transitions -->
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component"></component>
    </transition>
  </router-view>

  <app-player />

  <auth-modal />

</template>

<script>
import AppHeader from './components/Header.vue';
import AuthModal from './components/Auth.vue';
import AppPlayer from './components/Player.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AuthModal,
    AppPlayer,
  },
  created() {
    this.$store.dispatch('init_login');
    this.$store.dispatch('init_player');
  },
};
</script>

<style>
.fade-enter-from {
  opacity: 0;
}

.fade-enter-active {
  transition: all 0.1s linear;
}

.fade-leave-to {
  transition: all 0.1s linear;
  opacity: 0;
}
</style>
