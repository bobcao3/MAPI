<template>
  <div id="app" v-on:wheel="onwheel" v-on:click="canvasClick">
    <draggable
      id="graph-canvas"
      ref="canvas"
      v-bind:infiniteSize="true"
      v-on:v-dragmove="updateBackground"
      v-on:v-select="onSelect"
    >
      <box
        v-for="box in boxes"
        v-bind:key="box.id"
        v-bind:editingState="editingState"
        v-bind:boxdata="box"
      />
    </draggable>

    <resizer v-if="editingState.selected" v-bind:boxdata="editingState.selected" v-bind:canvas="$refs.canvas.$data"></resizer>

    <div class="fileTooltip non-select">{{ editingState.file }}</div>

    <nav
      class="uk-navbar-container non-select uk-light"
      id="navBar"
      uk-navbar
      v-on:click.stop
    >
      <div class="uk-navbar-left">
        <a class="uk-navbar-item uk-logo">MAPI</a>
        <ul class="uk-navbar-nav">
          <li>
            <i class="material-icons" v-on:click="loadFile">folder_open</i>
          </li>
          <li>
            <i class="material-icons" v-on:click="saveFile">save</i>
          </li>
          <li>
            <i class="material-icons">undo</i>
          </li>
          <li>
            <i class="material-icons">redo</i>
          </li>
          <li>
            <i
              class="material-icons"
              v-bind:class="{ toggled : editingState.isCreateNewBox }"
              v-on:click="editingState.isCreateNewBox = !editingState.isCreateNewBox"
            >crop_5_4</i>
          </li>
          <li>
            <i class="material-icons">layers</i>
          </li>
        </ul>
      </div>
      <div class="uk-navbar-right">
        <ul class="uk-navbar-nav" v-if="editingState.selected">
          <!-- Editing options -->
          <li>
            <i class="material-icons">delete_outline</i>
          </li>
          <li>
            <i class="material-icons" v-on:click="setImage">photo_library</i>
          </li>
          <li>
            <i
              class="material-icons"
              v-bind:class="{ toggled : editingState.selected.bold }"
              v-on:click="editingState.selected.bold = !editingState.selected.bold"
            >format_bold</i>
          </li>
          <li>
            <i
              class="material-icons"
              v-bind:class="{ toggled : editingState.selected.italic }"
              v-on:click="editingState.selected.italic = !editingState.selected.italic"
            >format_italic</i>
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
            <div id="colorpicker" class="uk-navbar-dropdown">
              <sketch-colorpicker :value="editingState.selected.color" @input="updateColor" :presetColors="[
                '#FF8080', '#FFC580', '#FFE380', '#92FF80', '#80E1FF', '#8A80FF', '#ED80FF', '#FF80AB'
              ]"></sketch-colorpicker>
            </div>
          </li>
          <!-- Editing options -->
        </ul>
        <ul class="uk-navbar-nav">
          <li>
            <i class="material-icons" v-on:click="closeApp">close</i>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style lang="less">
@import "~uikit/src/less/uikit.less";
@import "~material-icons/iconfont/material-icons.css";
</style>

<style>
body {
  overscroll-behavior: contain;
  overflow: hidden;
}

.non-select {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -o-user-select: none;
}

.select {
  -moz-user-select: text;
  -webkit-user-select: text;
  -ms-user-select: text;
  user-select: text;
  -o-user-select: text;
}
</style>

<style scoped>
.fileTooltip {
  position: absolute;
  left: 1em;
  top: 4em;
}

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

#app {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>

<script>
import draggable from '@/components/Draggable.vue'
import box from '@/components/Box.vue'
import resizer from '@/components/Resizer.vue'

import uuidv4 from 'uuid/v4'
import UIkit from 'uikit'
import path from 'path'
import PSON from 'pson'
import fs from 'fs'
import { Sketch } from 'vue-color'
import slash from 'slash'

console.log(path)

const { remote } = require('electron')
const { dialog } = require('electron').remote

var initialDictionary = ['id', 'anchor', 'size', 'font', 'fontSize', 'color', 'bold', 'italic']
var pson = new PSON.StaticPair(initialDictionary)

require('@/assets/iconButtons.css')
require('@/assets/navBar.css')

let currentWindow = remote.getCurrentWindow()
currentWindow.setMenu(null)

