window.addEventListener("load", main);
window.addEventListener("resize", resize);
window.addEventListener("mousemove", moverCamera);
window.addEventListener("keydown", moverModelo);




// VARIÁVEIS GLOBAIS
let canvas,         // área de desenho
    gl,             // API do WebGL
    frame = 0,      // número do frame atual
    vertexSrc,      // codigo fonte vertex shader
    fragmentSrc,    // codigo fonte fragment shader
    vertexShader,   // shader compilado
    fragmentShader, // shader compilado
    shaderProgram,  // programa com shaders linkados
    data,           // modelo 3D
    positionAttr,   // referência do buffer no shader de fragmento
    positionBuffer, // buffer alocado
    normalAttr,   // referência do buffer no shader de fragmento
    normalBuffer, // buffer alocado
    frameUniform,   // variável de frame nos shaders
    width,
    height, 
    aspect,
    projection,
    projectionUniform,
    model,
    model2,
    model3,
    model4,
    modelmatrix,
    modelUniform,
    view,
    viewUniform,
    modelsList,
    modelsList2,
    modelsList3,
    modelsList4,
    ListOfModelsLists,
    piece = 0,
    positionX = 0,
    positionY = 0,
    dir = 0,
    tileMap = [];

async function main(evt){
    createMap();

    // 1 - Criar uma área de desenho
    canvas = createCanvas();

    // 2 - Carregar a API do WebGL (OpenGL)
    gl = loadGL();

    // 3 - Carregar os arquivos fonte de shader (GLSL)
    vertexSrc = await fetch("vertex.glsl").then(r => r.text());
    fragmentSrc = await fetch("fragment.glsl").then(r => r.text());

    console.log("VERTEX:", vertexSrc);
    console.log("FRAGMENT:", fragmentSrc);

    // 4 - Compilar os shaders
    vertexShader = compile(vertexSrc, gl.VERTEX_SHADER);
    fragmentShader = compile(fragmentSrc, gl.FRAGMENT_SHADER);

    // 5 - Linkar os shaders
    shaderProgram = link(vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    // 6 - Criar os dados de modelo
    data = getData();

    // 7 - Transferir dados de modelo para GPU

    // POSITION 
    positionAttr = gl.getAttribLocation(shaderProgram, "position");
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttr);
    gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);

    // NORMAL 
    normalAttr = gl.getAttribLocation(shaderProgram, "normal");
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.normais, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttr);
    gl.vertexAttribPointer(normalAttr, 3, gl.FLOAT, false, 0, 0);

    // 7.5 - Recalcula o tamanho da tela
    resize();

    // 8 - Uniforms...
    // 8.1 - Model
    modelUniform = gl.getUniformLocation(shaderProgram, "model");
    

    let modematrix = aleatorio()

    let p0 = new Parte([0,0,0]);
    let p1 = new Parte(modematrix[0], p0);
    let p2 = new Parte(modematrix[1], p1);
    let p3 = new Parte(modematrix[2], p2);
    modelsList = [p0];
    modelsList2 = [p1];
    modelsList3 = [p2];
    modelsList4 = [p3];
    console.log(p0.model)
    console.log(p1.model)
    console.log(p2.model)
    console.log(p3.model)
    ListOfModelsLists = [modelsList, modelsList2, modelsList3, modelsList4];
    
    

    for (let i = 0; i < 4; i++) {
        gl.uniformMatrix4fv(modelUniform, false, ListOfModelsLists[i][piece].model);
    }

    // 8.2 - View
    view = mat4.lookAt([], [0, 0, 30], [5.0, 10.0, 0.0], [0,-1,0]);
    viewUniform = gl.getUniformLocation(shaderProgram, "view");
    gl.uniformMatrix4fv(viewUniform, false, new Float32Array(view));

    // 8.3 - Projection
    projection = mat4.perspective([], 0.3*Math.PI, aspect, 0.01, 100);
    projectionUniform = gl.getUniformLocation(shaderProgram, "projection");
    gl.uniformMatrix4fv(projectionUniform, false, new Float32Array(projection));

    frameUniform = gl.getUniformLocation(shaderProgram, "frame");


    // 9 - Chamar o loop de redesenho
    render();
}

