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
- While the project is playing, any changed synthesizer parameters will be animated to show how those parameters are changing.*


###New Features

The user can adjust most of the parameters that would be available on a monophonic synthesizer. The parameters are grouped together as components, such as oscillators, envelope generators, and filters, as they would be on modular synthesizer in which these components were actual discrete devices cabled together. The components in this case are routed together in a fixed manner as they would be in a portable monophonic synthesizer such as the Minimoog. Each parameter affects the tone in a different way, and a brief description of each component can be found below under instructions.

*Future updates will allow the user to save the setting of all parameters as a voice, and for a different voice to be selected for each block. Currently, the parameters can be adjusted but not saved or automated.


##Instruction

- Upon creating a user name, a user will have 3 sequences created for them. The main application page loads without a sequence; in order to utilize the sequencer, a sequence must first be loaded.

- Clicking on any of the 16 blocks will bring up a form to adjust that block's parameters. To adjust the pitch, click the input field for either note or frequency value. Using the piano keyboard will set that note and frequency together. Only pitch values are actually utilized by the sequencer; the note value are only for user convenience. While one could enter these fields manually, it is not recommended unless the user wants pitches outside of the equal-temperment 12-tone system, and is comfortable referencing a temperment table.

- The tone of the sound produced can be changed with the sliders and options displayed above the keyboard. They correspond to the parameters associated with the components of an actual synthesizer, which have been virtually replicated.

##Synthesizer Components
###Oscillators
Oscillators generate the sound which is modified by all other components. There are three VCOs, or voltage controlled oscillators, which generate a pitch determined by either the keyboard or the sequence. 
- Waveform: The waveform selection is available for all three oscillators. Sine waves are the simplest sound, with no overtones, or other frequencies in the sound spectrum, so they are a 'pure' representation of a pitch (all other waveforms can be broken down into a combination of sine waves at frequencies which are integer multiples of a base or 'fundamental' frequency); tonally sine waves resemble a flute. Triangular waveforms have some overtones, and are richer than a sine wave; they are often used to generate string instrument-like sounds. Sawtooth waves have a full spectrum of overtones, and are often used in brass-like sounds. Square waves have a full spectrum as well, but have different ratios of overtones than sawtooth waves; they are often used as the basis of reed instrument-like sounds.
- Interval: Oscillators 2 and 3 can be set to sound up to 2 octaves above or below oscillator 1. This interval is measured in semitones, or half-steps. There are 12 semitones in an octave.

###LFO
The LFO, or low frequency oscillator, is similar to a VCO, only it does not generate a pitch. Instead, its oscillating signal is used to control the pitch of Oscillator 2. It is used to create a tremelo effect.
- Frequency: The rate at which the LFO oscillates. It is measured in Hz, or cycles per second. 
- Gain: The extent to which the pitch of oscillator 2 is altered by the LFO. At 0 is has no effect; as it is increased, the change in pitch of oscillator 2 becomes larger. 

###Envelope Generators



###Filter
The filter is a low-pass filter, meaning that it lets all of the frequencies below a certain point pass, but attenuates higher frequencies.
- Cutoff: The cutoff frequency is the point above which frequencies start being blocked. The higher a frequency as above the cutoff, the more it is attenuated. The result is that a high cutoff produces brighter tones, while lowering the cutoff produces darker tones. Sweeping the cutoff up and down produces the distinctive "waaooowww" effect.
- Resonance: This value represents a boost in frequencies around the cutoff. Higher values produce a bigger boost, and can make the effect of the filter more pronounced.
 
- Filter Envelope: The envelope generator for the filter controls how the cutoff changes over the course of a note. It is very similar to the ADSR envelope used to control the volume of the amplifier, but provides 2 additional controls: 'Start', which represents where the cutoff is when the note begins to sound, and 'Max', the maximum level to which the cutoff will rise when the attack-time is complete. The other 4 components work the same way as the amplifier envelope generator, only controlling the cutoff instead of the volume. 
For clarity, the 3 parameters which designate time, Attack, Decay, and Release, are grouped together. The other 3, Start, Max, and Sustain, which represent a level, are grouped together as well, and these 3 all range between 0 and 1, representing a fraction multiplied to the cutoff frequency. 
- The gain allows for additional manipulation of the cutoff frequency by determining how much the envelope levels should actually effect the filter cutoff. A value of 0 means it has no effect, and the cutoff will not change over the course of the note. A value of 1 is the most effect possible; for example, with the gain set to 1: If the envelope levels were: Start-0, Max-1, Sustain-.5, the filter cutoff would start out at 0, rise to the designated cutoff, and then drop to 1/2 the designated cutoff until the note is released.
If the gain were changed to .5, the cutoff would start at 1/2 the designated cutoff, rise to the designated cutoff, and then drop to 1/4 the designated cutoff.
The gain can also be negative, which inverts the envelope so that instead of rising up from lower values, the cutoff will begin at a higher value.

###Portamento
The portamento controls the time it takes for the pitch to change from note to note. The result is a "slurring" of pitch. A setting of 0 produces no portamento effect.




