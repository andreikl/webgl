import Router from 'ampersand-router';
import React from 'react';

import HomePage from './views/home.js';
import Tutorial1Page from './views/tutorial1.js';

export default Router.extend({
    routes: {
        '': '_home',
        'tutorial1': '_tutorial1'
    },
    _home () {
        window.app.model.tutorial = 'home';
        React.render(<HomePage/>, document.body);
    },
    _tutorial1 () {
        window.app.model.tutorial = 'tutorial1';
        React.render(<HomePage/>, document.body);
    }
});
