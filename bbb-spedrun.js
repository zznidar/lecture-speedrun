// Code for use with BigBlueButton. TODO: make a real extension with video picker to enable it on all pages with video elements.

/*	
	*** INSPIRED BY carykh's Automatic on-the-fly video editing tool! https://youtu.be/DQ8orIurGxw 
		AND jumpcutter https://github.com/carykh/jumpcutter ***
*/

// Parts of code based on https://stackoverflow.com/questions/22104036/exporting-intensity-of-audio-in-web-audio-api and https://stackoverflow.com/questions/43794356/html5-volume-increase-past-100

TRESHOLD = 0.1; // treshold of loudness to distinguish between silence and speech
SILENTSPEED = 10; // Speed of video when silent
LOUDSPEED = 2.5; // Speed of video when speaking
GAINING = 1; // Gain audio afterwards (useful for almost silent videos)
SMOOTHEN = 10; // How many consequent analyses should be silent to count it as silence
LEFTING = 0; // How much back to jump when speech starts again (to avoid cutting the first letters of speech) [in seconds]

myVideo = document.getElementById("vjs_video_3_html5_api"); // BBB always has sound in the webcam video (even if there is no webcam)
myScreenShare = document.getElementById("vjs_video_505_html5_api") // speed needs to be adjusted here as well

var ctx;

function set() {
	TRESHOLD = treshold.value;
	SILENTSPEED = silentspeed.value;
	LOUDSPEED = loudspeed.value;
	GAINING = gaining.value;
	SMOOTHEN = smoothing.length = smoothen.value;
	LEFTING = parseFloat(lefting.value);
		
	if(!ctx) {
		begin();
		myVideo.play();
	} else {
		gainNode.gain.value = GAINING; // double the volume
	}
}

var smoothing = [];
var indexSmoothing = 0;
// MAY NOT WORK AS INTENDED; SEE BELOW 
var lastLoud = true; // Used to detect change silent -> loud, so we can revert for LEFTING seconds and disable analysis for that time
var suspended = false;


	
function begin() {
	// create an audio context and hook up the video element as the source
	var audioCtx = new AudioContext();
	var source = audioCtx.createMediaElementSource(myVideo);

	ctx = audioCtx;

	var processor = ctx.createScriptProcessor(2048, 1, 1);
	source.connect(processor);
	source.connect(ctx.destination);
	processor.connect(ctx.destination);
	
	// loop through PCM data and calculate average
	// volume for a given 2048 sample buffer
	processor.onaudioprocess = function(evt) {
		var input = evt.inputBuffer.getChannelData(0)
			, len = input.length
			, total = i = 0
			, rms
		while (i < len) total += Math.abs(input[i++])
		rms = Math.sqrt(total / len)
		//console.log(rms)
		//loudness.innerText = rms; // we would need to create this element first in order to show current loudness

		/* // OLD WAY (without smoothing)
		if (rms < TRESHOLD) {
			myVideo.playbackRate = SILENTSPEED;
			myScreenShare.playbackRate = SILENTSPEED;
			console.log("quiet");
		} else {
			myVideo.playbackRate = LOUDSPEED;
			myScreenShare.playbackRate = LOUDSPEED;
			console.log("speaking");
		}
		*/
		
		// NEW WAY (last SMOOTHEN analyses should show quiet)
		if(!suspended) { /* MAY NOT WORK AS INTENDED; SEE BELOW */
		
		if(!myVideo.paused){
			smoothing[indexSmoothing] = rms;
			indexSmoothing = (++indexSmoothing)%SMOOTHEN;
			
			
			if(checkSpeaking()) {
				myVideo.playbackRate = LOUDSPEED;
				myScreenShare.playbackRate = LOUDSPEED;
				//fast.style.visibility = "hidden"; // we would need to create this element first in order to show or hide it
				//console.log("speaking");
				
				// MAY NOT WORK AS INTENDED; VIDEO PLAYBACK IS NOT SCHEDULED and is streamed.
					//				THEREFORE, it may happen (especially with more CPU/GPU-demanding videos)
						//			THAT the timeout is over before the browser even succeeds skipping the video.
				if(!lastLoud && LEFTING) { // if LEFTING equals 0, disable lefting (useful for resource-hog videos, see above comment)
					suspended = true;
					myVideo.currentTime-=(LEFTING);
					myScreenShare.currentTime-=(LEFTING);
					setTimeout(() => { console.log("World!"); suspended = false; }, LEFTING*1000/LOUDSPEED);
				}
				lastLoud = true;
				
				
			} else {
				myVideo.playbackRate = SILENTSPEED;
				myScreenShare.playbackRate = SILENTSPEED;
				//fast.style.visibility = "visible"; // we would need to create this element first in order to show or hide it
				//console.log("quiet");
				lastLoud = false; /* MAY NOT WORK AS INTENDED; SEE ABOVE */
			}
		}
		}
		
	}



	// create a gain node
	gainNode = audioCtx.createGain();
	gainNode.gain.value = GAINING; // increase the volume if requested
	source.connect(gainNode);

	// connect the gain node to an output destination
	gainNode.connect(audioCtx.destination);
}

function checkSpeaking() {
	for(g = 0; g < smoothing.length; g++) {
		if(smoothing[g] > TRESHOLD) {
			return(true);
		}
	}
	return(false);
}

// TODO: Implement "super smart advanced autonomous machine-learning AI" to automatically set treshold


begin(); // run the code
