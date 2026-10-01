const canvas = document.querySelector('#galaxy');
const context = canvas.getContext('2d');
const scene = document.querySelector('#scene');
const stars = [];
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
let width = 0;
let height = 0;
let pixelRatio = 1;

function random(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function resize() {
  const bounds = canvas.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  createStars();
}

function createStars() {
  const rand = random(43721);
  const count = Math.min(2200, Math.floor((width * height) / 290));
  const radius = Math.min(width, height) * 0.47;
  stars.length = 0;

  for (let index = 0; index < count; index += 1) {
    const distance = Math.sqrt(rand()) * radius;
    const arm = index % 4;
    const angle = (arm * Math.PI) / 2 + distance * 0.012 + (rand() - 0.5) * 0.72;
    const spread = 0.18 + rand() * 0.82;

    stars.push({
      x: Math.cos(angle) * distance * spread,
      y: Math.sin(angle) * distance * spread * 0.66,
      size: rand() * 1.45 + 0.25,
      alpha: rand() * 0.65 + 0.2,
      tint: rand(),
      phase: rand() * Math.PI * 2,
      twinkleSpeed: 0.7 + rand() * 1.1,
    });
  }
}

function draw(time) {
  context.clearRect(0, 0, width, height);
  pointer.x += (pointer.targetX - pointer.x) * 0.045;
  pointer.y += (pointer.targetY - pointer.y) * 0.045;

  scene.style.setProperty('--tilt-x', `${pointer.x * 5}deg`);
  scene.style.setProperty('--tilt-y', `${pointer.y * -4}deg`);
  scene.style.setProperty('--float', `${pointer.y * -7}px`);

  const centerX = width / 2 + pointer.x * 26;
  const centerY = height / 2 + pointer.y * 20;
  const rotation = pointer.x * 0.075;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotation);

  const glow = context.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) * 0.46);
  glow.addColorStop(0, 'rgba(166, 214, 255, 0.2)');
  glow.addColorStop(0.22, 'rgba(74, 147, 255, 0.15)');
  glow.addColorStop(1, 'rgba(10, 24, 55, 0)');
  context.fillStyle = glow;
  context.fillRect(-width, -height, width * 2, height * 2);

  for (const star of stars) {
    const twinkle = 0.68 + Math.sin(time * 0.001 * star.twinkleSpeed + star.phase) * 0.32;
    const color = star.tint > 0.82 ? '174, 221, 255' : '218, 233, 255';
    context.fillStyle = `rgba(${color}, ${star.alpha * twinkle})`;
    context.beginPath();
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
  window.requestAnimationFrame(draw);
}

function moveWithPointer(event) {
  pointer.targetX = (event.clientX / width - 0.5) * 2;
  pointer.targetY = (event.clientY / height - 0.5) * 2;
}

function resetPointer() {
  pointer.targetX = 0;
  pointer.targetY = 0;
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', moveWithPointer, { passive: true });
window.addEventListener('pointerleave', resetPointer);

resize();
window.requestAnimationFrame(draw);
