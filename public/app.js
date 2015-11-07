console.log("app.js loaded")
// code to make timers work with 'this'
var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
 
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeST__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};
 
window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeSI__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};

// var currentSequence = []
var sequenceContinue = false
var sequenceRepeat = false
var sequencerTempo = 120
var tempoAnimateId



//controls animation of the tempo icon
function animateBeat(){
  var beatLength = (1000 / (sequencerTempo / 60)) - 100
  self = $('[data-attr="tempo-icon"]')
  self.fadeOut(beatLength/2, function(){
    self.fadeIn(beatLength/2)
  })
}


var loadSequenceCollection = new SequenceLoadCollection()

var loadSequenceCollectionView = new SequenceLoadCollectionView({
  collection: loadSequenceCollection,
  el: $('ul[data-role="sequence-selector"]')
})

var saveSequenceView = new SaveSequenceView({
  el: $('[data-role="save-sequence"]')
})


var tempoSelectView = new TempoSelectView({
  el: $('[data-control="tempo-control"]')
})

var sequenceControlView = new SequencerControlView({
  // model: sequence1,
  el: $('div[data-control="sequence-control"]')
})


var noteForm = new NoteFormView({
  // model: sequence1, 
  el: $('[data-role="note-form"]')
})
    


// module for handling the 16 block views
var synthViews = (function(){

  var sequenceLabelView = new SequenceLabelView({el: $('[data-attr="sequence-label"]')})

  var blockViews = {}

  function createBlockViews(){
    for(i=1; i < 17; i++){
      var domElement = 'div[data-sequence="' + i + '"]'
      var blockName = 's' + i + 'BlockView'
      blockViews[blockName] = new SequenceBlockView({el: $(domElement)})
    }
  }

  function selelectModelData(newModelData, source){
    if (source === "saveNew"){
      var sequence1 = new Sequence(newModelData)
      console.log(sequence1)
      return sequence1  
    }else if (source === "loadMenu"){
      return newModelData
    }
  }

  //when called by clicking a sequence from the load menu, this will be called using a model associated with that view 
  //but if called after a new sequence is saved, the argument will have a value from the newly created model
  function setBlockModel(modelData, source){
    var sequence1 = selelectModelData(modelData, source)

    sequenceLabelView.model = sequence1
    //re-render the view for the name label so correct name appears
    sequenceLabelView.reset()
    sequenceLabelView.render()
    //make sure all the sequencer blocks are clear
    for(x=1; x < 17; x++){
      $('[data-sequence="'+ x + '"]').removeClass('active')
    }
    //re-sets sequence1 as the model for all other related views
    noteForm.model = sequence1
    noteForm.close()
    sequenceControlView.model = sequence1
    
    for (var view in blockViews){
      blockViews[view].model = sequence1
    }

    saveSequenceView.model = sequence1
  }


  return {
    blockViews: (function(){
      return blockViews
    })(),
    setBlockModel: setBlockModel,
    create: createBlockViews
  }

})() 


//used when user clicks a sequence block
function testNote(pitch, duration){                
            
    console.log(pitch)
    console.log(duration)

    synthSystem.vcosConfig.oscillator.setFrequency(pitch)
    synthSystem.vcosConfig.oscillator2.setFrequency(pitch * 2)
    // synthSystem.vcosConfig.oscillator3.setFrequency(pitch)
    synthSystem.vcosConfig.oscillator3.setFrequencyWithPortamento(pitch, synthSystem.soundParams.portamento)
 
    synthSystem.egsConfig.filterEG.triggerOn(synthSystem.soundParams.filter.stopLevel, duration, synthSystem.soundParams.filter.startLevel)

    synthSystem.egsConfig.EG.triggerOn(synthSystem.soundParams.volume, duration)
}

//create the views for th 16 blocks
synthViews.create()

// select the most recent sequence model from the collection
setTimeout(function(){
  synthViews.setBlockModel(loadSequenceCollection.at(loadSequenceCollection.length - 1), "loadMenu")  
}, 1000)


// constructor for preparing Sequence model for play
var SequencePlayer = function(model){
  this.model = model  
  this.step = 0
  this.repeat = false
  // this.playerSequence = sequenceTest //temporary
}

// takes the Sequence model and converts it into playable values
SequencePlayer.prototype.convertModel = function(){
    currentSequence = []
    console.log("play sequence button clicked")
    //cleaning up sequence model to be used be sequencer
    var sequenceObject = _.pick(this.model.attributes, 
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
    this.playerSequence = currentSequence
    return currentSequence  
}

SequencePlayer.prototype.pitch = function(){
    return this.playerSequence[this.step].pitch
}

SequencePlayer.prototype.duration = function(){
    return this.playerSequence[this.step].duration * (1000 / (sequencerTempo / 60))
}



var runSequence = function(model){

  var sequencePower = new SequencePlayer(model)
  sequencePower.convertModel()
  sequenceContinue = true
  synthSystem.setVolumeMax()

  // plays individual note
  var playTheNote = function(sequence){

    var pitch = sequence.pitch()
    var duration = sequence.duration() 

    var step = sequence.step       
    console.log(pitch)
    console.log(duration)
    console.log(sequence.step)

    if (pitch !== 0){ // make sure there is a nonzero pitch, so we don't get a "blip"
      synthSystem.vcosConfig.oscillator.setFrequency(pitch)
      synthSystem.vcosConfig.oscillator2.setFrequency(pitch * 2)
      // synthSystem.vcosConfig.oscillator3.setFrequency(pitch)
      synthSystem.vcosConfig.oscillator3.setFrequencyWithPortamento(pitch, synthSystem.soundParams.portamento)
      synthSystem.egsConfig.EG.triggerOn(synthSystem.soundParams.volume, duration)
      synthSystem.egsConfig.filterEG.triggerOn(synthSystem.soundParams.filter.stopLevel, duration, synthSystem.soundParams.filter.startLevel)

    }else {
       //if the note is rest, do nothing-EG.off creates a 'blip'
    }
              // animate current sequence block
    var noteLength = duration
    var selection = "data-sequence=" + (step+1).toString()
    el = $('div[' + selection + ']')
    el.animate({
      top: "+=30"
    }, noteLength/2, function(){
      el.animate({
        top: "-=30"
      }, noteLength/2)
    })
  }

  // main sequence function - called recursively
  var playTheSequence = function(){
    // play note at current poistion
    playTheNote(sequencePower)
    // test conditions for next position
    if (sequenceContinue === true){
      var noteLength = sequencePower.duration() //duration of current block

      if (sequencePower.step < 15){ // check to see if sequence has reached the end
        // move to the next block
        sequencePower.step +=1
        console.log(noteLength)
          //call the function again after the current note has elapsed
        setTimeout(playTheSequence, noteLength)

      }else if (sequencePower.step === 15 && sequenceRepeat === true) {
        sequencePower.step = 0
      //call the function again at first position after the current note has elapsed if the sequence is set to repeat       
        setTimeout(playTheSequence, noteLength) 
      }else {
        sequenceContinue = false
        return "complete"
      }
    }
  }

  return {
    play: playTheSequence,
    sequence: sequencePower 
  }

} 








  







