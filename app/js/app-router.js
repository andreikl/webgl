var App = require('ampersand-app'); 
var Router = require('ampersand-router');

module.exports = Router.extend({
    routes: {
        '': '_home',
        'tutorials/:tutorial': '_tutorial'
    },
    initialize: function () {
    },
    _home: function () {
        App.model.tutorial = 'home';
    },
    _tutorial: function (tutorial) {
        App.model.tutorial = tutorial;
    }
});
