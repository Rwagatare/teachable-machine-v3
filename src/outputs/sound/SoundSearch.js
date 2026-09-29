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

// Sheet for choosing a class's sound. Each result has a preview button and a
// select button. Escape and Back close it and return focus to the opener.
//
// options.playCallback(sound)   preview toggle for a sound file name
// options.selectCallback(sound) a sound was chosen
// options.closeCallback()       the sheet closed without a choice

let sheetCount = 0;

class SoundSearch {
	constructor(options) {
		this.playCallback = options.playCallback;
		this.selectCallback = options.selectCallback;
		this.closeCallback = options.closeCallback;
		this.assets = options.assets;
		this.visible = false;
		this.opener = null;
		this.playingSound = null;

		sheetCount += 1;
		let inputId = `sound-search-input-${sheetCount}`;

		this.element = document.createElement('div');
		this.element.classList.add('output__sound-search');
		this.element.classList.add('output__sheet');
		this.element.setAttribute('role', 'dialog');
		this.element.hidden = true;

		this.searchBar = document.createElement('div');
		this.searchBar.classList.add('output__sheet-bar');
		this.element.appendChild(this.searchBar);

		this.backButton = OutputUI.iconButton({
			className: 'output__sheet-back',
			label: 'Back',
			icon: 'back'
		});
		this.backButton.addEventListener('click', this.close.bind(this));
		this.searchBar.appendChild(this.backButton);

		let label = document.createElement('label');
		label.className = 'visually-hidden';
		label.setAttribute('for', inputId);
		label.textContent = 'Search sounds';
		this.searchBar.appendChild(label);

		this.searchInput = document.createElement('input');
		this.searchInput.type = 'search';
		this.searchInput.id = inputId;
		this.searchInput.classList.add('output__search-input');
		this.searchInput.setAttribute('placeholder', 'Search sounds');
		this.searchInput.setAttribute('autocomplete', 'off');
		this.searchInput.setAttribute('enterkeyhint', 'search');
		this.searchBar.appendChild(this.searchInput);

		this.scroll = document.createElement('div');
		this.scroll.classList.add('output__sheet-scroll');
		this.element.appendChild(this.scroll);

		this.searchResults = document.createElement('ul');
		this.searchResults.classList.add('output__sound-search-results');
		this.scroll.appendChild(this.searchResults);

		this.emptyMessage = document.createElement('p');
		this.emptyMessage.classList.add('output__sheet-hint');
		this.emptyMessage.setAttribute('role', 'status');
		this.scroll.appendChild(this.emptyMessage);

		this.allResults = [];
		for (let index = 0; index < this.assets.length; index += 1) {
			this.allResults.push(this.buildResult(this.assets[index]));
		}

		this.searchInput.addEventListener('input', this.filterResults.bind(this));
		this.element.addEventListener('keydown', this.keyDown.bind(this));
	}

	buildResult(sound) {
		let name = OutputUI.soundLabel(sound);
		let item = document.createElement('li');
		item.classList.add('output__sound-search-result');
		item.sound = sound;
		item.label = name;

		let play = OutputUI.iconButton({
			className: 'output__sound-search-play',
			label: `Play ${name}`,
			icon: 'play'
		});
		play.addEventListener('click', () => {
			this.playCallback(sound);
		});

		let select = document.createElement('button');
		select.type = 'button';
		select.classList.add('output__sound-search-select');
		select.innerHTML = OutputUI.icon('check');
		let text = document.createElement('span');
		text.classList.add('output__sound-search-name');
		text.textContent = name;
		select.appendChild(text);
		select.addEventListener('click', () => {
			this.selectCallback(sound);
		});

		item.playButton = play;
		item.selectButton = select;
		item.appendChild(play);
		item.appendChild(select);
		this.searchResults.appendChild(item);

		return item;
	}

	keyDown(event) {
		if (event.key === 'Escape' || event.key === 'Esc') {
			event.preventDefault();
			event.stopPropagation();
			this.close();
		}
	}

	close() {
		this.hide(true);
		if (this.closeCallback) {
			this.closeCallback();
		}
	}

	hide(returnFocus) {
		if (!this.visible) {
			return;
		}
		this.element.hidden = true;
		this.visible = false;
		this.setPlaying(null);
		if (this.opener) {
			this.opener.setAttribute('aria-expanded', 'false');
			if (returnFocus === true) {
				this.opener.focus();
			}
		}
	}

	// classId: class being edited; current: its sound (or null); opener: the
	// control that opened the sheet, which gets focus back on close.
	show(classId, current, opener) {
		this.opener = opener || null;
		this.element.className = `output__sound-search output__sheet output-class--${classId}`;
		this.element.setAttribute('aria-label', `Choose ${OutputUI.classLabel(classId)} Sound`);
		this.searchInput.value = '';
		this.filterResults();

		this.allResults.forEach((item) => {
			let isCurrent = item.sound === current;
			item.classList.toggle('output__sound-search-result--current', isCurrent);
			if (isCurrent) {
				item.selectButton.setAttribute('aria-current', 'true');
			}else {
				item.selectButton.removeAttribute('aria-current');
			}
		});

		this.element.hidden = false;
		this.visible = true;
		this.scroll.scrollTop = 0;
		if (this.opener) {
			this.opener.setAttribute('aria-expanded', 'true');
		}

		// Avoid raising the on-screen keyboard over the list on touch screens.
		if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
			this.searchInput.focus();
		}else {
			this.backButton.focus();
		}
	}

	// Reflect which result is being previewed (null for none).
	setPlaying(sound) {
		this.playingSound = sound;
		this.allResults.forEach((item) => {
			let playing = item.sound === sound;
			item.playButton.innerHTML = OutputUI.icon(playing ? 'stop' : 'play');
			item.playButton.setAttribute('aria-label', `${playing ? 'Stop' : 'Play'} ${item.label}`);
			item.playButton.classList.toggle('output__icon-button--playing', playing);
		});
	}

	filterResults() {
		let phrase = this.searchInput.value.trim().toLowerCase();
		let shown = 0;

		this.allResults.forEach((item) => {
			let matches = phrase.length === 0 ||
				item.label.toLowerCase().indexOf(phrase) > -1 ||
				item.sound.toLowerCase().indexOf(phrase) > -1;
			item.hidden = !matches;
			if (matches) {
				shown += 1;
			}
		});

		if (shown === 0) {
			this.emptyMessage.textContent = `No sounds match “${this.searchInput.value.trim()}”. Try another word.`;
			this.emptyMessage.hidden = false;
		}else {
			this.emptyMessage.textContent = '';
			this.emptyMessage.hidden = true;
		}
	}
}

import OutputUI from './../outputUI.js';

export default SoundSearch;