export default {
  data () {
    return {
      boxes: [],
      editingState: {
        selected: undefined,
        isMovingWindow: false,
        windowBounds: currentWindow.getBounds(),
        file: undefined,
        zoomLevel: 1.0,
        isCreateNewBox: false,
        isEditingText: false
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
    onSelect () {
      this.editingState.selected = undefined
      this.editingState.isEditingText = false
    },
    createBox (x, y) {
      // This defines the new box data
      let newBox = {
        id: uuidv4(),
        anchor: {
          x: x, y: y
        },
        size: {
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100 // Random position as example
        },
        textColor: '#0c0c0c', // Color of text
        font: "'Roboto', sans-serif",
        fontSize: '16',
        color: '#FF8080',
        bold: false,
        italic: false,
        image: undefined,
        children: []
      }
      // Now insert this new box into the data
      if (this.editingState.selected) {
        // This is a sub-box
        this.editingState.selected.children.push(newBox)
      } else {
        // This is a top level box
        this.boxes.push(newBox)
      }
    },
    canvasClick (event) {
      if (this.editingState.isCreateNewBox) {
        let vue = event.target.__vue__
        if (!vue) return
        let pos = vue.getLocalXY(event.clientX, event.clientY)
        this.createBox(pos.x, pos.y)
        this.editingState.isCreateNewBox = false
      }
    },
    updateBackground () {
      let data = document.getElementById('graph-canvas').__vue__
      let bg = document.getElementById('graph-canvas')
      bg.style.setProperty('--bg-offset-x', data.anchor.x + 'px')
      bg.style.setProperty('--bg-offset-y', data.anchor.y + 'px')
      bg.style.setProperty('--scale-x', data.scale.x)
      bg.style.setProperty('--scale-y', data.scale.y)
    },
    updateColor (color) {
      let c = color.rgba
      this.editingState.selected.color = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
    },
    closeApp () {
      console.log('close')
      currentWindow.close()
    },
    setImage () {
      dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
          console.log('No file selected')
          return
        }

        fs.readFile(fileNames[0], (err, data) => {
          if (err) {
            UIkit.notification({ message: 'An error ocurred loading the file ' + err.message, pos: 'bottom-left', status: 'danger' })
          }

          this.editingState.selected.image = 'url("file://' + slash(fileNames[0]) + '")'
        })
      })
    },
    saveFile () {
      let dataBuf = pson.encode(this.boxes).toBuffer()
      if (this.editingState.file) {
        fs.writeFile(this.editingState.file, dataBuf, (err) => {
          if (err) {
            UIkit.notification({ message: 'An error ocurred creating the file ' + err.message, pos: 'bottom-left', status: 'danger' })
          }

          UIkit.notification({ message: 'Your file is saved!', pos: 'bottom-left', status: 'success' })
        })
      } else {
        dialog.showSaveDialog((fileName) => {
          if (fileName === undefined) {
            console.log('No file selected')
            return
          }

          // fileName is a string that contains the path and filename created in the save file dialog.
          fs.writeFile(fileName, dataBuf, (err) => {
            if (err) {
              UIkit.notification({ message: 'An error ocurred creating the file ' + err.message, pos: 'bottom-left', status: 'danger' })
            }

            UIkit.notification({ message: 'Your file is saved as ' + fileName, pos: 'bottom-left', status: 'success' })
          })

          this.editingState.file = fileName
        })
      }
    },
    loadFile () {
      dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
          console.log('No file selected')
          return
        }

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.readFile(fileNames[0], (err, data) => {
          if (err) {
            UIkit.notification({ message: 'An error ocurred loading the file ' + err.message, pos: 'bottom-left', status: 'danger' })
          }

          this.boxes = pson.decode(data)
        })

        this.editingState.file = fileNames[0]
      })
    },
    onwheel (event) {
      event.preventDefault()

      const wheelDelta = 0.001
      let canvas = this.$refs.canvas

      if (event.ctrlKey) {
        let delta = event.deltaY
        let zoomLevelPrev = this.editingState.zoomLevel
        if (delta > 0) {
          this.editingState.zoomLevel /= 1.0 + wheelDelta * delta
        } else {
          this.editingState.zoomLevel *= 1.0 - wheelDelta * delta
        }

        let pos = canvas.getLocalXY(event.clientX, event.clientY)

        let x = canvas.anchor.x
        let y = canvas.anchor.y

        x += (x + pos.x) * (zoomLevelPrev - this.editingState.zoomLevel) / this.editingState.zoomLevel
        y += (y + pos.y) * (zoomLevelPrev - this.editingState.zoomLevel) / this.editingState.zoomLevel

        canvas.anchor.x = x
        canvas.anchor.y = y

        canvas.scale.x = this.editingState.zoomLevel
        canvas.scale.y = this.editingState.zoomLevel
      } else {
        canvas.anchor.x -= event.deltaX / this.editingState.zoomLevel
        canvas.anchor.y -= event.deltaY / this.editingState.zoomLevel
      }

      this.updateBackground()
    }
  },
  components: {
    draggable,
    box,
    resizer,
    'sketch-colorpicker': Sketch
  },
  mounted () {
    this.updateBackground()
  }
}
</script>
