console.log("Views Loaded")

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
    'click button[data-action="save-current-sequence"]': 'openSaveCurrentModal',
    'click button[data-action="save-as-current-sequence"]': 'saveCurrentSequence',
    'click button[data-action="open-save-sequence-modal"]': 'openSaveNewModal',
    'focus input[data-attr="new-sequence-name"]': 'silence',
    'click button[data-action="save-as-new-sequence"]': 'saveNewSequence',
    'click button[data-action="close-save-modal"]': 'close',
    'blur #save_sequence_modal': 'close'
  },

  silence: function(){
    synthSystem.setVolumeMin()
  },

  openSaveCurrentModal: function(){
    var $modal = $('#save_current_sequence_modal')
    var title = '<h4> {{sequence_name}} </h4>'
    var renderedTitle = Mustache.render(title, this.model.attributes)
    $('#save_current_title').empty()
    $('#save-current-error').empty()
    $('#save_current_title').append(renderedTitle)
    $modal.modal()
  },

  saveCurrentSequence: function(){
    console.log("save current sequence button")
    this.model.updateSequence().done(function(data){
      console.log(data)
      if (!Array.isArray(data)){
        // re-sets blocks
        synthViews.setBlockModel(data, "saveNew")
        $('#save_current_sequence_modal').modal('hide')      
      } else {
        $('#save-current-error').empty()
        var errors = data.map(function(m){ return {error: m} })
        var renderedError = Mustache.render("{{#allErrors}}<p>{{error}}</p>{{/allErrors}}</p>", {allErrors: errors})
        $('#save-current-error').append(renderedError) 
      }
    })
  },

  openSaveNewModal: function(){
    synthSystem.setVolumeMin()
    $('input[data-attr="new-sequence-name"]').val('')
    $('#save-error').empty()
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

    this.model.createSequence().done(function(data){
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

var FilterView = Backbone.View.extend({
  
  initialize: function(){
    var self = this
    $('#filter-cutoff-slider').slider({
      value: self.model.get("filterCutoff"),
      min: 200,
      max: 5000,
      step: 50,
      animate: true
    })
    // $('#cutoff').val(synthSystem.filtersConfig.LPF.filter.frequency.value + " Hz")
    $('#filter-resonance-slider').slider({
      value: self.model.get("filterResonance"),
      min: .01,
      max: 20,
      animate: true
    })
    this.adjustCutoff()
    this.listenTo(this.model, 'change', 'adjustCutoff')
  },

  events: {
    'slide #filter-cutoff-slider':'sweep',
    'slide #filter-resonance-slider': 'resonance',
    'click #filter-cutoff-slider':'adjustCutoff'
  },

  adjustCutoff: function(){
    var value = $('#filter-cutoff-slider').slider("option", "value")
    // var scaledValue = 1000*Math.log(value)
    console.log(value)
    $('#cutoff').val(this.model.get('filterCutoff') + " Hz")
    $('#resonance').val(this.model.get('filterResonance'))
  },

  sweep: function(){
    var self = this
    $('#filter-cutoff-slider').slider({
      slide: function(event, ui){
        console.log(ui.value)
        self.model.set({filterCutoff: ui.value})
        synthSystem.filtersConfig.LPF.sweepCutoffFrequency(ui.value, .1)
        synthSystem.soundParams.filterCutoff = ui.value
        self.adjustCutoff()
      }
    })
  },

  resonance: function(){
    var self = this
    $('#filter-resonance-slider').slider({
      slide: function(event, ui){
        console.log(ui.value)
        self.model.set('filterResonance', ui.value)
        synthSystem.filtersConfig.LPF.filter.Q.value = ui.value
        self.adjustCutoff()
      }
    })
  }
})

var EGfilterView = Backbone.View.extend({

  initialize: function(){
    var self = this
    $( '[data-role="filter-eg-slider"]').each(function() {
      // create horizontal sliders
      var sliderId = $(this).attr("id")
      var value = self.model.get(sliderId)
      console.log(value)
      $( this ).slider({
          value: value,
          min: .06,
          max: 1,
          step: .02,
          animate: true,
          orientation: "vertical"
      });
      self.showGain(sliderId)
    });
    $('#filterEGgain').slider({
      min: -1,
      max: 1,
      step: .05,
      animate: true,
      value: self.model.get('filterEGgain'),
      orientation: "horizontal"
    })
    this.showGain('filterEGgain')
    // this.listenTo(this.model, 'change', 'syncSynth')
  },

  events: {
    'slide [data-role="filter-eg-slider"]':'inputValue',
    'click [data-role="filter-eg-slider"]':'inputValue'
  },

  inputValue: function(){
    var self = this
    $('[data-role="filter-eg-slider"]').slider({
      slide: function(event, ui){
        var sliderId = event.target.id
        self.model.set(sliderId, ui.value)
        console.log(ui.value)
        synthSystem.soundParams[sliderId] = ui.value
        // if (sliderId === 'filterEGgain'){
        self.showGain(sliderId)
        // }
      }
    })
  },

  showGain: function(attr){
    console.log("eg gain changed")
    var selector = (attr === 'filterEGgain') ? '#eg-gain' : '[data-id="' + attr + '"]';
    var value = this.model.get(attr)
    if (attr==="filterEGattackTime" || attr==="filterEGdecayTime" || attr==="filterEGreleaseTime"){
      value = value * 1000 + ' ms'
    }
    $(selector).val(value)
    // synthSystem.soundParams = this.model.attributes
  }

})

var AmpView = Backbone.View.extend({

  initialize: function(){
    var self = this
    $( '[data-role="eg-slider"]').each(function() {
      // create horizontal sliders
      var sliderId = $(this).attr("id")
      var value = self.model.get(sliderId)
      console.log(value)
      $( this ).slider({
          value: value,
          min: .01,
          max: 1.5,
          step: .01,
          animate: true,
          orientation: "horizontal"
      });
    });
    $('[data-id="eg-slider-sustain"]').slider({
      value: self.model.get('EGsustainLevel'),
      min: .01,
      max: 1,
      step: .01,
      animate: true,
      orientation: 'horizontal'
    }) 
    this.showValues() 
  },

  events: {
    'slide [data-role="eg-slider"]':'inputValue',
    'click [data-role="eg-slider"]':'inputValue'
  },

  inputValue: function(){
    var self = this
    $('[data-role="eg-slider"]').slider({
      slide: function(event, ui){
        var sliderId = event.target.id
        self.model.set(sliderId, ui.value)
        console.log(ui.value)
        synthSystem.soundParams[sliderId] = ui.value
        self.showValues()
      }
    })
  },

  showValues: function(){
    $('#attack-time').val(this.model.get('EGattackTime') + ' seconds')
    $('#release-time').val(this.model.get('EGreleaseTime') + ' seconds')
    $('#decay-time').val(this.model.get('EGdecayTime') + ' seconds')
    $('#sustain-level').val(this.model.get('EGsustainLevel'))
    synthSystem.syncValues()
  }
})


var PortamentoView = Backbone.View.extend({

  initialize: function(){
    var self = this
    var value = self.model.get('portamento') * 1000
    $('#portamento').slider({
      min: 0,
      max: 1000,
      step: 1,
      animate: true,
      value: value
    })
    this.showValue(value) 
  },

  events: {
    'slide [data-role="slider"]':'inputValue',
    'click [data-role="slider"]':'inputValue'
  },

  inputValue: function(){
    var self = this
    $('[data-role="slider"]').slider({
      slide: function(event, ui){
        var sliderId = event.target.id
        self.model.set(sliderId, ui.value / 1000)
        console.log(ui.value)
        synthSystem.soundParams[sliderId] = ui.value / 1000
        self.showValue(ui.value)
      }
    })
  },

  showValue: function(ms){
    $('#portamento-time').val(ms + ' ms')
    synthSystem.setPortamento(ms)
  }
})


var OscillatorView = Backbone.View.extend({

  initialize: function(){
    var self = this
    $( '[data-role="VCO-interval-slider"]').each(function() {
      // create horizontal sliders
      var sliderId = $(this).attr("id")
      var value = self.model.get(sliderId)
      console.log(sliderId)
      $( this ).slider({
          value: value,
          min: -24,
          max: 24,
          step: 1,
          // animate: true,
          orientation: "horizontal"
      });
      self.showValue(sliderId)
    }); 
    this.showValue('oscillatorShape')
    this.showValue('oscillator2Shape')
    this.showValue('oscillator3Shape')
  },

  events: {
    'slide [data-role="VCO-interval-slider"]':'inputValue',
    'click [data-role="VCO-interval-slider"]':'inputValue',
    'change [data-role="shape-select"]':'selectShape'
  },

  inputValue: function(){
    var self = this
    $('[data-role="VCO-interval-slider"]').slider({
      slide: function(event, ui){
        var sliderId = event.target.id
        self.model.set(sliderId, ui.value)
        console.log(ui.value)
        synthSystem.soundParams[sliderId] = ui.value
        self.showValue(sliderId)
      }
    })
  },

  showValue: function(attribute){
    var value = this.model.get(attribute)
    var selector = '[data-id="' + attribute + '"]';
    if (attribute === 'oscillator2Interval' || attribute === 'oscillator3Interval') {
      value = value + " semitones" 
    }
    $(selector).val(value)//for wave shape and interval
    synthSystem.soundParams[attribute] = this.model.get(attribute)
    synthSystem.syncValues()
    this.changeIntervals()
  },

  selectShape: function(event){
    var attribute = event.target.id
    console.log(attribute)
    var value = $('#'+attribute).val()
    console.log(value)
    // var value = selection.attr("data-id")
    // var attribute = selection.attr("id")
    // console.log(value)
    // console.log(attribute)
    this.model.set(attribute, value)
    this.showValue(attribute)
  },

  changeIntervals: function(){
    synthSystem.vcosConfig.oscillator2.setFrequency(soundingPitch ? soundingPitch : 440)
    synthSystem.vcosConfig.oscillator3.setFrequency(soundingPitch ? soundingPitch : 440)
  }

})

var LFOView = Backbone.View.extend({

  initialize: function(){
    var self = this
    $('#LFOfrequency').slider({
      min: .1,
      max: 10,
      step: .1,
      animate: true,
      value: self.model.get('LFOfrequency'),
      orientation: 'horizontal'
    })

    $('#LFOgain').slider({
      min: 0,
      max: 100,
      step: 1,
      animate: true,
      value: self.model.get('LFOgain'),
      orientation: 'horizontal'
    })

    this.showValues() 
  },

  events: {
    'slide [data-role="LFO-slider"]':'inputValue',
    'click [data-role="LFO-slider"]':'inputValue'
  },

  inputValue: function(){
    var self = this
    $('[data-role="LFO-slider"]').slider({
      slide: function(event, ui){
        var sliderId = event.target.id
        self.model.set(sliderId, ui.value)
        console.log(ui.value)
        synthSystem.soundParams[sliderId] = ui.value
        synthSystem.syncValues()
        self.showValues()
      }
    })
  },

  showValues: function(attribute){
    // var unit = (attribute === 'LFOfrequency') ? ' Hz' : ' db/v'
    $('[data-id="LFOfrequency"]').val(this.model.get('LFOfrequency') + ' Hz')
    $('[data-id="LFOgain"]').val(this.model.get('LFOgain') + ' db/v')
  }

})

