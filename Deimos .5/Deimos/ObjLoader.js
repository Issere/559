/**
 * Created by Will on 2/16/2017.
 */

function loadTriangles(shipArray)
{
    var Array = [];
    for (var x = 0; x < shipArray.length; x++)
    {
        for (var y = 0; y < shipArray[x].face.length; y++)
        {
            Array.push(loadTriangle(shipArray[x].face[y][0][0], shipArray[x].face[y][1][0], shipArray[x].face[y][2][0], shipArray[x].vertex));
        }
        for (var z = 0; z < shipArray[x].children.length; z++)
        {
            for (var w = 0; w < shipArray[x].children[z].face.length; w++)
            {
                Array.push(loadTriangle(shipArray[x].children[z].face[w][0][0], shipArray[x].children[z].face[w][1][0], shipArray[x].children[z].face[w][2][0], shipArray[x].vertex));
            }
            if (shipArray[x].children[z].child != null)
            {
                for (var v = 0; v < shipArray[x].children[z].child.face.length; v++)
                {
                    Array.push(loadTriangle(shipArray[x].children[z].child.face[v][0][0], shipArray[x].children[z].child.face[v][1][0], shipArray[x].children[z].child.face[v][2][0], shipArray[x].vertex));
                }
            }
        }
    }

    return Array;
}

function loadTriangle(a, b, c, vertex)
{
    var Triangle = {Vertex:[3][3], sortPoint:[3]};
    Triangle.Vertex = [[vertex[a][0], vertex[a][1], vertex[a][2]],[vertex[b][0], vertex[b][1], vertex[b][2]],[vertex[c][0], vertex[c][1], vertex[c][2]]];
    Triangle.sortPoint = [(vertex[a][0] + vertex[b][0] + vertex[c][0])/3, (vertex[a][1] + vertex[b][1] + vertex[c][1])/3, (vertex[a][2] + vertex[b][2] + vertex[c][2])/3];
    return Triangle;
}

function convertArray(array)
{
    var newArray = [];
    for (var x = 0; x < array.length; x++)
    {
        for (var y = 0; y < array[x].length; y++)
        {
            newArray.push(array[x][y]);
        }
    }
    return newArray;
}

function convertFaces(array)
{
    var newArray = [];
    for (var x = 0; x < array.length; x++)
    {
        for (var y = 0; y < array[x].length; y++)
        {
                newArray.push(array[x][y][0]);
        }
    }
    return newArray;
}

function onvertNormals(array)
{
    var newArray = [];
    for (var x = 0; x < array.length; x++)
    {
        for (var y = 0; y < array[x].length; y++)
        {
            newArray.push(array[x][y]);
        }
    }
    return newArray;
}

function ConvertNormals(faces, normals)
{
        var newArray = [];

        for (var x = 0; x < faces.length; x++)
            {
                for (var v = 0; v < 3; v++)
                {
                    var vi = faces[x][v][0];
                    var ti = faces[x][v][1];
                    var ni = faces[x][v][2];
                    newArray.push(normals[ni][0]);
                    newArray.push(normals[ni][1]);
                    newArray.push(normals[ni][2]);
            }
        }
        return newArray;
}

function createColorBuffer(array)
{
        var newArray = [];
        for (var x = 0; x < array.length; x++)
        {
            for (var y = 0; y < array[x].length; y++)
            {
                newArray.push(.6);
            }
        }
        return newArray;
}

function threeify(matrix)
{
    var newArray = [];
    newArray.push(matrix[0]);
    newArray.push(matrix[1]);
    newArray.push(matrix[2]);
    newArray.push(matrix[4]);
    newArray.push(matrix[5]);
    newArray.push(matrix[6]);
    newArray.push(matrix[8]);
    newArray.push(matrix[9]);
    newArray.push(matrix[10]);
    return newArray;
}

function vertexList(vertex, face)
{
    var newArray = [];
    for (var x = 0; x < face.length; x++)
    {
            for (var v = 0; v < 3; v++)
            {
                var vi = face[x][v][0];
                var ti = face[x][v][1];
                var ni = face[x][v][2];
                newArray.push(vertex[vi][0]);
                newArray.push(vertex[vi][1]);
                newArray.push(vertex[vi][2]);
            }

    }
    return newArray;
}

