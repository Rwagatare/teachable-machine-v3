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

// "Record Video" entry point in the FAQ area. The recorder needs
// canvas.captureStream() + MediaRecorder with WebM output, which is only
// dependable in desktop Chrome, so the entry point is hidden elsewhere.

class RecordOpener {
	constructor(element) {
		this.element = element;
		this.openButton = document.querySelector('#open-recorder');

		this.openButton.addEventListener('click', this.open.bind(this));
		if (!GLOBALS.browserUtils.isChrome || GLOBALS.browserUtils.isMobile) {
			this.element.hidden = true;
		}
	}

	disable() {
		this.openButton.disabled = true;
	}

	enable() {
		this.openButton.disabled = false;
	}

	open(event) {
		if (event) {
			event.preventDefault();
		}
		let output = GLOBALS.outputSection.currentOutput;
		let canvas = null;
		if (output && output.element) {
			canvas = output.element.querySelector('canvas');
		}

		// The sheet is fixed to the viewport, so there's no need to scroll.
		GLOBALS.recordSection.setCanvas(canvas);
	}
}

import GLOBALS from './../../config.js';

export default RecordOpener;