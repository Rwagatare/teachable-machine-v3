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

// A touch that travels further than this (in px) is a scroll, not a tap.
const TAP_SLOP = 10;

function setVisible(element, visible) {
    if (!element) {
        return;
    }
    if (visible) {
        element.removeAttribute('hidden');
    }else {
        element.setAttribute('hidden', '');
    }
}

// Activates on click, and on a touch that ends without scrolling. The touch
// path matters because the shared Button component may cancel touchstart,
// which suppresses the synthetic click on touch screens.
function addActivateListener(element, handler) {
    let start = null;

    element.addEventListener('touchstart', (event) => {
        let touch = event.changedTouches[0];
        start = {
            x: touch.clientX,
            y: touch.clientY
        };
    }, {passive: true});

    element.addEventListener('touchend', (event) => {
        let touch = event.changedTouches[0];
        let moved = !start ||
            Math.abs(touch.clientX - start.x) > TAP_SLOP ||
            Math.abs(touch.clientY - start.y) > TAP_SLOP;
        start = null;
        if (!moved) {
            handler(event);
        }
    });

    element.addEventListener('click', handler);
}

class LaunchScreen {
    constructor() {
        this.element = document.querySelector('.intro');
        this.exiting = false;
        this.destroyed = false;
        this.inertElements = [];

        this.desktopContent = document.querySelector('#intro-desktop');
        this.startButtonElement = document.querySelector('#start-tutorial-button');
        this.skipButton = document.querySelector('#skip-tutorial-button');
        this.skipButtonMobile = document.querySelector('#skip-tutorial-button-mobile');
        this.hint = document.querySelector('#intro-hint');
        this.browserWarning = document.querySelector('#browser-warning');

        this.messageIsCompatible = document.querySelector('#is-compatible');
        this.messageIsNotCompatible = document.querySelector('#is-not-compatible');

        this.applyCompatibility();

        // The shared Button measures itself, so only build the visible one.
        if (GLOBALS.browserUtils.isCompatible === true) {
            if (GLOBALS.browserUtils.isMobile) {
                this.continueButton = new Button(this.skipButtonMobile);
            }else {
                this.startButton = new Button(this.startButtonElement);
            }
        }

        let facebookButton = document.querySelector('.intro__share-link--facebook');
        let twitterButton = document.querySelector('.intro__share-link--twitter');

        this.loadShareIcon(facebookButton, 'assets/social-facebook.svg');
        this.loadShareIcon(twitterButton, 'assets/social-twitter.svg');

        facebookButton.addEventListener('click', this.openFacebookPopup.bind(this));
        twitterButton.addEventListener('click', this.openTwitterPopup.bind(this));

        // WebGL missing no longer hard-blocks (see BrowserUtils.js) - show a
        // dismissible, non-blocking heads-up instead, since TensorFlow.js
        // will fall back to its slower CPU backend automatically.
        if (GLOBALS.browserUtils.isCompatible && !GLOBALS.browserUtils.hasWebgl) {
            this.showWebglWarning();
        }

        addActivateListener(this.skipButton, this.skipClick.bind(this));
        addActivateListener(this.skipButtonMobile, this.skipClick.bind(this));
        addActivateListener(this.startButtonElement, this.startClick.bind(this));

        // The launch screen covers the app, so keep keyboard and screen
        // reader focus inside it until it's dismissed.
        this.setBackgroundInert(true);
    }

    /**
     * Shows the launch state that matches the browser: tutorial on desktop,
     * a short note plus Continue on phones and tablets, or what's missing
     * and what to do when the camera can't be used.
     * @returns {void}
     */
    applyCompatibility() {
        let browser = GLOBALS.browserUtils;
        let isCompatible = browser.isCompatible === true;
        let canStartTutorial = isCompatible && !browser.isMobile;

        setVisible(this.desktopContent, !browser.isMobile);
        setVisible(this.startButtonElement, isCompatible);
        setVisible(this.skipButton, canStartTutorial);
        setVisible(this.hint, canStartTutorial);
        setVisible(this.browserWarning, !isCompatible);
        this.startButtonElement.disabled = !canStartTutorial;
        this.startButtonElement.classList.toggle('button--disabled', !canStartTutorial);

        setVisible(this.messageIsCompatible, browser.isMobile && isCompatible);
        setVisible(this.messageIsNotCompatible, browser.isMobile && !isCompatible);
        this.skipButtonMobile.disabled = !(browser.isMobile && isCompatible);
    }

