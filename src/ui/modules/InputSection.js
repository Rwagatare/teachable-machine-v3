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

class InputSection {
    constructor(element) {
        this.element = element;
        // this.camInputToggle = new Button(element.querySelector('#cam-input-toggle'));
        // this.micInputToggle = new Button(element.querySelector('#mic-input-toggle'));
        // this.camInputToggle.deselect();
        // this.micInputToggle.deselect();
        // this.camInputToggle.element.addEventListener('click', this.selectCamInput.bind(this));
        // this.micInputToggle.element.addEventListener('click', this.selectMicInput.bind(this));
        // this.camInputToggle.element.addEventListener('touchend', this.selectCamInput.bind(this));
        // this.micInputToggle.element.addEventListener('touchend', this.selectMicInput.bind(this));
        this.mediaFlipButton = element.querySelector('.input__media__flip');
        this.mediaFlipButton.addEventListener('click', this.flipCamera.bind(this));

        this.inputContainer = element.querySelector('.input__media');

        this.currentInput = null;
        // if (!GLOBALS.browserUtils.isMobile) {
        //     this.createMicInput();
        //     this.createCamInput();
        //     this.selectCamInput();
        //     this.camInputToggle.select();
        // }

        this.arrow = new HighlightArrow(1);

        if (GLOBALS.browserUtils.isMobile) {
            TweenMax.set(this.arrow.element, {
                rotation: -120,
                scaleX: -0.5,
                x: -20,
                y: -60
            });
        }else {
            TweenMax.set(this.arrow.element, {
                rotation: -120,
                scaleX: -0.8,
                x: -20,
                y: -120
            });
        }
        this.element.appendChild(this.arrow.element);

        this.gifs = [];

        let emoji1 = new WizardEmojiExample('📸');
        if (GLOBALS.browserUtils.isMobile) {
            TweenMax.set(emoji1.element, {
                rotation: -5,
                scale: 0.65,
                x: 40,
                y: 275
            });
        }else {
            TweenMax.set(emoji1.element, {
                rotation: -5,
                scale: 0.65,
                x: 70,
                y: -25
            });
        }
        this.element.appendChild(emoji1.element);
        this.gifs.push(emoji1);


        let emoji2 = new WizardEmojiExample('🎯');
        if (GLOBALS.browserUtils.isMobile) {
            TweenMax.set(emoji2.element, {
                rotation: -5,
                scale: 0.65,
                x: 40,
                y: 275
            });
        }else {
            TweenMax.set(emoji2.element, {
                rotation: -5,
                scale: 0.65,
                x: 70,
                y: -25
            });
        }
        this.element.appendChild(emoji2.element);
        this.gifs.push(emoji2);

        let emoji3 = new WizardEmojiExample('🤖');
        if (GLOBALS.browserUtils.isMobile) {
            TweenMax.set(emoji3.element, {
                rotation: -5,
                scale: 0.65,
                x: 40,
                y: 275
            });
        }else {
            TweenMax.set(emoji3.element, {
                rotation: -5,
                scale: 0.65,
                x: 70,
                y: -25
            });
        }
        this.element.appendChild(emoji3.element);
        this.gifs.push(emoji3);

        let emoji4 = new WizardEmojiExample('🎉');
        if (GLOBALS.browserUtils.isMobile) {
            TweenMax.set(emoji4.element, {
                rotation: -5,
                scale: 0.65,
                x: 40,
                y: 275
            });
        }else {
            TweenMax.set(emoji4.element, {
                rotation: -5,
                scale: 0.65,
                x: 70,
                y: -25
            });
        }
        this.element.appendChild(emoji4.element);
        this.gifs.push(emoji4);

    }

    showGif(index) {
        this.gifs[index].show();
    }

    hideGif(index) {
        this.gifs[index].hide();
    }

    ready() {
        if (!GLOBALS.browserUtils.isMobile) {
            this.createCamInput();
            this.selectCamInput();
        }
    }

    highlight() {
        this.arrow.show();
        TweenMax.from(this.arrow.element, 0.3, {opacity: 0});
    }

    dehighlight() {
        TweenMax.killTweensOf(this.arrow.element);
        this.arrow.hide();
    }

    enable(highlight) {
        this.element.classList.remove('section--disabled');

        if (highlight) {
            this.highlight();
        }else {
            this.dehighlight();
        }
    }

    disable() {
        this.element.classList.add('section--disabled');
        this.dehighlight();
    }

    dim() {
        this.element.classList.add('dimmed');
    }

    undim() {
        this.element.classList.remove('dimmed');
    }

    createCamInput() {
        if (!this.camInput) {
            this.camInput = new CamInput();
            this.inputContainer.appendChild(this.camInput.element);
            GLOBALS.camInput = this.camInput;
            // GLOBALS.camInput.start();
        }
    }

    selectCamInput() {
        this.createCamInput();
        this.currentInput = this.camInput;
    }


    resetClass(id) {
        this.camInput.resetClass(id);
    }

    flipCamera(event) {
        event.preventDefault();
        if (!GLOBALS.browserUtils.isAndroid) {
            GLOBALS.isBackFacingCam = !GLOBALS.isBackFacingCam;
            GLOBALS.webcamClassifier.loaded = false;
            GLOBALS.webcamClassifier.ready();
        }
        if (GLOBALS.browserUtils.isAndroid) {
            /*eslint-disable */
            if (confirm('Switching camera will clear your trained classes and reload the page.')) {
                /* eslint-enable */
                GLOBALS.isBackFacingCam = !GLOBALS.isBackFacingCam;
                localStorage.setItem('isBackFacingCam', GLOBALS.isBackFacingCam.toString());
                location.reload();
            }
        }
    }
}

import TweenMax from 'gsap';
import GLOBALS from './../../config.js';
import Button from './../components/Button.js';
import CamInput from './../components/CamInput.js';
import HighlightArrow from './../components/HighlightArrow.js';
import WizardEmojiExample from './WizardEmojiExample.js';

export default InputSection;