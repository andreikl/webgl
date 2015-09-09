import Router from 'ampersand-router';

export default Router.extend({
    routes: {
        '': '_home',
        'tutorial1': '_tutorial1',
        'tutorial2': '_tutorial2',
        'tutorial3': '_tutorial3',
        'tutorial4': '_tutorial4'
    },
    _home () {
        window.app.model.view = 'home';
    },
    _tutorial1 () {
        window.app.model.view = 'tutorial1';
    },
    _tutorial2 () {
        window.app.model.view = 'tutorial2';
    },
    _tutorial3 () {
        window.app.model.view = 'tutorial3';
    },
    _tutorial4 () {
        window.app.model.view = 'tutorial4';
    }
});
