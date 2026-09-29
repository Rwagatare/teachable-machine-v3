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

// The machine's wires, drawn as SVG measured from the real layout. Colours
// are CSS custom properties (style/components/machine.styl: --wire-neutral and
// --class-*), so they follow dark mode / increased contrast without repainting,
// and reduced motion is handled in CSS.
//
// The wires element decides the orientation: taller than wide (wide layout,
// columns side by side) runs the wires left to right; wider than tall (stacked
// layout) runs them top to bottom.

const SVG_NS = 'http://www.w3.org/2000/svg';
const SOURCE_SPREAD = 4;
const FAN_STEP = 72;

function createSvgElement(name, attributes) {
	let node = document.createElementNS(SVG_NS, name);

	Object.keys(attributes).forEach((key) => {
		node.setAttribute(key, attributes[key]);
	});

	return node;
}

function getClassCards() {
	return Array.from(document.querySelectorAll('#learning-section .learning__class'));
}

// Centre of the first visible element matching one of the selectors inside
// root (or of root itself), relative to origin.
function anchorPoint(root, selectors, origin) {
	let candidates = selectors.map((selector) => root.querySelector(selector));
	candidates.push(root);

	for (let index = 0; index < candidates.length; index += 1) {
		let candidate = candidates[index];
		let rect = candidate ? candidate.getBoundingClientRect() : null;

		if (rect && rect.width > 0 && rect.height > 0) {
			return {
				x: rect.left + (rect.width / 2) - origin.left,
				y: rect.top + (rect.height / 2) - origin.top,
				top: rect.top
			};
		}
	}

	return null;
}

// X positions for wires in the stacked layout. Uses the cards' real centres
// when they sit in one row; otherwise fans the wires out around the centre.
function stackedPositions(points, width) {
	let tops = points.map((point) => Math.round(point.top));
	let inOneRow = points.length > 1 && Math.max(...tops) - Math.min(...tops) < 4;
	let step = Math.min(FAN_STEP, (width - 32) / Math.max(points.length, 1));

	return points.map((point, index) => {
		if (inOneRow) {
			return point.x;
		}

		return (width / 2) + ((index - ((points.length - 1) / 2)) * step);
	});
}

function observeLayout(targets, callback) {
	let frame = 0;

	function schedule() {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(callback);
	}

	window.addEventListener('resize', schedule);
	window.addEventListener('orientationchange', schedule);

	if (!window.ResizeObserver) {
		return null;
	}

	let observer = new ResizeObserver(schedule);
	targets.forEach((target) => {
		if (target) {
			observer.observe(target);
		}
	});

	return observer;
}

class WiresLeft {
	constructor(element, learningClasses) {
		this.element = element;
		this.learningClasses = learningClasses;
		this.activeIndex = null;
		this.signals = [];

		this.svg = element.querySelector('.wires-svg');
		if (!this.svg) {
			this.svg = createSvgElement('svg', {
				'class': 'wires-svg',
				'aria-hidden': 'true',
				'focusable': 'false'
			});
			element.appendChild(this.svg);
		}

		let targets = [
			element,
			document.querySelector('.machine__sections'),
			document.querySelector('#input-section')
		];
		this.observer = observeLayout(targets.concat(getClassCards()), this.render.bind(this));
		this.render();
	}

	render() {
		let origin = this.element.getBoundingClientRect();
		let width = origin.width;
		let height = origin.height;
		let input = document.querySelector('#input-section');

		if (!width || !height || !input) {
			return;
		}

		let source = anchorPoint(input, ['.input__media'], origin);
		let cards = getClassCards();
		let targetSelectors = [
			'.examples__wrapper',
			'.machine__meter'
		];
		let targets = cards.map((card) => anchorPoint(card, targetSelectors, origin));
		let horizontal = height > width;
		let stackedX = horizontal ? [] : stackedPositions(targets.filter(Boolean), width);

		this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		while (this.svg.firstChild) {
			this.svg.removeChild(this.svg.firstChild);
		}
		this.signals = [];

		if (!source) {
			return;
		}

		let visibleIndex = 0;
		targets.forEach((target, index) => {
			if (!target) {
				return;
			}
			let offset = (index - ((cards.length - 1) / 2)) * SOURCE_SPREAD;
			let path = '';

			if (horizontal) {
				let startY = source.y + offset;
				path = `M0 ${startY} C${width / 2} ${startY} ${width / 2} ${target.y} ${width} ${target.y}`;
			}else {
				let startX = source.x + offset;
				let endX = stackedX[visibleIndex];
				path = `M${startX} 0 C${startX} ${height / 2} ${endX} ${height / 2} ${endX} ${height}`;
			}
			visibleIndex += 1;
			this.addWire(index, path);
		});

		this.updateLit();
	}

	addWire(index, path) {
		let id = GLOBALS.classNames[index] || 'neutral';

		this.svg.appendChild(createSvgElement('path', {
			'class': 'wire',
			'd': path
		}));
		this.signals[index] = createSvgElement('path', {
			'class': `wire-signal wire-signal--flow wire-signal--${id}`,
			'd': path
		});
		this.svg.appendChild(this.signals[index]);
	}

	updateLit() {
		this.signals.forEach((signal, index) => {
			if (signal) {
				signal.classList.toggle('is-lit', index === this.activeIndex);
			}
		});
	}

	// Lights the wire into the class being trained (animated flow unless the
	// person prefers reduced motion, see machine.styl).
	highlight(index) {
		this.activeIndex = index;
		this.updateLit();
	}

	dehighlight() {
		this.activeIndex = null;
		this.updateLit();
	}

	// Kept for callers; drawing is event driven now.
	start() {
		return this;
	}

	stop() {
		return this;
	}

	camMode() {
		this.render();
	}

	size() {
		this.render();
	}

	updateForNewClass() {
		if (this.observer) {
			getClassCards().forEach((card) => {
				this.observer.observe(card);
			});
		}
		this.render();
	}
}

// Shared with WiresRight.js
WiresLeft.anchorPoint = anchorPoint;
WiresLeft.createSvgElement = createSvgElement;
WiresLeft.getClassCards = getClassCards;
WiresLeft.observeLayout = observeLayout;
WiresLeft.stackedPositions = stackedPositions;

import GLOBALS from './../../config.js';

export default WiresLeft;