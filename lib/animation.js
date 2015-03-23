(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Animation = function () {
        this.keyFrames = [];
    };
    
    /**
     * Add a keyframe in the animation
     * @param   {Vector}   position     (x,y) position
     * @param   {Integer]} milliseconds Time from the origin
     */
    Animation.prototype.addKeyFrame = function (controlPoint, milliseconds)  {
        var keyFrame = new _DerbySimulator.prototype.Keyframe(controlPoint, milliseconds);
        this.keyFrames.push(keyFrame);
        //this.sort();
        return keyFrame;
    };
    
    /**
     * Sort keyframes
     */
    /*Animation.prototype.sortKeyframes = function() {
        this.keyFrames.sort(function(a,b) {
            if (a.milliseconds>b.milliseconds) {
                return -1;
            }
            if (a.milliseconds<b.milliseconds) {
                return 1;
            }
            return 0;
        });
    };*/
    
    /**
     * Get the duration of the animation in milliseconds
     * @returns {Integer} duration in milliseconds
     */
    Animation.prototype.getDuration = function() {
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
    Animation.prototype.generatePoints = function(milliseconds) {
        var result = [];
        //this.sortKeyframes();
        for(var i=0; i<this.keyFrames[0].milliseconds; i+=milliseconds) {
            result.push(null);
        }
        result.push(this.keyFrames[0]);
        for (var time=this.keyFrames[0].milliseconds; time <= this.getDuration(); time += milliseconds) {
            result.push(this.interpolatePoint(time));
        }
        return result;
    };
    
    /**
     * Interpolate points between two keyframes
     * @param   {Integer} milliseconds Time from origin
     * @returns {Vector} Interpolated point
     */
    Animation.prototype.interpolatePoint = function(milliseconds) {
        throw '[Animation.interpolatePoint] This is a virtual class';
    };

    _DerbySimulator.prototype.Animation = Animation;
})();