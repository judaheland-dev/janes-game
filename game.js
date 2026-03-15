// Remove a weasel from petWeasels by id (for log button)
window.releaseWeaselFromLogById = function(id) {
  if (!id) return;
  // Remove from petWeasels by id
  let idx = petWeasels.findIndex(w => w.id === id);
  if (idx !== -1) {
    petWeasels.splice(idx, 1);
    saveGame();
    showScreen('petzone');
  }
};
// Animation for pet zone weasels (must be defined before any screen rendering)
window.startPetZoneWeaselAnim = function() {
  if (window.petZoneWeaselAnim) cancelAnimationFrame(window.petZoneWeaselAnim);
  window.petZoneVisible = true;
  window.animateWeasels = function animateWeasels() {
    if (!window.petZoneVisible) return;
    let ws = window.filteredPetWeasels || [];
    ws.forEach((w, idx) => {
      if (!w) return;
      // Occasionally randomize direction and speed
      if (Math.random() < 0.03) {
        w.vx = (Math.random()-0.5)*6;
        w.vy = (Math.random()-0.5)*4;
      }
      w.x += w.vx;
      w.y += w.vy;
      // Bounce off left/right edges (0 to 900)
      if (w.x < 0) { w.x = 0; w.vx = Math.abs(w.vx); }
      if (w.x > 900) { w.x = 900; w.vx = -Math.abs(w.vx); }
      // Bounce off top/bottom edges (0 to 700)
      if (w.y < 0) { w.y = 0; w.vy = Math.abs(w.vy); }
      if (w.y > 700) { w.y = 700; w.vy = -Math.abs(w.vy); }
      let el = document.getElementById('cute-weasel-pet-' + idx);
      if (el) {
        el.style.left = w.x + 'px';
        el.style.top = w.y + 'px';
      }
    });
    window.petZoneWeaselAnim = requestAnimationFrame(window.animateWeasels);
  }
  window.petZoneWeaselAnim = requestAnimationFrame(window.animateWeasels);
}

// Pet weasel state
let petWeasels = [];
function petZoneScreen() {
  // Fountain logic
  if (typeof window.fountainLastFilled === 'undefined') window.fountainLastFilled = Date.now();
  if (typeof window.petWeasels === 'undefined') window.petWeasels = petWeasels;
  const now = Date.now();
  let lost = 0;
  // Assign foodType when a weasel becomes hungry
  const foodOptions = ['weasel hamburger', 'weasel lollipop', 'weasel pancakes', 'weasel fries', 'weasel ice cream', 'weasel ketchup', 'weasel punch'];
  // Hungry weasels: need food every 5 days
  let hungryWeasels = petWeasels.filter(w => {
    if (!w.nextFeed) w.nextFeed = w.lastFed + 5*24*60*60*1000;
    if (!w.foodType) w.foodType = foodOptions[Math.floor(Math.random()*foodOptions.length)];
    if (now > w.nextFeed) {
      w.needFood = true;
      if (!w.foodType) w.foodType = foodOptions[Math.floor(Math.random()*foodOptions.length)];
      return true;
    }
    w.needFood = false;
    return false;
  });
  // Only show non-hungry weasels in pet zone
  let filteredPetWeasels = petWeasels.filter(w => {
    // Needs water every day
    if (now - w.lastDrank > 24*60*60*1000) { lost++; return false; }
    // Fountain not filled in a week
    if (now - window.fountainLastFilled > 7*24*60*60*1000) { lost++; return false; }
    // Not hungry
    return !w.needFood;
  });
  let html = `<h2>Pet Zone</h2>`;
  html += `<div style='display:flex;justify-content:space-between;align-items:flex-end;'>`;
  // Restaurant (bottom left)
  html += `<div style='width:180px;align-self:flex-end;'>`;
  html += `<button id="petzone-restaurant-btn">Restaurant</button>`;
  html += `</div>`;
  html += `<div style='flex:1;'></div>`;
  html += `</div>`;
  // Animated cute weasel and fountain in pet zone
  window.filteredPetWeasels = filteredPetWeasels;
  if (filteredPetWeasels.length > 0) {
    // Flex row: pet zone left, log right
    html += `<div style='display:flex;flex-direction:row;justify-content:center;align-items:flex-start;gap:32px;margin-top:20px;'>`;
    // Pet zone area
    html += `<div id='cute-weasel-pet-zone' style='position:relative;width:1000px;height:900px;border:2px dashed #7ec0ee;background:#f8fcff;'>`;
    // Fountain absolutely centered in pet zone
    let daysLeft = 7 - Math.floor((now - window.fountainLastFilled)/(24*60*60*1000));
    html += `<div style='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;display:flex;flex-direction:column;align-items:center;'>`;
    html += `<div style='width:120px;height:120px;background:#b3e0ff;border-radius:50%;border:4px solid #7ec0ee;display:flex;align-items:center;justify-content:center;font-size:2em;'>⛲</div>`;
    if (daysLeft > 0) {
      html += `<div style='margin-top:6px;font-size:1.1em;'>Fountain water left: ${daysLeft} day${daysLeft!==1?'s':''}</div>`;
    } else {
      html += `<div style='margin-top:6px;font-size:1.1em;color:#e55;'>Fountain is dry!</div>`;
    }
    html += `<button onclick='refillFountain()' style='margin-top:4px;'${daysLeft>0?'':' '}>Refill Fountain (1 spleen)</button>`;
    html += `</div>`;
    // Weasels
    filteredPetWeasels.forEach((w, idx) => {
      let colorStyle = '';
      if (w.colors && w.colors.length === 1) colorStyle = `background:${w.colors[0]}`;
      else if (w.colors && w.colors.length === 2) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 50%, ${w.colors[1]} 50%, ${w.colors[1]} 100%)`;
      else if (w.colors && w.colors.length === 3) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 33%, ${w.colors[1]} 33%, ${w.colors[1]} 66%, ${w.colors[2]} 66%, ${w.colors[2]} 100%)`;
      if (typeof w.x !== 'number') w.x = 50 + Math.random()*300;
      if (typeof w.y !== 'number') w.y = 120 + Math.random()*120;
      if (typeof w.vx !== 'number') w.vx = (Math.random()-0.5)*6;
      if (typeof w.vy !== 'number') w.vy = (Math.random()-0.5)*4;
      html += `<div id='cute-weasel-pet-${idx}' style='position:absolute;left:${w.x}px;top:${w.y}px;width:60px;height:60px;z-index:10;transition:left 0.1s linear,top 0.1s linear;'>`;
      html += `<div style='width:48px;height:48px;border-radius:50%;box-shadow:0 2px 8px #888;display:flex;align-items:center;justify-content:center;font-size:1.5em;${colorStyle};'>🐹</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    // Cute weasel log (right)
    html += `<div style='width:340px;max-height:900px;overflow-y:auto;background:#fff8;border:1px solid #ccc;border-radius:10px;padding:10px;'>`;
    html += `<div style='font-weight:bold;margin-bottom:6px;'>Cute Weasel Log</div>`;
    filteredPetWeasels.forEach((w, i) => {
      let colorStyle = '';
      if (w.colors && w.colors.length === 1) colorStyle = `background:${w.colors[0]}`;
      else if (w.colors && w.colors.length === 2) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 50%, ${w.colors[1]} 50%, ${w.colors[1]} 100%)`;
      else if (w.colors && w.colors.length === 3) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 33%, ${w.colors[1]} 33%, ${w.colors[1]} 66%, ${w.colors[2]} 66%, ${w.colors[2]} 100%)`;
      let lastAte = w.lastFed ? new Date(w.lastFed).toLocaleDateString() : 'Never';
      let lastDrank = w.lastDrank ? new Date(w.lastDrank).toLocaleDateString() : 'Never';
      html += `<div style='display:flex;align-items:center;margin-bottom:8px;'>`;
      html += `<div style='width:36px;height:36px;border-radius:50%;margin-right:8px;${colorStyle};display:flex;align-items:center;justify-content:center;font-size:1.5em;'>🐹</div>`;
      html += `<div style='flex:1;'>`;
      html += `<div style='font-size:1em;'>#${i+1} ${w.name ? `<b>"${w.name}"</b> ` : ''}${w.colors ? w.colors.join(', ') : ''}</div>`;
      html += `<div style='font-size:0.9em;color:#555;'>Last ate: ${lastAte}</div>`;
      html += `<div style='font-size:0.9em;color:#555;'>Last drank: ${lastDrank}</div>`;
      html += `<input type='text' placeholder='Name me!' value='${w.name||''}' style='margin-top:4px;width:90%;font-size:0.95em;' onchange='nameCuteWeasel(${i},this.value)' onkeydown='if(event.key==="Enter"){this.blur();}' maxlength='20' />`;
      html += `</div>`;
      html += `<button onclick='releaseWeaselFromLogById("${w.id}")' style='margin-left:10px;background:#e55;color:#fff;padding:4px 10px;border:none;border-radius:8px;font-size:0.95em;cursor:pointer;'>Release to Wild</button>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `</div>`; // end flex row
  }
  // Cute weasel log for hungry weasels
  if (hungryWeasels.length > 0) {
    html += `<div style='width:340px;max-width:100vw;margin:20px auto 0 auto;background:#fff8;border:1px solid #ccc;border-radius:10px;padding:10px;'>`;
    html += `<div style='font-weight:bold;margin-bottom:6px;'>Cute Weasel Log</div>`;
    hungryWeasels.forEach((w, i) => {
      let colorStyle = '';
      if (w.colors && w.colors.length === 1) colorStyle = `background:${w.colors[0]}`;
      else if (w.colors && w.colors.length === 2) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 50%, ${w.colors[1]} 50%, ${w.colors[1]} 100%)`;
      else if (w.colors && w.colors.length === 3) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 33%, ${w.colors[1]} 33%, ${w.colors[1]} 66%, ${w.colors[2]} 66%, ${w.colors[2]} 100%)`;
      html += `<div style='display:flex;align-items:center;margin-bottom:8px;'>`;
      html += `<div style='width:36px;height:36px;border-radius:50%;margin-right:8px;${colorStyle};display:flex;align-items:center;justify-content:center;font-size:1.5em;'>🐹</div>`;
      html += `<div style='flex:1;'>`;
      html += `<div style='font-size:1em;'>#${i+1} ${w.colors ? w.colors.join(', ') : ''}</div>`;
      html += `<div style='font-size:0.9em;color:#e55;'>Waiting for food at restaurant</div>`;
      html += `<div style='font-size:0.9em;color:#555;'>Wants: ${w.foodType || '???'}</div>`;
      html += `</div>`;
      html += `</div>`;
    });
    html += `</div>`;
  }
  if (lost > 0) {
    // Remove lost weasels from storage and save
    petWeasels = petWeasels.filter(w => !((now - w.lastDrank > 24*60*60*1000) || (now - window.fountainLastFilled > 7*24*60*60*1000)));
    saveGame();
    html += `<div style='color:red;'>${lost} weasel${lost!==1?'s':''} ran away due to neglect!</div>`;
  }
  setTimeout(function() {
    var btn = document.getElementById('petzone-restaurant-btn');
    if (btn) btn.onclick = window.showPetRestaurant;
  }, 0);
  return html;
}

