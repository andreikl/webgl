'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');
var template = require('./../../tpl/tutorial1.hbs.html')

module.exports = View.extend({
    template: template,
    pageTitle: 'Tutorial 3!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial3');
    }
});
