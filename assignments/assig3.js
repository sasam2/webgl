"use strict";

var canvas;
var gl;

var vPosition;
//var vColor;
var translationLoc; 
var rotationLoc;
var scalingLoc;
var colorLoc;

//cone
var conePointsStrips = [];
function colorCone(baseVerticesCount)
{
	var angle = Math.PI*2/baseVerticesCount;
	
	var vertices = [];	
	var line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.0, -0.5, 0.0, 1.0));
	}
	vertices.push(line);
	
	line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.5*Math.cos(i*angle), -0.5, 0.5*Math.sin(i*angle), 1.0));
	}
	vertices.push(line);
	
	line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.0, 0.5, 0.0, 1.0));
	}
	vertices.push(line);
	
	for(var i = 0; i < vertices.length-1; i++){
		var strip = [];
		for(var j = 0; j < vertices[i].length; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
		}
		strip.push(vertices[i][0]);
		strip.push(vertices[i+1][0]);
		conePointsStrips.push(strip);
	}
};

//cilinder
var cilinderPointsStrips = [];
function colorCilinder(baseVerticesCount)
{
	var angle = Math.PI*2/baseVerticesCount;
	var vertices = [];
	
	var line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.0, -0.5, 0.0, 1.0));
	}
	vertices.push(line);
	
	line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.5*Math.cos(i*angle), -0.5, 0.5*Math.sin(i*angle), 1.0));
	}
	vertices.push(line);
	
	line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.5*Math.cos(i*angle), 0.5, 0.5*Math.sin(i*angle), 1.0));
	}
	vertices.push(line);
	
	line = [];
	for(var i = 0; i < baseVerticesCount; i++){
		line.push(vec4(0.0, 0.5, 0.0, 1.0));
	}
	vertices.push(line);
	
	for(var i = 0; i < vertices.length-1; i++){
		var strip = [];
		for(var j = 0; j < vertices[i].length; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
		}
		strip.push(vertices[i][0]);
		strip.push(vertices[i+1][0]);
		cilinderPointsStrips.push(strip);
	}
};

//sphere
var spherePointsStrips = [];
function colorSphere(longitudeCount, latitudeCount)
{	
	var angle = Math.PI*2.0/longitudeCount;
	var dr = 1.0/latitudeCount;
	
	var vertices = [];
	for(var i = 0; i <= latitudeCount; i++){
		var r = Math.sqrt(0.5*0.5-(i*dr-0.5)*(i*dr-0.5));
		var y = i*dr-0.5;
		var line = [];
		for(var j = 0; j < longitudeCount; j++){			
			line.push(vec4(r*Math.cos(j*angle), y, r*Math.sin(j*angle), 1.0));
		}
		vertices.push(line);
	}
	for(var i = 0; i < latitudeCount; i++){
		var strip = [];
		for(var j = 0; j < longitudeCount; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
		}
		strip.push(vertices[i][0]);
		strip.push(vertices[i+1][0]);
		spherePointsStrips.push(strip);
	}
};

function stripShape(gl, pointsStrips)
{
	this.color=[ 0.0, 0.0, 0.0, 1.0 ];
	this.translation=[ 0, 0, 0 ];
	this.rotation=[ 0, 0, 0 ];
	this.scaling=[ 1.0, 1.0, 1.0 ];
	
	var verticesCountStrip=pointsStrips[0].length;
	this.vStrips = [];
	for(var i = 0; i < pointsStrips.length; i++){
		var vStripBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vStripBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsStrips[i]), gl.STATIC_DRAW );
		this.vStrips.push(vStripBuffer);
	}
	this.render = function(){

		gl.uniform3fv(translationLoc, this.translation);
		gl.uniform3fv(rotationLoc, this.rotation);
		gl.uniform3fv(scalingLoc, this.scaling);
		
		gl.uniform4fv(colorLoc, this.color);
				
		for(var i = 0; i < this.vStrips.length; i++){
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vStrips[i] );
			gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, verticesCountStrip );
		}

		gl.uniform4fv(colorLoc, [1.0, 1.0, 1.0, 1.0]);
		
		for(var i = 0; i < this.vStrips.length; i++){
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vStrips[i] );
			gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( gl.LINE_STRIP, 0, verticesCountStrip );
		}
	};
};
var shapesKeys = [];
var shapes = {};
var selectedShape = undefined;

