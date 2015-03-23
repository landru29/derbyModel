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
    };

    _DerbySimulator.prototype.Keyframe = Keyframe;
})();