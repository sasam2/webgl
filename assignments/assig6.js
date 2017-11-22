"use strict";

var canvas;
var gl;

var vPosition;
//var vColor;
var translationLoc; 
var rotationLoc;
var scalingLoc;
var colorLoc;
var framebuffer;

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
	this.render = function(iColor, iDrawingMode){
		
		if(iColor==undefined || iColor==null){
			iColor = this.color;
		}
		
		if(iDrawingMode==undefined || iDrawingMode==null){
			iDrawingMode = gl.TRIANGLE_STRIP;
		}
	
		gl.uniform3fv(translationLoc, this.translation);
		gl.uniform3fv(rotationLoc, this.rotation);
		gl.uniform3fv(scalingLoc, this.scaling);
				
		gl.uniform4fv(colorLoc, iColor);
		for(var i = 0; i < this.vStrips.length; i++){
			gl.bindBuffer( gl.ARRAY_BUFFER, this.vStrips[i] );
			gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( iDrawingMode, 0, verticesCountStrip );
		}
	};
};

var shapesKeys = [];
var shapes = {};
var shapesColorIds = {};
var selectedShape = undefined;

var shiftPressed=false;
var pickedShape = undefined;

var initCoords=undefined;
var pickedShapeInitTranslation=undefined;

var initThetaX = undefined;
var initThetaY = undefined;
var initThetaZ = undefined;
var pickedShapeInitRotation=undefined;

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
	
	//create texture and framebuffer
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

	framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

		
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
		shapesColorIds[shapeKey]=[sphereCount*1.0/256.0, 0.0, 0.0, 0.0];
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t);
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		selectedShape.render();		
    };
	document.getElementById("newCone").onclick = function () {
		coneCount++;
		var shapeKey = "cone"+coneCount;
		shapesKeys.push(shapeKey);
		
		shapes[shapeKey] = new stripShape(gl, conePointsStrips);
		shapesColorIds[shapeKey]=[0.0, coneCount*1.0/256.0, 0.0, 0.0];
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t);
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		selectedShape.render();
    };
	document.getElementById("newCilinder").onclick = function () {
		cilinderCount++;
		var shapeKey = "cilinder"+cilinderCount;
		shapesKeys.push(shapeKey);
		
		shapes[shapeKey] = new stripShape(gl, cilinderPointsStrips);
		shapesColorIds[shapeKey]=[0.0, 0.0, cilinderCount*1.0/256.0, 0.0];
		
		var s = document.getElementById("shape");
		var t = document.createElement("option")
		t.value = shapeKey;
		t.textContent = shapeKey;
		s.appendChild(t);
		s.value = shapeKey;
		document.getElementById("shape").onchange();
		selectedShape.render();		
    };
	document.getElementById("translateX").value = 0;
    document.getElementById("translateX").onchange = function () {
		selectedShape.translation[0] = Number(document.getElementById("translateX").value);
		gl.uniform3fv(translationLoc, selectedShape.translation);
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		selectedShape.render();
    };
	document.getElementById("translateY").value = 0;
    document.getElementById("translateY").onchange = function () {
        selectedShape.translation[1] = Number(document.getElementById("translateY").value);
		gl.uniform3fv(translationLoc, selectedShape.translation);
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		selectedShape.render();
    };
	document.getElementById("translateZ").value = 0;
	document.getElementById("translateZ").onchange = function () {
        selectedShape.translation[2] =  Number(document.getElementById("translateZ").value);
		gl.uniform3fv(translationLoc, selectedShape.translation);
		document.getElementById("translateDbg").innerHTML = "Translation: x="+selectedShape.translation[0]+" y="+selectedShape.translation[1]+" z="+selectedShape.translation[2];
		selectedShape.render();
    };
	document.getElementById("rotateX").value = 0;
	document.getElementById("rotateX").onchange = function () {
        selectedShape.rotation[0] = Number(document.getElementById("rotateX").value);
		gl.uniform3fv(rotationLoc, selectedShape.rotation);
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		selectedShape.render();
    };
	document.getElementById("rotateY").value = 0;
	document.getElementById("rotateY").onchange = function () {
        selectedShape.rotation[1] = Number(document.getElementById("rotateY").value);
		gl.uniform3fv(rotationLoc, selectedShape.rotation);
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		selectedShape.render();
    };
	document.getElementById("rotateZ").value = 0;
	document.getElementById("rotateZ").onchange = function () {
        selectedShape.rotation[2] = Number(document.getElementById("rotateZ").value);
		gl.uniform3fv(rotationLoc, selectedShape.rotation);
		document.getElementById("rotateDbg").innerHTML = "Rotation: x="+selectedShape.rotation[0]+" y="+selectedShape.rotation[1]+" z="+selectedShape.rotation[2];
		selectedShape.render();
    };
	document.getElementById("scaleX").value = 1.0;
	document.getElementById("scaleX").onchange = function () {
        selectedShape.scaling[0] = Number(document.getElementById("scaleX").value);
		gl.uniform3fv(scalingLoc, selectedShape.scaling);
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		selectedShape.render();
    };
	document.getElementById("scaleY").value = 1.0;
	document.getElementById("scaleY").onchange = function () {
        selectedShape.scaling[1] = Number(document.getElementById("scaleY").value);
		gl.uniform3fv(scalingLoc, selectedShape.scaling);
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		selectedShape.render();
    };
	document.getElementById("scaleZ").value = 1.0;
	document.getElementById("scaleZ").onchange = function () {
        selectedShape.scaling[2] = Number(document.getElementById("scaleZ").value);
		gl.uniform3fv(scalingLoc, selectedShape.scaling);
		document.getElementById("scaleDbg").innerHTML = "Scaling: x="+selectedShape.scaling[0]+" y="+selectedShape.scaling[1]+" z="+selectedShape.scaling[2];
		selectedShape.render();
    };
	document.getElementById("colorR").value = 0.0;
	document.getElementById("colorR").onchange = function () {
		var cr=Number(document.getElementById("colorR").value);
		selectedShape.color[0]=cr;
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		selectedShape.render();
    };
	document.getElementById("colorG").value = 0.0;
	document.getElementById("colorG").onchange = function () {
		var cg=Number(document.getElementById("colorG").value);
		selectedShape.color[1]=cg;
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		selectedShape.render();
    };
	document.getElementById("colorB").value = 0.0;
	document.getElementById("colorB").onchange = function () {
		var cb=Number(document.getElementById("colorB").value);
		selectedShape.color[2]=cb;
		document.getElementById("colorDbg").innerHTML = "Color: r="+selectedShape.color[0]+" g="+selectedShape.color[1]+" b="+selectedShape.color[2];
		selectedShape.render();
    };
    
	canvas.addEventListener("mousedown", function(event){
		//Determine pixel coordinates
		var x = event.clientX;
		var y = canvas.height-event.clientY;
		
		//Determine scene coordinates
		var scX = 2*x/canvas.width-1;
		var scY = 2*y/canvas.height-1;
		
		//Render scene to offscreen buffer, using a different color for each object
		var pixColor = new Uint8Array(4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		for(var prop in shapes){
			shapes[prop].render(shapesColorIds[prop]);
		}

		//Determine selected shape, by checking color
		/*color code: red -> sphere; green -> cone; blue -> cilinder. color value = id.*/
		var pickedShapeKey = undefined;
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixColor);
		if(pixColor[0]!=0 && pixColor[1]==0 && pixColor[2]==0 && pixColor[3]==0){
			pickedShapeKey = "sphere"+pixColor[0];
		} else if(pixColor[0]==0 && pixColor[1]!=0 && pixColor[2]==0 && pixColor[3]==0){
			pickedShapeKey = "cone"+pixColor[1];
		} else if(pixColor[0]==0 && pixColor[1]==0 && pixColor[2]!=0 && pixColor[3]==0){
			pickedShapeKey = "cilinder"+pixColor[2];
		} else {
			//ERROR! Picking color value not valid! (Probably background)
			return;
		}
		// **
		pickedShape = shapes[pickedShapeKey];
		
		if(shiftPressed!=true){	//Translation
		
			// ** Save init shape translation
			pickedShapeInitTranslation = [0.0, 0.0, 0.0];
			pickedShapeInitTranslation[0]=pickedShape.translation[0];
			pickedShapeInitTranslation[1]=pickedShape.translation[1];
			pickedShapeInitTranslation[2]=pickedShape.translation[2];
			
			// ** Save scene coordinates of mouseclick
			initCoords = [scX, scY, 0.0, 1.0];
		
			document.getElementById("pickingDbg").innerHTML = "Picked shape: "+pickedShapeKey;
			
		} else { // Rotation
			
			//Check if point lies inside 0.5 radius sphere
			var shapeX = scX - pickedShape.translation[0];
			var shapeY = scY - pickedShape.translation[1];
			if(shapeX*shapeX+shapeY*shapeY<=0.5*0.5){
				
				//Calculate x and z rotation angles
				var shapeZ = -Math.sqrt(0.5*0.5-shapeX*shapeX-shapeY*shapeY);

				initThetaX = Math.atan(shapeZ/shapeY)/Math.PI*180;
				if(shapeY<0.0){
					initThetaX += 180.0;
				}
				initThetaY = Math.atan(shapeX/shapeZ)/Math.PI*180;
				if(shapeZ<0.0){
					initThetaY += 180.0;
				}
				initThetaZ = Math.atan(shapeY/shapeX)/Math.PI*180;
				if(shapeX<0.0){
					initThetaZ += 180.0;
				}
				
				pickedShapeInitRotation=[0.0, 0.0, 0.0];
				pickedShapeInitRotation[0]=pickedShape.rotation[0];
				pickedShapeInitRotation[1]=pickedShape.rotation[1];
				pickedShapeInitRotation[2]=pickedShape.rotation[2];
				
			} else {
				// Do nothing
			}
			
		}

		
    } );
	canvas.addEventListener("mousemove", function(event){
		if(pickedShape != undefined && pickedShape != null){ //If a shape was picked
			
			//Determine pixel coordinates
			var x = event.clientX;
			var y = canvas.height-event.clientY;
			
			//Determine scene coordinates
			var scX = 2*x/canvas.width-1;
			var scY = 2*y/canvas.height-1;
			
			if(shiftPressed!=true){	//Translation	
				//Determine scene coordinates of current mouseposition
				var currentCoords = [scX, scY, 0.0, 1.0];
				//Calculate translation vector
				var translation = [currentCoords[0]-initCoords[0], currentCoords[1]-initCoords[1], currentCoords[2]-initCoords[2]];
				//Update pickedshape translation
				pickedShape.translation[0] = pickedShapeInitTranslation[0]+translation[0];
				pickedShape.translation[1] = pickedShapeInitTranslation[1]+translation[1];
				pickedShape.translation[2] = pickedShapeInitTranslation[2]+translation[2];
				//If pickedshape is selected on controls menu, update controls values to keep coherence
				if(pickedShape===selectedShape){
					document.getElementById("translateX").value = pickedShape.translation[0];
					document.getElementById("translateY").value = pickedShape.translation[1];
					document.getElementById("translateZ").value = pickedShape.translation[2];
					document.getElementById("translateDbg").innerHTML = "Translation: x="+pickedShape.translation[0]+" y="+pickedShape.translation[1]+" z="+pickedShape.translation[2];
				}
			
			} else { // Rotation
				
				//Check if point lies inside 0.5 radius sphere
				var shapeX = scX - pickedShape.translation[0];
				var shapeY = scY - pickedShape.translation[1];
				if(shapeX*shapeX+shapeY*shapeY<=0.5*0.5){
					
					//Calculate x and z rotation angles
					var shapeZ = -Math.sqrt(0.5*0.5-shapeX*shapeX-shapeY*shapeY);

					var thetaX = Math.atan(shapeZ/shapeY)/Math.PI*180;
					if(shapeY<0.0){
						thetaX += 180.0;
					}
					var thetaY = Math.atan(shapeX/shapeZ)/Math.PI*180;
					if(shapeZ<0.0){
						thetaY += 180.0;
					}
					var thetaZ = Math.atan(shapeY/shapeX)/Math.PI*180;
					if(shapeX<0.0){
						thetaZ += 180.0;
					}
				
					var dThX = thetaX-initThetaX;
					var dThY = thetaY-initThetaY;
					var dThZ = thetaZ-initThetaZ;
									
					pickedShape.rotation[0] = (360.0 + pickedShapeInitRotation[0] + dThX)%360;
					pickedShape.rotation[1] = (360.0 + pickedShapeInitRotation[1] + dThY)%360;
					//pickedShape.rotation[2] = (360.0 + pickedShapeInitRotation[2] + dThZ)%360;
					
					//If pickedshape is selected on controls menu, update controls values to keep coherence
					if(pickedShape===selectedShape){
						document.getElementById("rotateX").value = pickedShape.rotation[0];
						document.getElementById("rotateY").value = pickedShape.rotation[1];
						//document.getElementById("rotateZ").value = pickedShape.rotation[2];
					}
					
					document.getElementById("pickingDbg").innerHTML = " dThX="+dThX+"<br/>"+
																	  " dThY="+dThY+"<br/>"+
																	  " dThZ="+dThZ;
				}
			}
		}
	});
	canvas.addEventListener("mouseup", function(event){
		//** Reset global variables used on picking
		pickedShape = undefined;
		pickedShapeInitTranslation = undefined;
		initCoords = undefined;
		pickedShapeInitRotation=undefined;
		initThetaY=undefined;
		initThetaZ=undefined;
		
		document.getElementById("pickingDbg").innerHTML = "Picked shape: ";
    } );
	
	document.addEventListener("keydown", function(event){
		if(event.keyCode==16){
			shiftPressed=true;
			//document.getElementById("pickingDbg").innerHTML = "shiftPressed="+shiftPressed;
		}
	});
	document.addEventListener("keyup", function(event){
		if(event.keyCode==16){
			shiftPressed=false;
			//document.getElementById("pickingDbg").innerHTML = "shiftPressed="+shiftPressed;
		}
	});
	
	render();
}

function render()
{
    var log = "Rendering: ";
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	for(var prop in shapes){
		shapes[prop].render();
		shapes[prop].render([1.0, 1.0, 1.0, 1.0], gl.LINE_STRIP);
		log+=prop+" ";
	}
		
	document.getElementById("renderDbg").innerHTML = log;
    requestAnimFrame( render );
}
