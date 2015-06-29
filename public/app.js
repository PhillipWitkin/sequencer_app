// var currentSequence = []
var sequenceContinue = true
var sequenceRepeat = false
var sequencerTempo = 120
var tempoAnimateId

var Voice = Backbone.Model.extend({

})

var Sequence = Backbone.Model.extend({
  urlRoot: '/api/sequences'
})

var Project = Backbone.Model.extend({

})


var SequenceLabelView = Backbone.View.extend({
  
  template: $('[data-template="selected-label"]').text(),

  render: function(){
    var sequenceLabel = Mustache.render(this.template, this.model.attributes)
    $('[data-attr="default-label"]').empty()
    this.$el.html(sequenceLabel)
    // this.$el.fadeIn()
    
  },

  reset: function(){
    this.$el.empty()
    // this.$el.fadeOut()
  }
})

var sequenceLabelView = new SequenceLabelView({el: $('[data-attr="sequence-label"]')})


var SequenceLoadSelectionView = Backbone.View.extend({

  template: $('[data-template="sequence-choice"]').text(),

  render: function(){
    renderedChoice = Mustache.render(this.template, this.model.attributes)
    this.$el.html(renderedChoice)
    return this
  },

  events: {
    'click button[data-action="select-sequence-item"]': 'setSequence'
  },

  setSequence: function(){
    var sequence1 = this.model
    sequence1.fetch()
    selectedSequenceId = this.model.get('id')
    console.log("clicked to load sequence " + selectedSequenceId)
    loadNewModel(sequence1, "loadMenu")
  } 
})

  //when called by clicking a sequence from the load menu, this will be called using a model associated with that view 
  //but if called after a new sequence is saved, the argument will have a value from the newly created model
function loadNewModel(newModelData, source){
  if (source === "saveNew"){
    var sequence1 = new Sequence(newModelData)
    console.log(sequence1)  
  }else if (source === "loadMenu"){
    var sequence1 = newModelData
  } 
  sequenceLabelView.model = sequence1
  sequenceLabelView.reset()
  sequenceLabelView.render()

  for(x=1; x < 16; x++){
    $('[data-sequence="'+ x + '"]').removeClass('active')
  }

  noteForm.model = sequence1
  noteForm.close()
  sequenceControlView.model = sequence1
  s1BlockView.model = sequence1
  s2BlockView.model = sequence1
  s3BlockView.model = sequence1
  s4BlockView.model = sequence1
  s5BlockView.model = sequence1
  s6BlockView.model = sequence1
  s7BlockView.model = sequence1
  s8BlockView.model = sequence1
  s9BlockView.model = sequence1
  s10BlockView.model = sequence1
  s11BlockView.model = sequence1
  s12BlockView.model = sequence1
  s13BlockView.model = sequence1
  s14BlockView.model = sequence1
  s15BlockView.model = sequence1
  s16BlockView.model = sequence1
  saveSequenceView.model = sequence1
}

var SequenceLoadCollection = Backbone.Collection.extend({
  url: '/api/sequences',
  model: Sequence
})

var SequenceLoadCollectionView = Backbone.View.extend({
  initialize: function(){
    this.collection.fetch()
    this.listenTo(this.collection, 'add', this.addSequence)
    // this.render()
  },

  addSequence: function(sequenceFromCollection){
    var newSequenceLoadSelectionView = new SequenceLoadSelectionView({
      model: sequenceFromCollection
    })
    newSequenceLoadSelectionView.render()
    this.$el.append(newSequenceLoadSelectionView.$el)
  }

  //called after a new sequence is saved
  // loadNewSavedSequence: function(newModel){
  //   var newSequenceId = newModel.id
  //   console.log(newSequenceId)
  //   newModelFromCollection = loadSequenceCollection.get(newSequenceId)
  //   console.log(newModelFromCollection)
  //   loadNewModel(newModelFromCollection) 
  // }

})


