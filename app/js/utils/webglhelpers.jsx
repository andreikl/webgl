import Matrix from 'gl-matrix';

Matrix.mat4.multiplyVec3 = function (mat, vec, dest) {
    if (!dest) { 
        dest = vec;
    }

    var x = vec[0], y = vec[1], z = vec[2];
    
    dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
    dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
    dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
    
    return dest;
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.ieRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var WebGlApi = {
    DATA_TYPE: { COORDINATES: 1, NORMALS: 2, TANGENTS: 3, TEXTURE: 4 },
    BUFFER_TYPE: { LINE_STRIP: 1, LINES: 2, TRIANGLES: 3, TRIANGLE_STRIP: 4 }
};

WebGlApi.initWebGl = function (canvas) {
    if (!WebGlApi.gl) {
        WebGlApi.gl = canvas.getContext("webgl");
    }
    if (!WebGlApi.gl) {
        WebGlApi.gl = canvas.getContext("experimental-webgl");
    }
    if (!WebGlApi.gl) {
        alert("Failed to create WebGL context!");
        return;
    }
    WebGlApi.viewportWidth = canvas.width;
    WebGlApi.viewportHeight = canvas.height;

    WebGlApi.pMatrix = Matrix.mat4.create();
    Matrix.mat4.identity(WebGlApi.pMatrix);

    WebGlApi.vMatrix = Matrix.mat4.create();
    Matrix.mat4.identity(WebGlApi.vMatrix);

    WebGlApi.nMatrix = Matrix.mat3.create();
    Matrix.mat3.identity(WebGlApi.nMatrix);

    WebGlApi.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    WebGlApi.gl.enable(WebGlApi.gl.DEPTH_TEST);

    WebGlApi.gl.getExtension('OES_standard_derivatives');
}

WebGlApi.getShader = function(shaderScript) {
    if (!shaderScript) {
        return;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = WebGlApi.gl.createShader(WebGlApi.gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = WebGlApi.gl.createShader(WebGlApi.gl.VERTEX_SHADER);
    } else {
        return;
    }

    WebGlApi.gl.shaderSource(shader, str);
    WebGlApi.gl.compileShader(shader);

    if (!WebGlApi.gl.getShaderParameter(shader, WebGlApi.gl.COMPILE_STATUS)) {
        alert(WebGlApi.gl.getShaderInfoLog(shader));
        return;
    }

    return shader;
}

WebGlApi.drawFrame = function(shaderProgram, globj, isSkelet) {
    WebGlApi.gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, WebGlApi.pMatrix);
    WebGlApi.gl.uniformMatrix4fv(shaderProgram.modelViewMatrixUniform, false, WebGlApi.vMatrix);
    if (shaderProgram.modelNormalMatrixUniform !== undefined) {
        WebGlApi.gl.uniformMatrix3fv(shaderProgram.modelNormalMatrixUniform, false, WebGlApi.nMatrix);
    }

    WebGlApi.gl.bindBuffer(WebGlApi.gl.ARRAY_BUFFER, globj.vertices);
    WebGlApi.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, WebGlApi.gl.FLOAT, WebGlApi.gl.GL_FALSE, globj.stride, 0);
    if (shaderProgram.vertexSTangentAttribute !== undefined) {
        WebGlApi.gl.vertexAttribPointer(shaderProgram.vertexSTangentAttribute, 3, WebGlApi.gl.FLOAT, WebGlApi.gl.GL_FALSE, globj.stride, 12);
    }
    if (shaderProgram.vertexTTangentAttribute !== undefined) {
        WebGlApi.gl.vertexAttribPointer(shaderProgram.vertexTTangentAttribute, 3, WebGlApi.gl.FLOAT, WebGlApi.gl.GL_FALSE, globj.stride, 24);
    }
    if (shaderProgram.vertexNormalAttribute !== undefined) {
        WebGlApi.gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, WebGlApi.gl.FLOAT, WebGlApi.gl.GL_FALSE, globj.stride, 36);
    }
    if (shaderProgram.vertexTextureAttribute !== undefined) {
        WebGlApi.gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, 2, WebGlApi.gl.FLOAT, WebGlApi.gl.GL_FALSE, globj.stride, 48);
    }
    if (globj.texture !== undefined) {
        WebGlApi.gl.activeTexture(WebGlApi.gl.TEXTURE0);
        WebGlApi.gl.bindTexture(WebGlApi.gl.TEXTURE_2D, globj.texture);
        WebGlApi.gl.uniform1i(shaderProgram.samplerUniform, 0);
    }
    if (globj.bumpMap !== undefined) {
        WebGlApi.gl.activeTexture(WebGlApi.gl.TEXTURE1);
        WebGlApi.gl.bindTexture(WebGlApi.gl.TEXTURE_2D, globj.bumpMap);
        WebGlApi.gl.uniform1i(shaderProgram.bumpUniform, 1);
    }

    var drown = 0;
    WebGlApi.gl.bindBuffer(WebGlApi.gl.ELEMENT_ARRAY_BUFFER, globj.triangles);
    for (var i = 0; i < globj.buffers.length; i++) {
        //for (var i = 0; i < 2; i++) {
        var item = globj.buffers[i];

        if (isSkelet === true) {
            WebGlApi.gl.drawElements(WebGlApi.gl.LINE_STRIP, item.size, WebGlApi.gl.UNSIGNED_SHORT, drown);
        } else {
            WebGlApi.gl.drawElements(WebGlApi.gl.TRIANGLES, item.size, WebGlApi.gl.UNSIGNED_SHORT, drown);
        }
        drown += item.size;
    }
}

