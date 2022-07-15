<template>
  <div class="netgraph">
    <el-button @click="setting_map">setting</el-button>
    <button @click="change_map" >change </button>
    <div id='control_map' v-if="map.on_setting">
      <button v-if="!map.show_add_node" @click=" () => this.map.show_add_node = true ">add node</button>
      <button v-if="!map.show_add_edge" @click="show_add_edge">add edge</button>
    </div>
    <div v-if="map.show_add_node">
      <label for="new_node_ip">IP</label><input id="new_node_ip" v-model="new_node.ip"/>
      <label for="new_node_name">Name</label><input id="new_node_name" v-model="new_node.name"/>
      <label for="new_node_model">Model</label><input id="new_node_model" v-model="new_node.model"/>  
      <button @click="add_node" :disabled="!(new_node.ip && new_node.name)">add</button>
    </div>
    <div v-if="map.show_add_edge">
      <label for="new_node_on_port">{{selectedNodes[0]}} on port</label><input id="new_node_on_port" v-model="new_edge.on_port"/>
      <label for="new_node_to_port">{{selectedNodes[1]}} to port</label><input id="new_node_to_port" v-model="new_edge.to_port"/> 
      <button @click="add_edge" :disabled="!(new_edge.on_port && new_edge.to_port)">add</button>
    </div>
    <div>
      <button @click="Save">Save </button>
    </div>
    <div class='search_vlan'>
        <input v-model="searching_vlan" /> <button @click="search_path_vlan">find</button>
    </div>
    <div class="tooltip-wrapper">
      <v-network-graph
        v-model:selected-nodes="selectedNodes"
        :layouts="layouts"
        :nodes="nodes"
        :edges="edges"
        :configs="configs"
        :event-handlers="eventHandlers"
        class="vnet"
      >
        <template #edge-label="{ edgeId, edge, scale, ...slotProps }">
          <v-edge-label
            :text="edge.on_port_name"
            align="source"
            vertical-align="above"
            fill="#ff5500"
            v-bind="slotProps"
            :font-size="14 * scale"
          />
          <v-edge-label
            :text="edge.to_port_name"
            align="target"
            vertical-align="above"
            v-bind="slotProps"
            fill="#ff5500"
            :font-size="14 * scale"
          />
        </template>
      </v-network-graph>
    </div>
    <pre class="layouts">{{ layoutsText }}</pre>

    <div ref="nodeMenu" class="context-menu">
      <el-menu
          :default-active="activeIndex2"
          class="el-menu-demo"
          mode="vertical"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
      >
          <el-sub-menu v-for="(data,index) in interfaces" :index="index" :key="index" @select="handleSelect">
              <template #title>{{data.name}}</template>
              <el-sub-menu :index="`${index}-1`">
                      <template #title>Сменить Режим</template>
                      <el-menu-item v-for="(mode,j) in modes" :key="j" :index="`${index}-1-${j}`" @click="change_mode_port(index,mode,menuTargetNode)">{{mode}}</el-menu-item>
              </el-sub-menu>
              <el-sub-menu :index="`${index}-2`">
                      <template #title>Назначить ACCESS VLAN</template>
                      <el-menu-item :index="`${index}-2-1`">
                          <div>
                              <el-row>
                                  <el-col :span="14">
                                      <el-input v-model="operator.access_vlan"
                                          size="small"
                                          placeholder="Please Input"
                                      >
                                      </el-input>
                                  </el-col>
                                  <el-col :span="9">
                                      <el-button type="primary" size="small" @click="add_access_vlan(index,menuTargetNode)" plain>OK</el-button>
                                  </el-col>
                              </el-row>
                          </div>
                      </el-menu-item>
              </el-sub-menu>
              <el-sub-menu :index="`${index}-3`">
                      <template #title>Добавить TRUNK VLAN</template>
                      <el-menu-item :index="`${index}-3-1`">
                          <div>
                              <el-row>
                                  <el-col :span="14">
                                      <el-input v-model="operator.trunk_vlan"
                                          size="small"
                                          placeholder="Please Input"
                                      >
                                      </el-input>     
                                  </el-col>
                                  <el-col :span="9">
                                      <el-button type="primary" size="small" @click="add_trunk_vlans(index,menuTargetNode)" plain>OK</el-button>
                                  </el-col>
                              </el-row>
                          </div>
                      </el-menu-item>
              </el-sub-menu>
          </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import * as vNG from "v-network-graph"
