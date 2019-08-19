<template>
  <div id="app">
    <draggable
      id="graph-canvas"
      v-bind:infiniteSize="true"
      v-on:v-dragmove="updateBackground"
      v-bind:initialScale="{x:1.0, y:1.0}"
    >
      <box v-bind:boxdata="{ anchor: { x: 50, y: 100 }, size: { x: 100, y: 70 }}"></box>
    </draggable>

    <nav class="uk-navbar-container non-select" id="navBar" uk-navbar>
      <div class="uk-navbar-left">
        <ul class="uk-navbar-nav">
          <li>
            <i class="material-icons">folder_open</i>
          </li>
          <li>
            <i class="material-icons">undo</i>
          </li>
          <li>
            <i class="material-icons">redo</i>
          </li>
          <li>
            <i class="material-icons">crop_5_4</i>
          </li>
          <li>
            <i class="material-icons">layers</i>
          </li>
        </ul>
      </div>
      <div class="uk-navbar-right">
        <ul class="uk-navbar-nav">
          <!-- Editing options -->
          <li>
            <i class="material-icons">delete_outline</i>
          </li>
          <li class="upload-wrapper">
            <input type="file" id="fileInput" />
            <i class="material-icons">photo_library</i>
          </li>
          <li>
            <i class="material-icons">format_bold</i>
          </li>
          <li>
            <i class="material-icons">format_italic</i>
          </li>
          <li>
            <select class="uk-select navbar-selections" v-model="editingState.selected.font">
              <option
                v-for="option in fontOptions"
                v-bind:value="option.value"
                v-bind:key="option.value"
              >{{ option.text }}</option>
            </select>
          </li>
          <li>
            <select class="uk-select navbar-selections" v-model="editingState.selected.fontSize">
              <option
                v-for="option in textSizeOptions"
                v-bind:value="option.value"
                v-bind:key="option.value"
              >{{ option.text }}</option>
            </select>
          </li>
          <li>
            <i class="material-icons">format_color_fill_24px</i>
            <!--This is the UIkit dropdown  -->
            <div id="colorbar" class="uk-navbar-dropdown color-pallete">
              <div>
                <button class="uk-button color-button" style="background-color: #FF8080;"></button>
                <button class="uk-button color-button" style="background-color: #FFC580;"></button>
                <button class="uk-button color-button" style="background-color: #FFE380;"></button>
                <button class="uk-button color-button" style="background-color: #92FF80;"></button>
                <button class="uk-button color-button" style="background-color: #80E1FF;"></button>
                <button class="uk-button color-button" style="background-color: #8A80FF;"></button>
                <button class="uk-button color-button" style="background-color: #ED80FF;"></button>
                <button class="uk-button color-button" style="background-color: #FF80AB;"></button>
              </div>
            </div>
          </li>
          <!-- Editing options -->
        </ul>
        <ul class="uk-navbar-nav">
          <li>
            <i class="material-icons">save_alt</i>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style lang="less">
@import "~uikit/src/less/uikit.less";
@import '~material-icons/iconfont/material-icons.css';
</style>

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
import draggable from '@/components/Draggable.vue'
import box from '@/components/Box.vue'

require('@/assets/iconButtons.css')
require('@/assets/navBar.css')

export default {
  data: function () {
    return {
      boxes: [],
      editingState: {
        selected: {}
      },
      textSizeOptions: [
        { text: 'Main text', value: '16' },
        { text: 'Head 1', value: '32' },
        { text: 'Head 2', value: '24' }
      ],
      fontOptions: [
        { text: 'Roboto', value: "'Roboto', sans-serif" },
        { text: 'Lato', value: "'Lato', sans-serif" },
        { text: 'Garamond', value: "'EB Garamond', serif" },
        { text: 'Times New Roman', value: "'Times New Roman', Times, serif" },
        { text: 'Long Cang', value: "'Long Cang', cursive" },
        { text: 'Comfortaa', value: "'Comfortaa', cursive" },
        { text: 'Roboto Mono', value: "'Roboto Mono', monospace" },
        { text: 'Cutive Mono', value: "'Cutive Mono', monospace" }
      ]
    }
  },
  methods: {
    updateBackground: function () {
      let data = document.getElementById('graph-canvas').__vue__
      let bg = document.getElementById('graph-canvas')
      bg.style.setProperty('--bg-offset-x', data.anchor.x + 'px')
      bg.style.setProperty('--bg-offset-y', data.anchor.y + 'px')
      bg.style.setProperty('--scale-x', data.scale.x)
      bg.style.setProperty('--scale-y', data.scale.y)
    }
  },
  components: {
    draggable,
    box
  },
  mounted: function () {
    this.updateBackground()
  }
}
</script>
