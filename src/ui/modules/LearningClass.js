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

// Examples per class we ask people to collect (shown as calibration progress).
// Matches the tutorial's threshold in Wizard.js.
const EXAMPLE_GOAL = 30;
const DECAY_DELAY = 500;
const CHECK_ICON = '<svg class="icon-check" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-7"/></svg>';

function isHoldKey(event) {
	return event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter';
}

function displayName(id) {
	return id.charAt(0).toUpperCase() + id.slice(1);
}

class LearningClass {
	constructor(options) {
		this.element = options.element;
		this.section = options.section;
		this.canvas = this.element.querySelector('canvas.examples__viewer');
		this.canvas.width = 98;
		this.canvas.height = 98;
		this.context = this.canvas.getContext('2d');

		this.id = this.element.getAttribute('id');
		this.name = displayName(this.id);
		this.index = options.index;
		this.color = options.color;
		this.rgbaColor = options.rgbaColor;
		this.isTraining = false;
		this.detected = false;

		this.button = new Button(this.element.querySelector('.button--record'));
		this.button.element.setAttribute('aria-pressed', 'false');
		this.bindHold(this.button.element);

		this.resetLink = this.element.querySelector('.link--reset');
		this.resetLink.addEventListener('click', this.resetClass.bind(this));

		this.exampleCounterElement = this.element.querySelector('.examples__counter');
		this.exampleGoalElement = this.element.querySelector('.examples__goal');
		this.exampleReadyElement = this.element.querySelector('.examples__ready');
		this.exampleProgressElement = this.element.querySelector('.examples__progress-fill');
		this.exampleCounter = 0;

		this.percentage = 0;
		this.renderedPercentage = -1;
		this.meterElement = this.element.querySelector('.machine__meter');
		this.percentageElement = this.element.querySelector('.machine__value');
		this.percentageText = this.element.querySelector('.machine__percentage');
		this.badgeElement = this.element.querySelector('.learning__class-badge');

		this.createArrows();
		this.syncDisabled();
		this.renderExamples();
		this.updatePercentage();
	}

	// Markup for a class card. The three default classes are in index.html
	// with the same structure; keep both in sync.
	static createElement(id) {
		let name = displayName(id);
		let element = document.createElement('div');

		element.id = id;
		element.className = `learning__class learning__class--${id}`;
		element.setAttribute('role', 'group');
		element.setAttribute('aria-labelledby', `${id}-name`);
		element.innerHTML = `
			<div class="learning__class-header">
				<h3 class="learning__class-name" id="${id}-name">${name}</h3>
				<span class="learning__class-badge" hidden>${CHECK_ICON}Detected</span>
				<button type="button" class="link--reset" aria-label="Reset ${name}" hidden>Reset</button>
			</div>
			<div class="examples">
				<div class="examples__wrapper">
					<canvas class="examples__viewer" aria-hidden="true"></canvas>
				</div>
				<div class="examples__info">
					<p class="machine__status examples__status"><span class="examples__counter">0</span><span class="examples__goal"> of ${EXAMPLE_GOAL} examples</span><span class="examples__ready" hidden>${CHECK_ICON}Ready</span></p>
					<div class="examples__progress" aria-hidden="true"><div class="examples__progress-fill"></div></div>
					<div class="confidence">
						<div class="confidence__header" aria-hidden="true">
							<span class="machine__status confidence__status">Confidence</span>
							<span class="machine__percentage">0%</span>
						</div>
						<div class="machine__meter" role="meter" aria-label="${name} confidence" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0%">
							<div class="machine__value machine__value--color-${id}"></div>
						</div>
					</div>
				</div>
			</div>
			<button type="button" class="button button--record button--color-${id}" aria-pressed="false" aria-describedby="learning-hold-hint"><span class="button__content">Train ${name}</span></button>`;

		return element;
	}

