uniform sampler2D read;

uniform vec2 gridSize;

uniform vec3 color;
uniform vec2 point;
uniform float radius;

// Gaussian function 
float gauss(vec2 p, float r)
{
    return exp(-dot(p, p) / r);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / gridSize.xy;
    vec2 coord = point.xy - gl_FragCoord.xy;    
    
    // Gaussian-shaped user interaction
    vec3 splat = color * gauss(coord, gridSize.x * radius);

    gl_FragColor = vec4(texture2D(read, uv).xyz + splat, 1.0);
}
