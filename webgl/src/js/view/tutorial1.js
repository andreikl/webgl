'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');

module.exports = View.extend({
    template: '<div class="tutorial1">Tutorial 1</div>',
    pageTitle: 'Tutorial 1!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial1');
    }
});
