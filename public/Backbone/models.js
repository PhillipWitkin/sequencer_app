console.log("Models loaded")

var Sequence = Backbone.Model.extend({
  urlRoot: '/api/sequences',

  updateSequence: function(){
    var stringifiedModel = _.mapObject(this.attributes, function(val, key){
      return val.toString()
    })
    var sequenceId = this.get('id')
    console.log(stringifiedModel)
    return $.ajax({
      method: "PUT",
      url: 'api/sequences/' + sequenceId,
      data: stringifiedModel
    })

  },

  createSequence: function(){
    var modelWithoutId = _.omit(this.attributes, 'id')
    var stringifiedModel = _.mapObject(modelWithoutId, function(val, key){
      return val.toString()
    })
    console.log(stringifiedModel)
    return $.ajax({
      method: "POST",
      url: 'api/sequences',
      data: stringifiedModel
    })
  }

})


var SequenceLoadCollection = Backbone.Collection.extend({
  url: '/api/sequences',
  model: Sequence
})


// takes Sequence model and prepares it to be played
var SequencePlay = Sequence.extend({
  // constructor: function(){

  // },
  initialize: function(attributes){

      currentSequence = []
      console.log("play sequence button clicked")
      //cleaning up sequence model to be used be sequencer
      var sequenceObject = _.pick(attributes, 
        "sb_1_pitch", 
        "sb_1_duration",
        "sb_2_pitch", 
        "sb_2_duration",
        "sb_3_pitch", 
        "sb_3_duration",
        "sb_4_pitch", 
        "sb_4_duration",
        "sb_5_pitch", 
        "sb_5_duration",
        "sb_6_pitch", 
        "sb_6_duration",
        "sb_7_pitch", 
        "sb_7_duration",
        "sb_8_pitch", 
        "sb_8_duration",
        "sb_9_pitch", 
        "sb_9_duration",
        "sb_10_pitch", 
        "sb_10_duration",
        "sb_11_pitch", 
        "sb_11_duration",
        "sb_12_pitch", 
        "sb_12_duration",
        "sb_13_pitch", 
        "sb_13_duration",
        "sb_14_pitch", 
        "sb_14_duration",
        "sb_15_pitch", 
        "sb_15_duration",
        "sb_16_pitch", 
        "sb_16_duration"
        )
      //make operations easier by first flattening the object into an array
      var sequenceArray = _.pairs(sequenceObject)
      // console.log(sequenceArray)

      //convert the array back to an object with a structure easy for the sequencer to read
      for (b = 0; b < 32; b+=2){
        console.log(b)
        var blockPitch = sequenceArray[b]
        var blockDuration = sequenceArray[b + 1]
        // durations are returned by the server as strings representing fractions of traidtional note length,
        // eg: 1/2, 1/4, 1/8, etc. This value must be split into two, then those two divided for a decimal duration.
        var blockDurationCalc = blockDuration[1].split('/')   
        block = {
          pitch: parseInt(blockPitch[1]),
          // the duration value is multiplied by 4 to represent 4/4 time, where 1/4 gets 1 beat, so the values scale with the tempo
          duration: 4 * (parseInt(blockDurationCalc[0]) / parseInt(blockDurationCalc[1])) 
        }
        // console.log(block)
        currentSequence.push(block)
      }

      this.blocks = currentSequence
      return currentSequence  

  }

})


var Voice = Backbone.Model.extend({
  defaults: {
    volume: .7,
    oscillatorShape: 'square',
    oscillator2Interval: 12,
    oscillator2Shape: 'sawtooth',
    oscillator3Interval: 0,
    oscillator3Shape: 'triangle',
    portamento: .05,
    LFOfrequency: 5,
    LFOgain: 8,
    filterCutoff: 2000,
    filterResonance: 1,
    filterEGattackTime: .3,
    filterEGdecayTime: .1,
    filterEGreleaseTime: .3,
    filterEGstartLevel: .06, // cutoff start controlled by filterEG
    filterEGstopLevel: 1, // cutoff stop controlled by filter 
    filterEGsustainLevel: .5,
    filterEGgain: .5,
    EGattackTime: .3,
    EGdecayTime: .1,
    EGsustainLevel: .5,
    EGreleaseTime: .3
  }

  // set: function(attributes, options){
  //   Backbone.Model.prototype.set.apply(this, arguments)
  //   synthSystem.soundParams = this.attributes
  // }
})

