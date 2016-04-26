var Hapi = require('hapi');
var webpack = require('webpack');
var Matrix = require('gl-matrix');

var config = {
    "isDev": true
}

console.log('\x1b[32m', 'Config isDev: ' + config.isDev, '\x1b[0m');

var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8080,
    routes: {
        cors: true
    }
});

var plugin = {
    register: function (server, options, next) {
        var compiler = webpack(options);
        compiler.watch({ // watch options:
            aggregateTimeout: 300, // wait so long for more changes
            poll: false // use polling instead of native watchers
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
            if (stats.warnings.length > 0) {
                for (var i in stats.warnings) {
                    console.log('\x1b[33m', 'warning:' ,'\x1b[0m');
                    console.log(stats.warnings[i]);
                }
            }
            console.log('\x1b[32m', 'Building is successfull' ,'\x1b[0m');
        });
        next();
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
                path: __dirname + '/bundle',
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
                }) (),
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
                }) ()
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
    path: '/bundle/{param*}',
    handler: {
        directory: {
            path: './bundle',
            listing: true
        }
    },
});

server.route({
    method: 'GET',
    path: '/images/{param*}',
    handler: {
        directory: {
            path: './images',
            listing: true
        }
    },
});

var WebGlApi = {
    DATA_TYPE: { COORDINATES: 1, NORMALS: 2, TANGENTS: 3, TEXTURE: 4 },
    BUFFER_TYPE: { LINE_STRIP: 1, LINES: 2, TRIANGLES: 3, TRIANGLE_STRIP: 4 }
};

var halfPi = Math.PI / 2;

