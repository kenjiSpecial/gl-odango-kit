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
