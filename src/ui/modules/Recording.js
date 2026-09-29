// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// The video recorder: a modal sheet that composites the webcam, the class
// meters and the current output into a canvas and records it for 10 seconds.
//
// The exported video deliberately keeps a fixed light palette (the literal
// GLOBALS.colors fallbacks) so a clip looks the same whatever the recording
// device's appearance was.

const COUNTDOWN_FROM = 3;
const RECORD_SECONDS = 10;
const FADE_MS = 250;
const START_LABEL = 'Start Recording';
const FOCUSABLE = 'button, [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])';

function formatSeconds(seconds) {
	let prefix = '0:';
	if (seconds < 10) {
		prefix = '0:0';
	}

	return prefix + seconds;
}

class Recording {

	constructor(element) {
		this.element = element;
		this.sheet = element.querySelector('.recording__sheet');
		this.canvas = element.querySelector('#recording__canvas');
		this.downloadPreText = element.querySelector('#pre-download-message');
		this.downloadLinkSection = element.querySelector('.recording-download-container');
		this.downloadLinkButton = element.querySelector('#recording__download');
		this.recordingVideo = element.querySelector('#recording__video');
		this.recordTimer = element.querySelector('#record__timer');
		this.statusText = element.querySelector('#recording__status');
		this.closeButton = element.querySelector('#close__button');
		this.restart = element.querySelector('#restart');
		this.recordMessage = element.querySelector('#message');
		this.recordMessageAlt = element.querySelector('#message-alt');
		this.sharingNotice = element.querySelector('#sharing-notice');
		this.legal = element.querySelector('#recording__legal');
		this.checkbox = element.querySelector('#recording__checkbox');

		this.sendSuccess = false;
		this.canvas.width = 680;
		this.canvas.height = 340;
		this.video = document.getElementsByTagName('video')[0];

		// Initialize confidence values dynamically for all classes
		this.confidences = {};
		GLOBALS.classNames.forEach((className) => {
			this.confidences[className] = 0;
		});

		this.recordedTime = RECORD_SECONDS;
		this.count = COUNTDOWN_FROM;
		this.showing = false;
		this.recordingState = 'waiting';
		this.RECORD_TIME = RECORD_SECONDS * 1000;
		this.videoUrl = null;
		this.discardRecording = false;
		this.returnFocusTo = null;

		this.startButton = new Button(element.querySelector('#recording__start-button'));
		this.startRecordEvent = this.onRecordButtonClick.bind(this);
		this.startButton.element.addEventListener('click', this.startRecordEvent);
		this.checkbox.addEventListener('change', this.toggleCheckbox.bind(this));
		this.closeButton.addEventListener('click', this.hide.bind(this));
		this.restart.addEventListener('click', this.onRestartClick.bind(this));
		this.keydownEvent = this.onKeydown.bind(this);

		this.element.hidden = true;
		this.resetView();
	}

	// Parts of the Start button's label (Button wraps them in .button__label).
	part(id) {
		return this.element.querySelector('#' + id);
	}

	setButtonLabel(text) {
		let label = this.part('recording__start-text');
		if (label) {
			label.textContent = text;
		}
	}

	setButtonIcon(name) {
		let record = this.part('icon--record');
		let stop = this.part('icon--stop');
		if (record) {
			record.hidden = name !== 'record';
		}
		if (stop) {
			stop.hidden = name !== 'stop';
		}
	}

	announce(text) {
		if (this.statusText) {
			this.statusText.textContent = text;
		}
	}

	toggleCheckbox() {
		let blocked = !this.checkbox.checked && this.recordingState === 'waiting';
		let button = this.startButton.element;
		button.setAttribute('aria-disabled', blocked.toString());
		button.classList.toggle('recording-start__button--disabled', blocked);
	}

	setCanvas(element) {
		this.canvasType = '';
		if (element && element.name === 'gif') {
			this.canvasType = 'gif';
		}
		this.sourceCanvas = element;
		this.context = this.canvas.getContext('2d');
		this.show();
		this.setButtonIcon('record');
		cancelAnimationFrame(this.renderFrame);
		this.render();

		let img = new Image();
		let stamp = new Image();
		img.onload = () => {
			this.wiresImage = img;
		};
		stamp.onload = () => {
			this.stampImage = stamp;
		};
		img.src = 'assets/wires-recorder.png';
		stamp.src = 'assets/madeby.svg';
	}

