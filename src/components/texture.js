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
