var DerbySimulator = (function () {

    /**
     * Polyfill to extend an object with another
     * @param   {object} dest object to be extended
     * @param   {object} src  extension
     * @returns {object} dest is returned
     */
    var extend = function(dest, src) {
        for (var i in src) {
            dest[i] = src[i];
        }
        return dest;
    };
    
    /**
     * Create a svg element
     * @param   {string}     tag         name of the svg element
     * @param   {object}     attrs       list of attributes
     * @param   {domElement} child       facultative child
     * @returns {domElement} New domElement
     */
    var SvgElement = function(tag, attrs, child) {
        var elt = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var name in attrs) {
            elt.setAttribute(name, attrs[name]);
        }
        if (child) {
            elt.appendChild(child);
        }
        return elt;
    };
    
    var addStyle = function(dom, style) {
        var strStyle = dom.getAttribute('style')
        var serialStyle = (strStyle ? strStyle.split(';') : []);
        var newStyle = {};
        for(var i in serialStyle) {
            if (serialStyle[i].trim().length>0) {
                var thisStyle = serialStyle[i].split(':');
                var name = thisStyle[0].trim();
                var value = thisStyle[1];
                newStyle[name] = value;
            }
        }
        extend(newStyle, style);
        serialStyle = '';
        for(var i in newStyle) {
            serialStyle += i + ':' + newStyle[i] + ';';
        }
        dom.setAttribute('style', serialStyle);
    }
    
/*******************************************************************************************************/
    
    var Point = function(data) {
        this.x = (data.x ? data.x : 0);
        this.y = (data.y ? data.y : 0);
    };
    
/*******************************************************************************************************/
    
    var Chair = function(position) {
        this.position = position;
        this.x = (position.x ? position.x : 0);
        this.y = (position.y ? position.y : 0);
        this.player = null;
    };
    
    Chair.prototype.isFree = function() {
        return (this.player == null);
    }
    
    Chair.prototype.setPlayer = function(player) {
        this.player = player;
    }
    
    Chair.prototype.getPlayer = function() {
        return this.player;
    }
    
/*******************************************************************************************************/

    /**
     * Scene object
     * @param {object} options Options to be passed
     */
    var Scene = function(options) {
        this.opt = extend(
            {
                id: 'scene',
                size: {width:3250,height:2000},
                scale:1
            }, 
            options
        );
        
        this.opt.size.width *= this.opt.scale;
        this.opt.size.height *= this.opt.scale;
        
        this.element = this.buildElement();
        
        this.track = new Track(this);
        this.penaltyBox = new PenaltyBox(this);
        this.benches = {
            A: new Bench(this, {position:0}),
            B: new Bench(this, {position:1}),
        };
        
        
        this.teams = {
            A: new Team(this, 'A', 'red', 0, this.benches.A),
            B: new Team(this, 'B', 'green', 1, this.benches.B)
        }
        
    };
    
    Scene.prototype.addElement = function(elt) {
        this.container.appendChild(elt);
    }
    
    Scene.prototype.getElement = function() {
        return this.element;
    };

    Scene.prototype.buildElement = function() {
        
        var elt = new SvgElement('svg', {
            width: this.opt.size.width,
            height: this.opt.size.height,
            version: '1.1',
            id: this.opt.id
        });
        elt.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        this.container = new SvgElement('g', {
            transform: 'matrix(' + this.opt.scale + ' 0 0 ' + this.opt.scale + ' ' + (1500* this.opt.scale) + ' ' + (1000* this.opt.scale) + ')'
        });

        var title = document.createElement('title');
        title.appendChild(document.createTextNode('Roller Derby'));

        var desc = document.createElement('desc');
        desc.appendChild(document.createTextNode('Roller Derby Track'));

        /*if (this.track) {
            this.addElement(this.track.getElement());
        }
        
        if (this.penaltyBox) {
            this.addElement(this.penaltyBox.getElement());
        }
        
        for (var i in this.benches) {
            this.addElement(this.benches[i].getElement());
        }*/

        elt.appendChild(title);
        elt.appendChild(desc);
        elt.appendChild(this.container);
        return elt;
    };
    
/*******************************************************************************************************/

    /**
     * Track object
     * @param {object} options Options to be passed
     */
    var Track = function(scene, options) {
        this.opt = extend(
            {
                offset: {x:0,y:0}
            }, 
            options
        );
        
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    Track.prototype.getElement = function() {
        return this.element;
    };
    
    Track.prototype.buildElement = function() {

        var trackElement = new SvgElement('g', {
            class: 'track',
            transform: 'translate(' + this.opt.offset.x + ',' + this.opt.offset.y + ')'
        });
        
        // Internal line
        trackElement.appendChild(new SvgElement('path', {
            class: 'limit',
            d: 'M -533,-777 l 1066,-31 a 808,808,180,1,1,0,1616 l -1066,31 a 808,808,180,1,1,0,-1616'
        }));

        // External line
        trackElement.appendChild(new SvgElement('path', {
            class: 'limit',
            d:  'M -533,-381 l 1066,0 a 381,381,180,1,1,0,762 l -1066,0 a 381,381,180,1,1,0,-762'
        }));
        
        // Jamline
        trackElement.appendChild(new SvgElement('path', {
            class: 'jam-line',
            d:  'M -533,-381 l 0,-396'
        }));
        
        //PivotLine
        trackElement.appendChild(new SvgElement('path', {
            class: 'pivot-line',
            d:  'M 382,-381 l 0,-420'
        }));
        
        trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M -233,-481 l 0,-200'
        }));
        trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M 67,-481 l 0,-200'
        }));
        /*trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M 367,-481 l 0,-200'
        }));*/

        trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M 533,481 l 0,200'
        }));
        trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M 233,481 l 0,200'
        }));
        trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M -67,481 l 0,200'
        }));
        trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M -367,481 l 0,200'
        }));

        for (var i=1; i<6; i++) {
            var cosinus = Math.cos(i*2.14/3.81);
            var sinus = Math.sin(i*2.14/3.81);
            var ray1 = 481;
            var ray2 = 681;
            trackElement.appendChild(new SvgElement('path', {
                class: 'three-meters',
                d:'M ' + Math.round(-533 - ray1 * sinus) + ',' + Math.round(-ray1 * cosinus) + ' L ' + Math.round(-533-ray2 * sinus) + ',' + Math.round(-ray2 * cosinus)
            }));
        }

        for (var i=1; i<6; i++) {
            var cosinus = Math.cos(i*2.14/3.81);
            var sinus = Math.sin(i*2.14/3.81);
            var ray1 = 481;
            var ray2 = 681;
            trackElement.appendChild(new SvgElement('path', {
                class: 'three-meters',
                d:'M ' + Math.round(533 + ray1 * sinus) + ',' + Math.round(ray1 * cosinus) + ' L ' + Math.round(533+ray2 * sinus) + ',' + Math.round(ray2 * cosinus)
            }));
        }

        return trackElement;
    };
    

    