WebGlApi.Fps = function (element) {
    this.element = element;

    this.lastTime = Date.now();
    this.nFrames = 0;

    this.update = function () {
        var currentTime = Date.now();
        var elapsedTime = currentTime - this.lastTime;
        this.nFrames++;

        if (elapsedTime >= 1000) {
            this.element.innerHTML = this.nFrames;

            this.lastTime = currentTime;
            this.nFrames = 0;
        }
    }
};

WebGlApi.Clock = function () {
    this.startTime = Date.now();

    this.getElapsedTime = function () {
        var currentTime = Date.now();
        return currentTime - this.startTime;
    }
};


WebGlApi.OrbitControl = function (element, radius, minRadius, maxRadius) {
    this.element = element;
    this.radius = radius;
    this.minRadius = (minRadius !== undefined) ? minRadius : 1;
    this.maxRadius = (maxRadius !== undefined) ? maxRadius : 10;

    var STATE = { NONE: 0, ROTATE: 1, ZOOM: 2, TRANSLATE: 3 };
    this.state = STATE.NONE;
    this.tempX = 0;
    this.tempY = 0;

    this.rotateAngleX = 0.0;
    this.rotateAngleY = 0.0;
    this.scale = 1.0;

    var scope = this;

    this.update = function () {
        var calcRadius = this.radius * this.scale;
        if (calcRadius < this.minRadius) {
            calcRadius = this.minRadius;
            this.scale = this.minRadius / this.radius;
        } else if (calcRadius > this.maxRadius) {
            calcRadius = this.maxRadius;
            this.scale = this.maxRadius / this.radius;
        }
        var x = calcRadius * Math.sin(this.rotateAngleX) * Math.cos(this.rotateAngleY);
        var y = calcRadius * Math.sin(this.rotateAngleY);
        var z = calcRadius * Math.cos(this.rotateAngleX) * Math.cos(this.rotateAngleY);
        if (this.rotateAngleY < Math.PI / 2 && this.rotateAngleY > -Math.PI / 2) {
            //Matrix.mat4.lookAt([x, y, z], [0, 0, 0], [0, 1, 0], WebGlApi.vMatrix);
            Matrix.mat4.lookAt(WebGlApi.vMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
        } else {
            //Matrix.mat4.lookAt([x, y, z], [0, 0, 0], [0, -1, 0], WebGlApi.vMatrix);
            Matrix.mat4.lookAt(WebGlApi.vMatrix, [x, y, z], [0, 0, 0], [0, -1, 0]);
        }

        //Matrix.mat4.toInverseMat3(WebGlApi.vMatrix, WebGlApi.nMatrix);
        Matrix.mat3.normalFromMat4(WebGlApi.nMatrix, WebGlApi.vMatrix);
    }
    this.zoom = function (delta) {
        if (delta > 0) {
            this.scale *= 0.95;
        } else {
            this.scale /= 0.95;
        }
        this.update();
    }

    this.rotate = function (deltaX, deltaY) {
        var angleX = 2 * Math.PI * deltaX / WebGlApi.viewportWidth;
        var angleY = 2 * Math.PI * deltaY / WebGlApi.viewportHeight;
        this.rotateAngleX += angleX;
        this.rotateAngleY -= angleY;
        this.update();
    }

    this.update();
    this.element.addEventListener('mousedown', onMouseDown, false);
    this.element.addEventListener('mousewheel', onMouseWheel, false);
    this.element.addEventListener('touchstart', onTouchStart, false);
    this.element.addEventListener('touchend', onTouchEnd, false);
    this.element.addEventListener('touchmove', onTouchMove, false);

    function onMouseMove(event) {
        //Cancel the default action (navigation) of the click.
        event.preventDefault();

        var deltaX = scope.tempX - event.clientX;
        var deltaY = scope.tempY - event.clientY;
        if (scope.state === STATE.ROTATE) {
            scope.rotate(deltaX, deltaY);
        } else if (scope.state === STATE.ZOOM) {
            scope.zoom(deltaY);
        } else if (scope.state === STATE.ROTATE) {
        }
        scope.tempX = event.clientX;
        scope.tempY = event.clientY;
    }

    function onMouseUp() {
        scope.element.removeEventListener('mousemove', onMouseMove, false);
        scope.element.removeEventListener('mouseup', onMouseUp, false);
        scope.state = STATE.NONE;
    }

    function onMouseDown(event) {
        //Cancel the default action (navigation) of the click.
        event.preventDefault();

        scope.tempX = event.clientX;
        scope.tempY = event.clientY;
        if (event.button === 0) {
            scope.state = STATE.ROTATE;
        } else if (event.button === 1) {
            scope.state = STATE.ZOOM;
        } else if (event.button === 2) {
            scope.state = STATE.TRANSLATE;
        }
        scope.element.addEventListener('mousemove', onMouseMove, false);
        scope.element.addEventListener('mouseup', onMouseUp, false);
    }

    function onMouseWheel(event) {
        //Cancel the default action (navigation) of the click.
        event.preventDefault();

        scope.zoom(event.wheelDelta);
    }

    function onTouchStart(event) {
        // Cancel the default action (navigation) of the click.
        event.preventDefault();

        switch (event.touches.length) {
            case 1:
                scope.tempX = event.touches[0].pageX;
                scope.tempY = event.touches[0].pageY;
                scope.state = STATE.ROTATE;
                break;

            case 2:
                var dx = event.touches[1].pageX - event.touches[0].pageX;
                var dy = event.touches[1].pageY - event.touches[0].pageY;
                scope.tempY = Math.sqrt(dx * dx + dy * dy);
                scope.state = STATE.ZOOM;
                break;

            default:
                scope.state = STATE.NONE;
        }
    }

    function onTouchMove(event) {
        // Cancel the default action (navigation) of the click.
        event.preventDefault();

        switch (event.touches.length) {
            case 1:
                if (scope.state !== STATE.ROTATE) {
                    return;
                }
                var deltaX = scope.tempX - event.touches[0].pageX;
                var deltaY = scope.tempY - event.touches[0].pageY;
                scope.rotate(deltaX, deltaY);
                scope.tempX = event.touches[0].pageX;
                scope.tempY = event.touches[0].pageY;
                break;

            case 2:
                if (scope.state !== STATE.ZOOM) {
                    return;
                }
                var dx = event.touches[1].pageX - event.touches[0].pageX;
                var dy = event.touches[1].pageY - event.touches[0].pageY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                scope.zoom(dist - scope.tempY);
                scope.tempY = dist;
                break;
        }
    }

    function onTouchEnd(event) {
        scope.state = STATE.NONE;
    }
};

module.exports = WebGlApi;
