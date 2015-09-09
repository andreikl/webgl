import React from 'react';
import Matrix from 'gl-matrix';
import WebGlApi from './../utils/webglhelpers.jsx';

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
        return <div>
        </div>
    }
})
