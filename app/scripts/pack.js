(function(){
/**
     * Pack object
     * @param {Scene} scene    parent Scene
     * @param {object} options options to be passed
     */
    var Pack = function(scene, options) {
        // generate id
        this.id = $derby.getUUID();
        
        // parent root
        this.scene = scene;
        scene.registerObject(this);
        
        // default options
        this.opt = $derby.extend(
            {}, 
            options
        );
        
        this.players = null;
        this.forward = null;
        this.backyard = null;
        
        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };
    
    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Pack.prototype.getElement = function() {
        return this.element;
    };
    
    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Pack.prototype.buildElement = function() {
        var element = new $derby.SvgElement('g', {
            class:'pack',
            id: this.id
        });
        
        this.message =  new $derby.SvgElement('text', {
            fill: '#000000',
            style: 'font-size:100px',
            x: 0,
            y: 0,
            'text-anchor':'middle',
            class: 'noselect'
        }, document.createTextNode(''));
        
        element.appendChild(this.message);

        return element;
    };
    
    /**
     * Set a global message
     * @param {String} str message to display
     */
    Pack.prototype.setMessage = function(str) {
        var textNode = this.message.childNodes[0];
        textNode.nodeValue = (str ? str : '');
    };
    
    /**
     * Draw the pack on the track
     */
    Pack.prototype.draw = function() {
        // forward player
        var startZone = this.forward.getZone();
        switch(startZone) {
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                default:
        }
        
    };
    
    /**
     * Define the pack
     * @returns {Array[Players]} List of players in the pack | null
     */
    Pack.prototype.compute = function() {
        for (var i in this.scene.allHumans) {
            $derby.removeClass(this.scene.allHumans[i].getElement(), 'in-pack');
            delete (this.scene.allHumans[i].forward);
            delete (this.scene.allHumans[i].backyard);
        }
        // *** get all players inside the track which are no jammer ***
        var blockersInside = [];
        var inTrackPlayers = this.scene.getInTrackPlayers();
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
                    m = blockersInside.length;
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
        this.players = null;
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
            this.players = packPlayers;
            this.forward = forwardPlayer;
            this.backyard = backyardPlayer;
            this.length = Math.abs(backyardPlayer.trackAlgebraicDistance(forwardPlayer.position));
        }
        
        if (this.players === null) {
            this.setMessage('No pack !');
        } else {
            this.setMessage();
        }
    };
    
    _DerbySimulator.prototype.Pack = Pack;
})();