/**
 * Created by Master on 4/26/2017.
 */
//Sun object

var grobjects = grobjects || [];  //set up objects array

var Projectile = undefined; //leak constructors

(function()
{
    "use strict";
    var shaderProgram = undefined;
    var buffers = undefined;

    //Sun constructor
    Projectile = function Projectile(name, position, face, size, color, parent)
    {
        this.name = name;
        this.position = [0,0,0];
        this.offset = position;
        this.face = face;
        this.size = size || 1.0;
        this.color = color || [.7, .3, .3];
        this.parent = parent || null;

        this.xDir = 0;
        this.zDir = 0;
        this.fireFlag = false;

        if (parent != null) //if not dummy projectile
        {
            this.parentModelM = parent.modelM || twgl.m4.identity(4);
            this.parentOrientation = parent.orientation || null;
            this.parentPosition = [0,0,0];
            this.parentBarrel = twgl.m4.identity();
        }
        //console.log(this.parent.position);

    }
    Projectile.prototype.init = function(drawingState)
    {
        var gl = drawingState.gl;
        //create the shaders
        if (!shaderProgram)
        {
            shaderProgram = twgl.createProgramInfo(gl, ["proj-vs", "proj-fs"]);
        }
        if (!buffers)
        {
            //buffer shit yo
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-1.5,-.5,  .5,-1.5,-.5,  .5, .5,-.5,        -.5,-1.5,-.5,  .5, .5,-.5,  -.5, .5,-.5,    // z = 0
                    -.5,-1.5, .5,  .5,-1.5, .5,  .5, .5, .5,        -.5,-1.5, .5,  .5, .5, .5,  -.5, .5, .5,    // z = 1
                    -.5,-1.5,-.5,  .5,-1.5,-.5,  .5,-1.5, .5,        -.5,-1.5,-.5,  .5,-1.5, .5,  -.5,-1.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .0, 1.5, .0,        -.5, .5,-.5,  -.5, .5, .5,   0, 1.5, 0, //tip
                    .5, .5,.5,  .5, .5,-.5,  .0, 1.5, .0,        .5, .5,.5,  -.5, .5, .5,   0, 1.5, 0, //tip
                    -.5,-1.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-1.5,-.5, -.5, .5, .5,  -.5,-1.5, .5,    // x = 0
                    .5,-1.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-1.5,-.5,  .5, .5, .5,  .5,-1.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,-2, 0,1,-2, 0,1,-2,        -2,1,0, -2,1,0, -2,1,0, //tip
                    2,1,0, 2,1,0, 2,1,0,        0,1,2, 0,1,2, 0,1,2, //tip
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl, arrays);
        }
    };

    Projectile.prototype.draw = function(drawingState)
    {
        if (this.fireFlag == true) {


            if (Math.abs(this.xDir) < 400 && this.face == "right")
            {
                this.xDir -= 10;
            }
            else if (Math.abs(this.xDir) < 400 && this.face == "left")
            {
                this.xDir += 10;
            }
            else if (Math.abs(this.xDir) < 400 && this.face == "uBarrel")
            {
                 this.xDir += 10;
            }
            else {
                this.xDir = 0;
                this.fireFlag = false;
            }
        }
        else
        {
            //ABSOLUTELY NOTHIN'
        }

        //create model matrix
        //var modelM = twgl.m4.translation(this.position);
            var modelM = twgl.m4.translation([0, 0, 0]);
        if (this.parent == null)
        {
            //do nothing
        }
        else if (this.face == "uBarrel")
        {
            modelM = twgl.m4.multiply(this.parentBarrel, modelM);
            modelM = twgl.m4.multiply(twgl.m4.translation(this.offset), modelM);

            modelM = twgl.m4.multiply(twgl.m4.translation([0, this.xDir, 0]), modelM);

            modelM = twgl.m4.multiply(twgl.m4.scaling([this.size * 1, this.size * 2, this.size * 1]), modelM);

        }
        else
            {
                modelM = twgl.m4.multiply(twgl.m4.translation(this.parentPosition), modelM);

                modelM = twgl.m4.multiply(twgl.m4.rotationY(Math.PI), modelM);
                modelM = twgl.m4.multiply(twgl.m4.rotationY(this.parentOrientation), modelM);
                modelM = twgl.m4.multiply(twgl.m4.translation(this.offset), modelM);
                modelM = twgl.m4.multiply(twgl.m4.rotationZ(Math.PI/2), modelM);




                if (this.face == "right")
                {
                    modelM = twgl.m4.multiply(twgl.m4.translation([0, this.xDir, 0]), modelM);
                    modelM = twgl.m4.multiply(twgl.m4.rotationX(Math.PI), modelM);
                }
                else
                    {
                    modelM = twgl.m4.multiply(twgl.m4.translation([0, this.xDir, 0]), modelM);
                }
                modelM = twgl.m4.multiply(twgl.m4.scaling([this.size * 1, this.size * 1, this.size * 1]), modelM);
            }

        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            projColor:this.color, model: modelM});
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };

    Projectile.prototype.center = function(drawingState)
    {
        return this.position;
    }
})();

grobjects.push(new Projectile("dummy", [0,10000,0], "left", 1, [.8,.8,.8], [1,1,1])); //dummy object to setup shaders and vertexes
//grobjects.push(new Projectile("deimosOneP2", [200,0,0], 5, [.8,.8,.8], [1,1,1]));
//each gun barrel has its own projectile flag to denote firing