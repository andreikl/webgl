'use strict';

var App = require('ampersand-app');
var View = require('ampersand-view');
var ViewSwitcher = require('ampersand-view-switcher');

var Utils = require('./../common/utils');

var home = new (require('./home'));
var tutorial1 = new (require('./tutorial1'));
var tutorial2 = new (require('./tutorial2'));
var tutorial3 = new (require('./tutorial3'));
var tutorial4 = new (require('./tutorial4'));
    
var TutorialsView = View.extend({
    template: '<body><h1>Tutorials</h1><div role="page-container"></div></body>',
    autoRender: true,
    initialize: function () {
        this.listenTo(this.model, 'change:tutorial', this.handleRoute);
    },
    render: function () {
        this.renderWithTemplate();

        this.container = this.query("[role='page-container']");
        this.containerBaseClass = this.container.className;
        this.pages = new ViewSwitcher(this.container, {
        });
    },
    handleRoute: function (p) {
        if (!App.model.tutorial) {
            return;
        }

        console.log('handleRoute has been called: ' + App.model.tutorial);
        switch (App.model.tutorial) {
            case 'tutorial1':
                this.container.className = this.containerBaseClass + ' tutorial1';
                this.pages.set(tutorial1);
            break;
            case 'tutorial2':
                this.container.className = this.containerBaseClass + ' tutorial2';
                this.pages.set(tutorial2);
            break;
            case 'tutorial3':
                this.container.className = this.containerBaseClass + ' tutorial3';
                this.pages.set(tutorial3);
            break;
            case 'tutorial4':
                this.container.className = this.containerBaseClass + ' tutorial4';
                this.pages.set(tutorial4);
            break;

            default:
                this.container.className = this.containerBaseClass + ' home';
                this.pages.set(home);
        }
    }
});

module.exports = TutorialsView;
