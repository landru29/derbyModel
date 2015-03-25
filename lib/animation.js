(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Animation = function (scene, options) {
        // get the scene
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({
                marker: false,
            },
            options
        );

        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        this.keyFrames = [];
    };

    /**
     * Add a keyframe in the animation
     * @param   {Vector}   position     (x,y) position
     * @param   {Integer]} milliseconds Time from the origin
     */
    Animation.prototype.addKeyFrame = function (data) {
        var keyFrame = new _DerbySimulator.prototype.Keyframe(this, {
            marker: this.opt.marker || data.marker,
            position: data.position,
            milliseconds: data.milliseconds
        });
        this.keyFrames.push(keyFrame);
        //this.sort();
        return keyFrame;
    };

    /**
     * Get the duration of the animation in milliseconds
     * @returns {Integer} duration in milliseconds
     */
    Animation.prototype.getDuration = function () {
        var duration = 0;
        for (var i in this.keyFrames) {
            duration += this.keyFrames[i].milliseconds;
        }
        return duration;
    };

    /**
     * Generate the list of points for the animation
     * @param   {[[Type]]} milliseconds [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    Animation.prototype.generatePoints = function (milliseconds) {
        var result = [];
        //this.sortKeyframes();
        for (var i = 0; i < this.keyFrames[0].milliseconds; i += milliseconds) {
            result.push(null);
        }
        result.push(this.keyFrames[0].position);
        for (var time = this.keyFrames[0].milliseconds; time <= this.getDuration(); time += milliseconds) {
            result.push(this.interpolatePoint(time));
        }
        return result;
    };

    /**
     * Interpolate points between two keyframes
     * @param   {Integer} milliseconds Time from origin
     * @returns {Vector} Interpolated point
     */
    Animation.prototype.interpolatePoint = function (milliseconds) {
        throw '[Animation.interpolatePoint] This is a virtual class';
    };

    /**
     * Get the JSON representation of the object
     * @returns {String} JSON
     */
    Animation.prototype.stringify = function () {
        var result = '{"type":"' + this.type + '","keyframes":[';
        var kf = [];
        for (var i in this.keyFrames) {
            kf.push(this.keyFrames[i].stringify());
        }
        return result + kf.join(',') + ']}';
    };

    _DerbySimulator.prototype.Animation = Animation;
})();