'use strict';
 
 //  App
var app = require('./app');

var View = require('ampersand-view');
var Tutorial1 = require('./view/tutorial1');

var AppView = View.extend({
    initialize: function() {
        if (document.querySelector('.tutorials')) {
            var $tutorials = this.query('.tutorials');
            var tutorialsView = new Tutorial1({
                app: this,
                el: $tutorials,
            });
        }
    }
});

window.addEventListener('DOMContentLoaded', function() {
    app.app = new AppView({ el: document.body });
});