	render() {
		if (!this.showing) {
			return;
		}
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = '#e4e5e6';
		this.context.fillRect(0, 0, 680, 340);

		// call its drawImage() function passing it the source canvas directly
		let maxHeight = 200;
		let videoWidth = 266;
		const padding = 20;
		const startX = 26;
		const startY = 16;

		// White boxes
		this.context.fillStyle = '#fff';
		this.context.fillRect(startX, startY, videoWidth + padding, maxHeight + 70);
		this.context.fillRect(340 + startX, startY, videoWidth + padding, maxHeight + 70);

		// The "Output" Canvas
		if (this.sourceCanvas) {
			if (this.canvasType === 'gif') {
				let gifWidth = 260;
				this.context.drawImage(this.sourceCanvas, startX + 343 + padding / 2, 45, gifWidth, gifWidth - 50);
			}else {
				this.context.drawImage(this.sourceCanvas, startX + 355 + padding / 2, 40, videoWidth, videoWidth - 50);
			}
		}
		if (this.wiresImage) {
			this.context.drawImage(this.wiresImage, startX + 276 + padding / 2, 45, 54, videoWidth - 50);
		}
		if (this.stampImage) {
			this.context.drawImage(this.stampImage, this.canvas.width / 2 - (videoWidth * 1.2 / 2), 302, videoWidth * 1.2, 20);
		}

		let barsY = maxHeight + startY + padding;
		let numClasses = GLOBALS.classNames.length;
		let boxSize = (videoWidth - padding) / numClasses;
		let boxStartX = startX + padding / 2;

		// Render confidence bars dynamically for all classes
		GLOBALS.classNames.forEach((className, index) => {
			let xPos = boxStartX + (index * (boxSize + padding / 2));

			// Background bar
			this.context.fillStyle = '#e4e5e6';
			this.context.fillRect(xPos, barsY, boxSize, 40);

			// Confidence bar (fixed light palette, see the note at the top)
			this.context.fillStyle = GLOBALS.colors[className];
			let confidence = this.confidences[className] || 0;
			this.context.fillRect(xPos, barsY, boxSize * confidence, 40);
		});

		// Video comes in mirrored, so let's flip it:
		this.context.save();
		this.context.scale(-1, 1);
		this.context.drawImage(
			this.video,
			-(startX + padding / 2),
			startY + padding / 2,
			maxHeight * (360 / 270) * -1,
			maxHeight
			);
		this.context.restore();
		//
		// this.context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		// this.context.fillStyle = '#000';
		// this.context.fillText('MADE AT: ', startX, 320);
		// this.context.fillStyle = '#3e80f6';
		// this.context.fillText('G.CO/TEACHABLEMACHINE', 110, 320);

		this.renderFrame = requestAnimationFrame(this.render.bind(this));
	}

	setMeters(colorId, confidence) {
		if (!this.showing) {
			return;
		}
		let confidencePercentage = confidence / 100;

		// Dynamically handle any class
		if (Reflect.has(this.confidences, colorId)) {
			this.confidences[colorId] = confidencePercentage;
		}

		// For backward compatibility, still update the original variables
		switch (colorId) {
			case 'green':
				this.confidence1 = confidencePercentage;
				break;
			case 'purple':
				this.confidence2 = confidencePercentage;
				break;
			case 'orange':
				this.confidence3 = confidencePercentage;
				break;
			case 'yellow':
				this.confidence4 = confidencePercentage;
				break;
			default:
				break;
		}
	}

	// Method to add a new class for recording visualization
	addNewClass(className) {
		if (!Reflect.has(this.confidences, className)) {
			this.confidences[className] = 0;
		}
	}