// Add the routes
server.route({
    method: 'GET',
    path:'/api/getCube', 
    handler: function (request, reply) {
        if (!request.query.rows) {
            request.query.rows = 1;
        }
        if (!request.query.columns) {
            request.query.columns = 1;
        }

        var stride = 3;
        if (request.query.isNormales) {
            stride += 3;
        }
        if (request.query.isTangents) {
            stride += 3;
        }
        if (request.query.isUVs) {
            stride += 2;
        }

        var cur_pos = 0;
        var vertices = new Array((request.query.rows + 1) * (request.query.columns + 1) * stride * 6);

        var step_x = 2.0 / request.query.columns;
        var step_y = 2.0 / request.query.rows;

        var pos_x = -1.0;
        var pos_y = 1.0;
        var pos_z = 1.0;

        var step_uv_x = 1.0 / 4 / request.query.columns;
        var step_uv_y = 1.0 / 3 / request.query.rows;

        var pos_uv_x = 1.0 / 4 * 1;
        var pos_uv_y = 1.0 / 3;
        for (var y = 0; y <= request.query.rows; y++) {
            for (var x = 0; x <= request.query.columns; x++) {
                // x y z
                vertices[cur_pos + 0] = pos_x;
                vertices[cur_pos + 1] = pos_y;
                vertices[cur_pos + 2] = pos_z;
                cur_pos += 3;
                // normale
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 0.0;
                    vertices[cur_pos + 2] = 1.0;
                    cur_pos += 3;
                }
                // s tangent
                if (request.query.isTangents) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 1.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = pos_uv_x;
                    vertices[cur_pos + 1] = pos_uv_y;
                    cur_pos += 2;
                }

                pos_x += step_x;
                pos_uv_x += step_uv_x;
            }
            pos_x = -1.0;
            pos_y -= step_y;
            pos_uv_x = 1.0 / 4 * 1;
            pos_uv_y += step_uv_y;
        }

        pos_x = 1.0;
        pos_y = 1.0;
        pos_z = 1.0;

        pos_uv_x = 1.0 / 4 * 2;
        pos_uv_y = 1.0 / 3;
        for (var y = 0; y <= request.query.rows; y++) {
            for (var x = 0; x <= request.query.columns; x++) {
                // x y z
                vertices[cur_pos + 0] = pos_x;
                vertices[cur_pos + 1] = pos_y;
                vertices[cur_pos + 2] = pos_z;
                cur_pos += 3;
                // normale
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = 1.0;
                    vertices[cur_pos + 1] = 0.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // s tangent
                if (request.query.isTangents) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 1.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = pos_uv_x;
                    vertices[cur_pos + 1] = pos_uv_y;
                    cur_pos += 2;
                }

                pos_z -= step_x;
                pos_uv_x += step_uv_x;
            }
            pos_z = 1.0;
            pos_y -= step_y;
            pos_uv_x = 1.0 / 4 * 2;
            pos_uv_y += step_uv_y;
        }

        pos_x = 1.0;
        pos_y = 1.0;
        pos_z = -1.0;

        pos_uv_x = 1.0 / 4 * 3;
        pos_uv_y = 1.0 / 3;
        for (var y = 0; y <= request.query.rows; y++) {
            for (var x = 0; x <= request.query.columns; x++) {
                // x y z
                vertices[cur_pos + 0] = pos_x;
                vertices[cur_pos + 1] = pos_y;
                vertices[cur_pos + 2] = pos_z;
                cur_pos += 3;
                // normale
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 0.0;
                    vertices[cur_pos + 2] = -1.0;
                    cur_pos += 3;
                }
                // s tangent
                if (request.query.isTangents) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 1.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = pos_uv_x;
                    vertices[cur_pos + 1] = pos_uv_y;
                    cur_pos += 2;
                }

                pos_x -= step_x;
                pos_uv_x += step_uv_x;
            }
            pos_x = 1.0;
            pos_y -= step_y;
            pos_uv_x = 1.0 / 4 * 3;
            pos_uv_y += step_uv_y;
        }

        pos_x = -1.0;
        pos_y = 1.0;
        pos_z = -1.0;

        pos_uv_x = 0;
        pos_uv_y = 1.0 / 3;
        for (var y = 0; y <= request.query.rows; y++) {
            for (var x = 0; x <= request.query.columns; x++) {
                // x y z
                vertices[cur_pos + 0] = pos_x;
                vertices[cur_pos + 1] = pos_y;
                vertices[cur_pos + 2] = pos_z;
                cur_pos += 3;
                // normale
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = -1.0;
                    vertices[cur_pos + 1] = 0.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // s tangent
                if (request.query.isTangents) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 1.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = pos_uv_x;
                    vertices[cur_pos + 1] = pos_uv_y;
                    cur_pos += 2;
                }

                pos_z += step_x;
                pos_uv_x += step_uv_x;
            }
            pos_z = -1.0;
            pos_y -= step_y;
            pos_uv_x = 0;
            pos_uv_y += step_uv_y;
        }

        pos_x = -1.0;
        pos_y = 1.0;
        pos_z = 1.0;

        pos_uv_x = 1.0 / 4 * 1;
        pos_uv_y = 1.0 / 3;
        for (var y = 0; y <= request.query.rows; y++) {
            for (var x = 0; x <= request.query.columns; x++) {
                // x y z
                vertices[cur_pos + 0] = pos_x;
                vertices[cur_pos + 1] = pos_y;
                vertices[cur_pos + 2] = pos_z;
                cur_pos += 3;
                // normale
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = 1.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // s tangent
                if (request.query.isTangents) {
                    vertices[cur_pos + 0] = 1.0;
                    vertices[cur_pos + 1] = 0.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = pos_uv_x;
                    vertices[cur_pos + 1] = pos_uv_y;
                    cur_pos += 2;
                }

                pos_x += step_x;
                pos_uv_x += step_uv_x;
            }
            pos_x = -1.0;
            pos_z -= step_y;
            pos_uv_x = 1.0 / 4 * 1;
            pos_uv_y -= step_uv_y;
        }

        pos_x = -1.0;
        pos_y = -1.0;
        pos_z = 1.0;

        pos_uv_x = 1.0 / 4 * 1;
        pos_uv_y = 1.0 / 3 * 2;
        for (var y = 0; y <= request.query.rows; y++) {
            for (var x = 0; x <= request.query.columns; x++) {
                // x y z
                vertices[cur_pos + 0] = pos_x;
                vertices[cur_pos + 1] = pos_y;
                vertices[cur_pos + 2] = pos_z;
                cur_pos += 3;
                // normale
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = 0.0;
                    vertices[cur_pos + 1] = -1.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // s tangent
                if (request.query.isTangents) {
                    vertices[cur_pos + 0] = 1.0;
                    vertices[cur_pos + 1] = 0.0;
                    vertices[cur_pos + 2] = 0.0;
                    cur_pos += 3;
                }
                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = pos_uv_x;
                    vertices[cur_pos + 1] = pos_uv_y;
                    cur_pos += 2;
                }

                pos_x += step_x;
                pos_uv_x += step_uv_x;
            }
            pos_x = -1.0;
            pos_z -= step_y;
            pos_uv_x = 1.0 / 4 * 1;
            pos_uv_y += step_uv_y;
        }

        cur_pos = 0;
        var start_block = 0;
        var column = (request.query.columns + 1)
        var triangles = new Array(2 * request.query.columns * request.query.rows * 3 * 6);
        for (var i = 0; i < 6; i++) {
            for (var y = 0; y < request.query.rows; y++) {
                for (var x = 0; x < request.query.columns; x++) {
                    triangles[cur_pos + 0] = start_block + x + y * column;
                    triangles[cur_pos + 1] = start_block + x + (y + 1) * column;
                    triangles[cur_pos + 2] = start_block + (x + 1) + (y + 1) * column;
                    cur_pos += 3;

                    triangles[cur_pos + 0] = start_block + x + y * column;
                    triangles[cur_pos + 1] = start_block + (x + 1) + y * column;
                    triangles[cur_pos + 2] = start_block + (x + 1) + (y + 1) * column;
                    cur_pos += 3;
                }
            }
            start_block += (request.query.columns + 1) * (request.query.rows + 1);
        }

        var buffers = new Array();
        buffers[0] = { bufferType: WebGlApi.BUFFER_TYPE.TRIANGLES, size: 2 * request.query.columns * request.query.rows * 3 * 6 };

        var objectData = {};
        objectData.name = "Box";
        objectData.types = new Array();

        var position = 0;
        // x y z
        objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.COORDINATES, 'size': 12, 'position': position });
        position += 12;
        // normale
        if (request.query.isNormales) {
            objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.NORMALS, 'size': 12, 'position': position });
            position += 12;
        }
        // s tangent
        if (request.query.isTangents) {
            objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.TANGENTS, 'size': 12, 'position': position, 'tag': 'images/earth_bump.jpg' });
            position += 12;
        }
        // uv
        if (request.query.isUVs) {
            objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.TEXTURE, 'size': 8, 'position': position, 'tag': 'images/earth.jpg' });
            position += 8;
        }

        objectData.buffers = buffers;
        objectData.vertices = vertices;
        objectData.triangles = triangles;

        // to support example 4
        objectData.boundingVolume = {
            type: "OBB",
            c: [0, 0, 0],
            u: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            e: [1, 1, 1]
        }
        // ----

        reply(objectData);
    }
});

