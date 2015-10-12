precision mediump float;

attribute vec2 aPosition;
varying vec2 coord;

void main() {
   coord = (aPosition* vec2(1, -1) + 1.0) / 2.0;
   gl_Position = vec4(aPosition, 0, 1);
}