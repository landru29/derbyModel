(function () {
    /**
     * Animation object
     */
    var AnimationLinear = function (scene, options) {
        this.modelClass = _DerbySimulator.prototype.Animation.prototype;
        _DerbySimulator.prototype.Animation.call(this, scene, options);

        this.type = 'linear';
    };

    AnimationLinear.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Interpolate points between two keyframes
         * @param   {Integer} milliseconds Time from origin
         * @returns {Vector} Interpolated point
         */
        interpolatePoint: function (milliseconds) {
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
            for (var i = 0; i < step; i++) {
                originTime += this.keyFrames[i].milliseconds;
            }

            var fragment = (milliseconds - originTime) / this.keyFrames[step].milliseconds;

            return new _DerbySimulator.prototype.Vector({
                x: (1 - fragment) * this.keyFrames[step - 1].position.x + fragment * this.keyFrames[step].position.x,
                y: (1 - fragment) * this.keyFrames[step - 1].position.y + fragment * this.keyFrames[step].position.y
            });
        }
        
    }, _DerbySimulator.prototype.Animation);


    _DerbySimulator.prototype.AnimationLinear = AnimationLinear;
})();