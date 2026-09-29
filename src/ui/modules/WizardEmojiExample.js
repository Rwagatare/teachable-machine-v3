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

class WizardEmojiExample {
	constructor(emoji) {
		this.element = document.createElement('div');
		this.element.classList.add('wizard__emoji');
		// Visual hint only; the tutorial captions carry the instructions.
		this.element.setAttribute('aria-hidden', 'true');

		let mask = document.createElement('div');
		mask.classList.add('wizard__emoji-mask');

		let emojiElement = document.createElement('div');
		emojiElement.classList.add('wizard__emoji-element');
		emojiElement.textContent = emoji;
		mask.appendChild(emojiElement);

		this.element.appendChild(mask);
	}

	show() {
		this.element.style.display = 'block';
	}

	hide() {
		this.element.style.display = 'none';
	}
}

export default WizardEmojiExample;