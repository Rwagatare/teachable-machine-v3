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

class EmojiOutput {
	constructor() {
		this.id = 'EmojiOutput';
		this.element = document.createElement('div');
		this.element.classList.add('output__container');
		this.classNames = GLOBALS.classNames;
		this.colors = GLOBALS.colors;
		this.defaultEmojis = [];
		this.emojis = [];
		this.currentIndex = null;
		this.currentClass = null;

		// Default emoji sets for each class

		this.edit = document.createElement('div');
		this.edit.classList.add('emoji__edit');

		this.editBar = document.createElement('div');
		this.editBar.classList.add('emoji__edit-bar');

this.defaultEmojis.push([
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
]);
this.defaultEmojis.push([
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
]);
this.defaultEmojis.push([
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
]);
this.defaultEmojis.push([
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
]);
		this.borders = [];

		for (let index = 0; index < this.classNames.length; index += 1) {
			let className = this.classNames[index];
			let emoji = this.defaultEmojis[index] ? this.defaultEmojis[index][0] : '😀';

			this.emojis[index] = this.defaultEmojis[index] ? this.defaultEmojis[index][0] : '😀';

			let button = document.createElement('div');
			button.classList.add('emoji__thumb');
			button.id = className;
			button.index = index;
			button.emoji = emoji;

			let border = document.createElement('div');
			border.classList.add('emoji__thumb-border');
			border.classList.add(`emoji__thumb-border--${className}`);
			button.appendChild(border);

			let emojiWrapper = document.createElement('div');
			emojiWrapper.classList.add('emoji__thumb-emoji-wrapper');
			emojiWrapper.textContent = emoji;
			button.appendChild(emojiWrapper);

			this.editBar.appendChild(button);
			button.emojiWrapper = emojiWrapper;
			button.addEventListener('mouseenter', this.editThumbOver.bind(this));
			button.addEventListener('mouseleave', this.editThumbOut.bind(this));
			button.addEventListener('click', this.editThumbClick.bind(this));

			this.borders.push(border);
		}

		// Method to dynamically add a new class
		this.addNewClass = function(className, index) {
			// Update our local references
			this.classNames = GLOBALS.classNames;
			
			let emoji = this.defaultEmojis[index] ? this.defaultEmojis[index][0] : '😀';
			this.emojis[index] = emoji;

			let button = document.createElement('div');
			button.classList.add('emoji__thumb');
			button.id = className;
			button.index = index;
			button.emoji = emoji;

			let border = document.createElement('div');
			border.classList.add('emoji__thumb-border');
			border.classList.add(`emoji__thumb-border--${className}`);
			button.appendChild(border);

			let emojiWrapper = document.createElement('div');
			emojiWrapper.classList.add('emoji__thumb-emoji-wrapper');
			emojiWrapper.textContent = emoji;
			button.appendChild(emojiWrapper);

			this.editBar.appendChild(button);
			button.emojiWrapper = emojiWrapper;
			button.addEventListener('mouseenter', this.editThumbOver.bind(this));
			button.addEventListener('mouseleave', this.editThumbOut.bind(this));
			button.addEventListener('click', this.editThumbClick.bind(this));

			this.borders.push(border);
		}.bind(this);

		this.editViewer = document.createElement('div');
		this.editViewer.classList.add('emoji__edit-viewer');
		
		// Create canvas for displaying emoji with color overlay
		this.buildCanvas();
		
		this.edit.appendChild(this.editViewer);
		this.edit.appendChild(this.editBar);

		this.search = document.createElement('div');
		this.search.classList.add('emoji__search');
		this.search.style.display = 'none';
		this.searchBar = document.createElement('div');
		this.searchBar.classList.add('emoji__search-bar');

		this.searchInput = document.createElement('input');
		this.searchInput.setAttribute('placeholder', 'Search emojis');
		this.searchInput.classList.add('emoji__search-input');
		this.searchBar.appendChild(this.searchInput);

		this.searchBackButton = document.createElement('div');
		this.searchBackButton.classList.add('emoji__search-back-button');
		this.searchBar.appendChild(this.searchBackButton);
		this.search.appendChild(this.searchBar);

		this.searchScroll = document.createElement('div');
		this.searchScroll.classList.add('emoji__search-scroll');
		this.search.appendChild(this.searchScroll);

		this.searchScrollContent = document.createElement('div');
		this.searchScrollContent.classList.add('emoji__search-scroll-content');

		this.searchResults = document.createElement('div');
		this.searchResults.classList.add('emoji__search-results');
		
		this.leftColumn = document.createElement('div');
		this.leftColumn.classList.add('emoji__search-column');
		this.searchResults.appendChild(this.leftColumn);

		this.rightColumn = document.createElement('div');
		this.rightColumn.classList.add('emoji__search-column');
		this.searchResults.appendChild(this.rightColumn);

		this.searchScrollContent.appendChild(this.searchResults);
		this.searchScroll.appendChild(this.searchScrollContent);

		this.edit.appendChild(this.search);
		this.element.appendChild(this.edit);

		// Available emoji categories
		this.emojiCategories = {
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
	}

	buildCanvas() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.canvas.width = 340;
		this.canvas.height = 260;
		this.canvas.classList.add('emoji__canvas');
		this.editViewer.appendChild(this.canvas);
	}

