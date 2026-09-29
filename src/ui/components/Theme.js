// Reads the design tokens defined in style/tokens.styl so that canvas drawing
// and inline styles follow the same palette as the CSS, including dark mode
// and increased contrast. CSS custom properties are the source of truth;
// GLOBALS.colors is only a fallback for when the stylesheet hasn't loaded.

const APPEARANCE_QUERIES = [
	'(prefers-color-scheme: dark)',
	'(prefers-contrast: more)'
];

let Theme = {
	token(name, fallback) {
		let styles = getComputedStyle(document.documentElement);
		let value = styles.getPropertyValue(name);

		value = value.trim();

		return value || fallback;
	},

	classColor(id) {
		return Theme.token('--class-' + id, GLOBALS.colors[id]);
	},

	classTint(id) {
		return Theme.token('--class-' + id + '-tint', GLOBALS.rgbaColors[id]);
	},

	// Text color to place on top of a solid class color fill.
	classOnColor(id) {
		return Theme.token('--class-' + id + '-on', '#ffffff');
	},

	isDark() {
		return window.matchMedia && window.matchMedia(APPEARANCE_QUERIES[0]).matches;
	},

	prefersReducedMotion() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	},

	// Calls callback whenever appearance or contrast changes, so canvases can
	// repaint. Returns a function that removes the listeners.
	onAppearanceChange(callback) {
		if (!window.matchMedia) {
			return function() {
				return false;
			};
		}
		let lists = APPEARANCE_QUERIES.map((query) => window.matchMedia(query));
		lists.forEach((list) => {
			if (list.addEventListener) {
				list.addEventListener('change', callback);
			}else {
				list.addListener(callback);
			}
		});

		return () => {
			lists.forEach((list) => {
				if (list.removeEventListener) {
					list.removeEventListener('change', callback);
				}else {
					list.removeListener(callback);
				}
			});
		};
	}
};

import GLOBALS from './../../config.js';

export default Theme;