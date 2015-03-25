(function () {
    /**
     * Player object
     * @param {Scene}    scene   parent Scene
     * @param {object} options options to be passed
     */
    var Player = function (scene, options) {
        // generate id
        this.id = _DerbySimulator.prototype.getUUID();

        if ('undefined' === typeof Player.prototype.all) {
            Player.prototype.all = [];
        }
        Player.prototype.all.push(this);

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
                },
                name: Player.prototype.all.length
            },
            options
        );

        // Animations
        this.animations = [];
        this.animationControl = {
            timeStep: 50
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
     * generate the list of points in the trajectory
     * @returns {Array(Vector)} list of points in the trajectory
     */
    Player.prototype.generateTrajectory = function (index) {
        if (this.animations.length > index) {
            this.trajectory = this.animations[index].generatePoints(this.animationControl.timeStep);
        } else {
            this.trajectory = [];
        }
        return this.trajectory;
    };

    /**
     * generate the list of points in the trajectory
     * @returns {Array(Vector)} list of points in the trajectory
     */
    Player.prototype.selectAnimation = function (index) {
        if (!index) {
            index = 0;
        }
        this.generateTrajectory(index);
    }

    /**
     * Add points in the trajectory
     * @param {array(vector) | vector} data Points to add
     */
    Player.prototype.addTrajectory = function (data) {
        if (('undefined' !== typeof data.x) && ('undefined' !== typeof data.y)) {
            this.trajectory.push(data);
        }
        if ('[object Array]' === Object.prototype.toString.call(data)) {
            for (var i in data) {
                this.trajectory.push(data[i]);
            }
        }
    };

    /**
     * Get the number of position in the trajectory
     * @returns {Integer} Size
     */
    Player.prototype.trajectorySize = function () {
        return this.trajectory.length;
    };

    /**
     * Move the player to a trajectory point
     * @param {Integer} index Trajectory keyframe
     */
    Player.prototype.stepTrajectory = function (index) {
        var myIndex = (index < this.trajectory.length ? index : this.trajectory.length - 1);
        if (this.trajectory[myIndex]) {
            this.setPosition(this.trajectory[myIndex]);
        }
    };

    /**
     * Lauch the animation
     */
    Player.prototype.lauchAnimation = function (callback, options) {
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
                    console.log('End of animation   ' + animation.id);
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
    Player.prototype.algebraicToCartesian = function (pos) {
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

    /**
     * Get the JSON representation of the object
     * @returns {String} JSON
     */
    Player.prototype.stringify = function () {
        var anim = [];
        for (i in this.animations) {
            anim.push(this.animations[i].stringify());
        }
        var animJson = '[' + anim.join(',') + ']';
        return '{"name":"' + this.name + '","position":' + this.position.stringify() + ',"animations":' + animJson + ',"type":"' + this.humanType + '","role":"' + this.role + '"}';
    };

    /**
     * Load animations
     * @param {Object} animationData Animations to load
     * @param {Object} options       Options to pass
     */
    Player.loadAnimation = function (animationData, options) {
        var opt = _DerbySimulator.prototype.extend({
                marker: false
            },
            options);
        var animation = null;
        this.animations = [];
        switch (animationData.type) {
        case 'bezier':
            animation = new _DerbySimulator.prototype.AnimationBezier(this.scene, {
                marker: opt.marker
            });
            break;
        default:
            animation = new _DerbySimulator.prototype.AnimationLinear(this.scene, {
                marker: opt.marker
            });
            break;
        }
        for (var i in animationData.keyframes) {
            animation.addKeyFrame(animationData.keyframes[i]);
        }
        this.animations.push(animation);
    };


    _DerbySimulator.prototype.Player = Player;
})();