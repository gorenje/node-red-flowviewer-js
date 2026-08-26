/***
 * icon value does not exist here, that's attached to the node type definition
 * that does not exist here. So we have to map the node type to awesome happy character.
 * 
 * This mapping can be checked at https://github.com/node-red/node-red/blob/1f38dc899b1d6d24b05369023ef2d83b808cd55d/packages/node_modules/%40node-red/editor-client/src/js/font-awesome.js
 * 
 * NOTE: these mappings are using FontAwesome 4.7.0 Unicodes, these do change with versions.
 */
var fontawesomeByType = {
    "Contact": "\uf2bc",
    "UglifyJS": "\uf066",
    "MinifyCSS": "\uf0b0",
    "PkgFile": "\uf016",
    "NodeDevOps": "\uf120",
    "NpmPublish": "\uf0d6",
    "NpmTarBall":  "\uf187",
    "NodeFactory": "\uf275",
    "OTPGenerate": "\uf21b",
    "JsonSchemaValidatorWithDocu": "\uf05d",
    "tarball": "\uf187",
    "findvcard": "\uf059"
};