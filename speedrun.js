console.log("JS LOaded.");

// Defalut values
THRESHOLD = 0.1; // threshold of loudness to distinguish between silence and speech
SILENTSPEED = 10; // Speed of video when silent
LOUDSPEED = 1.5; // Speed of video when speaking
GAINING = 1; // Gain audio afterwards (useful for almost silent videos)
SMOOTHEN = 10; // How many consequent analyses should be silent to count it as silence
LEFTING = 0; // How much back to jump when speech starts again (to avoid cutting the first letters of speech) [in seconds]

function updateSettings(settings) {
    THRESHOLD = parseFloat(settings?.threshold) ?? THRESHOLD;
    SILENTSPEED = parseFloat(settings?.silentspeed) ?? SILENTSPEED;
    LOUDSPEED = parseFloat(settings?.loudspeed) ?? LOUDSPEED;
    GAINING = parseFloat(settings?.gaining) ?? GAINING;
    SMOOTHEN = smoothing.length = (parseInt(settings?.smoothen) ?? SMOOTHEN) || 1; // Smoothing must be at least size of 1 (otherwise we start writing at array index NaN, which is Not a Ngood idea)
    LEFTING = parseFloat(settings?.lefting) ?? LEFTING;

    if(gainNode) gainNode.gain.value = GAINING; // update the volume
}

function passVideo(video, text = null, indicator = null) {
    myVideo = video;
    loudness = text; // Element to show current loudness
    fast = indicator; // Element to show when fast-forward
}


// TODO: review code from here down
var ctx;
var smoothing = [];
var indexSmoothing = 0;
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
		if(loudness) loudness.innerText = rms;

		
		// NEW WAY (last SMOOTHEN analyses should show quiet)
		if(!suspended) {
		
			if(!myVideo.paused){
				smoothing[indexSmoothing] = rms;
				indexSmoothing = (++indexSmoothing)%SMOOTHEN;
				
				
				if(checkSpeaking()) {
					myVideo.playbackRate = LOUDSPEED;
					if(fast) fast.style.visibility = "hidden";
					//console.log("speaking");
					
					if(!lastLoud && LEFTING) { // if LEFTING equals 0, disable lefting (useful for resource-hog videos)
						/* This is very experimental. Since video playback is streamed (and not scheduled), 
						the timeout can be over before the browser succeeds skipping the video. */
						suspended = true;
						myVideo.currentTime-=(LEFTING);
						setTimeout(() => { console.log("World!"); suspended = false; }, LEFTING*1000/LOUDSPEED);
					}
					lastLoud = true;
					
					
				} else {
					myVideo.playbackRate = SILENTSPEED;
					if(fast) fast.style.visibility = "visible";
					//console.log("quiet");
					lastLoud = false;
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
		if(smoothing[g] > THRESHOLD) {
			return(true);
		}
	}
	return(false);
}

// TODO: Implement "super smart advanced autonomous machine-learning AI" to automatically set threshold

// Sources
// Creating audio context, connecting nodes, gaining: https://stackoverflow.com/a/43794379
// Analysing audio loudness: https://stackoverflow.com/a/13735171
