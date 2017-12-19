uniform sampler2D read;

uniform vec3 bias;
uniform vec3 scale;

varying vec2 texCoord;

const float PI = 3.1415926535897932384626433832795;

vec3 hsv2rgb(vec3 c) 
{
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y)*PI/2.0 : atan(y, x);
}
vec2 rec2pol(vec2 vec)
{
    float mag = sqrt(vec.x*vec.x + vec.y*vec.y);
    float dir = (atan2(-vec.y, -vec.x) / PI) * 0.5 + 0.5;
    return vec2(dir, mag);
}
void main()
{
    vec2 pol = rec2pol(texture2D(read, texCoord).xy);
    gl_FragColor = vec4(hsv2rgb(vec3(pol.x, 1.0, pol.y)),1.0);
}
