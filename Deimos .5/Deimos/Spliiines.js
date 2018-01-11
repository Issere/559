/**
 * Created by Master on 4/29/2017.
 * SOME CODE TAKEN FROM 559 DEMOS
 */
//var curveArrayB = undefined;
var curveArrayMaster = [];
function seetup(canvas, gl, projM, viewM)
{
    "use strict";
    //var canvas = document.getElementById('canvas');
    //var gl = canvas.getContext('experimental-webgl');
    var v3 = twgl.v3;
    var m4 = twgl.m4;
    var curveArrayA = [];
    var curveArrayB = [];
    //var curveArrayB = [];
    //var curveArrayB = [];
    curveArrayA.push(new Curve([0,0,0], [0,0,-500], [-100,0,0], [100,0,0], 'H'));
    //curveArray.push(new Curve([0,0,0], [0,50,0], [0,0,100], [0,-50,0], 'H'));
    //curveArray.push(new Curve([1000,0,0], [1000,0,-500], [0,0,-500], [0,0,0], 'B'));
    //curveArrayA.push(new Curve([0,0,0], [-100,0,0], [-100,-500,0], [0,-500,0], 'B'));
    //curveArray.push(new Bezier([-1000,0,0], [-1000,0,500], [0,0,500], [0,0,0]));

    //curveArrayB.push(new Curve([0,0,0], [0,0,-1000], [800,0,0], [-800,-0,0], 'H'));
    //curveArrayB.push(new Curve([0,0,-1000], [0,0,0], [-800,0,0], [800,0,0], 'H'));

    for (var x = 0; x < curveArrayA.length; x++)
    {
        DrawCurve(curveArrayA[x]);
        curveArrayMaster[x] = curveArrayA[x];
    }

    for (var y = 0; y < curveArrayB.length; y++)
    {
        DrawCurve(curveArrayB[y]);
    }

    function DrawCurve(curve) {
        var vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(curve.vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        var vertCode =
            "precision highp float;" +
            "attribute vec3 coordinates;" +
            "uniform mat4 view;" +
            "uniform mat4 proj;" +

            "void main(void) {" +
            "gl_Position = proj * view * vec4(coordinates, 1.0);" +
            "}";

        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertCode);
        gl.compileShader(vertShader);

        var fragCode =
            'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
            '}';

        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(fragShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);
        //TRY CREAIN CONSTRUCTOR FOR LINE
        shaderProgram.projMLoc = gl.getUniformLocation(shaderProgram, "proj");
        shaderProgram.viewMLoc = gl.getUniformLocation(shaderProgram, "view");
        gl.uniformMatrix4fv(shaderProgram.projMLoc, false, projM);
        gl.uniformMatrix4fv(shaderProgram.viewMLoc, false, viewM);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        gl.drawArrays(gl.LINES, 0, 100);
    }
    function Curve(p0, p1, p2, p3, type)
    {
        this.vertices = [];
        var result;
        var pArray = [];
        pArray.push(p0);
        pArray.push(p1);
        pArray.push(p2);
        pArray.push(p3);
        for (var x = 0 ; x < 1; x = x + .01) {
            if (type == 'B') {
                result = curveValueB(x, pArray);
            }
            else if (type == 'H') {
                result = curveValueH(x, pArray);
            }
            this.vertices.push(result[0]);
            this.vertices.push(result[1]);
            this.vertices.push(result[2]);
        }
    }


// This is the function C(t)
    function curveValueB(t, pArray){

        var p0 =pArray[0];
        var p1= pArray[1];
        var p2= pArray[2];
        var p3= pArray[3];

        var b0=(1-t)*(1-t)*(1-t);
        var b1=3*t*(1-t)*(1-t);
        var b2=3*t*t*(1-t);
        var b3=t*t*t;


        var result = [p0[0]*b0+p1[0]*b1+p2[0]*b2+p3[0]*b3,
            p0[1]*b0+p1[1]*b1+p2[1]*b2+p3[1]*b3,
            p0[2]*b0+p1[2]*b1+p2[2]*b2+p3[2]*b3];
        return result;
    }

    /*
     function curveValueH(t, pArray)
     {
     var p0 =pArray[0];
     var p1= pArray[1];
     var p2= pArray[2];
     var p3= pArray[3];

     var b0=2*t*t*t-3*t*t+1;
     var b1=t*t*t-2*t*t*t;
     var b2=-2*t*t*t+3*t*t;
     var b3=t*t*t-t*t;

     var result = [p0[0]*b0+p1[0]*b1+p2[0]*b2+p3[0]*b3,
     p0[1]*b0+p1[1]*b1+p2[1]*b2+p3[1]*b3,
     p0[2]*b0+p1[2]*b1+p2[2]*b2+p3[2]*b3];
     return result;

     }
     */
    function Cubic(basis,P,t){
        var b = basis(t);
        var result=v3.mulScalar(P[0],b[0]);
        v3.add(v3.mulScalar(P[1],b[1]),result,result);
        v3.add(v3.mulScalar(P[2],b[2]),result,result);
        v3.add(v3.mulScalar(P[3],b[3]),result,result);
        return result;
    }

    function curveValueH(t, pArray)
    {
        var p0= pArray[0];
        var p1= pArray[1];
        var p2= pArray[2];
        var p3= pArray[3];

        var h1=2*t*t*t-3*t*t+1;
        var h2=-2*t*t*t + 3*t*t;
        var h3=t*t*t-2*t*t+t;
        var h4=t*t*t-t*t;

        //var result = h1*p0 + h2*p1 + h3*p2 + h4*p3;
        var result = v3.mulScalar(p0, h1);
        v3.add(v3.mulScalar(p1, h2), result, result);
        v3.add(v3.mulScalar(p2, h3), result, result);
        v3.add(v3.mulScalar(p3, h4), result, result);
        return result;

    }
}