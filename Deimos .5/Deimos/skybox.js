/**
 * Created by Yusef.
 */

/**
 A Very Simple Textured Plane using native WebGL. 

 Notice that it is possible to only use twgl for math. 

 Also, due to security restrictions the image was encoded as a Base64 string. 
 It is very simple to use somthing like this (http://dataurl.net/#dataurlmaker) to create one
 then its as simple as 
     var image = new Image()
     image.src = <base64string>


 **/

var grobjects = grobjects || [];


(function() {
    "use strict";

    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 aPosition;" +
        "varying vec3 vTexCoord;" +
        "uniform mat4 pMatrix;" +
        "uniform mat4 vMatrix;" +
        "uniform mat4 mMatrix;" +
        "void main(void) {" +
        "  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);" +
        "  vTexCoord = aPosition;" +
        "}";

    var fragmentSource = "" +
        "precision highp float;" +
        "varying vec3 vTexCoord;" +
        "uniform samplerCube uTexture;" +
        "void main(void) {" +
        "gl_FragColor = textureCube(uTexture, vTexCoord);" +
        "}";



    var s = 5000;
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
        texCoords.push(0,0,0,1,1,0,1,1);
        indices.push(start,start+1,start+2,start,start+2,start+3);
    }
    face( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
    face( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
    face( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
    face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
    face( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
    face( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );
        var vertexPositions = coords;
        var vertexNormals = normals;
        var vertexTextureCoords = texCoords;
        var indicesNum = indices;
        var vertices = vertexPositions;
        var uvs = vertexTextureCoords;

    //see above comment on how this works. 
    var image = new Image();
    image.crossOrigin='anonymous';
    image.src = "http://i.imgur.com/3Qk0orG.png";

     var Skybox = function () {
        this.name = "Skybox";
        this.position = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1]);
        this.program = null;
        this.attributes = null;
        this.uniforms = null;
        this.buffers = [null, null, null]
        this.texture = null;
    }

    Skybox.prototype.init = function (drawingState) {
        var gl = drawingState.gl;

        this.program = GLH_createGLProgram(gl, vertexSource, fragmentSource);
        gl.useProgram(this.program);
        this.attributes = GLH_findAttribLocations(gl, this.program, ["aPosition"]);
        this.uniforms = GLH_findUniformLocations(gl, this.program, ["pMatrix", "vMatrix", "mMatrix", "uTexture"]);

        //this.texture = createGLTexture(gl, image, true);

        this.buffers[0] = GLH_createGLBuffer(gl, vertices, gl.STATIC_DRAW);
        this.buffers[1] = GLH_createGLBuffer(gl, uvs, gl.STATIC_DRAW);
        this.buffers[2] = GLH_createGLElementBuffer(gl, indicesNum, gl.STATIC_DRAW);
        this.texture = createCubeMap(gl);
    }

    Skybox.prototype.center = function () {
        return this.position;
    }

    Skybox.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        var modelM = twgl.m4.scaling([this.scale[0],this.scale[1], 1]);
        twgl.m4.setTranslation(modelM,this.position, modelM);

        gl.uniformMatrix4fv(this.uniforms.pMatrix, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.vMatrix, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.mMatrix, gl.FALSE, modelM);

        if(this.texture) {
            //GLH_enableLocations(gl, this.attributes);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[2]);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
            //GLH_disableLocations(gl, this.attributes);
        }
    }

    function createCubeMap(gl)
    {
        var texID = gl.createTexture();
        var ct = 0;
        var img = new Array(6);
        var urls2 = [
            "http://i.imgur.com/3Qk0orG.png", "http://i.imgur.com/3Qk0orG.png",
            "http://i.imgur.com/3Qk0orG.png", "http://i.imgur.com/3Qk0orG.png",
            "http://i.imgur.com/3Qk0orG.png", "http://i.imgur.com/3Qk0orG.png"
        ];
        var urls = [
            "http://i.imgur.com/E4Z4PAQ.png", "http://i.imgur.com/E4Z4PAQ.png",
            "http://i.imgur.com/E4Z4PAQ.png", "http://i.imgur.com/E4Z4PAQ.png",
            "http://i.imgur.com/E4Z4PAQ.png", "http://i.imgur.com/E4Z4PAQ.png"
        ];
        for (var i = 0; i < 6; i++) {

            img[i] = new Image();
            img[i].onload = function() {
                ct++;
                if (ct == 6) {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
                    var targets = [
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                    ];
                    for (var j = 0; j < 6; j++) {
                        gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    }
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                }
            }
            img[i].crossOrigin = 'anonymous';
            img[i].src = urls[i];
        }
        return texID;
    }


    var test = new Skybox();
        test.position[2] = 0;
        test.position[1] = 0;
        test.scale = [1, 1];


    grobjects.push(test);

})();