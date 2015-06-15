window._DerbySimulator = function () {};
_DerbySimulator.prototype = {};

window.$derby = new _DerbySimulator();

(function () {

    var myObject = function(parent, options, defaultOpts, register) {
        this.id = _DerbySimulator.prototype.getUUID();
        
        // parent root
        this.parent = parent;
        if (('undefined' === typeof register) || (register===true)) {
            this.allElements.push(this);
        }
        
        this.opt = _DerbySimulator.prototype.extend(defaultOpts ? defaultOpts : {}, options ? options : {});
        
    };
    
    myObject.prototype = {
        /**
         * Get the SVG element
         * @returns {DomElement} SVG element
         */
        getElement: function () {
            return this.element;
        },
        allElements:[],
        
    };
    
    
    _DerbySimulator.prototype.object= myObject;
    _DerbySimulator.prototype.inherits = function(extendedPrototype, parentPrototype) {
            var proto = Object.create('undefined' === typeof parentPrototype ? myObject.prototype : parentPrototype.prototype);
            for (var i in extendedPrototype) {
                proto[i] = extendedPrototype[i];
            }
            return proto;
        };
})();;(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Animation = function (scene, options) {
        _DerbySimulator.prototype.object.call(this, scene, options);
        // get the scene
        this.scene = scene;
        scene.registerObject(this);

        this.keyFrames = [];
        this.objectName = 'animation';
    };

    Animation.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Add a keyframe in the animation
         * @param   {Vector}   position     (x,y) position
         * @param   {Integer]} milliseconds Time from the origin
         */
        addKeyFrame: function (data) {
            var keyFrame = new _DerbySimulator.prototype.Keyframe(this, data);
            this.keyFrames.push(keyFrame);
            //this.sort();
            return keyFrame;
        },

        /**
         * Remove a keyframe
         * @param {Keyframe} kf keyframe to remove
         */
        removeKeyframe: function (kf) {
            var index = this.keyFrames.indexOf(kf);
            if (index > -1) {
                this.keyFrames.splice(index, 1);
                kf.destroy();
            }
        },

        /**
         * Clean the object
         */
        destroy: function () {
            for (var i in this.keyFrames) {
                this.keyFrames[i].destroy();
            }
            this.keyFrames = [];
            this.scene.unregisterObject(this);
        },

        /**
         * Get the duration of the animation in milliseconds
         * @returns {Integer} duration in milliseconds
         */
        getDuration: function () {
            var duration = 0;
            for (var i in this.keyFrames) {
                duration += this.keyFrames[i].milliseconds;
            }
            return duration;
        },

        /**
         * Generate the list of points for the animation
         * @param   {[[Type]]} milliseconds [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        generatePoints: function (milliseconds) {
            var result = [];
            if (this.keyFrames.length === 0) {
                return result;
            }
            //this.sortKeyframes();
            for (var i = 0; i < this.keyFrames[0].milliseconds; i += milliseconds) {
                result.push(null);
            }
            result.push(this.keyFrames[0].position);
            for (var time = this.keyFrames[0].milliseconds; time <= this.getDuration(); time += milliseconds) {
                result.push(this.interpolatePoint(time));
            }
            return result;
        },

        /**
         * Interpolate points between two keyframes
         * @param   {Integer} milliseconds Time from origin
         * @returns {Vector} Interpolated point
         */
        interpolatePoint: function (milliseconds) {
            throw '[Animation.interpolatePoint] This is a virtual class';
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            var result = '{"type":"' + this.type + '","keyframes":[';
            var kf = [];
            for (var i in this.keyFrames) {
                kf.push(this.keyFrames[i].stringify());
            }
            return result + kf.join(',') + ']}';
        }
    });

    _DerbySimulator.prototype.Animation = Animation;
})();;(function () {
    if ('undefined' !== typeof angular) {
        angular.module('roller-derby', []);

        angular.module('roller-derby').provider('rollerDerbyModel', [function () {

            var model = new _DerbySimulator();

            this.$get = [function () {
                return model;
            }];
        }]);

        angular.module('roller-derby').directive('rollerDerbyGame', ['rollerDerbyModel', function (rollerDerbyModel) {
            return {
                restrict: 'A',
                replace: false,
                scope: {
                    rollerDerbyGame: '=',
                    interactive: '=',
                    edit: '='
                },

                link: function (scope, element, attrs) {
                    element[0].appendChild(scope.rollerDerbyGame.getElement());

                    var movingElement = null;

                    scope.rollerDerbyGame.setInteractive(scope.interactive);

                    /** API **/
                    scope.rollerDerbyGame.api = {
                        hideAllKeyframes: function () {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                var elt = keyframes[i].getElement();
                                if (elt) {
                                    rollerDerbyModel.addStyle(elt, {
                                        display: 'none'
                                    });
                                }
                            }
                        },
                        showKeyFrames: function (animation) {
                            if (!animation) return;
                            var keyframes = animation.keyFrames;
                            for (var i in keyframes) {
                                rollerDerbyModel.addStyle(keyframes[i].getElement(), {
                                    display: null
                                });
                            }

                        },
                        lockAllKeyframes: function () {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                keyframes[i].setLock(true);
                            }
                        },
                        unlockKeyFrames: function (animation) {
                            if (!animation) return;
                            var keyframes = animation.keyFrames;
                            for (var i in keyframes) {
                                keyframes[i].setLock(false);
                            }

                        },
                        toggleKeyframeShadow: function (state) {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                keyframes[i].shadowElement(state);
                            }
                        },
                        launchAnimation: function (player, index) {
                            if (scope.edit) {
                                scope.rollerDerbyGame.api.toggleKeyframeShadow(true);
                            }
                            player.selectAnimation(index);
                            player.lauchAnimation(function () {
                                if (scope.edit) {
                                    scope.rollerDerbyGame.api.toggleKeyframeShadow(false);
                                }
                            });
                        },
                        launchAllAnimation: function () {
                            if (scope.edit) {
                                scope.rollerDerbyGame.api.toggleKeyframeShadow(true);
                            }
                            scope.rollerDerbyGame.launchAnimation(0, function () {
                                if (scope.edit) {
                                    scope.rollerDerbyGame.api.toggleKeyframeShadow(false);
                                }
                            });
                        },
                        addKeyframe: function (animation) {
                            var keyFrame = animation.addKeyFrame({
                                position: new rollerDerbyModel.Vector({
                                    x: 0,
                                    y: 0
                                })
                            });

                        }

                    };
                    /** API **/


                }
            };
        }]);
    }
})();;(function () {
    /**
     * Bench object
     * @param {array[Point]} points  List of points
     */
    var AnimationBezier = function (scene, options) {
        this.modelClass = _DerbySimulator.prototype.Animation.prototype;
        _DerbySimulator.prototype.Animation.call(this, scene, options);

        this.type = 'bezier';
    };

    AnimationBezier.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Get a point on the spline
         * @param   {Object} indexing spline index
         *                            - {index, accuracy} : index (integer between 0 and this.size() * accuracy)
         *                            - {section, t} : section (spline section), t (float between 0 and 1)
         * @returns {Vector}  (x,y) point
         */
        getPoint: function (indexing) {
            if ('undefined' !== typeof indexing.index) {
                var accuracy = (indexing.accuracy ? indexing.accuracy : 100);
                return this.getPoint({
                    section: Math.floor(indexing.index / accuracy),
                    t: indexing.index / accuracy - Math.floor(indexing.index / accuracy)
                });
            }

            var section = parseInt(indexing.section, 10);
            var t = indexing.t;

            if (section === 0) {
                return new _DerbySimulator.prototype.Vector({
                    x: this.keyFrames[0].position.x * (1 - t) + (this.keyFrames[0].position.x + this.keyFrames[1].position.x) * t / 2,
                    y: this.keyFrames[0].position.y * (1 - t) + (this.keyFrames[0].position.y + this.keyFrames[1].position.y) * t / 2
                });
            }
            if (section === this.keyFrames.length - 1) {
                return new _DerbySimulator.prototype.Vector({
                    x: this.keyFrames[this.keyFrames.length - 1].position.x * t + (this.keyFrames[this.keyFrames.length - 1].position.x + this.keyFrames[this.keyFrames.length - 2].position.x) * (1 - t) / 2,
                    y: this.keyFrames[this.keyFrames.length - 1].position.y * t + (this.keyFrames[this.keyFrames.length - 1].position.y + this.keyFrames[this.keyFrames.length - 2].position.y) * (1 - t) / 2
                });
            }

            var m1 = {
                x: (this.keyFrames[section - 1].position.x + this.keyFrames[section].position.x) / 2,
                y: (this.keyFrames[section - 1].position.y + this.keyFrames[section].position.y) / 2
            };
            var m2 = {
                x: (this.keyFrames[section].position.x + this.keyFrames[section + 1].position.x) / 2,
                y: (this.keyFrames[section].position.y + this.keyFrames[section + 1].position.y) / 2
            };
            var sommet = {
                x: this.keyFrames[section].position.x,
                y: this.keyFrames[section].position.y
            };

            return new _DerbySimulator.prototype.Vector({
                x: Math.pow(1 - t, 3) * m1.x + 3 * t * Math.pow(1 - t, 2) * sommet.x + 3 * Math.pow(t, 2) * (1 - t) * sommet.x + Math.pow(t, 3) * m2.x,
                y: Math.pow(1 - t, 3) * m1.y + 3 * t * Math.pow(1 - t, 2) * sommet.y + 3 * Math.pow(t, 2) * (1 - t) * sommet.y + Math.pow(t, 3) * m2.y
            });

        },

        /**
         * Get the length of the spline
         * @param   {Integer} accuracy Accuracy; 100 is correct
         * @returns {float} length of the spline
         */
        getLength: function (accuracy) {
            var length = 0;
            var start = new _DerbySimulator.prototype.Vector(this.points[0]);
            for (var section = 0; section < this.points.length - 1; section++) {
                for (var t = 0; t < 1; t += 1 / accuracy) {
                    var next = this.getPoint({
                        section: section,
                        t: t
                    });
                    length += start.distance(next);
                    start = next;
                }
            }
            return length;
        },

        /**
         * Interpolate points between two keyframes
         * @param   {Integer} milliseconds Time from origin
         * @returns {Vector} Interpolated point
         */
        interpolatePoint: function (milliseconds) {
            var section = (function (keyframes, time) {
                var duration = keyframes[0].milliseconds;
                for (var i = 1; i < keyframes.length; i += 0.5) {
                    duration += keyframes[Math.floor(i)].milliseconds * 0.5;
                    if (milliseconds < duration) {
                        return Math.round(i - 1);
                    }
                }
                return keyframes.length - 1;
            })(this.keyFrames, milliseconds);

            var originTime = (function (keyframes, sect) {
                if (sect === 0) {
                    return keyframes[0].milliseconds
                }
                var origin = 0;
                for (var i = 0; i < sect; i++) {
                    origin += keyframes[i].milliseconds;
                }
                origin += keyframes[sect].milliseconds / 2;
                return origin;
            })(this.keyFrames, section);

            var duration = (function (keyframe, sect) {
                if (sect === keyframe.length - 1) {
                    return keyframe[sect].milliseconds / 2;
                }
                if (sect === 0) {
                    return keyframe[1].milliseconds / 2;
                }
                return (keyframe[sect].milliseconds + keyframe[sect + 1].milliseconds) / 2;
            })(this.keyFrames, section);

            return this.getPoint({
                section: section,
                t: (milliseconds - originTime) / (duration ? duration : 1)
            });
        }
    }, _DerbySimulator.prototype.Animation);


    _DerbySimulator.prototype.AnimationBezier = AnimationBezier;
})();;(function () {
    /**
     * Animation object
     */
    var AnimationLinear = function (scene, options) {
        this.modelClass = _DerbySimulator.prototype.Animation.prototype;
        _DerbySimulator.prototype.Animation.call(this, scene, options);

        this.type = 'linear';
    };

    AnimationLinear.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Interpolate points between two keyframes
         * @param   {Integer} milliseconds Time from origin
         * @returns {Vector} Interpolated point
         */
        interpolatePoint: function (milliseconds) {
            var step = (function (keyframes, time) {
                var duration = 0;
                for (var i in keyframes) {
                    duration += keyframes[i].milliseconds;
                    if (duration > time) {
                        return i;
                    }
                }
                return keyframes.length - 1;
            })(this.keyFrames, milliseconds);

            if (step === 0) {
                return this.keyFrames[0].position;
            }
            if (step >= this.keyFrames.length) {
                return this.keyFrames[this.keyFrames.length - 1].position;
            }

            var originTime = 0;
            for (var i = 0; i < step; i++) {
                originTime += this.keyFrames[i].milliseconds;
            }

            var fragment = (milliseconds - originTime) / this.keyFrames[step].milliseconds;

            return new _DerbySimulator.prototype.Vector({
                x: (1 - fragment) * this.keyFrames[step - 1].position.x + fragment * this.keyFrames[step].position.x,
                y: (1 - fragment) * this.keyFrames[step - 1].position.y + fragment * this.keyFrames[step].position.y
            });
        }
        
    }, _DerbySimulator.prototype.Animation);


    _DerbySimulator.prototype.AnimationLinear = AnimationLinear;
})();;(function () {
    /**
     * Bench object
     * @param {Scene} scene    parent Scene
     * @param {object} options options to be passed
     */
    var Bench = function (scene, options) {
        _DerbySimulator.prototype.object.call(this, scene, options, {
                position: 0,
                offset: {
                    x: 0,
                    y: 0
                }
            });

        this.objectName = 'bench';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // Create the chairs
        if (parseInt('' + this.opt.position, 10) === 0) {
            this.chairs = [
                new _DerbySimulator.prototype.Chair({
                    x: 1400,
                    y: -830
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1450,
                    y: -780
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1500,
                    y: -730
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1550,
                    y: -680
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1600,
                    y: -630
                })
            ];
        } else {
            this.chairs = [
                new _DerbySimulator.prototype.Chair({
                    x: 1400,
                    y: 800
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1450,
                    y: 750
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1500,
                    y: 700
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1550,
                    y: 650
                }),
                new _DerbySimulator.prototype.Chair({
                    x: 1600,
                    y: 600
                })
            ];
        }

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    Bench.prototype = _DerbySimulator.prototype.inherits({

        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {
            var element;
            if (parseInt('' + this.opt.position, 10) === 0) {
                element = new _DerbySimulator.prototype.SvgElement('g', {
                    class: 'bench',
                    transform: 'matrix(0.707 0.707 -0.707 0.707 ' + (this.opt.offset.x + 1400) + ' ' + (this.opt.offset.y - 900) + ')',
                    id: this.id
                });
            } else {
                element = new _DerbySimulator.prototype.SvgElement('g', {
                    class: 'bench',
                    transform: 'matrix(0.707 -0.707 0.707 0.707 ' + (this.opt.offset.x + 1325) + ' ' + (this.opt.offset.y + 805) + ')',
                    id: this.id
                });
            }

            element.appendChild(new _DerbySimulator.prototype.SvgElement('rect', {
                class: 'bench',
                x: 0,
                y: 0,
                width: 400,
                height: 100
            }));

            element.appendChild(new _DerbySimulator.prototype.SvgElement('text', {
                fill: 'green',
                style: 'font-size:60px',
                class: 'noselect',
                x: 200,
                y: 65,
                'text-anchor': 'middle',
                transform: 'matrix(1 0 0 1 0 0)'
            }, document.createTextNode('Bench')));

            return element;
        }
    });

    _DerbySimulator.prototype.Bench = Bench;
})();;(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Chair = function (position) {
        _DerbySimulator.prototype.object.call(this, null, null, null, false);

        this.objectName = 'chair';

        this.position = position;
        this.player = null;
    };

    Chair.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Check if the chair is free
         * @returns {boolean} TRUE if free
         */
        isFree: function () {
            return (this.player === null);
        },

        /**
         * Make a player sit on the chair
         * @param {[[Type]]} player [[Description]]
         */
        setPlayer: function (player) {
            this.player = player;
            player.setPosition(this.position);
        },

        /**
         * Get the player on the chair
         * @returns {Player} player on the chair
         */
        getPlayer: function () {
            return this.player;
        }
    });

    _DerbySimulator.prototype.Chair = Chair;
})();;(function () {
    /**
     * Keyframe object
     * @param {Vector}  position     (x, y) object
     * @param {Integer} milliseconds Time
     */
    var Keyframe = function (animation, options) {
        _DerbySimulator.prototype.object.call(this, animation, options, {
                position: {
                    x: 0,
                    y: 0
                },
                milliseconds: (animation.keyFrames.length === 0 ? 0 : 1000)
            });

        this.objectName = 'keyframe';

        // parent root
        this.animation = animation;
        this.scene = animation.scene;
        this.scene.registerObject(this);

        // make the keyframe insensitive to the click
        this.lock = false;

        this.position = new _DerbySimulator.prototype.Vector(this.opt.position);
        this.milliseconds = this.opt.milliseconds;

        if ('undefined' === typeof Keyframe.prototype.all) {
            Keyframe.prototype.all = [];
        }
        Keyframe.prototype.all.push(this);

        this.name = this.animation.keyFrames.length + 1;

        this.element = this.buildElement();
        this.scene.addElement(this.element);

        // make it draggable
        this.scene.registerMovingElement(this);

    };

    Keyframe.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {
            var elt = new _DerbySimulator.prototype.svgCross(this.position, 'keyframe', 60, this.name);
            if (!this.scene.editMode) {
                _DerbySimulator.prototype.addClass(elt, 'production');
            }
            if (this.lock) {
                _DerbySimulator.prototype.addClass(elt, 'lock');
            }
            return elt;
        },

        /**
         * Change lock state to make the keyframe insensitive to the click
         * @param {[[Type]]} state [[Description]]
         */
        setLock: function (state) {
            var elt = this.getElement();
            this.lock = state;
            if (this.lock) {
                _DerbySimulator.prototype.addClass(elt, 'lock');
            } else {
                _DerbySimulator.prototype.removeClass(elt, 'lock');
            }
        },

        /**
         * Clean the object
         */
        destroy: function () {
            this.scene.unregisterObject(this);
            var elt = this.getElement();
            if (elt) {
                elt.parentElement.removeChild(elt);
            }
        },

        /**
         * Hide/Show the graphical representation
         * @param {boolean} state If true, the element is hidden
         */
        shadowElement: function (state) {
            if (state) {
                _DerbySimulator.prototype.addClass(this.getElement(), 'shadow');
            } else {
                _DerbySimulator.prototype.removeClass(this.getElement(), 'shadow');
            }
        },

        /**
         * Define the new positionof the keyframe (in cm)
         * @param {Vector}  point (x, y) new position in cm
         * @param {Vector}  inc (x, y) new incremental position in cm (facultative)
         */
        setPosition: function (point, inc) {
            if (point) {
                this.position = new _DerbySimulator.prototype.Vector(point);
            }
            if (inc) {
                this.position.add(inc);
            }
            if (this.element) {
                this.element.setAttribute('transform', 'translate(' + this.position.x + ', ' + this.position.y + ')');
            }
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            return '{"milliseconds":' + this.milliseconds + ',"position":' + this.position.stringify() + '}';
        }
    });

    _DerbySimulator.prototype.Keyframe = Keyframe;
})();;(function () {
    /**
     * Pack object
     * @param {Scene} scene    parent Scene
     * @param {object} options options to be passed
     */
    var Pack = function (scene, options) {
        _DerbySimulator.prototype.object.call(this, scene, options);

        this.objectName = 'pack';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        this.players = null;
        this.forward = null;
        this.backyard = null;

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    Pack.prototype = _DerbySimulator.prototype.inherits({

        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {
            var element = new _DerbySimulator.prototype.SvgElement('g', {
                class: 'pack',
                id: this.id
            });

            // Draw the message
            this.message = (function (container) {
                var msgElt = new _DerbySimulator.prototype.SvgElement('text', {
                    fill: '#000000',
                    style: 'font-size:100px',
                    x: 0,
                    y: 0,
                    'text-anchor': 'middle',
                    class: 'noselect'
                }, document.createTextNode(''));
                container.appendChild(msgElt);
                return msgElt;
            })(element);

            // draw the pack delimiter
            this.delimiter = (function (container) {
                var delimiter = new _DerbySimulator.prototype.SvgElement('path', {
                    d: 'M 0,0'
                });

                var packElt = new _DerbySimulator.prototype.SvgElement('g', {
                    class: 'pack-track',
                    'fill-rule': 'evenodd',
                    'clip-path': 'url(#pack-' + this.id + ')'
                });

                // Track limit
                packElt.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                    class: 'limit',
                    d: 'M -533,-777 l 1066,-62 a 808,808,180,1,1,0,1616 l -1066,62 a 808,808,180,1,1,0,-1616 z M -533,-381 l 1066,0 a 381,381,180,1,1,0,762 l -1066,0 a 381,381,180,1,1,0,-762 z'
                }));

                container.appendChild(new _DerbySimulator.prototype.SvgElement('clipPath', {
                    id: 'pack-' + this.id
                }, delimiter));

                container.appendChild(packElt);

                return delimiter;
            })(element);

            // draw the engagement zone
            this.engagementZone = (function (container) {
                var engagementElt = new _DerbySimulator.prototype.SvgElement('g', {
                    class: 'engagement-zone',
                });
                var forward = new _DerbySimulator.prototype.SvgElement('path', {
                    d: 'M 0,0',
                    'stroke-dasharray': '30,30',
                    class: 'forward'
                });
                var backyard = new _DerbySimulator.prototype.SvgElement('path', {
                    d: 'M 0,0',
                    'stroke-dasharray': '30,30',
                    class: 'backyard'
                });
                container.appendChild(engagementElt);
                engagementElt.appendChild(forward);
                engagementElt.appendChild(backyard);
                return {
                    forward: forward,
                    backyard: backyard
                };

            })(element);

            return element;
        },

        /**
         * Set a global message
         * @param {String} str message to display
         */
        setMessage: function (str) {
            var textNode = this.message.childNodes[0];
            textNode.nodeValue = (str ? str : '');
        },

        /**
         * Draw the pack on the track
         */
        drawPack: function () {
            if ((this.backyard) && (this.forward)) {
                var getLimitPoly = function (player, angle, end) {
                    var limitLine = '';
                    switch (player.getZone()) {
                    case 1:
                        var alpha1 = Math.PI / 2 + Math.atan(player.position.y / (-533 - player.position.x));
                        limitLine1 = (-533 - 1500 * Math.sin(alpha1)) + ',' + (-1500 * Math.cos(alpha1));
                        limitLine2 = 'L -533,0';
                        break;
                    case 2:
                        limitLine1 = player.position.x + ',1500';
                        limitLine2 = 'L ' + player.position.x + ',0 ';
                        break;
                    case 3:
                        var alpha2 = Math.PI / 2 - Math.atan(player.position.y / (player.position.x - 533));
                        limitLine1 = (533 + 1500 * Math.sin(alpha2)) + ',' + (1500 * Math.cos(alpha2));
                        limitLine2 = 'L 533,0';
                        break;
                    case 4:
                        limitLine1 = player.position.x + ',-1500';
                        limitLine2 = 'L ' + player.position.x + ',0 ';
                        break;
                    default:
                    }
                    return {
                        str: (angle ? limitLine2 + ' L ' + limitLine1 + ' A 800 800 ' + angle + ' 1 1 ' + end : 'M ' + limitLine1 + ' ' + limitLine2),
                        point: limitLine1
                    };
                };

                // Compute angle in cylindrical referential
                var a1 = Math.atan(this.forward.position.y / this.forward.position.x);
                var a2 = Math.atan(this.backyard.position.y / this.backyard.position.x);
                var deltaA = (Math.PI - (a1 - a2)) % Math.PI;

                // First line in the back of the pack
                var first = getLimitPoly(this.backyard);

                // Clipping path
                var clipPath = first.str + ' ' + getLimitPoly(this.forward, deltaA * 180 / Math.PI, first.point).str + ' z';

                // apply clipping path
                this.delimiter.setAttribute('d', clipPath);

            } else {
                this.delimiter.setAttribute('d', 'M 0,0');
            }
        },

        /**
         * Draw the engagement zone
         */
        drawEngagement: function () {
            if ((this.backyard) && (this.backyard)) {
                var ahead = (this.forward.algebraicPosition().position + 600 + 2 * this.forward.opt.ray);
                var rear = (this.backyard.algebraicPosition().position - 600 - 2 * this.backyard.opt.ray);

                var getLimitLine = function (playerProto, point) {
                    var limitLine = '';
                    switch (playerProto.getZone(point)) {
                    case 1:
                        var alpha1 = Math.PI / 2 + Math.atan(point.y / (-533 - point.x));
                        limitLine = 'M ' + (-533 - 808 * Math.sin(alpha1)) + ',' + (-808 * Math.cos(alpha1) + 31) + ' L ' + (-533 - 381 * Math.sin(alpha1)) + ',' + (-381 * Math.cos(alpha1));
                        break;
                    case 2:
                        limitLine = 'M ' + point.x + ',' + (777 - 31 * (point.x - 533) / 1066) + ' L ' + point.x + ',381 ';
                        break;
                    case 3:
                        var alpha2 = Math.PI / 2 - Math.atan(point.y / (point.x - 533));
                        limitLine = 'M ' + (533 + 808 * Math.sin(alpha2)) + ',' + (808 * Math.cos(alpha2) - 31) + ' L ' + (533 + 381 * Math.sin(alpha2)) + ',' + (381 * Math.cos(alpha2));
                        break;
                    case 4:
                        limitLine = 'M ' + point.x + ',' + (-777 - 31 * (point.x + 533) / 1066) + ' L ' + point.x + ',-381 ';
                        break;
                    default:
                    }
                    return limitLine;
                };

                this.engagementZone.backyard.setAttribute('d', getLimitLine(this.backyard, this.backyard.algebraicToCartesian(rear)));
                this.engagementZone.forward.setAttribute('d', getLimitLine(this.forward, this.forward.algebraicToCartesian(ahead)));
            } else {
                this.engagementZone.backyard.setAttribute('d', 'M 0,0');
                this.engagementZone.forward.setAttribute('d', 'M 0,0');
            }
        },

        /**
         * Draw the pack and the engagement zone
         */
        draw: function () {
            this.drawPack();
            this.drawEngagement();
        },

        /**
         * Define the pack
         * @returns {Array[Players]} List of players in the pack | null
         */
        compute: function () {
            for (var i in this.scene.allHumans) {
                _DerbySimulator.prototype.removeClass(this.scene.allHumans[i].getElement(), 'in-pack');
                delete(this.scene.allHumans[i].forward);
                delete(this.scene.allHumans[i].backyard);
            }
            // *** get all players inside the track which are no jammer ***
            var blockersInside = [];
            var inTrackPlayers = this.scene.getInTrackPlayers();
            for (var j in inTrackPlayers) {
                if (inTrackPlayers[j].role !== 'jammer') {
                    blockersInside.push(inTrackPlayers[j]);
                }
            }

            // *** build 3m groups with minimum two players from two teams ***
            // Check if a player is near (3m) a group of players
            var in3mGroup = function (playerGroup, player) {
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
            var hasTwoTeams = function (gp) {
                for (var k = 1; k < gp.length; k++) {
                    if (gp[k].team.id != gp[0].team.id) {
                        return true;
                    }
                }
                return false;
            };
            while (blockersInside.length > 0) {
                // take first player of the list an initialize a group
                var group = blockersInside.splice(0, 1);
                group[0].backyard = true;
                group[0].forward = true;

                // Check the proximity of the other players
                for (var m = blockersInside.length - 1; m >= 0; m--) {
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
                    if (group.length > maxGroupSize) {
                        maxGroupSize = group.length;
                    }
                }
            }


            // *** delete the tinyest groups ***
            for (var n = group3mCollection.length - 1; n >= 0; n--) {
                if (group3mCollection[n].length < maxGroupSize) {
                    group3mCollection.splice(n, 1);
                }
            }

            // check that there is only one group
            this.players = null;
            this.forward = null;
            this.backyard = null;
            if (group3mCollection.length === 1) {
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
                    _DerbySimulator.prototype.addClass(packPlayers[p].getElement(), 'in-pack');
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
            this.draw();
        }
    });

    _DerbySimulator.prototype.Pack = Pack;
})();;(function () {
    /**
     * Track object
     * @param {Scene}  scene   parent Scene
     * @param {object} options options to be passed
     */
    var PenaltyBox = function (scene, options) {
        _DerbySimulator.prototype.object.call(this, scene, options, {
                offset: {
                    x: 0,
                    y: 0
                }
            });
        // generate id
        //this.id = _DerbySimulator.prototype.getUUID();
        this.objectName = 'penalty-box';

        // parent root
        this.scene = scene;
        scene.registerObject(this);


        // Create the chairs
        this.chairs = [
            {
                b1: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: -110
                }),
                b2: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: -180
                }),
                b3: new _DerbySimulator.prototype.Chair({
                    x: 1550,
                    y: -145
                }),
                j: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: -40
                })
            },
            {
                b1: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: 110
                }),
                b2: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: 180
                }),
                b3: new _DerbySimulator.prototype.Chair({
                    x: 1550,
                    y: 145
                }),
                j: new _DerbySimulator.prototype.Chair({
                    x: 1650,
                    y: 40
                })
            }
        ];

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    PenaltyBox.prototype = _DerbySimulator.prototype.inherits({

        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {
            var element = new _DerbySimulator.prototype.SvgElement('g', {
                class: 'penalty-box',
                transform: 'matrix(0 -1 1 0 ' + (this.opt.offset.x + 1600) + ' ' + (this.opt.offset.y + 210) + ')',
                id: this.id
            });

            element.appendChild(new _DerbySimulator.prototype.SvgElement('rect', {
                class: 'penalty-box',
                x: 0,
                y: 0,
                width: 420,
                height: 100
            }));

            element.appendChild(new _DerbySimulator.prototype.SvgElement('text', {
                fill: 'red',
                style: 'font-size:60px',
                class: 'noselect',
                x: 210,
                y: 65,
                'text-anchor': 'middle',
                transform: 'matrix(1 0 0 1 0 0)'
            }, document.createTextNode('Penalty Box')));

            return element;
        }
    });

    _DerbySimulator.prototype.PenaltyBox = PenaltyBox;
})();;(function () {
    /**
     * Player object
     * @param {Scene}    scene   parent Scene
     * @param {object} options options to be passed
     */
    var Player = function (scene, options) {
        _DerbySimulator.prototype.object.call(this, scene, options, {
                ray: 30,
                role: 'blocker',
                position: {
                    x: 0,
                    y: 0
                },
                name: Player.prototype.all.length
            });
        
        this.objectName = 'player';

        Player.prototype.all.push(this);

        this.humanType = 'player';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // Animations
        this.animations = [];
        this.animationControl = {
            timeStep: this.scene.timeStep
        };

        this.name = this.opt.name;

        // Trajectories
        this.trajectory = [];

        // Update position
        this.position = new _DerbySimulator.prototype.Vector(this.opt.position);

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
        scene.pack.compute();
        this.isInEngagementZone();

        // make it draggable
        this.scene.registerMovingElement(this);

    };

    Player.prototype = _DerbySimulator.prototype.inherits({
        all:[],
        /**
         * Check the collision and make the other players move
         */
        checkCollision: function () {
            //var myVector = new _DerbySimulator.prototype.Vector({x:this.x, y:this.y});
            for (var i in this.scene.allHumans) {
                var player = this.scene.allHumans[i];
                if (player.id != this.id) {
                    var centerDistance = this.position.distance(player.position);
                    var distance = centerDistance - (this.opt.ray + player.opt.ray);
                    if (distance < 0) {
                        // push the player
                        var incremental = (new _DerbySimulator.prototype.Vector(player.position)).sub(this.position).normalize().coef(Math.abs(distance) * 1.2);
                        if (!incremental.isZero())  {
                            player.setPosition(null, incremental);
                        } else {
                            player.setPosition(incremental);
                        }
                    }
                }
            }
        },

        /**
         * Get the SVG element
         * @returns {DomElement} SVG element
         */
        /*getElement: function () {
            return this.element;
        },*/

        /**
         * Define the new positionof the player (in cm)
         * @param {Vector}  point (x, y) new position in cm
         * @param {Vector}  inc (x, y) new incremental position in cm (facultative)
         */
        setPosition: function (point, inc) {
            if (point) {
                this.position = new _DerbySimulator.prototype.Vector(point);
            }
            if (inc) {
                this.position.add(inc);
            }
            this.element.setAttribute('transform', 'translate(' + this.position.x + ', ' + this.position.y + ')');

            this.checkCollision();
            this.isInTrack();
            this.scene.pack.compute();
            var inTrackPlayers = this.scene.getInTrackPlayers();
            for (var i in inTrackPlayers) {
                inTrackPlayers[i].isInEngagementZone();
            }
            var outTrackPlayers = this.scene.getOutTrackPlayers();
            for (var j in outTrackPlayers) {
                outTrackPlayers[j].setText(['Out of', 'bounds']);
            }
        },

        /**
         * generate the list of points in the trajectory
         * @returns {Array(Vector)} list of points in the trajectory
         */
        generateTrajectory: function (index) {
            if (this.animations.length > index) {
                this.trajectory = this.animations[index].generatePoints(this.animationControl.timeStep);
            } else {
                this.trajectory = [];
            }
            return this.trajectory;
        },

        /**
         * generate the list of points in the trajectory
         * @returns {Array(Vector)} list of points in the trajectory
         */
        selectAnimation: function (index) {
            if (!index) {
                index = 0;
            }
            this.generateTrajectory(index);
        },

        /**
         * Add points in the trajectory
         * @param {array(vector) | vector} data Points to add
         */
        addTrajectory: function (data) {
            if (('undefined' !== typeof data.x) && ('undefined' !== typeof data.y)) {
                this.trajectory.push(data);
            }
            if ('[object Array]' === Object.prototype.toString.call(data)) {
                for (var i in data) {
                    this.trajectory.push(data[i]);
                }
            }
        },

        /**
         * Get the number of position in the trajectory
         * @returns {Integer} Size
         */
        trajectorySize: function () {
            return this.trajectory.length;
        },

        /**
         * Move the player to a trajectory point
         * @param {Integer} index Trajectory keyframe
         */
        stepTrajectory: function (index) {
            var myIndex = (index < this.trajectory.length ? index : this.trajectory.length - 1);
            if (this.trajectory[myIndex]) {
                this.setPosition(this.trajectory[myIndex]);
            }
        },

        /**
         * Lauch the animation
         */
        lauchAnimation: function (callback, options) {
            if (this.trajectory.length === 0) {
                this.selectAnimation(0);
            }

            // default options
            var opt = _DerbySimulator.prototype.extend({
                    resetAtTheEnd: false
                },
                options
            );

            var originalPosition = this.position;

            this.animationControl.currentKeyFrame = 0;
            this.animationControl.done = false;
            this.animationControl.maxKeyFrame = this.trajectory.length;
            this.animationControl.id = _DerbySimulator.prototype.getUUID();
            var animation = this.animationControl;
            var _self = this;
            if (this.trajectory.length > 0) {
                this.animationControl.handler = window.setInterval(function () {
                    animation.currentKeyFrame++;
                    if (animation.currentKeyFrame >= animation.maxKeyFrame) {
                        window.clearInterval(animation.handler);
                        //console.log('End of animation   ' + animation.id);
                        _self.animationControl.done = true;
                        if (opt.resetAtTheEnd) {
                            _self.setPosition(originalPosition);
                        }
                        if (callback) {
                            callback();
                        }
                    } else {
                        _self.stepTrajectory(animation.currentKeyFrame);
                    }
                }, this.animationControl.timeStep);
            }
        },

        /**
         * Set the team of the player
         * @param {Team} team team of the player
         */
        setTeam: function (team) {
            this.team = team;
            if (team.players.indexOf(this) < 0) {
                team.players.push(this);
            }
            _DerbySimulator.prototype.addStyle(this.mark, {
                fill: team.color
            });
        },

        /**
         * Set text in bulle
         * @param {array} arrayData lines of texts to display
         */
        setText: function (arrayData) {
            var lines = this.txt.childNodes;
            for (var i = 0; i < 3; i++) {
                var node = lines[i].childNodes[0];
                if (arrayData[i]) {
                    node.nodeValue = arrayData[i];
                } else {
                    node.nodeValue = '';
                }
            }
        },

        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {
            var elt = new _DerbySimulator.prototype.SvgElement('g', {
                class: 'player ' + this.role,
                transform: 'translate(' + this.position.x + ', ' + this.position.y + ')',
                id: this.id
            });

            this.border = new _DerbySimulator.prototype.SvgElement('circle', {
                cx: 0,
                cy: 0,
                class: 'border',
                r: this.opt.ray
            });

            var bulle = new _DerbySimulator.prototype.SvgElement('g', {
                class: 'bulle',
                transform: 'scale(2,2)'
            });
            var frame = new _DerbySimulator.prototype.SvgElement('path', {
                d: 'M0,0 l 15,-30 l -20,0 a 10,10,90,0,1,-10,-10 l 0,-60 a 10,10,90,0,1,10, -10 l 110,0 a 10,10,90,0,1,10,10 l 0,60 a 10,10,90,0,1,-10,10 l -70,0 L 0,0 z',
            });
            this.txt = new _DerbySimulator.prototype.SvgElement('text', {
                x: 0
            });
            this.txt.appendChild(new _DerbySimulator.prototype.SvgElement('tspan', {
                x: 0,
                y: -90
            }, document.createTextNode('')));
            this.txt.appendChild(new _DerbySimulator.prototype.SvgElement('tspan', {
                x: 0,
                y: -90,
                dy: 25
            }, document.createTextNode('')));
            this.txt.appendChild(new _DerbySimulator.prototype.SvgElement('tspan', {
                x: 0,
                y: -90,
                dy: 50
            }, document.createTextNode('')));
            bulle.appendChild(frame);
            bulle.appendChild(this.txt);

            this.mark = this.createMarker(this.role);

            elt.appendChild(this.border);
            elt.appendChild(this.mark);
            elt.appendChild(bulle);
            return elt;
        },

        /**
         * Create the marker (pivot / jammer / blocker)
         * @param   {String} role 'pivot' | 'jammer' | 'blocker'
         * @returns {DomElement} marker
         */
        createMarker: function (role) {
            var elt;
            switch (this.role) {
            case 'jammer':
                elt = new _DerbySimulator.prototype.SvgElement('polygon', {
                    points: '0, 25 -5.878, 8.09 -23.776, 7.725 -9.511, -3.09 -14.695, -20.225 0, -10 14.695, -20.225 9.511, -3.09 23.776, 7.725 5.878, 8.09',
                    class: 'mark'
                });
                break;
            case 'pivot':
                elt = new _DerbySimulator.prototype.SvgElement('rect', {
                    x: -18,
                    y: -8,
                    width: 36,
                    height: 16,
                    style: 'stroke:none',
                    class: 'mark'
                });
                break;
            case 'blocker':
                /* falls through */
            default:
                elt = new _DerbySimulator.prototype.SvgElement('circle', {
                    cx: 0,
                    cy: 0,
                    r: 18,
                    style: 'stroke:none',
                    class: 'mark'
                });
            }
            return elt;
        },

        /**
         * Check if the player is inside the track
         * @returns {Boolean} true if inside the track
         */
        isInTrack: function () {
            var _self = this;
            var getExternalPolygon = function () {
                var str = '';
                var polygon = [];
                for (var angle1 = Math.PI / 2; angle1 < 3 * Math.PI / 2; angle1 += Math.PI / 36) {
                    polygon.push(new _DerbySimulator.prototype.Vector({
                        x: (808 - _self.opt.ray) * Math.cos(angle1) - 533,
                        y: (808 - _self.opt.ray) * Math.sin(angle1) + 31
                    }));
                }
                for (var angle2 = 3 * Math.PI / 2; angle2 < 5 * Math.PI / 2; angle2 += Math.PI / 36) {
                    polygon.push(new _DerbySimulator.prototype.Vector({
                        x: (808 - _self.opt.ray) * Math.cos(angle2) + 533,
                        y: (808 - _self.opt.ray) * Math.sin(angle2) - 31
                    }));
                }
                return polygon;
            };
            var getInternalPolygon = function () {
                var polygon = [];
                for (var angle1 = Math.PI / 2; angle1 < 3 * Math.PI / 2; angle1 += Math.PI / 36) {
                    polygon.push(new _DerbySimulator.prototype.Vector({
                        x: (381 + _self.opt.ray) * Math.cos(angle1) - 533,
                        y: (381 + _self.opt.ray) * Math.sin(angle1)
                    }));
                }
                for (var angle2 = 3 * Math.PI / 2; angle2 < 5 * Math.PI / 2; angle2 += Math.PI / 36) {
                    polygon.push(new _DerbySimulator.prototype.Vector({
                        x: (381 + _self.opt.ray) * Math.cos(angle2) + 533,
                        y: (381 + _self.opt.ray) * Math.sin(angle2)
                    }));
                }
                return polygon;
            };

            if ((_DerbySimulator.prototype.isPointInPoly(getExternalPolygon(), this.position)) && (!_DerbySimulator.prototype.isPointInPoly(getInternalPolygon(), this.position))) {
                _DerbySimulator.prototype.addClass(this.getElement(), 'in-track');
                return true;
            } else {
                _DerbySimulator.prototype.removeClass(this.getElement(), 'in-track');
                return false;
            }
        },

        /**
         * Get the zone where the player is. 4 zones are defined :
         * 1 - straight part where the jammer line is
         * 2 - first curve
         * 3 - straight part at the opposite of the jammer line is
         * 4 - last curve
         * @param   {Vector} refPoint point for which the zone must be defined otherwise, the player position
         * @returns {int} zone
         */
        getZone: function (refPoint) {
            var point = (refPoint ? refPoint : this.position);
            if ((point.x >= -533) && (point.x <= 533)) {
                if (point.y > 0) {
                    return 2;
                } else {
                    return 4;
                }
            }
            if (point.x < -533) {
                return 1;
            }
            if (point.x > 533) {
                return 3;
            }
            return 0;
        },

        /**
         * Define if the player is in the engagement zone
         * @returns {Boolean} true if in engagement zone
         */
        isInEngagementZone: function () {
            // player in the track ?
            if (this.isInTrack()) {
                if (this.role !== 'jammer') {
                    this.setText(['Out of play']);
                } else {
                    this.setText(['In bounds']);
                }
                _DerbySimulator.prototype.removeClass(this.getElement(), 'out-of-play');
                // Is there a pack ?
                if (this.scene.pack.players === null) {
                    this.setText(['In bounds']);
                    return false;
                }
                // player in the pack ?
                if (this.scene.pack.players.indexOf(this) >= 0) {
                    this.setText(['In the pack']);
                    return true;
                }
                // player in front of the pack ?
                var frontDistance = this.trackAlgebraicDistance(this.scene.pack.forward.position);
                if ((frontDistance >= 0) && (frontDistance < 600 + this.opt.ray + this.scene.pack.forward.opt.ray)) {
                    this.setText(['In the', 'engagement', 'zone']);
                    return true;
                }
                //player at the back of the pack ?
                var backDistance = this.trackAlgebraicDistance(this.scene.pack.backyard.position);
                if ((backDistance <= 0) && (backDistance > -600 - this.opt.ray - this.scene.pack.backyard.opt.ray)) {
                    this.setText(['In the', 'engagement', 'zone']);
                    return true;
                }
                if (this.role === 'jammer') {
                    var jammerPos = this.trackAlgebraicDistance(this.scene.pack.backyard.position);
                    if ((this.scene.pack.length - jammerPos > 0) && (jammerPos > 0)) {
                        this.setText(['In the pack']);
                    }
                }
            } else {
                this.setText(['Out of', 'bounds']);
            }
            if (this.role !== 'jammer') {
                _DerbySimulator.prototype.addClass(this.getElement(), 'out-of-play');
            }
            return false;
        },

        /**
         * Get one-dimention position. This is the projection of the point on a médian line in the track
         * @param   {Object}   point [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        algebraicPosition: function (point) {
            var ref = (point ? point : this.position);
            var ray = 534;
            var projectionPerimeter = 533 * 4 + 2 * Math.PI * ray;
            var pos = 0;
            //The origin of the projection is the pivot line
            switch (this.getZone(ref)) {
            case 1:
                var alpha1 = Math.PI - (Math.atan(ref.y / (ref.x + 533)) + Math.PI / 2) % Math.PI;
                pos = ray * alpha1;
                // The projection is on the curved part, near the pivot line
                break;
            case 2:
                pos = Math.PI * ray + 533 + ref.x;
                break;
            case 3:
                var alpha2 = Math.PI / 2 - Math.atan(ref.y / (ref.x - 533));
                pos = Math.PI * ray + 2 * 533 + ray * alpha2;
                // The projection is on the curved part, at the oppisite of the pivot line
                break;
            case 4:
                pos = 2 * Math.PI * ray + 3 * 533 - ref.x;
                break;
            default:
            }
            return {
                position: pos,
                total: projectionPerimeter
            };
        },

        /**
         * Transform an algegraic position in 2D position (on the median line
         * @param   {float} pos Algebraic position
         * @returns {Vector}    2D position
         */
        algebraicToCartesian: function (pos) {
            var ray = 534;
            var total = 533 * 4 + 2 * Math.PI * ray;
            var position = (2 * total + pos) % total;

            if ((position > 0) && (position < Math.PI * ray)) {
                return new _DerbySimulator.prototype.Vector({
                    x: -533 - ray * Math.sin(position / ray),
                    y: -ray * Math.cos(position / ray)
                });
            }

            if ((position >= Math.PI * ray) && (position < Math.PI * ray + 1066)) {
                return new _DerbySimulator.prototype.Vector({
                    x: position - Math.PI * ray - 533,
                    y: ray
                });
            }

            if ((position >= Math.PI * ray + 1066) && (position < 2 * Math.PI * ray + 1066)) {
                return new _DerbySimulator.prototype.Vector({
                    x: 533 + ray * Math.sin((position - Math.PI * ray - 1066) / ray),
                    y: ray * Math.cos((position - Math.PI * ray - 1066) / ray)
                });
            }

            if (position >= 2 * Math.PI * ray + 1066) {
                return new _DerbySimulator.prototype.Vector({
                    x: -(position - 2 * Math.PI * ray - 1599),
                    y: -ray
                });
            }
        },

        /**
         * get the distance on the track between this player and a point
         * @param   {Vector} refPoint reference point for measurment
         * @returns {float}           distance in cm
         */
        trackAlgebraicDistance: function (refPoint) {

            var pos = this.algebraicPosition(this.position);
            var playerPosition = pos.position;
            var refPosition = this.algebraicPosition(refPoint).position;
            var total = pos.total;

            var possiblePosition = {};
            possiblePosition[Math.abs(playerPosition - refPosition)] = playerPosition - refPosition;
            possiblePosition[Math.abs(playerPosition - total - refPosition) % total] = (playerPosition - total - refPosition) % total;
            possiblePosition[Math.abs(playerPosition + total - refPosition) % total] = (playerPosition + total - refPosition) % total;

            var minimumDistance = Object.keys(possiblePosition).sort(function (a, b) {
                return (parseInt(a) > parseFloat(b));
            });
            return possiblePosition[minimumDistance[0]];
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            var anim = [];
            for (i in this.animations) {
                anim.push(this.animations[i].stringify());
            }
            var animJson = '[' + anim.join(',') + ']';
            return '{"name":"' + this.name + '","position":' + this.position.stringify() + ',"animations":' + animJson + ',"type":"' + this.humanType + '","role":"' + this.role + '"}';
        },

        /**
         * Load animations
         * @param {Object} animationData Animations to load
         * @param {Object} options       Options to pass
         */
        loadAnimation: function (animationData) {
            var animation = null;
            this.cleanAnimations();
            var animations = (Object.prototype.toString.call(animationData) === '[object Array]' ? animationData : [animationData]);

            for (var i in animations) {
                switch (animations[i].type) {
                case 'bezier':
                    animation = new _DerbySimulator.prototype.AnimationBezier(this.scene);
                    break;
                default:
                    animation = new _DerbySimulator.prototype.AnimationLinear(this.scene);
                    break;
                }
                for (var j in animations[i].keyframes) {
                    animation.addKeyFrame(animations[i].keyframes[j]);
                }
                this.animations.push(animation);
            }
        },

        /**
         * Load player parameters
         * @param {Object} data player data
         */
        loadParameters: function (data) {
            this.setPosition(data.position);
            this.name = data.name;
            this.loadAnimation(data.animations);
            var elt = this.getElement();
            _DerbySimulator.prototype.removeClass(elt, this.role);
            this.role = data.role;
            _DerbySimulator.prototype.addClass(elt, this.role);
            this.mark.parentElement.removeChild(this.mark);
            this.mark = this.createMarker(this.role);
            elt.appendChild(this.mark);
            this.setTeam(this.team);
        },

        /**
         * Trash all animations
         */
        cleanAnimations: function () {
            for (var i in this.animations) {
                this.animations[i].destroy();
            }
            this.animations = [];
        }
    });

    _DerbySimulator.prototype.Player = Player;
})();;(function () {
    /**
     * Scene object
     * @param {object} options Options to be passed
     */
    var Scene = function (options) {  
        _DerbySimulator.prototype.object.call(this, this, options, {
                size: {
                    width: 3250,
                    height: 2000
                },
                scale: 1,
                edit: false,
                interactive: true,
                timeStep: 100
            });
        // register all scene objects
        this.allObjects = {};

        this.objectName = 'scene';

        this.editMode = this.opt.edit;
        this.interactive = this.opt.interactive;
        this.scale = this.opt.scale;
        this.timeStep = this.opt.timeStep;

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

    Scene.prototype = _DerbySimulator.prototype.inherits({
        setEditMode: function (state) {
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
        },

        /**
         * Set the scale of the scene
         * @param {float} scale Scale value
         */
        setScale: function (scale) {
            this.opt.size.width = scale * this.opt.size.width / this.scale;
            this.opt.size.height = scale * this.opt.size.height / this.scale;
            this.scale = scale;
            var elt = this.getElement();
            elt.setAttribute('width', this.opt.size.width);
            elt.setAttribute('height', this.opt.size.height);
            this.container.setAttribute('transform', 'matrix(' + this.scale + ' 0 0 ' + this.scale + ' ' + (1500 * this.scale) + ' ' + (1000 * this.scale) + ')');
        },

        /**
         * Set the element to move
         * @param {Object} obj This object must have the method setPosition(pos, inc)
         */
        registerMovingElement: function (obj) {
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
        },

        /**
         * Define if elements can be meved by the user or not
         * @param {boolean} state if true, elements can be moved
         */
        setInteractive: function (state) {
            this.interactive = state;
        },

        /**
         * Launch the interaction mode (moving elements)
         */
        launchInteraction: function () {
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
        },

        /**
         * Add SVG element in the scaled area
         * @param {DomElement} elt SVG element
         */
        addElement: function (elt) {
            this.container.appendChild(elt);
        },

        /**
         * Register an object
         * @param {object} obj object to register
         */
        registerObject: function (obj) {
            this.allObjects[obj.id] = obj;
        },

        /**
         * Get objects by type
         * @param   {String} typeName type to filer
         * @returns {Array} list of filtered objects
         */
        getObjectByType: function (typeName) {
            var result = [];
            for (var i in this.allObjects) {
                if (this.allObjects[i].objectName === typeName) {
                    result.push(this.allObjects[i]);
                }
            }
            return result;
        },

        /**
         * unregister an object
         * @param {object} obj object to register
         */
        unregisterObject: function (obj) {
            if (this.allObjects[obj.id]) {
                delete this.allObjects[obj.id];
            }
        },

        /**
         * Get an object by ID
         * @param   {string} id identifier of the object
         * @returns {object} object
         */
        findObject: function (id) {
            return this.allObjects[id];
        },

        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {

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
        },

        /**
         * Get all the players inside the track
         * @returns {array(Player)} list of players inside the track
         */
        getInTrackPlayers: function () {
            var playersInside = [];
            for (var i in this.allHumans) {
                if ((this.allHumans[i].humanType === 'player')) {
                    if (this.allHumans[i].isInTrack()) {
                        playersInside.push(this.allHumans[i]);
                    }
                }
            }
            return playersInside;
        },

        /**
         * Get all the players outside the track
         * @returns {array(Player)} list of players inside the track
         */
        getOutTrackPlayers: function () {
            var playersInside = [];
            for (var i in this.allHumans) {
                if ((this.allHumans[i].humanType === 'player')) {
                    if (!this.allHumans[i].isInTrack()) {
                        playersInside.push(this.allHumans[i]);
                    }
                }
            }
            return playersInside;
        },

        /**
         * Go to a specific keyframe of the animation
         * @param {integer} index keyframe
         */
        stepAnimation: function (index) {
            for (var i in this.allHumans) {
                if ('undefined' !== this.allHumans[i].stepTrajectory) {
                    this.allHumans[i].stepTrajectory(index);
                }
            }
        },

        /**
         * Get the length of the animation
         * @returns {Integer} Size
         */
        maxKeyframe: function () {
            var maxi = 0;
            for (var i in this.allHumans) {
                maxi = Math.max(maxi, this.allHumans[i].trajectorySize());
            }
            return maxi;
        },

        /**
         * Launch a global animation on the scene
         * @param {integer} milliseconds Global duration
         */
        launchAnimation: function (index, callback) {
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
        }
    });


    _DerbySimulator.prototype.Scene = Scene;
})();;(function () {
    /**
     * Team object
     * @param {Scene}    scene    parent Scene
     * @param {string]}  name     team name
     * @param {string}   color    team color
     * @param {integer}  position 0 | 1
     * @param {Bench}    bench    team bench
     */
    var Team = function (scene, name, color, position, bench) {
        _DerbySimulator.prototype.object.call(this, scene);
        // generate id
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

    Team.prototype = _DerbySimulator.prototype.inherits({
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
    });

    _DerbySimulator.prototype.Team = Team;
})();;(function () {

        /**
         * Polyfill to extend an object with another
         * @param   {object} dest object to be extended
         * @param   {object} src  extension
         * @returns {object} dest is returned
         */
        _DerbySimulator.prototype.extend= function (dest, src) {
            for (var i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
            return dest;
        };

        /**
         * Generate a UUID
         * @returns {String} uuid
         */
        _DerbySimulator.prototype.getUUID= function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        /* jshint ignore:start */
        /**
         * Detect if a point is inside a polygone
         *  Jonas Raoni Soares Silva
         *  http://jsfromhell.com/math/is-point-in-poly [rev. #0]
         * @param   {array}    poly list of (x,y) points
         * @param   {Vector}   pt   (x,y) point
         * @returns {boolean} true | false
         */
        _DerbySimulator.prototype.isPointInPoly= function (poly, pt) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
            return c;
        };
        /* jshint ignore:end */

        /**
         * Create a svg element
         * @param   {string}     tag         name of the svg element
         * @param   {object}     attrs       list of attributes
         * @param   {domElement} child       facultative child
         * @returns {domElement} New domElement
         */
        _DerbySimulator.prototype.SvgElement= function (tag, attrs, child) {
            var elt = document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var name in attrs) {
                elt.setAttribute(name, attrs[name]);
            }
            if (child) {
                elt.appendChild(child);
            }
            return elt;
        };

        /**
         * Build a SVG cross
         * @param   {Vector}   position  (x,y) position
         * @param   {String}   className class to append
         * @param   {float}    size      height and width of the cross
         * @returns {DomElement} svg element
         */
        _DerbySimulator.prototype.svgCross= function (position, className, size, text) {
            var elt = new _DerbySimulator.prototype.SvgElement('g', {
                class: className,
                transform: 'matrix(1 0 0 1 ' + position.x + ' ' + position.y + ')'
            });

            elt.appendChild(new _DerbySimulator.prototype.SvgElement('rect', {
                x: -size / 2,
                y: -size / 2,
                width: size,
                height: size
            }));
            if ('undefined' !== typeof text) {
                elt.appendChild(new _DerbySimulator.prototype.SvgElement('text', {
                    x: 0,
                    y: 20,
                    'text-anchor': 'middle',
                    style: 'font-size:60px'
                }, document.createTextNode(text)));
            }
            elt.appendChild(new _DerbySimulator.prototype.SvgElement('line', {
                x1: -size / 2,
                y1: -size / 2,
                x2: size / 2,
                y2: size / 2
            }));
            elt.appendChild(new _DerbySimulator.prototype.SvgElement('line', {
                x1: size / 2,
                y1: -size / 2,
                x2: -size / 2,
                y2: size / 2
            }));
            return elt;
        };

        /**
         * add a style element to a dom element
         * @param {domElement} dom   Dom element to modify
         * @param {object}     style css object
         */
        _DerbySimulator.prototype.addStyle= function (dom, style) {
            var strStyle = dom.getAttribute('style');
            var serialStyle = (strStyle ? strStyle.split(';') : []);
            var newStyle = {};
            for (var i in serialStyle) {
                if (serialStyle[i].trim().length > 0) {
                    var thisStyle = serialStyle[i].split(':');
                    var name = thisStyle[0].trim();
                    var value = thisStyle[1];
                    newStyle[name] = value;
                }
            }
            _DerbySimulator.prototype.extend(newStyle, style);
            serialStyle = '';
            for (var j in newStyle) {
                if (newStyle[j] !== null) {
                    serialStyle += j + ':' + newStyle[j] + ';';
                }
            }
            dom.setAttribute('style', serialStyle);
        };

        /**
         * Add a class to a dom element
         * @param {domElement} dom   Dom element to modify
         * @param {string} className class to add
         */
        _DerbySimulator.prototype.addClass= function (dom, className) {
            var strClass = dom.getAttribute('class');
            var serialClass = (strClass ? strClass.split(' ') : []);
            if (serialClass.indexOf(className) < 0) {
                serialClass.push(className);
            }
            dom.setAttribute('class', serialClass.join(' '));
        };

        /**
         * Remove a class from a dom element
         * @param {domElement} dom   Dom element to modify
         * @param {string} className class to remove
         */
        _DerbySimulator.prototype.removeClass= function (dom, className) {
            var strClass = dom.getAttribute('class');
            var serialClass = (strClass ? strClass.split(' ') : []);
            if (serialClass.indexOf(className) >= 0) {
                serialClass.splice(serialClass.indexOf(className), 1);
            }
            dom.setAttribute('class', serialClass.join(' '));
        };

})();;(function () {

    /**
     * Track object
     * @param {Scene}  scene   parent Scene
     * @param {object} options options to be passed
     */
    var Track = function (scene, options) {
        _DerbySimulator.prototype.object.call(this, scene, options);

        this.objectName = 'track';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    Track.prototype = _DerbySimulator.prototype.inherits({

        /**
         * Build the graphical element
         * @returns {DomElement} SVG element
         */
        buildElement: function () {

            var trackElement = new _DerbySimulator.prototype.SvgElement('g', {
                class: 'track',
                'fill-rule': 'evenodd',
                id: this.id
            });

            // Track limit
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'limit',
                d: 'M -533,-777 l 1066,-62 a 808,808,180,1,1,0,1616 l -1066,62 a 808,808,180,1,1,0,-1616 z M -533,-381 l 1066,0 a 381,381,180,1,1,0,762 l -1066,0 a 381,381,180,1,1,0,-762 z'
            }));

            // Jamline
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'jam-line',
                d: 'M -533,-381 l 0,-396'
            }));

            //PivotLine
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'pivot-line',
                d: 'M 382,-381 l 0,-450'
            }));

            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M -233,-481 l 0,-200'
            }));
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M 67,-481 l 0,-200'
            }));
            /*trackElement.appendChild(new SvgElement('path', {
                class: 'three-meters',
                d:'M 367,-481 l 0,-200'
            }));*/

            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M 533,481 l 0,200'
            }));
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M 233,481 l 0,200'
            }));
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M -67,481 l 0,200'
            }));
            trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                class: 'three-meters',
                d: 'M -367,481 l 0,200'
            }));

            for (var i = 1; i < 6; i++) {
                var cosinus1 = Math.cos(i * 2.14 / 3.81);
                var sinus1 = Math.sin(i * 2.14 / 3.81);
                var ray11 = 481;
                var ray12 = 681;
                trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                    class: 'three-meters',
                    d: 'M ' + Math.round(-533 - ray11 * sinus1) + ',' + Math.round(-ray11 * cosinus1) + ' L ' + Math.round(-533 - ray12 * sinus1) + ',' + Math.round(-ray12 * cosinus1)
                }));
            }

            for (var j = 1; j < 6; j++) {
                var cosinus2 = Math.cos(j * 2.14 / 3.81);
                var sinus2 = Math.sin(j * 2.14 / 3.81);
                var ray21 = 481;
                var ray22 = 681;
                trackElement.appendChild(new _DerbySimulator.prototype.SvgElement('path', {
                    class: 'three-meters',
                    d: 'M ' + Math.round(533 + ray21 * sinus2) + ',' + Math.round(ray21 * cosinus2) + ' L ' + Math.round(533 + ray22 * sinus2) + ',' + Math.round(ray22 * cosinus2)
                }));
            }

            return trackElement;
        }
    });


    _DerbySimulator.prototype.Track = Track;
})();;(function () {
    /**
     * Vector object
     * @param {Object} data (x,y) object
     */
    var Vector = function (data) {
        _DerbySimulator.prototype.object.call(this, null, null, null, false);

        this.objectName = 'vector';

        this.x = (data.x ? data.x : 0);
        this.y = (data.y ? data.y : 0);
        // embeded data
        if ('undefined' !== typeof data.data) {
            this.data = data.data;
        }
    };

    Vector.prototype = _DerbySimulator.prototype.inherits({
        /**
         * Compute distance between 2 points
         * @param   {Vector}   point Second point
         * @returns {fload} distance
         */
        distance: function (point) {
            return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        },

        /**
         * Add this vector to another
         * @param {Vector} vect vector to add
         * @returns {Vector} this vector
         */
        add: function (vect) {
            this.x += vect.x;
            this.y += vect.y;
            return this;
        },

        /**
         * Substract another vector from this vector
         * @param {Vector} vect vector to substract
         * @returns {Vector} this vector
         */
        sub: function (vect) {
            this.x -= vect.x;
            this.y -= vect.y;
            return this;
        },

        /**
         * Normalize a vector (meaning that its length is 1)
         * @returns {Vector} this vector
         */
        normalize: function () {
            var distance = this.distance(new Vector({
                x: 0,
                y: 0
            }));
            this.x /= (distance > 0 ? distance : 1);
            this.y /= (distance > 0 ? distance : 1);
            return this;
        },

        /**
         * Apply a coefficient to the vector
         * @param {float} number coefficient to apply
         * @returns {Vector} this vector
         */
        coef: function (number) {
            this.x *= number;
            this.y *= number;
            return this;
        },

        /**
         * Get the JSON representation of the object
         * @returns {String} JSON
         */
        stringify: function () {
            return JSON.stringify({
                x: this.x,
                y: this.y
            });
        },

        /**
         * Check if the vector is null
         * @returns {boolean} true if null
         */
        isZero: function () {
            return ((this.x === 0) && (this.y === 0));
        }
    });

    _DerbySimulator.prototype.Vector = Vector;
})();
