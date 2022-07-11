<template>
    <div class="home">
        <NetGraph :map_name="mapname"/>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import NetGraph from '../components/NetGraph.vue'
export default defineComponent({
    name: 'home',
    data : function(){
        return {
            mapname: 'Ring Rayons'
        }
    },
    components: {
        NetGraph
    }
})
</script>
