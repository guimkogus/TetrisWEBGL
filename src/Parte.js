class Parte {
    getModel(){
        if(this.parent) 
            return new Float32Array(mat4.multiply([], this.parent.getModel(), this.model));
        return new Float32Array(this.model);
    }
    constructor(position, parent){
        this.position = position
        this.model = mat4.translate([], mat4.create(), this.position);
        this.parent = parent;
    }
}