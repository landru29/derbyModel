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
        }

    };
    
    /**
     * Add SVG element in the scaled area
     * @param {DomElement} elt SVG element
     */
    Scene.prototype.addElement = function(elt) {
        this.container.appendChild(elt);
    }
    
    /**
     * Register an object
     * @param {object} obj object to register
     */
    Scene.prototype.registerObject = function(obj) {
        this.allObjects[obj.id] = obj;
    }
    
    /**
     * Get an object by ID
     * @param   {string} id identifier of the object
     * @returns {object} object
     */
    Scene.prototype.findObject = function(id) {
        return this.allObjects[id];
    }
    
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
    
    Scene.prototype.getPack = function() {
        // *** get all players inside the track which are no jammer ***
        var playersInside = [];
        for (var i in this.allHumans) {
            if ((this.allHumans[i].humanType === 'player') && 
                (this.allHumans[i].role !== 'jammer') && 
                (this.allHumans[i].isInTrack())) {
                playersInside.push(this.allHumans[i]);
            }
        }
        
        // *** build 3m groups with minimum two players from two teams ***
        // Check if a player is near (3m) a group of players
        var in3mGroup = function(playerGroup, player) {
            for (var i in playerGroup) {
                if (player.trackDistance(playerGroup[i].position)<=300) {
                    return true;
                }
            }
            return false;
        };
        
        var maxGroupSize = 0;
        var group3mCollection = [];
        while (playersInside.length>0) {
            // take first player of the list an initialize a group
            var group = playersInside.splice(0,1);
            
            // Check the proximity of the other players
            for (var i = playersInside.length-1; i>=0; i--) {
                if (in3mGroup(group, playersInside[i])) {
                    // the player is near the group; take it from the list
                    group.push(playersInside.splice(i, 1)[0]);
                }
            }
            // check if there is 2 teams in the group
            if ((function(gp) {
                    for (var i=1; i<group.length; i++) {
                        if (group[i].team.id != group[0].team.id) {
                            return true;
                        }
                    }
                    return false;
                })(group)) {
                // register the group of players
                group3mCollection.push(group);
                if (group.length>maxGroupSize) {
                    maxGroupSize = group.length;
                }
            }
        }
        
    
        // get the largest group
        for (var i=group3mCollection.length-1; i>=0; i--) {
            if (group3mCollection[i].length < maxGroupSize) {
                group3mCollection.splice(i,1);
            }
        }
        
        if (group3mCollection.length ===1) {
            return group3mCollection[0];
        } else {
            return null
        }
    }
    
    _DerbySimulator.prototype.Scene = Scene;
})();