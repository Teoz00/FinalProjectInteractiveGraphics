//TODO: Create a sphere and spawing (By using binding and so on)

//var numParticles = 100;
//var numParticles = document.getElementById("water-particle-value");
//const smoothingLength = 20;
//const mass = 1.0;
//const timeStep = 0.01;
//const numSteps = 1000;

//let particles = [];

class Particle {
    constructor(cubeMin = [-1, -1, -1], cubeMax = [1, 1, 1]) {
        this.particles = []; // Array of particle objects
        this.mass = 1.0; // Default mass of particles
        this.viscosity = 0.1; // Viscosity coefficient
        this.restDensity = 1000.0; // Rest density of the fluid
        this.gasConstant = 2000.0; // Gas constant for pressure calculation
        this.gravity = [0, -9.81, 0]; // Gravity vector
        this.timeStep = 0.01; // Time step for the simulation
        this.cubeMin = cubeMin; // Minimum bounds of the cube
        this.cubeMax = cubeMax; // Maximum bounds of the cube
    }

    // Adds a particle to the fluid
    addParticle(position, velocity) {
        this.particles.push({
            position: [...position],
            velocity: [...velocity],
            force: [0, 0, 0],
            density: 0,
            pressure: 0
        });
    }

    // Applies external forces to particles (e.g., gravity)
    applyForces() {
        for (let particle of this.particles) {
            particle.force[0] += this.mass * this.gravity[0];
            particle.force[1] += this.mass * this.gravity[1];
            particle.force[2] += this.mass * this.gravity[2];
        }
    }

    // Computes the density and pressure for each particle
    computeDensityPressure() {
        const h = 1.0; // Smoothing length
        const h2 = h * h;
        for (let i = 0; i < this.particles.length; i++) {
            let particle_i = this.particles[i];
            particle_i.density = 0;
            for (let j = 0; j < this.particles.length; j++) {
                let particle_j = this.particles[j];
                let r2 = this.distanceSquared(particle_i.position, particle_j.position);
                if (r2 < h2) {
                    particle_i.density += this.mass * this.kernelPoly6(r2, h2);
                }
            }
            particle_i.pressure = this.gasConstant * (particle_i.density - this.restDensity);
        }
    }

    // Computes forces (pressure and viscosity) for each particle
    computeForces() {
        const h = 1.0; // Smoothing length
        for (let i = 0; i < this.particles.length; i++) {
            let particle_i = this.particles[i];
            particle_i.force = [0, 0, 0];
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                let particle_j = this.particles[j];
                let r = this.distance(particle_i.position, particle_j.position);
                if (r < h) {
                    // Pressure force
                    let pressureForce = this.computePressureForce(particle_i, particle_j, r, h);
                    particle_i.force[0] += pressureForce[0];
                    particle_i.force[1] += pressureForce[1];
                    particle_i.force[2] += pressureForce[2];

                    // Viscosity force
                    let viscosityForce = this.computeViscosityForce(particle_i, particle_j, r, h);
                    particle_i.force[0] += viscosityForce[0];
                    particle_i.force[1] += viscosityForce[1];
                    particle_i.force[2] += viscosityForce[2];
                }
            }
        }
    }

    // Updates particle positions and velocities, ensuring they stay within the bounding box
    integrate() {
        for (let particle of this.particles) {
            particle.velocity[0] += this.timeStep * particle.force[0] / particle.density;
            particle.velocity[1] += this.timeStep * particle.force[1] / particle.density;
            particle.velocity[2] += this.timeStep * particle.force[2] / particle.density;

            particle.position[0] += this.timeStep * particle.velocity[0];
            particle.position[1] += this.timeStep * particle.velocity[1];
            particle.position[2] += this.timeStep * particle.velocity[2];

            // Ensure the particle stays within the bounding box
            for (let i = 0; i < 3; i++) {
                if (particle.position[i] < this.cubeMin[i]) {
                    particle.position[i] = this.cubeMin[i];
                    particle.velocity[i] *= -0.5; // Simple collision response
                } else if (particle.position[i] > this.cubeMax[i]) {
                    particle.position[i] = this.cubeMax[i];
                    particle.velocity[i] *= -0.5; // Simple collision response
                }
            }
        }
    }

    // Kernel function for density computation (Poly6)
    kernelPoly6(r2, h2) {
        const a = 315.0 / (64.0 * Math.PI * Math.pow(h2, 3));
        return a * Math.pow(h2 - r2, 3);
    }

    // Computes pressure force between two particles
    computePressureForce(pi, pj, r, h) {
        const a = -45.0 / (Math.PI * Math.pow(h, 6));
        let pressureFactor = a * (pi.pressure + pj.pressure) / (2 * pj.density) * Math.pow(h - r, 2);
        return this.scaleVector(this.subtractVectors(pi.position, pj.position), pressureFactor / r);
    }

    // Computes viscosity force between two particles
    computeViscosityForce(pi, pj, r, h) {
        const a = 45.0 / (Math.PI * Math.pow(h, 6));
        let velocityDiff = this.subtractVectors(pj.velocity, pi.velocity);
        let viscosityFactor = a * (h - r);
        return this.scaleVector(velocityDiff, this.viscosity * viscosityFactor);
    }

    // Utility function: vector subtraction
    subtractVectors(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    // Utility function: scale a vector
    scaleVector(vec, scalar) {
        return [vec[0] * scalar, vec[1] * scalar, vec[2] * scalar];
    }

    // Utility function: compute distance between two points
    distance(a, b) {
        return Math.sqrt(this.distanceSquared(a, b));
    }

    // Utility function: compute squared distance between two points
    distanceSquared(a, b) {
        return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
    }

    // Runs a simulation step
    step() {
        this.applyForces();
        this.computeDensityPressure();
        this.computeForces();
        this.integrate();
    }

    // Returns the bounding box of the particles
    getBoundingBox() {
        if (this.particles.length === 0) return null;
        let min = [...this.particles[0].position];
        let max = [...this.particles[0].position];
        for (let i = 1; i < this.particles.length; ++i) {
            for (let j = 0; j < 3; ++j) {
                if (min[j] > this.particles[i].position[j]) min[j] = this.particles[i].position[j];
                if (max[j] < this.particles[i].position[j]) max[j] = this.particles[i].position[j];
            }
        }
        return { min: min, max: max };
    }
}

//TODO: Let sphere collide between them (bouncing collision)
//TODO: Implement density
//TODO: Implement pression (Given by pression + density)
//TODO: Viscosity force (using pression force)
//TODO: Let them collide with the cube
//TODO: Let them shining and reflecting water