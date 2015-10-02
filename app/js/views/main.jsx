import ViewSwitcher from 'ampersand-view-switcher';
import View from 'ampersand-view';

import Tutorial1Page from './tutorial1.jsx';
import Tutorial2Page from './tutorial2.jsx';
import Tutorial3Page from './tutorial3.jsx';
import Tutorial4Page from './tutorial4.jsx';
import HomePage from './home.jsx';

export default View.extend({
    template: '<div class="container" data-hook="page-container"></div>',
    props: {
        windowHeight: ['number', true, window.innerHeight],
        windowWidth: ['number', true, window.innerWidth],
        windowOffset: ['number', true, window.pageYOffset]
    },
    pageTitle: 'View Switcher',
    initialize () {
        this.renderWithTemplate();

        this.container = this.queryByHook('page-container');
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
            case 'tutorial1':
                if (!this.tutorial1) {
                    this.tutorial1 = new Tutorial1Page({main: this});
                }
                this.pages.set(this.tutorial1);
                break;

            case 'tutorial2':
                if (!this.tutorial2) {
                    this.tutorial2 = new Tutorial2Page({main: this});
                }
                this.pages.set(this.tutorial2);
                break;

            case 'tutorial3':
                if (!this.tutorial3) {
                    this.tutorial3 = new Tutorial3Page({main: this});
                }
                this.pages.set(this.tutorial3);
                break;

            default:
                if (!this.home) {
                    this.home = new HomePage({main: this});
                }
                this.pages.set(this.home);
        }
    }
});
