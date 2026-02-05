let grainImage;
let dots = [];
const spacing = 42;
const words = ["STRATEGY", "DESIGN", "TECH", "CURIOSITY", "PASSION", "CONSULTING", "POWER"];
const scrollContainer = document.getElementById('main-scroll');
const logoWrapper = document.getElementById('dynamic-logo');

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
            dots.push(new Dot(x, y));
        }
    }

    // --- UNIFORM STRAIGHT LINE ABOVE MIRRORED NAV ---
    for (let i = 0; i < words.length; i++) {
        // Sequential selection ensures a stable, non-scattered row
        let targetDot = dots[i]; 
        targetDot.word = words[i];
        targetDot.isPill = true;
        
        // Spread evenly across the width
        let xPos = map(i, 0, words.length - 1, 0.1, 0.9);
        
        targetDot.pillTarget = {
            x: width * xPos,
            y: height * 0.88 // Positioned at the bottom, above the nav
        };
    }

    grainImage = createGraphics(width, height);
    grainImage.loadPixels();
    for (let i = 0; i < grainImage.width; i++) {
        for (let j = 0; j < grainImage.height; j++) {
            let grain = random(255);
            grainImage.set(i, j, color(grain, grain, grain, 22)); 
        }
    }
    grainImage.updatePixels();
}

function draw() {
    clear();
    let scrollY = scrollContainer.scrollTop;
    
    // Slow cinematic transition (Changed back to 1.5 to match your working version)
    let scrollPercent = constrain(scrollY / (windowHeight * 1.5), 0, 1);

    if (scrollY > windowHeight * 0.45) {
        logoWrapper.classList.add('logo-shrunk');
    } else {
        logoWrapper.classList.remove('logo-shrunk');
    }

    dots.forEach(dot => {
        dot.update(scrollPercent);
        dot.display(scrollPercent);
    });

    push();
    blendMode(OVERLAY);
    image(grainImage, 0, 0);
    pop();
}

class Dot {
    constructor(x, y) {
        this.homePos = createVector(x, y);
        this.pos = createVector(x, y);
        this.isPill = false;
        this.word = "";
        this.pillTarget = createVector(0, 0);
        this.currentSize = 6;
        this.noiseSeed = random(1000); 
    }

    update(percent) {
        if (this.isPill) {
            let eased = 1 - Math.pow(1 - percent, 3); 
            
            // Subtle Organic Drift
            let driftX = map(noise(this.noiseSeed + frameCount * 0.01), 0, 1, -8, 8);
            let driftY = map(noise(this.noiseSeed + 500 + frameCount * 0.01), 0, 1, -5, 5);

            let targetX = lerp(this.homePos.x, this.pillTarget.x, eased) + (driftX * percent);
            let targetY = lerp(this.homePos.y, this.pillTarget.y, eased) + (driftY * percent);
            
            this.pos.x = targetX;
            this.pos.y = targetY;
        }
    }

    display(percent) {
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        let targetSize = 6;
        let opacity = 255;

        if (percent < 0.3) {
            if (d < 140) targetSize = map(pow(d / 140, 1.5), 0, 1, 30, 6);
        } else {
            if (this.isPill) {
                targetSize = (d < 150) ? map(d, 0, 150, 75, 30) : 30;
            } else {
                opacity = map(percent, 0.2, 0.5, 255, 0);
            }
        }

        this.currentSize = lerp(this.currentSize, targetSize, 0.1);

        if (opacity <= 0) return;
        this.drawPill(this.pos.x, this.pos.y, this.currentSize, opacity, this.word, percent);
    }

    drawPill(x, y, size, opacity, word, percent) {
        let alpha = opacity / 255;
        let ctx = canvas.getContext('2d');
        
        ctx.save();
        
        if (this.isPill && percent > 0.6) {
            let glowRadius = size * 2.8; 
            let grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
            grad.addColorStop(0, `rgba(245, 248, 252, ${0.8 * alpha})`); 
            grad.addColorStop(0.6, `rgba(215, 225, 235, ${0.2 * alpha})`);
            grad.addColorStop(1, `rgba(185, 195, 205, 0)`);
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // --- UPDATED FONT & WEIGHT ---
            ctx.font = `200 ${size * 0.45}px "urbane", "Inter", Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = alpha;
            ctx.fillText(word.toUpperCase(), x, y);
            
        } else {
            let grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `rgba(235, 238, 242, ${0.9 * alpha})`);
            grad.addColorStop(1, `rgba(185, 195, 205, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }