(function () {
    /**
     * Team object
     * @param {Scene}    scene    parent Scene
     * @param {string]}  name     team name
     * @param {string}   color    team color
     * @param {integer}  position 0 | 1
     * @param {Bench}    bench    team bench
     */
    var Team = function (scene, name, color, position, bench) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        this.players = [];
        this.position = position;
        this.color = color;
        this.bench = bench;

        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[0].position,
            role: 'blocker'
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[1].position,
            role: 'blocker'
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[2].position,
            role: 'blocker'
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[3].position,
            role: 'pivot'
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[4].position,
            role: 'jammer'
        }));
    };

    /**
     * Add a player in the team
     * @param {Player} player player to add
     */
    Team.prototype.addPlayer = function (player) {
        if (this.players.indexOf(player) < 0) {
            this.players.push(player);
        }
        player.setTeam(this);
    };


    _DerbySimulator.prototype.Team = Team;
})();