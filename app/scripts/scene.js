(function(){
/**
     * Scene object
     * @param {object} options Options to be passed
     */
    var Scene = function(options) {
        // register all scene objects
        this.allObjects = {};
        
        // generate id
        this.id = $derby.getUUID();
        
        this.opt = $derby.extend(
            {
                size: {width:3250,height:2000},
                scale:1
            }, 
            options
        );
        
        // scale the global bounds
        this.opt.size.width *= this.opt.scale;
        this.opt.size.height *= this.opt.scale;
        
        // Build graphical element
        this.element = this.buildElement();
        
        // create the track
        this.track = new $derby.Track(this);
        
        // register all players
        this.allHumans = [];
        
        // Create the penalty box
        this.penaltyBox = new $derby.PenaltyBox(this);
        
        // Create the benches
        this.benches = {
            A: new $derby.Bench(this, {position:0}),
            B: new $derby.Bench(this, {position:1}),
        };
        
        // Create the teams
        this.teams = {
            A: new $derby.Team(this, 'A', 'red', 0, this.benches.A),
            B: new $derby.Team(this, 'B', 'green', 1, this.benches.B)
        };

    };
    
    /**
     * Add SVG element in the scaled area
     * @param {DomElement} elt SVG element
     */
    Scene.prototype.addElement = function(elt) {
        this.container.appendChild(elt);
    };
    
    /**
     * Register an object
     * @param {object} obj object to register
     */
    Scene.prototype.registerObject = function(obj) {
        this.allObjects[obj.id] = obj;
    };
    
    /**
     * Get an object by ID
     * @param   {string} id identifier of the object
     * @returns {object} object
     */
    Scene.prototype.findObject = function(id) {
        return this.allObjects[id];
    };
    
    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Scene.prototype.getElement = function() {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Scene.prototype.buildElement = function() {
        
        var elt = new $derby.SvgElement('svg', {
            width: this.opt.size.width,
            height: this.opt.size.height,
            version: '1.1',
            class: 'scene',
            id: this.id
        });
        elt.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        this.container = new $derby.SvgElement('g', {
            transform: 'matrix(' + this.opt.scale + ' 0 0 ' + this.opt.scale + ' ' + (1500* this.opt.scale) + ' ' + (1000* this.opt.scale) + ')'
        });

        var title = document.createElement('title');
        title.appendChild(document.createTextNode('Roller Derby'));

        var desc = document.createElement('desc');
        desc.appendChild(document.createTextNode('Roller Derby Track'));

        elt.appendChild(title);
        elt.appendChild(desc);
        elt.appendChild(this.container);
        return elt;
    };
    
    /**
     * Get all the players inside the track
     * @returns {array(Player)} list of players inside the track
     */
    Scene.prototype.getInTrackPlayers = function() {
        var playersInside = [];
        for (var i in this.allHumans) {
            if ((this.allHumans[i].humanType === 'player')){
                if (this.allHumans[i].isInTrack()) {
                    playersInside.push(this.allHumans[i]);
                }
            }
        }
        return playersInside;
    };
    
    /**
     * Define the pack
     * @returns {Array[Players]} List of players in the pack | null
     */
    Scene.prototype.computePack = function() {
        for (var i in this.allHumans) {
            $derby.removeClass(this.allHumans[i].getElement(), 'in-pack');
            delete (this.allHumans[i].forward);
            delete (this.allHumans[i].backyard);
        }
        // *** get all players inside the track which are no jammer ***
        var blockersInside = [];
        var inTrackPlayers = this.getInTrackPlayers();
        for (var j in inTrackPlayers) {
            if (inTrackPlayers[j].role !== 'jammer'){
                blockersInside.push(inTrackPlayers[j]);
            }
        }
        
        // *** build 3m groups with minimum two players from two teams ***
        // Check if a player is near (3m) a group of players
        var in3mGroup = function(playerGroup, player) {
            var inPack = false;
            for (var i in playerGroup) {
                var distance = player.trackAlgebraicDistance(playerGroup[i].position);
                if (Math.abs(distance) <= (300 + player.opt.ray + playerGroup[i].opt.ray)) {
                    if ((playerGroup[i].forward) && (distance > 0)) {
                        player.forward = true;
                        playerGroup[i].forward = false;
                    }
                    if ((playerGroup[i].backyard) && (distance < 0)) {
                        player.backyard = true;
                        playerGroup[i].backyard = false;
                    }
                    inPack = true;
                }
            }
            return inPack;
        };
        
        var maxGroupSize = 0;
        var group3mCollection = [];
        var hasTwoTeams = function(gp) {
            for (var k=1; k<gp.length; k++) {
                if (gp[k].team.id != gp[0].team.id) {
                    return true;
                }
            }
            return false;
        };
        while (blockersInside.length>0) {
            // take first player of the list an initialize a group
            var group = blockersInside.splice(0,1);
            group[0].backyard = true;
            group[0].forward = true;
            
            // Check the proximity of the other players
            for (var m = blockersInside.length-1; m>=0; m--) {
                if (in3mGroup(group, blockersInside[m])) {
                    // the player is near the group; take it from the list
                    group.push(blockersInside.splice(m, 1)[0]);
                }
            }
            // check if there is 2 teams in the group
            if (hasTwoTeams(group)) {
                // register the group of players
                group3mCollection.push(group);
                if (group.length>maxGroupSize) {
                    maxGroupSize = group.length;
                }
            }
        }
        
    
        // *** delete the tinyest groups ***
        for (var n=group3mCollection.length-1; n>=0; n--) {
            if (group3mCollection[n].length < maxGroupSize) {
                group3mCollection.splice(n,1);
            }
        }
        
        // check that there is only one group
        this.pack = null;
        if (group3mCollection.length ===1) {
            var packPlayers = group3mCollection[0];
            var backyardPlayer = null;
            var forwardPlayer = null;
            for (var p in packPlayers) {
                if (packPlayers[p].backyard) {
                    backyardPlayer = packPlayers[p];
                }
                if (packPlayers[p].forward) {
                    forwardPlayer = packPlayers[p];
                }
                $derby.addClass(packPlayers[p].getElement(), 'in-pack');
            }
            this.pack = {
                players: packPlayers,
                forward: forwardPlayer,
                backyard: backyardPlayer
            };
        }
    };
    
    _DerbySimulator.prototype.Scene = Scene;
})();