/*******************************************************************************************************/
    
    /**
     * Track object
     * @param {object} options Options to be passed
     */
    var PenaltyBox = function(scene, options) {
        this.opt = extend(
            {
                offset: {x:0,y:0}
            }, 
            options
        );
        
        this.element = this.buildElement();
        scene.addElement(this.element);
        this.chairs = [
            {
                b1: new Chair({x:1650, y:-110}),
                b2: new Chair({x:1650, y:-180}),
                b3: new Chair({x:1550, y:-145}),
                j: new Chair({x:1650, y:-40})
            },
            {
                b1: new Chair({x:1650, y:110}),
                b2: new Chair({x:1650, y:180}),
                b3: new Chair({x:1550, y:145}),
                j: new Chair({x:1650, y:40})
            }
        ]
    };
    
    PenaltyBox.prototype.getElement = function() {
        return this.element;
    };
    
    PenaltyBox.prototype.buildElement = function() {
        var element = new SvgElement('g', {
            class:'penalty-box',
            transform:'matrix(0 -1 1 0 ' + (this.opt.offset.x + 1600) + ' ' + (this.opt.offset.y + 210) + ')'
        });
        
        element.appendChild(new SvgElement('rect', {
            class:'penalty-box',
            x:0,
            y:0,
            width:420,
            height: 100
        }));
        
        element.appendChild(new SvgElement('text', {
            fill:'red',
            style:'font-size:60px',
            x:210,
            y:65,
            'text-anchor': 'middle',
            transform:'matrix(1 0 0 1 0 0)'
        }, document.createTextNode('Penalty Box')));
        
        return element;
    };
    