// Fountain refill logic
window.refillFountain = function() {
  if (storage.spleens > 0) {
    storage.spleens--;
    window.fountainLastFilled = Date.now();
    saveGame();
    showScreen('petzone');
  } else {
    alert('You need a weasel spleen to refill the fountain!');
  }
}

// New restaurant logic per user request
window.showPetRestaurant = function showPetRestaurant() {
  // Expanded food options
  const foodOptions = [
    'weasel hamburger',
    'weasel lollipop',
    'weasel pancakes',
    'weasel fries',
    'weasel ice cream',
    'weasel ketchup',
    'weasel punch',
    'lettuce',
    'tomatoes',
    'wheat'
  ];
  // Assign foodType if missing
  let hungry = petWeasels.filter(w => {
    if (!w.nextFeed) w.nextFeed = w.lastFed + 5*24*60*60*1000;
    if (!w.foodType || foodOptions.indexOf(w.foodType) === -1) w.foodType = foodOptions[Math.floor(Math.random()*foodOptions.length)];
    return w.needFood;
  });
  let html = `<h2>Pet Zone Restaurant</h2>`;
  if (hungry.length === 0) {
    html += `<div style='margin:60px auto;text-align:center;font-size:1.3em;color:#444;'>All of your weasels are full!</div>`;
  } else {
    html += `<div style='display:flex;flex-wrap:wrap;gap:24px;margin-top:24px;justify-content:center;'>`;
    hungry.forEach((w, idx) => {
      let colorStyle = '';
      if (w.colors && w.colors.length === 1) colorStyle = `background:${w.colors[0]}`;
      else if (w.colors && w.colors.length === 2) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 50%, ${w.colors[1]} 50%, ${w.colors[1]} 100%)`;
      else if (w.colors && w.colors.length === 3) colorStyle = `background:linear-gradient(90deg, ${w.colors[0]} 0%, ${w.colors[0]} 33%, ${w.colors[1]} 33%, ${w.colors[1]} 66%, ${w.colors[2]} 66%, ${w.colors[2]} 100%)`;
      html += `<div style='width:140px;height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff8;border:1px solid #ccc;border-radius:12px;padding:10px;'>`;
      html += `<div style='width:60px;height:60px;border-radius:50%;margin-bottom:8px;${colorStyle};display:flex;align-items:center;justify-content:center;font-size:2em;'>🐹</div>`;
      html += `<div style='font-size:1em;margin-bottom:6px;'>${w.colors ? w.colors.join(', ') : ''}</div>`;
      html += `<div style='font-size:0.95em;color:#e55;margin-bottom:6px;'>Waiting for food</div>`;
      html += `<div style='font-size:0.95em;color:#555;margin-bottom:8px;'>Wants: <b>${w.foodType || '???'}</b></div>`;
      // Feed button
      html += `<button onclick='feedHungryWeasel(${petWeasels.indexOf(w)})' style='background:#7cfc00;color:#222;padding:6px 14px;border:none;border-radius:8px;font-size:1em;cursor:pointer;'>Feed</button>`;
      html += `</div>`;
    });
    html += `</div>`;
  }
  html += `<div style='margin-top:30px;text-align:center;'><button onclick="showScreen('petzone')">Back to Pet Zone</button></div>`;
  var container = document.getElementById('game-container');
  if (container) {
    container.innerHTML = html;
  } else {
    alert('Error: game-container not found!');
  }
}

// Feed a hungry weasel and return it to the pet zone
window.feedHungryWeasel = function feedHungryWeasel(idx) {
  let w = petWeasels[idx];
  if (!w || !w.needFood) return;
  // Expanded food options
  const foodOptions = [
    'weasel hamburger',
    'weasel lollipop',
    'weasel pancakes',
    'weasel fries',
    'weasel ice cream',
    'weasel ketchup',
    'weasel punch',
    'lettuce',
    'tomatoes',
    'wheat'
  ];
  // Check if player has the food in storage
  let foodKey = w.foodType;
  // Map plural to singular for storage keys
  let storageKey = foodKey;
  if (foodKey === 'tomatoes') storageKey = 'tomato';
  if (foodKey === 'weasel lollipop') storageKey = 'weasel lollipop';
  if (foodKey === 'weasel hamburger') storageKey = 'weasel hamburger';
  if (foodKey === 'weasel pancakes') storageKey = 'weasel pancakes';
  if (foodKey === 'weasel fries') storageKey = 'weasel fries';
  if (foodKey === 'weasel ice cream') storageKey = 'weasel ice cream';
  if (foodKey === 'weasel ketchup') storageKey = 'weasel ketchup';
  if (foodKey === 'weasel punch') storageKey = 'weasel punch';
  // For lettuce, wheat, tomato
  if (foodKey === 'lettuce') storageKey = 'lettuce';
  if (foodKey === 'wheat') storageKey = 'wheat';
  // Check storage
  if ((storage[storageKey]||0) > 0) {
    storage[storageKey]--;
    w.lastFed = Date.now();
    w.nextFeed = w.lastFed + 5*24*60*60*1000;
    w.needFood = false;
    // Pick a new food for next time
    w.foodType = foodOptions[Math.floor(Math.random()*foodOptions.length)];
    storage.weaselsFed = (storage.weaselsFed||0) + 1;
    saveGame();
    showPetRestaurant();
  } else {
    alert('You do not have the required food: ' + w.foodType);
  }
}

function showWeaselInfo(idx) {
  let w = petWeasels[idx];
  if (!w) return;
  let colorText = w.colors ? w.colors.join(', ') : 'unknown';
  let lastAte = w.lastFed ? new Date(w.lastFed).toLocaleString() : 'Never';
  let lastDrank = w.lastDrank ? new Date(w.lastDrank).toLocaleString() : 'Never';
  let html = `<div style='position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0008;z-index:999;display:flex;align-items:center;justify-content:center;' onclick='closeWeaselInfo()'>`;
  html += `<div style='background:#fff;padding:30px 30px 20px 30px;border-radius:16px;min-width:320px;box-shadow:0 4px 32px #888;position:relative;' onclick='event.stopPropagation()'>`;
  html += `<div style='font-size:2em;margin-bottom:10px;'>🐹 Cute Weasel Info</div>`;
  html += `<div style='margin-bottom:8px;'><b>Color(s):</b> ${colorText}</div>`;
  html += `<div style='margin-bottom:8px;'><b>Last ate:</b> ${lastAte}</div>`;
  html += `<div style='margin-bottom:8px;'><b>Last drank:</b> ${lastDrank}</div>`;
  html += `<button onclick='releaseWeasel(${idx})' style='margin-top:16px;background:#e55;color:#fff;padding:8px 18px;border:none;border-radius:8px;font-size:1.1em;cursor:pointer;'>Release to Wild</button>`;
  html += `<button onclick='closeWeaselInfo()' style='margin-top:16px;margin-left:12px;background:#aaa;color:#fff;padding:8px 18px;border:none;border-radius:8px;font-size:1.1em;cursor:pointer;'>Close</button>`;
  html += `</div></div>`;
  let popup = document.createElement('div');
  popup.id = 'weasel-info-popup';
  popup.innerHTML = html;
  document.body.appendChild(popup);
}

function closeWeaselInfo() {
  let popup = document.getElementById('weasel-info-popup');
  if (popup) popup.remove();
}

function releaseWeasel(idx) {
  petWeasels.splice(idx, 1);
  saveGame();
  closeWeaselInfo();
  showScreen('petzone');
}



// Cage logic
let cageWeasels = [];
let cageType = 'small';
const cageTypes = {
  rusty:  { name: 'Rusty Cage', capacity: 1, cost: 1 },
  small:  { name: 'Small Cage', capacity: 3, cost: 5 },
  big:    { name: 'Big Cage', capacity: 5, cost: 10 },
  mythic: { name: 'Mythic Weasel Cage', capacity: 10, cost: 50 }
};


const screens = {
  camp: campScreen,
  holes: holesScreen,
  shop: shopScreen,
  factory: factoryScreen,
  cage: cageScreen,
  storage: storageScreen,
  garden: gardenScreen,
  petzone: petZoneScreen,
  restaurant: showPetRestaurant,
  achievements: achievementsScreen
};


function showScreen(name) {
  document.getElementById('game-container').innerHTML = screens[name]();
  if (name === 'petzone' && typeof window.startPetZoneWeaselAnim === 'function') {
    window.petZoneVisible = true;
    setTimeout(() => window.startPetZoneWeaselAnim(), 0);
  } else {
    window.petZoneVisible = false;
  }
  if (name === 'holes') startWeaselGame();
}


function campScreen() {
  return `
    <div style="position:relative;min-height:200px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
        <button onclick="showScreen('achievements')" style="font-weight:bold;">Achievements</button>
      </div>
      <div class="camp-cage">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="font-weight:bold;">Weasel Cage (${cageWeasels.length} / ${cageTypes[cageType].capacity})</div>
          <div style="margin-top:8px;">
            ${cageWeasels.length === 0 ? '<span style="color:#888;">Empty</span>' : cageWeasels.map(w => `<div class="weasel ${w}" style="width:40px;height:40px;font-size:0.8em;margin:2px auto;">${w.replace('-', ' ')}</div>`).join('')}
          </div>
        </div>
      </div>
      <button onclick="showScreen('cage')" style="margin:10px 10px 0 0;">Enter Weasel Cage</button>
      <button onclick="showScreen('storage')" style="margin:10px 0 0 10px;">Storage</button>
      <h2>Welcome to Camp!</h2>
      <p>Prepare for the weasel hunt!</p>
      <div id="debug-new-day-container"></div>
    </div>
  `;
}

// Ensure debug button appears after camp screen renders
if (!window._debugNewDayObserver) {
  window._debugNewDayObserver = new MutationObserver(() => {
    if (document.getElementById('debug-new-day-container')) {
      addDebugNewDayButtonToCamp();
    }
  });
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    window._debugNewDayObserver.observe(gameContainer, { childList: true, subtree: true });
  }
}

function addDebugNewDayButtonToCamp() {
  let container = document.getElementById('debug-new-day-container');
  if (!container) return;
  container.innerHTML = '';
  let btn = document.createElement('button');
  btn.textContent = 'Debug: New Day';
  btn.style.background = '#ffb6c1';
  btn.style.color = '#222';
  btn.style.fontSize = '20px';
  btn.style.padding = '16px 32px';
  btn.style.border = '2px solid #222';
  btn.style.borderRadius = '12px';
  btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
  btn.style.opacity = '0.95';
  btn.style.margin = '32px auto 0 auto';
  btn.style.display = 'block';
  btn.onclick = () => {
    if (window.advanceDay) window.advanceDay();
    if (window.screens && window.screens.camp) window.screens.camp();
  };
  container.appendChild(btn);
}

// Storage logic
let storage = {
  eyeballs: 0,
  hearts: 0,
  guts: 0,
  spleens: 0,
  tomatoes: 0,
  lettuce: 0,
  wheat: 0,
  eyeballSeeds: 0,
  weaselsCaught: 0,
  weaselsPopped: 0,
  weaselsFed: 0
};

let seeds = {
  tomato: 0,
  lettuce: 0,
  wheat: 0,
  eyeball: 0
};

// Garden logic
let garden = Array(10).fill(null); // Each spot: {seed, plantedAt, growTime}
// Weasel pop requirements and rewards
const weaselPopData = {
  normal:    {clicks: 3, eyeballs: 2, hearts: 1, guts: [1,2], spleenChance: 0.01},
  bronze:    {clicks: 4, eyeballs: 2, hearts: 1, guts: [2,3], spleenChance: 0.03},
  silver:    {clicks: 5, eyeballs: 2, hearts: 1, guts: [2,4], spleenChance: 0.07},
  'three-eyed': {clicks: 6, eyeballs: 3, hearts: 1, guts: [3,5], spleenChance: 0.12},
  gold:      {clicks: 7, eyeballs: 2, hearts: 1, guts: [4,6], spleenChance: 0.18},
  rainbow:   {clicks: 8, eyeballs: 2, hearts: 1, guts: [5,8], spleenChance: 0.25},
  mythic:    {clicks: 10, eyeballs: 2, hearts: 1, guts: [8,12], spleenChance: 0.5}
};

let cageWeaselStates = [];

function cageScreen() {
  // Initialize click states for each weasel if needed
  if (cageWeaselStates.length !== cageWeasels.length) {
    cageWeaselStates = cageWeasels.map(w => ({type: w, clicks: 0}));
  }
    return `
      <h2>Weasel Cage</h2>
      <div style="position:relative; width:100vw; height:60vh; min-height:400px;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:flex;flex-wrap:wrap;gap:60px;justify-content:center;align-items:center;">
            ${cageWeaselStates.length === 0 ? '<span style="color:#888;">No weasels in cage</span>' : cageWeaselStates.map((w, i) => {
              let colorStyle = '';
              if (w.type === 'cute' && petWeasels.length > 0) {
                let pet = petWeasels[petWeasels.length-1];
                let colors = pet && pet.colors ? pet.colors : ['pink'];
                 if (colors.length === 1) colorStyle = `background:${colors[0]}`;
                 else if (colors.length === 2) colorStyle = `background:linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`;
                 else colorStyle = `background:linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 33%, ${colors[1]} 33%, ${colors[1]} 66%, ${colors[2]} 66%, ${colors[2]} 100%)`;
              }
              return `<div class=\"weasel ${w.type}\" style=\"width:180px;height:180px;font-size:2em;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px #888;${colorStyle}\" onclick=\"popWeasel(${i})\">${w.type.replace('-', ' ')}<br><span style=\"font-size:1.1em;\">(${w.clicks}/${weaselPopData[w.type].clicks})</span></div>`;
            }).join('')}
        </div>
      </div>
      <div style="margin-top:30px;text-align:center;"><button onclick=\"showScreen('camp')\">Back to Camp</button></div>
    `;
}

function popWeasel(idx) {
  if (!cageWeaselStates[idx]) return;
  cageWeaselStates[idx].clicks++;
  const wtype = cageWeaselStates[idx].type;
  if (wtype === 'cute') {
    // Move to pet zone
    // Assign random color(s) at creation
    const allColors = ['red','orange','yellow','green','blue','indigo','violet','pink'];
    let colorCount = Math.random() < 0.5 ? 1 : (Math.random() < 0.8 ? 2 : 3); // 1: 50%, 2: 30%, 3: 20%
    let colorPool = allColors.slice();
    let colors = [];
    for (let i = 0; i < colorCount; i++) {
      if (colorPool.length === 0) break;
      let idx = Math.floor(Math.random() * colorPool.length);
      colors.push(colorPool.splice(idx, 1)[0]);
    }
    petWeasels.push({
      adoptedAt: Date.now(),
      lastFed: Date.now(),
      lastDrank: Date.now(),
      needFood: true,
      foodType: 'weasel hamburger',
      id: Math.random().toString(36).slice(2),
      colors: colors,
      name: '' // New: name property
    });
    storage.weaselsCaught = (storage.weaselsCaught||0) + 1;
    cageWeasels.splice(idx, 1);
    cageWeaselStates.splice(idx, 1);
    alert('You adopted a cute weasel! It has moved to your Pet Zone.');
    showScreen('petzone');
    return;
  }
  if (cageWeaselStates[idx].clicks >= weaselPopData[wtype].clicks) {
    // Grant rewards
    storage.eyeballs += weaselPopData[wtype].eyeballs;
    storage.hearts += weaselPopData[wtype].hearts;
    storage.guts += Math.floor(Math.random() * (weaselPopData[wtype].guts[1] - weaselPopData[wtype].guts[0] + 1)) + weaselPopData[wtype].guts[0];
    if (Math.random() < weaselPopData[wtype].spleenChance) storage.spleens++;
    storage.weaselsPopped = (storage.weaselsPopped||0) + 1;
    // Remove weasel from cage
    cageWeasels.splice(idx, 1);
    cageWeaselStates.splice(idx, 1);
    alert('Weasel popped! Rewards sent to storage.');
  }
  showScreen('cage');
}

function storageScreen() {
  return `
    <h2>Storage</h2>
    <ul style=\"font-size:1.2em;\">
      <li>Weasel Eyeballs: <b>${storage.eyeballs}</b></li>
      <li>Weasel Hearts: <b>${storage.hearts}</b></li>
      <li>Weasel Guts: <b>${storage.guts}</b></li>
      <li>Weasel Spleens: <b>${storage.spleens}</b></li>
      <li>Tomatoes: <b>${storage.tomatoes}</b></li>
      <li>Lettuce: <b>${storage.lettuce}</b></li>
      <li>Wheat: <b>${storage.wheat}</b></li>
      <li>Seeds:</li>
      <ul>
        <li>Tomato Seeds: <b>${seeds.tomato}</b></li>
        <li>Lettuce Seeds: <b>${seeds.lettuce}</b></li>
        <li>Wheat Seeds: <b>${seeds.wheat}</b></li>
        <li>Eyeball Seeds: <b>${seeds.eyeball}</b></li>
      </ul>
    </ul>
    <button onclick=\"showScreen('camp')\">Back to Camp</button>
  `;
}

function holesScreen() {
  let holes = '';
  for (let i = 1; i <= 9; i++) {
    holes += `<div class="hole" id="hole-${i}">${i}</div>`;
  }
  return `
    <h2>Weasel Holes</h2>
    <div class="holes-grid">
      ${holes}
    </div>
    <div style="margin-top:20px;font-size:1em;">Cage: ${cageWeasels.length} / ${cageTypes[cageType].capacity}</div>
  `;
}

function shopScreen() {
  let shopHtml = '<h2>Shop</h2>';
  shopHtml += '<div style="margin-bottom:10px;">You have <b>' + storage.eyeballs + '</b> weasel eyeballs, <b>' + storage.guts + '</b> weasel guts.</div>';
  shopHtml += '<div style="display:flex;flex-direction:column;gap:10px;max-width:350px;">';
  Object.entries(cageTypes).forEach(([key, val]) => {
    if (key !== cageType) {
      shopHtml += `<button onclick=\"buyCage('${key}')\">Buy ${val.name} (${val.capacity} weasels) - ${val.cost} eyeballs</button>`;
    } else {
      shopHtml += `<button disabled style='opacity:0.5;'>${val.name} (owned)</button>`;
    }
  });
  shopHtml += `<button onclick=\"buySeed('tomato')\">Buy Tomato Seeds (1 eyeball)</button>`;
  shopHtml += `<button onclick=\"buySeed('lettuce')\">Buy Lettuce Seeds (1 eyeball)</button>`;
  shopHtml += `<button onclick=\"buySeed('wheat')\">Buy Wheat Seeds (1 eyeball)</button>`;
  shopHtml += `<button onclick=\"buySeed('eyeball')\">Buy Eyeball Seeds (1 guts)</button>`;
  shopHtml += '</div>';
  shopHtml += '<div style="margin-top:20px;"><button onclick=\"showScreen(\'camp\')\">Back to Camp</button></div>';
  return shopHtml;
}

