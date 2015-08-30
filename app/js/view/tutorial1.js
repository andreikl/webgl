'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');
var templates = require('./../templates.js');

module.exports = View.extend({
    template: templates.tutorial1,
    pageTitle: 'Tutorial 1!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial1');
    }
});
