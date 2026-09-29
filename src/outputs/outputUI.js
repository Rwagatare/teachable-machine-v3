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

// Shared building blocks for the output column (Emoji, Sound, Speech):
// inline icons that follow currentColor, accessible icon buttons, the class
// tag (swatch + name, so class is never conveyed by colour alone), display
// names, and the fixed light palette used by the hidden recorder canvases.

const SVG_OPEN = '<svg class="output__icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" ';

const ICONS = {
	speaker: SVG_OPEN + 'viewBox="0 0 63 61"><path d="M4,21.4v17.1h11.6L30,52.8V7.2L15.6,21.4H4z"/><g class="sound-on"><path d="M43,30c0-4.9-2.8-9.4-7.2-11.5v22.9C40.2,39.3,43,34.9,43,30z"/><path d="M35.8,5v5.9c10.6,3,16.7,14,13.7,24.6c-1.9,6.6-7.1,11.8-13.7,13.7V55c13.8-2.9,22.6-16.5,19.7-30.3C53.4,14.8,45.6,7.1,35.8,5z"/></g></svg>',
	play: SVG_OPEN + 'viewBox="0 0 26 26"><path d="M8 4.8v16.4c0 .8.9 1.3 1.6.9l13-8.2c.6-.4.6-1.3 0-1.7l-13-8.2C8.9 3.5 8 4 8 4.8z"/></svg>',
	stop: SVG_OPEN + 'viewBox="0 0 26 26"><rect x="6.5" y="6.5" width="13" height="13" rx="2.5"/></svg>',
	clear: SVG_OPEN + 'viewBox="0 0 26 26"><path d="M7.5 7.5l11 11M18.5 7.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
	back: SVG_OPEN + 'viewBox="0 0 26 26"><path d="M16 4.5L7.5 13l8.5 8.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	check: SVG_OPEN + 'viewBox="0 0 26 26"><path d="M6 13.5l4.5 4.5L20 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	chevron: SVG_OPEN + 'viewBox="0 0 26 26"><path d="M10 5.5l7.5 7.5-7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

// Speaker glyph as a canvas path (viewBox 63x61), for the recorder canvases.
const SPEAKER_PATHS = [
	'M4,21.4v17.1h11.6L30,52.8V7.2L15.6,21.4H4z',
	'M43,30c0-4.9-2.8-9.4-7.2-11.5v22.9C40.2,39.3,43,34.9,43,30z',
	'M35.8,5v5.9c10.6,3,16.7,14,13.7,24.6c-1.9,6.6-7.1,11.8-13.7,13.7V55c13.8-2.9,22.6-16.5,19.7-30.3C53.4,14.8,45.6,7.1,35.8,5z'
];

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';

// Recorder canvases are baked into an exported video, so they always use
// the light palette regardless of the viewer's appearance.
const RECORDER_PALETTE = {
	background: '#FFFFFF',
	label: '#1C1C1E',
	secondaryLabel: '#6C6C70'
};

function icon(name) {
	return ICONS[name] || '';
}

// 'green' -> 'Green'
function classLabel(id) {
	if (!id) {
		return '';
	}

	return id.charAt(0).toUpperCase() + id.slice(1);
}

// 'drum_roll.mp3' -> 'Drum Roll'. Display only; stored values keep the file name.
function soundLabel(file) {
	if (!file) {
		return 'None';
	}
	let base = file.replace(/\.[a-z0-9]+$/i, '');
	let words = base.split(/[_\-\s]+/).filter((word) => word.length > 0);

	return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function iconButton(options) {
	let button = document.createElement('button');
	button.type = 'button';
	button.className = 'output__icon-button';
	if (options.className) {
		button.classList.add(options.className);
	}
	button.setAttribute('aria-label', options.label);
	button.innerHTML = icon(options.icon);

	return button;
}

// Class colour swatch + class name. Pass a tag name of 'label' to make it the
// visible label of a form field.
function classTag(id, tagName) {
	let tag = document.createElement(tagName || 'span');
	tag.className = 'output__class-tag output__class-tag--' + id;

	let swatch = document.createElement('span');
	swatch.className = 'output__swatch';
	swatch.setAttribute('aria-hidden', 'true');
	tag.appendChild(swatch);

	let name = document.createElement('span');
	name.className = 'output__class-name';
	name.textContent = classLabel(id);
	tag.appendChild(name);

	return tag;
}

function visuallyHidden(text) {
	let span = document.createElement('span');
	span.className = 'visually-hidden';
	span.textContent = text;

	return span;
}

function recorderClassColor(id) {
	return GLOBALS.colors[id] || GLOBALS.colors.green;
}

function recorderClassTint(id) {
	return GLOBALS.rgbaColors[id] || GLOBALS.rgbaColors.green;
}

// Fill the whole recorder canvas with the light background and class tint.
function paintRecorderBackground(context, id) {
	let canvas = context.canvas;
	context.globalCompositeOperation = 'source-over';
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = RECORDER_PALETTE.background;
	context.fillRect(0, 0, canvas.width, canvas.height);
	if (id) {
		context.fillStyle = recorderClassTint(id);
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
}

// Centered single-line text that shrinks to fit the canvas width.
function drawFittedText(context, text, layout) {
	let canvas = context.canvas;
	let maxWidth = canvas.width - 40;
	let size = layout.size;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = layout.color;
	context.font = layout.weight + ' ' + size + 'px ' + SYSTEM_FONT;
	while (size > 12 && context.measureText(text).width > maxWidth) {
		size -= 1;
		context.font = layout.weight + ' ' + size + 'px ' + SYSTEM_FONT;
	}
	context.fillText(text, canvas.width / 2, layout.y);
}

// Speaker + value + class name, used by the Sound and Speech recorders.
function drawRecorderCard(context, id, text) {
	let canvas = context.canvas;
	paintRecorderBackground(context, id);

	let iconSize = 96;
	let scale = iconSize / 63;
	let left = (canvas.width - iconSize) / 2;
	let top = 36;
	context.save();
	context.translate(left, top);
	context.scale(scale, scale);
	context.fillStyle = recorderClassColor(id);
	if (typeof Path2D === 'function') {
		SPEAKER_PATHS.forEach((path) => {
			context.fill(new Path2D(path));
		});
	}else {
		context.fillRect(4, 21, 26, 18);
	}
	context.restore();

	drawFittedText(context, text, {
		size: 28,
		weight: 600,
		y: 174,
		color: RECORDER_PALETTE.label
	});
	drawFittedText(context, classLabel(id), {
		size: 17,
		weight: 400,
		y: 210,
		color: RECORDER_PALETTE.secondaryLabel
	});
}

let OutputUI = {
	EMOJI_FONT: EMOJI_FONT,
	SYSTEM_FONT: SYSTEM_FONT,
	RECORDER_PALETTE: RECORDER_PALETTE,
	icon: icon,
	classLabel: classLabel,
	soundLabel: soundLabel,
	iconButton: iconButton,
	classTag: classTag,
	visuallyHidden: visuallyHidden,
	recorderClassColor: recorderClassColor,
	paintRecorderBackground: paintRecorderBackground,
	drawFittedText: drawFittedText,
	drawRecorderCard: drawRecorderCard
};

import GLOBALS from './../config.js';

export default OutputUI;