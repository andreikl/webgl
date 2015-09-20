var Hapi = require('hapi');
var webpack = require('webpack');

var config = {
    "isDev": true
}

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
                    { test: /\.html$/, exclude: "/node_modules/", loader: "html-loader" }
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

var WebGlApi = {};
WebGlApi.DATA_TYPE = { COORDINATES: 1, NORMALS: 2, TEXTURE: 3 };
WebGlApi.BUFFER_TYPE = { LINE_STRIP: 1, LINES: 2, TRIANGLES: 3, TRIANGLE_STRIP: 4 };

// Add the route
server.route({
    method: 'GET',
    path:'/api/getSphere', 
    handler: function (request, reply) {
        var rows = 20;
        var columns = 15;

        var vertices = new Array((2 + (rows - 1) * (columns + 1)) * 8);

        var step_row_angle = Math.PI / rows;
        var step_row_text = 1.0 / rows;
        var step_col_angle = 2 * Math.PI / columns;
        var step_col_text = 1.0 / columns;

        var cur_pos = 0;
        var cur_row_angle = step_row_angle;
        var cur_row_text = step_row_text;

        vertices[cur_pos + 0] = 0.0;
        vertices[cur_pos + 1] = 1.0;
        vertices[cur_pos + 2] = 0.0;
        vertices[cur_pos + 3] = 0.0;
        vertices[cur_pos + 4] = 1.0;
        vertices[cur_pos + 5] = 0.0;
        vertices[cur_pos + 6] = 0.5;
        vertices[cur_pos + 7] = 0.0;
        cur_pos += 8;
        for (var i = 0; i < rows - 1; i++) {
            var cur_row_sin = Math.sin(cur_row_angle);
            var cur_row_cos = Math.cos(cur_row_angle);

            var cur_col_angle = 0.0;
            var cur_col_text = 0.0;
            for (var j = 0; j <= columns; j++) {
                var cur_col_sin = Math.sin(cur_col_angle);
                var cur_col_cos = Math.cos(cur_col_angle);

                vertices[cur_pos + 0] = cur_col_sin * cur_row_sin;
                vertices[cur_pos + 1] = cur_row_cos;
                vertices[cur_pos + 2] = cur_col_cos * cur_row_sin;
                //var length = Math.sqrt((vertices[cur_pos + 0] * vertices[cur_pos + 0]) + (vertices[cur_pos + 1] * vertices[cur_pos + 1]) + (vertices[cur_pos + 2] * vertices[cur_pos + 2]));
                vertices[cur_pos + 3] = vertices[cur_pos + 0];
                vertices[cur_pos + 4] = vertices[cur_pos + 1];
                vertices[cur_pos + 5] = vertices[cur_pos + 2];
                vertices[cur_pos + 6] = cur_col_text;
                vertices[cur_pos + 7] = cur_row_text;
                cur_pos += 8;

                cur_col_angle += step_col_angle;
                cur_col_text += step_col_text;
            }
            cur_row_angle += step_row_angle;
            cur_row_text += step_row_text;
        }
        vertices[cur_pos + 0] = 0.0;
        vertices[cur_pos + 1] = -1.0;
        vertices[cur_pos + 2] = 0.0;
        vertices[cur_pos + 3] = 0.0;
        vertices[cur_pos + 4] = -1.0;
        vertices[cur_pos + 5] = 0.0;
        vertices[cur_pos + 6] = 0.5;
        vertices[cur_pos + 7] = 1.0;
        cur_pos += 8;

        var triangles = new Array(2 * columns * (rows - 1) * 3);
        cur_pos = 0;
        for (var i = 0; i < columns; i++) {
            triangles[cur_pos + 0] = 0;
            triangles[cur_pos + 1] = i + 1;
            triangles[cur_pos + 2] = i + 2;
            cur_pos += 3;
        }
        var row_cur = 1;
        var row_next = row_cur + (columns + 1);
        for (var i = 0; i < rows - 2; i++) {
            for (var j = 0; j < columns; j++) {
                triangles[cur_pos + 0] = row_cur + j;
                triangles[cur_pos + 1] = row_next + j;
                triangles[cur_pos + 2] = row_next + j + 1;
                cur_pos += 3;
            }
            for (var j = 0; j < columns; j++) {
                triangles[cur_pos + 0] = row_cur + j;
                triangles[cur_pos + 1] = row_cur + j + 1;
                triangles[cur_pos + 2] = row_next + j + 1;
                cur_pos += 3;
            }
            row_cur = row_next;
            row_next += (columns + 1);
        }
        for (var i = 0; i < columns; i++) {
            triangles[cur_pos + 0] = row_cur + i;
            triangles[cur_pos + 1] = row_cur + i + 1;
            triangles[cur_pos + 2] = row_next;
            cur_pos += 3;
        }

        var buffers = new Array();
        buffers[0] = { bufferType: WebGlApi.BUFFER_TYPE.TRIANGLES, size: 2 * columns * (rows - 1) * 3 };

        var objectData = {};
        objectData.name = "Sphere";
        objectData.types = new Array();
        objectData.types[0] = { dataType: WebGlApi.DATA_TYPE.COORDINATES, size: 12 };
        objectData.types[1] = { dataType: WebGlApi.DATA_TYPE.NORMALS, size: 12 };
        objectData.types[2] = { dataType: WebGlApi.DATA_TYPE.TEXTURE, size: 8, tag: "Content/img/earth.jpg" };
        objectData.buffers = buffers;
        objectData.vertices = vertices;
        objectData.triangles = triangles;

        reply(objectData);
    }
});
