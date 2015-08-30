'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../utils/utils');
var templates = require('./../templates.js');

module.exports = View.extend({
    template: templates.home,
    pageTitle: 'Home',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial1');
    }
});
