import Router from 'ampersand-router';
import React from 'react';

import HomePage from './views/home.js';

export default Router.extend({
    routes: {
        '': '_home',
        'tutorials/:tutorial': '_tutorial'
    },
    _home () {
        window.app.model.tutorial = 'home';
        console.log(window.app.model.tutorial);
        React.render(<HomePage/>, document.body);
    },
    _tutorial (tutorial) {
        window.app.model.tutorial = tutorial;
        console.log(window.app.model.tutorial);
    }
});
