/**
 * Created by Master on 6/7/2017.
 */
//useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!");
            console.log(gl.getShaderInfoLog(shader));
            console.log(src);
            return null;
        }

        return shader;
    };

var GLH_createGLProgram = function (gl, vSrc, fSrc) {
    var program = gl.createProgram();
    var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
    var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.log("warning: program failed to link");
        return null;

    }
    return program;
}

//creates a gl buffer and unbinds it when done.
var GLH_createGLBuffer = function (gl, data, usage) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer;
}

var GLH_createGLElementBuffer = function (gl, data, usage) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), usage);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return buffer;
}

var GLH_findAttribLocations = function (gl, program, attributes) {
    var out = {};
    for(var i = 0; i < attributes.length;i++){
        var attrib = attributes[i];
        out[attrib] = gl.getAttribLocation(program, attrib);
        //gl.enableVertexAttribArray(out[attrib]);
    }
    return out;
}

var GLH_findAttribLocationsALT = function (gl, program, attributes) {

    for(var i = 0; i < attributes.length;i++){
        var attrib = attributes[i];
        program[attrib] = gl.getAttribLocation(program, attrib);
        gl.enableVertexAttribArray(program[attrib]);
    }
    return program;
}

var GLH_findUniformLocations = function (gl, program, uniforms) {
    var out = {};
    for(var i = 0; i < uniforms.length;i++){
        var uniform = uniforms[i];
        out[uniform] = gl.getUniformLocation(program, uniform);
    }
    return out;
}

var GLH_enableLocations = function (gl, attributes) {
    for(var key in attributes){
        var location = attributes[key];
        gl.enableVertexAttribArray(location);
    }
}

//always a good idea to clean up your attrib location bindings when done. You wont regret it later.
var GLH_disableLocations = function (gl, attributes) {
    for(var key in attributes){
        var location = attributes[key];
        gl.disableVertexAttribArray(location);
    }
}

//creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
//it's mostly going to be a try it once, flip if you need to.
var GLH_createGLTexture = function (gl, image, flipY) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if(flipY){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
};