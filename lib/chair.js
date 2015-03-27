(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Chair = function (position) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();
        this.objectName = 'chair';

        this.position = position;
        this.player = null;
    };

    Chair.prototype = {
        /**
         * Check if the chair is free
         * @returns {boolean} TRUE if free
         */
        isFree: function () {
            return (this.player === null);
        },

        /**
         * Make a player sit on the chair
         * @param {[[Type]]} player [[Description]]
         */
        setPlayer: function (player) {
            this.player = player;
            player.setPosition(this.position);
        },

        /**
         * Get the player on the chair
         * @returns {Player} player on the chair
         */
        getPlayer: function () {
            return this.player;
        }
    };

    _DerbySimulator.prototype.Chair = Chair;
})();