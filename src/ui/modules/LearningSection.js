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

// Max classes: the 3 defaults plus one added class (yellow).
const MAX_CLASSES = 4;
const ANNOUNCE_DELAY = 600;

class LearningSection {
	constructor(element) {
		this.element = element;
		let learningClassesElements = element.querySelectorAll('.learning__class');
		this.condenseElement = element.querySelector('#learning-condensed-button');
		this.condenseElement.addEventListener('click', this.condenseSection.bind(this));
		this.liveRegion = element.querySelector('#learning-live');
		this.condensed = false;
		this.topClassId = null;

		this.learningClasses = [];
		let classNames = GLOBALS.classNames;
		let colors = GLOBALS.colors;

		learningClassesElements.forEach((classElement, index) => {
			let id = classNames[index];
			let options = {
				index: index,
				element: classElement,
				section: this,
				color: colors[id],
				rgbaColor: GLOBALS.rgbaColors[id]
			};

			let learningClass = new LearningClass(options);
			learningClass.index = index;
			this.learningClasses[index] = learningClass;
		});

		// this.trainingQuality = new TrainingQuality(element.querySelector('.quality'));

		this.wiresLeft = new WiresLeft(document.querySelector('.wires--left'), learningClassesElements);
		this.wiresRight = new WiresRight(document.querySelector('.wires--right'), learningClassesElements);
		this.highestIndex = null;
		this.currentIndex = null;

		// Add Class button: available at every width.
		this.addClassButton = document.getElementById('add-class-button');
		this.addClassNote = document.getElementById('add-class-note');
		if (this.addClassButton) {
			this.addClassButton.addEventListener('click', this.addNewClass.bind(this));
		}

		this.observeDisabledState();
		this.observeSectionState();

		this.arrow = new HighlightArrow(2);
		TweenMax.set(this.arrow.element, {
			rotation: 90,
			scale: 0.6,
			x: 120,
			y: -175
		});
		this.element.appendChild(this.arrow.element);
	}

	// The tutorial enables/disables classes by toggling CSS classes; mirror
	// that onto the Train buttons so keyboard users can't train locked classes.
	observeDisabledState() {
		let sync = () => {
			this.learningClasses.forEach((learningClass) => {
				learningClass.syncDisabled();
			});
		};

		if (!window.MutationObserver) {
			return;
		}
		this.disabledObserver = new MutationObserver(sync);
		this.disabledObserver.observe(this.element, {
			attributes: true,
			attributeFilter: ['class'],
			subtree: true
		});
	}

	// .section--disabled only blocks the pointer. Mirror it with `inert` so
	// keyboard and screen reader users can't reach controls that don't work
	// yet. Observed (not set in enable/disable) because other modules, e.g.
	// EnhancedWebcamClassifier.js, remove the class directly.
	observeSectionState() {
		let sections = document.querySelectorAll('#input-section, #learning-section, #output-section');

		function sync(section) {
			if (section.classList.contains('section--disabled')) {
				section.setAttribute('inert', '');
			}else {
				section.removeAttribute('inert');
			}
		}

		sections.forEach((section) => {
			sync(section);
			if (window.MutationObserver) {
				let observer = new MutationObserver(() => {
					sync(section);
				});
				observer.observe(section, {
					attributes: true,
					attributeFilter: ['class']
				});
			}
		});
	}

	// Polite screen reader message (one shared live region, never per frame).
	announce(message) {
		if (!this.liveRegion) {
			return;
		}
		if (this.liveRegion.textContent === message) {
			this.liveRegion.textContent = '';
		}
		this.liveRegion.textContent = message;
	}

