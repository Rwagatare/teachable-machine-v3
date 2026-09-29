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

import TweenMax from 'gsap';

import GLOBALS from './config.js';
import Button from './ui/components/Button.js';
import IntroSection from './ui/modules/IntroSection.js';
import InputSection from './ui/modules/InputSection.js';
import LearningSection from './ui/modules/LearningSection.js';
import OutputSection from './ui/modules/OutputSection.js';
import Wizard from './ui/modules/Wizard.js';
import Recording from './ui/modules/Recording';
import RecordOpener from './ui/components/RecordOpener.js';
import PWAUtils from './ui/components/PWAUtils.js';
import LaunchScreen from './ui/modules/wizard/LaunchScreen.js';
import BrowserUtils from './ui/components/BrowserUtils';

function init() {

	// Shim for forEach for IE/Edge
	if (typeof NodeList.prototype.forEach !== 'function') {
		NodeList.prototype.forEach = Array.prototype.forEach;
	}

	GLOBALS.browserUtils = new BrowserUtils();
	GLOBALS.launchScreen = new LaunchScreen();

	// Initialize PWA functionality
	GLOBALS.pwaUtils = new PWAUtils();

	GLOBALS.learningSection = new LearningSection(document.querySelector('#learning-section'));
	GLOBALS.inputSection = new InputSection(document.querySelector('#input-section'));
	GLOBALS.outputSection = new OutputSection(document.querySelector('#output-section'));
	GLOBALS.recordOpener = new RecordOpener(document.querySelector('#record-open-section'));

	GLOBALS.inputSection.ready();
	GLOBALS.learningSection.ready();
	GLOBALS.wizard = new Wizard();
	GLOBALS.recordSection = new Recording(document.querySelector('#recording'));
	if (localStorage.getItem('isBackFacingCam') && localStorage.getItem('isBackFacingCam') === 'true') {
		GLOBALS.isBackFacingCam = true;
	}

	setCameraInstructions();

	// Browsers hide the camera API on plain http:// pages other than localhost,
	// which otherwise looks like an unsupported browser.
	if (window.isSecureContext === false) {
		let insecureMessage = 'The camera only works over a secure connection. Open this page with https://, or at localhost on this computer.';

		document.querySelector('.wizard__browser-warning').textContent = insecureMessage;
		document.querySelector('#is-not-compatible .intro__message').textContent = insecureMessage;
	}else if (GLOBALS.browserUtils.isChrome && !GLOBALS.browserUtils.isEdge && !GLOBALS.browserUtils.isCompatible) {
		document.querySelector('.wizard__browser-warning').textContent = 'Teachable Machine couldn’t start in this browser. Restart Chrome, then open this page again.';
	}

	// Suggest installing on iOS once the user has trained a class
	GLOBALS.pwaUtils.showInstallPromptAfterDelay();

	setupClearSavedDataButton();
}

// Shown when camera access is blocked. The steps describe each browser's own
// controls, which differ between desktop and mobile, so they're picked by
// browser and platform rather than by screen width. Plain text only: the
// whole element reloads the page when activated.
function setCameraInstructions() {
	const utils = GLOBALS.browserUtils;
	const element = document.querySelector('.input__media__activate');
	const intro = 'Teachable Machine needs your camera. ';
	let steps = '';

	if (utils.isChrome && !utils.isEdge) {
		steps = utils.isMobile
			? 'Tap the icon to the left of the address, allow Camera, then reload the page.'
			: 'Click the camera icon at the right of the address bar, allow camera access, then reload the page.';
	}else if (utils.isSafari) {
		steps = utils.isMobile
			? 'Tap aA in the address bar, choose Website Settings, set Camera to Allow, then reload the page.'
			: 'In the menu bar, choose Safari > Settings for This Website, set Camera to Allow, then reload the page.';
	}else if (utils.isFirefox && element) {
		// The icon repeats the words next to it, so it has empty alt text.
		element.innerHTML = intro + 'Click the camera icon <img class="camera-icon" src="assets/ff-camera-icon.png" alt=""> in the address bar, allow camera access, then reload the page.';

		return;
	}

	if (element && steps) {
		element.textContent = intro + steps;
	}
}

function setupClearSavedDataButton() {
	const clearDataButton = document.getElementById('clear-saved-data');
	if (!clearDataButton) {
		return;
	}

	clearDataButton.addEventListener('click', (event) => {
		event.preventDefault();

		// A native confirm is deliberate here: it is accessible everywhere and
		// this action deletes data that can't be recovered.
		// eslint-disable-next-line no-alert
		if (!window.confirm('Delete saved training data from this device? This can’t be undone.')) {
			return;
		}

		let clearPromise = Promise.resolve();
		if (GLOBALS.webcamClassifier && GLOBALS.webcamClassifier.clearPersistedData) {
			clearPromise = GLOBALS.webcamClassifier.clearPersistedData();
		}

		clearPromise.then(() => {
			location.reload();
		});
	});
}

window.addEventListener('load', init);

export default GLOBALS;