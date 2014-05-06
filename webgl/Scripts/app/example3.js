Example3 = function (canvas) {
    this.globject = null;
    this.canvas = canvas;

    var scope = this;
    this.control = null;
    this.fps = null;

    this.isRun = false;

    WebGlApi.initWebGl(canvas);
    mat4.perspective(45, WebGlApi.viewportWidth / WebGlApi.viewportHeight, 0.1, 100.0, WebGlApi.pMatrix);

    this.initShader = function (gl) {
        var fragmentShader = WebGlApi.getShader("shader-fs");
        var vertexShader = WebGlApi.getShader("shader-vs");
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // get pointers to the shader params
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexture");
        gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);

        shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.modelNormalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");


        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");

        shaderProgram.lightPositionUniform = gl.getUniformLocation(shaderProgram, "uLightPosition");
        shaderProgram.lightAmbientUniform = gl.getUniformLocation(shaderProgram, "uLightAmbient");
        shaderProgram.lightDiffuseUniform = gl.getUniformLocation(shaderProgram, "uLightDiffuse");
        shaderProgram.lightSpecularUniform = gl.getUniformLocation(shaderProgram, "uLightSpecular");

        return shaderProgram;
    }
    this.shaderProgram = this.initShader(WebGlApi.gl);

    this.loadTexture = function(url, texture) {
        var image = new Image();
        image.onload = function () {
            WebGlApi.gl.bindTexture(WebGlApi.gl.TEXTURE_2D, texture);
            //WebGlApi.gl.pixelStorei(WebGlApi.gl.UNPACK_FLIP_Y_WEBGL, true);
  
            WebGlApi.gl.texImage2D(WebGlApi.gl.TEXTURE_2D, 0, WebGlApi.gl.RGBA, WebGlApi.gl.RGBA, WebGlApi.gl.UNSIGNED_BYTE, image);
                
            WebGlApi.gl.texParameteri(WebGlApi.gl.TEXTURE_2D, WebGlApi.gl.TEXTURE_MAG_FILTER, WebGlApi.gl.LINEAR);
            WebGlApi.gl.texParameteri(WebGlApi.gl.TEXTURE_2D, WebGlApi.gl.TEXTURE_MIN_FILTER, WebGlApi.gl.LINEAR);
            WebGlApi.gl.generateMipmap(WebGlApi.gl.TEXTURE_2D);
  
            //WebGlApi.gl.texParameteri(WebGlApi.gl.TEXTURE_2D, WebGlApi.gl.TEXTURE_WRAP_S, WebGlApi.gl.MIRRORED_REPEAT);
            //WebGlApi.gl.texParameteri(WebGlApi.gl.TEXTURE_2D, WebGlApi.gl.TEXTURE_WRAP_T, WebGlApi.gl.MIRRORED_REPEAT);
            WebGlApi.gl.bindTexture(WebGlApi.gl.TEXTURE_2D, null); 
        }
        image.src = url;
    }

    this.initData = function (basePath, sphere) {
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
        for (var i = 0; i < this.globject.types.length; i++) {
            this.globject.stride += this.globject.types[i].size;
            if (this.globject.types[i].dataType == WebGlApi.DATA_TYPE.TEXTURE) {
                this.globject.textureUrl = basePath + this.globject.types[i].tag;
            }
        }
        this.globject.texture = WebGlApi.gl.createTexture();
        this.loadTexture(this.globject.textureUrl, this.globject.texture)
    }

    this.start = function () {
        var fpsElement = document.getElementById("fps");
        this.control = new WebGlApi.OrbitControl(canvas, 3);
        this.fps = new WebGlApi.Fps(fpsElement);

        // check if tick function is already called
        if (this.isRun === true) { return; }
        this.isRun = true;
        this.tick();
    }

    this.tick = function () {
        if (scope.isRun !== true) { return; }

        scope.fps.update();
        if (scope.globject !== null) {
            WebGlApi.gl.uniform1f(scope.shaderProgram.materialShininessUniform, 32.0);
            WebGlApi.gl.uniform3f(scope.shaderProgram.lightAmbientUniform, 0.2, 0.2, 0.2);
            WebGlApi.gl.uniform3f(scope.shaderProgram.lightDiffuseUniform, 1.0, 1.0, 1.0);
            WebGlApi.gl.uniform3f(scope.shaderProgram.lightSpecularUniform, 5.0, 5.0, 5.0);

            var lightPos = [0.0, 0.0, 3.0]
            mat4.multiplyVec3(WebGlApi.vMatrix, lightPos);
            WebGlApi.gl.uniform3fv(scope.shaderProgram.lightPositionUniform, lightPos);

            WebGlApi.drawFrame(scope.shaderProgram, scope.globject, false);
        }
        requestAnimFrame(scope.tick);
    }
};

appRoot.controller('Example3Controller', ['$scope', 'basePath', function ($scope, basePath) {
    $scope.sphereUrl = basePath + "Home/GetSphere";

    var example3 = new Example3(document.getElementById("webglcanvas"));
    $scope.$on('$destroy', function () {
        example3.isRun = false;
    });

    var ajaxGetSphere = function () {
        var $form = $("#configure-form");
        var options = {
            url: $scope.sphereUrl,
            type: $form.attr("ajax-method"),
            data: {}
        }
        $.ajax(options).done(function (data) {
            var sphere = JSON.parse(data);
            example3.initData(basePath, sphere);
            example3.start();
        });
        return false;
    };
    ajaxGetSphere();
    $("form[is-ajax='true']").submit(ajaxGetSphere);
}]);
