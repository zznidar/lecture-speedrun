/*	*** INSPIRED BY carykh's Automatic on-the-fly video editing tool! https://youtu.be/DQ8orIurGxw 
		AND jumpcutter https://github.com/carykh/jumpcutter ***


*/

// povzeto po https://stackoverflow.com/questions/22104036/exporting-intensity-of-audio-in-web-audio-api 
// in po odgovoru na kako povečati video volume za več kot 2.0

TRESHOLD = 0.1; // treshold glasnosti, da tretira kot tisina/govor
SILENTSPEED = 10; // Hitrost posnetka, ko je tisina
LOUDSPEED = 1.5; // Hitrost posnetka, ko govori
GAINING = 1; // Gain audio afterwards (useful for almost silent videos)
GLAJENJA = 10; // Koliko analiz mora biti tihih, da se smatra kot tisina
LEFTING = 0.2; // Za koliko skociti nazaj, ko se spet zacne govor (da ne odrezemo prve crke govora)

myVideo = document.querySelector('video');

var ctx;

function nastavi() {
	TRESHOLD = treshold.value;
	SILENTSPEED = silentspeed.value;
	LOUDSPEED = loudspeed.value;
	GAINING = gaining.value;
	GLAJENJA = glajenje.length = glajenja.value;
	LEFTING = parseFloat(lefting.value);
		
	if(!ctx) {
		startaj();
		myVideo.play();
	} else {
		gainNode.gain.value = GAINING; // double the volume
	}
}

var glajenje = [];
var indeksGlajenja = 0;
// DOES NOT WORK AS INTENDED; SEE BELOW 
var lastLoud = true; // Uporabimo, da ob spremembi silent -> loud prevrtimo za 0.1 s nazaj in za ta cas zaustavimo analizo
var suspended = false;


	
function startaj() {
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
		glasno.innerText = rms;

		/* // STARI NACIN (brez glajenja)
		if (rms < TRESHOLD) {
			myVideo.playbackRate = SILENTSPEED;
			console.log("tisina");
		} else {
			myVideo.playbackRate = LOUDSPEED;
			console.log("govori");
		}
		*/
		
		// NOVI NACIN (zadnjih 10 vnosov mora biti tisina)
		if(!suspended) { /* DOES NOT WORK AS INTENDED; SEE BELOW */
		
		if(!myVideo.paused){
			glajenje[indeksGlajenja] = rms;
			indeksGlajenja = (++indeksGlajenja)%GLAJENJA;
			
			
			if(checkSpeaking()) {
				myVideo.playbackRate = LOUDSPEED;
				fast.style.visibility = "hidden";
				//console.log("govori");
				
				// DOES NOT WORK AS INTENDED; VIDEO PLAYBACK IS NOT SCHEDULED and is streamed.
					//				THEREFORE, it may happen (especially with more CPU/GPU-demanding videos)
						//			THAT the timeout is over before the browser even succeeds skipping the video.
				if(!lastLoud && LEFTING) { // if LEFTING equals 0, disable lefting (useful for resource-hog videos, see above comment
					suspended = true;
					myVideo.currentTime-=(LEFTING);
					setTimeout(() => { console.log("World!"); suspended = false; }, LEFTING*1000/LOUDSPEED);
				}
				lastLoud = true;
				
				
			} else {
				myVideo.playbackRate = SILENTSPEED;
				fast.style.visibility = "visible";
				//console.log("tisina");
				lastLoud = false; /* DOES NOT WORK AS INTENDED; SEE ABOVE */
			}
		}
		}
		
	}



	// create a gain node
	gainNode = audioCtx.createGain();
	gainNode.gain.value = GAINING; // double the volume
	source.connect(gainNode);

	// connect the gain node to an output destination
	gainNode.connect(audioCtx.destination);
}

function checkSpeaking() {
	for(g = 0; g < glajenje.length; g++) {
		if(glajenje[g] > TRESHOLD) {
			return(true);
		}
	}
	return(false);
}

// TODO: Implement "super smart advanced automonous machine-learning AI" to automatically set treshold