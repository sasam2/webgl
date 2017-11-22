"use strict";

var canvas;
var gl;

var vPosition;
var vNormal;

var lightPositionLoc;
var lightAmbientLoc;
var lightDiffuseLoc;
var lightSpecularLoc;

var materialAmbientLoc;
var materialDiffuseLoc;
var materialSpecularLoc;
var materialShininessLoc;

var translationLoc; 
var rotationLoc;
var scalingLoc;

//cone
var conePointsStrips = [];
var coneNormals = [];
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
		var normals = [];
		for(var j = 0; j < vertices[i].length; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
			var n;
			if(i==0){
				n = vec3(0.0, -1.0, 0.0);
			} else { 		
				var prevJ = (vertices[i].length+j-1)%vertices[i].length;
				var r = subtract(vertices[i][j], vec4(0.0, -0.5, 0.0, 1.0));
				n = vec3(r[0]*2, 0.5, r[2]*2);
				
			}
			normals.push(n);
			normals.push(n);
			
		}
		strip.push(vertices[i][0]);
		strip.push(vertices[i+1][0]);
		var n;
		if(i==0){
			n = vec3(0.0, -1.0, 0.0);
		} else { 		
			var prevJ = (vertices[i].length+0-1)%vertices[i].length;
			//var t1 = subtract(vertices[i+1][prevJ],vertices[i][prevJ]);
			var r = subtract(vertices[i][0], vec4(0.0, -0.5, 0.0, 1.0));
			//var t2 = vec3(-r[1], r[0], r[2]);//subtract(vertices[i][j],vertices[i+1][prevJ]);
			//n = vec3(r[0]*Math.cos(ang), Math.sin(ang), r[2]*Math.cos(ang));
			n = vec3(r[0]*2, 0.5, r[2]*2);	
			//n = vec3(cross(t1,t2));		
			/*var log=//"<p/>i="+i+"/"+vertices.length+
					"<p/>j="+j+"/"+vertices[i].length+
					//"<br/>i+1="+(i+1)+"/"+vertices.length+
					"<br/>j-1="+prevJ+"/"+vertices[i].length+
					"<br/>v[i][j-1]=["+vertices[i][prevJ]+
					"]<br/>v[i+1][j-1]=["+vertices[i+1][prevJ]+
					"]<br/>v[i][j]=["+vertices[i][j]+
					"]<br/>n=["+n+"]";
			document.getElementById("shapeDbg").innerHTML = document.getElementById("shapeDbg").innerHTML+log;*/
		}
		normals.push(n);
		normals.push(n);
		//var log = "v=["+vertices[i][0]+"] n=["+n+"]<br/>"+"v=["+vertices[i+1][0]+"] n=["+n+"]<br/>";
		//document.getElementById("shapeDbg").innerHTML = document.getElementById("shapeDbg").innerHTML+log;
		conePointsStrips.push(strip);
		coneNormals.push(normals);
	}
	//document.getElementById("shapeDbg").innerHTML = "["+coneNormals+"]";
};

//cilinder
var cilinderPointsStrips = [];
var cilinderNormals = [];
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
		var normals = [];
		for(var j = 0; j < vertices[i].length; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
			
			if(i==0){
				normals.push(vec3(0.0, -1.0, 0.0));
				normals.push(vec3(0.0, -1.0, 0.0));
			} else if(i==vertices.length-2){
				normals.push(vec3(0.0, 1.0, 0.0));
				normals.push(vec3(0.0, 1.0, 0.0));
			} else {
				var n = vec3(subtract(vertices[i][j], vec4(0.0, -0.5, 0.0, 1.0)));
				normals.push(n);
				normals.push(n);
			}
		}
		strip.push(vertices[i][0]);
		strip.push(vertices[i+1][0]);
		if(i==0){
			normals.push(vec3(0.0, -1.0, 0.0));
			normals.push(vec3(0.0, -1.0, 0.0));
		} else if(i==vertices.length-2){
			normals.push(vec3(0.0, 1.0, 0.0));
			normals.push(vec3(0.0, 1.0, 0.0));
		} else {
			var n = vec3(subtract(vertices[i][0], vec4(0.0, -0.5, 0.0, 1.0)));
			normals.push(n);
			normals.push(n);
		}
		
		cilinderPointsStrips.push(strip);
		cilinderNormals.push(normals);
	}
};

