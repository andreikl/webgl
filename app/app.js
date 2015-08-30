'use strict';


window.app = require('ampersand-app');
window.app.extend({
    options: {
        baseUrl: ''
    }
});

var Main = require('./js/view/main');

window.addEventListener('DOMContentLoaded', function() {

    window.app.model = new (require('./js/app-model'));
    window.app.router = new (require('./js/app-router'));

    window.app.main = new Main({
        el: document.body,
        model: window.app.model
    });

    window.app.router.history.start({pushState: false});
});
