/**
 * Created by Master on 4/26/2017.
 */
//Sun object
    //http://i.imgur.com/HI3Gy4P.jpg

var grobjects = grobjects || [];  //set up objects array

var Sun = undefined; //leak constructors

(function()
{
    "use strict";

    var vertexSource = `precision highp float;

            attribute vec3 vpos;
            attribute vec3 vnormal;
            attribute vec2 inTexCoords;
            varying vec3 outColor;
            varying vec2 outTexCoords;
            
            uniform mat4 view;
            uniform mat4 proj;
            uniform mat4 model;
            uniform vec3 sunColor;
            uniform vec3 sunDirection;



            void main(void) {
            gl_Position = proj * view * model * vec4(vpos, 1.0);
            vec4 normal = normalize(model * vec4(vnormal,0.0));
            float diffuse = .5 + .5*abs(dot(normal, vec4(sunDirection,0.0)));
            outColor = sunColor * diffuse;
            outTexCoords = inTexCoords;
          }`;
/*
    vertexSource = `precision highp float;

            attribute vec3 vpos;

            uniform mat4 view;
            uniform mat4 proj;
            uniform mat4 model;


            void main(void) {
            gl_Position = proj * view * model * vec4(vpos, 1.0);
          }`;

*/
    var fragmentSource =
                `precision highp float;
                
                varying vec3 outColor;
                varying vec2 outTexCoords;
                
                uniform sampler2D texSampler;
                
                void main(void) {
                gl_FragColor = texture2D(texSampler, outTexCoords);
                //gl_FragColor = texture2D(sunText, texCoords);
                //gl_FragColor = fColor * vec4(outColor, 255);
                //gl_FragColor = vec4(255,0,255,255);
                }
                `;

    var buffers = undefined;


    //Sun constructor
    Sun = function Sun(name, position, size, color)
    {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7, .3, .3];
        this.program = null; //shader program
        this.attributes = null; //attributes for shader
        this.uniforms = null; //uniforms for shader
        this.buffers = [null, null]; //buffers for shader
        //this.texture = null;
    }
    Sun.prototype.init = function(drawingState)
    {
        var gl = drawingState.gl;
        //create the shaders
        if (!buffers)
        {
            //buffer shit yo
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                    .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0
                ]},

                inTexCoords : {numComponents:2, data: [
                    0,0,  1,0,  0,1,        0,0,  0,1,  1,1,
                    0,0,  0,1,  1,1,        0,0,  0,1,  1,1,
                    0,0,  0,1,  1,1,        0,0,  0,1,  1,1,
                    0,0,  0,1,  1,1,        0,0,  0,1,  1,1,
                    0,0,  0,1,  1,1,        0,0,  0,1,  1,1,
                    0,0,  0,1,  1,1,        0,0,  0,1,  1,1
                ]},

                //indices : {numComponents:3, data : []}
            };

            this.program = GLH_createGLProgram(gl, vertexSource, fragmentSource);
            gl.useProgram(this.program);
            //this.program = GLH_findAttribLocationsALT(gl, this.program, ["vpos", "vnormal", "inTexCoords"]);
            //this.program.uniforms = GLH_findUniformLocations(gl, this.program, ["view", "proj", "model"]);
            this.program.vPos = gl.getAttribLocation(this.program, "vpos");
            gl.enableVertexAttribArray(this.program.vPos);
            this.program.vNormal = gl.getAttribLocation(this.program, "vnormal");
            gl.enableVertexAttribArray(this.program.vNormal);
            this.program.InTexCoords = gl.getAttribLocation(this.program, "inTexCoords");
            gl.enableVertexAttribArray(this.program.InTexCoords);

            this.program.View = gl.getUniformLocation(this.program, "view");
            this.program.Proj = gl.getUniformLocation(this.program, "proj");
            this.program.Model = gl.getUniformLocation(this.program, "model");
            this.program.SunColor = gl.getUniformLocation(this.program, "sunColor");
            this.program.SunDirection = gl.getUniformLocation(this.program, "sunDirection");

            this.program.texSampler = gl.getUniformLocation(this.program, "texSampler");
            gl.uniform1i(this.program.texSampler, 0);

            //Create Buffers
            this.buffers[0] = GLH_createGLBuffer(gl, arrays.vpos.data, gl.STATIC_DRAW); //sun vertexes
            this.buffers[1] = GLH_createGLBuffer(gl, arrays.vnormal.data, gl.STATIC_DRAW); //sun normals
            this.buffers[2] = GLH_createGLBuffer(gl, arrays.inTexCoords.data, gl.STATIC_DRAW); //sun texture coords

            this.texture1 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            this.texture1.image = new Image();
            this.texture1.image.crossOrigin = 'anonymous';
            this.texture1.image.onload = function(){
                handleLoadedTexture(gl, this.texture1);
            }
            this.texture1.image.src = "http://i.imgur.com/HI3Gy4P.jpg";




            window.setTimeout(handleLoadedTexture(gl, this.texture1), 200);


        }
    };
    function handleLoadedTexture(gl, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    var createGLTexture = function (gl, image, flipY, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D); //disabled because error
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    Sun.prototype.draw = function(drawingState)
    {
        //create model matrix
        var modelM = twgl.m4.scaling([this.size, this.size, this.size]);
        var sunHolder = twgl.v3.multiply(drawingState.sunDirection, this.position);
        twgl.m4.setTranslation(modelM, sunHolder, modelM);

        //Drawing test

        var gl = drawingState.gl;
        gl.clearColor(0,0,0,1);
        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        //Set up Uniforms
        gl.uniformMatrix4fv(this.program.View, false, drawingState.view);
        gl.uniformMatrix4fv(this.program.Proj, false, drawingState.proj);
        gl.uniformMatrix4fv(this.program.Model, false, modelM);
        gl.uniform3fv(this.program.SunColor, this.color);
        gl.uniform3fv(this.program.SunDirection, drawingState.sunDirection);



        //MAYBE MAKE THESE HELPER METHODS?

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.vertexAttribPointer(this.program.vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
    gl.vertexAttribPointer(this.program.vPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
    gl.vertexAttribPointer(this.program.InTexCoords, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.disableVertexAttribArray(this.program.vPos);
    gl.disableVertexAttribArray(this.program.vNormal);
    gl.disableVertexAttribArray(this.program.InTexCoords);

    };

    Sun.prototype.center = function(drawingState)
    {
        return this.position;
    }





})();

//grobjects.push(new Sun("Sun", [50,0,20], 50, [.8,.3,.3]));