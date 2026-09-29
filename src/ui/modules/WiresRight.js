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

// Wires from each class's confidence meter to a row of bulbs at the output.
// The detected class lights its wire and bulb. See WiresLeft.js for how the
// geometry and colours work.

const BULB_RADIUS = 6;
const BULB_SPACING = 24;

class WiresRight {
    constructor(element) {
        this.element = element;
        this.activeId = null;
        this.signals = {};
        this.bulbs = {};

        this.svg = element.querySelector('.wires-svg');
        if (!this.svg) {
            this.svg = WiresLeft.createSvgElement('svg', {
                'class': 'wires-svg',
                'aria-hidden': 'true',
                'focusable': 'false'
            });
            element.appendChild(this.svg);
        }

        let targets = [
            element,
            document.querySelector('.machine__sections'),
            document.querySelector('#output-section')
        ];
        this.observer = WiresLeft.observeLayout(targets.concat(WiresLeft.getClassCards()), this.render.bind(this));
        this.render();
    }

    outputAnchor(origin) {
        let output = document.querySelector('#output-section');

        if (!output) {
            return null;
        }

        let selectors = [
            '.output__player',
            '.section__container'
        ];

        return WiresLeft.anchorPoint(output, selectors, origin);
    }

    render() {
        let origin = this.element.getBoundingClientRect();
        let width = origin.width;
        let height = origin.height;

        if (!width || !height) {
            return;
        }

        let cards = WiresLeft.getClassCards();
        let meterSelectors = ['.machine__meter'];
        let sources = cards.map((card) => WiresLeft.anchorPoint(card, meterSelectors, origin));
        let visible = sources.filter(Boolean);
        let output = this.outputAnchor(origin);
        let horizontal = height > width;
        let stackedX = horizontal ? [] : WiresLeft.stackedPositions(visible, width);
        let center = {
            x: output ? output.x : width / 2,
            y: output ? output.y : height / 2
        };

        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        this.signals = {};
        this.bulbs = {};

        let visibleIndex = 0;
        sources.forEach((source, index) => {
            if (!source) {
                return;
            }
            let offset = (visibleIndex - ((visible.length - 1) / 2)) * BULB_SPACING;
            let path = '';
            let bulb = {};

            if (horizontal) {
                bulb.x = width - BULB_RADIUS - 2;
                bulb.y = center.y + offset;
                path = `M0 ${source.y} C${width / 2} ${source.y} ${width / 2} ${bulb.y} ${bulb.x} ${bulb.y}`;
            }else {
                let startX = stackedX[visibleIndex];
                bulb.x = center.x + offset;
                bulb.y = height - BULB_RADIUS - 2;
                path = `M${startX} 0 C${startX} ${height / 2} ${bulb.x} ${height / 2} ${bulb.x} ${bulb.y}`;
            }
            visibleIndex += 1;
            this.addWire(GLOBALS.classNames[index] || 'neutral', path, bulb);
        });

        this.updateLit();
    }

    addWire(id, path, bulb) {
        this.svg.appendChild(WiresLeft.createSvgElement('path', {
            'class': 'wire',
            'd': path
        }));

        this.signals[id] = WiresLeft.createSvgElement('path', {
            'class': `wire-signal wire-signal--draw wire-signal--${id}`,
            'd': path
        });
        this.svg.appendChild(this.signals[id]);
        // Lets CSS draw the wire from end to end (see .wire-signal--draw).
        if (this.signals[id].getTotalLength) {
            this.signals[id].style.setProperty('--wire-length', Math.ceil(this.signals[id].getTotalLength()));
        }

        let group = WiresLeft.createSvgElement('g', {'class': `wire-bulb wire-bulb--${id}`});
        group.appendChild(WiresLeft.createSvgElement('circle', {
            'class': 'wire-bulb__glow',
            'cx': bulb.x,
            'cy': bulb.y,
            'r': BULB_RADIUS * 2
        }));
        group.appendChild(WiresLeft.createSvgElement('circle', {
            'class': 'wire-bulb__light',
            'cx': bulb.x,
            'cy': bulb.y,
            'r': BULB_RADIUS
        }));
        this.bulbs[id] = group;
        this.svg.appendChild(group);
    }

    updateLit() {
        Object.keys(this.signals).forEach((id) => {
            let lit = id === this.activeId;
            this.signals[id].classList.toggle('is-lit', lit);
            this.bulbs[id].classList.toggle('is-lit', lit);
        });
    }

    // Lights the detected class's wire and bulb. Called every prediction
    // frame, so it only touches the DOM when the class changes.
    highlight(id) {
        if (id === this.activeId) {
            return;
        }
        this.activeId = id;
        this.updateLit();
    }

    dehighlight() {
        if (this.activeId === null) {
            return;
        }
        this.activeId = null;
        this.updateLit();
    }

    // Kept for callers; drawing is event driven now.
    start() {
        return this;
    }

    stop() {
        return this;
    }

    renderAlt() {
        this.render();
    }

    size() {
        this.render();
    }

    updateForNewClass() {
        if (this.observer) {
            WiresLeft.getClassCards().forEach((card) => {
                this.observer.observe(card);
            });
        }
        this.render();
    }
}

import GLOBALS from './../../config.js';
import WiresLeft from './WiresLeft.js';

export default WiresRight;