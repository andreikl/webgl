var Hapi = require('hapi');
var MoonbootsHapi = require('moonboots_hapi');

var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8080 
});

var templatizer = require('templatizer');
var stylizer =  require('stylizer');
var config = require('getconfig');
server.register({
    register: MoonbootsHapi,
    options: {
        appPath: '/{p*}',
        moonboots: {
            developmentMode: config.isDev,
            main: __dirname + '/app/app.js',
            stylesheets: [
                __dirname + '/app/app.css'
            ],
            beforeBuildJS: function () {
                if (config.isDev) {
                    templatizer(__dirname + '/app/tpl', __dirname + '/app/js/templates.js');
                }
            },
            beforeBuildCSS: function (done) {
                if (!config.isDev) {
                    return done();
                }

                stylizer({
                    infile: __dirname + '/app/styl/app.styl',
                    outfile: __dirname + '/app/app.css',
                    development: true,
                    watch: __dirname + '/app/styl/**/*.styl'
                }, done);
            }
        }
    }
}, function() {
    console.log('Server Plugin (moonboots_hapi) is registered');

    // Start the server
    server.start(function() {
         console.log('Server running at:', server.info.uri);
    });
});

// Add the route
server.route({
    method: 'GET',
    path:'/test', 
    handler: function (request, reply) {
       reply('hello world!');
    }
});
