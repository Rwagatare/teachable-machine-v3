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

const MAX_LENGTH = 25;

class SpeechOutput {
    constructor() {
        this.id = 'SpeechOutput';

        this.canTrigger = true;
        this.currentIcon = null;
        this.currentIndex = null;
        this.currentTTS = null;
        this.speakCount = 0;
        this.textToSpeech = new TextToSpeech();
        this.element = document.createElement('div');
        this.element.classList.add('output__container');
        this.element.classList.add('output__container--speech');

        this.defaultMessages = [
            'Hello',
            'Awesome',
            'Yes',
            'Great'
        ];

        this.classNames = GLOBALS.classNames;
        this.colors = GLOBALS.colors;
        this.numClasses = GLOBALS.numClasses;

        this.list = document.createElement('ul');
        this.list.classList.add('output__rows');
        this.list.setAttribute('aria-label', 'Phrase for each class');
        this.element.appendChild(this.list);

        this.inputClasses = [];
        for (let index = 0; index < this.numClasses; index += 1) {
            this.addRow(this.classNames[index], index);
        }
        this.buildCanvas();
    }

    // Method to dynamically add a new class
    addNewClass(className, index) {
        this.classNames = GLOBALS.classNames;
        this.numClasses = GLOBALS.numClasses;
        this.addRow(className, index);
    }

    // One row per class: a labelled text field, a Say button and a Clear button.
    addRow(className, index) {
        let name = OutputUI.classLabel(className);
        let message = this.defaultMessages[index] || this.defaultMessages[0];
        let inputId = `speech-input-${className}`;

        let inputClass = document.createElement('li');
        inputClass.classList.add('output__row');
        inputClass.classList.add(`output-class--${className}`);
        inputClass.defaultMessage = message;
        inputClass.message = message;
        inputClass.label = name;

        let tag = OutputUI.classTag(className, 'label');
        tag.setAttribute('for', inputId);
        tag.appendChild(OutputUI.visuallyHidden(' phrase'));
        inputClass.appendChild(tag);

        let controls = document.createElement('div');
        controls.classList.add('output__row-controls');

        let input = document.createElement('input');
        input.type = 'text';
        input.id = inputId;
        input.classId = className;
        input.classList.add('output__text-input');
        input.setAttribute('maxlength', MAX_LENGTH);
        input.setAttribute('placeholder', 'None');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('enterkeyhint', 'done');
        input.value = message;

        let speakerIcon = OutputUI.iconButton({
            className: 'output__play',
            label: `Say ${name} Phrase`,
            icon: 'speaker'
        });

        let deleteIcon = OutputUI.iconButton({
            className: 'output__clear',
            label: `Clear ${name} Phrase`,
            icon: 'clear'
        });

        controls.appendChild(input);
        controls.appendChild(speakerIcon);
        controls.appendChild(deleteIcon);
        inputClass.appendChild(controls);

        inputClass.input = input;
        inputClass.icon = speakerIcon;
        inputClass.deleteButton = deleteIcon;

        input.addEventListener('input', this.keyUp.bind(this));
        input.addEventListener('blur', this.inputBlur.bind(this));
        input.addEventListener('focus', this.editInput.bind(this));
        input.addEventListener('keydown', this.inputKeyDown.bind(this));
        speakerIcon.addEventListener('click', () => {
            this.sayRow(index);
        });
        deleteIcon.addEventListener('click', () => {
            this.clearInput(index);
        });

        this.inputClasses[index] = inputClass;
        this.list.appendChild(inputClass);
        this.renderRow(inputClass);
    }

    renderRow(row) {
        let hasMessage = Boolean(row.message);
        row.icon.disabled = !hasMessage;
        row.deleteButton.disabled = !hasMessage;
    }

    rowFor(input) {
        return input.closest('.output__row');
    }

    clearInput(index) {
        let row = this.inputClasses[index];
        row.message = null;
        row.input.value = '';
        this.renderRow(row);
        row.input.focus();
        if (index === this.currentIndex) {
            this.updateCanvas(index, null);
        }
    }

    keyUp(event) {
        let row = this.rowFor(event.target);
        row.message = event.target.value.trim() || null;
        this.renderRow(row);
    }

