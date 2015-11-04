
context = new AudioContext()


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
    this.attackTime = .4;
    this.releaseTime = .3;

  };

// 'triggers' have no 'off', it is engaged, then runs its course changing the volume
  EnvelopeGenerator.prototype.triggerOn = function(maxVolume, duration) {
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    console.log("EG trigger on")
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(maxVolume, now + this.attackTime);
    this.param.setValueAtTime(maxVolume, now + this.attackTime + duration/1000)
    this.param.setTargetAtTime(0, now + this.attackTime + duration/1000, this.releaseTime);
  };

// 'gates' are switched on, changing volume to its constant 'on' level until the gate is turned off
  EnvelopeGenerator.prototype.gateOn = function(maxVolume) {
    console.log("EG gate on")
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(maxVolume, now + this.attackTime);
    return context.currentTime
  };
// the 'off' gate brings the volume back down to 0
  EnvelopeGenerator.prototype.gateOff = function() {
    console.log("EG gate off")
    now = context.currentTime
    this.param.linearRampToValueAtTime(0, now + this.releaseTime)
    return context.currentTime
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



// constructor function which designates and groups the relevant parts of the synthesizer
var SynthSystem = function(){

  this.vcosConfig = (function(){
    // pitch controlling oscillators
    var pitchOscillators = {    
    oscillator: new VCO,
    oscillator2: new VCO,
    oscillator3: new VCO
    }

    pitchOscillators.oscillator3.oscillator.type = "triangle"

    return pitchOscillators
  })()


  this.vcasConfig = (function(){
    // primary amplifier node
    var amplifers = {
      vca: new VCA
    }
    return amplifers
  })()

  this.lfosConfig = (function(){
    // low frequency oscillators, for modulation
    var lfoComponents = {
      LFO: new VCO,
      LFOgain: new VCA
    }

    lfoComponents.LFO.oscillator.frequency.value = 5
    lfoComponents.LFOgain.volume.gain.value = 8

    return lfoComponents
  })()

  this.egsConfig = (function(){
    // envelope generator for volume contour
    var EnvelopeGenerators = {
      EG: new EnvelopeGenerator
    }
    return EnvelopeGenerators
  })()

}

SynthSystem.prototype.connectNodes = function(){
  // route pitch oscillators to vca
  this.vcosConfig.oscillator.connect(this.vcasConfig.vca.volume)
  this.vcosConfig.oscillator2.connect(this.vcasConfig.vca.volume)
  this.vcosConfig.oscillator3.connect(this.vcasConfig.vca.volume)

  this.lfosConfig.LFO.connect(this.lfosConfig.LFOgain.volume)   // route lfo to lfoGain
  this.lfosConfig.LFOgain.connect(this.vcosConfig.oscillator2.oscillator.frequency) // route lfoGain to oscillator2 frequency

  this.egsConfig.EG.connect(this.vcasConfig.vca.amplitude)   // route EG to vca amplitude

  this.vcasConfig.vca.connect(context.destination)  // route vca to output 
}




var sequenceTest = [
  {pitch: 440, duration: 2},
  {pitch: 660, duration: .5},
  {pitch: 880, duration: 2},
  {pitch: 440, duration: 2},
  {pitch: 880, duration: .5}, 
  {pitch: 440, duration: 1},
  {pitch: 660, duration: .25},
  {pitch: 880, duration: 1},
  {pitch: 440, duration: 1},
  {pitch: 880, duration: 1} 
]




// array of objects for data on all clicked notes 
var playedNote = []
// var playedFrequency = []
var maxVolume = 1

// instantiate the SynthSystem constructor, then connect the audio nodes
var synthSystem = new SynthSystem()
synthSystem.connectNodes()

// function for when note on keyboard is clicked
myKeyboard.keyDown = function (note, frequency){
  console.log(note)
  console.log(frequency)
    
  synthSystem.vcosConfig.oscillator.setFrequency(frequency)
  synthSystem.vcosConfig.oscillator2.setFrequency(frequency * 2)
  synthSystem.vcosConfig.oscillator3.setFrequency(frequency)
  synthSystem.egsConfig.EG.gateOn(maxVolume)
  // console.log(keytimeDown)
  playedNote.push({key: note, pitch: frequency}) 
  // playedFrequency.push(frequency) 
}

// when keyboard note is released
myKeyboard.keyUp = function (note, frequency){

  synthSystem.egsConfig.EG.gateOff()
  // console.log(keytimeUp)  
}




