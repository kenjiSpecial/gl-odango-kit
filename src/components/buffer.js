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