var sphereCount=0;
var coneCount=0;
var cilinderCount=0;
window.onload = function init()
{
	colorCone(20);
	colorCilinder(20);
	colorSphere(20, 20);
	
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	colorLoc = gl.getUniformLocation( program, "vColor" );
    //gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( colorLoc );

	vPosition = gl.getAttribLocation( program, "vPosition" );
    //gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	translationLoc = gl.getUniformLocation(program, "translation");
    rotationLoc = gl.getUniformLocation(program, "theta");
	scalingLoc = gl.getUniformLocation(program, "scaling");
	
    //event listeners for buttons
	document.getElementById("shape").onchange = function () {
		
		var shapeKey = document.getElementById("shape").value;
		selectedShape = shapes[shapeKey];
		
		document.getElementById("translateX").value = selectedShape.translation[0];
		document.getElementById("translateY").value = selectedShape.translation[1];
		document.getElementById("translateZ").value = selectedShape.translation[2];
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		
		document.getElementById("rotateX").value = selectedShape.rotation[0];
		document.getElementById("rotateY").value = selectedShape.rotation[1];
		document.getElementById("rotateZ").value = selectedShape.rotation[2];
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		
		document.getElementById("scaleX").value = selectedShape.scaling[0];
		document.getElementById("scaleY").value = selectedShape.scaling[1];
		document.getElementById("scaleZ").value = selectedShape.scaling[2];
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		
		document.getElementById("colorR").value = selectedShape.color[0];
		document.getElementById("colorG").value = selectedShape.color[1];
		document.getElementById("colorB").value = selectedShape.color[2];
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		
		document.getElementById("shapeDbg").innerHTML = "Selected shape: "+shapeKey;
    };
	document.getElementById("deleteShape").onclick = function () {
		var shapeKey = document.getElementById("shape").value;
		delete shapes[shapeKey];
		var s = document.getElementById("shape");
		var children = s.childNodes;
		for(var i = 0; i < children.length; i++){
			if(children[i].value == shapeKey){
				s.removeChild(children[i]);
				break;
			}
		}
		s.value = children[0].value;
		document.getElementById("shape").onchange();
		selectedShape.render();
    };
	document.getElementById("newSphere").onclick = function () {
		sphereCount++;
		var shapeKey = "sphere"+sphereCount;
		shapesKeys.push(shapeKey);
		
		shapes[shapeKey] = new stripShape(gl, spherePointsStrips);
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t)
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		selectedShape.render();		
    };
	document.getElementById("newCone").onclick = function () {
		coneCount++;
		var shapeKey = "cone"+coneCount;
		shapesKeys.push(shapeKey);
		
		shapes[shapeKey] = new stripShape(gl, conePointsStrips);
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t)
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		selectedShape.render();		
    };
	document.getElementById("newCilinder").onclick = function () {
		cilinderCount++;
		var shapeKey = "cilinder"+cilinderCount;
		shapesKeys.push(shapeKey);
		
		shapes[shapeKey] = new stripShape(gl, cilinderPointsStrips);
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t)
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		selectedShape.render();		
    };
	document.getElementById("translateX").value = 0;
    document.getElementById("translateX").onchange = function () {
		selectedShape.translation[0] = document.getElementById("translateX").value;
		gl.uniform3fv(translationLoc, selectedShape.translation);
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		selectedShape.render();
    };
	document.getElementById("translateY").value = 0;
    document.getElementById("translateY").onchange = function () {
        selectedShape.translation[1] = document.getElementById("translateY").value;
		gl.uniform3fv(translationLoc, selectedShape.translation);
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		selectedShape.render();
    };
	document.getElementById("translateZ").value = 0;
	document.getElementById("translateZ").onchange = function () {
        selectedShape.translation[2] = document.getElementById("translateZ").value;
		gl.uniform3fv(translationLoc, selectedShape.translation);
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		selectedShape.render();
    };
	document.getElementById("rotateX").value = 0;
	document.getElementById("rotateX").onchange = function () {
        selectedShape.rotation[0] = document.getElementById("rotateX").value;
		gl.uniform3fv(rotationLoc, selectedShape.rotation);
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		selectedShape.render();
    };
	document.getElementById("rotateY").value = 0;
	document.getElementById("rotateY").onchange = function () {
        selectedShape.rotation[1] = document.getElementById("rotateY").value;
		gl.uniform3fv(rotationLoc, selectedShape.rotation);
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		selectedShape.render();
    };
	document.getElementById("rotateZ").value = 0;
	document.getElementById("rotateZ").onchange = function () {
        selectedShape.rotation[2] = document.getElementById("rotateZ").value;
		gl.uniform3fv(rotationLoc, selectedShape.rotation);
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		selectedShape.render();
    };
	document.getElementById("scaleX").value = 1.0;
	document.getElementById("scaleX").onchange = function () {
        selectedShape.scaling[0] = document.getElementById("scaleX").value;
		gl.uniform3fv(scalingLoc, selectedShape.scaling);
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		selectedShape.render();
    };
	document.getElementById("scaleY").value = 1.0;
	document.getElementById("scaleY").onchange = function () {
        selectedShape.scaling[1] = document.getElementById("scaleY").value;
		gl.uniform3fv(scalingLoc, selectedShape.scaling);
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		selectedShape.render();
    };
	document.getElementById("scaleZ").value = 1.0;
	document.getElementById("scaleZ").onchange = function () {
        selectedShape.scaling[2] = document.getElementById("scaleZ").value;
		gl.uniform3fv(scalingLoc, selectedShape.scaling);
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		selectedShape.render();
    };
	document.getElementById("colorR").value = 0.0;
	document.getElementById("colorR").onchange = function () {
		var cr=document.getElementById("colorR").value;
		selectedShape.color[0]=cr;
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		selectedShape.render();
    };
	document.getElementById("colorG").value = 0.0;
	document.getElementById("colorG").onchange = function () {
		var cg=document.getElementById("colorG").value;
		selectedShape.color[1]=cg;
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		selectedShape.render();
    };
	document.getElementById("colorB").value = 0.0;
	document.getElementById("colorB").onchange = function () {
		var cb=document.getElementById("colorB").value;
		selectedShape.color[2]=cb;
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		selectedShape.render();
    };
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var log = "Rendering: ";
	for(var prop in shapes){
		shapes[prop].render();
		log+=prop+" ";
	}
	
	document.getElementById("renderDbg").innerHTML = log;
    requestAnimFrame( render );
}
