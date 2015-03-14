(function(){
/**
     * Player object
     * @param {Scene}    scene   parent Scene
     * @param {object} options options to be passed
     */
    var Player = function(scene, options) {
        // generate id
        this.id = $derby.getUUID();
        
        // parent root
        this.scene = scene;
        scene.registerObject(this);
        
        // default options
        this.opt = $derby.extend(
            {
                ray:30,
                role:'blocker',
                position: {x:0,y:0}
            }, 
            options
        );
        
        // Update position
        this.position = new $derby.Vector(this.opt.position);
        
        // Normalize role (blocker, pivot, jammer)
        this.role = this.opt.role.toLowerCase();
        
        // No team
        this.team = null;
        
        // register the player in the global list
        scene.allHumans.push(this);
        
        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
        
        // repaint the player if there is a collision
        this.checkCollision();
        
        // repaint the player if he is out of bounds
        this.isInTrack();
    };
    
    /**
     * Check the collision and make the other players move
     */
    Player.prototype.checkCollision = function() {
        //var myVector = new $derby.Vector({x:this.x, y:this.y});
        for (var i in this.scene.allHumans) {
            var player = this.scene.allHumans[i];
            if (player.id != this.id) {
                var centerDistance = this.position.distance(player.position);
                var distance = centerDistance - (this.opt.ray + player.opt.ray);
                if (distance < 0) {
                        // push the player
                        var incremental = (new $derby.Vector(player.position)).sub(this.position).normalize().coef(Math.abs(distance) * 1.2);
                        player.setPosition(null, incremental);

                }
            }
        }
    }
    
    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Player.prototype.getElement = function() {
        return this.element;
    };
    
    /**
     * Define the new positionof the player (in cm)
     * @param {Vector}  point (x, y) new position in cm
     * @param {Vector}  inc (x, y) new incremental position in cm (facultative)
     */
    Player.prototype.setPosition = function(point, inc) {
        if (point) {
            this.position = new $derby.Vector(point);
        } 
        if (inc) {
            this.position.add(inc);
        }
        this.element.setAttribute('transform', 'translate(' + this.position.x + ', ' + this.position.y + ')');

        this.checkCollision();
        this.isInTrack();
    };
    
    /**
     * Set the team of the player
     * @param {Team} team team of the player
     */
    Player.prototype.setTeam = function(team) {
        this.team = team;
        if (team.players.indexOf(this)<0) {
            team.players.push(this);
        }
        $derby.addStyle(this.mark, {
            fill: team.color
        });
    };
    
    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Player.prototype.buildElement = function() {
        var elt = new $derby.SvgElement('g', {
            class:'player ' + this.role,
            transform: 'translate(' + this.position.x + ', ' + this.position.y + ')',
            id: this.id
        });
        
        this.border = new $derby.SvgElement('circle', {
            cx:0,
            cy:0,
            r:this.opt.ray,
            class:'player'
        });
        
        switch (this.role) {
                case 'jammer':
                    this.mark = new $derby.SvgElement('polygon', {
                        'points': '0, 25 -5.878, 8.09 -23.776, 7.725 -9.511, -3.09 -14.695, -20.225 0, -10 14.695, -20.225 9.511, -3.09 23.776, 7.725 5.878, 8.09'
                    });
                break;
                case 'pivot':
                    this.mark = new $derby.SvgElement('rect', {
                        x:-18,
                        y:-8,
                        width:36,
                        height:16,
                        style:'stroke:none'
                    });
                break;
                case 'blocker':
                default: 
                    this.mark = new $derby.SvgElement('circle', {
                        cx:0,
                        cy:0,
                        r:18,
                        style:'stroke:none'
                    });
        }
        elt.appendChild(this.border);
        elt.appendChild(this.mark);
        return elt;
    };
    
    /**
     * Check if the player is inside the track
     * @returns {Boolean} true if inside the track
     */
    Player.prototype.isInTrack = function() {
        var _self = this;
        var getExternalPolygon = function() {
            var str = '';
            var polygon = [];
            for (var angle = Math.PI/2; angle <3*Math.PI/2; angle += Math.PI/36) {
                polygon.push(new $derby.Vector({
                    x: (808 - _self.opt.ray) * Math.cos(angle)-533,
                    y: (808 - _self.opt.ray) * Math.sin(angle)+31
                }));
            }
            for (var angle = 3*Math.PI/2; angle <5*Math.PI/2; angle += Math.PI/36) {
                polygon.push(new $derby.Vector({
                    x: (808 - _self.opt.ray) * Math.cos(angle)+533,
                    y: (808 - _self.opt.ray) * Math.sin(angle)-31
                }));
            }
            return polygon;
        };
        var getInternalPolygon = function() {
            var polygon = [];
            for (var angle = Math.PI/2; angle <3*Math.PI/2; angle += Math.PI/36) {
                polygon.push(new $derby.Vector({
                    x: (381 + _self.opt.ray) * Math.cos(angle)-533,
                    y: (381 + _self.opt.ray) * Math.sin(angle)
                }));
            }
            for (var angle = 3*Math.PI/2; angle <5*Math.PI/2; angle += Math.PI/36) {
                polygon.push(new $derby.Vector({
                    x: (381 + _self.opt.ray) * Math.cos(angle)+533,
                    y: (381 + _self.opt.ray) * Math.sin(angle)
                }));
            }
            return polygon;
        };
        
        if (($derby.isPointInPoly(getExternalPolygon(), this.position)) && (!$derby.isPointInPoly(getInternalPolygon(), this.position))) {
            $derby.addStyle(this.border, {stroke:null});
            return true;
        } else {
            $derby.addStyle(this.border, {stroke:'#aaaaaa'});
            return false;
        }
    };
    
    Player.prototype.trackDistance = function(refPoint) {
        var ray = 534;
        var projection = function(point) {
            //The origin of the projection is the pivot line
            if ((point.x>=-533) && (point.x<=533)) {
                // The projection will be on the linear part
                if (pointn.y>0) {
                    return Math.PI * ray + 533 + point.y; 
                } else {
                    return 2 * Math.PI * ray + 3 * 533 - point.y;
                }
            }
            if (this.x<-533) {
                var alpha = (Math.atan( point.y / (point.x+533)) + Math.PI/2) % Math.PI;
                return ray * alpha;
                // The projection is on the curved part, near the pivot line
            }
            if (this.x>533) {
                var alpha = Math.PI/2 - Math.atan(point.y / (point.x-533));
                return Math.PI * ray + 2 * 533 + ray * alpha;
                // The projection is on the curved part, at the oppisite of the pivot line
            }
        };
        var projectionPerimeter = 533 * 4 + 2 * Math.PI * ray;
        
        var playerPosition = projection(this.position);
        var refPosition = projection(refPoint);
        return Math.min(
            Math.abs(playerPosition - refPosition), 
            Math.abs(projectionPerimeter + refPosition - playerPosition) % projectionPerimeter
        );
    }
    
    
    _DerbySimulator.prototype.Player = Player;
})();