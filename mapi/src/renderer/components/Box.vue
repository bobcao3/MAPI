<template>
  <draggable class="box" v-bind:initialAnchor="boxdata.anchor" v-on:v-select="editingState.selected = boxdata">
    <textarea
      v-bind:style=" { width: boxdata.size.x + 'px', height: boxdata.size.y + 'px', fontFamily: boxdata.font, fontSize: boxdata.fontSize + 'px' } "
      v-model="text"
    ></textarea>
  </draggable>
</template>

<script>
import draggable from '@/components/Draggable.vue'

export default {
  props: ['boxdata', 'editingState'],
  data: function () {
    return {
      text: ''
    }
  },
  methods: {},
  components: {
    draggable
  }
}
</script>

<style scoped>
.box > textarea {
  border: none;
  outline: none;
  resize: none;
  padding: 0.5em;
  box-sizing: border-box;
}
</style>