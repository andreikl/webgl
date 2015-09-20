import View from 'ampersand-view';

import WebGlApi from './../utils/webglhelpers.jsx';
import Utils from './../utils/utils.jsx';
import Matrix from 'gl-matrix';

import tutorial1Html from './../../tpl/tutorial1.html';

class Example1 {
    constructor (canvas, shaderProgram) {
        this.globject = null;
        this.canvas = canvas;
        this.shaderProgram = shaderProgram;

        this.control = null;
        //this.clock = null;
        this.fps = null;

        this.isRun = false;
    }


    initData (sphere) {
        var verticesBuffer = WebGlApi.gl.createBuffer();
        WebGlApi.gl.bindBuffer(WebGlApi.gl.ARRAY_BUFFER, verticesBuffer);
        WebGlApi.gl.bufferData(WebGlApi.gl.ARRAY_BUFFER, new Float32Array(sphere.vertices), WebGlApi.gl.STATIC_DRAW);

        var trianglesBuffer = WebGlApi.gl.createBuffer();
        WebGlApi.gl.bindBuffer(WebGlApi.gl.ELEMENT_ARRAY_BUFFER, trianglesBuffer);
        WebGlApi.gl.bufferData(WebGlApi.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere.triangles), WebGlApi.gl.STATIC_DRAW);

        this.globject = {};
        this.globject.vertices = verticesBuffer;
        this.globject.triangles = trianglesBuffer;
        this.globject.types = sphere.types;
        this.globject.buffers = sphere.buffers;

        this.globject.stride = 0;
        for (var i = 0; i < sphere.types.length; i++) {
            this.globject.stride += sphere.types[i].size;
        }
    }

    start () {
        var fpsElement = document.getElementById("fps");
        this.control = new WebGlApi.OrbitControl(this.canvas, 3);
        //this.clock = new WebGlApi.Clock();
        this.fps = new WebGlApi.Fps(fpsElement);

        // check if tick function is already called
        if (this.isRun === true) { return; }
        this.isRun = true;
        this.tick();
    }

    tick () {
        if (this.isRun !== true) { return; }

        this.fps.update();
        //var angle = clock.getElapsedTime() / 1000;
        //rotateViewMatrices(angle);

        if (this.globject !== null) {
            WebGlApi.gl.uniform4f(this.shaderProgram.materialColorUniform, 1.0, 0.0, 0.0, 1.0);
            WebGlApi.drawFrame(this.shaderProgram, this.globject, true);
        }
        requestAnimFrame(() => { this.tick(); });
    }
}

var Canvas = View.extend({
    props: {
        app: 'state',
    },
    events: {
        'resize': '_resizeHandler'
    },
    derived: {
        'size': {   //  Width in px.
            deps: ['app.windowWidth'],
            fn: function() {
                return this._getViewportSize();
            }
        },
    },
    '_getViewportSize': function () {
        var style = window.getComputedStyle(this.el);
        return {
            width: (style.width === "")? 1: parseFloat(style.width.replace(/[^\d^\.]*/g, '')),
            height: (style.height === "")? 1: parseFloat(style.height.replace(/[^\d^\.]*/g, ''))
        };
    },
});

export default View.extend({
    template: tutorial1Html,
    pageTitle: 'Tutorial 1!',
    props: {
        main: 'state',
        canvas: 'state'
    },
    bindings: {
        'canvas.size': {
            type: function (el, value, previousValue) {
                if (value) {
                    this._setPerspective(value);
                }
            }
        }
    },
    render: function () {
        var self = this;

        this.renderWithTemplate();

        // singleton
        if (!this.canvas) {
            var canvas = this.query('#webglcanvas');
            WebGlApi.initWebGl(canvas);

            this.canvas = new Canvas({
                el: canvas,
                main: this.main
            }); 
            

            this.shaderProgram = this._initShaders(WebGlApi.gl, this.query('#shader-fs'), this.query('#shader-vs'));

            this.example1 = new Example1(this.canvas.el, this.shaderProgram);

            setTimeout(function() {
                self._setPerspective(self.canvas._getViewportSize());
            }, 10);
        }

        Utils.ajaxGet('/api/getSphere', function (data) {
            self.example1.initData(data);
            self.example1.start();
        }, function (error) {
            console.log('Error is happend: ', error);
        });
    },
    initialize: function () {
    },
    _setPerspective: function (size) {
        console.log('_setPerspective: ', size)
        //0.7854 = 2*pi/8
        Matrix.mat4.perspective(WebGlApi.pMatrix, 0.7854, size.width / size.height, 0.1, 100.0);
    },
    _initShaders: function(gl, fs, vs) {
        var fragmentShader = WebGlApi.getShader(fs);
        var vertexShader = WebGlApi.getShader(vs);
        var shaderProgram = gl.createProgram();
        console.log(fragmentShader, vertexShader, shaderProgram);
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // get pointers to the shader params
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

        shaderProgram.materialColorUniform = gl.getUniformLocation(shaderProgram, "uMaterialColor");
        return shaderProgram;
    }
});
