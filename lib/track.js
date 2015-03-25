(function () {

    /**
     * Track object
     * @param {Scene}  scene   parent Scene
     * @param {object} options options to be passed
     */
    var Track = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();
        this.objectName = 'track';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({},
            options
        );

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Track.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Track.prototype.buildElement = function () {

        var trackElement = new _DerbySimulator.prototype.SvgElement('g', {
            class: 'track',
            'fill-rule': 'evenodd',
            id: this.id
        });

        // Track limit
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'limit',
            d: 'M -533,-777 l 1066,-62 a 808,808,180,1,1,0,1616 l -1066,62 a 808,808,180,1,1,0,-1616 z M -533,-381 l 1066,0 a 381,381,180,1,1,0,762 l -1066,0 a 381,381,180,1,1,0,-762 z'
        }));

        // Jamline
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'jam-line',
            d: 'M -533,-381 l 0,-396'
        }));

        //PivotLine
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'pivot-line',
            d: 'M 382,-381 l 0,-450'
        }));

        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'three-meters',
            d: 'M -233,-481 l 0,-200'
        }));
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'three-meters',
            d: 'M 67,-481 l 0,-200'
        }));
        /*trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M 367,-481 l 0,-200'
        }));*/

        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'three-meters',
            d: 'M 533,481 l 0,200'
        }));
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'three-meters',
            d: 'M 233,481 l 0,200'
        }));
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'three-meters',
            d: 'M -67,481 l 0,200'
        }));
        trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
            class: 'three-meters',
            d: 'M -367,481 l 0,200'
        }));

        for (var i = 1; i < 6; i++) {
            var cosinus1 = Math.cos(i * 2.14 / 3.81);
            var sinus1 = Math.sin(i * 2.14 / 3.81);
            var ray11 = 481;
            var ray12 = 681;
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M ' + Math.round(-533 - ray11 * sinus1) + ',' + Math.round(-ray11 * cosinus1) + ' L ' + Math.round(-533 - ray12 * sinus1) + ',' + Math.round(-ray12 * cosinus1)
            }));
        }

        for (var j = 1; j < 6; j++) {
            var cosinus2 = Math.cos(j * 2.14 / 3.81);
            var sinus2 = Math.sin(j * 2.14 / 3.81);
            var ray21 = 481;
            var ray22 = 681;
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M ' + Math.round(533 + ray21 * sinus2) + ',' + Math.round(ray21 * cosinus2) + ' L ' + Math.round(533 + ray22 * sinus2) + ',' + Math.round(ray22 * cosinus2)
            }));
        }

        return trackElement;
    };


    _DerbySimulator.prototype.Track = Track;
})();