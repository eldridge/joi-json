'use strict';

const utils = require( './utils' );

class BaseSchema {

    constructor( engineFuncName ) {

        this.engineFuncName = engineFuncName;
    }

    parse( config, engine, functions ) {
        // Note: Joi will clone objects on changes and thus we need to update the schema reference
        let state = { schema: this._createSchema( engine ), engine };

        for( let key in config ) {
            let value = config[ key ];

            // handle function default args
            if( key === "default" ) {
                const function_match = value.match( /^([a-zA-Z0-9_]+)\(([a-zA-Z0-9_.]+)\)$/ );

                if( function_match ) {
                    const [ , function_name, function_args ] = function_match;
                    const f = functions.get( function_name );

                    if( f ) {
                        value = [ f.bind( null, function_args ), function_name ];
                    } else {
                        throw new Error( "unable to locate function with name: " + function_name );
                    }
                }
            }

            this.updateSchema( state, key, value );
        }

        return state.schema;
    }

    updateSchema( state, key, value ) {

        if( utils.isFunction( state.schema[key] ) ) {

            if( value === null ) {

                state.schema = state.schema[ key ]();
            }
            else if (Array.isArray(value)) {

                state.schema = state.schema[ key ]( ...value );
            }
            else {

                state.schema = state.schema[ key ]( value );
            }

            return true;
        }
    }

    _createSchema( engine ) {

        return engine[ this.engineFuncName ]();
    }
}

module.exports = BaseSchema;
