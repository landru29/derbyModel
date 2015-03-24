(function () {
    /**
     * Keyframe object
     * @param {Vector}  position     (x, y) object
     * @param {Integer} milliseconds Time
     */
    var Keyframe = function (position, milliseconds) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();
        this.milliseconds = milliseconds;
        this.position = new _DerbySimulator.prototype.Vector(position);
        
        if ('undefined' === typeof Keyframe.prototype.all) {
            Keyframe.prototype.all = [];
        }
        Keyframe.prototype.all.push(this);
    };
    
    /**
     * Get the JSON representation of the object
     * @returns {String} JSON
     */
    Keyframe.prototype.stringify = function() {
        return '{"milliseconds":' + this.milliseconds + ',"position":' + this.position.stringify() + '}';
    };

    _DerbySimulator.prototype.Keyframe = Keyframe;
})();