function render () {
    // 9.1 - Atualizar dados
    gl.uniform1f(frameUniform, frame);

    // 9.2 - Limpar a tela
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 9.3 - Desenhar
    // POINTS, LINES, LINE_STRIP, TRIANGLES 
    for (let i = 0; i <= piece; i++) {
        for(let j = 0; j < 4; j++) {
            gl.uniformMatrix4fv(modelUniform, false, ListOfModelsLists[j][i].model);
            gl.drawArrays(gl.TRIANGLES, 0, data.points.length / 3);
        }
    }

    // 9.4 - Encerrar frame de desenho
    frame++;
    gravidade();
    requestAnimationFrame(render);
}

function getData(){

    let n = [
        // frente
        [0,0,-1],
        // topo
        [0,-1,0],
        // esquerda
        [-1,0,0],
        // direita
        [1,0,0],
        // baixo
        [0,1,0],
        // fundo
        [0,0,1]
    ];

    let normais = [
        ...n[0], ...n[0], ...n[0],
        ...n[0], ...n[0], ...n[0],

        ...n[1], ...n[1], ...n[1],
        ...n[1], ...n[1], ...n[1],

        ...n[2], ...n[2], ...n[2],
        ...n[2], ...n[2], ...n[2],

        ...n[3], ...n[3], ...n[3],
        ...n[3], ...n[3], ...n[3],

        ...n[4], ...n[4], ...n[4],
        ...n[4], ...n[4], ...n[4],

        ...n[5], ...n[5], ...n[5],
        ...n[5], ...n[5], ...n[5]
    ];

    let v = [
        // 0: A - EQ TP FR
        [-1,-1,-1],
        // 1: B - DR TP FR
        [0,-1,-1],
        // 2: C - DR BX FR
        [0,0,-1],
        // 3: D - EQ BX FR
        [-1,0,-1],
        // 4: E - EQ TP TZ
        [-1,-1,0],
        // 5: F - DR TP TZ
        [0,-1,0],
        // 6: G - EQ BX TZ
        [-1,0,0],
        // 7: H - DR BX TZ
        [0,0,0]
    ];

    let points = [
        // frente
        // adc
        ...v[0], ...v[3], ...v[2],
        // cba
        ...v[2], ...v[1], ...v[0],
       
        // topo
        // abe
        ...v[0], ...v[1], ...v[4],
        // bfe
        ...v[1], ...v[5], ...v[4],

        // esquerda
        // dae
        ...v[3], ...v[0], ...v[4],
        // gde
        ...v[6], ...v[3], ...v[4],

        // direita
        // bch
        ...v[1], ...v[2], ...v[7],
        // hfb
        ...v[7], ...v[5], ...v[1],

        // baixo
        // dgh
        ...v[3], ...v[6], ...v[7],
        // hcd
        ...v[7], ...v[2], ...v[3],

        // fundo
        // fhg
        ...v[5], ...v[7], ...v[6],
        // gef
        ...v[6], ...v[4], ...v[5]

    ];
    
    let modelo = {
        "points": new Float32Array(points), 
        "normais": new Float32Array(normais),
        
    };

    return modelo;
}

function createCanvas(){
    let canvas = document.createElement("canvas");
    canvas.style.background = "hsl(0deg, 0%, 80%)";
    document.body.appendChild(canvas);
    return canvas;
}

function loadGL(){
    let gl = canvas.getContext("webgl");
    gl.enable(gl.DEPTH_TEST);
    return gl;
}

function compile(source, type){
    let shader = gl.createShader(type);
    let typeInfo = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        let reason = gl.getShaderInfoLog(shader);
        console.error("ERRO NA COMPILAÇÃO ::", type, reason);
        return null;
    }
    console.info("SHADER COMPILADO :: ", typeInfo);
    return shader;
}