function buySeed(type) {
  if (type === 'eyeball') {
    if (storage.guts < 1) { alert('Not enough weasel guts!'); return; }
    storage.guts--;
    seeds.eyeball++;
    alert('Bought 1 eyeball seed!');
  } else {
    if (storage.eyeballs < 1) { alert('Not enough weasel eyeballs!'); return; }
    storage.eyeballs--;
    seeds[type]++;
    alert('Bought 1 ' + type + ' seed!');
  }
  saveGame();
  showScreen('shop');
}

function gardenScreen() {
  let html = '<h2>Garden</h2>';
  html += '<div style="display:grid;grid-template-columns:repeat(5,60px);gap:12px;justify-content:center;margin:20px 0;">';
  for (let i = 0; i < 10; i++) {
    let spot = garden[i];
    if (!spot) {
      // Show seed selection buttons if this is the selected spot
      if (window.gardenSeedSelect === i) {
        let available = [];
        if (seeds.tomato > 0) available.push('tomato');
        if (seeds.lettuce > 0) available.push('lettuce');
        if (seeds.wheat > 0) available.push('wheat');
        if (seeds.eyeball > 0) available.push('eyeball');
        if (available.length === 0) {
          html += `<div class='hole' style='height:60px;display:flex;align-items:center;justify-content:center;'>No seeds</div>`;
        } else {
          html += `<div class='hole' style='height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;'>`;
          html += `<div style='font-size:0.8em;margin-bottom:2px;'>Choose seed:</div>`;
          available.forEach(seed => {
            html += `<button style='margin:2px 0;font-size:0.9em;' onclick='plantSeedInGarden(${i},"${seed}")'>${seed} (${seeds[seed]})</button>`;
          });
          html += `<button style='margin-top:4px;font-size:0.8em;' onclick='cancelGardenSeedSelect()'>Cancel</button>`;
          html += `</div>`;
        }
      } else {
        html += `<div class='hole' style='height:60px;cursor:pointer;' onclick='selectGardenSeed(${i})'>+</div>`;
      }
    } else {
      let now = Date.now();
      let done = now - spot.plantedAt >= spot.growTime;
      if (done) {
        html += `<div class='hole' style='height:60px;background:#7cfc00;cursor:pointer;' onclick='harvestPlant(${i})'>Ready!<br>${spot.seed}</div>`;
      } else {
        // Show green sprout for growing plant
        html += `<div class='hole' style='height:60px;background:#b6e7a7;display:flex;flex-direction:column;align-items:center;justify-content:center;'>`;
        html += `<div style='font-size:2em;line-height:1;'>&#127793;</div>`;
        let minLeft = Math.ceil((spot.growTime - (now - spot.plantedAt))/60000);
        html += `<div style='font-size:0.8em;'>${spot.seed}<br>${minLeft}m</div>`;
        html += `</div>`;
      }
    }
  }
  html += '</div>';
  html += '<div style="margin-top:20px;"><button onclick="showScreen(\'camp\')">Back to Camp</button></div>';
  return html;
}