/*******************************************************************************************************/
    
    /**
     * Bench object
     * @param {object} options Options to be passed
     */
    var Bench = function(scene, options) {
        this.opt = extend(
            {
                position:0,
                offset: {x:0,y:0}
            }, 
            options
        );
        
        if (this.opt.position==0) {
            this.chairs = [
                new Chair({x:1400, y:-830}),
                new Chair({x:1450, y:-780}),
                new Chair({x:1500, y:-730}),
                new Chair({x:1550, y:-680}),
                new Chair({x:1600, y:-630})
            ];
        } else {
            this.chairs = [
                new Chair({x:1400, y:800}),
                new Chair({x:1450, y:750}),
                new Chair({x:1500, y:700}),
                new Chair({x:1550, y:650}),
                new Chair({x:1600, y:600})
            ];
        }
        
        this.element = this.buildElement();
        scene.addElement(this.element);
    };
    
    Bench.prototype.getElement = function() {
        return this.element;
    };
    
    Bench.prototype.buildElement = function() {
        var element;
        if (this.opt.position==0) {
            element = new SvgElement('g', {
                class:'bench',
                transform:'matrix(0.707 0.707 -0.707 0.707 ' + (this.opt.offset.x + 1400) + ' ' + (this.opt.offset.y -900) + ')'
            });
        } else {
            element = new SvgElement('g', {
                class:'bench',
                transform:'matrix(0.707 -0.707 0.707 0.707 ' + (this.opt.offset.x + 1325) + ' ' + (this.opt.offset.y + 805) + ')'
            });
        }
        
        element.appendChild(new SvgElement('rect', {
            class:'bench',
            x:0,
            y:0,
            width:400,
            height: 100
        }));
        
        element.appendChild(new SvgElement('text', {
            fill:'green',
            style:'font-size:60px',
            x:200,
            y:65,
            'text-anchor': 'middle',
            transform:'matrix(1 0 0 1 0 0)'
        }, document.createTextNode('Bench')));
        
        return element;
    };
    
/*******************************************************************************************************/
    var Team = function(scene, name, color, position, bench) {
        this.players = [];
        this.position = position;
        this.color = color;
        this.bench = bench;
        
        this.addPlayer(new Player(scene, {position:bench.chairs[0].position, role:'blocker'}));
        this.addPlayer(new Player(scene, {position:bench.chairs[1].position, role:'blocker'}));
        this.addPlayer(new Player(scene, {position:bench.chairs[2].position, role:'blocker'}));
        this.addPlayer(new Player(scene, {position:bench.chairs[3].position, role:'pivot'}));
        this.addPlayer(new Player(scene, {position:bench.chairs[4].position, role:'jammer'}));
    };
    
    Team.prototype.addPlayer = function(player) {
        this.players.push(player);
        player.setTeam(this);
    }

/*******************************************************************************************************/
    
    var Player = function(scene, options) {
        this.opt = extend(
            {
                role:'blocker',
                position: new Point({x:0,y:0})
            }, 
            options
        );
        this.x = this.opt.position.x;
        this.y = this.opt.position.y;
        this.role = this.opt.role.toLowerCase();
        this.team = null;
        
        this.element = this.buildElement();
        scene.addElement(this.element);
    };
    
    Player.prototype.getElement = function() {
        return this.element;
    };
    
    Player.prototype.setPosition = function(point) {
      this.element.setAttribute('transform', 'translate(' + point.x + ', ' + point.y + ')');
        this.x = point.x;
        this.y = point.y;
    };
    
    Player.prototype.setTeam = function(team) {
        this.team = team
        addStyle(this.mark, {
            fill: team.color
        });
    };
    
    Player.prototype.buildElement = function() {
        var elt = new SvgElement('g', {
            class:'player ' + this.position,
            transform: 'translate(' + this.x + ', ' + this.y + ')'
        });
        
        var circle = new SvgElement('circle', {
            cx:0,
            cy:0,
            r:30,
            class:'player'
        });
        
        switch (this.role) {
                case 'jammer':
                    this.mark = new SvgElement('polygon', {
                        'points': '0, 25 -5.878, 8.09 -23.776, 7.725 -9.511, -3.09 -14.695, -20.225 0, -10 14.695, -20.225 9.511, -3.09 23.776, 7.725 5.878, 8.09'
                    });
                break;
                case 'pivot':
                    this.mark = new SvgElement('rect', {
                        x:-18,
                        y:-8,
                        width:36,
                        height:16,
                        style:'stroke:none'
                    });
                break;
                case 'blocker':
                default: 
                    this.mark = new SvgElement('circle', {
                        cx:0,
                        cy:0,
                        r:18,
                        style:'stroke:none'
                    });
        }

        elt.appendChild(circle);
        elt.appendChild(this.mark);
        return elt;
    }
    
    return {
        Scene: Scene,
        Track: Track,
        PenaltyBox: PenaltyBox,
        Team: Team,
    }
})();