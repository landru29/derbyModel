(function () {
    /**
     * Keyframe object
     * @param {Vector}  position     (x, y) object
     * @param {Integer} milliseconds Time
     */
    var Keyframe = function (animation, options) {
        _DerbySimulator.prototype.object.call(this, animation, options, {
                position: {
                    x: 0,
                    y: 0
                },
                milliseconds: (animation.keyFrames.length === 0 ? 0 : 1000)
            });

        this.objectName = 'keyframe';

        // parent root
        this.animation = animation;
        this.scene = animation.scene;
        this.scene.registerObject(this);

        // make the keyframe insensitive to the click
        this.lock = false;

        this.position = new _DerbySimulator.prototype.Vector(this.opt.position);
        this.milliseconds = this.opt.milliseconds;

        if ('undefined' === typeof Keyframe.prototype.all) {
            Keyframe.prototype.all = [];
        }
        Keyframe.prototype.all.push(this);

        this.name = this.animation.keyFrames.length + 1;

        this.element = this.buildElement();
        this.scene.addElement(this.element);

        // make it draggable
        this.scene.registerMovingElement(this);

    };

    Keyframe.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {
            var elt = new _DerbySimulator.prototype.svgCross(this.position, 'keyframe', 60, this.name);
            if (!this.scene.editMode) {
                _DerbySimulator.prototype.addClass(elt, 'production');
            }
            if (this.lock) {
                _DerbySimulator.prototype.addClass(elt, 'lock');
            }
            return elt;
        },

        /**
         * Change lock state to make the keyframe insensitive to the click
         * @param {[[Type]]} state [[Description]]
         */
        setLock: function (state) {
            var elt = this.getElement();
            this.lock = state;
            if (this.lock) {
                _DerbySimulator.prototype.addClass(elt, 'lock');
            } else {
                _DerbySimulator.prototype.removeClass(elt, 'lock');
            }
        },

        /**
         * Clean the object
         */
        destroy: function () {
            this.scene.unregisterObject(this);
            var elt = this.getElement();
            if (elt) {
                elt.parentElement.removeChild(elt);
            }
        },

        /**
         * Hide/Show the graphical representation
         * @param {boolean} state If true, the element is hidden
         */
        shadowElement: function (state) {
            if (state) {
                _DerbySimulator.prototype.addClass(this.getElement(), 'shadow');
            } else {
                _DerbySimulator.prototype.removeClass(this.getElement(), 'shadow');
            }
        },

        /**
         * Define the new positionof the keyframe (in cm)
         * @param {Vector}  point (x, y) new position in cm
         * @param {Vector}  inc (x, y) new incremental position in cm (facultative)
         */
        setPosition: function (point, inc) {
            if (point) {
                this.position = new _DerbySimulator.prototype.Vector(point);
            }
            if (inc) {
                this.position.add(inc);
            }
            if (this.element) {
                this.element.setAttribute('transform', 'translate(' + this.position.x + ', ' + this.position.y + ')');
            }
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            return '{"milliseconds":' + this.milliseconds + ',"position":' + this.position.stringify() + '}';
        }
    });

    _DerbySimulator.prototype.Keyframe = Keyframe;
})();