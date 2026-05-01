// ==UserScript==
// @name         Airbus/boeing style Toggle Panel
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  GeoFS Overhead Panel Addon adds realistic, interactive overheads for multiple aircraft, including Airbus, Boeing, MD‑11, and the L‑1011 TriStar. Features authentic switch types, system groups, pop‑ups, and aircraft‑specific layouts for a more immersive cockpit experience.
// @author       Twinkie Aviation/Copilot
// @match        https://www.geo-fs.com/geofs.php?v=3.9
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==
// ======================================================================
// MULTI-AIRCRAFT OVERHEAD SYSTEM
// Glass Cockpit Selector (D3) + Full-Width Overlay (S3)
// Hybrid Realism (R1/2) + Unique Themes (T1)
// 14 Aircraft Supported
// ======================================================================

(function () {

  // ============================================================
  //  SOUND ENGINE
  // ============================================================
  const clickSound = new Audio(
    "https://cdn.pixabay.com/download/audio/2022/03/15/audio_7b4c7b4c7e.mp3?filename=click-124467.mp3"
  );
  clickSound.volume = 0.35;

  const chimeSound = new Audio(
    "https://cdn.pixabay.com/download/audio/2021/08/04/audio_4b3c3b3c3c.mp3?filename=ding-6101.mp3"
  );
  chimeSound.volume = 0.5;

  function playClick() {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  function playChime() {
    chimeSound.currentTime = 0;
    chimeSound.play();
  }

  // ============================================================
  //  POPUP ENGINE (ECAM/EICAS)
  // ============================================================
  function showPopup(message, type = "airbus") {
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.bottom = "40px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.padding = "10px 18px";
    popup.style.borderRadius = "8px";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.fontSize = "15px";
    popup.style.zIndex = 999999;

    if (type === "airbus") {
      popup.style.background = "rgba(0,0,0,0.85)";
      popup.style.color = "lime";
    } else if (type === "boeing") {
      popup.style.background = "rgba(20,20,20,0.9)";
      popup.style.color = "orange";
    } else {
      popup.style.background = "rgba(0,0,0,0.85)";
      popup.style.color = "cyan";
    }

    popup.innerText = message;
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 2500);
  }




  let currentAircraft = "Boeing 777";

  const themes = {
  "Airbus A320": "#003366",
  "Airbus A300": "#003366",
  "Airbus A330": "#003366",
  "Airbus A340": "#003366",
  "Airbus A350": "#003366",
  "Boeing 737": "#2b2b2b",
  "Boeing 747": "#2b2b2b",
  "Boeing 757": "#2b2b2b",
  "Boeing 767": "#2b2b2b",
  "Boeing 777": "#2b2b2b",
  "Boeing 787": "#2b2b2b",
  "Dash-8 Q400": "#1f4b2f",
  "Bombardier CRJ-700": "#1f1f1f",
  "ATR-72": "#1f4b2f",
  "Airbus A380": "#003366",
  "Airbus A220": "#003366",
  "Embraer E190": "#1f1f1f",
  "Embraer ERJ170": "#1f1f1f",
  "Embraer E175": "#1f1f1f",
  "Embraer E195-E2": "#1f1f1f",
  "Bombardier CRJ-200": "#1f1f1f",
  "MD-11": "#343A40",
  "DC-3": "#343A40",
  "L1011TriStar": "#303438",
  "ATR-42": "#1f4b2f"
};



  // ============================================================
  //  PANEL CONTAINER
  // ============================================================
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.top = "60px";
  panel.style.right = "20px";
  panel.style.width = "380px";
  panel.style.background = themes[currentAircraft];
  panel.style.color = "white";
  panel.style.padding = "10px";
  panel.style.borderRadius = "12px";
  panel.style.fontFamily = "Arial, sans-serif";
  panel.style.zIndex = 9999;
  panel.style.boxShadow = "0 0 12px rgba(0,0,0,0.6)";

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 id="oh-title" style="margin:4px 0;">${currentAircraft} OVERHEAD</h3>

      <button id="aircraft-select-btn" style="
        background:#111; color:white; border:none; padding:4px 10px;
        border-radius:6px; cursor:pointer; font-size:13px;">
        SELECT AIRCRAFT
      </button>

      <button id="oh-minimize" style="
        background:#111; color:white; border:none; padding:3px 8px;
        border-radius:6px; cursor:pointer; font-size:14px;">–</button>
    </div>
  `;

  const panelContent = document.createElement("div");
  panel.appendChild(panelContent);
  document.body.appendChild(panel);
const style = document.createElement("style");
style.innerHTML = `
  .switch-anim {
    transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }
  .switch-on {
    transform: translateY(-2px);
    background: #4caf50 !important;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.7);
  }
  .switch-off {
    transform: translateY(2px);
    background: #333 !important;
    box-shadow: none;
  }
`;
document.head.appendChild(style);


 // ============================================================
// CATEGORY-BASED SELECTOR (Collapsible)
// ============================================================

const selectorOverlay = document.createElement("div");
selectorOverlay.style.position = "fixed";
selectorOverlay.style.top = "0";
selectorOverlay.style.left = "0";
selectorOverlay.style.width = "100%";
selectorOverlay.style.height = "100%";
selectorOverlay.style.background = "rgba(0,0,0,0.85)";
selectorOverlay.style.zIndex = "99999";
selectorOverlay.style.display = "none";
selectorOverlay.style.flexDirection = "column";
selectorOverlay.style.alignItems = "center";
selectorOverlay.style.paddingTop = "40px";
selectorOverlay.style.color = "white";
selectorOverlay.style.fontFamily = "Arial, sans-serif";

selectorOverlay.innerHTML = `
  <h2 style="margin-bottom:20px; font-size:26px;">SELECT AIRCRAFT</h2>
`;

// CATEGORY DATA
const categories = {
  "Airbus": [
    "Airbus A220",
    "Airbus A300",
    "Airbus A320",
    "Airbus A330",
    "Airbus A340",
    "Airbus A350",
    "Airbus A380"
  ],

  "Boeing": [
    "Boeing 737",
    "Boeing 747",
    "Boeing 757",
    "Boeing 767",
    "Boeing 777",
    "Boeing 787"
  ],

  "Lockheed": [
    "L-1011 TriStar"
  ],

  "McDonnell Douglas": [
    "MD-11",
    "DC-3"
  ],

  "Embraer": [
    "Embraer ERJ170",
    "Embraer E175",
    "Embraer E195-E2",
    "Embraer E190"
  ],
"Regional Jets": [
    "CRJ-200",
    "CRJ-700",
  ],

"BAC": [
    "Concorde"
  ],

  "Turboprops": [
    "ATR-72",
    "ATR-42",
    "Dash-8 Q400"
  ]
};


// BUILD COLLAPSIBLE CATEGORIES
Object.keys(categories).forEach(catName => {
  const catWrapper = document.createElement("div");
  catWrapper.style.width = "420px";
  catWrapper.style.marginBottom = "12px";
  catWrapper.style.border = "1px solid #555";
  catWrapper.style.borderRadius = "8px";
  catWrapper.style.background = "#111";

  const catHeader = document.createElement("div");
  catHeader.style.padding = "10px";
  catHeader.style.cursor = "pointer";
  catHeader.style.display = "flex";
  catHeader.style.justifyContent = "space-between";
  catHeader.style.alignItems = "center";
  catHeader.style.fontSize = "18px";
  catHeader.style.fontWeight = "bold";
  catHeader.innerHTML = `${catName} <span style="font-size:18px;">▼</span>`;

  const catContent = document.createElement("div");
  catContent.style.display = "none";
  catContent.style.padding = "10px";
  catContent.style.background = "#222";
  catContent.style.borderTop = "1px solid #444";

  // Add aircraft buttons
  categories[catName].forEach(ac => {
    const btn = document.createElement("div");
    btn.innerText = ac;
    btn.style.padding = "10px";
    btn.style.margin = "6px 0";
    btn.style.background = "#333";
    btn.style.border = "1px solid #666";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "15px";

    btn.onclick = () => {
      playClick();
      currentAircraft = ac;
      selectorOverlay.style.display = "none";
      loadOverhead();
    };

    catContent.appendChild(btn);
  });

  // Toggle collapse
  let open = false;
  catHeader.onclick = () => {
    open = !open;
    catContent.style.display = open ? "block" : "none";
    catHeader.querySelector("span").style.transform =
      open ? "rotate(0deg)" : "rotate(-90deg)";
  };

  catWrapper.appendChild(catHeader);
  catWrapper.appendChild(catContent);
  selectorOverlay.appendChild(catWrapper);
});

document.body.appendChild(selectorOverlay);

// OPEN SELECTOR BUTTON
document.getElementById("aircraft-select-btn").onclick = () => {
  playClick();
  selectorOverlay.style.display = "flex";
};

// CLICK OUTSIDE TO CLOSE
selectorOverlay.onclick = (e) => {
  if (e.target === selectorOverlay) {
    selectorOverlay.style.display = "none";
  }
};

  // ============================================================
  //  MINIMIZE
  // ============================================================
  let panelMinimized = false;
  document.getElementById("oh-minimize").onclick = () => {
    panelMinimized = !panelMinimized;
    playClick();
    panelContent.style.display = panelMinimized ? "none" : "block";
  };

  // ============================================================
  //  DRAGGING
  // ============================================================
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  panel.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    dragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  });

  document.addEventListener("mouseup", () => dragging = false);

  document.addEventListener("mousemove", (e) => {
    if (dragging) {
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
    }
  });

  // ============================================================
  //  COLLAPSIBLE SECTION FACTORY
  // ============================================================
  function createSection(title) {
    const wrapper = document.createElement("div");
    wrapper.style.margin = "6px 0";
    wrapper.style.border = "1px solid rgba(255,255,255,0.3)";
    wrapper.style.borderRadius = "6px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.padding = "4px 8px";
    header.style.background = "rgba(0,0,0,0.25)";
    header.style.cursor = "pointer";

    const titleText = document.createElement("span");
    titleText.innerText = title;
    titleText.style.fontWeight = "bold";
    titleText.style.fontSize = "13px";

    const arrow = document.createElement("span");
    arrow.innerText = "▼";
    arrow.style.transition = "0.2s";

    header.appendChild(titleText);
    header.appendChild(arrow);

    const content = document.createElement("div");
    content.style.padding = "6px 8px";

    let collapsed = false;
    header.onclick = () => {
      collapsed = !collapsed;
      playClick();
      content.style.display = collapsed ? "none" : "block";
      arrow.style.transform = collapsed ? "rotate(-90deg)" : "rotate(0deg)";
    };

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    panelContent.appendChild(wrapper);

    return content;
  }

  // ============================================================
  //  SWITCH COMPONENTS (Airbus, Boeing, Regional)
  // ============================================================
  // (Switch functions will be added in Part 2)

  // ============================================================
  //  SWITCH COMPONENTS (Airbus, Boeing, Regional)
  // ============================================================

  // ------------------------------
  // Airbus Pushbutton
  // ------------------------------
  function createAirbusPush(section, label, callback) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.margin = "3px 0";

    const text = document.createElement("span");
    text.innerText = label;

    const btn = document.createElement("div");
    btn.style.width = "70px";
    btn.style.height = "24px";
    btn.style.background = "#222";
    btn.style.borderRadius = "4px";
    btn.style.border = "1px solid #888";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";

    btn.innerText = "OFF";

    let state = false;
    btn.onclick = () => {
      playClick();
      state = !state;
      btn.innerText = state ? "ON" : "OFF";
      btn.style.background = state ? "#0f7d00" : "#222";
      callback(state);
    };

    row.appendChild(text);
    row.appendChild(btn);
    section.appendChild(row);
  }

  // ------------------------------
  // Boeing Pushbutton
  // ------------------------------
  function createBoeingPush(section, label, callback) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.margin = "3px 0";

    const text = document.createElement("span");
    text.innerText = label;

    const btn = document.createElement("div");
    btn.style.width = "70px";
    btn.style.height = "24px";
    btn.style.background = "#1a1a1a";
    btn.style.borderRadius = "4px";
    btn.style.border = "1px solid #555";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";

    btn.innerText = "OFF";

    let state = false;
    btn.onclick = () => {
      playClick();
      state = !state;
      btn.innerText = state ? "ON" : "OFF";
      btn.style.background = state ? "#0044ff" : "#1a1a1a";
      callback(state);
    };

    row.appendChild(text);
    row.appendChild(btn);
    section.appendChild(row);
  }

  // ------------------------------
  // Rocker Switch (Boeing / Regional)
  // ------------------------------
  function createRocker(section, label, callback) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.margin = "3px 0";

    const text = document.createElement("span");
    text.innerText = label;

    const rocker = document.createElement("div");
    rocker.style.width = "50px";
    rocker.style.height = "22px";
    rocker.style.background = "#333";
    rocker.style.borderRadius = "4px";
    rocker.style.position = "relative";
    rocker.style.cursor = "pointer";

    const knob = document.createElement("div");
    knob.style.position = "absolute";
    knob.style.width = "24px";
    knob.style.height = "20px";
    knob.style.top = "1px";
    knob.style.left = "1px";
    knob.style.background = "#999";
    knob.style.borderRadius = "3px";

    rocker.appendChild(knob);

    let state = false;
    rocker.onclick = () => {
      playClick();
      state = !state;
      knob.style.left = state ? "25px" : "1px";
      rocker.style.background = state ? "#00aa00" : "#333";
      callback(state);
    };

    row.appendChild(text);
    row.appendChild(rocker);
    section.appendChild(row);
  }

//=========
//Temp knob
//=========
function createTempModeKnob(section, label, callback) {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.justifyContent = "space-between";
  row.style.alignItems = "center";
  row.style.margin = "6px 0";

  const text = document.createElement("span");
  text.innerText = label;

  const knob = document.createElement("div");
  knob.style.width = "40px";
  knob.style.height = "40px";
  knob.style.borderRadius = "50%";
  knob.style.background = "#222";
  knob.style.border = "2px solid #555";
  knob.style.position = "relative";
  knob.style.cursor = "pointer";
  knob.style.transition = "transform 0.2s ease";

  const pointer = document.createElement("div");
  pointer.style.width = "6px";
  pointer.style.height = "14px";
  pointer.style.background = "white";
  pointer.style.position = "absolute";
  pointer.style.top = "3px";
  pointer.style.left = "50%";
  pointer.style.transform = "translateX(-50%)";
  pointer.style.borderRadius = "2px";

  knob.appendChild(pointer);

  // Your custom angles
  const modes = ["COLD", "WARM", "HOT"];
  const angles = [300, 0, 60];
  let index = 0;

  knob.onclick = () => {
    playClick();

    index++;
    if (index > 2) index = 0;

    knob.style.transform = `rotate(${angles[index]}deg)`;

    const mode = modes[index];
    showPopup("CABIN TEMP → " + mode, "airbus");

    callback(mode);
  };

  row.appendChild(text);
  row.appendChild(knob);
  section.appendChild(row);
}


  // ------------------------------
  // Guarded Switch (Boeing)
  // ------------------------------
  function createGuarded(section, label, callback) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.margin = "3px 0";

    const text = document.createElement("span");
    text.innerText = label;

    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.style.width = "55px";
    wrap.style.height = "24px";

    const base = document.createElement("div");
    base.style.width = "55px";
    base.style.height = "24px";
    base.style.background = "#333";
    base.style.borderRadius = "4px";
    base.style.cursor = "pointer";

    const guard = document.createElement("div");
    guard.style.position = "absolute";
    guard.style.top = "0";
    guard.style.left = "0";
    guard.style.width = "55px";
    guard.style.height = "24px";
    guard.style.background = "rgba(255,0,0,0.4)";
    guard.style.borderRadius = "4px";
    guard.style.cursor = "pointer";
    guard.style.transition = "0.2s";

    let armed = false;
    guard.onclick = () => {
      playClick();
      armed = !armed;
      guard.style.top = armed ? "-26px" : "0px";
    };

    base.onclick = () => {
      if (!armed) return;
      playClick();
      callback();
    };

    wrap.appendChild(base);
    wrap.appendChild(guard);

    row.appendChild(text);
    row.appendChild(wrap);
    section.appendChild(row);
  }



  // ------------------------------
  // Regional Toggle (Q400 / CRJ)
  // ------------------------------
  function createRegionalToggle(section, label, callback) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.margin = "3px 0";

    const text = document.createElement("span");
    text.innerText = label;

    const toggle = document.createElement("div");
    toggle.style.width = "55px";
    toggle.style.height = "22px";
    toggle.style.background = "#2a2a2a";
    toggle.style.borderRadius = "4px";
    toggle.style.cursor = "pointer";
    toggle.style.display = "flex";
    toggle.style.alignItems = "center";
    toggle.style.justifyContent = "center";
    toggle.style.border = "1px solid #666";
    toggle.style.fontSize = "12px";

    toggle.innerText = "OFF";

    let state = false;
    toggle.onclick = () => {
      playClick();
      state = !state;
      toggle.innerText = state ? "ON" : "OFF";
      toggle.style.background = state ? "#0a7d0a" : "#2a2a2a";
      callback(state);
    };

    row.appendChild(text);
    row.appendChild(toggle);
    section.appendChild(row);
  }

  // ============================================================
  //  AIRCRAFT OVERHEAD LOADERS (start in Part 3)
  // ============================================================

  // ============================================================
  //  AIRCRAFT OVERHEAD LOADERS
  // ============================================================

  // MASTER LOADER

function loadOverhead() {
  panelContent.innerHTML = "";
  panel.style.background = themes[currentAircraft];
  document.getElementById("oh-title").innerText =
    currentAircraft + " OVERHEAD";

  if (currentAircraft === "Airbus A320") return loadA320();
  if (currentAircraft === "Boeing 737") return load737();
  if (currentAircraft === "Airbus A330") return loadA330();
  if (currentAircraft === "Airbus A340") return loadA340();
  if (currentAircraft === "Airbus A350") return loadA350();
  if (currentAircraft === "Boeing 747") return load747();
  if (currentAircraft === "Boeing 757") return load757();
  if (currentAircraft === "Boeing 767") return load767();
  if (currentAircraft === "Boeing 777") return load777();
  if (currentAircraft === "Boeing 787") return load787();
  if (currentAircraft === "Dash-8 Q400") return loadQ400();
  if (currentAircraft === "Bombardier CRJ-700") return loadCRJ700();
  if (currentAircraft === "ATR-72") return loadATR72();
  if (currentAircraft === "Airbus A380") return loadA380();
  if (currentAircraft === "Airbus A220") return loadA220();
  if (currentAircraft === "Embraer E190") return loadE190();
  if (currentAircraft === "Bombardier CRJ-200") return loadCRJ200();
  if (currentAircraft === "MD-11") return loadMD11();
  if (currentAircraft === "L-1011 TriStar") return loadL1011TriStar();
  if (currentAircraft === "ATR-42") return loadATR42();
  if (currentAircraft === "Airbus A300") return loadA300();
  if (currentAircraft === "Embraer E195-E2") return loadE195E2();
  if (currentAircraft === "Embraer E175") return loadE175();
  if (currentAircraft === "Embraer ERJ170") return loadERJ170();
  if (currentAircraft === "DC-3") return loadDC3();
  if (currentAircraft === "Concorde") return loadConcorde();
}


    // ------------------------------
  // MD-11
  // ------------------------------
function loadMD11() {
  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createBoeingPush(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"md11"));
  createBoeingPush(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"md11"));
  createBoeingPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"md11"));
  createBoeingPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"md11"));
  createBoeingPush(secElec, "GEN 3", s=>showPopup("GEN 3 "+(s?"ON":"OFF"),"md11"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L FWD PUMP", s=>showPopup("L FWD PUMP "+(s?"ON":"OFF"),"md11"));
  createRocker(secFuel, "L AFT PUMP", s=>showPopup("L AFT PUMP "+(s?"ON":"OFF"),"md11"));
  createRocker(secFuel, "CTR FWD PUMP", s=>showPopup("CTR FWD PUMP "+(s?"ON":"OFF"),"md11"));
  createRocker(secFuel, "CTR AFT PUMP", s=>showPopup("CTR AFT PUMP "+(s?"ON":"OFF"),"md11"));
  createRocker(secFuel, "R FWD PUMP", s=>showPopup("R FWD PUMP "+(s?"ON":"OFF"),"md11"));
  createRocker(secFuel, "R AFT PUMP", s=>showPopup("R AFT PUMP "+(s?"ON":"OFF"),"md11"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"md11"));

     // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

  // HYDRAULICS
  const secHyd = createSection("HYDRAULICS");
  createRocker(secHyd, "HYD SYS 1", s=>showPopup("HYD SYS 1 "+(s?"ON":"OFF"),"md11"));
  createRocker(secHyd, "HYD SYS 2", s=>showPopup("HYD SYS 2 "+(s?"ON":"OFF"),"md11"));
  createRocker(secHyd, "HYD SYS 3", s=>showPopup("HYD SYS 3 "+(s?"ON":"OFF"),"md11"));

  // AIR / BLEED
  const secBleed = createSection("BLEED / PACKS");
  createRocker(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"md11"));
  createRocker(secBleed, "PACK C", s=>showPopup("PACK C "+(s?"ON":"OFF"),"md11"));
  createRocker(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"md11"));
  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"md11"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"md11"));
  createRocker(secBleed, "ENG 3 BLEED", s=>showPopup("ENG 3 BLEED "+(s?"ON":"OFF"),"md11"));
  createRocker(secBleed, "APU BLEED", s=>showPopup("APU BLEED "+(s?"ON":"OFF"),"md11"));

  // ANTI-ICE
  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "ENG ANTI-ICE", s=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"md11"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"md11"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"md11"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"md11"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"md11"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"md11"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"md11"));
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

// ============================================================
//  L-1011 OVERHEAD
// ============================================================
   function loadL1011TriStar() {

  const secElec = createSection("ELECTRICAL");
  createBoeingPush(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"l1011"));
  createBoeingPush(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"l1011"));
  createBoeingPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"l1011"));
  createBoeingPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"l1011"));
  createBoeingPush(secElec, "GEN 3", s=>showPopup("GEN 3 "+(s?"ON":"OFF"),"l1011"));

  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L FWD PUMP", s=>showPopup("L FWD PUMP "+(s?"ON":"OFF"),"l1011"));
  createRocker(secFuel, "L AFT PUMP", s=>showPopup("L AFT PUMP "+(s?"ON":"OFF"),"l1011"));
  createRocker(secFuel, "CTR FWD PUMP", s=>showPopup("CTR FWD PUMP "+(s?"ON":"OFF"),"l1011"));
  createRocker(secFuel, "CTR AFT PUMP", s=>showPopup("CTR AFT PUMP "+(s?"ON":"OFF"),"l1011"));
  createRocker(secFuel, "R FWD PUMP", s=>showPopup("R FWD PUMP "+(s?"ON":"OFF"),"l1011"));
  createRocker(secFuel, "R AFT PUMP", s=>showPopup("R AFT PUMP "+(s?"ON":"OFF"),"l1011"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"l1011"));

  const secHyd = createSection("HYDRAULICS");
  createRocker(secHyd, "HYD SYS 1", s=>showPopup("HYD SYS 1 "+(s?"ON":"OFF"),"l1011"));
  createRocker(secHyd, "HYD SYS 2", s=>showPopup("HYD SYS 2 "+(s?"ON":"OFF"),"l1011"));
  createRocker(secHyd, "HYD SYS 3", s=>showPopup("HYD SYS 3 "+(s?"ON":"OFF"),"l1011"));
  createRocker(secHyd, "HYD SYS 4", s=>showPopup("HYD SYS 4 "+(s?"ON":"OFF"),"l1011"));

  const secBleed = createSection("BLEED / PACKS");
  createRocker(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"l1011"));
  createRocker(secBleed, "PACK C", s=>showPopup("PACK C "+(s?"ON":"OFF"),"l1011"));
  createRocker(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"l1011"));
  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"l1011"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"l1011"));
  createRocker(secBleed, "ENG 3 BLEED", s=>showPopup("ENG 3 BLEED "+(s?"ON":"OFF"),"l1011"));
  createRocker(secBleed, "APU BLEED", s=>showPopup("APU BLEED "+(s?"ON":"OFF"),"l1011"));

  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "ENG ANTI-ICE", s=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"l1011"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"l1011"));

  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"l1011"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"l1011"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"l1011"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"l1011"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"l1011"));

        // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

  // ============================================================
  //  AIRBUS A320 OVERHEAD
  // ============================================================
  function loadA320() {
    // LIGHTS
    const secLights = createSection("EXT LT (LIGHTS)");

    createRocker(secLights, "STROBE", (s) => {
      try { geofs.aircraft.instance.lights.strobe = s; } catch {}
      showPopup("STROBE " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "BEACON", (s) => {
      try { geofs.aircraft.instance.lights.beacon = s; } catch {}
      showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "NAV & LOGO", (s) => {
      try { geofs.aircraft.instance.lights.navigation = s; } catch {}
      showPopup("NAV & LOGO " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "RWY TURN OFF", (s) => {
      try { geofs.aircraft.instance.lights.taxi = s; } catch {}
      showPopup("RWY TURN OFF " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "LAND", (s) => {
      try { geofs.aircraft.instance.lights.landing = s; } catch {}
      showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
    });

    // SIGNS
    const secSigns = createSection("SIGNS");

    createAirbusPush(secSigns, "SEATBELTS", (s) => {
      showPopup("SEATBELTS " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secSigns, "NO SMOKING", (s) => {
      showPopup("NO SMOKING " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secSigns, "EMER EXIT LT", (s) => {
      showPopup("EMER EXIT LT " + (s ? "ARMED" : "OFF"), "airbus");
    });

    // APU / POWER
    const secAPU = createSection("APU / POWER");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

    createAirbusPush(secAPU, "EXT PWR", (s) => {
      showPopup("EXT PWR " + (s ? "ON" : "OFF"), "airbus");
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createAirbusPush(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
    });

    // PACKS / BLEED
    const secBleed = createSection("AIR COND / BLEED / PACKS");

    createAirbusPush(secBleed, "PACK 1", (s) => {
      showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 2", (s) => {
      showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG 1 BLEED", (s) => {
      showPopup("ENG 1 BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG 2 BLEED", (s) => {
      showPopup("ENG 2 BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "X-BLEED", (s) => {
      showPopup("X-BLEED " + (s ? "OPEN" : "SHUT"), "airbus");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE / PROBE");

    createAirbusPush(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "PROBE/WINDOW HEAT", (s) => {
      showPopup("PROBE/WINDOW HEAT " + (s ? "ON" : "AUTO"), "airbus");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }

  // ============================================================
  //  BOEING 737 OVERHEAD
  // ============================================================
  function load737() {
    // ELECTRICAL
    const secElec = createSection("ELECTRICAL");

    createGuarded(secElec, "BATTERY", () => {
      showPopup("BATTERY → ON", "boeing");
    });

    createGuarded(secElec, "STANDBY PWR", () => {
      showPopup("STANDBY POWER → ON", "boeing");
    });

    createBoeingPush(secElec, "GEN 1", (s) => {
      showPopup("GEN 1 " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secElec, "GEN 2", (s) => {
      showPopup("GEN 2 " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secElec, "APU GEN", (s) => {
      showPopup("APU GEN " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secElec, "EXT PWR", (s) => {
      showPopup("EXT PWR " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secElec, "BUS TRANSFER", (s) => {
      showPopup("BUS TRANSFER " + (s ? "AUTO" : "OFF"), "boeing");
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createRocker(secFuel, "L FWD PUMP", (s) => {
      showPopup("L FWD PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "L AFT PUMP", (s) => {
      showPopup("L AFT PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "R FWD PUMP", (s) => {
      showPopup("R FWD PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "R AFT PUMP", (s) => {
      showPopup("R AFT PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "boeing");
    });

    // AIR SYSTEMS
    const secAir = createSection("AIR SYSTEMS");

    createRocker(secAir, "PACK L", (s) => {
      showPopup("PACK L " + (s ? "AUTO" : "OFF"), "boeing");
    });

    createRocker(secAir, "PACK R", (s) => {
      showPopup("PACK R " + (s ? "AUTO" : "OFF"), "boeing");
    });

    createBoeingPush(secAir, "BLEED AIR", (s) => {
      showPopup("BLEED AIR " + (s ? "ON" : "OFF"), "boeing");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createRocker(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secAnti, "PROBE HEAT", (s) => {
      showPopup("PROBE HEAT " + (s ? "ON" : "OFF"), "boeing");
    });

    // APU
    const secAPU = createSection("APU");

    createBoeingPush(secAPU, "APU SWITCH", (s) => {
      showPopup("APU SWITCH " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "boeing");
        setTimeout(() => {
          showPopup("APU → RUNNING", "boeing");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "boeing");
      }
    });

    // LIGHTS
    const secLights = createSection("LIGHTS");

    createRocker(secLights, "BEACON", (s) => {
      try { geofs.aircraft.instance.lights.beacon = s; } catch {}
      showPopup("BEACON " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secLights, "STROBE", (s) => {
      try { geofs.aircraft.instance.lights.strobe = s; } catch {}
      showPopup("STROBE " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secLights, "POSITION", (s) => {
      try { geofs.aircraft.instance.lights.navigation = s; } catch {}
      showPopup("POSITION " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secLights, "WING", (s) => {
      showPopup("WING LIGHT " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secLights, "WHEEL WELL", (s) => {
      showPopup("WHEEL WELL " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secLights, "LANDING", (s) => {
      try { geofs.aircraft.instance.lights.landing = s; } catch {}
      showPopup("LANDING " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secLights, "TAXI", (s) => {
      try { geofs.aircraft.instance.lights.taxi = s; } catch {}
      showPopup("TAXI " + (s ? "ON" : "OFF"), "boeing");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }
  // ============================================================
  //  AIRBUS A330 OVERHEAD
  // ============================================================
  function loadA330() {
    // LIGHTS
    const secLights = createSection("EXT LT (LIGHTS)");

    createRocker(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "NAV & LOGO", (s) => {
      showPopup("NAV & LOGO " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "LAND", (s) => {
      showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
    });

    // SIGNS
    const secSigns = createSection("SIGNS");

    createAirbusPush(secSigns, "SEATBELTS", (s) => {
      showPopup("SEATBELTS " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secSigns, "NO SMOKING", (s) => {
      showPopup("NO SMOKING " + (s ? "ON" : "OFF"), "airbus");
    });

    // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

    // FUEL (A330 has center tank)
    const secFuel = createSection("FUEL");

    createAirbusPush(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "CTR FUEL PUMP", (s) => {
      showPopup("CTR FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
    });

    // BLEED / PACKS
    const secBleed = createSection("AIR COND / BLEED");

    createAirbusPush(secBleed, "PACK 1", (s) => {
      showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 2", (s) => {
      showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG 1 BLEED", (s) => {
      showPopup("ENG 1 BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG 2 BLEED", (s) => {
      showPopup("ENG 2 BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "APU BLEED", (s) => {
      showPopup("APU BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createAirbusPush(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }

  // ============================================================
  //  AIRBUS A340 OVERHEAD (4 engines)
  // ============================================================


function loadA340() {
  // ============================
  // LIGHTS
  // ============================
  const secLights = createSection("EXT LT (LIGHTS)");

  createRocker(secLights, "STROBE", s => {
    showPopup("STROBE " + (s ? "ON" : "OFF"), "airbus");
  });

  createRocker(secLights, "BEACON", s => {
    showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
  });

  createRocker(secLights, "NAV & LOGO", s => {
    showPopup("NAV & LOGO " + (s ? "ON" : "OFF"), "airbus");
  });

  createRocker(secLights, "LAND", s => {
    showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
  });


  // ============================
  // FUEL (4 engines)
  // ============================
  const secFuel = createSection("FUEL");

  createAirbusPush(secFuel, "ENG 1 PUMP", s => {
    showPopup("ENG 1 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secFuel, "ENG 2 PUMP", s => {
    showPopup("ENG 2 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secFuel, "ENG 3 PUMP", s => {
    showPopup("ENG 3 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secFuel, "ENG 4 PUMP", s => {
    showPopup("ENG 4 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secFuel, "X-FEED", s => {
    showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
  });


  // ============================
  // BLEED / PACKS
  // ============================
  const secBleed = createSection("BLEED / PACKS");

  createAirbusPush(secBleed, "PACK 1", s => {
    showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secBleed, "PACK 2", s => {
    showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secBleed, "PACK 3", s => {
    showPopup("PACK 3 " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secBleed, "PACK 4", s => {
    showPopup("PACK 4 " + (s ? "ON" : "OFF"), "airbus");
  });



  // ============================
  // ANTI-ICE
  // ============================
  const secAnti = createSection("ANTI-ICE");

  createAirbusPush(secAnti, "ENG 1 ANTI-ICE", s => {
    showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secAnti, "ENG 2 ANTI-ICE", s => {
    showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secAnti, "ENG 3 ANTI-ICE", s => {
    showPopup("ENG 3 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secAnti, "ENG 4 ANTI-ICE", s => {
    showPopup("ENG 4 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secAnti, "WING ANTI-ICE", s => {
    showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });


  // ============================
  // APU
  // ============================
  const secAPU = createSection("APU");

  createAirbusPush(secAPU, "APU MASTER", s => {
    showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
  });

  createAirbusPush(secAPU, "APU START", s => {
    if (s) {
      showPopup("APU STARTING…", "airbus");
      setTimeout(() => {
        showPopup("APU → RUNNING", "airbus");
        playChime();
      }, 2000);
    } else {
      showPopup("APU → SHUTDOWN", "airbus");
    }
  });

}

  // ============================================================
  //  AIRBUS A350 OVERHEAD (modern Airbus)
  // ============================================================
  function loadA350() {
    // LIGHTS
    const secLights = createSection("EXT LT (LIGHTS)");

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "NAV", (s) => {
      showPopup("NAV " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "LAND", (s) => {
      showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
    });

    // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createAirbusPush(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
    });

    // BLEED / PACKS
    const secBleed = createSection("AIR SYSTEMS");

    createAirbusPush(secBleed, "PACK 1", (s) => {
      showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 2", (s) => {
      showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG BLEED", (s) => {
      showPopup("ENG BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createAirbusPush(secAnti, "ENG ANTI-ICE", (s) => {
      showPopup("ENG ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }
  // ============================================================
  //  AIRBUS A330 OVERHEAD
  // ============================================================
  function loadA330() {
    // LIGHTS
    const secLights = createSection("EXT LT (LIGHTS)");

    createRocker(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "NAV & LOGO", (s) => {
      showPopup("NAV & LOGO " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "LAND", (s) => {
      showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
    });

    // SIGNS
    const secSigns = createSection("SIGNS");

    createAirbusPush(secSigns, "SEATBELTS", (s) => {
      showPopup("SEATBELTS " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secSigns, "NO SMOKING", (s) => {
      showPopup("NO SMOKING " + (s ? "ON" : "OFF"), "airbus");
    });

    // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

    // FUEL (A330 has center tank)
    const secFuel = createSection("FUEL");

    createAirbusPush(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "CTR FUEL PUMP", (s) => {
      showPopup("CTR FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
    });

    // BLEED / PACKS
    const secBleed = createSection("AIR COND / BLEED");

    createAirbusPush(secBleed, "PACK 1", (s) => {
      showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 2", (s) => {
      showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG 1 BLEED", (s) => {
      showPopup("ENG 1 BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG 2 BLEED", (s) => {
      showPopup("ENG 2 BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "APU BLEED", (s) => {
      showPopup("APU BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createAirbusPush(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }

  // ============================================================
  //  AIRBUS A340 OVERHEAD (4 engines)
  // ============================================================
  function loadA340() {
    // LIGHTS
    const secLights = createSection("EXT LT (LIGHTS)");

    createRocker(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "NAV & LOGO", (s) => {
      showPopup("NAV & LOGO " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "LAND", (s) => {
      showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
    });

    // FUEL (4 engines)
    const secFuel = createSection("FUEL");

    createAirbusPush(secFuel, "ENG 1 PUMP", (s) => {
      showPopup("ENG 1 PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "ENG 2 PUMP", (s) => {
      showPopup("ENG 2 PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "ENG 3 PUMP", (s) => {
      showPopup("ENG 3 PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "ENG 4 PUMP", (s) => {
      showPopup("ENG 4 PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
    });

      // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

    // BLEED
    const secBleed = createSection("BLEED / PACKS");

    createAirbusPush(secBleed, "PACK 1", (s) => {
      showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 2", (s) => {
      showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 3", (s) => {
      showPopup("PACK 3 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 4", (s) => {
      showPopup("PACK 4 " + (s ? "ON" : "OFF"), "airbus");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createAirbusPush(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "ENG 3 ANTI-ICE", (s) => {
      showPopup("ENG 3 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "ENG 4 ANTI-ICE", (s) => {
      showPopup("ENG 4 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }

  // ============================================================
  //  AIRBUS A350 OVERHEAD (modern Airbus)
  // ============================================================
  function loadA350() {
    // LIGHTS
    const secLights = createSection("EXT LT (LIGHTS)");

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "NAV", (s) => {
      showPopup("NAV " + (s ? "ON" : "OFF"), "airbus");
    });

    createRocker(secLights, "LAND", (s) => {
      showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
    });

    // APU
    const secAPU = createSection("APU");

    createAirbusPush(secAPU, "APU MASTER", (s) => {
      showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "airbus");
        setTimeout(() => {
          showPopup("APU → RUNNING", "airbus");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "airbus");
      }
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createAirbusPush(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
    });

    // BLEED / PACKS
    const secBleed = createSection("AIR SYSTEMS");

    createAirbusPush(secBleed, "PACK 1", (s) => {
      showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "PACK 2", (s) => {
      showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secBleed, "ENG BLEED", (s) => {
      showPopup("ENG BLEED " + (s ? "ON" : "OFF"), "airbus");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createAirbusPush(secAnti, "ENG ANTI-ICE", (s) => {
      showPopup("ENG ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });

    createAirbusPush(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }
  // ============================================================
  //  BOEING 777 OVERHEAD (modern Boeing widebody)
  // ============================================================
  function load777() {
    // ELECTRICAL
    const secElec = createSection("ELECTRICAL");

    createGuarded(secElec, "BATTERY", () => {
      showPopup("BATTERY → ON", "boeing");
    });

    createBoeingPush(secElec, "GEN 1", (s) => {
      showPopup("GEN 1 " + (s ? "ON" : "OFF"), "boeing");
    });
    createBoeingPush(secElec, "GEN 2", (s) => {
      showPopup("GEN 2 " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secElec, "APU GEN", (s) => {
      showPopup("APU GEN " + (s ? "ON" : "OFF"), "boeing");
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createRocker(secFuel, "L FWD PUMP", (s) => {
      showPopup("L FWD PUMP " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secFuel, "L AFT PUMP", (s) => {
      showPopup("L AFT PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "CTR PUMP", (s) => {
      showPopup("CTR PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "R FWD PUMP", (s) => {
      showPopup("R FWD PUMP " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secFuel, "R AFT PUMP", (s) => {
      showPopup("R AFT PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "boeing");
    });

    // APU
    const secAPU = createSection("APU");

    createBoeingPush(secAPU, "APU SWITCH", (s) => {
      showPopup("APU SWITCH " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "boeing");
        setTimeout(() => {
          showPopup("APU → RUNNING", "boeing");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "boeing");
      }
    });

    // AIR SYSTEMS
    const secAir = createSection("AIR SYSTEMS");

    createRocker(secAir, "PACK L", (s) => {
      showPopup("PACK L " + (s ? "AUTO" : "OFF"), "boeing");
    });
    createRocker(secAir, "PACK R", (s) => {
      showPopup("PACK R " + (s ? "AUTO" : "OFF"), "boeing");
    });

    createBoeingPush(secAir, "BLEED AIR", (s) => {
      showPopup("BLEED AIR " + (s ? "ON" : "OFF"), "boeing");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createRocker(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});



    // LIGHTS
    const secLights = createSection("LIGHTS");

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secLights, "NAV", (s) => {
      showPopup("NAV " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secLights, "LANDING", (s) => {
      showPopup("LANDING " + (s ? "ON" : "OFF"), "boeing");
    });

  }

  // ============================================================
  //  BOEING 787 OVERHEAD (ultra-modern Boeing)
  // ============================================================
  function load787() {
    // ELECTRICAL
    const secElec = createSection("ELECTRICAL");

    createGuarded(secElec, "BATTERY", () => {
      showPopup("BATTERY → ON", "boeing");
    });

    createBoeingPush(secElec, "GEN 1", (s) => {
      showPopup("GEN 1 " + (s ? "ON" : "OFF"), "boeing");
    });
    createBoeingPush(secElec, "GEN 2", (s) => {
      showPopup("GEN 2 " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secElec, "APU GEN", (s) => {
      showPopup("APU GEN " + (s ? "ON" : "OFF"), "boeing");
    });

      // APU
    const secAPU = createSection("APU");

    createBoeingPush(secAPU, "APU SWITCH", (s) => {
      showPopup("APU SWITCH " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "boeing");
        setTimeout(() => {
          showPopup("APU → RUNNING", "boeing");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "boeing");
      }
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createRocker(secFuel, "L FWD PUMP", (s) => {
      showPopup("L FWD PUMP " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secFuel, "L AFT PUMP", (s) => {
      showPopup("L AFT PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "CTR PUMP", (s) => {
      showPopup("CTR PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secFuel, "R FWD PUMP", (s) => {
      showPopup("R FWD PUMP " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secFuel, "R AFT PUMP", (s) => {
      showPopup("R AFT PUMP " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "boeing");
    });

    // AIR SYSTEMS
    const secAir = createSection("AIR SYSTEMS");

    createRocker(secAir, "PACK L", (s) => {
      showPopup("PACK L " + (s ? "AUTO" : "OFF"), "boeing");
    });
    createRocker(secAir, "PACK R", (s) => {
      showPopup("PACK R " + (s ? "AUTO" : "OFF"), "boeing");
    });

    createBoeingPush(secAir, "BLEED AIR", (s) => {
      showPopup("BLEED AIR " + (s ? "ON" : "OFF"), "boeing");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createRocker(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

    createRocker(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "boeing");
    });

    // LIGHTS
    const secLights = createSection("LIGHTS");

    createRocker(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secLights, "NAV", (s) => {
      showPopup("NAV " + (s ? "ON" : "OFF"), "boeing");
    });
    createRocker(secLights, "LANDING", (s) => {
      showPopup("LANDING " + (s ? "ON" : "OFF"), "boeing");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }
  // ============================================================
  //  DE HAVILLAND Q400 OVERHEAD (turboprop)
  // ============================================================
  function loadQ400() {
    // ELECTRICAL
    const secElec = createSection("ELECTRICAL");

    createRegionalToggle(secElec, "BATTERY", (s) => {
      showPopup("BATTERY " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secElec, "GEN 1", (s) => {
      showPopup("GEN 1 " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secElec, "GEN 2", (s) => {
      showPopup("GEN 2 " + (s ? "ON" : "OFF"), "regional");
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createRegionalToggle(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "regional");
    });

    // AIR SYSTEMS
    const secAir = createSection("AIR SYSTEMS");

    createRegionalToggle(secAir, "PACK L", (s) => {
      showPopup("PACK L " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secAir, "PACK R", (s) => {
      showPopup("PACK R " + (s ? "ON" : "OFF"), "regional");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createRegionalToggle(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secAnti, "PROP HEAT", (s) => {
      showPopup("PROP HEAT " + (s ? "ON" : "OFF"), "regional");
    });

    // LIGHTS
    const secLights = createSection("LIGHTS");

    createRegionalToggle(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secLights, "NAV", (s) => {
      showPopup("NAV " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secLights, "LANDING", (s) => {
      showPopup("LANDING " + (s ? "ON" : "OFF"), "regional");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }

  // ============================================================
  //  BOMBARDIER CRJ-700 OVERHEAD (regional jet)
  // ============================================================
  function loadCRJ700() {
    // ELECTRICAL
    const secElec = createSection("ELECTRICAL");

    createRegionalToggle(secElec, "BATTERY", (s) => {
      showPopup("BATTERY " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secElec, "GEN 1", (s) => {
      showPopup("GEN 1 " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secElec, "GEN 2", (s) => {
      showPopup("GEN 2 " + (s ? "ON" : "OFF"), "regional");
    });

    // FUEL
    const secFuel = createSection("FUEL");

    createRegionalToggle(secFuel, "L FUEL PUMP", (s) => {
      showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secFuel, "R FUEL PUMP", (s) => {
      showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secFuel, "X-FEED", (s) => {
      showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "regional");
    });

    // AIR SYSTEMS
    const secAir = createSection("AIR SYSTEMS");

    createRegionalToggle(secAir, "PACK L", (s) => {
      showPopup("PACK L " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secAir, "PACK R", (s) => {
      showPopup("PACK R " + (s ? "ON" : "OFF"), "regional");
    });

    // ANTI-ICE
    const secAnti = createSection("ANTI-ICE");

    createRegionalToggle(secAnti, "ENG 1 ANTI-ICE", (s) => {
      showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secAnti, "ENG 2 ANTI-ICE", (s) => {
      showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secAnti, "WING ANTI-ICE", (s) => {
      showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
    });

    // LIGHTS
    const secLights = createSection("LIGHTS");

    createRegionalToggle(secLights, "BEACON", (s) => {
      showPopup("BEACON " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secLights, "STROBE", (s) => {
      showPopup("STROBE " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secLights, "NAV", (s) => {
      showPopup("NAV " + (s ? "ON" : "OFF"), "regional");
    });

    createRegionalToggle(secLights, "LANDING", (s) => {
      showPopup("LANDING " + (s ? "ON" : "OFF"), "regional");
    });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  }

// ============================================================
// 747 OVERHEAD
// ============================================================
   function load747() {
  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createBoeingPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "GEN 3", s=>showPopup("GEN 3 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "GEN 4", s=>showPopup("GEN 4 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"boeing"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L FWD PUMP", s=>showPopup("L FWD PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "L AFT PUMP", s=>showPopup("L AFT PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "CTR L PUMP", s=>showPopup("CTR L PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "CTR R PUMP", s=>showPopup("CTR R PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "R FWD PUMP", s=>showPopup("R FWD PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "R AFT PUMP", s=>showPopup("R AFT PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"boeing"));

  // HYDRAULICS
  const secHyd = createSection("HYDRAULICS");
  createRocker(secHyd, "SYS A PUMP", s=>showPopup("HYD A "+(s?"ON":"OFF"),"boeing"));
  createRocker(secHyd, "SYS B PUMP", s=>showPopup("HYD B "+(s?"ON":"OFF"),"boeing"));
  createRocker(secHyd, "SYS C PUMP", s=>showPopup("HYD C "+(s?"ON":"OFF"),"boeing"));

  // APU
    const secAPU = createSection("APU");

    createBoeingPush(secAPU, "APU SWITCH", (s) => {
      showPopup("APU SWITCH " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "boeing");
        setTimeout(() => {
          showPopup("APU → RUNNING", "boeing");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "boeing");
      }
    });

  // BLEED / PACKS
  const secBleed = createSection("BLEED / PACKS");
  createRocker(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "PACK C", s=>showPopup("PACK C "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 3 BLEED", s=>showPopup("ENG 3 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 4 BLEED", s=>showPopup("ENG 4 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "APU BLEED", s=>showPopup("APU BLEED "+(s?"ON":"OFF"),"boeing"));

  // ANTI-ICE
  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "ENG ANTI-ICE", s=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"boeing"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"boeing"));

  // LIGHTS (ALL ROCKERS)
  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "LOGO", s=>showPopup("LOGO "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "WING", s=>showPopup("WING LIGHT "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "RTO L", s=>showPopup("RUNWAY TURNOFF L "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "RTO R", s=>showPopup("RUNWAY TURNOFF R "+(s?"ON":"OFF"),"boeing"));
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});


}

// ============================================================
// 757 OVERHEAD
// ============================================================
function load757() {
  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createBoeingPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"boeing"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L FWD PUMP", s=>showPopup("L FWD PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "L AFT PUMP", s=>showPopup("L AFT PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "CTR PUMP", s=>showPopup("CTR PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "R FWD PUMP", s=>showPopup("R FWD PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "R AFT PUMP", s=>showPopup("R AFT PUMP "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"boeing"));

  // HYDRAULICS
  const secHyd = createSection("HYDRAULICS");
  createRocker(secHyd, "SYS A PUMP", s=>showPopup("HYD A "+(s?"ON":"OFF"),"boeing"));
  createRocker(secHyd, "SYS B PUMP", s=>showPopup("HYD B "+(s?"ON":"OFF"),"boeing"));

    // APU
    const secAPU = createSection("APU");

    createBoeingPush(secAPU, "APU SWITCH", (s) => {
      showPopup("APU SWITCH " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "boeing");
        setTimeout(() => {
          showPopup("APU → RUNNING", "boeing");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "boeing");
      }
    });

  // BLEED / PACKS
  const secBleed = createSection("BLEED / PACKS");
  createRocker(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "APU BLEED", s=>showPopup("APU BLEED "+(s?"ON":"OFF"),"boeing"));

  // ANTI-ICE
  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "ENG ANTI-ICE", s=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"boeing"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"boeing"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"boeing"));
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});


}



// ============================================================
// 767 OVERHEAD
// ============================================================
  function load767() {
  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createBoeingPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"boeing"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L FWD PUMP", s=>showPopup("L FWD PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "L AFT PUMP", s=>showPopup("L AFT PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "CTR L PUMP", s=>showPopup("CTR L PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "CTR R PUMP", s=>showPopup("CTR R PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "R FWD PUMP", s=>showPopup("R FWD PUMP "+(s?"ON":"OFF"),"boeing"));
  createRocker(secFuel, "R AFT PUMP", s=>showPopup("R AFT PUMP "+(s?"ON":"OFF"),"boeing"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"boeing"));

  // HYDRAULICS
  const secHyd = createSection("HYDRAULICS");
  createRocker(secHyd, "SYS L PUMP", s=>showPopup("HYD L "+(s?"ON":"OFF"),"boeing"));
  createRocker(secHyd, "SYS R PUMP", s=>showPopup("HYD R "+(s?"ON":"OFF"),"boeing"));

      // APU
    const secAPU = createSection("APU");

    createBoeingPush(secAPU, "APU SWITCH", (s) => {
      showPopup("APU SWITCH " + (s ? "ON" : "OFF"), "boeing");
    });

    createBoeingPush(secAPU, "APU START", (s) => {
      if (s) {
        showPopup("APU STARTING…", "boeing");
        setTimeout(() => {
          showPopup("APU → RUNNING", "boeing");
          playChime();
        }, 2000);
      } else {
        showPopup("APU → SHUTDOWN", "boeing");
      }
    });

  // BLEED / PACKS
  const secBleed = createSection("BLEED / PACKS");
  createRocker(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"boeing"));
  createRocker(secBleed, "APU BLEED", s=>showPopup("APU BLEED "+(s?"ON":"OFF"),"boeing"));

  // ANTI-ICE
  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "ENG ANTI-ICE", s=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"boeing"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"boeing"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"boeing"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"boeing"));
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

// ============================================================
//  ATR‑72 OVERHEAD (turboprop)
// ============================================================
function loadATR72() {
  const secElec = createSection("ELECTRICAL");
  createRegionalToggle(secElec, "BATTERY", (s) => {
    showPopup("BATTERY " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secElec, "GEN 1", (s) => {
    showPopup("GEN 1 " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secElec, "GEN 2", (s) => {
    showPopup("GEN 2 " + (s ? "ON" : "OFF"), "regional");
  });

  const secFuel = createSection("FUEL");
  createRegionalToggle(secFuel, "L FUEL PUMP", (s) => {
    showPopup("L FUEL PUMP " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secFuel, "R FUEL PUMP", (s) => {
    showPopup("R FUEL PUMP " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secFuel, "X-FEED", (s) => {
    showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "regional");
  });

  const secAir = createSection("AIR SYSTEMS");
  createRegionalToggle(secAir, "PACK L", (s) => {
    showPopup("PACK L " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secAir, "PACK R", (s) => {
    showPopup("PACK R " + (s ? "ON" : "OFF"), "regional");
  });

  const secAnti = createSection("ANTI-ICE");
  createRegionalToggle(secAnti, "ENG 1 ANTI-ICE", (s) => {
    showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secAnti, "ENG 2 ANTI-ICE", (s) => {
    showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secAnti, "PROP HEAT", (s) => {
    showPopup("PROP HEAT " + (s ? "ON" : "OFF"), "regional");
  });

  const secLights = createSection("LIGHTS");
  createRegionalToggle(secLights, "BEACON", (s) => {
    showPopup("BEACON " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secLights, "STROBE", (s) => {
    showPopup("STROBE " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secLights, "NAV", (s) => {
    showPopup("NAV " + (s ? "ON" : "OFF"), "regional");
  });
  createRegionalToggle(secLights, "LANDING", (s) => {
    showPopup("LANDING " + (s ? "ON" : "OFF"), "regional");
  });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}
// ============================================================
//  ATR-42 overhead
// ============================================================
    function loadATR42() {

  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createRocker(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"atr42"));
  createRocker(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"atr42"));
  createRocker(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"atr42"));
  createRocker(secElec, "EXT PWR", s=>showPopup("EXT PWR "+(s?"ON":"OFF"),"atr42"));

  // FUEL (ATR‑42 has fewer pumps than ATR‑72)
  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L FUEL PUMP", s=>showPopup("L FUEL PUMP "+(s?"ON":"OFF"),"atr42"));
  createRocker(secFuel, "R FUEL PUMP", s=>showPopup("R FUEL PUMP "+(s?"ON":"OFF"),"atr42"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"atr42"));

  // HYDRAULICS
  const secHyd = createSection("HYDRAULICS");
  createRocker(secHyd, "HYD PUMP 1", s=>showPopup("HYD PUMP 1 "+(s?"ON":"OFF"),"atr42"));
  createRocker(secHyd, "HYD PUMP 2", s=>showPopup("HYD PUMP 2 "+(s?"ON":"OFF"),"atr42"));

  // BLEED / AIR
  const secBleed = createSection("BLEED / AIR");
  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"atr42"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"atr42"));
  createRocker(secBleed, "PACK 1", s=>showPopup("PACK 1 "+(s?"ON":"OFF"),"atr42"));
  createRocker(secBleed, "PACK 2", s=>showPopup("PACK 2 "+(s?"ON":"OFF"),"atr42"));

  // ANTI-ICE
  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "ENG 1 ANTI-ICE", s=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"atr42"));
  createRocker(secIce, "ENG 2 ANTI-ICE", s=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"atr42"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"atr42"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"atr42"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"atr42"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"atr42"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"atr42"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"atr42"));
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

// ============================================================
//  AIRBUS A380 OVERHEAD (4 engines, Airbus style)
// ============================================================
function loadA380() {
  const secLights = createSection("EXT LT (LIGHTS)");
  createRocker(secLights, "BEACON", (s) => {
    showPopup("BEACON " + (s ? "ON" : "OFF"), "airbus");
  });
  createRocker(secLights, "NAV & LOGO", (s) => {
    showPopup("NAV & LOGO " + (s ? "ON" : "OFF"), "airbus");
  });
  createRocker(secLights, "LAND", (s) => {
    showPopup("LAND " + (s ? "ON" : "OFF"), "airbus");
  });

  const secAPU = createSection("APU");
  createAirbusPush(secAPU, "APU MASTER", (s) => {
    showPopup("APU MASTER " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAPU, "APU START", (s) => {
    if (s) {
      showPopup("APU STARTING…", "airbus");
      setTimeout(() => {
        showPopup("APU → RUNNING", "airbus");
        playChime();
      }, 2000);
    } else {
      showPopup("APU → SHUTDOWN", "airbus");
    }
  });

  const secFuel = createSection("FUEL");
  createAirbusPush(secFuel, "ENG 1 PUMP", (s) => {
    showPopup("ENG 1 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secFuel, "ENG 2 PUMP", (s) => {
    showPopup("ENG 2 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secFuel, "ENG 3 PUMP", (s) => {
    showPopup("ENG 3 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secFuel, "ENG 4 PUMP", (s) => {
    showPopup("ENG 4 PUMP " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secFuel, "X-FEED", (s) => {
    showPopup("CROSSFEED " + (s ? "OPEN" : "CLOSED"), "airbus");
  });

  const secAir = createSection("AIR SYSTEMS");
  createAirbusPush(secAir, "PACK 1", (s) => {
    showPopup("PACK 1 " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAir, "PACK 2", (s) => {
    showPopup("PACK 2 " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAir, "PACK 3", (s) => {
    showPopup("PACK 3 " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAir, "PACK 4", (s) => {
    showPopup("PACK 4 " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAir, "ENG BLEED", (s) => {
    showPopup("ENG BLEED " + (s ? "ON" : "OFF"), "airbus");
  });

  const secAnti = createSection("ANTI-ICE");
  createAirbusPush(secAnti, "ENG 1 ANTI-ICE", (s) => {
    showPopup("ENG 1 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAnti, "ENG 2 ANTI-ICE", (s) => {
    showPopup("ENG 2 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAnti, "ENG 3 ANTI-ICE", (s) => {
    showPopup("ENG 3 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAnti, "ENG 4 ANTI-ICE", (s) => {
    showPopup("ENG 4 ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });
  createAirbusPush(secAnti, "WING ANTI-ICE", (s) => {
    showPopup("WING ANTI-ICE " + (s ? "ON" : "OFF"), "airbus");
  });
const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}
/* ============================================================
      PART 9 — A220, E190, CRJ‑200
   ============================================================ */

// 1. Add aircraft to selector list
aircraftList.push("Airbus A220");
aircraftList.push("Embraer E190");
aircraftList.push("Bombardier CRJ-200");

// 2. Add themes
themes["Airbus A220"] = "#003366";   // Airbus blue
themes["Embraer E190"] = "#1f1f1f";  // regional jet grey
themes["Bombardier CRJ-200"] = "#1f1f1f";

// 3. Extend master loader
const oldLoader9 = loadOverhead;
loadOverhead = function () {
  panelContent.innerHTML = "";
  panel.style.background = themes[currentAircraft];
  document.getElementById("oh-title").innerText =
    currentAircraft + " OVERHEAD";

  if (currentAircraft === "Airbus A220") return loadA220();
  if (currentAircraft === "Embraer E190") return loadE190();
  if (currentAircraft === "Bombardier CRJ-200") return loadCRJ200();

  return oldLoader9();
};

// ============================================================
//  AIRBUS A220 OVERHEAD (Airbus pushbuttons)
// ============================================================
function loadA220() {
  // LIGHTS
  const secLights = createSection("EXT LT (LIGHTS)");
  createRocker(secLights, "BEACON", (s)=>showPopup("BEACON "+(s?"ON":"OFF"),"airbus"));
  createRocker(secLights, "NAV", (s)=>showPopup("NAV "+(s?"ON":"OFF"),"airbus"));
  createRocker(secLights, "LAND", (s)=>showPopup("LAND "+(s?"ON":"OFF"),"airbus"));

  // APU
  const secAPU = createSection("APU");
  createAirbusPush(secAPU, "APU MASTER", (s)=>showPopup("APU MASTER "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secAPU, "APU START", (s)=>{
    if(s){
      showPopup("APU STARTING…","airbus");
      setTimeout(()=>{ showPopup("APU → RUNNING","airbus"); playChime(); },2000);
    } else showPopup("APU → SHUTDOWN","airbus");
  });

  // FUEL
  const secFuel = createSection("FUEL");
  createAirbusPush(secFuel, "L FUEL PUMP", (s)=>showPopup("L FUEL PUMP "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secFuel, "R FUEL PUMP", (s)=>showPopup("R FUEL PUMP "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secFuel, "X-FEED", (s)=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"airbus"));

  // PACKS
  const secAir = createSection("AIR SYSTEMS");
  createAirbusPush(secAir, "PACK 1", (s)=>showPopup("PACK 1 "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secAir, "PACK 2", (s)=>showPopup("PACK 2 "+(s?"ON":"OFF"),"airbus"));

  // ANTI-ICE
  const secAnti = createSection("ANTI-ICE");
  createAirbusPush(secAnti, "ENG ANTI-ICE", (s)=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secAnti, "WING ANTI-ICE", (s)=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"airbus"));
    const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

// ============================================================
//  EMBRAER E190 OVERHEAD (regional jet style)
// ============================================================
function loadE190() {
  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createRegionalToggle(secElec, "BATTERY", (s)=>showPopup("BATTERY "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secElec, "GEN 1", (s)=>showPopup("GEN 1 "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secElec, "GEN 2", (s)=>showPopup("GEN 2 "+(s?"ON":"OFF"),"regional"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRegionalToggle(secFuel, "L FUEL PUMP", (s)=>showPopup("L FUEL PUMP "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secFuel, "R FUEL PUMP", (s)=>showPopup("R FUEL PUMP "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secFuel, "X-FEED", (s)=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"regional"));

  // AIR SYSTEMS
  const secAir = createSection("AIR SYSTEMS");
  createRegionalToggle(secAir, "PACK L", (s)=>showPopup("PACK L "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secAir, "PACK R", (s)=>showPopup("PACK R "+(s?"ON":"OFF"),"regional"));

  // ANTI-ICE
  const secAnti = createSection("ANTI-ICE");
  createRegionalToggle(secAnti, "ENG 1 ANTI-ICE", (s)=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secAnti, "ENG 2 ANTI-ICE", (s)=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secAnti, "WING ANTI-ICE", (s)=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"regional"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRegionalToggle(secLights, "BEACON", (s)=>showPopup("BEACON "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secLights, "NAV", (s)=>showPopup("NAV "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secLights, "LANDING", (s)=>showPopup("LANDING "+(s?"ON":"OFF"),"regional"));
    const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

// ============================================================
//  CRJ‑200 OVERHEAD (similar to CRJ‑700)
// ============================================================
function loadCRJ200() {
  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createRegionalToggle(secElec, "BATTERY", (s)=>showPopup("BATTERY "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secElec, "GEN 1", (s)=>showPopup("GEN 1 "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secElec, "GEN 2", (s)=>showPopup("GEN 2 "+(s?"ON":"OFF"),"regional"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRegionalToggle(secFuel, "L FUEL PUMP", (s)=>showPopup("L FUEL PUMP "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secFuel, "R FUEL PUMP", (s)=>showPopup("R FUEL PUMP "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secFuel, "X-FEED", (s)=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"regional"));

  // AIR SYSTEMS
  const secAir = createSection("AIR SYSTEMS");
  createRegionalToggle(secAir, "PACK L", (s)=>showPopup("PACK L "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secAir, "PACK R", (s)=>showPopup("PACK R "+(s?"ON":"OFF"),"regional"));

  // ANTI-ICE
  const secAnti = createSection("ANTI-ICE");
  createRegionalToggle(secAnti, "ENG 1 ANTI-ICE", (s)=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secAnti, "ENG 2 ANTI-ICE", (s)=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secAnti, "WING ANTI-ICE", (s)=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"regional"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRegionalToggle(secLights, "BEACON", (s)=>showPopup("BEACON "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secLights, "NAV", (s)=>showPopup("NAV "+(s?"ON":"OFF"),"regional"));
  createRegionalToggle(secLights, "LANDING", (s)=>showPopup("LANDING "+(s?"ON":"OFF"),"regional"));
    const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}
//=========================
// E195-E2
//=========================
    function loadE195E2() {

  const secElec = createSection("ELECTRICAL");
  createRegionalToggle(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"ejet"));

  const secFuel = createSection("FUEL");
  createRegionalToggle(secFuel, "L PUMP", s=>showPopup("L PUMP "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secFuel, "R PUMP", s=>showPopup("R PUMP "+(s?"ON":"OFF"),"ejet"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"ejet"));

  const secBleed = createSection("BLEED / PACKS");
  createRegionalToggle(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"ejet"));

  const secAPU = createSection("APU");
  createRegionalToggle(secAPU, "APU MASTER", s=>showPopup("APU MASTER "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secAPU, "APU START", s=>{
    if(s){
      showPopup("APU STARTING…","ejet");
      setTimeout(()=>{ showPopup("APU → RUNNING","ejet"); playChime(); },2000);
    } else showPopup("APU → SHUTDOWN","ejet");
  });

  const secIce = createSection("ANTI-ICE");
  createRegionalToggle(secIce, "ENG 1 ANTI-ICE", s=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secIce, "ENG 2 ANTI-ICE", s=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"ejet"));

  const secLights = createSection("LIGHTS");
  createRegionalToggle(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"ejet"));
        const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

//=========================
// E175
//=========================
    function loadE175() {

  const secElec = createSection("ELECTRICAL");
  createRegionalToggle(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"ejet"));

  const secFuel = createSection("FUEL");
  createRegionalToggle(secFuel, "L PUMP", s=>showPopup("L PUMP "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secFuel, "R PUMP", s=>showPopup("R PUMP "+(s?"ON":"OFF"),"ejet"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"ejet"));

  const secBleed = createSection("BLEED / PACKS");
  createRegionalToggle(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"ejet"));

  const secAPU = createSection("APU");
  createRegionalToggle(secAPU, "APU MASTER", s=>showPopup("APU MASTER "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secAPU, "APU START", s=>{
    if(s){
      showPopup("APU STARTING…","ejet");
      setTimeout(()=>{ showPopup("APU → RUNNING","ejet"); playChime(); },2000);
    } else showPopup("APU → SHUTDOWN","ejet");
  });

  const secIce = createSection("ANTI-ICE");
  createRegionalToggle(secIce, "ENG 1 ANTI-ICE", s=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secIce, "ENG 2 ANTI-ICE", s=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"ejet"));

  const secLights = createSection("LIGHTS");
  createRegionalToggle(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"ejet"));
  createRegionalToggle(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"ejet"));
        const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

}

//=========================
// ERJ170
//=========================
function loadERJ170() {

  const secElec = createSection("ELECTRICAL");
  createRegionalToggle(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"erj"));

const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  const secFuel = createSection("FUEL");
  createRegionalToggle(secFuel, "L PUMP", s=>showPopup("L PUMP "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secFuel, "R PUMP", s=>showPopup("R PUMP "+(s?"ON":"OFF"),"erj"));
  createBoeingPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"erj"));

  const secBleed = createSection("BLEED / PACKS");
  createRegionalToggle(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"erj"));

  const secAPU = createSection("APU");
  createRegionalToggle(secAPU, "APU MASTER", s=>showPopup("APU MASTER "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secAPU, "APU START", s=>{
    if(s){
      showPopup("APU STARTING…","erj");
      setTimeout(()=>{ showPopup("APU → RUNNING","erj"); playChime(); },2000);
    } else showPopup("APU → SHUTDOWN","erj");
  });

  const secIce = createSection("ANTI-ICE");
  createRegionalToggle(secIce, "ENG 1 ANTI-ICE", s=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secIce, "ENG 2 ANTI-ICE", s=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"erj"));

  const secLights = createSection("LIGHTS");
  createRegionalToggle(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"erj"));
  createRegionalToggle(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"erj"));
}

//=========================
// A300
//=========================
    function loadA300() {

  const secElec = createSection("ELECTRICAL");
  createAirbusPush(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secElec, "APU GEN", s=>showPopup("APU GEN "+(s?"ON":"OFF"),"airbus"));

  const secFuel = createSection("FUEL");
  createAirbusPush(secFuel, "L PUMP", s=>showPopup("L PUMP "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secFuel, "CTR PUMP", s=>showPopup("CTR PUMP "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secFuel, "R PUMP", s=>showPopup("R PUMP "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secFuel, "X-FEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"airbus"));

  const secBleed = createSection("BLEED / PACKS");
  createAirbusPush(secBleed, "PACK L", s=>showPopup("PACK L "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secBleed, "PACK R", s=>showPopup("PACK R "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"airbus"));

  const secAPU = createSection("APU");
  createAirbusPush(secAPU, "APU MASTER", s=>showPopup("APU MASTER "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secAPU, "APU START", s=>{
    if(s){
      showPopup("APU STARTING…","airbus");
      setTimeout(()=>{ showPopup("APU → RUNNING","airbus"); playChime(); },2000);
    } else showPopup("APU → SHUTDOWN","airbus");
  });

const secCabin = createSection("CABIN TEMP");

createTempModeKnob(secCabin, "TEMP MODE", (mode) => {
  console.log("Cabin temp mode:", mode);
});

  const secIce = createSection("ANTI-ICE");
  createAirbusPush(secIce, "ENG 1 ANTI-ICE", s=>showPopup("ENG 1 ANTI-ICE "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secIce, "ENG 2 ANTI-ICE", s=>showPopup("ENG 2 ANTI-ICE "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"airbus"));

  const secLights = createSection("LIGHTS");
  createAirbusPush(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"airbus"));
  createAirbusPush(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"airbus"));
}

//=========================
// DC-3
//=========================
function loadDC3() {

  // ELECTRICAL
  const secElec = createSection("ELECTRICAL");
  createRocker(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"dc3"));
  createRocker(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"dc3"));
  createRocker(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"dc3"));

  // FUEL
  const secFuel = createSection("FUEL");
  createRocker(secFuel, "L BOOST PUMP", s=>showPopup("L BOOST PUMP "+(s?"ON":"OFF"),"dc3"));
  createRocker(secFuel, "R BOOST PUMP", s=>showPopup("R BOOST PUMP "+(s?"ON":"OFF"),"dc3"));
  createBoeingPush(secFuel, "CROSSFEED", s=>showPopup("CROSSFEED "+(s?"OPEN":"CLOSED"),"dc3"));

  // ANTI-ICE
  const secIce = createSection("ANTI-ICE");
  createRocker(secIce, "PITOT HEAT", s=>showPopup("PITOT HEAT "+(s?"ON":"OFF"),"dc3"));
  createRocker(secIce, "CARB HEAT", s=>showPopup("CARB HEAT "+(s?"ON":"OFF"),"dc3"));

  // LIGHTS
  const secLights = createSection("LIGHTS");
  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"dc3"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"dc3"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"dc3"));
}
  // ============================
  // Concorde
  // ============================
function loadConcorde() {

  // ============================
  // ELECTRICAL
  // ============================
  const secElec = createSection("ELECTRICAL");

  createBoeingPush(secElec, "BATTERY", s=>showPopup("BATTERY "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secElec, "GEN 1", s=>showPopup("GEN 1 "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secElec, "GEN 2", s=>showPopup("GEN 2 "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secElec, "GEN 3", s=>showPopup("GEN 3 "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secElec, "GEN 4", s=>showPopup("GEN 4 "+(s?"ON":"OFF"),"concorde"));

  createRocker(secElec, "AC BUS 1", s=>showPopup("AC BUS 1 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secElec, "AC BUS 2", s=>showPopup("AC BUS 2 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secElec, "DC BUS 1", s=>showPopup("DC BUS 1 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secElec, "DC BUS 2", s=>showPopup("DC BUS 2 "+(s?"ON":"OFF"),"concorde"));


  // ============================
  // FUEL SYSTEM (Concorde is famous for this)
  // ============================
  const secFuel = createSection("FUEL SYSTEM");

  createRocker(secFuel, "FEED TANK 1", s=>showPopup("FEED TANK 1 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secFuel, "FEED TANK 2", s=>showPopup("FEED TANK 2 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secFuel, "FEED TANK 3", s=>showPopup("FEED TANK 3 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secFuel, "FEED TANK 4", s=>showPopup("FEED TANK 4 "+(s?"ON":"OFF"),"concorde"));

  createBoeingPush(secFuel, "TRANSFER FWD", s=>showPopup("TRANSFER FWD "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secFuel, "TRANSFER AFT", s=>showPopup("TRANSFER AFT "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secFuel, "TRIM TANK", s=>showPopup("TRIM TANK "+(s?"ACTIVE":"OFF"),"concorde"));

  createRocker(secFuel, "CROSSFEED 1-2", s=>showPopup("CROSSFEED 1-2 "+(s?"OPEN":"CLOSED"),"concorde"));
  createRocker(secFuel, "CROSSFEED 3-4", s=>showPopup("CROSSFEED 3-4 "+(s?"OPEN":"CLOSED"),"concorde"));


  // ============================
  // BLEED / PACKS
  // ============================
  const secBleed = createSection("BLEED / PACKS");

  createRocker(secBleed, "PACK 1", s=>showPopup("PACK 1 "+(s?"ON":"OFF"),"concorde"));
  createRocker(secBleed, "PACK 2", s=>showPopup("PACK 2 "+(s?"ON":"OFF"),"concorde"));

  createRocker(secBleed, "ENG 1 BLEED", s=>showPopup("ENG 1 BLEED "+(s?"ON":"OFF"),"concorde"));
  createRocker(secBleed, "ENG 2 BLEED", s=>showPopup("ENG 2 BLEED "+(s?"ON":"OFF"),"concorde"));
  createRocker(secBleed, "ENG 3 BLEED", s=>showPopup("ENG 3 BLEED "+(s?"ON":"OFF"),"concorde"));
  createRocker(secBleed, "ENG 4 BLEED", s=>showPopup("ENG 4 BLEED "+(s?"ON":"OFF"),"concorde"));


  // ============================
  // PRESSURIZATION
  // ============================
  const secPress = createSection("PRESSURIZATION");

  createRocker(secPress, "CABIN AUTO", s=>showPopup("CABIN MODE "+(s?"AUTO":"MANUAL"),"concorde"));
  createRocker(secPress, "OUTFLOW VALVE", s=>showPopup("OUTFLOW VALVE "+(s?"OPEN":"CLOSED"),"concorde"));
  createRocker(secPress, "DUMP", s=>showPopup("CABIN DUMP "+(s?"ACTIVE":"OFF"),"concorde"));


  // ============================
  // HYDRAULICS
  // ============================
  const secHyd = createSection("HYDRAULICS");

  createRocker(secHyd, "HYD A", s=>showPopup("HYD A "+(s?"ON":"OFF"),"concorde"));
  createRocker(secHyd, "HYD B", s=>showPopup("HYD B "+(s?"ON":"OFF"),"concorde"));
  createRocker(secHyd, "HYD C", s=>showPopup("HYD C "+(s?"ON":"OFF"),"concorde"));


  // ============================
  // ENGINE CONTROL
  // ============================
  const secEng = createSection("ENGINE CONTROL");

  createBoeingPush(secEng, "IGNITION", s=>showPopup("IGNITION "+(s?"ON":"OFF"),"concorde"));
  createRocker(secEng, "REHEAT (AFTERBURNER)", s=>showPopup("REHEAT "+(s?"ON":"OFF"),"concorde"));
  createRocker(secEng, "INTAKE RAMP", s=>showPopup("INTAKE RAMP "+(s?"AUTO":"MANUAL"),"concorde"));


  // ============================
  // POWER (Concorde has no APU)
  // ============================
  const secAPU = createSection("GROUND POWER");

  createBoeingPush(secAPU, "EXT PWR", s=>showPopup("EXTERNAL POWER "+(s?"ON":"OFF"),"concorde"));
  createBoeingPush(secAPU, "AIR START", s=>showPopup("AIR START "+(s?"ON":"OFF"),"concorde"));


  // ============================
  // ANTI-ICE
  // ============================
  const secIce = createSection("ANTI-ICE");

  createRocker(secIce, "ENG ANTI-ICE", s=>showPopup("ENG ANTI-ICE "+(s?"ON":"OFF"),"concorde"));
  createRocker(secIce, "WING ANTI-ICE", s=>showPopup("WING ANTI-ICE "+(s?"ON":"OFF"),"concorde"));
  createRocker(secIce, "PITOT HEAT", s=>showPopup("PITOT HEAT "+(s?"ON":"OFF"),"concorde"));


  // ============================
  // LIGHTS
  // ============================
  const secLights = createSection("LIGHTS");

  createRocker(secLights, "BEACON", s=>showPopup("BEACON "+(s?"ON":"OFF"),"concorde"));
  createRocker(secLights, "STROBE", s=>showPopup("STROBE "+(s?"ON":"OFF"),"concorde"));
  createRocker(secLights, "NAV", s=>showPopup("NAV "+(s?"ON":"OFF"),"concorde"));
  createRocker(secLights, "LANDING", s=>showPopup("LANDING "+(s?"ON":"OFF"),"concorde"));
  createRocker(secLights, "TAXI", s=>showPopup("TAXI "+(s?"ON":"OFF"),"concorde"));

}

  // ============================================================
  //  INITIAL LOAD
  // ============================================================

  loadOverhead();

})();
