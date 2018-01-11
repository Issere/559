/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
 (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
 by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cube = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
        this.image;
    }
    Cube.prototype.init = function(drawingState) {

        var cubeTexture;
        var gl = drawingState.gl;
            cubeTexture = drawingState.gl.createTexture();
            cubeTexture.image = new Image();
            cubeTexture.image.crossOrigin='anonymous';
            cubeTexture.image.src = "http://i.imgur.com/ymZw2d9.jpg";
            this.image = cubeTexture;
            cubeTexture.image.onload = function()
            {
                handleLoadedTexture()
            };


        function handleLoadedTexture() {
            var gl = drawingState.gl;
            for (var x = 0; x <1000; x++)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
            var targets = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];
            for (var j = 0; j < 6; j++)
            {
                gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                    cubeTexture.image);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE);
            }
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
        // create the shaders once - for all cubes
            var newSkybox = makeSkybox(5000);
            console.log(newSkybox);
        //read shader sources
        var vertCode = document.getElementById("skybox-vs").text;
        var fragCode = document.getElementById("skybox-fs").text;

        //Vertex Shader
        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertCode);
        gl.compileShader(vertShader);
        var success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
        if (!success) {
            // Something went wrong during compilation; get the error
            throw "could not compile shader:" + gl.getShaderInfoLog(vertShader);
        }

        //Fragment Shader
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(fragShader);
        success = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
        if (!success) {
            // Something went wrong during compilation; get the error
            throw "could not compile shader:" + gl.getShaderInfoLog(vertShader);
        }

        //create shader program object
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        {
            alert("Could not link shaders!");
        }
        gl.useProgram(shaderProgram);

        //delete unused shaders
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

            //Shader Attributes
        shaderProgram.vPos = gl.getAttribLocation(shaderProgram, "vPos");
        gl.enableVertexAttribArray(shaderProgram.vPos1);

        shaderProgram.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
        gl.enableVertexAttribArray(shaderProgram.vNormal);

        shaderProgram.texCoords = gl.getAttribLocation(shaderProgram, "texCoords");
        gl.enableVertexAttribArray(shaderProgram.texCoords);

        //Uniforms
        shaderProgram.view = gl.getUniformLocation(shaderProgram, "view");
        shaderProgram.proj = gl.getUniformLocation(shaderProgram, "proj");
        shaderProgram.model = gl.getUniformLocation(shaderProgram, "model");
        shaderProgram.lightdir = gl.getUniformLocation(shaderProgram, "lightdir");
        shaderProgram.cubecolor = gl.getUniformLocation(shaderProgram, "cubecolor");

        //vertices buffer
        var vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, newSkybox.vertexPositions, gl.STATIC_DRAW);

        //normal buffer
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, newSkybox.vertexNormals, gl.STATIC_DRAW);

        //Indices buffer
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, newSkybox.indices, gl.STATIC_DRAW);

        //TextureCoord Buffer
        var texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, newSkybox.vertexTextureCoords, gl.STATIC_DRAW);

        //setup attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(shaderProgram.vNormal, 3, gl.FLOAT, false, 0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.vertexAttribPointer(shaderProgram.vPos, 3,
            gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.vertexAttribPointer(shaderProgram.texCoords, 3,
            gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        //draw
        gl.drawElements(gl.TRIANGLES, newSkybox.indices.size, gl.UNSIGNED_SHORT, 0);
        console.log(newSkybox.indices.size);
        console.log("runnin");
    };

    Cube.prototype.draw = function(drawingState)
    {
        var gl = drawingState.gl;

    }




/*
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM, skybox:this.image});

    Cube.prototype.center = function(drawingState) {
        return this.position;
    }
*/
    function makeSkybox(side) {
        var s = (side || 1)/2;
        var coords = [];
        var normals = [];
        var texCoords = [];
        var indices = [];
        function face(xyz, nrm) {
            var start = coords.length/3;
            var i;
            for (i = 0; i < 12; i++) {
                coords.push(xyz[i]);
            }
            for (i = 0; i < 4; i++) {
                normals.push(nrm[0],nrm[1],nrm[2]);
            }
            texCoords.push(0,0,1,0,1,1,0,1);
            indices.push(start,start+1,start+2,start,start+2,start+3);
        }
        face( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
        face( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
        face( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
        face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
        face( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
        face( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );
        return {
            vertexPositions: new Float32Array(coords),
            vertexNormals: new Float32Array(normals),
            vertexTextureCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices)
        }
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Cube("skybox", [0,0,0], 5000, [.9,.5,.5]));




