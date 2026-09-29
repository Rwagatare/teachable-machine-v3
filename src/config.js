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
let GLOBALS = {
	button: {
		padding: 0,
		frontHeight: 40,
		states: {
			normal: {
				x: 8,
				y: 8
			},
			pressed: {
				x: 4,
				y: 4
			}
		}
	},
	classNames: [
	'green',
	'purple',
	'orange'
	],
	// Light-mode fallbacks only. Read live colors through ui/components/Theme.js
	// so they follow the CSS tokens (dark mode, increased contrast).
	colors: {
		'green': '#248A3D',
		'purple': '#8944AB',
		'orange': '#C93400',
		'red': '#D70015',
		'blue': '#0040DD',
		'yellow': '#A05A00',
		'teal': '#0071A4'
	},
	rgbaColors: {
		'green': 'rgba(36, 138, 61, 0.25)',
		'purple': 'rgba(137, 68, 171, 0.25)',
		'orange': 'rgba(201, 52, 0, 0.25)',
		'red': 'rgba(215, 0, 21, 0.25)',
		'blue': 'rgba(0, 64, 221, 0.25)',
		'yellow': 'rgba(160, 90, 0, 0.25)',
		'teal': 'rgba(0, 113, 164, 0.25)'
	},
	classId: null,
	predicting: false,
	micThreshold: 25,
	classesTrained: {
		'green': false,
		'purple': false,
		'orange': false
	},
	numClasses: 3,
    isBackFacingCam: false,
    audioContext: null
};

// Lazy-initialize AudioContext on first user gesture to comply with browser autoplay policy
GLOBALS.getAudioContext = function() {
    if (!GLOBALS.audioContext) {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        GLOBALS.audioContext = new AudioContext();
    }
    
return GLOBALS.audioContext;
};

export default GLOBALS;