window.gardenSeedSelect = null;
window.selectGardenSeed = function(idx) {
  window.gardenSeedSelect = idx;
  showScreen('garden');
}
window.cancelGardenSeedSelect = function() {
  window.gardenSeedSelect = null;
  showScreen('garden');
}
window.plantSeedInGarden = function(idx, seed) {
  if (!seeds[seed] || seeds[seed] <= 0) return;
  seeds[seed]--;
  let growTime = (Math.floor(Math.random()*6)+5)*60000; // 5-10 min
  garden[idx] = { seed: seed, plantedAt: Date.now(), growTime };
  window.gardenSeedSelect = null;
  saveGame();
  showScreen('garden');
}

function harvestPlant(idx) {
  let spot = garden[idx];
  if (!spot) return;
  let now = Date.now();
  if (now - spot.plantedAt < spot.growTime) return;
  // Add to storage immediately
  if (spot.seed === 'eyeball') {
    storage.eyeballs++;
  } else {
    storage[spot.seed]++;
  }
  garden[idx] = null;
  saveGame();
  showScreen('garden');
}


// Processor logic (move to top level, single definition)
let processors = window.processors || Array(5).fill().map(() => ({
  recipe: null, // {name, time, input, output}
  startedAt: null, // timestamp
  doneAt: null, // timestamp
  output: null // {item, qty}
}));
window.processors = processors;

