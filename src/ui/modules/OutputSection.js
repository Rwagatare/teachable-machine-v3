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

// How long the top class must stay the same before it is announced to
// screen readers. Predictions arrive every frame; this keeps the live region
// to one polite message per settled change.
const ANNOUNCE_DELAY = 1000;

class OutputSection {
    constructor(element) {
        this.element = element;

        const outputs = {
            EmojiOutput: new EmojiOutput(),
            SoundOutput: new SoundOutput(document.querySelector('#SoundOutput')),
            SpeechOutput: new SpeechOutput()
        };
        GLOBALS.soundOutput = outputs.SoundOutput;

        this.classNames = GLOBALS.classNames;
        GLOBALS.predicting = true;

        this.outputs = outputs;
        this.loadedOutputs = [];

        this.liveRegion = element.querySelector('#output-status');
        this.pendingIndex = null;
        this.announcedKey = null;
        this.announceTimer = null;

        // Output picker: a segmented control built as an ARIA tablist.
        this.tabs = Array.from(element.querySelectorAll('.output__segment'));
        this.tabs.forEach((tab) => {
            tab.addEventListener('click', this.changeOutput.bind(this));
            tab.addEventListener('keydown', this.tabKeyDown.bind(this));
        });
        this.currentLink = element.querySelector('.output__segment--selected') || this.tabs[0];

        this.outputContainer = document.querySelector('#output-player');
        this.currentOutput = null;
        this.currentLink.click();

        // Edits to an emoji, sound or phrase all happen inside this panel;
        // let the now-playing bar re-read its value (it ignores no-ops).
        let refreshNowPlaying = this.refreshNowPlaying.bind(this);
        [
            'input',
            'click',
            'focusout'
        ].forEach((type) => {
            element.addEventListener(type, refreshNowPlaying);
        });

        this.arrow = new HighlightArrow(1);
        this.arrow.element.alt = '';
        this.arrow.element.setAttribute('aria-hidden', 'true');

        TweenMax.set(this.arrow.element, {
            rotation: -50,
            scale: -0.8,
            x: 140,
            y: -100
        });
        this.element.appendChild(this.arrow.element);
    }

    enable() {
        this.element.classList.remove('section--disabled');
    }

    highlight() {
        this.arrow.show();
        if (Theme.prefersReducedMotion()) {
            TweenMax.set(this.arrow.element, {opacity: 1});
        }else {
            TweenMax.from(this.arrow.element, 0.3, {opacity: 0});
        }
    }

    dehighlight() {
        TweenMax.killTweensOf(this.arrow.element);
        this.arrow.hide();
    }

    disable() {
        this.element.classList.add('section--disabled');
    }

    dim() {
        this.element.classList.add('dimmed');
    }

    undim() {
        this.element.classList.remove('dimmed');
    }

    changeOutput(event) {
        this.selectTab(event.currentTarget);
    }

    selectTab(tab) {
        this.tabs.forEach((other) => {
            let selected = other === tab;
            other.classList.toggle('output__segment--selected', selected);
            other.setAttribute('aria-selected', selected ? 'true' : 'false');
            other.setAttribute('tabindex', selected ? '0' : '-1');
        });

        this.currentLink = tab;
        let outputId = this.currentLink.id;
        this.outputContainer.setAttribute('aria-labelledby', outputId);

        if (this.currentOutput) {
            this.currentOutput.stop();
            this.currentOutput = null;
        }

        if (this.outputs[outputId]) {
            this.currentOutput = this.outputs[outputId];
        }

        if (this.currentOutput) {
            this.outputContainer.appendChild(this.currentOutput.element);
            this.currentOutput.start();
        }

        // Describe the next settled class with the newly selected output.
        this.pendingIndex = null;
        this.announcedKey = null;
        this.refreshNowPlaying();

        gtag('event', 'select_output', {'id': outputId});
    }

    // Left/Right (and Home/End) move between segments; selection follows focus.
    tabKeyDown(event) {
        let index = this.tabs.indexOf(event.currentTarget);
        let last = this.tabs.length - 1;
        let next = -1;

        switch (event.key) {
            case 'ArrowRight':
            case 'Right':
                next = index === last ? 0 : index + 1;
                break;
            case 'ArrowLeft':
            case 'Left':
                next = index === 0 ? last : index - 1;
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = last;
                break;
            default:
                break;
        }

        if (next > -1) {
            event.preventDefault();
            this.tabs[next].focus();
            this.selectTab(this.tabs[next]);
        }
    }

    toggleSoundOutput(play) {
        if (this.currentOutput.id === 'SoundOutput' && play) {
            GLOBALS.soundOutput.playCurrentSound();
        }else if (this.currentOutput.id === 'SoundOutput' && !play) {
            GLOBALS.soundOutput.pauseCurrentSound();
        }
    }

    startWizardMode() {
        this.broadcastEvents = true;
    }

    stopWizardMode() {
        this.broadcastEvents = false;
    }

    trigger(id) {
        let index = this.classNames.indexOf(id);
        this.currentOutput.trigger(index);

        if (!GLOBALS.clearing) {
            this.scheduleAnnouncement(index);
            if (GLOBALS.nowPlaying) {
                GLOBALS.nowPlaying.update(index);
            }
        }

        if (this.broadcastEvents) {
            let event = new CustomEvent('class-triggered', {detail: {id: id}});
            window.dispatchEvent(event);
        }
    }

    // The compact-layout now-playing bar (NowPlaying.js), once it exists.
    refreshNowPlaying() {
        if (GLOBALS.nowPlaying) {
            GLOBALS.nowPlaying.refresh();
        }
    }

    // trigger() runs every frame. Only a change of top class restarts the
    // timer, and a message is only written once the class has settled.
    scheduleAnnouncement(index) {
        if (!this.liveRegion || index === this.pendingIndex) {
            return;
        }
        this.pendingIndex = index;
        clearTimeout(this.announceTimer);
        this.announceTimer = setTimeout(this.announce.bind(this), ANNOUNCE_DELAY);
    }

    announce() {
        let output = this.currentOutput;
        let index = this.pendingIndex;
        if (!output || typeof output.describe !== 'function' || index === null || index < 0) {
            return;
        }
        let key = output.id + ':' + index;
        if (key === this.announcedKey) {
            return;
        }
        this.announcedKey = key;
        this.liveRegion.textContent = output.describe(index);
    }
}

import TweenMax from 'gsap';
import GLOBALS from './../../config.js';

import HighlightArrow from './../components/HighlightArrow.js';
import Theme from './../components/Theme.js';

import SpeechOutput from './../../outputs/SpeechOutput.js';
import EmojiOutput from './../../outputs/EmojiOutput.js';
import SoundOutput from './../../outputs/SoundOutput.js';

export default OutputSection;