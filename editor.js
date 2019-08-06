Vue.component('box', {
    props: ['boxdata'],
    methods: {
        ondragstart: function(event) {
            mouseStartX = event.x;
            mouseStartY = event.y;
            boxStartX = this.boxdata.anchor.x;
            boxStartY = this.boxdata.anchor.y;
            element = this.$el;
            this.mouseDown = true;
        },
        ondrag: function(event) {
            if (this.mouseDown) {
                element.style.left = (boxStartX + event.x - mouseStartX) + 'px';
                element.style.top = (boxStartY + event.y - mouseStartY) + 'px';    
            }
        },
        ondragend: function(event) {
            if (this.mouseDown) {
                element.style.left = (boxStartX + event.x - mouseStartX) + 'px';
                element.style.top = (boxStartY + event.y - mouseStartY) + 'px';
                this.boxdata.anchor.x = boxStartX + event.x - mouseStartX;
                this.boxdata.anchor.y = boxStartY + event.y - mouseStartY;
                this.mouseDown = false;
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