'use strict';

var App = require('ampersand-app');
var View = require('ampersand-view');
var ViewSwitcher = require('ampersand-view-switcher');

var Utils = require('./../utils/utils');

var TutorialsView = View.extend({
    template: '<body><h1>Tutorials</h1><div role="page-container"></div></body>',
    autoRender: true,
    props: {
        windowHeight: ['number', true, window.innerHeight],
        windowWidth: ['number', true, window.innerWidth],
        windowOffset: ['number', true, window.pageYOffset]
    },

    initialize: function () {
        this.listenTo(this.model, 'change:tutorial', this._handleRoute);
        window.addEventListener( 'resize', this._handleViewport.bind( this ));
    },

    render: function () {
        this.renderWithTemplate();

        this.container = this.query("[role='page-container']");
        this.containerBaseClass = this.container.className;
        this.pages = new ViewSwitcher(this.container, {
        });
    },

    _handleViewport: function( e ) {
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.windowOffset = window.pageYOffset;
        console.log(this.windowHeight, this.windowWidth, this.windowOffset);
    },

    _handleRoute: function (p) {
        if (!App.model.tutorial) {
            return;
        }

        console.log('handleRoute has been called: ' + App.model.tutorial);
        switch (App.model.tutorial) {
            case 'tutorial1':
                this.container.className = this.containerBaseClass + ' tutorial1';
                if (!this.tutorial1) {
                    this.tutorial1 = new (require('./tutorial1'))({app: this});
                }
                this.pages.set(this.tutorial1);
            break;
            case 'tutorial2':
                this.container.className = this.containerBaseClass + ' tutorial2';
                if (!this.tutorial2) {
                    this.tutorial2 = new (require('./tutorial2'))({app: this});
                }
                this.pages.set(this.tutorial2);
            break;
            case 'tutorial3':
                this.container.className = this.containerBaseClass + ' tutorial3';
                if (!this.tutorial3) {
                    this.tutorial3 = new (require('./tutorial3'))({app: this});
                }
                this.pages.set(this.tutorial3);
            break;
            case 'tutorial4':
                this.container.className = this.containerBaseClass + ' tutorial4';
                if (!this.tutorial4) {
                    this.tutorial4 = new (require('./tutorial4'))({app: this});
                }
                this.pages.set(this.tutorial4);
            break;

            default:
                this.container.className = this.containerBaseClass + ' home';
                if (!this.home) {
                    this.home = new (require('./home'))({app: this});
                }
                this.pages.set(this.home);
        }
    }
});

module.exports = TutorialsView;
