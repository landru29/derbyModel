(function () {
    /**
     * Track object
     * @param {Scene}  scene   parent Scene
     * @param {object} options options to be passed
     */
    var PenaltyBox = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({
                offset: {
                    x: 0,
                    y: 0
                }
            },
            options
        );

        // Create the chairs
        this.chairs = [
            {
                b1: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: -110
                }),
                b2: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: -180
                }),
                b3: new _DerbySimulator.prototype.Chair({
                    x: 1550,
                    y: -145
                }),
                j: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: -40
                })
            },
            {
                b1: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: 110
                }),
                b2: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: 180
                }),
                b3: new _DerbySimulator.prototype.Chair({
                    x: 1550,
                    y: 145
                }),
                j: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: 40
                })
            }
        ];

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    PenaltyBox.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    PenaltyBox.prototype.buildElement = function () {
        var element = new _DerbySimulator.prototype.SvgElement('g', {
            class: 'penalty-box',
            transform: 'matrix(0 -1 1 0 ' + (this.opt.offset.x + 1600) + ' ' + (this.opt.offset.y + 210) + ')',
            id: this.id
        });

        element.appendChild(new _DerbySimulator.prototype.SvgElement('rect', {
            class: 'penalty-box',
            x: 0,
            y: 0,
            width: 420,
            height: 100
        }));

        element.appendChild(new _DerbySimulator.prototype.SvgElement('text', {
            fill: 'red',
            style: 'font-size:60px',
            class: 'noselect',
            x: 210,
            y: 65,
            'text-anchor': 'middle',
            transform: 'matrix(1 0 0 1 0 0)'
        }, document.createTextNode('Penalty Box')));

        return element;
    };

    _DerbySimulator.prototype.PenaltyBox = PenaltyBox;
})();