function link(vertexShader, fragmentShader){
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("ERRO NO LINK");
        return null;
    }
    console.info("LINKAGEM BEM SUCEDIDA!!!");
    return program;
}

function resize(){
    width = window.innerWidth;
    height = window.innerHeight;
    aspect = width / height;
    if(canvas){
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
    }
    if(gl) 
        gl.viewport(0, 0, canvas.width, canvas.height);

    if(projectionUniform) {
        projection = mat4.perspective([], 0.3*Math.PI, aspect, 0.01, 100);
        gl.uniformMatrix4fv(projectionUniform, false, new Float32Array(projection));
    }
}

function moverCamera(evt){
    const DES = 3;
    /// -1 < x < 1
    let x = (evt.x / window.innerWidth)*2 - 1;
    let y = (evt.y / window.innerHeight)*-2 + 1;

    let dx = x * DES;
    let dy = y * DES;

    if(view){
        view = mat4.lookAt([], [dx, dy, 30], [5.0, 10.0, 0.0], [0,-1,0]);
        gl.uniformMatrix4fv(viewUniform, false, new Float32Array(view));
    }
}

function moverModelo(evt){    
    if ( positionX > 0 && evt.key === "d" && didCollided() !== "Xdir" ) {
        removeFromTileMap();
        positionX -= 1;
        for(let i = 0; i < 4; i++){
            ListOfModelsLists[i][piece].model = mat4.translate([], ListOfModelsLists[i][piece].model, [-1, 0, 0]);
        }
        addToTileMap();  
    }
    
    if ( positionX < 10 && evt.key === "a" && didCollided() !== "Xesq" ) {
        removeFromTileMap();
        positionX += 1;
        for(let i = 0; i < 4; i++){
            ListOfModelsLists[i][piece].model = mat4.translate([], ListOfModelsLists[i][piece].model, [1, 0, 0]);
        }
        addToTileMap();
    }

    if (positionY <= 20  && evt.key === "s" && didCollided() !== "Y" ) {
        removeFromTileMap();
        positionY += 1;
        for(let i = 0; i < 4; i++){
            ListOfModelsLists[i][piece].model = mat4.translate([],  ListOfModelsLists[i][piece].model, [0, 1, 0]);
        }
        addToTileMap();
    }
    if (evt.key === "q") {
        removeFromTileMap();
        
        modelsList[piece].model = mat4.rotateX([], modelsList[piece].model, Math.PI / 2);
        

        addToTileMap();
    }
}

function gravidade() {  
    if(frame % 60 === 0 && didCollided() !== "Y" ) {
        removeFromTileMap();

        for (let i = 0; i < 4; i++) {
            ListOfModelsLists[i][piece].model = mat4.translate([], ListOfModelsLists[i][piece].model, [0, 1, 0]);
        }

        addToTileMap();
        positionY += 1;
    }

    if(didCollided() === "Y") {
        printTileMap();
        positionY = 0;
        positionX = 0;
        piece++;
        novoModelo();
    }
}

function didCollided() {
    removeFromTileMap();

    const bloco1 = vec4.transformMat4([], [0, 0, 0, 1], modelsList[piece]);
    const bloco2 = vec4.transformMat4([], [0, 0, 0, 1], modelsList2[piece]);
    const bloco3 = vec4.transformMat4([], [0, 0, 0, 1], modelsList3[piece]);
    const bloco4 = vec4.transformMat4([], [0, 0, 0, 1], modelsList4[piece]);

    const collisionY1 = tileMap[bloco1[1] + 1][bloco1[0]];
    const collisionY2 = tileMap[bloco2[1] + 1][bloco2[0]];
    const collisionY3 = tileMap[bloco3[1] + 1][bloco3[0]];
    const collisionY4 = tileMap[bloco4[1] + 1][bloco4[0]];
    const collisionY = collisionY1 || collisionY2 || collisionY3 || collisionY4;

    const collisionX1 = tileMap[bloco1[1]][bloco1[0] + 1];
    const collisionX2 = tileMap[bloco2[1]][bloco2[0] + 1];
    const collisionX3 = tileMap[bloco3[1]][bloco3[0] + 1];
    const collisionX4 = tileMap[bloco4[1]][bloco4[0] + 1];
    const collisionXesq = collisionX1 || collisionX2 || collisionX3 || collisionX4;

    const collisionX5 = tileMap[bloco1[1]][bloco1[0] - 1];
    const collisionX6 = tileMap[bloco2[1]][bloco2[0] - 1];
    const collisionX7 = tileMap[bloco3[1]][bloco3[0] - 1];
    const collisionX8 = tileMap[bloco4[1]][bloco4[0] - 1];
    const collisionXdir = collisionX5 || collisionX6 || collisionX7 || collisionX8;

    addToTileMap();
    
    if (collisionXesq) return "Xesq";

    if(collisionXdir) return "Xdir";

    if (bloco1[1] >= 20 || bloco2[1] >= 20 || bloco3[1] >= 20 || bloco4[1] >= 20 || collisionY ) return "Y";

    return false;
}

