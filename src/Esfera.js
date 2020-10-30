class Esfera{

    static toMesh(faces){
      return faces.reduce((v, i) => v.concat(i.reduce((v,i) => v.concat(i),[])),[]);
    }
  
    static lerp(a,b,p=.5){
      return a.map((v,i) => (1-p)*v + p * b[i]);
    }
  
    static magnitude(vec){
      return Math.sqrt(vec.reduce((s,v) => s+=v*v ,0));
    }
  
    static normalize(vec){
      let mag = Esfera.magnitude(vec);
      return vec.map(a => a/mag);
    }
  
    static divide(tri){
      let [a,b,c] = tri;
      let ab = Esfera.normalize(Esfera.lerp(a,b));
      let bc = Esfera.normalize(Esfera.lerp(b,c));
      let ca = Esfera.normalize(Esfera.lerp(c,a));
      return [
        [a,ab,ca],
        [ab,b,bc],
        [ca,bc,c],
        [bc,ca,ab]
      ];
    }
  
    static getOctaedro(){
  
      let cima = [0,1,0],
        baixo = [0,-1,0],
        esquerda = [-1,0,0],
        direita = [1,0,0],
        frente = [0,0,1],
        fundo = [0,0,-1];
  
      let faces = [
          [cima, frente, direita],
          [cima, direita, fundo],
          [cima, fundo, esquerda],
          [cima, esquerda, frente],
          [baixo, direita, frente],
          [baixo, fundo, direita],
          [baixo, esquerda, fundo],
          [baixo, frente, esquerda]
        ];
  
      let pontos = {cima, baixo, esquerda, direita, frente, fundo};
  
      let mesh = Esfera.toMesh(faces);
  
      return {mesh, faces, pontos};
    }
  
    constructor(n=1){
      let {faces} = Esfera.getOctaedro();
      for(let i = 0; i < n; i++){
        let f = faces.reduce((s,v) => s.concat(Esfera.divide(v)),[]);
        faces = f;
      }
      this.faces = faces;
      this.mesh = Esfera.toMesh(this.faces);
    }
  
  }