// let grainImage;
// const scrollContainer = document.getElementById('main-scroll');

// function setup() {
//     createCanvas(windowWidth, windowHeight);
    
//     grainImage = createGraphics(width, height);
//     grainImage.loadPixels();
//     for (let i = 0; i < grainImage.width; i++) {
//         for (let j = 0; j < grainImage.height; j++) {
//             let grain = random(255);
//             grainImage.set(i, j, color(grain, grain, grain, 15));
//         }
//     }
//     grainImage.updatePixels();
// }

// function draw() {
//     clear();
    
//     let scrollY = scrollContainer.scrollTop;
//     let spacing = 40;
    
//     if (scrollY < windowHeight * 0.5) {
//         // --- HOME PAGE GRID ---
//         let focusRadius = 85;
//         for (let x = spacing / 2; x < width; x += spacing) {
//             for (let y = spacing / 2; y < height; y += spacing) {
//                 let d = dist(mouseX, mouseY, x, y);
//                 if (d < focusRadius) {
//                     let size = map(d, 0, focusRadius, 16, 8);
//                     drawGradientDot(x, y, size, 255, false);
//                 } else {
//                     drawGradientDot(x, y, 6, 255, true);
//                 }
//             }
//         }
//     } else {
//         // --- ABOUT PAGE REVEAL LOGIC ---
//         let revealRadius = 150; 
//         for (let x = spacing / 2; x < width; x += spacing) {
//             for (let y = spacing / 2; y < height; y += spacing) {
//                 let d = dist(mouseX, mouseY, x, y);
//                 if (d < revealRadius) {
//                     // Reveal dots near mouse
//                     let opacity = map(d, 0, revealRadius, 255, 0);
//                     drawGradientDot(x, y, 10, opacity, false);
//                 }
//             }
//         }
//     }

//     push();
//     blendMode(OVERLAY);
//     image(grainImage, 0, 0);
//     pop();
// }

// function drawGradientDot(x, y, size, masterOpacity, isBlurred) {
//     let ctx = canvas.getContext('2d');
//     let alphaMult = masterOpacity / 255;
//     let gradSize = isBlurred ? size * 2 : size / 2;
//     let grad = ctx.createRadialGradient(x, y, 0, x, y, gradSize);
    
//     if (isBlurred) {
//         grad.addColorStop(0, `rgba(230, 245, 255, ${0.2 * alphaMult})`);
//         grad.addColorStop(1, `rgba(230, 245, 255, 0)`);
//     } else {
//         // Desaturated "Icy" Gradient (Less Blue)
//         grad.addColorStop(0, `rgba(255, 255, 255, ${1 * alphaMult})`); 
//         grad.addColorStop(0.5, `rgba(220, 240, 255, ${0.8 * alphaMult})`);
//         grad.addColorStop(1, `rgba(180, 210, 255, ${0.4 * alphaMult})`);
//     }
    
//     ctx.fillStyle = grad;
//     ctx.beginPath();
//     ctx.arc(x, y, isBlurred ? size * 1.5 : size / 2, 0, Math.PI * 2);
//     ctx.fill();
// }

// document.querySelectorAll('.scroll-link').forEach(anchor => {
//   anchor.addEventListener('click', function(e) {
//       e.preventDefault();
      
//       const targetId = this.getAttribute('href');
//       const targetElement = document.querySelector(targetId);
      
//       if (targetElement) {
//           // Using the scroll-wrapper for the scroll action
//           const container = document.getElementById('main-scroll');
//           container.scrollTo({
//               top: targetElement.offsetTop,
//               behavior: 'smooth'
//           });
//       }
//   });
// });

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
// }

let grainImage;
const scrollContainer = document.getElementById('main-scroll');
const logoWrapper = document.getElementById('dynamic-logo');

// --- UPDATED LOGO TRIGGER ---
scrollContainer.addEventListener('scroll', () => {
    // When the user scrolls halfway to the About section
    if (scrollContainer.scrollTop > window.innerHeight / 2) {
        logoWrapper.classList.add('logo-scrolled');
    } else {
        logoWrapper.classList.remove('logo-scrolled');
    }
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Create static grain texture
    grainImage = createGraphics(width, height);
    grainImage.loadPixels();
    for (let i = 0; i < grainImage.width; i++) {
        for (let j = 0; j < grainImage.height; j++) {
            let grain = random(255);
            grainImage.set(i, j, color(grain, grain, grain, 12));
        }
    }
    grainImage.updatePixels();
}

function draw() {
  clear();
  let scrollY = scrollContainer.scrollTop;
  let spacing = 35;
  
  if (scrollY < windowHeight * 0.5) {
      // HOME PAGE: Icy Dots
      let focusRadius = 85; 
      for (let x = spacing / 2; x < width; x += spacing) {
          for (let y = spacing / 2; y < height; y += spacing) {
              let d = dist(mouseX, mouseY, x, y);
              if (d < focusRadius) {
                  // Focus dots remain large (16px to 8px)
                  let size = map(d, 0, focusRadius, 20, 10);
                  drawGradientDot(x, y, size, 255, false);
              } else {
                  // Blurred dots are now much smaller (4px)
                  drawGradientDot(x, y, 5, 255, true);
              }
          }
      }
  } else {
        // ABOUT PAGE: Flashlight Reveal
        let revealRadius = 150;
        for (let x = spacing / 2; x < width; x += spacing) {
            for (let y = spacing / 2; y < height; y += spacing) {
                let d = dist(mouseX, mouseY, x, y);
                if (d < revealRadius) {
                    let opacity = map(d, 0, revealRadius, 255, 0);
                    drawGradientDot(x, y, 10, opacity, false);
                }
            }
        }
    }

    push();
    blendMode(OVERLAY);
    image(grainImage, 0, 0);
    pop();
}

function drawGradientDot(x, y, size, masterOpacity, isBlurred) {
  let ctx = canvas.getContext('2d');
  let alphaMult = masterOpacity / 255;
  
  // For blurred dots, we use a smaller radius to keep them delicate
  let gradSize = isBlurred ? size * 1.5 : size / 2;
  let grad = ctx.createRadialGradient(x, y, 0, x, y, gradSize);
  
  if (isBlurred) {
      // Smaller, but clearly visible icy glow
      grad.addColorStop(0, `rgba(230, 245, 255, ${0.4 * alphaMult})`);
      grad.addColorStop(1, `rgba(230, 245, 255, 0)`);
  } else {
      grad.addColorStop(0, `rgba(255, 255, 255, ${1 * alphaMult})`); 
      grad.addColorStop(1, `rgba(180, 215, 255, ${0.4 * alphaMult})`);
  }
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  // Blurred dots have a smaller arc now to keep them tidy
  ctx.arc(x, y, isBlurred ? size * 1.2 : size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// SMOOTH NAVIGATION
document.querySelectorAll('.scroll-link').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            scrollContainer.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

function windowResized() { resizeCanvas(windowWidth, windowHeight); }