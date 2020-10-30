precision highp float;

uniform float frame;

uniform mat4 view;

varying vec4 ponto;
varying vec4 norm;

void main(){
    // posição dos pontos de luz em relação à origem
    vec4 lightA = vec4(6.0, -10.0, 3.0, 1.0);
    vec4 lightB = vec4(-6.0, 1.0, 3.0, 1.0);
    float shininess = 100.0;

    // vetor de direção (LA, LB) entre a posição do fragmento (ponto) e os pontos de luz
    vec4 LA = normalize(lightA - ponto);
    vec4 LB = normalize(lightB - ponto);

    // vetor de direção normal (direção do plano do fragmento) 
    // lado da face - ex: topo, frente 
    vec4 N = normalize(norm);

    // vetor de direção entre a posição do fragmento (ponto) e o olho do observador 
    vec4 P = normalize(view * -ponto);

    // vetor de bissetriz (direção média) entre a direção da luz e do olho
    vec4 H = normalize(view * LA + P);

    // fator de iluminação especular
    float phongA = pow(max(dot(H, view * N), 0.0), shininess);

    // fator de iluminação difusa
    float lambertA = max(dot(LA, N), 0.0);
    float lambertB = max(dot(LB, N), 0.0);

    // fator de iluminação ambiente
    float ambient = 0.3;

    // cores das luzes
    vec3 colorSpecA = vec3(1.0,1.0,1.0);
    vec3 colorDifA = vec3(1.0,0.8,0.0);
    vec3 colorDifB = vec3(0.0,1.0,1.0);
    vec3 colorAmb = vec3(1.0,0.0,1.0);

    // luz resultante no ponto (por tipo)
    vec3 shadeSpec = (colorSpecA * phongA);
    vec3 shadeDif =  (colorDifA * lambertA) + (colorDifB * lambertB);
    vec3 shadeAmb =  colorAmb * ambient;

    // luz total no ponto
    vec3 shade = shadeSpec + shadeDif + shadeAmb;


    // RGBA
    gl_FragColor = vec4(shade.rgb, 1.0);
}