	stopRecording() {
		// this.recordingState = 'Facebook';
		if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
			this.mediaRecorder.stop();
		}
		clearTimeout(this.recordingTimeout);
		GLOBALS.webcamClassifier.stopTimer();
	}

	onRecordButtonClick(event) {
		if (event) {
			event.preventDefault();
		}
		switch (this.recordingState) {
			case 'waiting':
				if (this.checkbox.checked) {
					this.countdown();
				}else {
					this.checkbox.focus();
				}
				break;
			case 'countdown':
				this.stopCountdown();
				this.announce('Recording canceled.');
				break;
			case 'recording':
				this.startButton.element.classList.remove('animate');
				this.stopRecordingTime();
				this.stopRecording();
				break;
			case 'shareSuccess':
				this.shareOnFb();
				break;
			case 'successMessage':
				this.recordingState = 'waiting';
				break;
			default:
				break;
		}
	}

	onShareButtonClick() {
		this.recordingState = 'waiting';
		this.shareOnFb();
	}

	onRestartClick(event) {
		if (event) {
			event.preventDefault();
		}
		this.reset();
		this.startButton.element.focus();
	}

	// Back to the "ready to record" state.
	reset() {
		GLOBALS.webcamClassifier.startTimer();
		this.resetView();
	}

	resetView() {
		this.stopRecordingTime();
		this.stopCountdown();
		this.recordingState = 'waiting';

		this.recordMessage.hidden = false;
		this.recordMessageAlt.hidden = true;
		this.canvas.hidden = false;
		this.recordingVideo.hidden = true;
		this.recordingVideo.removeAttribute('src');
		this.recordTimer.hidden = false;
		this.startButton.element.hidden = false;
		this.legal.hidden = false;
		this.downloadLinkSection.hidden = true;
		this.sharingNotice.hidden = true;
		this.downloadPreText.textContent = '';
		this.setButtonIcon('record');
		this.setButtonLabel(START_LABEL);
		this.announce('');
		this.toggleCheckbox();

		if (this.videoUrl) {
			URL.revokeObjectURL(this.videoUrl);
			this.videoUrl = null;
		}
	}

	countdown() {
		this.recordingState = 'countdown';
		this.toggleCheckbox();
		this.canvas.hidden = false;
		this.recordingVideo.hidden = true;
		this.downloadLinkSection.hidden = true;
		this.setButtonIcon('none');
		this.setButtonLabel('Cancel');
		this.announce('Recording starts in ' + this.count + '…');
		this.countdownTimeout = setTimeout(() => {
			this.count -= 1;
			if (this.count > 0) {
				this.countdown();
			}else {
				this.count = COUNTDOWN_FROM;
				this.startRecording();
				this.recordingTime();
			}
		}, 1000);
	}

	recordingTime() {
		this.recordingTimeTimeout = setTimeout(() => {
			this.recordedTime -= 1;
			if (this.recordedTime > 0) {
				this.recordTimer.textContent = formatSeconds(this.recordedTime);
				this.recordingTime();
			}else {
				this.recordTimer.textContent = formatSeconds(0);
				this.recordedTime = RECORD_SECONDS;
			}
		}, 1000);
	}

	stopRecordingTime() {
		this.recordingState = 'waiting';
		if (this.recordingTimeTimeout) {
			clearTimeout(this.recordingTimeTimeout);
		}
		this.recordedTime = RECORD_SECONDS;
		this.recordTimer.textContent = formatSeconds(RECORD_SECONDS);
	}

	stopCountdown() {
		this.recordingState = 'waiting';
		clearTimeout(this.countdownTimeout);
		this.count = COUNTDOWN_FROM;
		this.startButton.element.classList.remove('animate');
		this.setButtonIcon('record');
		this.setButtonLabel(START_LABEL);
		this.toggleCheckbox();
	}

	startRecording() {
		this.recordingState = 'recording';
		this.discardRecording = false;
		this.setButtonIcon('stop');
		this.setButtonLabel('Stop Recording');
		this.announce('Recording. It stops by itself after ' + RECORD_SECONDS + ' seconds.');
		let recordedChunks = [];
		this.startButton.element.classList.add('animate');
		let finalStream = new MediaStream();
		let canvasStream = this.canvas.captureStream().getVideoTracks()[0];
		finalStream.addTrack(canvasStream);
		let audioTracks = GLOBALS.stream ? GLOBALS.stream.getAudioTracks() : [];
		if (audioTracks.length > 0) {
			finalStream.addTrack(audioTracks[0]);
		}

		this.mediaRecorder = new MediaRecorder(finalStream);

		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				recordedChunks.push(event.data);
			}
		};
		this.mediaRecorder.start();
		this.mediaRecorder.onstop = () => {
			if (this.discardRecording) {
				this.discardRecording = false;

				return;
			}
			this.blob = new Blob(recordedChunks, {type: 'video/webm'});
			this.showPreview(URL.createObjectURL(this.blob));
		};
		this.recordingTimeout = setTimeout(() => {
			this.startButton.element.classList.remove('animate');
			this.stopRecording();
		},
		this.RECORD_TIME
		);
		gtag('event', 'recording_start');
	}

	showPreview(url) {
		this.recordingState = 'preview';
		this.videoUrl = url;
		this.startButton.element.classList.remove('animate');
		this.canvas.hidden = true;
		this.recordingVideo.hidden = false;
		this.recordMessage.hidden = true;
		this.recordMessageAlt.hidden = false;
		this.recordTimer.hidden = true;
		this.startButton.element.hidden = true;
		this.legal.hidden = true;
		this.downloadLinkSection.hidden = false;
		this.downloadLinkButton.href = url;
		this.downloadLinkButton.download = 'teachable-machine.webm';
		this.recordingVideo.setAttribute('src', url);
		this.announce('Your video is ready.');
		// this.sharingNotice.hidden = false;

		// The Stop button that had focus is gone; keep focus in the sheet.
		if (this.showing) {
			this.downloadLinkButton.focus();
		}
	}

	getFocusable() {
		let elements = Array.from(this.sheet.querySelectorAll(FOCUSABLE));

		return elements.filter((item) => !item.disabled && item.getClientRects().length > 0);
	}

	onKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			this.hide();

			return;
		}
		if (event.key !== 'Tab') {
			return;
		}
		let focusable = this.getFocusable();
		if (focusable.length === 0) {
			event.preventDefault();
			this.sheet.focus();

			return;
		}
		let first = focusable[0];
		let last = focusable[focusable.length - 1];
		let active = document.activeElement;
		let outside = !this.sheet.contains(active);
		if (event.shiftKey && (active === first || outside)) {
			event.preventDefault();
			last.focus();
		}else if (!event.shiftKey && (active === last || outside)) {
			event.preventDefault();
			first.focus();
		}
	}

	show() {
		clearTimeout(this.hideTimeout);
		if (!this.showing) {
			this.returnFocusTo = document.activeElement;
		}
		this.recordingState = 'waiting';
		this.showing = true;
		this.element.hidden = false;
		document.documentElement.classList.add('recording-open');
		document.addEventListener('keydown', this.keydownEvent);

		// Flush styles so the fade-in transition runs from the hidden state.
		this.element.getBoundingClientRect();
		this.element.classList.add('fadein');

		if (this.checkbox.checked) {
			this.startButton.element.focus();
		}else {
			this.checkbox.focus();
		}
	}

	hide() {
		if (!this.showing) {
			return;
		}
		this.showing = false;
		cancelAnimationFrame(this.renderFrame);
		this.element.classList.remove('fadein');
		document.documentElement.classList.remove('recording-open');
		document.removeEventListener('keydown', this.keydownEvent);
		GLOBALS.webcamClassifier.startTimer();

		clearTimeout(this.recordingTimeTimeout);
		clearTimeout(this.countdownTimeout);
		clearTimeout(this.recordingTimeout);
		if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
			this.discardRecording = true;
			this.mediaRecorder.stop();
		}

		this.hideTimeout = setTimeout(() => {
			this.element.hidden = true;
			GLOBALS.isRecording = false;
			this.reset();
		},
		FADE_MS
		);

		if (this.returnFocusTo && document.body.contains(this.returnFocusTo) && this.returnFocusTo.focus) {
			this.returnFocusTo.focus();
		}
		this.returnFocusTo = null;
	}

	shareOnFb() {
		this.downloadPreText.innerText = 'Posting... ';
		window.fbWindowCallback = (data) => {
			let formData = new FormData();
			formData.append('code', data);
			let fileOfBlob = new File([this.blob], 'share.webm');

			formData.append('video', fileOfBlob);

			let xhr = new XMLHttpRequest();
			xhr.open('POST', '/share-video');
			xhr.onload = () => {
				if (xhr.status === 200) {
					this.downloadPreText.innerText = 'Posted to Facebook. ';
					// console.log('Something went wrong.  Name is now ' + xhr.responseText);
				}else if (xhr.status !== 200) {
					this.downloadPreText.innerText = 'Sorry, something went wrong. ';
					// console.log('Request failed.  Returned status of ' + xhr.status);
				}
			};
			xhr.send(formData);
		};
		let popup = window.open('/fb', 'Share on Facebook', 'width=600, height=600');
		popup.focus();
		gtag('event', 'recording_share');
	}
}

import Button from './../components/Button.js';
import GLOBALS from './../../config.js';

export default Recording;