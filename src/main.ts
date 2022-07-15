import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VNetworkGraph from "v-network-graph"
import "v-network-graph/lib/style.css"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App).
              use(store).
              use(router).
              use(VNetworkGraph).
              use(ElementPlus).
              mount('#app')
