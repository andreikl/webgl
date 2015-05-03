'use strict';
 
var View = require('ampersand-view');
var Utils = require('./../common/utils');

module.exports = View.extend({
    template: '<div class="tutorial2">Tutorial 2</div>',
    pageTitle: 'Tutorial 2!',
    initialize: function () {
        //Utils.addClass(this.el, 'tutorial2');
    }
});
