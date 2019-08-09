let draggingEvent = {
    mouseDown: false,
    dataElement: undefined,
    mouseStartX: undefined,
    mouseStartY: undefined,
    boxStartX: undefined,
    boxStartY: undefined,
}

let zoomLevel = 1.0;
let wheelDelta = 1.05;

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
        }
    },
    template: `
        <div
            class="uk-card uk-card-body uk-card-primary floating-box non-select"
            v-on:pointerdown="ondragstart"
            v-bind:style="{
                transform: 'translate3d(' + boxdata.anchor.x + 'px, ' + boxdata.anchor.y + 'px, 0)',
                width: boxdata.size.x + 'px',
                height: boxdata.size.y + 'px',
                backgroundColor: boxdata.color
            }">

            DADA
        </div>
    `
})

let graph = new Vue({
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
                },
                color: "#ff00ff"
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
                },
                color: "#00ffff"
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
                },
                color: "#ffff00"
            }
        ]
    }
})

graph_canvas = document.getElementById("graph-canvas-background");

let canvasDragginEvent = {
    mouseDown: false,
    mouseStartX: undefined,
    mouseStartY: undefined,
    elementStartX: 0,
    elementStartY: 0,
}

graph_canvas.onpointerdown = function(event) {
    if (event.target == graph_canvas) {
        canvasDragginEvent.mouseDown = true;
        canvasDragginEvent.mouseStartX = event.x;
        canvasDragginEvent.mouseStartY = event.y;
    }
}

graph_canvas.onpointermove = function(event) {
    if (draggingEvent.mouseDown) {
        draggingEvent.dataElement.anchor.x = draggingEvent.boxStartX + (event.x - draggingEvent.mouseStartX) / zoomLevel;
        draggingEvent.dataElement.anchor.y = draggingEvent.boxStartY + (event.y - draggingEvent.mouseStartY) / zoomLevel;
    }
    if (canvasDragginEvent.mouseDown) {
        let x = canvasDragginEvent.elementStartX + event.x - canvasDragginEvent.mouseStartX;
        let y = canvasDragginEvent.elementStartY + event.y - canvasDragginEvent.mouseStartY;
        graph_canvas.style.setProperty('--bg-offset-x', x + 'px');
        graph_canvas.style.setProperty('--bg-offset-y', y + 'px');
    }
};

function pointerup(event) {
    if (draggingEvent.mouseDown) {
        draggingEvent.dataElement.anchor.x = draggingEvent.boxStartX + (event.x - draggingEvent.mouseStartX) / zoomLevel;
        draggingEvent.dataElement.anchor.y = draggingEvent.boxStartY + (event.y - draggingEvent.mouseStartY) / zoomLevel;
        draggingEvent.mouseDown = false;
        draggingEvent.dataElement = undefined;
    }
    if (canvasDragginEvent.mouseDown) {
        let x = canvasDragginEvent.elementStartX + event.x - canvasDragginEvent.mouseStartX;
        let y = canvasDragginEvent.elementStartY + event.y - canvasDragginEvent.mouseStartY;
        graph_canvas.style.setProperty('--bg-offset-x', x + 'px');
        graph_canvas.style.setProperty('--bg-offset-y', y + 'px');
        canvasDragginEvent.elementStartX = x;
        canvasDragginEvent.elementStartY = y;
        canvasDragginEvent.mouseDown = false;
    }
}

graph_canvas.onpointerup = pointerup
graph_canvas.onpointerleave = pointerup;

window.addEventListener("wheel", event => {
    let delta = event.deltaY;
    if (delta > 0) {
        zoomLevel /= wheelDelta;
    } else {
        zoomLevel *= wheelDelta;
    }
    graph_canvas.style.setProperty('--scale', zoomLevel);
});


graph.boxes.push({
    id: "0000-0000-0000-0003",
    anchor: {
        x: 450,
        y: 0
    },
    size: {
        x: 300,
        y: 150
    },
    color: "rgb(255,127,40)"
})

// click the reactangle to make cell
function clickRect(){
    let element = document.getElementById("rect");
   // let c = document.getElementById("circle");
   // let t = document.getElementById("tri");
//     element.classList.toggle("clickedStyle");

    element.style.color = "#FF80AB";
   // c.style.color = "white";
   // t.style.color = "white";
}

function clickStticker(){

}
