var fs    = require('./shaders/shader-texture00/fragment.glsl');
var vs    = require('./shaders/shader-texture00/vertex.glsl');

if (typeof vs === "function"){
    vs = vs();
}
if (typeof fs === "function"){
    fs = fs();
}

var GLOdango = require('../src/main');
var quad2 = GLOdango.utils.QUAD2;

var canvas = document.createElement('canvas');
canvas.style.display = "block";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';

var textCanvas = document.createElement('canvas');
textCanvas.width = window.innerWidth;
textCanvas.height = window.innerHeight;
var textCtx = textCanvas.getContext('2d');

textCtx.fillRect( 100, 100, 100, 100);

document.body.appendChild(canvas);
var gl, quad2Buffer, texture, shaderProgram;

var tick = 0;

function onloaded(){
    gl = GLOdango.utils.initGL(canvas);
    quad2Buffer = new GLOdango.Buffer(gl, gl.ARRAY_BUFFER);
    quad2Buffer.update( quad2, gl.STATIC_DRAW );

    texture = new GLOdango.Texture(gl);
    texture.set(textCanvas);

    shaderProgram = new GLOdango.Program( gl, vs, fs);
    shaderProgram.attrib('aPosition');


    requestAnimationFrame(loop);
}



function loop(){
    texture.bind(0);

    var tint = [Math.sin(tick / 13), Math.cos(tick / 19), 0];
    shaderProgram.use()
        .uniform('tint', tint)
        .uniformi('image', 0)
        .attrib('aPosition', quad2Buffer, 2)
        .draw(gl.TRIANGLE_STRIP, quad2.length/2);


    tick++;
    requestAnimationFrame(loop);
}

var image = new Image();
image.src = './images/image00.jpg';

image.onload = onloaded;