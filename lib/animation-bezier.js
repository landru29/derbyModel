(function () {
    /**
     * Bench object
     * @param {array[Point]} points  List of points
     */
    var AnimationBezier = function () {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();
        this.keyFrames = [];
        this.modelClass = _DerbySimulator.prototype.Animation.prototype;
    };

    /**
     * Add a keyframe in the animation
     * @param   {Vector} position       (x,y) position
     * @param   {Integer]} milliseconds Time from the origin
     */
    AnimationBezier.prototype.addKeyFrame = function (controlPoint, milliseconds) {
        return this.modelClass.addKeyFrame.call(this, controlPoint, milliseconds);
    };

    /**
     * Get the duration of the animation in milliseconds
     * @returns {Integer} duration in milliseconds
     */
    AnimationBezier.prototype.getDuration = function () {
        return this.modelClass.getDuration.call(this);
    };

    /**
     * Get a point on the spline
     * @param   {Object} indexing spline index
     *                            - {index, accuracy} : index (integer between 0 and this.size() * accuracy)
     *                            - {section, t} : section (spline section), t (float between 0 and 1)
     * @returns {Vector}  (x,y) point
     */
    AnimationBezier.prototype.getPoint = function (indexing) {
        if ('undefined' !== typeof indexing.index) {
            var accuracy = (indexing.accuracy ? indexing.accuracy : 100);
            return this.getPoint({
                section: Math.floor(indexing.index / accuracy),
                t: indexing.index / accuracy - Math.floor(indexing.index / accuracy)
            });
        }

        var section = parseInt(indexing.section, 10);
        var t = indexing.t;

        if (section === 0) {
            return new _DerbySimulator.prototype.Vector({
                x: this.keyFrames[0].position.x * (1 - t) + (this.keyFrames[0].position.x + this.keyFrames[1].position.x) * t / 2,
                y: this.keyFrames[0].position.y * (1 - t) + (this.keyFrames[0].position.y + this.keyFrames[1].position.y) * t / 2
            });
        }
        if (section === this.keyFrames.length - 1) {
            return new _DerbySimulator.prototype.Vector({
                x: this.keyFrames[this.keyFrames.length - 1].position.x * t + (this.keyFrames[this.keyFrames.length - 1].position.x + this.keyFrames[this.keyFrames.length - 2].position.x) * (1 - t) / 2,
                y: this.keyFrames[this.keyFrames.length - 1].position.y * t + (this.keyFrames[this.keyFrames.length - 1].position.y + this.keyFrames[this.keyFrames.length - 2].position.y) * (1 - t) / 2
            });
        }

        var m1 = {
            x: (this.keyFrames[section - 1].position.x + this.keyFrames[section].position.x) / 2,
            y: (this.keyFrames[section - 1].position.y + this.keyFrames[section].position.y) / 2
        };
        var m2 = {
            x: (this.keyFrames[section].position.x + this.keyFrames[section + 1].position.x) / 2,
            y: (this.keyFrames[section].position.y + this.keyFrames[section + 1].position.y) / 2
        };
        var sommet = {
            x: this.keyFrames[section].position.x,
            y: this.keyFrames[section].position.y
        };

        return new _DerbySimulator.prototype.Vector({
            x: Math.pow(1 - t, 3) * m1.x + 3 * t * Math.pow(1 - t, 2) * sommet.x + 3 * Math.pow(t, 2) * (1 - t) * sommet.x + Math.pow(t, 3) * m2.x,
            y: Math.pow(1 - t, 3) * m1.y + 3 * t * Math.pow(1 - t, 2) * sommet.y + 3 * Math.pow(t, 2) * (1 - t) * sommet.y + Math.pow(t, 3) * m2.y
        });

    };

    /**
     * Get the length of the spline
     * @param   {Integer} accuracy Accuracy; 100 is correct
     * @returns {float} length of the spline
     */
    AnimationBezier.prototype.getLength = function (accuracy) {
        var length = 0;
        var start = new _DerbySimulator.prototype.Vector(this.points[0]);
        for (var section = 0; section < this.points.length - 1; section++) {
            for (var t = 0; t < 1; t += 1 / accuracy) {
                var next = this.getPoint({
                    section: section,
                    t: t
                });
                length += start.distance(next);
                start = next;
            }
        }
        return length;
    };

    /**
     * Interpolate points between two keyframes
     * @param   {Integer} milliseconds Time from origin
     * @returns {Vector} Interpolated point
     */
    AnimationBezier.prototype.interpolatePoint = function (milliseconds) {
        var section = (function (keyframes, time) {
            var duration = keyframes[0].milliseconds;
            for (var i=1; i<keyframes.length; i+=0.5) {
                duration += keyframes[Math.floor(i)].milliseconds * 0.5;
                if (milliseconds < duration) {
                    return Math.round(i-1);
                }
            }
            return keyframes.length - 1;
        })(this.keyFrames, milliseconds);
        
        var originTime = (function(keyframes, sect) {
            if (sect === 0) {
                return keyframes[0].milliseconds
            }
            var origin = 0;
            for (var i=0; i<sect;i++) {
                origin += keyframes[i].milliseconds;
            }
            origin += keyframes[sect].milliseconds/2;
            return origin;
        })(this.keyFrames, section);
        
        var duration = (function(keyframe, sect){
            if ((sect === 0) || (sect === keyframe.length-1)) {
                return keyframe[sect].milliseconds/2;
            }
            return (keyframe[sect].milliseconds + keyframe[sect+1].milliseconds)/2;
        })(this.keyFrames, section);

        return this.getPoint({
            section:section,
            t: (milliseconds - originTime) / duration
        });
    };


    /**
     * Generate the list of points for the animation
     * @param   {[[Type]]} milliseconds [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    AnimationBezier.prototype.generatePoints = function (milliseconds) {
        return this.modelClass.generatePoints.call(this, milliseconds);
    };


    _DerbySimulator.prototype.AnimationBezier = AnimationBezier;
})();