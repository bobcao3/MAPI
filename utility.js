var Color = net.brehaut.Color;

let PSON = dcodeIO.PSON;
let initialDictionary = ["id","anchor","size","color","rgba(","#",")","-"];
let pson = new PSON.ProgressivePair(initialDictionary);

function uuidv4() {
    return 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function jsonEqual(a,b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function jsonClone(a) {
    return JSON.parse(JSON.stringify(a));
}

