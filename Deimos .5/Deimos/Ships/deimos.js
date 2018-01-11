/**
 * Created by Will on 2/17/2017.
 */

function createDeimos(name, source, color, position)
{
    var newShip = {name:name, source:source, color:color, position:position, vertex:LoadedOBJFiles[source].vertices, face:LoadedOBJFiles[source].groups['detail0'].faces};
    var groupNames = ["turret01", "turret02", "turret03", "turret04", "engine01", "engine02", "engine03",  "turret05", "turret06",
        "turret11", "turret12", "turret13", "turret14", "turret15", "turret16", "turret17", "turret18", "turret19", "turret20",
        "turret23", "turret24", "turret25", "turret26", "turretarm01", "turretarm02", "turretarm03", "turretarm04"];
    newShip.children = [];
    for (var x = 0; x < 23; x++)
    {
        if (x < 4)
        newShip.children[x] = createGroup(source, groupNames[x], groupNames[x + 23]);
        else
            newShip.children[x] = createGroup(source, groupNames[x], null);
    }

    return newShip;
}

function createGroup(source, name, child) {
    var newGroup = {
        name: name,
        vertex: LoadedOBJFiles[source].vertices,
        face: LoadedOBJFiles[source].groups[name].faces
    };
    if (child != null) {
        newGroup.kid = createGroup(source, child, null);
    }
    else {
        newGroup.kid = null;
    }
    this.xForm = 0;
    return newGroup;
}

function createChild(source, child)
{
    var newGroup = {name:child, vertex:LoadedOBJFiles[source].vertices, face:LoadedOBJFiles[source].groups[child].faces };
    return newGroup;
}

function addWaypoint(ship, position)
{
    ship.waypoints[ship.waypoints.length] = new Waypoint(ship, position);
    grobjects.push(ship.waypoints[ship.waypoints.length - 1]);
}

/**
 * Created by gleicher on 10/17/15.
 */
var grobjects = grobjects || [];

// make the two constructors global variables so they can be used later
var Deimos = undefined;
var Waypoint = undefined;

/* this file defines a helicopter object and a waypoint object

 the helicopter is pretty ugly, and the rotor doesn't spin - but
 it is intentionally simply. it's ugly so that students can make
 it nicer!

 it does give an example of index face sets

 read a simpler object first.


 the waypoint is a simple object for the helicopter to land on.
 there needs to be at least two helipads for the helicopter to work..


 the behavior of the helicopter is at the end of the file. it is
 an example of a more complex/richer behavior.
 */
function getShipArray()
{
    return shipArray;
}

