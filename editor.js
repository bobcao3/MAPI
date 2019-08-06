var draggingEvent = {
    mouseDown: false,
    dataElement: undefined,
    mouseStartX: undefined,
    mouseStartY: undefined,
    boxStartX: undefined,
    boxStartY: undefined,
}

Vue.component('box', {
    props: ['boxdata'],
    methods: {
        ondragstart: function(event) {
            draggingEvent.mouseStartX = event.x;
            draggingEvent.mouseStartY = event.y;
            draggingEvent.boxStartX = this.boxdata.anchor.x;
            draggingEvent.boxStartY = this.boxdata.anchor.y;
            draggingEvent.dataElement = this.boxdata;
            draggingEvent.mouseDown = true;
        },
        ondrag: function(event) {
            if (draggingEvent.mouseDown) {
                draggingEvent.dataElement.anchor.x = draggingEvent.boxStartX + event.x - draggingEvent.mouseStartX;
                draggingEvent.dataElement.anchor.y = draggingEvent.boxStartY + event.y - draggingEvent.mouseStartY;
            }
        },
        ondragend: function(event) {
            if (draggingEvent.mouseDown) {
                draggingEvent.dataElement.anchor.x = draggingEvent.boxStartX + event.x - draggingEvent.mouseStartX;
                draggingEvent.dataElement.anchor.y = draggingEvent.boxStartY + event.y - draggingEvent.mouseStartY;
                draggingEvent.mouseDown = false;
                draggingEvent.dataElement = undefined;
            }
        }
    },
    template: '<div class="uk-card uk-card-body uk-card-primary floating-box" v-on:mousedown="ondragstart" v-on:mousemove="ondrag" v-on:mouseup="ondragend">DADA</div>'
})

var graph = new Vue({
    el: '#graph-canvas',
    data: {
        boxes: [
            {
                id: "0000-0000-0000-0000",
                anchor: {
                    x: 100,
                    y: 50
                },
                size: {
                    x: 150,
                    y: 150
                }
            },
            {
                id: "0000-0000-0000-0001",
                anchor: {
                    x: 500,
                    y: 175
                },
                size: {
                    x: 100,
                    y: 100
                }
            },
            {
                id: "0000-0000-0000-0002",
                anchor: {
                    x: 450,
                    y: 350
                },
                size: {
                    x: 300,
                    y: 150
                }
            }
        ]
    }
})