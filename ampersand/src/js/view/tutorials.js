'use strict';
 
var ViewSwitcher = require('ampersand-view-switcher');
var tutorial1 = new (require('./tutorial1'));
var tutorial2 = new (require('./tutorial2'));
var View = require('ampersand-view');
var App = require('ampersand-app');

var TutorialsView = View.extend({
    template: '<div class="page-container"></div>',
    initialize: function () {
    },
    render: function () {
        console.log('Render is called');

        this.renderWithTemplate();
        App.pageSwitcher = this.pageSwitcher = new ViewSwitcher(this.query('.page-container'), {
            //view: tutorial1
        });
        this.listenToAndRun(this.model, 'change:tutorial', this.handleRoute);
    },
    handleRoute: function (p) {
        console.log('handleRoute has been called: ' + this.model.tutorial);
        switch (this.model.tutorial) {
            case 'tutorial1':
                App.pageSwitcher.set(tutorial1);
            break;
            case 'tutorial2':
                App.pageSwitcher.set(tutorial2);
            break;
        }
    }
});

module.exports = TutorialsView;