(function () {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var deimosBodyBuffers = undefined;
    var deimosNumber = 0;
    var shipArray = []; //holds ships in scene
    var bufferArray = []; //holds buffers of all objects in ship
    shipArray[0] = createDeimos("deimosOne", "Deimos0.obj", "grey", [0,0,0]);

    var padBuffers = undefined;
    var padNumber = 0;



    // constructor for Ships
    Deimos = function Deimos(name, color, target, position, spline) {
        this.name = name;
        this.position = position;
        this.color = color;
        // about the Y axis - it's the facing direction
        this.orientation = Math.PI;
        this.modelM = twgl.m4.identity();
        this.faceVector = [0,0,-0];
        this.waypoints = [];
        this.waypoints[0] = new Waypoint(this, position);
        grobjects.push(this.waypoints[0]);
        this.WP = 0;
        this.nextWaypoint = this.waypoints[0];
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';
        //this.image.src = "http://i.imgur.com/uUnVz5y.jpg";
        this.image.src = "http://i.imgur.com/a5COzFI.jpg";
        this.texture = null;
        this.target = target;

        this.TCov2 = new Image();
        this.image.crossOrigin = 'anonymous';
        this.TCov2.src = "http://i.imgur.com/a5COzFI.jpg";
        this.barrelTex = null;

        this.bumpMap = new Image();
        this.bumpMap.crossOrigin = 'anonymous';
        this.bumpMap.src = "http://i.imgur.com/dEdrhLL.png";
        this.bumpTexture = null;

        this.spline = spline;

        this.projectileArray = []; //Array of projectiles "attached" to barrels, updated after getBarrelMatrix calls

        this.test  = "success";
    }
    Deimos.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var q = .25;  // abbreviation

        //create textures
        this.texture = createGLTexture(gl, this.image, false);
        this.bumpTexture = createGLTexture(gl, this.bumpMap, false);
        this.barrelTex = createGLTexture(gl, this.TCov2, false);
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!deimosBodyBuffers) {
            var arrays = {
                vpos : { numComponents: 3, data: vertexList(LoadedOBJFiles["Deimos0.obj"].vertices, LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces)},
                vtexture : { numComponents: 2, data: textureList(LoadedOBJFiles["Deimos0.obj"].texCoords, LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces)},
                vnormal : {numComponents:3, data: normalList(LoadedOBJFiles["Deimos0.obj"].normals, LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces)},
                indices : faceList(LoadedOBJFiles["Deimos0.obj"].groups['detail0' ].faces)

            };
            deimosBodyBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            for (var x = 0; x < shipArray[0].children.length; x++) {
                var oarrays = {
                    vpos: {
                        numcomponents: 3,
                        data: vertexList(LoadedOBJFiles["Deimos0.obj"].vertices, LoadedOBJFiles["Deimos0.obj"].groups[shipArray[0].children[x].name].faces)
                    },
                    vnormal: {
                        numcomponents: 3,
                        data: normalList(LoadedOBJFiles["Deimos0.obj"].normals, LoadedOBJFiles["Deimos0.obj"].groups[shipArray[0].children[x].name].faces)
                    },
                    indices: faceList(LoadedOBJFiles["Deimos0.obj"].groups[shipArray[0].children[x].name].faces)
                };
                bufferArray[x] = twgl.createBufferInfoFromArrays(drawingState.gl, oarrays);

                if (shipArray[0].children[x].kid)
                {
                    var karrays = {
                        vpos: {
                            numcomponents: 3,
                            data: vertexList(LoadedOBJFiles["Deimos0.obj"].vertices, LoadedOBJFiles["Deimos0.obj"].groups[shipArray[0].children[x].kid.name].faces)
                        },
                        vnormal: {
                            numcomponents: 3,
                            data: normalList(LoadedOBJFiles["Deimos0.obj"].normals, LoadedOBJFiles["Deimos0.obj"].groups[shipArray[0].children[x].kid.name].faces)
                        },
                        indices: faceList(LoadedOBJFiles["Deimos0.obj"].groups[shipArray[0].children[x].kid.name].faces)
                    };
                    bufferArray[23 + x] = twgl.createBufferInfoFromArrays(drawingState.gl, karrays);
                }
            }
        }
        // put the helicopter on a random waypoint
        // see the stuff on helicopter behavior to understand the thing
        this.lastPad = randomWaypoint();
        this.position = this.position;
        this.state = 1; // landed
        this.wait = getRandomInt(250,750);
        this.lastTime = 0;
        this.targetingState = 1;

        //Gun related stuff
        //right side
        this.projectileArray[0] = new Projectile("deimosOneP1", [20,30,-105], "right", 2, [.8,.8,.8], this);
        this.projectileArray[1] = new Projectile("deimosOneP2", [0,30,-50], "right", 2, [.8,.8,.8], this);
        this.projectileArray[2] = new Projectile("deimosOneP3", [0,-.5,27], "right", 2, [.8,.8,.8], this);
        this.projectileArray[3] = new Projectile("deimosOneP4", [0,-6.5,47.5], "right", 2, [.8,.8,.8], this);
        this.projectileArray[4] = new Projectile("deimosOneP5", [0,-5.5,81.25], "right", 2, [.8,.8,.8], this);
        this.projectileArray[5] = new Projectile("deimosOneP6", [0,-5.5,115], "right", 2, [.8,.8,.8], this);
    //left side
        this.projectileArray[6] = new Projectile("deimosOneP7", [-20,30,-105], "left", 2, [.8,.8,.8], this);
        this.projectileArray[7] = new Projectile("deimosOneP8", [0,30,-50], "left", 2, [.8,.8,.8], this);
        this.projectileArray[8] = new Projectile("deimosOneP9", [0,-.5,27], "left", 2, [.8,.8,.8], this);
        this.projectileArray[9] = new Projectile("deimosOneP10", [0,-6.5,47.5], "left", 2, [.8,.8,.8], this);
        this.projectileArray[10] = new Projectile("deimosOneP11", [0,-5.5,81.25], "left", 2, [.8,.8,.8], this);
        this.projectileArray[11] = new Projectile("deimosOneP12", [0,-5.5,115], "left", 2, [.8,.8,.8], this);
        //Upper barrels
        this.projectileArray[12] = new Projectile("deimosOneP13", [2,46,-53.5], "uBarrel", 2, [.8,.8,.8], this);
        this.projectileArray[13] = new Projectile("deimosOneP14", [2,43,-107.5], "uBarrel", 2, [.8,.8,.8], this);
        this.projectileArray[14] = new Projectile("deimosOneP15", [2,51,65.5], "uBarrel", 2, [.8,.8,.8], this);
        this.projectileArray[15] = new Projectile("deimosOneP16", [-2, 46, -53.5], "uBarrel", 2, [.8,.8,.8], this);
        this.projectileArray[16] = new Projectile("deimosOneP17", [-2, 43, -107.5], "uBarrel", 2, [.8,.8,.8], this);
        this.projectileArray[17] = new Projectile("deimosOneP18", [-2, 51, 65.5], "uBarrel", 2, [.8,.8,.8], this);
        this.projectileArray.forEach(function(projectile)
        {
            grobjects.push(projectile);
        })

    };

    Deimos.prototype.draw = function(drawingState) {
        // make the helicopter fly around
        // this will change position and orientation
        var modelM = twgl.m4.rotationY(this.orientation);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        this.modelM = modelM;
        advance(this,drawingState, modelM);




        // we make a model matrix to place the cube in the world

        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM, oneText: this.texture, bumpText: this.bumpTexture});
        twgl.setBuffersAndAttributes(gl,shaderProgram,deimosBodyBuffers);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, deimosBodyBuffers);

        for (var x = 4; x < bufferArray.length - 4; x++)
        {
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
                cubecolor:this.color, model: modelM, oneText: this.bumpTexture, bumpText: this.bumpTexture});
            twgl.setBuffersAndAttributes(gl,shaderProgram, bufferArray[x]);
            twgl.drawBufferInfo(gl, gl.TRIANGLES, bufferArray[x]);
        }

        for (var y = 0; y < 4; y++)
        {
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
                cubecolor:this.color, model: shipArray[0].children[y].xForm, oneText: this.bumpText, bumpText: this.bumpTexture });

            twgl.setBuffersAndAttributes(gl,shaderProgram, bufferArray[y]);
            twgl.drawBufferInfo(gl, gl.TRIANGLES, bufferArray[y]);
        }

        for (var z = 23; z < 27; z++)
        {
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj , lightdir:drawingState.sunDirection,
                cubecolor:this.color, model: shipArray[0].children[z-23].kid.xForm, oneText: this.texture, bumpText: this.bumpTexture  });

            twgl.setBuffersAndAttributes(gl,shaderProgram, bufferArray[z]);
            twgl.drawBufferInfo(gl, gl.TRIANGLES, bufferArray[z]);
        }



    };
    Deimos.prototype.center = function(drawingState) {
        return this.position;
    }


    // constructor for Waypoint
    // note that anything that has a waypoint and helipadAltitude key can be used
    Waypoint = function Waypoint(ship, position) {
        this.name = ship.name + "WP"+padNumber++;
        this.position = position || [2,0.01,2];
        this.size = 1.0;
        // yes, there is probably a better way
        this.waypoint = true;
        // what altitude should the helicopter be?
        // this get added to the helicopter size
        this.helipadAltitude = 0;
    }
    Waypoint.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var q = .25;  // abbreviation

        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["deimos-vs", "deimos-fs"]);
        }
        if (!padBuffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -1,0,-1, -1,0,1, -.5,0,1, -.5,0,-1,
                    1,0,-1, 1,0,1, .5,0,1, .5,0,-1,
                    -.5,0,-.25, -.5,0,.25,.5,0,.25,.5,0, -.25

                ] },
                vnormal : {numComponents:3, data: [
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0
                ]},
                indices : [0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11
                ]
            };
            padBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Waypoint.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:[1,1,0], model: modelM });
        twgl.setBuffersAndAttributes(gl,shaderProgram,padBuffers);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, padBuffers);
    };
    Waypoint.prototype.center = function(drawingState) {
        return this.position;
    }


    ///////////////////////////////////////////////////////////////////
    // Ships Behavior
    //
    // the guts of this (the "advance" function) probably could
    // have been a method of helicopter.
    //
    // this is all kept separate from the parts that draw the helicopter
    //
    // the idea is that
    // the helicopter starts on a waypoint,
    // waits some random amount of time,
    // takes off (raises to altitude),
    // picks a random waypoint to fly to,
    // turns towards that waypoint,
    // flies to that waypoint,
    // lands
    //
    // the helicopter can be in 1 of 4 states:
    //      landed  (0)
    //      taking off (1)
    //      turning towards dest (2)
    //      flying towards dest (3)
    //      landing (4)


    ////////////////////////
    // constants
    var altitude = 3;
    var verticalSpeed = 3 / 1000;      // units per milli-second
    var flyingSpeed = 60/1000;          // units per milli-second
    var turningSpeed = 5/1000;         // radians per milli-second
    var TRSpeed = 3/1000;
    var TESpeed = 3/1000;

    // utility - generate random  integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //returns modelM of ship for use with projectiles
    Deimos.prototype.getModelM = function getModelM()
    {
        return this.modelM;
    }
    // find a random waypoint - allow for excluding one (so we don't re-use last target)
    function randomWaypoint(exclude) {
        var waypoints = grobjects.filter(function(obj) {return (obj.waypoint && (obj!=exclude))});

        var idx = getRandomInt(0,waypoints.length);
        return waypoints[idx];
    }
    //Points turret at target
    function aimGun(ship, target, tModelView)
    {
        var turretElevation = Math.PI/2;
        var turretEye = findObj(ship.name).position;
        //Lets get some trig up in here, get some angles for the turret and barrels
        var xPos = target[2] - turretEye[2];
        var yPos = target[0] - turretEye[0];
        var turretRotation = Math.atan2(yPos, xPos);
        turretRotation += ship.orientation;

        shipArray[0].children[0].xForm = getTurretMatrix(49.8, turretRotation, tModelView, twgl.m4, turretEye, target);
        shipArray[0].children[1].xForm = getTurretMatrix(104, turretRotation, tModelView, twgl.m4, turretEye, target);
        shipArray[0].children[2].xForm = getTurretMatrix(-69, turretRotation, tModelView, twgl.m4, turretEye, target);
        shipArray[0].children[3].xForm = getTurretMatrix(53.8, 0, tModelView, twgl.m4, turretEye, target);

        shipArray[0].children[0].kid.xForm = getBarrelMatrix(-47.3, 53.3, turretRotation, turretElevation, tModelView, twgl.m4, turretEye, target);
        shipArray[0].children[1].kid.xForm = getBarrelMatrix(-43.4, 107.5, turretRotation, turretElevation, tModelView, twgl.m4, turretEye, target);
        shipArray[0].children[2].kid.xForm = getBarrelMatrix(-51.7, -65.5, turretRotation, turretElevation, tModelView, twgl.m4, turretEye, target);
        shipArray[0].children[3].kid.xForm = getBarrelMatrix(19.7, 50.3, 0, Math.PI/2, tModelView, twgl.m4, turretEye, target);


    }

    Deimos.prototype.fireGun = function()
    {
        for (var x = 0; x < this.projectileArray.length; x++)
        {
            this.projectileArray[x].fireFlag = true;
        }
    }

    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }


    // this actually does the work
    function advance(ship, drawingState, tModelView) {
        // on the first call, the copter does nothing
        //Update turret positions

        if (!ship.lastTime) {
            ship.lastTime = drawingState.realtime;
            aimGun(ship, [0,1,0], tModelView);
            return;
        }
        var delta = drawingState.realtime - ship.lastTime;
        ship.lastTime = drawingState.realtime;
        switch (ship.targetingState)
        {
            case 0: //ship has no targets, guns forward
                aimGun(ship, [0,1,0], tModelView);
            break;

            case 1: //ship has target
                aimGun(ship, findObj(ship.target).position, tModelView);
            break;
        }
        //update positions of intra-hull projectiles
        var barrelNumber = 0;
        ship.projectileArray.forEach(function(projectile)
        {
            projectile.parentModelM = ship.modelM;
            projectile.parentOrientation = ship.orientation;
            projectile.parentPosition[0] = ship.position[0];
            projectile.parentPosition[1] = ship.position[1];
            projectile.parentPosition[2] = ship.position[2];
           projectile.position[0] = ship.position[0] + projectile.offset[0];
           projectile.position[1] = ship.position[1]+ projectile.offset[1];
           projectile.position[2] = ship.position[2] + projectile.offset[2];
           if (projectile.face == "uBarrel")
           {
               projectile.parentBarrel = shipArray[0].children[barrelNumber].kid.xForm;
                barrelNumber++;
                if (barrelNumber == 3)
                    barrelNumber = 0;
           }

        });

        // now do the right thing depending on state
        if (ship.spline == null) {
            switch (ship.state) {
                case 0: // on the ground, waiting for take off
                    if (ship.wait > 0) {
                        ship.wait -= delta;
                    }
                    else {  // take off!
                        ship.state = 1;
                        ship.wait = 500;
                    }
                    break;
                case 1: // Pick Destination
                    if (ship.waypoints.length >= ship.WP + 1) {
                        var dest = findObj(ship.waypoints[ship.WP].name);
                        ship.lastPad = dest;
                        // the direction to get there...
                        ship.dx = dest.position[0] - ship.position[0];
                        ship.dz = dest.position[2] - ship.position[2];
                        ship.dst = Math.sqrt(ship.dx * ship.dx + ship.dz * ship.dz);
                        if (ship.dst < .01) {
                            // small distance - just go there
                            ship.position[0] = dest.position[0];
                            ship.position[2] = dest.position[2];
                            ship.state = 4;
                        } else {
                            ship.vx = ship.dx / ship.dst;
                            ship.vz = ship.dz / ship.dst;
                        }
                        ship.dir = Math.atan2(ship.dx, -ship.dz);
                        ship.state = 2;
                    }
                    else {
                        ship.WP = 0;
                        ship.state = 2;
                    }

                    break;
                case 2: // spin towards goal
                    var dtheta = ship.dir - ship.orientation;
                    // if we're close, pretend we're there
                    if (Math.abs(dtheta) < .01) {
                        ship.state = 3;
                        ship.orientation = ship.dir;
                    }
                    var rotAmt = turningSpeed * delta;
                    if (dtheta > 0) {
                        ship.orientation = Math.min(ship.dir, ship.orientation + rotAmt);
                    } else {
                        ship.orientation = Math.max(ship.dir, ship.orientation - rotAmt);
                    }
                    break;
                case 3: // fly towards goal
                    if (ship.dst > .01) {
                        var go = delta * flyingSpeed;
                        // don't go farther than goal
                        go = Math.min(ship.dst, go);
                        ship.position[0] += ship.vx * go;
                        ship.position[2] += ship.vz * go;
                        ship.dst -= go;
                    } else { // we're effectively there, so go there
                        ship.position[0] = ship.lastPad.position[0];
                        ship.position[2] = ship.lastPad.position[2];
                        ship.state = 4;
                    }
                    break;
                case 4: // At goal
                    ship.state = 0;
                    ship.wait = 500;
                    ship.WP++;
                    break;
            }
        }
        else
        {
            for (var x = 0; x < ship.spline[0].vertex.length; x = x + 3) {
                ship.position[0] = ship.spline[0].vertex[x];
                ship.position[1] = ship.spline[0].vertex[x + 1];
                ship.position[2] = ship.spline[0].vertex[x + 2];
            }
        }
    }
})();

