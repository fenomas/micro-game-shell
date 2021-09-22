
var path = require('path')
var entryPath = path.resolve('docs', 'demo.js')
var buildPath = path.resolve('docs')
var buildFilename = 'bundle.js'


module.exports = (env) => ({

    mode: (env && env.prod) ? 'production' : 'development',

    entry: entryPath,

    output: {
        path: buildPath,
        filename: buildFilename,
    },

    watchOptions: {
        aggregateTimeout: 500,
        poll: 1000,
        ignored: ["node_modules"],
    },
    
    stats: "minimal",
    
    devServer: {
        static: buildPath,
    },
})
