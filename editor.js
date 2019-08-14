let draggingEvent = {
    pointerdown: false,
    dataElement: undefined,
    mouseStartX: undefined,
    mouseStartY: undefined,
    boxStartX: undefined,
    boxStartY: undefined,
}

let resizingEvent = {
    pointerdown: false,
    dataElement: undefined,
    mouseStartX: undefined,
    mouseStartY: undefined,
    boxStartX: undefined,
    boxStartY: undefined,
    boxStartSizeX: undefined,
    boxStartSizeY: undefined,
    resizeType: undefined
}

let zoomLevel = 1.0;
let wheelDelta = 0.001;

let snapToGrid = false;
let proportional = false;

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
                text: "", // the text content
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

            this.$nextTick(() => {
                this.undoHistory = [];
                this.redoHistory = [];    
            });
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
        },
        recordHistory: function() {
            if (this.undoHistory.length > 0 && jsonEqual(this.boxes, this.undoHistory[this.undoHistory.length - 1])) return;

            this.undoHistory.push(jsonClone(this.boxes));
            this.redoHistory = [];

            console.log("History added ", this.undoHistory.length);
        },
        undo: function() {
            if (this.undoHistory.length > 1) {
                let boxes = this.undoHistory.pop();
                this.redoHistory.push(boxes);
                this.boxes = jsonClone(this.undoHistory[this.undoHistory.length - 1]);
                console.log("History popped ", this.undoHistory.length, boxes)
            }
        },
        redo: function() {
            if (this.redoHistory.length > 0) {
                let boxes = this.redoHistory.pop();
                this.undoHistory.push(boxes);
                this.boxes = jsonClone(this.undoHistory[this.undoHistory.length - 1]);
            }
        },
        uploadPicture: function(event) {
            let URL = window.webkitURL || window.URL;
            let url = URL.createObjectURL(event.target.files[0]);
            
            let reader = new FileReader();
            let selected = this.editingState.selected;

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    // Render thumbnail.
                    let span = document.createElement('span');
                    span.innerHTML = ['<img class="thumb" src="', e.target.result,
                                        '" title="', escape(theFile.name), '"/>'].join('');
                    //document.getElementById('list').insertBefore(span, null);
                    selected.bgImage = e.target.result;
                };
            })(event.target.files[0]);

            // Read in the image file as a data URL.
            console.log(reader.readAsDataURL(event.target.files[0]));

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
        ],
        undoHistory: [],
        redoHistory: [],
        bgImage: ""
    },
    watch: {
        boxes: function () {
            this.recordHistory();
        },
        editingState: function() {
            this.recordHistory();
        }
    },
})

document.addEventListener('mousedown', function (event) {
    if (event.detail > 1 && !graph.editingState.selectedText) {
        event.preventDefault();
    }
}, false);

graph_canvas = document.getElementById("graph-canvas-background");
graph_canvas_anchor = document.getElementById("graph-canvas");

let canvasDragginEvent = {
    pointerdown: false,
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
        canvasDragginEvent.pointerdown = true;
        canvasDragginEvent.mouseStartX = event.clientX;
        canvasDragginEvent.mouseStartY = event.clientY;
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
    canvasDrag(
        (event.clientX - canvasDragginEvent.mouseStartX) / zoomLevel,
        (event.clientY - canvasDragginEvent.mouseStartY) / zoomLevel,
        setSize
    );
}

function handleDrag(event) {
    let dx = (event.clientX - draggingEvent.mouseStartX) / zoomLevel;
    let dy = (event.clientY - draggingEvent.mouseStartY) / zoomLevel;
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
    let dx = (event.clientX - resizingEvent.mouseStartX) / zoomLevel;
    let dy = (event.clientY - resizingEvent.mouseStartY) / zoomLevel;
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
    if (draggingEvent.pointerdown) {
        handleDrag(event);
    }
    if (canvasDragginEvent.pointerdown) {
        handleCanvasDrag(event);
    }
    if (resizingEvent.pointerdown) {
        handleResize(event);
    }
};

function pointerup(event) {
    graph.recordHistory();
    if (draggingEvent.pointerdown) {
        handleDrag(event);
        draggingEvent.pointerdown = false;
    }
    if (canvasDragginEvent.pointerdown) {
        handleCanvasDrag(event, true);
        canvasDragginEvent.pointerdown = false;
        graph.editingState.selectedText = false;
    }
    if (resizingEvent.pointerdown) {
        handleResize(event);
        resizingEvent.pointerdown = false;
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
            zoomLevel /= 1.0 + wheelDelta * delta;
        } else {
            zoomLevel *= 1.0 - wheelDelta * delta;
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
    if ((event.key == 'Delete' || event.key == "Backspace") && graph.editingState.selected && !graph.editingState.selectedText) {
        graph.deleteSelected();
    }
    if (event.keyCode == 90 && event.ctrlKey) {
        // Ctrl + Z
        graph.undo();
        event.preventDefault();
    } else if (event.keyCode == 82 && event.ctrlKey) {
        // Ctrl + R
        graph.redo();
        event.preventDefault();
    } else {
        graph.recordHistory();
    }
})

document.addEventListener("contextmenu", function(e){
    e.preventDefault();
}, false);

window.addEventListener("keyup", event => {
    if (event.key == "Control") {
        snapToGrid = false;
    }
    if (event.key == "Shift") {
        proportional = false;
    }
})

graph.recordHistory();

UIkit.notification(
    `<p>Need help? Checkout the <a href="help.html" target="_blank">starter guide</a></p>`,
    { pos: 'bottom-left' }
)