//sphere
var spherePointsStrips = [];
var sphereNormals = [];
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
		var normals = [];
		for(var j = 0; j < longitudeCount; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
			normals.push(vec3(vertices[i][j]));
			normals.push(vec3(vertices[i+1][j]));
		}
		strip.push(vertices[i][0]);
		strip.push(vertices[i+1][0]);
		normals.push(vec3(vertices[i][0]));
		normals.push(vec3(vertices[i+1][0]));
		
		spherePointsStrips.push(strip);
		sphereNormals.push(normals);
	}
};

function stripShape(gl, pointsStrips, pointsNormals)
{
	this.color=[ 0.0, 0.0, 0.7, 1.0 ];
	this.shininess = 100.0;
	this.translation=[ 0, 0, 0 ];
	this.rotation=[ 0, 0, 0 ];
	this.scaling=[ 1.0, 1.0, 1.0 ];
	
	var verticesCountStrip=pointsStrips[0].length;
	this.vStrips = [];
	this.vNormals = [];
	for(var i = 0; i < pointsStrips.length; i++){
		var vStripBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vStripBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsStrips[i]), gl.STATIC_DRAW );
		this.vStrips.push(vStripBuffer);
		
		var strip = pointsStrips[i];
		/*
		var pointNormals = new Array(strip.length);
		var t1 = undefined;
		var t2 = subtract(strip[1], strip[0]);
		var log = "<p/>v(0)="+ strip[0]+"<br/>";
		for(var j=2; j < strip.length; j++){
			t1 = t2;
			t2 = subtract(strip[j], strip[j-1]);
			pointNormals[j] = vec3(cross(t1, t2));
			if(j%2==1){
				pointNormals[j][0] = -pointNormals[j][0];
				pointNormals[j][1] = -pointNormals[j][1];
				pointNormals[j][2] = -pointNormals[j][2];
			}
			log+="j="+j+" <br/> vPre("+(j-1)+")=["+strip[j-1]+"] <br/> vCur("+j+")=["+strip[j]+"] <br/> t1=["+t1+"] <br/> t2=["+t2+"] <br/> ["+pointNormals[j]+"]<p/>";
		}
		pointNormals[0]=pointNormals[pointNormals.length-2];
		pointNormals[1]=pointNormals[pointNormals.length-1];
		*/
		var vNormalsBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vNormalsBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsNormals[i]), gl.STATIC_DRAW );
		this.vNormals.push(vNormalsBuffer);
	}
	//document.getElementById("shapeDbg").innerHTML = "Normals: "+pointsNormals+"<br/>";
	this.render = function(){

		gl.uniform3fv(translationLoc, this.translation);
		gl.uniform3fv(rotationLoc, this.rotation);
		gl.uniform3fv(scalingLoc, this.scaling);
		//document.getElementById("shapeDbg").innerHTML = "translation: "+this.translation+"<br/>";
		gl.uniform4fv(materialAmbientLoc, this.color);
		gl.uniform4fv(materialDiffuseLoc, [1.0, 1.0, 1.0, 1.0]);
		gl.uniform4fv(materialSpecularLoc, [1.0, 1.0, 1.0, 1.0]);
		
		gl.uniform1f(materialShininessLoc, this.shininess);
			
		for(var i = 0; i < this.vStrips.length; i++){
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vStrips[i] );
			gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vNormals[i] );
			gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, verticesCountStrip );
		}

		/*gl.uniform4fv(materialAmbientLoc, [1.0, 1.0, 1.0, 1.0]);
		gl.uniform4fv(materialDiffuseLoc, [1.0, 1.0, 1.0, 1.0]);
		gl.uniform4fv(materialSpecularLoc, [1.0, 1.0, 1.0, 1.0]);
		
		for(var i = 0; i < this.vStrips.length; i++){
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vStrips[i] );
			gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vNormals[i] );
			gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( gl.LINE_STRIP, 0, verticesCountStrip );
		}*/
	};
};
var shapesKeys = [];
var shapes = {};
var selectedShape = undefined;

