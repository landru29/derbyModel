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
        this.objectName = 'scene';

        this.opt = _DerbySimulator.prototype.extend({
                size: {
                    width: 3250,
                    height: 2000
                },
                scale: 1,
                edit: false,
                interactive: true
            },
            options
        );

        this.editMode = this.opt.edit;
        this.interactive = this.opt.interactive;
        this.scale = this.opt.scale;

        // scale the global bounds
        this.opt.size.width *= this.scale;
        this.opt.size.height *= this.scale;

        // Build graphical element
        this.element = this.buildElement();
        
        // mouse drag
        this.launchInteraction();

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

    Scene.prototype.setEditMode = function (state) {
        this.editMode = state;
        var allKeyframes = this.getObjectByType('keyframe');
        for (var i in allKeyframes) {
            var elt = allKeyframes[i].getElement();
            if (state) {
                _DerbySimulator.prototype.removeClass(elt, 'production');
            } else {
                _DerbySimulator.prototype.addClass(elt, 'production');
            }
        }
    };
    
    /**
     * Set the scale of the scene
     * @param {float} scale Scale value
     */
    Scene.prototype.setScale = function(scale) {
        this.opt.size.width =  scale * this.opt.size.width / this.scale;
        this.opt.size.height = scale * this.opt.size.height / this.scale;
        this.scale = scale;
        var elt = this.getElement();
        elt.setAttribute('width', this.opt.size.width);
        elt.setAttribute('height', this.opt.size.height);
        this.container.setAttribute('transform', 'matrix(' + this.scale + ' 0 0 ' + this.scale + ' ' + (1500 * this.scale) + ' ' + (1000 * this.scale) + ')');
    };

    /**
     * Set the element to move
     * @param {Object} obj This object must have the method setPosition(pos, inc)
     */
    Scene.prototype.registerMovingElement = function (obj) {
        var elt = obj.getElement();
        var _self = this;
        elt.addEventListener('mousedown', function (event) {
            if ((obj.lock) || (!_self.interactive)) {
                return;
            }
            _self.interaction.movingElement = {
                obj: obj,
                clientX: event.clientX,
                clientY: event.clientY
            }
        });

        if (this.interaction.allElements.indexOf(obj) < 0) {
            this.interaction.allElements.push(obj);
        }
    };
    
    Scene.prototype.setInteractive = function(state) {
        this.interactive = state;
    };

    /**
     * Launch the interaction mode (moving elements)
     */
    Scene.prototype.launchInteraction = function () {
        var _self = this;

        this.interaction = {
            movingElement: null,
            allElements: []
        }

        this.element.addEventListener('mousemove', function (event) {
            if (_self.interaction.movingElement) {
                var increment = new _DerbySimulator.prototype.Vector({
                    x: (event.clientX - _self.interaction.movingElement.clientX) / _self.scale,
                    y: (event.clientY - _self.interaction.movingElement.clientY) / _self.scale
                });
                _self.interaction.movingElement.obj.setPosition(null, increment);
                _self.interaction.movingElement.clientX = event.clientX;
                _self.interaction.movingElement.clientY = event.clientY;
            }
        });

        this.element.addEventListener('mouseup', function (event) {
            _self.interaction.movingElement = null;
        });
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
     * Get objects by type
     * @param   {String} typeName type to filer
     * @returns {Array} list of filtered objects
     */
    Scene.prototype.getObjectByType = function (typeName) {
        var result = [];
        for (var i in this.allObjects) {
            if (this.allObjects[i].objectName === typeName) {
                result.push(this.allObjects[i]);
            }
        }
        return result;
    };

    /**
     * unregister an object
     * @param {object} obj object to register
     */
    Scene.prototype.unregisterObject = function (obj) {
        if (this.allObjects[obj.id]) {
            delete this.allObjects[obj.id];
        }
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
            transform: 'matrix(' + this.scale + ' 0 0 ' + this.scale + ' ' + (1500 * this.scale) + ' ' + (1000 * this.scale) + ')'
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
    Scene.prototype.launchAnimation = function (index, callback) {
        this.animationControl.done = false;
        //console.log('Starting animation ' + this.animationControl.id);
        var _self = this;
        for (var i in this.allHumans) {
            this.allHumans[i].selectAnimation(index);
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