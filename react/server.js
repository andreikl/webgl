var Hapi = require('hapi');
var webpack = require('webpack');

var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8080 
});

var plugin = {
    register: function (server, options, next) {
        webpack(options, function (err, statsStr) {
            if (err) {
                return next(err);
            }

            /*var stats = statsStr.toJson();
            console.log(statsStr);
            var paths = stats.assets.map(function (asset) {
                var _path = '/' + asset.name;

                console.log(_path);

                server.route({
                    method: 'GET',
                    path: _path,
                    handler: {
                        file: asset.name,
                    },
                });
                return _path;
            });*/
            /*_.extend(server.app, {
                webpack: {
                    configuration: options,
                    stats: stats,
                    paths: paths,
                },
            });*/
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
            entry: "./js/app.js",
            output: {
                path: __dirname + '/build',
                filename: "bundle.js"
            },
            module: {
                loaders: [
                    { test: /\.js$/, exclude: "/node_modules/", loader: "babel-loader" },
                    { test: /\.scss$/, loader: 'style!css!sass' }
                ]
            },
            plugins: [
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })
                /*new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': '"production"'
                    }
                })*/
            ]
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
    path: '/index.html',
    handler: {
        file: 'index.html',
    },
});

server.route({
    method: 'GET',
    path: '/build/bundle.js',
    handler: {
        file: '/build/bundle.js',
    },
});

