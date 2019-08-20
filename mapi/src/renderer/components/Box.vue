<template>
  <draggable
    class="box"
    ref="dragbox"
    v-bind:id="boxdata.id"
    v-bind:initialAnchor="boxdata.anchor"
    v-on:v-select="onSelect"
    v-bind:class=" { overflowVisible: childrenOrSelfSelected } "
    v-bind:style=" { width: boxdata.size.x + 'px', height: boxdata.size.y + 'px', backgroundColor: boxdata.color, backgroundImage: boxdata.image, backgroundSize: boxdata.size.x + 'px ' + boxdata.size.y + 'px' } "
    v-on:dblclick="onDoubleClick"
    v-on="$listeners"
    v-on:v-dragmove="drag"
    v-on:v-dragend="dragEnd"
    v-bind:externalHandle="editingState.selected === boxdata && editingState.isEditingText"
  >
    <textarea
      v-bind:style=" { fontFamily: boxdata.font, fontSize: boxdata.fontSize + 'px', fontWeight: boxdata.bold ? 'bold' : 'normal', fontStyle: boxdata.italic ? 'italic' : 'normal', color: boxdata.textColor } "
      v-bind:class=" { edit: editingState.isEditingText } "
      v-model="boxdata.text"
    ></textarea>

    <box
      v-for="box in boxdata.children"
      v-bind:key="box.id"
      v-bind:editingState="editingState"
      v-bind:boxdata="box"
      :ref='box.id'
    />
  </draggable>
</template>

<script>
import draggable from '@/components/Draggable.vue'

export default {
  name: 'box',
  props: ['boxdata', 'editingState'],
  data: function () {
    return {
      text: ''
    }
  },
  methods: {
    onDoubleClick () {
      this.editingState.isEditingText = true
    },
    onSelect () {
      if (this.editingState.selected !== this.boxdata) {
        this.editingState.selected = this.boxdata
        this.editingState.isEditingText = false
      }
    },
    drag () {
      this.editingState.blockHistory = true
    },
    dragEnd () {
      this.editingState.blockHistory = false
    }
  },
  computed: {
    childrenOrSelfSelected () {
      for (let box of this.boxdata.children) {
        if (this.$refs[box.id] && this.$refs[box.id][0].childrenOrSelfSelected) return true
      }
      return this.editingState.selected === this.boxdata
    }
  },
  components: {
    draggable
  },
  beforeUpdate () {
    // Make sure the anchor is synced
    this.$refs.dragbox.anchor = this.boxdata.anchor
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

  box-sizing: border-box;
  width: 100%;
  height: 100%;

  pointer-events: none;
}

.box > textarea.edit {
  pointer-events: auto;
  cursor: text;
  user-select: text;
}

.box {
  transition: font-weight 0.2s ease, font-size 0.1s ease;

  box-sizing: border-box;
  border-style: solid;
  border-width: 0.3em;
  border-color: rgba(255,255,255,0.2);

  overflow: hidden;
}

.box.overflowVisible {
  overflow: visible;
}
</style>