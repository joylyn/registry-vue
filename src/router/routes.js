import Vue from 'vue';
import Router from 'vue-router';
import SchemaRegContainer from '@/containers/SchemaRegistry/SchemaRegContainer.js';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SchemaRegContainer',
      component: SchemaRegContainer
    }
  ]
});
