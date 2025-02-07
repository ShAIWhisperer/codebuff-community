import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export default function Minecraft() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current; // Store ref value in variable for cleanup

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 100);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.object);

    const moveState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jumping: false,
      onGround: false,
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
    };
    const GRAVITY = 30.0;
    const JUMP_FORCE = 12.0;
    const MOVE_SPEED = 10.0;

    const inventory = { count: 0 };
    function updateInventoryUI() {
      const invElement = document.getElementById("inventory");
      if (invElement) {
        invElement.innerText = "Inventory: " + inventory.count;
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveState.forward = true;
          break;
        case "ArrowDown":
        case "KeyS":
          moveState.backward = true;
          break;
        case "ArrowLeft":
        case "KeyA":
          moveState.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          moveState.right = true;
          break;
        case "Space":
          if (moveState.onGround) {
            moveState.velocity.y = JUMP_FORCE;
            moveState.onGround = false;
          }
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveState.forward = false;
          break;
        case "ArrowDown":
        case "KeyS":
          moveState.backward = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          moveState.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          moveState.right = false;
          break;
      }
    };

    mount.addEventListener("click", () => {
      controls.lock();
    });

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(100, 100, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const blockSize = 1;
    const textureLoader = new THREE.TextureLoader();

    const grassTopTexture = textureLoader.load("/textures/grass.png");
    const grassSideTexture = textureLoader.load("/textures/dirt.png");
    const dirtTexture = textureLoader.load("/textures/dirt.png");
    const stoneTexture = textureLoader.load("/textures/stone.png");

    [grassTopTexture, grassSideTexture, dirtTexture, stoneTexture].forEach(
      (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.repeat.set(1, 1);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
      }
    );

    const stoneMaterial = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      roughness: 1,
      metalness: 0,
    });

    const dirtMaterial = new THREE.MeshStandardMaterial({
      map: dirtTexture,
      roughness: 1,
      metalness: 0,
    });

    const grassMaterials = [
      new THREE.MeshStandardMaterial({ map: grassSideTexture }), // right
      new THREE.MeshStandardMaterial({ map: grassSideTexture }), // left
      new THREE.MeshStandardMaterial({ map: grassTopTexture }), // top
      new THREE.MeshStandardMaterial({ map: dirtTexture }), // bottom
      new THREE.MeshStandardMaterial({ map: grassSideTexture }), // front
      new THREE.MeshStandardMaterial({ map: grassSideTexture }), // back
    ];

    const blockGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const blocks: THREE.Mesh[] = [];

    const gridSize = 32;
    const maxHeight = 12;

    function noise(x: number, z: number) {
      return (
        Math.sin(x * 0.3) * Math.cos(z * 0.2) * 2 +
        Math.sin(x * 0.1 + z * 0.5) * 3 +
        Math.cos((x + z) * 0.5) * 2
      );
    }

    for (let i = -Math.floor(gridSize / 2); i < Math.floor(gridSize / 2); i++) {
      for (
        let j = -Math.floor(gridSize / 2);
        j < Math.floor(gridSize / 2);
        j++
      ) {
        const height = Math.max(1, Math.floor(maxHeight / 2 + noise(i, j)));

        for (let y = 0; y < height; y++) {
          let material;
          if (y === height - 1) {
            material = grassMaterials;
          } else if (y >= height - 3) {
            material = dirtMaterial;
          } else {
            material = stoneMaterial;
          }

          const block = new THREE.Mesh(blockGeo, material);
          block.position.set(i * blockSize, y, j * blockSize);
          block.castShadow = true;
          block.receiveShadow = true;
          scene.add(block);
          blocks.push(block);
        }
      }
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let lastMineTime = 0;
    const MINE_COOLDOWN = 250;

    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;

      const currentTime = performance.now();
      if (currentTime - lastMineTime < MINE_COOLDOWN) return;

      mouse.set(0, 0);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(blocks);
      if (intersects.length > 0) {
        const hitBlock = intersects[0].object as THREE.Mesh;
        scene.remove(hitBlock);
        const index = blocks.indexOf(hitBlock);
        if (index > -1) blocks.splice(index, 1);
        inventory.count++;
        updateInventoryUI();
        lastMineTime = currentTime;
      }
    }
    window.addEventListener("mousedown", onMouseDown);

    function onRightMouseDown(event: MouseEvent) {
      event.preventDefault();
      if (inventory.count <= 0) return;

      mouse.set(0, 0);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(blocks);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const normal = intersect.face?.normal;
        if (!normal) return;

        const newBlockPos = new THREE.Vector3(
          Math.round(intersect.point.x + normal.x * 0.5),
          Math.round(intersect.point.y + normal.y * 0.5),
          Math.round(intersect.point.z + normal.z * 0.5)
        );

        const exists = blocks.some(
          (b) =>
            Math.abs(b.position.x - newBlockPos.x) < 0.1 &&
            Math.abs(b.position.y - newBlockPos.y) < 0.1 &&
            Math.abs(b.position.z - newBlockPos.z) < 0.1
        );

        if (exists) return;

        const block = new THREE.Mesh(blockGeo, grassMaterials);
        block.position.copy(newBlockPos);
        block.castShadow = true;
        block.receiveShadow = true;
        scene.add(block);
        blocks.push(block);
        inventory.count--;
        updateInventoryUI();
      }
    }
    window.addEventListener("contextmenu", onRightMouseDown);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onWindowResize);

    let dayTime = 0;
    const DAY_LENGTH = 600;

    function updateDayNightCycle(delta: number) {
      dayTime = (dayTime + delta) % DAY_LENGTH;
      const time = dayTime / DAY_LENGTH;

      const angle = time * Math.PI * 2;
      sunLight.position.x = Math.cos(angle) * 100;
      sunLight.position.y = Math.sin(angle) * 100;

      const skyColor = new THREE.Color();
      if (time < 0.25 || time > 0.75) {
        skyColor.setRGB(0.1, 0.1, 0.3);
        sunLight.intensity = 0.2;
        ambientLight.intensity = 0.3;
      } else {
        skyColor.setRGB(0.529, 0.808, 0.922);
        sunLight.intensity = 0.8;
        ambientLight.intensity = 0.6;
      }
      scene.background = skyColor;
      if (scene.fog) {
        scene.fog.color = skyColor;
      }
    }

    function getTerrainHeight(x: number, z: number): number {
      const i = Math.round(x);
      const j = Math.round(z);
      return Math.max(1, Math.floor(maxHeight / 2 + noise(i, j)));
    }

    let prevTime = performance.now();
    function animate() {
      const time = performance.now();
      const delta = (time - prevTime) / 1000;

      updateDayNightCycle(delta);

      moveState.velocity.y -= GRAVITY * delta;
      const pos = controls.object.position;
      
      // Calculate potential new positions
      const potentialX = pos.x + moveState.direction.x * MOVE_SPEED * delta;
      const potentialZ = pos.z + moveState.direction.z * MOVE_SPEED * delta;

      // Get current and potential terrain heights
      const currentHeight = getTerrainHeight(pos.x, pos.z);
      const potentialHeightX = getTerrainHeight(potentialX, pos.z);
      const potentialHeightZ = getTerrainHeight(pos.x, potentialZ);

      // Ground collision check
      if (pos.y <= currentHeight + 1) {
        moveState.velocity.y = 0;
        pos.y = currentHeight + 1;
        moveState.onGround = true;
      } else {
        moveState.onGround = false;
      }

      // Update movement direction
      moveState.direction.z = Number(moveState.forward) - Number(moveState.backward);
      moveState.direction.x = Number(moveState.right) - Number(moveState.left);
      moveState.direction.normalize();

      // Block collision checks - only prevent movement if trying to move to higher terrain
      if (potentialHeightX <= currentHeight) {
        if (moveState.forward || moveState.backward) {
          controls.moveForward(moveState.direction.z * MOVE_SPEED * delta);
        }
      }
      if (potentialHeightZ <= currentHeight) {
        if (moveState.left || moveState.right) {
          controls.moveRight(moveState.direction.x * MOVE_SPEED * delta);
        }
      }

      // Apply gravity
      controls.object.position.y += moveState.velocity.y * delta;

      renderer.render(scene, camera);
      prevTime = time;
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("contextmenu", onRightMouseDown);
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
      <div
        id="inventory"
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          padding: "8px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          borderRadius: "4px",
          fontFamily: "monospace",
        }}
      >
        Inventory: 0
      </div>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "20px",
          height: "20px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "0",
            width: "100%",
            height: "2px",
            backgroundColor: "white",
            transform: "translateY(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "0",
            width: "2px",
            height: "100%",
            backgroundColor: "white",
            transform: "translateX(-50%)",
          }}
        />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          borderRadius: "4px",
          fontFamily: "monospace",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <div>Click to start</div>
        <div>WASD / Arrow Keys - Move</div>
        <div>Space - Jump</div>
        <div>Left Click - Mine</div>
        <div>Right Click - Place Block</div>
        <div>ESC - Pause</div>
      </div>
    </>
  );
}
