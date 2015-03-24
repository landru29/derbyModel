(function () {
    /**
     * Scene object
     * @param {object} options Options to be passed
     */
    var Scene = function (options) {
        // register all scene objects
        this.allObjects = {};

        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        this.opt = _DerbySimulator.prototype.extend({
                size: {
                    width: 3250,
                    height: 2000
                },
                scale: 1
            },
            options
        );

        // scale the global bounds
        this.opt.size.width *= this.opt.scale;
        this.opt.size.height *= this.opt.scale;

        // Build graphical element
        this.element = this.buildElement();

        // create the track
        this.track = new _DerbySimulator.prototype.Track(this);

        // define a pack zone
        this.pack = new _DerbySimulator.prototype.Pack(this);

        // register all players
        this.allHumans = [];

        // Create the penalty box
        this.penaltyBox = new _DerbySimulator.prototype.PenaltyBox(this);

        // Create the benches
        this.benches = {
            A: new _DerbySimulator.prototype.Bench(this, {
                position: 0
            }),
            B: new _DerbySimulator.prototype.Bench(this, {
                position: 1
            }),
        };

        // Create the teams
        this.teams = {
            A: new _DerbySimulator.prototype.Team(this, 'A', 'red', 0, this.benches.A),
            B: new _DerbySimulator.prototype.Team(this, 'B', 'green', 1, this.benches.B)
        };

        this.animationControl = {
            done: true
        };

    };

    /**
     * Add SVG element in the scaled area
     * @param {DomElement} elt SVG element
     */
    Scene.prototype.addElement = function (elt) {
        this.container.appendChild(elt);
    };

    /**
     * Register an object
     * @param {object} obj object to register
     */
    Scene.prototype.registerObject = function (obj) {
        this.allObjects[obj.id] = obj;
    };

    /**
     * Get an object by ID
     * @param   {string} id identifier of the object
     * @returns {object} object
     */
    Scene.prototype.findObject = function (id) {
        return this.allObjects[id];
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Scene.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Scene.prototype.buildElement = function () {

        var elt = new _DerbySimulator.prototype.SvgElement('svg', {
            width: this.opt.size.width,
            height: this.opt.size.height,
            version: '1.1',
            class: 'scene',
            id: this.id
        });
        elt.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        this.container = new _DerbySimulator.prototype.SvgElement('g', {
            transform: 'matrix(' + this.opt.scale + ' 0 0 ' + this.opt.scale + ' ' + (1500 * this.opt.scale) + ' ' + (1000 * this.opt.scale) + ')'
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
    Scene.prototype.getInTrackPlayers = function () {
        var playersInside = [];
        for (var i in this.allHumans) {
            if ((this.allHumans[i].humanType === 'player')) {
                if (this.allHumans[i].isInTrack()) {
                    playersInside.push(this.allHumans[i]);
                }
            }
        }
        return playersInside;
    };

    /**
     * Get all the players outside the track
     * @returns {array(Player)} list of players inside the track
     */
    Scene.prototype.getOutTrackPlayers = function () {
        var playersInside = [];
        for (var i in this.allHumans) {
            if ((this.allHumans[i].humanType === 'player')) {
                if (!this.allHumans[i].isInTrack()) {
                    playersInside.push(this.allHumans[i]);
                }
            }
        }
        return playersInside;
    };

    /**
     * Go to a specific keyframe of the animation
     * @param {integer} index keyframe
     */
    Scene.prototype.stepAnimation = function (index) {
        for (var i in this.allHumans) {
            if ('undefined' !== this.allHumans[i].stepTrajectory) {
                this.allHumans[i].stepTrajectory(index);
            }
        }
    };

    /**
     * Get the length of the animation
     * @returns {Integer} Size
     */
    Scene.prototype.maxKeyframe = function () {
        var maxi = 0;
        for (var i in this.allHumans) {
            maxi = Math.max(maxi, this.allHumans[i].trajectorySize());
        }
        return maxi;
    };

    /**
     * Launch a global animation on the scene
     * @param {integer} milliseconds Global duration
     */
    Scene.prototype.launchAnimation = function (callback) {
        this.animationControl.done = false;
        console.log('Starting animation ' + this.animationControl.id);
        var _self = this;
        for (var i in this.allHumans) {
            this.allHumans[i].lauchAnimation(function () {
                if (!_self.animationControl.done) {
                    for (var j in _self.allHumans) {
                        if (_self.allHumans[j].animationControl.currentKeyFrame < _self.allHumans[j].animationControl.maxKeyFrame) {
                            return;
                        }
                    }
                    if (callback) {
                        _self.animationControl.done = true;
                        callback();
                    }
                }
            });
        }
    };


    _DerbySimulator.prototype.Scene = Scene;
})();