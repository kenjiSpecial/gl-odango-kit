

var fs    = require('./shaders/shader-texture00/fragment.glsl');
var vs    = require('./shaders/shader-texture00/vertex.glsl');
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
var gl, quad2Buffer, texture, shaderProgram;

var tick = 0;

function onloaded(){
    gl = KSOdango.utils.initGL(canvas);
    quad2Buffer = new KSOdango.Buffer(gl, gl.ARRAY_BUFFER);
    quad2Buffer.update( quad2, gl.STATIC_DRAW );

    texture = new KSOdango.Texture(gl);
    texture.set(image);

    shaderProgram = new KSOdango.Program( gl, vs, fs);
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