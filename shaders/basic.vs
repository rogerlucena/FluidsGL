varying vec2 texCoord;

// Simple orthogonal projection vertex shader
void main()
{
    texCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
