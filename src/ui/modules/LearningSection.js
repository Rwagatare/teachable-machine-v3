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

class LearningSection {
	constructor(element) {
		this.element = element;
		let learningClassesElements = element.querySelectorAll('.learning__class');
        this.condenseElement = element.querySelector('#learning-condensed-button');
        this.condenseElement.addEventListener('click', this.condenseSection.bind(this));
		let learningClasses = [];
		let that = this;
		this.condensed = false;

		that.learningClasses = [];
		let classNames = GLOBALS.classNames;
		let colors = GLOBALS.colors;
		
		learningClassesElements.forEach(function(element, index) {
			let id = classNames[index];
			let color = colors[id];
			let rgbaColor = GLOBALS.rgbaColors[id];

			let options = {
				index: index,
				element: element,
				section: that, 
				color: color, 
				rgbaColor: rgbaColor
			};

			let learningClass = new LearningClass(options);
			learningClass.index = index;
			learningClasses.push(learningClass);
			that.learningClasses[index] = learningClass;
			// learningClass.start();
		});

		// this.trainingQuality = new TrainingQuality(element.querySelector('.quality'));

		this.wiresLeft = new WiresLeft(document.querySelector('.wires--left'), learningClassesElements);
		this.wiresRight = new WiresRight(document.querySelector('.wires--right'), learningClassesElements);
		this.highestIndex = null;
		this.currentIndex = null;

		// Add Class Button
		this.addClassButton = document.getElementById('add-class-button');
		if (this.addClassButton) {
			this.addClassButton.addEventListener('click', this.addNewClass.bind(this));
		}

		this.arrow = new HighlightArrow(2);
		TweenMax.set(this.arrow.element, {
			rotation: 90,
			scale: 0.6,
			x: 120,
			y: -175
		});
		this.element.appendChild(this.arrow.element);
	}

	// Method to add a new class
	addNewClass(event) {
		event.preventDefault();
		
		// Get the current number of classes
		const currentClassCount = this.learningClasses.length;
		
		// Check if we've reached the max number of classes (e.g., 6)
		if (currentClassCount >= 6) {
			alert('Maximum number of classes reached (6).');
			return;
		}
		
		// Get the next available class name and color
		const availableClassNames = ['red', 'blue', 'yellow', 'teal'];
		const nextClassName = availableClassNames[currentClassCount - 3]; // -3 because we already have 3 default classes
		
		// Use friendly names for display
		const displayNames = {
			'red': 'Red',
			'blue': 'Blue',
			'yellow': 'Yellow',
			'teal': 'Teal'
		};
		
		if (!nextClassName) {
			alert('No more predefined classes available.');
			return;
		}
		
		// Update GLOBALS
		if (GLOBALS.classNames.indexOf(nextClassName) === -1) {
			GLOBALS.classNames.push(nextClassName);
		}
		GLOBALS.classesTrained[nextClassName] = false;
		GLOBALS.numClasses++;
		
		// Create the HTML for the new class
		const container = this.element.querySelector('.section__container');
		const newClassElement = document.createElement('div');
		newClassElement.id = nextClassName;
		newClassElement.className = `learning__class learning__class--${nextClassName}`;
		newClassElement.innerHTML = `
			<div class="examples">
				<div class="machine__status examples__status"><span class="examples__counter">0</span> examples</div>
				<div class="examples__wrapper">
					<img src="assets/close.svg" class="examples__close-icon">
					<a href="#" class="link link--reset">Reset</a>
					<canvas class="examples__viewer"></canvas>
				</div>
			</div>
			<div class="learning__class-column">
				<div class="confidence">
					<div class="machine__status confidence__status">Confidence</div>
					<div class="machine__meter">
						<div class="machine__value machine__value--color-${nextClassName}">
							<div class="machine__percentage machine__percentage--white">0%</div>
						</div>
					</div>
				</div>
				<a href="#" class="button button--record button--color-${nextClassName}"><span class="button__content button__content--small">Train <br>${displayNames[nextClassName]}</span></a>
			</div>
		`;
		
		container.appendChild(newClassElement);
		
		// Initialize the new class
		const color = GLOBALS.colors[nextClassName];
		const rgbaColor = GLOBALS.rgbaColors[nextClassName];
		
		const options = {
			index: currentClassCount,
			element: newClassElement,
			section: this,
			color: color,
			rgbaColor: rgbaColor
		};
		
		const learningClass = new LearningClass(options);
		learningClass.index = currentClassCount;
		learningClass.id = nextClassName;
		
		// Set up event handlers just like the original classes
		const recordButton = newClassElement.querySelector('.button--record');
		recordButton.addEventListener('click', function(e) {
			e.preventDefault();
			if (GLOBALS.classId !== nextClassName) {
				GLOBALS.classId = nextClassName;
			} else {
				GLOBALS.classId = null;
			}
		});
		
		// Add reset functionality
		const resetButton = newClassElement.querySelector('.link--reset');
		resetButton.addEventListener('click', function(e) {
			e.preventDefault();
			learningClass.reset();
		});
		
		// Add to learning classes array
		this.learningClasses.push(learningClass);
		this.learningClasses[currentClassCount] = learningClass;
		
		// Initialize and start
		learningClass.start();
		
		// Update wires
		this.updateWires();
		
		// Hide the Add Class button if we've reached max classes
		if (this.learningClasses.length >= 6) {
			this.addClassButton.style.display = 'none';
		}
	}
	
