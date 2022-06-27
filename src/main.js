import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VeeValidatePlugin from './includes/validation';
import { auth } from './includes/firebase';
import Icon from './directives/icon';
import './assets/tailwind.css';
import './assets/main.css';
import './registerServiceWorker';
import GlobalComponents from './includes/_globals';
import ProgressBar from './includes/progress-bar';

// import nprogress css
import 'nprogress/nprogress.css';

// make router accessible for ProgressBar
ProgressBar(router);

let app;

// initialise firebase before the main app, to allow us to start auth before we load app
auth.onAuthStateChanged(() => {
  // initialise app now that firebase auth is loaded
  if (!app) {
    app = createApp(App);
    app.use(store);
    app.use(router);
    app.use(VeeValidatePlugin);
    app.use(GlobalComponents);
    app.directive('icon', Icon);

    app.mount('#app');
  }
});
