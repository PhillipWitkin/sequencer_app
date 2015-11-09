console.log("sound.js loaded")

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

  VCO.prototype.setFrequencyWithPortamento = function(frequency, time) {
    this.oscillator.frequency.setTargetAtTime(frequency, context.currentTime, time)
  }

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
    this.attackTime = .3;
    this.releaseTime = .3;

  };


// 'triggers' have no 'off', it is engaged, then runs its course changing the volume
  EnvelopeGenerator.prototype.triggerOn = function(max, duration, min) {
    console.log("EG trigger on")
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setTargetAtTime(min || 0, now, .01);
    this.param.linearRampToValueAtTime(max, now + this.attackTime);
    // this.param.setValueAtTime(max, now + this.attackTime + duration/1000)
    this.param.setTargetAtTime(min || 0, now + this.attackTime + duration/1000, this.releaseTime);
  };

// 'gates' are switched on, changing (volume or other parameter) starting at min, to its constant max 'on' level until the gate is turned off
  EnvelopeGenerator.prototype.gateOn = function(max, min) {
    console.log("EG gate on")
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(min || 0, now);
    this.param.linearRampToValueAtTime(max, now + this.attackTime);
    return context.currentTime
  };
// the 'off' gate brings the (volume) back down to 0 or min value
  EnvelopeGenerator.prototype.gateOff = function(min) {
    console.log("EG gate off")
    now = context.currentTime
    this.param.cancelScheduledValues(now);
    this.param.linearRampToValueAtTime(min || 0, now + .01 + this.releaseTime)
    return context.currentTime
  }

  EnvelopeGenerator.prototype.connect = function(param) {
    this.param = param;
  };

  return EnvelopeGenerator

})(context)


// Biquad filter
var BQF = (function(context) {

  function BQF(){
    this.filter = context.createBiquadFilter()
    this.filter.type = 'lowpass' // default 
    this.lowPassFilter = this.filter

    this.input = this.lowPassFilter
    this.output = this.lowPassFilter
    // set default values
    this.lowPassFilter.frequency.value = 2000
    this.lowPassFilter.Q.value = 10

    this.gainForEG = 0
  }

  BQF.prototype.connect = function(node) {
    this.output.connect(node)
  }

  BQF.prototype.setCutoffFrequency = function(frequency){
    // frequency should fall between 40 and 20,000
    this.lowPassFilter.frequency.value = frequency
  }

  BQF.prototype.sweepCutoffFrequency = function(frequency, time){
    // frequency should fall between 40 and 20,000
    this.lowPassFilter.frequency.setTargetAtTime(frequency, context.currentTime, time || .2)
  }

  BQF.prototype.setResonanceLevel = function(level){
    // falls between .0001 and 1000
    this.filter.Q = level + .001
  }

  BQF.prototype.EGvalues = function(gain, level){
    return this.filter.frequency.value * ( 1 + ((level - 1) * gain ))
  }

  return BQF
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
      LFOgain: new VCA,
      LFOtremolo: new VCO,
      LFOtremeloGain: new VCA
    }

    lfoComponents.LFO.oscillator.frequency.value = 5
    lfoComponents.LFOgain.volume.gain.value = 8

    return lfoComponents
  })()

  this.egsConfig = (function(){
    // envelope generators 
    var envelopeGenerators = {
      EG: new EnvelopeGenerator, //for volume contour
      filterEG: new EnvelopeGenerator // for filter cutoff
    }

    envelopeGenerators.filterEG.attackTime = .2
    envelopeGenerators.filterEG.releaseTime = .05

    return envelopeGenerators
  })()

  this.filtersConfig = (function(){
    // low pass filter 
    var lowPassFilter = {
      LPF: new BQF
    }
    return lowPassFilter
  })()

  // shortcut to keep track of common params; fed into components as arguments
  this.soundParams = new Voice().attributes

}

SynthSystem.prototype.connectNodes = function(){
  // route pitch oscillators to vca
  this.vcosConfig.oscillator.connect(this.vcasConfig.vca.volume)
  this.vcosConfig.oscillator2.connect(this.vcasConfig.vca.volume)
  this.vcosConfig.oscillator3.connect(this.vcasConfig.vca.volume)

  this.lfosConfig.LFO.connect(this.lfosConfig.LFOgain.volume)   // route lfo to lfoGain
  this.lfosConfig.LFOgain.connect(this.vcosConfig.oscillator2.oscillator.frequency) // route lfoGain to oscillator2 frequency

  this.egsConfig.EG.connect(this.vcasConfig.vca.amplitude)   // route EG to vca amplitude

  // this.vcasConfig.vca.connect(context.destination)  // route vca to output
  this.egsConfig.filterEG.connect(this.filtersConfig.LPF.filter.frequency) // eg to modulate filter
  this.vcasConfig.vca.connect(this.filtersConfig.LPF.filter)  // route vca to filter
  this.filtersConfig.LPF.connect(context.destination) // route filter to output
}

SynthSystem.prototype.setVolumeMin = function(){
  this.soundParams.volume = 0
}

SynthSystem.prototype.setVolumeMax = function(level){
  this.soundParams.volume = level || .7
}

SynthSystem.prototype.setPortamento = function(milliseconds){
  this.soundParams.portamento = milliseconds / 1000
}

// computes adjusted values for filter envlope using gain
SynthSystem.prototype.EGvaluesFilter = function(){
  this.egsConfig.filterEG.attackTime = this.soundParams.filterEGattackTime
  this.egsConfig.filterEG.releaseTime = this.soundParams.filterEGreleaseTime
  return [this.soundParams.filterCutoff * ( 1 + ((this.soundParams.filterEGstopLevel - 1) * this.soundParams.filterEGgain)),
  this.soundParams.filterCutoff * ( 1 + ((this.soundParams.filterEGstartLevel - 1) * this.soundParams.filterEGgain ))]
}

SynthSystem.prototype.syncValues = function(){
  this.egsConfig.EG.attackTime = this.soundParams.EGattackTime
  this.egsConfig.EG.releaseTime = this.soundParams.EGreleaseTime
  this.vcosConfig.oscillator2.oscillator.type = this.soundParams.oscillator2Shape
  this.vcosConfig.oscillator3.oscillator.type = this.soundParams.oscillator3Shape
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
  synthSystem.vcosConfig.oscillator3.setFrequencyWithPortamento(frequency, synthSystem.soundParams.portamento)
  synthSystem.egsConfig.EG.gateOn(synthSystem.soundParams.volume)
  var filterEGvalues = synthSystem.EGvaluesFilter()
  synthSystem.egsConfig.filterEG.gateOn(filterEGvalues[0], filterEGvalues[1])

  // console.log(keytimeDown)
  playedNote.push({key: note, pitch: frequency}) 
  // playedFrequency.push(frequency) 
}

// when keyboard note is released
myKeyboard.keyUp = function (note, frequency){

  synthSystem.egsConfig.EG.gateOff()
  // console.log(keytimeUp)  
}




