(function () {
    /**
     * Vector object
     * @param {Object} data (x,y) object
     */
    var Vector = function (data) {
        this.x = (data.x ? data.x : 0);
        this.y = (data.y ? data.y : 0);
    };

    /**
     * Compute distance between 2 points
     * @param   {Vector}   point Second point
     * @returns {fload} distance
     */
    Vector.prototype.distance = function (point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    };

    /**
     * Add this vector to another
     * @param {Vector} vect vector to add
     * @returns {Vector} this vector
     */
    Vector.prototype.add = function (vect) {
        this.x += vect.x;
        this.y += vect.y;
        return this;
    };

    /**
     * Substract another vector from this vector
     * @param {Vector} vect vector to substract
     * @returns {Vector} this vector
     */
    Vector.prototype.sub = function (vect) {
        this.x -= vect.x;
        this.y -= vect.y;
        return this;
    };

    /**
     * Normalize a vector (meaning that its length is 1)
     * @returns {Vector} this vector
     */
    Vector.prototype.normalize = function () {
        var distance = this.distance(new Vector({
            x: 0,
            y: 0
        }));
        this.x /= distance;
        this.y /= distance;
        return this;
    };

    /**
     * Apply a coefficient to the vector
     * @param {float} number coefficient to apply
     * @returns {Vector} this vector
     */
    Vector.prototype.coef = function (number) {
        this.x *= number;
        this.y *= number;
        return this;
    };

    _DerbySimulator.prototype.Vector = Vector;
})();