	// Update wires for new classes
	updateWires() {
		// Get all learning class elements
		const learningClassesElements = this.element.querySelectorAll('.learning__class');
		
		// Reinitialize the wires
		this.wiresLeft = new WiresLeft(document.querySelector('.wires--left'), learningClassesElements);
		this.wiresRight = new WiresRight(document.querySelector('.wires--right'), learningClassesElements);
		
		// Make sure wires are visible
		document.querySelector('.wires--left').classList.remove('wires--disabled');
		document.querySelector('.wires--right').classList.remove('wires--disabled');
		
		// Re-enable input and output sections if they were disabled
		document.getElementById('input-section').classList.remove('section--disabled');
		document.getElementById('output-section').classList.remove('section--disabled');
	}

    condenseSection() {
		this.condensed ? this.element.classList.remove('condensed') : this.element.classList.add('condensed');
		this.condensed ? this.condensed = false : this.condensed = true;
    }

	ready() {
		this.learningClasses.forEach((learningClass) => {
			learningClass.start();
		});
	}

	
	highlight() {
		this.arrow.show();
		TweenMax.from(this.arrow.element, 0.3, {opacity: 0});
	}

	dehighlight() {
		TweenMax.killTweensOf(this.arrow.element, 0.3, {opacity: 0});
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

		if (highlight) {
			this.highlightClass(index);
		}
	}

	disableClass(index) {
		this.learningClasses[index].element.classList.add('learning__class--disabled');
	}

	clearExamples() {
		this.learningClasses.forEach((learningClass) => {
			learningClass.clear();
			learningClass.setConfidence(0);
			learningClass.dehighlightConfidence();
		});
	}

	startRecording(id) {
		this.wiresLeft.highlight(id);
	}

	stopRecording() {
		this.wiresLeft.dehighlight();
	}
	
	ledOn(id) {
		this.wiresRight.dehighlight();
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

	setConfidences(confidences) {
		const confidencesArry = Object.values(confidences);
		let maxIndex = this.getMaxIndex(confidencesArry);
		let maxValue = confidencesArry[maxIndex];
		// if (maxValue > 0.5 && this.currentIndex !== maxIndex) {
		if (maxValue > 0.5) {
			this.currentIndex = maxIndex;
			let id = GLOBALS.classNames[this.currentIndex];
			this.ledOn(id);
			GLOBALS.outputSection.trigger(id);
		}

		for (let index = 0; index < 3; index += 1) {
			this.learningClasses[index].setConfidence(confidencesArry[index] * 100);
			if (index === maxIndex) {
				this.learningClasses[index].highlightConfidence();
			}else { 
				this.learningClasses[index].dehighlightConfidence();
			}
		}
	}

	setQuality(quality) {
		// this.trainingQuality.setQuality(quality);
	}

}

import GLOBALS from './../../config.js';
import TweenMax from 'gsap';
import WiresLeft from './WiresLeft.js';
import WiresRight from './WiresRight.js';
import LearningClass from './LearningClass.js';
import TrainingQuality from './TrainingQuality.js';
import HighlightArrow from './../components/HighlightArrow.js';


export default LearningSection;