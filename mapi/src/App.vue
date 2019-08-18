<template>
  <div id="app">
    <draggable id="graph-canvas" v-bind:infiniteSize="true" v-on:v-dragmove="updateBackground" v-bind:initialScale="{x:1.5, y:3.0}">
      <draggable></draggable>
    </draggable>
  </div>
</template>

<style>
#graph-canvas {
  /* This produces the grid background */
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;

  --bg-offset-x: 0px;
  --bg-offset-y: 0px;
  --scale-x: 1;
  --scale-y: 1;

  /* This produces the grid background */
  --bg-size: 32px;
  --bg-size-scaled-x: calc(var(--bg-size) * var(--scale-x));
  --bg-size-scaled-y: calc(var(--bg-size) * var(--scale-y));
  --bg-offset-x-scaled: calc(var(--bg-offset-x) * var(--scale-x));
  --bg-offset-y-scaled: calc(var(--bg-offset-y) * var(--scale-y));
  background-size: var(--bg-size-scaled-x) var(--bg-size-scaled-y);
  background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-color: #fcfcfc;
  background-position: var(--bg-offset-x-scaled) var(--bg-offset-y-scaled);
}

body {
  overscroll-behavior: contain;
  overflow: hidden;
}
</style>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
UIkit.use(Icons);

import draggable from "@/components/Draggable.vue";

export default {
  data: function() {
    return {
      boxes: []
    };
  },
  methods: {
    updateBackground: function(event) {
      let data = document.getElementById("graph-canvas").__vue__;
      let bg = document.getElementById("graph-canvas");
      bg.style.setProperty("--bg-offset-x", data.anchor.x + 'px');
      bg.style.setProperty("--bg-offset-y", data.anchor.y + 'px');
      bg.style.setProperty("--scale-x", data.scale.x);
      bg.style.setProperty("--scale-y", data.scale.y);
    }
  },
  components: {
    draggable
  }
};
</script>

<style lang="less">
@import "../node_modules/uikit/src/less/uikit.less";
</style>