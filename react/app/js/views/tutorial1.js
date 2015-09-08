import React from 'react';
import Matrix from 'gl-matrix';
import WebGlApi from './../utils/webglhelpers';

class Example1 {
    constructor (canvas, shaderProgram) {
        this.globject = null;
        this.canvas = canvas;
        this.shaderProgram = shaderProgram;

        var scope = this;
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
        this.control = new WebGlApi.OrbitControl(canvas, 3);
        //this.clock = new WebGlApi.Clock();
        this.fps = new WebGlApi.Fps(fpsElement);

        // check if tick function is already called
        if (this.isRun === true) { return; }
        this.isRun = true;
        this.tick();
    }

    tick () {
        if (scope.isRun !== true) { return; }

        scope.fps.update();
        //var angle = clock.getElapsedTime() / 1000;
        //rotateViewMatrices(angle);

        if (scope.globject !== null) {
            WebGlApi.gl.uniform4f(scope.shaderProgram.materialColorUniform, 1.0, 0.0, 0.0, 1.0);
            WebGlApi.drawFrame(scope.shaderProgram, scope.globject, true);
        }
        requestAnimFrame(scope.tick);
    }
}

export default React.createClass({
    displayName: 'tutorial1Page',
    render () {
        return <div class="tutorial1">
            <h1>Example 1</h1>
            <div id="fps">---</div>
            <canvas id="webglcanvas" style="border: 'none'; width: '100%'; height: '100%';">Canvas element is not supported</canvas>
            <form id="configure-form">
                <input type="submit" name="GetSphere" value="Get Sphere"></input>
            </form>
            <script id="hader-vs" type="x-shader/x-vertex">
                attribute vec3 aVertexPosition;

                uniform mat4 uMVMatrix;
                uniform mat4 uPMatrix;

                void main(void) {
                    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
                }
            </script>
            <script id="shader-fs" type="x-shader/x-fragment">
                precision mediump float;

                uniform vec4 uMaterialColor;

                void main(void) {
                    gl_FragColor = uMaterialColor;
                }
            </script>
        </div>
    }
})
