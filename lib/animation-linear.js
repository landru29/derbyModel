(function () {
    /**
     * Animation object
     */
    var AnimationLinear = function () {
        this.modelClass = _DerbySimulator.prototype.Animation.prototype;
        _DerbySimulator.prototype.Animation.call(this, scene, options);
        // generate id
        //this.id = _DerbySimulator.prototype.getUUID();
        this.keyFrames = [];
        
        this.type='linear';
        this.objectName = 'animation';
    };

    /**
     * Add a keyframe in the animation
     * @param   {Vector} position       (x,y) position
     * @param   {Integer]} milliseconds Time from the origin
     */
    AnimationLinear.prototype.addKeyFrame = function (controlPoint, milliseconds) {
        return this.modelClass.addKeyFrame.call(this, controlPoint, milliseconds);
    };
    
    /**
     * Get the JSON representation of the object
     * @returns {String} JSON
     */
    AnimationLinear.prototype.stringify = function() {
        return this.modelClass.stringify.call(this);
    }

    /**
     * Get the duration of the animation in milliseconds
     * @returns {Integer} duration in milliseconds
     */
    AnimationLinear.prototype.getDuration = function () {
        return this.modelClass.getDuration.call(this);
    };
    
    /**
     * Remove a keyframe
     * @param {Keyframe} kf keyframe to remove
     */
    AnimationLinear.prototype.removeKeyframe = function(kf) {
        return this.modelClass.removeKeyframe.call(this, kf);
    };
    
    /**
     * Clean the object
     */
    AnimationLinear.prototype.destroy = function() {
        return this.modelClass.destroy.call(this);
    };

    /**
     * Interpolate points between two keyframes
     * @param   {Integer} milliseconds Time from origin
     * @returns {Vector} Interpolated point
     */
    AnimationLinear.prototype.interpolatePoint = function (milliseconds) {
        var step = (function (keyframes, time) {
            var duration = 0;
            for (var i in keyframes) {
                duration += keyframes[i].milliseconds;
                if (duration > time) {
                    return i;
                }
            }
            return keyframes.length - 1;
        })(this.keyFrames, milliseconds);

        if (step === 0) {
            return this.keyFrames[0].position;
        }
        if (step >= this.keyFrames.length) {
            return this.keyFrames[this.keyFrames.length - 1].position;
        }
        
        var originTime = 0;
        for (var i=0; i<step;i++) {
            originTime += this.keyFrames[i].milliseconds;
        }

        var fragment = (milliseconds - originTime) / this.keyFrames[step].milliseconds;
        
        return new _DerbySimulator.prototype.Vector({
            x: (1 - fragment) * this.keyFrames[step-1].position.x + fragment * this.keyFrames[step].position.x,
            y: (1 - fragment) * this.keyFrames[step-1].position.y + fragment * this.keyFrames[step].position.y
        });
    };

    /**
     * Generate the list of points for the animation
     * @param   {[[Type]]} milliseconds [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    AnimationLinear.prototype.generatePoints = function (milliseconds) {
        return this.modelClass.generatePoints.call(this, milliseconds);
    };


    _DerbySimulator.prototype.AnimationLinear = AnimationLinear;
})();