var _DerbySimulator = function () {};

$derby = new _DerbySimulator();

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
    
    _DerbySimulator.prototype = {
        object: myObject,
        inherits: function(extendedPrototype, parentPrototype) {
            var proto = Object.create('undefined' === typeof parentPrototype ? myObject.prototype : parentPrototype.prototype);
            for (var i in extendedPrototype) {
                proto[i] = extendedPrototype[i];
            }
            return proto;
        }
    };
})();