function removeFromTileMap() {
    const bloco1 = vec4.transformMat4([], [0, 0, 0, 1], modelsList[piece].model);
    const bloco2 = vec4.transformMat4([], [0, 0, 0, 1], modelsList2[piece].model);
    const bloco3 = vec4.transformMat4([], [0, 0, 0, 1], modelsList3[piece].model);
    const bloco4 = vec4.transformMat4([], [0, 0, 0, 1], modelsList4[piece].model);

    tileMap[bloco1[1]][bloco1[0]] = false;
    tileMap[bloco2[1]][bloco2[0]] = false;
    tileMap[bloco3[1]][bloco3[0]] = false;
    tileMap[bloco4[1]][bloco4[0]] = false;
}

function addToTileMap() {
    const bloco1 = vec4.transformMat4([], [0, 0, 0, 1], modelsList[piece].model);
    const bloco2 = vec4.transformMat4([], [0, 0, 0, 1], modelsList2[piece].model);
    const bloco3 = vec4.transformMat4([], [0, 0, 0, 1], modelsList3[piece].model);
    const bloco4 = vec4.transformMat4([], [0, 0, 0, 1], modelsList4[piece].model);

    tileMap[bloco1[1]][bloco1[0]] = true;
    tileMap[bloco2[1]][bloco2[0]] = true;
    tileMap[bloco3[1]][bloco3[0]] = true;
    tileMap[bloco4[1]][bloco4[0]] = true;
}

function printTileMap() {    
    let line = "";
    for(let i = 0; i < tileMap.length; i++) {
        for(let j = tileMap[i].length - 1; j >= 0 ; j--) {
            line += tileMap[i][j] ? 1 : 0;
        }
        line += "\n";
    }
    console.log(line);
}

function novoModelo() {
    let newmodel,
        newmodel2,
        newmodel3,
        newmodel4;

    let matrizmodelo = aleatorio();
    
    newmodel = new Parte([0,0,0]);
    newmodel2 = new Parte(matrizmodelo[0], newmodel);
    newmodel3 = new Parte(matrizmodelo[1], newmodel2);
    newmodel4 =  new Parte(matrizmodelo[2], newmodel3);

    modelsList[piece] = newmodel;
    modelsList2[piece] = newmodel2;
    modelsList3[piece] = newmodel3;
    modelsList4[piece] = newmodel4;
   
}

function aleatorio() {
 let pos1 = [
    [2,0,0],
    [1,0,0],
    [1,1,0],
]

let pos2 = [
    [1,0,0],
    [1,1,0],
    [1,2,0],
]

let pos3 = [
    [0,1,0],
    [0,2,0],
    [0,3,0],
]

let pos4 = [
    [1,0,0],
    [1,1,0],
    [0,1,0],
]

let listadepos = [pos1,pos2,pos3,pos4] 

let indice = randomInt(0,(listadepos.length));

return listadepos[indice];
}

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

function createMap() {
    for(let i = 0; i < 30; i++) {
        tileMap[i] = [];
        for(let j = 0; j < 20; j++) {
            tileMap[i][j] = false;
        }
    }
}