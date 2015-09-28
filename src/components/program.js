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
