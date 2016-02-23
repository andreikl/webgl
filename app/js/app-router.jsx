import Router from 'ampersand-router';

export default Router.extend({
    routes: {
        '': () => {
            window.app.model.view = 'home';
        },
        'tutorial1': () => {
            window.app.model.view = 'tutorial1';
        },
        'tutorial2': () => {
            window.app.model.view = 'tutorial2';
        },
        'tutorial3': () => {
            window.app.model.view = 'tutorial3';
        },
        'tutorial4': () => {
            window.app.model.view = 'tutorial4';
        },
        'tutorial5': () => {
            window.app.model.view = 'tutorial5';
        },
    }
});
