
import './App.css';
import {useState} from 'react'
import * as Tone from 'tone'
// const { Midi } = require('@tonejs/midi')


const App = () => {
    let [myDevices, setMyDevices] = useState([])

  console.clear()
  //------------------------------------------
  //    REQUEST MIDI ACCESS
  //------------------------------------------
  navigator.requestMIDIAccess().then(access => {
    console.log(access.inputs)
    console.log(access.outputs)
    console.log(access)
  }).catch(console.error)


  //------------------------------------------
  //    SHOW DEVICES
  //------------------------------------------
  navigator.requestMIDIAccess().then(access => {
    const devices = access.inputs.values()
    for (let device of devices)
      console.log(device)
  }).catch(console.error)


  //------------------------------------------
  //    SHOW MIDI MESSAGES
  //------------------------------------------
  // function onMidiMessage(message) {
  //   console.log(message)
  // }


  //---------------------------------------------
  //    GRAB DATA FROM UNIT8 ARRAY AND
  //    ASSIGN THEM TO VARRIABLES
  //---------------------------------------------
  // function onMidiMessage(message) {
  //   let [_, input, value] = message.data
  //   console.log({input, value})
  // }



  //---------------------------------------------
  //    MIDI ACCESS
  //---------------------------------------------
  class MIDIAccess {
    constructor(args = {}) {
      this.onDeviceInput = args.onDeviceInput || console.log;
    }

    start() {
      return new Promise((resolve, reject) => {
        this._requestAccess().then(access => {
          this.initialize(access);
          resolve();
        }).catch(() => reject('Something went wrong.'));
      });
    }

    initialize(access) {
      const devices = access.inputs.values();
      for (let device of devices) this.initializeDevice(device);
    }

    initializeDevice(device) {
      device.onmidimessage = this.onMessage.bind(this);
    }

    onMessage(message) {
      let [_, input, value] = message.data;
      this.onDeviceInput({ input, value });
    }

    _requestAccess() {
      return new Promise((resolve, reject) => {
        if (navigator.requestMIDIAccess)
          navigator.requestMIDIAccess()
            .then(resolve)
            .catch(reject);
        else reject();
      });
    }
  }

  class Instrument {
    constructor() {
      this.synth = new Tone.PolySynth(3, Tone.FMSynth);

      this.filter = new Tone.Filter();
      this.volume = new Tone.Gain();

      this.synth.connect(this.filter);
      this.filter.connect(this.volume);
      this.volume.toDestination();

      this.filter.frequency.value = 200; // 200 - 15000
      this.volume.gain.value = 0.8; // 0-0.8
    }

    toggleSound(value) {
      let method = value === 127 ? 'triggerAttack' : 'releaseAll';
      this.synth[method](['C4', 'E4', 'G4']);
    }

    handleVolume(value) { // 0-127
      let val = value / 127 * 0.8;
      this.volume.gain.value = val;
    }

    handleFilter(value) { // 0-127
      let val = value / 127 * 14800 + 200;
      this.filter.frequency.value = val;
    }
  }

  // UPDATE: there is a problem in chrome with starting audio context
  //  before a user gesture. This fixes it.
  let started = false;
  document.documentElement.addEventListener('keydown', () => {
    if (started) return;
    started = true;
    const inst = new Instrument();
    const midi = new MIDIAccess({ onDeviceInput });
    midi.start().then(() => {
      console.log('STARTED!');
    }).catch(console.error);

    function onDeviceInput({ input, value }) {
      if (input === 23) inst.toggleSound(value);
      else if (input === 2) inst.handleVolume(value);
      else if (input === 14) inst.handleFilter(value);
      else console.log('onDeviceInput!', input, value);
    }
  });

  const midi = new MIDIAccess({onDeviceInput})
  midi.start().then(() => {
    console.log('Started')
  }).catch(console.error)

  function onDeviceInput({input, value}) {
    console.log('onDeviceInput', input, value)
  }






  //sequencer
  console.clear();

  // UPDATE: there is a problem in chrome with starting audio context
  //  before a user gesture. This fixes it.
  document.documentElement.addEventListener('mousedown', () => {
    if (Tone.context.state !== 'running') Tone.context.resume();
  });

  const synths = [
    new Tone.Synth(),
    new Tone.Synth(),
    new Tone.Synth()
  ];

  synths[0].oscillator.type = 'triangle';
  synths[1].oscillator.type = 'sine';
  synths[2].oscillator.type = 'sawtooth';

  const gain = new Tone.Gain(0.6);
  gain.toDestination();

  synths.forEach(synth => synth.connect(gain));

  const $rows = document.body.querySelectorAll('div > div'),
        notes = ['G5', 'E4', 'C3'];
  let index = 0;

  Tone.Transport.scheduleRepeat(repeat, '8n');

  const play = () => {
      Tone.Transport.start();
  }


  function repeat(time) {
    let step = index % 8;
    for (let i = 0; i < $rows.length; i++) {
      let synth = synths[i],
          note = notes[i],
          $row = $rows[i],
          $input = $row.querySelector(`input:nth-child(${step + 1})`);
      if ($input.checked) synth.triggerAttackRelease(note, '8n', time);
    }
    index++;
  }











  return (
    <>
      <h3>Hello, Hook up your MIDI device, refresh the page and look in your console</h3>
      <div>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
  </div>
  <div>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
  </div>
  <div>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
    <input type='checkbox'/>
  </div>
  <button onClick={play}>Play</button>
    </>
  )


}

export default App;
