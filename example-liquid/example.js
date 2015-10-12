var BallFragmentShaderFunc = require('./shaders/ball/fragment.glsl');
var BallVertexShaderFunc   = require('./shaders/ball/vertex.glsl');
var IdentityVertexShaderfunc = require('./shaders/identity-vertex.glsl');
var ThresholdFramgentShaderFunc = require('./shaders/threshold/fragment.glsl');
var BlurShaderFunc = require('./shaders/blur/fragment.glsl');
var TextFragmentFunc = require('./shaders/text/fragment.glsl');
var TextVertexFunc   = require('./shaders/text/vertex.glsl');


var ballFragment      = BallFragmentShaderFunc();
var ballVertex        = BallVertexShaderFunc();
var thresholdFragment = ThresholdFramgentShaderFunc();
var identityVertex    = IdentityVertexShaderfunc();
var blurFragment      = BlurShaderFunc();
var textureFragment   = TextFragmentFunc();
var textureVertex     = TextVertexFunc();

var GLOdango = require('../src/main');

var quad2 = GLOdango.utils.QUAD2;


var canvas = document.createElement('canvas');
canvas.style.display = "block";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';

document.body.appendChild(canvas);

var textCanvas = document.createElement('canvas');
textCanvas.width = window.innerWidth;
textCanvas.height = window.innerHeight;

var textCtx = textCanvas.getContext('2d');
textCtx.font = "30px Arial";
textCtx.fillText("Hello World",10,50);
textCtx.fillRect(100, 100, 100, 100);



// -----------------------------

var gl, programs, buffers, fbo, textures;

gl = GLOdango.utils.initGL(canvas);

if (gl == null) {
    alert('Could not initialize WebGL!');
}

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.disable(gl.DEPTH_TEST);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


var canvasTexture = new GLOdango.Texture(gl);
canvasTexture.set(textCanvas);


var ballsProgram = new GLOdango.Program( gl, ballVertex, ballFragment );
ballsProgram.attrib('ball');
var threshold    = new GLOdango.Program( gl, identityVertex, thresholdFragment );
threshold.attrib('position');
var blur         = new GLOdango.Program( gl, identityVertex, blurFragment );
blur.attrib('position');
var texturePro   = new GLOdango.Program( gl, textureVertex, textureFragment );
texturePro.attrib('aPosition');


programs = {
    balls     : ballsProgram,
    threshold : threshold,
    blur      : blur,
    texture   : texturePro
};

buffers = {
    balls : new GLOdango.Buffer(gl),
    quad  : new GLOdango.Buffer(gl, gl.ARRAY_BUFFER)
};

buffers.quad.update( quad2, gl.STATIC_DRAW );


fbo = gl.createFramebuffer();
textures = {
    front : createTexture(),
    back  : createTexture()
};

var scaleX, scaleY;

function createTexture(){
    var tex = gl.createTexture();
    scaleX = GLOdango.utils.highest2(gl.canvas.width);
    scaleY = GLOdango.utils.highest2(gl.canvas.height);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scaleX, scaleY, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    return tex;
}

function swap(){
    var temp = textures.front;
    textures.front = textures.back;
    textures.back = temp;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.bindTexture(gl.TEXTURE_2D, textures.back);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.back, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, textures.front);
}

function render(){
    var pos = new Float32Array(4);
    pos[0] = 0.0;
    pos[1] = 0.0;
    pos[2] = 0.0;
    pos[3] = 100 / (window.innerHeight/2);

    buffers.balls.update(pos);

    canvasTexture.bind(0);

    swap();

    programs.texture.use()
        .uniformi('image', 0)
        .attrib('aPosition', buffers.quad, 2)
        .draw(gl.TRIANGLE_STRIP, 4);


    swap();

    programs.balls.use()
        .attrib('ball', buffers.balls, 2)
        .uniform('base', 0, true)
        .uniform('size', 100)
        .draw(gl.POINTS, pos.length/2);
    swap();


    programs.blur.use()
        .attrib('position', buffers.quad, 2)
        .uniform('base', 0, true)
        .uniform('scale', [scaleX, scaleY])
        .uniform('dir', [0.0, 1.0])
        .draw(gl.TRIANGLE_STRIP, 4);

    swap();

    programs.blur
        .uniform('dir', [1.0, 0.0])
        .draw(gl.TRIANGLE_STRIP, 4);

    swap();


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    programs.threshold.use()
        .attrib('position', buffers.quad, 2)
        .uniform('base', 0, true)
        .uniform('scale', [scaleX, scaleY])
        .uniform('copy', false, true)
        .uniform('threshold', 0.4)
        .draw(gl.TRIANGLE_STRIP, 4);


    requestAnimationFrame(render);
}

//requestAnimationFrame(render);
render();
