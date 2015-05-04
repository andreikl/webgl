'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');

var template = require('./../../tpl/tutorial1.hbs.html')

console.log(template);

module.exports = View.extend({
    template: template,
    pageTitle: 'Tutorial 1!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial1');
    }
});