import axios from 'axios'

export default defineComponent({
  name: 'netgraph',
  props: {
    map_name: String
  },
  data : () => {
    return {
        menuTargetNode: '',
        interfaces: [],
        operator: {
          access_vlan : '',
          trunk_vlan : '',
        },
        map : {
          on_setting : false,
          show_add_node : false,
          show_add_edge : false
        },
        new_node: {
          ip: '',
          name: '',
          model: ''
          
        },
        new_edge: {
          on_port : '',
          to_port : '',
        },
        searching_vlan: '',
        selectedNodes : [],
        configs : vNG.defineConfigs({
          node: {
            draggable: false,
            selectable: true,
            label: {
                visible: true,
                direction: node => node.directionText
            },  
          },
          edge: {
            label: {
              fontFamily: undefined,
              fontSize: 11,
              lineHeight: 1.1,
              color: "#000000",
              margin: 4,
              padding: 27,
              background: {
                visible: true,
                color: "#ffffff",
                padding: {
                  vertical: 1,
                  horizontal: 4,
                },
                borderRadius: 2,
              },
            },
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
          /*
          node1: { name: "Node 1" },
          node2: { name: "Node 2" },
          node3: { name: "Node 3" },
          node4: { name: "Node 4" },
          */
        },
        edges : {
          /*
          edge1: { source: "node1", target: "node2" },
          edge2: { source: "node2", target: "node3" },
          edge3: { source: "node3", target: "node4" },
          */
        },
        layouts : {
          nodes: {
            /*
            node1: { x: 0, y: 0 },
            node2: { x: 50, y: 50 },
            node3: { x: 100, y: 0 },
            node4: { x: 150, y: 50 },
            */
          },
        },
        eventHandlers: {}
    }
  },
  watch: {
    selectedNodes(newVal){
       
       if(newVal.length >= 2 && this.map.on_setting)
          this.configs.node.selectable = false
       else
          this.configs.node.selectable = true
    }
  },
  computed: {
      layoutsText(){
        return JSON.stringify(this.layouts, null, 2)
      },
  },
  methods: {
      add_trunk_vlans(data_port,node){
        console.log(node)
        const ip = node.ip
        const vlan = this.operator.trunk_vlan
        const port = data_port
        axios.post('http://172.16.25.43:8000/add_trunk_vlans',{
          ip,
          vlan,
          port
        }).then( res => {
          console.log(res.data)
          this.operator.trunk_vlan = ''
        })
      },
      add_access_vlan(data_port,node){
          console.log(node)
          const ip = node.ip
          const vlan = this.operator.access_vlan
          const port = data_port
          axios.post('http://172.16.25.43:8000/add_access_vlan',{
            ip,
            vlan,
            port
          }).then( res => {
            console.log(res.data)
            this.operator.access_vlan = ''
          })
      },
      search_path_vlan(){
          const vlan = this.searching_vlan
          Object.keys(this.nodes).forEach( node_ip => {
              const ip = node_ip
              const connections = Object.keys(this.edges).filter( edge => {
                if (this.edges[edge].source == node_ip) return true
              })

              axios.post('http://172.16.25.43:8000/search_vlan',{
                ip,
                vlan
              }).then( res => {
                console.log(res.data)
              })
          })
          
      },
      setting_map(){
        this.map.on_setting = !this.map.on_setting
        this.configs.node.draggable = !this.configs.node.draggable
        //this.configs.node.selectable = !this.configs.node.selectable

        this.configs.view.grid.visible = !this.configs.view.grid.visible
      },
      show_add_edge(){
        this.map.show_add_edge = true
        this.configs.node.selectable = true
      },
      add_node(){
        this.nodes[ this.new_node.ip ] = { name: this.new_node.name, model : this.new_node.model }
        this.new_node.ip = ''
        this.new_node.name = ''
        this.map.show_add_node = false
      },

      add_edge() {
        
        this.edges[ `${Object.keys(this.edges).length + 1}` ] = {
          source : this.selectedNodes[0],
          on_port : this.new_edge.on_port,
          target : this.selectedNodes[1],
          to_port : this.new_edge.to_port
        }

        this.new_edge.on_port = ''
        this.new_edge.to_port = ''
        this.map.show_add_edge = false

      },
      Save() {
          const data = []
          
          Object.keys(this.nodes).forEach( node => {
            let temp = {
              ip : node,
              name : this.nodes[node].name,
              model : this.nodes[node].model,
              directionText : this.nodes[node].directionText
            }
            const edges = Object.keys(this.edges).filter( edge => {
                if (this.edges[edge].source == node) return true
            })
            const connections = edges.map( edge => {
               return {
                  on_port : this.edges[edge].on_port,
                  to_port : this.edges[edge].to_port,
                  to_ip : this.edges[edge].target
               }
            })
            temp['connections'] = connections
            temp['position'] = {...this.layouts.nodes[node]}
            data.push(temp)
          })
          axios.post('http://172.16.25.43:8000/save_map',{
            data : data,
            node_map : this.map_name
          }).then( res => {
             console.log(res.data)
          })
      },

      showContextMenu(element, event) {
        element.style.left = event.x + "px"
        element.style.top = event.y + "px"
        element.style.visibility = "visible"
        const handler = (event) => {
            if (!event.target || !element.contains(event.target)) {
                element.style.visibility = "hidden"
                document.removeEventListener("pointerdown", handler, { capture: true })
            }
        }
        document.addEventListener("pointerdown", handler, { passive: true, capture: true })
       },

      handleSelect(){
          console.log('opened')
      },
      change_map(){
        this.$router.push('/test')
      }
  },
  mounted(){
    const wheight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const vnetgraph = document.querySelector('.vnet')
    vnetgraph.style.height = `${wheight - 100}px`
  },
  created() {
    axios.post('http://172.16.25.43:8000/get_nodes',{map_name:this.map_name}).then( res => {
      const data = res.data
      const nodes = this.nodes
      const edges = this.edges
      const layouts = this.layouts

      data.forEach(node => {
          
          nodes[node.ip] = {
            name : node.name,
            model : node.model,
            directionText : node.directionText,
            ports : node.ports
          }
          
          if(node.connections.length){
            for(let i = 0 ; i < node.connections.length ; i++){
              const to_port_name = data.filter( el => el.ip == node.connections[i].to_ip )[0]
                .ports[node.connections[i].to_port].name
              edges[`edge${i}`] = {
                source : node.ip,
                on_port : node.connections[i].on_port,
                on_port_name : node.ports[node.connections[i].on_port]['name'],
                target : node.connections[i].to_ip,
                to_port_name : to_port_name,
                to_port : node.connections[i].to_port
              }
            }
          }

          layouts['nodes'][node.ip] = {
            x: node.position.x,
            y: node.position.y
          }
      });

      this.nodes = nodes
      this.edges = edges
      this.layouts = layouts
    })
    this.eventHandlers = {
      "node:contextmenu" : (params) => {
        const { node, event } = params
        event.stopPropagation()
        event.preventDefault()
        const asd = this.$refs.nodeMenu
        this.menuTargetNode = this.nodes[node] ?? ""
        if (this.menuTargetNode){
          this.menuTargetNode['ip'] = node
        }
        this.interfaces = this.nodes[node].ports ?? []
        this.showContextMenu(asd, event)
      }
    }
  }
});
</script>

<style scoped>
  .context-menu{
    width: 180px;
    background-color: #efefef;
    padding: 10px;
    position: absolute;
    font-size: 12px;
    border: 1px solid #aaa;
    box-shadow: 2px 2px 2px #aaa
  }
  .vnet {
    background: #a6a5a744;
    position: relative;
  }
  .layouts {
    position: absolute;
    inset: auto 10px 10px auto;
    padding: 10px;
    background: #00ff0077;
    border-radius: 4px;
    font-size: 10px;
    line-height: 11px;
  }
  .context-menu {
        width: 300px;
        padding: 10px;
        height: 300px;
        overflow-y: scroll;
        position: fixed;
        visibility: hidden;
        font-size: 16px;
        background-color: rgb(16, 16, 16);
        color: aliceblue;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgb(64 64 64 / 5%);
        z-index: 1;
    }
    .nodeMenu-ports{
        margin-top: 2%;
        list-style-type: none;
        
    }
    .nodeMenu-ports:hover{
        margin-left: 2%;
        border-left: 1px solid gold;
        font-size: 18px;
        color: rgb(11, 191, 11)
    }
</style>
