(function () {
    /**
     * Bench object
     * @param {Scene} scene    parent Scene
     * @param {object} options options to be passed
     */
    var Bench = function (scene, options) {
        // generate id
        this.id = $derby.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = $derby.extend({
                position: 0,
                offset: {
                    x: 0,
                    y: 0
                }
            },
            options
        );

        // Create the chairs
        if (parseInt('' + this.opt.position, 10) === 0) {
            this.chairs = [
                new $derby.Chair({
                    x: 1400,
                    y: -830
                }),
                new $derby.Chair({
                    x: 1450,
                    y: -780
                }),
                new $derby.Chair({
                    x: 1500,
                    y: -730
                }),
                new $derby.Chair({
                    x: 1550,
                    y: -680
                }),
                new $derby.Chair({
                    x: 1600,
                    y: -630
                })
            ];
        } else {
            this.chairs = [
                new $derby.Chair({
                    x: 1400,
                    y: 800
                }),
                new $derby.Chair({
                    x: 1450,
                    y: 750
                }),
                new $derby.Chair({
                    x: 1500,
                    y: 700
                }),
                new $derby.Chair({
                    x: 1550,
                    y: 650
                }),
                new $derby.Chair({
                    x: 1600,
                    y: 600
                })
            ];
        }

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Bench.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Bench.prototype.buildElement = function () {
        var element;
        if (parseInt('' + this.opt.position, 10) === 0) {
            element = new $derby.SvgElement('g', {
                class: 'bench',
                transform: 'matrix(0.707 0.707 -0.707 0.707 ' + (this.opt.offset.x + 1400) + ' ' + (this.opt.offset.y - 900) + ')',
                id: this.id
            });
        } else {
            element = new $derby.SvgElement('g', {
                class: 'bench',
                transform: 'matrix(0.707 -0.707 0.707 0.707 ' + (this.opt.offset.x + 1325) + ' ' + (this.opt.offset.y + 805) + ')',
                id: this.id
            });
        }

        element.appendChild(new $derby.SvgElement('rect', {
            class: 'bench',
            x: 0,
            y: 0,
            width: 400,
            height: 100
        }));

        element.appendChild(new $derby.SvgElement('text', {
            fill: 'green',
            style: 'font-size:60px',
            class: 'noselect',
            x: 200,
            y: 65,
            'text-anchor': 'middle',
            transform: 'matrix(1 0 0 1 0 0)'
        }, document.createTextNode('Bench')));

        return element;
    };

    _DerbySimulator.prototype.Bench = Bench;
})();