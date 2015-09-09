var Hapi = require('hapi');
var webpack = require('webpack');
var config = require('getconfig');

console.log('\x1b[32m', 'Config isDev: ' + config.isDev, '\x1b[0m');

var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8080 
});

var plugin = {
    register: function (server, options, next) {
        var compiler = webpack(options);
        /*compiler.run(function (err, statsStr) {
            if (err) {
                console.log('complile error happened!', err);
                return next(err);
            }
            var stats = statsStr.toJson();
            if (stats.errors.length > 0) {
                console.log('errors during complilation is happened!', stats.errors);
                return next(err);
            }
             if(stats.warning.length > 0) {
                console.log('warnings during complilation is happened!', stats.warning);
             }
            return next();
        });*/
        compiler.watch({ // watch options:
            aggregateTimeout: 300, // wait so long for more changes
            poll: true // use polling instead of native watchers
        }, function(err, statsStr) {
            if (err) {
                console.log('\x1b[30m', 'Building is failure' ,'\x1b[0m', err);
                return next(err);
            }
            var stats = statsStr.toJson();
            if (stats.errors.length > 0) {
                for (var i in stats.errors) {
                    console.log('\x1b[31m', 'Building is failure' ,'\x1b[0m');
                    console.log(stats.errors[i]);
                }
                return next(err);
            }
            if(stats.warnings.length > 0) {
                for (var i in stats.warnings) {
                    console.log('\x1b[33m', 'warning:' ,'\x1b[0m');
                    console.log(stats.warnings[i]);
                }
            }
            console.log('\x1b[32m', 'Building is successfull' ,'\x1b[0m');
            return next();
        });
    }
}

plugin.register.attributes = {
    name: 'plugin',
    version: '1.0.0'
};


server.register([{
        register: require('inert'),
        options: {}
    },
    {
        register: plugin,
        options: {
            entry: "./app/app.jsx",
            output: {
                path: __dirname + '/build',
                filename: "bundle.js"
            },
            //devtool: "inline-source-map",
            module: {
                loaders: [
                    { test: /\.jsx$/, exclude: "/node_modules/", loader: "babel-loader" },
                    { test: /\.scss$/, exclude: "/node_modules/", loader: 'style!css!sass' },
                    { test: /\.hbs$/, exclude: "/node_modules/", loader: "handlebars-loader" }
                ]
            },
            plugins: [
                (function () {
                    if (config.isDev) {
                        return function () {};
                    } else {
                        return new webpack.optimize.UglifyJsPlugin({
                            compress: { warnings: false }
                        });
                    }
                })(),
                (function () {
                    if (config.isDev) {
                        return function () {};
                    } else {
                        return new webpack.DefinePlugin({
                            'process.env': {
                                'NODE_ENV': '"production"'
                            }
                        });
                    }
                })()
            ],
            errorDetails: true
        }
    }
], function() {
    console.log('"HAPI Plugin Webpack" is registered');

    // Start the server
    server.start(function(err) {

        if (err) {
            console.log(err);
            return;
        }

        console.log('Server running at:', server.info.uri);
    });
});

server.route({
    method: 'GET',
    path: '/',
    handler: {
        file: 'index.html',
    },
});

server.route({
    method: 'GET',
    path: '/build/{param*}',
    handler: {
        directory: {
            path: 'build',
            listing: true
        }
    },
});
