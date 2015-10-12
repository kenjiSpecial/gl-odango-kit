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
