// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var cosX = Math.cos(rotationX);
	var cosY = Math.cos(rotationY);
	var sinX = Math.sin(rotationX);
	var sinY = Math.sin(rotationY); 

	var trans = [
		cosY, (-sinY)*(-sinX), -sinY*cosX, 0,
        0, cosX, sinX, 0,
        sinY, cosY*(-sinX), cosY*cosX, 0,
        translationX, translationY, translationZ, 1
	];
	var mv = trans;
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.numTriangles = 0;
    
        this.prog = InitShaderProgram(vertCode, fragCode); //Those are the shaders Init
        if (!this.prog) {
            console.error('Failed with the start of ShaderCode');
            return;
        }

		this.vertBuffer = gl.createBuffer();
        if (!this.vertBuffer) {
            console.error('Failed to create vertBuffer');
            return;
        }
    
        this.texBuffer = gl.createBuffer();
        if (!this.texBuffer) {
            console.error('Failed to create texture buffer');
            return;
        }

		// Additional buffer for vertex normals 
        this.normalsBuffer = gl.createBuffer(); 
        if (!this.normalsBuffer) {
            console.error('Failed to create normalsBuffer');
            return;
        }
    
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        if (!this.mvp) {
            console.error('Failed to obtain the uniform location of mvp .');
            return;
        }

		this.matrixMVLocation = gl.getUniformLocation(this.prog, 'matrixMV'); //Aggiunto giusto il controllo
		if (!this.matrixMVLocation) {
            console.error('Failed to obtain the uniform location of matrixMV .');
            return;
        }

        this.matrixNormalLocation = gl.getUniformLocation(this.prog, 'matrixNormal');
		if (!this.matrixNormalLocation) {
            console.error('Failed to obtain the uniform location of matrixNormal .');
            return;
        }

		this.lightLocation = gl.getUniformLocation(this.prog, 'lightDir');
		if (!this.lightLocation) {
            console.error('Failed to obtain the uniform location of light .');
            return;
        }

		this.shininess = gl.getUniformLocation(this.prog, 'shininess');
		if (!this.shininess) {
            console.error('Failed to obtain the uniform location of shininess .');
            return;
        }

    
        this.vertPos = gl.getAttribLocation(this.prog, 'vertPos');
        if (this.vertPos === -1) {
            console.error('Failed to obtain the attribute location of vertPos".');
            return;
        }

		this.texCoord = gl.getAttribLocation(this.prog, 'texCoord');
        if (this.texCoord === -1) {
            console.error('Failed to obtain the attribute location of texCoord.');
            return;
        }

		this.vertNormal = gl.getAttribLocation(this.prog, 'vertNormal'); 
		if (this.vertNormal === -1) {
            console.error('Failed to obtain the attribute location of vertNormal.');
            return;
        }

		this.swap = gl.getUniformLocation(this.prog, "swapyz");
        if (!this.swap) {
            console.error('Failed to obtain the uniform location of swap .');
            return;
        }

		this.texture = gl.createTexture();
        if (!this.texture) {
            console.error('Failed to create the texture .');
            return;
        }

		this.textureLocation = gl.getUniformLocation(this.prog, "textureUsed");
        if (!this.textureLocation) {
            console.error('Failed to obtain the uniform location of texture .');
            return;
        }

		this.showTex = gl.getUniformLocation(this.prog, "showTexture");
        if (!this.showTex) {
            console.error('Failed to obtain the uniform location of showTex .');
            return;
        }
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);//Added the binding of the normal one
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		 // [TO-DO] Set the uniform parameter(s) of the vertex shader
		 gl.useProgram(this.prog);

		 let swapYZLocation = this.swap;
 
		 if (swap) {
			 gl.uniform1i(swapYZLocation, 1);
		 } else {
			 gl.uniform1i(swapYZLocation, 0);
		 }
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		
        gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
        gl.uniformMatrix4fv(this.matrixMVLocation, false, matrixMV);
        gl.uniformMatrix3fv(this.matrixNormalLocation, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.vertexAttribPointer(this.texCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoord);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer); //Fatto il binding con il normalsbuffer
		gl.vertexAttribPointer(this.vertNormal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertNormal);


		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		 // [TO-DO] Bind the texture
		 const tex = this.texture
		 gl.bindTexture(gl.TEXTURE_2D,tex);
		 // You can set the texture image data using the following command.
		 gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		 gl.generateMipmap(gl.TEXTURE_2D);
	 
		 // [TO-DO] Now that we have a texture, it might be a good idea to set
		 // some uniform parameter(s) of the fragment shader, so that it uses the texture
		 const textureSamplerLocation = this.textureLocation;
		 gl.activeTexture(gl.TEXTURE0);
		 gl.bindTexture(gl.TEXTURE_2D, tex);
		 gl.useProgram(this.prog);
		 gl.uniform1i(textureSamplerLocation, 0); 
	 
		 //If I don't put this, the texture won't apper until I check and uncheck the checkbox
		 this.showTexture(true);
   }
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		 // [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		 gl.useProgram(this.prog);

		 this.showTextureLocation = this.showTex
	 
		 gl.uniform1i(this.showTextureLocation, show);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
        const lightDirLocation = this.lightLocation;
        gl.uniform3f(lightDirLocation, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		const shininessLocation = this.shininess;
		gl.uniform1f(shininessLocation, shininess);
	}
}


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var numParticles = positions.length;
	//var forces = Array(position.lenght); //the total for per particle 
    var forces = Array(numParticles).fill(null).map(() => new Vec3(0, 0, 0));
	//TODO : Compute the total force of each particle OK 
	//TODO: update positions and velocities OK
	//TODO: handle collision OK

    //spring forces
    for (var i = 0; i < springs.length; i++) {
        var spring = springs[i];
        var p0 = spring.p0;
        var p1 = spring.p1;

        var pos0 = positions[p0];
        var pos1 = positions[p1];

        var deltaPos = pos1.sub(pos0);
        var dist = deltaPos.len();
        var dir = deltaPos.unit();

        var springForce = dir.mul(stiffness * (dist - spring.rest));
        
        forces[p0].inc(springForce);
        forces[p1].dec(springForce);
    }

    //damping forces and gravity
    for (var i = 0; i < numParticles; i++) {
        var velocity = velocities[i];
        
        var dampingForce = velocity.mul(-damping);
        var gravitationalForce = gravity.mul(particleMass);
        
        forces[i].inc(dampingForce);
        forces[i].inc(gravitationalForce);
    }

    // Update positions and velocities
    for (var i = 0; i < numParticles; i++) {
        var acceleration = forces[i].div(particleMass);
        velocities[i].inc(acceleration.mul(dt));
        positions[i].inc(velocities[i].mul(dt));
    }

    // Handle collisions with box walls
    for (var i = 0; i < numParticles; i++) {
        var pos = positions[i];
        var vel = velocities[i];

        if (pos.x < -1 || pos.x > 1) {
            pos.x = Math.max(-1, Math.min(1, pos.x));
            vel.x = -vel.x * restitution;
        }
        if (pos.y < -1 || pos.y > 1) {
            pos.y = Math.max(-1, Math.min(1, pos.y));
            vel.y = -vel.y * restitution;
        }
        if (pos.z < -1 || pos.z > 1) {
            pos.z = Math.max(-1, Math.min(1, pos.z));
            vel.z = -vel.z * restitution;
        }
    }
}