server.route({
    method: 'GET',
    path:'/api/getSphere',
    handler: function (request, reply) {
        if (!request.query.rows) {
            request.query.rows = 30;
        }
        if (!request.query.columns) {
            request.query.columns = 25;
        }

        var stride = 3;
        if (request.query.isNormales) {
            stride += 3;
        }
        if (request.query.isTangents) {
            stride += 3;
        }
        if (request.query.isUVs) {
            stride += 2;
        }

        var vertices = new Array((2 + (request.query.rows - 1) * (request.query.columns + 1)) * stride);

        var step_row_angle = Math.PI / request.query.rows;
        var step_row_text = 1.0 / request.query.rows;
        var step_col_angle = 2 * Math.PI / request.query.columns;
        var step_col_text = 1.0 / request.query.columns;

        var cur_pos = 0;
        var cur_row_angle = step_row_angle;
        var cur_row_text = step_row_text;

        // x y z
        vertices[cur_pos + 0] = 0.0;
        vertices[cur_pos + 1] = 1.0;
        vertices[cur_pos + 2] = 0.0;
        cur_pos += 3;
        // normale
        if (request.query.isNormales) {
            vertices[cur_pos + 0] = 0.0;
            vertices[cur_pos + 1] = 1.0;
            vertices[cur_pos + 2] = 0.0;
            cur_pos += 3;
        }
        // s tangent
        if (request.query.isTangents) {
            vertices[cur_pos + 0] = 1.0;
            vertices[cur_pos + 1] = 0.0;
            vertices[cur_pos + 2] = 0.0;
            cur_pos += 3;
        }
        // uv
        if (request.query.isUVs) {
            vertices[cur_pos + 0] = 0.5;
            vertices[cur_pos + 1] = 0.0;
            cur_pos += 2;
        }

        for (var i = 0; i < request.query.rows - 1; i++) {
            var cur_row_sin = Math.sin(cur_row_angle);
            var cur_row_cos = Math.cos(cur_row_angle);

            var cur_col_angle = 0.0;
            var cur_col_text = 0.0;
            for (var j = 0; j <= request.query.columns; j++) {
                var cur_col_sin = Math.sin(cur_col_angle);
                var cur_col_cos = Math.cos(cur_col_angle);

                // x y z
                vertices[cur_pos + 0] = cur_col_sin * cur_row_sin;
                vertices[cur_pos + 1] = cur_row_cos;
                vertices[cur_pos + 2] = cur_col_cos * cur_row_sin;
                cur_pos += 3;

                // normale
                var normale = Matrix.vec3.fromValues(vertices[cur_pos - 3], vertices[cur_pos - 2], vertices[cur_pos - 1]);
                if (request.query.isNormales) {
                    vertices[cur_pos + 0] = normale[0];
                    vertices[cur_pos + 1] = normale[1];
                    vertices[cur_pos + 2] = normale[2];
                    cur_pos += 3;
                }

                // s tangent
                if (request.query.isTangents) {
                    var res = Matrix.vec3.create();
                    var point = Matrix.vec3.fromValues(0, 0, 0);
                    Matrix.vec3.rotateY(res, normale, point, -halfPi);
                    vertices[cur_pos + 0] = res[0];
                    vertices[cur_pos + 1] = res[1];
                    vertices[cur_pos + 2] = res[2];
                    cur_pos += 3;
                }

                // uv
                if (request.query.isUVs) {
                    vertices[cur_pos + 0] = cur_col_text;
                    vertices[cur_pos + 1] = cur_row_text;
                    cur_pos += 2;
                }

                cur_col_angle += step_col_angle;
                cur_col_text += step_col_text;
            }
            cur_row_angle += step_row_angle;
            cur_row_text += step_row_text;
        }
        // x y z
        vertices[cur_pos + 0] = 0.0;
        vertices[cur_pos + 1] = -1.0;
        vertices[cur_pos + 2] = 0.0;
        cur_pos += 3;
        // normale
        if (request.query.isNormales) {
            vertices[cur_pos + 0] = 0.0;
            vertices[cur_pos + 1] = -1.0;
            vertices[cur_pos + 2] = 0.0;
            cur_pos += 3;
        }
        // s tangent
        if (request.query.isTangents) {
            vertices[cur_pos + 0] = 1.0;
            vertices[cur_pos + 1] = 0.0;
            vertices[cur_pos + 2] = 0.0;
            cur_pos += 3;
        }
        // uv
        if (request.query.isUVs) {
            vertices[cur_pos + 0] = 0.5;
            vertices[cur_pos + 1] = 1.0;
            cur_pos += 2;
        }

        var triangles = new Array(2 * request.query.columns * (request.query.rows - 1) * 3);
        cur_pos = 0;
        for (var i = 0; i < request.query.columns; i++) {
            triangles[cur_pos + 0] = 0;
            triangles[cur_pos + 1] = i + 1;
            triangles[cur_pos + 2] = i + 2;
            cur_pos += 3;
        }
        var row_cur = 1;
        var row_next = row_cur + (request.query.columns + 1);
        for (var i = 0; i < request.query.rows - 2; i++) {
            for (var j = 0; j < request.query.columns; j++) {
                triangles[cur_pos + 0] = row_cur + j;
                triangles[cur_pos + 1] = row_next + j;
                triangles[cur_pos + 2] = row_next + j + 1;
                cur_pos += 3;
            }
            for (var j = 0; j < request.query.columns; j++) {
                triangles[cur_pos + 0] = row_cur + j;
                triangles[cur_pos + 1] = row_cur + j + 1;
                triangles[cur_pos + 2] = row_next + j + 1;
                cur_pos += 3;
            }
            row_cur = row_next;
            row_next += (request.query.columns + 1);
        }
        for (var i = 0; i < request.query.columns; i++) {
            triangles[cur_pos + 0] = row_cur + i;
            triangles[cur_pos + 1] = row_cur + i + 1;
            triangles[cur_pos + 2] = row_next;
            cur_pos += 3;
        }

        var buffers = new Array();
        buffers[0] = { bufferType: WebGlApi.BUFFER_TYPE.TRIANGLES, size: 2 * request.query.columns * (request.query.rows - 1) * 3 };

        var objectData = {};
        objectData.name = "Sphere";
        objectData.types = new Array();

        var position = 0;
        // x y z
        objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.COORDINATES, 'size': 12, 'position': position });
        position += 12;
        // normale
        if (request.query.isNormales) {
            objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.NORMALS, 'size': 12, 'position': position });
            position += 12;
        }
        // s tangent
        if (request.query.isTangents) {
            objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.TANGENTS, 'size': 12, 'position': position, 'tag': 'images/earth_bump.jpg' });
            position += 12;
        }
        // uv
        if (request.query.isUVs) {
            objectData.types.push({ 'dataType': WebGlApi.DATA_TYPE.TEXTURE, 'size': 8, 'position': position, 'tag': 'images/earth.jpg' });
            position += 8;
        }

        objectData.buffers = buffers;
        objectData.vertices = vertices;
        objectData.triangles = triangles;

        // to support example 4
        objectData.boundingVolume = {
            type: "OBB",
            c: [0, 0, 0],
            u: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            e: [1, 1, 1]
        }
        //

        reply(objectData);
    }
});
