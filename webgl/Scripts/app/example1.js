Example1 = function (canvas) {
    this.globject = null;
    this.canvas = canvas;

    var scope = this;
    this.control = null;
    //this.clock = null;
    this.fps = null;

    this.isRun = false;

    WebGlApi.initWebGl(canvas);
    mat4.perspective(45, WebGlApi.viewportWidth / WebGlApi.viewportHeight, 0.1, 100.0, WebGlApi.pMatrix);

    this.initShader = function(gl) {
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

        shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

        shaderProgram.materialColorUniform = gl.getUniformLocation(shaderProgram, "uMaterialColor");
        return shaderProgram;
    }
    this.shaderProgram = this.initShader(WebGlApi.gl);

    this.initData = function (sphere) {
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

    this.start = function () {
        var fpsElement = document.getElementById("fps");
        this.control = new WebGlApi.OrbitControl(canvas, 3);
        //this.clock = new WebGlApi.Clock();
        this.fps = new WebGlApi.Fps(fpsElement);

        // check if tick function is already called
        if (this.isRun === true) { return; }
        this.isRun = true;
        this.tick();
    }

    this.tick = function () {
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
};


appRoot.controller('Example1Controller', ['$scope', 'basePath', function ($scope, basePath) {
    $scope.sphereUrl = basePath + "Home/GetSphere";

    var example1 = new Example1(document.getElementById("webglcanvas"));
    $scope.$on('$destroy', function () {
        example1.isRun = false;
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
            example1.initData(sphere);
            example1.start();
        });
        return false;
    };
    ajaxGetSphere();
    $("form[is-ajax='true']").submit(ajaxGetSphere);
}]);
