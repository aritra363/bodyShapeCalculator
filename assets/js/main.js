/* main.js – Body Shape Calculator & Visualizer */

let scene, camera, renderer, bodyMesh;

// ---------- ELEMENTS ----------
const heightEl = document.getElementById("height");
const weightEl = document.getElementById("weight");
const bustEl = document.getElementById("bust");
const waistEl = document.getElementById("waist");
const hipsEl = document.getElementById("hips");
const calcBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const resultTitle = document.getElementById("bodyTypeTitle");
const resultDesc = document.getElementById("bodyTypeDesc");
const bodyTypeLink = document.getElementById("bodyTypePageLink");
const unitToggle = document.getElementById("unitToggle");
const resultImg = document.getElementById("resultImage");

// ---------- DEFAULTS ----------
if (unitToggle) {
  unitToggle.value = "in";
  updateUnitLabels();
}
[heightEl, weightEl, bustEl, waistEl, hipsEl].forEach(el => {
  if (el) el.step = "0.1";
});

// ---------- UNIT LABELS ----------
function updateUnitLabels() {
  const hints = document.querySelectorAll(".hint");
  if (!hints.length) return;
  const unit = unitToggle.value;
  hints[0].textContent = "in";
  hints[1].textContent = "kg";
  hints[2].textContent = unit;
  hints[3].textContent = unit;
  hints[4].textContent = unit;
}

// ---------- AUTO CONVERT ----------
if (unitToggle) {
  unitToggle.addEventListener("change", () => {
    const to = unitToggle.value;
    const conv = (v, fn) => (v ? fn(parseFloat(v)).toFixed(1) : "");
    if (to === "cm") {
      bustEl.value = conv(bustEl.value, v => v * 2.54);
      waistEl.value = conv(waistEl.value, v => v * 2.54);
      hipsEl.value = conv(hipsEl.value, v => v * 2.54);
    } else {
      bustEl.value = conv(bustEl.value, v => v / 2.54);
      waistEl.value = conv(waistEl.value, v => v / 2.54);
      hipsEl.value = conv(hipsEl.value, v => v / 2.54);
    }
    updateUnitLabels();
  });
}

// ---------- BODY TYPE DETECTION ----------
function detectBodyType(bust, waist, hips) {
  const whr = waist / hips;
  let type = "Rectangle";
  let desc =
    "Balanced proportions with little difference between bust, waist, and hips.";

  if (whr > 0.8 && bust > hips + 2) {
    type = "Apple";
    desc = "Broader shoulders and bust than hips – Apple body shape.";
  } else if (hips > bust + 2 && whr < 0.8) {
    type = "Pear";
    desc = "Fuller hips compared to bust with defined waist – Pear body shape.";
  } else if (Math.abs(bust - hips) <= 2 && whr < 0.75) {
    type = "Hourglass";
    desc = "Balanced bust and hips with smaller waist – Hourglass body shape.";
  } else if (bust < hips && whr >= 0.75 && whr <= 0.85) {
    type = "Spoon";
    desc = "Hips slightly larger than bust – Spoon body shape.";
  }
  return { type, desc };
}

// ---------- 3D SETUP ----------
function init3D() {
  const container = document.getElementById("viewer3d");
  if (!container) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(0, 1, 1);
  scene.add(dir);

  const geometry = new THREE.CylinderGeometry(1, 1.1, 3, 24);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffb6c1,
    flatShading: true
  });
  bodyMesh = new THREE.Mesh(geometry, material);
  scene.add(bodyMesh);

  camera.position.z = 5;
  window.addEventListener("resize", onResize);
  animate();
}

function onResize() {
  const container = document.getElementById("viewer3d");
  if (!container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  if (bodyMesh) bodyMesh.rotation.y += 0.005;
  renderer.render(scene, camera);
}

function update3D(bust, waist, hips) {
  if (!bodyMesh) return;
  const avg = (bust + waist + hips) / 3;
  const bustRatio = bust / avg;
  const waistRatio = waist / avg;
  const hipRatio = hips / avg;
  bodyMesh.scale.set(hipRatio * 1.1, 1, bustRatio * 1.1);
  bodyMesh.material.color.setHSL(0.95 - waistRatio * 0.2, 0.6, 0.65);
}

// ---------- CALCULATE ----------
if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    let bust = parseFloat(bustEl.value);
    let waist = parseFloat(waistEl.value);
    let hips = parseFloat(hipsEl.value);
    if (!bust || !waist || !hips) {
      alert("Please enter bust, waist, and hips values.");
      return;
    }

    if (unitToggle.value === "cm") {
      bust /= 2.54;
      waist /= 2.54;
      hips /= 2.54;
    }

    const result = detectBodyType(bust, waist, hips);
    resultTitle.textContent = `Your Body Type: ${result.type}`;
    resultDesc.textContent = result.desc;
    bodyTypeLink.href = `https://femalebodyshape.infinityfree.me/body-types/${result.type.toLowerCase()}-body-shape.html`;
    bodyTypeLink.textContent = `Learn more about the ${result.type} Body Shape →`;

    const imgName = result.type.replace(/\s+/g, "-") + ".png";
    const imgPath = `https://femalebodyshape.infinityfree.me/assets/img/bodytypes/${imgName}`;
    resultImg.src = imgPath;
    resultImg.alt = `${result.type} body shape image`;
    resultImg.style.display = "block";

    update3D(bust, waist, hips);
  });
}

// ---------- RESET ----------
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    [bustEl, waistEl, hipsEl].forEach(i => (i.value = ""));
    resultTitle.textContent = "Your body type will appear here";
    resultDesc.textContent = "Enter values and click Calculate to see your classification.";
    bodyTypeLink.href = "#";
    resultImg.src = "";
    resultImg.style.display = "none";
    update3D(1, 1, 1);
  });
}

// ---------- NAVIGATION BEHAVIOR ----------
document.addEventListener("DOMContentLoaded", () => {
  const mq = window.matchMedia("(max-width: 768px)");
  const desktopNav = document.querySelector(".desktop-nav");
  const mobileMenu = document.querySelector(".mobile-menu");

  function toggleMenu() {
    if (!desktopNav || !mobileMenu) return;
    if (mq.matches) {
      desktopNav.style.display = "none";
      mobileMenu.style.display = "block";
    } else {
      desktopNav.style.display = "flex";
      mobileMenu.style.display = "none";
    }
  }

  toggleMenu();
  mq.addListener(toggleMenu);

  // mobile dropdown tap support
  const dropdowns = document.querySelectorAll(".dropdown > .dropbtn");
  dropdowns.forEach(btn => {
    btn.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const content = btn.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          document
            .querySelectorAll(".dropdown-content")
            .forEach(dc => (dc.style.display = "none"));
          content.style.display = "block";
        }
      }
    });
  });
});

// ---------- INIT 3D ----------
window.addEventListener("load", init3D);