function factoryScreen() {
  // Always use the latest processors array
  processors = window.processors || processors;

const recipes = [
  {
    name: 'Weasel Hamburger',
    input: [
      {item: 'weasel bun', qty: 1},
      {item: 'lettuce', qty: 1},
      {item: 'tomato', qty: 1},
      {item: 'guts', qty: 1}
    ],
    output: {item: 'weasel hamburger', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  },
  {
    name: 'Weasel Bun',
    input: [
      {item: 'wheat', qty: 2}
    ],
    output: {item: 'weasel bun', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  },
  {
    name: 'Weasel Lollipop',
    input: [
      {item: 'eyeballs', qty: 3}
    ],
    output: {item: 'weasel lollipop', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  },
  {
    name: 'Weasel Pancakes',
    input: [
      {item: 'guts', qty: 2},
      {item: 'wheat', qty: 3}
    ],
    output: {item: 'weasel pancakes', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  }
  ,
  {
    name: 'Weasel Fries',
    input: [
      {item: 'guts', qty: 3},
      {item: 'wheat', qty: 3}
    ],
    output: {item: 'weasel fries', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  },
  {
    name: 'Weasel Ice Cream',
    input: [
      {item: 'hearts', qty: 3}
    ],
    output: {item: 'weasel ice cream', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  },
  {
    name: 'Weasel Ketchup',
    input: [
      {item: 'spleens', qty: 1}
    ],
    output: {item: 'weasel ketchup', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  },
  {
    name: 'Weasel Punch',
    input: [
      {item: 'spleens', qty: 1},
      {item: 'hearts', qty: 1}
    ],
    output: {item: 'weasel punch', qty: 1},
    time: 5 * 60 * 1000 // 5 min
  }
];
  let html = '<h2>Factory</h2>';
  html += '<div style="margin-bottom:10px;">Processors: <b>5</b></div>';
  processors.forEach((processor, pIdx) => {
    html += `<div style='border:1px solid #aaa;padding:10px;margin-bottom:10px;'>`;
    html += `<b>Processor ${pIdx+1}</b><br/>`;
    if (processor.recipe) {
      let now = Date.now();
      if (processor.doneAt && now >= processor.doneAt) {
        html += `<div style='color:green;font-weight:bold;'>Done! Output: ${processor.output.qty} ${processor.output.item}</div>`;
        html += `<button onclick='collectProcessorOutput(${pIdx})'>Collect Output</button>`;
      } else {
        let minLeft = Math.ceil((processor.doneAt - now)/60000);
        html += `<div>Processing: ${processor.recipe.name}<br>Time left: ${minLeft} min</div>`;
      }
    } else {
      html += '<div><b>Choose a recipe:</b></div>';
      recipes.forEach((r, i) => {
        html += `<button onclick='chooseRecipe(${i},${pIdx})'>${r.name}</button> `;
      });
    }
    html += '</div>';
  });
  html += '<div style="margin-top:10px;"><b>Storage:</b><ul>';
  html += `<li>Weasel Eyeballs: ${storage.eyeballs||0}</li>`;
  html += `<li>Weasel Hearts: ${storage.hearts||0}</li>`;
  html += `<li>Weasel Guts: ${storage.guts||0}</li>`;
  html += `<li>Weasel Spleens: ${storage.spleens||0}</li>`;
  html += `<li>Tomato: ${storage.tomato||storage.tomatoes||0}</li>`;
  html += `<li>Lettuce: ${storage.lettuce||0}</li>`;
  html += `<li>Wheat: ${storage.wheat||0}</li>`;
  html += `<li>Weasel Bun: ${storage['weasel bun']||0}</li>`;
  html += `<li>Weasel Hamburger: ${storage['weasel hamburger']||0}</li>`;
  html += `<li>Weasel Lollipop: ${storage['weasel lollipop']||0}</li>`;
  html += `<li>Weasel Pancakes: ${storage['weasel pancakes']||0}</li>`;
  html += `<li>Weasel Fries: ${storage['weasel fries']||0}</li>`;
  html += `<li>Weasel Ice Cream: ${storage['weasel ice cream']||0}</li>`;
  html += `<li>Weasel Ketchup: ${storage['weasel ketchup']||0}</li>`;
  html += `<li>Weasel Punch: ${storage['weasel punch']||0}</li>`;
  html += '</ul></div>';
  html += '<div style="margin-top:20px;"><button onclick="showScreen(\'camp\')">Back to Camp</button></div>';
  return html;
}

window.chooseRecipe = function(idx, pIdx) {
  // recipes is only in factoryScreen scope, so redefine here
  const recipes = [
    {
      name: 'Weasel Hamburger',
      input: [
        {item: 'weasel bun', qty: 1},
        {item: 'lettuce', qty: 1},
        {item: 'tomato', qty: 1},
        {item: 'guts', qty: 1}
      ],
      output: {item: 'weasel hamburger', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Bun',
      input: [
        {item: 'wheat', qty: 2}
      ],
      output: {item: 'weasel bun', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Lollipop',
      input: [
        {item: 'eyeballs', qty: 3}
      ],
      output: {item: 'weasel lollipop', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Pancakes',
      input: [
        {item: 'guts', qty: 2},
        {item: 'wheat', qty: 3}
      ],
      output: {item: 'weasel pancakes', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Fries',
      input: [
        {item: 'guts', qty: 3},
        {item: 'wheat', qty: 3}
      ],
      output: {item: 'weasel fries', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Ice Cream',
      input: [
        {item: 'hearts', qty: 3}
      ],
      output: {item: 'weasel ice cream', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Ketchup',
      input: [
        {item: 'spleens', qty: 1}
      ],
      output: {item: 'weasel ketchup', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Punch',
      input: [
        {item: 'spleens', qty: 1},
        {item: 'hearts', qty: 1}
      ],
      output: {item: 'weasel punch', qty: 1},
      time: 5 * 60 * 1000
    },
    {
      name: 'Weasel Salad',
      input: [
        {item: 'lettuce', qty: 5},
        {item: 'tomato', qty: 2},
        {item: 'spleens', qty: 1}
      ],
      output: {item: 'weasel salad', qty: 1},
      time: 5 * 60 * 1000
    }
  ];
  const r = recipes[idx];
  let canMake = r.input.every(ing => (storage[ing.item]||0) >= ing.qty);
  if (!canMake) { alert('Not enough ingredients!'); return; }
  r.input.forEach(ing => { storage[ing.item] = (storage[ing.item]||0) - ing.qty; });
  processors[pIdx].recipe = r;
  processors[pIdx].startedAt = Date.now();
  processors[pIdx].doneAt = processors[pIdx].startedAt + r.time;
  processors[pIdx].output = r.output;
  window.processors = processors;
  saveGame();
  showScreen('factory');
}

function collectProcessorOutput(pIdx) {
  const processor = processors[pIdx];
  if (!processor.recipe || !processor.output) return;
  storage[processor.output.item] = (storage[processor.output.item]||0) + processor.output.qty;
  processor.recipe = null;
  processor.startedAt = null;
  processor.doneAt = null;
  processor.output = null;
  window.processors = processors;
  saveGame();
  showScreen('factory');
}

// Weasel pop-up logic
const weaselTypes = [
  {type: 'normal', chance: 0.45},
  {type: 'bronze', chance: 0.2},
  {type: 'silver', chance: 0.12},
  {type: 'three-eyed', chance: 0.08},
  {type: 'gold', chance: 0.06},
  {type: 'rainbow', chance: 0.03},
  {type: 'mythic', chance: 0.01},
  {type: 'cute', chance: 0.05} // Cute weasel, less rare
];

let weaselInterval;
function startWeaselGame() {
  clearInterval(weaselInterval);
  for (let i = 1; i <= 9; i++) {
    document.getElementById(`hole-${i}`).innerHTML = i;
    document.getElementById(`hole-${i}`).onclick = null;
  }
  weaselInterval = setInterval(() => {
    // Remove any weasels
    for (let i = 1; i <= 9; i++) {
      document.getElementById(`hole-${i}`).innerHTML = i;
      document.getElementById(`hole-${i}`).onclick = null;
    }
    // Pick random hole
    if (cageWeasels.length < cageTypes[cageType].capacity) {
      const holeNum = Math.floor(Math.random() * 9) + 1;
      const weasel = pickWeasel();
      const hole = document.getElementById(`hole-${holeNum}`);
      if (hole) {
        if (weasel === 'cute') {
          hole.innerHTML = `<div class="weasel cute" style="background:pink;color:#222;">${weasel.replace('-', ' ')}</div>`;
        } else {
          hole.innerHTML = `<div class="weasel ${weasel}">${weasel.replace('-', ' ')}</div>`;
        }
        hole.onclick = () => {
          if (weasel === 'cute') {
            // Immediately send to pet zone with random color(s)
            const allColors = ['red','orange','yellow','green','blue','indigo','violet','pink'];
            let colorCount = Math.random() < 0.5 ? 1 : (Math.random() < 0.8 ? 2 : 3); // 1: 50%, 2: 30%, 3: 20%
            let colorPool = allColors.slice();
            let colors = [];
            for (let i = 0; i < colorCount; i++) {
              if (colorPool.length === 0) break;
              let idx = Math.floor(Math.random() * colorPool.length);
              colors.push(colorPool.splice(idx, 1)[0]);
            }
            petWeasels.push({
              adoptedAt: Date.now(),
              lastFed: Date.now(),
              lastDrank: Date.now(),
              needFood: true,
              foodType: 'weasel hamburger',
              id: Math.random().toString(36).slice(2),
              colors: colors,
              name: '' // New: name property
            });
            storage.weaselsCaught = (storage.weaselsCaught||0) + 1;
            saveGame();
            alert('You caught a cute weasel! It has moved to your Pet Zone.');
            hole.innerHTML = holeNum;
            hole.onclick = null;
            showScreen('petzone');
          } else if (cageWeasels.length < cageTypes[cageType].capacity) {
            cageWeasels.push(weasel);
            hole.innerHTML = holeNum;
            hole.onclick = null;
            showScreen('holes'); // Refresh holes screen to update cage count
          } else {
            alert('Your cage is full!');
          }
        };
      }
    }
  }, 1200);
}

function pickWeasel() {
  let rand = Math.random();
  let sum = 0;
  for (let w of weaselTypes) {
    sum += w.chance;
    if (rand < sum) return w.type;
  }
  return 'normal';
}


// Achievements screen logic
function achievementsScreen() {
  // Example achievements
  const achievements = [
    { id: 'catch10', label: 'Catch 10 Weasels', reward: '3 tomato seeds', progress: (storage.weaselsCaught||0), goal: 10, claimed: storage.achv_catch10 },
    { id: 'pop5', label: 'Pop 5 Weasels', reward: '2 weasel eyeballs', progress: (storage.weaselsPopped||0), goal: 5, claimed: storage.achv_pop5 },
    { id: 'feed10', label: 'Feed 10 Weasels', reward: '1 weasel spleen', progress: (storage.weaselsFed||0), goal: 10, claimed: storage.achv_feed10 },
  ];
  let html = `<h2>Achievements</h2><div style='display:flex;gap:24px;justify-content:center;margin-top:30px;'>`;
  achievements.forEach(a => {
    html += `<div style='background:#fff8;border:1px solid #ccc;border-radius:12px;padding:18px 24px;min-width:180px;display:flex;flex-direction:column;align-items:center;'>`;
    html += `<div style='font-size:1.1em;font-weight:bold;margin-bottom:8px;'>${a.label}</div>`;
    html += `<div style='margin-bottom:8px;'>Reward: <b>${a.reward}</b></div>`;
    html += `<div style='margin-bottom:8px;'>Progress: ${Math.min(a.progress,a.goal)} / ${a.goal}</div>`;
    if (a.claimed) {
      html += `<button disabled style='background:#aaa;color:#fff;border:none;border-radius:8px;padding:6px 16px;margin-top:8px;'>Claimed</button>`;
    } else if (a.progress >= a.goal) {
      html += `<button disabled style='background:#7cfc00;color:#222;border:none;border-radius:8px;padding:6px 16px;margin-top:8px;cursor:pointer;'>Complete</button>`;
      html += `<button onclick=\"claimAchievement('${a.id}')\" style='background:#7cfc00;color:#222;border:none;border-radius:8px;padding:6px 16px;margin-top:8px;cursor:pointer;'>Claim Reward</button>`;
    } else {
      html += `<button disabled style='background:#eee;color:#888;border:none;border-radius:8px;padding:6px 16px;margin-top:8px;'>Incomplete</button>`;
    }
    html += `</div>`;
  });
  html += `</div><div style='margin-top:30px;text-align:center;'><button onclick=\"showScreen('camp')\">Back to Camp</button></div>`;
  return html;
}

window.claimAchievement = function(id) {
  if (id === 'catch10' && (storage.weaselsCaught||0) >= 10 && !storage.achv_catch10) {
    seeds.tomato = (seeds.tomato||0) + 3;
    storage.achv_catch10 = true;
    alert('Achievement claimed! You received 3 tomato seeds.');
  }
  if (id === 'pop5' && (storage.weaselsPopped||0) >= 5 && !storage.achv_pop5) {
    storage.eyeballs = (storage.eyeballs||0) + 2;
    storage.achv_pop5 = true;
    alert('Achievement claimed! You received 2 weasel eyeballs.');
  }
  if (id === 'feed10' && (storage.weaselsFed||0) >= 10 && !storage.achv_feed10) {
    storage.spleens = (storage.spleens||0) + 1;
    storage.achv_feed10 = true;
    alert('Achievement claimed! You received 1 weasel spleen.');
  }
  saveGame();
  showScreen('achievements');
}

function saveGame() {
  localStorage.setItem('pgw_storage', JSON.stringify(storage));
  localStorage.setItem('pgw_seeds', JSON.stringify(seeds));
  localStorage.setItem('pgw_garden', JSON.stringify(garden));
  localStorage.setItem('pgw_cageWeasels', JSON.stringify(cageWeasels));
  localStorage.setItem('pgw_cageType', cageType);
  localStorage.setItem('pgw_processors', JSON.stringify(processors));
  localStorage.setItem('pgw_petWeasels', JSON.stringify(petWeasels)); // Ensure names are saved
}

function loadGame() {
  let s = localStorage.getItem('pgw_storage');
  let pw = localStorage.getItem('pgw_petWeasels');
  if (pw) {
    let arr = JSON.parse(pw);
    // Patch: ensure all weasels have a name property
    arr.forEach(w => { if (typeof w.name !== 'string') w.name = ''; });
    petWeasels = arr;
    window.petWeasels = petWeasels; // Ensure global reference is updated
  }
  if (s) {
    let loaded = JSON.parse(s);
    // Ensure all keys exist
    storage = Object.assign({
      eyeballs: 0, hearts: 0, guts: 0, spleens: 0, tomatoes: 0, lettuce: 0, wheat: 0, eyeballSeeds: 0,
      'weasel bun': 0, 'weasel burger': 0, 'weasel lollipop': 0
    }, loaded);
  }
  let sd = localStorage.getItem('pgw_seeds');
  if (sd) {
    let loaded = JSON.parse(sd);
    seeds = Object.assign({ tomato: 0, lettuce: 0, wheat: 0, eyeball: 0 }, loaded);
  }
  let g = localStorage.getItem('pgw_garden');
  if (g) {
    let loaded = JSON.parse(g);
    garden = Array.isArray(loaded) ? loaded.slice(0,10) : Array(10).fill(null);
    while (garden.length < 10) garden.push(null);
  } else {
    garden = Array(10).fill(null);
  }
  window.gardenSeedSelect = null;
  let c = localStorage.getItem('pgw_cageWeasels');
  if (c) cageWeasels = JSON.parse(c);
  let ct = localStorage.getItem('pgw_cageType');
  if (ct) cageType = ct;
  let p = localStorage.getItem('pgw_processors');
  if (p) {
    let loaded = JSON.parse(p);
    if (Array.isArray(loaded) && loaded.length === 5) {
      for (let i = 0; i < 5; i++) {
        processors[i] = loaded[i];
      }
    }
  }
  // After loading, re-render the current screen to update UI
  if (typeof showScreen === 'function') {
    // Try to keep user on the same screen after reload
    let hash = window.location.hash.replace('#','');
    if (screens[hash]) showScreen(hash); else showScreen('camp');
  }
}

loadGame();

// Force-save petWeasels to localStorage immediately when a name is set, ensuring names persist across navigation and refresh.
window.nameCuteWeasel = function(idx, val) {
  if (petWeasels[idx]) {
    petWeasels[idx].name = val.trim().slice(0,20);
    saveGame();
    // Force update of localStorage immediately
    localStorage.setItem('pgw_petWeasels', JSON.stringify(petWeasels));
  }
}

// Random weasel type and color generation for new weasels
function randomWeaselType() {
  // Make cute weasels even less rare
  const r = Math.random();
  if (r < 0.28) return 'cute'; // increased to 28% chance
  if (r < 0.48) return 'spotted';
  if (r < 0.68) return 'striped';
  if (r < 0.83) return 'albino';
  return 'normal';
}

function randomWeaselColors() {
  // Make 3, 4, and 5 color combos easier to get for cute weasels
  const baseColors = ['#ffb6c1', '#ffe066', '#b5ead7', '#9ad0ec', '#f7a072', '#e4bad4', '#f9c74f', '#90be6d'];
  // Weighted: 3 (40%), 4 (35%), 5 (25%)
  let r = Math.random();
  let numColors = r < 0.4 ? 3 : r < 0.75 ? 4 : 5;
  let colors = [];
  while (colors.length < numColors) {
    let c = baseColors[Math.floor(Math.random() * baseColors.length)];
    if (!colors.includes(c)) colors.push(c);
  }
  return colors;
}

// List of foods that can be made in the factory or garden
const FEEDABLE_FOODS = [
  'weasel hamburger',
  'weasel lollypop',
  'weasel pancakes',
  'weasel fries',
  'weasel ice cream',
  'weasel ketchup',
  'weasel punch',
  'lettuce',
  'tomatoes',
  'wheat',
  'weasel salad'
];

// When a cute weasel gets hungry, assign a random food
function advanceDay() {
  // ...existing code...
  // Make cute weasels get hungry every day
  for (let weasel of window.petWeasels) {
    if (weasel.type === 'cute') {
      if (!weasel.daysHungry) weasel.daysHungry = 0;
      if (!weasel.hungry) {
        weasel.hungry = true;
        weasel.daysHungry = 1;
        // Assign a random food if not already set
        if (!weasel.food) {
          weasel.food = FEEDABLE_FOODS[Math.floor(Math.random() * FEEDABLE_FOODS.length)];
        }
      } else {
        weasel.daysHungry += 1;
      }
    }
  }
  // Remove cute weasels that have waited in the restaurant for 7 days
  window.petWeasels = window.petWeasels.filter(w => !(w.type === 'cute' && w.hungry && w.daysHungry >= 7));
  saveGame();
  // ...existing code...
}

// When feeding a cute weasel, clear its food
function feedHungryWeasel(id) {
  // ...existing code...
  let weasel = window.petWeasels.find(w => w.id === id);
  if (weasel && weasel.hungry) {
    weasel.hungry = false;
    weasel.daysHungry = 0;
    weasel.food = null;
    // ...existing code...
  }
  // ...existing code...
}

// In the restaurant UI, show the food each hungry weasel wants
function showPetRestaurant() {
  // ...existing code...
  let hungryWeasels = window.petWeasels.filter(w => w.type === 'cute' && w.hungry);
  if (hungryWeasels.length === 0) {
    // ...existing code...
  } else {
    html += '<ul>';
    for (let w of hungryWeasels) {
      html += `<li style="margin-bottom:10px;">`;
      html += `<span style="display:inline-block;width:30px;height:30px;background:pink;border-radius:50%;vertical-align:middle;margin-right:8px;"></span> `;
      html += `${w.name ? w.name : 'Cute Weasel'} wants <b>${w.food}</b> `;
      html += `<button onclick="feedHungryWeasel('${w.id}')">Feed</button>`;
      html += `</li>`;
    }
    html += '</ul>';
  }
  // ...existing code...
}
