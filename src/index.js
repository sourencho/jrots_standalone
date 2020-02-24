const Hydra = require("hydra-synth");
const p5 = require('p5');

const NOTE_TO_LETTER = {
    0: 'Ա',
    1: 'Բ',
    2: 'Գ',
    3: 'Դ',
    4: 'Ե',
    5: 'Զ',
    6: 'Է',
    7: 'Ը',
    8: 'Թ',
    9: 'Ժ',
    10: 'Ի',
    11: 'Լ',
}

let noto_sans_arm, font_ready = false;

const MIDI_ON_CMD = 144;
const TEXT_SIZE = 200;
const DRAW_MARGIN = 0;

let myp5 = new p5((sketch) => {
    function fontRead() {
        font_ready = true;
    }
    sketch.preload = () => {
        noto_sans_arm = sketch.loadFont('./assets/fonts/NotoSansArmenian-Bold.ttf', fontRead);
    }
    sketch.setup = () => {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    }
});

var letters = new Array(128);
for (let i = 0; i < letters.length; i++) {
    letters[i] = {
        note: i,
        text: NOTE_TO_LETTER[i % 12],
        velocity: 1,
        position: { x: 0, y: 0 },
        display: false,
    }
}

/* MIDI INPUT SETUP */
// register WebMIDI
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);
    var inputs = midiAccess.inputs;
    var outputs = midiAccess.outputs;
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

getMIDIMessage = function (midiMessage) {
    var arr = midiMessage.data
    var command = arr[0];
    var note = arr[1];
    var velocity = arr[2];

    console.debug('Midi received ' + command + ' ' + note + ' ' + velocity);

    if (command === undefined || note === undefined) {
        return;
    }

    if (NOTE_TO_LETTER[note % 12] === undefined) {
        return;
    }

    myp5.draw = () => {
        myp5.clear();
        for (let i = 0; i < letters.length; i++) {
            var letter = letters[i];
            if (note === letter.note) {
                if (command === MIDI_ON_CMD) {
                    if (letter.display == false) {
                        // TODO: Fix this formula.
                        // Text size probably doesn't correspond to the width of the text.
                        letter.position.x = Math.random() * (myp5.windowWidth - DRAW_MARGIN) + DRAW_MARGIN;
                        letter.position.y = Math.random() * (myp5.windowHeight - DRAW_MARGIN) + DRAW_MARGIN;
                    }
                    letter.display = true;
                } else {
                    letter.display = false;
                }
            }
            if (letter.display == true) {
                if (font_ready) {
                    myp5.textFont(noto_sans_arm);
                }
                myp5.textAlign('center', 'center');
                myp5.textSize(TEXT_SIZE);
                myp5.textStyle('bold');
                myp5.text(letter.text, letter.position.x, letter.position.y);
                myp5.fill(0, 0, 0);
            }
        }
    }
}

const sketch = new Hydra({
    // selects our canvas element in our DOM
    canvas: document.getElementById("hydra-canvas"),

    width: window.innerWidth,

    height: window.innerHeight,

    pb: null,

    autoLoop: true,

    makeGlobal: true,
    // while this pollutes the global namespace
    // it makes it easier to copy and paste existing
    // hydra code

    numSources: 4,

    numOutputs: 4,

    detectAudio: false
    // prevents microphone prompt
    // if your code doesn't use audio
});

// once hydra instance is created
// you can then copy / paste exisiting hydra sketch

// osc().out(o0);

s0.init({ src: myp5.canvas });

src(s0)
    .modulate(noise(1, 0.05))
    .add(osc(13, 0.5, 5))
    .out(o0);

render(o0);
