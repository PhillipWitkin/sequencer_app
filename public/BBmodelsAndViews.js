console.log("Modles and Views loaded")

var Sequence = Backbone.Model.extend({
  urlRoot: '/api/sequences'
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

  // pitch: function(){
  //   return this.blocks[this.step].pitch
  // },

  // duration: function(){
  //   return this.blocks[this.step].duration
  // }

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

  //will be triggered from clicking any of the views associated with each model in the collection of sequences
  setSequence: function(){
    var sequence1 = this.model
    sequence1.fetch()
    selectedSequenceId = this.model.get('id')
    console.log("clicked to load sequence " + selectedSequenceId)
    synthViews.setBlockModel(sequence1, "loadMenu")
  } 
})




var SequenceLoadCollectionView = Backbone.View.extend({
  initialize: function(){
    this.collection.fetch()
    this.listenTo(this.collection, 'add', this.addSequence)
    // this.render()
  },

  addSequence: function(sequenceFromCollection){
    //create a new view for the new model
    var newSequenceLoadSelectionView = new SequenceLoadSelectionView({
      model: sequenceFromCollection
    })
    //render it and append it to the dom
    newSequenceLoadSelectionView.render()
    this.$el.prepend(newSequenceLoadSelectionView.$el)
  }


})


var SaveSequenceView = Backbone.View.extend({

  events:{
    'click button[data-action="save-current-sequence"]': 'saveCurrentSequence',
    'click button[data-action="open-save-sequence-modal"]': 'openModal',
    'focus input[data-attr="new-sequence-name"]': 'silence',
    'click button[data-action="save-as-new-sequence"]': 'saveNewSequence',
    'click button[data-action="close-save-modal"]': 'close',
    'blur #save_sequence_modal': 'close'
  },

  silence: function(){
    synthSystem.setVolumeMin()
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
    synthSystem.setVolumeMin()
    if (this.model.attributes) {
      $('#save_sequence_modal').modal({
        keyboard: false
      })
    }
  },

  saveNewSequence: function(){
    // synthSystem.setVolumeMin()
    // console.log("save new sequence button clicked")
    var newName = $('input[data-attr="new-sequence-name"]').val()
    console.log(newName)
    // var self = this
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
      loadSequenceCollection.fetch()
      // check to see if the save was sucessful - errors come back as an array
      if (!Array.isArray(data)){
        // set all 16 control blocks to the new sequence name
        synthViews.setBlockModel(data, "saveNew")
        $('#save_sequence_modal').modal('hide')
        synthSystem.setVolumeMax() // bring keyboard volume back
      
      } else {
        $('#save-error').empty()
        var errors = data.map(function(m){ return {error: m} })
        var renderedError = Mustache.render("{{#allErrors}}<p>{{error}}</p>{{/allErrors}}</p>", {allErrors: errors})
        $('#save-error').append(renderedError) 
      }
    })
    // if save was prevented by server, collection still synchronized
    loadSequenceCollection.fetch()
  },

  close: function(){
    synthSystem.setVolumeMax()
  }

})




var SequencerControlView = Backbone.View.extend({


  events: {
    'click button[data-action="play-sequence"]': 'startSequence',
    'click button[data-action="stop-sequence"]': 'stopSequence',
    'click button[data-action="repeat-sequence"]': 'setRepeat'
  },

  startSequence: function(){
    // currentSequence = []
    console.log("play sequence button clicked")
    
    sequenceToPlay = runSequence(this.model)
    sequenceToPlay.play()
    //restart tempo icon animation
    clearInterval(tempoAnimateId)
    tempoSelectView.setTempo()

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
    //check to make sure sequence is not playing
    if (sequenceContinue === false){
      //this applies to views for all 16 blocks, so first check which block  
      blockNumber = parseInt(this.$el.attr('data-sequence'))
      console.log("sequencer button clicked " + blockNumber)
      this.$el.addClass("active")
      //create variables which stand in for a string equivalent to the keys in the model's attributes related to the relavent block
      pitchBlockKey = "sb_" + blockNumber + "_pitch"
      durationBlockKey = "sb_" + blockNumber + "_duration"
      noteBlockKey = "sb_" + blockNumber + "_note"
      // use these to retrieve the note information (pitch, duration, and note) from the sequence model
      blockPitch = parseInt(this.model.get(pitchBlockKey))
      // convert the duration for this block into an actual millisecond value
        testDuration = this.model.get(durationBlockKey).split('/') 
        actualDruation = (parseInt(testDuration[0])/parseInt(testDuration[1])) * 4 * (1000 / (sequencerTempo / 60)) 
  
      blockDuration = actualDruation
      console.log(blockDuration)
      blockNote = this.model.get(noteBlockKey) 
      console.log(blockPitch)
      //send these values to play a single note
      triggerNote(blockPitch, blockDuration)
      //animate the sequence block
      animateBlock(blockNumber, blockDuration)
      // display form with data from that block
      noteForm.render(blockNumber)
    }
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
    // scroll to bottom of page
    window.scrollTo(0,document.body.scrollHeight)
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
    //just like in the render function, this will be used to set note values for one of 16 possible sequence blocks
    //uses a similar technique - first define the keys in the model's attributes for whichever block
    blockNumber = $('[data-attr="note-input"]').attr('data-sequence-value')
    console.log("setting note for " + blockNumber)
    blockKeyPitch = blockNumber + "_pitch"
    blockKeyNote = blockNumber + "_note"
    blockKeyDuration = blockNumber + "_duration"

    //grab the new values from the dom
    newPitch = $('input[data-id="frequency-val"]').val()
    newNote = $('input[data-id="note-val"]').val()
    newDuration = $('input[data-id="length-val"]').val()
    // assign them to an object representing part of the model behind the 16 block views
    newBlockValues = {}
    newBlockValues[blockKeyPitch] = newPitch
    newBlockValues[blockKeyNote] = newNote
    newBlockValues[blockKeyDuration] = newDuration
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