// Now-playing bar for compact layouts (one column, < 700px wide).
//
// There the Output panel sits below the camera and the class cards, so while
// you train or test the model its response is off screen. This floating bar
// mirrors it, like a music mini player: the detected class and that class's
// output (emoji, phrase or sound). Tapping it scrolls to the Output panel.
//
// It is data only; the #output-status live region already announces changes
// to screen readers, so the bar is a plain button with no live region.
// OutputSection tells it about top-class changes, tab switches and edits.
// Styling lives in style/components/now-playing.styl.

// Matches the compact layout in style/components/machine.styl ($machine-medium).
const COMPACT_QUERY = '(max-width: 699.98px)';

// The panel counts as on screen once this share of it is visible (or of the
// viewport, when the panel is taller than the screen).
const VISIBLE_SHARE = 0.3;
const THRESHOLD_STEPS = 20;

const SVG_OPEN = '<svg class="now-playing__icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" ';

const ICONS = {
	emoji: SVG_OPEN + 'viewBox="0 0 26 26"><circle cx="13" cy="13" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="11" r="1.4"/><circle cx="16" cy="11" r="1.4"/><path d="M9.5 15.5c1.8 2 5.2 2 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
	speech: SVG_OPEN + 'viewBox="0 0 26 26"><path d="M13 4.5c-5 0-9 3.3-9 7.4 0 2.3 1.3 4.4 3.3 5.8L6.5 21.5l4.6-2.3c.6.1 1.3.2 1.9.2 5 0 9-3.3 9-7.4S18 4.5 13 4.5z"/></svg>'
};

const KIND_NAMES = {
	emoji: 'Emoji',
	sound: 'Sound',
	speech: 'Phrase'
};

// IntersectionObserver thresholds 0, 0.05 ... 1
function thresholds() {
	let list = [];
	for (let step = 0; step <= THRESHOLD_STEPS; step += 1) {
		list.push(step / THRESHOLD_STEPS);
	}

	return list;
}

function onMediaChange(list, callback) {
	if (list.addEventListener) {
		list.addEventListener('change', callback);
	}else {
		list.addListener(callback);
	}
}

// Visible text for the output value, and the phrase used in the button name.
function describeValue(data) {
	let kind = KIND_NAMES[data.kind].toLowerCase();

	if (!data.value) {
		return {
			text: `No ${kind}`,
			spoken: `no ${kind}`
		};
	}
	if (data.kind === 'emoji') {
		return {
			text: KIND_NAMES.emoji,
			spoken: data.label
		};
	}
	if (data.kind === 'speech') {
		return {
			text: `“${data.label}”`,
			spoken: `${kind}: ${data.label}`
		};
	}

	return {
		text: data.label,
		spoken: `${kind}: ${data.label}`
	};
}

class NowPlaying {
	constructor(element, target) {
		this.element = element;
		this.target = target;
		this.index = -1;
		this.renderedKey = null;
		this.visible = false;
		this.targetInView = true;

		if (!element || !target || !window.IntersectionObserver || !window.matchMedia) {
			return;
		}

		this.art = element.querySelector('.now-playing__art');
		this.name = element.querySelector('.now-playing__name');
		this.detail = element.querySelector('.now-playing__detail');

		this.sync = this.sync.bind(this);
		this.compact = window.matchMedia(COMPACT_QUERY);
		onMediaChange(this.compact, this.sync);

		// Launch screen (body.no-scroll), recorder (html.recording-open) and the
		// pinned tutorial bar (.wizard--fixed) all take priority over this bar.
		// Skipping the tutorial hides the bar's wrapper with an inline style.
		this.wizard = document.querySelector('#wizard');
		this.mutationObserver = new MutationObserver(this.sync);
		let watched = [
			document.documentElement,
			document.body,
			this.wizard,
			document.querySelector('.wizard__wrapper')
		];
		watched.forEach((node) => {
			if (node) {
				this.mutationObserver.observe(node, {
					attributes: true,
					attributeFilter: [
						'class',
						'style'
					]
				});
			}
		});

		this.intersectionObserver = new IntersectionObserver(this.targetChanged.bind(this), {threshold: thresholds()});
		this.intersectionObserver.observe(target);

		if (window.ResizeObserver) {
			this.resizeObserver = new ResizeObserver(this.measure.bind(this));
			this.resizeObserver.observe(element);
		}

		window.addEventListener('class-trained', this.sync);
		element.addEventListener('click', this.showOutput.bind(this));

		// Present but invisible from here on; .now-playing--visible shows it.
		element.hidden = false;
		this.refresh();
	}

