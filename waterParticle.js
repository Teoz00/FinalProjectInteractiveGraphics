class WaterParticle {
    constructor() {
        this.particles = [];
    }

    addParticle(position){
        this.particles.push({
            position: [...position]
        })
    }
}


/*
  addParticle(position, velocity) {
        this.particles.push({
            position: [...position],
            velocity: [...velocity],
            force: [0, 0, 0],
            density: 0,
            pressure: 0
        });
    }


*/