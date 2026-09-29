// Reads the design tokens defined in style/tokens.styl so that canvas drawing
// and inline styles follow the same palette as the CSS, including dark mode
// and increased contrast. CSS custom properties are the source of truth;
// GLOBALS.colors is only a fallback for when the stylesheet hasn't loaded.
//
// Appearance: 'system' (default, follows the OS), 'light' or 'dark'. A forced
// choice is stored in localStorage and shown as <html data-appearance="...">,
// which the tokens key off. The inline script in html/index.html applies the
// stored choice before the stylesheet loads, so there's no flash; keep its
// storage key and colours in sync with the constants below.

const APPEARANCE_QUERIES = [
	'(prefers-color-scheme: dark)',
	'(prefers-contrast: more)'
];

const APPEARANCE_STORAGE_KEY = 'appearance';
const APPEARANCE_EVENT = 'appearancechange';
const APPEARANCES = [
	'system',
	'light',
	'dark'
];

// Matches --color-bg in each appearance (and the theme-color metas).
const THEME_COLORS = {
	light: '#F2F2F7',
	dark: '#000000'
};

function eachElement(selector, visit) {
	let elements = document.querySelectorAll(selector);
	for (let index = 0; index < elements.length; index += 1) {
		visit(elements[index]);
	}
}

// Points the browser UI (theme-color) and native controls (color-scheme meta)
// at the effective appearance. For 'system' the media-qualified metas go back
// to their own colour.
function applyAppearanceMetas(appearance) {
	eachElement('meta[name="theme-color"]', (meta) => {
		let media = meta.getAttribute('media') || '';
		let metaAppearance = media.indexOf('dark') === -1 ? 'light' : 'dark';
		let color = THEME_COLORS[appearance] || THEME_COLORS[metaAppearance];

		meta.setAttribute('content', color);
	});

	eachElement('meta[name="color-scheme"]', (meta) => {
		meta.setAttribute('content', appearance === 'system' ? 'light dark' : appearance);
	});
}

let Theme = {
	APPEARANCES: APPEARANCES,

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

	// The person's choice: 'system', 'light' or 'dark'.
	getAppearance() {
		let value = document.documentElement.getAttribute('data-appearance');

		return value === 'light' || value === 'dark' ? value : 'system';
	},

	// Applies and remembers a choice, then notifies onAppearanceChange
	// subscribers. Unknown values fall back to 'system'.
	setAppearance(value) {
		let appearance = APPEARANCES.indexOf(value) === -1 ? 'system' : value;

		try {
			if (appearance === 'system') {
				localStorage.removeItem(APPEARANCE_STORAGE_KEY);
			}else {
				localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
			}
		}catch (error) {
			// Storage can be unavailable (private mode, blocked site data); the
			// choice still applies for this page.
		}

		if (appearance === 'system') {
			document.documentElement.removeAttribute('data-appearance');
		}else {
			document.documentElement.setAttribute('data-appearance', appearance);
		}
		applyAppearanceMetas(appearance);

		let event = document.createEvent('CustomEvent');
		event.initCustomEvent(APPEARANCE_EVENT, false, false, {appearance: appearance});
		document.dispatchEvent(event);

		return appearance;
	},

	// Whether the page is currently dark, taking the in-app choice into account.
	isDark() {
		let appearance = Theme.getAppearance();
		if (appearance !== 'system') {
			return appearance === 'dark';
		}

		return Boolean(window.matchMedia && window.matchMedia(APPEARANCE_QUERIES[0]).matches);
	},

	prefersReducedMotion() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	},

	// Calls callback whenever appearance or contrast changes (OS setting or the
	// in-app choice), so canvases can repaint. Returns a function that removes
	// the listeners.
	onAppearanceChange(callback) {
		let lists = [];
		if (window.matchMedia) {
			lists = APPEARANCE_QUERIES.map((query) => window.matchMedia(query));
		}
		lists.forEach((list) => {
			if (list.addEventListener) {
				list.addEventListener('change', callback);
			}else {
				list.addListener(callback);
			}
		});
		document.addEventListener(APPEARANCE_EVENT, callback);

		return () => {
			lists.forEach((list) => {
				if (list.removeEventListener) {
					list.removeEventListener('change', callback);
				}else {
					list.removeListener(callback);
				}
			});
			document.removeEventListener(APPEARANCE_EVENT, callback);
		};
	}
};

import GLOBALS from './../../config.js';

export default Theme;