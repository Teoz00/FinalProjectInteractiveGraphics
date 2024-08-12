class WaterParticle {
   constructor(x, y, z) {
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.force = { x: 0, y: 0, z: 0 };
        this.density = 0;
        this.pressure = 0;
    }
}

// Parametri SPH
const SPH = {
    REST_DENSITY: 1000,  // Densità di riferimento
    GAS_CONSTANT: 2000,  // Costante del gas
    VISCOSITY: 2500,     // Viscosità
    KERNEL_RADIUS: 1.0   // Raggio del nucleo
};






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