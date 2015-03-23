(function () {
    /**
     * Bench object
     * @param {array[Point]} points  List of points
     */
    var Bezier = function (points) {
        this.points = (points ? points : []);
    };

    /**
     * Get the number of sections in the spline
     * @returns {Integer} number of sections
     */
    Bezier.prototype.size = function () {
        return this.points.length - 1;
    };

    /**
     * Get a point on the spline
     * @param   {Object} indexing spline index 
     *                            - {index, accuracy} : index (integer between 0 and this.size() * accuracy)
     *                            - {section, t} : section (spline section), t (float between 0 and 1)
     * @returns {Vector}  (x,y) point
     */
    Bezier.prototype.getPoint = function(indexing) {
        if ('undefined' !== typeof indexing.index) {
            var accuracy = (indexing.accuracy ? indexing.accuracy : 100);
            return this.getPoint({
                section: Math.floor(indexing.index / accuracy),
                t: indexing.index / accuracy - Math.floor(indexing.index / accuracy)
            });
        }
        
        var section = indexing.section;
        var t = indexing.t;
        
        if (section === 0) {
            return new _DerbySimulator.prototype.Vector({
                x: this.points[0].x * (1 - t) + (this.points[0].x + this.points[1].x) * t/2,
                y: this.points[0].y * (1 - t) + (this.points[0].y + this.points[1].y) * t/2
            });
        }
        if (section === this.size()) {
            return new _DerbySimulator.prototype.Vector({
                x: this.points[this.size()].x * t + (this.points[this.point.length-1].x + this.points[this.point.length-2].x) * (1 - t)/2,
                y: this.points[this.size()].y * t + (this.points[this.point.length-1].y + this.points[this.point.length-2].y) * (1 - t)/2
            });
        }
        
        var m1 = {
            x: (this.points[section - 1].x + this.points[section].x) / 2,
            y: (this.points[section - 1].y + this.points[section].y) / 2
        };
        var m2 = {
            x: (this.points[section].x + this.points[section + 1].x) / 2,
            y: (this.points[section].y + this.points[section + 1].y) / 2
        };
        var sommet = {
            x: this.points[section].x,
            y: this.points[section].y
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
    Bezier.prototype.getLength = function(accuracy) {
        var length = 0;
        var start = new _DerbySimulator.prototype.Vector(this.points[0]);
        for (var section=0; section<this.size(); section++) {
            for (var t=0; t<1; t+= 1/accuracy) {
                var next = this.getPoint({section:section, t:t});
                length += start.distance(next);
                start = next;
            }
        }
        return length;
    };
    
    /**
     * List points on the spline, equally spaced
     * @param   {Integer} amount number of points
     * @returns {Array(Vector)} List of points
     */
    Bezier.prototype.generatePoints = function(amount) {
        if (amount<2) {
            amount = 2;
        }
        var accuracy = 20 * amount;
        var step = this.getLength(accuracy)/(amount-2);
        var currentPoint = this.getPoint({index:0, accuracy:accuracy});
        var result = [currentPoint];
        var totalLength=0;
        for (var index=0; index<this.size() * accuracy; index++) {
            var point = this.getPoint({index:index, accuracy:accuracy});
            totalLength += currentPoint.distance(point);
            if (totalLength> result.length * step) {
                result.push(currentPoint);
            }
            currentPoint = point;
        }
        result.push(this.getPoint({section:this.size()-1, t:1}));
        return result;
    };

    /**
     * Generate the SVG string path
     * @param   {Integer} amount number of points
     * @returns {String} SVG string path
     */
    Bezier.prototype.svgPath = function(amount) {
        var points = this.generatePoints(amount);
        var result = 'M ' + points[0].x + ',' + points[0].y;
        for (var i=1; i<points.length; i++) {
            result += ' L ' + points[i].x + ',' + points[i].y;
        }
        return result;
    };
    
    /**
     * Define animation through the spline
     * @param {integer}  milliseconds Duration of the animation
     * @param {Integer}  steps        Number of steps
     * @param {Function} callback     Function to be invoked with parameter Vector
     * @param {Object}   obj          Object on which to work
     */
    Bezier.prototype.follow = function(milliseconds, steps, callback) {
        var animation = {
            points: this.generatePoints(steps),
            current: -1
        };
        animation.control = window.setInterval(function() {
            animation.current++;
            if (animation.current>= animation.points) {
                window.clearInterval(animation.control);
            } else {
                callback(animation.points[animation.current]);
            }
        }, milliseconds/steps);
    };


    _DerbySimulator.prototype.Bezier = Bezier;
})();