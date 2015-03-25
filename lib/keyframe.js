(function () {
    /**
     * Keyframe object
     * @param {Vector}  position     (x, y) object
     * @param {Integer} milliseconds Time
     */
    var Keyframe = function (animation, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();
        
        // parent root
        this.animation = animation;
        this.scene = animation.scene;
        this.scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({
                marker: false,
                position: {
                    x: 0,
                    y: 0
                },
                milliseconds: (this.animation.keyFrames.length === 0 ? 0 : 1000)
            },
            options
        );

        

        this.position = new _DerbySimulator.prototype.Vector(this.opt.position);
        this.milliseconds = this.opt.milliseconds;

        if ('undefined' === typeof Keyframe.prototype.all) {
            Keyframe.prototype.all = [];
        }
        Keyframe.prototype.all.push(this);
        
        this.name = this.animation.keyFrames.length+1;
        
        if (this.opt.marker) {
            this.element = this.buildElement();
            this.scene.addElement(this.element);
        }
        
    };
    
     /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Keyframe.prototype.buildElement = function () {
        var elt = new _DerbySimulator.prototype.svgCross(this.position, 'keyframe', 60, this.name);
        return elt;
    };
    
    /**
     * Clean the object
     */
    Keyframe.prototype.destroy = function() {
        this.scene.unregisterObject(this);
        var elt = this.getElement();
        if (elt) {
            elt.parentElement.removeChild(elt);
        }
    };
    
    /**
     * Hide/Show the graphical representation
     * @param {boolean} state If true, the element is hidden
     */
    Keyframe.prototype.shadowElement = function(state) {
        if (state) {
            _DerbySimulator.prototype.addClass(this.getElement(), 'shadow');
        } else {
            _DerbySimulator.prototype.removeClass(this.getElement(), 'shadow');
        }
    };
    
    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Keyframe.prototype.getElement = function () {
        return this.element;
    };
    
    /**
     * Define the new positionof the keyframe (in cm)
     * @param {Vector}  point (x, y) new position in cm
     * @param {Vector}  inc (x, y) new incremental position in cm (facultative)
     */
    Keyframe.prototype.setPosition = function (point, inc) {
        if (point) {
            this.position = new _DerbySimulator.prototype.Vector(point);
        }
        if (inc) {
            this.position.add(inc);
        }
        if (this.element) {
            this.element.setAttribute('transform', 'translate(' + this.position.x + ', ' + this.position.y + ')');
        }
    };

    /**
     * Get the JSON representation of the object
     * @returns {String} JSON
     */
    Keyframe.prototype.stringify = function () {
        return '{"milliseconds":' + this.milliseconds + ',"position":' + this.position.stringify() + '}';
    };

    _DerbySimulator.prototype.Keyframe = Keyframe;
})();