/* main.js – Body Shape Calculator & Dual Image Visualizer */

/* ========== ELEMENTS ========== */
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

const frontView = document.getElementById("frontView");
const backView = document.getElementById("backView");

/* ========== DEFAULTS ========== */
if (unitToggle) {
  unitToggle.value = "in";
  updateUnitLabels();
}
[heightEl, weightEl, bustEl, waistEl, hipsEl].forEach(el => {
  if (el) el.step = "0.1";
});

/* ========== UNIT LABELS ========== */
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

/* ========== AUTO CONVERT ========== */
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

/* ========== BODY TYPE DETECTION ========== */
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

/* ========== IMAGE VISUALIZER (Front & Back) ========== */
/* ========== IMAGE VISUALIZER (Front & Back) WITH FADE EFFECT ========== */
function updateBodyVisualizer(bodyType) {
  if (!frontView || !backView) return;

  const basePath = "https://femalebodyshape.infinityfree.me/assets/models";
  const typeName = bodyType.toLowerCase();
  const frontImg = `${basePath}/${typeName}-front.png`;
  const backImg = `${basePath}/${typeName}-back.png`;

  // Add fade-out class
  frontView.classList.add("fade-out");
  backView.classList.add("fade-out");

  // Preload new images
  const front = new Image();
  const back = new Image();
  front.src = frontImg;
  back.src = backImg;

  front.onload = () => {
    setTimeout(() => {
      frontView.src = front.src;
      frontView.alt = `${bodyType} body front view`;
      frontView.classList.remove("fade-out");
      frontView.classList.add("fade-in");
    }, 200);
  };

  back.onload = () => {
    setTimeout(() => {
      backView.src = back.src;
      backView.alt = `${bodyType} body back view`;
      backView.classList.remove("fade-out");
      backView.classList.add("fade-in");
    }, 200);
  };

  // Remove fade-in after animation ends to allow re-trigger later
  setTimeout(() => {
    frontView.classList.remove("fade-in");
    backView.classList.remove("fade-in");
  }, 1000);
}


/* ========== CALCULATE BUTTON ========== */
if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    let bust = parseFloat(bustEl.value);
    let waist = parseFloat(waistEl.value);
    let hips = parseFloat(hipsEl.value);
    let heightVal = parseFloat(heightEl.value);

    if (!bust || !waist || !hips) {
      alert("Please enter bust, waist, and hips values.");
      return;
    }

    // Convert units if cm
    if (unitToggle && unitToggle.value === "cm") {
      bust /= 2.54;
      waist /= 2.54;
      hips /= 2.54;
      if (heightVal) heightVal = (heightVal / 2.54) / 12;
    } else {
      if (heightVal && heightVal >= 8) heightVal = heightVal / 12;
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

    // Smooth scroll to result
    setTimeout(() => {
      bodyVisualizer.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 3500);
    setTimeout(() => {
      resultImg.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);

    // Update front/back visualizer
    updateBodyVisualizer(result.type);
  });
}

/* ========== RESET BUTTON ========== */
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    [bustEl, waistEl, hipsEl].forEach(i => (i.value = ""));
    resultTitle.textContent = "Your body type will appear here";
    resultDesc.textContent =
      "Enter values and click Calculate to see your classification.";
    bodyTypeLink.href = "#";
    resultImg.src = "";
    resultImg.style.display = "none";

    // Reset visualizer to default placeholder
    if (frontView && backView) {
      frontView.src = "assets/models/default-front.png";
      backView.src = "assets/models/default-back.png";
    }
  });
}

/* ========== NAVIGATION & DROPDOWNS ========== */
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
