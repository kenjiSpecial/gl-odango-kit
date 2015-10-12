(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../src/main":13,"./shaders/ball/fragment.glsl":2,"./shaders/ball/vertex.glsl":3,"./shaders/blur/fragment.glsl":4,"./shaders/identity-vertex.glsl":5,"./shaders/text/fragment.glsl":6,"./shaders/text/vertex.glsl":7,"./shaders/threshold/fragment.glsl":8}],2:[function(require,module,exports){
module.exports = function parse(params){
      var template = " \n" +
"precision mediump float; \n" +
" \n" +
"uniform sampler2D base; \n" +
" \n" +
"void main() { \n" +
"    float dis = distance(vec2(0.0, 0.0), gl_PointCoord.xy - 0.5); \n" +
" \n" +
" \n" +
"    if ( dis < 0.5) { \n" +
"        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0 ); \n" +
"    }else { \n" +
"        gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0); \n" +
"    } \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],3:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#ifdef GL_ES \n" +
"precision mediump float; \n" +
"#endif \n" +
" \n" +
"attribute vec2 ball; \n" +
"uniform float size; \n" +
"uniform sampler2D base; \n" +
" \n" +
" \n" +
" \n" +
"void main() { \n" +
"    gl_Position = vec4(ball, 0.0, 1.0); \n" +
"    gl_PointSize = size; \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],4:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#ifdef GL_ES \n" +
"precision mediump float; \n" +
"#endif \n" +
" \n" +
"uniform sampler2D base; \n" +
"uniform vec2 scale; \n" +
"uniform vec2 dir; \n" +
" \n" +
"void main() { \n" +
"    vec2 p = gl_FragCoord.xy / scale; \n" +
"    gl_FragColor = \n" +
"        texture2D(base, p + dir * vec2(-9.0, -9.0) / scale) * 0.02433 + \n" +
"        texture2D(base, p + dir * vec2(-8.0, -8.0) / scale) * 0.03081 + \n" +
"        texture2D(base, p + dir * vec2(-7.0, -7.0) / scale) * 0.03795 + \n" +
"        texture2D(base, p + dir * vec2(-6.0, -6.0) / scale) * 0.04546 + \n" +
"        texture2D(base, p + dir * vec2(-5.0, -5.0) / scale) * 0.05297 + \n" +
"        texture2D(base, p + dir * vec2(-4.0, -4.0) / scale) * 0.06002 + \n" +
"        texture2D(base, p + dir * vec2(-3.0, -3.0) / scale) * 0.06615 + \n" +
"        texture2D(base, p + dir * vec2(-2.0, -2.0) / scale) * 0.07090 + \n" +
"        texture2D(base, p + dir * vec2(-1.0, -1.0) / scale) * 0.07392 + \n" +
"        texture2D(base, p + dir * vec2( 0.0,  0.0) / scale) * 0.07495 + \n" +
"        texture2D(base, p + dir * vec2( 1.0,  1.0) / scale) * 0.07392 + \n" +
"        texture2D(base, p + dir * vec2( 2.0,  2.0) / scale) * 0.07090 + \n" +
"        texture2D(base, p + dir * vec2( 3.0,  3.0) / scale) * 0.06615 + \n" +
"        texture2D(base, p + dir * vec2( 4.0,  4.0) / scale) * 0.06002 + \n" +
"        texture2D(base, p + dir * vec2( 5.0,  5.0) / scale) * 0.05297 + \n" +
"        texture2D(base, p + dir * vec2( 6.0,  6.0) / scale) * 0.04546 + \n" +
"        texture2D(base, p + dir * vec2( 7.0,  7.0) / scale) * 0.03795 + \n" +
"        texture2D(base, p + dir * vec2( 8.0,  8.0) / scale) * 0.03081 + \n" +
"        texture2D(base, p + dir * vec2( 9.0,  9.0) / scale) * 0.02433; \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],5:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#ifdef GL_ES \n" +
"precision mediump float; \n" +
"#endif \n" +
" \n" +
"attribute vec2 position; \n" +
" \n" +
"void main() { \n" +
"    gl_Position = vec4(position, 0, 1.0); \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],6:[function(require,module,exports){
module.exports = function parse(params){
      var template = "precision mediump float; \n" +
" \n" +
"varying vec2 coord; \n" +
" \n" +
"uniform sampler2D image; \n" +
" \n" +
"void main(void) { \n" +
"    gl_FragColor = texture2D(image, coord); \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],7:[function(require,module,exports){
module.exports = function parse(params){
      var template = "precision mediump float; \n" +
" \n" +
"attribute vec2 aPosition; \n" +
"varying vec2 coord; \n" +
" \n" +
"void main() { \n" +
"   coord = (aPosition* vec2(1, -1) + 1.0) / 2.0; \n" +
"   gl_Position = vec4(aPosition, 0, 1); \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],8:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#ifdef GL_ES \n" +
"precision mediump float; \n" +
"#endif \n" +
" \n" +
"uniform sampler2D base; \n" +
"uniform vec2 scale; \n" +
"uniform float threshold; \n" +
"uniform int copy; \n" +
" \n" +
"void main() { \n" +
"    vec4 value = texture2D(base, gl_FragCoord.xy / scale); \n" +
"    if (copy != 0) { \n" +
"        gl_FragColor = value; \n" +
"    } else if (value.r > 0.5) { \n" +
"        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); \n" +
"    } else { \n" +
"        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); \n" +
"    } \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],9:[function(require,module,exports){
function Buffer( gl, target ){
    this.gl = gl;
    this.buffer = gl.createBuffer();
    this.target = (target == null? gl.ARRAY_BUFFER : target);
    this.size = -1;
}

Buffer.prototype.bind = function(){
    this.gl.bindBuffer(this.target, this.buffer);
    return this;
};

Buffer.prototype.update = function(data, usage){
    var gl = this.gl;
    if(data instanceof Array){
        data = new Float32Array(data);
    }

    usage = usage == null ? gl.STATIC_DRAW : usage;

    this.bind();
    if (this.size !== data.byteLength) {
        gl.bufferData(this.target, data, usage);
        this.size = data.byteLength;
    } else {
        gl.bufferSubData(this.target, 0, data);
    }
    return this;

};




module.exports = Buffer;

},{}],10:[function(require,module,exports){
function Program( gl, vertex, fragment ){
    this.gl = gl;
    this.program = gl.createProgram();
    this.gl.attachShader(this.program, this.createShader( gl.VERTEX_SHADER, vertex ));
    this.gl.attachShader(this.program, this.createShader( gl.FRAGMENT_SHADER, fragment ));
    this.gl.linkProgram(this.program);
    if(!gl.getProgramParameter(this.program, this.gl.LINK_STATUS)){
        throw new Error(gl.getProgramInfoLog(this.program));
    }
    this.vars = {};
}

Program.prototype.createShader = function(type, source){
    var gl = this.gl;
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;
    }else{
        throw new Error(gl.getShaderInfoLog(shader));
    }
};

Program.prototype.use = function(){
    this.gl.useProgram(this.program);
    return this;
};

Program.prototype.attrib = function(name, value, size, stride){
    var gl = this.gl;

    if(value == null){
        this.vars[name] = gl.getAttribLocation(this.program, name);
    } else {
        if(this.vars[name] == null) this.attrib(name);
        value.bind();
        gl.enableVertexAttribArray(this.vars[name]);
        gl.vertexAttribPointer(this.vars[name], size, gl.FLOAT, false, stride == null ? 0: stride, 0);
    }

    return this;
};


Program.prototype.uniform = function(name, value, i){
    if(value == null){
        this.vars[name] = this.gl.getUniformLocation(this.program, name);
    }else{
        if(this.vars[name] == null) this.uniform(name);
        var v = this.vars[name];
        if(isArray(value)){
            var method = 'uniform' + value.length + (i ? 'i' : 'f') + 'v';
            this.gl[method](v, value);
        }else if(typeof value === 'number' || typeof value === 'boolean'){
            if (i) {
                this.gl.uniform1i(v, value);
            } else {
                this.gl.uniform1f(v, value);
            }
        }else{
            throw new Error('Invalid uniform value: ' + value);
        }

    }

    return this;
};


/**
 * Like the uniform() method, but using integers.
 */
Program.prototype.uniformi = function(name, value) {
    return this.uniform(name, value, true);
};

Program.prototype.draw = function(mode, count, type){
    var gl = this.gl;

    if (type == null) {
        gl.drawArrays(mode, 0, count);
    } else {
        gl.drawElements(mode, count, type, 0);
    }
    if (gl.getError() !== gl.NO_ERROR) {
        throw new Error('WebGL rendering error');
    }
    return this;
};

var isArray = function(object) {
    var name = Object.prototype.toString.apply(object, []),
        re = / (Float(32|64)|Int(16|32|8)|Uint(16|32|8(Clamped)?))?Array]$/;
    return re.exec(name) != null;
};

module.exports = Program;

},{}],11:[function(require,module,exports){
function Texture(gl, _format, _wrap, _filter){
    this.gl = gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    var wrap = _wrap == null ? gl.CLAMP_TO_EDGE : _wrap;
    var filter = filter == null ? gl.LINEAR : _filter;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    this.format = _format == null ? gl.RGBA : _format;
}

Texture.prototype.bind = function(unit){
    var gl = this.gl;
    if(unit != null){
        gl.activeTexture(gl.TEXTURE0 + unit);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    return this;
};

Texture.prototype.blank = function(width, height){
    var gl = this.gl;
    this.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, gl.UNSIGNED_BYTE, null);
    return this;
};

Texture.prototype.set = function( source, width, height ) {
    var gl = this.gl;
    this.bind();
    if (source instanceof Array) source = new Uint8Array(source);
    if (width != null || height != null) {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
            width, height, 0, this.format,
            gl.UNSIGNED_BYTE, source);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
            this.format, gl.UNSIGNED_BYTE, source);
    }
    return this;
};

module.exports = Texture;

},{}],12:[function(require,module,exports){
/**
 *
 * @param {Canvas} canvas
 * @return {gl}
 */
function initGL(canvas){
    try{
        gl = canvas.getContext("webgl") || canvas.getContext('experimental-webgl');
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }catch(e){}

    return gl;
}

/**
 * To be used in a vec2 GL_TRIANGLE_STRIP draw.
 * @type {Float32Array}
 * @constant
 */

var quad2 = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);


/**
 *
 * @param  {number} x A dimension
 * @return {number} The smallest power of 2 >= x
 */

function highest2(x){
    return Math.pow(2, Math.ceil(Math.log(x) / Math.LN2));
};

module.exports = {
    initGL   : initGL,
    QUAD2    : quad2,
    highest2 : highest2
};

},{}],13:[function(require,module,exports){
module.exports = {
    utils   : require('./components/utils'),
    Program : require('./components/program'),
    Buffer  : require('./components/buffer'),
    Texture : require('./components/texture')
};

},{"./components/buffer":9,"./components/program":10,"./components/texture":11,"./components/utils":12}]},{},[1]);
