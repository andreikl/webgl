import View from 'ampersand-view';

import WebGlApi from './../utils/webglhelpers.jsx';
import Utils from './../utils/utils.jsx';
import Matrix from 'gl-matrix';

import tutorial2Html from './../../tpl/tutorial2.html';

var Canvas = View.extend({
    props: {
        main: 'state',
    },
    derived: {
        'size': {   //  Width in px.
            deps: ['main.windowWidth'],
            fn: function() {
                return this._sizeHandler();
            }
        },
    },
    _sizeHandler () {
        var style = window.getComputedStyle(this.el);
        return {
            width: (style.width === "")? undefined: parseFloat(style.width.replace(/[^\d^\.]*/g, '')),
            height: (style.height === "")? undefined: parseFloat(style.height.replace(/[^\d^\.]*/g, ''))
        };
    }
});

export default View.extend({
    template: tutorial2Html,
    pageTitle: 'Tutorial 2!',
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
    render () {
        this.renderWithTemplate();

        this.canvas = new Canvas({
            el: this.queryByHook('canvas'),
            main: this.main
        });
        WebGlApi.initWebGl(this.canvas.el);
        //this.clock = new WebGlApi.Clock();
        this.fps = new WebGlApi.Fps(this.queryByHook('fps'));
        this.control = new WebGlApi.OrbitControl(this.canvas.el, 3);
        this.shaderProgram = this._initShaders(WebGlApi.gl, this.query('#shader-fs'), this.query('#shader-vs'));

        setTimeout(() => {
            this._setPerspective(this.canvas._sizeHandler());
        }, 10);

        Utils.ajaxGet('/api/getSphere', (data) => {
            this.object1 = {};
            WebGlApi.setUpObject(this, this.object1, data);

            this.isRun = true;
            this._tick();
        }, function (error) {
            console.log('Error is happend: ', error);
        });
    },
    initialize () {
        this.once('remove', this.cleanup, this);
    },
    cleanup () {
        this.isRun = false;
    },
    _setPerspective (size) {
        //console.log('_setPerspective: ', size)
        //0.7854 = 2*pi/8
        if (size.width && size.height) {
            Matrix.mat4.perspective(WebGlApi.pMatrix, 0.7854, size.width / size.height, 0.1, 100.0);
        }
    },
    _initShaders (gl, fs, vs) {
        var fragmentShader = WebGlApi.getShader(fs);
        var vertexShader = WebGlApi.getShader(vs);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // get pointers to the shader params
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
        shaderProgram.modelMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.modelNormalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

        shaderProgram.materialColorUniform = gl.getUniformLocation(shaderProgram, "uMaterialColor");
        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");

        shaderProgram.lightPositionUniform = gl.getUniformLocation(shaderProgram, "uLightPosition");
        shaderProgram.lightAmbientUniform = gl.getUniformLocation(shaderProgram, "uLightAmbient");
        shaderProgram.lightDiffuseUniform = gl.getUniformLocation(shaderProgram, "uLightDiffuse");
        shaderProgram.lightSpecularUniform = gl.getUniformLocation(shaderProgram, "uLightSpecular");
        return shaderProgram;
    },
    _tick () {
        if (this.isRun !== true) { return; }

        this.fps.update();
        //var angle = clock.getElapsedTime() / 1000;
        //rotateViewMatrices(angle);

        WebGlApi.gl.uniform4f(this.shaderProgram.materialColorUniform, 0.0, 0.0, 1.0, 1.0);
        WebGlApi.gl.uniform1f(this.shaderProgram.materialShininessUniform, 32.0);
        WebGlApi.gl.uniform3f(this.shaderProgram.lightAmbientUniform, 0.2, 0.2, 0.2);
        WebGlApi.gl.uniform3f(this.shaderProgram.lightDiffuseUniform, 0.7, 0.7, 0.7);
        WebGlApi.gl.uniform3f(this.shaderProgram.lightSpecularUniform, 1.0, 1.0, 1.0);

        var lightPos = [0.0, 0.0, 3.0]
        Matrix.mat4.multiplyVec3(WebGlApi.vMatrix, lightPos);
        WebGlApi.gl.uniform3fv(this.shaderProgram.lightPositionUniform, lightPos);

        WebGlApi.drawFrame(this.shaderProgram, this.object1, false);

        requestAnimFrame(() => { this._tick(); });
    }
});
