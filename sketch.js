let focusX, focusY;
let blurryDot;
let grainImage; 
let trail = [];

const scrollContainer = document.getElementById('main-scroll');
const logoWrapper = document.getElementById('dynamic-logo');

// 1. Logo Shrink Logic
scrollContainer.addEventListener('scroll', () => {
    if (scrollContainer.scrollTop > window.innerHeight / 2) {
        logoWrapper.classList.add('logo-shrunk');
    } else {
        logoWrapper.classList.remove('logo-shrunk');
    }
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    focusX = width / 2;
    focusY = height / 2;

    // 2. Pre-render the blurry dot for Home
    blurryDot = createGraphics(30, 30);
    blurryDot.noStroke();
    for (let r = 10; r > 0; r -= 1) {
        let alpha = map(r, 0, 10, 100, 0);
        blurryDot.fill(210, 240, 255, alpha);
        blurryDot.ellipse(15, 15, r * 2, r * 2);
    }

    // 3. Static Grain Texture
    grainImage = createGraphics(width, height);
    grainImage.loadPixels();
    for (let i = 0; i < grainImage.width; i++) {
        for (let j = 0; j < grainImage.height; j++) {
            let grain = random(255);
            grainImage.set(i, j, color(grain, grain, grain, 15));
        }
    }
    grainImage.updatePixels();
}

function draw() {
    let scrollY = scrollContainer.scrollTop;
    let isAboutPage = scrollY > window.innerHeight * 0.5;

    if (!isAboutPage) {
        // --- HOME PAGE: Full Grid ---
        drawGradient();
        renderHomeGrid();
    } else {
        // --- ABOUT PAGE: Grid Reveal ---
        clear(); // Transparent for CSS gradient
        renderAboutGridReveal();
    }

    // 4. Global Grain Overlay
    imageMode(CORNER);
    blendMode(OVERLAY);
    image(grainImage, 0, 0);
    blendMode(BLEND);
}

function renderHomeGrid() {
    focusX = lerp(focusX, mouseX, 0.1);
    focusY = lerp(focusY, mouseY, 0.1);
    let spacing = 35;
    let focusRadius = 80;

    for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
            let d = dist(focusX, focusY, x, y);
            if (d < focusRadius) {
                let size = map(d, 0, focusRadius, 18, 8, true);
                fill(210, 240, 255, 255);
                noStroke();
                ellipse(x, y, size, size);
            } else {
                imageMode(CENTER);
                image(blurryDot, x, y);
            }
        }
    }
}

function renderAboutGridReveal() {
    let spacing = 35;
    let revealRadius = 150; // Distance from mouse to show dots
    
    // Add current mouse to trail for the 'fade' timing logic
    trail.push({ x: mouseX, y: mouseY, life: 255 });
    if (trail.length > 30) trail.shift(); // Keep trail short

    for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
            let d = dist(mouseX, mouseY, x, y);

            if (d < revealRadius) {
                // Calculate opacity based on distance from mouse
                let opacity = map(d, 0, revealRadius, 255, 0);
                
                // Add a bit of 'trail' influence to the opacity
                for (let t of trail) {
                    let td = dist(t.x, t.y, x, y);
                    if (td < 50) opacity += 50; 
                }

                fill(210, 240, 255, constrain(opacity, 0, 255));
                noStroke();
                ellipse(x, y, 8, 8); // Slightly smaller dots for About page
            }
        }
    }

    // Age the trail
    for (let p of trail) p.life -= 10;
}

function drawGradient() {
    let c1 = color(205, 135, 135); 
    let c2 = color(225, 175, 175); 
    for (let y = 0; y < height; y++) {
        let n = map(y, 0, height, 0, 1);
        let newColor = lerpColor(c1, c2, n);
        stroke(newColor);
        line(0, y, width, y);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// 5. Smooth Scroll Links
document.querySelectorAll('.scroll-link').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});