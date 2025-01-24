const THREE = window.THREE;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('game'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb); // Set sky blue background

// Block types
const blockTypes = {
  dirt: { color: 0x8b4513, name: 'Dirt' },
  grass: { color: 0x55aa55, name: 'Grass' },
  stone: { color: 0x888888, name: 'Stone' },
  wood: { color: 0x6b4423, name: 'Wood' },
  leaves: { color: 0x2d5a27, name: 'Leaves' },
};

let currentBlockType = 'dirt';
const geometry = new THREE.BoxGeometry(1, 1, 1);
const blocks = new Set();

// Create materials for each block type
const materials = {};
for (const [type, data] of Object.entries(blockTypes)) {
  const texture = new THREE.CanvasTexture(createBlockTexture(data.color));
  materials[type] = new THREE.MeshPhongMaterial({
    map: texture,
    color: 0xffffff, // Use white so texture colors show properly
  });
}

// Create a simple textured pattern for blocks
function createBlockTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Fill base color
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, 64, 64);

  // Add some noise/texture
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  for (let i = 0; i < 64; i += 8) {
    for (let j = 0; j < 64; j += 8) {
      if (Math.random() > 0.5) {
        ctx.fillRect(i, j, 8, 8);
      }
    }
  }

  return canvas;
}

function createBlock(position) {
  const block = new THREE.Mesh(geometry, materials[currentBlockType]);
  block.userData.type = currentBlockType;
  block.position.copy(position);
  block.position.round(); // Snap to grid
  scene.add(block);
  blocks.add(block);
  document
    .getElementById('placeSound')
    .play()
    .catch(() => {}); // Ignore if sound fails
  return block;
}

// Cycle block type with number keys
document.addEventListener('keydown', (event) => {
  const num = parseInt(event.key);
  if (!isNaN(num) && num > 0 && num <= Object.keys(blockTypes).length) {
    currentBlockType = Object.keys(blockTypes)[num - 1];
    // Update block type display
    const blockInfo = document.getElementById('instructions');
    const selectedBlock = blockTypes[currentBlockType].name;
    const lastLine = `Selected: ${selectedBlock}`;
    if (blockInfo.innerHTML.includes('Selected:')) {
      blockInfo.innerHTML = blockInfo.innerHTML.replace(
        /Selected:.*$/,
        lastLine
      );
    } else {
      blockInfo.innerHTML += `<br>${lastLine}`;
    }
  }
});

// Create trees
function createTree(basePosition) {
  // Trunk
  for (let y = 0; y < 4; y++) {
    const pos = basePosition.clone().add(new THREE.Vector3(0, y, 0));
    currentBlockType = 'wood';
    createBlock(pos);
  }

  // Leaves
  currentBlockType = 'leaves';
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      for (let y = 3; y <= 5; y++) {
        const pos = basePosition.clone().add(new THREE.Vector3(x, y, z));
        createBlock(pos);
      }
    }
  }
}

// Create castle components
function createCastleWall(startPos, length, height, direction) {
  const wallBlocks = [];
  const dir = direction.clone().normalize();

  for (let i = 0; i < length; i++) {
    for (let y = 0; y < height; y++) {
      // Main wall
      currentBlockType = 'stone';
      const pos = startPos.clone().add(dir.clone().multiplyScalar(i));
      pos.y = y;
      wallBlocks.push(createBlock(pos));

      // Battlements on top
      if (y === height - 1 && i % 2 === 0) {
        const battlement = pos.clone();
        battlement.y = height;
        wallBlocks.push(createBlock(battlement));
      }
    }
  }
  return wallBlocks;
}

function createCastleTower(basePos, height) {
  const towerBlocks = [];
  const radius = 2;

  for (let y = 0; y < height; y++) {
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        if (Math.sqrt(x * x + z * z) <= radius) {
          currentBlockType = 'stone';
          const pos = basePos.clone().add(new THREE.Vector3(x, y, z));
          towerBlocks.push(createBlock(pos));
        }
      }
    }
  }

  // Add cone roof with wood
  currentBlockType = 'wood';
  const roofHeight = 3;
  for (let y = 0; y < roofHeight; y++) {
    const roofRadius = radius - (y / roofHeight) * radius;
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        if (Math.sqrt(x * x + z * z) <= roofRadius) {
          const pos = basePos.clone().add(new THREE.Vector3(x, height + y, z));
          towerBlocks.push(createBlock(pos));
        }
      }
    }
  }

  return towerBlocks;
}

