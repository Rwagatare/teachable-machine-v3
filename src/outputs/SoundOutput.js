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

// If some sounds never report that they can play (for example on a phone
// that won't preload audio before a tap), show the controls anyway.
const LOADING_TIMEOUT = 8000;

class SoundOutput {
	constructor() {
		this.id = 'SoundOutput';
		this.loaded = false;
		this.canTrigger = true;
		this.basePath = 'assets/outputs/sound/sounds/';
		this.assets = [
			'applause.mp3',
			'bass.mp3',
			'birds.mp3',
			'cow.mp3',
			'drum_joke.mp3',
			'drum_roll.mp3',
			'drums_1.mp3',
			'drums_2.mp3',
			'fanfare.mp3',
			'flute_1.mp3',
			'flute_2.mp3',
			'flute_3.mp3',
			'guitar_1.mp3',
			'guitar_2.mp3',
			'harp.mp3',
			'jingle.mp3',
			'orchestra.mp3',
			'organ.mp3',
			'trombone.mp3',
			'trumpet_1.mp3',
			'trumpet_2.mp3',
			'trumpet_3.mp3',
			'tuba.mp3'
		];

		this.numAssets = this.assets.length;
		window.addEventListener('mobileLaunch', this.touchAudio.bind(this));
		document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), false);

		this.defaultAssets = [
			'birds.mp3',
			'guitar_1.mp3',
			'trombone.mp3',
			'harp.mp3'
		];

		this.numLoaded = 0;
		this.sounds = {};
		this.currentSound = null;
		this.currentIndex = null;
		this.playingIndex = -1;
		this.activeRow = null;
		this.element = document.createElement('div');
		this.element.classList.add('output__container');
		this.element.classList.add('output__container--sound');
		this.classNames = GLOBALS.classNames;
		this.colors = GLOBALS.colors;
		this.numClasses = GLOBALS.numClasses;

		this.loadingScreen = document.createElement('div');
		this.loadingScreen.classList.add('output__loading-screen');
		this.loadingScreen.setAttribute('role', 'status');
		let loadingTitle = document.createElement('p');
		loadingTitle.textContent = 'Loading sounds…';
		loadingTitle.classList.add('output__loading-title');
		this.loadingScreen.appendChild(loadingTitle);
		this.element.appendChild(this.loadingScreen);

		this.offScreen = document.createElement('div');
		this.offScreen.classList.add('output__sound');
		this.offScreen.hidden = true;

		this.search = new SoundSearch({
			playCallback: this.searchResultPlayClick.bind(this),
			selectCallback: this.searchResultClick.bind(this),
			closeCallback: this.searchClosed.bind(this),
			assets: this.assets
		});

		this.list = document.createElement('ul');
		this.list.classList.add('output__rows');
		this.list.setAttribute('aria-label', 'Sound for each class');
		this.offScreen.appendChild(this.list);
		this.inputClasses = [];

		for (let index = 0; index < this.assets.length; index += 1) {
			let sound = this.assets[index];
			let audio = new Audio();
			audio.muted = true;
			audio.loop = true;
			audio.addEventListener('canplaythrough', this.assetLoaded.bind(this), {once: true});
			audio.addEventListener('error', this.assetLoaded.bind(this), {once: true});
			audio.addEventListener('ended', this.soundEnded.bind(this));
			audio.src = this.basePath + sound;
			this.sounds[sound] = audio;
		}

		for (let index = 0; index < this.numClasses; index += 1) {
			this.addRow(this.classNames[index], index);
		}

		this.element.appendChild(this.offScreen);
		this.element.appendChild(this.search.element);
		this.buildCanvas();

		this.loadingTimer = setTimeout(this.showScreen.bind(this), LOADING_TIMEOUT);
	}

	// Method to dynamically add a new class
	addNewClass(className, index) {
		this.classNames = GLOBALS.classNames;
		this.numClasses = GLOBALS.numClasses;
		this.addRow(className, index);
	}

	// One row per class: class tag, the chosen sound (opens the picker),
	// a preview button and a remove button.
	addRow(className, index) {
		let name = OutputUI.classLabel(className);
		let sound = this.defaultAssets[index] || this.defaultAssets[0];

		let inputClass = document.createElement('li');
		inputClass.classList.add('output__row');
		inputClass.classList.add(`output-class--${className}`);
		inputClass.classId = className;
		inputClass.index = index;
		inputClass.sound = sound;

		let tag = OutputUI.classTag(className);
		tag.setAttribute('aria-hidden', 'true');
		inputClass.appendChild(tag);

		let controls = document.createElement('div');
		controls.classList.add('output__row-controls');

		let input = document.createElement('button');
		input.type = 'button';
		input.classList.add('output__value');
		input.setAttribute('aria-haspopup', 'dialog');
		input.setAttribute('aria-expanded', 'false');
		input.classId = className;
		input.appendChild(OutputUI.visuallyHidden(`Edit ${name} Sound: `));
		let valueText = document.createElement('span');
		valueText.classList.add('output__value-text');
		input.appendChild(valueText);
		input.insertAdjacentHTML('beforeend', OutputUI.icon('chevron'));
		input.addEventListener('click', () => {
			this.editInput(index);
		});

		let playButton = OutputUI.iconButton({
			className: 'output__play',
			label: `Play Sound for ${name}`,
			icon: 'speaker'
		});
		playButton.addEventListener('click', () => {
			this.rowPlayClick(index);
		});

		let deleteButton = OutputUI.iconButton({
			className: 'output__clear',
			label: `Remove ${name} Sound`,
			icon: 'clear'
		});
		deleteButton.addEventListener('click', () => {
			this.clearInput(index);
		});

		controls.appendChild(input);
		controls.appendChild(playButton);
		controls.appendChild(deleteButton);
		inputClass.appendChild(controls);

		inputClass.input = input;
		inputClass.valueText = valueText;
		inputClass.icon = playButton;
		inputClass.playButton = playButton;
		inputClass.deleteButton = deleteButton;
		inputClass.label = name;

		this.inputClasses[index] = inputClass;
		this.list.appendChild(inputClass);
		this.renderRow(inputClass);
	}

	renderRow(row) {
		let hasSound = Boolean(row.sound);
		row.valueText.textContent = OutputUI.soundLabel(row.sound);
		row.input.classList.toggle('output__value--none', !hasSound);
		row.playButton.disabled = !hasSound;
		row.deleteButton.disabled = !hasSound;
	}

	handleVisibilityChange() {
		if (GLOBALS.outputSection && GLOBALS.outputSection.currentOutput &&
			GLOBALS.outputSection.currentOutput.id === 'SoundOutput' &&
			this.currentSound
		) {
			if (document.hidden) {
				this.currentSound.pause();
			}else {
				this.playAudio(this.currentSound);
			}
		}
	}

	playCurrentSound() {
		if (this.currentSound) {
			this.playAudio(this.currentSound);
		}
	}

	pauseCurrentSound() {
		if (this.currentSound) {
			this.currentSound.pause();
		}
	}

	// play() returns a promise that rejects if autoplay is blocked.
	playAudio(audio) {
		let promise = audio.play();
		if (promise && typeof promise.catch === 'function') {
			promise.catch(() => false);
		}
	}

	clearInput(index) {
		let row = this.inputClasses[index];
		if (this.currentSound && this.currentSound === this.sounds[row.sound]) {
			this.stopSound();
		}
		row.sound = null;
		this.renderRow(row);
		if (index === this.currentIndex) {
			this.updateCanvas(index, 'None');
		}
	}

	// Preview toggle for a result in the picker.
	searchResultPlayClick(sound) {
		if (this.search.playingSound === sound) {
			this.stopSound();

			return;
		}
		if (this.playSound(sound, true)) {
			this.search.setPlaying(sound);
		}
	}

	searchResultClick(sound) {
		let row = this.activeRow;
		this.stopSound();
		if (row) {
			row.sound = sound;
			this.renderRow(row);
		}
		this.search.hide(true);
		this.searchClosed();
	}

	searchClosed() {
		this.element.classList.remove('output__container--sheet-open');
		this.stopSound();
		this.activeRow = null;

		// Let the next prediction start the (possibly new) sound again.
		this.currentIndex = null;
	}

	editInput(index) {
		let row = this.inputClasses[index];
		this.activeRow = row;
		this.stopSound();
		this.element.classList.add('output__container--sheet-open');
		this.search.show(row.classId, row.sound, row.input);
	}

	// Preview toggle for a class row.
	rowPlayClick(index) {
		let row = this.inputClasses[index];
		if (this.playingIndex === index) {
			this.stopSound();

			return;
		}
		if (row.sound && this.playSound(row.sound, true)) {
			this.setPlaying(index);
		}
	}

	// Reflect which row is audible: speaker waves + Play/Stop label.
	setPlaying(index) {
		this.playingIndex = index;
		this.inputClasses.forEach((row, position) => {
			let playing = position === index;
			row.playButton.classList.toggle('output__icon-button--playing', playing);
			row.playButton.setAttribute('aria-label', `${playing ? 'Stop' : 'Play'} Sound for ${row.label}`);
		});
	}

	soundEnded(event) {
		// Only one-shot previews end; class sounds loop.
		let audio = event.target;
		audio.loop = true;
		if (this.currentSound === audio) {
			this.stopSound();
		}
	}

	// isPreview: plays once, even while the picker is open.
	playSound(sound, isPreview) {
		this.muteSounds();
		let audio = this.sounds[sound];
		if (!audio || (this.search.visible && !isPreview)) {
			return false;
		}
		this.currentSound = audio;
		audio.loop = !isPreview;
		audio.muted = false;
		audio.currentTime = 0;
		this.playAudio(audio);

		return true;
	}

	muteSounds() {
		if (this.currentSound) {
			this.currentSound.muted = true;
		}
	}

	stopSound() {
		this.muteSounds();
		if (this.currentSound) {
			this.currentSound.loop = true;
		}
		this.currentSound = null;
		this.setPlaying(-1);
		this.search.setPlaying(null);
	}

	assetLoaded() {
		this.numLoaded += 1;
		if (this.numLoaded === this.numAssets) {
			this.loaded = true;
			this.showScreen();
		}
	}

	showScreen() {
		clearTimeout(this.loadingTimer);
		this.loadingScreen.hidden = true;
		this.offScreen.hidden = false;
	}

	// What this output plays for a class, for the now-playing bar.
	nowPlaying(index) {
		let row = this.inputClasses[index];
		let sound = row && row.sound ? row.sound : null;

		return {
			kind: 'sound',
			value: sound,
			label: OutputUI.soundLabel(sound)
		};
	}

	describe(index) {
		let name = OutputUI.classLabel(this.classNames[index]);

		return `${name}: ${this.nowPlaying(index).label}`;
	}

	trigger(index) {
		if (!GLOBALS.clearing && this.currentIndex !== index) {
			this.currentIndex = index;
			let row = this.inputClasses[index];
			let sound = row.sound;

			// While the picker is open, leave the user's preview alone.
			if (!this.search.visible) {
				if (sound && this.playSound(sound, false)) {
					this.setPlaying(index);
				}else {
					this.stopSound();
				}
			}

			this.inputClasses.forEach((other, position) => {
				other.classList.toggle('output__row--active', position === index);
			});

			this.updateCanvas(index, OutputUI.soundLabel(sound));
		}

		if (GLOBALS.clearing) {
			this.inputClasses.forEach((other) => {
				other.classList.remove('output__row--active');
			});
			this.setPlaying(-1);
			for (let index = 0; index < this.numAssets; index += 1) {
				this.sounds[this.assets[index]].pause();
			}
		}
	}

	stop() {
		this.search.hide(false);
		this.element.classList.remove('output__container--sheet-open');
		this.activeRow = null;
		for (let index = 0; index < this.numAssets; index += 1) {
			this.sounds[this.assets[index]].pause();
		}
		this.setPlaying(-1);
		this.element.style.display = 'none';
	}

	start() {
		this.element.style.display = 'block';
		this.handleVisibilityChange();
		if (this.currentSound) {
			this.setPlaying(this.inputClasses.findIndex((row) => this.sounds[row.sound] === this.currentSound));
		}
	}

	// Hidden canvas the video recorder draws from (see RecordOpener).
	buildCanvas() {
		this.canvas = document.createElement('canvas');
		this.canvas.style.display = 'none';
		this.canvas.setAttribute('aria-hidden', 'true');
		this.context = this.canvas.getContext('2d');
		this.canvas.width = 340;
		this.canvas.height = 260;
		this.offScreen.appendChild(this.canvas);
		OutputUI.paintRecorderBackground(this.context, null);
	}

	// Always the light palette: this ends up in an exported video.
	updateCanvas(colorId, soundName) {
		let id = this.classNames[colorId];
		OutputUI.drawRecorderCard(this.context, id, soundName || 'None');
	}

	touchAudio() {
		Object.keys(this.sounds).forEach((key) => {
			let audio = this.sounds[key];
			this.playAudio(audio);
			audio.pause();
		});
	}
}

import SoundSearch from './sound/SoundSearch.js';
import OutputUI from './outputUI.js';
import GLOBALS from './../config.js';

export default SoundOutput;