    inputBlur(event) {
        let row = this.rowFor(event.target);
        row.message = event.target.value.trim() || null;
        event.target.value = row.message || '';
        this.renderRow(row);
        if (this.inputClasses.indexOf(row) === this.currentIndex) {
            this.updateCanvas(this.currentIndex, row.message);
        }
    }

    // Enter finishes editing (and dismisses the on-screen keyboard).
    inputKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    }

    // Select the phrase so typing replaces it, without throwing it away.
    editInput(event) {
        let input = event.target;
        this.activeInput = input;
        setTimeout(() => {
            if (document.activeElement === input) {
                input.select();
            }
        }, 0);
    }

    setSpeaking(icon) {
        if (this.currentIcon && this.currentIcon !== icon) {
            this.currentIcon.classList.remove('output__icon-button--playing');
        }
        this.currentIcon = icon;
        if (icon) {
            icon.classList.add('output__icon-button--playing');
        }
    }

    speak(index) {
        let row = this.inputClasses[index];
        this.speakCount += 1;
        let token = this.speakCount;

        if (this.currentTTS) {
            this.textToSpeech.stop();
        }
        this.setSpeaking(row.icon);
        this.currentTTS = true;
        this.textToSpeech.say(row.message, () => {
            this.ttsEnded(token);
        });
    }

    sayRow(index) {
        if (this.inputClasses[index].message) {
            this.speak(index);
        }
    }

    // Ignore end events from utterances that were cancelled by a newer one.
    ttsEnded(token) {
        if (token !== this.speakCount) {
            return;
        }
        this.canTrigger = true;
        this.currentTTS = null;
        this.setSpeaking(null);
    }

    // What this output says for a class, for the now-playing bar.
    nowPlaying(index) {
        let row = this.inputClasses[index];
        let message = row && row.message ? row.message : null;

        return {
            kind: 'speech',
            value: message,
            label: message || 'None'
        };
    }

    describe(index) {
        let name = OutputUI.classLabel(this.classNames[index]);

        return `${name}: ${this.nowPlaying(index).label}`;
    }

    trigger(index, overrideAndPlay = false) {
        if (!GLOBALS.clearing && (this.currentIndex !== index || overrideAndPlay)) {
            this.canTrigger = false;
            this.currentIndex = index;

            this.inputClasses.forEach((row, position) => {
                row.classList.toggle('output__row--active', position === index);
            });

            let message = this.inputClasses[index].message;
            if (message) {
                this.speak(index);
            }else {
                if (this.currentTTS) {
                    this.textToSpeech.stop();
                    this.currentTTS = null;
                }
                this.setSpeaking(null);
                this.canTrigger = true;
            }
            this.updateCanvas(index, message);
        }

        if (GLOBALS.clearing) {
            this.inputClasses.forEach((row) => {
                row.classList.remove('output__row--active');
            });
            this.setSpeaking(null);
            if (this.currentTTS) {
                this.textToSpeech.stop();
                this.currentTTS = null;
            }
        }
    }

    stop() {
        if (this.currentTTS) {
            this.textToSpeech.stop();
            this.currentTTS = null;
        }
        this.setSpeaking(null);
        this.element.style.display = 'none';
    }

    start() {
        this.element.style.display = 'block';
        if (typeof this.currentIndex === 'number' && this.currentIndex > -1) {
            this.trigger(this.currentIndex, true);
        }
    }

    // Hidden canvas the video recorder draws from (see RecordOpener).
    buildCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'none';
        this.canvas.setAttribute('aria-hidden', 'true');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = 340;
        this.canvas.height = 260;
        this.element.appendChild(this.canvas);
        OutputUI.paintRecorderBackground(this.context, null);
    }

    // Always the light palette: this ends up in an exported video.
    updateCanvas(colorId, message) {
        let id = this.classNames[colorId];
        let text = message ? `“${message}”` : 'None';
        OutputUI.drawRecorderCard(this.context, id, text);
    }
}

import TextToSpeech from './speech/TextToSpeech.js';
import OutputUI from './outputUI.js';
import GLOBALS from './../config.js';

export default SpeechOutput;