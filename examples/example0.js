var fs    = require('./shaders/shader00/fragment.glsl');
var vs    = require('./shaders/shader00/vertex.glsl');
var quad2 = require('../components/utils').QUAD2;



if (typeof vs === "function"){
    vs = vs();
}
if (typeof fs === "function"){
    fs = fs();
}

var KSOdango = require('../main');

var canvas = document.createElement('canvas');
canvas.style.display = "block";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';


document.body.appendChild(canvas);


var gl = KSOdango.utils.initGL(canvas);
var quad2Buffer = new KSOdango.Buffer(gl, gl.ARRAY_BUFFER);
quad2Buffer.update( quad2, gl.STATIC_DRAW );

var shaderProgram = new KSOdango.Program( gl, vs, fs);
shaderProgram.attrib('aPosition');

shaderProgram.use()
    .attrib('aPosition', quad2Buffer, 2)
    .draw(gl.TRIANGLE_STRIP, quad2.length/2);






