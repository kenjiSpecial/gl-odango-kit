precision mediump float;

varying vec2 coord;

uniform sampler2D image;

void main(void) {
    gl_FragColor = texture2D(image, coord);
}