	// The top class, from OutputSection.trigger() every prediction frame.
	// Only a change does any work.
	update(index) {
		if (index === this.index) {
			return;
		}
		this.index = index;
		this.refresh();
	}

	// A class's examples were cleared: forget it until it's detected again.
	classCleared(id) {
		if (this.index > -1 && GLOBALS.classNames[this.index] === id) {
			this.index = -1;
		}
		this.refresh();
	}

	// Re-read the value from the current output (tab switch or an edit).
	refresh() {
		if (!this.compact) {
			return;
		}
		let state = this.state();
		if (state.key !== this.renderedKey) {
			this.renderedKey = state.key;
			this.render(state);
		}
		this.sync();
	}

	state() {
		let section = GLOBALS.outputSection;
		let output = section ? section.currentOutput : null;
		let id = this.index > -1 ? GLOBALS.classNames[this.index] : null;
		let data = null;

		if (id && output && typeof output.nowPlaying === 'function') {
			data = output.nowPlaying(this.index);
		}
		let outputId = output ? output.id : '';
		let kind = data ? data.kind : '';
		let value = data ? data.value : '';

		return {
			id: data ? id : null,
			outputId: outputId,
			data: data,
			key: [
				id,
				outputId,
				kind,
				value
			].join('|')
		};
	}

	render(state) {
		let element = this.element;
		let data = state.data;

		if (!data) {
			element.setAttribute('data-class', 'none');
			element.setAttribute('data-kind', 'none');
			this.name.textContent = 'No class detected';
			this.detail.textContent = '';
			this.art.innerHTML = this.idleIcon(state.outputId);
			element.setAttribute('aria-label', 'Now playing: No class detected. Show output.');

			return;
		}

		let name = OutputUI.classLabel(state.id);
		let value = describeValue(data);
		element.setAttribute('data-class', state.id);
		element.setAttribute('data-kind', data.value ? data.kind : 'none');
		this.name.textContent = name;
		this.detail.textContent = value.text;

		if (data.kind === 'emoji' && data.value) {
			this.art.textContent = data.value;
		}else if (data.kind === 'sound') {
			this.art.innerHTML = OutputUI.icon('speaker');
		}else {
			this.art.innerHTML = ICONS[data.kind] || '';
		}
		element.setAttribute('aria-label', `Now playing: ${name}, ${value.spoken}. Show output.`);
	}

	idleIcon(outputId) {
		if (outputId === 'SoundOutput') {
			return OutputUI.icon('speaker');
		}
		if (outputId === 'SpeechOutput') {
			return ICONS.speech;
		}

		return ICONS.emoji;
	}

	targetChanged(entries) {
		let entry = entries[entries.length - 1];
		let rootHeight = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
		let needed = VISIBLE_SHARE * Math.min(entry.boundingClientRect.height, rootHeight);

		this.targetInView = entry.isIntersecting && entry.intersectionRect.height >= needed;
		this.sync();
	}

	// Nothing to show until a class has examples (or a prediction arrived,
	// e.g. from restored training data).
	hasContent() {
		if (this.index > -1) {
			return true;
		}
		let section = GLOBALS.learningSection;
		let classes = section && section.learningClasses ? section.learningClasses : [];

		return classes.some((learningClass) => learningClass && learningClass.exampleCounter > 0);
	}

	isSuppressed() {
		let wizard = this.wizard;
		let tutorialPinned = Boolean(wizard) && wizard.classList.contains('wizard--fixed') && wizard.getClientRects().length > 0;

		return tutorialPinned ||
			document.body.classList.contains('no-scroll') ||
			document.documentElement.classList.contains('recording-open');
	}

	sync() {
		if (!this.compact) {
			return;
		}
		let show = this.compact.matches && !this.targetInView && !this.isSuppressed() && this.hasContent();

		if (show === this.visible) {
			return;
		}
		this.visible = show;
		if (show) {
			this.measure();
		}
		this.element.classList.toggle('now-playing--visible', show);
		document.body.classList.toggle('has-now-playing', show);
	}

	// Floating chrome (the PWA install pill and iOS banner) and the page's
	// bottom padding clear the bar by this much. It changes with text size.
	measure() {
		let height = this.element.offsetHeight;
		if (height > 0) {
			document.body.style.setProperty('--now-playing-height', `${height}px`);
		}
	}

	showOutput() {
		let tab = this.target.querySelector('.output__segment--selected');
		if (tab) {
			tab.focus({preventScroll: true});
		}
		this.target.scrollIntoView({
			behavior: Theme.prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'start'
		});
	}
}

import GLOBALS from './../../config.js';
import OutputUI from './../../outputs/outputUI.js';
import Theme from './Theme.js';

export default NowPlaying;