"use strict";

var canvas;
var gl;

var vPosition;
var vTexCoord;
//var vColor;
var translationLoc; 
var rotationLoc;
var scalingLoc;
var colorLoc;
var tex0Loc;

var texture1;
var texture2;

var texSize = 512;
var numChecks = 8;
var c;
var image1 = new Uint8Array(4*texSize*texSize);
for ( var i = 0; i < texSize; i++ ) {
	for ( var j = 0; j <texSize; j++ ) {
		var patchx = Math.floor(i/(texSize/numChecks));
		var patchy = Math.floor(j/(texSize/numChecks));
		if(patchx%2 ^ patchy%2) c = 255;
		else c = 0;
		//c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
		image1[4*i*texSize+4*j] = c;
		image1[4*i*texSize+4*j+1] = c;
		image1[4*i*texSize+4*j+2] = c;
		image1[4*i*texSize+4*j+3] = 255;
	}
}
var image2;

function configureTextureRGB( image ) {
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    //gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
	return texture;
};

function configureTextureRGBA(image, width, height) {
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	return texture;
};

//sphere
var spherePointsStrips = [];
var sphereTextureCoords = [];
function colorSphere(longitudeCount, latitudeCount)
{	
	var dth = Math.PI/latitudeCount;
	var dph = (2*Math.PI)/longitudeCount;
	
	var vertices = [];
	var texCoords = [];
	for(var i = 0; i <= latitudeCount; i++){
		var y = 0.5*Math.cos(i*dth);
		var r = 0.5*Math.sin(i*dth);
				
		var line = [];
		var texLine = [];
		//log+="y="+y+" "+i/latitudeCount+"    |     ";
		for(var j = 0; j <= longitudeCount; j++){
			var x = r*Math.sin(j*dph);
			var z = r*Math.cos(j*dph);
			line.push(vec4(x, y, z, 1.0));
			
			var t = 1-i/latitudeCount;
			var s = 1-j/longitudeCount; 
			texLine.push(vec2(s, t));
			//log += "("+x+", "+z+")->["+t+"] ";			
		}
		//log += "<br/>";
		vertices.push(line);
		texCoords.push(texLine);
	}
	//document.getElementById("cenas").innerHTML = " "+log+"<br/>";
	
	for(var i = 0; i < latitudeCount; i++){
		var strip = [];
		var tex = [];
		for(var j = 0; j <= longitudeCount; j++){			
			strip.push(vertices[i][j]);
			strip.push(vertices[i+1][j]);
			
			tex.push(texCoords[i][j]);
			tex.push(texCoords[i+1][j]);
		}
		
		spherePointsStrips.push(strip);
		sphereTextureCoords.push(tex);
	}
};

function stripShape(gl, pointsStrips, textCoords)
{
	this.color=[ 0.9, 0.9, 0.9, 1.0 ];
	this.translation=[ 0, 0, 0 ];
	this.rotation=[ 0, 0, 0 ];
	this.scaling=[ 1.0, 1.0, 1.0 ];
	this.texture = 0;
	
	var verticesCountStrip=pointsStrips[0].length;
	this.vStrips = [];
	this.vTexture = [];
	
	
	for(var i = 0; i < pointsStrips.length; i++){
		var vStripBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vStripBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsStrips[i]), gl.STATIC_DRAW );
		this.vStrips.push(vStripBuffer);
		
		var vTextureBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vTextureBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(textCoords[i]), gl.STATIC_DRAW );
		this.vTexture.push(vTextureBuffer);
	}
	this.render = function(){

		gl.uniform3fv(translationLoc, this.translation);
		gl.uniform3fv(rotationLoc, this.rotation);
		gl.uniform3fv(scalingLoc, this.scaling);
		
		gl.uniform4fv(colorLoc, this.color);
		
		gl.uniform1i(tex0Loc, this.texture);
				
		for(var i = 0; i < this.vStrips.length; i++){
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vStrips[i] );
			gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vTexture[i] );
			gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, verticesCountStrip );
		}

	};
};
var shapesKeys = [];
var shapes = {};
var selectedShape = undefined;

var sphereCount=0;
window.onload = function init()
{
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
	
	vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    //gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
	 
	texture1 = configureTextureRGBA(image1, texSize, texSize);
	image2 = document.getElementById("texImage");
	texture2 = configureTextureRGB(image2);
	
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture1 );
	
	gl.activeTexture( gl.TEXTURE1 );
	gl.bindTexture( gl.TEXTURE_2D, texture2 );
	
	tex0Loc = gl.getUniformLocation( program, "Tex0" );
	
	translationLoc = gl.getUniformLocation(program, "translation");
    rotationLoc = gl.getUniformLocation(program, "theta");
	scalingLoc = gl.getUniformLocation(program, "scaling");
	
    //event listeners for buttons
	document.getElementById("chessTex").onclick = function () {
		selectedShape.texture = 0;
    };
	document.getElementById("worldTex").onclick = function () {
		selectedShape.texture = 1;
    };
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
		
		shapes[shapeKey] = new stripShape(gl, spherePointsStrips, sphereTextureCoords);
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t)
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		document.getElementById("chessTex").onclick();
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
