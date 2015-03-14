(function(){

    /**
     * Track object
     * @param {Scene}  scene   parent Scene
     * @param {object} options options to be passed
     */
    var Track = function(scene, options) {
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
        
        // Build graphical element
        this.element = this.buildElement();
        scene.addElement(this.element);
    };

    /**
     * Get the SVG element
     * @returns {DomElement} SVG element
     */
    Track.prototype.getElement = function() {
        return this.element;
    };
    
    /**
     * Build the graphical element
     * @returns {DomElement} SVG element
     */
    Track.prototype.buildElement = function() {

        var trackElement = new $derby.SvgElement('g', {
            class: 'track',
            'fill-rule':'evenodd',
            id: this.id
        });
        
        // Track limit
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'limit',
            d: 'M -533,-777 l 1066,-62 a 808,808,180,1,1,0,1616 l -1066,62 a 808,808,180,1,1,0,-1616 z M -533,-381 l 1066,0 a 381,381,180,1,1,0,762 l -1066,0 a 381,381,180,1,1,0,-762 z'
        }));        
        
        // Jamline
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'jam-line',
            d:  'M -533,-381 l 0,-396'
        }));
        
        //PivotLine
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'pivot-line',
            d:  'M 382,-381 l 0,-450'
        }));
        
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'three-meters',
            d:'M -233,-481 l 0,-200'
        }));
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'three-meters',
            d:'M 67,-481 l 0,-200'
        }));
        /*trackElement.appendChild(new SvgElement('path', {
            class: 'three-meters',
            d:'M 367,-481 l 0,-200'
        }));*/

        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'three-meters',
            d:'M 533,481 l 0,200'
        }));
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'three-meters',
            d:'M 233,481 l 0,200'
        }));
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'three-meters',
            d:'M -67,481 l 0,200'
        }));
        trackElement.appendChild(new $derby.SvgElement('path', {
            class: 'three-meters',
            d:'M -367,481 l 0,200'
        }));

        for (var i=1; i<6; i++) {
            var cosinus = Math.cos(i*2.14/3.81);
            var sinus = Math.sin(i*2.14/3.81);
            var ray1 = 481;
            var ray2 = 681;
            trackElement.appendChild(new $derby.SvgElement('path', {
                class: 'three-meters',
                d:'M ' + Math.round(-533 - ray1 * sinus) + ',' + Math.round(-ray1 * cosinus) + ' L ' + Math.round(-533-ray2 * sinus) + ',' + Math.round(-ray2 * cosinus)
            }));
        }

        for (var i=1; i<6; i++) {
            var cosinus = Math.cos(i*2.14/3.81);
            var sinus = Math.sin(i*2.14/3.81);
            var ray1 = 481;
            var ray2 = 681;
            trackElement.appendChild(new $derby.SvgElement('path', {
                class: 'three-meters',
                d:'M ' + Math.round(533 + ray1 * sinus) + ',' + Math.round(ray1 * cosinus) + ' L ' + Math.round(533+ray2 * sinus) + ',' + Math.round(ray2 * cosinus)
            }));
        }

        return trackElement;
    };
    
    
    _DerbySimulator.prototype.Track = Track;
})();