// normally, I would put this into a "scene description" file, but having
// it here means if this file isn't loaded, then there are no dangling
// references to it

// make the objects and put them into the world
// note that the helipads float above the floor to avoid z-fighting



grobjects.push(new Deimos("deimosOne", [.1,.2,.1], "deimosTwo", [200,0,200], null));

addWaypoint(findObj("deimosOne"), [200,0,200]);
addWaypoint(findObj("deimosOne"), [200,0,-200]);

grobjects.push(new Deimos("deimosTwo", [.2,.1,.1], "deimosOne", [-200,0,-100], null));



//addWaypoint(findObj("deimosTwo"), [100,0,500]);
//addWaypoint(findObj("deimosTwo"), [100, 0, -500]);

//grobjects.push(new Deimos("deimosThree", [.1,.1,.2], "deimosOne", [0,0,0], getCurveArrayB()));

//grobjects.push(new Waypoint([0,0,-200]));
//grobjects.push(new Waypoint([0,0,200]));

//Turret LookAt
//curve follow w/ variable angle shift

//Features P7
//targetable guns
//firing guns
//add sun, create from scratch?
//add projectiles
//debris

//Features P8
//proper textures for ship
//sun texture, animated?

//Features P9

//Features P10
//missiles firing on splines?
//spline based waypoint system, user controllable

