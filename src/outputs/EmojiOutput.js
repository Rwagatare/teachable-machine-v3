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

// Default emoji set for each class, in class order.
const DEFAULT_EMOJIS = [
	[
		'🟢',
		'🥝',
		'🥑',
		'🥬',
		'🥒',
		'🫒',
		'🍏',
		'🍐',
		'🌵',
		'🌲'
	],
	[
		'🟣',
		'🍇',
		'🔮',
		'💜',
		'☂️',
		'🪁',
		'🧞',
		'👾',
		'🦄',
		'🍆'
	],
	[
		'🟠',
		'🧡',
		'🦊',
		'🍊',
		'🥕',
		'🏀',
		'🔶',
		'🟧',
		'🦁',
		'🍑'
	],
	[
		'🟡',
		'💛',
		'🌟',
		'⭐',
		'🌻',
		'🍋',
		'🍌',
		'🐤',
		'🌞',
		'🟨'
	]
];

// Available emoji categories
const EMOJI_CATEGORIES = {
	faces: [
		'😀',
		'😃',
		'😄',
		'😁',
		'😆',
		'😂',
		'🤣',
		'😊',
		'😇',
		'🙂',
		'🙃',
		'😉',
		'😌',
		'😍',
		'🥰',
		'😘',
		'😗',
		'😙',
		'😚',
		'😋',
		'😛',
		'😝',
		'😜',
		'🤪',
		'🤨',
		'🧐',
		'🤓',
		'😎',
		'🤩',
		'🥳'
	],
	hearts: [
		'❤️',
		'🧡',
		'💛',
		'💚',
		'💙',
		'💜',
		'🖤',
		'🤍',
		'🤎',
		'💔',
		'❣️',
		'💕',
		'💞',
		'💓',
		'💗',
		'💖',
		'💘',
		'💝',
		'💟',
		'♥️'
	],
	hands: [
		'👍',
		'👎',
		'👌',
		'🤌',
		'🤏',
		'✌️',
		'🤞',
		'🤟',
		'🤘',
		'🤙',
		'👈',
		'👉',
		'👆',
		'👇',
		'☝️',
		'✋',
		'🤚',
		'🖐️',
		'🖖',
		'👋',
		'🤝',
		'👏',
		'🙌',
		'👐',
		'🤲',
		'🤜',
		'🤛',
		'✊',
		'👊'
	],
	objects: [
		'🔥',
		'⭐',
		'✨',
		'💫',
		'⚡',
		'💥',
		'🌟',
		'🎆',
		'🎇',
		'🌠',
		'🎯',
		'🎨',
		'🎭',
		'🎪',
		'🎨',
		'🎯',
		'🎲',
		'🎮',
		'🕹️',
		'🎰'
	],
	nature: [
		'🌸',
		'💐',
		'🌹',
		'🥀',
		'🌺',
		'🌻',
		'🌼',
		'🌷',
		'🌱',
		'🪴',
		'🌲',
		'🌳',
		'🌴',
		'🌵',
		'🌶️',
		'🍄',
		'🌾',
		'💮',
		'🏔️',
		'⛰️',
		'🌋',
		'🗻',
		'🏕️',
		'🏖️',
		'🏜️',
		'🏝️',
		'🏞️'
	],
	green: [
		'🥬',
		'🥝',
		'🥑',
		'🥬',
		'🥒',
		'🫒',
		'🍏',
		'🍐',
		'🌵',
		'🌲',
		'🌱',
		'🌿',
		'☘️',
		'🍀',
		'🦎',
		'🐊',
		'🐢',
		'🧩',
		'♻️',
		'🧪'
	],
	purple: [
		'🟣',
		'🍇',
		'🔮',
		'💜',
		'☂️',
		'🪁',
		'🧞',
		'👾',
		'🦄',
		'🍆',
		'🔯',
		'✝️',
		'☦️',
		'☯️',
		'♈',
		'♉',
		'♊',
		'♋',
		'♌',
		'♍'
	],
	orange: [
		'🟠',
		'🧡',
		'🦊',
		'🍊',
		'🥕',
		'🏀',
		'🔶',
		'🟧',
		'🦁',
		'🍑',
		'🦒',
		'🐅',
		'🐆',
		'🦧',
		'🧶',
		'🧵',
		'🧮',
		'🛄',
		'🛅',
		'🧾'
	],
	yellow: [
		'🟡',
		'💛',
		'🌟',
		'⭐',
		'🌻',
		'🍋',
		'🍌',
		'🐤',
		'🌞',
		'🟨',
		'📀',
		'🌝',
		'🌕',
		'🌙',
		'🌛',
		'🌜',
		'🧀',
		'🌽',
		'🧷',
		'🔔'
	]
};