	// Method to add a new class
	addNewClass(event) {
		event.preventDefault();

		// Get the current number of classes
		const currentClassCount = this.learningClasses.length;

		// Since we only allow 1 additional class, it will always be 'yellow'
		const nextClassName = 'yellow';

		if (currentClassCount >= MAX_CLASSES || GLOBALS.classNames.indexOf(nextClassName) !== -1) {
			this.showMaxClassesNote();

			return;
		}

		// Add yellow to the global configuration
		GLOBALS.classNames.push(nextClassName);
		GLOBALS.classesTrained[nextClassName] = false;
		GLOBALS.numClasses += 1;

		// Add to webcam classifier's images object
		if (GLOBALS.webcamClassifier) {
			// Use the enhanced classifier's addNewClass method if available
			if (GLOBALS.webcamClassifier.addNewClass) {
				GLOBALS.webcamClassifier.addNewClass(nextClassName, currentClassCount);
			}else {
				// Fallback for original classifier
				GLOBALS.webcamClassifier.images[nextClassName] = {
					index: currentClassCount,
					down: false,
					imagesCount: 0,
					images: [],
					latestImages: [],
					latestThumbs: []
				};
			}
		}

		// Create the card for the new class (same markup as index.html)
		const container = this.element.querySelector('.section__container');
		const newClassElement = LearningClass.createElement(nextClassName);
		container.appendChild(newClassElement);

		const options = {
			index: currentClassCount,
			element: newClassElement,
			section: this,
			color: GLOBALS.colors[nextClassName],
			rgbaColor: GLOBALS.rgbaColors[nextClassName]
		};

		const learningClass = new LearningClass(options);
		learningClass.index = currentClassCount;
		learningClass.id = nextClassName;

		// Add to learning classes array
		this.learningClasses[currentClassCount] = learningClass;

		// Initialize and start the new class
		learningClass.start();

		// Update output components to handle the new class
		if (GLOBALS.outputSection && GLOBALS.outputSection.outputs) {
			let outputs = GLOBALS.outputSection.outputs;

			if (outputs.EmojiOutput && outputs.EmojiOutput.addNewClass) {
				outputs.EmojiOutput.addNewClass(nextClassName, currentClassCount);
			}
			if (outputs.SoundOutput && outputs.SoundOutput.addNewClass) {
				outputs.SoundOutput.addNewClass(nextClassName, currentClassCount);
			}
			if (outputs.SpeechOutput && outputs.SpeechOutput.addNewClass) {
				outputs.SpeechOutput.addNewClass(nextClassName, currentClassCount);
			}
		}

		// Update wires
		this.updateWires();

		// Update recording system to handle new class
		if (GLOBALS.recordSection && GLOBALS.recordSection.addNewClass) {
			GLOBALS.recordSection.addNewClass(nextClassName);
		}

		// Only one extra class is allowed (4 total)
		this.showMaxClassesNote();
		learningClass.button.element.focus();
		this.announce(`${learningClass.name} class added.`);
	}

	showMaxClassesNote() {
		if (this.addClassButton) {
			this.addClassButton.disabled = true;
		}
		if (this.addClassNote) {
			this.addClassNote.hidden = false;
		}
	}

	// Update wires for new classes
	updateWires() {
		// Update existing wire instances instead of creating new ones
		if (this.wiresLeft && this.wiresLeft.updateForNewClass) {
			this.wiresLeft.updateForNewClass();
		}

		if (this.wiresRight && this.wiresRight.updateForNewClass) {
			this.wiresRight.updateForNewClass();
		}

		// Make sure wires are visible
		document.querySelector('.wires--left').classList.remove('wires--disabled');
		document.querySelector('.wires--right').classList.remove('wires--disabled');

		// Re-enable input and output sections if they were disabled
		document.getElementById('input-section').classList.remove('section--disabled');
		document.getElementById('output-section').classList.remove('section--disabled');
	}

	condenseSection(event) {
		if (event) {
			event.preventDefault();
		}
		this.condensed = !this.condensed;
		this.element.classList.toggle('condensed', this.condensed);
		this.condenseElement.setAttribute('aria-pressed', this.condensed ? 'true' : 'false');
	}

	ready() {
		this.learningClasses.forEach((learningClass) => {
			learningClass.start();
		});
	}

	highlight() {
		this.arrow.show();
		if (!Theme.prefersReducedMotion()) {
			TweenMax.from(this.arrow.element, 0.3, {opacity: 0});
		}
	}

	dehighlight() {
		TweenMax.killTweensOf(this.arrow.element);
		this.arrow.hide();
	}

	enable(highlight) {
		this.element.classList.remove('section--disabled');
		this.wiresLeft.element.classList.remove('wires--disabled');
		this.wiresRight.element.classList.remove('wires--disabled');

		if (highlight) {
			this.highlight();
		}
	}

