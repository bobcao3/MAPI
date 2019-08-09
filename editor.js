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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

Vue.component('box', {
    props: ['boxdata', 'editing-state'],
    methods: {
        ondragstart: function(event) {
            draggingEvent.mouseStartX = event.x;
            draggingEvent.mouseStartY = event.y;
            draggingEvent.boxStartX = this.boxdata.anchor.x;
            draggingEvent.boxStartY = this.boxdata.anchor.y;
            draggingEvent.dataElement = this.boxdata;
            draggingEvent.mouseDown = true;

            
            this.editingState.selected = this.boxdata;
        }
    },
    computed: {
        isSelected: (i) => {
            return i.editingState.selected && i.editingState.selected == i.boxdata;
        }
    },
    template: `
        <div
            class="uk-card uk-card-body uk-card-primary floating-box non-select"
            v-on:pointerdown="ondragstart"
            v-bind:class="{ selected: isSelected }"
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
    el: '#app',
    methods: {
        changeColor: function(event) {
            if (this.editingState.selected) {
                this.editingState.selected.color = event.target.style.backgroundColor;
            }
        },
        // This is the callback on the button
        createBox: function(event) {
            // This defines the new box data
            let newBox = {
                // Generate a random unique id for this new box (don't modify this)
                id: uuidv4(),
                // The position it will be put on
                // You may want to set it to mouse position or something
                anchor: {
                    x: Math.random() * 1000, // Random value as example
                    y: Math.random() * 600   // Random value as example
                },
                // The size of newly created box
                size: {
                    x: 100 + Math.random() * 100,
                    y: 100 + Math.random() * 100  // Random position as example
                },
                // The color of the new box
                color: "rgba(255,128,128)" // can also be "#ff8080" or other things
            }
            // Now insert this new box into the data
            this.boxes.push(newBox);
        }
    },
    data: {
        boxes: [
        ],
        editingState: {
            selected: undefined
        }
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
        graph.editingState.selected = undefined;
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