// Search terms mapped to a category. Anything else shows faces.
const SEARCH_TERMS = {
	'heart': 'hearts',
	'love': 'hearts',
	'hand': 'hands',
	'thumb': 'hands',
	'clap': 'hands',
	'fire': 'objects',
	'star': 'objects',
	'object': 'objects',
	'flower': 'nature',
	'nature': 'nature',
	'plant': 'nature',
	'green': 'green',
	'grass': 'green',
	'leaf': 'green',
	'purple': 'purple',
	'violet': 'purple',
	'lavender': 'purple',
	'orange': 'orange',
	'peach': 'orange',
	'carrot': 'orange',
	'yellow': 'yellow',
	'gold': 'yellow',
	'lemon': 'yellow'
};

const FALLBACK_EMOJI = '😀';
const REST_LABEL = 'No class detected yet';

let searchCount = 0;

class EmojiOutput {
	constructor() {
		this.id = 'EmojiOutput';
		this.element = document.createElement('div');
		this.element.classList.add('output__container');
		this.element.classList.add('output__container--emoji');
		this.classNames = GLOBALS.classNames;
		this.colors = GLOBALS.colors;
		this.defaultEmojis = DEFAULT_EMOJIS;
		this.emojiCategories = EMOJI_CATEGORIES;
		this.emojis = [];
		this.thumbs = [];
		this.currentIndex = null;
		this.currentClass = null;
		this.renderedKey = null;
		this.previewing = false;

		this.edit = document.createElement('div');
		this.edit.classList.add('emoji__edit');

		// Hidden, fixed-palette canvas for the video recorder. It must be the
		// first canvas in this.element (RecordOpener picks it with
		// querySelector('canvas')).
		this.buildCanvas();

		// Visible viewer: live DOM so it follows the CSS tokens (dark mode,
		// increased contrast) and has a text alternative.
		this.editViewer = document.createElement('div');
		this.editViewer.classList.add('emoji__viewer');
		this.editViewer.setAttribute('role', 'img');

		this.viewerGlyph = document.createElement('span');
		this.viewerGlyph.classList.add('emoji__viewer-glyph');
		this.viewerGlyph.setAttribute('aria-hidden', 'true');
		this.editViewer.appendChild(this.viewerGlyph);

		this.viewerCaption = document.createElement('span');
		this.viewerCaption.classList.add('emoji__viewer-caption');
		this.viewerCaption.setAttribute('aria-hidden', 'true');
		this.editViewer.appendChild(this.viewerCaption);

		this.editBar = document.createElement('div');
		this.editBar.classList.add('emoji__edit-bar');
		this.editBar.setAttribute('role', 'group');
		this.editBar.setAttribute('aria-label', 'Emoji for each class');

		let hint = document.createElement('p');
		hint.classList.add('output__hint');
		hint.textContent = 'Select an emoji to change it.';

		this.edit.appendChild(this.editViewer);
		this.edit.appendChild(this.editBar);
		this.edit.appendChild(hint);

		for (let index = 0; index < this.classNames.length; index += 1) {
			this.addThumb(this.classNames[index], index);
		}

		this.buildSearch();
		this.element.appendChild(this.edit);

		this.renderRest();
	}

	// Called by LearningSection when a class is added.
	addNewClass(className, index) {
		this.classNames = GLOBALS.classNames;
		this.addThumb(className, index);
	}

	addThumb(className, index) {
		let emoji = DEFAULT_EMOJIS[index] ? DEFAULT_EMOJIS[index][0] : FALLBACK_EMOJI;
		this.emojis[index] = emoji;

		let button = document.createElement('button');
		button.type = 'button';
		button.classList.add('emoji__thumb');
		button.classList.add(`output-class--${className}`);
		button.setAttribute('aria-haspopup', 'dialog');
		button.setAttribute('aria-expanded', 'false');
		button.id = `emoji-thumb-${className}`;
		button.classId = className;
		button.index = index;
		button.emoji = emoji;

		let emojiWrapper = document.createElement('span');
		emojiWrapper.classList.add('emoji__thumb-emoji');
		emojiWrapper.setAttribute('aria-hidden', 'true');
		emojiWrapper.textContent = emoji;
		button.appendChild(emojiWrapper);

		let tag = OutputUI.classTag(className);
		tag.setAttribute('aria-hidden', 'true');
		button.appendChild(tag);

		button.emojiWrapper = emojiWrapper;
		this.labelThumb(button);

		button.addEventListener('mouseenter', this.editThumbOver.bind(this));
		button.addEventListener('mouseleave', this.editThumbOut.bind(this));
		button.addEventListener('click', this.editThumbClick.bind(this));

		this.editBar.appendChild(button);
		this.thumbs[index] = button;
	}

	labelThumb(button) {
		let name = OutputUI.classLabel(button.classId);
		button.setAttribute('aria-label', `Edit ${name} Emoji, ${button.emoji}`);
	}

