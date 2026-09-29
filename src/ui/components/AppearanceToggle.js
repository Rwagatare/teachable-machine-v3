// Appearance setting: a System / Light / Dark segmented control, marked up as
// a radio group (roving tabindex, arrow keys move and select). System comes
// first and is the default, so anyone who never touches it follows the OS.
//
// Mount points in html/index.html carry data-appearance-toggle; the value
// "compact" gives an icon-only control. AppearanceToggle.mountAll() builds one
// control per mount point and keeps them all in sync through Theme.
// Styles: style/components/appearance.styl.

const SVG_OPEN = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">';

const OPTIONS = [
	{
		value: 'system',
		label: 'System',
		icon: SVG_OPEN + '<circle cx="10" cy="10" r="7"/><path d="M10 3a7 7 0 0 0 0 14z" fill="currentColor" stroke="none"/></svg>'
	},
	{
		value: 'light',
		label: 'Light',
		icon: SVG_OPEN + '<circle cx="10" cy="10" r="3.3"/><path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></svg>'
	},
	{
		value: 'dark',
		label: 'Dark',
		icon: SVG_OPEN + '<path d="M16.8 12.4A7.2 7.2 0 1 1 7.6 3.2a7.6 7.6 0 0 0 9.2 9.2z"/></svg>'
	}
];

const STORAGE_KEY = 'appearance';

class AppearanceToggle {

	constructor(element) {
		this.element = element;
		this.compact = element.getAttribute('data-appearance-toggle') === 'compact';
		this.options = [];

		this.render();
		this.update();
		Theme.onAppearanceChange(this.update.bind(this));
	}

	static mountAll() {
		let mounts = document.querySelectorAll('[data-appearance-toggle]');
		let toggles = [];
		for (let index = 0; index < mounts.length; index += 1) {
			toggles.push(new AppearanceToggle(mounts[index]));
		}

		// Follow a choice made in another tab or window.
		window.addEventListener('storage', (event) => {
			if (event.key === STORAGE_KEY || event.key === null) {
				Theme.setAppearance(event.newValue || 'system');
			}
		});

		return toggles;
	}

	render() {
		let element = this.element;
		element.classList.add('appearance-toggle');
		if (this.compact) {
			element.classList.add('appearance-toggle--compact');
		}
		element.setAttribute('role', 'radiogroup');
		element.setAttribute('aria-label', 'Appearance');
		element.innerHTML = '';

		OPTIONS.forEach((option) => {
			let button = document.createElement('button');
			button.type = 'button';
			button.className = 'appearance-toggle__option';
			button.setAttribute('role', 'radio');
			button.setAttribute('data-value', option.value);
			if (this.compact) {
				button.title = option.label;
			}
			button.innerHTML = option.icon + '<span class="appearance-toggle__label" data-label="' + option.label + '">' + option.label + '</span>';

			button.addEventListener('click', () => {
				Theme.setAppearance(option.value);
			});
			button.addEventListener('keydown', this.keyDown.bind(this));

			element.appendChild(button);
			this.options.push(button);
		});
	}

	// Reflects the current choice: aria-checked and the roving tabindex.
	update() {
		let current = Theme.getAppearance();
		this.options.forEach((button) => {
			let checked = button.getAttribute('data-value') === current;
			button.setAttribute('aria-checked', checked ? 'true' : 'false');
			button.setAttribute('tabindex', checked ? '0' : '-1');
		});
	}

	// Arrow keys move to the previous/next option and select it (wrapping), as
	// in a native radio group; Home/End go to the first/last.
	keyDown(event) {
		let index = this.options.indexOf(event.currentTarget);
		let last = this.options.length - 1;
		let next = -1;

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
			case 'Right':
			case 'Down':
				next = index === last ? 0 : index + 1;
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'Left':
			case 'Up':
				next = index === 0 ? last : index - 1;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = last;
				break;
			default:
				break;
		}

		if (next > -1) {
			event.preventDefault();
			Theme.setAppearance(this.options[next].getAttribute('data-value'));
			this.options[next].focus();
		}
	}
}

import Theme from './Theme.js';

export default AppearanceToggle;