
    function setup() {
        var cv = document.getElementById("myCanvas"); //prepare canvas
        var gl = cv.getContext('experimental-webgl');//get WebGL context
        var m4 = twgl.m4;
        var shipArray = [];
        shipArray[0] = createDeimos("deimosOne", "Deimos0.obj", "red", [0,0,0]);
        var theta1 = 0; //spin angle
        var theta2 = 0;// test
        var angleCamera = 0;
        var zoomFactor = 100;
        var turretRotation = 0;
        var turretElevation = 0;

        var slider1 = document.getElementById('slider1');
        slider1.value = 0;
        var slider2 = document.getElementById('slider2');
        slider2.value = 100;
        var turretRot = document.getElementById('turretRot');
        turretRot.value = 0;
        var turretElev = document.getElementById('turretElev');
        turretElev.value = 0;

        //read shader source
        var vertCode = document.getElementById("vs").text;
        var fragCode = document.getElementById("fs").text;


        //Vertex shader source code
        var vertShader = gl.createShader(gl.VERTEX_SHADER);//create vertex shader object
        gl.shaderSource(vertShader, vertCode);//attach vertex shader source code
        gl.compileShader(vertShader);//compile vertex shader
        var success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
        if (!success) {
            // Something went wrong during compilation; get the error
            throw "could not compile shader:" + gl.getShaderInfoLog(vertShader);
        }

        //fragment shader
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);//create fragment shader object
        gl.shaderSource(fragShader, fragCode);//attach fragment code
        gl.compileShader(fragShader);//compile fragment shader
        success = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
        if (!success) {
            // Something went wrong during compilation; get the error
            throw "could not compile shader:" + gl.getShaderInfoLog(vertShader);
        }

        //create shader program object
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);//attach shaders
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram); //link shaders
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialize shaders"); }
        gl.useProgram(shaderProgram);//use combined object

        //delete unused shaders
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

        //Shader attributes
        shaderProgram.positionAttrib = gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(shaderProgram.positionAttrib);

        shaderProgram.normalAttrib = gl.getAttribLocation(shaderProgram, "normal");
        gl.enableVertexAttribArray(shaderProgram.normalAttrib);

        //Uniforms

        shaderProgram.mMatrix = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

        shaderProgram.pMatrix = gl.getUniformLocation(shaderProgram, "projectionMatrix");

        shaderProgram.nMatrix = gl.getUniformLocation(shaderProgram, "normalMatrix");

        //DATA...
        var vertexPos = vertexList(LoadedOBJFiles["Deimos0.obj"].vertices, LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces);
        var triangleIndices = faceList(LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces);
        var normals = normalList(LoadedOBJFiles["Deimos0.obj"].normals, LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces);

        //vertices buffer
        var vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

        //normal buffer
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        //Indices buffer
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndices), gl.STATIC_DRAW);

        function draw()
        {
            slider1.addEventListener('input', camAngle());
            slider2.addEventListener('input', camZoom());
            turretRot.addEventListener('input', turretRotate);
            turretElev.addEventListener('input', turretElevate);

            function camAngle()
            {
                angleCamera = slider1.value*0.01*Math.PI;
            }

            function camZoom()
            {
                zoomFactor = slider2.value*.01;
            }

            function turretRotate()
            {
                turretRotation = turretRot.value * .01 * Math.PI;
            }

            function turretElevate()
            {
                turretElevation = turretElev.value * .005 * Math.PI
            }


            var eye = [(500 * Math.cos(angleCamera)), 200, 500 * Math.sin(angleCamera)];
            var target = [0,0,0];
            var up = [0,1,0];

            theta1 = theta1;
            var tRotate = m4.rotationY(theta1);
            var tTranslate = m4.translation([0.0,0.0,0.0]);
            var tScale = m4.scaling([zoomFactor,zoomFactor,zoomFactor]);
            var tModel = m4.multiply(tScale, tRotate);
            var tModel1 = m4.multiply(tModel, tTranslate);
            var tCamera = m4.inverse(m4.lookAt(eye, target, up));
            var tModelView = m4.multiply(tModel1, tCamera);
            var tProjection = m4.perspective(Math.PI/4,2,10,1000);
            var tNormalMatrix1 = m4.inverse(tModelView);
            var tNormalMatrix2 = m4.transpose(tNormalMatrix1);
            var tNormalMatrix = threeify(tNormalMatrix2);

            var tTurretRotate01 = getTurretMatrix(49.8, turretRotation, tModelView, m4);
            var tTurretRotate02 = getTurretMatrix(104, turretRotation, tModelView, m4);
            var tTurretRotate03 = getTurretMatrix(-69, turretRotation, tModelView, m4);
            var tTurretRotate04 = getTurretMatrix(53.8, turretRotation, tModelView, m4);

            var tTurretElevate01 = getBarrelMatrix(-47.3, 53.3, turretRotation, turretElevation, tModelView, m4);
            var tTurretElevate02 = getBarrelMatrix(-43.4, 107.5, turretRotation, turretElevation, tModelView, m4);
            var tTurretElevate03 = getBarrelMatrix(-51.7, -65.5, turretRotation, turretElevation, tModelView, m4);
            var tTurretElevate04 = getBarrelMatrix(19.7, 50.3, turretRotation, -turretElevation, tModelView, m4);

            //EXPERIMENTAL

            //EXPERIMENTAL

            gl.viewport(0, 0, cv.width, cv.height);//set viewport????????
            gl.clearColor(.5, .5, .5, 1.0);//clear canvas
            gl.enable(gl.DEPTH_TEST);//enable depth test
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//clear CBB

            //setup attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.vertexAttribPointer(shaderProgram.normalAttrib, 3, gl.FLOAT, false, 0,0);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
            gl.vertexAttribPointer(shaderProgram.positionAttrib, 3,
                gl.FLOAT, false, 0, 0);

            //setup uniforms
            gl.uniformMatrix3fv(shaderProgram.nMatrix, false, tNormalMatrix);
            gl.uniformMatrix4fv(shaderProgram.mMatrix, false, tModelView);
            gl.uniformMatrix4fv(shaderProgram.pMatrix, false, tProjection);

            drawGroup(gl, shaderProgram, "detail0",  tNormalMatrix, tModelView, tProjection);
            for (var x = 4; x < 23; x++)
            {
                drawGroup(gl, shaderProgram, shipArray[0].children[x].name,  tNormalMatrix, tModelView, tProjection);
            }
            drawGroup(gl, shaderProgram, shipArray[0].children[0].name,  tNormalMatrix, tTurretRotate01, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[1].name,  tNormalMatrix, tTurretRotate02, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[2].name,  tNormalMatrix, tTurretRotate03, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[3].name,  tNormalMatrix, tTurretRotate04, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[0].kid.name,  tNormalMatrix, tTurretElevate01, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[1].kid.name,  tNormalMatrix, tTurretElevate02, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[2].kid.name,  tNormalMatrix, tTurretElevate03, tProjection);
            drawGroup(gl, shaderProgram, shipArray[0].children[3].kid.name,  tNormalMatrix, tTurretElevate04, tProjection);
            requestAnimationFrame(draw);
        }
    draw();
    }

    function getShipArray()
    {
        return shipArray[0];
    }
