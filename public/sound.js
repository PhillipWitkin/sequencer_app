
context = new AudioContext()

// var LFO = require('lfo')

var VCO = (function(context) {
  function VCO(){
    this.oscillator = context.createOscillator();
    this.oscillator.type = 'sawtooth';
    // this.oscillator.frequency.value = 440;
    this.oscillator.start(0);

    this.input = this.oscillator;
    this.output = this.oscillator;

    // var that = this;
    // $(document).bind('frequency', function (_, frequency) {
    //   that.setFrequency(frequency);
    // });
  };

  VCO.prototype.setFrequency = function(frequency) {
    this.oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  };

  VCO.prototype.connect = function(node) {
    // if (node.hasOwnProperty('input')) {
    //   this.output.connect(node.input);
    // } else {
    //   this.output.connect(node);
    // };
    this.output.connect(node)
  }

  return VCO;
})(context);

var VCA = (function(context) {
  function VCA(){
    this.volume = context.createGain();
    this.volume.gain.value = 0
    this.input = this.volume
    this.output = this.volume
    this.amplitude = this.volume.gain     
  }

  VCA.prototype.connect = function(node){
    // if (node.hasOwnProperty('input')) {
    //   this.output.connect(node.input);
    // } else {
    //   this.output.connect(node);
    // };
    this.output.connect(node)
  }

  return VCA
})(context)

var EnvelopeGenerator = (function(context) {
  function EnvelopeGenerator(){
    this.attackTime = .2;
    this.releaseTime = .4;

  };

  EnvelopeGenerator.prototype.triggerOn = function(maxVolume, duration) {
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    console.log("EG trigger on")
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(maxVolume, now + this.attackTime);
    this.param.setValueAtTime(maxVolume, now + this.attackTime + duration/1000)
    this.param.setTargetAtTime(0, now + this.attackTime + duration/1000, this.releaseTime);
  };

  EnvelopeGenerator.prototype.gateOn = function(maxVolume) {
    console.log("EG gate on")
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(maxVolume, now + this.attackTime);
  };

  EnvelopeGenerator.prototype.gateOff = function() {
    console.log("EG gate off")
    now = context.currentTime
    this.param.setTargetAtTime(0, now, this.releaseTime)
  }

  EnvelopeGenerator.prototype.connect = function(param) {
    this.param = param;
  };

  return EnvelopeGenerator

})(context)




var myKeyboard = new QwertyHancock({
  id: 'keyboard',
  width: 900,
  height: 110,
  octaves: 4,
  startNote: 'A2',
  whiteNotesColour: 'white',
  blackNotesColour: 'black',
  activeColour: 'blue'
})

// var Synthesizer = function(context){
//   this.oscillator = new VCO
//   this.vca = new VCA
//   this.EG = new EnvelopeGenerator

//   this.oscillator.connect(this.vca)
//   this.EG.connect(this.vca.amplitude)
//   this.vca.connect(context.destination)
// }

// note pitch
var oscillator = new VCO
var oscillator2 = new VCO
var oscillator3 = new VCO
oscillator3.oscillator.type = "triangle"

//LFO controlling primary oscillator
var LFO = new VCO
LFO.oscillator.type = "triangle"

//LFO controlling frequency of primary amp
var LFOamp = new VCO
LFOamp.oscillator.type = "sine"
var LFOfilter = new VCO

var LFOgain = new VCA
var LFOampGain = new VCA
var LFOampGainGate = new VCA
var LFOfilterGain = new VCA

var EGosc3Gain = new VCA
var EGosc3Level = new VCA



//note volume
var vca = new VCA;
// vca.amplitude = .5
var EG = new EnvelopeGenerator
var EGfiler = new EnvelopeGenerator
var EGosc3 = new EnvelopeGenerator
EGosc3.attackTime = 2


LFO.oscillator.frequency.value = 5
LFO.connect(LFOgain.volume)//connect LFO to gain 
LFOgain.connect(oscillator2.oscillator.frequency)//route LFO to modulate oscillator2 pitch 
LFOgain.volume.gain.value = 8 //gain for LFO

// EGosc3.connect(EGosc3Gain.volume)
// EGosc3Gain.volume.gain.value = 50
// EGosc3Gain.connect(EGosc3Level.amplitude)
// EGosc3Level.volume.gain.value = 100
// EGosc3Level.connect(oscillator3.oscillator.frequency)

oscillator.connect(vca.volume)//connect oscillator to amplifier
oscillator2.connect(vca.volume)//connect oscillator2 to amplifier
oscillator3.connect(vca.volume)
// vca.volume.gain.value = 0
// LFOamp.oscillator.frequency.value = 2 
// LFOamp.connect(LFOampGain.volume) //route LFOamp to LFOampGainMod
// LFOampGain.volume.gain.value = 5 //set LFOampGain
// LFOampGain.connect(LFOampGainGate.volume)
// EG.connect(LFOampGainGate.amplitude)//routing to try and make sure EG gates the LFOamp, and the amp stays off unless the EG is active 
// LFOampGainGate.volume.gain.value = 0
// LFOampGainGate.connect(vca.amplitude) //route LFOampGain to the primary amp
EG.connect(vca.amplitude)//route EG to modulate amplifier
vca.connect(context.destination)//connect amp to end

var sequenceTest = [
  {pitch: 440, duration: 1000},
  {pitch: 660, duration: 400},
  {pitch: 880, duration: 2000},
  {pitch: 440, duration: 200},
  {pitch: 880, duration: 600}, 
  {pitch: 440, duration: 1000},
  {pitch: 660, duration: 400},
  {pitch: 880, duration: 2000},
  {pitch: 440, duration: 200},
  {pitch: 880, duration: 600} 
]

var currentSequence = []

var synthParams = {
  osc2Int: 2
}

var i = 0
var repeat  = false





var playedNote = []
var playedFrequency = []
var maxVolume = 1

myKeyboard.keyDown = function (note, frequency){
  console.log(note)
  console.log(frequency)
    
  oscillator.setFrequency(frequency)
  oscillator2.setFrequency(frequency * 2)
  oscillator3.setFrequency(frequency)
  EG.gateOn(maxVolume)
  playedNote.push({key: note, pitch: frequency}) 
  // playedFrequency.push(frequency) 
}

myKeyboard.keyUp = function (note, frequency){
  // vca.disconnect(context.destination)
  // vca.gain.value = 0
  // oscillator.oscillator.disconnect(vca)
  EG.gateOff()
  
}