var SaveSequenceView = Backbone.View.extend({

  events:{
    'click button[data-action="save-current-sequence"]': 'saveCurrentSequence',
    'click button[data-action="open-save-sequence-modal"]': 'openModal',
    'click button[data-action="save-as-new-sequence"]': 'saveNewSequence'
  },

  saveCurrentSequence: function(){
    console.log("save current sequence button")
    stringifiedModel = _.mapObject(this.model.attributes, function(val, key){
      return val.toString()
    })
    // this.model.save(stringifiedModel)
    var sequenceId = this.model.get('id')
    console.log(stringifiedModel)
    $.ajax({
      method: "PUT",
      url: 'api/sequences/' + sequenceId,
      data: stringifiedModel
    }).done(function(data){
      console.log(data)
    })
  },

  openModal: function(){
    if (this.model.attributes) {
      $('#save_sequence_modal').modal({
        keyboard: false
      })
    }
  },

  saveNewSequence: function(){
    // console.log("save new sequence button clicked")
    var newName = $('input[data-attr="new-sequence-name"]').val()
    console.log(newName)
    this.model.set({sequence_name: newName})
    var modelWithoutId = _.omit(this.model.attributes, 'id')
    var stringifiedModel = _.mapObject(modelWithoutId, function(val, key){
      return val.toString()
    })
    console.log(stringifiedModel)
    $.ajax({
      method: "POST",
      url: 'api/sequences',
      data: stringifiedModel
    }).done(function(data){
      console.log(data)
      $('#save_sequence_modal').modal('hide')
      loadSequenceCollection.fetch()
      // sequenceLabelView.render()
      // loadSequenceCollectionView.loadNewSavedSequence(data)
      loadNewModel(data, "saveNew")
    })
  }
})




var SequencerControlView = Backbone.View.extend({


  events: {
    'click button[data-action="play-sequence"]': 'startSequence',
    'click button[data-action="stop-sequence"]': 'stopSequence',
    'click button[data-action="repeat-sequence"]': 'setRepeat'
  },

  startSequence: function(){
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
    var sequenceArray = _.pairs(sequenceObject)

    // console.log(sequenceArray)
    for (b = 0; b < 32; b+=2){
      console.log(b)
      var blockPitch = sequenceArray[b]
      var blockDuration = sequenceArray[b + 1]
      var blockDurationCalc = blockDuration[1].split('/')   
      block = {
        pitch: parseInt(blockPitch[1]),
        // duration: 300

        duration: 4 * (parseInt(blockDurationCalc[0]) / parseInt(blockDurationCalc[1])) 
      }
      // console.log(block)
      currentSequence.push(block)
    }

    i = 0
    var duration
    var pitch
    console.log(currentSequence)
    sequenceContinue = true
    //restart tempo icon animation
    clearInterval(tempoAnimateId)
    tempoSelectView.setTempo()
    //start sequence
    playSequence()

  },

  stopSequence: function(){
    console.log("stop sequence button clicked")
    sequenceContinue = false
  },

  setRepeat: function(){
    if (sequenceRepeat !== true){
      sequenceRepeat = true 
      console.log("sequence set to repeat")
      $('button[data-action="repeat-sequence"]').addClass('active')
    }else {
      console.log("repeat cancelled")
      sequenceRepeat = false
      $('button[data-action="repeat-sequence"]').removeClass('active')
    }
  }

})


var SequenceBlockView = Backbone.View.extend({

  events: {
    'click  button[data-sequence]': 'getNote'
  },

  getNote: function(){
    blockNumber = parseInt(this.$el.attr('data-sequence'))
    console.log("sequencer button clicked " + blockNumber)
    this.$el.addClass("active")
    pitchBlockKey = "sb_" + blockNumber + "_pitch"
    durationBlockKey = "sb_" + blockNumber + "_duration"
    noteBlockKey = "sb_" + blockNumber + "_note"
    blockPitch = parseInt(this.model.get(pitchBlockKey))
    // blockDurationFunc = function(){
      testDuration = this.model.get(durationBlockKey).split('/') 
      actualDruation = (parseInt(testDuration[0])/parseInt(testDuration[1])) * 4 * (1000 / (sequencerTempo / 60)) 
    //   return actualDruation
    // }
    blockDuration = actualDruation
    console.log(blockDuration)
    blockNote = this.model.get(noteBlockKey) 
    console.log(blockPitch)
    testNote(blockPitch, blockDuration)
    el = this.$el
    this.$el.animate({
      top: "+=30"
    }, blockDuration/2, function(){
      el.animate({
        top: "-=30"
      }, blockDuration/2)
    })
    
    noteForm.render(blockNumber)
    // var S1note = myKeyboard.keyDown 
    // console.log(S1note)
  }
})


