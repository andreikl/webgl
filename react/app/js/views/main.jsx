import ViewSwitcher from 'ampersand-view-switcher';
import View from 'ampersand-view';

import HomePage from './home.jsx';

export default View.extend({
    template: '<div id="#content"><h1>Tutorials</h1><div role="page-container"></div></div>',
    props: {
        windowHeight: ['number', true, window.innerHeight],
        windowWidth: ['number', true, window.innerWidth],
        windowOffset: ['number', true, window.pageYOffset]
    },
    pageTitle: 'View Switcher',
    initialize () {
        this.renderWithTemplate();

        this.container = this.query("[role='page-container']");
        this.pages = new ViewSwitcher(this.container, {});

        this.listenTo(this.model, 'change:view', this._handleRoute);
        window.addEventListener( 'resize', this._handleViewport.bind( this ));
    },
    _handleViewport (e) {
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.windowOffset = window.pageYOffset;
    },
    _handleRoute (p) {
        console.log('handleRoute has been called: ', this.model.view);
        switch (this.model.view) {
            default:
                this.container.className = this.model.view;
                if (!this.home) {
                    this.home = new HomePage({main: this});
                }
                this.pages.set(this.home);
        }
    }
});