function normalList(normal, face)
{
    var newArray = [];
    for (var x = 0; x < face.length; x++)
    {
        for (var v = 0; v < 3; v++)
        {
            var vi = face[x][v][0];
            var ti = face[x][v][1];
            var ni = face[x][v][2];
            newArray.push(normal[ni][0]);
            newArray.push(normal[ni][1]);
            newArray.push(normal[ni][2]);
        }

    }
    return newArray;
}


function faceList(face)
{
    var newArray = [];
    var index = 0;
    for (var x = 0; x < face.length * 3; x++)
    {
        newArray.push(index)
        index++;
    }
    return newArray;
}

function textureList(text, face)
{
    var newArray = [];
    var convert;
    for (var x = 0; x < face.length; x++)
    {
        for (var v = 0; v < 3; v++)
        {
            var vi = face[x][v][0];
            var ti = face[x][v][1];
            var ni = face[x][v][2];
            convert = text[ti][0];
            newArray.push(convert);
            convert = text[ti][1];
            newArray.push(convert);
            //newArray.push(text[ti][2]);
        }

    }
    return newArray;
}
function getTurretMatrixD(displacement, turretRotation, tModelView, m4)
{
    var turretAxis = [0, 1,0];
    var tTurretTranslate0 = m4.translation([0, 0, -displacement]);
    var tTurretAngle = m4.axisRotation(turretAxis, turretRotation);
    var tTurretRotation = m4.multiply(tTurretAngle, tTurretTranslate0);
    var tTurretTranslation1 = m4.multiply(m4.translation([0, 0, displacement]), tTurretRotation);
    var tTurretRotate = m4.multiply(tTurretTranslation1, tModelView);
    return tTurretRotate;
}

function getTurretMatrix(displacement, turretRotation, tModelView, m4, turretEye, target)
{
    var eye = turretEye;
    var at = target;
    var up = [0,1,0];
    //turretRotation += Math.atan2((turretEye[0] - target[0]), (turretEye[2] - target[2]));
    //turretRotation = Math.abs(turretRotation);
    var turretAxis = [0, 1,0];
    var tTurretTranslate0 = m4.translation([0, 0, -displacement]);
    var tTurretAngle = m4.axisRotation(turretAxis, turretRotation);
    //var tTurretAngle = m4.lookAt(eye,at,up);
    var tTurretRotation = m4.multiply(tTurretAngle, tTurretTranslate0);
    var tTurretTranslation1 = m4.multiply(m4.translation([0, 0, displacement]), tTurretRotation);
    var tTurretRotate = m4.multiply(tTurretTranslation1, tModelView);
    return tTurretRotate;
}

function getBarrelMatrix(displacementy, displacementz, turretRotation, turretElevation, tModelView, m4)
{
    var turretAxis = [0, 1,0];
    var barrelAxis = [1, 0,0];
    var tTurretTranslate0 = m4.translation([0, -displacementy, -displacementz + 3.5 ]);
    var tTurretAngle1 = m4.axisRotation(barrelAxis, turretElevation);
    var tTurretAngle2 = m4.axisRotation(turretAxis, turretRotation);
    var tTurretAngle3 = m4.multiply(tTurretAngle1, tTurretAngle2);
    var tTurretRotation = m4.multiply(tTurretAngle3, tTurretTranslate0);
    var tTurretTranslation1 = m4.multiply(m4.translation([0, displacementy, displacementz]), tTurretRotation);
    var tTurretRotate = m4.multiply(tTurretTranslation1, tModelView);
    return tTurretRotate;
}

function drawGroup(gl, shaderProgram, group, tNormalMatrix, tModelView, tProjection)
{
    var vertexPos = vertexList(LoadedOBJFiles["Deimos0.obj"].vertices, LoadedOBJFiles["Deimos0.obj"].groups[group ].faces);
    var triangleIndices = faceList(LoadedOBJFiles["Deimos0.obj"].groups[group ].faces);
    var normals = normalList(LoadedOBJFiles["Deimos0.obj"].normals, LoadedOBJFiles["Deimos0.obj"].groups[group ].faces);

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

    //setup attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(shaderProgram.normalAttrib, 3, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.vertexAttribPointer(shaderProgram.positionAttrib, 3,
        gl.FLOAT, false, 0, 0);

    //setup uniforms
    gl.uniformMatrix4fv(shaderProgram.mMatrix, false, tModelView);
    gl.uniformMatrix4fv(shaderProgram.pMatrix, false, tProjection);
    gl.uniformMatrix3fv(shaderProgram.nMatrix, false, tNormalMatrix);

    //draw
    gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_SHORT, 0);
}