var NoteFormView = Backbone.View.extend({
  initialize: function(){
    // this.$el.empty()
  },
  
  events: {
    'blur input[data-id="note-val"]': 'inputNote',
    'blur input[data-id="frequency-val"]': 'inputNote',
    'click [data-action="set-block"]': 'setNote',
    'click button[data-attr="select-time"]': 'inputTime',
    'click input[data-id="select-rest"]': 'setRest',
    'click input[data-id="select-sound"]': 'setSound'
  },

  template: $('[data-template="new-note-form"]').text(),

  render: function(blockNumber){
    // this.$el.empty()
    // this.close()

    //since this form applies to 1 of 16 different blocks, we use the blockNunber to determine what values from the sequence model we wang
    var blockFrequency =  this.model.get("sb_" + blockNumber + "_pitch")
    var blockNote = this.model.get("sb_" + blockNumber + "_note")
    var blockDuration =  this.model.get("sb_" + blockNumber + "_duration")
    var blockSound
    var blockRest
    //check to see if the block is a rest or a sounded note
    if (blockFrequency !== "0"){
      blockSound = "checked"
      blockRest = ""
    }else {
      blockRest = "checked"
      blockSound = ""
      blockNote = "Rest"
    }

    //set up object for rendering template
    blockNumberObj = {
      sequenceBlock: blockNumber, 
      duration: blockDuration, 
      soundStatus: blockSound, 
      restStatus: blockRest
    }
    var rendered = Mustache.render(this.template, blockNumberObj)
    this.$el.fadeIn()
    this.$el.html(rendered)
    //set actual values not rendered by template
    $('input[data-id="frequency-val"]').val(blockFrequency)
    $('input[data-id="note-val"]').val(blockNote)
    $('input[data-id="length-val"]').val(blockDuration)
  },

  inputNote: function(){
    console.log("inputNote function fired")
    var noteValue = playedNote.pop()
    console.log(noteValue)
    $('input[data-id="note-val"]').val(noteValue.key) 
    $('input[data-id="frequency-val"]').val(noteValue.pitch)
  },

  setNote: function(event){
    event.preventDefault()
    blockNumber = $('[data-attr="note-input"]').attr('data-sequence-value')
    console.log("setting note for " + blockNumber)
    blockKeyPitch = blockNumber + "_pitch"
    blockKeyNote = blockNumber + "_note"
    blockKeyDuration = blockNumber + "_duration"

    newPitch = $('input[data-id="frequency-val"]').val()
    newNote = $('input[data-id="note-val"]').val()
    newDuration = $('input[data-id="length-val"]').val()

    dummbyPitchObject = {pitchToBe: blockKeyPitch}
    properPitchKeys = _.invert(dummbyPitchObject)
    pitchObject = _.mapObject(properPitchKeys, function(val, key){
      return val = newPitch
    })

    dummbyNoteObject = {noteToBe: blockKeyNote}
    properNoteKeys = _.invert(dummbyNoteObject)
    noteObject = _.mapObject(properNoteKeys, function(val, key){
      return val = newNote
    })

    dummbyDurationObject = {durationToBe: blockKeyDuration}
    properDurationKeys = _.invert(dummbyDurationObject)
    durationObject = _.mapObject(properDurationKeys, function(val, key){
      return val = newDuration
    })

    var newBlockValues = _.extend(pitchObject, durationObject, noteObject)

    console.log(newBlockValues)
    this.model.set(newBlockValues)
 
    // this.off()
    this.close()
  },

  setRest: function(){
    $('input[data-id="frequency-val"]').val("0")
    $('input[data-id="note-val"]').val("Rest")
  },

  setSound: function(){
    $('input[data-id="frequency-val"]').val("440")
    $('input[data-id="note-val"]').val("A4")
  },

  inputTime: function(event){
    $el = $(event.target)
    timeSelection = $el.attr('data-value')
    $('input[data-id="length-val"]').val(timeSelection)
  },

  close: function(){
    this.$el.fadeOut()
  }

})

var TempoSelectView = Backbone.View.extend({
  initialize: function(){
    this.adjustTempoFromSlider()    
  },
  
  events:{
    'click [data-action="tempo-slide"]': 'adjustTempoFromSlider',
    'blur [data-action="tempo-input"]': 'adjustTempoFromInput',
    'click [data-action="set-tempo-input"]': 'adjustTempoFromInput'
  },

  adjustTempoFromSlider: function(){
    var tempoSliderPos = $('input[data-action="tempo-slide"]').val()
    console.log(tempoSliderPos)
    $('input[data-action="tempo-input"]').val(tempoSliderPos)
    sequencerTempo = tempoSliderPos
    clearInterval(tempoAnimateId)
    this.setTempo()
  },

  adjustTempoFromInput: function(){
    var tempoInput = $('input[data-action="tempo-input"]').val()
    $('input[data-action="tempo-slide"]').val(tempoInput)
    sequencerTempo = tempoInput
    clearInterval(tempoAnimateId)
    this.setTempo()
  },

  setTempo: function(){
    var beatLength = 1000 / (sequencerTempo / 60)
    // console.log(beatLength)
    tempoAnimateId = setInterval(animateBeat, beatLength)
  }
})

