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
        
        // define a pack zone
        this.pack = new $derby.Pack(this);
        
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

    
    _DerbySimulator.prototype.Scene = Scene;
})();