	buildSearch() {
		searchCount += 1;
		let inputId = `emoji-search-input-${searchCount}`;

		this.search = document.createElement('div');
		this.search.classList.add('emoji__search');
		this.search.classList.add('output__sheet');
		this.search.setAttribute('role', 'dialog');
		this.search.hidden = true;

		this.searchBar = document.createElement('div');
		this.searchBar.classList.add('output__sheet-bar');

		this.searchBackButton = OutputUI.iconButton({
			className: 'output__sheet-back',
			label: 'Back',
			icon: 'back'
		});
		this.searchBar.appendChild(this.searchBackButton);

		let label = document.createElement('label');
		label.className = 'visually-hidden';
		label.setAttribute('for', inputId);
		label.textContent = 'Search emoji';
		this.searchBar.appendChild(label);

		this.searchInput = document.createElement('input');
		this.searchInput.type = 'search';
		this.searchInput.id = inputId;
		this.searchInput.classList.add('output__search-input');
		this.searchInput.setAttribute('placeholder', 'Search emoji');
		this.searchInput.setAttribute('autocomplete', 'off');
		this.searchInput.setAttribute('enterkeyhint', 'search');
		this.searchInput.setAttribute('aria-describedby', inputId + '-hint');
		this.searchBar.appendChild(this.searchInput);
		this.search.appendChild(this.searchBar);

		let hint = document.createElement('p');
		hint.id = inputId + '-hint';
		hint.classList.add('output__sheet-hint');
		hint.textContent = 'Try heart, hand, star, flower or a color.';
		this.search.appendChild(hint);

		this.searchScroll = document.createElement('div');
		this.searchScroll.classList.add('output__sheet-scroll');
		this.search.appendChild(this.searchScroll);

		this.searchResults = document.createElement('div');
		this.searchResults.classList.add('emoji__search-results');
		this.searchScroll.appendChild(this.searchResults);

		this.edit.appendChild(this.search);

		// Bound once, so they can never pile up across start()/stop().
		this.searchInput.addEventListener('input', this.searchKeyUp.bind(this));
		this.searchBackButton.addEventListener('click', this.closeSearch.bind(this));
		this.search.addEventListener('keydown', this.searchKeyDown.bind(this));
		this.searchResults.addEventListener('click', this.selectEmoji.bind(this));
	}

	buildCanvas() {
		this.canvas = document.createElement('canvas');
		this.canvas.classList.add('emoji__canvas');
		this.canvas.setAttribute('aria-hidden', 'true');
		this.canvas.style.display = 'none';
		this.context = this.canvas.getContext('2d');
		this.canvas.width = 340;
		this.canvas.height = 260;
		this.element.appendChild(this.canvas);
	}

	// Paint the viewer and the recorder canvas for a class and emoji.
	render(index, emoji) {
		let id = this.classNames[index];
		let key = id + ':' + emoji;
		if (key === this.renderedKey) {
			return;
		}
		this.renderedKey = key;

		let name = OutputUI.classLabel(id);
		this.editViewer.className = `emoji__viewer output-class--${id}`;
		this.editViewer.setAttribute('aria-label', `${name}: ${emoji}`);
		this.viewerGlyph.textContent = emoji;
		this.viewerCaption.innerHTML = '';
		this.viewerCaption.appendChild(OutputUI.classTag(id));

		this.updateCanvas(emoji, index);
	}

	renderRest() {
		this.renderedKey = null;
		this.editViewer.className = 'emoji__viewer emoji__viewer--rest';
		this.editViewer.setAttribute('aria-label', REST_LABEL);
		this.viewerGlyph.textContent = '';
		this.viewerCaption.textContent = REST_LABEL;
		OutputUI.paintRecorderBackground(this.context, null);
	}

	restoreViewer() {
		if (typeof this.currentIndex === 'number' && this.currentIndex > -1) {
			this.render(this.currentIndex, this.emojis[this.currentIndex]);
		}else {
			this.renderRest();
		}
	}

	// Recorder canvas: always the light palette, since it ends up in a video.
	updateCanvas(emoji, colorId) {
		let id = this.classNames[colorId];
		let context = this.context;
		OutputUI.paintRecorderBackground(context, id);

		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = OutputUI.RECORDER_PALETTE.label;
		context.font = '120px ' + OutputUI.EMOJI_FONT;
		context.fillText(emoji, this.canvas.width / 2, this.canvas.height / 2 - 16);

		OutputUI.drawFittedText(context, OutputUI.classLabel(id), {
			size: 17,
			weight: 400,
			y: 228,
			color: OutputUI.RECORDER_PALETTE.secondaryLabel
		});
	}

