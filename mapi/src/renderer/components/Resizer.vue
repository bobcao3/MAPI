<template>
    <div class="frame" v-bind:style="{ left: left, top: top, width: width, height: height }">
      <draggable class="handle" position="top-left" ref="tl" v-on:v-dragmove="dragmove" v-on:v-select="dragstart" v-bind:externalHandle="true"></draggable>
      <draggable class="handle" position="top-right" ref="tr" v-on:v-dragmove="dragmove" v-on:v-select="dragstart" v-bind:externalHandle="true"></draggable>
      <draggable class="handle" position="bottom-left" ref="bl" v-on:v-dragmove="dragmove" v-on:v-select="dragstart" v-bind:externalHandle="true"></draggable>
      <draggable class="handle" position="bottom-right" ref="br" v-on:v-dragmove="dragmove" v-on:v-select="dragstart" v-bind:externalHandle="true"></draggable>
    </div>
</template>

<style scoped>
.frame {
  position: fixed;
  left: 0;
  right: 0;
  width: 0;
  height: 0;
  box-shadow: 0em 0.0em 2.0em rgb(82, 206, 255);
  outline-color: rgb(0, 187, 255);
  outline-style: dashed;
  outline-width: 3px;
  pointer-events: none;
}

.handle {
  width: 16px;
  height: 16px;
  background-color: rgb(0, 187, 255);
  border-radius: 50%;
  box-sizing: border-box;
  left: 0px;
  top: 0px;
  position: absolute;
  pointer-events: auto;
}
</style>

<script>
import draggable from '@/components/Draggable.vue'

export default {
  props: ['boxdata', 'canvas'],
  methods: {
    recompute () {
      let box = document.getElementById(this.boxdata.id).getBoundingClientRect()

      let left = Math.round(box.x)
      let top = Math.round(box.y)
      let width = Math.round(box.width)
      let height = Math.round(box.height)

      this.left = left + 'px'
      this.top = top + 'px'
      this.width = width + 'px'
      this.height = height + 'px'

      this.resetHandle()
    },
    dragstart (event) {
      this.resizeType = event.target.getAttribute('position')

      this.anchorStart = { ...this.boxdata.anchor }
      this.sizeStart = { ...this.boxdata.size }
    },
    dragmove (event, data) {
      let element = document.getElementById(this.boxdata.id)
      let box = element.getBoundingClientRect()
      let scalex = element.offsetWidth / box.width
      let scaley = element.offsetHeight / box.height

      let dx = (event.clientX - data.pointerStart.x) * scalex
      let dy = (event.clientY - data.pointerStart.y) * scaley

      let x = this.anchorStart.x
      let y = this.anchorStart.y

      let xs = this.sizeStart.x
      let ys = this.sizeStart.y

      if (this.resizeType === 'top-left') {
        if (this.proportional) {
          dy = dx * ys / xs
        }
        xs -= dx
        ys -= dy
        x += dx
        y += dy
      } else if (this.resizeType === 'top-right') {
        if (this.proportional) {
          dy = -dx * ys / xs
        }
        xs += dx
        ys -= dy
        y += dy
      } else if (this.resizeType === 'bottom-left') {
        if (this.proportional) {
          dx = -dy * xs / ys
        }
        x += dx
        xs -= dx
        ys += dy
      } else if (this.resizeType === 'bottom-right') {
        if (this.proportional) {
          dx = dy * xs / ys
        }
        xs += dx
        ys += dy
      }
      if (this.snapToGrid) {
        x = Math.round(x / 32) * 32
        y = Math.round(y / 32) * 32
        xs = Math.round(xs / 32) * 32
        ys = Math.round(ys / 32) * 32
      }

      if (xs < 10) xs = 10
      if (ys < 10) ys = 10

      this.boxdata.anchor.x = x
      this.boxdata.anchor.y = y
      this.boxdata.size.x = xs
      this.boxdata.size.y = ys
    },
    resetHandle () {
      let box = document.getElementById(this.boxdata.id).getBoundingClientRect()

      let width = Math.round(box.width)
      let height = Math.round(box.height)

      this.$refs.tl.anchor.x = -8
      this.$refs.tl.anchor.y = -8

      this.$refs.tr.anchor.x = width - 8
      this.$refs.tr.anchor.y = -8

      this.$refs.bl.anchor.x = -8
      this.$refs.bl.anchor.y = height - 8

      this.$refs.br.anchor.x = width - 8
      this.$refs.br.anchor.y = height - 8
    }
  },
  data: function () {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      anchorStart: undefined,
      sizeStart: undefined,
      resizeType: undefined
    }
  },
  mounted: function () {
    this.$watch('canvas', this.recompute, { deep: true })
    this.$watch('boxdata', this.recompute, { deep: true })
    this.recompute()
    this.resetHandle()
  },
  components: {
    draggable
  }
}
</script>