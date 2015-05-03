'use strict';

var App = require('ampersand-app');
App.extend({
    options: {
        baseUrl: ''
    }
});

var Tutorials = require('./view/tutorials');
window.addEventListener('DOMContentLoaded', function() {
    App.model = new (require('./app-model'));
    App.router = new (require('./app-router'));

    var tutorials = new Tutorials({
        model: App.model
    });
    tutorials.render();

    document.querySelector('.tutorials').appendChild(tutorials.el);
});
