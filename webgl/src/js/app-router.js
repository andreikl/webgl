var App = require('ampersand-app'); 
var Router = require('ampersand-router');

module.exports = Router.extend({
    routes: {
        '': 'tutorial',
        'tutorials/:tutorial': 'tutorial'
    },
    initialize: function () {
        this.history.start({pushState: false});
    },
    tutorial: function (tutorial) {
        console.log('route is changed: ' + tutorial);
        App.model.tutorial = tutorial;
    }
});
