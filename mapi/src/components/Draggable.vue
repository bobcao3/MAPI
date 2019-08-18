<template>
    <div
        v-bind:class="{ infiniteSize: infiniteSize }"
        v-bind:style="{ transform: !infiniteSize && 'scale3d(' + scale.x + ', ' + scale.y + ', 1) translate3d(' + anchor.x + 'px, ' + anchor.y + 'px, ' + layerZ + 'px)' }"
        v-on:mousedown.stop="onPointerDown"
        class="draggable"
    >
        <div ref="transformAnchor" class="transformAnchor" v-bind:style="{ transform: infiniteSize && 'scale3d(' + scale.x + ', ' + scale.y + ', 1) translate3d(' + anchor.x + 'px, ' + anchor.y + 'px, ' + layerZ + 'px)' }">
            HAHA
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: ['infiniteSize', 'initialScale'],
    data: function () {
        return {
            anchor: {
                x: 15,
                y: 15
            },
            anchorStart: {
                x: 15,
                y: 15
            },
            pointerStart: {
                x: 0,
                y: 0
            },
            layerZ: 0,
            scale: this.initialScale ? this.initialScale : {
                x: 1.0,
                y: 1.0
            },
            onDragging: false,
            pointerId: undefined,
        }
    },
    methods: {
        onPointerDown: function(event) {
            this.anchorStart = { ... this.anchor };
            this.onDragging = true;
            this.pointerStart.x = event.clientX;
            this.pointerStart.y = event.clientY;
            this.pointerId = event.pointerId;
        },
        onPointerMove: function(event) {
            if (this.onDragging && this.pointerId == event.pointerId) {
                let element = this.infiniteSize ? this.$refs.transformAnchor : this.$el;
                let box = this.$el.getBoundingClientRect();
                let scalex = this.$el.offsetWidth / box.width / this.scale.x;
                let scaley = this.$el.offsetHeight / box.height / this.scale.y;

                let dx = (event.clientX - this.pointerStart.x) * scalex;
                let dy = (event.clientY - this.pointerStart.y) * scaley;
                
                this.anchor.x = this.anchorStart.x + dx;
                this.anchor.y = this.anchorStart.y + dy;

                this.$emit('v-dragmove');
            }
        },
        onPointerUp: function(event) {
            if (this.onDragging && this.pointerId == event.pointerId) {
                this.onPointerMove(event);
                this.onDragging = false;
                this.$emit('v-dragend');
            }
        }
    },
    mounted: function() {
        document.addEventListener('mousemove', this.onPointerMove);
        document.addEventListener('mouseup', this.onPointerUp);
    },
    beforeDestroy: function() {
        document.removeEventListener('mousemove', this.onPointerMove);
        document.removeEventListener('mouseup', this.onPointerUp);
    },
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

.draggable {
    outline: red solid 1px;
    transform-origin: top left;
}

.draggable .transformAnchor {
    outline: green solid 1px;
    display: inline-block;
}
</style>