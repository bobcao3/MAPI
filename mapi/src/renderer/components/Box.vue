<template>
  <draggable
    class="box"
    v-bind:initialAnchor="boxdata.anchor"
    v-on:v-select="editingState.selected = boxdata"
    v-bind:class=" { selected: editingState.selected === boxdata } "
    v-bind:style=" { width: boxdata.size.x + 'px', height: boxdata.size.y + 'px', backgroundColor: boxdata.color } "
  >
    <textarea
      v-bind:style=" { fontFamily: boxdata.font, fontSize: boxdata.fontSize + 'px', fontWeight: boxdata.bold ? 'bold' : 'normal', fontStyle: boxdata.italic ? 'italic' : 'normal' } "
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
  background-color: transparent;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: subpixel-antialiased;
}

.box {
  transition: font-weight 0.2s ease, font-size 0.1s ease;

  --scale: 1.0;

  box-sizing: border-box;
  border-style: solid;
  border-width: calc(3px / var(--scale));
  border-color: rgba(255,255,255,0.2);
}

.box.selected {
  box-shadow: 0em 0.0em calc(2.0em / var(--scale)) rgb(82, 206, 255);
  outline-color: rgb(0, 187, 255);
  outline-style: dashed;
  outline-width: calc(2px / var(--scale));
}
</style>