var sphereCount=0;
var coneCount=0;
var cilinderCount=0;

			   //light 0				 //light 1
var lightArr;
var posArr =  [ [ -1.0, 0.75, 0.0, 1.0 ], [ -1.5, -0.75, 0.0, 1.0]];
var ambArr =  [ [ 0.25, 0.2, 0.25, 1.0 ],  [ 0.3, 0.4, 0.3, 1.0 ]];
var diffArr = [ [ 0.5, 0.4, 0.5, 1.0 ],  [ 0.6, 0.8, 0.6, 1.0 ]];
var specArr = [ [ 0.5, 0.4, 0.5, 1.0 ],  [ 0.6, 0.8, 0.6, 1.0 ]];

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
	
	lightPositionLoc = gl.getUniformLocation( program, "lightPosition" );
	lightAmbientLoc = gl.getUniformLocation( program, "lightAmbient" );
	lightDiffuseLoc = gl.getUniformLocation( program, "lightDiffuse" );
	lightSpecularLoc = gl.getUniformLocation( program, "lightSpecular" );

	materialAmbientLoc = gl.getUniformLocation( program, "materialAmbient" );
	materialDiffuseLoc = gl.getUniformLocation( program, "materialDiffuse" );
	materialSpecularLoc = gl.getUniformLocation( program, "materialSpecular" );
	materialShininessLoc = gl.getUniformLocation( program, "materialShininess" );
    //gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( colorLoc );

	vPosition = gl.getAttribLocation( program, "vPosition" );
    //gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	vNormal = gl.getAttribLocation( program, "vNormal" );
    //gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
	translationLoc = gl.getUniformLocation(program, "translation");
    rotationLoc = gl.getUniformLocation(program, "theta");
	scalingLoc = gl.getUniformLocation(program, "scaling");
	
	//draw lights
	lightArr = [ new stripShape(gl, spherePointsStrips, sphereNormals), new stripShape(gl, spherePointsStrips, sphereNormals)];
	lightArr[0].scaling=[ 0.05, 0.05, 0.05 ];
	lightArr[1].scaling=[ 0.05, 0.05, 0.05 ];
	lightArr[0].color=[ 0.5, 0.4, 0.5, 1.0 ];
	lightArr[1].color=[ 0.6, 0.8, 0.6, 1.0 ];
	
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
		
		//document.getElementById("shapeDbg").innerHTML = "Selected shape: "+shapeKey;
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
		
		shapes[shapeKey] = new stripShape(gl, spherePointsStrips, sphereNormals);
		
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
		//document.getElementById("shapeDbg").innerHTML = "["+coneNormals+"]";
		shapes[shapeKey] = new stripShape(gl, conePointsStrips, coneNormals);
		
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
		
		shapes[shapeKey] = new stripShape(gl, cilinderPointsStrips, cilinderNormals);
		
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
	document.getElementById("toggleLight0").onclick = function () {
		if(	ambArr[0][0]==0.0 && ambArr[0][1]==0.0 && ambArr[0][2]==0.0 && ambArr[0][3]==1.0 && 
			diffArr[0][0]==0.0 && diffArr[0][1]==0.0 && diffArr[0][2]==0.0 && diffArr[0][3]==1.0 && 
			specArr[0][0]==0.0 && specArr[0][1]==0.0 && specArr[0][2]==0.0 && specArr[0][3]==1.0){
			ambArr[0]=[ 0.25, 0.30, 0.25, 1.0 ];
			diffArr[0]=[ 0.5, 0.4, 0.5, 1.0 ];
			specArr[0]=[ 0.5, 0.4, 0.5, 1.0 ];
			lightArr[0].scaling=[ 0.05, 0.05, 0.05 ];
		} else{
			ambArr[0]=[ 0.0, 0.0, 0.0, 1.0 ];
			diffArr[0]=[ 0.0, 0.0, 0.0, 1.0 ];
			specArr[0]=[ 0.0, 0.0, 0.0, 1.0 ];
			lightArr[0].scaling=[ 0.0, 0.0, 0.0 ];
		}
		//document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
    };
	document.getElementById("toggleLight1").onclick = function () {
		
		if(	ambArr[1][0]==0.0 && ambArr[1][1]==0.0 && ambArr[1][2]==0.0 && ambArr[1][3]==1.0 &&
			diffArr[1][0]==0.0 && diffArr[1][1]==0.0 && diffArr[1][2]==0.0 && diffArr[1][3]==1.0 &&
			specArr[1][0]==0.0 && specArr[1][1]==0.0 && specArr[1][2]==0.0 && specArr[1][3]==1.0){
			ambArr[1]=[ 0.3, 0.35, 0.3, 1.0 ];
			diffArr[1]=[ 0.6, 0.8, 0.6, 1.0 ];
			specArr[1]=[ 0.6, 0.8, 0.6, 1.0 ];
			lightArr[1].scaling=[ 0.05, 0.05, 0.05 ];
		} else{
			ambArr[1]=[ 0.0, 0.0, 0.0, 1.0 ];
			diffArr[1]=[ 0.0, 0.0, 0.0, 1.0 ];
			specArr[1]=[ 0.0, 0.0, 0.0, 1.0 ];
			lightArr[1].scaling=[ 0.0, 0.0, 0.0 ];
		}
		//document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
    };
	document.getElementById("increaseDistanceLight0").onclick = function () {
		if(posArr[0][1] <= 10){
			posArr[0][1]+=0.25;
		}
		lightArr[0].translation = [posArr[0][0], posArr[0][1], posArr[0][2]];
		document.getElementById("light0Dbg").innerHTML = "Position: y="+posArr[0][1];
    };
	document.getElementById("decreaseDistanceLight0").onclick = function () {
		if(posArr[0][1] > 0.5){
			posArr[0][1]-=0.25;
		}
		lightArr[0].translation = [posArr[0][0], posArr[0][1], posArr[0][2]];
		document.getElementById("light0Dbg").innerHTML = "Position: y="+posArr[0][1];
    };
	document.getElementById("decreaseDistanceLight1").onclick = function () {
		if(posArr[1][1] < -0.5){
			posArr[1][1]+=0.25;
		}
		lightArr[1].translation = [posArr[1][0], posArr[1][1], posArr[1][2]];
		document.getElementById("light1Dbg").innerHTML = "Position: y="+posArr[1][1];
    };
	document.getElementById("increaseDistanceLight1").onclick = function () {
		if(posArr[1][1] >= -10){
			posArr[1][1]-=0.25;
		}
		lightArr[1].translation = [posArr[1][0], posArr[1][1], posArr[1][2]];
		document.getElementById("light1Dbg").innerHTML = "Position: y="+posArr[1][1];
    };
    render();
}

var l0Ang = 0;
var l1Ang = 0;
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	posArr[0][0] = Math.cos(l0Ang);
	posArr[0][2] = Math.sin(l0Ang);
	posArr[1][0] = Math.cos(l1Ang);
	posArr[1][2] = Math.sin(l1Ang);
	l0Ang = (Math.PI*2+l0Ang-0.04)%(Math.PI*2);
	l1Ang = (Math.PI*2+l1Ang+0.02)%(Math.PI*2);
	lightArr[0].translation = [posArr[0][0], posArr[0][1], posArr[0][2]];
	lightArr[1].translation = [posArr[1][0], posArr[1][1], posArr[1][2]];
	lightArr[0].render();
	lightArr[1].render();
	
	var log = "Rendering: ";
	gl.uniform4fv(lightPositionLoc, flatten(posArr));
	gl.uniform4fv(lightAmbientLoc, flatten(ambArr));
	gl.uniform4fv(lightDiffuseLoc, flatten(diffArr));
	gl.uniform4fv(lightSpecularLoc, flatten(specArr));
	for(var prop in shapes){
		shapes[prop].render();
		log+=prop+" ";
	}
	
	document.getElementById("renderDbg").innerHTML = log;
    requestAnimFrame( render );
}
