uniform sampler2D read;

uniform vec3 bias;
uniform vec3 scale;

varying vec2 texCoord;

void main()
{
    gl_FragColor = vec4(bias + scale * texture2D(read, texCoord).x, 1.0);
}