	createArrows() {
		this.arrow = new HighlightArrow(3);
		this.arrow.element.style.left = 100 + '%';
		this.arrow.element.style.top = 100 + '%';
		this.arrow.element.width = 60;
		TweenMax.set(this.arrow.element, {
			rotation: 90,
			scale: 1,
			x: 10,
			y: -75
		});
		this.element.appendChild(this.arrow.element);

		this.arrowX = new HighlightArrow(2);
		this.arrowX.element.style.left = 0 + '%';
		this.arrowX.element.style.top = 0 + '%';
		this.arrowX.element.width = 60;
		TweenMax.set(this.arrowX.element, {
			rotation: -90,
			scaleX: -0.8,
			scaleY: 0.8,
			x: 37,
			y: -30
		});
		this.element.appendChild(this.arrowX.element);
	}

	// Hold-to-train with any input: pointer (mouse, touch, pen) with pointer
	// capture, or holding Space/Enter while the button has focus.
	bindHold(button) {
		let release = this.buttonUp.bind(this);

		if (window.PointerEvent) {
			button.addEventListener('pointerdown', this.pointerDown.bind(this));
			button.addEventListener('pointerup', release);
			button.addEventListener('pointercancel', release);
			button.addEventListener('pointerleave', release);
			button.addEventListener('lostpointercapture', release);
		}else {
			button.addEventListener('mousedown', this.buttonDown.bind(this));
			button.addEventListener('touchstart', this.buttonDown.bind(this));
			button.addEventListener('touchend', release);
			button.addEventListener('touchcancel', release);
			window.addEventListener('mouseup', release);
		}

		button.addEventListener('keydown', this.keyDown.bind(this));
		button.addEventListener('keyup', this.keyUp.bind(this));
		button.addEventListener('blur', release);
		button.addEventListener('contextmenu', (event) => {
			event.preventDefault();
		});
		window.addEventListener('blur', release);
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				release();
			}
		});
	}

	pointerDown(event) {
		if (event.button > 0) {
			return;
		}
		event.preventDefault();
		if (event.currentTarget.setPointerCapture) {
			try {
				event.currentTarget.setPointerCapture(event.pointerId);
			}catch (error) {
				this.captureError = error;
			}
		}
		this.buttonDown();
	}

	keyDown(event) {
		if (!isHoldKey(event)) {
			return;
		}
		// Stops Enter from clicking and Space from scrolling.
		event.preventDefault();
		if (event.repeat) {
			return;
		}
		this.buttonDown();
	}

	keyUp(event) {
		if (isHoldKey(event)) {
			event.preventDefault();
			this.buttonUp();
		}
	}

	isInteractive() {
		return !this.element.classList.contains('learning__class--disabled') &&
			!this.section.element.classList.contains('section--disabled');
	}

	// Keeps keyboard users out of classes the tutorial hasn't unlocked yet.
	syncDisabled() {
		this.button.element.disabled = !this.isInteractive();
	}

	hide() {
		this.element.style.display = 'none';
	}

	show() {
		this.element.style.display = '';
	}

	highlight() {
		this.arrow.show();
		if (!Theme.prefersReducedMotion()) {
			TweenMax.from(this.arrow.element, 0.3, {
				opacity: 0,
				x: 40
			});
		}
	}

	dehighlight() {
		TweenMax.killTweensOf(this.arrow.element);
		this.arrow.hide();
	}

	highlightX() {
		this.arrowX.show();
		if (!Theme.prefersReducedMotion()) {
			TweenMax.from(this.arrowX.element, 0.3, {opacity: 0});
		}
	}

	dehighlightX() {
		TweenMax.killTweensOf(this.arrowX.element);
		this.arrowX.hide();
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.setSamples(0);
		if (GLOBALS.nowPlaying) {
			GLOBALS.nowPlaying.classCleared(this.id);
		}
	}

	resetClass(event) {
		event.preventDefault();
		GLOBALS.inputSection.resetClass(this.index);
		this.clear();
		// The Reset button hides itself; keep focus in the card.
		this.button.element.focus();
		this.section.announce(`${this.name} examples cleared.`);
	}

	setSamples(length) {
		this.exampleCounter = length;

		let recommendedNumSamples = (GLOBALS.inputType === 'cam') ? 30 : 10;

		if (this.exampleCounter >= recommendedNumSamples && GLOBALS.classesTrained[this.id] === false) {
			GLOBALS.classesTrained[this.id] = true;
		}

		this.renderExamples();
	}

	renderExamples() {
		let count = this.exampleCounter;
		let ready = count >= EXAMPLE_GOAL;
		let progress = Math.min(count / EXAMPLE_GOAL, 1);

		this.exampleCounterElement.textContent = count;
		this.exampleGoalElement.textContent = ready ? ' examples' : ` of ${EXAMPLE_GOAL} examples`;
		this.exampleReadyElement.hidden = !ready;
		this.exampleProgressElement.style.transform = `scaleX(${progress})`;
		this.element.classList.toggle('learning__class--ready', ready);
		this.resetLink.hidden = count === 0;
	}

	examplesSummary() {
		if (this.exampleCounter >= EXAMPLE_GOAL) {
			return `${this.name}: ${this.exampleCounter} examples. Ready.`;
		}

		return `${this.name}: ${this.exampleCounter} of ${EXAMPLE_GOAL} examples.`;
	}

	setConfidence(percentage) {
		if (GLOBALS.clearing) {
			return;
		}
		if (GLOBALS.recordSection && GLOBALS.recordSection.setMeters) {
			GLOBALS.recordSection.setMeters(this.id, percentage);
		}
		this.percentage = percentage;
		this.updatePercentage();

		// Fall back to 0 if predictions stop arriving (e.g. while training).
		clearTimeout(this.decayTimer);
		if (percentage > 0) {
			this.decayTimer = setTimeout(() => {
				this.setConfidence(0);
			}, DECAY_DELAY);
		}
	}

	highlightConfidence() {
		if (this.detected) {
			return;
		}
		this.detected = true;
		this.element.classList.add('learning__class--detected');
		this.badgeElement.hidden = false;
	}

	dehighlightConfidence() {
		if (!this.detected) {
			return;
		}
		this.detected = false;
		this.element.classList.remove('learning__class--detected');
		this.badgeElement.hidden = true;
	}

	buttonDown() {
		if (this.isTraining || !this.isInteractive()) {
			return;
		}
		this.isTraining = true;
		this.button.down();
		this.button.setText('Training…');
		this.button.element.setAttribute('aria-pressed', 'true');
		this.element.classList.add('learning__class--training');
		this.section.startRecording(this.index);

		GLOBALS.recording = true;
		GLOBALS.classId = this.id;

		GLOBALS.outputSection.toggleSoundOutput(false);
		clearTimeout(this.buttonClickTimeout);
		this.buttonClickTimeout = setTimeout(() => {
			GLOBALS.webcamClassifier.buttonDown(this.id, this.canvas, this);
		}, 100);

		gtag('event', 'training', {'id': this.index});
	}

	buttonUp() {
		if (!this.isTraining) {
			return;
		}
		this.isTraining = false;
		this.button.setText(`Train ${this.name}`);
		this.button.element.setAttribute('aria-pressed', 'false');
		this.element.classList.remove('learning__class--training');
		this.section.stopRecording();
		clearTimeout(this.buttonClickTimeout);
		this.button.up();

		GLOBALS.classId = null;
		GLOBALS.recording = false;

		GLOBALS.outputSection.toggleSoundOutput(true);

		GLOBALS.webcamClassifier.buttonUp(this.id, this.canvas);

		if (this.exampleCounter > 0) {
			this.section.announce(this.examplesSummary());

			let event = new CustomEvent('class-trained', {
				detail: {
					id: this.id,
					numSamples: this.exampleCounter
				}
			});
			window.dispatchEvent(event);
		}
	}

	updatePercentage() {
		let rounded = Math.max(0, Math.min(100, Math.floor(this.percentage)));

		if (rounded === this.renderedPercentage) {
			return;
		}
		this.renderedPercentage = rounded;
		this.percentageElement.style.transform = `scaleX(${rounded / 100})`;
		this.percentageText.textContent = rounded + '%';
		this.meterElement.setAttribute('aria-valuenow', rounded);
		this.meterElement.setAttribute('aria-valuetext', rounded + '%');
	}

	// Layout is pure CSS now; kept for callers.
	size() {
		return this;
	}

	start() {
		this.size();
	}
}

import GLOBALS from './../../config.js';
import TweenMax from 'gsap';
import Button from './../components/Button.js';
import HighlightArrow from './../components/HighlightArrow.js';
import Theme from './../components/Theme.js';

export default LearningClass;