"use strict";

var canvas;
var gl;

var maxNumVertices  = 1000000;
var index = 0;
var first;
var mousePressed = false;

var sizeof_gl_float = 4; //bytes

var t1, t2;

var cIndex = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 2*sizeof_gl_float*maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4*sizeof_gl_float*maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
       cIndex = m.selectedIndex;
    });

    canvas.addEventListener("mousedown", function(event){
		 mousePressed = true;
		 first = true;
    } );

	canvas.addEventListener("mouseup", function(event){
		mousePressed = false;
    } );

	canvas.addEventListener("mousemove", function(event){
		if(mousePressed && index<maxNumVertices){
			if(first) {
			  first = false;
			  t2 = vec2(2*event.clientX/canvas.width-1, 2*(canvas.height-event.clientY)/canvas.height-1);
			}
			else {
			  t1 = t2;
			  t2 = vec2(2*event.clientX/canvas.width-1, 2*(canvas.height-event.clientY)/canvas.height-1);
			
			  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
			  gl.bufferSubData(gl.ARRAY_BUFFER, 2*sizeof_gl_float*index, flatten(t1));
			  gl.bufferSubData(gl.ARRAY_BUFFER, 2*sizeof_gl_float*(index+1), flatten(t2));

			  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
			

			  var t = colors[cIndex];

			  gl.bufferSubData(gl.ARRAY_BUFFER, 4*sizeof_gl_float*index, flatten(t));
			  gl.bufferSubData(gl.ARRAY_BUFFER, 4*sizeof_gl_float*(index+1), flatten(t));

			  index += 2;
			}
		}
	});
    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawArrays( gl.LINES, 0, index );

    window.requestAnimFrame(render);

}
