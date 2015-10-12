
precision mediump float;

uniform sampler2D base;

void main() {
    float dis = distance(vec2(0.0, 0.0), gl_PointCoord.xy - 0.5);


    if ( dis < 0.5) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0 );
    }else {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0);
    }
}
