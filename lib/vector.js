(function () {
    /**
     * Vector object
     * @param {Object} data (x,y) object
     */
    var Vector = function (data) {
        _DerbySimulator.prototype.object.call(this, null, null, null, false);

        this.objectName = 'track';

        this.x = (data.x ? data.x : 0);
        this.y = (data.y ? data.y : 0);
        // embeded data
        if ('undefined' !== typeof data.data) {
            this.data = data.data;
        }
    };

    Vector.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Compute distance between 2 points
         * @param   {Vector}   point Second point
         * @returns {fload} distance
         */
        distance: function (point) {
            return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        },

        /**
         * Add this vector to another
         * @param {Vector} vect vector to add
         * @returns {Vector} this vector
         */
        add: function (vect) {
            this.x += vect.x;
            this.y += vect.y;
            return this;
        },

        /**
         * Substract another vector from this vector
         * @param {Vector} vect vector to substract
         * @returns {Vector} this vector
         */
        sub: function (vect) {
            this.x -= vect.x;
            this.y -= vect.y;
            return this;
        },

        /**
         * Normalize a vector (meaning that its length is 1)
         * @returns {Vector} this vector
         */
        normalize: function () {
            var distance = this.distance(new Vector({
                x: 0,
                y: 0
            }));
            this.x /= (distance > 0 ? distance : 1);
            this.y /= (distance > 0 ? distance : 1);
            return this;
        },

        /**
         * Apply a coefficient to the vector
         * @param {float} number coefficient to apply
         * @returns {Vector} this vector
         */
        coef: function (number) {
            this.x *= number;
            this.y *= number;
            return this;
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            return JSON.stringify({
                x: this.x,
                y: this.y
            });
        },

        /**
         * Check if the vector is null
         * @returns {boolean} true if null
         */
        isZero: function () {
            return ((this.x === 0) && (this.y === 0));
        }
    });

    _DerbySimulator.prototype.Vector = Vector;
})();