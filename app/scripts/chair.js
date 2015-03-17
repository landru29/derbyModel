(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Chair = function (position) {
        this.position = position;
        this.player = null;
    };

    /**
     * Check if the chair is free
     * @returns {boolean} TRUE if free
     */
    Chair.prototype.isFree = function () {
        return (this.player === null);
    };

    /**
     * Make a player sit on the chair
     * @param {[[Type]]} player [[Description]]
     */
    Chair.prototype.setPlayer = function (player) {
        this.player = player;
        player.setPosition(this.position);
    };

    /**
     * Get the player on the chair
     * @returns {Player} player on the chair
     */
    Chair.prototype.getPlayer = function () {
        return this.player;
    };

    _DerbySimulator.prototype.Chair = Chair;
})();