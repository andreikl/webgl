import View from 'ampersand-view';
import Matrix from 'gl-matrix';

import WebGlApi from './../utils/webglhelpers.jsx';
import Utils from './../utils/utils.jsx';
import Mtrx from './../utils/matrix.jsx';

import tutorial4Html from './../../tpl/tutorial4.html';

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
    template: tutorial4Html,
    pageTitle: 'Tutorial 4! Distance between OBB',
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

        this.elobj1 = this.queryByHook('obj1');
        this.elobj2 = this.queryByHook('obj2');

        setTimeout(() => {
            this._setPerspective(this.canvas._sizeHandler());
        }, 10);

        this.objs = [];
        Utils.ajaxGet('/api/getSphere?isNormales=true&isTangents=true&isUVs=true', (data) => {
            this.objs[0] = {};
            WebGlApi.setUpObject(this, this.objs[0], data);

            if (this.objs[1]) {
                this._run();
            }
        }, function (error) {
            console.log('Error is happend: ', error);
        });

        Utils.ajaxGet('/api/getCube?isNormales=true&isTangents=true&isUVs=true', (data) => {
            this.objs[1] = {};
            WebGlApi.setUpObject(this, this.objs[1], data);

            if (this.objs[0]) {
                this._run();
            }
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

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexSTangentAttribute = gl.getAttribLocation(shaderProgram, "aVertexSTangent");
        gl.enableVertexAttribArray(shaderProgram.vertexSTangentAttribute);

        //shaderProgram.vertexTTangentAttribute = gl.getAttribLocation(shaderProgram, "aVertexTTangent");
        //gl.enableVertexAttribArray(shaderProgram.vertexTTangentAttribute);

        shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexture");
        gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);

        shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
        shaderProgram.modelMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.modelNormalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");

        shaderProgram.bumpUniform = gl.getUniformLocation(shaderProgram, "uBump");

        shaderProgram.lightPositionUniform = gl.getUniformLocation(shaderProgram, "uLightPosition");
        shaderProgram.lightAmbientUniform = gl.getUniformLocation(shaderProgram, "uLightAmbient");
        shaderProgram.lightDiffuseUniform = gl.getUniformLocation(shaderProgram, "uLightDiffuse");
        shaderProgram.lightSpecularUniform = gl.getUniformLocation(shaderProgram, "uLightSpecular");
        return shaderProgram;

    },
    _initTexture (url, texture) {
        var image = new Image();
        image.onload = function () {
            WebGlApi.gl.bindTexture(WebGlApi.gl.TEXTURE_2D, texture);
  
            WebGlApi.gl.texImage2D(WebGlApi.gl.TEXTURE_2D, 0, WebGlApi.gl.RGBA, WebGlApi.gl.RGBA, WebGlApi.gl.UNSIGNED_BYTE, image);
                
            WebGlApi.gl.texParameteri(WebGlApi.gl.TEXTURE_2D, WebGlApi.gl.TEXTURE_MAG_FILTER, WebGlApi.gl.LINEAR);
            WebGlApi.gl.texParameteri(WebGlApi.gl.TEXTURE_2D, WebGlApi.gl.TEXTURE_MIN_FILTER, WebGlApi.gl.LINEAR);
            WebGlApi.gl.generateMipmap(WebGlApi.gl.TEXTURE_2D);
  
            WebGlApi.gl.bindTexture(WebGlApi.gl.TEXTURE_2D, null); 
        }
        image.src = url;
    },
    _run () {
        console.log(this.objs.length);
        for (var i = 0; i < this.objs.length; i++) {
            var x = Math.random() * 2 - 1;
            var y = Math.random() * 2 - 1;
            var z = Math.random() * 2 - 1;
            this.objs[i].direction = [x, y, z];
            this.objs[i].speed = Math.random() * 0.1;
            this.objs[i].center = Mtrx.mat4.create();
        }
        this.isRun = true;
        this._tick();
    },
    _tick () {
        if (this.isRun !== true) { return; }

        this.fps.update();

        WebGlApi.gl.uniform1f(this.shaderProgram.materialShininessUniform, 32.0);
        WebGlApi.gl.uniform3f(this.shaderProgram.lightAmbientUniform, 0.5, 0.5, 0.5);
        WebGlApi.gl.uniform3f(this.shaderProgram.lightDiffuseUniform, 0.9, 0.9, 0.9);
        WebGlApi.gl.uniform3f(this.shaderProgram.lightSpecularUniform, 1.0, 1.0, 1.0);

        var lightPos = [0.0, 0.0, 3.0]
        Mtrx.mat4.multiplyVec3(WebGlApi.vMatrix, lightPos);
        WebGlApi.gl.uniform3fv(this.shaderProgram.lightPositionUniform, lightPos);

        for (var i = 0; i < this.objs.length; i++) {
            var obj = this.objs[i];

            var x = obj.direction[0] * obj.speed;
            var y = obj.direction[1] * obj.speed;
            var z = obj.direction[2] * obj.speed;
            Matrix.mat4.translate(obj.mMatrix, obj.mMatrix, [x, y, z]);

            Mtrx.mat4.multiplyVec3(obj.mMatrix, obj.boundingVolume.c, obj.center);
            if(obj.center[0] > 5 || obj.center[0] < -5 || obj.center[1] > 5 || obj.center[1] < -5 || obj.center[2] > 5 || obj.center[2] < -5) {
                obj.direction[0] = -obj.direction[0];
                obj.direction[1] = -obj.direction[1];
                obj.direction[2] = -obj.direction[2];
            }

            //var res = [0, 0, 0];
            //Matrix.mat4.multiplyVec3(obj.mMatrix, obj.boundingVolume.c, res);
            //if(res[0] > 5 || res[0] < -5 || res[1] > 5 || res[1] < -5 || res[2] > 5 || res[2] < -5) {
            //    obj.direction[0] = -obj.direction[0];
            //    obj.direction[1] = -obj.direction[1];
            //    obj.direction[2] = -obj.direction[2];
            //}
        }

        for (var i = 0; i < this.objs.length; i++) {
            var obj = this.objs[i];
            for (var j = 0; j < this.objs.length; j++) {
                if (j !== i) {
                    var objto = this.objs[j];
                    var distance = WebGlApi.calculateDistance(obj, objto);

                    if (j === 0) {
                        this.elobj1.innerHTML = distance;
                    } else if (j === 1) {
                        this.elobj2.innerHTML = distance;
                    }
                }
            }

            WebGlApi.drawFrame(this.shaderProgram, obj, false);
        }
        //var angle = clock.getElapsedTime() / 1000;
        //rotateViewMatrices(angle);

        requestAnimFrame(() => { this._tick(); });
    }
});
