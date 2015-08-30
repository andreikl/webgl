'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');
var templates = require('./../templates.js');

module.exports = View.extend({
    template: templates.tutorial3,
    pageTitle: 'Tutorial 3!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial3');
    }
});