// Create initial castle
const castleBasePos = new THREE.Vector3(0, 0, 0);
const wallHeight = 6;
const wallLength = 12;

// Create four walls
createCastleWall(
  castleBasePos,
  wallLength,
  wallHeight,
  new THREE.Vector3(1, 0, 0)
);
createCastleWall(
  castleBasePos,
  wallLength,
  wallHeight,
  new THREE.Vector3(0, 0, 1)
);
createCastleWall(
  castleBasePos.clone().add(new THREE.Vector3(wallLength - 1, 0, 0)),
  wallLength,
  wallHeight,
  new THREE.Vector3(0, 0, 1)
);
createCastleWall(
  castleBasePos.clone().add(new THREE.Vector3(0, 0, wallLength - 1)),
  wallLength,
  wallHeight,
  new THREE.Vector3(1, 0, 0)
);

// Create towers at corners
createCastleTower(castleBasePos, wallHeight + 2);
createCastleTower(
  castleBasePos.clone().add(new THREE.Vector3(wallLength - 1, 0, 0)),
  wallHeight + 2
);
createCastleTower(
  castleBasePos.clone().add(new THREE.Vector3(0, 0, wallLength - 1)),
  wallHeight + 2
);
createCastleTower(
  castleBasePos
    .clone()
    .add(new THREE.Vector3(wallLength - 1, 0, wallLength - 1)),
  wallHeight + 2
);

// Create gate in front wall
const gateWidth = 2;
const gateHeight = 4;
const gatePos = castleBasePos
  .clone()
  .add(new THREE.Vector3(wallLength / 2 - gateWidth / 2, 0, 0));
for (let x = 0; x < gateWidth; x++) {
  for (let y = gateHeight; y < wallHeight; y++) {
    currentBlockType = 'stone';
    createBlock(gatePos.clone().add(new THREE.Vector3(x, y, 0)));
  }
}

// Create keep in center
const keepSize = 4;
const keepHeight = wallHeight + 1;
const keepPos = castleBasePos
  .clone()
  .add(
    new THREE.Vector3(
      wallLength / 2 - keepSize / 2,
      0,
      wallLength / 2 - keepSize / 2
    )
  );
for (let x = 0; x < keepSize; x++) {
  for (let z = 0; z < keepSize; z++) {
    for (let y = 0; y < keepHeight; y++) {
      currentBlockType = 'stone';
      createBlock(keepPos.clone().add(new THREE.Vector3(x, y, z)));
    }
  }
}

// Create courtyard decorations
// Training grounds (dirt area)
currentBlockType = 'dirt';
for (let x = 2; x < 5; x++) {
  for (let z = 2; z < 5; z++) {
    createBlock(castleBasePos.clone().add(new THREE.Vector3(x, 0, z)));
  }
}

// Garden (grass and flowers)
currentBlockType = 'grass';
for (let x = 7; x < 10; x++) {
  for (let z = 2; z < 5; z++) {
    createBlock(castleBasePos.clone().add(new THREE.Vector3(x, 0, z)));
  }
}

// Well (stone circle with wood top)
currentBlockType = 'stone';
const wellCenter = castleBasePos.clone().add(new THREE.Vector3(3, 0, 8));
for (let y = 0; y < 2; y++) {
  createBlock(wellCenter.clone().add(new THREE.Vector3(0, y, 0)));
  createBlock(wellCenter.clone().add(new THREE.Vector3(1, y, 0)));
  createBlock(wellCenter.clone().add(new THREE.Vector3(0, y, 1)));
  createBlock(wellCenter.clone().add(new THREE.Vector3(1, y, 1)));
}
currentBlockType = 'wood';
createBlock(wellCenter.clone().add(new THREE.Vector3(0, 2, 0)));
createBlock(wellCenter.clone().add(new THREE.Vector3(1, 2, 0)));

