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
function triggerNote(pitch, duration){                
            
    console.log(pitch)
    console.log(duration)

    synthSystem.vcosConfig.oscillator.setFrequency(pitch)
    synthSystem.vcosConfig.oscillator2.setFrequency(pitch * 2)
    // synthSystem.vcosConfig.oscillator3.setFrequency(pitch)
    synthSystem.vcosConfig.oscillator3.setFrequencyWithPortamento(pitch, synthSystem.soundParams.portamento)
 
    synthSystem.egsConfig.filterEG.triggerOn(synthSystem.soundParams.filter.stopLevel, duration, synthSystem.soundParams.filter.startLevel)

    synthSystem.egsConfig.EG.triggerOn(synthSystem.soundParams.volume, duration)
}

function animateBlock(number, time){
    var selection = "data-sequence=" + (number).toString()
    el = $('div[' + selection + ']')
    el.animate({
      top: "+=30"
    }, time/2, function(){
      el.animate({
        top: "-=30"
      }, time/2)
    })
}


//create the views for th 16 blocks
synthViews.create()

// select the most recent sequence model from the collection
setTimeout(function(){
  synthViews.setBlockModel(loadSequenceCollection.at(loadSequenceCollection.length - 1), "loadMenu")  
}, 1000)


// constructor for what is actually fed into main sequence function
var SequencePlayer = function(model){
  this.model = new SequencePlay(model.attributes) 
  this.step = 0
  this.repeat = false
  this.playerSequence = this.model.blocks 
}


SequencePlayer.prototype.pitch = function(){
    return this.playerSequence[this.step].pitch
}

SequencePlayer.prototype.duration = function(){
    return this.playerSequence[this.step].duration * (1000 / (sequencerTempo / 60))
}



var runSequence = function(model){

  // var sequencePre = new SequencePlay(model.attributes)
  // sequencePower.convertModel()
  var sequencePower = new SequencePlayer(model)
  sequenceContinue = true
  synthSystem.setVolumeMax()

  // plays individual note
  var playTheNote = function(sequence){

    var pitch = sequence.pitch()
    var duration = sequence.duration() 

    var step = sequence.step       
    // console.log(pitch)
    // console.log(duration)
    // console.log(sequence.step)

    if (pitch !== 0){ // make sure there is a nonzero pitch, so we don't get a "blip"
      triggerNote(pitch, duration)
    }else {
       //if the note is rest, do nothing-EG.off creates a 'blip'
    }
              // animate current sequence block
    var noteLength = duration
    animateBlock(step+1, duration)
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








  







