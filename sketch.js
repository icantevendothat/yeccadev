let grainImage;
let dots = [];
const spacing = 42;
const words = ["STRATEGY", "DESIGN", "TECH", "CURIOSITY", "PASSION", "CONSULTING", "POWER"];
const scrollContainer = document.getElementById('main-scroll');
const logoWrapper = document.getElementById('dynamic-logo');

// Animation timing for FIRST LOAD only
let introTimer = 0;
const FADE_IN_DURATION = 120; // frames for twinkling
const BURST_FRAME = 140;      // when the white burst happens
let introComplete = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Create Grid
    for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
            dots.push(new Dot(x, y));
        }
    }

    // --- SETUP PILLS (Sequential row for About page) ---
    for (let i = 0; i < words.length; i++) {
        let targetDot = dots[i]; 
        targetDot.word = words[i];
        targetDot.isPill = true;
        
        let xPos = map(i, 0, words.length - 1, 0.1, 0.9);
        targetDot.pillTarget = {
            x: width * xPos,
            y: height * 0.88 
        };
    }

    // --- FULL GRAIN GENERATION (Restored from your version) ---
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
    
    // Only increment timer if intro is running
    if (!introComplete) introTimer++;
    
    let scrollY = scrollContainer.scrollTop;
    let scrollPercent = constrain(scrollY / (windowHeight * 1.5), 0, 1);

    // Trigger CSS fade-in and set intro to complete after the burst
    if (introTimer === BURST_FRAME && !introComplete) {
        document.body.classList.add('intro-complete');
        // Delay setting complete so the burst animation can finish smoothly
        setTimeout(() => { introComplete = true; }, 1500);
    }

    // Logo shrinking logic based on scroll
    if (scrollY > windowHeight * 0.45) {
        logoWrapper.classList.add('logo-shrunk');
    } else {
        logoWrapper.classList.remove('logo-shrunk');
    }

    dots.forEach(dot => {
        dot.update(scrollPercent, introTimer);
        dot.display(scrollPercent, introTimer);
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
        this.currentSize = 0; // Starts at 0 for twinkle
        this.noiseSeed = random(1000); 
        this.birthFrame = random(0, FADE_IN_DURATION); 
    }

    update(percent, timer) {
        // 1. ENTRANCE BURST (Top Quarter Diffusion)
        if (!introComplete && timer > BURST_FRAME && timer < BURST_FRAME + 100) {
            if (this.homePos.y < height * 0.25) {
                let burstForce = map(timer, BURST_FRAME, BURST_FRAME + 60, 0, 15);
                this.pos.y -= burstForce * (1 - (this.homePos.y / (height * 0.25)));
            }
        }

        // 2. PILL & ORGANIC DRIFT PHYSICS (Restored from version 2)
        if (this.isPill) {
            let eased = 1 - Math.pow(1 - percent, 3); 
            
            // The organic drift you wanted preserved
            let driftX = map(noise(this.noiseSeed + frameCount * 0.01), 0, 1, -8, 8);
            let driftY = map(noise(this.noiseSeed + 500 + frameCount * 0.01), 0, 1, -5, 5);

            let targetX = lerp(this.homePos.x, this.pillTarget.x, eased) + (driftX * percent);
            let targetY = lerp(this.homePos.y, this.pillTarget.y, eased) + (driftY * percent);
            
            this.pos.x = targetX;
            this.pos.y = targetY;
        } else if (introComplete) {
            // Return to home position after the burst is done
            this.pos.y = lerp(this.pos.y, this.homePos.y, 0.05);
        }
    }

    display(percent, timer) {
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        let opacity = 0;
        let targetSize = 6;

        // --- ENTRANCE ANIMATION LOGIC ---
        if (!introComplete) {
            if (timer > this.birthFrame) {
                // Twinkle effect (sine wave opacity)
                opacity = map(sin(timer * 0.1 + this.noiseSeed), -1, 1, 100, 255);
                this.currentSize = lerp(this.currentSize, targetSize, 0.05);
            }
            // The Light Burst (white flash)
            if (timer > BURST_FRAME && this.homePos.y < height * 0.3) {
                let burstFade = map(timer, BURST_FRAME, BURST_FRAME + 40, 1, 0);
                targetSize = targetSize + (burstFade * 100); 
                opacity = 255 * burstFade;
            }
        } else {
            // --- STANDARD BEHAVIOR (POST-INTRO) ---
            opacity = 255;
            targetSize = 6;
        }

        // --- MOUSE & SCROLL INTERACTION (Restored from version 2) ---
        if (percent < 0.3) {
            // Mouse "magnify" effect on Home Page
            if (d < 140) targetSize = map(pow(d / 140, 1.5), 0, 1, 30, 6);
        } else {
            if (this.isPill) {
                // Large Glow Orbs for About Page
                targetSize = (d < 150) ? map(d, 0, 150, 75, 30) : 30;
                opacity = 255; 
            } else {
                // Fade out non-pill dots as we scroll
                opacity = map(percent, 0.2, 0.5, 255, 0);
            }
        }

        this.currentSize = lerp(this.currentSize, targetSize, 0.1);

        if (opacity <= 0) return;
        this.drawPill(this.pos.x, this.pos.y, this.currentSize, opacity, this.word, percent);
    }

    drawPill(x, y, size, opacity, word, percent) {
        // Safety check: ensure size is never negative to avoid IndexSizeError
        let safeSize = Math.max(0.1, size); 
        let alpha = opacity / 255;
        let ctx = canvas.getContext('2d');
        ctx.save();
        
        if (!introComplete && introTimer > BURST_FRAME && introTimer < BURST_FRAME + 60) {
            ctx.globalCompositeOperation = 'screen';
        }
    
        if (this.isPill && percent > 0.6) {
            let glowRadius = safeSize * 2.8; 
            let grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(0.1, glowRadius));
            grad.addColorStop(0, `rgba(245, 248, 252, ${0.8 * alpha})`); 
            grad.addColorStop(0.6, `rgba(215, 225, 235, ${0.2 * alpha})`);
            grad.addColorStop(1, `rgba(185, 195, 205, 0)`);
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
    
            ctx.font = `200 ${safeSize * 0.45}px "urbane", sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = alpha;
            ctx.fillText(word.toUpperCase(), x, y);
        } else {
            let grad = ctx.createRadialGradient(x, y, 0, x, y, safeSize);
            let colorStr = (!introComplete && this.homePos.y < height * 0.3 && introTimer > BURST_FRAME) 
                           ? '255, 255, 255' : '235, 238, 242';
            
            grad.addColorStop(0, `rgba(${colorStr}, ${0.9 * alpha})`);
            grad.addColorStop(1, `rgba(185, 195, 205, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, safeSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight); 
}
// let grainImage;
// let dots = [];
// const spacing = 42;
// const words = ["STRATEGY", "DESIGN", "TECH", "CURIOSITY", "PASSION", "CONSULTING", "POWER"];
// const scrollContainer = document.getElementById('main-scroll');
// const logoWrapper = document.getElementById('dynamic-logo');

// function setup() {
//     createCanvas(windowWidth, windowHeight);
    
//     for (let x = spacing / 2; x < width; x += spacing) {
//         for (let y = spacing / 2; y < height; y += spacing) {
//             dots.push(new Dot(x, y));
//         }
//     }

//     // --- UNIFORM STRAIGHT LINE ABOVE MIRRORED NAV ---
//     for (let i = 0; i < words.length; i++) {
//         // Sequential selection ensures a stable, non-scattered row
//         let targetDot = dots[i]; 
//         targetDot.word = words[i];
//         targetDot.isPill = true;
        
//         // Spread evenly across the width
//         let xPos = map(i, 0, words.length - 1, 0.1, 0.9);
        
//         targetDot.pillTarget = {
//             x: width * xPos,
//             y: height * 0.88 // Positioned at the bottom, above the nav
//         };
//     }

//     grainImage = createGraphics(width, height);
//     grainImage.loadPixels();
//     for (let i = 0; i < grainImage.width; i++) {
//         for (let j = 0; j < grainImage.height; j++) {
//             let grain = random(255);
//             grainImage.set(i, j, color(grain, grain, grain, 22)); 
//         }
//     }
//     grainImage.updatePixels();
// }

// function draw() {
//     clear();
//     let scrollY = scrollContainer.scrollTop;
    
//     // Slow cinematic transition (Changed back to 1.5 to match your working version)
//     let scrollPercent = constrain(scrollY / (windowHeight * 1.5), 0, 1);

//     if (scrollY > windowHeight * 0.45) {
//         logoWrapper.classList.add('logo-shrunk');
//     } else {
//         logoWrapper.classList.remove('logo-shrunk');
//     }

//     dots.forEach(dot => {
//         dot.update(scrollPercent);
//         dot.display(scrollPercent);
//     });

//     push();
//     blendMode(OVERLAY);
//     image(grainImage, 0, 0);
//     pop();
// }

// class Dot {
//     constructor(x, y) {
//         this.homePos = createVector(x, y);
//         this.pos = createVector(x, y);
//         this.isPill = false;
//         this.word = "";
//         this.pillTarget = createVector(0, 0);
//         this.currentSize = 6;
//         this.noiseSeed = random(1000); 
//     }

//     update(percent) {
//         if (this.isPill) {
//             let eased = 1 - Math.pow(1 - percent, 3); 
            
//             // Subtle Organic Drift
//             let driftX = map(noise(this.noiseSeed + frameCount * 0.01), 0, 1, -8, 8);
//             let driftY = map(noise(this.noiseSeed + 500 + frameCount * 0.01), 0, 1, -5, 5);

//             let targetX = lerp(this.homePos.x, this.pillTarget.x, eased) + (driftX * percent);
//             let targetY = lerp(this.homePos.y, this.pillTarget.y, eased) + (driftY * percent);
            
//             this.pos.x = targetX;
//             this.pos.y = targetY;
//         }
//     }

//     display(percent) {
//         let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
//         let targetSize = 6;
//         let opacity = 255;

//         if (percent < 0.3) {
//             if (d < 140) targetSize = map(pow(d / 140, 1.5), 0, 1, 30, 6);
//         } else {
//             if (this.isPill) {
//                 targetSize = (d < 150) ? map(d, 0, 150, 75, 30) : 30;
//             } else {
//                 opacity = map(percent, 0.2, 0.5, 255, 0);
//             }
//         }

//         this.currentSize = lerp(this.currentSize, targetSize, 0.1);

//         if (opacity <= 0) return;
//         this.drawPill(this.pos.x, this.pos.y, this.currentSize, opacity, this.word, percent);
//     }

//     drawPill(x, y, size, opacity, word, percent) {
//         let alpha = opacity / 255;
//         let ctx = canvas.getContext('2d');
        
//         ctx.save();
        
//         if (this.isPill && percent > 0.6) {
//             let glowRadius = size * 2.8; 
//             let grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
//             grad.addColorStop(0, `rgba(245, 248, 252, ${0.8 * alpha})`); 
//             grad.addColorStop(0.6, `rgba(215, 225, 235, ${0.2 * alpha})`);
//             grad.addColorStop(1, `rgba(185, 195, 205, 0)`);
            
//             ctx.fillStyle = grad;
//             ctx.beginPath();
//             ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
//             ctx.fill();

//             // --- UPDATED FONT & WEIGHT ---
//             ctx.font = `200 ${size * 0.45}px "urbane", "Inter", Arial, sans-serif`;
//             ctx.textAlign = "center";
//             ctx.textBaseline = "middle";
//             ctx.fillStyle = "#000000";
//             ctx.globalAlpha = alpha;
//             ctx.fillText(word.toUpperCase(), x, y);
            
//         } else {
//             let grad = ctx.createRadialGradient(x, y, 0, x, y, size);
//             grad.addColorStop(0, `rgba(235, 238, 242, ${0.9 * alpha})`);
//             grad.addColorStop(1, `rgba(185, 195, 205, 0)`);
//             ctx.fillStyle = grad;
//             ctx.beginPath();
//             ctx.arc(x, y, size, 0, Math.PI * 2);
//             ctx.fill();
//         }
//         ctx.restore();
//     }
// }

// function windowResized() { resizeCanvas(windowWidth, windowHeight); }