// Create moat around castle
const moatWidth = 2;
const moatDepth = 2;
for (let x = -moatWidth; x < wallLength + moatWidth; x++) {
  for (let z = -moatWidth; z < wallLength + moatWidth; z++) {
    // Skip the actual castle area
    if (x >= 0 && x < wallLength && z >= 0 && z < wallLength) continue;
    // Create water-filled moat
    currentBlockType = 'stone';
    for (let y = 0; y > -moatDepth; y--) {
      createBlock(new THREE.Vector3(x, y, z));
    }
  }
}

// Create store building
function createStore(position) {
  // Main structure
  currentBlockType = 'wood';
  // Floor
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 4; z++) {
      createBlock(position.clone().add(new THREE.Vector3(x, 0, z)));
    }
  }

  // Walls
  for (let y = 1; y < 4; y++) {
    for (let x = 0; x < 5; x++) {
      createBlock(position.clone().add(new THREE.Vector3(x, y, 0)));
      createBlock(position.clone().add(new THREE.Vector3(x, y, 3)));
    }
    for (let z = 1; z < 3; z++) {
      createBlock(position.clone().add(new THREE.Vector3(0, y, z)));
      createBlock(position.clone().add(new THREE.Vector3(4, y, z)));
    }
  }

  // Roof
  currentBlockType = 'stone';
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 4; z++) {
      createBlock(position.clone().add(new THREE.Vector3(x, 4, z)));
    }
  }

  // Door
  currentBlockType = 'wood';
  for (let y = 1; y < 3; y++) {
    createBlock(position.clone().add(new THREE.Vector3(2, y, 0)));
  }

  // Counter
  currentBlockType = 'wood';
  for (let x = 1; x < 4; x++) {
    createBlock(position.clone().add(new THREE.Vector3(x, 1, 2)));
  }

  // Shelves on back wall
  for (let x = 1; x < 4; x++) {
    createBlock(position.clone().add(new THREE.Vector3(x, 2, 3)));
  }

  // Display items (using different block types as merchandise)
  currentBlockType = 'stone';
  createBlock(position.clone().add(new THREE.Vector3(1, 2, 2)));
  currentBlockType = 'dirt';
  createBlock(position.clone().add(new THREE.Vector3(2, 2, 2)));
  currentBlockType = 'grass';
  createBlock(position.clone().add(new THREE.Vector3(3, 2, 2)));
}

// Create store near the castle
createStore(new THREE.Vector3(-8, 0, 4));

// Create initial terrain with trees and path
for (let x = -20; x <= 20; x += 4) {
  for (let z = -10; z <= 10; z += 4) {
    // Create stone path leading to castle gate
    if (Math.abs(z) < 4 && x < 0) {
      currentBlockType = 'stone';
      createBlock(new THREE.Vector3(x, 0, z));
    }
    // Add trees away from the path
    else if (Math.random() < 0.3) {
      // 30% chance of tree at each spot
      createTree(new THREE.Vector3(x, 0, z));
    }
  }
}

// Create initial block for player reference
createBlock(new THREE.Vector3(0, 0, 0));

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x808080)); // Brighter ambient light

// Day/night cycle
let timeOfDay = 0;
const dayLength = 900; // 900 seconds = 15 minutes per day
function updateDayNightCycle() {
  timeOfDay = (timeOfDay + 1) % dayLength;
  const time = timeOfDay / dayLength;

  // Adjust sky color
  const skyColorDay = new THREE.Color(0x87ceeb); // Sky blue
  const skyColorNight = new THREE.Color(0x1a2b3c); // Dark blue
  const skyColor = skyColorDay.lerp(skyColorNight, Math.sin(time * Math.PI));
  scene.background = skyColor;

  // Adjust light intensity
  light.intensity = Math.cos(time * Math.PI) * 0.5 + 0.5;
}

// Add sky background
scene.background = new THREE.Color(0x87ceeb);

// Create player model
const playerBody = new THREE.Group();

// Body
const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.3);
const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3366cc });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.9;

// Head
const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.5;

// Sunglasses
const glassesGeometry = new THREE.BoxGeometry(0.45, 0.15, 0.1);
const glassesMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
glasses.position.z = 0.2;
head.add(glasses);

// Party hat (cone shape using blocks)
currentBlockType = 'grass';
const hat = new THREE.Group();
for (let y = 0; y < 3; y++) {
  const hatGeometry = new THREE.BoxGeometry(0.3 - y * 0.1, 0.1, 0.3 - y * 0.1);
  const hatMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
  const hatPiece = new THREE.Mesh(hatGeometry, hatMaterial);
  hatPiece.position.y = 0.25 + y * 0.1;
  hat.add(hatPiece);
}
hat.position.y = 0.3;
head.add(hat);

