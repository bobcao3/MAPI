<template>
  <div
    v-bind:class="{ infiniteSize: infiniteSize }"
    v-bind:style="{ transform: !infiniteSize && 'scale3d(' + scale.x + ', ' + scale.y + ', 1) translate3d(' + anchor.x + 'px, ' + anchor.y + 'px, ' + layerZ + 'px)' }"
    v-on:pointerdown.stop="onPointerDown"
    class="draggable"
  >
    <div
      v-if="infiniteSize"
      ref="transformAnchor"
      class="draggable transformAnchor"
      v-bind:style="{ transform: 'scale3d(' + scale.x + ', ' + scale.y + ', 1) translate3d(' + anchor.x + 'px, ' + anchor.y + 'px, ' + layerZ + 'px)' }"
    >
      <slot></slot>
    </div>
    <slot v-if="!infiniteSize"></slot>
  </div>
</template>

<script>
function roundCssTransformMatrix (el) {
  // el.style.transform = ""; //resets the redifined matrix to allow recalculation, the original style should be defined in the class not inline.
  var mx = window.getComputedStyle(el, null) // gets the current computed style
  mx =
    mx.getPropertyValue('-webkit-transform') ||
    mx.getPropertyValue('-moz-transform') ||
    mx.getPropertyValue('-ms-transform') ||
    mx.getPropertyValue('-o-transform') ||
    mx.getPropertyValue('transform') ||
    false
  var values = mx.replace(/ |\(|\)|matrix/g, '').split(',')
  for (var v in values) {
    values[v] = v > 4 ? Math.ceil(values[v]) : values[v]
  }

  el.style.transform = 'matrix(' + values.join() + ')'
}

export default {
  props: ['infiniteSize', 'initialScale', 'initialAnchor', 'externalHandle'],
  data () {
    return {
      anchor: this.initialAnchor
        ? this.initialAnchor
        : {
          x: 0,
          y: 0
        },
      anchorStart: this.initialAnchor
        ? { ...this.initialAnchor }
        : {
          x: 0,
          y: 0
        },
      pointerStart: {
        x: 0,
        y: 0
      },
      layerZ: 0,
      scale: this.initialScale
        ? this.initialScale
        : {
          x: 1.0,
          y: 1.0
        },
      onDragging: false,
      pointerId: undefined
    }
  },
  methods: {
    onPointerDown (event) {
      this.anchorStart = { ...this.anchor }
      this.onDragging = true
      this.pointerStart.x = event.clientX
      this.pointerStart.y = event.clientY
      this.pointerId = event.pointerId
      this.$emit('v-select', event)
    },
    onPointerMove (event) {
      if (this.onDragging && this.pointerId === event.pointerId) {
        if (this.externalHandle) {
          this.$emit('v-dragmove', event, this.$data)
        } else {
          let element = this.infiniteSize ? this.$refs.transformAnchor : this.$el
          let box = element.getBoundingClientRect()
          let scalex = element.offsetWidth / box.width
          let scaley = element.offsetHeight / box.height

          let dx = (event.clientX - this.pointerStart.x) * scalex
          let dy = (event.clientY - this.pointerStart.y) * scaley

          this.anchor.x = this.anchorStart.x + dx
          this.anchor.y = this.anchorStart.y + dy

          this.$emit('v-dragmove')
        }
      }
    },
    onPointerUp (event) {
      if (this.onDragging && this.pointerId === event.pointerId) {
        this.onDragging = false
        this.$emit('v-dragend', event)
      }
    },
    getLocalXY (viewportX, viewportY) {
      let target = this.infiniteSize ? this.$refs.transformAnchor : this.$el
      let boxRectangle = target.getBoundingClientRect()
      if (!this.infiniteSize) viewportY -= boxRectangle.height
      let localX = (viewportX - boxRectangle.left) / this.scale.x
      let localY = (viewportY - boxRectangle.top) / this.scale.y

      return {x: localX, y: localY}
    }
  },
  mounted () {
    document.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('pointerup', this.onPointerUp)
  },
  updated () {
    let element = this.infiniteSize ? this.$refs.transformAnchor : this.$el
    roundCssTransformMatrix(element)
  },
  beforeDestroy () {
    document.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('pointerup', this.onPointerUp)
  }
}
</script>

<style scoped>
.draggable.infiniteSize {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.draggable .transformAnchor {
  width: 1em;
  height: 1em;
  /* Otherwise it can't detect zoom */
}

.draggable {
  position: absolute;
  transform-origin: top left;
  margin: 0px;
  padding: 0px;
  display: inline-block;
  line-height: 0;
}
</style>