function animateBeat(){
  // console.log("beat")
  var beatLength = (1000 / (sequencerTempo / 60)) - 100
  self = $('[data-attr="tempo-icon"]')
  self.fadeOut(beatLength/2, function(){
    self.fadeIn(beatLength/2)
  })
}

var SynthView = Backbone.View.extend({

})

var saveSequenceView = new SaveSequenceView({
  el: $('[data-role="save-sequence"]')
})

var tempoSelectView = new TempoSelectView({
  el: $('[data-control="tempo-control"]')
})

var loadSequenceCollection = new SequenceLoadCollection()

var loadSequenceCollectionView = new SequenceLoadCollectionView({
  collection: loadSequenceCollection,
  el: $('ul[data-role="sequence-selector"]')
})

var noteForm = new NoteFormView({
  // model: sequence1, 
  el: $('[data-role="note-form"]')
})
    
var sequenceControlView = new SequencerControlView({
  // model: sequence1,
  el: $('div[data-control="sequence-control"]')
})

var s1BlockView = new SequenceBlockView({
  el: $('div[data-sequence="1"]')
})

var s2BlockView = new SequenceBlockView({
  el: $('div[data-sequence="2"]')
})

var s3BlockView = new SequenceBlockView({
  el: $('div[data-sequence="3"]')
})

var s4BlockView = new SequenceBlockView({
  el: $('div[data-sequence="4"]')
})

var s5BlockView = new SequenceBlockView({
  el: $('div[data-sequence="5"]')
})

var s6BlockView = new SequenceBlockView({
  el: $('div[data-sequence="6"]')
})

var s7BlockView = new SequenceBlockView({
  el: $('div[data-sequence="7"]')
})

var s8BlockView = new SequenceBlockView({
  el: $('div[data-sequence="8"]')
})

var s9BlockView = new SequenceBlockView({
  el: $('div[data-sequence="9"]')
})

var s10BlockView = new SequenceBlockView({
  el: $('div[data-sequence="10"]')
})

var s11BlockView = new SequenceBlockView({
  el: $('div[data-sequence="11"]')
})

var s12BlockView = new SequenceBlockView({
  el: $('div[data-sequence="12"]')
})

var s13BlockView = new SequenceBlockView({
  el: $('div[data-sequence="13"]')
})

var s14BlockView = new SequenceBlockView({
  el: $('div[data-sequence="14"]')
})

var s15BlockView = new SequenceBlockView({
  el: $('div[data-sequence="15"]')
})

var s16BlockView = new SequenceBlockView({
  el: $('div[data-sequence="16"]')
})





function testNote(pitch, duration){
                  
            // duration = sequence1.get(durationBlockKey)
            // pitch = sequence1.get(pitchBlockKey)

            // pitch = sequence[i].pitch
            // duration  = sequence[i].duration
            
    console.log(pitch)
    console.log(duration)

    oscillator.setFrequency(pitch)
    oscillator2.setFrequency(pitch * 2)
    oscillator3.setFrequency(pitch)

    EG.triggerOn(1, duration)
            // EGosc3.triggerOn(10, duration)

}


    function playSequence(){

      function playNote(sequence, i){
            
            pitch = sequence[i].pitch
            duration = sequence[i].duration * (1000 / (sequencerTempo / 60))
            // duration = 1000 / (sequencerTempo / 60)
            
            console.log(pitch)
            console.log(duration)
            console.log(i)

            if (pitch !== 0){
              oscillator.setFrequency(pitch)
              oscillator2.setFrequency(pitch * 2)
              oscillator3.setFrequency(pitch)
              EG.triggerOn(1, duration)
            }else {
              EG.gateOff()
            }
            // animate current sequence block
            var noteLength = duration
            var selection = "data-sequence=" + (i+1).toString()
            el = $('div[' + selection + ']')
            el.animate({
              top: "+=30"
            }, noteLength/2, function(){
              el.animate({
                top: "-=30"
              }, noteLength/2)
            })
            // EGosc3.triggerOn(10, duration)

      }

      playNote(currentSequence, i)

      if (sequenceContinue === true){
        if (i < 15){
          i +=1
          // var noteLength = duration + 1000*EG.attackTime + 1000*EG.releaseTime
          var noteLength = duration
          setTimeout(playSequence, noteLength)

        }else if (i === 15 && sequenceRepeat === true) {
          i = 0
          // var noteLength = duration + 1000*EG.attackTime + 1000*EG.releaseTime
          var noteLength = duration
          setTimeout(playSequence, noteLength) 
        }
      }else {
        return "complete"
      }
    }


