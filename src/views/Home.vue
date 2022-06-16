<template>
  <div class="home">
    <button @click="setting_map">setting</button>
    <div id='control_map' v-if="map.on_setting">
      <button @click="add_node">add node</button>
      <button @click="add_node">delete node</button>
    </div>
    <v-network-graph
    :layouts="layouts"
    :nodes="nodes"
    :edges="edges"
    :configs="configs"
    class="vnet"
    />
    <pre class="layouts">{{ layoutsText }}</pre>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import * as vNG from "v-network-graph"

export default defineComponent({
  name: 'Home',
  data : () => {
    return {
        map : {
          on_setting : false
        },
        configs : vNG.defineConfigs({
          node: {
            draggable: false,
          },
          view: {
            layoutHandler: new vNG.GridLayout({ grid: 15 }),
            grid: {
              visible: false,
              interval: 10,
              thickIncrements: 3,
              line: {
                color: "#123123",
                width: 0,
                dasharray: 1,
              },
              thick: {
                color: "#b3b3ff",
                width: 1,
                dasharray: 0,
              },
            }
          },
        }),
        nodes : {
          node1: { name: "Node 1" },
          node2: { name: "Node 2" },
          node3: { name: "Node 3" },
          node4: { name: "Node 4" },
        },
        edges : {
          edge1: { source: "node1", target: "node2" },
          edge2: { source: "node2", target: "node3" },
          edge3: { source: "node3", target: "node4" },
        },
        layouts : {
          nodes: {
            node1: { x: 0, y: 0 },
            node2: { x: 50, y: 50 },
            node3: { x: 100, y: 0 },
            node4: { x: 150, y: 50 },
          },
        }
         
    }
  },
  computed: {
      layoutsText(){
        return JSON.stringify(this.layouts, null, 2)
      },
      
  },
  methods: {
      setting_map(){
        this.map.on_setting = !this.map.on_setting
        this.configs.node.draggable = !this.configs.node.draggable
        this.configs.view.grid.visible = !this.configs.view.grid.visible
      },
      add_node(){
        this.nodes['node5'] = { name: 'node5'} 
      }
  },
  mounted(){
    const wheight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const vnetgraph = document.querySelector('.vnet')
    vnetgraph.style.height = `${wheight - 100}px`
  }
});
</script>

<style scoped>
  .vnet {
    background: #a6a5a744;
  }
  .layouts {
    position: absolute;
    inset: auto 10px 10px auto;
    padding: 10px;
    background: #ffff0044;
    border-radius: 4px;
    font-size: 10px;
    line-height: 11px;
  }
</style>
