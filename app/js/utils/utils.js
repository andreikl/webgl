'use strict';

module.exports = {
    ajaxGet: function (url, s, f) {
        var r = new XMLHttpRequest();
        r.open("GET", "/api/getSphere", true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) {
                return;
            }
            var data = JSON.parse(r.responseText);
            s(data);
        };
        r.onerror = function (error) {
            if (f) {
                f(error);
            }
        };
        r.send();
    },

    addClass: function (el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    },

    toggleClass: function (el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);
            if (existingIndex >= 0) {
                classes.splice(existingIndex, 1);
            } else {
                classes.push(className);
            }
            el.className = classes.join(' ');
        }
    }
};
