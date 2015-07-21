#Sequencer and Monophonic Synth

###Background

In the world of digital audio, a sequencer is a device which stores a set of information as steps in a time order, triggering each step in turn and using the information to control some aspect of a sound. Drum machines are an example of a sequencer tied into controlling samples of drum sounds.

A monoophonic synthesizer produces only one "voice" or note at a time; many of the early popular analog synthesizers in the 1960's and 70's such as the MiniMoog and VCS3 were monophonic, and their characteristic sound is still used today. Synthesizers today represent a much larger array of technologies such as sampling, or recording of actual sounds and playing them back, to mimic real instrument sounds. While sampling is an amazing technology, the manner in which the early monophonic synths generated sounds is still of interest because it produces sounds not attainable from other instruments. Like the preceding modular synthesizers, the Minimoog and others like it used electronic components to electronically generate a waveform using oscillators and then modify that sound using amplifiers, mixers, envelope generators, filters, and LFO's (low frequency oscillators). A modular synthesizer (often the size of a cabinet) held each component physically independent, and it was up to the artist to connect the components however they wished using cables to route the different voltage signals. The portable generation of synths used the same components, but hard-wired them together, leaving the voltage routes pre-set, but still allowing the artist to adjust paramters of many important parts of each component in order to vary the sound. The monophonetic synthesizer utilized by our software emulation will function in the same way, setting the component framework and signal routing, but leaving parameters open to change.

The sequencer featured here has 16 steps, and uses the monophonic synthesizer to produce sounds. Each step of the sequence designates a pitch and duration, but can also change the synthesizer's many paramters*, allowing for the sound to change as the sequence is run.

##Features

- A user can log in with a user name and password
- A user can create a user name and password
- A user can adjust the pitch and duration of all 16 steps in the sequence.
- A user can save the sequence of pitches and durations with a name.
- A user can have access to their saved sequences.
- A user can load saved sequences
- A user can set the tempo for a sequence
- A user can "play" a sequence, having the sequence run at the selected tempo one-time through or looped
- While the project is playing, an animated visual reference will show the progress of the sequence as it moves through the 16 steps
- While the project is playing, any changed synthesizer parameters will be animated to show how those parameters are changing.


*at this point, all of the synthesizer parameters are hard-coded. Future updates will provide user control of certain parametes to better to reflect the limited choices on an actual synthesizer

##Instruction

- Upon creating a user name, a user will have 3 sequences created for them. The main application page loads without a sequence; in order to utilize the sequencer, a sequence must first be loaded.

- Clicking on any of the 16 blocks will bring up a form to adjust that block's parameters. To adjust the pitch, click the input field for either note or frequency value. Using the piano keyboard will set that note and frequency together. Only pitch values are actually utilized by the sequencer; the note value are only for user convenience. While one could enter these fields manually, it is not recommended unless the user wants pitches outside of the equal-temperment 12-tone system, and is comfortable referencing a temperment table.