// Fire particles on head
const fireParticles = [];
const fireParticleCount = 20;
const fireParticleMaterial = new THREE.MeshBasicMaterial({ color: 0xff4400 });

function updateFireParticles() {
  // Remove old particles
  fireParticles.forEach((p) => {
    if (p.position.y > head.position.y + 2) {
      scene.remove(p);
      const index = fireParticles.indexOf(p);
      if (index > -1) fireParticles.splice(index, 1);
    }
  });

  // Add new particles
  while (fireParticles.length < fireParticleCount) {
    const particle = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      fireParticleMaterial
    );
    particle.position.copy(head.getWorldPosition(new THREE.Vector3()));
    particle.position.y += 0.2;
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      0.1,
      (Math.random() - 0.5) * 0.05
    );
    scene.add(particle);
    fireParticles.push(particle);
  }

  // Update particle positions
  fireParticles.forEach((particle) => {
    particle.position.add(particle.velocity);
  });
}

// Arms
const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
const armMaterial = new THREE.MeshPhongMaterial({ color: 0x3366cc });
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(0.4, 1.1, 0);
const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(-0.4, 1.1, 0);

// Legs
const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
const legMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.set(0.2, 0.3, 0);
const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.set(-0.2, 0.3, 0);

// Add parts to player
playerBody.add(body);
playerBody.add(head);
playerBody.add(leftArm);
playerBody.add(rightArm);
playerBody.add(leftLeg);
playerBody.add(rightLeg);
const player = playerBody;
player.position.set(2, 1, 5);
scene.add(player);

// Create cat model
const catBody = new THREE.Group();

// Body
const catBodyGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
const catBodyMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Gray cat
const catBodyMesh = new THREE.Mesh(catBodyGeometry, catBodyMaterial);
catBodyMesh.position.y = 0.3;

// Head
const catHeadGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const catHeadMesh = new THREE.Mesh(catHeadGeometry, catBodyMaterial);
catHeadMesh.position.set(0, 0.5, 0.25);

// Ears (triangular prisms using boxes)
const earGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const leftEar = new THREE.Mesh(earGeometry, catBodyMaterial);
const rightEar = new THREE.Mesh(earGeometry, catBodyMaterial);
leftEar.position.set(0.1, 0.1, 0);
rightEar.position.set(-0.1, 0.1, 0);
catHeadMesh.add(leftEar);
catHeadMesh.add(rightEar);

// Tail (series of small boxes)
const tailGroup = new THREE.Group();
for (let i = 0; i < 5; i++) {
  const tailSegment = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.1),
    catBodyMaterial
  );
  tailSegment.position.set(0, 0, -i * 0.1);
  tailGroup.add(tailSegment);
}
tailGroup.position.set(0, 0.3, -0.3);
tailGroup.rotation.x = Math.PI / 4; // Tail up at 45 degrees

// Add all parts to cat
catBody.add(catBodyMesh);
catBody.add(catHeadMesh);
catBody.add(tailGroup);

// Position cat near player
catBody.position.set(4, 1, 5);
scene.add(catBody);

// Position camera behind player
camera.position.set(2, 3, 8);
camera.lookAt(player.position);

// Movement and rotation controls
const moveSpeed = 0.1;
const rotateSpeed = 0.02;
const keysPressed = {};
let isRotating = false;
let lastMouseX = 0;

document.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

// Block interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let highlightBox = null;

// Create highlight box
const highlightGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);
const highlightMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  opacity: 0.3,
  transparent: true,
  side: THREE.FrontSide,
});

function handleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([...blocks]);

  if (event.button === 0) {
    // Left click
    if (intersects.length > 0) {
      // Get block position by adding normal to intersection object position
      const position = intersects[0].object.position
        .clone()
        .add(intersects[0].face.normal);
      createBlock(position);
    } else {
      // Place block at a fixed distance when clicking in empty space
      const direction = raycaster.ray.direction;
      const position = camera.position.clone().add(direction.multiplyScalar(5));
      createBlock(position);
    }
  } else if (event.button === 2 && intersects.length > 0) {
    // Right click
    const block = intersects[0].object;
    createBreakParticles(block.position, block.userData.type);
    scene.remove(block);
    blocks.delete(block);
    document
      .getElementById('breakSound')
      .play()
      .catch(() => {}); // Ignore if sound fails
  }
}

