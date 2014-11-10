precision highp float;
precision highp int;


#define MAX_DIR_LIGHTS 0
#define MAX_POINT_LIGHTS 0
#define MAX_SPOT_LIGHTS 0
#define MAX_HEMI_LIGHTS 0
#define MAX_SHADOWS 0

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform vec3 color;
uniform sampler2D texture;

varying vec3 vColor;

void main() {

	gl_FragColor = vec4( color * vColor, 1.0 );

	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );

}