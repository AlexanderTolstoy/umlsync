/*!
 * jQuery UI 1.8.6
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, dm, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.diagram = $.diagram || {};
if ( $.diagram.version ) {
    return;
}

$.extend( $.diagram, {
    version: "1.0.0",

// deprecated
$.extend( $.diagram, {
    // $.diagram.plugin is deprecated.  Use the proxy pattern instead.
    plugin: {
        add: function( module, option, set ) {
            var proto = $.diagram[ module ].prototype;
            for ( var i in set ) {
                proto.plugins[ i ] = proto.plugins[ i ] || [];
                proto.plugins[ i ].push( [ option, set[ i ] ] );
            }
        },
        call: function( instance, name, args ) {
            var set = instance.plugins[ name ];
            if ( !set || !instance.element[ 0 ].parentNode ) {
                return;
            }
    
            for ( var i = 0; i < set.length; i++ ) {
                if ( instance.options[ set[ i ][ 0 ] ] ) {
                    set[ i ][ 1 ].apply( instance.element, args );
                }
            }
        }
    }
});

})( jQuery );


/*!
 * jQuery UI Widget 1.8.6
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, dm, undefined ) {

$.element = function( name, base, prototype ) {
    var namespace = name.split( "." )[ 0 ],
        fullName;
    name = name.split( "." )[ 1 ];
    fullName = namespace + "-" + name;

    if ( !prototype ) {
        prototype = base;
        base = $.Element;
    }

    // create selector for plugin
    $.expr[ ":" ][ fullName ] = function( elem ) {
        return !!$.data( elem, name );
    };

    $[ namespace ] = $[ namespace ] || {};
    $[ namespace ][ name ] = function( options, element ) {
        // allow instantiation without initializing for simple inheritance
        if ( arguments.length ) {
            this._createElement( options, element );
        }
    };

    var basePrototype = new base();
    // we need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
//    $.each( basePrototype, function( key, val ) {
//        if ( $.isPlainObject(val) ) {
//            basePrototype[ key ] = $.extend( {}, val );
//        }
//    });
    basePrototype.options = $.extend( true, {}, basePrototype.options );
    $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
        namespace: namespace,
        elementName: name,
        elementEventPrefix: $[ namespace ][ name ].prototype.elementEventPrefix || name,
        elementBaseClass: fullName
    }, prototype );

    $.element.bridge( name, $[ namespace ][ name ] );
};

$.element.bridge = function( name, object ) {
    $.fn[ name ] = function( options ) {
        var isMethodCall = typeof options === "string",
            args = Array.prototype.slice.call( arguments, 1 ),
            returnValue = this;

        // allow multiple hashes to be passed on init
        options = !isMethodCall && args.length ?
            $.extend.apply( null, [ true, options ].concat(args) ) :
            options;

        // prevent calls to internal methods
        if ( isMethodCall && options.charAt( 0 ) === "_" ) {
            return returnValue;
        }

        if ( isMethodCall ) {
            this.each(function() {
                var instance = $.data( this, name ),
                    methodValue = instance && $.isFunction( instance[options] ) ?
    instance[ options ].apply( instance, args ) :
    instance;
                // TODO: add this back in 1.9 and use $.error() (see #5972)
//                if ( !instance ) {
//                    throw "cannot call methods on " + name + " prior to initialization; " +
//    "attempted to call method '" + options + "'";
//                }
//                if ( !$.isFunction( instance[options] ) ) {
//                    throw "no such method '" + options + "' for " + name + " widget instance";
//                }
//                var methodValue = instance[ options ].apply( instance, args );
                if ( methodValue !== instance && methodValue !== undefined ) {
                    returnValue = methodValue;
                    return false;
                }
            });
        } else {
            this.each(function() {
                var instance = $.data( this, name );
                if ( instance ) {
                    instance.option( options || {} )._init();
                } else {
                    $.data( this, name, new object( options, this ) );
                }
            });
        }

        return returnValue;
    };
};

$.Element = function( options, element ) {
    // allow instantiation without initializing for simple inheritance
    if ( arguments.length ) {
        this._createElement( options, element );
    }
};

$.Element.prototype = {
    widgetName: "element",
    widgetEventPrefix: "",
    options: {
        disabled: false
    },
    _createElement: function( options, element_instance ) {
        // $.widget.bridge stores the plugin instance, but we do it anyway
        // so that it's stored even before the _create function runs
        $.data( element_instance, this.widgetName, this );
        this.element_instance = $( element_instance );
        this.options = $.extend( true, {},
            this.options,
            this._getCreateOptions(),
            options );

        var self = this;
        this.element_instance.bind( "remove." + this.widgetName, function() {
            self.destroy();
        });

        this._create();
        this._trigger( "create" );
        this._init();
    },
    _getCreateOptions: function() {
        return $.metadata && $.metadata.get( this.element_instance[0] )[ this.widgetName ];
    },
    _create: function() {},
    _init: function() {},

    destroy: function() {
        this.element_instance
            .unbind( "." + this.widgetName )
            .removeData( this.widgetName );
        this.element()
            .unbind( "." + this.widgetName )
            .removeAttr( "aria-disabled" )
            .removeClass(
                this.widgetBaseClass + "-disabled " +
                "ui-state-disabled" );
    },

    element: function() {
        return this.element_instance;
    },

    option: function( key, value ) {
        var options = key;

        if ( arguments.length === 0 ) {
            // don't return a reference to the internal hash
            return $.extend( {}, this.options );
        }

        if  (typeof key === "string" ) {
            if ( value === undefined ) {
                return this.options[ key ];
            }
            options = {};
            options[ key ] = value;
        }

        this._setOptions( options );

        return this;
    },
    _setOptions: function( options ) {
        var self = this;
        $.each( options, function( key, value ) {
            self._setOption( key, value );
        });

        return this;
    },
    _setOption: function( key, value ) {
        this.options[ key ] = value;

        if ( key === "disabled" ) {
            this.widget()
                [ value ? "addClass" : "removeClass"](
                    this.widgetBaseClass + "-disabled" + " " +
                    "ui-state-disabled" )
                .attr( "aria-disabled", value );
        }

        return this;
    },

    enable: function() {
        return this._setOption( "disabled", false );
    },
    disable: function() {
        return this._setOption( "disabled", true );
    },

    _trigger: function( type, event, data ) {
        var callback = this.options[ type ];

        event = $.Event( event );
        event.type = ( type === this.widgetEventPrefix ?
            type :
            this.widgetEventPrefix + type ).toLowerCase();
        data = data || {};

        // copy original event properties over to the new event
        // this would happen if we could call $.event.fix instead of $.Event
        // but we don't have a way to force an event to be fixed multiple times
        if ( event.originalEvent ) {
            for ( var i = $.event.props.length, prop; i; ) {
                prop = $.event.props[ --i ];
                event[ prop ] = event.originalEvent[ prop ];
            }
        }

        this.element.trigger( event, data );

        return !( $.isFunction(callback) &&
            callback.call( this.element[0], event, data ) === false ||
            event.isDefaultPrevented() );
    }
};

})( jQuery );


