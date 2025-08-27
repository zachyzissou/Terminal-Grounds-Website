/**
 * Terminal Grounds WebGL Atmospheric Effects
 * Advanced visual effects for immersive sci-fi atmosphere
 */

class TerminalGroundsVFX {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.programs = {};
        this.buffers = {};
        this.textures = {};
        this.uniforms = {};
        this.isInitialized = false;
        this.animationId = null;
        
        // Effect parameters
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollY = 0;
        
        // Performance settings
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.targetFPS = 60;
        this.lastFrameTime = 0;
    }

    async init(containerId) {
        try {
            const container = document.getElementById(containerId) || document.querySelector(containerId);
            if (!container) {
                console.warn('VFX container not found:', containerId);
                return false;
            }

            this.createCanvas(container);
            this.setupWebGLContext();
            
            if (!this.gl) {
                console.warn('WebGL not supported, falling back to CSS effects');
                return false;
            }

            await this.loadShaders();
            this.setupBuffers();
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.startRenderLoop();
            
            console.log('✅ Terminal Grounds VFX initialized');
            return true;
        } catch (error) {
            console.error('❌ VFX initialization failed:', error);
            return false;
        }
    }

    createCanvas(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('vfx-canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.8;
        `;
        
        container.style.position = 'relative';
        container.appendChild(this.canvas);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupWebGLContext() {
        const contextOptions = {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        };

        this.gl = this.canvas.getContext('webgl2', contextOptions) || 
                  this.canvas.getContext('webgl', contextOptions);
        
        if (!this.gl) return;

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    async loadShaders() {
        // Particle field vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_scroll;
            
            varying vec2 v_texCoord;
            varying vec2 v_position;
            
            void main() {
                v_texCoord = a_texCoord;
                v_position = a_position;
                
                vec2 position = a_position;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        // Atmospheric particle fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_scroll;
            
            varying vec2 v_texCoord;
            varying vec2 v_position;
            
            // Terminal Grounds color palette
            const vec3 primaryColor = vec3(0.0, 1.0, 0.533); // #00ff88
            const vec3 accentBlue = vec3(0.0, 0.467, 1.0);   // #0077ff
            const vec3 ironOrange = vec3(1.0, 0.667, 0.0);   // #ffaa00
            
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(
                    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                    u.y
                );
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 4; i++) {
                    value += amplitude * noise(frequency * p);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                return value;
            }
            
            vec3 createParticleField(vec2 uv, float time) {
                vec2 pos = uv * 8.0;
                pos.x += time * 0.1;
                pos.y += sin(time * 0.2 + uv.x * 3.14159) * 0.1;
                
                float particles = 0.0;
                
                // Main particle layer
                for(int i = 0; i < 3; i++) {
                    vec2 particlePos = pos + vec2(float(i) * 2.731, float(i) * 1.618);
                    vec2 cellPos = fract(particlePos) - 0.5;
                    
                    float dist = length(cellPos);
                    float brightness = hash(floor(particlePos));
                    
                    if(brightness > 0.7) {
                        float pulse = sin(time * 3.0 + brightness * 6.28318) * 0.5 + 0.5;
                        particles += (1.0 - smoothstep(0.0, 0.1, dist)) * brightness * pulse;
                    }
                }
                
                // Atmospheric haze
                float haze = fbm(uv * 3.0 + time * 0.05) * 0.3;
                
                // Mouse interaction
                vec2 mouseInfluence = (u_mouse / u_resolution) * 2.0 - 1.0;
                float mouseDist = length(uv * 2.0 - 1.0 - mouseInfluence);
                float mouseEffect = exp(-mouseDist * 2.0) * 0.2;
                
                // Combine effects
                vec3 color = vec3(0.0);
                color += primaryColor * particles * 0.8;
                color += accentBlue * haze * 0.4;
                color += ironOrange * mouseEffect;
                
                // Scroll-based intensity
                float scrollIntensity = 1.0 + u_scroll * 0.0002;
                color *= scrollIntensity;
                
                return color;
            }
            
            vec3 createEnergyGrids(vec2 uv, float time) {
                vec2 gridUV = uv * 20.0;
                gridUV.x += time * 0.3;
                
                vec2 gridId = floor(gridUV);
                vec2 gridPos = fract(gridUV) - 0.5;
                
                // Vertical energy lines
                float verticalLines = 0.0;
                verticalLines += (1.0 - smoothstep(0.0, 0.02, abs(gridPos.x))) * 0.1;
                
                // Horizontal energy lines
                float horizontalLines = 0.0;
                horizontalLines += (1.0 - smoothstep(0.0, 0.02, abs(gridPos.y))) * 0.05;
                
                // Intersection points
                float intersections = 0.0;
                float dist = length(gridPos);
                if(hash(gridId) > 0.9) {
                    intersections = (1.0 - smoothstep(0.0, 0.1, dist)) * 
                                   sin(time * 4.0 + hash(gridId) * 6.28318);
                }
                
                vec3 gridColor = primaryColor * (verticalLines + horizontalLines + intersections * 0.5);
                return gridColor * 0.3;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                
                // Create layered atmospheric effects
                vec3 particles = createParticleField(uv, u_time);
                vec3 grids = createEnergyGrids(uv, u_time);
                
                // Combine effects
                vec3 finalColor = particles + grids;
                
                // Edge fadeout for seamless blending
                float edgeFade = 1.0;
                edgeFade *= smoothstep(0.0, 0.1, uv.x);
                edgeFade *= smoothstep(0.0, 0.1, uv.y);
                edgeFade *= smoothstep(0.0, 0.1, 1.0 - uv.x);
                edgeFade *= smoothstep(0.0, 0.1, 1.0 - uv.y);
                
                finalColor *= edgeFade;
                
                // Depth-based alpha
                float alpha = length(finalColor) * 0.8;
                alpha = clamp(alpha, 0.0, 0.6);
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        this.programs.atmospheric = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        
        if (!this.programs.atmospheric) {
            throw new Error('Failed to compile atmospheric shader program');
        }

        // Get uniform locations
        this.uniforms = {
            u_resolution: this.gl.getUniformLocation(this.programs.atmospheric, 'u_resolution'),
            u_time: this.gl.getUniformLocation(this.programs.atmospheric, 'u_time'),
            u_mouse: this.gl.getUniformLocation(this.programs.atmospheric, 'u_mouse'),
            u_scroll: this.gl.getUniformLocation(this.programs.atmospheric, 'u_scroll')
        };
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) return null;

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Shader program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    setupBuffers() {
        // Full-screen quad
        const positions = [
            -1, -1,  0, 0,
             1, -1,  1, 0,
            -1,  1,  0, 1,
             1,  1,  1, 1
        ];

        this.buffers.quad = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.quad);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    setupEventListeners() {
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Scroll tracking
        window.addEventListener('scroll', () => {
            this.scrollY = window.pageYOffset;
        });

        // Visibility change optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;

        const canvasWidth = displayWidth * this.pixelRatio;
        const canvasHeight = displayHeight * this.pixelRatio;

        if (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight) {
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            this.canvas.style.width = displayWidth + 'px';
            this.canvas.style.height = displayHeight + 'px';

            if (this.gl) {
                this.gl.viewport(0, 0, canvasWidth, canvasHeight);
            }
        }
    }

    render(currentTime = 0) {
        if (!this.isInitialized || !this.gl) return;

        // FPS limiting
        if (currentTime - this.lastFrameTime < (1000 / this.targetFPS)) {
            this.animationId = requestAnimationFrame((time) => this.render(time));
            return;
        }
        this.lastFrameTime = currentTime;

        this.time = currentTime * 0.001; // Convert to seconds

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.programs.atmospheric);

        // Bind quad buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.quad);
        
        const positionLocation = this.gl.getAttribLocation(this.programs.atmospheric, 'a_position');
        const texCoordLocation = this.gl.getAttribLocation(this.programs.atmospheric, 'a_texCoord');
        
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.enableVertexAttribArray(texCoordLocation);
        
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 16, 8);

        // Set uniforms
        this.gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.u_time, this.time);
        this.gl.uniform2f(this.uniforms.u_mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.u_scroll, this.scrollY);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        this.animationId = requestAnimationFrame((time) => this.render(time));
    }

    startRenderLoop() {
        this.animationId = requestAnimationFrame((time) => this.render(time));
    }

    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.animationId && this.isInitialized) {
            this.startRenderLoop();
        }
    }

    destroy() {
        this.pause();
        
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
        
        // Clean up WebGL resources
        if (this.gl) {
            Object.values(this.programs).forEach(program => {
                if (program) this.gl.deleteProgram(program);
            });
            Object.values(this.buffers).forEach(buffer => {
                if (buffer) this.gl.deleteBuffer(buffer);
            });
        }
        
        this.isInitialized = false;
        console.log('🧹 Terminal Grounds VFX destroyed');
    }
}

// Auto-initialize for hero section
document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero');
    if (heroSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Add VFX container
        heroSection.id = heroSection.id || 'hero-vfx-container';
        
        // Initialize VFX with fallback
        const vfx = new TerminalGroundsVFX();
        vfx.init('#hero-vfx-container').then(success => {
            if (success) {
                heroSection.classList.add('vfx-enhanced');
            }
        }).catch(error => {
            console.warn('VFX initialization failed, using CSS fallbacks:', error);
        });
        
        // Store reference for potential cleanup
        window.terminalGroundsVFX = vfx;
    }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalGroundsVFX;
} else {
    window.TerminalGroundsVFX = TerminalGroundsVFX;
}