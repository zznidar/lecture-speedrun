# lecture-speedrun
Lecture Speedrun. Prototype. Very experimental. Accessible [here:](https://zznidar.github.io/lecture-speedrun/) [https://zznidar.github.io/lecture-speedrun/](https://zznidar.github.io/lecture-speedrun/)

Inspired by [carykh](https://github.com/carykh)'s [Automatic on-the-fly video editing tool!](https://youtu.be/DQ8orIurGxw) and [jumpcutter](https://github.com/carykh/jumpcutter).

## Very experimental
Prototype tested only in Chrome. Firefox may not play any audio. 

## Usage
1. Open https://zznidar.github.io/lecture-speedrun/ in Chrome.
2. Pick a video or audio file of the lecture you want to speedrun.
3. Optionally adjust settings.
4. Play the video.

### Settings
Confirm your settings changes with the _Confirm_ button.
#### Loudness threshold
How loud the audio should be at a given moment to be treated as speech. Observe _Current loudness_  below to fine-tune it.
If silence is treated as speech, increase the threshold.
If speech is treated as silence, lower the threshold.
#### Smoothen
How many consequent analyses should be silent to count it as silence. The higher this number, the longer it will take after the lecturer stops speaking to start fast-forwarding.
#### Speed of silence
Playback speed when the lecturer is silent.
#### Speed of speech
Playback speed when the lecturer is speaking.
#### Lefting (revert each start of speaking)
Experimental feature to seek the video back for a split-second once the lecturer starts speaking. Would be useful if the first sounds of speech were cut off. Doesn't work too well 😅
#### Audio gain
Increase the playback loudness. Usefull if the video volume is very low. Note that this does not affect the analysis. 
#### Hide current loudness indicator
Current loudness is shown at every given moment to make it easier for you to adjust the _Loudness threshold_. However, some users reported it uses a lot of their CPU. Check this box to stop updating current loudness indicator.
#### Hide speed indicator
This icon indicates when the video is fast-forwarded: ⏩︎
Check this box to stop indicating the state of speed.

## Troubleshooting
* Make sure not to use the _lefting_ functionality. It really does more harm than good.
* Some users report better performance if they disable _Hardware-accelerated video decode_ and _Hardware-accelerated video encode_ under chrome://flags