var vertCode = `
attribute vec3 vertPos;
attribute vec2 texCoord; 
attribute vec3 vertNormal; // New attribute for vertex normals

varying vec2 VText; //I will use it in fragment shader code
varying vec3 VNormal; // Vertex normal to pass to fragment shader
varying vec4 positionMV;

uniform mat4 mvp;
uniform mat4 matrixMV; 
uniform mat3 matrixNormal; 
uniform bool swapyz;

void main() {
    float yPos = swapyz ? vertPos.z : vertPos.y;
	float zPos = swapyz ? -vertPos.y : vertPos.z;

	vec4 pos = vec4(vertPos.x, yPos, zPos, 1.0);

    gl_Position = mvp * pos;

	positionMV = matrixMV * pos;

	VNormal = matrixNormal * vertNormal;
    
    VText = texCoord;
}
`;

var fragCode = `
precision mediump float;

uniform bool showTexture;
uniform sampler2D textureUsed;
uniform vec3 lightDir; // Is the light direction
uniform float shininess; // is the shininess 

varying vec2 VText;
varying vec3 VNormal; // Vertex normal from vertex shader
varying vec4 positionMV;


void main() {
	
	// Calculate lighting
	//Start with the white light
    vec3 diffuseColor = vec3(1.0);
    vec3 specularColor = vec3(1.0); 

    vec3 normal = normalize(VNormal);
    vec3 lightDirNorm = normalize(lightDir);

    // I do the lambertian diffusion
    float diffuseLambert = max(dot(normal, lightDirNorm), 0.0);

    // calculate the specular reflection with phon
    vec3 viewDir = normalize(-vec3(positionMV)); // Assuming the camera is at the origin
    vec3 halfwayDir = normalize(lightDirNorm + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);

    // Final color 
    vec3 shadedColor = diffuseLambert * diffuseColor + spec * specularColor;

	if (showTexture) {
		vec3 textureColor = texture2D(textureUsed, VText).rgb;
		shadedColor *= textureColor;
	}

	gl_FragColor = vec4(shadedColor, 1.0);
	
}
`;