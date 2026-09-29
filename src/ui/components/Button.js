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

// Flat, CSS-drawn button. The markup is wrapped once in a .button__label span
// (callers query `.button__label` for their icons/text) and is never rebuilt,
// so nothing is lost on resize. Visual press state is the .button--pressed
// class; everything else (colour, size, radius) lives in style/buttons.styl.
//
// Public API kept from the old 3D button: element, label, content, selected,
// select(), deselect(), down(), up(), mousedown(), mouseup(), click(),
// setText(), size(), html().

const PRESSED_CLASS = 'button--pressed';
const SELECTED_CLASS = 'button__toggle--selected';
const DISABLED_CLASSES = [
	'button--disabled',
	'disabled',
	'recording-start__button--disabled'
];

class Button {

	constructor(element) {
		this.element = element;
		this.selected = false;
		this.isToggle = element.classList.contains('button__toggle');
		this.isNativeButton = element.tagName === 'BUTTON';

		this.wrapLabel();

		if (!this.isNativeButton && !element.hasAttribute('role')) {
			element.setAttribute('role', 'button');
		}

		element.addEventListener('mousedown', this.mousedown.bind(this));
		element.addEventListener('mouseup', this.mouseup.bind(this));
		element.addEventListener('mouseleave', this.mouseup.bind(this));
		// Touch: keep the old contract (no synthetic click after a touch;
		// callers that care listen to touchend as well as click).
		element.addEventListener('touchstart', this.mousedown.bind(this), {passive: false});
		element.addEventListener('touchend', this.mouseup.bind(this));
		element.addEventListener('touchcancel', this.mouseup.bind(this));
		element.addEventListener('click', this.click.bind(this));
		element.addEventListener('keydown', this.keydown.bind(this));
		element.addEventListener('keyup', this.keyup.bind(this));
		element.addEventListener('blur', this.up.bind(this));

		this.syncDisabled();
		if (window.MutationObserver) {
			this.observer = new MutationObserver(this.syncDisabled.bind(this));
			this.observer.observe(element, {
				attributes: true,
				attributeFilter: ['class']
			});
		}
	}

	wrapLabel() {
		let label = this.element.querySelector('.button__label');

		if (!label) {
			label = document.createElement('span');
			label.classList.add('button__label');
			while (this.element.firstChild) {
				label.appendChild(this.element.firstChild);
			}
			this.element.appendChild(label);
		}

		this.label = label;
		this.content = label;
	}

	syncDisabled() {
		let isDisabled = DISABLED_CLASSES.some((className) => this.element.classList.contains(className));

		if (isDisabled) {
			this.element.setAttribute('aria-disabled', 'true');
		}else {
			this.element.removeAttribute('aria-disabled');
		}
	}

	click(event) {
		event.preventDefault();
	}

	keydown(event) {
		if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
			this.down();
		}
		// Space on an <a role="button"> doesn't activate it natively.
		if (!this.isNativeButton && (event.key === ' ' || event.key === 'Spacebar')) {
			event.preventDefault();
		}
	}

	keyup(event) {
		let isSpace = event.key === ' ' || event.key === 'Spacebar';

		if (isSpace || event.key === 'Enter') {
			this.up();
		}
		if (!this.isNativeButton && isSpace) {
			event.preventDefault();
			this.element.click();
		}
	}

	select() {
		this.element.classList.add(SELECTED_CLASS);
		this.element.setAttribute('aria-pressed', 'true');
		this.selected = true;
		this.down();
	}

	deselect() {
		this.element.classList.remove(SELECTED_CLASS);
		this.element.setAttribute('aria-pressed', 'false');
		this.selected = false;
		this.up();
	}

	mousedown(event) {
		if (event && event.type === 'touchstart') {
			event.preventDefault();
		}
		this.down();
	}

	mouseup() {
		if (this.selected) {
			return;
		}
		this.up();
	}

	down() {
		this.element.classList.add(PRESSED_CLASS);
	}

	up() {
		if (this.selected) {
			return;
		}
		this.element.classList.remove(PRESSED_CLASS);
	}

	html() {
		return this.element;
	}

	setText(text) {
		let target = this.label.children[0] || this.label;
		target.innerHTML = text;
	}

	// Layout is pure CSS now; kept so existing callers don't break.
	size() {
		return this;
	}
}

export default Button;