var _DerbySimulator = function () {};

$derby = new _DerbySimulator();;(function () {
    if ('undefined' !== typeof angular) {
        angular.module('roller-derby', []);

        angular.module('roller-derby').provider('rollerDerbyModel', [function () {

            var model = new _DerbySimulator();

            this.$get = [function () {
                return model;
            }];
        }]);

        angular.module('roller-derby').directive('rollerDerbyGame', [function () {
            return {
                restrict: 'A',
                replace: false,
                scope: {
                    rollerDerbyGame: '=',
                    interactive: '='
                },

                link: function (scope, element, attrs) {
                    console.log(scope.rollerDerbyGame);
                    element[0].appendChild(scope.rollerDerbyGame.getElement());
                    
                    /** INTERACTIVE **/
                    if (scope.interactive) {
                        var movingPlayer = null;
                        var allPlayers = scope.rollerDerbyGame.allHumans;
                        for (var i in allPlayers) {
                            (function(player) {
                                angular.element(player.getElement()).bind('mousedown', function(event) {
                                    var id = player.id;
                                    movingPlayer = {
                                        player: scope.rollerDerbyGame.findObject(id),
                                        clientX: event.clientX,
                                        clientY: event.clientY
                                    };
                                });
                            })(allPlayers[i]);
                        }

                        angular.element(element).bind('mousemove', function (event) {
                            console.log('mouse move');
                            if (movingPlayer === null) return;
                            movingPlayer.player.setPosition(null, new $derby.Vector({
                                x: (event.clientX - movingPlayer.clientX) / scope.rollerDerbyGame.opt.scale,
                                y: (event.clientY - movingPlayer.clientY) / scope.rollerDerbyGame.opt.scale
                            }));
                            movingPlayer.clientX = event.clientX;
                            movingPlayer.clientY = event.clientY;

                        });

                        angular.element(element).bind('mouseup', function () {
                            movingPlayer = null;
                        });
                    }
                    /** INTERACTIVE **/
                    
                    
                }
            };
        }]);
    }
})();;(function () {
    /**
     * Bench object
     * @param {Scene} scene    parent Scene
     * @param {object} options options to be passed
     */
    var Bench = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({
                position: 0,
                offset: {
                    x: 0,
                    y: 0
                }
            },
            options
        );

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

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Bench.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Bench.prototype.buildElement = function () {
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
    };

    _DerbySimulator.prototype.Bench = Bench;
})();;(function () {
    /**
     * Chair object
     * @param {Vector} position (x, y) object
     */
    var Chair = function (position) {
        this.position = position;
        this.player = null;
    };

    /**
     * Check if the chair is free
     * @returns {boolean} TRUE if free
     */
    Chair.prototype.isFree = function () {
        return (this.player === null);
    };

    /**
     * Make a player sit on the chair
     * @param {[[Type]]} player [[Description]]
     */
    Chair.prototype.setPlayer = function (player) {
        this.player = player;
        player.setPosition(this.position);
    };

    /**
     * Get the player on the chair
     * @returns {Player} player on the chair
     */
    Chair.prototype.getPlayer = function () {
        return this.player;
    };

    _DerbySimulator.prototype.Chair = Chair;
})();;(function () {
    /**
     * Pack object
     * @param {Scene} scene    parent Scene
     * @param {object} options options to be passed
     */
    var Pack = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({},
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
    Pack.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Pack.prototype.buildElement = function () {
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
        this.engagementZone = (function(container) {
            var engagementElt = new _DerbySimulator.prototype.SvgElement('g', {
                class: 'engagement-zone',
            });
            var forward = new _DerbySimulator.prototype.SvgElement('path', {
                d: 'M 0,0',
                'stroke-dasharray':'30,30',
                class:'forward'
            });
            var backyard = new _DerbySimulator.prototype.SvgElement('path', {
                d: 'M 0,0',
                'stroke-dasharray':'30,30',
                class:'backyard'
            });
            container.appendChild(engagementElt);
            engagementElt.appendChild(forward);
            engagementElt.appendChild(backyard);
            return {
                forward:forward,
                backyard:backyard
            };
        
        })(element);

        return element;
    };

    /**
     * Set a global message
     * @param {String} str message to display
     */
    Pack.prototype.setMessage = function (str) {
        var textNode = this.message.childNodes[0];
        textNode.nodeValue = (str ? str : '');
    };

    /**
     * Draw the pack on the track
     */
    Pack.prototype.drawPack = function () {
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
    };

    /**
     * Draw the engagement zone
     */
    Pack.prototype.drawEngagement = function () {
        if ((this.backyard) && (this.backyard)) {
            var ahead = (this.forward.algebraicPosition().position + 600 + 2*this.forward.opt.ray);
            var rear = (this.backyard.algebraicPosition().position - 600 - 2*this.backyard.opt.ray);

            var getLimitLine = function (playerProto, point) {
                console.log(point.y);
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
    };

    /**
     * Draw the pack and the engagement zone
     */
    Pack.prototype.draw = function () {
        this.drawPack();
        this.drawEngagement();
    };

    /**
     * Define the pack
     * @returns {Array[Players]} List of players in the pack | null
     */
    Pack.prototype.compute = function () {
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
    };

    _DerbySimulator.prototype.Pack = Pack;
})();;(function () {
    /**
     * Track object
     * @param {Scene}  scene   parent Scene
     * @param {object} options options to be passed
     */
    var PenaltyBox = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({
                offset: {
                    x: 0,
                    y: 0
                }
            },
            options
        );

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

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    PenaltyBox.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    PenaltyBox.prototype.buildElement = function () {
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
    };

    _DerbySimulator.prototype.PenaltyBox = PenaltyBox;
})();;(function () {
    /**
     * Player object
     * @param {Scene}    scene   parent Scene
     * @param {object} options options to be passed
     */
    var Player = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        this.humanType = 'player';

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({
                ray: 30,
                role: 'blocker',
                position: {
                    x: 0,
                    y: 0
                }
            },
            options
        );

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
    };

    /**
     * Check the collision and make the other players move
     */
    Player.prototype.checkCollision = function () {
        //var myVector = new _DerbySimulator.prototype.Vector({x:this.x, y:this.y});
        for (var i in this.scene.allHumans) {
            var player = this.scene.allHumans[i];
            if (player.id != this.id) {
                var centerDistance = this.position.distance(player.position);
                var distance = centerDistance - (this.opt.ray + player.opt.ray);
                if (distance < 0) {
                    // push the player
                    var incremental = (new _DerbySimulator.prototype.Vector(player.position)).sub(this.position).normalize().coef(Math.abs(distance) * 1.2);
                    player.setPosition(null, incremental);

                }
            }
        }
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Player.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Define the new positionof the player (in cm)
     * @param {Vector}  point (x, y) new position in cm
     * @param {Vector}  inc (x, y) new incremental position in cm (facultative)
     */
    Player.prototype.setPosition = function (point, inc) {
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
            outTrackPlayers[j].setText(['Out of', 'bounce']);
        }
    };

    /**
     * Set the team of the player
     * @param {Team} team team of the player
     */
    Player.prototype.setTeam = function (team) {
        this.team = team;
        if (team.players.indexOf(this) < 0) {
            team.players.push(this);
        }
        _DerbySimulator.prototype.addStyle(this.mark, {
            fill: team.color
        });
    };

    /**
     * Set text in bulle
     * @param {array} arrayData lines of texts to display
     */
    Player.prototype.setText = function (arrayData) {
        var lines = this.txt.childNodes;
        for (var i = 0; i < 3; i++) {
            var node = lines[i].childNodes[0];
            if (arrayData[i]) {
                node.nodeValue = arrayData[i];
            } else {
                node.nodeValue = '';
            }
        }
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Player.prototype.buildElement = function () {
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

        switch (this.role) {
        case 'jammer':
            this.mark = new _DerbySimulator.prototype.SvgElement('polygon', {
                points: '0, 25 -5.878, 8.09 -23.776, 7.725 -9.511, -3.09 -14.695, -20.225 0, -10 14.695, -20.225 9.511, -3.09 23.776, 7.725 5.878, 8.09',
                class: 'mark'
            });
            break;
        case 'pivot':
            this.mark = new _DerbySimulator.prototype.SvgElement('rect', {
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
            this.mark = new _DerbySimulator.prototype.SvgElement('circle', {
                cx: 0,
                cy: 0,
                r: 18,
                style: 'stroke:none',
                class: 'mark'
            });
        }
        elt.appendChild(this.border);
        elt.appendChild(this.mark);
        elt.appendChild(bulle);
        return elt;
    };

    /**
     * Check if the player is inside the track
     * @returns {Boolean} true if inside the track
     */
    Player.prototype.isInTrack = function () {
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
    };

    /**
     * Get the zone where the player is. 4 zones are defined :
     * 1 - straight part where the jammer line is
     * 2 - first curve
     * 3 - straight part at the opposite of the jammer line is
     * 4 - last curve
     * @param   {Vector} refPoint point for which the zone must be defined otherwise, the player position
     * @returns {int} zone
     */
    Player.prototype.getZone = function (refPoint) {
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
    };

    /**
     * Define if the player is in the engagement zone
     * @returns {Boolean} true if in engagement zone
     */
    Player.prototype.isInEngagementZone = function () {
        // player in the track ?
        if (this.isInTrack()) {
            if (this.role !== 'jammer') {
                this.setText(['Out of play']);
            } else {
                this.setText(['In bounce']);
            }
            _DerbySimulator.prototype.removeClass(this.getElement(), 'out-of-play');
            // Is there a pack ?
            if (this.scene.pack.players === null) {
                this.setText(['In bounce']);
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
            this.setText(['Out of', 'bounce']);
        }
        if (this.role !== 'jammer') {
            _DerbySimulator.prototype.addClass(this.getElement(), 'out-of-play');
        }
        return false;
    };

    /**
     * Get one-dimention position. This is the projection of the point on a médian line in the track
     * @param   {Object}   point [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    Player.prototype.algebraicPosition = function (point) {
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
    };
    
    /**
     * Transform an algegraic position in 2D position (on the median line
     * @param   {float} pos Algebraic position
     * @returns {Vector}    2D position
     */
    Player.prototype.algebraicToCartesian = function(pos) {
        var ray = 534;
        var total = 533 * 4 + 2 * Math.PI * ray;
        var position = (2*total + pos) % total;
        
        if ((position>0) && (position<Math.PI * ray)) {
            return new _DerbySimulator.prototype.Vector({
                x:-533 -ray * Math.sin(position/ray),
                y: - ray * Math.cos(position/ray)
            });
        }
        
        if ((position >= Math.PI * ray) && (position < Math.PI * ray + 1066)) {
            return new _DerbySimulator.prototype.Vector({
                x:position - Math.PI * ray - 533,
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
                y: - ray
            });
        }
    };

    /**
     * get the distance on the track between this player and a point
     * @param   {Vector} refPoint reference point for measurment
     * @returns {float}           distance in cm
     */
    Player.prototype.trackAlgebraicDistance = function (refPoint) {

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
    };


    _DerbySimulator.prototype.Player = Player;
})();;(function () {
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
})();;(function () {

    /**
     * Polyfill to extend an object with another
     * @param   {object} dest object to be extended
     * @param   {object} src  extension
     * @returns {object} dest is returned
     */
    _DerbySimulator.prototype.extend = function (dest, src) {
        for (var i in src) {
            dest[i] = src[i];
        }
        return dest;
    };

    /**
     * Generate a UUID
     * @returns {String} uuid
     */
    _DerbySimulator.prototype.getUUID = function () {
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
    _DerbySimulator.prototype.isPointInPoly = function (poly, pt) {
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
    _DerbySimulator.prototype.SvgElement = function (tag, attrs, child) {
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
     * add a style element to a dom element
     * @param {domElement} dom   Dom element to modify
     * @param {object}     style css object
     */
    _DerbySimulator.prototype.addStyle = function (dom, style) {
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
    _DerbySimulator.prototype.addClass = function (dom, className) {
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
    _DerbySimulator.prototype.removeClass = function (dom, className) {
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
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        // parent root
        this.scene = scene;
        scene.registerObject(this);

        // default options
        this.opt = _DerbySimulator.prototype.extend({},
            options
        );

        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Track.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Track.prototype.buildElement = function () {

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
    };


    _DerbySimulator.prototype.Track = Track;
})();;(function () {
    /**
     * Vector object
     * @param {Object} data (x,y) object
     */
    var Vector = function (data) {
        this.x = (data.x ? data.x : 0);
        this.y = (data.y ? data.y : 0);
    };

    /**
     * Compute distance between 2 points
     * @param   {Vector}   point Second point
     * @returns {fload} distance
     */
    Vector.prototype.distance = function (point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    };

    /**
     * Add this vector to another
     * @param {Vector} vect vector to add
     * @returns {Vector} this vector
     */
    Vector.prototype.add = function (vect) {
        this.x += vect.x;
        this.y += vect.y;
        return this;
    };

    /**
     * Substract another vector from this vector
     * @param {Vector} vect vector to substract
     * @returns {Vector} this vector
     */
    Vector.prototype.sub = function (vect) {
        this.x -= vect.x;
        this.y -= vect.y;
        return this;
    };

    /**
     * Normalize a vector (meaning that its length is 1)
     * @returns {Vector} this vector
     */
    Vector.prototype.normalize = function () {
        var distance = this.distance(new Vector({
            x: 0,
            y: 0
        }));
        this.x /= distance;
        this.y /= distance;
        return this;
    };

    /**
     * Apply a coefficient to the vector
     * @param {float} number coefficient to apply
     * @returns {Vector} this vector
     */
    Vector.prototype.coef = function (number) {
        this.x *= number;
        this.y *= number;
        return this;
    };

    _DerbySimulator.prototype.Vector = Vector;
})();