function createBreakParticles(position, blockType) {
  const particleCount = 8;
  const particles = [];
  const material = materials[blockType];

  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      material
    );

    particle.position.copy(position);
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.2,
      (Math.random() - 0.5) * 0.3
    );

    scene.add(particle);
    particles.push(particle);

    // Remove particle after 1 second
    setTimeout(() => {
      scene.remove(particle);
    }, 1000);
  }

  // Animate particles
  const startTime = Date.now();
  function animateParticles() {
    const elapsed = Date.now() - startTime;
    if (elapsed > 1000) return;

    particles.forEach((particle) => {
      particle.position.add(particle.velocity);
      particle.velocity.y -= 0.01; // Gravity
    });

    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (isRotating) {
    const deltaX = event.clientX - lastMouseX;
    camera.rotation.y -= deltaX * rotateSpeed;
    lastMouseX = event.clientX;
  }
});

window.addEventListener('mousedown', (event) => {
  if (event.button === 1) {
    // Middle mouse button
    isRotating = true;
    lastMouseX = event.clientX;
  } else {
    handleClick(event);
  }
});

window.addEventListener('mouseup', () => {
  isRotating = false;
});

window.addEventListener('mousemove', (event) => {
  if (isRotating) {
    const deltaX = event.clientX - lastMouseX;
    camera.rotation.y -= deltaX * rotateSpeed;
    lastMouseX = event.clientX;
  }
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

let walkCycle = 0;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.005;

function handleMovement() {
  // Get the camera's forward and right vectors for movement direction
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
    camera.quaternion
  );
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  forward.y = 0; // Keep movement horizontal
  right.y = 0;
  forward.normalize();
  right.normalize();

  // Move player relative to camera direction
  const isMoving =
    keysPressed['w'] ||
    keysPressed['s'] ||
    keysPressed['a'] ||
    keysPressed['d'];
  if (keysPressed['w']) player.position.addScaledVector(forward, moveSpeed);
  if (keysPressed['s']) player.position.addScaledVector(forward, -moveSpeed);
  if (keysPressed['a']) player.position.addScaledVector(right, -moveSpeed);
  if (keysPressed['d']) player.position.addScaledVector(right, moveSpeed);

  // Walking animation
  if (isMoving) {
    walkCycle += 0.15;
    const leftLeg = player.children[4];
    const rightLeg = player.children[5];
    const leftArm = player.children[2];
    const rightArm = player.children[3];

    // Legs and arms swing in opposite directions for natural walking
    leftLeg.rotation.x = Math.sin(walkCycle) * 0.5;
    rightLeg.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
    leftArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
    rightArm.rotation.x = Math.sin(walkCycle) * 0.5;
  }

  // Jump physics
  if (keysPressed[' '] && !isJumping) {
    jumpVelocity = 0.3;
    isJumping = true;
  }

  if (isJumping) {
    player.position.y += jumpVelocity;
    jumpVelocity -= gravity;

    // Check for landing
    if (player.position.y <= 1) {
      player.position.y = 1;
      isJumping = false;
      jumpVelocity = 0;
    }
  }

  if (keysPressed['shift']) {
    player.position.y -= moveSpeed;
  }

  // Update camera position to follow player
  const cameraOffset = new THREE.Vector3(0, 2, 3);
  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);
}

function updateHighlight() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([...blocks]);

  if (intersects.length > 0) {
    const position = intersects[0].object.position
      .clone()
      .add(intersects[0].face.normal);
    if (!highlightBox) {
      highlightBox = new THREE.Mesh(highlightGeometry, highlightMaterial);
      scene.add(highlightBox);
    }
    highlightBox.position.copy(position).round();
  } else if (highlightBox) {
    scene.remove(highlightBox);
    highlightBox = null;
  }
}

function animate() {
  requestAnimationFrame(animate);
  handleMovement();
  updateHighlight();
  updateDayNightCycle();
  updateFireParticles();
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
