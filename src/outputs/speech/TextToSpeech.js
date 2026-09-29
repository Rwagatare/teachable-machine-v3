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

const PREFERRED_VOICES = [
	'Google US English Female',
	'Google US English'
];

function isEnglish(voice) {
	return voice.lang.toLowerCase().indexOf('en') === 0;
}

function isUSEnglish(voice) {
	return voice.lang.replace('_', '-').toLowerCase() === 'en-us';
}

class TextToSpeech {
	constructor() {
		this.voices = [];
		this.voice = null;
		this.message = null;
		this.supported = typeof window.speechSynthesis === 'object' &&
			typeof window.SpeechSynthesisUtterance === 'function';

		if (this.supported) {
			let synth = window.speechSynthesis;
			let update = this.setVoice.bind(this);
			if (typeof synth.addEventListener === 'function') {
				synth.addEventListener('voiceschanged', update);
			}else {
				synth.onvoiceschanged = update;
			}
			this.setVoice();

			// iOS only speaks after speech has started inside a user gesture.
			window.addEventListener('mobileLaunch', this.unlock.bind(this));
		}
	}

	// Prefer the original Google voice; otherwise the best English voice the
	// device has; otherwise leave it to the browser default.
	setVoice() {
		this.voices = window.speechSynthesis.getVoices() || [];
		let voices = this.voices;
		let preferred = null;

		PREFERRED_VOICES.forEach((name) => {
			if (!preferred) {
				preferred = voices.find((voice) => voice.name === name) || null;
			}
		});

		this.voice = preferred ||
			voices.find((voice) => isUSEnglish(voice) && voice.default) ||
			voices.find((voice) => isUSEnglish(voice) && voice.localService) ||
			voices.find(isUSEnglish) ||
			voices.find(isEnglish) ||
			null;
	}

	unlock() {
		let silent = new window.SpeechSynthesisUtterance('');
		silent.volume = 0;
		window.speechSynthesis.speak(silent);
	}

	stop() {
		if (this.supported) {
			window.speechSynthesis.cancel();
		}
	}

	say(text, onEnd) {
		if (!this.supported || !text) {
			if (onEnd) {
				onEnd();
			}

			return;
		}
		this.message = new window.SpeechSynthesisUtterance();
		this.message.text = text;
		if (this.voice) {
			this.message.voice = this.voice;
			this.message.lang = this.voice.lang;
		}else {
			this.message.lang = 'en-US';
		}
		this.message.rate = 0.9;
		if (onEnd) {
			this.message.addEventListener('end', onEnd);
			this.message.addEventListener('error', onEnd);
		}
		window.speechSynthesis.speak(this.message);
	}
}

export default TextToSpeech;