// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Staggered Reveal for Stack Items
document.addEventListener("DOMContentLoaded", () => {
    const stackItems = document.querySelectorAll('.stack-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on index
                setTimeout(() => {
                    entry.target.classList.add('reveal');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    stackItems.forEach((item) => {
        observer.observe(item);
    });

    // Parallax effect for project backgrounds
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        parallaxBgs.forEach(bg => {
            const rect = bg.getBoundingClientRect();
            // Only animate if in viewport
            if(rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = (rect.top * 0.2);
                bg.style.backgroundPositionY = `${yPos}px`;
            }
        });
    });
});

// Interactive Node-Link Canvas Background
const canvas = document.getElementById('mesh-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const mouse = { x: -1000, y: -1000, radius: 150 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    update() {
        // Move naturally
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction (warp/displace)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Push away
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
        } else {
            // Slowly return to base (optional, we'll let them drift)
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.fill();
    }
}

function initMesh() {
    particles = [];
    const particleCount = (width * height) / 15000; // responsive count
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}
initMesh();

function animateMesh() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect lines
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 - distance/120 * 0.15})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateMesh);
}
animateMesh();
