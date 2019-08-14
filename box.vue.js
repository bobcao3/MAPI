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
                draggingEvent.mouseStartX = event.clientX;
                draggingEvent.mouseStartY = event.clientY;
                draggingEvent.boxStartX = this.boxdata.anchor.x;
                draggingEvent.boxStartY = this.boxdata.anchor.y;
                draggingEvent.dataElement = this.boxdata;
                draggingEvent.pointerdown = true;
            }
        },
        onresizeStart: function(event) {
            resizingEvent.mouseStartX = event.clientX;
            resizingEvent.mouseStartY = event.clientY;
            resizingEvent.boxStartX = this.boxdata.anchor.x;
            resizingEvent.boxStartY = this.boxdata.anchor.y;
            resizingEvent.boxStartSizeX = this.boxdata.size.x;
            resizingEvent.boxStartSizeY = this.boxdata.size.y;
            resizingEvent.dataElement = this.boxdata;
            resizingEvent.pointerdown = true;
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
                overflow: isSelectedCascaded ? 'visible' : 'hidden',
                backgroundImage: boxdata.bgImage ? 'url(' + boxdata.bgImage + ')' : '',
                backgroundSize: boxdata.size.x + 'px ' + boxdata.size.y + 'px'
            }">
            <textarea
                placeholder="New Box ..."
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