	disable() {
		this.element.classList.add('section--disabled');
		this.wiresLeft.element.classList.add('wires--disabled');
		this.wiresRight.element.classList.add('wires--disabled');
	}

	dim() {
		this.element.classList.add('dimmed');
		this.wiresLeft.element.classList.add('dimmed');
		this.wiresRight.element.classList.add('dimmed');
	}

	undim() {
		this.element.classList.remove('dimmed');
		this.wiresLeft.element.classList.remove('dimmed');
		this.wiresRight.element.classList.remove('dimmed');
	}

	highlightClass(index) {
		this.learningClasses[index].highlight();
	}

	dehighlightClass(index) {
		this.learningClasses[index].dehighlight();
	}

	highlightClassX(index) {
		this.learningClasses[index].highlightX();
	}

	dehighlightClassX(index) {
		this.learningClasses[index].dehighlightX();
	}

	enableClass(index, highlight) {
		this.learningClasses[index].element.classList.remove('learning__class--disabled');
		this.learningClasses[index].syncDisabled();

		if (highlight) {
			this.highlightClass(index);
		}
	}

	disableClass(index) {
		this.learningClasses[index].element.classList.add('learning__class--disabled');
		this.learningClasses[index].syncDisabled();
	}

	clearExamples() {
		this.learningClasses.forEach((learningClass) => {
			learningClass.clear();
			learningClass.setConfidence(0);
			learningClass.dehighlightConfidence();
		});
		this.setTopClass(null);
		this.wiresRight.dehighlight();
	}

	startRecording(index) {
		this.wiresLeft.highlight(index);
	}

	stopRecording() {
		this.wiresLeft.dehighlight();
	}

	ledOn(id) {
		this.wiresRight.highlight(id);
	}

	getMaxIndex(array) {
		let max = array[0];
		let maxIndex = 0;

		for (let index = 1; index < array.length; index += 1) {
			if (array[index] > max) {
				maxIndex = index;
				max = array[index];
			}
		}

		return maxIndex;
	}

	// Tracks the detected class; announces it only once it has settled, so a
	// flickering prediction doesn't flood screen readers.
	setTopClass(id) {
		if (id === this.topClassId) {
			return;
		}
		this.topClassId = id;
		clearTimeout(this.announceTimer);
		if (id === null || GLOBALS.recording) {
			return;
		}
		this.announceTimer = setTimeout(() => {
			let learningClass = this.learningClasses[GLOBALS.classNames.indexOf(id)];

			if (learningClass && this.topClassId === id && !GLOBALS.recording) {
				this.announce(`Detected ${learningClass.name}.`);
			}
		}, ANNOUNCE_DELAY);
	}

	setConfidences(confidences) {
		const confidencesArry = Object.values(confidences);
		let maxIndex = this.getMaxIndex(confidencesArry);
		let maxValue = confidencesArry[maxIndex];
		let hasTopClass = maxValue > 0.5;

		if (hasTopClass) {
			this.currentIndex = maxIndex;
			let id = GLOBALS.classNames[this.currentIndex];
			this.ledOn(id);
			GLOBALS.outputSection.trigger(id);
			this.setTopClass(id);
		}else {
			this.wiresRight.dehighlight();
		}

		for (let index = 0; index < GLOBALS.numClasses; index += 1) {
			if (this.learningClasses[index]) {
				this.learningClasses[index].setConfidence(confidencesArry[index] * 100);
				if (hasTopClass && index === maxIndex) {
					this.learningClasses[index].highlightConfidence();
				}else {
					this.learningClasses[index].dehighlightConfidence();
				}
			}
		}
	}

	setQuality(quality) {
		// this.trainingQuality.setQuality(quality);
		return quality;
	}

}

import GLOBALS from './../../config.js';
import TweenMax from 'gsap';
import WiresLeft from './WiresLeft.js';
import WiresRight from './WiresRight.js';
import LearningClass from './LearningClass.js';
import TrainingQuality from './TrainingQuality.js';
import HighlightArrow from './../components/HighlightArrow.js';
import Theme from './../components/Theme.js';

export default LearningSection;