(function(){

    /**
     * Polyfill to extend an object with another
     * @param   {object} dest object to be extended
     * @param   {object} src  extension
     * @returns {object} dest is returned
     */
    _DerbySimulator.prototype.extend = function(dest, src) {
        for (var i in src) {
            dest[i] = src[i];
        }
        return dest;
    };
    
    /**
     * Generate a UUID
     * @returns {String} uuid
     */
    _DerbySimulator.prototype.getUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    /**
     * Detect if a point is inside a polygone
     *  Jonas Raoni Soares Silva
     *  http://jsfromhell.com/math/is-point-in-poly [rev. #0]
     * @param   {array}    poly list of (x,y) points
     * @param   {Vector}   pt   (x,y) point
     * @returns {boolean} true | false
     */
    _DerbySimulator.prototype.isPointInPoly = function(poly, pt){
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (c = !c);
        return c;
    };
    
    /**
     * Create a svg element
     * @param   {string}     tag         name of the svg element
     * @param   {object}     attrs       list of attributes
     * @param   {domElement} child       facultative child
     * @returns {domElement} New domElement
     */
    _DerbySimulator.prototype.SvgElement = function(tag, attrs, child) {
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
    _DerbySimulator.prototype.addStyle = function(dom, style) {
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
        $derby.extend(newStyle, style);
        serialStyle = '';
        for(var i in newStyle) {
            if (newStyle[i]!== null) {
                serialStyle += i + ':' + newStyle[i] + ';';
            }
        }
        dom.setAttribute('style', serialStyle);
    }

})();