	// Hovering a thumbnail previews it in the viewer until the pointer leaves.
	editThumbOver(event) {
		let thumb = event.currentTarget;
		if (this.search.hidden) {
			this.previewing = true;
			this.render(thumb.index, thumb.emoji);
		}
	}

	editThumbOut() {
		this.previewing = false;
		this.restoreViewer();
	}

	editThumbClick(event) {
		this.showSearch(event);
	}

	selectEmoji(event) {
		let item = event.target.closest('.emoji__search-item');
		if (!item || !this.currentClass) {
			return;
		}
		let index = this.currentClass.index;
		let emoji = item.emoji;

		this.emojis[index] = emoji;
		this.currentClass.emoji = emoji;
		this.currentClass.emojiWrapper.textContent = emoji;
		this.labelThumb(this.currentClass);
		this.renderedKey = null;
		this.previewing = false;
		this.hideSearch(true);
		this.restoreViewer();
	}

	displaySearchResults(category) {
		let emojis = this.emojiCategories[category] || this.emojiCategories.faces;
		let unique = emojis.filter((emoji, position) => emojis.indexOf(emoji) === position);
		let fragment = document.createDocumentFragment();

		unique.forEach((emoji) => {
			let item = document.createElement('button');
			item.type = 'button';
			item.classList.add('emoji__search-item');
			item.textContent = emoji;
			item.emoji = emoji;
			fragment.appendChild(item);
		});

		this.searchResults.innerHTML = '';
		this.searchResults.appendChild(fragment);
		this.searchScroll.scrollTop = 0;
	}

	// Helper method to determine category based on search term
	getCategoryFromSearchTerm(value) {
		let terms = Object.keys(SEARCH_TERMS);
		for (let index = 0; index < terms.length; index += 1) {
			if (value.includes(terms[index])) {
				return SEARCH_TERMS[terms[index]];
			}
		}

		return 'faces';
	}

	// Helper method to get default category based on current class
	getDefaultCategory() {
		if (this.currentClass && this.emojiCategories[this.currentClass.classId]) {
			return this.currentClass.classId;
		}

		return 'faces';
	}

	searchKeyUp() {
		const value = this.searchInput.value.trim().toLowerCase();
		let category = this.getDefaultCategory();

		if (value.length > 0) {
			category = this.getCategoryFromSearchTerm(value);
		}

		this.displaySearchResults(category);
	}

	searchKeyDown(event) {
		if (event.key === 'Escape' || event.key === 'Esc') {
			event.preventDefault();
			event.stopPropagation();
			this.closeSearch();
		}
	}

	showSearch(event) {
		let thumb = event.currentTarget;
		let id = thumb.classId;
		this.currentClass = thumb;

		this.search.className = `emoji__search output__sheet output-class--${id}`;
		this.search.setAttribute('aria-label', `Choose ${OutputUI.classLabel(id)} Emoji`);
		this.searchInput.value = '';
		this.displaySearchResults(this.getDefaultCategory());
		this.search.hidden = false;
		this.element.classList.add('output__container--sheet-open');
		thumb.setAttribute('aria-expanded', 'true');

		// Only jump into the text field where that won't raise an on-screen
		// keyboard over the results.
		if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
			this.searchInput.focus();
		}else {
			this.searchBackButton.focus();
		}
	}

	closeSearch() {
		this.hideSearch(true);
	}

	hideSearch(returnFocus) {
		if (this.search.hidden) {
			return;
		}
		this.search.hidden = true;
		this.element.classList.remove('output__container--sheet-open');
		if (this.currentClass) {
			this.currentClass.setAttribute('aria-expanded', 'false');
			if (returnFocus === true) {
				this.currentClass.focus();
			}
		}
	}

	// What this output shows for a class, for the now-playing bar.
	nowPlaying(index) {
		let emoji = this.emojis[index] || null;

		return {
			kind: 'emoji',
			value: emoji,
			label: emoji || 'None'
		};
	}

	describe(index) {
		let id = this.classNames[index];

		return `${OutputUI.classLabel(id)}: ${this.nowPlaying(index).label}`;
	}

	trigger(index) {
		if (!GLOBALS.clearing) {
			if (this.currentIndex !== index) {
				this.setActiveThumb(index);
			}
			this.currentIndex = index;
			if (this.search.hidden && !this.previewing) {
				this.render(index, this.emojis[index]);
			}
		}

		if (GLOBALS.clearing) {
			this.setActiveThumb(-1);
		}
	}

	setActiveThumb(index) {
		this.thumbs.forEach((thumb, position) => {
			thumb.classList.toggle('emoji__thumb--active', position === index);
		});
	}

	stop() {
		this.hideSearch(false);
		this.element.style.display = 'none';
	}

	start() {
		this.element.style.display = 'block';
	}
}

import GLOBALS from './../config.js';
import OutputUI from './outputUI.js';

export default EmojiOutput;