	updateCanvas(emoji, colorId) {
		// Clear canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		// Get color for the class
		let color = '#2baa5e';
		const className = GLOBALS.classNames[colorId];
		if (className && GLOBALS.colors[className]) {
			color = GLOBALS.colors[className];
		}else {
			switch (colorId) {
				case 0:
					color = '#2baa5e';
					break;
				case 1:
					color = '#c95ac5';
					break;
				case 2:
					color = '#dd4d31';
					break;
				case 3:
					color = '#fbbc04';
					break;
				default:
					color = '#2baa5e';
					break;
			}
		}

		// Fill background with white
		this.context.fillStyle = '#ffffff';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw emoji
		this.context.font = '120px serif';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillStyle = '#000000';
		this.context.fillText(emoji, this.canvas.width / 2, this.canvas.height / 2);

		// Apply color overlay
		this.context.globalCompositeOperation = 'screen';
		this.context.fillStyle = color;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.globalCompositeOperation = 'source-over';
	}

	editThumbOver(event) {
		let emoji = event.target.emoji;
		this.updateCanvas(emoji, event.target.index);
	}

	editThumbOut(event) {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = '#ededee';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	editThumbClick(event) {
		this.showSearch(event);
	}

	selectEmoji(event) {
		let index = this.currentClass.index;
		let emoji = event.currentTarget.textContent;
		
		this.emojis[index] = emoji;
		this.currentClass.emoji = emoji;
		this.currentClass.emojiWrapper.textContent = emoji;
		this.hideSearch();
	}

	displaySearchResults(category) {
		this.leftColumn.innerHTML = '';
		this.rightColumn.innerHTML = '';
		
		let emojis = this.emojiCategories[category] || this.emojiCategories.faces;
		let column = this.leftColumn;

		for (let index = 0; index < emojis.length; index += 1) {
			let emojiElement = document.createElement('div');
			emojiElement.classList.add('emoji__search-item');
			emojiElement.textContent = emojis[index];
			emojiElement.style.fontSize = '30px';
			emojiElement.style.padding = '10px';
			emojiElement.style.cursor = 'pointer';
			emojiElement.style.textAlign = 'center';

			if (index % 2 === 0) {
				column = this.leftColumn;
			}else {
				column = this.rightColumn;
			}

			emojiElement.addEventListener('click', this.selectEmoji.bind(this));
			column.appendChild(emojiElement);
		}
	}

	// Helper method to determine category based on search term
	getCategoryFromSearchTerm(value) {
		const categoryMap = {
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
		
		for (const term in categoryMap) {
			if (value.includes(term)) {
				return categoryMap[term];
			}
		}
		
		return 'faces';
	}
	
	// Helper method to get default category based on current class
	getDefaultCategory() {
		if (!this.currentClass) {
			return 'faces';
		}
		
		const className = this.currentClass.id;
		const colorCategories = {
			'green': 'green',
			'purple': 'purple',
			'orange': 'orange',
			'yellow': 'yellow'
		};
		
		return colorCategories[className] || 'faces';
	}

	searchKeyUp(event) {
		const value = this.searchInput.value.toLowerCase();
		let category = 'faces';
		
		if (value.length > 0) {
			category = this.getCategoryFromSearchTerm(value);
		}else {
			category = this.getDefaultCategory();
		}
		
		this.displaySearchResults(category);
	}

	showSearch(event) {
		let id = event.currentTarget.getAttribute('id');
		this.currentClass = event.currentTarget;

		this.leftColumn.innerHTML = '';
		this.rightColumn.innerHTML = '';

		this.search.style.display = 'block';
		this.searchInput.className = 'emoji__search-input';
		this.searchInput.classList.add(`emoji__search-input--${id}`);
		this.searchBackButton.className = 'emoji__search-back-button';
		this.searchBackButton.classList.add(`emoji__search-back-button--${id}`);
		this.searchInput.focus();
		this.searchInput.value = '';
		
		// Show appropriate color category by default
		let defaultCategory = id;
		if (this.emojiCategories[id]) {
			defaultCategory = id; 
		}else {
			defaultCategory = 'faces'; 
		}
		
		// Show default emojis based on class color
		this.displaySearchResults(defaultCategory);
	}

	hideSearch() {
		this.search.style.display = 'none';
	}

	trigger(index) {
		if (!GLOBALS.clearing) {
			this.currentIndex = index;

			if (this.currentBorder && this.currentClassName) {
				this.currentBorder.classList.remove(`emoji__thumb-border--${this.currentClassName}-selected`);
			}

			let border = this.borders[index];
			let id = this.classNames[index];
			this.currentBorder = border;
			this.currentClassName = id;
			this.currentBorder.classList.add(`emoji__thumb-border--${this.currentClassName}-selected`);

			let emoji = this.emojis[this.currentIndex];
			this.updateCanvas(emoji, index);
		}

		if (GLOBALS.clearing) {
			this.currentBorder.classList.remove(`emoji__thumb-border--${this.currentClassName}-selected`);
		}
	}

	stop() {
		this.element.style.display = 'none';
		this.searchInput.removeEventListener('keyup', this.searchKeyUp.bind(this));
		this.searchBackButton.removeEventListener('click', this.hideSearch.bind(this));
	}

	start() {
		this.element.style.display = 'block';
		this.searchInput.addEventListener('keyup', this.searchKeyUp.bind(this));
		this.searchBackButton.addEventListener('click', this.hideSearch.bind(this));
	}
}
import GLOBALS from './../config.js';

export default EmojiOutput;