    loadShareIcon(element, url) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = () => {
            if (request.status < 200 || request.status >= 300) {
                return;
            }
            element.innerHTML = request.responseText;
            let svg = element.querySelector('svg');
            if (svg) {
                // The link carries the accessible name; the icon is decoration.
                svg.setAttribute('aria-hidden', 'true');
                svg.setAttribute('focusable', 'false');
                let title = svg.querySelector('title');
                if (title) {
                    title.parentNode.removeChild(title);
                }
            }
        };
        request.send();
    }

    setBackgroundInert(inert) {
        if (!inert) {
            this.inertElements.forEach((element) => {
                element.removeAttribute('inert');
            });
            this.inertElements = [];

            return;
        }

        let siblings = this.element.parentNode.children;
        for (let index = 0; index < siblings.length; index += 1) {
            let element = siblings[index];
            if (element !== this.element && !element.hasAttribute('inert')) {
                element.setAttribute('inert', '');
                this.inertElements.push(element);
            }
        }
    }

    /**
     * Shows a small, dismissible, non-blocking banner when WebGL isn't
     * available. Unlike the "#is-not-compatible" message, this doesn't stop
     * the user from continuing - TensorFlow.js will fall back to its CPU
     * backend, just slower. Styles live in style/components/intro.styl.
     * @returns {void}
     */
    showWebglWarning() {
        let banner = document.createElement('div');
        banner.className = 'webgl-banner';

        let text = document.createElement('p');
        text.className = 'webgl-banner__text';
        text.setAttribute('role', 'status');

        let dismissButton = document.createElement('button');
        dismissButton.className = 'webgl-banner__button';
        dismissButton.setAttribute('type', 'button');
        dismissButton.textContent = 'Continue';
        dismissButton.addEventListener('click', () => {
            let hadFocus = banner.contains(document.activeElement);
            banner.parentNode.removeChild(banner);
            if (hadFocus) {
                this.focusStartPoint();
            }
        });

        banner.appendChild(text);
        banner.appendChild(dismissButton);
        document.body.appendChild(banner);

        // Fill the live region after it's in the page so it gets announced.
        setTimeout(() => {
            text.textContent = 'GPU acceleration isn’t available on this device. ' +
                'Teachable Machine still works, but predictions may be slower.';
        }, 100);
    }

    // Moves focus to the most useful place: the launch screen's primary
    // action while it's showing, otherwise the machine.
    focusStartPoint() {
        if (this.destroyed) {
            GLOBALS.wizard.focusMachine();

            return;
        }
        let candidates = [
            this.startButtonElement,
            this.skipButtonMobile,
            this.skipButton
        ];
        for (let index = 0; index < candidates.length; index += 1) {
            let candidate = candidates[index];
            if (!candidate.disabled && !candidate.closest('[hidden]')) {
                candidate.focus();

                return;
            }
        }
    }

    openFacebookPopup(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute('href');
        /* eslint-disable space-infix-ops */
        window.open(url, 'fbShareWindow', 'height=450, width=550, top='+(window.innerHeight/2-275)+', left='+(window.innerWidth/2-225)+',toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        /* eslint-enable space-infix-ops */
    }

    openTwitterPopup(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute('href');
        /* eslint-disable space-infix-ops */
        window.open(url, 'fbShareWindow', 'height=450, width=600, top='+(window.innerHeight/2-150)+', left='+(window.innerWidth/2-225)+', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        /* eslint-enable space-infix-ops */
    }

    // Slides the launch screen away (instantly under reduced motion), then
    // calls onComplete.
    exit(onComplete) {
        let duration = parseFloat(Theme.token('--duration-slow', '400')) / 1000;

        if (Theme.prefersReducedMotion() || !(duration > 0)) {
            onComplete();

            return;
        }

        TweenMax.to(this.element, duration, {
            y: -this.element.offsetHeight,
            onComplete: onComplete
        });
    }

    skipClick(event) {
        if (event) {
            event.preventDefault();
            if (event.currentTarget.disabled) {
                return;
            }
        }
        if (this.exiting) {
            return;
        }
        this.exiting = true;

        GLOBALS.wizard.skip();
        gtag('event', 'wizard_skip');

        if (GLOBALS.browserUtils.isMobile) {
            // Unlocks speech output on iOS, which needs a user gesture.
            if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
                let msg = new SpeechSynthesisUtterance();
                msg.text = ' ';
                window.speechSynthesis.speak(msg);
            }

            GLOBALS.inputSection.createCamInput();
            GLOBALS.camInput.start();
            let launchEvent = new CustomEvent('mobileLaunch');
            window.dispatchEvent(launchEvent);
        }

        this.exit(() => {
            this.destroy();
            if (!GLOBALS.browserUtils.isMobile) {
                GLOBALS.wizard.startCamera();
            }
            GLOBALS.wizard.focusMachine();
        });
    }

    destroy() {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        document.body.classList.remove('no-scroll');
        this.element.style.display = 'none';
        this.setBackgroundInert(false);
    }

    startClick(event) {
        if (event) {
            event.preventDefault();
            if (event.currentTarget.disabled) {
                return;
            }
        }
        if (this.exiting) {
            return;
        }
        this.exiting = true;

        if (GLOBALS.browserUtils.isMobile || GLOBALS.browserUtils.isSafari) {
            GLOBALS.inputSection.createCamInput();
            GLOBALS.camInput.start();
            GLOBALS.wizard.touchPlay();
            let launchEvent = new CustomEvent('mobileLaunch');
            window.dispatchEvent(launchEvent);
        }

        this.exit(() => {
            this.destroy();
            GLOBALS.wizard.start();
            GLOBALS.wizard.focusControls();
        });
    }
}

import TweenMax from 'gsap';
import GLOBALS from './../../../config.js';
import Button from './../../components/Button.js';
import Theme from './../../components/Theme.js';

export default LaunchScreen;