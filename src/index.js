const Hydra = require('hydra-synth')
const p5 = require('p5')

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
};

const MIDI_ON_CMD = 144;
const TEXT_SIZE = 200;
const DRAW_MARGIN = 0;

window.onload = function () {
    const hydra = new Hydra()

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

    let myp5 = new p5((sketch) => {
        sketch.setup = () => {
            sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        }
    });

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
                    myp5.textAlign('center', 'center')
                    myp5.textSize(TEXT_SIZE);
                    myp5.textStyle('bold');
                    myp5.text(letter.text, letter.position.x, letter.position.y);
                    myp5.fill(255, 255, 255);
                }
            }
        }
    }


    s0.init({ src: myp5.canvas });
    src(s0).out();
    src(s0).modulate(noise(1, 0.05)).out(o1);

    osc(4, 0.1, 0.8)
        .color(1.04, 0, -1.1)
        .rotate(0.30, 0.1)
        .pixelate(2, 20)
        .modulate(noise(2.5), () => 1.5 * Math.sin(0.08 * time))
        .mask(src(o1))
        .out(o0)

}
