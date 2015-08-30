'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');
var templates = require('./../templates.js');

module.exports = View.extend({
    template: templates.tutorial4,
    pageTitle: 'Tutorial 4!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial4');
    }
});
