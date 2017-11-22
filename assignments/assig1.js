"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;
var theta = 0.0;
var thetaTwisk;

var bufferId;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
	
	// Load twisk shader
	var programTwisk = initShaders( gl, "vertex-shader-twisk", "fragment-shader" );
    gl.useProgram( programTwisk );
	
	// Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(4, 6), gl.STATIC_DRAW );

	// Associate out twisk shader variables with our data buffer
	
	var vPositionTwisk = gl.getAttribLocation( programTwisk, "vPosition" );
    gl.vertexAttribPointer( vPositionTwisk, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionTwisk );
	
	thetaTwisk = gl.getUniformLocation( programTwisk, "theta" );

	document.getElementById("slider").onchange = function() {
		numTimesToSubdivide = document.getElementById("slider").value;
		render();
    };

	document.getElementById("sliderTheta").onchange = function() {
		theta = document.getElementById("sliderTheta").value;
		render();
    };
	
    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion

    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
		divideTriangle( ac, ab, bc, count );
    }
}

window.onload = init;

function render()
{
	var vertices = [
        vec2( -0.7, -0.7 ),
        vec2(  0,  0.7 ),
        vec2(  0.7, -0.7 )
    ];
    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
	gl.uniform1f(thetaTwisk, theta);
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
	//requestAnimFrame(render);
}
