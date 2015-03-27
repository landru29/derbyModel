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
        this.objectName = 'team';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        this.players = [];
        this.position = position;
        this.color = color;
        this.bench = bench;

        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[0].position,
            role: 'blocker',
            name: 'B1-' + name
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[1].position,
            role: 'blocker',
            name: 'B2-' + name
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[2].position,
            role: 'blocker',
            name: 'B3-' + name
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[3].position,
            role: 'pivot',
            name: 'P-' + name
        }));
        this.addPlayer(new _DerbySimulator.prototype.Player(scene, {
            position: bench.chairs[4].position,
            role: 'jammer',
            name: 'J-' + name
        }));
    };

    Team.prototype = {
        /**
         * Add a player in the team
         * @param {Player} player player to add
         */
        addPlayer: function (player) {
            if (this.players.indexOf(player) < 0) {
                this.players.push(player);
            }
            player.setTeam(this);
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            var thePlayers = [];
            for (var i in this.players) {
                thePlayers.push(this.players[i].stringify());
            }
            return '{"position":' + this.position + ',"color":"' + this.color + '","players":[' + thePlayers.join(',') + ']}';
        }
    };

    _DerbySimulator.prototype.Team = Team;
})();