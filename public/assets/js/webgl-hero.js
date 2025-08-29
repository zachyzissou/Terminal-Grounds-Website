// Terminal Grounds WebGL Hero Effects
class BloomParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to canvas particles');
            this.fallbackMode = true;
            this.ctx = canvas.getContext('2d');
            this.initCanvasFallback();
            return;
        }
        
        this.fallbackMode = false;
        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 50 : 100; // Fewer particles on mobile
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollProgress = 0;
        
        // Track mouse movement
        this.setupInteractions();
        
        this.initWebGL();
        this.createParticles();
        this.animate();
    }
    
    initWebGL() {
        const gl = this.gl;
        
        // Vertex shader - handles particle positioning and movement
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_velocity;
            attribute float a_size;
            attribute float a_alpha;
            attribute float a_time;
            
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_pixelRatio;
            
            varying float v_alpha;
            varying float v_pulse;
            
            void main() {
                // Calculate particle drift based on time and velocity
                vec2 pos = a_position;
                float t = u_time * 0.001 + a_time;
                
                // Organic bloom drift pattern
                pos.x += sin(t * 0.5 + a_position.y * 0.01) * a_velocity.x;
                pos.y += cos(t * 0.3 + a_position.x * 0.01) * a_velocity.y;
                
                // Wrap particles around screen edges
                pos.x = mod(pos.x + 1.0, 2.0) - 1.0;
                pos.y = mod(pos.y + 1.0, 2.0) - 1.0;
                
                gl_Position = vec4(pos, 0.0, 1.0);
                gl_PointSize = a_size * u_pixelRatio;
                
                // Pulse effect for bloom atmosphere
                v_pulse = sin(t * 2.0 + a_position.x * 10.0) * 0.5 + 0.5;
                v_alpha = a_alpha * (0.3 + v_pulse * 0.7);
            }
        `;
        
        // Fragment shader - creates the glowing particle effect
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec3 u_primaryColor;
            uniform vec3 u_secondaryColor;
            uniform vec3 u_accentColor;
            uniform float u_time;
            uniform vec2 u_mousePosition;
            uniform float u_scrollProgress;
            
            varying float v_alpha;
            varying float v_pulse;
            
            void main() {
                // Create radial gradient for particle glow
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                if (dist > 0.5) {
                    discard;
                }
                
                // Enhanced color mixing with triple gradient
                vec3 color = mix(u_primaryColor, u_secondaryColor, v_pulse);
                color = mix(color, u_accentColor, sin(u_time * 0.001 + v_pulse * 3.0) * 0.3);
                
                // Bloom-like glow with multiple falloff layers
                float innerGlow = exp(-dist * 4.0);
                float outerGlow = exp(-dist * 8.0);
                float alpha = v_alpha * (innerGlow * 0.6 + outerGlow * 0.4);
                alpha = smoothstep(0.0, 1.0, alpha);
                
                // Add chromatic aberration at edges
                if (dist > 0.3) {
                    color.r += (dist - 0.3) * 0.2;
                    color.b -= (dist - 0.3) * 0.1;
                }
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
        
        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        
        // Get attribute and uniform locations
        this.attribLocations = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            velocity: gl.getAttribLocation(this.program, 'a_velocity'),
            size: gl.getAttribLocation(this.program, 'a_size'),
            alpha: gl.getAttribLocation(this.program, 'a_alpha'),
            time: gl.getAttribLocation(this.program, 'a_time')
        };
        
        this.uniformLocations = {
            time: gl.getUniformLocation(this.program, 'u_time'),
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            pixelRatio: gl.getUniformLocation(this.program, 'u_pixelRatio'),
            primaryColor: gl.getUniformLocation(this.program, 'u_primaryColor'),
            secondaryColor: gl.getUniformLocation(this.program, 'u_secondaryColor'),
            accentColor: gl.getUniformLocation(this.program, 'u_accentColor'),
            mousePosition: gl.getUniformLocation(this.program, 'u_mousePosition'),
            scrollProgress: gl.getUniformLocation(this.program, 'u_scrollProgress')
        };
        
        // Setup WebGL state
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
    }
    
    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Unable to initialize shader program:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createParticles() {
        const gl = this.gl;
        
        const positions = [];
        const velocities = [];
        const sizes = [];
        const alphas = [];
        const times = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            // Random position
            positions.push(
                Math.random() * 2 - 1,  // x: -1 to 1
                Math.random() * 2 - 1   // y: -1 to 1
            );
            
            // Subtle drift velocity
            velocities.push(
                (Math.random() - 0.5) * 0.02,  // x velocity
                (Math.random() - 0.5) * 0.01   // y velocity
            );
            
            // Varied particle sizes
            sizes.push(Math.random() * 8 + 2);  // 2-10px
            
            // Random alpha for depth
            alphas.push(Math.random() * 0.8 + 0.2);  // 0.2-1.0
            
            // Random time offset for animation variety
            times.push(Math.random() * Math.PI * 2);
        }
        
        // Create and populate buffers
        this.buffers = {
            position: this.createBuffer(new Float32Array(positions)),
            velocity: this.createBuffer(new Float32Array(velocities)),
            size: this.createBuffer(new Float32Array(sizes)),
            alpha: this.createBuffer(new Float32Array(alphas)),
            time: this.createBuffer(new Float32Array(times))
        };
    }
    
    createBuffer(data) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    }
    
    animate() {
        if (this.fallbackMode) {
            this.animateCanvas();
            return;
        }
        
        this.time = performance.now();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
    
    render() {
        const gl = this.gl;
        
        // Resize canvas if needed
        if (this.canvas.width !== this.canvas.clientWidth || 
            this.canvas.height !== this.canvas.clientHeight) {
            this.resize();
        }
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        
        // Set uniforms
        gl.uniform1f(this.uniformLocations.time, this.time);
        gl.uniform2f(this.uniformLocations.resolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(this.uniformLocations.pixelRatio, window.devicePixelRatio);
        
        // Terminal Grounds colors: primary cyan, accent blue, and purple
        gl.uniform3f(this.uniformLocations.primaryColor, 0.0, 1.0, 0.533); // #00FF88
        gl.uniform3f(this.uniformLocations.secondaryColor, 0.0, 0.467, 1.0); // #0077FF
        gl.uniform3f(this.uniformLocations.accentColor, 0.667, 0.333, 1.0); // #AA55FF
        
        // Mouse position (normalized)
        gl.uniform2f(this.uniformLocations.mousePosition, 
            this.mouseX / this.canvas.width, 
            this.mouseY / this.canvas.height);
        
        // Scroll progress
        gl.uniform1f(this.uniformLocations.scrollProgress, this.scrollProgress || 0);
        
        // Bind attributes
        this.bindAttribute('position', 2);
        this.bindAttribute('velocity', 2);
        this.bindAttribute('size', 1);
        this.bindAttribute('alpha', 1);
        this.bindAttribute('time', 1);
        
        // Draw particles
        gl.drawArrays(gl.POINTS, 0, this.particleCount);
    }
    
    bindAttribute(name, size) {
        const gl = this.gl;
        const location = this.attribLocations[name];
        
        if (location === -1) return;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[name]);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    
    resize() {
        const gl = this.gl;
        const canvas = this.canvas;
        const pixelRatio = window.devicePixelRatio;
        
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    setupInteractions() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Touch support for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        });
        
        // Scroll tracking
        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = window.scrollY / maxScroll;
        });
    }
    
    // Canvas 2D fallback for devices without WebGL
    initCanvasFallback() {
        this.particles = [];
        for (let i = 0; i < 30; i++) {  // Fewer particles in fallback
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 4 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                hue: Math.random() * 60 + 160  // Blue-cyan range
            });
        }
        this.animateCanvas();
    }
    
    animateCanvas() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle with glow
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            
            const color = `hsl(${particle.hue}, 100%, 50%)`;
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = particle.alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animateCanvas());
    }
    
    destroy() {
        // Cleanup WebGL resources
        if (!this.fallbackMode && this.gl) {
            Object.values(this.buffers).forEach(buffer => {
                this.gl.deleteBuffer(buffer);
            });
            this.gl.deleteProgram(this.program);
        }
    }
}

// Initialize particle system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create canvas for hero particles
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Check user preferences for motion
    const prefersReducedMotion = window.matchMedia && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        console.log('Respecting prefers-reduced-motion: reduce');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.id = 'heroParticles';
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.6;
    `;
    
    heroSection.appendChild(canvas);
    
    // Initialize particle system
    const particleSystem = new BloomParticleSystem(canvas);
    
    // Handle resize
    window.addEventListener('resize', () => {
        if (particleSystem && !particleSystem.fallbackMode) {
            particleSystem.resize();
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (particleSystem) {
            particleSystem.destroy();
        }
    });
    
    // Performance monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    function monitorPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 5000) { // Check every 5 seconds
            const fps = frameCount / 5;
            
            if (fps < 30) {
                console.log('Low FPS detected, consider reducing particle count');
                canvas.style.opacity = '0.3'; // Reduce visual impact
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(monitorPerformance);
    }
    
    monitorPerformance();
});