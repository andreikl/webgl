import Router from './js/app-router.js';
import Model from './js/app-model.js';

import HomePage from './js/views/home.js';

import './scss/app.scss'

window.app = {
    init () {
        this.model = new Model();
        this.router = new Router();
        this.router.history.start();
    },
    options: {
        baseUrl: ''
    }
};

window.app.init();
