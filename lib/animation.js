(function () {
    /**
     * Animation object
     */
    var Animation = function () {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();
        this.keyFrames = [];
    };

    /**
     * Add a keyframe in the animation
     * @param   {Vector} position       (x,y) position
     * @param   {Integer]} milliseconds Time from the origin
     */
    Animation.prototype.addKeyFrame = function (position, milliseconds)  {
        this.keyFrames.push(new _DerbySimulator.prototype.Keyframe(position, milliseconds));
        this.keyFrames.sort(function(a,b) {
            if (a.milliseconds>b.milliseconds) {
                return -1;
            }
            if (a.milliseconds<b.milliseconds) {
                return 1;
            }
            return 0;
        });
    };
    
    /**
     * Get the duration of the animation in milliseconds
     * @returns {Integer} duration in milliseconds
     */
    Animation.prototype.getDuration = function() {
        return this.keyFrames[this.keyFrames.length-1].milliseconds;
    };
    
    /**
     * Interpolate points between two keyframes
     * @param   {Integer} milliseconds Time from origin
     * @returns {Vector} Interpolated point
     */
    Annimation.prototype.interpolatePoint = function(milliseconds) {
        var step = (function(keyframes, time) {
            for (var i in keyframes) {
            if (this.keyframes[i].milliseconds>time) {
                return i;
            }
            return keyframes.length-1;
        }
        })(this.keyFrames, milliseconds);
        
        if (step === 0) {
            return this.keyFrames[0].position;
        }
        if (step >= this.keyFrames.length) {
            return this.keyFrames[this.keyFrames.length-1].position;
        }
        var originTime = this.keyFrames[step-1].milliseconds;
        var duration = this.keyFrames[step-1].milliseconds-originTime;
        var fragment = (milliseconds - originTime) / duration;
        return new _DerbySimulator.Vector({
            x: (1-fragment) * this.keyFrames[step].position.x + fragment * this.keyFrames[step-1].position.x
            y: (1-fragment) * this.keyFrames[step].position.y + fragment * this.keyFrames[step-1].position.y
        });
    };
    
    /**
     * [[Description]]
     * @param   {[[Type]]} milliseconds [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    Annimation.prototype.generatePoints = function(milliseconds) {
        var result = [];
        for(var i=0; time<this.keyFrames[0].milliseconds; i+=milliseconds) {
            result.push(null);
        }
        result.push(this.keyFrames[0]);
        for (var time=this.keyFrames[0].milliseconds; time < this.getDuration(); time += milliseconds) {
            result.push(this.interpolatePoint(time));
        }
        return result;
    };
    

    _DerbySimulator.prototype.Animation = Animation;
})();