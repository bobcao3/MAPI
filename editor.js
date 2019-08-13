let draggingEvent = {
    mouseDown: false,
    dataElement: undefined,
    mouseStartX: undefined,
    mouseStartY: undefined,
    boxStartX: undefined,
    boxStartY: undefined,
}

let resizingEvent = {
    mouseDown: false,
    dataElement: undefined,
    mouseStartX: undefined,
    mouseStartY: undefined,
    boxStartX: undefined,
    boxStartY: undefined,
    boxStartSizeX: undefined,
    boxStartSizeY: undefined,
    resizeType: undefined
}

var Color = net.brehaut.Color;

let zoomLevel = 1.0;
let wheelDelta = 1.05;

let snapToGrid = false;
let proportional = false;

let PSON = dcodeIO.PSON;
let initialDictionary = ["id","anchor","size","color","rgba(","#",")","-"];
let pson = new PSON.ProgressivePair(initialDictionary);

function uuidv4() {
    return 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function testSelectedCascaded(current, selected) {
    if (selected && selected == current) return true;
    for (ind in current.children) {
        let box = current.children[ind];
        let result = testSelectedCascaded(box, selected);
        if (result) return true;
    }
    return false;
}

function deleteFrom(children, child) {
    if (child) {
        for (ind in children) {
            let box = children[ind];
            if (box == child) {
                children.splice(ind, 1);
                return;
            }
            deleteFrom(box.children, child);
        }
    }
}

function getOffset(lists, child) {
    for (ind in lists) {
        let box = lists[ind];
        if (box == child) {
            return box.anchor
        } else {
            let result = getOffset(box.children, child);
            if (result) {
                return {x: result.x + box.anchor.x, y: result.y + box.anchor.y}
            }
        }
    }
}

Vue.component('box', {
    props: ['boxdata', 'editing-state'],
    methods: {
        ondragstart: function(event) {
            if (this.editingState.selected != this.boxdata) {
                this.editingState.selected = this.boxdata;
                this.editingState.selectedText = false;
            }

            if (this.editingState.creatingBox) {
                createNewBoxMouseClick(event);
            } else if (!this.editingState.selectedText) {
                draggingEvent.mouseStartX = event.x;
                draggingEvent.mouseStartY = event.y;
                draggingEvent.boxStartX = this.boxdata.anchor.x;
                draggingEvent.boxStartY = this.boxdata.anchor.y;
                draggingEvent.dataElement = this.boxdata;
                draggingEvent.mouseDown = true;
            }
        },
        onresizeStart: function(event) {
            resizingEvent.mouseStartX = event.x;
            resizingEvent.mouseStartY = event.y;
            resizingEvent.boxStartX = this.boxdata.anchor.x;
            resizingEvent.boxStartY = this.boxdata.anchor.y;
            resizingEvent.boxStartSizeX = this.boxdata.size.x;
            resizingEvent.boxStartSizeY = this.boxdata.size.y;
            resizingEvent.dataElement = this.boxdata;
            resizingEvent.mouseDown = true;
            resizingEvent.resizeType = event.target.getAttribute("resize-type");
        },
        ondblclick: function(event) {
            graph.editingState.selectedText = true;
        }
    },
    computed: {
        isSelected: (i) => {
            return i.editingState.selected && i.editingState.selected == i.boxdata;
        },
        isTextSelected: (i) => {
            return i.editingState.selected && i.editingState.selected == i.boxdata && i.editingState.selectedText;
        },
        isSelectedCascaded: (i) => {
            return testSelectedCascaded(i.boxdata, i.editingState.selected);
        },
        isImmediateFather: (i) => {
            if (!i.editingState.selected) return true;
            
        }
    },
    template: `
        <div

            class="uk-card floating-box"
            v-on:pointerdown.stop="ondragstart"
            v-on:dblclick.stop="ondblclick"
            v-bind:class="{ selected: isSelected && !isTextSelected, textSelected: isTextSelected, cascaded: !isSelected && isSelectedCascaded }"
            v-bind:style="{
                transform: 'translate3d(' + boxdata.anchor.x + 'px, ' + boxdata.anchor.y + 'px, 0.0)',
                width: boxdata.size.x + 'px',
                height: boxdata.size.y + 'px',
                backgroundColor: boxdata.color,
                color: boxdata.textColor,
                overflow: isSelectedCascaded ? 'visible' : 'hidden'
            }">
            <textarea
                 v-bind:class="{ select: isTextSelected, 'non-select': !isTextSelected }"
                 v-bind:readonly="!isTextSelected"
                 v-model="boxdata.text"
                 v-bind:style="{ fontFamily: boxdata.font, fontSize: Math.round(boxdata.fontSize) + 'px', fontStyle: boxdata.italic ? 'italic' : 'normal', fontWeight: boxdata.bold ? 'bold' : 'normal' }"
            ></textarea>

            <div class="frame" v-if="isSelected && !isTextSelected">
                <span class="handle uk-position-top-left" resize-type="topleft" v-on:pointerdown="onresizeStart"></span>
                <span class="handle uk-position-top-right" resize-type="topright" v-on:pointerdown="onresizeStart"></span>
                <span class="handle uk-position-bottom-left" resize-type="bottomleft" v-on:pointerdown="onresizeStart"></span>
                <span class="handle uk-position-bottom-right" resize-type="bottomright" v-on:pointerdown="onresizeStart"></span>
            </div>

            <box
                v-for="box in boxdata.children"
                v-bind:key="box.id"
                v-bind:boxdata="box"
                v-bind:editing-state="editingState"
            />
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
        deleteSelected: function() {
            deleteFrom(this.boxes, this.editingState.selected);
            this.editingState.selected = undefined;
            this.editingState.textSelected = false;
        },
        // This is the callback on the button
        createBox: function(x, y) {
            // This defines the new box data
            let newBox = {
                // Generate a random unique id for this new box (don't modify this)
                id: uuidv4(),
                // The position it will be put on
                anchor: {
                    x: x, y: y
                },
                // The size of newly created box
                size: {
                    x: 100 + Math.random() * 100,
                    y: 100 + Math.random() * 100  // Random position as example
                },
                // The color of the new box
                color: "#FF8080", // must be in hex
                textColor: "#0c0c0c", // Color of text
                text: "New Box", // the text content
                font: this.fontOptions[0].value, // Default to Roboto
                fontSize: this.textSizeOptions[0].value,
                italic: false,
                bold: false,
                children: [] // Default to no children
            }
            // Now insert this new box into the data
            if (this.editingState.selected) {
                // This is a sub-box
                this.editingState.selected.children.push(newBox);
            } else {
                // This is a top level box
                this.boxes.push(newBox);
            }
        },
        loadWork: function(data) {
            let buffer = dcodeIO.ByteBuffer.fromBinary(LZUTF8.decompress(data, { inputEncoding: "Base64", outputEncoding: "String" }));
            let decoded = pson.decode(buffer);
            this.boxes = decoded;

            let saveField = document.getElementById("load-work");
            UIkit.offcanvas(saveField).hide();
        },
        saveWork: function(event) {
            this.saveFileStatus = "";
            let buffer = pson.encode(this.boxes).compact();
            let lzdata = LZUTF8.compress(buffer.toBinary(), { outputEncoding: "Base64" });
            this.savedData = lzdata;
        },
        savePanelShown: function(event) {
            let saveField = document.getElementById("save-work-field");
            saveField.select();
            try {
                var successful = document.execCommand('copy');
                if (successful) {
                    this.saveFileStatus = "The save file is copied to your clipboard.";
                } else {
                    this.saveFileStatus = "Unable to copy to clipboard. Please copy the save data manually.";
                }
            } catch (err) {
                this.saveFileStatus = "Unable to copy to clipboard. Please copy the save data manually.";
            }
        }
    },
    data: {
        boxes: [
        ],
        editingState: {
            selected: undefined,
            selectedText: false,
            creatingBox: false
        },
        savedData: "",
        loadData: "",
        saveFileStatus: "",
        // These values are in pixels
        textSizeOptions: [
            { text: 'Main text', value: '16' },
            { text: 'Head 1', value: '32' },
            { text: 'Head 2', value: '24' },
        ],
        fontOptions: [
            { text: 'Roboto', value: "'Roboto', sans-serif" },
            { text: 'Lato', value: "'Lato', sans-serif" },
            { text: 'Garamond', value: "'EB Garamond', serif" },
            { text: 'Times New Roman', value: "'Times New Roman', Times, serif"},
            { text: 'Long Cang', value: "'Long Cang', cursive" },
            { text: 'Comfortaa', value: "'Comfortaa', cursive" },
            { text: 'Roboto Mono', value: "'Roboto Mono', monospace" },
            { text: 'Cutive Mono', value: "'Cutive Mono', monospace"}
        ]
    }
})

document.addEventListener('mousedown', function (event) {
    if (event.detail > 1 && !graph.editingState.selectedText) {
        event.preventDefault();
    }
}, false);

graph_canvas = document.getElementById("graph-canvas-background");
graph_canvas_anchor = document.getElementById("graph-canvas");

let canvasDragginEvent = {
    mouseDown: false,
    mouseStartX: undefined,
    mouseStartY: undefined,
    elementStartX: 0,
    elementStartY: 0,
}

function getCanvasXY(x, y, target) {
    let viewportX = x;
    let viewportY = y;
    if (target == graph_canvas) target = graph_canvas_anchor;
    let boxRectangle = target.getBoundingClientRect();
    let localX = (viewportX - boxRectangle.left) / zoomLevel;
    let localY = (viewportY - boxRectangle.top) / zoomLevel;

    return {x: localX, y: localY}
}

function createNewBoxMouseClick(event) {
    let pos = getCanvasXY(event.clientX, event.clientY, event.target);
    
    graph.createBox(pos.x, pos.y);
    graph.editingState.creatingBox = false;
}

graph_canvas.onpointerdown = function(event) {
    graph.editingState.selected = undefined;

    if (graph.editingState.creatingBox) {
        createNewBoxMouseClick(event);
    } else if (event.target == graph_canvas) {
        canvasDragginEvent.mouseDown = true;
        canvasDragginEvent.mouseStartX = event.x;
        canvasDragginEvent.mouseStartY = event.y;
    }
}

function canvasDrag(dx, dy, setSize = false) {
    let x = canvasDragginEvent.elementStartX + dx;
    let y = canvasDragginEvent.elementStartY + dy;
    graph_canvas.style.setProperty('--bg-offset-x', x + 'px');
    graph_canvas.style.setProperty('--bg-offset-y', y + 'px');
    if (setSize) {
        canvasDragginEvent.elementStartX = x;
        canvasDragginEvent.elementStartY = y;
    }
}

function handleCanvasDrag(event, setSize = false) {
    canvasDrag(event.x - canvasDragginEvent.mouseStartX, event.y - canvasDragginEvent.mouseStartY, setSize);
}

function handleDrag(event) {
    let dx = (event.x - draggingEvent.mouseStartX) / zoomLevel;
    let dy = (event.y - draggingEvent.mouseStartY) / zoomLevel;
    if (proportional) {
        if (Math.abs(dx) > Math.abs(dy)) {
            dy = 0;
        } else {
            dx = 0;
        }
    }
    let x = dx + draggingEvent.boxStartX;
    let y = dy + draggingEvent.boxStartY;
    if (snapToGrid) {
        x = Math.round(x / 32) * 32;
        y = Math.round(y / 32) * 32;
    }
    draggingEvent.dataElement.anchor.x = x;
    draggingEvent.dataElement.anchor.y = y;
    return dx * dx + dy * dy > 16.0;
}

function handleResize(event) {
    let dx = (event.x - resizingEvent.mouseStartX) / zoomLevel;
    let dy = (event.y - resizingEvent.mouseStartY) / zoomLevel;
    let x = resizingEvent.boxStartX;
    let y = resizingEvent.boxStartY;
    let xs = resizingEvent.boxStartSizeX;
    let ys = resizingEvent.boxStartSizeY;

    if (resizingEvent.resizeType == "topleft") {
        if (proportional) {
            dx = dx;
            dy = dx * ys / xs;
        }
        xs -= dx;
        ys -= dy;
        x += dx;
        y += dy;
    } else if (resizingEvent.resizeType == "topright") {
        if (proportional) {
            dx = dx;
            dy = -dx * ys / xs;
        }
        xs += dx;
        ys -= dy;
        y += dy;
    } else if (resizingEvent.resizeType == "bottomleft") {
        if (proportional) {
            dx = -dy * xs / ys;
            dy = dy;
        }
        x += dx;
        xs -= dx;
        ys += dy;
    } else if (resizingEvent.resizeType == "bottomright") {
        if (proportional) {
            dx = dy * xs / ys;
            dy = dy;
        }
        xs += dx;
        ys += dy;
    }
    if (snapToGrid) {
        x = Math.round(x / 32) * 32;
        y = Math.round(y / 32) * 32;
        xs = Math.round(xs / 32) * 32;
        ys = Math.round(ys / 32) * 32;
    }
    if (xs < 10) xs = 10;
    if (ys < 10) ys = 10;
    resizingEvent.dataElement.anchor.x = x;
    resizingEvent.dataElement.anchor.y = y;
    resizingEvent.dataElement.size.x = xs;
    resizingEvent.dataElement.size.y = ys;
}

graph_canvas.onpointermove = function(event) {
    if (draggingEvent.mouseDown) {
        handleDrag(event);
    }
    if (canvasDragginEvent.mouseDown) {
        handleCanvasDrag(event);
    }
    if (resizingEvent.mouseDown) {
        handleResize(event);
    }
};

function pointerup(event) {
    if (draggingEvent.mouseDown) {
        handleDrag(event);
        draggingEvent.mouseDown = false;
    }
    if (canvasDragginEvent.mouseDown) {
        handleCanvasDrag(event, true);
        canvasDragginEvent.mouseDown = false;
        graph.editingState.selectedText = false;
    }
    if (resizingEvent.mouseDown) {
        handleResize(event);
        resizingEvent.mouseDown = false;
        graph.editingState.selectedText = false;
    }
}

graph_canvas.onpointerup = pointerup
graph_canvas.onpointerleave = pointerup;

graph_canvas.onwheel = event => {
    event.preventDefault();

    if (event.ctrlKey) {
        let delta = event.deltaY;
        let zoomLevelPrev = zoomLevel;
        if (delta > 0) {
            zoomLevel /= wheelDelta;
        } else {
            zoomLevel *= wheelDelta;
        }
    
        let pos = getCanvasXY(event.clientX, event.clientY, graph_canvas_anchor);
    
        let x = canvasDragginEvent.elementStartX;
        let y = canvasDragginEvent.elementStartY;
    
        x += (x + pos.x) * (zoomLevelPrev - zoomLevel) / zoomLevel;
        y += (y + pos.y) * (zoomLevelPrev - zoomLevel) / zoomLevel;
    
        canvasDragginEvent.elementStartX = x;
        canvasDragginEvent.elementStartY = y;
    
        graph_canvas.style.setProperty('--bg-offset-x', x + 'px');
        graph_canvas.style.setProperty('--bg-offset-y', y + 'px');
    
        graph_canvas.style.setProperty('--scale', zoomLevel);
    } else {
        canvasDrag(-event.deltaX / zoomLevel, -event.deltaY / zoomLevel, true);
    }
};

window.addEventListener("keydown", event => {
    if (event.key == "Control") {
        snapToGrid = true;
    }
    if (event.key == "Shift") {
        proportional = true;
    }
})

window.addEventListener("keyup", event => {
    if (event.key == "Control") {
        snapToGrid = false;
    }
    if (event.key == "Shift") {
        proportional = false;
    }
})
