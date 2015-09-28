(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/buffer.js":[function(require,module,exports){
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

},{}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/program.js":[function(require,module,exports){
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

},{}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/texture.js":[function(require,module,exports){
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

},{}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/utils.js":[function(require,module,exports){
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

module.exports = {
    initGL : initGL,
    QUAD2  : quad2
};

},{}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/examples/shaders/shader-texture00/fragment.glsl":[function(require,module,exports){
module.exports = function parse(params){
      var template = "precision mediump float; \n" +
" \n" +
"varying vec2 coord; \n" +
" \n" +
"uniform sampler2D image; \n" +
"uniform vec3 tint; \n" +
" \n" +
"void main(void) { \n" +
"    gl_FragColor = texture2D(image, coord) + vec4(tint, 0.); \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/examples/shaders/shader-texture00/vertex.glsl":[function(require,module,exports){
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

},{}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/examples/texture-example00.js":[function(require,module,exports){


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
},{"../components/utils":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/utils.js","../main":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/main.js","./shaders/shader-texture00/fragment.glsl":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/examples/shaders/shader-texture00/fragment.glsl","./shaders/shader-texture00/vertex.glsl":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/examples/shaders/shader-texture00/vertex.glsl"}],"/Users/kenji-special/project/2015/09/gl-odango-kit/src/main.js":[function(require,module,exports){
module.exports = {
    utils   : require('./components/utils'),
    Program : require('./components/program'),
    Buffer  : require('./components/buffer'),
    Texture : require('./components/texture')
};

},{"./components/buffer":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/buffer.js","./components/program":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/program.js","./components/texture":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/texture.js","./components/utils":"/Users/kenji-special/project/2015/09/gl-odango-kit/src/components/utils.js"}]},{},["/Users/kenji-special/project/2015/09/gl-odango-kit/src/examples/texture-example00.js"]);
