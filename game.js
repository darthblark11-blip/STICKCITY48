

const CHUNK_SIZE = 1024;
let bloodChunks = {};
let splatterIdx = 0;
let player, bullets = [], particles = [], corpses = [], enemiesList = [], barrels = [], orbs = [], grenades = [], fires = [], sludges = [], healthPacks = [], weaponDrops = [], shockwaves = []; var allies = []; var mCount = 0;

let leftStick, rightStick, buildings = [], camX = 0, camY = 0, zoom = 0.66, screenShake = 0, meleeInputHeld = false, cannonInputHeld = false;
let lightnings = [];
let started = false, isDead = false, isWin = false, currentLevel = 1, headAimToggle = false, lastToggleTime = 0, lastWeaponSwapTime = 0;
const SPATIAL_CELL_SIZE = 150; 
let spatialGrid = {};

// Helper to calculate which bucket an entity belongs to
function getSpatialKey(x, y) {
    return Math.floor(x / SPATIAL_CELL_SIZE) + "," + Math.floor(y / SPATIAL_CELL_SIZE);
}

let totalKills = 0, killStreak = 0, flawlessHits = 0, streakMsgTimer = 0, streakMsgText = "";
let smgUnlocked = false, dualSmgUnlocked = false, shotgunUnlocked = false, arUnlocked = false, jetpackUnlocked = true, meleeUnlocked = true;
let killcamMode = false, killcamTarget = {x: 0, y: 0}, killcamTimer = 0, doTick = true, winTimer = 0;
let jetpackFireExplosion = false; 
let jetpackDoubleDash = false;
let meleeComboUnlocked = false; 
let taserUnlocked = false
let rocketLauncherUnlocked = false; 
let ninjaSuitUnlocked = false; // <--- NEW NINJA SUIT
let explosiveArmorUnlocked = false, playerGrenades = [], pGrenadeAmmo = 4, pGrenadeTimer = 0, isCooking = false, cookTime = 0;
let chemistSuitUnlocked = false, playerFlasks = [], pFlaskAmmo = 2, pFlaskTimer = 0, waterPuddles = [];
let inUpgradeMenu = false;
let score = 0; let consecutiveKills = 0; let comboTimer = 0; let floatingScores = []; let totalShotsFired = 0; let totalShotsHit = 0;
let isPaused = false;
let pauseMenuState = "MAIN";
let objectiveTimer = 0;
let inTownCutscene = false, townPhase = 0, townTimer = 0, townSpeaker1 = null, townSpeaker2 = null;
let nm0AmbushActive = false, nm0AmbushKills = 0;
let isHardMode = false, selectingDifficulty = false, pendingLevel = 1, pendingStoryMode = false;


// --- STORY MODE VARIABLES ---
let isStoryMode = false;
let inStoryIntro = false;
let inStoryRoom = false;
let introScrollY = 0;
let storyPhase = 0; 
let storyTimer = 0;
let dadX = -100;
let prologuePhase = 0; 
let prologueTimer = 0; 
let dadEntity = null;
let tabletPickedUp = false; 
let journalRead = false;

let grenadeInputHeld = false;
let grenadesUnlocked = false; 
let grenadePickups = [];
let inDarchonCall = false, callPhase = 0, darchonCallCompleted = false;
let darchonFrames = [];
let darchonTalkTimer = 0;
let darchonMouthFrame = 0;

// --- WORLD BUILDING & POST-AMBUSH VARIABLES ---
let inPostAmbushCutscene = false;
let inLvl4Cutscene = false, lvl4Phase = 0, lvl4Timer = 0, tanLeader = null;

let postAmbushPhase = 0;
let inWorldBuildingMenu = false;
let inTravelMenu = false;
let travelDirection = null;
let militaryToBring = 0;
window.northGateBreached = false;
window.southGateBreached = false;
window.militaryToBring = 0; // Carries over to level 2
let globalPopulation = 0;
let popTotal = 0;
let popUnassigned = 0;
let popFarming = 0; 
let popMilitary = 0; 
let popScience = 0; 
let popArchitecture = 0;
let squadCommandMode = false;
let squadCommand = null; // "FOLLOW", "NORTH", "SOUTH", "EAST", "WEST", "SPREAD", "HOLD"

// --- OVERWORLD & HERO TOWN VARIABLES ---
let inOverworldView = false;
let townCitizens = [];
let statVit = 1, statMen = 1, statPhy = 1, statObe = 1, statInt = 1;
let townsData = {}; 

let inFarmCutscene = false, farmPhase = 0, farmSpeaker = null;
let farmAmbushActive = false;
let inFarmPostCutscene = false, farmPostPhase = 0;
window.farmerBlueprintUnlocked = false;

// --- NEW UPSTAIRS VARIABLES ---
let inUpstairsRoom = false;
let upstairsPhase = 0;
let swordPickedUp = false;
let tvWatched = false;
let hasSword = false;
let storyText = `The year is 2048. The nuclear family has been abolished.
The female gender has been eradicated.
Cloning is the only form of reproduction...

The tyrannical "NM-0"; a globalist elite organization
established 103 years prior slowly tricked the world
population into its own demise through slow burning
propaganda, and problem - solution mind control tactics.

Our journey begins at the home of our protagonist.
Son of a S.I.A (Stick Intelligence Agent).`;

let viewLeft = 0, viewRight = 0, viewTop = 0, viewBottom = 0;
let MAX_KILLS = 999; 
const TARGET_ENEMY_COUNT = 80; 
let playerRespawnTimer = 0, prevGamepadButtons = [];
let headshotCounter = 0, bodyOverkillCounter = 0, lightningCounter = 0; 

const WEAPONS = {
  PISTOL: { name: "PISTOL", fireCooldown: 15, enemyCooldown: 48, maxAmmo: 17, bodyDmg: 20, headDmg: 100, spread: 0, pellets: 1 },
  SMG: { name: "MACHINE GUN", fireCooldown: 6, enemyCooldown: 48, maxAmmo: 30, bodyDmg: 20, headDmg: 50, spread: 0.1, pellets: 1 },
  DUAL_SMG: { name: "DUAL SMGS", fireCooldown: 5, enemyCooldown: 48, maxAmmo: 60, bodyDmg: 20, headDmg: 50, spread: 0.15, pellets: 2 },
  ASSAULT_RIFLE: { name: "ASSAULT RIFLE", fireCooldown: 7, enemyCooldown: 48, maxAmmo: 30, bodyDmg: 30, headDmg: 60, spread: 0, pellets: 1 },
  SHOTGUN: { name: "SHOTGUN", fireCooldown: 20, enemyCooldown: 60, maxAmmo: 8, bodyDmg: 25, headDmg: 50, spread: 0.1275, pellets: 4 },
  ROCKET_LAUNCHER: { name: "ROCKET LAUNCHER", fireCooldown: 45, enemyCooldown: 60, maxAmmo: 4, bodyDmg: 350, headDmg: 350, spread: 0, pellets: 1 },
  TASER: { name: "TASER", fireCooldown: 90, enemyCooldown: 60, maxAmmo: 4, bodyDmg: 0, headDmg: 0, spread: 0, pellets: 1 } 
};


const sfx = {
  ctx: null,
  bgm: null, 
  
  init() { 
    // Splitting this into two lines makes the OpenProcessing linter happy
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx(); 
    
    if (this.ctx.state === 'suspended') this.ctx.resume(); 
  },
  
          playBGM() {
      if (this.bgm && this.bgm.paused) {
          // This fires the exact moment you tap the screen
          this.bgm.play().catch(e => console.log("BGM Error: ", e));
      }
  },




  play(f, t, d, v, s) { if (!this.ctx) return; let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = t; o.connect(g); g.connect(this.ctx.destination); o.frequency.setValueAtTime(f, this.ctx.currentTime); if (s) o.frequency.exponentialRampToValueAtTime(s, this.ctx.currentTime + d); g.gain.setValueAtTime(v, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + d); o.start(); o.stop(this.ctx.currentTime + d); },
  
  noise(d, v, f, t, e) { if (!this.ctx) return; let bs = this.ctx.sampleRate * d, b = this.ctx.createBuffer(1, bs, this.ctx.sampleRate), dat = b.getChannelData(0); for (let i = 0; i < bs; i++) dat[i] = Math.random() * 2 - 1; let s = this.ctx.createBufferSource(), fil = this.ctx.createBiquadFilter(), g = this.ctx.createGain(); s.buffer = b; fil.type = t || 'lowpass'; fil.frequency.setValueAtTime(f || 1000, this.ctx.currentTime); if (e) fil.frequency.exponentialRampToValueAtTime(e, this.ctx.currentTime + d); s.connect(fil); fil.connect(g); g.connect(this.ctx.destination); g.gain.setValueAtTime(v, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + d); s.start(); },
  
  shoot() { this.noise(0.1, 0.4, 2000, 'highpass'); this.play(400, 'square', 0.1, 0.1, 100); }, 
  shotgun() { this.noise(0.2, 0.7, 500, 'lowpass'); this.play(150, 'sawtooth', 0.2, 0.2, 50); }, 
  hitBody() { this.noise(0.15, 0.8, 1000, 'bandpass', 400); }, 
  hitHead() { this.noise(0.15, 0.9, 3000, 'highpass'); this.play(800, 'triangle', 0.1, 0.2, 200); }, 
  hitArmor() { this.noise(0.1, 0.6, 800, 'bandpass', 2000); this.play(600, 'sine', 0.1, 0.3, 100); }, 
  deathGrunt() { this.play(120, 'square', 0.3, 0.4, 60); this.noise(0.2, 0.3, 400, 'lowpass'); }, 
  slash() { this.noise(0.15, 0.7, 3000, 'bandpass', 8000); this.play(800, 'sine', 0.1, 0.1, 1200); }, 
  dash() { this.noise(0.3, 0.6, 600, 'lowpass'); this.play(100, 'sawtooth', 0.2, 0.3, 50); }, 
  reload() { this.noise(0.3, 0.5, 800, 'bandpass', 1500); this.play(300, 'square', 0.15, 0.1, 100); }, 
  explosion() { this.noise(0.8, 1.0, 150, 'lowpass'); this.play(60, 'sawtooth', 0.8, 0.8, 10); }, 
  charge() { this.play(400, 'sine', 2.0, 0.1, 800); }, 
  throwG() { this.noise(0.2, 0.5, 1000, 'highpass'); this.play(600, 'sine', 0.2, 0.1, 300); },
  bite() { this.play(300, 'triangle', 0.1, 0.3, 100); this.noise(0.1, 0.5, 2000, 'highpass'); }
};


function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // --- INVISIBLE BGM PLAYER ---
  sfx.bgm = document.createElement('audio');
  
    // Define your playlist here
  sfx.playlist = [
      'Monalunaa.mp3', // 1st Track
      'ignition.mp3',   // 2nd Track
      'wavy.mp3',  // 3rd Track
      'Jokesonyou.mp3', // 4th Track
	  'vibe.mp3', // 5th track
]
  
  sfx.currentTrackIndex = 0; // Keep track of which song is playing
  
  sfx.bgm.src = sfx.playlist[sfx.currentTrackIndex]; 
  sfx.bgm.loop = false; 
  sfx.bgm.volume = 0.4;
  sfx.bgm.style.display = 'none'; 
  document.body.appendChild(sfx.bgm);

  // Listen for when a song finishes
  sfx.bgm.addEventListener('ended', function() {
      // Move to the next track in the playlist
      sfx.currentTrackIndex++;
      
      // Check if we've reached the end of the playlist
      if (sfx.currentTrackIndex < sfx.playlist.length) {
          sfx.bgm.src = sfx.playlist[sfx.currentTrackIndex]; 
          
          // If it's the last track, loop it infinitely
          if (sfx.currentTrackIndex === sfx.playlist.length - 5) {
              sfx.bgm.loop = true; 
          }
          
          sfx.bgm.play().catch(e => console.log("Next track failed:", e));
      }
  });
  // ----------------------------


  // --- THE NATIVE AUDIO UNLOCKER ---
  // This bypasses the game engine and listens directly to your phone screen
  let unlockAudio = function() {
      if (sfx.bgm && sfx.bgm.paused) {
          sfx.bgm.play().catch(e => console.log("BGM Error:", e));
      }
      // This also ensures your gunshots/explosions are unlocked
      if (sfx.ctx && sfx.ctx.state === 'suspended') {
          sfx.ctx.resume(); 
      }
      // Delete this listener after the first tap so it doesn't slow down the game
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('mousedown', unlockAudio);
  };

  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('mousedown', unlockAudio, { once: true });
  // ---------------------------------

  leftStick = { active: false, dx: 0, dy: 0, base: { x: 80, y: height - 160 } }; 
  rightStick = { active: false, dx: 0, dy: 0, dist: 0, base: { x: width - 80, y: height - 110 } };
}

    // --- NATIVE PC CONTROLS LISTENERS ---
  window.isDesktop = false; // Tracks if we are using M&K
  document.addEventListener('contextmenu', event => event.preventDefault()); 
  window.addEventListener('mousemove', () => { window.isDesktop = true; window.showOnScreenControls = false; });
  window.addEventListener('mousedown', e => {
      window.isDesktop = true; window.showOnScreenControls = false;
      if (e.button === 2 && started && !isDead && !isWin && player) {
          if (millis() - lastToggleTime > 300) { headAimToggle = !headAimToggle; lastToggleTime = millis(); }
      }
  });
    window.addEventListener('keydown', e => {
      window.isDesktop = true; window.showOnScreenControls = false; 
      if (!started || isDead || isWin || !player) return;
      
      if (e.key.toLowerCase() === 'r') {
          if (player.reloadTimer <= 0 && player.ammo < player.currentWeapon.maxAmmo) player.triggerReload();
      }
      
      // FIX: Moved the 'q' input out of the 'r' input bracket!
      if (e.key.toLowerCase() === 'q') cannonInputHeld = true;

      if (e.key.toLowerCase() === 'e' && meleeUnlocked) {
          if (player.dashTimer <= 0 && !explosiveArmorUnlocked) player.activateMelee();
      }

      if (e.code === 'Space' && jetpackUnlocked) {
          if (player.dashCooldown <= 0 && player.dashTimer <= 0 && player.meleeTimer <= 0) player.activateDash();
      }
  });


function loadTownData(id) {
    if (!id || typeof townsData === 'undefined' || !townsData[id]) return;
    let t = townsData[id];

    window.popFarmingM = t.popFarmingM || 0;
    window.popFarmingF = t.popFarmingF || 0;
    window.popMilitaryM = t.popMilitaryM || 0;
    window.popMilitaryF = t.popMilitaryF || 0;
    window.popScienceM = t.popScienceM || 0;
    window.popScienceF = t.popScienceF || 0;
    window.popArchitectureM = t.popArchitectureM || 0;
    window.popArchitectureF = t.popArchitectureF || 0;
    window.popUnassignedM = t.popUnassignedM || 0;
    window.popUnassignedF = t.popUnassignedF || 0;
    window.popTotal = t.popTotal || 0;
}
function saveTownData(id) {
    if (!id) return;
    if (typeof townsData === 'undefined') window.townsData = {};
    if (!townsData[id]) townsData[id] = {};

    let t = townsData[id];
    t.popFarmingM = window.popFarmingM || 0;
    t.popFarmingF = window.popFarmingF || 0;
    t.popMilitaryM = window.popMilitaryM || 0;
    t.popMilitaryF = window.popMilitaryF || 0;
    t.popScienceM = window.popScienceM || 0;
    t.popScienceF = window.popScienceF || 0;
    t.popArchitectureM = window.popArchitectureM || 0;
    t.popArchitectureF = window.popArchitectureF || 0;
    t.popUnassignedM = window.popUnassignedM || 0;
    t.popUnassignedF = window.popUnassignedF || 0;
    
    // 100% safe calculation directly from the verified town object
    t.popTotal = t.popFarmingM + t.popFarmingF + 
                 t.popMilitaryM + t.popMilitaryF + 
                 t.popScienceM + t.popScienceF + 
                 t.popArchitectureM + t.popArchitectureF + 
                 t.popUnassignedM + t.popUnassignedF;
                 
    t.established = true;
}


function preload() {
    // Make sure your 4 image files match these names exactly in your project folder
    darchonFrames[0] = loadImage('darchon_idle.png');  
    darchonFrames[1] = loadImage('darchon_talk_1.png'); 
    darchonFrames[2] = loadImage('darchon_talk_2.png'); 
    darchonFrames[3] = loadImage('darchon_talk_3.png');
}


function startAtLevel(lvl, isLoading = false) {
    clearAllBlood();
    bloodChunks = {}; 
    
    currentLevel = lvl;
  
    consecutiveKills = 0; 
    totalShotsFired = 0; 
    totalShotsHit = 0;   

if (isStoryMode) {
        totalKills = 0;
        if (lvl === 0) MAX_KILLS = 3;
        else if (lvl === 8) MAX_KILLS = 20; 
        else MAX_KILLS = 100; 
    } else {
        if (lvl === 0 || lvl === 1) { totalKills = 0; MAX_KILLS = 50; }
        else if (lvl === 2) { totalKills = 50; MAX_KILLS = 100; }
        else if (lvl === 3) { totalKills = 100; MAX_KILLS = 150; }
        else if (lvl === 4) { totalKills = 150; MAX_KILLS = 200; }
        else if (lvl === 5) { totalKills = 200; MAX_KILLS = 250; }
        else if (lvl === 6) { totalKills = 250; MAX_KILLS = 300; }
        else if (lvl === 7) { totalKills = 300; MAX_KILLS = 350; }
    }

    if ((lvl === 0 || lvl === 1) && !isLoading) { 
        smgUnlocked = false; dualSmgUnlocked = false; shotgunUnlocked = false; arUnlocked = false; rocketLauncherUnlocked = false; taserUnlocked = false; 
        jetpackFireExplosion = false; jetpackDoubleDash = false; meleeComboUnlocked = false; 
        window.meleeFinisherUnlocked = false;

        if (isStoryMode) taserUnlocked = true;

        ninjaSuitUnlocked = false; 
        explosiveArmorUnlocked = false; 
        chemistSuitUnlocked = false; 
        window.ninjaOwned = false; 
        window.armorOwned = false; 
        window.chemistOwned = false;
        
        score = 0;
        journalRead = false; 
        
        pGrenadeAmmo = 0;
        pGrenadeTimer = 0;
        grenadesUnlocked = false;
        
        pFlaskAmmo = 0;
        pFlaskTimer = 0;
    }
  
    window.towersDefeated = false;
    nm0AmbushActive = false;
    nm0AmbushKills = 0;
    inTownCutscene = false;
    inFarmCutscene = false;
    farmAmbushActive = false;
    inFarmPostCutscene = false;
    window.maxArmySize = 0;
    jetpackUnlocked = true;
    meleeUnlocked = true;
    killcamMode = false;
    zoom = 0.66;
    doTick = true;
    winTimer = 0;
    inUpgradeMenu = false;
    
    objectiveTimer = 360; 
    isPaused = false;
    pauseMenuState = "MAIN";
	
    started = true; isDead = false; isWin = false; killStreak = 0; screenShake = 0;
    bullets = []; particles = []; splatters = []; corpses = []; enemiesList = []; barrels = []; orbs = []; grenades = []; fires = []; sludges = []; healthPacks = []; weaponDrops = [];
    grenadePickups = []; 
  
    generateMap(); 
    let pS = getSafeSpawn(false); 
    player = new Character(pS.x, pS.y, true);
  
    if (smgUnlocked) { player.mags["MACHINE GUN"] = 3; player.weaponAmmo["MACHINE GUN"] = WEAPONS.SMG.maxAmmo; }
    if (dualSmgUnlocked) { player.mags["DUAL SMGS"] = 3; player.weaponAmmo["DUAL SMGS"] = WEAPONS.DUAL_SMG.maxAmmo; }
    if (arUnlocked) { player.mags["ASSAULT RIFLE"] = 3; player.weaponAmmo["ASSAULT RIFLE"] = WEAPONS.ASSAULT_RIFLE.maxAmmo; }
    if (shotgunUnlocked) { player.mags["SHOTGUN"] = 3; player.weaponAmmo["SHOTGUN"] = WEAPONS.SHOTGUN.maxAmmo; }
    if (rocketLauncherUnlocked) { player.mags["ROCKET LAUNCHER"] = 6; player.weaponAmmo["ROCKET LAUNCHER"] = WEAPONS.ROCKET_LAUNCHER.maxAmmo; }

    if (rocketLauncherUnlocked) player.currentWeapon = WEAPONS.ROCKET_LAUNCHER;
    else if (shotgunUnlocked) player.currentWeapon = WEAPONS.SHOTGUN;
    else if (arUnlocked) player.currentWeapon = WEAPONS.ASSAULT_RIFLE;
    else if (dualSmgUnlocked) player.currentWeapon = WEAPONS.DUAL_SMG;
    else if (smgUnlocked) player.currentWeapon = WEAPONS.SMG;
    else player.currentWeapon = WEAPONS.PISTOL;
  
    if (lvl === 0) {
        player.x = -40; player.y = 0; player.aimAngle = HALF_PI;
        dadEntity = new Character(40, 0, false, "DAD");
        dadEntity.aimAngle = HALF_PI;
        enemiesList.push(dadEntity);
        
        let sia1 = new Character(0, 350, false, "SIA"); 
        let sia2 = new Character(-60, 400, false, "SIA"); 
        let sia3 = new Character(60, 400, false, "SIA"); 
        enemiesList.push(sia1, sia2, sia3);
        
        grenadesUnlocked = false;
        prologuePhase = 1;
        prologueTimer = 120; 
    } 
      else if (lvl === 8) {
        player.x = 0;
        player.y = 1200; // Spawn near the exit door!
        player.aimAngle = -HALF_PI;
        window.nm0HqCleared = false;
        
        for (let i = 0; i < 20; i++) {
            // Spawn enemies ONLY in the main hall so they don't get stuck inside the room
            let e = new Character(random(-400, 400), random(-600, 1000), false, "ARMORED_STANDARD");
            e.currentWeapon = WEAPONS.PISTOL;
            enemiesList.push(e);
        }
    }
    else {
        if (lvl === 1 && isStoryMode) {
            player.x = 600; 
            player.y = 710; 
            
            let dummyNorth = {x: 600, y: -3680, w: 300, h: 50, isWall: true, isGrassLot: false};
            let dummySouth = {x: 600, y: 4880, w: 300, h: 50, isWall: true, isGrassLot: false};
            buildings.push(dummyNorth, dummySouth);

            let nG1 = new Character(400, -3680, false, "ARMORED_STANDARD"); nG1.targetBuilding = dummyNorth;
            let nG2 = new Character(800, -3680, false, "ARMORED_STANDARD"); nG2.targetBuilding = dummyNorth;
            let sG1 = new Character(400, 4880, false, "ARMORED_STANDARD"); sG1.targetBuilding = dummySouth;
            let sG2 = new Character(800, 4880, false, "ARMORED_STANDARD"); sG2.targetBuilding = dummySouth;
            enemiesList.push(nG1, nG2, sG1, sG2);
        }
        
        if (lvl === 2) {
            player.x = 600;
            player.y = 2800;
            player.aimAngle = -HALF_PI;
        }

        if (lvl === 3 && isStoryMode) {
            player.x = 500;
            player.y = 0;
            
            farmSpeaker = new Character(300, 0, false, "FARMER_MALE");
            enemiesList.push(farmSpeaker);

            for (let i = 0; i < 19; i++) {
                let fType = random() > 0.5 ? "FARMER_MALE" : "FARMER_FEMALE";
                let f = new Character(random(400, 950), random(-600, 600), false, fType);
                enemiesList.push(f);
            }

            for (let i = 0; i < 8; i++) {
                let cowX = random(-750, -450); 
                let cowY = random(-80, 80);
                let cow = new Character(cowX, cowY, false, "COW");
                enemiesList.push(cow);
            }
            
            inFarmCutscene = true;
            farmPhase = 1;
            
            
        } else if (lvl === 4) {
        if (isStoryMode) {
            player.x = 0;
            player.y = 800; // Spawn near the bottom
            player.aimAngle = -HALF_PI; // Facing up

            // Generate Tan Army in a large formation (~40m ahead)
            let cols = 15;
            let rows = 4;
            let tanGuys = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // Spread them out in a grid
                    let tx = -560 + (c * 80);
                    let ty = -200 + (r * 80);
                    let e = new Character(tx, ty, false, "MILITARY_NEUTRAL");
                    e.aimAngle = HALF_PI; // Facing the player
                    e.state = "IDLE";     // Keep them planted
                    enemiesList.push(e);
                    tanGuys.push(e);
                }
            }
            
            // Grab the guy dead center in the front row to be the speaker
            tanLeader = tanGuys[Math.floor(cols / 2) + ( (rows - 1) * cols )]; 
            
            inLvl4Cutscene = true;
            lvl4Phase = 1;
            lvl4Timer = 90; // Wait 1.5 seconds before walking
        }
    

        } else {
            for (let i = 0; i < TARGET_ENEMY_COUNT; i++) spawnSingleEnemy();
        }

                if (window.militaryToBringM > 0 || window.militaryToBringF > 0) {
            let spawnCountM = window.militaryToBringM || 0;
            let spawnCountF = window.militaryToBringF || 0;

            for (let i = 0; i < spawnCountM + spawnCountF; i++) {
                let isFemale = i >= spawnCountM; // Spawns exact male count, then switches to female
                let type = isFemale ? "FEMALE_PISTOL" : "NORMAL";
                
                let ax = player.x + random(-100, 100);
                let ay = player.y + random(50, 150);
                let a = new Character(ax, ay, false, type);
                a.isFriendly = true;
                a.isMilitary = true; 
                a.hp = 300;
                a.baseState = "FOLLOW";
                
                if (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked) {
                    a.currentWeapon = WEAPONS.ASSAULT_RIFLE; 
                    a.shirtCol = color(60, 100, 40); 
                    a.pantsCol = color(139, 115, 85);
                } else {
                    a.shirtCol = color(100, 100, 200); 
                }
                
                enemiesList.push(a);
            }
        }

            


        for (let i = 0; i < 12; i++) { let bS = getSafeSpawn(false); barrels.push({ x: bS.x, y: bS.y, hp: 20 }); }
        for (let i = 0; i < floor(random(2, 5)); i++) { let hS = getSafeSpawn(false); healthPacks.push({ x: hS.x, y: hS.y }); }
        
        if (isStoryMode) {
            for (let i = 0; i < 8; i++) { let gS = getSafeSpawn(false); grenadePickups.push({ x: gS.x, y: gS.y }); }
        }
    }
}






function getBuildingCollisions() {
  currentCollision = null;
  currentGrassLotCollision = null;

  // 1. Solve collision for standard 'buildings' (Dumpsters, Walls, Apartment complexes, etc.)
  for (let b of buildings) {
    if (typeof inView === 'function' && !inView(b.x, b.y, max(b.w, b.h) + 150)) continue;
    let bRad = max(b.w, b.h);
    if (dist(px, py, b.x, b.y) < bRad * 1.5) {
      if (b.isStreetLight) { fillCurrentCollisionEllipse(b.x, b.y, b.w); } 
      else if (b.isHouse) { fillCurrentCollision(b.x - b.w / 2 - 10, b.y - b.h / 2 - 10, b.w + 20, b.h + 20); } 
      else if (b.isDumpster || b.isHouseWall) { fillCurrentCollision(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, b.angle || 0); } 
      else if (b.isMall) { fillCurrentCollision(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); }
      else if (b.isGrassLot || b.isBasementTable || b.isPond || b.isTower || b.isParkingLot || b.isIndustrial) { fillCurrentGrassLotCollision(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, b.isWater ? "WATER" : "GRASS"); } 
      else { fillCurrentCollision(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); }
    }
  }

  // 2. Solve collision for the special 'parkingCars' list!
  for (let c of parkingCars) {
    if (dist(px, py, c.x, c.y) < 100) { // Small optimization: only check if close
        // We calculate the rotated bounding box for the car
        fillCurrentCollision(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, c.angle || HALF_PI);
    }
  }
}



// ==========================================
// WORLD GENERATION & RENDERING BLOCK
// ==========================================
let parkingCars = [];



function getCityZone(bX, bY) {
    if (bX === 0 && bY === 0) return "RESIDENTIAL"; 
    let s = (abs(bX * 17) + abs(bY * 31)) % 10;
    if (s < 2) return "PARK";
    if (s < 4) return "COMMERCIAL";
    if (s < 6) return "INDUSTRIAL";
    return "RESIDENTIAL";
}

function generateMap() {
  buildings = [];
  parkingCars = []; 
  
  if (currentLevel === 0) {
      buildings.push({ x: 0, y: -350, w: 1000, h: 100, isWall: true }); 
      buildings.push({ x: 0, y: 350, w: 1000, h: 100, isWall: true });  
      buildings.push({ x: -450, y: 0, w: 100, h: 800, isWall: true });  
      buildings.push({ x: 450, y: 0, w: 100, h: 800, isWall: true });   
      
      if (!inUpstairsRoom) {
          buildings.push({ x: -200, y: -100, w: 140, h: 70, isBasementTable: true }); 
          buildings.push({ x: 200, y: -100, w: 140, h: 70, isBasementTable: true });  
          buildings.push({ x: 160, y: -140, w: 120, h: 100, isTerminal: true });
      } else {
          buildings.push({ x: 0, y: -100, w: 160, h: 70, isCouch: true });
          buildings.push({ x: 0, y: -280, w: 120, h: 30, isTV: true });
          buildings.push({ x: 150, y: -20, w: 80, h: 40, isUpstairsTable: true });
      }
      return; 
  }

    // --- NEW LEVEL 8: NM-0 HQ INTERIOR ---
  if (currentLevel === 8) {
      // 1. Outer Boundary Walls
      buildings.push({ x: 0, y: -2500, w: 2000, h: 100, isWall: true }); // North
      buildings.push({ x: 0, y: 1500, w: 2000, h: 100, isWall: true });  // South (Front Door Entrance)
      buildings.push({ x: -1000, y: -500, w: 100, h: 4000, isWall: true }); // West
      buildings.push({ x: 1000, y: -500, w: 100, h: 4000, isWall: true });  // East

      // 2. Inner Corridor Walls (Forms the main hallway)
      buildings.push({ x: 500, y: -1000, w: 50, h: 3000, isWall: true });  // Right inner wall
      buildings.push({ x: -500, y: -1000, w: 50, h: 3000, isWall: true }); // Left inner wall

      // 3. The Sealed Doorway (Secret Room)
      buildings.push({ x: 0, y: -800, w: 200, h: 40, isWall: true }); // The door
      buildings.push({ x: -300, y: -800, w: 400, h: 40, isWall: true }); // Left seal
      buildings.push({ x: 300, y: -800, w: 400, h: 40, isWall: true }); // Right seal

      // 4. Pillars
      for(let px = -600; px <= 600; px += 500) {
          for(let py = -1500; py <= 1000; py += 500) {
              // Prevent pillars from spawning in the secret room AND the dead-center of the hallway
              if (py > -800 && px !== -100) { 
                  buildings.push({ x: px, y: py, w: 80, h: 80, isWall: true });
              }
          }
      }

      // 5. Props
      buildings.push({ x: -300, y: -1000, w: 200, h: 100, isTerminal: true });
      buildings.push({ x: 300, y: -1000, w: 200, h: 100, isTerminal: true });
      buildings.push({ x: 0, y: 0, w: 400, h: 200, isUpstairsTable: true });
      
      return;
  }



  if (currentLevel === 1 || currentLevel === 2 || currentLevel === 6) {
    let blockSize = 960; let sidewalkW = 45; 
    let usableSize = blockSize - (sidewalkW * 2); 
    let alleys = 2; let alleyWidth = 120; 
    let bldSize = (usableSize - (alleys * alleyWidth)) / 3; 
    
    let startBx = (currentLevel === 1) ? -3 : -1;
    let endBx = (currentLevel === 1) ? 3 : 1;
    let startBy = (currentLevel === 1) ? -3 : -1;
    let endBy = (currentLevel === 1) ? 3 : 1;

    if (currentLevel === 1) {
        buildings.push({ x: 600, y: -4200, w: 9600, h: 800, isGovFortress: true, details: [], hp: 3000, maxHp: 3000, hitFlash: 0 });
        buildings.push({ x: 400, y: -3700, w: 150, h: 40, isWall: true }); 
        buildings.push({ x: 800, y: -3700, w: 150, h: 40, isWall: true }); 

        buildings.push({ x: 600, y: -4200, w: 9600, h: 800, isGovFortress: true, details: [], hp: 3000, maxHp: 3000, hitFlash: 0 });
        buildings.push({ x: 400, y: 4900, w: 150, h: 40, isWall: true }); 
        buildings.push({ x: 800, y: 4900, w: 150, h: 40, isWall: true }); 
    }

    for (let bX = startBx; bX <= endBx; bX++) {
      for (let bY = startBy; bY <= endBy; bY++) {
        let blockStartX = bX * 1200 + 120, blockStartY = bY * 1200 + 120;
        let bldStartX = blockStartX + sidewalkW, bldStartY = blockStartY + sidewalkW;
        
        if (currentLevel === 1) {
            let isCasino = (bX === 0 && bY === -3);
            let isTheater = (bX === -1 && bY === -3);
            let isArena = (bX === -2 && bY === -3);
            let isAmusementPark = (bX === -3 && bY === -1);
            let isCircus = (bX === -3 && bY === 0);
            
            if (isCasino || isTheater || isArena || isAmusementPark || isCircus) {
                buildings.push({
                    x: blockStartX + blockSize/2, y: blockStartY + blockSize/2, w: blockSize - 90, h: blockSize - 90,
                    isCasino: isCasino, isTheater: isTheater, isArena: isArena, isAmusementPark: isAmusementPark, isCircus: isCircus, details: []
                });
                continue; 
            }
        }

        let isOuterRing = abs(bX) >= 2 || abs(bY) >= 2;
        let isLargeBlock = isOuterRing && random() > 0.4 && !(bX === 0 && bY === 0);

        if (isLargeBlock) {
            let isPark = Math.random() > 0.4;
            if (isPark) {
                let lotW = blockSize - 90, lotH = blockSize - 90;
                let lotX = blockStartX + blockSize/2, lotY = blockStartY + blockSize/2;
                
                buildings.push({ x: lotX, y: lotY, w: lotW, h: lotH, isParkingLot: true, isGrassLot: true });
                
                let spotW = 100, spotH = 65, aisleW = 80;
                for (let px = lotX - lotW/2 + 40; px < lotX + lotW/2 - (spotW*2 + aisleW); px += (spotW*2 + aisleW)) {
                    for (let py = lotY - lotH/2 + 30; py < lotY + lotH/2 - 30; py += spotH) {
                        let carColors = [[200,30,30], [30,80,200], [200,200,200], [40,40,40], [200,200,30]];
                        if (random() > 0.6) { parkingCars.push({ x: px + spotW * 0.5, y: py + spotH/2, w: 90, h: 50, isCar: true, isParkingCar: true, col: random(carColors), angle: HALF_PI, hp: 100 }); }
                        if (random() > 0.6) { parkingCars.push({ x: px + spotW + aisleW + spotW * 0.5, y: py + spotH/2, w: 90, h: 50, isCar: true, isParkingCar: true, col: random(carColors), angle: -HALF_PI, hp: 100 }); }
                    }
                }
            } else {
                let mall = { x: blockStartX + blockSize/2, y: blockStartY + blockSize/2, w: blockSize - 90, h: blockSize - 90, isMall: true, details: [] };
                for(let i = 0; i < 15; i++) {
                    let dx, dy, valid = false, attempts = 0;
                    while(!valid && attempts < 30) {
                        dx = random(-mall.w/2 + 30, mall.w/2 - 30); dy = random(-mall.h/2 + 30, mall.h/2 - 30); valid = true;
                        if (abs(dx) < mall.w/4 + 25 && abs(dy) < mall.h/4 + 25) valid = false; 
                        if (valid) { for(let exist of mall.details) { if(dist(dx, dy, exist.x, exist.y) < 55) { valid = false; break; } } }
                        attempts++;
                    }
                    if (valid) mall.details.push({type: 'hvac_large', x: dx, y: dy});
                }
                buildings.push(mall);
            }
        } else {
            let cols = (bX === 0 && bY === 0) ? 3 : floor(random(2, 5));
            let rows = (bX === 0 && bY === 0) ? 3 : floor(random(2, 5));
            let cellW = usableSize / cols, cellH = usableSize / rows;
            
            for (let i = 0; i < cols; i++) {
              for (let j = 0; j < rows; j++) {
                if ((bX !== 0 || bY !== 0) && random() > 0.85) continue; 
                
                let bx = bldStartX + i * cellW + cellW / 2, by = bldStartY + j * cellH + cellH / 2;
                let gapX = random(90, 130), gapY = random(90, 130); 
                let bw = cellW - gapX, bh = cellH - gapY;
                
                let b = { x: bx, y: by, w: bw, h: bh, isPalm: false, isRock: false, isAlienPlant: false, isEnergyPole: false, isAlienBldg: false, isGrassLot: false, isCar: false, isPyramid: false, isChip: false, isPinkPlanet: false, isDumpster: false, isStreetLight: false, isHouse: false, details: [], style: floor(random(4)) };
                
                if (currentLevel === 6) { b.isAlienPlant = random() > 0.6; b.isEnergyPole = !b.isAlienPlant && random() > 0.7; b.isAlienBldg = !b.isAlienPlant && !b.isEnergyPole; }
                if (currentLevel === 1 && bX === 0 && bY === 0 && j === 1 && i === 1) { b.isHouse = true; b.w = 160; b.h = 100; }
                
                if (currentLevel === 1 || currentLevel === 2) {
                    let numDet = floor(random(1, 4));
                    for(let d = 0; d < numDet; d++) {
                        let t = random(['hvac', 'vent', 'access']);
                        if (d === 0 && random() > 0.9 && Math.min(bw, bh) > 100) t = 'helipad';
                        let detX, detY, valid = false, attempts = 0;
                        let detR = (t === 'hvac' ? 22 : 16); 
                        
                        while(!valid && attempts < 25) {
                            detX = random(-bw/2 + detR + 5, bw/2 - detR - 5); detY = random(-bh/2 + detR + 5, bh/2 - detR - 5); valid = true;
                            for(let exist of b.details) { let eR = (exist.type === 'hvac' ? 22 : 16); if (dist(detX, detY, exist.x, exist.y) < detR + eR + 5) { valid = false; break; } }
                            attempts++;
                        }
                        if(valid) b.details.push({ type: t, x: detX, y: detY });
                    }
                }
                buildings.push(b);
              }
            }
        }
        
        if (currentLevel === 2) {
            for (let k = 0; k < 3; k++) { 
                let isVert = random() > 0.5, aIdx = floor(random(alleys)), dx = 0, dy = 0, bldSizeL2 = usableSize / 3;
                if (isVert) { dx = bldStartX + bldSizeL2 + aIdx * (bldSizeL2 + alleyWidth) + alleyWidth / 2; dy = bldStartY + random(usableSize); dx += (alleyWidth / 2 - 14) * random([-1, 1]); } 
                else { dy = bldStartY + bldSizeL2 + aIdx * (bldSizeL2 + alleyWidth) + alleyWidth / 2; dx = bldStartX + random(usableSize); dy += (alleyWidth / 2 - 14) * random([-1, 1]); }
                buildings.push({ x: dx, y: dy, w: 40, h: 25, isPalm: false, isRock: false, isAlienPlant: false, isEnergyPole: false, isAlienBldg: false, isGrassLot: false, isCar: false, isPyramid: false, isChip: false, isPinkPlanet: false, isDumpster: true, isStreetLight: false, angle: isVert ? HALF_PI : 0 });
            }
        }
        
        if (currentLevel === 1 || currentLevel === 2) {
            let offset = -5;
            buildings.push({ x: blockStartX + offset, y: blockStartY + offset, w: 16, h: 16, isStreetLight: true });
            buildings.push({ x: blockStartX + blockSize - offset, y: blockStartY + offset, w: 16, h: 16, isStreetLight: true });
            buildings.push({ x: blockStartX + offset, y: blockStartY + blockSize - offset, w: 16, h: 16, isStreetLight: true });
            buildings.push({ x: blockStartX + blockSize - offset, y: blockStartY + blockSize - offset, w: 16, h: 16, isStreetLight: true });
        }
      }
    }

    if ((currentLevel === 1 || currentLevel === 2) && isStoryMode) {
        let cDist = (currentLevel === 1) ? 3 : 1;
        let corners = [ 
            { x: -cDist * 1200 + 600, y: -cDist * 1200 + 600 }, 
            { x:  cDist * 1200 + 600, y: -cDist * 1200 + 600 }, 
            { x: -cDist * 1200 + 600, y:  cDist * 1200 + 600 }, 
            { x:  cDist * 1200 + 600, y:  cDist * 1200 + 600 } 
        ];
        let chosenCorners = [];
        while (chosenCorners.length < 2) { 
            let randCorner = corners[Math.floor(Math.random() * corners.length)]; 
            if (!chosenCorners.includes(randCorner)) chosenCorners.push(randCorner); 
        }
        for (let pt of chosenCorners) {
            for (let i = buildings.length - 1; i >= 0; i--) { 
                let b = buildings[i]; 
                if (!b.isWall && !b.isHouse && dist(pt.x, pt.y, b.x, b.y) < 250) { buildings.splice(i, 1); } 
            }
            buildings.push({ x: pt.x, y: pt.y, w: 120, h: 120, isTower: true, hp: 2000, maxHp: 2000 });
        }
    }

  } else if (currentLevel === 7) {
    let blockSize = 960; let alleys = 2; let alleyWidth = 110; let bldSize = (blockSize - (alleys * alleyWidth)) / 3; 
    for (let bX = -1; bX <= 1; bX++) {
      for ( let bY = -1; bY <= 1; bY++) {
        let startX = bX * 1200 + 120, startY = bY * 1200 + 120;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            let bx = startX + i * (bldSize + alleyWidth) + bldSize / 2;
            let by = startY + j * (bldSize + alleyWidth) + bldSize / 2;
            let bw = bldSize + random(-15, 15), bh = bldSize + random(-15, 15);
            buildings.push({ x: bx, y: by, w: bw, h: bh, isPalm: false, isRock: false, isAlienPlant: false, isEnergyPole: false, isAlienBldg: false, isGrassLot: false, isCar: false, isPyramid: random() > 0.6, isChip: random() > 0.5, isPinkPlanet: random() > 0.7, isDumpster: false, isStreetLight: false });
          }
        }
      }
    }
  } else if (currentLevel === 3) {
      buildings.push({ x: -600, y: -400, w: 300, h: 240, isBarn: true });
      buildings.push({ x: -600, y: 300, w: 400, h: 400, isCropField: true });
      
      buildings.push({ x: -600, y: -100, w: 400, h: 10, isFence: true, hp: 2000, maxHp: 2000 }); 
      buildings.push({ x: -600, y: 100, w: 400, h: 10, isFence: true, hp: 2000, maxHp: 2000 });  
      buildings.push({ x: -800, y: 0, w: 10, h: 200, isFence: true, hp: 2000, maxHp: 2000 });    
      buildings.push({ x: -400, y: 0, w: 10, h: 200, isFence: true, hp: 2000, maxHp: 2000 });    

      buildings.push({ x: 500, y: -600, w: 250, h: 160, isGasStation: true });
      buildings.push({ x: 400, y: -200, w: 180, h: 120, isLiquorStore: true });
      buildings.push({ x: 450, y: 250, w: 300, h: 200, isMarket: true });

      let townCoords = [
          {x: 750, y: -400, w: 120, h: 100}, {x: 900, y: -350, w: 100, h: 120},
          {x: 800, y: -100, w: 150, h: 140}, {x: 950, y: 50, w: 110, h: 90},
          {x: 700, y: 150, w: 130, h: 130},  {x: 850, y: 400, w: 160, h: 110},
          {x: 650, y: 550, w: 100, h: 100},  {x: 900, y: 600, w: 140, h: 140},
          {x: 450, y: 700, w: 220, h: 160, isApartment: true}, 
          {x: 800, y: -700, w: 180, h: 150, isApartment: true} 
      ];
      
      for (let t of townCoords) {
          buildings.push({ x: t.x, y: t.y, w: t.w, h: t.h, isShanty: !t.isApartment, isApartment: t.isApartment });
      }

      let trailerParkCoords = [
          {x: 1250, y: -600, w: 180, h: 80}, {x: 1250, y: -400, w: 180, h: 80},
          {x: 1250, y: -200, w: 180, h: 80}, {x: 1250, y: 0, w: 180, h: 80},
          {x: 1250, y: 200, w: 180, h: 80},  {x: 1250, y: 400, w: 180, h: 80},
          {x: 1450, y: -500, w: 80, h: 180}, {x: 1450, y: -100, w: 80, h: 180},
          {x: 1450, y: 300, w: 80, h: 180}
      ];
      
      for (let t of trailerParkCoords) {
          buildings.push({ x: t.x, y: t.y, w: t.w, h: t.h, isTrailer: true });
      }
/// --- WESTERN TOWN (North of Trailer Park) ---
      // --- WESTERN TOWN (North of Trailer Park) ---
      let westernBuildings = [
          { x: 1010, y: -2000, w: 210, h: 140, sign: "HOTEL" },
          { x: 1580, y: -2000, w: 170, h: 140, sign: "JAIL" },

          { x: 1020, y: -1700, w: 190, h: 130, sign: "GENERAL STORE" },
          { x: 1580, y: -1700, w: 170, h: 130, sign: "SHERIFF" },

          { x: 1010, y: -1400, w: 230, h: 150, sign: "SALOON" },
          { x: 1590, y: -1400, w: 190, h: 130, sign: "BANK" },

          { x: 1020, y: -1130, w: 160, h: 120, sign: "DOCTOR" },
          { x: 1580, y: -1130, w: 190, h: 120, sign: "BLACKSMITH" },

          { x: 1000, y: -850, w: 170, h: 170, sign: "CHURCH", isChurch: true },
          { x: 1590, y: -850, w: 230, h: 130, sign: "LIVERY STABLE", isLivery: true }
      ];
      for (let t of westernBuildings) {
          buildings.push({ x: t.x, y: t.y, w: t.w, h: t.h, isWesternBldg: true, signText: t.sign, isChurch: t.isChurch, isLivery: t.isLivery });
      }

      buildings.push({ x: 1300, y: -1140, w: 70, h: 70, isWaterTower: true });
      buildings.push({ x: 1300, y: -1020, w: 40, h: 40, isWell: true });

      // Town perimeter fencing (corral-style boundary)
      buildings.push({ x: 1300, y: -2090, w: 900, h: 10, isFence: true });
      buildings.push({ x: 860,  y: -1415, w: 10, h: 1330, isFence: true });
      buildings.push({ x: 1740, y: -1415, w: 10, h: 1330, isFence: true });

      // Scattered western dressing
      buildings.push({ x: 1380, y: -1080, w: 45, h: 45, isHayBale: true });
      buildings.push({ x: 1000, y: -1260, w: 75, h: 55, isWagonProp: true });
      buildings.push({ x: 830,  y: -1900, w: 35, h: 55, isCactusProp: true });
      buildings.push({ x: 1770, y: -1550, w: 30, h: 50, isCactusProp: true });
      buildings.push({ x: 950,  y: -1580, w: 30, h: 30, isCrateProp: true });
      buildings.push({ x: 985,  y: -1560, w: 30, h: 30, isCrateProp: true });
      buildings.push({ x: 1600, y: -990,  w: 26, h: 26, isTumbleweedProp: true });
      buildings.push({ x: 1000, y: -990,  w: 24, h: 24, isTumbleweedProp: true });

      // Dusty ground speckles (generated once so they don't shimmer every frame)
      window.westernDust = [];
      for (let i = 0; i < 220; i++) {
          window.westernDust.push({ x: random(830, 1770), y: random(-2160, -660), sz: random(4, 11) });
      }
      
  } else {
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        if (Math.random() > 0.4 && (i != 0 || j != 0)) {
          let isPalm = (currentLevel === 4) && Math.random() > 0.6; 
          if (isPalm) { buildings.push({ x: i * 400 + 200, y: j * 400 + 200, w: 30, h: 30, isPalm: true }); } 
          else {
              let b = { x: i * 400 + 200, y: j * 400 + 200, w: random(180, 260), h: random(180, 260) };
              if (currentLevel === 5) b.isRock = random() > 0.7; 
              buildings.push(b);
          }
        }
      }
    }
  }
}

          












function drawBuildingShadows() {
  for (let b of activeBuildings) {
    if ((currentLevel === 1 || currentLevel === 2) && b.isGrassLot) continue;
    if (b.isCropField) continue; // Don't shadow the ground

    let shadowAlpha = (currentLevel === 1 || currentLevel === 3) ? 45 : 150; 
    let sL = (currentLevel === 1 || currentLevel === 3) ? 40 : 25; 
    fill(0, shadowAlpha); noStroke();
    if (b.isDumpster) { push(); translate(b.x + sL/2, b.y + sL/2); rotate(b.angle); rect(-b.w/2, -b.h/2, b.w, b.h, 2); pop(); } 
    else if (b.isCar) { push(); translate(b.x + sL/2, b.y + sL/2); rotate(b.angle); rect(-25, -45, 50, 90, 6); pop(); } 
    else if (b.isStreetLight) { ellipse(b.x + sL/2, b.y + sL/2, b.w, b.h); } 
    else if (b.isPalm) { push(); translate(b.x + sL/2, b.y + sL/2); rect(-8, -40, 16, 80, 4); for (let i = 0; i < 5; i++) { push(); translate(0, -40); rotate((i * TWO_PI / 5) + sin(frameCount * 0.02 + b.x) * 0.2); ellipse(30, 0, 60, 20); pop(); } pop(); }
    else if (b.isArena) { ellipse(b.x + sL*1.5, b.y + sL*1.5, b.w - 100, b.h - 150); }
    else if (b.isCircus) { ellipse(b.x + sL*1.5, b.y + sL*1.5, 600, 600); }
    else if (b.isGovFortress || b.isGiantBarrier) { rect(b.x - b.w/2 + (sL * 1.5), b.y - b.h/2 + (sL * 1.5), b.w, b.h); }
    else if (b.isFence) {
        // Realistic thin shadows for fences
        if (b.w > b.h) { rect(b.x - b.w/2 + 4, b.y - b.h/2 + 4, b.w, 6); } 
        else { rect(b.x - b.w/2 + 4, b.y - b.h/2 + 4, 6, b.h); }
    }
    else if (b.isTrailer) { push(); translate(b.x + sL/2, b.y + sL/2); let isVert = b.h > b.w; let tw = isVert ? b.h : b.w; let th = isVert ? b.w : b.h; if (isVert) rotate(HALF_PI); rect(-tw/2, -th/2, tw, th, 6); triangle(-tw/2, -10, -tw/2 - 25, 0, -tw/2, 10); rect(-10, th/2, 35, 18, 2); pop(); }
    else if (currentLevel === 1 || currentLevel === 2 || currentLevel === 3 || currentLevel === 6 || currentLevel === 7) { 
        if (!b.isAlienPlant && !b.isEnergyPole && !b.isPinkPlanet) { 
            let extSL = (b.isCasino || b.isTheater || b.isAmusementPark || b.isMall) ? sL * 1.5 : sL; 
            rect(b.x - b.w/2 + extSL, b.y - b.h/2 + extSL, b.w, b.h, b.isMall ? 15 : (b.isCasino || b.isTheater || b.isAmusementPark ? 30 : 0)); 
        } 
    }
  }
}



function drawBuildings() {
  for (let b of activeBuildings) { // Changed to activeBuildings
    if (!inView(b.x, b.y, Math.max(b.w || 0, b.h || 0) + 150)) continue; 
    if ((currentLevel === 1 || currentLevel === 2) && b.isGrassLot && !b.isPond && !b.isParkingLot) continue;
    if (b.isParkingCar) continue; 
    if (b.isCropField || b.isPond || b.isParkingLot) continue; // MOVED TO GROUND RENDER STACK
    if (b.isUBarrier) {
        let isFlashing = b.hitFlash && b.hitFlash > 0;
        if (isFlashing) b.hitFlash--;
        push(); translate(b.x, b.y);
        fill(isFlashing ? color(255, 150) : color(255, 150, 50, 100));
        stroke(isFlashing ? 255 : color(255, 150, 50)); strokeWeight(8);
        line(-b.w/2, -b.h/2, -b.w/2, b.h/2); line(b.w/2, -b.h/2, b.w/2, b.h/2); line(-b.w/2, -b.h/2, b.w/2, -b.h/2); 
        if (b.hp > 0 && b.hp < b.maxHp) { fill(0, 150); noStroke(); rect(-40, b.h/2 + 10, 80, 6); fill(255, 150, 50); rect(-40, b.h/2 + 10, 80 * (b.hp / b.maxHp), 6); }
        pop(); continue;
    }

    if (b.isWall) { fill(40); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); continue; }
    if (b.isTerminal) { fill(80); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 5); fill(0, 50, 0); rect(b.x - b.w/2 + 10, b.y - b.h/2 + 2, b.w - 20, b.h - 30); fill(0, 255, 0); textAlign(CENTER, CENTER); textSize(12); textLeading(14); text("etheric\nmagentic\nfield shield", b.x, b.y - 10); continue; }
    if (b.isBasementTable) { fill(100); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); fill(70); rect(b.x - b.w/2 + 10, b.y - b.h/2 + 10, 10, b.h - 20); rect(b.x + b.w/2 - 20, b.y - b.h/2 + 10, 10, b.h - 20); if (b.x < 0) { fill(150); ellipse(b.x + 50, b.y - 5, 15, 15); ellipse(b.x + 20, b.y + 2, 10, 10); } continue; }
    if (b.isCouch) { push(); translate(b.x, b.y); fill(80, 50, 40); rect(-80, -35, 160, 40, 10); fill(60, 40, 30); rect(-80, 5, 160, 30, 10); fill(50, 30, 20); rect(-95, -35, 20, 60, 5); rect(75, -35, 20, 60, 5); pop(); continue; }
    if (b.isTV) { fill(10); rect(b.x - b.w/2 - 10, b.y - b.h/2 - 10, b.w + 20, b.h + 20); fill(30); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); if (!tvWatched) fill(50, 150, 255); else fill(20); rect(b.x - b.w/2 + 5, b.y - b.h/2 + 5, b.w - 10, b.h - 10); continue; }
    if (b.isUpstairsTable) { fill(101, 67, 33); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 5); continue; }
    
    // Giant Side Barriers
    if (b.isGiantBarrier) {
        fill(70, 75, 80); stroke(30); strokeWeight(8); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
        fill(50, 55, 60); noStroke(); for(let py = b.y - b.h/2 + 200; py < b.y + b.h/2; py += 400) rect(b.x - b.w/2, py, b.w, 100);
        fill(255, 0, 0, 150 + sin(frameCount * 0.1)*100);
        for(let py = b.y - b.h/2 + 250; py < b.y + b.h/2; py += 400) {
            let lx = b.x < 0 ? b.x + b.w/2 - 20 : b.x - b.w/2 + 20;
            ellipse(lx, py, 30, 30); fill(255, 100, 100); ellipse(lx, py, 10, 10); fill(255, 0, 0, 150 + sin(frameCount * 0.1)*100); 
        }
        continue;
    }

    // NM-0 Fortresses
    if (b.isGovFortress) {
        let isFlashing = b.hitFlash && b.hitFlash > 0;
        if (isFlashing) b.hitFlash--;
        
        fill(isFlashing ? 255 : 35, isFlashing ? 255 : 40, isFlashing ? 255 : 45); 
        stroke(15); strokeWeight(8); 
        rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
        
        fill(isFlashing ? 200 : 25, isFlashing ? 200 : 30, isFlashing ? 200 : 35); 
        noStroke(); 
        rect(b.x - b.w/2 + 100, b.y - b.h/2 + 100, b.w - 200, b.h - 200);
        
        let gateY = b.y < 0 ? b.y + b.h/2 - 80 : b.y - b.h/2;
        
        // Gate visually stays closed forever (collision remains solid)
        fill(isFlashing ? 255 : 10); rect(b.x - 300, gateY, 600, 80); 
        fill(isFlashing ? 200 : 50); for(let gx = b.x - 280; gx < b.x + 300; gx += 40) rect(gx, gateY, 10, 80);
        
        if (b.hp > 0 && b.hp < b.maxHp) {
            // Health Bar
            fill(0, 150); rect(b.x - 100, gateY - 30, 200, 10);
            fill(255, 50, 50); rect(b.x - 100, gateY - 30, 200 * (b.hp / b.maxHp), 10);
        } else if (b.hp <= 0) {
            // Battle Damage
            fill(255, 100, 0, 100); rect(b.x - 300, gateY, 600, 80); // Fire glow covering the door
            if (frameCount % 5 === 0) emit(b.x + random(-150, 150), gateY + 40, 1, color(100), "SMOKE");
        }
        
        push(); let stripeY = b.y < 0 ? b.y + b.h/2 - 100 : b.y - b.h/2 + 80; stroke(255, 200, 0); strokeWeight(20); strokeCap(SQUARE); for(let i = -300; i < 300; i += 40) line(b.x + i, stripeY, b.x + i + 20, stripeY); pop();
        push(); translate(b.x, b.y); noFill(); stroke(255, 200, 0, 150); strokeWeight(8); ellipse(-800, 0, 300, 300); ellipse(800, 0, 300, 300); strokeWeight(4); ellipse(-800, 0, 200, 200); ellipse(800, 0, 200, 200);
        for(let fx of [-1400, -1200, 1200, 1400]) { fill(15); noStroke(); rect(fx - 60, -60, 120, 120, 10); fill(30); ellipse(fx, 0, 100, 100); push(); translate(fx, 0); rotate(frameCount * 0.1); fill(10); rect(-45, -10, 90, 20); rect(-10, -45, 20, 90); pop(); }
        for(let ax of [-500, 500]) { fill(20); stroke(10); strokeWeight(2); ellipse(ax, 150, 40, 40); fill(255, 0, 0, 150 + sin(frameCount * 0.2)*100); noStroke(); ellipse(ax, 150, 15, 15); }
        fill(200, 0, 0, 200); ellipse(0, 0, 400, 400); fill(15); ellipse(0, 0, 360, 360); fill(200, 0, 0); textAlign(CENTER, CENTER); textSize(120); textFont('sans-serif'); text("NM-0", 0, 0); pop();
        continue;
    }

    if (b.isMall) { fill(170, 175, 180); stroke(100); strokeWeight(3); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 15); fill(190, 195, 200); noStroke(); rect(b.x - b.w/2 + 25, b.y - b.h/2 + 25, b.w - 50, b.h - 50, 10); push(); translate(b.x, b.y); if (b.w > 200 && b.h > 200) { fill(100, 180, 255, 160); stroke(70, 120, 180); strokeWeight(4); rect(-b.w/4, -b.h/4, b.w/2, b.h/2, 5); stroke(255, 255, 255, 150); strokeWeight(2); for(let gx = -b.w/4 + 40; gx < b.w/4; gx += 40) line(gx, -b.h/4, gx, b.h/4); for(let gy = -b.h/4 + 40; gy < b.h/4; gy += 40) line(-b.w/4, gy, b.w/4, gy); } if (b.details) { for(let det of b.details) { if (det.type === 'hvac_large') { fill(0, 50); noStroke(); rect(det.x - 18, det.y - 18, 40, 40, 4); fill(140); stroke(90); strokeWeight(2); rect(det.x - 20, det.y - 20, 40, 40, 4); fill(40); ellipse(det.x - 8, det.y, 14, 14); ellipse(det.x + 8, det.y, 14, 14); push(); translate(det.x - 8, det.y); rotate(frameCount * 0.15); stroke(200); strokeWeight(2); line(-5,0,5,0); line(0,-5,0,5); pop(); push(); translate(det.x + 8, det.y); rotate(frameCount * 0.15); stroke(200); strokeWeight(2); line(-5,0,5,0); line(0,-5,0,5); pop(); } } } pop(); continue; }
    if (b.isCasino) { fill(20, 20, 25); stroke(255, 215, 0); strokeWeight(4); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 20); let cTime = frameCount * 0.1; for(let i=0; i<10; i++) { fill(sin(cTime + i)*127+128, 50, 255-sin(cTime + i)*127); noStroke(); ellipse(b.x - b.w/2 + 40 + i*85, b.y - b.h/2 + 30, 18, 18); ellipse(b.x - b.w/2 + 40 + i*85, b.y + b.h/2 - 30, 18, 18); ellipse(b.x - b.w/2 + 30, b.y - b.h/2 + 40 + i*85, 18, 18); ellipse(b.x + b.w/2 - 30, b.y - b.h/2 + 40 + i*85, 18, 18); } fill(200, 30, 30); stroke(255); strokeWeight(3); ellipse(b.x - 150, b.y, 180, 180); fill(255); ellipse(b.x - 190, b.y - 40, 25, 25); ellipse(b.x - 110, b.y + 40, 25, 25); ellipse(b.x - 110, b.y - 40, 25, 25); ellipse(b.x - 190, b.y + 40, 25, 25); ellipse(b.x - 150, b.y, 25, 25); push(); translate(b.x + 150, b.y); rotate(frameCount * 0.05); fill(0); ellipse(0,0, 200, 200); for(let a=0; a<TWO_PI; a+=PI/4) { fill(a%(PI/2)===0?200:30, a%(PI/2)===0?30:200, 30); arc(0,0, 190, 190, a, a+PI/4); } fill(255,215,0); ellipse(0,0,40,40); pop(); continue; }
    if (b.isTheater) { fill(30, 20, 30); stroke(100); strokeWeight(4); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 10); fill(40, 30, 40); stroke(80); strokeWeight(3); rect(b.x - 250, b.y - 150, 500, 450, 20); fill(180, 20, 20); noStroke(); rect(b.x - 60, b.y + b.h/2 - 150, 120, 150); fill(200, 20, 20); stroke(255, 200, 0); strokeWeight(6); rect(b.x - 200, b.y - b.h/2 + 20, 400, 100); fill(255, 255, 200, 150 + sin(frameCount * 0.2)*100); noStroke(); for(let i=0; i<13; i++) { ellipse(b.x - 180 + i*30, b.y - b.h/2 + 100, 10, 10); ellipse(b.x - 180 + i*30, b.y - b.h/2 + 35, 10, 10); } continue; }
    if (b.isArena) { fill(60); noStroke(); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 40); fill(150, 155, 160); stroke(100); strokeWeight(10); ellipse(b.x, b.y, b.w - 100, b.h - 150); fill(40, 100, 40); stroke(200); strokeWeight(3); ellipse(b.x, b.y, b.w - 300, b.h - 350); fill(255); noStroke(); rect(b.x - 5, b.y - (b.h-350)/2, 10, b.h - 350); ellipse(b.x, b.y, 50, 50); fill(40, 100, 40); ellipse(b.x, b.y, 44, 44); continue; }
    if (b.isAmusementPark) { fill(45, 70, 45); noStroke(); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 40); noFill(); stroke(150, 200, 255); strokeWeight(10); beginShape(); for(let t=0; t<TWO_PI; t+=0.2) { vertex(b.x + 150 + cos(t)*200 + sin(t*3)*40, b.y + 150 + sin(t)*200 + cos(t*2)*40); } endShape(CLOSE); push(); translate(b.x - 180, b.y - 180); rotate(frameCount * 0.015); stroke(200); strokeWeight(6); noFill(); ellipse(0,0, 300, 300); for(let a=0; a<TWO_PI; a+=PI/4) { line(0,0, cos(a)*150, sin(a)*150); fill(255, 100, 100); noStroke(); ellipse(cos(a)*150, sin(a)*150, 35, 35); } pop(); fill(255, 200, 0); noStroke(); ellipse(b.x + 250, b.y - 200, 120, 120); fill(200, 50, 255); ellipse(b.x - 200, b.y + 250, 100, 100); continue; }
    if (b.isCircus) { fill(180, 160, 120); noStroke(); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 100); push(); translate(b.x, b.y); fill(220); stroke(180); strokeWeight(4); ellipse(0,0, 650, 650); fill(200, 30, 30); noStroke(); for(let a=0; a<TWO_PI; a+=PI/6) { arc(0,0, 650, 650, a, a+PI/12); } fill(50); stroke(255, 200, 0); strokeWeight(5); ellipse(0,0, 100, 100); fill(200, 30, 30); ellipse(-250, 250, 180, 180); fill(220); ellipse(-250, 250, 100, 100); fill(40, 100, 200); ellipse(250, 250, 180, 180); fill(220); ellipse(250, 250, 100, 100); pop(); continue; }

    if (b.isTower) { if (b.hp > 0) { push(); translate(b.x, b.y); let isFlashing = b.hitFlash && b.hitFlash > 0; if (isFlashing) { b.hitFlash--; } fill(isFlashing ? 255 : 40); stroke(isFlashing ? 255 : 20); strokeWeight(2); rect(-b.w/2, -b.h/2, b.w, b.h, 5); stroke(isFlashing ? 255 : 100); strokeWeight(4); line(-b.w/2+10, -b.h/2+10, -10, -80); line(b.w/2-10, -b.h/2+10, 10, -80); line(-b.w/2+10, b.h/2-10, -10, -80); line(b.w/2-10, b.h/2-10, 10, -80); strokeWeight(2); stroke(isFlashing ? 255 : 80); line(-b.w/2+10, -b.h/2+10, b.w/2-10, b.h/2-10); line(-b.w/2+10, b.h/2-10, b.w/2-10, -b.h/2+10); line(-25, -30, 25, -30); line(-15, -60, 15, -60); stroke(isFlashing ? 255 : 150); strokeWeight(3); line(0, -80, 0, -120); noStroke(); if (frameCount % 60 < 30 || isFlashing) fill(255, 0, 0); else fill(100, 0, 0); ellipse(0, -120, 8, 8); if (b.hp < b.maxHp) { fill(0, 150); rect(-40, -140, 80, 6); fill(255, 50, 50); rect(-40, -140, 80 * max(0, b.hp / b.maxHp), 6); } pop(); } else { fill(20); noStroke(); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); fill(10); ellipse(b.x, b.y, b.w*0.8, b.h*0.8); stroke(40); strokeWeight(4); line(b.x - 20, b.y - 20, b.x + 30, b.y + 10); line(b.x + 10, b.y - 30, b.x - 20, b.y + 20); if (frameCount % 5 === 0) emit(b.x + random(-20, 20), b.y + random(-20, 20), 1, color(100), "SMOKE"); } continue; }
    if (b.isStreetLight) { fill(30); stroke(10); strokeWeight(2); ellipse(b.x, b.y, b.w, b.h); fill(255, 255, 200); noStroke(); ellipse(b.x, b.y, b.w - 6, b.h - 6); continue; }
    if (b.isDumpster) { push(); translate(b.x, b.y); rotate(b.angle); fill(25, 75, 30); stroke(10); strokeWeight(2); rect(-b.w/2, -b.h/2, b.w, b.h, 2); fill(25, 75, 30); stroke(15); strokeWeight(1); rect(-b.w/2 + 2, -b.h/2 + 2, b.w/2 - 2.5, b.h - 4, 1); rect(0.5, -b.h/2 + 2, b.w/2 - 2.5, b.h - 4, 1); fill(50); noStroke(); rect(-b.w/2 - 3, -4, 5, 8, 1); rect(b.w/2 - 2, -4, 5, 8, 1); pop(); continue; }
    if (b.isCar && !b.isParkingCar) { push(); translate(b.x, b.y); rotate(b.angle || HALF_PI); fill(b.col[0], b.col[1], b.col[2]); stroke(15); strokeWeight(2); rect(-25, -45, 50, 90, 6); fill(25); noStroke(); rect(-20, -25, 40, 15, 2); rect(-20, 15, 40, 12, 2); fill(30, 20, 15, 180); ellipse(0, -5, 30, 25); fill(10, 150); ellipse(-10, 20, 15, 15); pop(); continue; }
    if (b.isPalm) { drawPalmTree(b.x, b.y); continue; }
    if (b.isHouse) { fill(120); noStroke(); rect(b.x - 25, b.y, 50, b.h/2 + 65); fill(190, 195, 200); stroke(60); strokeWeight(2); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); fill(100, 50, 50); stroke(40, 20, 20); strokeWeight(2); rect(b.x - b.w/2 - 10, b.y - b.h/2 - 10, b.w + 20, b.h + 20); line(b.x - b.w/2 - 10, b.y, b.x + b.w/2 + 10, b.y); fill(40); noStroke(); rect(b.x - 12, b.y + b.h/2 - 15, 24, 20); fill(200, 200, 100); ellipse(b.x + 6, b.y + b.h/2 - 5, 4, 4); continue; }
    if (b.isRock) { fill(180, 200, 210); stroke(140, 160, 180); strokeWeight(2); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 20); fill(200, 220, 230); noStroke(); rect(b.x - b.w/2 + 10, b.y - b.h/2 + 10, b.w - 30, b.h - 30, 10); continue; }

    // Level 6 Alien Flora
    if (currentLevel === 6) {
        if (b.isAlienPlant) { 
            fill(150, 50, 255); noStroke(); ellipse(b.x, b.y, 40, 40); 
            push(); translate(b.x, b.y); fill(50, 255, 50); 
            for(let a=0; a<5; a++) { ellipse(30, 0, 40, 15); rotate(TWO_PI/5); } 
            pop(); continue; 
        }
        if (b.isEnergyPole) { 
            fill(80); stroke(50, 255, 50); strokeWeight(2); rect(b.x - 10, b.y - 10, 20, 20); 
            fill(50, 255, 50, 150 + sin(frameCount*0.1)*100); noStroke(); ellipse(b.x, b.y, 60, 60); 
            continue; 
        }
        if (b.isAlienBldg) { 
            fill(70, 50, 90); stroke(50, 255, 50); strokeWeight(2); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); 
            fill(100, 50, 150); noStroke(); ellipse(b.x, b.y, b.w*0.6, b.h*0.6); 
            continue; 
        }
    }

    // Level 7 Cyber Planets
    if (currentLevel === 7) {
        if (b.isPinkPlanet) { 
            let pA = b.flashTimer > 0 ? 150 : 255; if(b.flashTimer > 0) b.flashTimer--; 
            fill(255, 105, 180, pA); stroke(200, 50, 150); strokeWeight(4); ellipse(b.x, b.y, b.w, b.h); 
            fill(200, 50, 150, pA); noStroke(); 
            ellipse(b.x - b.w*0.2, b.y - b.h*0.2, b.w*0.2, b.h*0.2); 
            ellipse(b.x + b.w*0.25, b.y + b.h*0.1, b.w*0.15, b.h*0.15); 
            ellipse(b.x - b.w*0.1, b.y + b.h*0.3, b.w*0.25, b.h*0.25); 
            continue; 
        }
        if (b.isPyramid) { 
            fill(200, 150, 0); stroke(150, 100, 0); strokeWeight(2); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); 
            line(b.x - b.w/2, b.y - b.h/2, b.x, b.y); line(b.x + b.w/2, b.y - b.h/2, b.x, b.y); 
            line(b.x - b.w/2, b.y + b.h/2, b.x, b.y); line(b.x + b.w/2, b.y + b.h/2, b.x, b.y); 
            fill(255, 200, 0); ellipse(b.x, b.y, 20, 20); 
            continue; 
        }
        if (b.isChip) { 
            fill(20, 25, 20); stroke(50, 200, 50); strokeWeight(3); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 10); 
            fill(40, 150, 40); noStroke(); rect(b.x - b.w/4, b.y - b.h/4, b.w/2, b.h/2, 5); 
            stroke(50, 200, 50); strokeWeight(2); 
            for(let i = -b.w/2 + 20; i < b.w/2; i += 20) { line(b.x + i, b.y - b.h/2, b.x + i, b.y - b.h/4); line(b.x + i, b.y + b.h/4, b.x + i, b.y + b.h/2); } 
            for(let j = -b.h/2 + 20; j < b.h/2; j += 20) { line(b.x - b.w/2, b.y + j, b.x - b.w/4, b.y + j); line(b.x + b.w/4, b.y + j, b.x + b.w/2, b.y + j); } 
            continue; 
        }
    }

        if (b.isFence) {
        fill(120, 80, 50); stroke(80, 50, 30); strokeWeight(2);
        rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
        fill(90, 60, 40); noStroke();
        if (b.w > b.h) { for(let px = b.x - b.w/2; px <= b.x + b.w/2; px += 40) rect(px - 4, b.y - b.h/2 - 4, 8, b.h + 8); } 
        else { for(let py = b.y - b.h/2; py <= b.y + b.h/2; py += 40) rect(b.x - b.w/2 - 4, py - 4, b.w + 8, 8); }
        
        // NEW: Draw Fence HP Bar
        if (b.hp !== undefined && b.hp < b.maxHp) {
            fill(0, 150); rect(b.x - 25, b.y - b.h/2 - 15, 50, 6);
            fill(255, 50, 50); rect(b.x - 25, b.y - b.h/2 - 15, 50 * (b.hp / b.maxHp), 6);
        }
        continue;
    }

    // Upgraded Trailer Homes
    if (b.isTrailer) {
        push(); translate(b.x, b.y);

        // Normalize dimensions so we only have to draw it horizontally,
        // and just rotate the canvas if it's a vertically placed trailer.
        let isVert = b.h > b.w;
        let tw = isVert ? b.h : b.w;
        let th = isVert ? b.w : b.h;

        if (isVert) rotate(HALF_PI);

        // 1. The Hitch (Tongue)
        fill(60); stroke(30); strokeWeight(2);
        triangle(-tw/2, -10, -tw/2 - 25, 0, -tw/2, 10);
        fill(40); ellipse(-tw/2 - 20, 0, 6, 6); // Hitch ball mount

        // 2. Main Trailer Body
        fill(225, 225, 220); stroke(120, 110, 100); strokeWeight(3);
        rect(-tw/2, -th/2, tw, th, 6);

        // 3. Colored Siding Stripes (Uses grid position to randomize colors)
        let stripeColors = [color(80, 140, 180), color(180, 80, 80), color(100, 160, 100), color(180, 140, 70)];
        let colIdx = Math.floor(Math.abs(b.x + b.y)) % stripeColors.length;
        fill(stripeColors[colIdx]); noStroke();
        rect(-tw/2 + 2, -th/2 + 8, tw - 4, 8);
        rect(-tw/2 + 2, th/2 - 16, tw - 4, 8);

        // 4. Raised Roof Center
        fill(240); stroke(150); strokeWeight(2);
        rect(-tw/2 + 10, -th/2 + 18, tw - 20, th - 36, 4);

        // 5. AC Unit on Roof
        fill(180); stroke(100); strokeWeight(2);
        rect(-tw/4, -14, 28, 28, 3); // AC Box
        fill(40); noStroke(); ellipse(-tw/4 + 14, 0, 18, 18); // Fan hole
        stroke(150); strokeWeight(2);
        line(-tw/4 + 14, -7, -tw/4 + 14, 7); // Fan blades
        line(-tw/4 + 7, 0, -tw/4 + 21, 0);

        // Small Exhaust Vent
        fill(160); stroke(90); strokeWeight(1);
        rect(tw/4, -6, 12, 12, 2);

        // 6. Wooden Porch/Deck at the entrance
        fill(140, 90, 50); stroke(80, 50, 30); strokeWeight(2);
        rect(-10, th/2, 35, 18, 2); // Deck frame
        line(-2, th/2, -2, th/2 + 18); // Planks
        line(6, th/2, 6, th/2 + 18);
        line(14, th/2, 14, th/2 + 18);
        line(22, th/2, 22, th/2 + 18);

        // 7. Windows
        fill(100, 180, 255, 180); stroke(80); strokeWeight(2);
        rect(-tw/2 + 20, th/2 - 8, 20, 6, 1);
        rect(tw/2 - 40, th/2 - 8, 20, 6, 1);
        rect(tw/2 - 40, -th/2 + 2, 20, 6, 1);

        pop(); 
        continue;
    }

    if (b.isBarn) {
        fill(160, 40, 40); stroke(100, 20, 20); strokeWeight(3); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
        fill(180, 50, 50); noStroke(); rect(b.x - b.w/2 + 10, b.y - b.h/2 + 10, b.w - 20, b.h - 20);
        fill(200); stroke(100); strokeWeight(2); rect(b.x - 40, b.y + b.h/2 - 20, 80, 20); 
        line(b.x - 40, b.y + b.h/2 - 20, b.x + 40, b.y + b.h/2); line(b.x - 40, b.y + b.h/2, b.x + 40, b.y + b.h/2 - 20); 
        continue;
    }

    // Upgraded Market Structure
    if (b.isMarket) {
        push(); translate(b.x, b.y);
        fill(200, 170, 130); stroke(160, 130, 90); strokeWeight(3); rect(-b.w/2, -b.h/2, b.w, b.h, 10);
        let colors = [color(200, 60, 60), color(60, 120, 200), color(220, 160, 40), color(60, 160, 60)];
        for(let i=0; i<4; i++) {
            let tx = -80 + (i%2)*160, ty = -50 + floor(i/2)*100;
            fill(0, 30); noStroke(); rect(tx - 35, ty - 25, 70, 70, 5); // Canopy Shadow
            fill(colors[i]); stroke(40); strokeWeight(2); rect(tx - 40, ty - 40, 80, 80, 4); // Canopy Tarp
            fill(240); noStroke(); rect(tx - 20, ty - 38, 10, 76); rect(tx + 10, ty - 38, 10, 76); // Canopy Stripes
            fill(139, 90, 43); stroke(80, 50, 20); strokeWeight(2); rect(tx - 25, ty - 15, 50, 30, 2); // Table
            fill(255, 100, 100); ellipse(tx - 10, ty, 8, 8); ellipse(tx - 15, ty - 5, 8, 8); // Apples
            fill(100, 255, 100); rect(tx + 5, ty - 8, 12, 12, 2); // Crates
        }
        pop(); continue;
    }

    if (b.isGasStation) {
        fill(200); stroke(150); strokeWeight(3); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h); 
        fill(220); noStroke(); rect(b.x - b.w/2 + 5, b.y - b.h/2 + 5, b.w - 10, b.h - 10);
        fill(240); stroke(100); rect(b.x - b.w/2 + 20, b.y - b.h/2 + 20, 100, b.h - 40);
        fill(40, 100, 200); stroke(20); rect(b.x + 20, b.y - 60, 90, 120);
        fill(200, 40, 40); stroke(20); rect(b.x + 40, b.y - 40, 20, 30, 3); rect(b.x + 40, b.y + 10, 20, 30, 3);
        continue;
    }

    if (b.isLiquorStore) {
        fill(120, 60, 50); stroke(60, 30, 20); strokeWeight(3); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
        fill(100, 50, 40); noStroke(); rect(b.x - b.w/2 + 10, b.y - b.h/2 + 10, b.w - 20, b.h - 20);
        fill(80); stroke(40); rect(b.x - 20, b.y - 20, 40, 40, 2); fill(30); ellipse(b.x, b.y, 20, 20);
        fill(255, 50, 50, 200); noStroke(); rect(b.x - 40, b.y + b.h/2 - 15, 80, 10);
        fill(255, 200, 200); rect(b.x - 38, b.y + b.h/2 - 13, 76, 6);
        continue;
    }

    // Upgraded Shanty (Survival Tents)
    if (b.isShanty) {
        push(); translate(b.x, b.y);
        stroke(80, 60, 40); strokeWeight(2);
        line(-b.w/2, -b.h/2, -b.w/2 - 15, -b.h/2 - 15); line(b.w/2, -b.h/2, b.w/2 + 15, -b.h/2 - 15);
        line(-b.w/2, b.h/2, -b.w/2 - 15, b.h/2 + 15); line(b.w/2, b.h/2, b.w/2 + 15, b.h/2 + 15);
        
        fill(60); noStroke();
        ellipse(-b.w/2 - 15, -b.h/2 - 15, 6, 6); ellipse(b.w/2 + 15, -b.h/2 - 15, 6, 6);
        ellipse(-b.w/2 - 15, b.h/2 + 15, 6, 6); ellipse(b.w/2 + 15, b.h/2 + 15, 6, 6);
        
        let cv = (Math.floor(Math.abs(b.x * b.y)) % 3);
        if (cv === 0) fill(170, 160, 130); else if (cv === 1) fill(130, 150, 130); else fill(190, 140, 110); 

        stroke(80, 70, 60); strokeWeight(3); rect(-b.w/2, -b.h/2, b.w, b.h, 8);
        fill(0, 30); noStroke(); triangle(-b.w/2, -b.h/2, b.w/2, b.h/2, -b.w/2, b.h/2); 
        stroke(100, 90, 80); strokeWeight(2); line(-b.w/2, -b.h/2, b.w/2, b.h/2); line(b.w/2, -b.h/2, -b.w/2, b.h/2);
        
        fill(50); noStroke(); ellipse(0, 0, 12, 12); fill(80); ellipse(0, 0, 6, 6);
        fill(90, 100, 110); stroke(60); strokeWeight(1); rect(-b.w/2 - 20, -10, 12, 18, 2);
        fill(150, 50, 50); ellipse(b.w/2 + 10, 10, 12, 12);
        pop(); continue;
    }

    // Upgraded Apartments (Desert Motels)
    if (b.isApartment) {
        push(); translate(b.x, b.y);
        fill(205, 180, 150); stroke(130, 100, 80); strokeWeight(4); rect(-b.w/2, -b.h/2, b.w, b.h, 4);
        fill(170, 160, 150); noStroke(); rect(-b.w/2 + 6, -b.h/2 + 6, b.w - 12, b.h - 12, 2);
        fill(0, 12); ellipse(-b.w/4, -b.h/4, b.w*0.3, b.h*0.3); ellipse(b.w/3, b.h/3, b.w*0.4, b.h*0.4);

        fill(180, 160, 130); stroke(120, 90, 70); strokeWeight(2); rect(-b.w/2 + 15, b.h/2 - 35, b.w - 30, 35); 
        
        stroke(140, 130, 120); strokeWeight(2);
        for(let rx = -b.w/2 + 40; rx < b.w/2 - 10; rx += 40) { line(rx, -b.h/2 + 6, rx, b.h/2 - 35); }

        for(let ax = -b.w/2 + 20; ax < b.w/2 - 10; ax += 40) {
            fill(200); stroke(100); strokeWeight(1); rect(ax - 8, -b.h/2 + 12, 16, 16, 2);
            fill(50); noStroke(); ellipse(ax, -b.h/2 + 20, 10, 10);
            stroke(80); line(ax - 4, -b.h/2 + 25, ax + 4, -b.h/2 + 25);
        }
        
        fill(140); stroke(100); strokeWeight(2); rect(-20, -20, 40, 40, 3);
        fill(110); noStroke(); rect(-15, -15, 30, 30);
        stroke(80); line(-10, -10, 10, 10); line(10, -10, -10, 10);
        pop(); continue;
    }
// Western Town Buildings
    if (b.isWesternBldg) {
        push(); translate(b.x, b.y);

        // Wooden boardwalk strip in front of the building
        fill(150, 115, 75); noStroke();
        rect(-b.w/2 - 20, b.h/2 - 4, b.w + 40, 26);
        stroke(110, 82, 50, 180); strokeWeight(1);
        for (let px = -b.w/2 - 18; px < b.w/2 + 20; px += 14) line(px, b.h/2 - 4, px, b.h/2 + 22);
        noStroke();

        // Main structure
        fill(170, 130, 85); stroke(110, 80, 45); strokeWeight(3);
        rect(-b.w/2, -b.h/2, b.w, b.h, 3);
        fill(150, 115, 75); noStroke();
        rect(-b.w/2 + 6, -b.h/2 + 6, b.w - 12, b.h - 12);

        stroke(120, 90, 55, 150); strokeWeight(1);
        for (let px = -b.w/2 + 15; px < b.w/2; px += 18) line(px, -b.h/2 + 6, px, b.h/2 - 6);
        noStroke();

        // False-front top
        fill(160, 122, 78);
        rect(-b.w/2 - 4, -b.h/2 - 14, b.w + 8, 20, 2);
        fill(140, 105, 65);
        rect(-b.w/2 - 4, -b.h/2 - 14, b.w + 8, 6);

        // Hitching rail out front
        fill(90, 62, 35);
        rect(-b.w/2 - 14, b.h/2 + 22, b.w + 28, 8);
        stroke(60, 40, 20); strokeWeight(3);
        for (let px = -b.w/2; px <= b.w/2; px += 35) line(px, b.h/2 + 22, px, b.h/2 + 46);
        noStroke();

        // Windows
        fill(120, 190, 220, 200); stroke(70); strokeWeight(1);
        rect(-b.w/2 + 14, -8, 26, 28);
        rect(b.w/2 - 40, -8, 26, 28);

        // Door
        noStroke(); fill(55, 38, 20);
        rect(-14, 4, 28, b.h/2 - 8);
        fill(200, 170, 100); ellipse(8, b.h/2 - 20, 4, 4);

        // Church steeple
        if (b.isChurch) {
            fill(150, 115, 75); stroke(110, 80, 45); strokeWeight(2);
            rect(-15, -b.h/2 - 55, 30, 45, 2);
            triangle(-20, -b.h/2 - 55, 20, -b.h/2 - 55, 0, -b.h/2 - 80);
            stroke(90, 65, 35); strokeWeight(3);
            line(0, -b.h/2 - 80, 0, -b.h/2 - 95);
            line(-6, -b.h/2 - 89, 6, -b.h/2 - 89);
        }

        // Livery stable double doors
        if (b.isLivery) {
            fill(90, 62, 35); noStroke();
            rect(-b.w/2 + 20, -20, b.w - 40, b.h/2 + 10);
            stroke(60, 40, 20); strokeWeight(2);
            line(0, -20, 0, b.h/2 - 10);
            noStroke();
        }

        // Sign
        fill(225, 205, 165); stroke(90, 65, 35); strokeWeight(2);
        rect(-b.w/2 + 10, -b.h/2 - 30, b.w - 20, 22, 3);
        fill(30); noStroke(); textAlign(CENTER, CENTER); textSize(10); textFont('sans-serif');
        text(b.signText || "STORE", 0, -b.h/2 - 19);

        pop();
        continue;
    }

    // Water tower prop
    if (b.isWaterTower) {
        push(); translate(b.x, b.y);
        stroke(90, 65, 40); strokeWeight(4);
        line(-25, 30, -18, -10); line(25, 30, 18, -10);
        line(-25, 30, 25, 30); line(-10, 30, -5, 0); line(10, 30, 5, 0);
        noStroke(); fill(140, 105, 70); stroke(90, 65, 40); strokeWeight(2);
        rect(-30, -40, 60, 45, 4);
        fill(110, 82, 55); rect(-30, -40, 60, 10, 4);
        noStroke(); fill(70, 50, 30); rect(-3, -40, 6, 12);
        pop();
        continue;
    }

    // Well prop
    if (b.isWell) {
        push(); translate(b.x, b.y);
        fill(140, 130, 120); stroke(90, 80, 70); strokeWeight(3);
        ellipse(0, 0, b.w, b.h);
        fill(30, 30, 35); noStroke(); ellipse(0, 0, b.w - 14, b.h - 14);
        stroke(90, 65, 40); strokeWeight(3);
        line(-b.w/2 + 4, -8, -b.w/2 + 4, -28); line(b.w/2 - 4, -8, b.w/2 - 4, -28);
        line(-b.w/2 + 4, -28, b.w/2 - 4, -28);
        pop();
        continue;
    }
    if (b.isHayBale) {
        push(); translate(b.x, b.y);
        fill(205, 170, 75); stroke(160, 128, 48); strokeWeight(2);
        ellipse(-10, -6, 30, 30); ellipse(10, -6, 30, 30); ellipse(0, 12, 34, 30);
        noFill(); stroke(172, 138, 58); strokeWeight(1);
        line(-22, -6, 2, -6); line(-2, 12, 20, 12);
        pop(); continue;
    }

    if (b.isWagonProp) {
        push(); translate(b.x, b.y);
        fill(45, 32, 20); noStroke();
        ellipse(-b.w/2 + 10, b.h/2 - 2, 22, 22); ellipse(b.w/2 - 10, b.h/2 - 2, 22, 22);
        fill(25, 18, 10); ellipse(-b.w/2 + 10, b.h/2 - 2, 8, 8); ellipse(b.w/2 - 10, b.h/2 - 2, 8, 8);
        fill(120, 85, 50); stroke(80, 55, 30); strokeWeight(2);
        rect(-b.w/2, -b.h/2 + 6, b.w, b.h * 0.6, 3);
        noFill(); stroke(225, 215, 195); strokeWeight(3);
        arc(0, -b.h/2 + 6, b.w * 0.9, b.h * 1.3, PI, TWO_PI);
        pop(); continue;
    }

    if (b.isCactusProp) {
        push(); translate(b.x, b.y);
        fill(55, 115, 62); stroke(38, 88, 46); strokeWeight(2);
        rect(-6, -b.h/2, 12, b.h, 6);
        rect(-17, -b.h/2 + 14, 12, 22, 5);
        rect(5, -b.h/2 + 22, 12, 22, 5);
        pop(); continue;
    }

    if (b.isCrateProp) {
        push(); translate(b.x, b.y);
        fill(150, 112, 68); stroke(100, 75, 45); strokeWeight(2);
        rect(-b.w/2, -b.h/2, b.w, b.h, 2);
        noFill(); stroke(112, 84, 50); strokeWeight(1.5);
        line(-b.w/2, -b.h/2, b.w/2, b.h/2); line(b.w/2, -b.h/2, -b.w/2, b.h/2);
        pop(); continue;
    }

    if (b.isTumbleweedProp) {
        push(); translate(b.x, b.y);
        noFill(); stroke(122, 96, 55); strokeWeight(1.5);
        for (let a = 0; a < PI; a += PI / 5) {
            ellipse(0, 0, b.w * (0.75 + 0.25 * sin(a * 3)), b.h * 0.85);
        }
        pop(); continue;
    }
    let bM, bI;
    if (currentLevel === 1) { 
        if (b.style === 0) { bM = [160, 165, 170]; bI = [140, 145, 150]; } 
        else if (b.style === 1) { bM = [140, 60, 50]; bI = [120, 50, 40]; } 
        else if (b.style === 2) { bM = [190, 180, 160]; bI = [170, 160, 140]; } 
        else { bM = [70, 90, 110]; bI = [50, 70, 90]; } 
    } else { bM = currentLevel === 2 ? [35, 35, 40] : (currentLevel === 4 ? [80, 70, 50] : [140, 150, 160]); bI = currentLevel === 2 ? 15 : (currentLevel === 4 ? 70 : 120); }
    
    fill(bM[0], bM[1], bM[2]); stroke(currentLevel === 1 || currentLevel === 3 ? 100 : 10); strokeWeight(2); rect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); 
    fill(bI[0], bI[1], bI[2] || bI); noStroke(); rect(b.x - b.w / 2 + 12, b.y - b.h / 2 + 12, b.w - 24, b.h - 24);
    fill(bM[0]*0.9, bM[1]*0.9, bM[2]*0.9); rect(b.x - b.w / 2 + 25, b.y - b.h / 2 + 25, b.w - 50, b.h - 50);

    if (currentLevel === 1 || currentLevel === 2) {
        if (b.details) {
            push(); translate(b.x, b.y);
            for(let det of b.details) {
                fill(0, 50); noStroke(); 
                if (det.type === 'hvac') rect(det.x - 13, det.y - 13, 26, 26, 3);
                else if (det.type === 'access') rect(det.x - 13, det.y - 18, 26, 36);
                else if (det.type === 'vent') rect(det.x - 6, det.y - 6, 12, 12);
                
                if (det.type === 'hvac') { fill(120); stroke(80); strokeWeight(1); rect(det.x - 15, det.y - 15, 30, 30, 3); fill(40); ellipse(det.x, det.y, 18, 18); push(); translate(det.x, det.y); rotate(frameCount * 0.1); stroke(180); strokeWeight(3); line(-7, 0, 7, 0); line(0, -7, 0, 7); pop(); } 
                else if (det.type === 'access') { fill(bM[0]*0.7, bM[1]*0.7, bM[2]*0.7); stroke(80); strokeWeight(1); rect(det.x - 15, det.y - 20, 30, 40); fill(40); noStroke(); rect(det.x - 6, det.y + 5, 12, 15); } 
                else if (det.type === 'helipad') { noFill(); stroke(255, 200, 0); strokeWeight(4); ellipse(det.x, det.y, 50, 50); strokeWeight(2); ellipse(det.x, det.y, 30, 30); } 
                else if (det.type === 'vent') { fill(140); stroke(90); strokeWeight(1); rect(det.x - 8, det.y - 8, 16, 16); fill(50); noStroke(); rect(det.x - 5, det.y - 5, 10, 2); rect(det.x - 5, det.y, 10, 2); rect(det.x - 5, det.y + 5, 10, 2); }
            } pop();
        }
    }
  }
}







function drawParkingCars() {
  for (let c of activeParkingCars) {
    push(); translate(c.x, c.y); rotate(c.angle || HALF_PI); fill(c.col[0], c.col[1], c.col[2]); stroke(15); strokeWeight(2); rect(-25, -45, 50, 90, 6); fill(25); noStroke(); rect(-20, -25, 40, 15, 2); rect(-20, 15, 40, 12, 2); fill(30, 20, 15, 180); ellipse(0, -5, 30, 25); fill(10, 150); ellipse(-10, 20, 15, 15); pop();
  }
}







function windowResized() { resizeCanvas(windowWidth, windowHeight); leftStick.base = { x: 80, y: height - 160 }; rightStick.base = { x: width - 80, y: height - 110 }; }
function nextLevel() { startAtLevel(currentLevel + 1); }
function restartGame() { startAtLevel(1); }
function emit(x, y, c, col, typ, vx = 0, vy = 0) { for (let i = 0; i < c; i++) { particles.push(new Particle(x, y, col, typ, vx, vy)); } }
let activeBuildings = [];
let activeParkingCars = [];

let lastActiveUpdate = 0;
function updateActiveWorld() {
    // THROTTLE: Only generate this array once every 10 frames to save massive CPU/Battery
    if (frameCount - lastActiveUpdate < 10 && activeBuildings.length > 0) return;
    lastActiveUpdate = frameCount;

    activeBuildings = [];
    for (let b of buildings) {
        let bRad = Math.max(b.w || 0, b.h || 0) * 0.5;
        // EXPANDED: 1500px buffer. Covers all off-screen enemies without loading the whole map!
        if (inView(b.x, b.y, bRad + 1500)) {
            activeBuildings.push(b);
        }
    }
    
    activeParkingCars = [];
    for (let c of parkingCars) {
        if (inView(c.x, c.y, 1500)) {
            activeParkingCars.push(c);
        }
    }
}




function updateGrenadePickups() {
    for (let i = grenadePickups.length - 1; i >= 0; i--) {
        let g = grenadePickups[i];
        if (inView(g.x, g.y, 50)) {
            push(); translate(g.x, g.y);
            let hover = sin(frameCount * 0.05 + g.x) * 5;
            translate(0, hover);
            
            fill(40, 100, 40); stroke(20, 80, 20); strokeWeight(2);
            rect(-10, -12, 20, 24, 4); 
            fill(100); noStroke(); rect(-4, -16, 8, 4); 
            fill(255, 50, 50); ellipse(0, -10, 4, 4); 
            pop();
        }
        
        if (player && player.hp > 0 && dist(player.x, player.y, g.x, g.y) < 30) {
            if (pGrenadeAmmo < 12) {
                pGrenadeAmmo = Math.min(12, (pGrenadeAmmo || 0) + 4);
                grenadesUnlocked = true; // <--- THIS WAS THE BUG. Changed from hasGrenadeAbility
                streakMsgText = "GRENADES ACQUIRED!";
                streakMsgTimer = 90;
                sfx.reload(); 
                emit(g.x, g.y, 20, color(50, 255, 50), "SPARK");
                grenadePickups.splice(i, 1);
            }
        }
    }
}


function clearAllBlood() {
    for (let key in bloodChunks) {
        bloodChunks[key].remove(); // Destroys the p5.Graphics object
    }
    bloodChunks = {}; // Resets the dictionary
}



function draw() {
  if (!started) {
    background(15); fill(255); textAlign(CENTER, CENTER); textSize(32); textFont('sans-serif'); text("STICK WORLD REVOLUTION", width / 2, height / 2 - 140);
    
    if (!selectingDifficulty) {
        fill(180); textSize(18); text("SELECT STARTING LEVEL", width / 2, height / 2 - 80); let startX = width / 2 - 175;
        for (let i = 1; i <= 7; i++) { fill(40); stroke(100); strokeWeight(2); rect(startX + (i - 1) * 60, height / 2 - 50, 50, 50, 8); fill(255); noStroke(); textSize(20); text(i, startX + (i - 1) * 60 + 25, height / 2 - 25); }
        
        fill(30); stroke(50, 255, 50); strokeWeight(2); rect(width / 2 - 100, height / 2 + 20, 200, 50, 8); fill(255); noStroke(); textSize(20); text("ARCADE MODE", width / 2, height / 2 + 45);
        fill(30); stroke(255, 200, 0); strokeWeight(2); rect(width / 2 - 100, height / 2 + 80, 200, 50, 8); fill(255); noStroke(); textSize(20); text("STORY MODE", width / 2, height / 2 + 105);
        
        if (localStorage.getItem('urbanTwinStickSave') !== null) {
            fill(30); stroke(50, 200, 255); strokeWeight(2); rect(width / 2 - 100, height / 2 + 140, 200, 50, 8); 
            fill(255); noStroke(); textSize(20); text("LOAD GAME", width / 2, height / 2 + 165);
        }
    } else {
        fill(180); textSize(18); text("SELECT DIFFICULTY", width / 2, height / 2 - 80);
        
        fill(30); stroke(50, 255, 50); strokeWeight(2); rect(width / 2 - 150, height / 2 - 30, 300, 60, 8); 
        fill(255); noStroke(); textSize(20); text("NORMAL", width / 2, height / 2 - 10); 
        textSize(12); fill(150); text("Squad AI (No evasive strafing)", width / 2, height / 2 + 10);
        
        fill(30); stroke(255, 50, 50); strokeWeight(2); rect(width / 2 - 150, height / 2 + 45, 300, 60, 8); 
        fill(255); noStroke(); textSize(20); text("HARD", width / 2, height / 2 + 65); 
        textSize(12); fill(150); text("Tactical Squads + Evasive Dodging", width / 2, height / 2 + 85);
        
        fill(150); noStroke(); textSize(14); text("[ GO BACK ]", width / 2, height / 2 + 135);
    }
    return;
  }

  // TOWER DESTROYED WIN CONDITION TRIGGER
  if ((currentLevel === 1 || currentLevel === 2) && isStoryMode && !window.towersDefeated){
      let totalTowers = buildings.filter(b => b.isTower).length;
      let activeTowers = buildings.filter(b => b.isTower && b.hp > 0).length;
      if (totalTowers > 0 && activeTowers === 0 && !isWin && !killcamMode) {
          killcamMode = true; killcamTarget = { x: player.x, y: player.y }; killcamTimer = 150;
      }
  }

  if (isStoryMode && inStoryIntro) {
      background(0); fill(255, 200, 0); textAlign(CENTER, TOP); textSize(16); textLeading(22); textFont('sans-serif');
      text(storyText, width / 2, introScrollY); introScrollY -= 1.0; 
      fill(100); textSize(14); text("[ TAP ANYWHERE TO SKIP ]", width / 2, height - 40);
      if (introScrollY < -450) { inStoryIntro = false; inStoryRoom = true; storyPhase = 1; dadX = -50; }
      return; 
  }

  if (inStoryRoom) {
      if (storyPhase === 1 || storyPhase === 2) {
          background(20, 25, 30); fill(35, 40, 45); noStroke(); rect(0, height * 0.6, width, height * 0.4); 
          push(); translate(width / 2, height * 0.65); fill(60, 40, 30); rect(-100, -40, 200, 70, 10); fill(80, 50, 40); rect(-100, 10, 200, 40, 10); fill(50, 30, 20); rect(-115, -10, 25, 50, 5); rect(90, -10, 25, 50, 5); pop();
          push(); translate(width / 2, height * 0.65 - 5); fill(30, 80, 180); rect(-10, 0, 20, 15, 4); rect(-10, 5, 20, 35, 4); stroke(15); strokeWeight(2); line(0, 5, 0, 40); noStroke(); fill(200, 30, 30); rect(-12, -32, 24, 35, 4); fill(235, 180, 140); ellipse(0, -40, 18, 18); fill(200, 30, 30); rect(-4, -28, 8, 20, 4); fill(235, 180, 140); ellipse(0, -5, 6, 6); pop();
          if (storyPhase === 1) { dadX += 2; if (dadX >= width / 2 - 80) storyPhase = 2; }
          push(); translate(dadX, height * 0.65 + 10); fill(80, 60, 40); rect(-10, -20, 20, 40, 4); stroke(15); strokeWeight(2); line(0, -20, 0, 20); noStroke(); fill(60, 120, 60); rect(-12, -50, 24, 35, 4); fill(235, 180, 140); ellipse(0, -60, 20, 20); fill(60, 40, 20); arc(0, -62, 22, 20, PI, TWO_PI, CHORD); fill(60, 120, 60); rect(-4, -45, 8, 25, 4); fill(235, 180, 140); ellipse(0, -15, 6, 6); pop();
          if (storyPhase === 2) { drawSpeechBubble(dadX + 10, height * 0.65 - 95, "Son. Its about time i\nshow you something."); }
      }
      else if (storyPhase >= 3) {
          background(40, 45, 50); fill(50, 55, 60); rect(0, height * 0.6, width, height * 0.4); 
          fill(100); rect(width/2 - 200, height*0.6 - 10, 150, 10); fill(70); rect(width/2 - 190, height*0.6, 10, 50); rect(width/2 - 70, height*0.6, 10, 50); fill(150); ellipse(width/2 - 150, height*0.6 - 15, 15, 15); ellipse(width/2 - 120, height*0.6 - 13, 10, 10); fill(60); rect(width/2 + 90, height*0.5 + 40, 140, 20); 
          push(); translate(width/2 - 160, height*0.6 - 35); fill(180); noStroke(); rect(-25, -15, 12, 30, 4); rect(-10, -15, 12, 30, 4); fill(100); rect(-13, -5, 3, 10); stroke(0, 200, 255); fill(0, 100, 255, 60); strokeWeight(2); beginShape(); vertex(10, -10); vertex(30, -10); vertex(35, 0); vertex(30, 20); vertex(10, 20); vertex(5, 0); endShape(CLOSE); pop();
          let dX = width / 2 - 30; let pX = width / 2 + 30;
          if (storyPhase === 18) { fill(0, 230); rect(0, 0, width, height); push(); translate(width/2, height/2 + 20); scale(6); fill(180); noStroke(); rect(-10, -15, 8, 30, 4); rect(2, -15, 8, 30, 4); fill(100); rect(-2, -5, 4, 10); pop(); fill(50, 255, 50); textAlign(CENTER); textSize(24); textFont('sans-serif'); text("JETPACK ACQUIRED", width/2, height/2 - 120); } 
          else if (storyPhase === 20) { fill(0, 230); rect(0, 0, width, height); push(); translate(width/2, height/2 + 20); scale(5); stroke(0, 200, 255); fill(0, 100, 255, 60); strokeWeight(2); beginShape(); vertex(-15, -15); vertex(15, -15); vertex(20, -5); vertex(15, 15); vertex(-15, 15); vertex(-20, -5); endShape(CLOSE); pop(); fill(50, 255, 50); textAlign(CENTER); textSize(24); textFont('sans-serif'); text("ETHERIC BODY FIELD ARMOR", width/2, height/2 - 120); } 
          else { 
              push(); translate(pX, height * 0.6 + 10); fill(30, 80, 180); rect(-10, -20, 20, 40, 4); stroke(15); strokeWeight(2); line(0, -20, 0, 20); noStroke(); fill(200, 30, 30); rect(-12, -50, 24, 35, 4); fill(235, 180, 140); ellipse(0, -60, 18, 18); fill(200, 30, 30); rect(-4, -45, 8, 25, 4); fill(235, 180, 140); ellipse(0, -15, 6, 6); pop(); 
              push(); translate(dX, height * 0.6 + 10); fill(80, 60, 40); rect(-10, -20, 20, 40, 4); stroke(15); strokeWeight(2); line(0, -20, 0, 20); noStroke(); fill(60, 120, 60); rect(-12, -50, 24, 35, 4); fill(235, 180, 140); ellipse(0, -60, 20, 20); fill(60, 40, 20); arc(0, -62, 22, 20, PI, TWO_PI, CHORD); fill(60, 120, 60); rect(-4, -45, 8, 25, 4); fill(235, 180, 140); ellipse(0, -15, 6, 6); pop(); 
              
              if (storyPhase === 3) { drawSpeechBubble(dX, height * 0.65 - 95, "Something really bad is about to happen,\nand i want you to be safe.\nEverything you thought you knew\nabout this world is a lie."); }
              else if (storyPhase === 4) { drawSpeechBubble(pX, height * 0.65 - 95, "Dont tell me the world is 3D..\nI cant stand 3D earthers..."); }
              else if (storyPhase === 5) { drawSpeechBubble(dX, height * 0.65 - 95, "....."); }
              else if (storyPhase === 6) { drawSpeechBubble(pX, height * 0.65 - 95, "For F***s sake...."); }
              else if (storyPhase === 7) { drawSpeechBubble(dX, height * 0.65 - 95, "There's no time, son. Listen;\ndo you remember in school when I taught you\nhow to bypass taking your daily dose\nof aluminum supplement?"); }
              else if (storyPhase === 8) { drawSpeechBubble(pX, height * 0.65 - 95, "Yeah; Stick the capsule under my tongue, then spit it\nin the toilet during my designated bathroom break.\nYou told me you didn't believe in the benefits....\neven though Stick Cities 'greatest' doctors recommend\nit to increase life span to atleast 60 years old!"); }
              else if (storyPhase === 9) { drawSpeechBubble(dX, height * 0.65 - 95, "Yeah well.. The truth is.\nThe average lifespan is retrograding.\nBack in the 2020's it was normal to live to 80 years old.\nSome people even past 100. I'm not supposed to\nbe telling you this, but you're my son.\nI need you to have a fighting chance."); }
              else if (storyPhase === 10) { drawSpeechBubble(pX, height * 0.65 - 95, "Fighting chance?"); }
              else if (storyPhase === 11) { drawSpeechBubble(dX, height * 0.65 - 95, "Today is the day NM-0 is activating their\nlow frequency psycho inducer.\nIn fact; its already happening.\nSince you have little to no metals in your body;\nyoure not effected. As I'm not."); }
              else if (storyPhase === 12) { drawSpeechBubble(pX, height * 0.65 - 95, "you didn't take the aluminum\nsupplement as a kid either?"); }
              else if (storyPhase === 13) { drawSpeechBubble(dX, height * 0.65 - 95, "How do you think I taught you the method?\n ..."); }
              else if (storyPhase === 14) { drawSpeechBubble(pX, height * 0.65 - 95, "Hmm.. Makes sense."); }
              else if (storyPhase === 15) { drawSpeechBubble(dX, height * 0.65 - 95, "All this being said; we need to leave this town.\nIt's turned into a hive mind.\nThey will kill anybody who isn't apart of it...\nwe have to head SOUTH..."); }
              else if (storyPhase === 16) { drawSpeechBubble(pX, height * 0.65 - 95, "but i thought there was nothing\noutside of Stick City?"); }
              else if (storyPhase === 17) { drawSpeechBubble(dX, height * 0.65 - 95, "I can't explain everything right now. We need to hurry.\nTake this, and put it on your back.\nIt will give you a boost fast enough to dodge a bullet!"); }
              else if (storyPhase === 19) { drawSpeechBubble(dX, height * 0.65 - 95, "and take this just in case you\nf***ed up dodging that bullet!"); }
              else if (storyPhase === 21) { drawSpeechBubble(pX, height * 0.65 - 95, "is this why you been training me at\na gun range my whole life?\nThat's all we ever do...."); }
              else if (storyPhase === 22) { drawSpeechBubble(dX, height * 0.65 - 95, "Just put on the gear; I'll explain more later.\nI haven't even told you about the alie-"); }
          }
           if (storyPhase >= 3 && storyPhase <= 22) { fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
      }
      return; 
  }
  let targetZoom = 0.65; 

  if (!isPaused) {
      if (killcamMode) {
        zoom = lerp(zoom, 1.8, 0.04); camX = lerp(camX, killcamTarget.x - (width / 2) / zoom, 0.08); camY = lerp(camY, killcamTarget.y - (height / 2) / zoom, 0.08); killcamTimer--;
        
        // KILLCAM TIMER FINISHED TRANSITION
        if (killcamTimer <= 0) { 
            killcamMode = false; 
            if (currentLevel === 0) { prologuePhase = 3; } 
            else if ((currentLevel === 1 || currentLevel === 2) && isStoryMode && !nm0AmbushActive) { 
                
                               let towersAlive = buildings.filter(b => b.isTower && b.hp > 0).length;

                if (towersAlive > 0 || window.genocideRouteActive) {
                    // GENOCIDE ROUTE (Towers not destroyed)
                    window.genocideAmbushCleared = true; 
                    
                    if (currentLevel === 1 && window.northGateBreachedStatus && !window.nm0HqCleared) {
                        streakMsgText = "NORTH GATE UNLOCKED";
                    } else {
                        streakMsgText = "AREA CLEARED. INVESTIGATE THE FORTRESS.";
                    }
                    streakMsgTimer = 180;
                    camX = player.x - (width / 2) / zoom;
                    camY = player.y - (height / 2) / zoom;
                } else {
                    // SAVIOR ROUTE (Towers destroyed, Ambush cleared)

                    window.towersDefeated = true;
                    inTownCutscene = true; townPhase = 1; townTimer = 120;
                    let candidates = enemiesList.filter(e => e.eType === "NORMAL" || e.eType === "FEMALE_PISTOL" || e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "MOLOTOV");
                    for(let e of candidates) { e.isFriendly = true; e.state = "IDLE"; e.hp = 300; globalPopulation++; }
                    townSpeaker1 = candidates.length > 0 ? candidates[0] : player; 
                    townSpeaker2 = candidates.length > 1 ? candidates[1] : townSpeaker1; 
                    killcamTarget = {x: townSpeaker1.x, y: townSpeaker1.y};
                }
            } else if (window.farmAmbushCleared) {
    window.farmAmbushCleared = false;
    inFarmPostCutscene = true;
    farmPostPhase = 1;

    // FIX 1: Explicitly check for Farmer types in case the 'isFriendly' flag dropped during the ambush
    window.allies = enemiesList.filter(e => 
        (e.isFriendly || e.eType === "FARMER_MALE" || e.eType === "FARMER_FEMALE") 
        && e.hp > 0 
        && !e.dead
    );

    // Fallback if none survived
    if (window.allies.length === 0) {
        let f = new Character(player.x + 80, player.y, false, "FARMER_MALE");
        f.isFriendly = true; 
        enemiesList.push(f);
        window.allies.push(f);
    }

    // FIX 2: Force all captured allies to be friendly so they don't get purged or targeted
    window.allies.forEach(a => a.isFriendly = true);

    farmSpeaker = window.allies[0];

    // FIX 3: Explicitly bind these to window so your global UI and level transitions can read them
   popTotal = (window.militaryToBring || 0) + window.allies.length;
popUnassigned = popTotal;
popMilitary = 0;
popFarming = 0;
popScience = 0;
popArchitecture = 0;

    player.x = farmSpeaker.x + 50;
    player.y = farmSpeaker.y + 50;
    camX = player.x - (width / 2) / zoom;
    camY = player.y - (height / 2) / zoom;
    player.aimAngle = atan2(farmSpeaker.y - player.y, farmSpeaker.x - player.x);
    emit(player.x, player.y, 20, color(0, 200, 255), "SPARK"); 
    sfx.dash();


            

            } else if (window.nm0AmbushCleared) {
        // CLEAR AMBUSH FLAGS
        window.nm0AmbushCleared = false;
        nm0AmbushActive = false;
        window.nm0AmbushClearedStatus = true;

        let towersAlive = buildings.filter(b => b.isTower && b.hp > 0).length;

        if (towersAlive > 0 || window.genocideRouteActive) {
            // GENOCIDE ROUTE (Towers not destroyed)
            window.genocideAmbushCleared = true;
            
            if (currentLevel === 1 && window.northGateBreachedStatus && !window.nm0HqCleared) {
                streakMsgText = "NORTH GATE UNLOCKED";
                streakMsgTimer = 180;
                camX = player.x - (width / 2) / zoom;
                camY = player.y - (height / 2) / zoom;
            } else {
                // Trigger Government Directive
                popTotal = window.militaryToBring || 0; 
                viewingTownId = currentLevel;
                if (!townsData[currentLevel]) townsData[currentLevel] = {established: false};
                inWorldBuildingMenu = true; 
            }
        } else {
            // SAVIOR ROUTE (Towers destroyed, Ambush cleared)
            inPostAmbushCutscene = true;
            postAmbushPhase = 1;

            // Using window.allies makes it globally permanent so it survives into the next frames
            window.allies = enemiesList.filter(e => e.isFriendly && e.hp > 0 && !e.dead);
            popTotal = window.allies.length;

            // Ensure minimum population for the cutscene
            if (popTotal < 2) {
                let allyType = (currentLevel === 2 && isStoryMode) ? "FEMALE_PISTOL" : "NORMAL";
                let a1 = new Character(player.x + 80, player.y, false, allyType); a1.isFriendly = true; enemiesList.push(a1);
                let a2 = new Character(player.x - 80, player.y, false, allyType); a2.isFriendly = true; enemiesList.push(a2);
                window.allies.push(a1, a2);
                popTotal = window.allies.length;
            }

            popUnassigned = popTotal;
            popMilitary = 0; popFarming = 0; popScience = 0; popArchitecture = 0; 

            window.allies.sort((a,b) => dist(player.x, player.y, a.x, a.y) - dist(player.x, player.y, b.x, b.y));
            townSpeaker1 = window.allies[0];
            townSpeaker2 = window.allies[1];

            player.x = townSpeaker1.x + 50;
            player.y = townSpeaker1.y + 50;
            camX = player.x - (width / 2) / zoom;
            camY = player.y - (height / 2) / zoom;
            player.aimAngle = atan2(townSpeaker1.y - player.y, townSpeaker1.x - player.x);
            emit(player.x, player.y, 20, color(0, 200, 255), "SPARK"); sfx.dash();
        }


    // STANDARD LEVEL FINISH FALLBACK
    } else if (isStoryMode && currentLevel >= 1 && currentLevel <= 4) {
        let survivingAllies = enemiesList.filter(e => e.isFriendly && e.hp > 0 && !e.dead);
        popTotal = (window.militaryToBring || 0) + survivingAllies.length;
        popUnassigned = popTotal;
        popMilitary = 0; popFarming = 0; popScience = 0; popArchitecture = 0;
        
        viewingTownId = currentLevel;
        if (!townsData[currentLevel]) townsData[currentLevel] = {established: false};
        
        inWorldBuildingMenu = true;
    } else if (inTownCutscene || inFarmCutscene || inFarmPostCutscene || inPostAmbushCutscene || inWorldBuildingMenu) {
    
    // Only run the camera lerp for the specific cutscenes that need it
    
    

    } else {
        isWin = true;
        winTimer = 1;
    }
        }
} else {
    // OVERRIDE FOR CUTSCENES
    if (inTownCutscene || inFarmCutscene || inFarmPostCutscene) {
        zoom = lerp(zoom, 1.4, 0.05); 
        camX = lerp(camX, killcamTarget.x - (width / 2) / zoom, 0.08); 
        camY = lerp(camY, killcamTarget.y - (height / 2) / zoom, 0.08);
    } else {
        // NORMAL WALKING CAMERA
        zoom = lerp(zoom, inOverworldView ? 0.45 : targetZoom, 0.1); 
        if (window.currentPan === undefined) window.currentPan = 0;

        let targetPan = rightStick.active ? (150 * rightStick.dist) : 0; 
        window.currentPan = lerp(window.currentPan, targetPan, 0.1);
        
        let targetCamX = player.x + cos(player.aimAngle) * window.currentPan;
        let targetCamY = player.y + sin(player.aimAngle) * window.currentPan;
        
        camX = lerp(camX, targetCamX - (width / 2) / zoom, 0.08); 
        camY = lerp(camY, targetCamY - (height / 2) / zoom, 0.08);
    }
}

}
doTick = (!killcamMode || (frameCount % 4 === 0)) && !isPaused && !inDarchonCall && !inTownCutscene && !inFarmCutscene && !inFarmPostCutscene && !inPostAmbushCutscene; 
viewLeft = camX; 
viewRight = camX + width / zoom; 
viewTop = camY; 
viewBottom = camY + height / zoom;


  // Level 8 Door Unlock Check
  if (currentLevel === 8 && !window.nm0HqCleared && totalKills >= 20) {
      window.nm0HqCleared = true;
      streakMsgText = "DOOR UNLOCKED";
      streakMsgTimer = 120;
      sfx.charge();
  }

  updateActiveWorld();
  manageChunkMemory();
  updateProductionMeters();
  if (currentLevel === 1) background(45, 110, 45); 
  else if (currentLevel === 2) background(20, 25, 40); 
  else if (currentLevel === 3) background(210, 180, 140); 
  else if (currentLevel === 4) background(60, 90, 40); 
  else if (currentLevel === 5) background(190, 220, 235); 
  else if (currentLevel === 6) background(30, 20, 40); 
  else if (currentLevel === 7) background(245, 245, 220);
  else if (currentLevel === 8) background(40, 42, 45); // NM-0 HQ Interior
  
  push(); scale(zoom); translate(-camX, -camY);
  if (screenShake > 0) { translate(random(-screenShake, screenShake), random(-screenShake, screenShake)); screenShake *= 0.85; }
 
  // RENDER MASTER LAYER
  drawGround(); 
  drawBuildingPads(); 
  for (let b of activeBuildings) {
      if (!inView(b.x, b.y, Math.max(b.w || 0, b.h || 0) + 150)) continue; 
      if (b.isPond) {
          fill(60, 130, 200, 220); noStroke(); push(); translate(b.x, b.y); beginShape(); for (let a = 0; a < TWO_PI; a += 0.5) { let r = (b.w / 2) + sin(a * 3 + frameCount * 0.05) * 15; vertex(cos(a) * r, sin(a) * r); } endShape(CLOSE); pop();
      } else if (b.isParkingLot) {
          fill(70, 75, 80); noStroke(); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 10); strokeWeight(3); 
          let spotW = 100, spotH = 65, aisleW = 80;
          for (let px = b.x - b.w/2 + 40; px < b.x + b.w/2 - (spotW*2 + aisleW); px += (spotW*2 + aisleW)) {
              stroke(255, 200, 0, 180); 
              for (let py = b.y - b.h/2 + 30; py < b.y + b.h/2 - 30; py += spotH) { line(px, py, px + spotW, py); line(px + spotW + aisleW, py, px + spotW * 2 + aisleW, py); }
          }
      } else if (b.isCropField) {
          fill(140, 110, 70); noStroke(); rect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 10);
          stroke(80, 120, 40); strokeWeight(8);
          for(let py = b.y - b.h/2 + 20; py < b.y + b.h/2; py += 30) line(b.x - b.w/2 + 10, py, b.x + b.w/2 - 10, py);
      }
  }
  drawBloodChunks();

  if (typeof updateSludges === 'function') updateSludges(); 
  if (typeof updateWaterPuddles === 'function') updateWaterPuddles(); 
  updateCorpses(); 

  // PROLOGUE CUTSCENE (LEVEL 0)
    if (currentLevel === 0 && prologuePhase === 1) {
      leftStick.active = false; rightStick.active = false; leftStick.dx = 0; leftStick.dy = 0; rightStick.dx = 0; rightStick.dy = 0; meleeInputHeld = false; cannonInputHeld = false; prologueTimer--; 
      
      let agents = enemiesList.filter(e => e.eType === "SIA"); 
      
      // FAILSAFE: If map boundaries deleted them, force one in so the cutscene doesn't break
      if (agents.length === 0 && prologueTimer > 0) {
          let backup = new Character(dadEntity.x, dadEntity.y + 80, false, "SIA");
          enemiesList.push(backup);
          agents.push(backup);
      }

      let shooter = null;
      if (agents.length > 0 && dadEntity) { 
          let minDist = Infinity; 
          for (let a of agents) { 
              let d = dist(a.x, a.y, dadEntity.x, dadEntity.y); 
              if (d < minDist) { minDist = d; shooter = a; } 
          } 
      }

      if (prologueTimer > 60) { 
          for (let a of agents) { 
              a.isMoving = true; a.walkCycle += 0.2; 
              // PATHFINDING: Walk directly to the dad instead of blindly into walls
              let ang = atan2(dadEntity.y - a.y, dadEntity.x - a.x);
              a.aimAngle = ang; a.moveAngle = ang;
              if (dist(a.x, a.y, dadEntity.x, dadEntity.y) > 45) {
                  a.x += cos(ang) * 4.5;
                  a.y += sin(ang) * 4.5;
              }
          } 
      } else if (prologueTimer > 0) { 
          for (let a of agents) { 
              a.isMoving = false; 
              if (a === shooter && dadEntity) { 
                  a.aimAngle = atan2(dadEntity.y - a.y, dadEntity.x - a.x); 
              } else { 
                  a.aimAngle = -HALF_PI; 
              } 
          } 
      } else if (prologueTimer <= 0 && prologueTimer > -40) { // CATCH-ALL: Prevent frame skips from bypassing the 0 frame
          if (shooter && dadEntity && !dadEntity.dead) {
              let a = atan2(dadEntity.y - shooter.y, dadEntity.x - shooter.x); shooter.aimAngle = a; let bLX = 31, bLY = 8; let tX = shooter.x + cos(a) * bLX - sin(a) * bLY; let tY = shooter.y + sin(a) * bLX + cos(a) * bLY;
              sfx.shoot(); shooter.muzzleFlash = 3; emit(tX, tY, 3, color(255, 200, 0), "MUZZLE", cos(a) * 5, sin(a) * 5); spawnBullet(tX, tY, a, false, "HEAD", WEAPONS.PISTOL); 
              dadEntity.dead = true; dadEntity.hp = 0; sfx.hitHead(); sfx.deathGrunt(); 
              let bCol = color(90, 0, 0); emit(dadEntity.x, dadEntity.y, 15, color(220, 200, 200), "BONE", cos(a)*10, sin(a)*10); emit(dadEntity.x, dadEntity.y, 40, bCol, "GORE"); 
              
              if (typeof headshotCounter === 'undefined') window.headshotCounter = 0; // Prevent crash if uninitialized
              let choices = [1, 8, 9]; let dT = choices[headshotCounter % 3]; headshotCounter++; 
              corpses.push(new Corpse(dadEntity.x, dadEntity.y, dadEntity.moveAngle, dadEntity.aimAngle, dadEntity.shirtCol, dadEntity.pantsCol, dT, a, dadEntity.decals, dadEntity.currentWeapon, a, "DAD", dadEntity.bodyW, dadEntity.bodyH)); 
              spawnSplatter(dadEntity.x, dadEntity.y, "BLOOD", bCol); 
              
              let eI = enemiesList.indexOf(dadEntity); if (eI > -1) enemiesList.splice(eI, 1);
          }
      } else if (prologueTimer <= -40) { prologuePhase = 2; }
  }
 if (currentLevel === 0 && prologuePhase === 2) {
    let remainingSIA = enemiesList.filter(e => e.eType === "SIA");
    if (remainingSIA.length === 0 && !killcamMode) {
        // Trigger your killcam on the final enemy or general room clear
        killcamMode = true;
        killcamTimer = 90; // Adjust duration as needed
    }
}


  if (currentLevel === 0 && prologuePhase === 3) {
      leftStick.active = false; rightStick.active = false; leftStick.dx = 0; leftStick.dy = 0; rightStick.dx = 0; rightStick.dy = 0; meleeInputHeld = false; cannonInputHeld = false;
      let dToDad = dist(player.x, player.y, dadEntity.x, dadEntity.y);
      if (dToDad > 40) { let ang = atan2(dadEntity.y - player.y, dadEntity.x - player.x); player.isMoving = true; player.walkCycle += 0.2; player.moveAngle = ang; player.aimAngle = ang; let dx = cos(ang) * 4; let dy = sin(ang) * 4; if (!player.checkCol(player.x + dx, player.y)) player.x += dx; if (!player.checkCol(player.x, player.y + dy)) player.y += dy; } else { player.isMoving = false; prologuePhase = 4;  }
  }

   if (player.hp > 0) { if (!isWin && doTick) player.updatePlayer(); player.show(); } else if (!isWin && !isDead) { playerRespawnTimer--; if (playerRespawnTimer <= 0) { isDead = true; } }
  updateEntities(); 

  // Draw civilians ALWAYS, so they populate the town while you run around
  for (let c of townCitizens) {
      if (doTick) c.update();
      c.show();
  }
  
  if (typeof drawBuildingShadows === 'function') drawBuildingShadows(); 

  
  if (inOverworldView) {
      for (let c of townCitizens) {
          if (doTick) c.update();
          c.show();
      }
  }
  
  if (typeof drawBuildingShadows === 'function') drawBuildingShadows(); 
  drawBuildings(); 
  
    // NM-0 HQ Custom Level Props
  if (currentLevel === 8) {
      // Draw the locked door at 0, -800
      fill(window.nm0HqCleared ? color(50, 255, 50) : color(255, 50, 50));
      stroke(20); strokeWeight(4);
      rect(-100, -820, 200, 40);
      
      // --- NEW: Draw Exit Door at 0, 1450 ---
      fill(0, 200, 255);
      stroke(20); strokeWeight(4);
      rect(-100, 1450, 200, 50);
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(20); textFont('sans-serif'); text("EXIT", 0, 1475);
      
      // Draw Blueprint on table in secret room at 0, -2000
      if (!window.armorBlueprintPickedUp && inView(0, -2000, 100)) {
          push(); translate(0, -2000);
          fill(80, 50, 30); stroke(50, 30, 10); strokeWeight(4); rect(-40, -30, 80, 60, 5); // Table
          rotate(0.2);
          fill(30, 80, 180); stroke(200); strokeWeight(1); rect(-12, -18, 24, 36, 2); 
          stroke(255, 255, 255, 100); strokeWeight(0.5);
          for(let i = -8; i <= 8; i += 4) { line(i, -16, i, 16); }
          for(let i = -14; i <= 14; i += 4) { line(-10, i, 10, i); }
          fill(255, 150, 0); noStroke(); ellipse(0, 0, 8, 8); rect(-4, 0, 8, 6); 
          pop();
      }
  }


  if (typeof drawParkingCars === 'function') drawParkingCars();

  if (currentLevel === 0) {
      if (!inUpstairsRoom) {
          fill(80, 50, 30); rect(-400, -40, 20, 80); fill(200, 200, 100); ellipse(-385, 10, 6, 6); 
          if (!tabletPickedUp) { push(); translate(200, -100); rotate(0.2); fill(30); rect(-6, -9, 12, 18, 2); fill(0, 150, 255); rect(-5, -7, 10, 14, 1); fill(255); ellipse(0, 5, 2, 2); pop(); }
      } else {
          if (!swordPickedUp) { push(); translate(150, -20); rotate(PI/4); fill(150); rect(-2, -15, 4, 25); fill(200, 150, 0); rect(-6, 5, 12, 4); fill(50); rect(-2, 9, 4, 8); pop(); }
          fill(255); textAlign(CENTER, CENTER); textSize(14); text("EXIT", 0, 290);
      }
  }

  if (typeof updateWeaponDrops === 'function') updateWeaponDrops(); 
  if (typeof updateHealthPacks === 'function') updateHealthPacks(); 
  if (typeof updateGrenadePickups === 'function') updateGrenadePickups();
  for (let i = barrels.length - 1; i >= 0; i--) {
    let b = barrels[i]; if (inView(b.x, b.y, 50)) { fill(200, 30, 30); stroke(100, 0, 0); strokeWeight(2); ellipse(b.x, b.y, 24, 24); fill(40); noStroke(); ellipse(b.x, b.y, 16, 16); fill(255, 70); noStroke(); ellipse(b.x - 4, b.y - 4, 8, 8); }
    if (b.hp <= 0) { triggerExplosion(b.x, b.y, 160); barrels.splice(i, 1); }
  }

  if (typeof updateFires === 'function') updateFires();
  updateBullets(); updateGrenades(); if (typeof updatePlayerGrenades === 'function') updatePlayerGrenades(); if (typeof updatePlayerFlasks === 'function') updatePlayerFlasks(); updateParticles(); if (typeof updateLightnings === 'function') updateLightnings(); updateOrbs(); if (typeof updateShockwaves === 'function') updateShockwaves();
  pop(); 
 

  // SCREEN UI
  let inCutscene = inTownCutscene || inDarchonCall;
  if (currentLevel === 0) {
      inCutscene = (prologuePhase === 1 || prologuePhase === 3 || (prologuePhase >= 4 && prologuePhase <= 6) || prologuePhase === 8 || prologuePhase === 9) || (inUpstairsRoom && (upstairsPhase >= 1 && upstairsPhase <= 5));
      if (inCutscene) { fill(0); noStroke(); rect(0, 0, width, height * 0.12); rect(0, height - (height * 0.12), width, height * 0.12); leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false; }
      if (prologuePhase >= 4 && prologuePhase <= 6) { let pxScreen = width/2; if (prologuePhase === 4) drawSpeechBubble(pxScreen, height/2 - 80, "Dad! Noooo!"); if (prologuePhase === 5) drawSpeechBubble(pxScreen, height/2 - 80, "....................."); if (prologuePhase === 6) drawSpeechBubble(pxScreen, height/2 - 80, "i need to see if theres anything\ni can gather here before i head out."); fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
      if (prologuePhase === 8) { fill(0, 200); rect(0, 0, width, height); push(); translate(width/2, height/2 + 20); scale(6); fill(30); rect(-15, -20, 30, 40, 3); fill(0, 150, 255, 100); stroke(0, 255, 255); strokeWeight(1); rect(-12, -17, 24, 34, 1); fill(0, 255, 100); noStroke(); ellipse(-4, -5, 8, 8); stroke(0, 255, 100); strokeWeight(1); noFill(); beginShape(); vertex(-4, -5); vertex(0, 5); vertex(6, 12); endShape(); pop(); fill(50, 255, 50); textAlign(CENTER); textSize(24); textFont('sans-serif'); text("ACQUIRED: DADS TOP SECRET TABLET", width/2, height/2 - 140); fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
      if (prologuePhase === 9) { drawSpeechBubble(width/2, height/2 - 100, "It looks like he left it on.... Theres a map\ndepicting a path south. Stick city looks so small,\nand when i scroll down theres tons of other land\nive never seen in my history books..\nMaybe this is where dad was gonna take us.\nSeems like i have no other option but to find out."); fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
      if (inUpstairsRoom) {
          let pxScreen = width/2;
          if (upstairsPhase === 1) { fill(0, 200); rect(0, 0, width, height); push(); translate(width/2, height/2); scale(6); fill(150); rect(-2, -20, 4, 30); fill(200, 150, 0); rect(-8, 5, 16, 4); fill(50); rect(-2, 9, 4, 10); pop(); fill(50, 255, 50); textAlign(CENTER); textSize(24); textFont('sans-serif'); text("SWORD ACQUIRED", width/2, height/2 - 140); fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
          if (upstairsPhase === 2) { drawSpeechBubble(pxScreen, height/2 - 80, "Guess id better bring this too.\nNever thought id have to actually use it"); fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
          if (upstairsPhase === 3 || upstairsPhase === 4) { fill(0); rect(0, 0, width, height); fill(30, 30, 80); rect(0, height/2 - 100, width, 200); fill(255, 255, 0, 50); textSize(100); textAlign(CENTER, CENTER); text("COX NEWS", width/2, height/2); push(); translate(width/2 - 150, height/2 + 50); fill(200, 0, 0); rect(-30, -50, 60, 100, 10); fill(235, 180, 140); ellipse(0, -70, 40, 40); pop(); push(); translate(width/2 + 150, height/2 + 50); fill(0, 0, 200); rect(-30, -50, 60, 100, 10); fill(235, 180, 140); ellipse(0, -70, 40, 40); pop(); fill(50); rect(width/2 - 300, height/2 + 50, 600, 100); if (upstairsPhase === 3) drawSpeechBubble(width/2 - 150, height/2 - 120, "This is Brian Lion with COX NEWS giving you a live update.\nIf you hear gunshots outside; Make a round\nof applause for another traitor killed!"); else drawSpeechBubble(width/2 + 150, height/2 - 120, "Absolutely. One mind, one city, ONE way to be!\nWhen traitor dead a day keeps the city safe."); fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
          if (upstairsPhase === 5) { drawSpeechBubble(pxScreen, height/2 - 100, "Well Dad definitely wasnt losing his mind..\nSeems like when i step out there its gonna be chaos.\nHopefully this magnetic field suit or whatever\nworks like dad said it would..."); fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
          if (upstairsPhase === 0) { if (!swordPickedUp && dist(player.x, player.y, 150, 0) < 80) drawPromptBtn("PICK UP"); else if (!tvWatched && dist(player.x, player.y, 0, -200) < 120) drawPromptBtn("WATCH"); else if (dist(player.x, player.y, 0, 250) < 80) drawPromptBtn("LEAVE HOUSE"); }
      } else {
          if (prologuePhase === 7 && !tabletPickedUp && dist(player.x, player.y, 200, -100) < 80) drawPromptBtn("PICK UP"); else if (prologuePhase >= 10 && dist(player.x, player.y, -400, 0) < 80) drawPromptBtn("OPEN DOOR");
      }
  }

// --- LEVEL 3: FARM CUTSCENE ---
  if (inFarmCutscene) {
      // 1. UPDATE LOGIC (World Space)
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;

      if (farmSpeaker) {
          killcamTarget = {x: farmSpeaker.x, y: farmSpeaker.y};
          farmSpeaker.isMoving = false;
          farmSpeaker.walkCycle = 0;
          player.isMoving = false;

          // Lock orientation immediately
          let ang = atan2(farmSpeaker.y - player.y, farmSpeaker.x - player.x);
          farmSpeaker.aimAngle = atan2(player.y - farmSpeaker.y, player.x - farmSpeaker.x);
          player.aimAngle = ang;

          // Instantly jump to the first talking point
          if (farmPhase <= 1) {
              farmPhase = 2; 
          }
      }

      // 2. RENDERING (Screen Space / UI Layer)
      push(); // Isolate drawing settings
      resetMatrix(); // Temporarily disable camera translations so UI draws on the actual screen

      fill(0); noStroke(); 
      rect(0, 0, width, height * 0.12); 
      rect(0, height - (height * 0.12), width, height * 0.12);

      if (farmSpeaker) {
          if (farmPhase === 2) {
              drawSpeechBubble(width/2, height/2 - 100, "Howdy traveler! We dont normally get strangers\nround here. What brings you to the Anveda farm?");
              fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
          } else if (farmPhase === 3) {
              drawMenuBtn("A) Id like to learn about your farm.", width/2, height/2 - 40, 320, 50);
              drawMenuBtn("B) You have ten seconds to run away, or get smoked.", width/2, height/2 + 40, 420, 50);
          } else if (farmPhase === 4) {
              drawSpeechBubble(width/2, height/2 - 100, "Sure thing. That is; if you will first help me\nget rid of this pest infestation.\nThey keep biting up my cows, and tearing my crops up.");
              fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
          } else if (farmPhase === 5) {
              drawMenuBtn("YES", width/2 - 80, height/2 + 40, 100, 50);
              drawMenuBtn("NO", width/2 + 80, height/2 + 40, 100, 50);
          }
      }
      
      pop(); // Restore the camera/matrix for the rest of the game loop
  }


  // --- LEVEL 3: POST-FARM CUTSCENE ---
  if (inFarmPostCutscene) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0); noStroke(); rect(0, 0, width, height * 0.12); rect(0, height - (height * 0.12), width, height * 0.12);
      
      if (farmSpeaker) {
          killcamTarget = {x: farmSpeaker.x, y: farmSpeaker.y};
      }

      if (farmPostPhase === 1) {
          drawSpeechBubble(width / 2, height / 2 - 80, "Wow youre great help! As promised;\nhere's for helpin' me out!");
          fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
      } else if (farmPostPhase === 2) {
          fill(0, 230); rect(0, 0, width, height); // Dark overlay
          
          push(); translate(width/2, height/2 + 20); scale(6);
          fill(30, 80, 180); stroke(200); strokeWeight(1); rect(-12, -18, 24, 36, 2); 
          stroke(255, 255, 255, 100); strokeWeight(0.5);
          for(let i = -8; i <= 8; i += 4) { line(i, -16, i, 16); }
          for(let i = -14; i <= 14; i += 4) { line(-10, i, 10, i); }
          fill(255); noStroke(); ellipse(0, 0, 8, 8); rect(-4, 0, 8, 6); 
          pop();

          fill(50, 255, 50); textAlign(CENTER); textSize(24); textFont('sans-serif');
          text("FARMERS BLUEPRINT LVL 1", width/2, height/2 - 140);
          fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
      }
  }
  // --- LEVEL 4: ALLIANCE CUTSCENE ---
  if (inLvl4Cutscene) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0); noStroke(); rect(0, 0, width, height * 0.12); rect(0, height - (height * 0.12), width, height * 0.12);

      // Pan camera to overworld height to see the armies
      zoom = lerp(zoom, 0.45, 0.05); 
      let midY = (player.y + tanLeader.y) / 2;
      camX = lerp(camX, player.x - (width / 2) / zoom, 0.08); 
      camY = lerp(camY, midY - (height / 2) / zoom, 0.08);

      if (lvl4Phase === 1) {
          lvl4Timer--;
          if (lvl4Timer <= 0) {
              if (tanLeader.y < player.y - 300) {
                  tanLeader.isMoving = true; tanLeader.walkCycle += 0.2;
                  tanLeader.y += 2;
              } else {
                  tanLeader.isMoving = false;
                  lvl4Phase = 2;
              }
          }
      } else if (lvl4Phase === 2) {
          if (player.y > tanLeader.y + 150) {
              player.isMoving = true; player.walkCycle += 0.2;
              player.y -= 3;
              player.aimAngle = -HALF_PI;
              player.moveAngle = -HALF_PI;
          } else {
              player.isMoving = false;
              lvl4Phase = 3;
          }
      } else if (lvl4Phase === 3) {
          tanLeader.aimAngle = atan2(player.y - tanLeader.y, player.x - tanLeader.x); // Point rifle
          drawSpeechBubble(width/2, height/2 - 120, "Name your cause, and branch.");
          fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
      } else if (lvl4Phase === 4) {
          tanLeader.aimAngle = atan2(player.y - tanLeader.y, player.x - tanLeader.x);
          drawMenuBtn("A) Me and my private military would like to form an alliance with you. We come in peace.", width/2, height/2 - 40, 640, 50);
          drawMenuBtn("B) I dont know what any of that is, but i own this town now.", width/2, height/2 + 40, 480, 50);
      } else if (lvl4Phase === 5) {
          drawSpeechBubble(width/2, height/2 - 120, "Well i got good news, and bad news. The good news is; we're open to an alliance.\nThe bad news is; its not about to be peaceful too long.\nIntel says the enemy is planning an attack nearby any minute now. Come follow me!");
          fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
      }
  }

  // NM-0 SECRET BLUEPRINT OVERLAY
  if (window.inNM0SecretOverlay) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0, 230); rect(0, 0, width, height); 
      push(); translate(width/2, height/2 + 20); scale(6);
      fill(30, 80, 180); stroke(200); strokeWeight(1); rect(-12, -18, 24, 36, 2); 
      stroke(255, 255, 255, 100); strokeWeight(0.5);
      for(let i = -8; i <= 8; i += 4) { line(i, -16, i, 16); }
      for(let i = -14; i <= 14; i += 4) { line(-10, i, 10, i); }
      fill(255, 150, 0); noStroke(); ellipse(0, 0, 8, 8); rect(-4, 0, 8, 6); 
      pop();
      fill(50, 255, 50); textAlign(CENTER); textSize(24); textFont('sans-serif');
      text("EXPLOSIVE ARMOR ACQUIRED", width/2, height/2 - 140);
      fill(255); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
  }

  // TOWER DEFEAT / NM0 AMBUSH CUTSCENE LOGIC
  if (inTownCutscene) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0); noStroke(); rect(0, 0, width, height * 0.12); rect(0, height - (height * 0.12), width, height * 0.12);
      if (townPhase === 1) { townTimer--; if (townTimer <= 0) townPhase = 2; } 
      else if (townPhase === 2) {
          let ang = atan2(player.y - townSpeaker1.y, player.x - townSpeaker1.x);
          player.x = townSpeaker1.x + cos(ang) * 70;
          player.y = townSpeaker1.y + sin(ang) * 70;
          player.aimAngle = atan2(townSpeaker1.y - player.y, townSpeaker1.x - player.x);
          emit(player.x, player.y, 20, color(0, 200, 255), "SPARK"); sfx.dash();
          player.isMoving = false; townPhase = 3; 
      } else if (townPhase === 3) { drawSpeechBubble(width/2, height/2 - 100, "it was the towers! As soon as they went down,\nyou guys got your wits back about you."); } 
      else if (townPhase === 4) { killcamTarget = {x: townSpeaker1.x, y: townSpeaker1.y}; drawSpeechBubble(width/2, height/2 - 100, "well now that i think about it,\ni never really felt the same once they\nput those towers up 28 years ago.."); } 
      else if (townPhase === 5) { killcamTarget = {x: townSpeaker2.x, y: townSpeaker2.y}; drawSpeechBubble(width/2, height/2 - 100, "you aint kidding.\nFeels like i aged 40 years in one day."); } 
      else if (townPhase === 6) { 
          let spawnY = (currentLevel === 1) ? 4600 : 1600;
          killcamTarget = {x: 600, y: spawnY}; 
          townTimer--; 
          if (townTimer <= -60) townPhase = 7; 
          
      } 
       else if (townPhase === 7) {
          let spawnY = (currentLevel === 1) ? 4950 : 1800;
          let aerY = (currentLevel === 1) ? 4900 : 1750;
          let spawnX1 = 600;  
          let spawnX2 = -200; 
          
          for(let i=0; i<42; i++) enemiesList.push(new Character(spawnX1 + random(-250, 250), spawnY + random(-50, 50), false, "ARMORED_STANDARD"));
          for(let i=0; i<4; i++) enemiesList.push(new Character(spawnX1 + random(-100, 100), spawnY + random(-50, 50), false, "ARMORED"));
          for(let i=0; i<4; i++) enemiesList.push(new Character(spawnX1 + random(-300, 300), aerY, false, "AERIAL"));

                   for(let i=0; i<42; i++) enemiesList.push(new Character(spawnX2 + random(-250, 250), spawnY + random(-50, 50), false, "ARMORED_STANDARD"));
          for(let i=0; i<4; i++) enemiesList.push(new Character(spawnX2 + random(-100, 100), spawnY + random(-50, 50), false, "ARMORED"));
          for(let i=0; i<4; i++) enemiesList.push(new Character(spawnX2 + random(-300, 300), aerY, false, "AERIAL"));

          // Tag the 100 enemies we just spawned!
          for(let i = enemiesList.length - 100; i < enemiesList.length; i++) {
              if (enemiesList[i]) enemiesList[i].isAmbush = true;
          }

         

          
          // MERGE ACTIVE AMBUSHES (Scenario 4)
          if (nm0AmbushActive) {
              nm0AmbushKills += 300; 
              window.ambushSpawnsRemaining += 200;
              streakMsgText = "MULTIPLE AMBUSHES!"; 
          } else {
              nm0AmbushActive = true; 
              nm0AmbushKills = 300; 
              window.ambushSpawnsRemaining = 200; 
              streakMsgText = "NM-0 AMBUSH!"; 
          }

          inTownCutscene = false; 
          objectiveTimer = 360; 
          streakMsgTimer = 120;
          
          for (let e of enemiesList) { 
              if (!e.isFriendly) { e.state = "CHASE"; e.loseSightTimer = 999; } 
          }
      }

      if (townPhase >= 3 && townPhase <= 5) { fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
  }

  if (inDarchonCall) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0); noStroke(); rect(0, 0, width, height * 0.12); rect(0, height - (height * 0.12), width, height * 0.12);
      
      let pxScreen = width / 2; let hY = height / 2 - 80;
      
      if (callPhase === 1) drawSpeechBubble(pxScreen, hY, "[TABLET] DONT LEAVE YOUR HOUSE!");
      else if (callPhase === 2) { push(); fill(200); textSize(12); textFont('sans-serif'); textAlign(CENTER, BOTTOM); text("*whispers* Hes already dead you idiot", pxScreen, hY - 45); pop(); }
      else if (callPhase === 3) drawSpeechBubble(pxScreen, hY, "[TABLET] *Ahem*.. Hey, sonny! \nWas just calling to check in;\nthis is his work tablet dont you know?");
      else if (callPhase === 4) drawSpeechBubble(pxScreen, hY, "Some blue suits \n kicked our door down, and murdered him.... \n Stick City has gone crazy..");
      else if (callPhase === 5) drawSpeechBubble(pxScreen, hY, "[TABLET] Ive heard! I thought he wouldve lasted longer\nwith that fancy suit of his and all!\nIt was a one of a kind prototype; near perfect!\nGuess it wasnt good enough..");
      else if (callPhase === 6) drawSpeechBubble(pxScreen, hY, "You almost sound happy.. \n You're his work friend?");
      else if (callPhase === 7) drawSpeechBubble(pxScreen, hY, "[TABLET] I am. \n Your father was like a brother to me. My name is Darchon,\nand all that killing your doin;\nits getting tracked on that high tech tablet\nyou inherited from your father.");
      else if (callPhase === 8) drawSpeechBubble(pxScreen, hY, "Well i mean they were shooting first..");
      else if (callPhase === 9) drawSpeechBubble(pxScreen, hY, "[TABLET] Ha! You think i want to send you to jail?\nCome on im your dads friend.\nThe world has gone crazy. \n Im here to help.");
      else if (callPhase === 10) drawSpeechBubble(pxScreen, hY, "Can you get on with what this is about..\nI kinda need to get moving here");
      else if (callPhase === 11) drawSpeechBubble(pxScreen, hY, "[TABLET] Well you see that little number at the top right\nthat grows with the more killing you do?\nThats a quantatitive measurement \n of the moosh you're accruing!");
      else if (callPhase === 12) drawSpeechBubble(pxScreen, hY, "Moosh?");
      else if (callPhase === 13) drawSpeechBubble(pxScreen, hY, "[TABLET] Exactly. A form of transmutable dark energy. You can send it directly through that tablet to me, \nand ill show you what that suit can really do!\nNeed better weapons? Gear? Upgrades? Just send the moosh over");
      else if (callPhase === 14) drawSpeechBubble(pxScreen, hY, "Hmm. Sounds enticing considering \n i just offed like 6 of my neighbors. \n I dont know though. Getting an incentive to kill seems a little deranged...");
      else if (callPhase === 15) drawSpeechBubble(pxScreen, hY, "[TABLET] Do you have any other choice? \n you need to shoot your way out of Stick City,\nand head north. I'll guide you to SIA headquarters. Here you will have safety, and answers. ill keep in touch. Oh and dont forget about the Moosh!\n ");
      
      fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40);
  }

  if ((currentLevel === 1 || currentLevel === 2) && isStoryMode && objectiveTimer > 0) {
      if (!isPaused) objectiveTimer--;
      let alpha = min(255, objectiveTimer * 3); push(); fill(0, alpha * 0.7); noStroke(); rect(0, height / 2 - 40, width, 80); 
      fill(255, 255, 255, alpha); textAlign(CENTER, CENTER); textSize(24); textFont('sans-serif');
      let txt = nm0AmbushActive ? "Defeat the NM-0 Ambush!" : (currentLevel === 1 ? "Find a way past\nthe south \"Great Gate\"!" : "Destroy the transmission towers!");
      text(txt, width / 2, height / 2); pop();
  }

  if (!isDead && !isWin && !inCutscene && !isPaused) { handleTouches(); handleGamepad(); handleDesktop(); }
  if (window.showOnScreenControls && !isWin && !isDead && !inCutscene && !isPaused) drawJoysticks();
  
  if (!isDead && !isWin && !killcamMode && !inCutscene && prologuePhase !== 7 && upstairsPhase === 0 && !window.inNM0SecretOverlay) {
      if (currentLevel !== 0 || (inUpstairsRoom && dist(player.x, player.y, 150, 0) >= 80 && dist(player.x, player.y, 0, -200) >= 120 && dist(player.x, player.y, 0, 250) >= 80)) drawUI();
      else if (!inUpstairsRoom && dist(player.x, player.y, -400, 0) >= 80) drawUI();
      
      // --- NM-0 HQ ENTER BUTTON ---
      if (currentLevel === 1 && window.nm0AmbushClearedStatus) {
        let GOV_DIRECTIVE
        let established
          let nGate = buildings.find(b => b.isGovFortress && b.y < 0);
          if (nGate && nGate.hp <= 0 && dist(player.x, player.y, nGate.x, nGate.y + nGate.h/2) < 250) {
              drawPromptBtn("ENTER NM-0 HQ");
          }
      }

            // --- NM-0 HQ DOOR/BLUEPRINT BUTTONS ---
  if (currentLevel === 8 && !isPaused && !killcamMode) {
      if (window.nm0HqCleared && dist(player.x, player.y, 0, -800) < 250 && player.y > -1000) {
          drawPromptBtn("ENTER ROOM");
      } else if (dist(player.x, player.y, 0, -800) < 250 && player.y <= -1000) {
          drawPromptBtn("EXIT ROOM");
      } else if (dist(player.x, player.y, 0, -2000) < 200 && !window.armorBlueprintPickedUp) {
          drawPromptBtn("PICK UP BLUEPRINT");
      } else if (dist(player.x, player.y, 0, 1450) < 250) {
          drawPromptBtn("EXIT BUILDING");
      }
  }



  // --- POST-AMBUSH CUTSCENE ---
  if (inPostAmbushCutscene) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0); noStroke(); rect(0, 0, width, height * 0.12); rect(0, height - (height * 0.12), width, height * 0.12);
      
      let pxScreen = width / 2; let hY = height / 2 - 80;

      if (postAmbushPhase === 1) { killcamTarget = {x: townSpeaker1.x, y: townSpeaker1.y}; drawSpeechBubble(pxScreen, hY, "Holy hell! We just took out the government!"); }
      else if (postAmbushPhase === 2) { killcamTarget = {x: townSpeaker2.x, y: townSpeaker2.y}; drawSpeechBubble(pxScreen, hY, "Hooray! The revolution is complete! We rule the world!"); }
      else if (postAmbushPhase === 3) { killcamTarget = {x: player.x, y: player.y}; drawSpeechBubble(pxScreen, hY, "I wouldve thought that too if my dad didnt just tell me\ntheres a whole lot more land outside of these gates..\nI guess theres other Stick Cities. Also the ALIE..\nWhatever that is. He got killed before he could finish his sentence."); }
      else if (postAmbushPhase === 4) { killcamTarget = {x: townSpeaker1.x, y: townSpeaker1.y}; drawSpeechBubble(pxScreen, hY, "Theres no way. You sound like one of them 3D earthers.."); }
      else if (postAmbushPhase === 5) { killcamTarget = {x: player.x, y: player.y}; drawSpeechBubble(pxScreen, hY, "Ehh. Pretty sure dad was gonna tell me thats true too even.\nDont shoot the messenger."); }
      else if (postAmbushPhase === 6) { killcamTarget = {x: townSpeaker1.x, y: townSpeaker1.y}; drawSpeechBubble(pxScreen, hY, "Ahh for F***'s sake."); }
      else if (postAmbushPhase === 7) { killcamTarget = {x: player.x, y: player.y}; drawSpeechBubble(pxScreen, hY, "I know; thats what i said. Anyhow, if we plan on staying alive,\nthen we have to structure teams and assign roles.\nAs soon as we run out of the reserve food supplied to us by NM-0 formerly,\nwe will starve. Were going to have to build our own government."); }

      if (postAmbushPhase >= 1 && postAmbushPhase <= 7) { fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }
      if (postAmbushPhase >= 1 && postAmbushPhase <= 7) { fill(255); textAlign(CENTER); textSize(14); text("[ TAP TO CONTINUE ]", width / 2, height - 40); }

  }
  
       if (inWorldBuildingMenu) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      
      // --- SAFETY INITIALIZER ---
   // --- 1. SAFE DEFAULTS (Always run first to prevent NaN) ---
window.popFarmingM = window.popFarmingM || 0;
window.popFarmingF = window.popFarmingF || 0;
window.popMilitaryM = window.popMilitaryM || 0;
window.popMilitaryF = window.popMilitaryF || 0;
window.popScienceM = window.popScienceM || 0;
window.popScienceF = window.popScienceF || 0;
window.popArchitectureM = window.popArchitectureM || 0;
window.popArchitectureF = window.popArchitectureF || 0;

// --- 2. DETERMINE THE STRICT SOURCE OF TRUTH ---
let liveMales = 0;
let totalLive = 0;
let readingFromPhysicalObjects = false;

// BUG FIX: Safely check overworld status. If the variable hasn't been set to true yet, we assume we are in an active level!
let inOverworld = (typeof inOverworldView !== 'undefined' && inOverworldView === true);

// If we are in an active level, scan the physical allies
if (!inOverworld && typeof allies !== 'undefined' && Array.isArray(allies) && allies.length > 0) {
    readingFromPhysicalObjects = true;
    totalLive = allies.length;
    for (let i = 0; i < allies.length; i++) {
        if (allies[i]) {
            // BULLETPROOF: Checks eType, falls back to eT, forces string, forces uppercase.
            let eTypeStr = String(allies[i].eType || allies[i].eT || "NORMAL").toUpperCase();
            
            if (!eTypeStr.includes("FEMALE")) {
                liveMales++;
            }
        }
    }
} 
// If we are looking directly at a populated town (physical entities)
else if (typeof townCitizens !== 'undefined' && Array.isArray(townCitizens) && townCitizens.length > 0) {
    readingFromPhysicalObjects = true;
    totalLive = townCitizens.length;
    for (let i = 0; i < townCitizens.length; i++) {
        if (townCitizens[i]) {
            let eTypeStr = String(townCitizens[i].eType || townCitizens[i].eT || "NORMAL").toUpperCase();
            
            if (!eTypeStr.includes("FEMALE")) {
                liveMales++;
            }
        }
    }
}

// --- 3. PROCESS THE DATA ---
if (readingFromPhysicalObjects) {
    let liveFemales = Math.max(0, totalLive - liveMales);

    let assignedM = window.popFarmingM + window.popMilitaryM + window.popScienceM + window.popArchitectureM;
    let assignedF = window.popFarmingF + window.popMilitaryF + window.popScienceF + window.popArchitectureF;

    // Military Culling (Trims the military if soldiers died in combat)
    if (assignedM > liveMales) {
        window.popMilitaryM = Math.max(0, window.popMilitaryM - (assignedM - liveMales));
        assignedM = window.popFarmingM + window.popMilitaryM + window.popScienceM + window.popArchitectureM;
    }
    if (assignedF > liveFemales) {
        window.popMilitaryF = Math.max(0, window.popMilitaryF - (assignedF - liveFemales));
        assignedF = window.popFarmingF + window.popMilitaryF + window.popScienceF + window.popArchitectureF;
    }

    window.popUnassignedM = Math.max(0, liveMales - assignedM);
    window.popUnassignedF = Math.max(0, liveFemales - assignedF);
    window.popTotal = totalLive;
} 
// If we are in the Overworld, DO NOT scan objects. Load the saved string data.
else if (typeof viewingTownId !== 'undefined' && typeof townsData !== 'undefined' && townsData[viewingTownId]) {
    let t = townsData[viewingTownId];
    if (t.established) {
        window.popFarmingM = t.popFarmingM || 0;
        window.popFarmingF = t.popFarmingF || 0;
        window.popMilitaryM = t.popMilitaryM || 0;
        window.popMilitaryF = t.popMilitaryF || 0;
        window.popScienceM = t.popScienceM || 0;
        window.popScienceF = t.popScienceF || 0;
        window.popArchitectureM = t.popArchitectureM || 0;
        window.popArchitectureF = t.popArchitectureF || 0;
        window.popUnassignedM = t.popUnassignedM || 0;
        window.popUnassignedF = t.popUnassignedF || 0;
        window.popTotal = t.popTotal || 0;
    }
}


      fill(255); textAlign(CENTER, CENTER); textSize(32); textFont('sans-serif');
      text("NEW GOVERNMENT DIRECTIVE", width/2, 50);
      textSize(18); fill(200);
      text(`SURVIVING CITIZENS: ${popTotal}   |   UNASSIGNED: ♂ ${window.popUnassignedM}   ♀ ${window.popUnassignedF}`, width/2, 90);

      let statVit = 1 + Math.floor((window.popFarmingM + window.popFarmingF) * 1.5);
      let statMen = 1 + Math.floor((window.popFarmingM + window.popFarmingF) * 1.2);
      let statPhy = 1 + Math.floor((window.popMilitaryM + window.popMilitaryF) * 1.2 + (window.popArchitectureM + window.popArchitectureF) * 1.0);
      let statObe = 1 + Math.floor((window.popMilitaryM + window.popMilitaryF) * 1.5);
      let statInt = 1 + Math.floor((window.popScienceM + window.popScienceF) * 2.0);


      fill(30, 150); stroke(100); strokeWeight(2); rect(width/2 - 250, 130, 500, 60, 8);
      fill(255, 200, 0); noStroke(); textSize(12);
      text(`VITALITY: Lv.${statVit}    MENTAL: Lv.${statMen}    PHYSICALITY: Lv.${statPhy}`, width/2, 145);
      text(`OBEDIENCE: Lv.${statObe}    INTELLIGENCE: Lv.${statInt}`, width/2, 165);
            let depts = [
          {name: "FARMING", desc: "Increases Vitality & Mental State", cM: window.popFarmingM, cF: window.popFarmingF, y: 220, id: 0, xp: window.farmXP, lvl: window.farmLvl},
          {name: "MILITARY", desc: "Increases Physicality & Obedience", cM: window.popMilitaryM, cF: window.popMilitaryF, y: 295, id: 1, xp: window.milXP, lvl: window.milLvl},
          {name: "SCIENCE", desc: "Increases Intelligence", cM: window.popScienceM, cF: window.popScienceF, y: 370, id: 2, xp: window.sciXP, lvl: window.sciLvl},
          {name: "ARCHITECTURE", desc: "Increases Physicality & Build Speed", cM: window.popArchitectureM, cF: window.popArchitectureF, y: 445, id: 3, xp: window.archXP, lvl: window.archLvl}
      ];

      // HOLD-TO-SPEED-UP LOGIC
      let isPressing = mouseIsPressed || (typeof touches !== 'undefined' && touches.length > 0);
      let mx = typeof touches !== 'undefined' && touches.length > 0 ? touches[0].x : mouseX;
      let my = typeof touches !== 'undefined' && touches.length > 0 ? touches[0].y : mouseY;

      if (!isPressing) window.govHoldTimer = 0;
      else if (window.govHoldTimer === undefined) window.govHoldTimer = 1;
      else window.govHoldTimer++;

      let triggerAction = (window.govHoldTimer === 1) || (window.govHoldTimer > 20 && window.govHoldTimer % 4 === 0);

      for (let d of depts) {
          fill(40); stroke(200); strokeWeight(2); rect(width/2 - 200, d.y - 5, 400, 70, 8);
          fill(255); noStroke(); textAlign(LEFT, CENTER); textSize(18); text(d.name, width/2 - 180, d.y + 15);
          fill(150); textSize(10); text(d.desc, width/2 - 180, d.y + 35);

          // PROGRESS BAR WITH EXACT POINTS READOUT
          let req = d.lvl === 1 ? 50 : (d.lvl === 2 ? 100 : 150);
          let xpRatio = min(1, (d.xp || 0) / req);
          if (d.lvl >= 4) xpRatio = 1;
          
          fill(20); noStroke(); rect(width/2 - 180, d.y + 50, 200, 6, 3);
          fill(50, 200, 255); rect(width/2 - 180, d.y + 50, 200 * xpRatio, 6, 3);
          fill(200); textSize(10); textAlign(RIGHT, CENTER); 
          text(`LVL ${d.lvl || 1}  [ ${Math.floor(d.xp || 0)} / ${req} ]`, width/2 + 180, d.y + 53);

          // Male UI Layer
          fill(100, 150, 255); textSize(18); textAlign(CENTER, CENTER); text("♂", width/2 - 60, d.y + 30);
          fill(d.cM > 0 ? color(200, 50, 50) : color(80)); rect(width/2 - 45, d.y + 15, 25, 30, 4); fill(255); text("-", width/2 - 32, d.y + 30);
          fill(255); textSize(16); text(d.cM, width/2 - 5, d.y + 30);
          fill(window.popUnassignedM > 0 ? color(50, 200, 50) : color(80)); rect(width/2 + 10, d.y + 15, 25, 30, 4); fill(255); text("+", width/2 + 22, d.y + 30);

          // Female UI Layer
          fill(255, 105, 180); textSize(18); text("♀", width/2 + 60, d.y + 30);
          fill(d.cF > 0 ? color(200, 50, 50) : color(80)); rect(width/2 + 75, d.y + 15, 25, 30, 4); fill(255); text("-", width/2 + 87, d.y + 30);
          fill(255); textSize(16); text(d.cF, width/2 + 115, d.y + 30);
          fill(window.popUnassignedF > 0 ? color(50, 200, 50) : color(80)); rect(width/2 + 130, d.y + 15, 25, 30, 4); fill(255); text("+", width/2 + 142, d.y + 30);

          // Apply rapid-fire clicks
          if (triggerAction) {
              if (mx > width/2 - 45 && mx < width/2 - 20 && my > d.y + 15 && my < d.y + 45 && d.cM > 0) {
                  if (d.id===0) window.popFarmingM--; if (d.id===1) window.popMilitaryM--; if (d.id===2) window.popScienceM--; if (d.id===3) window.popArchitectureM--;
                  window.popUnassignedM++; sfx.hitArmor();
              }
              if (mx > width/2 + 10 && mx < width/2 + 35 && my > d.y + 15 && my < d.y + 45 && window.popUnassignedM > 0) {
                  if (d.id===0) window.popFarmingM++; if (d.id===1) window.popMilitaryM++; if (d.id===2) window.popScienceM++; if (d.id===3) window.popArchitectureM++;
                  window.popUnassignedM--; sfx.reload();
              }
              if (mx > width/2 + 75 && mx < width/2 + 100 && my > d.y + 15 && my < d.y + 45 && d.cF > 0) {
                  if (d.id===0) window.popFarmingF--; if (d.id===1) window.popMilitaryF--; if (d.id===2) window.popScienceF--; if (d.id===3) window.popArchitectureF--;
                  window.popUnassignedF++; sfx.hitArmor();
              }
              if (mx > width/2 + 130 && mx < width/2 + 155 && my > d.y + 15 && my < d.y + 45 && window.popUnassignedF > 0) {
                  if (d.id===0) window.popFarmingF++; if (d.id===1) window.popMilitaryF++; if (d.id===2) window.popScienceF++; if (d.id===3) window.popArchitectureF++;
                  window.popUnassignedF--; sfx.reload();
              }
          }
      }


      // Keep globals perfectly in sync
      popFarming = window.popFarmingM + window.popFarmingF;
      popMilitary = window.popMilitaryM + window.popMilitaryF;
      popScience = window.popScienceM + window.popScienceF;
      popArchitecture = window.popArchitectureM + window.popArchitectureF;
      popUnassigned = window.popUnassignedM + window.popUnassignedF;

      let isEst = typeof townsData !== 'undefined' && townsData[viewingTownId] && townsData[viewingTownId].established;
      let btnText = (popUnassigned === 0) ? (isEst ? "UPDATE DIRECTIVE" : "ESTABLISH") : "ASSIGN CITIZENS";

      fill((popUnassigned === 0) ? color(50, 200, 255) : color(80)); 
      stroke(255); strokeWeight(2);
      rect(width/2 - 120, height - 90, 240, 50, 8);
      fill(0); noStroke(); textSize(18); 
      text(btnText, width/2, height - 65);
  }
  // --- TRAVEL DEPARTURE MENU ---
  if (inTravelMenu) {
      leftStick.active = false; rightStick.active = false; meleeInputHeld = false; cannonInputHeld = false;
      fill(0, 230); rect(0, 0, width, height);

      fill(255); textAlign(CENTER, CENTER); textSize(32); textFont('sans-serif');
      text("TRAVEL DEPARTURE", width/2, 80);

      if (window.militaryToBringM === undefined) window.militaryToBringM = 0;
      if (window.militaryToBringF === undefined) window.militaryToBringF = 0;

      if (!travelDirection) {
          textSize(20); fill(200); text("SELECT DESTINATION", width/2, 140);
          
          if (window.northGateBreached) { fill(40); stroke(50, 200, 255); } 
          else { fill(20); stroke(50); }
          strokeWeight(2); rect(width/2 - 150, 200, 300, 60, 8);
          fill(window.northGateBreached ? 255 : 100); noStroke(); text("NORTH", width/2, 230);
          if (!window.northGateBreached) { textSize(12); fill(150); text("(Gate intact. Path blocked.)", width/2, 275); }

          fill(40); stroke(50, 200, 255); strokeWeight(2); 
          rect(width/2 - 150, 320, 300, 60, 8);
          fill(255); noStroke(); textSize(20); text("SOUTH", width/2, 350);
          
      } else {
          textSize(20); fill(200); text(`HEADING: ${travelDirection}`, width/2, 140);
          text("SQUAD DEPLOYMENT", width/2, 200);
          textSize(14); fill(150); 
          text(`AVAILABLE MILITARY: ♂ ${window.popMilitaryM}   ♀ ${window.popMilitaryF}`, width/2, 230);

          // MALE ROW
          fill(40); stroke(200); strokeWeight(2); rect(width/2 - 150, 260, 300, 50, 8);
          fill(100, 150, 255); noStroke(); textSize(18); text("♂ BRING MALES", width/2 - 40, 285);
          fill(255); textSize(24); text(window.militaryToBringM, width/2 + 80, 285);
          fill(window.militaryToBringM > 0 ? color(200, 50, 50) : color(80)); rect(width/2 - 120, 270, 25, 30, 4); fill(255); textSize(16); text("-", width/2 - 107, 285);
          fill(window.militaryToBringM < window.popMilitaryM ? color(50, 200, 50) : color(80)); rect(width/2 + 110, 270, 25, 30, 4); fill(255); text("+", width/2 + 122, 285);

          // FEMALE ROW
          fill(40); stroke(200); strokeWeight(2); rect(width/2 - 150, 320, 300, 50, 8);
          fill(255, 105, 180); noStroke(); textSize(18); text("♀ BRING FEMALES", width/2 - 30, 345);
          fill(255); textSize(24); text(window.militaryToBringF, width/2 + 80, 345);
          fill(window.militaryToBringF > 0 ? color(200, 50, 50) : color(80)); rect(width/2 - 120, 330, 25, 30, 4); fill(255); textSize(16); text("-", width/2 - 107, 345);
          fill(window.militaryToBringF < window.popMilitaryF ? color(50, 200, 50) : color(80)); rect(width/2 + 110, 330, 25, 30, 4); fill(255); text("+", width/2 + 122, 345);

          fill(50, 200, 50); stroke(255); rect(width/2 - 120, height - 90, 240, 50, 8);
          fill(0); noStroke(); textSize(18); text("DEPART", width/2, height - 65);
          
          fill(150); noStroke(); textSize(14); text("[ BACK ]", width/2, height - 20);
      }
  }

  // --- OVERWORLD VIEW UI ---
  if (inOverworldView) {
      // 1. Dynamically sum up ALL allies across ALL levels to get the true Global Population
      let trueGlobalPop = 0;
      for (let id in townsData) {
          if (townsData[id].established) {
              trueGlobalPop += townsData[id].popTotal;
          }
      }
      // Sync the global variable to match the data exactly
      globalPopulation = trueGlobalPop;

      fill(0, 150); noStroke();
      rect(20, 120, 280, 200, 10); // Made slightly taller to fit the extra line
      
      fill(255); textAlign(LEFT, TOP); textFont('sans-serif'); textSize(18);
      text("TOWN OVERVIEW", 35, 135);
      
      fill(200); textSize(12);
      text(`LOCAL POPULATION: ${popTotal}`, 35, 165);
      
      fill(50, 255, 50); // Colored green to stand out
      text(`GLOBAL POPULATION: ${globalPopulation}`, 35, 185);
      
      fill(255, 200, 0);
      text(`VITALITY: Lv.${statVit}`, 35, 210);
      text(`MENTAL: Lv.${statMen}`, 35, 230);
      text(`PHYSICAL: Lv.${statPhy}`, 35, 250);
      text(`OBEDIENCE: Lv.${statObe}`, 35, 270);
      text(`INTELLIGENCE: Lv.${statInt}`, 35, 290);

      fill(50, 200, 50); stroke(255); strokeWeight(2);
      rect(width - 220, height - 80, 200, 50, 8);
      fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(16); 
      text("TRAVEL", width - 120, height - 55);
      // --- PROCEED SOUTH or north BUTTON CLICK LOGIC ---
      let ovPressing = mouseIsPressed || (typeof touches !== 'undefined' && touches.length > 0);
      if (!ovPressing) window.overworldTimer = 0;
      else if (window.overworldTimer === undefined) window.overworldTimer = 1;
      else window.overworldTimer++;

              // Only allow clicking the travel button after being in the overworld view for at least 30 frames (half a second)
    if (typeof window.overworldTimer !== 'undefined' && window.overworldTimer > 500) { 
        let omx = typeof touches !== 'undefined' && touches.length > 0 ? touches[0].x : mouseX;
        let omy = typeof touches !== 'undefined' && touches.length > 0 ? touches[0].y : mouseY;
        
        if (omx > width - 220 && omx < width - 20 && omy > height - 80 && omy < height - 30) {
            inOverworldView = false;
            inTravelMenu = true;
            travelDirection = null;
            window.militaryToBringM = 0;
            window.militaryToBringF = 0;
            sfx.charge();
        }
    }


}
  }


  if (isPaused) {
      fill(0, 200); rect(0, 0, width, height); textAlign(CENTER, CENTER); textFont('sans-serif');
      let drawBtn = (y, txt) => { fill(40); stroke(255, 200, 0); strokeWeight(2); rect(width/2 - 120, y, 240, 40, 8); fill(255); noStroke(); textSize(16); text(txt, width/2, y + 20); };
      
                                 if (pauseMenuState === "MAIN") {
          fill(255); textSize(40); text("PAUSED", width/2, height/2 - 260); 
          drawBtn(height/2 - 210, "CONTINUE"); 
          drawBtn(height/2 - 160, "SAVE GAME"); 
          
      // --- DRAW MELEE SWITCHER BUTTON ---
if (swordPickedUp) {
    // If it's not explicitly false, assume it's true (equipped)
    let isEquipped = (window.swordEquipped !== false); 
    
    // Set the text based on our new variable, NOT player.isArmed!
    let meleeText = isEquipped ? "MELEE: SWORD" : "MELEE: UNARMED";
    
    drawBtn(height/2 - 110, meleeText);
} else {

              fill(30); stroke(100); strokeWeight(2); rect(width/2 - 120, height/2 - 110, 240, 40, 8); 
              fill(150); noStroke(); textSize(16); text("this.isArmed = false; UNARMED", width/2, height/2 - 90);
          }
          
          // 1. Gov Directive Button
          if (currentLevel >= 3) {
              drawBtn(height/2 - 60, "GOV. DIRECTIVE"); 
          }
          
          // 2. Overworld Toggle
          if (typeof townsData !== 'undefined' && townsData[currentLevel] && townsData[currentLevel].established) {
              let label = inOverworldView ? "HIDE OVERWORLD" : "OPEN OVERWORLD";
              drawBtn(height/2 - 10, label);
          } else {
              fill(30); stroke(100); strokeWeight(2); rect(width/2 - 120, height/2 - 10, 240, 40, 8); 
              fill(150); noStroke(); textSize(16); text("OVERWORLD (LOCKED)", width/2, height/2 + 10);
          }
          
          drawBtn(height/2 + 40, "UPGRADES (SHOP)"); 
          drawBtn(height/2 + 90, "DAD'S TABLET"); 
     
          if (window.towersDefeated || (isStoryMode && currentLevel >= 2)) {
              drawBtn(height/2 + 140, "SQUAD COMMAND"); 
          }
          
          drawBtn(height/2 + 190, "RESET GAME"); 
      }


 
      
      else if (pauseMenuState === "SQUAD") {
          fill(255); textSize(40); text("SQUAD COMMAND", width/2, height/2 - 150);
          drawBtn(height/2 - 90, "FOLLOW ME");
          drawBtn(height/2 - 30, "SEARCH...");
          drawBtn(height/2 + 30, "SPREAD OUT");
          drawBtn(height/2 + 90, "HOLD PERIMETER");
          drawBtn(height/2 + 150, "BACK");
      } 
      else if (pauseMenuState === "SQUAD_SEARCH") {
          fill(255); textSize(40); text("SEARCH DIRECTION", width/2, height/2 - 150);
          drawBtn(height/2 - 90, "NORTH");
          drawBtn(height/2 - 30, "SOUTH");
          drawBtn(height/2 + 30, "EAST");
          drawBtn(height/2 + 90, "WEST");
          drawBtn(height/2 + 150, "BACK");
      } 
            else if (pauseMenuState === "GOV_DIRECTIVE") {
         
window.popFarmingM = window.popFarmingM || 0;
window.popFarmingF = window.popFarmingF || 0;
window.popMilitaryM = window.popMilitaryM || 0;
window.popMilitaryF = window.popMilitaryF || 0;
window.popScienceM = window.popScienceM || 0;
window.popScienceF = window.popScienceF || 0;
window.popArchitectureM = window.popArchitectureM || 0;
window.popArchitectureF = window.popArchitectureF || 0;

// --- 2. DETERMINE THE STRICT SOURCE OF TRUTH ---
let liveMales = 0;
let totalLive = 0;
let readingFromPhysicalObjects = false;

let inOverworld = (typeof inOverworldView !== 'undefined' && inOverworldView === true);

// If we are in an active level, scan the physical allies
if (!inOverworld && typeof allies !== 'undefined' && Array.isArray(allies) && allies.length > 0) {
    readingFromPhysicalObjects = true;
    totalLive = allies.length;
    for (let i = 0; i < allies.length; i++) {
        let c = allies[i];
        if (c) {
            // Check direct gender property first; fallback to eType string parsing if missing
            let isMale = false;
            if (c.gender) {
                isMale = (c.gender === "MALE");
            } else {
                let eTypeStr = String(c.eType || c.eT || "NORMAL").toUpperCase();
                isMale = !eTypeStr.includes("FEMALE");
            }

            if (isMale) {
                liveMales++;
            }
        }
    }
} 
// If we are looking directly at a populated town (physical entities)
else if (typeof townCitizens !== 'undefined' && Array.isArray(townCitizens) && townCitizens.length > 0) {
    readingFromPhysicalObjects = true;
    totalLive = townCitizens.length;
    for (let i = 0; i < townCitizens.length; i++) {
        let c = townCitizens[i];
        if (c) {
            let isMale = false;
            if (c.gender) {
                isMale = (c.gender === "MALE");
            } else {
                let eTypeStr = String(c.eType || c.eT || "NORMAL").toUpperCase();
                isMale = !eTypeStr.includes("FEMALE");
            }

            if (isMale) {
                liveMales++;
            }
        }
    }
}



// --- 3. PROCESS THE DATA ---
if (readingFromPhysicalObjects) {
    let liveFemales = Math.max(0, totalLive - liveMales);

    let assignedM = window.popFarmingM + window.popMilitaryM + window.popScienceM + window.popArchitectureM;
    let assignedF = window.popFarmingF + window.popMilitaryF + window.popScienceF + window.popArchitectureF;

    // Military Culling (Trims the military if soldiers died in combat)
    if (assignedM > liveMales) {
        window.popMilitaryM = Math.max(0, window.popMilitaryM - (assignedM - liveMales));
        assignedM = window.popFarmingM + window.popMilitaryM + window.popScienceM + window.popArchitectureM;
    }
    if (assignedF > liveFemales) {
        window.popMilitaryF = Math.max(0, window.popMilitaryF - (assignedF - liveFemales));
        assignedF = window.popFarmingF + window.popMilitaryF + window.popScienceF + window.popArchitectureF;
    }

    window.popUnassignedM = Math.max(0, liveMales - assignedM);
    window.popUnassignedF = Math.max(0, liveFemales - assignedF);
    window.popTotal = totalLive;
} 
// If we are in the Overworld, DO NOT scan objects. Load the saved string data.
else if (typeof viewingTownId !== 'undefined' && typeof townsData !== 'undefined' && townsData[viewingTownId]) {
    let t = townsData[viewingTownId];
    if (t.established) {
        window.popFarmingM = t.popFarmingM || 0;
        window.popFarmingF = t.popFarmingF || 0;
        window.popMilitaryM = t.popMilitaryM || 0;
        window.popMilitaryF = t.popMilitaryF || 0;
        window.popScienceM = t.popScienceM || 0;
        window.popScienceF = t.popScienceF || 0;
        window.popArchitectureM = t.popArchitectureM || 0;
        window.popArchitectureF = t.popArchitectureF || 0;
        window.popUnassignedM = t.popUnassignedM || 0;
        window.popUnassignedF = t.popUnassignedF || 0;
        window.popTotal = t.popTotal || 0;
    }
}

  // --- 1. USE YOUR EXACT trueGlobalPop LOGIC FROM SCREENSHOT 1000206223.jpg ---
  let trueGlobalPop = 0;
  for (let id in townsData) {
      if (townsData[id] && townsData[id].established) {
          trueGlobalPop += townsData[id].popTotal;
      }
  }

  // NOTE: If this screen runs BEFORE the current level officially saves to townsData, use:
  globalPopulation = trueGlobalPop + popTotal; 
  // (If your game already saved the current level right before this screen, just change it to: globalPopulation = trueGlobalPop;)

  // --- 2. DRAW THE DIRECTIVE HEADER MATCHING SCREENSHOT 1783574826028.jpeg ---
  fill(255); 
  textAlign(CENTER, CENTER); 
  textSize(32); 
  textFont('sans-serif');
  text("GOVERNMENT DIRECTIVE", width/2, 50);

  textSize(18); 
  fill(200);
  // Kept your exact "SURVIVING CITIZENS" string layout, just swapping the variable to globalPopulation
  text(`SURVIVING CITIZENS: ${globalPopulation}   |   UNASSIGNED: ♂ ${window.popUnassignedM}   ♀ ${window.popUnassignedF}`, width/2, 90);

      statVit = 1 + Math.floor((window.popFarmingM + window.popFarmingF) * 1.5);
      statMen = 1 + Math.floor((window.popFarmingM + window.popFarmingF) * 1.2);
      statPhy = 1 + Math.floor((window.popMilitaryM + window.popMilitaryF) * 1.2 + (window.popArchitectureM + window.popArchitectureF) * 1.0);
      statObe = 1 + Math.floor((window.popMilitaryM + window.popMilitaryF) * 1.5);
      statInt = 1 + Math.floor((window.popScienceM + window.popScienceF) * 2.0);

      fill(30, 150); stroke(100); strokeWeight(2); rect(width/2 - 250, 130, 500, 60, 8);
      fill(255, 200, 0); noStroke(); textSize(12);
      text(`VITALITY: Lv.${statVit}    MENTAL: Lv.${statMen}    PHYSICALITY: Lv.${statPhy}`, width/2, 145);
      text(`OBEDIENCE: Lv.${statObe}    INTELLIGENCE: Lv.${statInt}`, width/2, 165);

                 let depts = [
          {name: "FARMING", desc: "Increases Vitality & Mental State", cM: window.popFarmingM, cF: window.popFarmingF, y: 220, id: 0, xp: window.farmXP, lvl: window.farmLvl},
          {name: "MILITARY", desc: "Increases Physicality & Obedience", cM: window.popMilitaryM, cF: window.popMilitaryF, y: 295, id: 1, xp: window.milXP, lvl: window.milLvl},
          {name: "SCIENCE", desc: "Increases Intelligence", cM: window.popScienceM, cF: window.popScienceF, y: 370, id: 2, xp: window.sciXP, lvl: window.sciLvl},
          {name: "ARCHITECTURE", desc: "Increases Physicality & Build Speed", cM: window.popArchitectureM, cF: window.popArchitectureF, y: 445, id: 3, xp: window.archXP, lvl: window.archLvl}
      ];

      // HOLD-TO-SPEED-UP LOGIC
      let isPressing = mouseIsPressed || (typeof touches !== 'undefined' && touches.length > 0);
      let mx = typeof touches !== 'undefined' && touches.length > 0 ? touches[0].x : mouseX;
      let my = typeof touches !== 'undefined' && touches.length > 0 ? touches[0].y : mouseY;

      if (!isPressing) window.govHoldTimer = 0;
      else if (window.govHoldTimer === undefined) window.govHoldTimer = 1;
      else window.govHoldTimer++;

      let triggerAction = (window.govHoldTimer === 1) || (window.govHoldTimer > 20 && window.govHoldTimer % 4 === 0);

      for (let d of depts) {
          fill(40); stroke(200); strokeWeight(2); rect(width/2 - 200, d.y - 5, 400, 70, 8);
          fill(255); noStroke(); textAlign(LEFT, CENTER); textSize(18); text(d.name, width/2 - 180, d.y + 15);
          fill(150); textSize(10); text(d.desc, width/2 - 180, d.y + 35);

          // PROGRESS BAR WITH EXACT POINTS READOUT
          let req = d.lvl === 1 ? 50 : (d.lvl === 2 ? 100 : 150);
          let xpRatio = min(1, (d.xp || 0) / req);
          if (d.lvl >= 4) xpRatio = 1;
          
          fill(20); noStroke(); rect(width/2 - 180, d.y + 50, 200, 6, 3);
          fill(50, 200, 255); rect(width/2 - 180, d.y + 50, 200 * xpRatio, 6, 3);
          fill(200); textSize(10); textAlign(RIGHT, CENTER); 
          text(`LVL ${d.lvl || 1}  [ ${Math.floor(d.xp || 0)} / ${req} ]`, width/2 + 180, d.y + 53);

          // Male UI Layer
          fill(100, 150, 255); textSize(18); textAlign(CENTER, CENTER); text("♂", width/2 - 60, d.y + 30);
          fill(d.cM > 0 ? color(200, 50, 50) : color(80)); rect(width/2 - 45, d.y + 15, 25, 30, 4); fill(255); text("-", width/2 - 32, d.y + 30);
          fill(255); textSize(16); text(d.cM, width/2 - 5, d.y + 30);
          fill(window.popUnassignedM > 0 ? color(50, 200, 50) : color(80)); rect(width/2 + 10, d.y + 15, 25, 30, 4); fill(255); text("+", width/2 + 22, d.y + 30);

          // Female UI Layer
          fill(255, 105, 180); textSize(18); text("♀", width/2 + 60, d.y + 30);
          fill(d.cF > 0 ? color(200, 50, 50) : color(80)); rect(width/2 + 75, d.y + 15, 25, 30, 4); fill(255); text("-", width/2 + 87, d.y + 30);
          fill(255); textSize(16); text(d.cF, width/2 + 115, d.y + 30);
          fill(window.popUnassignedF > 0 ? color(50, 200, 50) : color(80)); rect(width/2 + 130, d.y + 15, 25, 30, 4); fill(255); text("+", width/2 + 142, d.y + 30);

          // Apply rapid-fire clicks
          if (triggerAction) {
              if (mx > width/2 - 45 && mx < width/2 - 20 && my > d.y + 15 && my < d.y + 45 && d.cM > 0) {
                  if (d.id===0) window.popFarmingM--; if (d.id===1) window.popMilitaryM--; if (d.id===2) window.popScienceM--; if (d.id===3) window.popArchitectureM--;
                  window.popUnassignedM++; sfx.hitArmor();
              }
              if (mx > width/2 + 10 && mx < width/2 + 35 && my > d.y + 15 && my < d.y + 45 && window.popUnassignedM > 0) {
                  if (d.id===0) window.popFarmingM++; if (d.id===1) window.popMilitaryM++; if (d.id===2) window.popScienceM++; if (d.id===3) window.popArchitectureM++;
                  window.popUnassignedM--; sfx.reload();
              }
              if (mx > width/2 + 75 && mx < width/2 + 100 && my > d.y + 15 && my < d.y + 45 && d.cF > 0) {
                  if (d.id===0) window.popFarmingF--; if (d.id===1) window.popMilitaryF--; if (d.id===2) window.popScienceF--; if (d.id===3) window.popArchitectureF--;
                  window.popUnassignedF++; sfx.hitArmor();
              }
              if (mx > width/2 + 130 && mx < width/2 + 155 && my > d.y + 15 && my < d.y + 45 && window.popUnassignedF > 0) {
                  if (d.id===0) window.popFarmingF++; if (d.id===1) window.popMilitaryF++; if (d.id===2) window.popScienceF++; if (d.id===3) window.popArchitectureF++;
                  window.popUnassignedF--; sfx.reload();
              }
          }
      }


      // Force globals to match so the rest of your math doesn't break
      popFarming = window.popFarmingM + window.popFarmingF;
      popMilitary = window.popMilitaryM + window.popMilitaryF;
      popScience = window.popScienceM + window.popScienceF;
      popArchitecture = window.popArchitectureM + window.popArchitectureF;
      popUnassigned = window.popUnassignedM + window.popUnassignedF;

      let isEst = typeof townsData !== 'undefined' && townsData[viewingTownId] && townsData[viewingTownId].established;
      let btnText = (popUnassigned === 0) ? (isEst ? "UPDATE DIRECTIVE" : "ESTABLISH") : "ASSIGN CITIZENS";

      fill((popUnassigned === 0) ? color(50, 200, 255) : color(80)); 
      stroke(255); strokeWeight(2);
      rect(width/2 - 120, height - 90, 240, 50, 8);
      fill(0); noStroke(); textSize(18); 
      text(btnText, width/2, height - 65);

                      // --- ESTABLISH BUTTON CLICK LOGIC ---
      if (window.govHoldTimer === 1) { // Fires only on the initial tap
          if (mx > width/2 - 120 && mx < width/2 + 120 && my > height - 90 && my < height - 40) {
              if (popUnassigned === 0) {
                  inWorldBuildingMenu = false;
                  
                  // Safely mark town as established
                  if (typeof townsData !== 'undefined' && typeof viewingTownId !== 'undefined' && townsData[viewingTownId]) {
                      townsData[viewingTownId].established = true;
                  }
                  
                  inOverworldView = true;
              }
          }
      }

            }
      else if (pauseMenuState === "SHOP") {
          drawUpgradeMenu();
      } 
      else if (pauseMenuState === "TABLET") {
          fill(0, 150, 255); textSize(40); text("DAD'S TABLET", width/2, height/2 - 150); drawBtn(height/2 - 90, "SUIT AUGMENTS"); drawBtn(height/2 - 30, "WEAPONS"); drawBtn(height/2 + 30, "JOURNAL"); drawBtn(height/2 + 90, "BACK");
      } 
      else if (pauseMenuState === "AUGMENTS") {
          fill(0, 200, 100); textSize(30); text("SUIT AUGMENTS", width/2, height/2 - 150); fill(255); textSize(18); text("🛡️ SHIELD - Level 1", width/2, height/2 - 80); text("⚡ RECHARGEABLE - Level 1", width/2, height/2 - 40); drawBtn(height/2 + 120, "BACK");
      } 
      else if (pauseMenuState === "WEAPONS") {
          fill(255, 100, 0); textSize(30); text("WEAPONS", width/2, height/2 - 150); fill(255); textSize(18); let wY = height/2 - 80, wList = ["PISTOL"];
          if (smgUnlocked) wList.push("MACHINE GUN"); if (dualSmgUnlocked) wList.push("DUAL SMGS"); if (arUnlocked) wList.push("ASSAULT RIFLE"); if (shotgunUnlocked) wList.push("SHOTGUN"); if (rocketLauncherUnlocked) wList.push("ROCKET LAUNCHER");
          for (let w of wList) { text(`🔫 ${w} - Level 1`, width/2, wY); wY += 30; } drawBtn(height/2 + 120, "BACK");
      } 
      else if (pauseMenuState === "JOURNAL") {
          fill(200, 150, 255); textSize(30); text("JOURNAL", width/2, height/2 - 180); fill(255); textSize(16); textLeading(22);
          text("Todays the day. Just me and the kid.\nWe have to take out those two radio towers\nin town if we are ever going to get past\nthe \"Great Gate\". Either that, or kill\neverybody in town. Even though i know\nthey all lost their identities, and are\nbasically brainless zombies; i still cant\nhelp but feel bad.", width/2, height/2 - 40); drawBtn(height/2 + 120, "BACK");
      }
  }
   
  if (isDead || isWin) {
      let acc = totalShotsFired > 0 ? floor((totalShotsHit / totalShotsFired) * 100) : 0; let accMult = max(1, floor(acc / 10)); let finalScore = score * accMult; 
      if (isDead) { 
          fill(0, 180); rect(0, 0, width, height); fill(255, 50, 50); textAlign(CENTER, CENTER); textSize(50); textFont('sans-serif'); text("A valiant effort..", width / 2, height / 2 - 80); 
          fill(200); textSize(20); text("KILLS: " + totalKills + "  |  BASE SCORE: " + score, width / 2, height / 2 - 25); fill(255, 200, 0); text("ACCURACY: " + acc + "%  (x" + accMult + " MULTIPLIER)", width / 2, height / 2 + 5); 
          fill(50, 255, 50); textSize(32); text("FINAL SCORE: " + finalScore, width / 2, height / 2 + 45); textSize(18); fill(150); text("[ TAP TO RETRY ]", width / 2, height / 2 + 100); 
      } else if (isWin) { 
          if (inUpgradeMenu) { drawUpgradeMenu(); } else {
              fill(0, 180); rect(0, 0, width, height); fill(50, 255, 50); textAlign(CENTER, CENTER); textSize(50); textFont('sans-serif'); text(currentLevel < 7 ? "LEVEL COMPLETED" : "VICTORY", width / 2, height / 2 - 80); 
              fill(200); textSize(20); text("KILLS: " + totalKills + "  |  BASE SCORE: " + score, width / 2, height / 2 - 25); fill(255, 200, 0); text("ACCURACY: " + acc + "%  (x" + accMult + " MULTIPLIER)", width / 2, height / 2 + 5); 
              fill(50, 255, 50); textSize(32); text("FINAL SCORE: " + finalScore, width / 2, height / 2 + 45); 
              if (winTimer > 0) { winTimer--; } else {
                  if (currentLevel < 7) { fill(40); stroke(255, 200, 0); strokeWeight(2); rect(width/2 - 170, height/2 + 90, 160, 50, 8); fill(255); noStroke(); textSize(18); text("UPGRADES", width/2 - 90, height/2 + 115); fill(40); stroke(50, 255, 50); strokeWeight(2); rect(width/2 + 10, height/2 + 90, 160, 50, 8); fill(255); noStroke(); textSize(18); text("CONTINUE", width/2 + 90, height/2 + 115); } 
                  else { textSize(18); fill(150); noStroke(); text("[ TAP TO RESTART ]", width / 2, height / 2 + 115); 
                      if (window.archBarrierReady) {
      let bbX = width / 2, bbY = height - 100;
      fill(50, 200); stroke(255, 150, 50); strokeWeight(2);
      rect(bbX - 70, bbY - 20, 140, 40, 5);
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(14);
      text("BUILD BARRIER", bbX, bbY);
  }
                  }
              }
          }
      }
  }
}


  

	  function updateWeaponDrops() {
  for (let i = weaponDrops.length - 1; i >= 0; i--) {
    let d = weaponDrops[i];
    
    if (inView(d.x, d.y, 50)) {
        push(); translate(d.x, d.y);
        let hover = sin(frameCount * 0.05 + d.x) * 5;
        translate(0, hover);
        
        fill(255, 200, 0, 150); stroke(255, 150, 0); strokeWeight(2);
        rect(-15, -15, 30, 30, 4);
        
        noStroke();
        if (d.type === "SMG") {
            fill(40); rect(-8, -4, 16, 8, 2); rect(-2, 4, 4, 8); 
        } else if (d.type === "AR") {
            fill(40); rect(-14, -2, 28, 4, 1);
            fill(139, 69, 19); rect(-6, -3, 10, 6, 1); rect(-16, -3, 6, 6, 1);
        } else if (d.type === "SHOTGUN") {
            fill(30); rect(-14, -2, 28, 4, 1);
            fill(15); rect(-2, -3.5, 12, 7, 1);
            fill(50); rect(-14, -3.5, 8, 7, 2);
        }
        pop();
    }

    if (player && player.hp > 0 && dist(player.x, player.y, d.x, d.y) < 30) {
        if (d.type === "SMG") {
            if (dualSmgUnlocked) {
                player.currentWeapon = WEAPONS.DUAL_SMG;
                player.mags["DUAL SMGS"] = 3; 
                player.weaponAmmo["DUAL SMGS"] = WEAPONS.DUAL_SMG.maxAmmo;
                streakMsgText = "DUAL SMGS RELOADED!";
            } else if (smgUnlocked) {
                dualSmgUnlocked = true;
                player.currentWeapon = WEAPONS.DUAL_SMG;
                player.mags["DUAL SMGS"] = 3;
                player.weaponAmmo["DUAL SMGS"] = WEAPONS.DUAL_SMG.maxAmmo;
                streakMsgText = "DUAL SMGS ACQUIRED!";
            } else {
                smgUnlocked = true;
                player.currentWeapon = WEAPONS.SMG;
                player.mags["MACHINE GUN"] = 3;
                player.weaponAmmo["MACHINE GUN"] = WEAPONS.SMG.maxAmmo;
                streakMsgText = "SMG ACQUIRED!";
            }
        } else if (d.type === "SHOTGUN") {
            shotgunUnlocked = true;
            player.currentWeapon = WEAPONS.SHOTGUN;
            player.mags["SHOTGUN"] = 3;
            player.weaponAmmo["SHOTGUN"] = WEAPONS.SHOTGUN.maxAmmo;
            streakMsgText = "SHOTGUN ACQUIRED!";
        } else if (d.type === "AR") {
            arUnlocked = true;
            player.currentWeapon = WEAPONS.ASSAULT_RIFLE;
            player.mags["ASSAULT RIFLE"] = 3;
            player.weaponAmmo["ASSAULT RIFLE"] = WEAPONS.ASSAULT_RIFLE.maxAmmo;
            streakMsgText = "ASSAULT RIFLE ACQUIRED!";
        }
        streakMsgTimer = 90;
        player.reloadTimer = 0;
        sfx.reload(); 
        emit(d.x, d.y, 20, color(255, 200, 0), "SPARK");
        weaponDrops.splice(i, 1);
    }
  }
}

function updateHealthPacks() {
  for (let i = healthPacks.length - 1; i >= 0; i--) {
    let hpk = healthPacks[i];
    
    if (inView(hpk.x, hpk.y, 50)) {
        push(); translate(hpk.x, hpk.y);
        let hover = sin(frameCount * 0.05) * 5;
        translate(0, hover);
        fill(40, 180, 40); stroke(20, 100, 20); strokeWeight(2);
        rect(-12, -12, 24, 24, 6); 
        fill(255); noStroke();
        rect(-3, -8, 6, 16, 1); 
        rect(-8, -3, 16, 6, 1); 
        pop();
    }
    
    if (player && player.hp > 0 && dist(player.x, player.y, hpk.x, hpk.y) < 30) {
      if (player.hp < 100) {
        player.hp = 100;
        sfx.charge(); 
        streakMsgText = "HEALTH RESTORED!";
        streakMsgTimer = 90;
        emit(hpk.x, hpk.y, 20, color(50, 255, 50), "SPARK");
        healthPacks.splice(i, 1);
      }
    }
  }
}
function handleStoryWinLoop() {
    if (!isWin) return; 

    winTimer--;
    
    // --- 1. DRAW THE WIN SCREEN TEXT ---
    push();
    textAlign(CENTER, CENTER);
    fill(100, 255, 100); // Success Green
    textSize(60);
    
    // Custom text based on the story phase
    if (currentLevel === 0) {
        text("PROLOGUE COMPLETE", width/2, height/2 - 40);
    } else if (currentLevel === 1) {
        text("TOWN LIBERATED", width/2, height/2 - 40);
    } else {
        text("SECTOR CLEARED", width/2, height/2 - 40);
    }
    
    textSize(30);
    fill(255);
    text("Preparing next phase...", width/2, height/2 + 30);
    pop();

    // --- 2. HANDLE STORY TRANSITIONS (Arcade Mode Removed) ---
    if (winTimer <= 0) {
        isWin = false; 
        
        if (currentLevel === 0) {
            // Finish Prologue -> Start Level 1 directly
            startAtLevel(1);
        } 
        else if (currentLevel === 1) {
            // Finish Level 1 -> Enter World Building / Town Management
            inWorldBuildingMenu = true;
            inOverworldView = true;
            window.towersDefeated = true; // Lock in the town liberation
        } 
        else {
            // Finish Level 2+ -> Open Upgrades (which then leads to Travel/Next Level)
            inUpgradeMenu = true;
            
            // Save the game automatically when a sector is cleared
            saveGame();
        }
    }
}

function getSafeSpawn(away) {
  let safe = false, rx, ry, att = 0;
  
  // 1. Define the true bounds of the current level
  let bndX = 1200, bndY = 1200; // Default
  if (currentLevel === 1) { bndX = 3600; bndY = 3600; } // The massive 7x7 city grid
  else if (currentLevel >= 3 && currentLevel <= 5) { bndX = 1600; bndY = 1600; }
  
  while (!safe && att < 1000) {
    // 2. Uniformly pick a spot anywhere on the entire map
    rx = random(-bndX, bndX);
    ry = random(-bndY, bndY);
    
    let hit = false;
    
    // 3. Keep enemies from spawning directly on the player's head
    if (away && player && player.hp > 0 && dist(rx, ry, player.x, player.y) < 500) hit = true;
    
    // 4. Check collisions against ALL buildings, walls, barriers, and fortresses
    if (!hit) {
        for (let b of buildings) { 
            if (currentLevel === 4 && b.isPalm) continue; 
            if (currentLevel === 6 && (b.isAlienPlant || b.isEnergyPole)) continue; 
            if ((currentLevel === 1 || currentLevel === 2) && b.isGrassLot) continue; 
            
            if (rx + 40 > b.x - b.w / 2 && rx - 40 < b.x + b.w / 2 && ry + 40 > b.y - b.h / 2 && ry - 40 < b.y + b.h / 2) { 
                hit = true; break; 
            } 
        }
    }

    // 5. Check collisions against the newly separated parking lot cars
    if (!hit) {
        for (let c of parkingCars) {
            let cw = 50, ch = 90; 
            if (rx + 40 > c.x - cw / 2 && rx - 40 < c.x + cw / 2 && ry + 40 > c.y - ch / 2 && ry - 40 < c.y + ch / 2) { 
                hit = true; break; 
            }
        }
    }
    
    if (!hit) safe = true; 
    att++;
  }
  
  // Fallback: If 1000 random spots fail, drop them slightly off-screen from the player
  return safe ? { x: rx, y: ry } : { x: player ? player.x + 600 : 0, y: player ? player.y + 600 : 0 };
}

function triggerGateAmbush(fortressY, isNorthGate = false) {
    let spawnY = fortressY < 0 ? -3700 : 4900; 
    let spawnX1 = 600;  
    let spawnX2 = -200; 
    
    if (isNorthGate) window.northGateBreachedStatus = true;
    else window.southGateBreachedStatus = true;

    // MERGE ACTIVE AMBUSHES (Scenario 4)
    if (nm0AmbushActive) {
        nm0AmbushKills += 150; 
        window.ambushSpawnsRemaining += 100;
        streakMsgText = "MULTIPLE BREACHES!";
    } else {
        nm0AmbushActive = true; 
        nm0AmbushKills = 150; 
        window.ambushSpawnsRemaining = 100;
        objectiveTimer = 360; 
        streakMsgText = isNorthGate ? "NORTH GATE BREACHED!" : "SOUTH GATE BREACHED!"; 
    }
    streakMsgTimer = 120;
    
    // --- BATCH 1: EAST ---
    for(let i=0; i<21; i++) enemiesList.push(new Character(spawnX1 + random(-250, 250), spawnY + random(-50, 50), false, "ARMORED_STANDARD"));
    for(let i=0; i<2; i++) enemiesList.push(new Character(spawnX1 + random(-100, 100), spawnY + random(-50, 50), false, "ARMORED"));
    for(let i=0; i<2; i++) enemiesList.push(new Character(spawnX1 + random(-300, 300), spawnY < 0 ? -3600 : 4800, false, "AERIAL"));

    // --- BATCH 2: WEST ---
    for(let i=0; i<21; i++) enemiesList.push(new Character(spawnX2 + random(-250, 250), spawnY + random(-50, 50), false, "ARMORED_STANDARD"));
    for(let i=0; i<2; i++) enemiesList.push(new Character(spawnX2 + random(-100, 100), spawnY + random(-50, 50), false, "ARMORED"));
    for(let i=0; i<2; i++) enemiesList.push(new Character(spawnX2 + random(-300, 300), spawnY < 0 ? -3600 : 4800, false, "AERIAL"));
    
        // --- BATCH 2: WEST ---
    for(let i=0; i<21; i++) enemiesList.push(new Character(spawnX2 + random(-250, 250), spawnY + random(-50, 50), false, "ARMORED_STANDARD"));
    for(let i=0; i<2; i++) enemiesList.push(new Character(spawnX2 + random(-100, 100), spawnY + random(-50, 50), false, "ARMORED"));
    for(let i=0; i<2; i++) enemiesList.push(new Character(spawnX2 + random(-300, 300), spawnY < 0 ? -3600 : 4800, false, "AERIAL"));
    
    for(let e of enemiesList) { if(!e.isFriendly && e.hp > 0 && !e.dead) { e.state = "CHASE"; e.loseSightTimer = 999; } }

    // Tag the 50 enemies we just spawned!
    for(let i = enemiesList.length - 50; i < enemiesList.length; i++) {
        if (enemiesList[i]) enemiesList[i].isAmbush = true;
    }


    // If Savior Route, wake up the town allies
    if (window.towersDefeated) {
        let candidates = enemiesList.filter(e => e.eType === "NORMAL" || e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "MOLOTOV");
        for(let e of candidates) { 
            if (!e.isFriendly) globalPopulation++;
            e.isFriendly = true; e.state = "CHASE"; e.hp = 300; e.loseSightTimer = 999; 
        }
    }
}




	

function spawnSingleEnemy() {
  // Do not spawn random hostiles if the town is liberated, ambush is active, or in specific story scenes!
 
  if (currentLevel === 0 || nm0AmbushActive || window.towersDefeated) return;
  if (currentLevel === 3 && isStoryMode) return;

  let baseEnemyCount = 0;
  let armoredCount = 0, bugCount = 0, molotovCount = 0, saucerCount = 0;
  let gatorCount = 0, redSaucerCount = 0, snailCount = 0, hybridCount = 0;
  let armoredStandardCount = 0, aerialCount = 0; 
  
  for (let i = 0; i < enemiesList.length; i++) { 
      let e = enemiesList[i];
      
      // --- THE FIX: Ignore friendly military members when counting map population! ---
      if (e.isFriendly) continue; 
      
      let eType = e.eType;
      if (eType !== "BUG") baseEnemyCount++;
      
      if (eType === "ARMORED") armoredCount++; 
      if (eType === "ARMORED_STANDARD") { armoredCount++; armoredStandardCount++; } 
      if (eType === "BUG") bugCount++; 
      if (eType === "SNAIL") snailCount++; 
      if (eType === "MOLOTOV") molotovCount++;
      if (eType === "SAUCER") saucerCount++;
      if (eType === "ALIEN_GATOR") gatorCount++;
      if (eType === "SAUCER_RED") redSaucerCount++;
      if (eType === "SNAIL_HYBRID") hybridCount++; 
      if (eType === "AERIAL" || eType === "AERIAL_PISTOL") aerialCount++; 
  }
  
  // Now this will only stop spawning if there are 80 actual HOSTILES on the map
  if (baseEnemyCount >= TARGET_ENEMY_COUNT) return;

  let eS = getSafeSpawn(true), type = "NORMAL", r = random();
  
  if (currentLevel >= 4 && currentLevel <= 6) {
// REPLACE THIS INSIDE LEVEL 4-6 / LEVEL 6 BUG BLOCKS:
if (bugCount < 10) {
    let bugsToSpawn = min(3, 10 - bugCount); 
    for (let i = 0; i < bugsToSpawn; i++) {
        // Use pre-calculated baseEnemyCount instead of a heavy .filter() scan
        if (baseEnemyCount < TARGET_ENEMY_COUNT) {
            enemiesList.push(new Character(eS.x + random(-40, 40), eS.y + random(-40, 40), false, "BUG"));
        }
    }
    return;
}

      if (currentLevel >= 5 && snailCount < 5) {
          enemiesList.push(new Character(eS.x, eS.y, false, "SNAIL"));
          return;
      }
  }
  
  if (currentLevel === 1) {
      if (r > 0.85) type = "ARMORED";
      else type = "NORMAL";
  }
  else if (currentLevel === 2) {
      if (r > 0.85) type = "ARMORED";
      else if (r > 0.5) type = "AERIAL";
      else type = isStoryMode ? "FEMALE_PISTOL" : "NORMAL";
  }
  else if (currentLevel === 3) {
      if (r > 0.9) type = "ARMORED";
      else if (r > 0.7) type = "AERIAL";
      else if (r > 0.3) {
          if (bugCount <= 10) {
              for (let i = 0; i < 3; i++) enemiesList.push(new Character(eS.x + random(-40, 40), eS.y + random(-40, 40), false, "BUG"));
              return;
          } else type = "NORMAL";
      } else type = "NORMAL";
  }
    else if (currentLevel === 4) {
      type = "MILITARY_NEUTRAL";
  }

  else if (currentLevel === 5) {
      if (r > 0.8) type = "ARMORED_STANDARD";
      else if (r > 0.7) type = "ARMORED";
      else if (r > 0.6 && snailCount < 3) type = "SNAIL";
      else if (r > 0.5) type = (molotovCount < 3) ? "MOLOTOV" : "NORMAL";
      else if (r > 0.2) type = "AERIAL_PISTOL";
      else type = "NORMAL";
  }
  else if (currentLevel === 6) {
      if (r > 0.9 && saucerCount < 2) type = "SAUCER";
      else if (r > 0.7 && redSaucerCount < 3) type = "SAUCER_RED";
      else if (r > 0.6 && snailCount < 3) type = "SNAIL";
      else if (r > 0.3 && gatorCount < 5) type = "ALIEN_GATOR";
      else {
         if (bugCount < 15) {
    for (let i = 0; i < 3; i++) {
        if (baseEnemyCount < TARGET_ENEMY_COUNT) {
            enemiesList.push(new Character(eS.x + random(-40, 40), eS.y + random(-40, 40), false, "BUG"));
        }
    }
    return;
}if (bugCount < 15) {
    for (let i = 0; i < 3; i++) {
        if (baseEnemyCount < TARGET_ENEMY_COUNT) {
            enemiesList.push(new Character(eS.x + random(-40, 40), eS.y + random(-40, 40), false, "BUG"));
        }
    }
    return;


          } else {
              type = random() > 0.5 ? "ALIEN_GATOR" : "SNAIL"; 
          }
      }
  }
  else if (currentLevel === 7) {
      let pool = [];
      for (let i = 0; i < 10 - hybridCount; i++) pool.push("SNAIL_HYBRID");
      for (let i = 0; i < 5 - gatorCount; i++) pool.push("ALIEN_GATOR");
      for (let i = 0; i < 12 - armoredStandardCount; i++) pool.push("ARMORED_STANDARD");
      for (let i = 0; i < 3 - redSaucerCount; i++) pool.push("SAUCER_RED");
      
      if (pool.length > 0) {
          type = pool[floor(random(pool.length))];
      } else {
          type = random() > 0.5 ? "ARMORED_STANDARD" : "SNAIL_HYBRID"; 
      }
  }
  
  if (currentLevel !== 6 && currentLevel !== 7 && (type === "ARMORED" || type === "ARMORED_STANDARD") && armoredCount >= 3) {
      type = (currentLevel === 2 && isStoryMode) ? "FEMALE_PISTOL" : "NORMAL";
  }
  
  if (currentLevel !== 6 && currentLevel !== 7 && (type === "AERIAL" || type === "AERIAL_PISTOL") && aerialCount >= 5) {
      type = (currentLevel === 2 && isStoryMode) ? "FEMALE_PISTOL" : "NORMAL"; 
  }
  
  enemiesList.push(new Character(eS.x, eS.y, false, type));
}


function spawnAmbushReinforcement() {
    if (!nm0AmbushActive || window.ambushSpawnsRemaining <= 0 || !started || isDead || isWin) return;
    
    window.ambushSpawnsRemaining--;

    // NEW: Handle Level 4 Grey Spawns
    if (currentLevel === 4) {
        let sX = random() > 0.5 ? player.x - 1200 : player.x + 1200;
        let sY = player.y + random(-800, 800);
        let e = new Character(sX, sY, false, "NM0_GREY_FATIGUE");
        e.state = "CHASE"; e.loseSightTimer = 999; e.isAmbush = true;
        enemiesList.push(e);
        return;
    }
    
    
    let spawnY = (currentLevel === 1) ? 4950 : 1800;
    let aerY = (currentLevel === 1) ? 4900 : 1750;
    
    // 50/50 chance to spawn on the East (600) or West (-200) flank
    let sX = random() > 0.5 ? 600 : -200; 
    let sY = spawnY + random(-50, 50);
    
    let r = random();
    let type = "ARMORED_STANDARD";
    
    // Maintain unit ratios for reinforcements
    if (r > 0.9) { type = "AERIAL"; sY = aerY; }
    else if (r > 0.8) { type = "ARMORED"; }
    
        let e = new Character(sX + random(-150, 150), sY, false, type);
    e.state = "CHASE";
    e.loseSightTimer = 999;
    e.isAmbush = true; 
    enemiesList.push(e);

}




function triggerExplosion(ex, ey, rad, isMolotov = false, sourceIsPlayer = true) {
  sfx.explosion(); 
  screenShake = rad > 160 ? 40 : 30; 
  spawnSplatter(ex, ey, "SCORCH");
  emit(ex, ey, 40, color(255, random(100, 200), 0), "EXPLOSION"); 
  emit(ex, ey, 20, color(50), "SMOKE");
  if (isMolotov) fires.push(new FireZone(ex, ey, rad));
  
  let explodingCars = [];
  
  // --- 1. DESTRUCTIBLE BUILDINGS & CARS ---
  for (let i = buildings.length - 1; i >= 0; i--) {
      let b = buildings[i];
      if (b.isCar && dist(ex, ey, b.x, b.y) < rad) {
          explodingCars.push({x: b.x, y: b.y}); buildings.splice(i, 1);
      }
      if (b.isTower && b.hp > 0 && sourceIsPlayer && dist(ex, ey, b.x, b.y) < rad + b.w/2) {
          b.hp -= 300; b.hitFlash = 4;
          if (b.hp <= 0) { triggerExplosion(b.x, b.y, 250, false, true); screenShake = 60; }
      }
      
            if (b.isGovFortress && b.hp > 0 && sourceIsPlayer && Math.abs(ex - b.x) < 300) {
                    let gateY = b.y < 0 ? b.y + b.h/2 - 80 : b.y - b.h/2;
          if (dist(ex, ey, b.x, gateY) < rad + 300) {
              b.hp -= 300; b.hitFlash = 4;
              if (b.hp <= 0) { 
                  triggerExplosion(b.x, gateY, 250, false, true); screenShake = 60; 
                  let fY = b.y; 
                  let isNorth = b.y < 0; // <--- ADD THIS
                  if (typeof triggerGateAmbush === 'function') setTimeout(() => { if (started) triggerGateAmbush(fY, isNorth); }, 2000);
              }
          }

      }
}

  for (let i = parkingCars.length - 1; i >= 0; i--) {
      let c = parkingCars[i];
      if (dist(ex, ey, c.x, c.y) < rad) {
          explodingCars.push({x: c.x, y: c.y}); parkingCars.splice(i, 1);
      }
  }

  // --- 2. PLAYER DAMAGE ---
  if (player && player.hp > 0 && dist(ex, ey, player.x, player.y) < rad) { 
      if (!explosiveArmorUnlocked || isMolotov || !sourceIsPlayer) {
          let dRes = player.takeDamage(60); 
          if (dRes.blocked) { 
              emit(player.x, player.y, dRes.broken ? 30 : 15, color(0, 200, 255), "SPARK"); sfx.hitArmor(); 
          } else { 
              emit(player.x, player.y, 15, color(90, 0, 0), "BLOOD"); 
          }
          if (player.hp <= 0 && !player.dead) { 
              player.dead = true; sfx.deathGrunt(); 
              let a = atan2(player.y - ey, player.x - ex); 
              corpses.push(new Corpse(player.x, player.y, player.moveAngle, player.aimAngle, player.shirtCol, player.pantsCol, 5, a, player.decals, player.currentWeapon, a, "NORMAL", player.bodyW, player.bodyH)); 
              playerRespawnTimer = 0; 
          } 
      }
  }

  // --- 3. ENEMY & ALLY DAMAGE ---
  for (let i = enemiesList.length - 1; i >= 0; i--) {
    let e = enemiesList[i];
    
    // STRICT TEAM FILTER: Player hits enemies ONLY. Enemies hit allies ONLY.
    let shouldHit = (sourceIsPlayer !== e.isFriendly);
    if (!shouldHit) continue;

    if (e.hp > 0 && dist(ex, ey, e.x, e.y) < rad && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && e.eType !== "SAUCER" && e.eType !== "SAUCER_RED") {
      
      // Apply Damage: Insta-kill hostiles, deal 150 damage to allies
      if (e.isFriendly) {
          e.takeDamage(150);
      } else {
          e.hp = 0; 
      }
      
      if (e.hp <= 0 && !e.dead) {
          e.dead = true; 
          let a = atan2(e.y - ey, e.x - ex); 
          let bCol = (e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0);
          
          emit(e.x, e.y, 40, bCol, "GORE"); 
          if (e.eType === "ALIEN_GATOR") { emit(e.x, e.y, 40, color(30, 180, 30), "GORE"); }
          corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 5, a, e.decals, e.currentWeapon, a, e.eType, e.bodyW, e.bodyH));
          spawnSplatter(e.x, e.y, "BLOOD", bCol);
          
          processKill(e.x, e.y, false, e.eType, e.isFriendly);
          
          enemiesList.splice(i, 1); 
          if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100);
      } else if (e.hp > 0) {
          sfx.hitBody(); emit(e.x, e.y, 15, color(90, 0, 0), "BLOOD");
      }
    }
  }

  // --- 4. CAR CHAIN EXPLOSIONS ---
  for (let c of explodingCars) {
    setTimeout(() => { if (started) triggerExplosion(c.x, c.y, 180, false, sourceIsPlayer); }, random(100, 250));
  }
}
function triggerRocketExplosion(ex, ey, sourceIsPlayer, directHitTarget = null) {
  sfx.explosion(); 
  screenShake = 30; 
  spawnSplatter(ex, ey, "SCORCH");
  emit(ex, ey, 40, color(255, 150, 0), "EXPLOSION"); 
  emit(ex, ey, 20, color(50), "SMOKE");
  
  let rRad = 140; 

  // --- 1. PLAYER DAMAGE ---
  if (player.hp > 0 && dist(ex, ey, player.x, player.y) < rRad) {
      if (!explosiveArmorUnlocked || !sourceIsPlayer) {
          let dRes = player.takeDamage(60); 
          if (dRes.blocked) { 
              emit(player.x, player.y, dRes.broken ? 30 : 15, color(0, 200, 255), "SPARK"); 
              sfx.hitArmor(); 
          } else { 
              emit(player.x, player.y, 15, color(90, 0, 0), "BLOOD"); 
          }
          if (player.hp <= 0 && !player.dead) {
              player.dead = true; sfx.deathGrunt();
              corpses.push(new Corpse(player.x, player.y, player.moveAngle, player.aimAngle, player.shirtCol, player.pantsCol, 5, 0, player.decals, player.currentWeapon, 0, "NORMAL", player.bodyW, player.bodyH));
              playerRespawnTimer = 90;
          }
      }
  }

  let isAirburst = directHitTarget && (
      directHitTarget.eType === "AERIAL" || 
      directHitTarget.eType === "AERIAL_PISTOL" ||
      directHitTarget.eType === "SAUCER" ||
      directHitTarget.eType === "SAUCER_RED"
  );

  // --- 2. ENEMY / ALLY DAMAGE ---
  for (let i = enemiesList.length - 1; i >= 0; i--) {
      let e = enemiesList[i];
      
      // STRICT TEAM FILTER: Player hits enemies ONLY. Enemies hit allies ONLY.
      let shouldHit = (sourceIsPlayer !== e.isFriendly);
      if (!shouldHit) continue;
      
      let isAerial = (e.eType === "AERIAL" || e.eType === "AERIAL_PISTOL" || e.eType === "SAUCER" || e.eType === "SAUCER_RED");
      let hitByExplosion = false;
      
      if (e === directHitTarget) { hitByExplosion = true; }
      else if (!isAerial) { hitByExplosion = true; } 
      else if (isAerial && isAirburst) { hitByExplosion = true; }

      if (hitByExplosion && e.hp > 0 && dist(ex, ey, e.x, e.y) < rRad) {

          let dmg = 100; 
          if (e === directHitTarget) dmg += 250; 

          e.takeDamage(dmg);
          let bCol = (e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0);

          if (e.hp <= 0 && !e.dead) {
              e.dead = true;
              let a = atan2(e.y - ey, e.x - ex);

              if (e.eType === "SAUCER" || e.eType === "SAUCER_RED") { 
                  triggerExplosion(e.x, e.y, 160); 
              } 
              else if (e.eType === "AERIAL" || e.eType === "AERIAL_PISTOL") {
                  let choices = [11, 5, 10]; 
                  let dT = choices[floor(random(choices.length))];
                  corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, dT, a, e.decals, e.currentWeapon, a, e.eType, e.bodyW, e.bodyH));
                  
                  emit(e.x, e.y, 40, color(255, 100, 0), "EXPLOSION");
                  spawnSplatter(e.x, e.y, "BLOOD", color(90, 0, 0));
                  if(dT === 10) emit(e.x, e.y, 120, color(90, 0, 0), "GORE");
              }
              else {
                  emit(e.x, e.y, 60, bCol, "GORE");
                  let choices = [2, 5, 7, 10, 11]; 
                  let dT = choices[floor(random(choices.length))];
                  corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, dT, a, e.decals, e.currentWeapon, a, e.eType, e.bodyW, e.bodyH));
                  spawnSplatter(e.x, e.y, "BLOOD", bCol);
              }

              processKill(e.x, e.y, false, e.eType, e.isFriendly);
              enemiesList.splice(i, 1); 
              if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100);
          } else if (e.hp > 0) {
              if ((e.eType === "ARMORED" && e.hp > 300) || (e.eType === "ARMORED_STANDARD" && e.hp > 50) || e.eType === "SAUCER" || e.eType === "SAUCER_RED" || (e.eType === "SNAIL_HYBRID" && e.hp > 150)) {
                  sfx.hitArmor(); 
                  emit(e.x, e.y, 10, color(255, 200, 0), "SPARK");
              } else { 
                  sfx.hitBody(); 
                  emit(e.x, e.y, 15, bCol, "BLOOD"); 
              }
          }
      }
  }
}









class FireZone {
    constructor(x, y, r) { 
        this.x = x; this.y = y; this.r = r; this.life = 300; 
        this.blobs = [];
        
        // Generate a cluster of flames based on the radius
        let count = floor(r * 0.6); 
        for(let i = 0; i < count; i++) {
            // Using random() * random() concentrates the fire in the center
            let d = random() * random() * r * 0.9; 
            let a = random(TWO_PI);
            this.blobs.push({
                ox: cos(a) * d, 
                oy: sin(a) * d, 
                sz: random(r * 0.4, r * 0.8), // Different sized flames
                seed: random(100) // Unique seed so they flicker independently
            });
        }
    }
    
    update() {
        this.life--; let dmg = 5 / 60;
        if (player.hp > 0 && dist(this.x, this.y, player.x, player.y) < this.r) { 
            player.takeDamage(dmg); 
            if (player.hp <= 0 && !player.dead) { 
                player.dead = true; sfx.deathGrunt(); 
                corpses.push(new Corpse(player.x, player.y, player.moveAngle, player.aimAngle, player.shirtCol, player.pantsCol, 0, 0, player.decals, player.currentWeapon, 0, "NORMAL", player.bodyW, player.bodyH)); 
                playerRespawnTimer = 90; 
            } 
        }
        
        // Added some dark smoke to spawn directly out of the fire!
        if (frameCount % 4 === 0) emit(this.x + random(-this.r, this.r), this.y + random(-this.r, this.r), 1, color(255, 100, 0), "SPARK");
        if (frameCount % 8 === 0) emit(this.x + random(-this.r, this.r), this.y + random(-this.r, this.r), 1, color(50, 150), "SMOKE");
    }
    
    show() { 
        push(); translate(this.x, this.y); noStroke(); 
        
        // Fade out smoothly as the fire dies out
        let alphaFade = map(this.life, 0, 60, 0, 1, true);
        
        for (let b of this.blobs) {
            // Make each blob shrink and grow independently to simulate licking flames
            let flicker = sin(frameCount * 0.15 + b.seed) * (b.sz * 0.2);
            let currentSz = b.sz + flicker;
            
            // Deep red/orange outer heat
            fill(200, 50, 0, 160 * alphaFade); 
            ellipse(b.ox, b.oy, currentSz * 1.3, currentSz * 1.3);
            
            // Bright orange middle
            fill(255, 120, 0, 200 * alphaFade); 
            ellipse(b.ox, b.oy, currentSz, currentSz);
            
            // Yellow-hot core
            fill(255, 220, 0, 230 * alphaFade); 
            ellipse(b.ox, b.oy, currentSz * 0.6, currentSz * 0.6);
        }
        pop(); 
    }
}


function updateFires() { 
    for (let i = fires.length - 1; i >= 0; i--) { 
        if (doTick) fires[i].update(); 
        if (inView(fires[i].x, fires[i].y, fires[i].r + 50)) fires[i].show(); 
        if (fires[i].life <= 0) fires.splice(i, 1); 
    } 
}

class SludgeZone {
    constructor(x, y, r, life) { this.x = x; this.y = y; this.r = r; this.life = life; this.maxLife = life; }
    update() {
        this.life--; let dmg = 5 / 60; 
        if (player.hp > 0 && dist(this.x, this.y, player.x, player.y) < this.r) { 
            player.takeDamage(dmg); 
            if (player.hp <= 0 && !player.dead) { player.dead = true; sfx.deathGrunt(); corpses.push(new Corpse(player.x, player.y, player.moveAngle, player.aimAngle, player.shirtCol, player.pantsCol, 0, 0, player.decals, player.currentWeapon, 0, "NORMAL", player.bodyW, player.bodyH)); playerRespawnTimer = 90; } 
        }
        if (frameCount % 10 === 0) emit(this.x + random(-this.r, this.r), this.y + random(-this.r, this.r), 1, color(50, 200, 50), "BLOOD");
    }
    show() { 
        push(); translate(this.x, this.y); noStroke(); 
        let a = map(this.life, 0, 30, 0, 150, true); 
        fill(20, 100, 20, a); ellipse(0, 0, this.r * 2, this.r * 2); 
        fill(50, 150, 50, a * 0.8); ellipse(0, 0, this.r * 1.4, this.r * 1.4); 
        pop(); 
    }
}

function updateSludges() { 
    for (let i = sludges.length - 1; i >= 0; i--) { 
        if (doTick) sludges[i].update(); 
        if (inView(sludges[i].x, sludges[i].y, sludges[i].r + 50)) sludges[i].show(); 
        if (sludges[i].life <= 0) sludges.splice(i, 1); 
    } 
}

function hasLOS(x1, y1, x2, y2) {
  // OPTIMIZATION: Bounding box filter to drastically reduce checks on Level 6
  let minX = Math.min(x1, x2) - 50, maxX = Math.max(x1, x2) + 50;
  let minY = Math.min(y1, y2) - 50, maxY = Math.max(y1, y2) + 50;
  
  let relB = [];
for (let b of buildings) { 
	if (b.isCropField || b.isMarket || b.isFence) continue;
	
      if (currentLevel === 4 && b.isPalm) continue; 
      if (currentLevel === 6 && (b.isAlienPlant || b.isEnergyPole)) continue; 
      if ((currentLevel === 1 || currentLevel === 2) && (b.isGrassLot || b.isCar)) continue; 
      if (b.x + b.w / 2 > minX && b.x - b.w / 2 < maxX && b.y + b.h / 2 > minY && b.y - b.h / 2 < maxY) {
          relB.push(b);
      }
  }
  if (relB.length === 0) return true;
  
  let steps = Math.max(5, Math.floor(dist(x1, y1, x2, y2) / 20));
  for (let i = 0; i <= steps; i++) {
    let tx = lerp(x1, x2, i / steps), ty = lerp(y1, y2, i / steps);
    for (let b of relB) { 
        if (tx > b.x - b.w / 2 && tx < b.x + b.w / 2 && ty > b.y - b.h / 2 && ty < b.y + b.h / 2) return false; 
    }
  } 
  return true;
}

function inView(x, y, pad = 100) {
  return x >= viewLeft - pad && x <= viewRight + pad && y >= viewTop - pad && y <= viewBottom + pad;
}
function drawBuildingPads() {
  for (let b of activeBuildings) { // Changed to activeBuildings
        if (!inView(b.x, b.y, Math.max(b.w || 0, b.h || 0) + 150)) continue; 

	  if ((currentLevel === 1 || currentLevel === 2) && b.isGrassLot) continue;
    if (currentLevel !== 1 && currentLevel !== 2 && currentLevel !== 6 && !b.isStreetLight && !b.isDumpster && !b.isCar && !b.isPalm && !b.isAlienPlant && !b.isEnergyPole && !b.isPinkPlanet && !b.isPyramid && !b.isChip) {
        let bG = currentLevel === 3 ? 160 : (currentLevel === 4 ? 110 : 170);
        if (currentLevel === 3) fill(205, 175, 130); else fill(bG);
        noStroke(); rect(b.x - b.w / 2 - 20, b.y - b.h / 2 - 20, b.w + 40, b.h + 40, 8); 
   if (b.isCropField || b.isMarket || b.isFence) continue;

	}
  }
  }
function drawGround() {
    if (currentLevel === 0) {
      if (!inUpstairsRoom) { fill(40, 45, 50); } else { fill(210, 180, 140); }
      noStroke(); rect(-1000, -1000, 2000, 2000); return;
  }

	if (currentLevel === 1 || currentLevel === 2 || currentLevel === 6) {
    if (currentLevel === 1) fill(50, 55, 60); else if (currentLevel === 2) fill(30, 32, 35); else fill(color(60, 60, 80)); 
    noStroke(); rect(-5000, -5000, 10000, 10000); 

    let blockSize = 960; let sidewalkW = 45;
    let startBx = (currentLevel === 1) ? -3 : -1;
    let endBx = (currentLevel === 1) ? 3 : 1;
    let startBy = (currentLevel === 1) ? -3 : -1;
    let endBy = (currentLevel === 1) ? 3 : 1;

    for (let bX = startBx; bX <= endBx; bX++) {
        for (let bY = startBy; bY <= endBy; bY++) {
            let startX = bX * 1200 + 120, startY = bY * 1200 + 120;
            
            // Color the block based on its Zone!
            let zone = (currentLevel === 1) ? getCityZone(bX, bY) : "RESIDENTIAL";
            if (currentLevel === 1) {
                if (zone === "PARK") fill(45, 80, 45); 
                else if (zone === "INDUSTRIAL") fill(30, 35, 35); 
                else fill(35, 40, 45); 
            } else if (currentLevel === 2) { fill(25, 27, 30); } 
            else { fill(45, 45, 65); }
            
            noStroke(); rect(startX, startY, blockSize, blockSize, 4);
            
            // Sidewalks
            fill(140, 145, 150); stroke(100, 105, 110); strokeWeight(3);
            rect(startX, startY, blockSize, sidewalkW); 
            rect(startX, startY + blockSize - sidewalkW, blockSize, sidewalkW); 
            rect(startX + blockSize - sidewalkW, startY + sidewalkW, sidewalkW, blockSize - 2*sidewalkW); 
            rect(startX, startY + sidewalkW, sidewalkW, blockSize - 2*sidewalkW); 
            stroke(120, 125, 130); strokeWeight(1); let crackSpacing = 40;
            for (let l = startX + crackSpacing; l < startX + blockSize; l += crackSpacing) { line(l, startY, l, startY + sidewalkW); line(l, startY + blockSize - sidewalkW, l, startY + blockSize); }
            for (let l = startY + crackSpacing; l < startY + blockSize; l += crackSpacing) { if (l > startY + sidewalkW && l < startY + blockSize - sidewalkW) { line(startX, l, startX + sidewalkW, l); line(startX + blockSize - sidewalkW, l, startX + blockSize, l); } }
        }
    }
    
    let loopBounds = (currentLevel === 1) ? [-3600, -2400, -1200, 0, 1200, 2400, 3600] : [-1200, 0, 1200];
    
    if (currentLevel === 1) {
        fill(210); noStroke();
        for (let rx of loopBounds) {
            for (let ry of loopBounds) {
                for (let w = -75; w <= 75; w += 25) { rect(rx + w - 6, ry - 110, 12, 30); rect(rx + w - 6, ry + 80, 12, 30); rect(rx - 110, ry + w - 6, 30, 12); rect(rx + 80, ry + w - 6, 30, 12); }
            }
        }
    }

        let strokeC = (currentLevel === 6) ? color(50, 255, 50, 100) : color(255, 204, 0, 150);
    stroke(strokeC); strokeWeight(4);
    let extBound = (currentLevel === 1) ? 4000 : 1400; 
    
    // --- CULLED VERTICAL LINES ---
    for (let c of loopBounds) {
        if (c < viewLeft - 100 || c > viewRight + 100) continue; // Skip columns far off screen
        
        let startJ = Math.max(-extBound, Math.floor((viewTop - 100) / 80) * 80);
        let endJ = Math.min(extBound, viewBottom + 100);
        
        for (let j = startJ; j < endJ; j += 80) { 
            let skip = false; 
            for(let ry of loopBounds) if (j > ry - 130 && j < ry + 130) skip = true; 
            if (!skip) line(c, j, c, j + 40); 
        }
    }

    // --- CULLED HORIZONTAL LINES ---
    for (let c of loopBounds) {
        if (c < viewTop - 100 || c > viewBottom + 100) continue; // Skip rows far off screen
        
        let startI = Math.max(-extBound, Math.floor((viewLeft - 100) / 80) * 80);
        let endI = Math.min(extBound, viewRight + 100);
        
        for (let i = startI; i < endI; i += 80) { 
            let skip = false; 
            for(let rx of loopBounds) if (i > rx - 130 && i < rx + 130) skip = true; 
            if (!skip) line(i, c, i + 40, c); 
        }
    }

    
    
    if (currentLevel === 2) {
        fill(5, 10, 20, 140); noStroke(); rect(-2000, -2000, 4000, 4000); 
        let ctx = drawingContext;
        for (let b of buildings) {
            if (b.isStreetLight && typeof inView === 'function' && inView(b.x, b.y, 400)) {
                let grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 250);
                grad.addColorStop(0, 'rgba(255, 200, 100, 0.5)');
                grad.addColorStop(0.3, 'rgba(255, 200, 100, 0.2)');
                grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.fillStyle = grad; noStroke(); ellipse(b.x, b.y, 500, 500);
            }
        }
    }
  } else if (currentLevel === 7) {
    let ext = 1400; fill(75); noStroke();
    for (let c = -1200; c <= 1200; c += 1200) { rect(c - 120, -ext, 240, ext * 2); rect(-ext, c - 120, ext * 2, 240); }
    stroke(0, 200, 255, 150); strokeWeight(4);
    for (let c = -1200; c <= 1200; c += 1200) {
        for (let j = -ext; j < ext; j += 80) { line(c, j, c, j + 40); }
        for (let i = -ext; i < ext; i += 80) { line(i, c, i + 40, c); }
    }
    } else if (currentLevel === 3) {
      // --- NEVADA DIRT BASE ---
      fill(215, 190, 150); noStroke(); 
      rect(-1600, -1600, 3200, 3200); 

      // WEST SIDE: Farmland Soil Patch
      fill(180, 150, 110);
      rect(-1000, -800, 900, 1600, 20);

      // EAST SIDE: Dusty Roads
      fill(235, 210, 170); 
      rect(150, -1600, 120, 3200); // Main Vertical Road
      
      // Horizontal Offshoots into the Shanty Town
      rect(270, -600, 800, 80);
      rect(270, -200, 800, 80);
      rect(270, 250, 800, 80);
      rect(270, 600, 800, 80);
// --- WESTERN TOWN GROUND ---
      fill(206, 179, 138); noStroke();
      rect(800, -2180, 1000, 1580, 6);

      fill(222, 197, 152);
      rect(1300 - 130, -2150, 260, 1470);
      fill(213, 187, 143);
      ellipse(1300, -1140, 300, 300); // open plaza circle

      // Continuous boardwalk running both sides of Main Street
      fill(150, 115, 75); noStroke();
      rect(880, -2080, 270, 1330);
      rect(1460, -2080, 260, 1330);
      stroke(112, 84, 52, 160); strokeWeight(1);
      for (let py = -2075; py < -755; py += 16) {
          line(880, py, 1150, py);
          line(1460, py, 1720, py);
      }
      noStroke();

      // Wagon wheel ruts, broken by the plaza
      stroke(176, 149, 109, 140); strokeWeight(6); noFill();
      line(1300 - 48, -2140, 1300 - 48, -1290);
      line(1300 + 48, -2140, 1300 + 48, -1290);
      line(1300 - 48, -990, 1300 - 48, -670);
      line(1300 + 48, -990, 1300 + 48, -670);
      noStroke();

      // Dusty speckle texture (pre-generated, stays still frame to frame)
      if (window.westernDust) {
          fill(182, 154, 113, 100);
          for (let d of window.westernDust) {
              if (inView(d.x, d.y, 20)) ellipse(d.x, d.y, d.sz, d.sz * 0.8);
          }
      }

      // Town entrance archway
      stroke(90, 62, 35); strokeWeight(10); noFill();
      line(1160, -600, 1160, -700);
      line(1440, -600, 1440, -700);
      strokeWeight(14);
      line(1150, -700, 1450, -700);
      noStroke();
      fill(210, 185, 145); stroke(90, 62, 35); strokeWeight(2);
      rect(1230, -685, 140, 34, 3);
      fill(30); noStroke(); textAlign(CENTER, CENTER); textSize(14); textFont('sans-serif');
      text("DRY GULCH", 1300, -668);
  } else {
    // LEVEL 4 & 5 GENERIC FLOOR
    let bgFloor = currentLevel === 4 ? color(80, 100, 40) : color(210, 230, 240); 
    let roadCol = currentLevel === 4 ? color(120, 90, 50) : color(180, 210, 220); 
    fill(bgFloor); noStroke(); rect(-1600, -1600, 3200, 3200); 
    fill(roadCol); 
    let ext = 1600; 
    for (let i = -ext; i <= ext; i += 400) { rect(i - 45, -ext, 90, ext * 2); rect(-ext, i - 45, ext * 2, 90); }
  }
}
















function drawPalmTree(x, y) { fill(90, 60, 30); noStroke(); rect(x - 8, y - 40, 16, 80, 4); fill(40, 140, 40); for (let i = 0; i < 5; i++) { push(); translate(x, y - 40); rotate((i * TWO_PI / 5) + sin(frameCount * 0.02 + x) * 0.2); ellipse(30, 0, 60, 20); pop(); } }

class Splatter {
  constructor(x, y, t = "HIDDEN", col = null) { 
      this.blobs = []; 
      // Pre-allocate max possible blobs to prevent array resizing
      for (let i = 0; i < 20; i++) this.blobs.push({ ox: 0, oy: 0, sz: 0 });
      this.init(x, y, t, col);
  }
  
  init(x, y, t, col) {
      this.x = x; this.y = y; this.t = t; 
      this.active = (t !== "HIDDEN");
      this.c = col || color(90, 0, 0, 220); 
      
      this.blobCount = t === "SCORCH" ? floor(random(12, 20)) : floor(random(8, 16)); 
      let s = t === "SCORCH" ? 50 : 35; 
      
      // Re-assign values to existing objects instead of creating new ones
      for (let i = 0; i < this.blobCount; i++) {
          this.blobs[i].ox = random(-s, s);
          this.blobs[i].oy = random(-s, s);
          this.blobs[i].sz = random(10, t === "SCORCH" ? 45 : 35);
      }
      return this;
  }
  
  show() { 
      if (!this.active) return;
      push(); translate(this.x, this.y); noStroke(); 
      if (this.t === "SCORCH") fill(15, 15, 15, 220); else fill(this.c); 
      for (let i = 0; i < this.blobCount; i++) {
          ellipse(this.blobs[i].ox, this.blobs[i].oy, this.blobs[i].sz, this.blobs[i].sz);
      }
      pop(); 
  }
}

function drawBloodChunks() {
    for (let key in bloodChunks) {
        let coords = key.split(",");
        let cx = parseInt(coords[0]);
        let cy = parseInt(coords[1]);
        
        let worldX = cx * CHUNK_SIZE;
        let worldY = cy * CHUNK_SIZE;
        
        // Only draw the graphics buffer if this sector of the city is on screen
        if (inView(worldX + CHUNK_SIZE/2, worldY + CHUNK_SIZE/2, CHUNK_SIZE)) {
            image(bloodChunks[key], worldX, worldY);
        }
    }
}

function spawnSplatter(x, y, t = "HIDDEN", col = null) {
    if (t === "HIDDEN") return;

    // 1. Define how far the blood/scorch reaches
    let maxSpread = (t === "SCORCH") ? 100 : 70; 

    // 2. Find every chunk this splatter touches (usually 1, sometimes 2 or 4 if on a corner)
    let minCX = Math.floor((x - maxSpread) / CHUNK_SIZE);
    let maxCX = Math.floor((x + maxSpread) / CHUNK_SIZE);
    let minCY = Math.floor((y - maxSpread) / CHUNK_SIZE);
    let maxCY = Math.floor((y + maxSpread) / CHUNK_SIZE);

    // 3. Pre-calculate the blobs so they align perfectly across the seam of multiple chunks
    let blobs = [];
    let blobCount = (t === "SCORCH") ? floor(random(12, 20)) : floor(random(8, 16));
    
    for (let i = 0; i < blobCount; i++) {
        if (t === "SCORCH") {
            blobs.push({ ox: random(-50, 50), oy: random(-50, 50), sz: random(10, 45) });
        } else {
            blobs.push({ ox: random(-35, 35), oy: random(-35, 35), sz: random(10, 35) });
        }
    }

    // 4. Stamp the exact same pattern onto every chunk it overlaps
    for (let cx = minCX; cx <= maxCX; cx++) {
        for (let cy = minCY; cy <= maxCY; cy++) {
            let key = cx + "," + cy;

            if (!bloodChunks[key]) {
                bloodChunks[key] = createGraphics(CHUNK_SIZE, CHUNK_SIZE);
                bloodChunks[key].noStroke();
            }

            let pg = bloodChunks[key];
            let relX = x - (cx * CHUNK_SIZE);
            let relY = y - (cy * CHUNK_SIZE);

            if (t === "SCORCH") pg.fill(15, 15, 15, 220);
            else pg.fill(col || color(90, 0, 0, 220));

            for (let b of blobs) {
                pg.ellipse(relX + b.ox, relY + b.oy, b.sz);
            }
        }
    }
}



function getPatrolBuilding() {
    // If the map hasn't generated buildings yet, return null safely
    if (!buildings || buildings.length === 0) return null;
    
    // Filter out flat ground elements so enemies patrol actual physical structures
    let validBuildings = buildings.filter(b => !b.isGrassLot && !b.isParkingLot && !b.isPond);
    
    // Pick a random valid building
    if (validBuildings.length > 0) {
        return validBuildings[floor(random(validBuildings.length))];
    }
    
    // Failsafe if the map is empty of standard structures
    return buildings[floor(random(buildings.length))];
}

class AcidSpit {
    constructor(x, y, tx, ty) { 
        this.x = x; this.y = y; this.tx = tx; this.ty = ty; 
        this.life = 90; 
        this.vx = (tx - x) / 90; this.vy = (ty - y) / 90; 
        this.gravity = 0.15; this.vz = 0.5 * this.gravity * 90; this.z = 0; 
    }
    update() { 
        this.life--; this.x += this.vx; this.y += this.vy; this.z += this.vz; this.vz -= this.gravity; 
        if (this.life <= 0) { 
            sfx.hitBody(); 
            sludges.push(new SludgeZone(this.tx, this.ty, 60, 300)); 
        } 
    }
    show() { 
        push(); translate(this.tx, this.ty); noFill(); stroke(50, 200, 50, 150 + sin(frameCount * 0.2) * 100); strokeWeight(3); ellipse(0, 0, 40, 40); pop(); 
        push(); translate(this.x, this.y - this.z); fill(50, 200, 50); noStroke(); ellipse(0, 0, 16, 16); fill(100, 255, 100); ellipse(-2, -2, 6, 6); pop(); 
        if (frameCount % 2 === 0) emit(this.x, this.y - this.z, 1, color(50, 200, 50), "BLOOD"); 
    }
}

class Grenade {
  constructor(x, y, tx, ty, isPurple = false) { this.x = x; this.y = y; this.tx = tx; this.ty = ty; this.life = 90; this.vx = (tx - x) / 90; this.vy = (ty - y) / 90; this.gravity = 0.15; this.vz = 0.5 * this.gravity * 90; this.z = 0; this.isPurple = isPurple; }
  update() { this.life--; this.x += this.vx; this.y += this.vy; this.z += this.vz; this.vz -= this.gravity; if (this.life <= 0) { triggerExplosion(this.tx, this.ty, 160, false, false); } }
  show() { push(); translate(this.tx, this.ty); noFill(); stroke(this.isPurple?color(200,0,255):255, 0, 0, 150 + sin(frameCount * 0.2) * 100); strokeWeight(2); ellipse(0, 0, 40, 40); line(-25, 0, 25, 0); line(0, -25, 0, 25); pop(); push(); translate(this.x, this.y - this.z); rotate(frameCount * 0.2 * Math.sign(this.vx || 1)); fill(this.isPurple?color(100,0,150):color(30, 120, 30)); stroke(10); strokeWeight(1); rect(-6, -10, 12, 20, 3); fill(100); rect(-4, -14, 8, 4); if (this.life % 10 < 5) { fill(255, 0, 0); noStroke(); ellipse(0, -12, 4, 4); } pop(); }
}

class Molotov {
  constructor(x, y, tx, ty) { this.x = x; this.y = y; this.tx = tx; this.ty = ty; this.life = 114; this.vx = (tx - x) / 114; this.vy = (ty - y) / 114; this.gravity = 0.1; this.vz = 0.5 * this.gravity * 114; this.z = 0; }
  update() { this.life--; this.x += this.vx; this.y += this.vy; this.z += this.vz; this.vz -= this.gravity; if (this.life <= 0) triggerExplosion(this.tx, this.ty, 140, true, false); }
  show() { push(); translate(this.tx, this.ty); noFill(); stroke(255, 100, 0, 150 + sin(frameCount * 0.2) * 100); strokeWeight(3); ellipse(0, 0, 40, 40); line(-20, 0, 20, 0); line(0, -20, 0, 20); pop(); push(); translate(this.x, this.y - this.z); rotate(frameCount * 0.3); fill(30, 150, 30); stroke(10); strokeWeight(1); rect(-4, -10, 8, 20, 2); fill(255, 150, 0); noStroke(); rect(-2, -15, 4, 10); pop(); if (frameCount % 2 === 0) emit(this.x, this.y - this.z, 1, color(255, 100, 0), "SPARK"); }
}

function updateGrenades() { 
    for (let i = grenades.length - 1; i >= 0; i--) { 
        if (doTick) grenades[i].update(); 
        if (inView(grenades[i].x, grenades[i].y, 100)) grenades[i].show(); 
        if (grenades[i].life <= 0) grenades.splice(i, 1); 
    } 
}
class PlayerGrenade {
    constructor(x, y, a, fuse) { 
        this.x = x; this.y = y; this.a = a; this.life = fuse; 
        this.vx = cos(a) * 6; this.vy = sin(a) * 6; // Arcing physics
        this.z = 15; this.vz = 2; this.gravity = 0.2; 
    }
    update() { 
        this.life--; this.x += this.vx; this.y += this.vy; this.z += this.vz; this.vz -= this.gravity; 
        if (this.z <= 0) { this.z = 0; this.vz *= -0.5; this.vx *= 0.6; this.vy *= 0.6; } // Bouncing
        
        if (this.life <= 0) { 
            // AIRBURST MECHANIC: If grenade explodes off the ground, shred flying enemies!
            if (this.z > 2) {
                for (let i = enemiesList.length - 1; i >= 0; i--) {
                    let e = enemiesList[i];
                    let isAerial = (e.eType === "AERIAL" || e.eType === "AERIAL_PISTOL" || e.eType === "SAUCER" || e.eType === "SAUCER_RED");
                    
                    if (isAerial && e.hp > 0 && dist(this.x, this.y, e.x, e.y) < 130) {
                        e.takeDamage(350); // Direct heavy flak damage
                        
                        if (e.hp <= 0 && !e.dead) {
                            e.dead = true;
                            let a = atan2(e.y - this.y, e.x - this.x);
                            
                            if (e.eType === "SAUCER" || e.eType === "SAUCER_RED") { 
                                triggerExplosion(e.x, e.y, 160); 
                            } else { 
                                emit(e.x, e.y, 40, color(255, 100, 0), "EXPLOSION"); sfx.explosion();
                                spawnSplatter(e.x, e.y, "BLOOD", color(90, 0, 0));
                                corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 11, a, e.decals, e.currentWeapon, a, e.eType, e.bodyW, e.bodyH));
                            }
                            processKill(e.x, e.y, false, e.eType, e.isFriendly);
                            enemiesList.splice(i, 1); 
                            if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100);
                        } else {
                            // Hit marker for surviving Saucers
                            sfx.hitArmor(); emit(e.x, e.y, 10, color(255, 200, 0), "SPARK");
                        }
                    }
                }
            }
            // Standard explosion for the ground units below it
            triggerExplosion(this.x, this.y, 130, false, true); 
        }
    }
    show() { 
        push(); translate(this.x, this.y - this.z); rotate(frameCount * 0.2 * Math.sign(this.vx || 1)); 
        fill(40, 120, 40); stroke(10); strokeWeight(1); ellipse(0, 0, 12, 16); fill(20); rect(-3, -10, 6, 4); pop(); 
    }
}
                    


// THIS IS THE MISSING FUNCTION THAT WAS CAUSING THE CRASH!
function updatePlayerGrenades() {
    for (let i = playerGrenades.length - 1; i >= 0; i--) {
        if (doTick) playerGrenades[i].update();
        if (inView(playerGrenades[i].x, playerGrenades[i].y, 100)) playerGrenades[i].show();
        if (playerGrenades[i].life <= 0) playerGrenades.splice(i, 1);
    }
}
class WaterPuddle {
    constructor(x, y, r, life) { 
        this.x = x; this.y = y; this.r = r; this.life = life; this.maxLife = life;
        this.blobs = []; 
        // Match the exact splatter texture (many small dots) instead of giant uniform circles
        let count = 60; // Enough to fill the large radius with texture
        for(let i=0; i<count; i++) {
            // Using random() * random() concentrates the liquid in the center, tapering off jaggedly at the edges
            let d = random() * random() * r; 
            let ang = random(TWO_PI);
            // Size them exactly like the blood splatter decals (10 to 35 pixels)
            this.blobs.push({ox: cos(ang) * d, oy: sin(ang) * d, sz: random(10, 35)});
        }
    }
    update() {
        this.life--;
        for (let e of enemiesList) {
            // Keep enemies permanently wet as long as they stand in the puddle!
            if (dist(this.x, this.y, e.x, e.y) < this.r) { e.wetTimer = Math.max(e.wetTimer || 0, 5); }
        }
    }
    show() {
        push(); translate(this.x, this.y); noStroke();
        let a = map(this.life, 0, 60, 0, 150, true);
        fill(100, 180, 255, a); // Translucent watery blue (RESTORED!)
        for(let b of this.blobs) ellipse(b.ox, b.oy, b.sz, b.sz);
        pop();
    }
}


function updateWaterPuddles() {
    for (let i = waterPuddles.length - 1; i >= 0; i--) {
        if (doTick) waterPuddles[i].update();
        if (inView(waterPuddles[i].x, waterPuddles[i].y, 100)) waterPuddles[i].show();
        if (waterPuddles[i].life <= 0) waterPuddles.splice(i, 1);
    }
}

class PlayerFlask {
    constructor(x, y, a, fuse) { 
        this.x = x; this.y = y; this.a = a; this.life = fuse; 
        this.vx = cos(a) * 6; this.vy = sin(a) * 6; 
        this.z = 15; this.vz = 2; this.gravity = 0.2; 
    }
    update() { 
        this.life--; this.x += this.vx; this.y += this.vy; this.z += this.vz; this.vz -= this.gravity; 
        if (this.z <= 0) { this.z = 0; this.life = 0; } // Flasks shatter instantly on impact, no bouncing!
        
        if (this.life <= 0) {
            sfx.hitArmor(); // Glass shatter sound placeholder
            emit(this.x, this.y, 25, color(150, 200, 255), "SPARK"); // Splash particles
            waterPuddles.push(new WaterPuddle(this.x, this.y, 150, 600)); // 15ft puddle, lasts 10 secs
            
            for (let e of enemiesList) {
                if (dist(this.x, this.y, e.x, e.y) < 150) {
                    e.wetTimer = 720; // Direct splash gives exactly 6 seconds of wetness!
                }
            }
        }
    }
    show() { 
        push(); translate(this.x, this.y - this.z); rotate(frameCount * 0.2 * Math.sign(this.vx || 1)); 
        fill(150, 200, 255, 220); stroke(220); strokeWeight(1); // Glassy water color
        beginShape(); vertex(-5, 8); vertex(5, 8); vertex(3, -4); vertex(-3, -4); endShape(CLOSE); // Erlenmeyer shape
        fill(220, 255); rect(-2, -8, 4, 4); // White cap/neck
        pop(); 
    }
}

function updatePlayerFlasks() {
    for (let i = playerFlasks.length - 1; i >= 0; i--) {
        if (doTick) playerFlasks[i].update();
        if (inView(playerFlasks[i].x, playerFlasks[i].y, 100)) playerFlasks[i].show();
        if (playerFlasks[i].life <= 0) playerFlasks.splice(i, 1);
    }
}







// --- POOLING HELPER FUNCTIONS ---
function spawnOrb(x, y, isPurple = false, isPink = false) {
    for (let i = 0; i < orbs.length; i++) {
        if (!orbs[i].active) return orbs[i].init(x, y, isPurple, isPink);
    }
    let o = new Orb();
    orbs.push(o);
    return o.init(x, y, isPurple, isPink);
}

function spawnBullet(x, y, a, iP, tH, w, shooter = null) {
    if (iP) totalShotsFired++; // Tracks player shots
    
    for (let i = 0; i < bullets.length; i++) {
        if (!bullets[i].active) {
            let b = bullets[i].init(x, y, a, iP, tH, w);
            b.shooter = shooter;
            return b;
        }
    }
    let b = new Bullet();
    bullets.push(b);
    b.init(x, y, a, iP, tH, w);
    b.shooter = shooter;
    return b;
}

   class Lightning {
    constructor(pts) { 
        this.pts = pts; // <--- The missing link that caused the crash!
        this.life = 15; 
        this.maxLife = 15;
        this.segments = [];
    
        // Subdivide points to make a realistic, jagged arc between targets!
        for (let i = 0; i < pts.length - 1; i++) {
            let p1 = pts[i], p2 = pts[i+1];
            let d = dist(p1.x, p1.y, p2.x, p2.y);
            let steps = max(2, floor(d / 15)); // A jagged point every 15 pixels
            let arcPts = [];
            for (let j = 0; j <= steps; j++) {
                let f = j / steps;
                let mx = lerp(p1.x, p2.x, f);
                let my = lerp(p1.y, p2.y, f);
                if (j > 0 && j < steps) { // Offset middle points to make it jagged
                    mx += random(-15, 15);
                    my += random(-15, 15);
                }
                arcPts.push({x: mx, y: my});
            }
            this.segments.push(arcPts);
        }
    }
    update() { this.life--; }
    show() {
        if (this.life <= 0) return;
        let alpha = (this.life / this.maxLife) * 255;
        push(); noFill();
        
        // Draw each segment (between targets)
        for (let arc of this.segments) {
            // Outer thick glow
            stroke(255, 150, 0, alpha * 0.4); strokeWeight(14);
            beginShape(); for (let p of arc) vertex(p.x, p.y); endShape();
            
            // Main yellow bolt
            stroke(255, 255, 0, alpha); strokeWeight(4);
            beginShape(); for (let p of arc) vertex(p.x, p.y); endShape();
            
            // Blinding white core
            stroke(255, 255, 255, alpha); strokeWeight(2);
            beginShape(); for (let p of arc) vertex(p.x + random(-2,2), p.y + random(-2,2)); endShape();
        }
        pop();
    }

}


class Orb {
  constructor() { this.active = false; }
  
  init(x, y, isPurple = false, isPink = false) { 
    this.active = true;
    this.x = x; 
    this.y = y; 
    this.life = 120; 
    this.isPurple = isPurple; 
    this.isPink = isPink;
    this.r = isPink ? 36 : 50; 
    this.vx = 0; 
    this.vy = 0; 
    this.maxSpd = isPink ? 5.33 : 4; 
    return this;
  }
  
  update() {
    if (!this.active) return;
    this.life--; 
    let ang = atan2(player.y - this.y, player.x - this.x); 
    this.vx = lerp(this.vx, cos(ang) * this.maxSpd, 0.05); 
    this.vy = lerp(this.vy, sin(ang) * this.maxSpd, 0.05); 
    this.x += this.vx; 
    this.y += this.vy; 
    
    let hit = false; 
    if (dist(this.x, this.y, player.x, player.y) < 30) hit = true;
    
    for (let b of activeBuildings) { 
        if (currentLevel === 4 && b.isPalm) continue; 
        if (currentLevel === 6 && (b.isAlienPlant || b.isEnergyPole)) continue; 
        if ((currentLevel === 1 || currentLevel === 2) && (b.isGrassLot || b.isCar)) continue; 
        if (this.x > b.x - b.w / 2 && this.x < b.x + b.w / 2 && this.y > b.y - b.h / 2 && this.y < b.y + b.h / 2) { hit = true; break; } 
    }
    
    if (this.life <= 0 || hit) { 
        this.life = 0; 
        this.active = false; 
        triggerExplosion(this.x, this.y, 160, false, false); 
    }
  }
  
  show() { 
    if (!this.active) return;
    if (this.isPurple) { 
        fill(150, 0, 255, 200 + sin(frameCount * 0.5) * 55); noStroke(); ellipse(this.x, this.y, this.r, this.r); fill(220, 150, 255); ellipse(this.x, this.y, this.r / 2, this.r / 2); 
    } else if (this.isPink) {
        fill(255, 20, 147, 200 + sin(frameCount * 0.5) * 55); noStroke(); ellipse(this.x, this.y, this.r, this.r); fill(255, 150, 200); ellipse(this.x, this.y, this.r / 2, this.r / 2);
    } else { 
        fill(255, 0, 0, 200 + sin(frameCount * 0.5) * 55); noStroke(); ellipse(this.x, this.y, this.r, this.r); fill(255, 200, 200); ellipse(this.x, this.y, this.r / 2, this.r / 2); 
    } 
  }
}

function updateOrbs() { 
    for (let i = orbs.length - 1; i >= 0; i--) { 
        let o = orbs[i];
        if (!o.active) continue;
        if (doTick) o.update(); 
        if (o.active && inView(o.x, o.y, 100)) o.show(); 
    } 
}

class Shockwave {
    constructor(x, y, a) { 
        this.x = x; this.y = y; this.a = a; 
        this.life = 10; 
        this.vx = cos(a) * 15; this.vy = sin(a) * 15; 
        this.hitList = []; 
        
        emit(this.x, this.y, 20, color(255, 150, 0), "EXPLOSION");
        emit(this.x, this.y, 10, color(255, 255, 0), "FLASH");
    }
    update() {
        this.life--; this.x += this.vx; this.y += this.vy; 
        
        emit(this.x, this.y, 5, color(255, 100, 0), "SPARK");
        emit(this.x, this.y, 2, color(200, 50, 0), "SMOKE");

        for (let e of enemiesList) {
            if (e.hp > 0 && dist(this.x, this.y, e.x, e.y) < 60 && !this.hitList.includes(e)) {
                this.hitList.push(e); 
                
                let mDmg = (typeof ninjaSuitUnlocked !== 'undefined' && ninjaSuitUnlocked) ? 156 : 130; 
                e.takeDamage(mDmg); 
                
                // NEW: Make ALL enemies flash white on Finisher hits!
                if (e.hp > 0) e.hitFlash = 4;
                
                let bCol = (e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0); 
                sfx.hitBody(); emit(e.x, e.y, 20, bCol, "BLOOD");
                
                if (e.hp <= 0) { 
                    e.dead = true; 
                    if (e.eType === "SAUCER" || e.eType === "SAUCER_RED") { 
                        triggerExplosion(e.x, e.y, 160); 
                    } else if (e.eType === "AERIAL" || e.eType === "AERIAL_PISTOL") {
                        emit(e.x, e.y, 40, color(255, 100, 0), "EXPLOSION"); sfx.explosion();
                        spawnSplatter(e.x, e.y, "BLOOD", color(90, 0, 0));
                        corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 11, this.a, e.decals, e.currentWeapon, this.a, e.eType, e.bodyW, e.bodyH));
                    } else if (e.eType === "ARMORED" || e.eType === "ARMORED_STANDARD" || e.eType === "ALIEN_GATOR") {
                        emit(e.x, e.y, 60, bCol, "GORE"); spawnSplatter(e.x, e.y, "BLOOD", bCol);
                        corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 10, this.a, e.decals, e.currentWeapon, this.a, e.eType, e.bodyW, e.bodyH));
                    } else { 
                        emit(e.x, e.y, 60, bCol, "GORE"); spawnSplatter(e.x, e.y, "BLOOD", bCol); 
                        corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 14, this.a, e.decals, e.currentWeapon, this.a, e.eType, e.bodyW, e.bodyH)); 
                    } 
                    processKill(e.x, e.y, false, e.eType, e.isFriendly); 
                }
            }
        }
        
        for (let i = enemiesList.length - 1; i >= 0; i--) {
            if (enemiesList[i].hp <= 0) { 
                enemiesList.splice(i, 1); 
                if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100); 
            }
        }
    }
    show() { 
        push(); translate(this.x, this.y); rotate(this.a); 
        stroke(255, 100, 0, 200); strokeWeight(10); line(0, -35, 0, 35); 
        stroke(255, 200, 0); strokeWeight(4); line(0, -30, 0, 30); 
        pop(); 
    }
}

    

function updateShockwaves() {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        if (doTick) shockwaves[i].update();
        if (inView(shockwaves[i].x, shockwaves[i].y, 100)) shockwaves[i].show();
        if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);
    }
}


function manageChunkMemory() {
    // Disabled to keep blood permanent 
    /*
    const MAX_CHUNK_DIST = CHUNK_SIZE * 3; 
    for (let key in bloodChunks) {
        let coords = key.split(",");
        let chunkWorldX = (parseInt(coords[0]) * CHUNK_SIZE) + (CHUNK_SIZE / 2);
        let chunkWorldY = (parseInt(coords[1]) * CHUNK_SIZE) + (CHUNK_SIZE / 2);
        
        if (dist(player.x, player.y, chunkWorldX, chunkWorldY) > MAX_CHUNK_DIST) {
            bloodChunks[key].remove(); 
            delete bloodChunks[key];   
        }
    }
    */
}



class Corpse {
  constructor(x, y, mA, aA, sC, pC, dT, hA, dec, cW, bA, eT, bW, bH) { 
    this.eT = eT; this.x = x; this.y = y; 
    if (eT === "ARMORED" || eT === "ARMORED_STANDARD" || eT === "ALIEN_GATOR") { this.mA = mA; this.aA = aA; } else { this.mA = mA + PI; this.aA = aA + PI; }
    this.sC = sC; this.pC = pC; this.dT = dT; this.hA = hA; this.bA = bA; this.dec = dec; this.cW = cW; this.bW = bW; this.bH = bH; 
    this.bT = 120; this.fP = 0; this.sep = 0; this.bits = []; this.stopMotionTimer = 156; 
    this.bloodTimer = (dT === 5 || dT === 7 || dT === 8 || dT === 9 || dT === 10 || dT === 11 || dT === 13 || dT === 14) ? 180 : 0; 

    if (dT === 14) { this.splitA = bA; this.lH = { x: 0, y: 0, vx: cos(this.splitA - HALF_PI) * 2, vy: sin(this.splitA - HALF_PI) * 2 }; this.rH = { x: 0, y: 0, vx: cos(this.splitA + HALF_PI) * 2, vy: sin(this.splitA + HALF_PI) * 2 }; }

    if (dT === 5) {
        let bitTypes = ['skull', 'ribcage', 'pelvis', 'bone', 'bone', 'bone', 'bone', 'heart', 'brain', 'intestine', 'meat', 'meat', 'meat'];
        for (let type of bitTypes) { let ang = random(TWO_PI), spd = random(4, 9); this.bits.push({ type: type, x: 0, y: 0, vx: cos(ang)*spd, vy: sin(ang)*spd, rot: random(TWO_PI), vr: random(-0.4, 0.4), sz: random(8, 14), splat: false }); }
    } else if (dT === 9) {
        let ox = cos(this.aA) * 10, oy = sin(this.aA) * 10;
        for (let i=0; i<3; i++) this.bits.push({ x:ox, y:oy, vx:random(-6,6), vy:random(-6,6), rot:random(TWO_PI), vr:random(-0.3,0.3), sz:random(4, 7), type: 'skull_frag', splat: false });
        for (let i=0; i<6; i++) this.bits.push({ x:ox, y:oy, vx:random(-6,6), vy:random(-6,6), rot:random(TWO_PI), vr:random(-0.3,0.3), sz:random(4, 8), type: 'meat', splat: false });
    } else if (dT === 10) {
        this.overkillBits = [ { type: 'torso', x: 0, y: 0, vx: cos(this.bA)*6 + random(-2,2), vy: sin(this.bA)*6 + random(-2,2), rot: this.aA, vr: random(-0.2, 0.2) }, { type: 'lArm', x: 0, y: 0, vx: cos(this.bA - PI/3)*7 + random(-2,2), vy: sin(this.bA - PI/3)*7 + random(-2,2), rot: this.aA, vr: random(-0.4, 0.4) }, { type: 'rArm', x: 0, y: 0, vx: cos(this.bA + PI/3)*7 + random(-2,2), vy: sin(this.bA + PI/3)*7 + random(-2,2), rot: this.aA, vr: random(-0.4, 0.4) } ];
    } else if (this.dT === 11) {
        emit(this.x, this.y, 40, color(255, 100, 0), "EXPLOSION"); sfx.explosion(); let fA = this.aA - PI;
        this.aerialBits = [ { type: 'torso', x: 0, y: 0, vx: cos(fA)*6, vy: sin(fA)*6, rot: fA, vr: 0 }, { type: 'lArm', x: 0, y: 0, vx: cos(fA - PI/2)*7, vy: sin(fA - PI/2)*7, rot: fA, vr: 0 }, { type: 'rArm', x: 0, y: 0, vx: cos(fA + PI/2)*7, vy: sin(fA + PI/2)*7, rot: fA, vr: 0 }, { type: 'legs', x: 0, y: 0, vx: cos(fA + PI)*5, vy: sin(fA + PI)*5, rot: fA, vr: 0 } ];
    } else if (this.dT === 12) {
        this.kamikazeTimer = 126; let fA = this.aA - PI; this.vx = cos(fA) * 3.66; this.vy = sin(fA) * 3.66; this.exploded = false;
        } else if (dT === 15) {
        this.sC = color(40); this.pC = color(20); 
        this.overkillBits = [ { type: 'torso', x: 0, y: 0, vx: cos(this.bA)*6 + random(-2,2), vy: sin(this.bA)*6 + random(-2,2), rot: this.aA, vr: random(-0.2, 0.2) }, { type: 'lArm', x: 0, y: 0, vx: cos(this.bA - PI/3)*7 + random(-2,2), vy: sin(this.bA - PI/3)*7 + random(-2,2), rot: this.aA, vr: random(-0.4, 0.4) }, { type: 'rArm', x: 0, y: 0, vx: cos(this.bA + PI/3)*7 + random(-2,2), vy: sin(this.bA + PI/3)*7 + random(-2,2), rot: this.aA, vr: random(-0.4, 0.4) } ];
	}
  }

  update() { 
    if (this.fP < 1) this.fP += 0.15; 
    let bCol = (this.eT === "BUG" || this.eT === "SNAIL" || this.eT === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0);
    
    if (this.smokeTimer > 0) {
        this.smokeTimer--;
        if (this.smokeTimer % 6 === 0) emit(this.x + random(-15, 15), this.y + random(-15, 15), 1, color(100), "SMOKE");
        
        if (this.isCharred) {
            if (this.overkillBits) {
                for (let ob of this.overkillBits) if (this.smokeTimer % 8 === 0) emit(this.x + ob.x + random(-5, 5), this.y + ob.y + random(-5, 5), 1, color(80), "SMOKE");
            }
            if (this.bits) {
                for (let b of this.bits) if (this.smokeTimer % 12 === 0) emit(this.x + b.x, this.y + b.y, 1, color(80), "SMOKE");
            }
            if (this.smokeTimer % 3 === 0) {
                emit(this.x, this.y, 4, bCol, "BLOOD", random(-5, 5), random(-5, 5));
                if (this.smokeTimer % 6 === 0) spawnSplatter(this.x + random(-25, 25), this.y + random(-25, 25), "BLOOD", bCol);
            }
        }
    }

    if (this.dT === 13 && this.sep < 50) {
        this.sep += 3;
        if (this.bloodTimer > 0) {
            this.bloodTimer--;
            if (this.bloodTimer % 2 === 0) emit(this.x, this.y, 2, color(90,0,0), "BLOOD", random(-5,5), random(-5,5));
            if (this.bloodTimer === 175) { spawnSplatter(this.x, this.y, "BLOOD", color(90, 0, 0)); emit(this.x, this.y, 40, color(90, 0, 0), "GORE"); }
        }
    }

    if (this.dT === 11) {
        if (this.bloodTimer > 0) {
            this.bloodTimer--;
            for (let b of this.aerialBits) {
                b.x += b.vx; b.y += b.vy; b.vx *= 0.94; b.vy *= 0.94; b.rot += b.vr;
                if (this.bloodTimer % 3 === 0) emit(this.x + b.x, this.y + b.y, 1, color(90, 0, 0), "BLOOD");
                if (this.bloodTimer % 20 === 0 && abs(b.vx) < 1) spawnSplatter(this.x + b.x, this.y + b.y, "BLOOD", color(90, 0, 0));
            }
        }
    }
    if (this.dT === 12 && !this.exploded) {
        if (this.kamikazeTimer > 0) {
            this.kamikazeTimer--; this.x += this.vx; this.y += this.vy;
            let neckX = this.x + cos(this.aA - PI) * 12, neckY = this.y + sin(this.aA - PI) * 12;
            let thrustX = this.x - cos(this.aA - PI) * 20, thrustY = this.y - sin(this.aA - PI) * 20;
            let trailX = -cos(this.aA - PI) * 3, trailY = -sin(this.aA - PI) * 3;
            if (this.kamikazeTimer % 4 === 0) { emit(thrustX, thrustY, 1, color(200), "SMOKE", trailX, trailY); emit(thrustX, thrustY, 1, color(255, 150, 0), "SPARK", trailX, trailY); }
            if (this.kamikazeTimer % 3 === 0) emit(neckX, neckY, 2, color(90, 0, 0), "BLOOD", cos(this.aA - PI)*random(3,6), sin(this.aA - PI)*random(3,6));
        }
        if (this.kamikazeTimer <= 0) { triggerExplosion(this.x, this.y, 160, false, false); emit(this.x, this.y, 60, color(90, 0, 0), "GORE"); emit(this.x, this.y, 15, color(220, 200, 200), "BONE"); spawnSplatter(this.x, this.y, "BLOOD", color(90, 0, 0)); this.exploded = true; }
    }
    if (this.dT === 10 || this.dT === 15) {
        if (this.stopMotionTimer > 0) this.stopMotionTimer--;
        if (this.bloodTimer > 0) {
            this.bloodTimer--;
            for (let ob of this.overkillBits) {
                if (this.stopMotionTimer > 0) { ob.x += ob.vx; ob.y += ob.vy; ob.vx *= 0.92; ob.vy *= 0.92; ob.rot += ob.vr; }
                if (this.bloodTimer % 3 === 0) emit(this.x + ob.x, this.y + ob.y, 1, bCol, "BLOOD", random(-2, 2), random(-2, 2));
                if (this.bloodTimer % 20 === 0) spawnSplatter(this.x + ob.x, this.y + ob.y, "BLOOD", bCol);
            }
            if (this.bloodTimer % 2 === 0) { let sA = this.bA + random(-0.5, 0.5); emit(this.x, this.y, 2, bCol, "BLOOD", cos(sA) * random(3, 7), sin(sA) * random(3, 7)); }
                if (this.dT === 15 && this.bloodTimer > 0 && frameCount % 6 === 0) {
            emit(this.x + random(-15, 15), this.y + random(-15, 15), 1, color(100), "SMOKE");
        }

		}
    }
    if (this.dT === 7 && this.bloodTimer > 0) {
        this.bloodTimer--;
        if (this.bloodTimer % 2 === 0) { let sA = this.bA + random(-0.6, 0.6); emit(this.x, this.y, 2, bCol, "BLOOD", cos(sA) * random(3, 8), sin(sA) * random(3, 8)); }
        if (this.bloodTimer % 15 === 0) { spawnSplatter(this.x + random(-25, 25), this.y + random(-25, 25), "BLOOD", bCol); }
    }
    if ((this.dT === 8 || this.dT === 9) && this.bloodTimer > 0) {
        this.bloodTimer--; let fVal = this.dT === 9 ? (10 + 5 * this.fP) : 20 * this.fP; 
        let headX = this.x + cos(this.aA) * fVal, headY = this.y + sin(this.aA) * fVal;
        if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { headX = this.x; headY = this.y; }
        if (this.bloodTimer % 2 === 0) { let sA = this.bA + random(-0.6, 0.6); emit(headX, headY, 1, bCol, "BLOOD", cos(sA) * random(2, 6), sin(sA) * random(2, 6)); }
        if (this.bloodTimer % 20 === 0) { spawnSplatter(headX + random(-15, 15), headY + random(-15, 15), "BLOOD", bCol); }
    }
    if (this.dT === 5 || this.dT === 9) { 
        if (this.stopMotionTimer > 0) this.stopMotionTimer--; 
        for(let b of this.bits) { 
            if (this.stopMotionTimer > 0) { b.x += b.vx; b.y += b.vy; b.vx *= 0.93; b.vy *= 0.93; b.rot += b.vr; } else { b.vx = 0; b.vy = 0; b.vr = 0; } 
            let isBrainMeat = (this.dT === 9 && b.type === 'meat') || (this.dT === 5 && (b.type === 'heart' || b.type === 'meat' || b.type === 'intestine' || b.type === 'brain'));
            if (frameCount % 3 === 0 && abs(b.vx) > 1 && isBrainMeat && this.stopMotionTimer > 0) emit(this.x + b.x, this.y + b.y, 1, bCol, "BLOOD");
            if (abs(b.vx) < 0.5 && !b.splat) { if (isBrainMeat) spawnSplatter(this.x + b.x, this.y + b.y, "BLOOD", bCol); b.splat = true; }
        } 
        if (this.dT === 5 && this.bloodTimer > 0) {
            this.bloodTimer--; if (this.bloodTimer % 4 === 0 && this.bloodTimer > 100) emit(this.x, this.y, 3, bCol, "GORE");
            if (this.bloodTimer % 15 === 0) spawnSplatter(this.x + random(-25, 25), this.y + random(-25, 25), "BLOOD", bCol);
        }
    }
    if ((this.dT === 2 || this.dT === 3 || this.dT === 4 || this.dT === 6 || this.dT === 8) && this.sep < 35) this.sep += 2.5; 
    if (this.bT > 0 && --this.bT % 2 === 0) { 
        if (this.dT === 1) { let sA = this.aA + this.hA + random(-0.2, 0.2); emit(this.x + cos(this.aA) * (20 * this.fP), this.y + sin(this.aA) * (20 * this.fP), 1, bCol, "BLOOD", cos(sA) * 6, sin(sA) * 6); } 
        else if (this.dT === 4) { let sA = this.aA + PI + random(-0.4, 0.4); emit(this.x + cos(this.aA) * (15 * this.fP), this.y + sin(this.aA) * (15 * this.fP), 1, bCol, "BLOOD", cos(sA) * 6, sin(sA) * 6); } 
        else if (this.dT === 2 || this.dT === 3) { let lSA = this.mA - PI / 2 + random(-0.5, 0.5); emit(this.x, this.y, 1, bCol, "BLOOD", cos(lSA) * 4, sin(lSA) * 4); let tSA = this.bA + random(-0.3, 0.3); emit(this.x + cos(this.bA) * this.sep, this.y + sin(this.bA) * this.sep, 1, bCol, "BLOOD", cos(tSA) * 5, sin(tSA) * 5); } 
        else if (this.dT === 6) { let sA = this.hA + PI + random(-0.4, 0.4); let headX = this.x + cos(this.aA) * (20 * this.fP), headY = this.y + sin(this.aA) * (20 * this.fP); emit(headX, headY, 1, bCol, "BLOOD", cos(sA) * 6, sin(sA) * 6); } 
    } 
    if (this.dT === 14) {
        if (this.stopMotionTimer > 0) { this.stopMotionTimer--; this.lH.x += this.lH.vx; this.lH.y += this.lH.vy; this.rH.x += this.rH.vx; this.rH.y += this.rH.vy; this.lH.vx *= 0.9; this.lH.vy *= 0.9; this.rH.vx *= 0.9; this.rH.vy *= 0.9; }
        if (this.bloodTimer > 0) { this.bloodTimer--; if (this.bloodTimer % 3 === 0) { emit(this.x + this.lH.x, this.y + this.lH.y, 2, bCol, "BLOOD"); emit(this.x + this.rH.x, this.y + this.rH.y, 2, bCol, "BLOOD"); } if (this.bloodTimer % 15 === 0) { spawnSplatter(this.x + this.lH.x, this.y + this.lH.y, "BLOOD", bCol); spawnSplatter(this.x + this.rH.x, this.y + this.rH.y, "BLOOD", bCol); } }
    }
  }
    
  show(r = window) {
  r.noStroke();
  if (this.dT === 14) {
      r.push(); r.translate(this.x, this.y); 
      r.push(); r.translate(this.lH.x, this.lH.y); r.rotate(this.splitA); r.fill(this.sC); r.arc(0, 0, this.bW, this.bH, HALF_PI, PI + HALF_PI, CHORD); r.fill(220, 200, 200); r.ellipse(-6, -this.bH*0.2, 5, 10); r.fill(200, 50, 100); r.ellipse(-8, this.bH*0.1, 7, 12); r.fill(90, 0, 0); r.rect(-3, -this.bH/2, 3, this.bH); r.pop();
      r.push(); r.translate(this.rH.x, this.rH.y); r.rotate(this.splitA); r.fill(this.sC); r.arc(0, 0, this.bW, this.bH, -HALF_PI, HALF_PI, CHORD); r.fill(220, 200, 200); r.ellipse(6, -this.bH*0.2, 5, 10); r.fill(200, 50, 100); r.ellipse(8, this.bH*0.1, 7, 12); r.fill(90, 0, 0); r.rect(0, -this.bH/2, 3, this.bH); r.pop();
      r.pop(); return;
  }

  if (this.dT === 13) { 
      r.push(); r.translate(this.x, this.y); let a = 255; r.rotate(this.aA); let spread = min(this.sep, 50);
      r.push(); r.translate(-spread, 0); r.fill(this.pC); r.rect(-10, -10, 18, 8, 4); r.rect(-10, 2, 18, 8, 4); r.fill(90, 0, 0); r.ellipse(0, -4, 18, 22); r.pop();
      r.push(); r.translate(spread, 0); r.fill(this.sC); r.ellipse(0, 0, this.bW, this.bH * 0.7); r.fill(90, 0, 0); r.ellipse(0, 10, this.bW * 0.8, 12); r.fill(235, 180, 140); r.ellipse(0, -this.bH * 0.4, 11, 11); r.pop();
      r.pop(); return;
  }
  if (this.dT === 11) {
      r.push(); r.translate(this.x, this.y);
      for (let b of this.aerialBits) {
          r.push(); r.translate(b.x, b.y); r.rotate(b.rot);
          if (b.type === 'torso') { r.fill(this.sC); r.ellipse(0, 0, this.bW, this.bH * 0.7); r.fill(80); r.rect(-6, -6, 12, 12, 2); r.fill(90, 0, 0); r.ellipse(0, this.bH * 0.35, 18, 10); } 
          else if (b.type === 'lArm' || b.type === 'rArm') { r.fill(this.sC); r.ellipse(0, 0, 16, 8); r.fill(235, 180, 140); r.ellipse(8, 0, 8, 8); r.fill(90, 0, 0); r.ellipse(-6, 0, 8, 8); } 
          else if (b.type === 'legs') { r.fill(this.pC); r.rect(-10, -10, 18, 8, 4); r.rect(-10, 2, 18, 8, 4); r.fill(90, 0, 0); r.ellipse(-10, -1, 10, 16); }
          r.pop();
      } r.pop(); return;
  }
  if (this.dT === 12) {
      if (this.exploded) return;
      r.push(); r.translate(this.x, this.y); r.rotate(this.aA - PI); r.fill(this.pC); r.rect(-25, -10, 18, 8, 4); r.rect(-25, 2, 18, 8, 4);
      r.fill(this.sC); r.ellipse(-5, -14, 16, 8); r.ellipse(-5, 14, 16, 8); r.fill(235, 180, 140); r.ellipse(-10, -14, 8, 8); r.ellipse(-10, 14, 8, 8);
      r.fill(this.sC); r.ellipse(0, 0, this.bW, this.bH); r.fill(80); r.rect(-18, -12, 12, 24, 3); r.fill(255, 100, 0); r.rect(-20, -8, 4, 16); r.fill(90, 0, 0); r.ellipse(12, 0, 12, 12); r.pop(); return;
  }
  if (this.eT === "BUG") { r.push(); r.translate(this.x, this.y); r.rotate(this.aA); r.fill(50, 80, 40); r.ellipse(0, 0, 20, 14); r.fill(30); r.ellipse(8, 0, 10, 10); r.stroke(30); r.strokeWeight(2); r.line(-5, 0, -12, 12); r.line(-5, 0, -12, -12); r.line(5, 0, 12, 12); r.line(5, 0, 12, -12); r.noStroke(); for (let d of this.dec) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(200, 230, 40, 220); r.ellipse(d.x, d.y, d.sz, d.sz); } r.pop(); return; }
  if (this.eT === "SNAIL") { r.push(); r.translate(this.x, this.y); r.rotate(this.aA); r.fill(20, 100, 20); r.ellipse(0, 0, this.bW, this.bH); r.fill(50, 80, 40); r.ellipse(-5, 0, 24, 20); r.noStroke(); for (let d of this.dec) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(50, 200, 50, 220); r.ellipse(d.x, d.y, d.sz, d.sz); } r.pop(); return; }
if (this.eT === "COW") {
      r.push(); r.translate(this.x, this.y); r.rotate(this.aA);
      
      let headDist = 0;
      // Headshots and Decapitations
      if (this.dT === 8 || this.dT === 9 || this.dT === 6 || this.dT === 4) {
           headDist = 15 + (10 * (this.fP || 0)); 
      }

      // If it hasn't exploded heavily
      if (this.dT !== 5 && this.dT !== 10 && this.dT !== 11) {
          r.fill(30); r.noStroke();
          r.rect(-15, -16, 6, 6, 2); r.rect(12, -16, 6, 6, 2);
          r.rect(-15, 10, 6, 6, 2); r.rect(12, 10, 6, 6, 2);
          
          r.stroke(30); r.strokeWeight(2);
          r.line(-this.bW/2, 0, -this.bW/2 - 12, 4); r.noStroke();
          
          r.fill(245); r.ellipse(0, 0, this.bW, this.bH);
          
          for (let d of this.dec) {
              if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]);
              r.ellipse(d.x, d.y, d.sz, d.sz);
          }
          
          // Dead Head
          r.push(); r.translate(this.bW/2 + 4 + headDist, 4); r.rotate(0.3); // Lolling sideways
          r.fill(245); r.ellipse(0, 0, 18, 16);
          r.fill(255, 170, 170); r.ellipse(7, 0, 10, 12);
          r.fill(15); r.ellipse(2, -5, 3, 3); r.ellipse(2, 5, 3, 3); // Eyes
          r.fill(245); r.ellipse(-3, -8, 6, 4); r.ellipse(-3, 8, 6, 4);
          r.fill(210, 190, 150); r.ellipse(-5, -6, 3, 6); r.ellipse(-5, 6, 3, 6);
          r.pop();
      } else {
          // Exploded Cow! Draw standard internal bits scattered everywhere
          if (this.bits && this.bits.length > 0) {
              for (let b of this.bits) {
                  r.push(); r.translate(b.x, b.y); r.rotate(b.rot);
                  if (b.type === 'skull') { r.fill(220, 200, 200); r.ellipse(0, 0, 7, 9); r.fill(10); r.ellipse(-1.5, -1.5, 2, 2); r.ellipse(1.5, -1.5, 2, 2); }
                  else if (b.type === 'ribcage') { r.fill(220, 200, 200); r.rect(-7, -8, 14, 16, 5); r.fill(120, 0, 0); r.ellipse(0, 0, 8, 12); }
                  else if (b.type === 'pelvis') { r.fill(220, 200, 200); r.ellipse(0, 0, 16, 8); }
                  else if (b.type === 'bone') { r.fill(220, 200, 200); r.rect(-6, -2, 12, 4, 2); }
                  else if (b.type === 'heart') { r.fill(120, 0, 0); r.ellipse(0, 0, 10, 10); }
                  else if (b.type === 'brain') { r.fill(200, 100, 150); r.ellipse(0, 0, 12, 10); }
                  else if (b.type === 'intestine') { r.noFill(); r.stroke(120, 0, 0); r.strokeWeight(4); r.beginShape(); r.vertex(-6,-4); r.vertex(0,4); r.vertex(6,-4); r.endShape(); r.noStroke(); }
                  else if (b.type === 'meat') { r.fill(120, 0, 0); r.ellipse(0, 0, b.sz, b.sz*0.8); }
                  r.pop();
              }
          } else {
              r.fill(120, 0, 0);
              r.ellipse(0, 0, this.bW, this.bH);
              r.ellipse(10, 5, 20, 20);
              r.ellipse(-10, -5, 20, 20);
          }
      }
      
      r.pop();
      return;
  }
  if (this.eT === "ALIEN_GATOR") {
    if (this.dT === 7) {
        r.push(); r.translate(this.x, this.y); let a = 255, f = this.fP; r.push(); r.rotate(this.mA); r.fill(this.pC.levels[0], this.pC.levels[1], this.pC.levels[2], a); r.noStroke();
        r.push(); r.translate(-3 - 30 * f, -18 - 10 * f); r.rotate(-f * 0.5); r.rect(-37, -12, 74, 24, 12); r.pop(); r.push(); r.translate(-3 - 30 * f, 18 + 10 * f); r.rotate(f * 0.5); r.rect(-37, -12, 74, 24, 12); r.pop();  
        r.fill(90, 0, 0, a); r.ellipse(-15, -12, 35, 45); r.pop(); r.pop(); return;
    }
    r.push(); r.translate(this.x, this.y); let a = 255, f = this.fP; r.push(); if (this.dT === 2 || this.dT === 4) r.translate(cos(this.bA) * this.sep, sin(this.bA) * this.sep); r.rotate(this.mA); if (this.dT === 2) r.rotate(PI); r.fill(this.pC.levels[0], this.pC.levels[1], this.pC.levels[2], a); r.noStroke();
    r.push(); r.translate(-3 - 30 * f, -18 - 10 * f); r.rotate(-f * 0.5); r.rect(-37, -12, 74, 24, 12); r.pop(); r.push(); r.translate(-3 - 30 * f, 18 + 10 * f); r.rotate(f * 0.5); r.rect(-37, -12, 74, 24, 12); r.pop();  
    if (this.dT === 2 || this.dT === 4) { r.fill(90, 0, 0, a); r.ellipse(-15, -12, 20, 30); } r.pop();
    r.push(); if (this.dT === 2 || this.dT === 4) r.translate(cos(this.bA + PI) * this.sep, sin(this.bA + PI) * this.sep); r.rotate(this.mA); r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(0, 0, this.bW + 15 * f, this.bH); if (this.dT === 3) { r.fill(90, 0, 0); r.rect(-this.bW/2, -5, this.bW, 10); } r.noStroke(); for (let d of this.dec) { if (!d.isHead) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(90, 0, 0, 220 * (a/255)); r.ellipse(d.x, d.y, d.sz, d.sz); } }
    let slX = lerp(20, 10, f), armLY = lerp(-42, -45, f); r.fill(30, 180, 30, a); r.ellipse(slX, armLY, 48, 24); r.ellipse(slX+20, armLY, 24, 24); let rslX = lerp(45, 30, f), armRY = lerp(33, 36, f); r.fill(30, 180, 30, a); r.ellipse(rslX, armRY, 75, 24); r.ellipse(rslX+30, armRY, 30, 30); 
    r.push(); r.translate(40 - 10*f, 8 + 15*f); r.rotate(f * PI/2); r.fill(40); r.rect(15, 5, 45, 12, 2); r.fill(20); r.rect(55, 3, 10, 16); r.pop(); if (this.dT === 2 || this.dT === 4) { r.fill(90, 0, 0, a); r.ellipse(0, 0, this.bW + 15*f, 25); } r.translate(20 * f, 0);
    if (this.dT === 4 || this.dT === 9) { r.fill(90, 0, 0); r.ellipse(0, 0, 20, 20); } else if (this.dT === 1) { r.push(); r.fill(30, 180, 30); r.ellipse(0, 0, 33, 33); r.rect(0, -15, 60, 30, 10); r.fill(0); r.ellipse(20, -10, 5, 5); r.ellipse(20, 10, 5, 5); r.fill(90, 0, 0); r.arc(0, 0, 20, 20, PI-PI/4, PI+PI/4, PIE); r.pop(); } else if (this.dT === 8) { r.push(); r.fill(30, 180, 30); r.ellipse(0, 0, 33, 33); r.rect(0, -15, 60, 30, 10); r.fill(0); r.ellipse(20, -10, 5, 5); r.ellipse(20, 10, 5, 5); r.fill(90, 0, 0); r.arc(0, 0, 35, 35, PI, PI + HALF_PI, PIE); r.pop(); } else { r.fill(30, 180, 30); r.ellipse(0, 0, 33, 33); r.rect(0, -15, 60, 30, 10); r.fill(0); r.ellipse(20, -10, 5, 5); r.ellipse(20, 10, 5, 5); }
    r.noStroke(); for (let d of this.dec) { if (d.isHead) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(90, 0, 0, 220 * (a/255)); r.ellipse(d.x, d.y, d.sz, d.sz); } } r.pop(); r.pop(); return;
  }
  if (this.dT === 10 || this.dT === 15) {
      r.push(); r.translate(this.x, this.y); let a = 255, f = this.fP;
      for (let ob of this.overkillBits) {
          r.push(); r.translate(ob.x, ob.y); r.rotate(ob.rot);
          if (ob.type === 'torso') { r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(0, 0, this.bW, this.bH * 0.7); r.fill(90, 0, 0); r.ellipse(0, this.bH * 0.35, this.bW * 0.8, 12); r.fill(235, 180, 140, a); r.ellipse(0, -this.bH * 0.4, 11, 11); } 
          else if (ob.type === 'lArm' || ob.type === 'rArm') { r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(0, 0, 16, 8); r.fill(235, 180, 140, a); r.ellipse(10, 0, 8, 8); r.fill(90, 0, 0); r.ellipse(-6, 0, 8, 8); } r.pop();
      }
      r.push(); r.rotate(this.mA); let fallOffset = lerp(0, -15, f), fallSquish = lerp(1, 0.6, f); r.translate(fallOffset, 0); r.scale(fallSquish, 1); r.noStroke(); r.fill(this.pC.levels[0], this.pC.levels[1], this.pC.levels[2], a);
      let lW = this.bW === 105 ? 40 : 18, lX = this.bW === 105 ? -30 : -10, lY1 = this.bW === 105 ? -10 : -10, lY2 = this.bW === 105 ? 15 : 2;
      r.rect(lX, lY1, lW, 8, 4); r.rect(lX, lY2, lW, 8, 4); r.fill(90, 0, 0, a); r.ellipse(lX + 8, -4, 18, 22); r.pop(); r.pop(); return;
  }
  
  if (this.dT === 5 || this.dT === 9) { 
      r.push(); r.translate(this.x, this.y); r.noStroke(); 
      let boneCol = this.isCharred ? color(40) : color(220, 200, 200);
      for (let b of this.bits) { 
          r.push(); r.translate(b.x, b.y); r.rotate(b.rot); 
          if (this.dT === 9) { 
              if (b.type === 'skull_frag') { r.fill(boneCol); r.beginShape(); r.vertex(-b.sz/2, -b.sz/2); r.vertex(b.sz/2, -b.sz/4); r.vertex(b.sz/4, b.sz/2); r.vertex(-b.sz/4, b.sz/4); r.endShape(CLOSE); }
              else { r.fill(this.isCharred ? color(30) : color(255, 105, 180)); r.rect(-b.sz/2, -b.sz/4, b.sz, b.sz/2, 2); }
          } 
          else if (this.dT === 5) {
              let meatCol = this.isCharred ? color(20) : color(120, 0, 0);
              if (b.type === 'skull') { r.fill(boneCol); r.ellipse(0, 0, 7, 9); r.fill(10); r.ellipse(-1.5, -1.5, 2, 2); r.ellipse(1.5, -1.5, 2, 2); }
              else if (b.type === 'ribcage') { r.fill(boneCol); r.rect(-7, -8, 14, 16, 5); r.fill(meatCol); r.ellipse(0, 0, 8, 12); }
              else if (b.type === 'pelvis') { r.fill(boneCol); r.ellipse(0, 0, 16, 8); }
              else if (b.type === 'bone') { r.fill(boneCol); r.rect(-6, -2, 12, 4, 2); }
              else if (b.type === 'heart') { r.fill(meatCol); r.ellipse(0, 0, 10, 10); }
              else if (b.type === 'brain') { r.fill(this.isCharred ? color(30) : color(200, 100, 150)); r.ellipse(0, 0, 12, 10); }
              else if (b.type === 'intestine') { r.noFill(); r.stroke(meatCol); r.strokeWeight(4); r.beginShape(); r.vertex(-6,-4); r.vertex(0,4); r.vertex(6,-4); r.endShape(); r.noStroke(); }
              else if (b.type === 'meat') { r.fill(meatCol); r.ellipse(0, 0, b.sz, b.sz*0.8); }
          }
          r.pop(); 
      } 
      r.pop();
      if (this.dT === 5) return; 
  }

  if (this.dT === 7) {
      r.push(); r.translate(this.x, this.y); let a = 255, f = this.fP; r.push(); r.rotate(this.mA); r.noStroke(); r.fill(this.pC.levels[0], this.pC.levels[1], this.pC.levels[2], a);
      let lW = this.bW === 105 ? 40 : 18, lX = this.bW === 105 ? -30 : -10, lY1 = this.bW === 105 ? -25 : -10, lY2 = this.bW === 105 ? 15 : 2;
      r.rect(lX - 20 * f, lY1 - 5 * f, lW + 10 * f, 8, 4); r.rect(lX - 20 * f, lY2 + 5 * f, lW + 10 * f, 8, 4); r.fill(90, 0, 0, a); r.ellipse(lX, -4, 20, 28); r.pop(); r.pop(); return;
  }

  r.push(); r.translate(this.x, this.y); let a = 255, f = this.fP, sK = color(235, 180, 140, a); 
  if (this.dT === 3) { 
      let off = this.sep; r.push(); r.rotate(this.mA); r.noStroke(); r.fill(this.pC); r.rect(-10,-10+off,18,8,4); r.rect(-10,2+off,18,8,4); r.fill(this.sC); r.ellipse(0,off,this.bW,this.bH/2); r.fill(90, 0, 0); r.ellipse(0, -off, this.bW, 10); r.translate(0, -off*1.8); r.ellipse(0, 0, this.bW, this.bH/2); 
      if (this.eT === "ARMORED_STANDARD") { r.fill(100); r.rect(-10, -6, 20, 12, 4); } 
      if (this.eT === "FEMALE_PISTOL") { r.fill(this.sC); r.ellipse(4, -6, 12, 10); r.ellipse(4, 6, 12, 10); }
      r.noStroke(); for (let d of this.dec) { if (!d.isHead) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(90, 0, 0, 220); r.ellipse(d.x, d.y, d.sz, d.sz); } } r.fill(sK); r.ellipse(0, -5, 11, 11); r.noStroke(); for (let d of this.dec) { if (d.isHead) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(90, 0, 0, 220); r.ellipse(d.x, d.y, d.sz, d.sz); } } r.pop(); 
  } 
  else { 
      r.push(); if (this.dT === 2 || this.dT === 4) r.translate(cos(this.bA) * this.sep, sin(this.bA) * this.sep); r.rotate(this.aA); r.noStroke(); r.fill(this.pC.levels[0], this.pC.levels[1], this.pC.levels[2], a); let lW = this.bW === 105 ? 40 : 18, lX = this.bW === 105 ? -30 : -10, lY1 = this.bW === 105 ? -10 : -10, lY2 = this.bW === 105 ? 15 : 2; r.push(); r.rect(lX - 20 * f, lY1 - 5 * f, lW + 10 * f, 8, 4); r.rect(lX - 20 * f, lY2 + 5 * f, lW + 10 * f, 8, 4); if (this.dT === 2 || this.dT === 4) { r.fill(90, 0, 0, a); r.ellipse(lX, -4, 12, 16); } r.pop(); r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(0, 0, this.bW + 15 * f, this.bH); 
      if (this.eT === "ARMORED_STANDARD") { r.fill(100); r.rect(-10, -12, 20, 24, 4); } 
      if (this.eT === "FEMALE_PISTOL") { r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(4, -6, 12, 10); r.ellipse(4, 6, 12, 10); } 
      r.noStroke(); for (let d of this.dec) { if (!d.isHead) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(90, 0, 0, 220 * (a/255)); r.ellipse(d.x, d.y, d.sz, d.sz); } } 
      let lAY = this.eT === "ARMORED" ? -30 : -14, rAY = this.eT === "ARMORED" ? 30 : 11, slX = lerp(-5, 0, f), hX = lerp(-12, 12, f), armLY = lerp(lAY, lAY + 3, f), rslX = lerp(15, 0, f), rhX = lerp(25, 12, f), armRY = lerp(rAY, rAY + 3, f); 
      r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(slX, armLY, 16, 8); r.fill(sK); r.ellipse(hX, armLY, 8, 8); r.fill(this.sC.levels[0], this.sC.levels[1], this.sC.levels[2], a); r.ellipse(rslX, armRY, 25, 8); r.fill(sK); r.ellipse(rhX, armRY, 8, 8); 
      if (this.eT === "AERIAL" || this.eT === "AERIAL_PISTOL") { r.fill(80, a); r.rect(-18, -12, 12, 24, 3); } 
      if (this.eT !== "ARMORED" && this.eT !== "MOLOTOV" && this.eT !== "AERIAL") { r.push(); r.translate(20 - 10 * f, 8 + 15 * f); r.rotate(f * PI / 2); if (this.cW === WEAPONS.SMG || this.cW === WEAPONS.DUAL_SMG) { r.fill(40); r.rect(31, 12, 24, 8, 2); r.rect(35, 20, 6, 12); } else if (this.cW === WEAPONS.ASSAULT_RIFLE) { r.fill(40); r.rect(5, 4, 42, 4, 1); r.fill(139, 69, 19); r.rect(15, 3, 12, 6, 1); r.rect(0, 3, 8, 6, 1); } else if (this.cW === WEAPONS.SHOTGUN) { r.fill(30); r.rect(5, 4, 40, 5, 1); r.fill(15); r.rect(20, 3, 14, 7, 1); r.fill(50); r.rect(5, 3, 12, 7, 2); } else if (this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { r.fill(50, 70, 50); r.rect(5, 4, 45, 6, 2); r.fill(30); r.rect(20, 2, 10, 10, 1); } else { r.fill(40); r.rect(15, 5, 16, 6, 2); } r.pop(); if (this.cW === WEAPONS.DUAL_SMG) { r.push(); r.translate(20 - 10 * f, -14 - 15 * f); r.rotate(-f * PI / 2); r.fill(40); r.rect(15, -7, 24, 8, 2); r.rect(19, -19, 6, 12); r.pop(); } } else if (this.eType === "MOLOTOV") { r.push(); r.translate(20 - 10 * f, 8 + 15 * f); r.rotate(f * PI / 2); r.fill(30, 120, 30); r.rect(0, -8, 8, 16, 2); r.pop(); } else if (this.eType === "ARMORED") { r.push(); r.translate(30 - 10 * f, 25 + 15 * f); r.rotate(f * PI / 2); r.fill(30); r.rect(0, -10, 50, 20, 4); r.pop(); } 
      if (this.dT === 2 || this.dT === 4) { r.fill(90, 0, 0, a); r.ellipse(0, 0, this.bW + 15 * f, 20); } r.translate(20 * f, 0); if (this.dT === 4) { r.fill(90, 0, 0); r.ellipse(0, 0, 14, 14); if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { r.push(); r.translate(15, 10); r.fill(20); r.rotate(HALF_PI); r.arc(0, 0, 15, 15, 0, PI, CHORD); r.pop(); } } else if (this.dT === 1) { r.fill(sK); r.arc(0, 0, 11, 11, this.hA + PI / 4, this.hA + TWO_PI - PI / 4, PIE); r.fill(90, 0, 0); r.arc(0, 0, 8, 8, this.hA - PI / 4, this.hA + PI / 4, PIE); if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { r.push(); r.translate(15, 10); r.fill(20); r.rotate(HALF_PI); r.arc(0, 0, 15, 15, 0, PI, CHORD); r.pop(); } if (this.eT === "FEMALE_PISTOL") { r.fill(15, a); r.arc(0, 0, 12, 12, HALF_PI, PI + HALF_PI); r.ellipse(-11, 0, 12, 6); } } else if (this.dT === 6) { r.push(); r.rotate(this.hA); r.fill(90, 0, 0); r.ellipse(0, 0, 10, 10); let spread = min(this.sep * 0.4, 8); r.fill(sK); r.arc(0, -spread, 11, 11, PI, TWO_PI, CHORD); r.arc(0, spread, 11, 11, 0, PI, CHORD); r.pop(); if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { r.push(); r.translate(15, 10); r.fill(20); r.rotate(HALF_PI); r.arc(0, 0, 15, 15, 0, PI, CHORD); r.pop(); } } else if (this.dT === 8) { r.push(); r.rotate(this.hA); r.fill(sK); r.arc(0, 0, 11, 11, 0, PI + HALF_PI, PIE); r.fill(90, 0, 0); r.arc(0, 0, 11, 11, PI + HALF_PI, TWO_PI, PIE); if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { r.push(); r.translate(15, 10); r.fill(20); r.rotate(HALF_PI); r.arc(0, 0, 15, 15, 0, PI, CHORD); r.pop(); } r.pop(); } else if (this.dT === 9) { let nX = 10 + 5 * this.fP; r.fill(90, 0, 0); r.ellipse(nX, 0, 12, 12); if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { r.push(); r.translate(15, 10); r.fill(20); r.rotate(HALF_PI); r.arc(0, 0, 15, 15, 0, PI, CHORD); r.pop(); } } else { r.fill(sK); r.ellipse(0, 0, 11, 11); if (this.eT === "ARMORED" || this.eT === "ARMORED_STANDARD") { r.push(); r.translate(15, 10); r.fill(20); r.rotate(HALF_PI); r.arc(0, 0, 15, 15, 0, PI, CHORD); r.pop(); } if (this.eT === "FEMALE_PISTOL") { r.fill(15, a); r.arc(0, 0, 12, 12, HALF_PI, PI + HALF_PI); r.ellipse(-11, 0, 12, 6); } } r.noStroke(); for (let d of this.dec) { if (d.isHead) { if (d.col) r.fill(d.col[0], d.col[1], d.col[2], d.col[3]); else r.fill(90, 0, 0, 220 * (a/255)); r.ellipse(d.x, d.y, d.sz, d.sz); } } r.pop(); } r.pop();
}
}

function stampCorpse(c) {
    
    let maxSpread = Math.max(c.bW, c.bH) + 60; 
    
    let minCX = Math.floor((c.x - maxSpread) / CHUNK_SIZE);
    

    
    let maxCX = Math.floor((c.x + maxSpread) / CHUNK_SIZE);
    let minCY = Math.floor((c.y - maxSpread) / CHUNK_SIZE);
    let maxCY = Math.floor((c.y + maxSpread) / CHUNK_SIZE);

    for (let cx = minCX; cx <= maxCX; cx++) {
        for (let cy = minCY; cy <= maxCY; cy++) {
            let key = cx + "," + cy;

            if (!bloodChunks[key]) {
                bloodChunks[key] = createGraphics(CHUNK_SIZE, CHUNK_SIZE);
                bloodChunks[key].noStroke();
            }

            let pg = bloodChunks[key];
            
            // Shift coordinates into local chunk space
            let oldX = c.x;
            let oldY = c.y;
            c.x = oldX - (cx * CHUNK_SIZE);
            c.y = oldY - (cy * CHUNK_SIZE);
            
            // Draw directly to the buffer instead of the screen
            c.show(pg);
            
            // Restore actual world coordinates
            c.x = oldX;
            c.y = oldY;
        }
    }
}



function updateCorpses() {
  for (let i = corpses.length - 1; i >= 0; i--) {
      let c = corpses[i];
      
      if (doTick) {
          if (!c.isStatic && inView(c.x, c.y, 800)) {
              c.update();
              
              let isDone = (c.bloodTimer <= 0 && c.stopMotionTimer <= 0 && c.smokeTimer <= 0 && c.bT <= 0);
              if (c.dT === 12 && !c.exploded) isDone = false; // Kamikaze exception
              
              if (isDone && c.fP >= 1) {
                  c.isStatic = true; 
                  stampCorpse(c);         // Stamp it permanently to the ground chunk
                  corpses.splice(i, 1);   // Delete the object to save CPU & GPU
                  continue;               // Skip the rest of the loop
              }
          }
      }
      
      // If it's still animating, draw it normally on the screen layer
      if (inView(c.x, c.y, 150)) {
          c.show();
      }
  }
}



function updateLightnings() {
    for (let i = lightnings.length - 1; i >= 0; i--) {
        if(doTick) lightnings[i].update();
        if (inView(lightnings[i].pts[0].x, lightnings[i].pts[0].y, 300)) lightnings[i].show();
        if (lightnings[i].life <= 0) lightnings.splice(i, 1);
    }
}

class Character {
  constructor(x, y, isP, eT = "NORMAL") {
    this.isFriendly = false;
	 this.x = x; this.y = y; this.isPlayer = isP; this.eType = eT; 
        this.hp = 100; this.maxHp = 100;
    if (isP && window.farmLvl >= 2) { this.hp = 125; this.maxHp = 125; }
; this.shield = isP ? 100 : 0; this.shieldRechargeTimer = 0;
    this.bodyW = 21; this.bodyH = 27; this.shirtCol = isP ? color(200, 30, 30) : color(220, 200, 20); this.pantsCol = isP ? color(30, 80, 180) : color(30, 30, 30);
        this.aiOffset = Math.floor(Math.random() * 10); // Spreads updates across 10 frames
    this.leader = null;
    this.cachedTargetDist = 9999; // <--- CHANGE THIS FROM 0 to 9999
    this.cachedTargetAngle = 0;
    this.cachedCanSee = false;
this.isArmed = false; 
this.punchHitCount = 0; 


    if (eT === "FEMALE_PISTOL") { this.hp = 100; this.shirtCol = color(255, 105, 180); this.pantsCol = color(20); this.bodyW = 16; this.bodyH = 25; }
    
           // --- NEW FARMER CIVILIANS ---
    if (eT === "FARMER_MALE") { this.hp = 100; this.shirtCol = color(220); this.pantsCol = color(40, 100, 200); this.isFriendly = true; this.isNeutral = true; this.currentWeapon = WEAPONS.PISTOL; }
    if (eT === "FARMER_FEMALE") { this.hp = 100; this.bodyW = 16; this.bodyH = 25; this.shirtCol = color(245); this.pantsCol = color(245); this.isFriendly = true; this.isNeutral = true; this.currentWeapon = WEAPONS.PISTOL; }

    // --- LEVEL 4 MILITARY NEUTRAL ---
    if (eT === "MILITARY_NEUTRAL") { 
        this.hp = 150; 
        this.shirtCol = color(190, 170, 130); // Tan shirt
        this.pantsCol = color(139, 115, 85);  // Khaki pants
        this.isFriendly = true; 
        this.isNeutral = true; 
        this.currentWeapon = WEAPONS.ASSAULT_RIFLE; 
    }
    
    if (eT === "NM0_GREY_FATIGUE") { 
        this.hp = 250; 
        this.shirtCol = color(170, 175, 180); // Light grey uniform
        this.pantsCol = color(100, 105, 110); // Darker grey pants
        this.currentWeapon = WEAPONS.ASSAULT_RIFLE; 
    }


    if (eT === "ARMORED") { this.hp = 600; this.bodyW = 105; this.bodyH = 45; this.shirtCol = color(100); this.pantsCol = color(80); }
        if (eT === "SIA") { this.hp = 100; this.shirtCol = color(40, 40, 150); this.pantsCol = color(20); }
    if (eT === "DAD") { this.hp = 10; this.shirtCol = color(60, 120, 60); this.pantsCol = color(80, 60, 40); this.state = "IDLE"; }
	  if (eT === "AERIAL" || eT === "AERIAL_PISTOL") { this.hp = 70; this.shirtCol = eT === "AERIAL_PISTOL" ? color(50, 180, 50) : color(40, 100, 200); this.pantsCol = color(20, 20, 20); }
    if (eT === "BUG") { this.hp = 20; this.bodyW = 20; this.bodyH = 14; this.biteCooldown = 0; }
    if (eT === "SNAIL") { this.hp = 60; this.bodyW = 30; this.bodyH = 21; this.biteCooldown = 0; }
    if (eT === "MOLOTOV") { this.hp = 100; this.shirtCol = color(200, 100, 0); this.pantsCol = color(50); }
    if (eT === "ARMORED_STANDARD") { this.hp = 300; this.shirtCol = color(40, 80, 200); this.pantsCol = color(30, 30, 30); }
    if (eT === "ALIEN_GATOR") { this.hp = 250; this.bodyW = 63; this.bodyH = 81; this.shirtCol = color(120); this.pantsCol = color(20, 100, 20); }
    if (eT === "SAUCER" || eT === "SAUCER_RED") { this.hp = 750; this.bodyW = 80; this.bodyH = 80; if (eT === "SAUCER_RED") { this.burstsFired = 0; this.burstCooldown = 0; this.strafeDir = random() > 0.5 ? 1 : -1; } }
    if (eT === "SNAIL_HYBRID") { this.hp = 500; this.bodyW = 63; this.bodyH = 81; this.shirtCol = color(173, 216, 230); this.pantsCol = color(100, 150, 200); this.hybridHeadHP = 100; this.leftEye = 1; this.rightEye = 1; this.enraged = false; this.eyeBleedL = 0; this.eyeBleedR = 0; this.burstsFired = 0; this.burstCooldown = 0; this.strafeDir = random() > 0.5 ? 1 : -1; }
   if (eT === "COW") { 
        this.hp = 150; 
        this.bodyW = 45; 
        this.bodyH = 26; 
        this.isFriendly = true; 
        this.isNeutral = true; 
        this.state = "IDLE";
        this.timer = floor(random(60, 200));
        this.decals = [];
        // Generate random black spots for the cow's back
        for (let i = 0; i < floor(random(3, 6)); i++) {
            this.decals.push({
                x: random(-12, 12), 
                y: random(-8, 8), 
                sz: random(8, 18), 
                col: [20, 20, 20, 255], 
                isHead: false
            });
        }
    }
    this.dead = false; this.aimAngle = 0; this.moveAngle = 0; this.lastMoveAngle = 0; this.currentWeapon = WEAPONS.PISTOL; this.fireTimer = 0; this.reloadTimer = 0; this.orbChargeTimer = 0; 
    this.dashTimer = 0; this.dashCooldown = 0; this.dashCount = 0; this.dashWindow = 0; this.meleeTimer = 0; this.meleeCooldown = 0; this.meleePhase = 0; this.meleeComboTimer = 0; this.isBackhand = false; this.meleeQueued = false;
    this.throwAnimTimer = 0; this.cannonAmmo = 4; this.cannonCooldown = 0; this.cannonFireDelay = 0; this.cannonCharge = 0;
    this.muzzleFlash = 0; this.decals = []; this.isMoving = false; this.walkCycle = 0; this.armDrag = 0; this.lastHitFrame = 0; this.frameDamage = 0; this.shieldFlashTimer = 0; this.shieldBurstTimer = 0;
       this.weaponAmmo = { 
        "PISTOL": WEAPONS.PISTOL.maxAmmo, 
        "MACHINE GUN": WEAPONS.SMG.maxAmmo, 
        "DUAL SMGS": WEAPONS.DUAL_SMG.maxAmmo, 
        "ASSAULT RIFLE": WEAPONS.ASSAULT_RIFLE.maxAmmo, 
        "SHOTGUN": WEAPONS.SHOTGUN.maxAmmo, 
        "ROCKET LAUNCHER": WEAPONS.ROCKET_LAUNCHER.maxAmmo,
        "TASER": WEAPONS.TASER.maxAmmo // <--- ADDED TASER
    };
    
    this.mags = { 
        "PISTOL": Infinity, 
        "MACHINE GUN": 0, 
        "DUAL SMGS": 0, 
        "ASSAULT RIFLE": 0, 
        "SHOTGUN": 0, 
        "ROCKET LAUNCHER": 0,
        "TASER": Infinity // <--- ADDED TASER
    };

    this.stunTimer = 0;
this.skeletonTimer = 0;
	  if (!isP) { this.state = "PATROL"; this.targetBuilding = getPatrolBuilding(); this.patrolCorner = floor(random(4)); this.patrolTimer = 360; this.loseSightTimer = 0; }
  
      this.maxHp = this.hp;
  }
  get ammo() { return this.weaponAmmo[this.currentWeapon.name]; }
  set ammo(val) { this.weaponAmmo[this.currentWeapon.name] = val; }
  
      takeDamage(amount) {
    let res = { blocked: false, broken: false };
    if (this.isPlayer && (killcamMode || isWin || inFarmPostCutscene || inFarmCutscene || inTownCutscene || inPostAmbushCutscene || inDarchonCall)) return res; 

    
    
       // --- NEW: WAKE UP THE TOWN IF A CIVILIAN IS HURT ---
       // --- NEW: WAKE UP THE TOWN IF A CIVILIAN IS HURT ---
    // Make sure Cows are excluded so they don't accidentally turn the town hostile!
    if (this.isNeutral && this.eType !== "COW") {
        for (let e of enemiesList) {
            if (e.isNeutral && e.eType !== "COW") {
                e.isNeutral = false;
                e.isFriendly = false; // They are now hostile to the player

                e.state = "CHASE";
                e.loseSightTimer = 1200; // <--- NEW: Force 20 seconds of hard aggro
                
                // <--- NEW: Give them the player's exact location to swarm!
                if (typeof player !== 'undefined' && player) {
                    e.lastKnownX = player.x; 
                    e.lastKnownY = player.y;
                }
                
                if (typeof emit !== 'undefined') emit(e.x, e.y, 5, color(255, 0, 0), "SPARK"); // Exclamation mark effect
            }
        }
    }

   
    if (this.isPlayer) {
      this.shieldRechargeTimer = 300; 
      if (this.shield > 0) { 
          res.blocked = true; 
          this.shieldFlashTimer = 10; 
          let rem = amount - this.shield; 
          if (rem >= 0) { 
              this.shield = 0; 
              this.hp -= rem; 
              res.broken = true; 
              this.shieldBurstTimer = 15; 
          } else { 
              this.shield -= amount; 
          } 
      } else { 
          this.hp -= amount; 
      }
    } else { 
        this.hp -= amount; 
    }
    
    return res;
  }

    
    
      checkCol(nx, ny) {
    if (this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL" || this.eType === "SAUCER" || this.eType === "SAUCER_RED") return false; 
    if (this.ignoreBldgTimer > 0) return false; 
    
    let r = (this.eType === "ARMORED" || this.eType === "ALIEN_GATOR" || this.eType === "SNAIL_HYBRID") ? 28 : (this.eType === "BUG" ? 10 : (this.eType === "SNAIL" ? 15 : 15));
    
    for (let b of activeBuildings) { 
        if (b.isCropField || b.isMarket) continue; 
        if (currentLevel === 4 && b.isPalm) continue; 
        if (currentLevel === 6 && (b.isAlienPlant || b.isEnergyPole)) continue; 
        if ((currentLevel === 1 || currentLevel === 2) && b.isGrassLot) continue;         if (b.isUBarrier) {
            let wT = 15;
            if (nx + r > b.x - b.w/2 - wT && nx - r < b.x - b.w/2 + wT && ny + r > b.y - b.h/2 && ny - r < b.y + b.h/2) return true; 
            if (nx + r > b.x + b.w/2 - wT && nx - r < b.x + b.w/2 + wT && ny + r > b.y - b.h/2 && ny - r < b.y + b.h/2) return true; 
            if (nx + r > b.x - b.w/2 && nx - r < b.x + b.w/2 && ny + r > b.y - b.h/2 - wT && ny - r < b.y - b.h/2 + wT) return true; 
       continue;
        }

        if (nx + r > b.x - b.w / 2 && nx - r < b.x + b.w / 2 && ny + r > b.y - b.h / 2 && ny - r < b.y + b.h / 2) return true; 
   
    } 
    
    
    // FIX: Restored the missing loop body and closing bracket
    for (let c of activeParkingCars) {
        let cw = 50, ch = 90; 
        if (nx + r > c.x - cw / 2 && nx - r < c.x + cw / 2 && ny + r > c.y - ch / 2 && ny - r < c.y + ch / 2) return true; 
    }
    
    for (let b of barrels) {
        if (dist(nx, ny, b.x, b.y) < r + 12) return true; 
    }
    
    return false;
  }
  forceNudge() {
    // Flying enemies don't collide with buildings, so they don't need to be nudged
    if (this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL" || this.eType === "SAUCER" || this.eType === "SAUCER_RED") return;
    
    // If the character's current exact position registers as a collision
    if (this.checkCol(this.x, this.y)) {
        let step = 15; // The distance to check outward per loop
        let maxRadius = 300; // Stop checking if we somehow look 300px away and find nothing
        
        // Scan outward in a growing spiral
        for (let r = step; r <= maxRadius; r += step) {
            // Check 8 different angles (45-degree increments) at the current radius
            for (let a = 0; a < TWO_PI; a += PI / 4) {
                let nx = this.x + cos(a) * r;
                let ny = this.y + sin(a) * r;
                
                // If this new hypothetical spot is safe, snap them to it!
                if (!this.checkCol(nx, ny)) {
                    this.x = nx;
                    this.y = ny;
                    return; 
                }
            }
        }
    }
  }

 attemptMove(vx, vy) {
    // 1. Initialize persistent evasion and slide memory
    if (this.evadeTimer === undefined) {
        this.evadeTimer = 0;
        this.evadeDir = 1;
        this.slideDir = random() > 0.5 ? 1 : -1; // Lock in a preference!
        this.blockedAngle = 0;
    }

    let speed = dist(0, 0, vx, vy);
    let intendedAngle = atan2(vy, vx);

    // 2. OVERRIDE: If actively evading a hard corner, hijack their trajectory 
    if (!this.isPlayer && this.evadeTimer > 0) {
        this.evadeTimer--;
        let evadeAngle = this.blockedAngle + (HALF_PI * this.evadeDir);
        vx = cos(evadeAngle) * speed;
        vy = sin(evadeAngle) * speed;
    }

    let mX = false, mY = false;
    let finalDx = 0, finalDy = 0;

    // 3. Test primary movement
    if (!this.checkCol(this.x + vx, this.y)) { this.x += vx; finalDx = vx; mX = true; }
    if (!this.checkCol(this.x, this.y + vy)) { this.y += vy; finalDy = vy; mY = true; }

    // 4. Resolve sliding with PERSISTENT direction to stop jitter
    if (!mX && mY) {
        // If moving at an angle, follow the angle. If moving perfectly flat, use memory!
        let dir = (abs(vy) > 0.1) ? Math.sign(vy) : this.slideDir;
        let slideDy = dir * abs(vx);
        
        if (!this.checkCol(this.x, this.y + slideDy)) { 
            this.y += slideDy; finalDy = slideDy; 
        } else {
            this.slideDir *= -1; // Flip memory if they slide into a corner
        }
    } else if (!mY && mX) {
        let dir = (abs(vx) > 0.1) ? Math.sign(vx) : this.slideDir;
        let slideDx = dir * abs(vy);
        
        if (!this.checkCol(this.x + slideDx, this.y)) { 
            this.x += slideDx; finalDx = slideDx; 
        } else {
            this.slideDir *= -1; // Flip memory if they slide into a corner
        }
    } 
    // 5. HARD BLOCKED (Corners/Pockets): Trigger the 90-degree commitment!
    else if (!mX && !mY && !this.isPlayer) {
        if (this.evadeTimer <= 0) {
            this.evadeTimer = 45; 
            this.evadeDir = this.slideDir; // Sync 90-degree turn with their slide preference
            this.blockedAngle = intendedAngle;
        } else {
            // Corner failsafe: If they get stuck WHILE evading
            this.evadeDir *= -1;
            this.slideDir *= -1; 
            this.evadeTimer = 45; 
        }
    }

    // Keep the sliding flag active so the visual body rotation stays engaged
    this.isSliding = (abs(finalDx - vx) > 0.05 || abs(finalDy - vy) > 0.05) || this.evadeTimer > 0;
    return { x: finalDx, y: finalDy };
}




    removeCurrentWeapon() {
      let aW = [WEAPONS.PISTOL]; 
      if (taserUnlocked) aW.push(WEAPONS.TASER);
      if (dualSmgUnlocked && (this.mags["DUAL SMGS"] > 0 || this.weaponAmmo["DUAL SMGS"] > 0)) aW.push(WEAPONS.DUAL_SMG);
      else if (smgUnlocked && (this.mags["MACHINE GUN"] > 0 || this.weaponAmmo["MACHINE GUN"] > 0)) aW.push(WEAPONS.SMG); 
      if (arUnlocked && (this.mags["ASSAULT RIFLE"] > 0 || this.weaponAmmo["ASSAULT RIFLE"] > 0)) aW.push(WEAPONS.ASSAULT_RIFLE);
      if (shotgunUnlocked && (this.mags["SHOTGUN"] > 0 || this.weaponAmmo["SHOTGUN"] > 0)) aW.push(WEAPONS.SHOTGUN); 
      if (rocketLauncherUnlocked && (this.mags["ROCKET LAUNCHER"] > 0 || this.weaponAmmo["ROCKET LAUNCHER"] > 0)) aW.push(WEAPONS.ROCKET_LAUNCHER); 
      this.currentWeapon = aW[aW.length - 1]; this.reloadTimer = 0; lastWeaponSwapTime = millis();
  }


    triggerReload() {
      if (this.currentWeapon === WEAPONS.PISTOL || this.currentWeapon === WEAPONS.TASER) { 
          this.ammo = 0; 
          // Pistol = 90 frames (1.5s), Taser = 420 frames (7s)
          this.reloadTimer = this.currentWeapon === WEAPONS.TASER ? 120 : 90; 
          if (this.isPlayer) sfx.reload(); 
      } else {
          if (this.mags[this.currentWeapon.name] > 0) { this.mags[this.currentWeapon.name]--; this.ammo = 0; this.reloadTimer = 90; if (this.isPlayer) sfx.reload(); } else { if (this.isPlayer) this.removeCurrentWeapon(); else { this.ammo = 0; this.reloadTimer = 90; } }
      }
  }

  
  activateDash() {
      if (jetpackDoubleDash) {
          if (this.dashCount === 0) { this.dashTimer = 8; this.dashCooldown = 15; this.dashWindow = 180; this.dashCount = 1; if (this.isPlayer) sfx.dash(); } else if (this.dashCount === 1) { this.dashTimer = 8; this.dashCooldown = 60; this.dashWindow = 0; this.dashCount = 0; if (this.isPlayer) sfx.dash(); }
      } else { this.dashTimer = 8; this.dashCooldown = 60; if (this.isPlayer) sfx.dash(); }
  }

      activateMelee(isCentral = false) {
      if (this.isPlayer && !isCentral) return; 
      if (this.meleeTimer > 0 || this.meleeCooldown > 0) return; 
      
      if (this.meleePhase > 0 && this.meleeComboTimer > 0) {
          this.advanceMeleeCombo();
          return;
      }
      
      if (this.isPlayer) {
          let bestTarget = null, minDist = Infinity;
          for (let e of enemiesList) {
              if (e.hp > 0 && !e.dead && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && !e.isFriendly) {
                  let d = dist(this.x, this.y, e.x, e.y);
                  let mR = (e.eType === "ARMORED" || e.eType === "ALIEN_GATOR" || e.eType === "SAUCER" || e.eType === "SAUCER_RED" || e.eType === "SNAIL_HYBRID") ? 120 : 80;
                  if (d < mR) {
                      let angTo = atan2(e.y - this.y, e.x - this.x);
                      let angleDiff = abs((angTo - this.aimAngle + PI * 3) % TWO_PI - PI);
                      if ((angleDiff < PI / 2 || d < 40) && d < minDist) { minDist = d; bestTarget = e; }
                  }
              }
          }
          if (bestTarget) this.aimAngle = atan2(bestTarget.y - this.y, bestTarget.x - this.x);
      }
    
      this.meleeTimer = 20; 
      this.isBackhand = false; 

      // 1. CHECK IF WE WANT TO USE THE SWORD
      // True ONLY IF the sword is picked up in the world AND the pause menu hasn't disabled it.
      let usingSword = (typeof swordPickedUp !== 'undefined' && swordPickedUp) && (window.swordEquipped !== false);
    
      // --- DECOUPLED COMBO INITIALIZATION ---
      if (!usingSword) {
          // UNARMED ALWAYS GETS 4-HIT SEQUENCE
          if (this.isPlayer) this.isArmed = false; // Auto-switch to neutral stance (hide guns)
          
          this.meleeCooldown = 0; 
          this.meleeComboTimer = 60; 
          this.meleePhase = 1; 
          if (this.isPlayer) sfx.dash(); 
      } else {
          // SWORD LOGIC
          if (this.isPlayer) this.isArmed = false; 
          
          if (typeof meleeComboUnlocked !== 'undefined' && meleeComboUnlocked) { 
              this.meleeCooldown = 0; 
              this.meleeComboTimer = 50; 
              this.meleePhase = 1; 
          } else { 
              this.meleeCooldown = 45; 
          } 
          if (this.isPlayer) sfx.slash();
      }
  }

  advanceMeleeCombo() { 
      if (this.isPlayer) {
          let bestTarget = null, minDist = Infinity;
          for (let e of enemiesList) {
              if (e.hp > 0 && !e.dead && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && !e.isFriendly) {
                  let d = dist(this.x, this.y, e.x, e.y);
                  let mR = (e.eType === "ARMORED" || e.eType === "ALIEN_GATOR" || e.eType === "SAUCER" || e.eType === "SAUCER_RED" || e.eType === "SNAIL_HYBRID") ? 120 : 80;
                  if (d < mR) {
                      let angTo = atan2(e.y - this.y, e.x - this.x);
                      let angleDiff = abs((angTo - this.aimAngle + PI * 3) % TWO_PI - PI);
                      if ((angleDiff < PI / 2 || d < 120) && d < minDist) { minDist = d; bestTarget = e; }
                  }
              }
          }
          if (bestTarget) this.aimAngle = atan2(bestTarget.y - this.y, bestTarget.x - this.x);
      }

      let usingSword = (typeof swordPickedUp !== 'undefined' && swordPickedUp) && (window.swordEquipped !== false);

      if (!usingSword) {
          // UNARMED 4-HIT COMBO
          if (this.isPlayer) this.isArmed = false; // Maintain neutral stance throughout combo
          
          if (this.meleePhase === 1) { 
              this.meleeTimer = 15; this.meleePhase = 2; this.meleeCooldown = 0; this.meleeComboTimer = 60; 
          } else if (this.meleePhase === 2) { 
              this.meleeTimer = 15; this.meleePhase = 3; this.meleeCooldown = 0; this.meleeComboTimer = 60; 
          } else if (this.meleePhase === 3) { 
              this.meleeTimer = 15; this.meleePhase = 2; this.meleeCooldown = 30; this.meleeComboTimer = 0; 
          } else if (this.meleePhase === 3) { 
              this.meleeTimer = 15; this.meleePhase = 0; this.meleeCooldown = 30; this.meleeComboTimer = 0; 
          }
          if (this.isPlayer) sfx.dash();
          return; 
      }

      // ARMED SWORD COMBO
      if (this.isPlayer) this.isArmed = false; 

      if (this.meleePhase === 1) { 
          this.meleeTimer = 20; this.meleePhase = 2; this.isBackhand = true; this.meleeCooldown = 0; this.meleeComboTimer = 60; 
      } else if (this.meleePhase === 2) { 
          this.meleeTimer = 20; this.meleePhase = 3; this.isBackhand = false; this.meleeCooldown = 0; this.meleeComboTimer = 60; 
      } else if (this.meleePhase === 3 && window.meleeFinisherUnlocked) { 
          this.executeFinisher(); 
          return; 
      } else { 
          this.meleeCooldown = 30; this.meleeComboTimer = 0; this.meleePhase = 0; 
          return; 
      }
      
      if (this.isPlayer) sfx.slash(); 
  }

  executeFinisher() {
      if (this.meleeTimer > 0) return;

      if (this.isPlayer) {
          this.isArmed = false; // Finisher is a sword move, keep it armed

          let bestTarget = null, minDist = Infinity;
          for (let e of enemiesList) {
              if (e.hp > 0 && !e.dead && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && !e.isFriendly) {
                  let d = dist(this.x, this.y, e.x, e.y);
                  let mR = (e.eType === "ARMORED" || e.eType === "ALIEN_GATOR" || e.eType === "SAUCER" || e.eType === "SAUCER_RED" || e.eType === "SNAIL_HYBRID") ? 150 : 100;
                  if (d < mR) {
                      let angTo = atan2(e.y - this.y, e.x - this.x);
                      let angleDiff = abs((angTo - this.aimAngle + PI * 3) % TWO_PI - PI);
                      if ((angleDiff < PI / 2 || d < 120) && d < minDist) { minDist = d; bestTarget = e; }
                  }
              }
          }
          if (bestTarget) this.aimAngle = atan2(bestTarget.y - this.y, bestTarget.x - this.x);
      }

      this.meleePhase = 4; 
      this.meleeTimer = 30; 
      this.meleeCooldown = 0;  
      this.meleeComboTimer = 0; 
      this.isBackhand = true; 
      if (this.isPlayer) { sfx.slash(); sfx.charge(); }
  }

  updatePlayer() {
   this.forceNudge();
	  if (this.shieldFlashTimer > 0) this.shieldFlashTimer--; if (this.shieldBurstTimer > 0) this.shieldBurstTimer--;
    if (this.shieldRechargeTimer > 0) { this.shieldRechargeTimer--; } else if (this.shield < 100) { this.shield = min(100, this.shield + 25 / 60); }
    if (this.dashWindow > 0) { this.dashWindow--; if (this.dashWindow <= 0) this.dashCount = 0; }
    
    if (this.meleeCharge === undefined) this.meleeCharge = 0;
        if (this.throwAnimTimer > 0) this.throwAnimTimer--;
    
    let isChemist = typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked;

    if (isChemist) {
        // --- CHEMIST FLASKS ---
        if (pFlaskTimer > 0) { pFlaskTimer--; if (pFlaskTimer <= 0) pFlaskAmmo = 2; }
        if (meleeInputHeld && pFlaskAmmo > 0 && !isCooking && this.dashTimer <= 0) { isCooking = true; cookTime = 180; }
        if (isCooking) {
            cookTime--;
            if (!meleeInputHeld || cookTime <= 0) {
                isCooking = false; pFlaskAmmo--; 
                if (pFlaskAmmo <= 0 && pFlaskTimer <= 0) pFlaskTimer = 600; 
                playerFlasks.push(new PlayerFlask(this.x, this.y, this.aimAngle, cookTime));
                sfx.throwG(); this.throwAnimTimer = 15;
            }
        }
        
        // --- CHEMIST CANNON ---
        if (this.cannonCooldown > 0) this.cannonCooldown--;
        if (this.cannonFireDelay > 0) this.cannonFireDelay--;
        
        if (typeof cannonInputHeld !== 'undefined' && cannonInputHeld && this.cannonCooldown <= 0 && this.cannonFireDelay <= 0 && this.cannonAmmo > 0) {
            this.cannonCharge++; 
        } else if ((typeof cannonInputHeld === 'undefined' || !cannonInputHeld) && this.cannonCharge > 0) {
            let dmg = 50, dryMax = 1;
            if (this.cannonCharge >= 120) { dmg = 350; dryMax = 3; } 
            else if (this.cannonCharge >= 80) { dmg = 150; dryMax = 2; } 
            
            let range = 300, arc = 0.4, pA = this.aimAngle;
            let candidates = enemiesList.filter(e => e.hp > 0 && !e.dead && dist(this.x, this.y, e.x, e.y) < range && abs((atan2(e.y - this.y, e.x - this.x) - pA + PI*3) % TWO_PI - PI) < arc);
            
            let startX = this.x + cos(pA)*32 - sin(pA)*-19;
            let startY = this.y + sin(pA)*32 + cos(pA)*-19;
            let shockPts = [{x: startX, y: startY}];
            
            if (candidates.length > 0) {
                candidates.sort((a,b) => dist(this.x, this.y, a.x, a.y) - dist(this.x, this.y, b.x, b.y));
                let hitSet = new Set(); hitSet.add(candidates[0]);
                let dryCount = candidates[0].wetTimer > 0 ? 0 : 1;
                let current = candidates[0];
                shockPts.push({x: current.x, y: current.y});
                
                let chaining = true;
                while(chaining) {
                    chaining = false;
                    let nextList = enemiesList.filter(e => !hitSet.has(e) && e.hp > 0 && dist(current.x, current.y, e.x, e.y) < 200);
                    nextList.sort((a,b) => dist(current.x, current.y, a.x, a.y) - dist(current.x, current.y, b.x, b.y));
                    
                    for (let n of nextList) {
                        let isWet = n.wetTimer > 0;
                        if (!isWet && typeof waterPuddles !== 'undefined') { for(let wp of waterPuddles) if (dist(n.x, n.y, wp.x, wp.y) < wp.r) isWet = true; }
                        
                        if (isWet || dryCount < dryMax) {
                            if (!isWet) dryCount++;
                            hitSet.add(n); current = n; shockPts.push({x: current.x, y: current.y});
                            chaining = true; break;
                        }
                    }
                }
                
                let finalDmg = dmg * (1 + (hitSet.size - 1) * 0.5); 
                for (let t of hitSet) {
                    let isWet = t.wetTimer > 0;
                    if (!isWet && typeof waterPuddles !== 'undefined') { for(let wp of waterPuddles) if (dist(t.x, t.y, wp.x, wp.y) < wp.r) isWet = true; }
                    
                    t.hp -= isWet ? (finalDmg * 2) : finalDmg; 
                    sfx.hitArmor();
                    
                    if (t.hp <= 0 && !t.dead) {
                        t.dead = true; 
                        sfx.deathGrunt();
                        t.decals.push({ x: random(-10, 10), y: random(-10, 10), sz: random(20, 35), col: [30, 30, 30, 220], isHead: false });
                        
                        let lChoices = [5, 2, 7, 10]; 
                        let dT = lChoices[lightningCounter % 4]; 
                        lightningCounter++;
                        let bCol = (t.eType === "BUG" || t.eType === "SNAIL" || t.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0);
                        
                        if (dT === 5) {
                            emit(t.x, t.y, 40, color(255, 150, 0), "EXPLOSION"); sfx.explosion();
                            spawnSplatter(t.x, t.y, "SCORCH");
                        }
                        emit(t.x, t.y, 60, bCol, "GORE");
                        spawnSplatter(t.x, t.y, "BLOOD", bCol);
                        
                        let c = new Corpse(t.x, t.y, t.moveAngle, t.aimAngle, color(40), color(20), dT, this.aimAngle, t.decals, t.currentWeapon, this.aimAngle, t.eType, t.bodyW, t.bodyH);
                        c.smokeTimer = 198; c.isCharred = true; c.bloodTimer = 198; 
                        corpses.push(c);
                        
                        processKill(t.x, t.y, false, t.eType, t.isFriendly);
                        
                        let idx = enemiesList.indexOf(t);
                        if (idx > -1) enemiesList.splice(idx, 1);
                        if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100);
                    }
                }
            } else {
                shockPts.push({x: this.x + cos(pA)*range, y: this.y + sin(pA)*range}); 
            }
            for (let i = 1; i < shockPts.length; i++) emit(shockPts[i].x, shockPts[i].y, 15, color(255, 255, 0), "SPARK");
            lightnings.push(new Lightning(shockPts)); sfx.shoot(); screenShake = 10;

            this.cannonAmmo--; this.cannonCharge = 0; this.cannonFireDelay = 48; 
            if (this.cannonAmmo <= 0) { this.cannonCooldown = 180; this.cannonAmmo = 4; } 
        }
    } 
    else if (grenadesUnlocked || (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked)) {
        // --- STANDARD GRENADES (ONLY IF NOT CHEMIST) ---
        if (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked && pGrenadeTimer > 0) {
            pGrenadeTimer--; if (pGrenadeTimer <= 0) pGrenadeAmmo = 4;
        }

        if (grenadeInputHeld && pGrenadeAmmo > 0 && !isCooking && this.dashTimer <= 0) { isCooking = true; cookTime = 180; }
        if (isCooking) {
            cookTime--;
            if (!grenadeInputHeld || cookTime <= 0) {
                isCooking = false; pGrenadeAmmo--; 
                if (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked && pGrenadeAmmo <= 0 && pGrenadeTimer <= 0) pGrenadeTimer = 600;
                playerGrenades.push(new PlayerGrenade(this.x, this.y, this.aimAngle, cookTime));
                sfx.throwG(); this.throwAnimTimer = 15; 
            }
        }
    }

    let canMelee = meleeUnlocked && !isChemist && this.dashTimer <= 0;

    if (canMelee) {
        if (meleeInputHeld) {
            if (window.meleeFinisherUnlocked) {
                this.meleeCharge++; 
                if (this.meleeCharge === 40) { sfx.charge(); emit(this.x, this.y, 20, color(255, 150, 0), "SPARK"); } 
            } else {
                if (!this.prevMeleeInputHeld) this.activateMelee(true); 
            }
        } else {
            if (this.prevMeleeInputHeld && window.meleeFinisherUnlocked) {
                if (this.meleeCharge >= 40) this.executeFinisher(); 
                else if (this.meleeCharge > 0) this.activateMelee(true); 
            }
            this.meleeCharge = 0;
        }
    } else {
        this.meleeCharge = 0;
    }

    this.prevMeleeInputHeld = meleeInputHeld;
    let speed = ninjaSuitUnlocked ? 6.6 : 6.0;

    if (this.dashTimer > 0) { 
        this.dashTimer--; speed = 22; 
        if (this.dashTimer % 2 === 0) { emit(this.x, this.y, 1, color(0, 200, 255), "THRUST", -cos(this.lastMoveAngle) * 8, -sin(this.lastMoveAngle) * 8); emit(this.x, this.y, 1, color(255, 100, 0), "THRUST", -cos(this.lastMoveAngle) * 8, -sin(this.lastMoveAngle) * 8); } 
        let dx = cos(this.lastMoveAngle) * speed, dy = sin(this.lastMoveAngle) * speed; 
        if (!this.checkCol(this.x + dx, this.y)) this.x += dx; if (!this.checkCol(this.x, this.y + dy)) this.y += dy; this.isMoving = true; 
        
        if (this.dashTimer <= 0 && jetpackFireExplosion) {
            screenShake = 15; sfx.charge(); sfx.shotgun(); 
            for (let a = 0; a < TWO_PI; a += 0.15) { emit(this.x, this.y, 1, color(0, 200, 255), "THRUST", cos(a) * 16, sin(a) * 16); emit(this.x, this.y, 1, color(150, 240, 255), "SPARK", cos(a) * 8, sin(a) * 8); }
            emit(this.x, this.y, 30, color(0, 100, 255), "EXPLOSION");
            for (let e of enemiesList) {
                if (e.hp > 0 && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && dist(this.x, this.y, e.x, e.y) < 140) {
                    let ang = atan2(e.y - this.y, e.x - this.x);
                    for(let k = 0; k < 15; k++) { if(!e.checkCol(e.x + cos(ang)*2, e.y)) e.x += cos(ang)*2; if(!e.checkCol(e.x, e.y + sin(ang)*2)) e.y += sin(ang)*2; }
                    let bCol = (e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0);
                    let mDmg = ninjaSuitUnlocked ? 120 : 100; e.takeDamage(mDmg); 
                    if ((e.eType === "ARMORED" && e.hp > 300) || (e.eType === "ARMORED_STANDARD" && e.hp > 50) || e.eType === "SAUCER" || e.eType === "SAUCER_RED" || (e.eType === "SNAIL_HYBRID" && e.hp > 150)) { sfx.hitArmor(); emit(e.x, e.y, 10, color(0, 200, 255), "SPARK"); } else { sfx.hitBody(); emit(e.x, e.y, 15, bCol, "BLOOD"); }

                    if (e.hp <= 0) {
                        e.dead = true;
                        if (e.eType === "SAUCER" || e.eType === "SAUCER_RED") { triggerExplosion(e.x, e.y, 160); }
                        else { emit(e.x, e.y, 40, bCol, "GORE"); spawnSplatter(e.x, e.y, "BLOOD", bCol); corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 3, 0, e.decals, e.currentWeapon, ang, e.eType, e.bodyW, e.bodyH)); }
                        processKill(e.x, e.y, false, e.eType, e.isFriendly);
                    }
                }
            }
            for (let i = enemiesList.length - 1; i >= 0; i--) if (enemiesList[i].hp <= 0) { enemiesList.splice(i, 1); if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100); } 
        }
    } else { 
        if (this.dashCooldown > 0) this.dashCooldown--; 
        let dx = leftStick.dx * speed, dy = leftStick.dy * speed; 
        
        if (this.meleeTimer > 0) {
            let forwardMag = (dx * cos(this.aimAngle)) + (dy * sin(this.aimAngle));
            dx = forwardMag * cos(this.aimAngle);
            dy = forwardMag * sin(this.aimAngle);
        }
        
        let aDx = 0, aDy = 0; 
        if (abs(dx) > 0.05 || abs(dy) > 0.05) { if (!this.checkCol(this.x + dx, this.y)) { this.x += dx; aDx = dx; } if (!this.checkCol(this.x, this.y + dy)) { this.y += dy; aDy = dy; } if (aDx !== 0 || aDy !== 0) { this.isMoving = true; this.walkCycle += 0.25; this.moveAngle = atan2(aDy, aDx); this.lastMoveAngle = this.moveAngle; } else this.isMoving = false; } else this.isMoving = false; 
    }

    if (this.meleeTimer > 0) {
      this.meleeTimer--; let nx = cos(this.aimAngle) * 3, ny = sin(this.aimAngle) * 3; if (!this.checkCol(this.x + nx, this.y)) this.x += nx; if (!this.checkCol(this.x, this.y + ny)) this.y += ny;
      
      if (this.meleePhase === 4 && this.meleeTimer === 15) { 
          screenShake = 20; 
          shockwaves.push(new Shockwave(this.x, this.y, this.aimAngle)); 
      }
             else if (this.meleePhase !== 4 && this.meleeTimer === 10) { 
          screenShake = 12; 
          for (let e of enemiesList) { 
                                let mR = e.eType === "ARMORED" || e.eType === "ALIEN_GATOR" || e.eType === "SAUCER" || e.eType === "SAUCER_RED" || e.eType === "SNAIL_HYBRID" ? 110 : 70; 
                  
                  // ---> THE FIX: Calculate damage based on equipped weapon, NOT graphic state
                  let isFistAttack = false;
                  if (this.isPlayer) {
                      let usingSword = (typeof swordPickedUp !== 'undefined' && swordPickedUp && window.swordEquipped !== false);
                      isFistAttack = !usingSword; // If not using sword, it's a fist
                  } else {
                      isFistAttack = !this.isArmed; // Keep enemy logic identical
                  }

                  if (isFistAttack) mR *= 0.85; // Slightly shorter range for punches

                  if (e.hp > 0 && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && dist(this.x, this.y, e.x, e.y) < mR) { 
                      let aD = (atan2(e.y - this.y, e.x - this.x) - this.aimAngle + PI * 3) % TWO_PI - PI; 
                      if (abs(aD) < PI / 2 || dist(this.x, this.y, e.x, e.y) < 30) { 
                          
                          // Check our new variable instead of the graphic state!
                          if (isFistAttack) {
                               
                              e.punchHitCount = (e.punchHitCount || 0) + 1;
                              if (e.punchHitCount >= 4) {
                                  e.stunTimer = 1500; // Stun for 3 seconds
                                  e.state = "STUNNED";
                                  e.punchHitCount = 0; // Reset meter
                                  sfx.charge(); // Audio cue for stun
                              }
                          } else {
                              e.takeDamage(200); // Sword deals 100 damage!
                          }

                      
                      if (e.hp > 0) { e.hitFlash = 4; }
                      
                      let bCol = (e.eType === "BUG" || e.eType === "SNAIL" || e.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0);
                      if (e.eType === "SAUCER" || e.eType === "SAUCER_RED" || (e.eType === "ARMORED" && e.hp > 300) || (e.eType === "ARMORED_STANDARD" && e.hp > 50) || (e.eType === "SNAIL_HYBRID" && e.hp > 150)) { sfx.hitArmor(); emit(e.x, e.y, 10, color(255, 200, 0), "SPARK"); } else { sfx.hitBody(); emit(e.x, e.y, 20, bCol, "BLOOD"); } 

                      if (e.hp <= 0) { 
                          e.dead = true; 
                          if (e.eType === "SAUCER" || e.eType === "SAUCER_RED") triggerExplosion(e.x, e.y, 160); 
                          else { emit(e.x, e.y, 60, bCol, "GORE"); spawnSplatter(e.x, e.y, "BLOOD", bCol); corpses.push(new Corpse(e.x, e.y, e.moveAngle, e.aimAngle, e.shirtCol, e.pantsCol, 3, 0, e.decals, e.currentWeapon, this.aimAngle, e.eType, e.bodyW, e.bodyH)); } 
                          
                          processKill(e.x, e.y, false, e.eType, e.isFriendly); 
                      } 
                  } 
              } 
          } 
          for (let i = enemiesList.length - 1; i >= 0; i--) if (enemiesList[i].hp <= 0) { enemiesList.splice(i, 1); if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100); } 
      }


    } else { 
        if (this.meleePhase === 4 && this.meleeCooldown <= 0) { this.meleePhase = 0; }
        if (this.meleeCooldown > 0) { this.meleeCooldown--; }
        if (this.meleeComboTimer > 0) { 
            this.meleeComboTimer--; 
            if (this.meleeComboTimer <= 0 && this.meleePhase > 0) { this.meleeCooldown = 0; this.meleePhase = 0; } 
        }
    }

    this.armDrag = lerp(this.armDrag, this.isMoving ? 1 : 0, 0.15); 
    
    if (this.meleeTimer <= 0) {
        if (rightStick.active) this.aimAngle = atan2(rightStick.dy, rightStick.dx); 
        else if (leftStick.active && this.isMoving && this.dashTimer <= 0) this.aimAngle = this.moveAngle;
    }

    if (this.fireTimer > 0) this.fireTimer--; if (this.muzzleFlash > 0) this.muzzleFlash--; 
        if (this.reloadTimer > 0 && --this.reloadTimer <= 0) { 
        let mult = ((this.isPlayer || this.isFriendly) && window.milLvl >= 2) ? 2 : 1;
        this.ammo = this.currentWeapon.maxAmmo * mult; 
    }
 
    
    if (rightStick.active && this.reloadTimer <= 0 && this.meleeTimer <= 0 && this.dashTimer <= 0 && !isCooking && this.throwAnimTimer <= 0 && rightStick.dist > 0.75 && this.fireTimer <= 0 && this.ammo > 0) {
        this.fire(this.aimAngle);
    }
  }

    updateEnemy() {
    if (this.eType === "DAD" || (currentLevel === 0 && prologuePhase === 1 && this.eType === "SIA")) return; 
    // NEW: Freeze the farmer during the cutscene
    if (typeof inFarmCutscene !== 'undefined' && inFarmCutscene && this === farmSpeaker) return;
 
if (this.eType === "COW") {
        this.forceNudge();
        
        if (this.wetTimer === undefined) this.wetTimer = 0;
        if (this.wetTimer > 0) this.wetTimer--;

        this.timer--;
        let aDx = 0, aDy = 0;

        if (this.timer <= 0) {
            if (this.state === "IDLE") {
                this.state = "WANDER";
                this.moveAngle = random(TWO_PI);
                this.timer = floor(random(60, 120)); // Walk for 1 to 2 seconds
            } else {
                this.state = "IDLE";
                this.timer = floor(random(120, 300)); // Stand still for 2 to 5 seconds
            }
        }

        if (this.state === "WANDER") {
            let vx = cos(this.moveAngle) * 0.4;
            let vy = sin(this.moveAngle) * 0.4;
            let m = this.attemptMove(vx, vy); 
            aDx = m.x; aDy = m.y;
            
            // Confine cows to the Level 3 Cattle Pen (-800 to -400 X, -100 to 100 Y)
            if (this.x < -770 || this.x > -430 || this.y < -80 || this.y > 80) {
                this.moveAngle += PI + random(-0.5, 0.5); // Turn around smoothly
            }
        }

        if (aDx !== 0 || aDy !== 0) {
            this.isMoving = true;
            this.walkCycle += 0.08; // Slower, heavier walk cycle
            this.aimAngle = this.moveAngle; // Cows face where they walk
        } else {
            this.isMoving = false;
        }
        return; // Skip the rest of the standard enemy AI
    }
    if (this.stunTimer > 0) {
        this.stunTimer--;
        if (this.skeletonTimer > 0) this.skeletonTimer--;
        
        this.isMoving = false;
        
        if (this.stunTimer <= 0 && this.hp > 0) {
            this.state = "CHASE"; 
        }
        return; 
    }

    this.forceNudge();

    if (this.isNeutral) {
        if (this.state !== "PATROL") {
            this.state = "PATROL";
            this.patrolTimer = 360;
            this.targetBuilding = getPatrolBuilding();
        }
        
        let aDx = 0, aDy = 0;
        this.patrolTimer--; 
        if (this.patrolTimer <= 0 || !this.targetBuilding) { 
            this.targetBuilding = getPatrolBuilding(); 
            this.patrolTimer = 360; 
            this.patrolCorner = floor(random(4)); 
        }
        if (this.targetBuilding) {
            let b = this.targetBuilding, c = [{ x: b.x - b.w / 2 - 40, y: b.y - b.h / 2 - 40 }, { x: b.x + b.w / 2 + 40, y: b.y - b.h / 2 - 40 }, { x: b.x + b.w / 2 + 40, y: b.y + b.h / 2 + 40 }, { x: b.x - b.w / 2 - 40, y: b.y + b.h / 2 + 40 }];
            let t = c[this.patrolCorner]; 
            this.aimAngle = atan2(t.y - this.y, t.x - this.x); 
            let vx = cos(this.aimAngle) * 1.0, vy = sin(this.aimAngle) * 1.0; 
            let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
            if (dist(this.x, this.y, t.x, t.y) < 15) { this.patrolCorner = (this.patrolCorner + 1) % 4; }
        } else { 
            this.aimAngle += 0.05; 
        }
        
        if (aDx !== 0 || aDy !== 0) { 
            this.isMoving = true; 
            this.walkCycle += 0.2; 
            this.moveAngle = atan2(aDy, aDx); 
        } else { 
            this.isMoving = false; 
        }
        this.armDrag = lerp(this.armDrag, this.isMoving ? 1 : 0, 0.15);
        return; 
    }

    if (this.wetTimer === undefined) this.wetTimer = 0;
    if (this.wetTimer > 0) { this.wetTimer--; if (frameCount % 15 === 0) emit(this.x + random(-10, 10), this.y + random(-10, 10), 1, color(100, 150, 255), "BLOOD"); }

    if (this.fireTimer > 0) this.fireTimer--; 
    if (this.muzzleFlash > 0) this.muzzleFlash--; 
        if (this.reloadTimer > 0 && --this.reloadTimer <= 0) { 
        let mult = ((this.isPlayer || this.isFriendly) && window.milLvl >= 2) ? 2 : 1;
        this.ammo = this.currentWeapon.maxAmmo * mult; 
    }
 this.ammo = this.currentWeapon.maxAmmo; 
    if (this.biteCooldown > 0) this.biteCooldown--;
    if (this.ignoreBldgTimer > 0) this.ignoreBldgTimer--; 
    if (this.orbChargeTimer > 0) { this.orbChargeTimer--; if (this.orbChargeTimer === 1) { spawnOrb(this.x + cos(this.aimAngle) * 50, this.y + sin(this.aimAngle) * 50); this.fireTimer = 100; } }

    let spd = this.eType === "ARMORED" ? 0.65 : (this.eType === "AERIAL" ? 1.25 : ((this.eType === "AERIAL_PISTOL" || this.eType === "SAUCER" || this.eType === "SAUCER_RED") ? 1.47 : (this.eType === "SNAIL" ? 0.5 : (this.eType === "BUG" || this.eType === "MOLOTOV" || this.eType === "ARMORED_STANDARD" || this.eType === "ALIEN_GATOR" || this.eType === "SNAIL_HYBRID" ? 1.0 : 1.0))));
    let aDx = 0, aDy = 0;
    
    if (this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL" || this.eType === "SAUCER" || this.eType === "SAUCER_RED") { emit(this.x, this.y, 1, color(0, 200, 255), "THRUST", -cos(this.aimAngle) * 5, -sin(this.aimAngle) * 5); emit(this.x, this.y, 1, color(255, 100, 0), "THRUST", -cos(this.aimAngle) * 5, -sin(this.aimAngle) * 5); }

    if (this.isFriendly) {
        if (this.baseState === undefined) this.baseState = "FOLLOW";

        let closeE = null, cD = Infinity;
        for (let e of enemiesList) {
            if (!e.isFriendly && !e.dead && e.hp > 0) {
                let d = dist(this.x, this.y, e.x, e.y);
                if (d < cD) { cD = d; closeE = e; }
            }
        }

        let isFighting = false;
        let trg = player;
        if (closeE && cD < 600) { trg = closeE; isFighting = true; }

        let distToTarget = dist(this.x, this.y, trg.x, trg.y);
        let angToTarget = atan2(trg.y - this.y, trg.x - this.x);
        let shouldMove = false;
        let moveTargetX = this.x, moveTargetY = this.y;

        if (this.baseState === "HOLD_PERIMETER") {
            if (isFighting && dist(this.holdPos.x, this.holdPos.y, trg.x, trg.y) < 300) {
                this.aimAngle = angToTarget;
                if (distToTarget > 150) { moveTargetX = trg.x; moveTargetY = trg.y; shouldMove = true; }
            } else {
                if (dist(this.x, this.y, this.holdPos.x, this.holdPos.y) > 50) {
                    moveTargetX = this.holdPos.x; moveTargetY = this.holdPos.y; shouldMove = true;
                    this.aimAngle = atan2(moveTargetY - this.y, moveTargetX - this.x);
                } else if (isFighting) {
                    this.aimAngle = angToTarget;
                } else {
                    this.aimAngle += 0.02;
                }
            }
        }
        else if (this.baseState === "SEARCH_DIRECTION") {
            if (isFighting) {
                this.aimAngle = angToTarget;
                if (distToTarget > 200) { moveTargetX = trg.x; moveTargetY = trg.y; shouldMove = true; }
            } else {
                let moveSpeed = 2.0 * spd;
                let vx = 0, vy = 0;
                if (this.searchDir === "NORTH") vy = -moveSpeed;
                if (this.searchDir === "SOUTH") vy = moveSpeed;
                if (this.searchDir === "EAST") vx = moveSpeed;
                if (this.searchDir === "WEST") vx = -moveSpeed;

                let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
                this.aimAngle = atan2(vy || 0.01, vx || 0.01);
            }
        }
        else { 
            if (isFighting) {
                this.aimAngle = angToTarget;
                if (distToTarget > 200) { moveTargetX = trg.x; moveTargetY = trg.y; shouldMove = true; }
            } else {
                let myIndex = enemiesList.filter(e => e.isFriendly && !e.dead).indexOf(this);
                let slot = myIndex > -1 ? myIndex : 0;

                let rowWidth = 5; 
                let row = Math.floor(slot / rowWidth) + 1.2; 
                let col = (slot % rowWidth) - Math.floor(rowWidth / 2); 

                let spacing = 65; 
                let backAng = player.aimAngle + PI; 
                let sideAng = player.aimAngle + HALF_PI; 

                let fX = player.x + (cos(backAng) * (row * spacing)) + (cos(sideAng) * (col * spacing));
                let fY = player.y + (sin(backAng) * (row * spacing)) + (sin(sideAng) * (col * spacing));
                
                if (dist(this.x, this.y, fX, fY) > 50) {
                    moveTargetX = fX; moveTargetY = fY; shouldMove = true;
                    this.aimAngle = atan2(moveTargetY - this.y, moveTargetX - this.x);
                } else {
                    let dAng = player.aimAngle - this.aimAngle;
                    while (dAng < -PI) dAng += TWO_PI;
                    while (dAng > PI) dAng -= TWO_PI;
                    this.aimAngle += dAng * 0.1;
                }
            }
        }

        if (shouldMove) {
            let mAng = atan2(moveTargetY - this.y, moveTargetX - this.x);
            let vx = cos(mAng) * 2.45 * spd;
            let vy = sin(mAng) * 2.45 * spd;
            let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
        }

        let canSee = hasLOS(this.x, this.y, trg.x, trg.y);
        if (isFighting && canSee && distToTarget < 600 && this.fireTimer <= 0 && this.ammo > 0 && this.reloadTimer <= 0) {
            let sA = angToTarget;
            if (random() > 0.25 && distToTarget > 80) sA = angToTarget + atan2(random(30, 60) * (random() > 0.5 ? 1 : -1), distToTarget);
            this.aimAngle = sA;
            this.fire(sA);
        }
        
        if (aDx !== 0 || aDy !== 0) { this.isMoving = true; this.walkCycle += 0.2 * spd; this.moveAngle = atan2(aDy, aDx); } 
        else { this.isMoving = false; }
        this.armDrag = lerp(this.armDrag, this.isMoving ? 1 : 0, 0.15);
        return; 
    }

        let trg = player;
    
    // --- MOVED OUTSIDE THROTTLE: Determine target every frame so they don't snap back ---
    if (!this.isFriendly) {
        if (this.aggroTarget && this.aggroTarget.hp > 0 && !this.aggroTarget.dead) {
            trg = this.aggroTarget;
        } else if (this.leader && !this.leader.dead && this.leader.hp > 0) {
            trg = this.leader;
        } else {
            this.leader = null;
        }
    }

    // SKIP FRAME UPDATES: Only calculate expensive AI logic once every 10 frames
    if (frameCount % 10 === this.aiOffset) {
        
        // Decrement the timer here so it accurately counts down
        if (this.aggroTarget) {
            this.aggroTimer -= 10;
            if (this.aggroTimer <= 0) this.aggroTarget = null;
        }

        this.cachedTargetDist = dist(this.x, this.y, trg.x, trg.y);
        this.cachedCanSee = (this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL" || this.eType === "SAUCER" || this.eType === "SAUCER_RED") ? true : hasLOS(this.x, this.y, trg.x, trg.y);
        this.cachedTargetAngle = atan2(trg.y - this.y, trg.x - this.x);

        if (this.leader) {
            this.cachedTargetAngle += random(-0.4, 0.4); 
        }

        if (this.cachedCanSee) {
            this.lastKnownX = trg.x;
            this.lastKnownY = trg.y;
        }

        if (nm0AmbushActive && !this.isFriendly) {
            this.lastKnownX = trg.x;
            this.lastKnownY = trg.y;
            this.loseSightTimer = 1200; // Permanently lock the timer
            this.state = "CHASE";
        }
    }

    
    let dToP = this.cachedTargetDist;
    let canSee = this.cachedCanSee;
    let iA = this.cachedTargetAngle; 
    let inFOV = true;

    if (ninjaSuitUnlocked && this.state === "PATROL" && !this.isFriendly) {
        if (abs((iA - this.aimAngle + PI * 3) % TWO_PI - PI) > PI / 2) inFOV = false; 
	}

    if (canSee && inFOV && dToP < 600) { 
        this.state = "CHASE"; this.loseSightTimer = 3500; // 20 Seconds
    } 
    else if (this.state === "CHASE") { 
        this.loseSightTimer--; 
        if (this.loseSightTimer <= 0) { 
            this.state = "PATROL"; this.targetBuilding = getPatrolBuilding(); this.patrolTimer = 360; this.patrolCorner = floor(random(4)); 
            this.lastKnownX = undefined;
            this.lastKnownY = undefined;
        } 
    }

    if (this.state === "PATROL") { 
        this.patrolTimer--; if (this.patrolTimer <= 0 || !this.targetBuilding) { this.targetBuilding = getPatrolBuilding(); this.patrolTimer = 360; this.patrolCorner = floor(random(4)); }
        if (this.targetBuilding) {
            let b = this.targetBuilding, c = [{ x: b.x - b.w / 2 - 40, y: b.y - b.h / 2 - 40 }, { x: b.x + b.w / 2 + 40, y: b.y - b.h / 2 - 40 }, { x: b.x + b.w / 2 + 40, y: b.y + b.h / 2 + 40 }, { x: b.x - b.w / 2 - 40, y: b.y + b.h / 2 + 40 }];
            let t = c[this.patrolCorner]; this.aimAngle = atan2(t.y - this.y, t.x - this.x); let vx = cos(this.aimAngle) * 1.4 * spd, vy = sin(this.aimAngle) * 1.4 * spd; 
            let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
            if (dist(this.x, this.y, t.x, t.y) < 15) { this.patrolCorner = (this.patrolCorner + 1) % 4; }
        } else { this.aimAngle += 0.05; }
    }
    else if (this.state === "CHASE") {
        let targetX = (canSee || nm0AmbushActive) ? trg.x : (this.lastKnownX !== undefined ? this.lastKnownX : trg.x);
        let targetY = (canSee || nm0AmbushActive) ? trg.y : (this.lastKnownY !== undefined ? this.lastKnownY : trg.y);
        let distToTarget = dist(this.x, this.y, targetX, targetY);
        
        iA = atan2(targetY - this.y, targetX - this.x); 
        this.aimAngle = iA;

        if (this.eType === "SNAIL_HYBRID") {
            if (this.eyeBleedL > 0) { this.eyeBleedL--; if (this.eyeBleedL % 5 === 0) emit(this.x + cos(this.aimAngle)*15 - sin(this.aimAngle)*-35, this.y + sin(this.aimAngle)*15 + cos(this.aimAngle)*-35, 1, color(0, 100, 0), "BLOOD"); }
            if (this.eyeBleedR > 0) { this.eyeBleedR--; if (this.eyeBleedR % 5 === 0) emit(this.x + cos(this.aimAngle)*15 - sin(this.aimAngle)*35, this.y + sin(this.aimAngle)*15 + cos(this.aimAngle)*35, 1, color(0, 100, 0), "BLOOD"); }
            if (this.leftEye <= 0 && this.rightEye <= 0 && !this.enraged) { this.enraged = true; sfx.deathGrunt(); }

            if (this.enraged) {
                if (distToTarget > 20 || canSee) {
                    let vx = cos(iA) * 3.5 * spd, vy = sin(iA) * 3.5 * spd; let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
                }
                if (frameCount % 15 === 0) { spawnSplatter(this.x, this.y, "BLOOD", color(0, 100, 0)); emit(this.x, this.y, 3, color(0, 100, 0), "BLOOD"); }
                if (dToP < 70 && trg.hp > 0 && !trg.dead) { trg.takeDamage(999); trg.dead = true; sfx.deathGrunt(); corpses.push(new Corpse(trg.x, trg.y, trg.moveAngle, trg.aimAngle, trg.shirtCol, trg.pantsCol, 13, 0, trg.decals, trg.currentWeapon, 0, "NORMAL", trg.bodyW, trg.bodyH)); if(trg.isPlayer) playerRespawnTimer = 90; }
            } else {
                if (canSee && dToP < 600) {
                    if (this.burstCooldown > 0) { this.burstCooldown--; } 
                    else if (this.fireTimer <= 0) {
                        let tX_R = this.x + cos(this.aimAngle) * 70 - sin(this.aimAngle) * 10, tY_R = this.y + sin(this.aimAngle) * 70 + cos(this.aimAngle) * 10;
                        let tX_L = this.x + cos(this.aimAngle) * 70 - sin(this.aimAngle) * -10, tY_L = this.y + sin(this.aimAngle) * 70 + cos(this.aimAngle) * -10;
                        spawnBullet(tX_R, tY_R, iA, false, "BODY", "PINK_LASER", this); 
                        spawnBullet(tX_L, tY_L, iA, false, "BODY", "PINK_LASER", this);
                        sfx.shoot(); this.burstsFired++; if (this.burstsFired >= 3) { this.burstCooldown = 156; this.burstsFired = 0; } else { this.fireTimer = 30; }
                    }
                }
                if (canSee || distToTarget > 20) {
                    if (!canSee) {
                        let vx = cos(iA) * 2.5 * spd, vy = sin(iA) * 2.5 * spd; let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
                    } else {
                        let distErr = dToP - 300, approachX = cos(iA) * distErr * 0.02, approachY = sin(iA) * distErr * 0.02, strafeX = cos(iA + (PI / 2) * this.strafeDir) * 2.5, strafeY = sin(iA + (PI / 2) * this.strafeDir) * 2.5;
                        let vx = (approachX + strafeX) * spd, vy = (approachY + strafeY) * spd; let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
                        if (frameCount % 120 === 0 && random() < 0.3) this.strafeDir *= -1; 
                    }
                }
            }
        } else if (this.eType === "BUG" || this.eType === "SNAIL") { 
            if (this.eType === "SNAIL") {
                // Snail Logic remains unchanged
                if (this.isMoving && frameCount % 30 === 0) sludges.push(new SludgeZone(this.x, this.y, 20, 90)); 
                if (dToP < 250 && this.fireTimer <= 0 && canSee) { grenades.push(new AcidSpit(this.x, this.y, trg.x, trg.y)); sfx.throwG(); this.fireTimer = 180; }
                if (distToTarget > 210 || (!canSee && distToTarget > 20)) { let vx = cos(iA) * 6.0 * spd, vy = sin(iA) * 6.0 * spd; let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y; }
            } else if (this.eType === "BUG") {
                let hitFence = false;
                
                // NEW FENCE EATING LOGIC
                if (this.biteCooldown <= 0) {
                    for (let j = buildings.length - 1; j >= 0; j--) {
                        let b = buildings[j];
                        if (b.isFence && b.hp !== undefined && b.hp > 0) {
                            let hw = b.w/2 + 20, hh = b.h/2 + 20;
                            // Check if the bug is pushing against a fence
                            if (this.x > b.x - hw && this.x < b.x + hw && this.y > b.y - hh && this.y < b.y + hh) {
                                b.hp -= 20; // 20 damage per bite per bug
                                sfx.slash(); // Audible crunch
                                this.biteCooldown = 30;
                                hitFence = true;
                                if (b.hp <= 0) {
                                    triggerExplosion(b.x, b.y, 60, false, false); // Small explosive breakdown
                                    buildings.splice(j, 1);
                                }
                                break;
                            }
                        }
                    }
                }
                                // STANDARD BITE LOGIC (Only fires if not actively eating a fence)
                if (!hitFence && distToTarget < 35 && this.biteCooldown <= 0) {  // <--- CHANGED dToP to distToTarget
                    let dRes = trg.takeDamage(5); 
                    if (dRes.blocked) { 
                        emit(trg.x, trg.y, dRes.broken ? 15 : 8, color(0, 200, 255), "SPARK"); sfx.hitArmor(); 
                    } else { 
                        emit(trg.x, trg.y, 8, color(90, 0, 0), "BLOOD"); 
                    }
                    sfx.bite(); this.biteCooldown = 84; 
                    if (trg.hp <= 0 && !trg.dead) { 
                        trg.dead = true; sfx.deathGrunt(); 
                        corpses.push(new Corpse(trg.x, trg.y, trg.moveAngle, trg.aimAngle, trg.shirtCol, trg.pantsCol, 0, 0, trg.decals, trg.currentWeapon, 0, "NORMAL", trg.bodyW, trg.bodyH)); 
                        if(trg.isPlayer) playerRespawnTimer = 90; 
                    }
                } 

                if (canSee || distToTarget > 20) {
                    let vx = cos(iA) * 6.0 * spd, vy = sin(iA) * 6.0 * spd; let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y; 
                }
            }
        }

        else if (this.eType === "SAUCER" || this.eType === "SAUCER_RED" || this.eType === "AERIAL") {
           if (this.eType === "SAUCER" || this.eType === "AERIAL") {
               if (canSee && dToP < 500 && this.fireTimer <= 0) { grenades.push(new Grenade(this.x, this.y, trg.x, trg.y, this.eType==="SAUCER")); sfx.throwG(); this.fireTimer = 160; }
               if (distToTarget > 250 || (!canSee && distToTarget > 20)) { let vx = cos(iA) * 2.45 * spd, vy = sin(iA) * 2.45 * spd; this.x += vx; this.y += vy; aDx = vx; aDy = vy; }
           } else if (this.eType === "SAUCER_RED") {
               if (canSee && dToP < 600) {
                   if (this.burstCooldown > 0) { this.burstCooldown--; } else if (this.fireTimer <= 0) { this.fire(iA); this.burstsFired++; if (this.burstsFired >= 3) { this.burstCooldown = 156; this.burstsFired = 0; } else { this.fireTimer = 30; } }
               }
               if (canSee || distToTarget > 20) {
                   if (!canSee) {
                       let vx = cos(iA) * 3.5 * spd, vy = sin(iA) * 3.5 * spd; this.x += vx; this.y += vy; aDx = vx; aDy = vy;
                   } else {
                       let distErr = dToP - 350, approachX = cos(iA) * distErr * 0.02, approachY = sin(iA) * distErr * 0.02, strafeX = cos(iA + (PI / 2) * this.strafeDir) * 3.5, strafeY = sin(iA + (PI / 2) * this.strafeDir) * 3.5;
                       let vx = (approachX + strafeX) * spd, vy = (approachY + strafeY) * spd, maxSpd = 3.5 * spd, mag = dist(0, 0, vx, vy); if (mag > maxSpd) { vx = (vx / mag) * maxSpd; vy = (vy / mag) * maxSpd; }
                       this.x += vx; this.y += vy; aDx = vx; aDy = vy;
                       if (frameCount % 120 === 0 && random() < 0.3) this.strafeDir *= -1; 
                   }
               }
           }
        }
        else if (this.eType === "MOLOTOV") { 
            if (canSee && dToP < 500 && this.fireTimer <= 0) { grenades.push(new Molotov(this.x, this.y, trg.x, trg.y)); sfx.throwG(); this.fireTimer = 180; } 
            if (distToTarget > 300 || (!canSee && distToTarget > 20)) { let vx = cos(iA) * 2.45 * spd, vy = sin(iA) * 2.45 * spd; let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y; } 
        }
        else { 
            if (typeof isHardMode !== 'undefined' && isHardMode) {
                if (this.standStillTimer === undefined) { this.standStillTimer = 0; this.strafeTimer = 0; this.strafeDir = 1; }
                let mAng = iA;
                
                if (this.eType === "NORMAL" || this.eType === "ARMORED_STANDARD" || this.eType === "FEMALE_PISTOL") {
                    if (this.squadSlot === undefined) this.squadSlot = (Math.floor(this.x + this.y) % 7) - 3; 
                    let baseAng = iA;
                    let fX = targetX + cos(baseAng + HALF_PI) * (this.squadSlot * 75);
                    let fY = targetY + sin(baseAng + HALF_PI) * (this.squadSlot * 75);
                    mAng = atan2(fY - this.y, fX - this.x);
                }

                if (this.strafeTimer > 0) {
                    this.strafeTimer--; let sAng = iA + (HALF_PI * this.strafeDir);
                    let vx = cos(sAng) * 3.5 * spd, vy = sin(sAng) * 3.5 * spd;
                    let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y;
                } else if (distToTarget > 350 || !canSee) { 
                    if (distToTarget > 20) {
                        let vx = cos(mAng) * 2.45 * spd, vy = sin(mAng) * 2.45 * spd; 
                        let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y; 
                        this.standStillTimer = 0; 
                    }
                } else {
                    if (this.eType === "NORMAL" || this.eType === "ARMORED_STANDARD" || this.eType === "FEMALE_PISTOL") {
                        this.standStillTimer++;
                        if (this.standStillTimer > 78) { 
                            this.standStillTimer = 0; 
                            this.strafeTimer = 45; 
                            this.strafeDir = random() > 0.5 ? 1 : -1;
                            this.squadSlot = (this.squadSlot + this.strafeDir); 
                            if (this.squadSlot > 3) this.squadSlot = -3;
                            if (this.squadSlot < -3) this.squadSlot = 3;
                        }
                    }
                }

                if (canSee && dToP < 700 && this.fireTimer <= 0 && this.ammo > 0 && this.reloadTimer <= 0) { 
                    this.fire(iA); 
                    this.strafeTimer = 0;
                }
                
            } else {
                if (distToTarget > 200 || (!canSee && distToTarget > 20)) { 
                    let vx = cos(iA) * 2.45 * spd, vy = sin(iA) * 2.45 * spd; 
                    let m = this.attemptMove(vx, vy); aDx = m.x; aDy = m.y; 
                } 
                if (canSee && dToP < 400 && this.fireTimer <= 0 && this.ammo > 0 && this.reloadTimer <= 0) { 
                    if(this.eType === "ARMORED" && this.orbChargeTimer <= 0) { this.orbChargeTimer = 120; sfx.charge(); } 
                    else if (this.eType !== "ARMORED") { 
                        let sA = iA; 
                        if (random() > 0.25 && dToP > 80) sA = iA + atan2(random(30, 60) * (random() > 0.5 ? 1 : -1), dToP); 
                        this.aimAngle = sA; 
                        this.fire(sA); 
                    } 
                } 
            }
        }
    }
    
            if (aDx !== 0 || aDy !== 0) { 
        this.isMoving = true; 
        this.walkCycle += 0.2 * spd; 
        this.moveAngle = atan2(aDy, aDx); 

        // OVERRIDE: If actively evading a wall, force the body to turn and face the path
        if (this.evadeTimer > 0 && this.state !== "STUNNED") {
            this.aimAngle = this.moveAngle; // Lock the body rotation to the walking direction
            this.fireTimer = max(this.fireTimer, 5); // Prevent shooting sideways while turning
        }
    } else { 
        this.isMoving = false; 
    } 
    
    this.armDrag = lerp(this.armDrag, this.isMoving ? 1 : 0, 0.15);
} 







        fire(sA) {
    if (this.isPlayer) this.isArmed = true;
    let aH = ((this.isPlayer || this.isFriendly) && headAimToggle) ? "HEAD" : "BODY", cd = (this.isPlayer || this.isFriendly) ? this.currentWeapon.fireCooldown : (this.currentWeapon.enemyCooldown || 48), bob = this.isMoving ? abs(sin(this.walkCycle)) * 2 : 0;
    let cost = this.currentWeapon === WEAPONS.DUAL_SMG ? 2 : 1;
    let bLX = 31, bLY = 8, bLX_L = 59, bLY_L = -17;
    if (this.currentWeapon === WEAPONS.ASSAULT_RIFLE || this.currentWeapon === WEAPONS.SHOTGUN || this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { bLX = 47; bLY = 6; } else if (this.currentWeapon === WEAPONS.SMG || this.currentWeapon === WEAPONS.DUAL_SMG) { bLX = 38; bLY = 11; bLX_L = 38; bLY_L = -11; }
    if (this.eType === "ALIEN_GATOR" || this.eType === "SNAIL_HYBRID") { bLX = 100; bLY = 19; } if (this.eType === "AERIAL_PISTOL") { bLX = 51; bLY = 16; }
    
    let tX = this.x + cos(this.aimAngle) * (bLX + bob) - sin(this.aimAngle) * bLY, tY = this.y + sin(this.aimAngle) * (bLX + bob) + cos(this.aimAngle) * bLY;
    
    if (this.eType === "ALIEN_GATOR") { spawnOrb(tX, tY, false, true); sfx.shoot(); this.fireTimer = 90; } 
    else if (this.eType === "SAUCER_RED") {
        let tX_R = this.x + cos(this.aimAngle) * 45 - sin(this.aimAngle) * 25, tY_R = this.y + sin(this.aimAngle) * 45 + cos(this.aimAngle) * 25;
        let tX_L = this.x + cos(this.aimAngle) * 45 - sin(this.aimAngle) * -25, tY_L = this.y + sin(this.aimAngle) * 45 + cos(this.aimAngle) * -25;
        spawnBullet(tX_R, tY_R, sA + random(-0.1, 0.1), false, "BODY", "RED_LASER", this); 
        spawnBullet(tX_L, tY_L, sA + random(-0.1, 0.1), false, "BODY", "RED_LASER", this); sfx.shoot();
    } else if (this.currentWeapon === WEAPONS.DUAL_SMG) {
        let tX_L = this.x + cos(this.aimAngle) * (bLX_L + bob) - sin(this.aimAngle) * bLY_L, tY_L = this.y + sin(this.aimAngle) * (bLX_L + bob) + cos(this.aimAngle) * bLY_L;
        let iP = this.isPlayer || this.isFriendly;
        spawnBullet(tX, tY, sA + random(-this.currentWeapon.spread, this.currentWeapon.spread), iP, aH, this.currentWeapon, this);
        spawnBullet(tX_L, tY_L, sA + random(-this.currentWeapon.spread, this.currentWeapon.spread), iP, aH, this.currentWeapon, this);
        sfx.shoot(); 
        
        // EXCLUSIVE PLAYER SHAKE
        if (this.isPlayer) screenShake = 3; 
        
        emit(tX, tY, 3, color(255, 200, 0), "MUZZLE", cos(sA) * 5, sin(sA) * 5); emit(tX_L, tY_L, 3, color(255, 200, 0), "MUZZLE", cos(sA) * 5, sin(sA) * 5); 
    } else if (this.currentWeapon === WEAPONS.SHOTGUN) { 
        let s = [-0.1275, -0.0425, 0.0425, 0.1275]; for (let i = 0; i < 4; i++) spawnBullet(tX, tY, sA + s[i], this.isPlayer || this.isFriendly, aH, this.currentWeapon, this); 
        sfx.shotgun(); 
        
        // EXCLUSIVE PLAYER SHAKE
        if (this.isPlayer) screenShake = 8; 
        
        emit(tX, tY, 6, color(255, 200, 0), "MUZZLE", cos(sA) * 8, sin(sA) * 8); 
    } else { 
        spawnBullet(tX, tY, sA + random(-this.currentWeapon.spread, this.currentWeapon.spread), this.isPlayer || this.isFriendly, aH, this.currentWeapon, this); 
        sfx.shoot(); 
        
        // EXCLUSIVE PLAYER SHAKE
        if (this.isPlayer && (this.currentWeapon === WEAPONS.SMG || this.currentWeapon === WEAPONS.ASSAULT_RIFLE)) screenShake = 2; 
        
        emit(tX, tY, 3, color(255, 200, 0), "MUZZLE", cos(sA) * 5, sin(sA) * 5); 
    }
    this.ammo = Math.max(0, this.ammo - cost); if (this.eType !== "SAUCER_RED" && this.eType !== "ALIEN_GATOR") this.fireTimer = cd; this.muzzleFlash = 3; 
    if (this.ammo <= 0) { if (this.isPlayer || this.isFriendly) { this.triggerReload(); } else { this.reloadTimer = 90; } }
  }



  show() {
    push(); translate(this.x, this.y);
// 1. Skeleton Flashing Animation (1.1 seconds)
if (this.skeletonTimer > 0 && frameCount % 6 < 3) {
    rotate(this.aimAngle);
    stroke(255); strokeWeight(4); 
    line(0, -12, 0, 12); // Spine
    line(-8, -6, 8, -6); // Shoulders
    line(-6, 12, -8, 20); // Legs
    line(6, 12, 8, 20);
    fill(255); noStroke(); ellipse(0, 0, 14, 16); // Skull
    fill(0); ellipse(-3, -2, 4, 4); ellipse(3, -2, 4, 4); // Eye sockets
    pop();
    return; // Skip drawing the regular body
}

// 2. 1-Minute Ground Stun State
if (this.stunTimer > 0 && this.skeletonTimer <= 0) {
    rotate(this.aimAngle); // Fall over randomly
    
    let sOff = (currentLevel === 1 || currentLevel === 3) ? 15 : 10;
    let sAlp = (currentLevel === 1 || currentLevel === 3) ? 45 : 80;
    fill(0, sAlp); noStroke();
    ellipse(sOff, sOff, this.bodyW + 20, this.bodyH + 5); 

    let lW = 18, lX = -18, lY1 = -10, lY2 = 2;

    fill(this.pantsCol); noStroke();
    rect(lX, lY1, lW, 8, 4);
    rect(lX, lY2, lW, 8, 4);

    fill(this.shirtCol);
    ellipse(0, lY1 - 2, 20, 8); 
    ellipse(0, lY2 + 2, 20, 8); 

    fill(this.shirtCol);
    ellipse(0, 0, this.bodyW, this.bodyH);

    if (this.eType === "FEMALE_PISTOL") {
        fill(this.shirtCol);
        ellipse(4, -6, 12, 10); ellipse(4, 6, 12, 10);
    }

    let sK = color(235, 180, 140);
    fill(sK); ellipse(12, 0, 11, 11);
    if (this.eType === "FEMALE_PISTOL") {
        fill(15); arc(12, 0, 12, 12, HALF_PI, PI + HALF_PI);
    }

    // Draw rotating stars by the head
    for (let i = 0; i < 3; i++) {
        let a = frameCount * 0.1 + (i * TWO_PI / 3);
        fill(255, 255, 0); noStroke();
        ellipse(15 + cos(a) * 15, sin(a) * 15, 4, 4); 
    }

    pop();
    return; // Skip normal standing draw!
} else if (this.stunTimer > 0) {
    // Keep stars spinning during the standing non-flashing frames too!
    for (let i = 0; i < 3; i++) {
        let a = frameCount * 0.1 + (i * TWO_PI / 3);
        fill(255, 255, 0); noStroke();
        ellipse(cos(a) * 15, -25 + sin(a) * 15, 4, 4); 
    }
}


    let sOff = (currentLevel === 1 || currentLevel === 3) ? 15 : 10;
    let sAlp = (currentLevel === 1 || currentLevel === 3) ? 45 : 80;
    fill(0, sAlp); noStroke();
    
    if (this.eType === "SAUCER" || this.eType === "SAUCER_RED") { ellipse(sOff * 2, sOff * 2, 80, 80); }
    else if (this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL") { ellipse(sOff * 2, sOff * 2, this.bodyW, this.bodyH); }
    else if (this.eType === "ARMORED" || this.eType === "ALIEN_GATOR" || this.eType === "SNAIL_HYBRID") { ellipse(sOff, sOff, this.bodyW * 0.8, this.bodyH); }
    else { ellipse(sOff, sOff, this.bodyW + 5, this.bodyH + 5); }

    if (this.muzzleFlash > 0 && this.reloadTimer <= 0) {
        push();
        let isHeavy = (this.currentWeapon === WEAPONS.SHOTGUN || this.currentWeapon === WEAPONS.ROCKET_LAUNCHER || this.eType === "SAUCER_RED");
        let radius = isHeavy ? 180 : 100;
        let maxAlpha = (this.muzzleFlash / 3) * (isHeavy ? 0.45 : 0.25); 
        
        translate(cos(this.aimAngle) * 20, sin(this.aimAngle) * 20);
        
        let ctx = drawingContext;
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        grad.addColorStop(0, `rgba(255, 220, 50, ${maxAlpha})`);
        grad.addColorStop(0.3, `rgba(255, 120, 0, ${maxAlpha * 0.6})`);
        grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = grad;
        noStroke();
        ellipse(0, 0, radius * 2, radius * 2); 
        pop();
    }

    if (this.eType === "SAUCER" || this.eType === "SAUCER_RED") { push(); rotate(this.aimAngle); fill(100); stroke(this.eType === "SAUCER_RED" ? color(200, 50, 50) : 150); strokeWeight(4); ellipse(0, 0, 80, 80); fill(this.eType === "SAUCER_RED" ? color(255, 50, 50) : color(150, 50, 200)); noStroke(); ellipse(0, 0, 40, 40); fill(80); rect(10, -35, 40, 16, 4); rect(10, 19, 40, 16, 4); if(this.eType === "SAUCER_RED") { fill(200, 20, 20); rect(40, -28, 15, 6); rect(40, 22, 15, 6); } pop(); pop(); return; }
    if (this.eType === "BUG") { rotate(this.aimAngle); fill(70, 90, 50); ellipse(0, 0, this.bodyW, this.bodyH); fill(30); ellipse(8, 0, 10, 10); stroke(30); strokeWeight(2); line(-5, 0, -12, 12 + sin(frameCount * 0.5) * 5); line(-5, 0, -12, -12 - sin(frameCount * 0.5) * 5); line(5, 0, 12, 12 + cos(frameCount * 0.5) * 5); line(5, 0, 12, -12 - cos(frameCount * 0.5) * 5); noStroke(); for (let d of this.decals) { if (d.col) fill(d.col[0], d.col[1], d.col[2], d.col[3]); else fill(200, 230, 40, 220); ellipse(d.x, d.y, d.sz, d.sz); } pop(); return; }
    if (this.eType === "SNAIL") { rotate(this.aimAngle); fill(20, 100, 20); ellipse(0, 0, this.bodyW + 10 + sin(frameCount*0.1)*5, this.bodyH); fill(50, 80, 40); ellipse(-5, 0, 24, 20); fill(30, 60, 20); ellipse(-5, 0, 16, 12); fill(30); ellipse(this.bodyW/2, -6, 8, 8); ellipse(this.bodyW/2, 6, 8, 8); stroke(20, 100, 20); strokeWeight(2); line(10, -4, this.bodyW/2, -6); line(10, 4, this.bodyW/2, 6); noStroke(); for (let d of this.decals) { if (d.col) fill(d.col[0], d.col[1], d.col[2], d.col[3]); else fill(20, 100, 20, 220); ellipse(d.x, d.y, d.sz, d.sz); } pop(); return; }
    // --- NEW: RENDER COW MODEL ---
    if (this.eType === "COW") {
        push(); rotate(this.aimAngle);
        
        let swing = this.isMoving ? sin(this.walkCycle) * 6 : 0;
        let bob = this.isMoving ? abs(sin(this.walkCycle)) * 1.5 : 0;
        translate(bob, 0);

        // Legs/Hooves (Dark Grey)
        fill(30); noStroke();
        rect(-15 + swing, -14, 6, 6, 2); // Back left
        rect(12 - swing, -14, 6, 6, 2);  // Front left
        rect(-15 - swing, 8, 6, 6, 2);   // Back right
        rect(12 + swing, 8, 6, 6, 2);    // Front right

        // Tail
        stroke(30); strokeWeight(2);
        line(-this.bodyW/2, 0, -this.bodyW/2 - 12 + (swing * 0.5), 0);
        noStroke();

        // Main Body (White)
        if (this.hitFlash > 0) { this.hitFlash--; fill(255); } else fill(245);
        ellipse(0, 0, this.bodyW, this.bodyH);

        // Random Spots
        for (let d of this.decals) {
            fill(d.col[0], d.col[1], d.col[2], d.col[3]);
            ellipse(d.x, d.y, d.sz, d.sz);
        }

        // Head setup
        push();
        translate(this.bodyW/2 + 4, 0);
        let headBob = this.isMoving ? sin(this.walkCycle * 0.5) * 0.15 : 0;
        rotate(headBob); // Head sways slightly as it walks

        // Head Base
        fill(245); ellipse(0, 0, 18, 16);
        
        // Snout (Pinkish)
        fill(255, 170, 170); ellipse(7, 0, 10, 12);
        
        // Eyes
        fill(15); ellipse(2, -5, 3, 3); ellipse(2, 5, 3, 3);
        
        // Ears & Horns
        fill(245); ellipse(-3, -8, 6, 4); ellipse(-3, 8, 6, 4);
        fill(210, 190, 150); ellipse(-5, -6, 3, 6); ellipse(-5, 6, 3, 6);
        
        pop(); // 1. Close head translate
        pop(); // 2. Close cow body rotation
        pop(); // 3. <--- THE MISSING POP: Closes the master character translate!
        return; // Don't draw the stickman body underneath!
    }

    if (this.eType === "SNAIL_HYBRID") { 
        push(); rotate(this.aimAngle); let bob = this.isMoving ? sin(this.walkCycle)*5 : 0; translate(bob, 0); 
        fill(173, 216, 230); ellipse(0, 0, this.bodyW * 0.7, this.bodyH * 0.7); 
        if (!this.enraged) { fill(20, 100, 20); ellipse(15, 0, 40, 20); fill(50); rect(20, 10, 40, 15); fill(255, 105, 180); rect(55, 12, 10, 10); } 
        else { fill(20, 100, 20); ellipse(25, -14, 35, 12); ellipse(25, 14, 35, 12); }
        fill(20, 100, 20); ellipse(0, 0, 30, 30); 
        if (!this.enraged) { fill(0); noStroke(); ellipse(12, 0, 8, 4); } 
        else { fill(255); stroke(0); strokeWeight(1); rect(9, -6, 6, 12, 1); line(9, 0, 15, 0); line(12, -6, 12, 6); }
        if (this.leftEye > 0) { stroke(20, 100, 20); strokeWeight(4); line(0, -10, 15, -35); fill(255); noStroke(); ellipse(15, -35, 25, 25); fill(0); ellipse(18, -35, 8, 8); } 
        if (this.rightEye > 0) { stroke(20, 100, 20); strokeWeight(4); line(0, 10, 15, 35); fill(255); noStroke(); ellipse(15, 35, 25, 25); fill(0); ellipse(18, 35, 8, 8); } 
        pop(); pop(); return; 
    }

    let lS = this.isMoving ? sin(this.walkCycle) * 12 : 0, bob = this.isMoving ? abs(sin(this.walkCycle)) * 2 : 0;
    if (this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL") { bob += sin(frameCount * 0.1) * 15; lS = 0; }
    if (this.reloadTimer > 0) { let rP = 1 - (this.reloadTimer / 90); push(); noFill(); stroke(0, 200, 255, 150); strokeWeight(4); arc(0, 0, 50, 50, -PI / 2, -PI / 2 + (rP * TWO_PI)); pop(); bob += sin(frameCount * 0.5) * 3; }
    if (this.eType === "ALIEN_GATOR") { 
        push(); rotate(this.moveAngle); fill(this.pantsCol); noStroke(); rect(-30 + lS*3, -30, 54, 24, 12); rect(-30 - lS*3, 6, 54, 24, 12); pop(); 
        push(); rotate(this.aimAngle); translate(bob*3, 0); fill(this.shirtCol); ellipse(0, 0, this.bodyW, this.bodyH); 
        fill(30, 180, 30); ellipse(20, -42, 48, 24); ellipse(40, -42, 24, 24); fill(30, 180, 30); ellipse(45, 33, 75, 24); ellipse(75, 33, 30, 30); 
        fill(40); rect(50, 8, 45, 12, 2); fill(20); rect(90, 6, 10, 16); fill(30, 180, 30); ellipse(0, 0, 33, 33); rect(0, -15, 60, 30, 10); fill(0); ellipse(20, -10, 5, 5); ellipse(20, 10, 5, 5); noStroke(); 
        for (let d of this.decals) { if (d.col) fill(d.col[0], d.col[1], d.col[2], d.col[3]); else fill(90, 0, 0, 220); ellipse(d.x, d.y, d.sz, d.sz); } pop(); pop(); return; 
    }
// 1. AUTO-STATE TRANSITION MANAGER
// ==========================================
if (this.isPlayer) {
    // FORCE UNARMED: Hide the gun whenever a melee swing is active
    if (this.meleeTimer > 0) {
        this.isArmed = false;
    }
    // FORCE ARMED: Immediately show the gun when firing
    else if (this.muzzleFlash > 0|| rightStick.active) {
        this.isArmed = true;
    }
}


    


     let angleDiff = abs((this.moveAngle - this.aimAngle + PI * 3) % TWO_PI - PI);
    let isMovingBackward = this.isMoving && angleDiff > HALF_PI;
    let isChemist = this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked;


            if (isChemist) {
        let sway = this.isMoving ? sin(frameCount * 0.2) * 0.2 : sin(frameCount * 0.05) * 0.05;
        let localTail = this.isMoving ? (this.moveAngle - this.aimAngle) : 0;
        
        // --- 1. ALWAYS DRAW LAB COAT TAIL ---
        push(); 
        rotate(this.aimAngle); 
        translate(bob, 0); 
        rotate(localTail + sway + HALF_PI); 
        fill(240); stroke(200); strokeWeight(1);
        beginShape(); 
        vertex(5, 0); vertex(10, 2); vertex(16, 25); vertex(8, 28); 
        vertex(-8, 28); vertex(-16, 25); vertex(-10, 2); vertex(-5, 0); 
        endShape(CLOSE); 
        pop();
        
        // --- 2. ALWAYS CALCULATE TORSO TWIST & DRAW MAIN BODY ---
        let torsoTwist = 0;

        if (this.meleeTimer > 0 && !this.isArmed) {
            let p = 1 - (this.meleeTimer / 20); 
            let pp = sin(p * PI);
            
            if (this.meleePhase === 1 || this.meleePhase === 3) {
                torsoTwist = radians(70) * pp; 
            } 
            else if (this.meleePhase === 2 || this.meleePhase === 4) {
                torsoTwist = radians(-70) * pp; 
            }
        }

        push();
        rotate(this.aimAngle + torsoTwist); 
        
        // ---> [YOUR EXISTING BODY ELLIPSE/RECT DRAWING CODE GOES HERE] <---
        
        pop();

        // --- 3. ONLY DRAW LEGS IF MOVING BACKWARD ---
        if (isMovingBackward) {
            let isBoxerStance = !this.isArmed && this.meleeTimer > 0;
            let isBigBody = (this.bodyW >= 100);
            let lW = isBigBody ? 40 : 18, lX = isBigBody ? -30 : -10;
            let lY1 = isBigBody ? -10 : -10, lY2 = isBigBody ? 15 : 2;
            
            if (isBoxerStance) { lY1 -= 8; lY2 += 8; lX += 4; }
            let swing = typeof lS !== 'undefined' ? lS : 0;

            push(); 
            rotate(this.moveAngle);
            noStroke(); 
            fill(this.pantsCol);
            rect(lX + swing, lY1, lW, 8, 4); 
            rect(lX - swing, lY2, lW, 8, 4);
            pop();
        }
    } else {
        // ... (Keep your standard non-chemist fallback here)

        push(); rotate(this.moveAngle); noStroke(); fill(this.pantsCol); let lW = this.bodyW === 105 ? 40 : 18, lX = this.bodyW === 105 ? -30 : -10, lY1 = this.bodyW === 105 ? -10 : -10, lY2 = this.bodyW === 105 ? 15 : 2; rect(lX + lS, lY1, lW, 8, 4); rect(lX - lS, lY2, lW, 8, 4); pop();
    }
    push(); rotate(this.aimAngle); translate(bob, 0); 
    
    let bLX = 31, bLY = 8, bLX_L = 59, bLY_L = -17;
    if (this.isArmed && this.currentWeapon === WEAPONS.ASSAULT_RIFLE || this.currentWeapon === WEAPONS.SHOTGUN || this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { bLX = 47; bLY = 6; } 
    else if (this.currentWeapon === WEAPONS.SMG || this.currentWeapon === WEAPONS.DUAL_SMG) { bLX = 38; bLY = 11; bLX_L = 38; bLY_L = -11; }
    else if (this.isArmed && this.currentWeapon === WEAPONS.TASER) {
        fill(255, 255, 0); stroke(10); strokeWeight(1); 
        rect(15, 5, 14, 8, 2); fill(20); rect(18, 13, 6, 8); 
    } 

    if (this.eType === "AERIAL_PISTOL") { bLX = 51; bLY = 16; }

    if (this.isPlayer && rightStick.active && this.reloadTimer <= 0 && this.meleeTimer <= 0) { 
        stroke(255, 0, 0, rightStick.dist > 0.75 ? 200 : 50); strokeWeight(2); line(bLX, bLY, 800, bLY); 
        if (this.currentWeapon === WEAPONS.DUAL_SMG) line(bLX_L, bLY_L, 800, bLY_L);
    }
    
    if (this.isPlayer) {
        if (this.shieldBurstTimer > 0) { push(); noFill(); stroke(0, 200, 255, this.shieldBurstTimer * 17); strokeWeight(3); let bSz = map(this.shieldBurstTimer, 15, 0, this.bodyW, this.bodyW + 50); ellipse(0, 0, bSz, bSz); pop(); }
        if (this.shieldFlashTimer > 0) { push(); noFill(); stroke(0, 200, 255, this.shieldFlashTimer * 25); strokeWeight(3); ellipse(0, 0, this.bodyW + 8, this.bodyH + 8); pop(); }
    }

    if ((this.isPlayer && jetpackUnlocked) || this.eType === "AERIAL" || this.eType === "AERIAL_PISTOL") { fill(80); rect(-18, -12, 12, 24, 3); fill(255, 100, 0); rect(-20, -8, 4, 16); }
    if ((this.isPlayer || this.isMilitary) && typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked) { this.shirtCol = color(60, 100, 40); this.pantsCol = color(139, 115, 85); }
    else if (this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) { this.shirtCol = color(255); this.pantsCol = color(15); } 
    else if (this.isPlayer && ninjaSuitUnlocked) { this.shirtCol = color(20); this.pantsCol = color(15); }

    noStroke(); 
    if (this.hitFlash > 0) { this.hitFlash--; fill(255); } else { fill(this.shirtCol); }
    ellipse(0, 0, this.bodyW, this.bodyH); 

    // Male Farmer Overalls
    if (this.eType === "FARMER_MALE") {
        fill(this.pantsCol);
        rect(-this.bodyW/2 + 2, -this.bodyH/2 + 8, this.bodyW - 4, this.bodyH - 8, 4);
        rect(-this.bodyW/2 + 4, -this.bodyH/2 + 2, 4, 8); // left strap
        rect(this.bodyW/2 - 8, -this.bodyH/2 + 2, 4, 8); // right strap
    }

    // Female Farmer Cutout
    if (this.eType === "FARMER_FEMALE") {
        fill(235, 180, 140);
        ellipse(0, -6, 10, 12); // Skin cutout for cleavage
    }

    // --- FEMALE PISTOL & FARMER FEMALE BREASTS ---
    if (this.eType === "FEMALE_PISTOL" || this.eType === "FARMER_FEMALE") {
        if (this.hitFlash > 0) fill(255); else fill(this.shirtCol);
        stroke(this.eType === "FARMER_FEMALE" ? 200 : 0); // Light crease for white dress
        strokeWeight(1.5); 
        ellipse(4, -5, 11, 9); 
        ellipse(4, 5, 11, 9);  
        
        stroke(200, 150, 120, 100); 
        strokeWeight(1); 
        line(6, -2, 6, 2); 
        noStroke();
    }

    if ((this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) || this.eType === "ALIEN_GATOR") {
        if (this.eType === "ALIEN_GATOR") fill(30, 130, 30); else fill(240); 
        noStroke(); arc(-5, 0, 14, 26, HALF_PI, PI+HALF_PI, CHORD); arc(5, 0, 14, 26, -HALF_PI, HALF_PI, CHORD);
    }

    if (this.eType === "ARMORED_STANDARD") { 
        if (this.hitFlash > 0) fill(255); else fill(100); 
        rect(-10, -12, 20, 24, 4); 
    }
    if (this.isPlayer && ninjaSuitUnlocked) { fill(100, 0, 200); rect(-this.bodyW/2, -4, this.bodyW, 8, 2); } 
 
    noStroke(); for (let d of this.decals) { if (!d.isHead) { if (d.col) fill(d.col[0], d.col[1], d.col[2], d.col[3]); else fill(90, 0, 0, 220); ellipse(d.x, d.y, d.sz, d.sz); } }
    
    let lAY = this.eType === "ARMORED" ? -30 : -14, rAY = this.eType === "ARMORED" ? 30 : 11;
    let a = 255; let f = this.fP || 0; let sK = this.isCharred ? color(50, 40, 40, a) : color(235, 180, 140, a);

    let isNeutralFarmer = this.isNeutral && (this.eType === "FARMER_MALE" || this.eType === "FARMER_FEMALE");

    // --- NEUTRAL ARM SWING OVERRIDE ---
        if (isNeutralFarmer) {
        let swing = this.isMoving ? sin(this.walkCycle) : 0;
        let lArmSwing = -swing; 
        let rArmSwing = swing;  
        let armLY = -14; 
        let armRY = 11;  
        
        // Sleeves
        fill(this.shirtCol); 
        ellipse(lArmSwing * 4, armLY, 16, 9);
        ellipse(rArmSwing * 4, armRY, 16, 9);

        // Hands
        fill(235, 180, 140);
        ellipse(lArmSwing * 14, armLY, 8, 8);
        ellipse(rArmSwing * 14, armRY, 8, 8);
    } else {
                // ---> DEFINE SWORD STATE HERE <---
        let usingSword = (this.isPlayer && typeof swordPickedUp !== 'undefined' && swordPickedUp && window.swordEquipped !== false);

        // --- STANDARD WEAPON & LEFT ARM LOGIC ---
        // THE FIX 1: We ONLY draw unarmed/sword arms if we are strictly !this.isArmed
               if (this.isPlayer && !this.isArmed) {
            let lSy = -14; // Left shoulder base Y
            let rSy = 11;  // Right shoulder base Y

            if (this.meleeTimer <= 0) {
                // --- IDLE / WALKING ARMS ---
                let swing = (typeof lS !== 'undefined') ? (lS / 12) : 0;
                let lArmSwing = -swing;
                let rArmSwing = swing;

                // 1. ALWAYS draw the sleeves so the arm swing is preserved
                fill(this.shirtCol);
                ellipse(lArmSwing * 4, lSy, 16, 9);
                ellipse(rArmSwing * 4, rSy, 16, 9);

                // 2. Depth Layering Thresholds
                let frontThreshold = 0.01; 
                let backThreshold = -0.45; // TUNE THIS: A lower negative (e.g., -0.5) makes the hand 
                                           // stay hidden longer before peeking out the back.

                // --- LEFT HAND ---
                // Visible when swinging forward OR when swung far enough back to clear the torso
                // --- LEFT HAND ---
// --- LEFT HAND ---
if (lArmSwing > frontThreshold || lArmSwing < backThreshold) {
    
    // 1. Check if it's the Player AND wearing the Chemist suit
    if (this.isPlayer && isChemist) {
        // DRAW CANNON (Grey)
        fill(80); 
        rect((lArmSwing * 14) - 4, lSy - 4, 16, 8, 2); 
        fill(0, 255, 200); 
        ellipse((lArmSwing * 14) + 12, lSy, 6, 8);
    } 
    // 2. IMPORTANT: Everyone else gets the skin color
    else {
        fill(235, 180, 140); // This resets the color for all enemies
        ellipse(lArmSwing * 14, lSy, 8, 8);
    }
}




                // --- RIGHT HAND & SWORD ---
                // Visible when swinging forward OR when swung far enough back to clear the torso
                if (rArmSwing > frontThreshold || rArmSwing < backThreshold) {
                    fill(235, 180, 140);
                    ellipse(rArmSwing * 14, rSy, 8, 8);

                    if (usingSword) {
    push();
    translate(rArmSwing * 14, rSy);
    rotate(PI / 6);          // adjust until it looks right
    fill(120);                // blade
    rect(0, -2, 45, 4, 2);

    fill(90, 60, 30);         // handle
    rect(-8, -2, 8, 4);

    fill(180, 150, 40);       // guard
    rect(-2, -5, 3, 10, 2);
    pop();
}
                }

            } else {
                // --- SWORD VS PUNCH COMBO ---
                // (Keep all your existing combo logic exactly the same below here)

                // --- SWORD VS PUNCH COMBO ---
                if (usingSword) {
                    if (this.meleePhase === 4) {
                        let p = 1 - (this.meleeTimer / 30); let sA = PI - (PI * p * 1.25);
                        push(); rotate(sA); fill(this.shirtCol); ellipse(15, -10, 16, 8); fill(235, 180, 140); ellipse(25, -10, 8, 8); fill(200); rect(25, -12, 60, 6, 2); pop(); 
                        
                        push(); noFill(); stroke(255, 100, 0, 255 * (1 - p)); strokeWeight(8); line(15, 0, 15 + (p * 60), 0); pop();
                    } else {
                        let p = 1 - (this.meleeTimer / 20); let sA = PI / 2 - (PI * p); if (this.isBackhand) sA = -PI / 2 + (PI * p); 
                        push(); rotate(sA); if (this.isBackhand) scale(1, -1); fill(this.shirtCol); ellipse(15, -10, 16, 8); fill(235, 180, 140); ellipse(25, -10, 8, 8); fill(200); rect(25, -12, 45, 4, 2); pop(); 
                        
                        push(); noFill(); stroke(255, 150, 0, 255 * (1 - p)); strokeWeight(6); 
                        if (this.isBackhand) { arc(0, 0, 90, 90, -PI/2, -PI/2 + (PI * p)); } 
                        else { arc(0, 0, 90, 90, PI/2 - (PI * p), PI/2); }
                        pop(); 
                    }
                } else {
                    // --- 4-PUNCH COMBO ARMS ---
                    let p = 1 - (this.meleeTimer / 20); 
                    let pp = sin(p * PI);

                    let tTwist = 0;
                    if (this.meleePhase === 1 || this.meleePhase === 3) tTwist = radians(70) * pp;
                    else if (this.meleePhase === 2 || this.meleePhase === 4) tTwist = radians(-70) * pp;

                    push();
                    if (this.meleePhase === 3) {
                        translate(0, lSy); rotate(-tTwist + radians(20) * pp); fill(this.shirtCol); ellipse(7 * pp, 0, 14 * pp + 2, 8); translate(14 * pp, 0); rotate(radians(90) * pp); ellipse(6 * pp, 0, 12 * pp + 2, 8); fill(235, 180, 140); ellipse(12 * pp, 0, 8, 8); 
                    } else {
                        let lFx = 0, lFy = lSy; if (this.meleePhase === 1) { lFx = 20 * pp; lFy = lSy; }
                        let dx = lFx - 0, dy = lFy - lSy; let d = sqrt(dx*dx + dy*dy); let ang = atan2(dy, dx);
                        translate(0, lSy); rotate(ang); fill(this.shirtCol); ellipse(d/2, 0, d + 4, 8); fill(235, 180, 140); ellipse(d, 0, 8, 8);       
                    }
                    pop();

                    push();
                    if (this.meleePhase === 4) {
                        translate(0, rSy); rotate(-tTwist - radians(20) * pp); fill(this.shirtCol); ellipse(7 * pp, 0, 14 * pp + 2, 8); translate(14 * pp, 0); rotate(radians(-90) * pp); ellipse(6 * pp, 0, 12 * pp + 2, 8); fill(235, 180, 140); ellipse(12 * pp, 0, 8, 8);
                    } else {
                        let rFx = 0, rFy = rSy; if (this.meleePhase === 2) { rFx = 24 * pp; rFy = rSy - (4 * pp); }
                        let dx = rFx - 0, dy = rFy - rSy; let d = sqrt(dx*dx + dy*dy); let ang = atan2(dy, dx);
                        translate(0, rSy); rotate(ang); fill(this.shirtCol); ellipse(d/2, 0, d + 4, 8); fill(235, 180, 140); ellipse(d, 0, 8, 8);
                    }
                    pop();
                }
            }
        }
        else if (this.reloadTimer > 0) {
            let rP = 1 - (this.reloadTimer / 90);
            if (this.isPlayer && this.currentWeapon === WEAPONS.DUAL_SMG) { fill(this.shirtCol); ellipse(15, -11, 25, 8); fill(235, 180, 140); ellipse(25, -11, 8, 8); fill(40); rect(16, -15, 24, 8, 2); rect(20, -23, 6, 12); } 
            else { let clipX = 2 + sin(rP * PI) * 10, clipY = 10; fill(this.shirtCol); ellipse(0, clipY - 3, 16, 8); fill(235, 180, 140); ellipse(clipX, clipY, 8, 8); }
        } 
        else if (this.isArmed || !this.isPlayer) { 
            let shoulderX = lerp(0, -5, this.armDrag), shoulderY = lerp(lAY, lAY + 3, this.armDrag);
            let isAimingCannon = this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked && ((typeof cannonInputHeld !== 'undefined' && cannonInputHeld) || this.cannonCharge > 0 || this.cannonFireDelay > 35);
            let isThrowing = this.isPlayer && (typeof isCooking !== 'undefined' && (isCooking || this.throwAnimTimer > 0));

            if (isThrowing) {
                push(); translate(shoulderX, shoulderY); 
                let armAngle = isCooking ? PI * 0.8 : -PI * 0.1;
                let elbowAngle = isCooking ? HALF_PI : 0;
                rotate(armAngle);
                fill(this.shirtCol); ellipse(6, 0, 14, 8); 
                translate(10, 0); rotate(elbowAngle); fill(this.shirtCol); ellipse(4, 0, 12, 8); 
                if (this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) fill(180, 180, 190); else fill(235, 180, 140);
                ellipse(10, 0, 8, 8); 
                if (isCooking) { 
                    if (typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) { 
                        fill(150, 200, 255, 200); stroke(200); strokeWeight(1); beginShape(); vertex(9, 4); vertex(15, 4); vertex(13, -2); vertex(11, -2); endShape(CLOSE); fill(200); rect(11, -4, 2, 2); noStroke(); 
                    } else { fill(40, 120, 40); ellipse(12, 0, 8, 10); }
                } 
                pop();
            } else if (isAimingCannon) { 
                push(); translate(shoulderX, shoulderY); rotate(-0.15); fill(240); ellipse(16, 0, 24, 10); fill(180, 180, 190); ellipse(26, 0, 9, 9); 
                if (this.cannonCharge > 0 || (typeof cannonInputHeld !== 'undefined' && cannonInputHeld)) {
                    let cSz = 8 + min(20, this.cannonCharge / 10); 
                    fill(255, 255, 0, 150 + sin(frameCount)*100); ellipse(32, 0, cSz, cSz); fill(255); ellipse(32, 0, cSz/2, cSz/2); 
                    if (frameCount % 3 === 0) {
                        let sX = this.x + cos(this.aimAngle)*32 - sin(this.aimAngle)*-19;
                        let sY = this.y + sin(this.aimAngle)*32 + cos(this.aimAngle)*-19;
                        emit(sX, sY, 1, color(255, 255, 0), "SPARK");
                    }
                }
                pop();
            } else if (this.currentWeapon === WEAPONS.ASSAULT_RIFLE || this.currentWeapon === WEAPONS.SHOTGUN || this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { 
                push(); translate(shoulderX, shoulderY); rotate(0.52); fill(this.shirtCol); ellipse(16, 0, 32, 8); 
                if (this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) fill(180, 180, 190); else fill(235, 180, 140);
                ellipse(32, 0, 8, 8); pop();
            } else if (this.currentWeapon === WEAPONS.DUAL_SMG) {
                fill(this.shirtCol); ellipse(15, shoulderY, 25, 8); 
                if (this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) fill(180, 180, 190); else fill(235, 180, 140);
                ellipse(25, shoulderY, 8, 8); 
            } else { 
                let handX = lerp(8, -12, this.armDrag); fill(this.shirtCol); ellipse(shoulderX, shoulderY, 16, 8); 
                if (this.isPlayer && typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) fill(180, 180, 190); else fill(235, 180, 140);
                ellipse(handX, shoulderY, 8, 8); 
            }
        }
                
                // --- WEAPON & RIGHT ARM RENDERING LOGIC ---
        // THE FIX 3: ONLY run this if Armed or an Enemy. Removes the duplicate unarmed drawings.
               // --- WEAPON & RIGHT ARM RENDERING LOGIC ---
        // THE FIX 3: ONLY run this if Armed or an Enemy. Removes the duplicate unarmed drawings.
        if (this.meleeTimer <= 0 && (this.isArmed || !this.isPlayer)) {
            let skinC = (typeof chemistSuitUnlocked === 'undefined' && chemistSuitUnlocked) ? color(180, 180, 190) : color(235, 180, 140);
            
            // 1. DRAW RIGHT ARM & HAND FIRST
            // This ensures the arm is painted under the gun
            let rArmY = rAY, rHandX = 15, rSleeveX = 5;
            if (this.currentWeapon === WEAPONS.SMG || this.currentWeapon === WEAPONS.DUAL_SMG) { rHandX = 25; rSleeveX = 15; } 
            else if (this.currentWeapon === WEAPONS.ASSAULT_RIFLE || this.currentWeapon === WEAPONS.SHOTGUN || this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { rHandX = 8; rSleeveX = -1; }
            
            fill(this.shirtCol);
            ellipse(rSleeveX, rArmY, 25, 8); // Paints the sleeve on the canvas first
            fill(skinC);
            ellipse(rHandX, rArmY, 8, 8);    // Paints the hand on the canvas next

            // 2. DRAW WEAPONS SECOND
            // This paints the guns on top of the newly drawn hand
            if (this.eType === "MOLOTOV") { 
                fill(30, 120, 30); rect(16, 7, 8, 16, 2); fill(255, 150, 0); rect(18, 3, 4, 4); 
            } 
            else if (this.eType !== "AERIAL" && this.eType !== "AERIAL_PISTOL") { 
                let isThrowing = this.isPlayer && (typeof isCooking !== 'undefined' && (isCooking || this.throwAnimTimer > 0));

                if (this.currentWeapon === WEAPONS.SMG || this.currentWeapon === WEAPONS.DUAL_SMG) { fill(40); rect(16, 7, 24, 8, 2); rect(20, 15, 6, 12); } 
                else if (this.currentWeapon === WEAPONS.ASSAULT_RIFLE) { fill(40); rect(5, 4, 42, 4, 1); fill(139, 69, 19); rect(15, 3, 12, 6, 1); rect(0, 3, 8, 6, 1); } 
                else if (this.currentWeapon === WEAPONS.SHOTGUN) { fill(30); rect(5, 4, 40, 5, 1); fill(15); rect(20, 3, 14, 7, 1); fill(50); rect(5, 3, 12, 7, 2); } 
                else if (this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { fill(50, 70, 50); rect(5, 4, 45, 6, 2); fill(30); rect(20, 2, 10, 10, 1); } 
                else { fill(40); rect(15, 5, 16, 6, 2); } 
                
                if (this.currentWeapon === WEAPONS.DUAL_SMG && !isThrowing) {
                    fill(40); rect(16, -15, 24, 8, 2); rect(20, -23, 6, 12);
                }
            } 
            else if (this.eType === "AERIAL_PISTOL") { 
                fill(40); rect(35, 13, 16, 6, 2); 
            }
        }


    

 
 
    if (this.muzzleFlash > 0 && this.reloadTimer <= 0) { 
        push(); translate(bLX, bLY); fill(255, 200, 0, 200); noStroke(); beginShape(); vertex(0, -3); vertex(15 + random(10), -8); vertex(20 + random(15), 0); vertex(15 + random(10), 8); vertex(0, 3); endShape(CLOSE); pop(); 
        let isThrowing = this.isPlayer && (typeof isCooking !== 'undefined' && (isCooking || this.throwAnimTimer > 0));
        if (this.currentWeapon === WEAPONS.DUAL_SMG && !isThrowing) { push(); translate(bLX_L, bLY_L); fill(255, 200, 0, 200); noStroke(); beginShape(); vertex(0, -3); vertex(15 + random(10), -8); vertex(20 + random(15), 0); vertex(15 + random(10), 8); vertex(0, 3); endShape(CLOSE); pop(); }
    }
    
    let hX = 0, hY = 0;
   if (this.isArmed && (this.currentWeapon === WEAPONS.ASSAULT_RIFLE || this.currentWeapon === WEAPONS.SHOTGUN || this.currentWeapon === WEAPONS.ROCKET_LAUNCHER) && this.reloadTimer <= 0 && this.meleeTimer <= 0 && !this.dead) { hX = 3; hY = 4; }

    
        // --- FEMALE PISTOL HAIR / NORMAL HEAD ---
    if (this.isPlayer && typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked) {
        fill(235, 180, 140); ellipse(hX, hY, 11, 11);
        push(); translate(hX, hY); rotate(-HALF_PI); fill(40, 80, 40); arc(0, -1, 14, 14, PI, TWO_PI); pop(); 
        push(); translate(hX, hY); rotate(radians(33)); fill(80, 50, 20); rect(4, -1, 8, 3); fill(255, 100, 0); ellipse(12, 0.5, 2, 2); pop(); 
    } else if (this.eType === "MILITARY_NEUTRAL" || this.eType === "NM0_GREY_FATIGUE" || (this.isMilitary && typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked)) {
        fill(235, 180, 140); ellipse(hX, hY, 11, 11);
        push(); translate(hX, hY); rotate(-HALF_PI); 
        
        if (this.isMilitary) fill(40, 80, 40); // Player's green helmet
        else if (this.eType === "NM0_GREY_FATIGUE") fill(170, 175, 180); // Grey helmet
        else fill(190, 170, 130); // Neutral tan helmet
        
        stroke(0); strokeWeight(1.5); 
        arc(0, -1, 14, 14, PI, TWO_PI, CHORD); 
        pop(); 
    
 
    } else if (this.isPlayer && ninjaSuitUnlocked) {


        fill(235, 180, 140); ellipse(hX, hY, 11, 11); push(); translate(hX, hY); fill(15); ellipse(0, 0, 12, 12); fill(240); arc(0, 0, 12, 12, -HALF_PI, HALF_PI); fill(235, 180, 140); rect(1, -3, 3, 6, 1); fill(0); ellipse(2, -.5, 1.5, 1.5); ellipse(2, 1.5, 1.5, 1.5); pop();
        } else if (this.eType === "FEMALE_PISTOL") {
        fill(235, 180, 140); ellipse(hX, hY, 11, 11); 
        fill(15); arc(hX, hY, 12, 12, HALF_PI, PI + HALF_PI);
        push(); translate(hX - 5, hY); rotate(radians(this.isMoving ? sin(frameCount * 0.3) * 15 : 0)); ellipse(-6, 0, 12, 6); pop();
    } else if (this.eType === "FARMER_MALE") {
        fill(235, 180, 140); ellipse(hX, hY, 11, 11); 
        push(); translate(hX, hY);
        fill(210, 180, 70); ellipse(0, 0, 24, 24); // Straw hat brim
        fill(190, 160, 50); ellipse(0, 0, 14, 14); // Straw hat crown
        pop();
    } else if (this.eType === "FARMER_FEMALE") {
        fill(235, 180, 140); ellipse(hX, hY, 11, 11); 
        fill(150, 80, 40); // Brown hair
        arc(hX, hY, 12, 12, HALF_PI, PI + HALF_PI);
        push(); translate(hX - 5, hY); rotate(radians(this.isMoving ? sin(frameCount * 0.3) * 15 : 0)); ellipse(-6, 0, 12, 6); pop();
    } else {
        fill(235, 180, 140); ellipse(hX, hY, 11, 11); 
    }


    if ((this.eType === "ARMORED" && this.hp > 300) || (this.eType === "ARMORED_STANDARD" && this.hp > 50)) { fill(20); push(); translate(hX, hY); rotate(HALF_PI); arc(0, 0, 15, 15, 0, PI, CHORD); pop(); } 
    noStroke(); for (let d of this.decals) { if (d.isHead) { if (d.col) fill(d.col[0], d.col[1], d.col[2], d.col[3]); else fill(90, 0, 0, 220); ellipse(d.x + hX, d.y + hY, d.sz, d.sz); } }
    
    if (inTownCutscene && this.isFriendly && townPhase === 1) {
        fill(255, 255, 0); textSize(32); textAlign(CENTER, BOTTOM); textFont('sans-serif');
        text("?", 0, -this.bodyH - 10);
    }

    pop();
    pop(); 
  }
}
}



function addScore(basePoints, x, y, textPrefix = "") {
    consecutiveKills++; let currentMultiplier = min(99, consecutiveKills); let earned = basePoints * currentMultiplier; score += earned;
    floatingScores.push({ y: 100, text: `${textPrefix}${earned}`, life: 90, maxLife: 90 }); comboTimer = 100; 
}

function updateAndDrawFloatingScores() {
    let startX = width - 20, startY = 100; 
    for (let i = floatingScores.length - 1; i >= 0; i--) {
        let fs = floatingScores[i]; fs.life--; let stackIndex = floatingScores.length - 1 - i; let targetY = startY + (stackIndex * 15); fs.y = lerp(fs.y, targetY, 0.3); let alpha = map(fs.life, 0, fs.maxLife, 0, 255);
        push(); fill(255, 200, 0, alpha); stroke(0, alpha); strokeWeight(2); textSize(12); textAlign(RIGHT, TOP); textFont('sans-serif'); text(fs.text, startX, fs.y); pop();
        if (fs.life <= 0) floatingScores.splice(i, 1);
    }
}


function processKill(x, y, isHeadshot = false, eType = "NORMAL", isFriendly = false) {
    
    // NEW: Find the exact enemy that just died using the coordinates we already have!
    let deadGuy = enemiesList.find(e => e.x === x && e.y === y && e.dead);
    let isAmbushKill = deadGuy ? deadGuy.isAmbush : false;

    // --- STRICT FARM BUG AMBUSH KILL COUNTER ---
    if (typeof farmAmbushActive !== 'undefined' && farmAmbushActive && eType === "BUG") {
        window.farmAmbushKills--;
        if (window.farmAmbushKills > 0) setTimeout(spawnFarmBug, random(100, 400));
        if (x !== undefined && y !== undefined) addScore(2, x, y, "SQUASH+");
        if (window.farmAmbushKills <= 0 && !isWin && !killcamMode) { 
            killcamMode = true; killcamTarget = { x: x !== undefined ? x : player.x, y: y !== undefined ? y : player.y }; 
            killcamTimer = 150; farmAmbushActive = false; window.farmAmbushCleared = true; 
        }
        return; 
    }

  
    if (eType === "BUG" || eType === "DAD") {
        if (eType === "BUG" && x !== undefined && y !== undefined) {
            score += 1; floatingScores.push({ y: 100, text: "BUG KILL +1", life: 90, maxLife: 90 });
        }
        return; 
    }
// --- NEW: Neutral Military death logic ---
    if (eType === "MILITARY_NEUTRAL") {
        // Do NOT trigger ally death penalty
        // Do NOT add to globalPopulation
        if (x !== undefined && y !== undefined) addScore(5, x, y, "OUTPOST+");
        return;
    }

    // --- ALLY DEATH LOGIC ---
 
    if (isFriendly) {
        globalPopulation = Math.max(0, globalPopulation - 1); 
        if (typeof popTotal !== 'undefined') popTotal = Math.max(0, popTotal - 1);
        if (typeof popMilitary !== 'undefined' && popMilitary > 0) {
            popMilitary--; 
            if (window.militaryToBring && window.militaryToBring > 0) window.militaryToBring--;
            if (townsData[1]) { townsData[1].popMilitary = Math.max(0, townsData[1].popMilitary - 1); townsData[1].popTotal = Math.max(0, townsData[1].popTotal - 1); }
        }
        if (x !== undefined && y !== undefined) floatingScores.push({ y: 100, text: "ALLY LOST!", life: 90, maxLife: 90 });
        return; 
    }

    // --- STRICT NM-0 AMBUSH KILL COUNTER ---
    if (nm0AmbushActive && isAmbushKill) { // <--- ONLY trigger if it's an actual ambush enemy
        nm0AmbushKills--;
        
        if (window.ambushSpawnsRemaining > 0) setTimeout(spawnAmbushReinforcement, random(200, 800));
        
        if (x !== undefined && y !== undefined) {
            if (isHeadshot) addScore(10, x, y, "HEADSHOT+"); else addScore(5, x, y, "KILL+");
            if (random(100) > 65) {
                let r = random(100), dropType = null;
                if (r < 15) dropType = "SMG"; else if (r < 25) dropType = "SHOTGUN"; else if (r < 30) dropType = "AR"; 
                if (dropType) { let sa = random(TWO_PI), dd = random(70, 90); weaponDrops.push({ x: x + cos(sa) * dd, y: y + sin(sa) * dd, type: dropType }); }
            }
        }
        
        if (nm0AmbushKills <= 0 && !isWin && !killcamMode) { 
            killcamMode = true; killcamTarget = { x: x !== undefined ? x : player.x, y: y !== undefined ? y : player.y }; 
            killcamTimer = 150; window.nm0AmbushCleared = true; 
        }
        return; // Exits so the ambush kill DOES NOT count toward the Stick City population
    }
    
    // --- STANDARD ARCADE / STORY KILL COUNTER ---
    totalKills++; // This now properly drains the Stick City bar!

    
    if (x !== undefined && y !== undefined) {
        if (isHeadshot) addScore(10, x, y, "HEADSHOT+"); else addScore(5, x, y, "KILL+");
        let r = random(100), dropType = null;
        if (r < 15) dropType = "SMG"; else if (r < 25) dropType = "SHOTGUN"; else if (r < 30) dropType = "AR"; 
        if (dropType) { let scatterAngle = random(TWO_PI), dropDist = random(70, 90); weaponDrops.push({ x: x + cos(scatterAngle) * dropDist, y: y + sin(scatterAngle) * dropDist, type: dropType }); }
    }
    
    if (currentLevel === 1 && isStoryMode && totalKills === 6 && !darchonCallCompleted) {
        inDarchonCall = true; callPhase = 1; darchonCallCompleted = true; sfx.charge();
    }
    
    // EXEMPT LEVEL 8 SO THE LEVEL DOESN'T FREEZE WHEN YOU HIT 20 KILLS
    if (!isStoryMode) {
    if (totalKills >= MAX_KILLS && !isWin && !killcamMode && currentLevel !== 8) {
        killcamMode = true;
        killcamTarget = {
            x: x !== undefined ? x : player.x,
            y: y !== undefined ? y : player.y
        };
        killcamTimer = 150;
    }
}
}
    




function updateEntities() {
  if (comboTimer > 0) { comboTimer--; if (comboTimer <= 0) consecutiveKills = 0; }

  if (doTick) {
      let actors = [player].concat(enemiesList.filter(e => e && e.hp > 0 && !e.dead && e.eType !== "AERIAL" && e.eType !== "AERIAL_PISTOL" && e.eType !== "SAUCER" && e.eType !== "SAUCER_RED"));

      


      
      spatialGrid = {};
      for (let a of actors) {
          let key = getSpatialKey(a.x, a.y);
          if (!spatialGrid[key]) spatialGrid[key] = [];
          spatialGrid[key].push(a);
      }

      for (let i = 0; i < actors.length; i++) {
          let A = actors[i];
          if (player && player.dashTimer > 0 && A.isPlayer) continue;
          if (A.ignoreBldgTimer > 0) continue;

          let cx = Math.floor(A.x / SPATIAL_CELL_SIZE);
          let cy = Math.floor(A.y / SPATIAL_CELL_SIZE);

          for (let ox = -1; ox <= 1; ox++) {
              for (let oy = -1; oy <= 1; oy++) {
                  let neighborKey = (cx + ox) + "," + (cy + oy);
                  let neighbors = spatialGrid[neighborKey];
                  
                  if (neighbors) {
                      for (let B of neighbors) {
                          if (A === B || actors.indexOf(A) >= actors.indexOf(B)) continue;
                          if (player && player.dashTimer > 0 && B.isPlayer) continue;
                          if (B.ignoreBldgTimer > 0) continue;

                          let radA = A.isPlayer ? 18 : (A.eType === "ARMORED" || A.eType === "ALIEN_GATOR" || A.eType === "SNAIL_HYBRID" ? 40 : (A.eType === "BUG" ? 12 : 20));
                          let radB = B.isPlayer ? 18 : (B.eType === "ARMORED" || B.eType === "ALIEN_GATOR" || B.eType === "SNAIL_HYBRID" ? 40 : (B.eType === "BUG" ? 12 : 20));
                          let minDist = radA + radB;
                          
                          let d = dist(A.x, A.y, B.x, B.y);
                          if (d < minDist && d > 0) {
                              let pA = atan2(A.y - B.y, A.x - B.x);
                              let moveA = !(A.isPlayer && B.eType === "BUG");
                              let moveB = !(B.isPlayer && A.eType === "BUG");
                              
                              let overlapA = (!moveA) ? 0 : (moveB ? (minDist - d) * 0.55 : (minDist - d));
                              let overlapB = (!moveB) ? 0 : (moveA ? (minDist - d) * 0.55 : (minDist - d));
                              
                              if (moveA) {
                                  let nxA = A.x + cos(pA) * overlapA, nyA = A.y + sin(pA) * overlapA;
                                  if (!A.checkCol(nxA, A.y)) A.x = nxA;
                                  if (!A.checkCol(A.x, nyA)) A.y = nyA;
                              }
                              if (moveB) {
                                  let nxB = B.x - cos(pA) * overlapB, nyB = B.y - sin(pA) * overlapB;
                                  if (!B.checkCol(nxB, B.y)) B.x = nxB;
                                  if (!B.checkCol(B.x, nyB)) B.y = nyB;
                              }
                          }
                      }
                  }
              }
          }
      }

      let aerials = enemiesList.filter(e => e && e.hp > 0 && !e.dead && (e.eType === "AERIAL" || e.eType === "AERIAL_PISTOL" || e.eType === "SAUCER" || e.eType === "SAUCER_RED"));
      for (let i = 0; i < aerials.length; i++) {
          for (let j = i + 1; j < aerials.length; j++) {
              let A = aerials[i], B = aerials[j];
              let radA = (A.eType === "SAUCER" || A.eType === "SAUCER_RED") ? 55 : 30;
              let radB = (B.eType === "SAUCER" || B.eType === "SAUCER_RED") ? 55 : 30;
              let minDist = radA + radB;
              
              let d = dist(A.x, A.y, B.x, B.y);
              if (d < minDist && d > 0) {
                  let pA = atan2(A.y - B.y, A.x - B.x);
                  let pushMag = (minDist - d) * 0.08; 
                  
                  A.x += cos(pA) * pushMag; A.y += sin(pA) * pushMag;
                  B.x -= cos(pA) * pushMag; B.y -= sin(pA) * pushMag;
              }
          }
      }
  }

    for (let i = enemiesList.length - 1; i >= 0; i--) { 
      let e = enemiesList[i]; 
      
      if (!isDead && !isWin && doTick) {
          let cullDist = ((nm0AmbushActive || currentLevel === 4) && !e.isFriendly) ? 6000 : 1450;
          if (dist(player.x, player.y, e.x, e.y) < cullDist) {
              e.updateEnemy(); 
          }
      }

      
      if (inView(e.x, e.y, 150)) e.show(); 
      if (e.hp <= 0 && !e.dead) { e.dead = true; processKill(e.x, e.y, false, e.eType, e.isFriendly); enemiesList.splice(i, 1); if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100); } 
  }
}
  // --- LEVEL 1: NM-0 AMBUSH WIN CONDITION ---
  if (currentLevel === 1 && nm0AmbushActive) {
      // 1. Count how many hostiles are currently alive on screen
      let activeHostiles = 0;
      for (let e of enemiesList) {
          if (!e.isFriendly && e.hp > 0) activeHostiles++;
      }
      
      // 2. Check if the screen is clear AND the spawner is out of reserves
      if (activeHostiles === 0 && (window.ambushSpawnsRemaining === undefined || window.ambushSpawnsRemaining <= 0)) {
          
          nm0AmbushActive = false;               // Turn off the ambush logic
          window.nm0AmbushClearedStatus = true;  // Flag the level as officially cleared
          objectiveTimer = 0;                    // Remove the "Defeat the Ambush" text
          
          // Optional: Add a victory message to the screen
          if (typeof streakMsgText !== 'undefined') {
              streakMsgText = "AMBUSH CLEARED!";
              streakMsgTimer = 180;
          }
      }
  }


   // --- LEVEL 1: NM-0 AMBUSH WIN CONDITION ---
  if (currentLevel === 1 && nm0AmbushActive) {
      // 1. Count how many hostiles are currently alive on screen
      let activeHostiles = 0;
      for (let e of enemiesList) {
          if (!e.isFriendly && e.hp > 0) activeHostiles++;
      }
      
      // 2. Check if the screen is clear AND the spawner is out of reserves
      if (activeHostiles === 0 && (window.ambushSpawnsRemaining === undefined || window.ambushSpawnsRemaining <= 0)) {
          
          nm0AmbushActive = false;               // Turn off the ambush logic
          window.nm0AmbushClearedStatus = true;  // Flag the level as officially cleared
          objectiveTimer = 0;                    // Remove the "Defeat the Ambush" text
          
          // Optional: Add a victory message to the screen
          if (typeof streakMsgText !== 'undefined') {
              streakMsgText = "AMBUSH CLEARED!";
              streakMsgTimer = 180;
          }
      }
  }
 

function updateBullets() {
  const CULL_PAD = 400; 

  // OPTIMIZATION 1: Generate target lists ONCE per frame, not once per bullet!
  // This completely eliminates the Garbage Collection panic.
  const playerTgs = [];
  const enemyTgs = [player];
  for (let i = 0; i < enemiesList.length; i++) {
      let e = enemiesList[i];
      if (!e.isFriendly || e.isNeutral) playerTgs.push(e);
      if (e.isFriendly && !e.isNeutral) enemyTgs.push(e);
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i]; 
    if (!b.active) continue;
    
    if (doTick) b.update(); 
    
    if (!inView(b.x, b.y, CULL_PAD)) {
        b.active = false;
        b.l = 0;
        continue;
    }

    if (b.active && inView(b.x, b.y, 50)) b.show(); 
    
    if (doTick && b.active) {
        let hB = false;
        for (let j = 0; j < barrels.length; j++) {
            // Cheap distance pre-check for barrels
            if (Math.abs(b.x - barrels[j].x) > 30 || Math.abs(b.y - barrels[j].y) > 30) continue; 

            if (b.isP && b.tH !== "HEAD" && dist(b.x, b.y, barrels[j].x, barrels[j].y) < 15) { 
                hB = true; totalShotsHit++; 
                if (b.w === WEAPONS.SHOTGUN) barrels[j].hp -= 25; 
                else if (b.isRedLaser || b.isPinkLaser) barrels[j].hp -= 30; 
                else if (b.isAlienLaser) barrels[j].hp -= 25; 
                else barrels[j].hp -= b.w.bodyDmg; 
                
                b.l = 0; emit(b.x, b.y, 3, color(255, 100, 0), "FLASH"); break; 
            }
        }
        if (hB) { if (b.w === WEAPONS.ROCKET_LAUNCHER) { triggerRocketExplosion(b.x, b.y, b.isP); } b.active = false; continue; }

        // Use the pre-computed lists
        let tgs = b.isP ? playerTgs : enemyTgs;

        for (let t of tgs) {
          if (t && t.hp > 0 && !t.dead) {
            
            if (t.eType === "COW" && b.shooter && !b.shooter.isPlayer) continue;
            if (b.tH === "HEAD" && (t.eType === "BUG" || t.eType === "SNAIL")) continue;
            
            // OPTIMIZATION 2: Broad-phase AABB Culling. 
            // If the bullet is more than 60 pixels away on X or Y, completely skip the heavy math!
            if (Math.abs(b.x - t.x) > 60 || Math.abs(b.y - t.y) > 60) continue;

            let isLg = (t.eType === "ARMORED" || t.eType === "ALIEN_GATOR" || t.eType === "SAUCER" || t.eType === "SAUCER_RED" || t.eType === "SNAIL_HYBRID");
            let hR = b.tH === "HEAD" ? (isLg ? (t.eType === "SNAIL_HYBRID" ? 35 : 15) : 6) : (isLg ? 40 : ((t.eType === "BUG" || t.eType === "SNAIL") ? (t.eType === "SNAIL" ? 15 : 10) : 12));
            
            let hit = false; 
            for (let j = 0; j <= 3; j++) { if (dist(b.x - b.vx * (j / 3), b.y - b.vy * (j / 3), t.x, t.y) < hR) { hit = true; break; } }
            
            if (hit) {
                if (b.isP && b.active && !b.isTaser) totalShotsHit++; 
                
                if (b.isTaser) {
                    if (!b.tetheredTarget && !b.retracting) {
                        let isUnarmored = (t.eType === "NORMAL" || t.eType === "FEMALE_PISTOL" || t.eType === "SIA" || t.eType === "MOLOTOV");
                        
                        if (isUnarmored && t.hp > 0 && t.state !== "STUNNED") {
                            t.stunTimer = 15000; t.skeletonTimer = 66; t.state = "STUNNED";
                            sfx.charge(); emit(t.x, t.y, 15, color(255, 255, 0), "SPARK");
                            t.isMoving = false; t.aimAngle = random(TWO_PI); 
                            b.tetheredTarget = t; b.tetherTimer = 66;
                        } else {
                            sfx.hitArmor(); emit(b.x, b.y, 5, color(255, 255, 0), "SPARK"); b.retracting = true;
                        }
                    }
                    continue; 
                }

                if (b.w === WEAPONS.ROCKET_LAUNCHER) { b.l = 0; triggerRocketExplosion(b.x, b.y, b.isP, t); continue; }
                
                let dmg = b.isRedLaser ? 30 : (b.isPinkLaser ? 30 : (b.isAlienLaser ? 25 : (b.w === WEAPONS.SHOTGUN ? (b.tH === "HEAD" ? 50 : 25) : (b.tH === "HEAD" ? b.w.headDmg : b.w.bodyDmg)))); 
                
                if (t.eType === "SNAIL_HYBRID" && b.tH === "HEAD") {
                    t.hybridHeadHP -= dmg;
                    if (t.hybridHeadHP <= 50 && t.leftEye > 0) { t.leftEye = 0; t.eyeBleedL = 600; emit(t.x, t.y, 50, color(0, 100, 0), "GORE"); sfx.deathGrunt(); }
                    if (t.hybridHeadHP <= 0 && t.rightEye > 0) { t.rightEye = 0; t.eyeBleedR = 600; emit(t.x, t.y, 50, color(0, 100, 0), "GORE"); sfx.deathGrunt(); }
                }

                if (t.eType === "ARMORED" && b.tH === "HEAD") dmg *= 2; 
                let wA = (t.eType === "ARMORED" && t.hp > 300) || (t.eType === "ARMORED_STANDARD" && t.hp > 50) || t.eType === "SAUCER" || t.eType === "SAUCER_RED" || (t.eType === "SNAIL_HYBRID" && t.hp > 150 && b.tH !== "HEAD"); 

                if (t.lastHitFrame !== frameCount) { t.lastHitFrame = frameCount; t.frameDamage = 0; } 
                t.frameDamage += dmg; 
                let dRes = t.takeDamage(dmg); 
                b.l = 0; 
                
                if (b.shooter && b.shooter.isFriendly && !b.shooter.isPlayer && !t.isFriendly && nm0AmbushActive) {
                    t.aggroTarget = b.shooter;
                    t.aggroTimer = 300; 
                }
                
                if (b.isP) {
                    let kbForce = 0;
                    if (b.w === WEAPONS.SHOTGUN) kbForce = 6; 
                    else if (b.w === WEAPONS.ASSAULT_RIFLE) kbForce = 4.5;
                    else if (b.w === WEAPONS.PISTOL) kbForce = 3;
                    else kbForce = 1.5; 
                    
                    if (t.eType === "ARMORED" || t.eType === "ARMORED_STANDARD" || t.eType === "ALIEN_GATOR" || t.eType === "SNAIL_HYBRID") {
                        kbForce *= 0.15; 
                    } else if (t.eType === "SAUCER" || t.eType === "SAUCER_RED") {
                        kbForce = 0; 
                    }
                    if (kbForce > 0) t.attemptMove(cos(b.a) * kbForce, sin(b.a) * kbForce);
                }
                
                let bCol = (t.eType === "BUG" || t.eType === "SNAIL" || t.eType === "SNAIL_HYBRID") ? color(200, 230, 40) : color(90, 0, 0); 
                if (t.eType === "SNAIL_HYBRID" && b.tH === "HEAD") bCol = color(0, 100, 0); 
                
                let dx = b.x - t.x, dy = b.y - t.y; let rotX = dx * cos(-t.aimAngle) - dy * sin(-t.aimAngle); let rotY = dx * sin(-t.aimAngle) + dy * cos(-t.aimAngle);
                let bobOffset = t.isMoving ? abs(sin(t.walkCycle)) * 2 : 0; if (t.eType === "AERIAL" || t.eType === "AERIAL_PISTOL") bobOffset += sin(frameCount * 0.1) * 15;
                let lX = rotX - bobOffset, lY = rotY; let rw = (b.tH === "HEAD" ? 5.5 : t.bodyW / 2) * 0.85; let rh = (b.tH === "HEAD" ? 5.5 : t.bodyH / 2) * 0.85;
                let distSq = (lX * lX) / (rw * rw) + (lY * lY) / (rh * rh); if (distSq > 1) { let scale = 1 / Math.sqrt(distSq); lX *= scale; lY *= scale; }
                let dCol = b.isRedLaser ? [255, 50, 50, 220] : (b.isPinkLaser ? [255, 105, 180, 220] : (b.isAlienLaser ? [200, 20, 100, 220] : ((t.eType === "BUG" || t.eType === "SNAIL") ? [200, 230, 40, 220] : [90, 0, 0, 220])));
                if (wA) dCol = [20, 20, 20, 220]; 
                t.decals.push({ x: lX, y: lY, sz: random(4, 7), col: dCol, isHead: b.tH === "HEAD" });
                
                if (wA) { sfx.hitArmor(); emit(b.x, b.y, 10, color(255, 150, 0), "SPARK"); emit(b.x, b.y, 5, color(100), "CHIP"); } 
                else { 
                    if (t.isPlayer && dRes.blocked) { sfx.hitArmor(); emit(b.x, b.y, dRes.broken ? 20 : 8, color(0, 200, 255), "SPARK", b.vx, b.vy); } 
                    else { if (b.tH === "HEAD" && t.eType !== "BUG" && t.eType !== "SNAIL" && t.eType !== "SNAIL_HYBRID") sfx.hitHead(); else sfx.hitBody(); emit(b.x, b.y, 8, bCol, "BLOOD", b.vx, b.vy); }
                } 
                if (t.isPlayer) screenShake = 5; 
                
                if (t.hp <= 0) { 
                    t.dead = true; sfx.deathGrunt(); let dT = 0, hA = (b.a - t.aimAngle + TWO_PI) % TWO_PI; 
                    if (t.eType === "SAUCER" || t.eType === "SAUCER_RED") { triggerExplosion(t.x, t.y, 160); } 
                    else if (t.eType === "AERIAL" || t.eType === "AERIAL_PISTOL") {
                        if (b.tH === "HEAD") { dT = 12; } else { let choices = [11, 5, 10]; dT = choices[floor(random(3))]; }
                        corpses.push(new Corpse(t.x, t.y, t.moveAngle, t.aimAngle, t.shirtCol, t.pantsCol, dT, hA, t.decals, t.currentWeapon, b.a, t.eType, t.bodyW, t.bodyH));
                        if (dT === 11) { spawnSplatter(t.x, t.y, "BLOOD", color(90, 0, 0)); } 
                        else if (dT === 5 || dT === 10) { emit(t.x, t.y, 40, color(255, 100, 0), "EXPLOSION"); sfx.explosion(); spawnSplatter(t.x, t.y, "BLOOD", color(90, 0, 0)); spawnSplatter(t.x, t.y, "SCORCH"); if (dT === 10) { emit(b.x, b.y, 30, color(220, 200, 200), "BONE", b.vx, b.vy); emit(t.x, t.y, 120, color(90, 0, 0), "GORE"); } }
                    } else { 
                        if (b.w === WEAPONS.ASSAULT_RIFLE && b.tH === "HEAD") { 
                            let choices = [6, 8, 9]; dT = choices[headshotCounter % 3]; headshotCounter++;
                            if (dT === 6) { emit(b.x, b.y, 10, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 40, bCol, "GORE"); emit(b.x, b.y, 40, bCol, "BLOOD", b.vx, b.vy); } 
                            else if (dT === 8) { emit(b.x, b.y, 15, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 50, bCol, "GORE"); } 
                            else { emit(b.x, b.y, 25, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 60, bCol, "GORE"); emit(b.x, b.y, 50, bCol, "BLOOD", b.vx, b.vy); }
                        } else if (b.w === WEAPONS.SHOTGUN && b.tH === "HEAD") { 
                            let choices = [4, 8, 9]; dT = choices[headshotCounter % 3]; headshotCounter++;
                            if (dT === 4) { emit(b.x, b.y, 25, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 60, bCol, "GORE", b.vx*0.5, b.vy*0.5); emit(b.x, b.y, 60, bCol, "BLOOD", b.vx, b.vy); } 
                            else if (dT === 8) { emit(b.x, b.y, 30, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 80, bCol, "GORE"); } 
                            else { emit(b.x, b.y, 30, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 100, bCol, "GORE"); emit(b.x, b.y, 80, bCol, "BLOOD", b.vx, b.vy); }
                        } else if (b.w === WEAPONS.SHOTGUN && dist(b.startX, b.startY, t.x, t.y) <= 160) { 
                            let choices = [2, 7, 10]; dT = choices[bodyOverkillCounter % 3]; bodyOverkillCounter++;
                            if (dT === 2) { emit(t.x, t.y, 60, bCol, "GORE"); emit(t.x, t.y, 15, color(220, 200, 200), "BONE", b.vx, b.vy); } 
                            else if (dT === 7) { emit(t.x, t.y, 120, bCol, "GORE"); emit(t.x, t.y, 40, color(220, 200, 200), "BONE", b.vx, b.vy); emit(t.x, t.y, 80, bCol, "BLOOD", b.vx * 1.5, b.vy * 1.5); } 
                            else if (dT === 10) { emit(b.x, b.y, 30, color(220, 200, 200), "BONE", b.vx, b.vy); emit(t.x, t.y, 120, bCol, "GORE"); }
                        } else if (b.tH === "HEAD") { 
                            let choices = [1, 8, 9]; dT = choices[headshotCounter % 3]; headshotCounter++;
                            if (dT === 1) { emit(b.x, b.y, 15, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 30, bCol, "GORE"); } 
                            else if (dT === 8) { emit(b.x, b.y, 20, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 45, bCol, "GORE"); } 
                            else { emit(b.x, b.y, 25, color(220, 200, 200), "BONE", b.vx, b.vy); emit(b.x, b.y, 60, bCol, "GORE"); emit(b.x, b.y, 50, bCol, "BLOOD", b.vx, b.vy); }
                        } else if (b.w === WEAPONS.DUAL_SMG && b.tH === "BODY" && dist(b.startX, b.startY, t.x, t.y) <= 80) {
                            dT = 10; emit(b.x, b.y, 30, color(220, 200, 200), "BONE", b.vx, b.vy); emit(t.x, t.y, 120, bCol, "GORE");
                        } else { dT = 0; emit(t.x, t.y, 40, bCol, "GORE"); } 
                        
                        corpses.push(new Corpse(t.x, t.y, t.moveAngle, t.aimAngle, t.shirtCol, t.pantsCol, dT, hA, t.decals, t.currentWeapon, b.a, t.eType, t.bodyW, t.bodyH)); 
                        spawnSplatter(t.x, t.y, "BLOOD", bCol); 
                    } 
                    if (t.isPlayer) { playerRespawnTimer = 90; } else { 
                        let isHeadshot = (b.tH === "HEAD" && t.eType !== "BUG" && t.eType !== "SNAIL" && t.eType !== "SNAIL_HYBRID");
                        processKill(t.x, t.y, isHeadshot, t.eType, t.isFriendly); 
                        let eI = enemiesList.indexOf(t); if (eI > -1) enemiesList.splice(eI, 1); 
                        if (totalKills < MAX_KILLS) setTimeout(spawnSingleEnemy, 100); 
                    } 
                } 
                break;
            }
          }
        }
        
        if (b.l <= 0) b.active = false;

        if (b.active && !b.tetheredTarget && !b.retracting) {
            let hitSomething = false;
            for (let bldg of activeBuildings) { 
                if (currentLevel === 4 && bldg.isPalm) continue; 
                if (currentLevel === 6 && (bldg.isAlienPlant || bldg.isEnergyPole)) continue; 
                if ((currentLevel === 1 || currentLevel === 2) && bldg.isGrassLot) continue; 
                
                // Cheap pre-check for buildings before bounding box check
                if (Math.abs(b.x - bldg.x) > bldg.w || Math.abs(b.y - bldg.y) > bldg.h) continue;

                if (b.x > bldg.x - bldg.w / 2 && b.x < bldg.x + bldg.w / 2 && b.y > bldg.y - bldg.h / 2 && b.y < bldg.y + bldg.h / 2) { 
                    b.l = 0; b.active = false; hitSomething = true;
                    if (bldg.isPinkPlanet && b.isP) {
                        bldg.flashTimer = 4; if (bldg.hp === undefined) bldg.hp = 750; 
                        let dmg = b.w === WEAPONS.SHOTGUN ? 25 : (b.w === WEAPONS.ROCKET_LAUNCHER ? 350 : (b.isRedLaser || b.isPinkLaser ? 30 : (b.isAlienLaser ? 25 : (b.w.bodyDmg || 20))));
                        bldg.hp -= dmg;
                        if (bldg.hp <= 0) { sfx.explosion(); screenShake = 30; emit(bldg.x, bldg.y, 100, color(200, 230, 40), "GORE"); spawnSplatter(bldg.x, bldg.y, "BLOOD", color(200, 230, 40)); spawnSplatter(bldg.x, bldg.y, "SCORCH"); let bIdx = buildings.indexOf(bldg); if (bIdx > -1) buildings.splice(bIdx, 1); } 
                        else { emit(b.x, b.y, 5, color(255, 20, 147), "BLOOD"); let swarmBug = new Character(bldg.x - 20, bldg.y - 20, false, "BUG"); swarmBug.ignoreBldgTimer = 180; enemiesList.push(swarmBug); sfx.hitBody(); }
                        if (b.w === WEAPONS.ROCKET_LAUNCHER) triggerRocketExplosion(b.x, b.y, b.isP); 
                    } else if (bldg.isTower && bldg.hp > 0 && b.isP) {
                        let dmg = b.w === WEAPONS.SHOTGUN ? 25 : (b.w === WEAPONS.ROCKET_LAUNCHER ? 350 : (b.w.bodyDmg || 20));
                        bldg.hp -= dmg; bldg.hitFlash = 4; emit(b.x, b.y, 5, color(255, 100, 0), "SPARK");
                        if (bldg.hp <= 0) { triggerExplosion(bldg.x, bldg.y, 200, false, true); screenShake = 60; }
                    } else if (b.w === WEAPONS.ROCKET_LAUNCHER) {
                        triggerRocketExplosion(b.x, b.y, b.isP); 
                        if (bldg.isCar) { triggerExplosion(bldg.x, bldg.y, 160, false, true); let bIdx = buildings.indexOf(bldg); if (bIdx > -1) buildings.splice(bIdx, 1); }
                    } else { 
                        emit(b.x, b.y, 3, bldg.isCar ? color(255, 200, 0) : color(100), bldg.isCar ? "SPARK" : "DUST"); 
                    }
                    break; 
                } 
            }
            let hitBarrier = false;
            for (let bldg of activeBuildings) {
                if (bldg.isUBarrier && bldg.hp > 0) {
                    if (Math.abs(b.x - bldg.x) > bldg.w + 20 || Math.abs(b.y - bldg.y) > bldg.h + 20) continue;

                    let wT = 15; let hitWall = false;
                    if (b.x > bldg.x - bldg.w/2 - wT && b.x < bldg.x - bldg.w/2 + wT && b.y > bldg.y - bldg.h/2 && b.y < bldg.y + bldg.h/2) hitWall = true;
                    if (b.x > bldg.x + bldg.w/2 - wT && b.x < bldg.x + bldg.w/2 + wT && b.y > bldg.y - bldg.h/2 && b.y < bldg.y + bldg.h/2) hitWall = true;
                    if (b.x > bldg.x - bldg.w/2 && b.x < bldg.x + bldg.w/2 && b.y > bldg.y - bldg.h/2 - wT && b.y < bldg.y - bldg.h/2 + wT) hitWall = true;
                    if (hitWall) {
                        if (!b.isP) { 
                            b.l = 0; b.active = false; hitBarrier = true; bldg.hp -= (b.w.bodyDmg || 20); bldg.hitFlash = 4;
                            emit(b.x, b.y, 5, color(255, 150, 50), "SPARK");
                            if (bldg.hp <= 0) { triggerExplosion(bldg.x, bldg.y, 100, false, false); let bIdx = buildings.indexOf(bldg); if (bIdx > -1) buildings.splice(bIdx, 1); }
                            break;
                        }
                    }
                }
            }
            if (hitBarrier) continue;

            if (!hitSomething) {
                for (let c of activeParkingCars) {
                    let cw = 50, ch = 90; 
                    if (Math.abs(b.x - c.x) > cw || Math.abs(b.y - c.y) > ch) continue;

                    if (b.x > c.x - cw / 2 && b.x < c.x + cw / 2 && b.y > c.y - ch / 2 && b.y < c.y + ch / 2) {
                        b.l = 0; b.active = false; hitSomething = true;
                        if (b.w === WEAPONS.ROCKET_LAUNCHER) {
                            triggerRocketExplosion(b.x, b.y, b.isP);
                            triggerExplosion(c.x, c.y, 160, false, true);
                            let cIdx = parkingCars.indexOf(c); if(cIdx > -1) parkingCars.splice(cIdx, 1);
                        } else {
                            emit(b.x, b.y, 5, color(255, 200, 0), "SPARK");
                        }
                        break;
                    }
                }
            }
        }
    }
  }
}



class Citizen {
    constructor(x, y, role, gender = "MALE") {
        this.x = x; this.y = y; 
        this.role = role;
        this.gender = gender;
        this.state = "IDLE";
        this.timer = floor(random(60, 180));
        this.tx = x; this.ty = y; 
        this.speed = random(0.8, 1.4);
        this.moveAngle = random(TWO_PI);
        this.walkCycle = 0;
        
        // Adjust proportions based on gender
        this.bodyW = (this.gender === "FEMALE") ? 16 : 21;
        this.bodyH = (this.gender === "FEMALE") ? 25 : 27;
        this.skinCol = color(235, 180, 140);
        
        this.shirtCol = color(200);
        this.pantsCol = color(30);
    }
    
    update() {
        this.timer--;
        
        if (this.timer <= 0) {
            if (random() > 0.5) {
                this.state = "WANDER";
                this.tx = this.x + random(-300, 300);
                this.ty = this.y + random(-300, 300);
                this.timer = dist(this.x, this.y, this.tx, this.ty) / this.speed + 60;
            } else {
                this.state = "IDLE";
                this.timer = floor(random(90, 240));
            }
        }
        
        if (this.state === "WANDER") {
            let d = dist(this.x, this.y, this.tx, this.ty);
            if (d > 10) {
                this.moveAngle = atan2(this.ty - this.y, this.tx - this.x);
                this.x += cos(this.moveAngle) * 0.8; 
                this.y += sin(this.moveAngle) * 0.8;
                this.walkCycle += 0.1;
            } else {
                this.state = "IDLE";
                this.timer = floor(random(60, 120));
            }
        }
        
        if (this.state === "IDLE" && frameCount % 120 === 0 && random() > 0.5) {
            emit(this.x, this.y, 2, this.shirtCol, "SPARK");
        }

        this.resolveCollisions();
    }

    resolveCollisions() {
        let myRadius = 14; 
        let minDistSq = (myRadius * 2) * (myRadius * 2);

        if (typeof player !== 'undefined' && player && player.hp > 0 && !player.dead) {
            let dx = this.x - player.x;
            let dy = this.y - player.y;
            
            if (abs(dx) < 30 && abs(dy) < 30) {
                let dSq = dx * dx + dy * dy;
                let pMinSq = (myRadius + 14) * (myRadius + 14);
                
                if (dSq < pMinSq && dSq > 0) {
                    let d = Math.sqrt(dSq);
                    let overlap = (myRadius + 14) - d;
                    let angle = atan2(dy, dx);
                    this.x += cos(angle) * overlap;
                    this.y += sin(angle) * overlap;
                }
            }
        }

        if (typeof townCitizens !== 'undefined') {
            for (let other of townCitizens) {
                if (other === this) continue; 
                
                let dx = this.x - other.x;
                let dy = this.y - other.y;
                
                if (abs(dx) > myRadius * 2 || abs(dy) > myRadius * 2) continue;

                let dSq = dx * dx + dy * dy;
                if (dSq < minDistSq && dSq > 0) {
                    let d = Math.sqrt(dSq);
                    let overlap = (myRadius * 2) - d;
                    let angle = atan2(dy, dx);
                    
                    this.x += cos(angle) * (overlap * 0.5);
                    this.y += sin(angle) * (overlap * 0.5);
                }
            }
        }
    }

    show() {
        let isFarmer = (this.role === "FARMING" && typeof window.farmerBlueprintUnlocked !== 'undefined' && window.farmerBlueprintUnlocked);
        let hasArmor = (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked);

        // Dynamic Uniform Colors
        if (this.role === "MILITARY") {
            if (hasArmor) {
                this.shirtCol = color(60, 100, 40);
                this.pantsCol = color(139, 115, 85);
            } else {
                this.shirtCol = color(100, 100, 200);
                this.pantsCol = color(30);
            }
        } else if (isFarmer) {
            if (this.gender === "FEMALE") {
                this.shirtCol = color(245);
                this.pantsCol = color(245);
            } else {
                this.shirtCol = color(220);
                this.pantsCol = color(40, 100, 200);
            }
        } else {
            if (this.role === "SCIENCE") {
                this.shirtCol = color(255); 
                this.pantsCol = color(15);
            }
            else if (this.role === "ARCHITECTURE") this.shirtCol = color(255, 150, 50);
            else if (this.role === "FARMING") this.shirtCol = color(100, 200, 100);
            else this.shirtCol = color(200);
            
            if (this.role !== "SCIENCE") this.pantsCol = (this.gender === "FEMALE") ? color(20) : color(30);
        }

        
        push(); translate(this.x, this.y); 
        
        let rot = (this.state === "WANDER") ? this.moveAngle : sin(frameCount * 0.05 + this.x) * 0.1;
        rotate(rot); 
        
        let isMoving = (this.state === "WANDER");
        let swing = isMoving ? sin(this.walkCycle) : 0;
        let bob = isMoving ? abs(sin(this.walkCycle)) * 2 : 0;
        
        noStroke(); fill(this.pantsCol);
        let lW = (this.gender === "FEMALE") ? 14 : 18;
        let lX = (this.gender === "FEMALE") ? -7 : -10;
        let lY1 = -10, lY2 = 2; 

        // Legs / Dress Base
        if (isFarmer && this.gender === "FEMALE") {
            rect(lX - 2, -10, lW + 4, 18, 4); // Dress Base
        } else {
            rect(lX + swing * 12, lY1, lW, 8, 4); 
            rect(lX - swing * 12, lY2, lW, 8, 4); 
        }
        
        translate(bob, 0);

        let lArmSwing = -swing; 
        let rArmSwing = swing;  
        let armLY = (this.gender === "FEMALE") ? -12 : -14; 
        let armRY = (this.gender === "FEMALE") ? 9 : 11;  
        let lHandX = lArmSwing * 14;
        let lShoulderX = lArmSwing * 4;
        let rHandX = rArmSwing * 14;
        let rShoulderX = rArmSwing * 4;

        // Back hands
        fill(this.skinCol);
        if (lArmSwing <= 0.2) ellipse(lHandX, armLY, 8, 8);
        if (rArmSwing <= 0.2) ellipse(rHandX, armRY, 8, 8);
        // Sleeves
        fill(this.shirtCol); 
        ellipse(lShoulderX, armLY, 16, 9);
        ellipse(rShoulderX, armRY, 16, 9);

        // --- NEW: Lab Coat Tails for Science ---
        if (this.role === "SCIENCE") {
            push(); 
            let sway = isMoving ? sin(frameCount * 0.2) * 0.2 : sin(frameCount * 0.05) * 0.05;
            rotate(sway + HALF_PI); 
            fill(240); stroke(200); strokeWeight(1);
            beginShape(); vertex(5, 0); vertex(10, 2); vertex(16, 25); vertex(8, 28); vertex(-8, 28); vertex(-16, 25); vertex(-10, 2); vertex(-5, 0); endShape(CLOSE); 
            pop();
        }

        // Body
        ellipse(0, 0, this.bodyW, this.bodyH); 

        
        // Farmer Male Overalls
        if (isFarmer && this.gender === "MALE") {
            fill(this.pantsCol);
            rect(-this.bodyW/2 + 2, -this.bodyH/2 + 8, this.bodyW - 4, this.bodyH - 8, 4);
            rect(-this.bodyW/2 + 4, -this.bodyH/2 + 2, 4, 8);
            rect(this.bodyW/2 - 8, -this.bodyH/2 + 2, 4, 8);
        }

        // Female Features (Breasts & Cleavage Cutout)
        if (this.gender === "FEMALE") {
            fill(this.shirtCol);
            stroke(isFarmer ? 200 : 0); 
            strokeWeight(1.5); 
            ellipse(4, -5, 11, 9); 
            ellipse(4, 5, 11, 9);  
            
            stroke(200, 150, 120, 100); 
            strokeWeight(1); 
            line(6, -2, 6, 2); 
            noStroke();

            if (isFarmer) {
                fill(this.skinCol);
                ellipse(0, -6, 10, 12);
            }
        }

        // Head
        fill(this.skinCol); 
        ellipse(0, 0, 11, 11); 

        // Hair and Helmets
        if (this.role === "MILITARY" && hasArmor) {
            push(); rotate(-HALF_PI);
            fill(40, 80, 40); stroke(0); strokeWeight(1.5);
            arc(0, -1, 14, 14, PI, TWO_PI, CHORD);
            pop();
            noStroke();
        } else if (isFarmer && this.gender === "MALE") {
            fill(210, 180, 70); ellipse(0, 0, 24, 24); 
            fill(190, 160, 50); ellipse(0, 0, 14, 14); 
        } else if (this.gender === "FEMALE") {
            fill(isFarmer ? color(150, 80, 40) : color(15));
            arc(0, 0, 12, 12, HALF_PI, PI + HALF_PI);
            push(); translate(-5, 0); rotate(radians(isMoving ? sin(frameCount * 0.3) * 15 : 0)); ellipse(-6, 0, 12, 6); pop();
        }

        // Front hands
        fill(this.skinCol);
        if (lArmSwing > 0.2) ellipse(lHandX, armLY, 8, 8);
        if (rArmSwing > 0.2) ellipse(rHandX, armRY, 8, 8);
        
        pop();
    }
}









class Bullet {
  constructor() { this.active = false; }
  
  init(x, y, a, iP, tH, w) { 
    this.active = true;
    this.x = x; this.y = y; this.startX = x; this.startY = y; this.isP = iP; this.tH = tH; this.w = w; this.a = a; 
    this.isAlienLaser = (w === "ALIEN_LASER"); this.isRedLaser = (w === "RED_LASER"); this.isPinkLaser = (w === "PINK_LASER"); this.isRocket = (w === WEAPONS.ROCKET_LAUNCHER); this.isTaser = (w === WEAPONS.TASER);
    
    // NEW TASER VARIABLES
    this.retracting = false;
    this.tetheredTarget = null;
    this.tetherTimer = 0;

    let s = 25; 
    if (this.isAlienLaser || this.isRedLaser || this.isPinkLaser) { s = 9.8; } 
    else if (this.isRocket) { s = 16; } 
    else if (w === WEAPONS.PISTOL && !iP) { s = 12.5; } 
    else if (iP && (w === WEAPONS.PISTOL || w === WEAPONS.SHOTGUN || w === WEAPONS.ASSAULT_RIFLE)) { s = 35; }
    if (this.isTaser) s = 20;

    this.vx = cos(a) * s; this.vy = sin(a) * s; 
    this.l = w === WEAPONS.SHOTGUN ? 30 : 120; 
    
    this.sz = (this.isAlienLaser || this.isRedLaser || this.isPinkLaser) ? 12 : (this.isRocket ? 16 : 6); 
    this.col = this.isAlienLaser ? color(255, 20, 147) : (this.isRedLaser ? color(255, 50, 50) : (this.isPinkLaser ? color(255, 105, 180) : color(255, 200, 0))); 
    
    this.history = []; 
    return this;
  }

  update() { 
      if (!this.active) return;
      this.history.push({x: this.x, y: this.y});
      let maxLen = this.isRocket ? 15 : (this.isAlienLaser || this.isRedLaser || this.isPinkLaser ? 8 : 5);
      if (this.history.length > maxLen) this.history.shift();

      if (this.isTaser) {
          if (this.tetheredTarget) {
              if (this.tetherTimer > 0) {
                  this.tetherTimer--;
                  this.x = this.tetheredTarget.x;
                  this.y = this.tetheredTarget.y;
                  if (this.tetheredTarget.hp <= 0 || this.tetheredTarget.dead) this.tetherTimer = 0; // Abort if they die
              } else {
                  this.tetheredTarget = null;
                  this.retracting = true;
              }
          } else if (this.retracting) {
              let ang = atan2(player.y - this.y, player.x - this.x);
              this.x += cos(ang) * 35;
              this.y += sin(ang) * 35;
              if (dist(this.x, this.y, player.x, player.y) < 40) this.active = false;
          } else {
              this.x += this.vx; this.y += this.vy;
              // 15m max range (approx 300px), then retract
              if (dist(this.startX, this.startY, this.x, this.y) > 300) this.retracting = true;
          }
      } else {
          this.x += this.vx; this.y += this.vy; this.l--;
      }
  }

  show() { 
      if (!this.active) return;

      // ==========================================
      // TASER RENDERING
      // ==========================================
      if (this.isTaser) {
          stroke(100); strokeWeight(2);
          if (player) line(this.x, this.y, player.x, player.y); // Tether to player
          
          push(); 
          translate(this.x, this.y); 
          if (this.tetheredTarget) rotate(this.a + random(-0.3, 0.3)); // Shake the prongs while shocking
          else rotate(this.a);

          fill(255, 255, 0); stroke(20); strokeWeight(1);
          rect(-4, -6, 8, 12, 2); 
          stroke(200); line(4, -4, 10, -4); line(4, 4, 10, 4); 
          pop();
          return; 
      }
      
      push(); // Master push to prevent styling leaks

      // ==========================================
      // RESTORED ORIGINAL LASER BEAMS
      // ==========================================
      if (this.isRedLaser || this.isPinkLaser) {
          translate(this.x, this.y); 
          rotate(this.a); 
          stroke(this.isPinkLaser ? color(255, 20, 147, 150) : color(255, 0, 0, 150)); 
          strokeWeight(8); 
          line(0, 0, -40, 0); 
          stroke(this.isPinkLaser ? color(255, 105, 180) : color(255, 100, 100)); 
          strokeWeight(3); 
          line(0, 0, -40, 0); 
          pop();
          return; 
      }
      if (this.isAlienLaser) {
          fill(this.col); noStroke(); ellipse(this.x, this.y, this.sz, this.sz);
          pop();
          return;
      }

      // ==========================================
      // TRAIL RENDERING (Tracers & Smoke)
      // ==========================================
      if (this.history.length > 0) {
          if (this.isRocket) {
              // Rocket Smoke Ribbon
              noStroke();
              for (let i = 0; i < this.history.length; i++) {
                  let pt = this.history[i];
                  let alpha = map(i, 0, this.history.length - 1, 0, 150);
                  let sSize = map(i, 0, this.history.length - 1, 16, 6);
                  fill(150, alpha); 
                  ellipse(pt.x + sin(frameCount * 0.5 + i) * 2, pt.y + cos(frameCount * 0.5 + i) * 2, sSize, sSize);
              }
          } else {
              // Hot Ballistic Tracers
              noFill();
              let c = this.col;
              let glowThick = this.sz * 0.6;
              let coreThick = this.sz * 0.25;
              
              for (let i = 0; i < this.history.length - 1; i++) {
                  let pt1 = this.history[i];
                  let pt2 = this.history[i + 1];
                  let alpha = map(i, 0, this.history.length - 1, 0, 200);
                  
                  // Outer glow
                  stroke(c.levels[0], c.levels[1], c.levels[2], alpha);
                  strokeWeight(glowThick);
                  line(pt1.x, pt1.y, pt2.x, pt2.y);
                  
                  // Bright-white inner core
                  stroke(255, 255, 255, alpha);
                  strokeWeight(coreThick);
                  line(pt1.x, pt1.y, pt2.x, pt2.y);
              }
              
              // Seamlessly connect the end of the trail to the active bullet head
              let lastPt = this.history[this.history.length - 1];
              stroke(c.levels[0], c.levels[1], c.levels[2], 255);
              strokeWeight(glowThick);
              line(lastPt.x, lastPt.y, this.x, this.y);
              
              stroke(255, 255, 255, 255);
              strokeWeight(coreThick);
              line(lastPt.x, lastPt.y, this.x, this.y);
          }
      }

      // ==========================================
      // PROJECTILE HEADS
      // ==========================================
      if (this.isRocket) {
          translate(this.x, this.y); rotate(this.a); 
          fill(40); noStroke();
          triangle(-8, -4, -12, -8, -4, -4); triangle(-8, 4, -12, 8, -4, 4); 
          fill(120, 140, 120); rect(-8, -4, 16, 8, 2); 
          fill(200, 30, 30); triangle(8, -4, 8, 4, 16, 0); 
          fill(255, 150, 0); ellipse(-8, 0, 8, 8); 
          fill(255, 255, 100); ellipse(-8, 0, 4, 4); 
          
          let backX = -cos(this.a) * 8, backY = -sin(this.a) * 8; 
          if (frameCount % 3 === 0) emit(this.x + backX, this.y + backY, 1, color(255, 100, 0), "SPARK", -this.vx * 0.4, -this.vy * 0.4);
      } else {
          fill(this.col); 
          if (this.isP) { stroke(0, 100); strokeWeight(1); } 
          else if (this.w === WEAPONS.PISTOL) { stroke(255, 0, 0); strokeWeight(1); } 
          else { noStroke(); } 
          
          let headSz = this.sz * 0.6;
          ellipse(this.x, this.y, headSz, headSz); 
      }
      pop(); // End master push
  }
}

function Particle(x, y, c, t, dX = 0, dY = 0) { 
    this.x = x; this.y = y; this.c = c; this.t = t; this.a = 255; 
    if (t === "FLASH" || t === "MUZZLE") { this.vx = dX + random(-1, 1); this.vy = dY + random(-1, 1); this.l = t === "MUZZLE" ? 4 : random(10, 20); } 
    else if (t === "SPARK") { this.vx = dX + random(-5, 5); this.vy = dY + random(-5, 5); this.l = random(10, 20); } 
    else if (t === "CHIP") { this.vx = random(-3, 3); this.vy = random(-3, 3); this.l = random(20, 50); } 
    else if (t === "THRUST") { this.vx = dX + random(-2, 2); this.vy = dY + random(-2, 2); this.l = random(10, 20); } 
    else if (t === "BLOOD") { this.vx = dX * 0.15 + random(-3, 3); this.vy = dY * 0.15 + random(-3, 3); this.l = random(10, 20); } 
    else if (t === "GORE" || t === "BONE") { this.vx = dX * 0.1 + random(-8, 8); this.vy = dY * 0.1 + random(-8, 8); this.l = random(20, 50); } 
    else if (t === "EXPLOSION") { this.vx = random(-12, 12); this.vy = random(-12, 12); this.l = random(15, 30); } 
    else if (t === "SMOKE") { this.vx = dX + random(-1.5, 1.5); this.vy = dY + random(-1.5, 1.5); this.l = random(30, 60); } 
    else { this.vx = random(-4, 4); this.vy = random(-4, 4); this.l = random(10, 20); } 
}

Particle.prototype.update = function() { this.x += this.vx; this.y += this.vy; if (this.t !== "FLASH" && this.t !== "SMOKE") { this.vx *= 0.85; this.vy *= 0.85; } if (--this.l <= 0) { if (this.t === "FLASH" || this.t === "MUZZLE" || this.t === "THRUST" || this.t === "EXPLOSION" || this.t === "SPARK") this.a -= 60; else this.a -= 15; } }
Particle.prototype.show = function() { fill(this.c.levels[0], this.c.levels[1], this.c.levels[2], this.a); noStroke(); let sz = 5; if (this.t === "FLASH" || this.t === "MUZZLE" || this.t === "THRUST" || this.t === "SPARK") sz = random(5, 12); else if (this.t === "GORE" || this.t === "CHIP") sz = random(4, 10); else if (this.t === "BONE") sz = random(2, 5); else if (this.t === "EXPLOSION") sz = random(10, 25); else if (this.t === "SMOKE") sz = random(20, 40); if (this.t === "BONE" || this.t === "CHIP") rect(this.x, this.y, sz, sz); else ellipse(this.x, this.y, sz, sz); }

function updateParticles() { 
    for (let i = particles.length - 1; i >= 0; i--) { 
        if (doTick) particles[i].update(); 
        if (inView(particles[i].x, particles[i].y, 50)) particles[i].show(); 
        if (particles[i].a <= 0) particles.splice(i, 1); 
    } 
}

function drawUI() {
  fill(50, 200); noStroke(); rect(20, 20, 200, 15, 4); 
  fill(220, 30, 30); rect(20, 20, player ? max(0, player.hp) * 2 : 0, 15, 4);
  
  fill(50, 200); rect(20, 40, 200, 10, 4); 
  fill(0, 200, 255); rect(20, 40, player ? max(0, player.shield) * 2 : 0, 10, 4);

  // --- PERSISTENT ARMY BAR CALCULATION ---
  // Now includes currentLevel === 8 to prevent reset
    // --- PERSISTENT ARMY BAR CALCULATION ---
  // Now includes currentLevel === 8 to prevent reset
  let isArmyMode = isStoryMode && (window.towersDefeated || window.militaryToBring > 0 || window.militaryToBringM > 0 || window.militaryToBringF > 0 || currentLevel === 8);
  let liveArmyCount = enemiesList.filter(e => e.isFriendly && e.hp > 0 && !e.dead && e.eType !== "COW" && e.eType !== "MILITARY_NEUTRAL").length;
  
  
  // OVERRIDE: If the government directive is established, strictly display the popMilitary count
  if (isArmyMode && typeof townsData !== 'undefined' && townsData[currentLevel] && townsData[currentLevel].established) {
      liveArmyCount = typeof popMilitary !== 'undefined' ? popMilitary : 0;
  }

  // Track peak size but prevent it from shrinking to 0 if level 8 is entered
  if (currentLevel !== 8 && (!window.maxArmySize || liveArmyCount > window.maxArmySize)) {
      window.maxArmySize = Math.max(1, liveArmyCount);
  }
  let popRatio = isArmyMode ? (max(0, liveArmyCount) / Math.max(1, window.maxArmySize)) : (max(0, MAX_KILLS - totalKills) / MAX_KILLS);

  fill(50, 200); rect(20, 55, 200, 5, 2); 
  
  if (isStoryMode) {
      fill(255, 105, 180); 
      rect(20, 55, 200 * popRatio, 5, 2); 
      fill(255, 200, 255); textAlign(LEFT, TOP); textFont('sans-serif'); textStyle(BOLDITALIC); textSize(11);
      text(isArmyMode ? "STICK CITY POPULATION ALLIES: " + liveArmyCount : "STICK CITY POPULATION", 22, 63);
  } else {
      fill(255, 200, 0); 
      rect(20, 55, 200 * popRatio, 5, 2); 
      fill(255, 255, 200); textAlign(LEFT, TOP); textFont('sans-serif'); textStyle(BOLDITALIC); textSize(11);
      text("ENEMIES", 22, 63);
  }
  textStyle(NORMAL); 

  // --- NEW LEVEL 8 ENEMY COUNT BAR ---
  let uiOffset = 35; 
  if (currentLevel === 8) {
      // Calculate enemies remaining in HQ
      let hqEnemies = enemiesList.filter(e => !e.isFriendly && e.hp > 0 && !e.dead).length;
      let hqRatio = max(0, hqEnemies) / 20; 
      
      fill(50, 200); noStroke(); 
      rect(20, 80, 200, 5, 2); 
      
      fill(255, 50, 50); 
      rect(20, 80, 200 * hqRatio, 5, 2); 
      
      fill(255, 150, 150); textAlign(LEFT, TOP); textFont('sans-serif'); textStyle(BOLDITALIC); textSize(11);
      text("NM-0 HQ ENEMIES: " + hqEnemies, 22, 88);
      textStyle(NORMAL);
      uiOffset = 60; 
  }
  if (nm0AmbushActive) {
      let ambushRatio = max(0, nm0AmbushKills) / 300; 
      
      fill(50, 200); noStroke(); 
      rect(20, 80, 200, 5, 2); 
      
      fill(255, 50, 50); 
      rect(20, 80, 200 * ambushRatio, 5, 2); 
      
      fill(255, 150, 150); textAlign(LEFT, TOP); textFont('sans-serif'); textStyle(BOLDITALIC); textSize(11);
      text("NM-0 AMBUSH FORCES", 22, 88);
      textStyle(NORMAL);
      
      uiOffset = 60; 
  }
// --- NEW: STICK ARMY OUTPOST BAR (Tan Bar) ---
  if (currentLevel === 4) {
      let outpostUnits = enemiesList.filter(e => e.eType === "MILITARY_NEUTRAL" && e.hp > 0 && !e.dead).length;
      let totalOutpost = 80; // Set this to the initial number of units you spawn
      let outpostRatio = max(0, outpostUnits) / totalOutpost;
      
      fill(50, 200); noStroke(); 
      rect(20, 95, 200, 5, 2); // Positioned below the main bar
      
      fill(190, 170, 130); // Tan bar to match military outfits
      rect(20, 95, 200 * outpostRatio, 5, 2); 
      
      fill(235, 210, 170); textAlign(LEFT, TOP); textFont('sans-serif'); textStyle(BOLDITALIC); textSize(11);
      text("STICK ARMY OUTPOST: " + outpostUnits, 22, 103);
      textStyle(NORMAL);
  }
  // --- NEW SEPARATE FARM AMBUSH BAR ---
  if (typeof farmAmbushActive !== 'undefined' && farmAmbushActive) {
      let farmRatio = max(0, window.farmAmbushKills) / 500; 
      
      fill(50, 200); noStroke(); 
      rect(20, 80, 200, 5, 2); 
      
      fill(200, 230, 40); // Bug Yellow/Green
      rect(20, 80, 200 * farmRatio, 5, 2); 
      
      fill(220, 255, 100); textAlign(LEFT, TOP); textFont('sans-serif'); textStyle(BOLDITALIC); textSize(11);
      text("PEST INFESTATION: " + window.farmAmbushKills, 22, 88);
      textStyle(NORMAL);
      
      uiOffset = 60; 
  }

  // CRITICAL FIX: Only ONE push and ONE translate goes here!
  push(); 
  translate(0, uiOffset); 
  
  fill(30, 200); stroke(80); strokeWeight(2); rect(20, 55, 60, 40, 5); 
  noStroke(); fill(150); 
  
  if (player && player.currentWeapon === WEAPONS.DUAL_SMG) {
      rect(28, 60, 24, 8, 2); rect(32, 68, 6, 8); 
      rect(28, 75, 24, 8, 2); rect(32, 83, 6, 8); 
  } else if (player && player.currentWeapon === WEAPONS.SMG) { 
      rect(28, 65, 24, 8, 2); 
      rect(32, 73, 6, 12); 
  } else if (player && player.currentWeapon === WEAPONS.ASSAULT_RIFLE) { 
      fill(40); rect(25, 66, 32, 4, 1); 
      fill(139, 69, 19); rect(32, 65, 10, 6, 1); rect(20, 65, 6, 6, 1); 
  } else if (player && player.currentWeapon === WEAPONS.SHOTGUN) { 
      fill(30); rect(25, 66, 32, 4, 1); 
      fill(15); rect(36, 64.5, 12, 7, 1); 
      fill(50); rect(25, 64.5, 10, 7, 2); 
  } else if (player && player.currentWeapon === WEAPONS.ROCKET_LAUNCHER) { 
      fill(50, 70, 50); rect(25, 66, 36, 6, 2); 
      fill(30); rect(35, 64, 8, 10, 1); 
  } else if (player && player.currentWeapon === WEAPONS.TASER) { 
      fill(255, 255, 0); stroke(10); strokeWeight(1); 
      rect(28, 66, 18, 8, 2); 
      fill(20); noStroke(); rect(32, 74, 6, 8); 
  } else {  
      rect(35, 65, 16, 6, 2); 
      rect(35, 71, 6, 10); 
  }
 
  fill(255); noStroke(); textAlign(LEFT, CENTER); textFont('sans-serif'); textSize(24); 
 
  let pA = player ? player.ammo : 0, pM = player ? player.currentWeapon.maxAmmo : 17, pR = player ? player.reloadTimer : 0; 
  
  if (player && player.currentWeapon === WEAPONS.TASER) {
      text(pR > 0 ? "RECHARGING" : `${pA} / ∞`, 90, 75); 
  } else {
      let mags = player ? player.mags[player.currentWeapon.name] : Infinity;
      let reserveAmmo = mags === Infinity ? "∞" : mags * pM;
      text(pR > 0 ? "RELOADING" : `${pA} / ${reserveAmmo}`, 90, 75); 
  }
  
  pop(); // CRITICAL FIX: Closes the translation perfectly


  textAlign(RIGHT, TOP); textSize(10); fill(255); text("SCORE: " + score, width - 20, 20);

  fill(50, 200); stroke(255); strokeWeight(2); rect(width - 60, 40, 40, 40, 5);
  fill(255); noStroke(); rect(width - 48, 50, 6, 20, 2); rect(width - 34, 50, 6, 20, 2);
  
  if (consecutiveKills >= 2) { 
      let displayMult = min(99, consecutiveKills);
      fill(255, 150, 0); textSize(16); 
      let shakeX = random(-1, 1) * displayMult * 0.5; let shakeY = random(-1, 1) * displayMult * 0.5;
      textAlign(RIGHT, TOP); text("x" + displayMult + " COMBO", width - 20 + shakeX, 33 + shakeY);
      fill(50, 200); rect(width - 120, 80, 100, 8, 4);
      fill(255, 150, 0); rect(width - 120, 80, map(comboTimer, 0, 180, 0, 100), 8, 4);
  }

  updateAndDrawFloatingScores();

  let bY = rightStick.base.y - 80, rbX = width - 35, rbY = bY - 170; 
  let isTaser = player && player.currentWeapon === WEAPONS.TASER;
  
  fill(50, 200); stroke(100); strokeWeight(2); 
  if (pR > 0) fill(100, 50, 50, 200); 
  ellipse(rbX, rbY, 50, 50); 
  fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11); 
  
  if (isTaser) text(pR > 0 ? "..." : "RECHARGE", rbX, rbY);
  else text(pR > 0 ? "..." : "RELOAD", rbX, rbY);

  if (typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) {
      let cbX = rbX, cbY = rbY - 70; 
      fill(50, 200); stroke(255, 255, 0); strokeWeight(2); 
      if (player && player.cannonCooldown > 0) fill(150, 150, 0, 200); 
      ellipse(cbX, cbY, 50, 50); 
      push(); translate(cbX, cbY); rotate(-PI/2); noFill(); strokeWeight(4);
      if (player && player.cannonCharge > 0) { stroke(255, 255, 0); arc(0, 0, 50, 50, 0, min(1, player.cannonCharge / 180) * TWO_PI); }
      else if (player && player.cannonCooldown > 0) { stroke(150, 150, 0); arc(0, 0, 50, 50, 0, (1 - (player.cannonCooldown / 180)) * TWO_PI); } 
      pop();
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11); 
      text((player && player.cannonCooldown > 0) ? "RECHARGING" : "CANNON\n(" + (player ? player.cannonAmmo : 4) + ")", cbX, cbY);
  } 
  else if (grenadesUnlocked || (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked)) {
      let gbX = rbX, gbY = rbY - 70; 
      fill(50, 200); stroke(100); strokeWeight(2); 
      if (pGrenadeAmmo <= 0) fill(150, 50, 0, 200); ellipse(gbX, gbY, 50, 50); 
      push(); translate(gbX, gbY); rotate(-PI/2); noFill(); strokeWeight(4);
      if (isCooking) { stroke(255, 150, 0); arc(0, 0, 50, 50, 0, (cookTime / 180) * TWO_PI); } 
      else if (pGrenadeAmmo <= 0) { stroke(255, 50, 50); arc(0, 0, 50, 50, 0, (1 - (pGrenadeTimer / 600)) * TWO_PI); } 
      else { stroke(40, 120, 40); ellipse(0, 0, 50, 50); } pop();
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11); 
      let timerTxt = (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked && pGrenadeAmmo <= 0) ? Math.ceil(pGrenadeTimer / 60) : "EMPTY";
      text(isCooking ? "COOKING" : (pGrenadeAmmo <= 0 ? timerTxt : `GRENADE\n(${pGrenadeAmmo})`), gbX, gbY);
  }

  if (typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) {
      let fbX = rbX - 70, fbY = rbY; 
      fill(50, 200); stroke(0, 150, 255); strokeWeight(2); 
      if (pFlaskAmmo <= 0) fill(0, 50, 150, 200); 
      ellipse(fbX, fbY, 50, 50); 
      push(); translate(fbX, fbY); rotate(-PI/2); noFill(); strokeWeight(4);
      if (isCooking) { stroke(255, 150, 0); arc(0, 0, 50, 50, 0, (cookTime / 180) * TWO_PI); } 
      else if (pFlaskAmmo <= 0) { stroke(0, 200, 255); arc(0, 0, 50, 50, 0, (1 - (pFlaskTimer / 600)) * TWO_PI); } 
      else { stroke(0, 150, 255); ellipse(0, 0, 50, 50); } pop();
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11); 
      let timerTxt = (pFlaskAmmo <= 0) ? Math.ceil(pFlaskTimer / 60) : "EMPTY";
      text(isCooking ? "COOKING" : (pFlaskAmmo <= 0 ? timerTxt : `FLASK\n(${pFlaskAmmo})`), fbX, fbY);
  } 
  else if (meleeUnlocked) { 
      let mbX = rbX - 70, mbY = rbY; fill(50, 200); stroke(255, 100, 0); strokeWeight(2); if (player && player.meleeCooldown > 0) fill(150, 50, 0, 200); ellipse(mbX, mbY, 50, 50); fill(255); noStroke(); text(player && player.meleeCooldown > 0 ? "..." : "MELEE", mbX, mbY); 
  }

  let tbX = width - 35, tbY = bY - 100; stroke(0, 255, 0); strokeWeight(2); noFill(); ellipse(tbX, tbY, 40, 40); line(tbX - 20, tbY, tbX + 20, tbY); line(tbX, tbY - 20, tbX, tbY + 20); if (headAimToggle) { fill(255, 0, 0); noStroke(); ellipse(tbX, tbY, 16, 16); fill(255, 0, 0); textAlign(RIGHT, CENTER); textSize(12); text("HEADSHOT", tbX - 30, tbY - 8); text("MODE", tbX - 30, tbY + 8); }
  if (jetpackUnlocked) { let dbX = tbX - 70, dbY = tbY; fill(50, 200); stroke(0, 200, 255); strokeWeight(2); if (player && player.dashCooldown > 0) fill(50, 100, 150, 200); ellipse(dbX, dbY, 50, 50); fill(255); noStroke(); textAlign(CENTER, CENTER); text(player && player.dashCooldown > 0 ? "..." : "DASH", dbX, dbY); }
  if (streakMsgTimer > 0) { push(); fill(255, 200, 0, map(streakMsgTimer, 0, 120, 0, 255)); textAlign(CENTER, CENTER); textSize(40); text(streakMsgText, width / 2, height / 4); pop(); streakMsgTimer--; }

  if ((currentLevel === 1 || currentLevel === 2) && isStoryMode && player && player.hp > 0 && (currentLevel === 2 || journalRead)) {
      let activeTowers = buildings.filter(b => b.isTower && b.hp > 0);
      for (let b of activeTowers) {
          let d = dist(player.x, player.y, b.x, b.y);
          if (d > 450) { 
              let ang = atan2(b.y - player.y, b.x - player.x);
              let pad = 15; let dx = cos(ang); let dy = sin(ang);
              let tX = (width/2 - pad) / abs(dx); let tY = (height/2 - pad) / abs(dy);
              let multiplier = min(tX, tY);
              let cx = width/2 + dx * multiplier; let cy = height/2 + dy * multiplier;
              push(); translate(cx, cy); push(); translate(-cos(ang) * 25, -sin(ang) * 25); 
              fill(255, 255, 0); stroke(0); strokeWeight(2); textSize(12); textAlign(CENTER, CENTER); textFont('sans-serif');
              text(floor(d / 10) + "m", 0, 0); pop(); rotate(ang);
              if (frameCount % 60 < 30) fill(255, 50, 50, 230); else fill(200, 0, 0, 230);
              stroke(0); strokeWeight(2); triangle(12, 0, -8, -8, -8, 8); pop();
          }
      }
  }
}



















function handleGamepad() {
  let pads = navigator.getGamepads(), pad = null; for (let i = 0; i < pads.length; i++) if (pads[i]) { pad = pads[i]; break; } if (!pad) return;
  
  let lx = pad.axes[0], ly = pad.axes[1], ld = dist(0, 0, lx, ly); 
  if (ld > 0.2) { leftStick.active = true; leftStick.dx = lx; leftStick.dy = ly; window.showOnScreenControls = false; window.isDesktop = false; } else if (!touches.length && !window.isDesktop) leftStick.active = false;
  
  let rx = pad.axes[2], ry = pad.axes[3], rd = dist(0, 0, rx, ry); 
  if (rd > 0.2) { rightStick.active = true; rightStick.dx = rx; rightStick.dy = ry; rightStick.dist = rd; window.showOnScreenControls = false; window.isDesktop = false; } else if (!touches.length && !window.isDesktop) rightStick.active = false;
  
  let btn = (i) => pad.buttons[i] && pad.buttons[i].pressed, jP = (i) => btn(i) && !prevGamepadButtons[i];
  let anyBtn = false; for (let i = 0; i < pad.buttons.length; i++) { prevGamepadButtons[i] = btn(i); if (btn(i)) anyBtn = true; }
  if (anyBtn) { window.showOnScreenControls = false; window.isDesktop = false; }
  
  if (jP(0) && (smgUnlocked || shotgunUnlocked || arUnlocked || rocketLauncherUnlocked) && millis() - lastWeaponSwapTime > 300 && player) { 
      let aW = [WEAPONS.PISTOL]; 
      if (dualSmgUnlocked) aW.push(WEAPONS.DUAL_SMG); else if (smgUnlocked) aW.push(WEAPONS.SMG); 
      if (arUnlocked) aW.push(WEAPONS.ASSAULT_RIFLE); if (shotgunUnlocked) aW.push(WEAPONS.SHOTGUN); if (rocketLauncherUnlocked) aW.push(WEAPONS.ROCKET_LAUNCHER); 
      let nI = (aW.indexOf(player.currentWeapon) + 1) % aW.length; player.currentWeapon = aW[nI]; player.reloadTimer = 0; lastWeaponSwapTime = millis(); 
  }
  if (jP(2) && player && player.reloadTimer <= 0 && player.ammo < player.currentWeapon.maxAmmo) { player.triggerReload(); }
  if ((pad.buttons[3]?.pressed || pad.buttons[5]?.pressed) && meleeUnlocked) meleeInputHeld = true;   
  
  // --- NEW: Controller Support for Grenades ---
  grenadeInputHeld = (pad.buttons[4]?.pressed || pad.buttons[6]?.pressed) ? true : false;

  if ((jP(3) || jP(5)) && meleeUnlocked && player && player.dashTimer <= 0 && !chemistSuitUnlocked) { player.activateMelee(); }
  if (jP(1) && millis() - lastToggleTime > 300) { headAimToggle = !headAimToggle; lastToggleTime = millis(); }
  if ((jP(4) || jP(6)) && jetpackUnlocked && player && player.dashCooldown <= 0 && player.dashTimer <= 0 && player.meleeTimer <= 0) { player.activateDash(); }
}






function handleTouches() {
  meleeInputHeld = false;
  cannonInputHeld = false;
  grenadeInputHeld = false; 

  leftStick.active = false; rightStick.active = false; leftStick.dx = 0; leftStick.dy = 0; rightStick.dx = 0; rightStick.dy = 0; rightStick.dist = 0; 
  let hw = width / 2, mR = 60, bY = rightStick.base.y - 80;
  
  let currentMeleeTouch = false; 
  let currentCannonTouch = false; 
  let currentGrenadeTouch = false;
  
  if (window.lastPauseTime === undefined) window.lastPauseTime = 0;

  for (let i = 0; i < touches.length; i++) {
    let tx = touches[i].x, ty = touches[i].y;
    
    if (tx > width - 100 && ty < 100) {
        if (millis() - window.lastPauseTime > 300) {
            isPaused = true; pauseMenuState = "MAIN"; sfx.charge(); window.lastPauseTime = millis();
        }
        continue; 
    }

    // --- UPDATED BUTTON HITBOXES ---
    if (typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) {
        if (dist(tx, ty, width - 35, bY - 240) < 45) currentCannonTouch = true; // Top Slot (Above Reload)
        if (dist(tx, ty, width - 105, bY - 170) < 45) currentMeleeTouch = true; // Left Slot (Flasks use melee input)
    } else {
        if ((grenadesUnlocked || (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked)) && dist(tx, ty, width - 35, bY - 240) < 45) currentGrenadeTouch = true; 
        if (meleeUnlocked && dist(tx, ty, width - 105, bY - 170) < 45) currentMeleeTouch = true; 
    }

    if (dist(tx, ty, 50, 65) < 40 && (smgUnlocked || shotgunUnlocked || arUnlocked || rocketLauncherUnlocked)) { 
        if (millis() - lastWeaponSwapTime > 300 && player) { 
            let aW = [WEAPONS.PISTOL]; 
			if (isStoryMode) aW.push(WEAPONS.TASER);
            if (dualSmgUnlocked) aW.push(WEAPONS.DUAL_SMG); else if (smgUnlocked) aW.push(WEAPONS.SMG); 
            if (arUnlocked) aW.push(WEAPONS.ASSAULT_RIFLE); if (shotgunUnlocked) aW.push(WEAPONS.SHOTGUN); if (rocketLauncherUnlocked) aW.push(WEAPONS.ROCKET_LAUNCHER); 
            player.currentWeapon = aW[(aW.indexOf(player.currentWeapon) + 1) % aW.length]; player.reloadTimer = 0; lastWeaponSwapTime = millis(); 
        } 
        continue; 
    }
    
    if (dist(tx, ty, width - 35, bY - 170) < 45) { if (player && player.reloadTimer <= 0 && player.ammo < player.currentWeapon.maxAmmo) { player.triggerReload(); } }
    if (dist(tx, ty, width - 35, bY - 100) < 45) { if (millis() - lastToggleTime > 300) { headAimToggle = !headAimToggle; lastToggleTime = millis(); } }
    if (jetpackUnlocked && dist(tx, ty, width - 105, bY - 100) < 45) { if (player && player.dashCooldown <= 0 && player.dashTimer <= 0 && player.meleeTimer <= 0) { player.activateDash(); } }
    
    if (tx < hw) { 
        leftStick.active = true; let dx = tx - leftStick.base.x, dy = ty - leftStick.base.y, d = dist(0, 0, dx, dy); if (d > mR) { dx = (dx / d) * mR; dy = (dy / d) * mR; d = mR; } leftStick.dx = dx / mR; leftStick.dy = dy / mR; 
    } else { 
        let touchingBtn = false;
        if (tx > width - 100 && ty < 100) touchingBtn = true; 
        if (dist(tx, ty, width - 35, bY - 170) < 45) touchingBtn = true; // Reload
        if (dist(tx, ty, width - 105, bY - 170) < 45) touchingBtn = true; // Melee/Flask
        if (dist(tx, ty, width - 35, bY - 100) < 45) touchingBtn = true; // Headshot
        if (dist(tx, ty, width - 105, bY - 100) < 45) touchingBtn = true; // Jetpack
        
        // Cannon OR Grenade exclusion
        let hasTopBtn = (typeof chemistSuitUnlocked !== 'undefined' && chemistSuitUnlocked) || grenadesUnlocked || (typeof explosiveArmorUnlocked !== 'undefined' && explosiveArmorUnlocked);
        if (hasTopBtn && dist(tx, ty, width - 35, bY - 240) < 45) touchingBtn = true;
        
        if (!touchingBtn) {
            rightStick.active = true; let dx = tx - rightStick.base.x, dy = ty - rightStick.base.y, d = dist(0, 0, dx, dy); if (d > mR) { dx = (dx / d) * mR; dy = (dy / d) * mR; d = mR; } rightStick.dx = dx / mR; rightStick.dy = dy / mR; rightStick.dist = d / mR; 
        }
    }
  } 
  
  if (currentCannonTouch) cannonInputHeld = true;
  if (currentMeleeTouch) meleeInputHeld = true;
  if (currentGrenadeTouch) grenadeInputHeld = true;
}









  


function drawJoysticks() {
  noFill(); stroke(255, 50); ellipse(leftStick.base.x, leftStick.base.y, 120); ellipse(rightStick.base.x, rightStick.base.y, 120);
}



function handleShopClicks(mx, my) {
    let cols = 2, boxW = 96, boxH = 39, spacingX = 110, spacingY = 48;
    let startX = width/2 - (spacingX / 2), startY = height/2 - (spacingY * 2.5); 
    let ninjaPrice = window.ninjaOwned ? 0 : 200, armorPrice = window.armorOwned ? 0 : 200, chemistPrice = window.chemistOwned ? 0 : 200;
    let totalItems = meleeComboUnlocked ? 14 : 13; 
    
    for (let i = 0; i < totalItems; i++) {
        let c = i % cols, r = floor(i / cols), bx = startX + c * spacingX, by = startY + r * spacingY;
        if (mx > bx - boxW/2 && mx < bx + boxW/2 && my > by - boxH/2 && my < by + boxH/2) {
            
            // --- NEW REFILL & EQUIP LOGIC (Indices 0 to 3) ---
            if (i === 0 && score >= 50) { score -= 50; smgUnlocked = true; player.currentWeapon = WEAPONS.SMG; player.mags["MACHINE GUN"] = 3; player.weaponAmmo["MACHINE GUN"] = WEAPONS.SMG.maxAmmo; sfx.reload(); }
            if (i === 1 && score >= 50) { score -= 50; dualSmgUnlocked = true; player.currentWeapon = WEAPONS.DUAL_SMG; player.mags["DUAL SMGS"] = 3; player.weaponAmmo["DUAL SMGS"] = WEAPONS.DUAL_SMG.maxAmmo; sfx.reload(); }
            if (i === 2 && score >= 50) { score -= 50; arUnlocked = true; player.currentWeapon = WEAPONS.ASSAULT_RIFLE; player.mags["ASSAULT RIFLE"] = 3; player.weaponAmmo["ASSAULT RIFLE"] = WEAPONS.ASSAULT_RIFLE.maxAmmo; sfx.reload(); }
            if (i === 3 && score >= 50) { score -= 50; shotgunUnlocked = true; player.currentWeapon = WEAPONS.SHOTGUN; player.mags["SHOTGUN"] = 3; player.weaponAmmo["SHOTGUN"] = WEAPONS.SHOTGUN.maxAmmo; sfx.reload(); }
            
            // --- STANDARD UNLOCK LOGIC ---
            if (i === 6 && !jetpackFireExplosion && score >= 1000) { score -= 1000; jetpackFireExplosion = true; sfx.charge(); }
            if (i === 7 && !jetpackDoubleDash && score >= 1000) { score -= 1000; jetpackDoubleDash = true; sfx.charge(); }
            if (i === 8 && !meleeComboUnlocked && score >= 200 && !explosiveArmorUnlocked && !chemistSuitUnlocked) { score -= 200; meleeComboUnlocked = true; sfx.charge(); }
            if (i === 9 && score >= 1000) { 
                score -= 1000; 
                rocketLauncherUnlocked = true; 
                player.currentWeapon = WEAPONS.ROCKET_LAUNCHER; 
                player.mags["ROCKET LAUNCHER"] = 6; 
                player.weaponAmmo["ROCKET LAUNCHER"] = WEAPONS.ROCKET_LAUNCHER.maxAmmo; 
                sfx.reload(); 
            }
            let nextIdx = 10;
            if (meleeComboUnlocked) { 
                if (i === nextIdx && !window.meleeFinisherUnlocked && score >= 200 && !explosiveArmorUnlocked && !chemistSuitUnlocked) { score -= 200; window.meleeFinisherUnlocked = true; sfx.charge(); } 
                nextIdx++; 
            }
            if (i === nextIdx && !ninjaSuitUnlocked && score >= ninjaPrice) { score -= ninjaPrice; ninjaSuitUnlocked = true; explosiveArmorUnlocked = false; chemistSuitUnlocked = false; isCooking = false; playerGrenades = []; playerFlasks = []; window.ninjaOwned = true; sfx.charge(); } nextIdx++;
            if (i === nextIdx && !explosiveArmorUnlocked && score >= armorPrice) { score -= armorPrice; explosiveArmorUnlocked = true; ninjaSuitUnlocked = false; chemistSuitUnlocked = false; isCooking = false; pGrenadeAmmo = 4; pGrenadeTimer = 0; playerFlasks = []; window.armorOwned = true; sfx.charge(); } nextIdx++;
            if (i === nextIdx && !chemistSuitUnlocked && score >= chemistPrice) { score -= chemistPrice; chemistSuitUnlocked = true; ninjaSuitUnlocked = false; explosiveArmorUnlocked = false; isCooking = false; pFlaskAmmo = 2; pFlaskTimer = 0; playerGrenades = []; window.chemistOwned = true; sfx.charge(); } 
        }
    }
}


// ==========================================
// RESTORED: STANDARD EXPLOSION
// ==========================================

// ==========================================
// RESTORED: MOBILE UPGRADE MENU
// ==========================================
// ==========================================
// RESTORED: MOBILE UPGRADE MENU
// ==========================================
function drawUpgradeMenu() {
    fill(0, 230); rect(0, 0, width, height); 
    
    fill(255); textAlign(CENTER, CENTER); textSize(32); textFont('sans-serif'); 
    text("UPGRADES", width/2, 50);

    fill(255, 200, 0); textSize(20); 
    text("AVAILABLE SCORE: " + score, width/2, 85);

    let ninjaPrice = window.ninjaOwned ? 0 : 200;
    let armorPrice = window.armorOwned ? 0 : 200;
    let chemistPrice = window.chemistOwned ? 0 : 200;
	
    let items = [
        {name: "SMG", state: false, price: 50, isAmmoRefill: true},
        {name: "DUAL SMGS", state: false, price: 50, isAmmoRefill: true},
        {name: "ASSAULT RIFLE", state: false, price: 50, isAmmoRefill: true},
        {name: "SHOTGUN", state: false, price: 50, isAmmoRefill: true},
        {name: "JETPACK", state: jetpackUnlocked, price: 0},
        {name: "MELEE", state: meleeUnlocked, price: 0},
        {name: "FIRE DASH", state: jetpackFireExplosion, price: 1000},
        {name: "DOUBLE DASH", state: jetpackDoubleDash, price: 1000},
        {name: "COMBO MELEE", state: meleeComboUnlocked, price: 200, disabled: explosiveArmorUnlocked}, 
        {name: "ROCKET LAUNCHER", state: false, price: 1000, isAmmoRefill: true} 
    ];
    
    if (meleeComboUnlocked) {
        window.meleeFinisherUnlocked = window.meleeFinisherUnlocked || false;
        items.push({name: "MELEE FINISHER", state: window.meleeFinisherUnlocked, price: 200, disabled: explosiveArmorUnlocked});
    }
    
    items.push({name: "NINJA SUIT", state: ninjaSuitUnlocked, price: ninjaPrice});
    items.push({name: "EXPLOSIVE ARMOR", state: explosiveArmorUnlocked, price: armorPrice}); 
    items.push({name: "CHEMIST SUIT", state: chemistSuitUnlocked, price: chemistPrice});
	
    // --- MOBILE SIZING: 40% SMALLER & RAISED ---
    let cols = 2; 
    let boxW = 96, boxH = 39; 
    let spacingX = 110, spacingY = 48; 
    let startX = width/2 - (spacingX / 2); 
    let startY = height/2 - (spacingY * 2.5); 

    for (let i = 0; i < items.length; i++) {
        let c = i % cols; 
        let r = floor(i / cols);
        let bx = startX + c * spacingX;
        let by = startY + r * spacingY;

        let isAffordable = !items[i].state && items[i].price > 0 && score >= items[i].price && !items[i].disabled;
        let isEquip = !items[i].state && items[i].price === 0 && (items[i].name === "NINJA SUIT" || items[i].name === "EXPLOSIVE ARMOR" || items[i].name === "CHEMIST SUIT");

        // --- UPDATED OUTLINE COLOR LOGIC ---
        if (items[i].isAmmoRefill) {
            if (score >= items[i].price) { fill(40); stroke(255, 200, 0); } else { fill(40); stroke(100); }
        } else if (items[i].state) { fill(40); stroke(50, 255, 50); } 
        else if (items[i].disabled) { fill(40); stroke(150, 50, 50); } 
        else if (isAffordable || isEquip) { fill(40); stroke(255, 200, 0); } 
        else { fill(40); stroke(100); }
        
        strokeWeight(2);
        rect(bx - boxW/2, by - boxH/2, boxW, boxH, 8);

        fill(255); noStroke(); textSize(9); 
        text(items[i].name, bx, by - 8);
        
        textSize(8);
        
        // --- UPDATED TEXT LABEL LOGIC ---
        if (items[i].isAmmoRefill) {
            if (score >= items[i].price) { fill(255, 200, 0); text("REFILL & EQUIP: 50", bx, by + 8); } 
            else { fill(255, 100, 100); text("COST: 50", bx, by + 8); }
        } else if (items[i].state) {
            fill(50, 255, 50); 
            if (items[i].name === "NINJA SUIT" || items[i].name === "EXPLOSIVE ARMOR" || items[i].name === "CHEMIST SUIT") text("EQUIPPED", bx, by + 8);
            else text("UNLOCKED", bx, by + 8);
        } else if (items[i].disabled) {
            fill(255, 50, 50); text("NEEDS NINJA", bx, by + 8);
        } else if (isEquip) {
            fill(255, 200, 0); text("EQUIP (FREE)", bx, by + 8);
        } else if (items[i].price > 0) {
            if (score >= items[i].price) { fill(255, 200, 0); text("BUY: " + items[i].price, bx, by + 8); } 
            else { fill(255, 100, 100); text("COST: " + items[i].price, bx, by + 8); }
        } else {
            fill(150); text("FIND IN WORLD", bx, by + 8);
        }
    }



    // Now safely back inside the function!
    fill(50, 200, 50); stroke(255); strokeWeight(2);
    rect(width/2 - 125, height - 70, 250, 50, 8);
    fill(0); noStroke(); textSize(18);
        text(isPaused ? "RESUME GAME" : "START NEXT LEVEL", width/2, height - 45);
}



function touchStarted() {
  window.showOnScreenControls = true;
  window.isDesktop = false;
  if (!sfx.ctx) sfx.init();

  // Define mx and my FIRST
  let mx = touches.length > 0 ? touches[touches.length - 1].x : mouseX;
  let my = touches.length > 0 ? touches[touches.length - 1].y : mouseY;

  // THEN check the barrier button
  if (window.archBarrierReady) {
      let bbX = width / 2, bbY = height - 100;
      if (mx > bbX - 70 && mx < bbX + 70 && my > bbY - 20 && my < bbY + 20) {
          buildBarrier(); return false;
      }
  }

  // --- NEW: CLOSE NM-0 OVERLAY ---
  if (window.inNM0SecretOverlay) {

      window.inNM0SecretOverlay = false;
      sfx.charge();
      return false;
  }

  // --- NEW: LEVEL 1 ENTER NM-0 HQ ---
  if (currentLevel === 1 && window.nm0AmbushClearedStatus && !killcamMode && !inTownCutscene && !inPostAmbushCutscene) {
      let nGate = buildings.find(b => b.isGovFortress && b.y < 0);
      if (nGate && nGate.hp <= 0 && dist(player.x, player.y, nGate.x, nGate.y + nGate.h/2) < 250 && isClickingBtn(mx, my)) {
          startAtLevel(8);
          sfx.charge();
          return false;
      }
  }

  // --- NEW: LEVEL 8 INTERACTIONS ---
  if (currentLevel === 8 && !killcamMode && !isPaused) {
      // 1. ENTER ROOM
      if (window.nm0HqCleared && dist(player.x, player.y, 0, -800) < 250 && player.y > -1000 && isClickingBtn(mx, my)) {
          player.y = -1100; // Teleport safely inside the room
          camY = player.y - (height / 2) / zoom;
          sfx.charge(); 
          return false;
      }
      // 2. EXIT ROOM
      if (dist(player.x, player.y, 0, -800) < 250 && player.y <= -1000 && isClickingBtn(mx, my)) {
          player.y = -500; // Teleport safely outside the room
          camY = player.y - (height / 2) / zoom;
          sfx.charge(); 
          return false;
      }
      // 3. PICK UP BLUEPRINT
      if (dist(player.x, player.y, 0, -2000) < 200 && !window.armorBlueprintPickedUp && isClickingBtn(mx, my)) {
          window.armorBlueprintPickedUp = true;
          window.inNM0SecretOverlay = true;
          sfx.charge(); 
          return false;
      }
         // 4. EXIT BUILDING TO NORTH GATE
      if (dist(player.x, player.y, 0, 1450) < 250 && isClickingBtn(mx, my)) {
          // MUST grab blueprint first
          if (!window.armorBlueprintPickedUp) {
              streakMsgText = "GET THE BLUEPRINT FIRST!";
              streakMsgTimer = 120;
              sfx.hitArmor();
              return false;
          }

          startAtLevel(1, true); 
          
          // Force player to spawn right outside the North Gate!
          player.x = 600;
          player.y = -3500;
          player.aimAngle = HALF_PI; // Face downward
          camX = player.x - (width / 2) / zoom;
          camY = player.y - (height / 2) / zoom;

          // Trigger Map Progression sequence
          window.northGateBreached = true;

          // Queue the Government Directive / Overworld sequence
          if (!townsData[1] || !townsData[1].established) {
              // Set population based on Route
              if (window.genocideRouteActive || window.genocideAmbushCleared) {
                  popTotal = window.militaryToBring || 0; // Stick population destroyed
              } else {
                  popTotal = Math.max(10, popTotal); // Savior route gets survivors
              }
              
              popUnassigned = 0; popTotal;
              popFarming = 0; popScience = 0; popArchitecture = 0; popUnassigned = popTotal;
popMilitary = 0;
              
              viewingTownId = 1;
              if (!townsData[1]) townsData[1] = {established: false};
              
              inWorldBuildingMenu = true;
          } else {
              inOverworldView = true;
          }

          sfx.charge(); 
          return false;
      }


  }

  if (isPaused) {

      if (millis() - window.lastPauseTime < 300) return false; 
      let btnX = width/2 - 120, btnW = 240;

                                  if (pauseMenuState === "MAIN") {
              if (mx > btnX && mx < btnX + btnW) {
                  if (my > height/2 - 210 && my < height/2 - 170) { isPaused = false; window.lastPauseTime = millis(); return false; } 
                  if (my > height/2 - 160 && my < height/2 - 120) { saveGame(); isPaused = false; window.lastPauseTime = millis(); return false; } 
                  
                  // --- NEW TOGGLE HITBOX ---
                 // --- MELEE SWORD TOGGLE BUTTON ---
else if (mx > width/2 - 120 && mx < width/2 + 120 && my > height/2 - 110 && my < height/2 - 70) {
    if (typeof swordPickedUp !== 'undefined' && swordPickedUp) { 
        // Only flip the switch if they actually own the sword!
        window.swordEquipped = (window.swordEquipped === false) ? true : false;
        
        // If you have a click sound, uncomment the next line:
        // sfx.click(); 
    }
}

                  
                  if (my > height/2 - 60 && my < height/2 - 20) { pauseMenuState = "GOV_DIRECTIVE"; return false; }
                  
                  if (my > height/2 - 10 && my < height/2 + 30) { 
                      if (typeof townsData !== 'undefined' && townsData[currentLevel] && townsData[currentLevel].established) {
                          inOverworldView = !inOverworldView;
                          isPaused = false;
                          window.lastPauseTime = millis();
                      }
                      return false; 
                  } 
                  
                  if (my > height/2 + 40 && my < height/2 + 80) { pauseMenuState = "SHOP"; return false; } 
                  if (my > height/2 + 90 && my < height/2 + 130) { pauseMenuState = "TABLET"; return false; } 
                  
                  if ((window.towersDefeated || (isStoryMode && currentLevel >= 2)) && my > height/2 + 140 && my < height/2 + 180) { 
                      pauseMenuState = "SQUAD"; return false; 
                  }
                  
                  if (my > height/2 + 190 && my < height/2 + 230) { 
                      isPaused = false; started = false; isStoryMode = false;
                      inStoryRoom = false; inStoryIntro = false; prologuePhase = 0;
                      inUpstairsRoom = false; journalRead = false; sfx.charge(); return false; 
                  }
              }
          

            } else if (pauseMenuState === "SQUAD") {

          if (mx > btnX && mx < btnX + btnW) {
              if (my > height / 2 - 90 && my < height / 2 - 50) { issueSquadCommand("FOLLOW"); return false; }
              if (my > height / 2 - 30 && my < height / 2 + 10) { pauseMenuState = "SQUAD_SEARCH"; return false; }
              if (my > height / 2 + 30 && my < height / 2 + 70) { issueSquadCommand("SPREAD"); return false; }
              if (my > height / 2 + 90 && my < height / 2 + 130) { issueSquadCommand("HOLD"); return false; }
              if (my > height / 2 + 150 && my < height / 2 + 190) { pauseMenuState = "MAIN"; return false; }
          }
      } else if (pauseMenuState === "SQUAD_SEARCH") {
          if (mx > btnX && mx < btnX + btnW) {
              if (my > height / 2 - 90 && my < height / 2 - 50) { issueSquadCommand("SEARCH", "NORTH"); return false; }
              if (my > height / 2 - 30 && my < height / 2 + 10) { issueSquadCommand("SEARCH", "SOUTH"); return false; }
              if (my > height / 2 + 30 && my < height / 2 + 70) { issueSquadCommand("SEARCH", "EAST"); return false; }
              if (my > height / 2 + 90 && my < height / 2 + 130) { issueSquadCommand("SEARCH", "WEST"); return false; }
              if (my > height / 2 + 150 && my < height / 2 + 190) { pauseMenuState = "SQUAD"; return false; }
          }
      } else if (pauseMenuState === "GOV_DIRECTIVE") {
                   // ONLY ESTABLISH BUTTON REMAINS HERE
          if (mx > width/2 - 120 && mx < width/2 + 120 && my > height - 90 && my < height - 40) {
              if (popUnassigned === 0) { 
                  // RE-POPULATE: Clear old ones
                  townCitizens = []; 
                  
                  // Spawn specific genders per department!
                  for (let i = 0; i < window.popFarmingM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "FARMING", "MALE"));
                  for (let i = 0; i < window.popFarmingF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "FARMING", "FEMALE"));
                  
                  for (let i = 0; i < window.popMilitaryM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "MILITARY", "MALE"));
                  for (let i = 0; i < window.popMilitaryF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "MILITARY", "FEMALE"));
                  
                  for (let i = 0; i < window.popScienceM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "SCIENCE", "MALE"));
                  for (let i = 0; i < window.popScienceF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "SCIENCE", "FEMALE"));
                  
                  for (let i = 0; i < window.popArchitectureM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "ARCHITECTURE", "MALE"));
                  for (let i = 0; i < window.popArchitectureF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "ARCHITECTURE", "FEMALE"));

                  saveTownData(viewingTownId);
                  townsData[viewingTownId].established = true;
                  
                  if (inWorldBuildingMenu) {
                      inWorldBuildingMenu = false;
                      inOverworldView = true; 
                  } else {
                      pauseMenuState = "MAIN";
                  }
                  
                  sfx.charge();
                  return false; 
              }
          }
          return false;
}

      
      else if (pauseMenuState === "SHOP") {
          // The Shop ONLY handles shop clicks and the back button
          if (mx > width/2 - 125 && mx < width/2 + 125 && my > height - 70 && my < height - 20) { 
              pauseMenuState = "MAIN"; 
              return false; 
          }
          handleShopClicks(mx, my); 
          return false;
      } 
      else if (pauseMenuState === "TABLET") {

          if (mx > btnX && mx < btnX + btnW) {
              if (my > height/2 - 90 && my < height/2 - 45) { pauseMenuState = "AUGMENTS"; return false; }
              if (my > height/2 - 30 && my < height/2 + 15) { pauseMenuState = "WEAPONS"; return false; }
              if (my > height/2 + 30 && my < height/2 + 75) { journalRead = true; pauseMenuState = "JOURNAL"; return false; }
              if (my > height/2 + 90 && my < height/2 + 135) { pauseMenuState = "MAIN"; return false; } 
          }
      } else { 
          // For AUGMENTS, WEAPONS, JOURNAL (Fallback "BACK" button logic)
          if (mx > btnX && mx < btnX + btnW && my > height/2 + 120 && my < height/2 + 165) { pauseMenuState = "TABLET"; return false; }
      }
      return false; 
  }


    if (inTownCutscene) {
      if (townPhase >= 3 && townPhase <= 5) { townPhase++; sfx.charge(); }
      return false;
  }
  
    // ADD THIS EXACTLY HERE:
  if (typeof inFarmCutscene !== 'undefined' && inFarmCutscene) {
      if (farmPhase === 2) {
          farmPhase = 3; sfx.charge();
      } else if (farmPhase === 3) {
          // A Choice
          if (mx > width/2 - 160 && mx < width/2 + 160 && my > height/2 - 65 && my < height/2 - 15) {
              farmPhase = 4; sfx.charge();
          } 
          // B Choice
          else if (mx > width/2 - 210 && mx < width/2 + 210 && my > height/2 + 15 && my < height/2 + 65) {
              inFarmCutscene = false;
              for (let e of enemiesList) {
                  if (e.eType === "FARMER_MALE" || e.eType === "FARMER_FEMALE") {
                      e.isNeutral = false; e.isFriendly = false; e.state = "CHASE";
                  }
              }
              streakMsgText = "FARMERS AGGROED!"; streakMsgTimer = 90; sfx.charge();
          }
      } else if (farmPhase === 4) {
          farmPhase = 5; sfx.charge();
      } else if (farmPhase === 5) {
          // YES Choice
          if (mx > width/2 - 130 && mx < width/2 - 30 && my > height/2 + 15 && my < height/2 + 65) {
              inFarmCutscene = false; triggerBugAmbush(); sfx.charge();
          } 
          // NO Choice
          else if (mx > width/2 + 30 && mx < width/2 + 130 && my > height/2 + 15 && my < height/2 + 65) {
              inFarmCutscene = false; sfx.charge();
          }
      }
      return false; // <-- CRITICAL: This bracket now safely closes the block!
  }

    // --- LEVEL 3: POST-FARM TAP LOGIC ---
 // ==========================================
// 1. FARM POST CUTSCENE
// ==========================================
if (typeof inFarmPostCutscene !== 'undefined' && inFarmPostCutscene) {
    if (farmPostPhase === 1) {
        farmPostPhase = 2;
        window.farmerBlueprintUnlocked = true;
        if (typeof sfx !== 'undefined' && sfx.charge) sfx.charge();
    } else if (farmPostPhase === 2) {
        inFarmPostCutscene = false;
        
        // STRICT FILTER: Only count actual Farmers
        let survivingFarmers = enemiesList.filter(e => 
            (e.eType === "FARMER_MALE" || e.eType === "FARMER_FEMALE") && 
            e.hp > 0 && 
            !e.dead
        );
        
        popTotal = survivingFarmers.length + (window.militaryToBring || 0);
        popUnassigned = survivingFarmers.length; 
        
        viewingTownId = currentLevel;

        if (!townsData[currentLevel]) {
            townsData[currentLevel] = {
                established: false, popTotal: 0, popUnassigned: 0, popFarming: 0, 
                popMilitary: 0, popScience: 0, popArchitecture: 0,
                statVit: 1, statMen: 1, statPhy: 1, statObe: 1, statInt: 1
            };
        }
        
        if (!townsData[currentLevel].established) {
            popTotal = popTotal > 0 ? popTotal : 10; 
            popUnassigned = popTotal; 
            inWorldBuildingMenu = true; 
        } else {
            if (typeof loadTownData === 'function') loadTownData(currentLevel);
            inOverworldView = true;
        }
        if (typeof sfx !== 'undefined' && sfx.charge) sfx.charge();
    }
    return false; 
}

// ==========================================
// 2. POST AMBUSH CUTSCENE (Merged)
// ==========================================
else if (typeof inPostAmbushCutscene !== 'undefined' && inPostAmbushCutscene) {
    if (postAmbushPhase >= 1 && postAmbushPhase < 7) { 
        postAmbushPhase++; 
    }   
    else if (postAmbushPhase === 7) { 
        postAmbushPhase = 0;
        inPostAmbushCutscene = false; 
        window.postAmbushCutscenePlayed = true; 
        
        // Removed the destructive popMilitary = 0 overrides here!
        // The Gov Directive menu handles the math safely now.
        
        viewingTownId = currentLevel;
        if (!townsData[currentLevel]) townsData[currentLevel] = {established: false};
        
        inWorldBuildingMenu = true;
        if (typeof sfx !== 'undefined' && sfx.charge) sfx.charge();
    }
    return false;
}

// ==========================================
// 3. GOV DIRECTIVE MENU -> OVERWORLD (Merged)
// ==========================================
else if (typeof inWorldBuildingMenu !== 'undefined' && inWorldBuildingMenu) {
    if (mx > width/2 - 120 && mx < width/2 + 120 && my > height - 90 && my < height - 40) {
        if (popUnassigned === 0) { 
            inWorldBuildingMenu = false;
            
            let targetId = (typeof viewingTownId !== 'undefined') ? viewingTownId : currentLevel;
            
            // A. Safely mark town as established and save
            if (typeof townsData !== 'undefined') {
                if (!townsData[targetId]) townsData[targetId] = {};
                townsData[targetId].established = true;
            }
            if (typeof saveTownData === 'function') saveTownData(targetId);
            
            // B. Physically spawn the gender-accurate citizens
            townCitizens = []; 
            for (let i = 0; i < window.popFarmingM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "FARMING", "MALE"));
            for (let i = 0; i < window.popFarmingF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "FARMING", "FEMALE"));
            
            for (let i = 0; i < window.popMilitaryM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "MILITARY", "MALE"));
            for (let i = 0; i < window.popMilitaryF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "MILITARY", "FEMALE"));
            
            for (let i = 0; i < window.popScienceM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "SCIENCE", "MALE"));
            for (let i = 0; i < window.popScienceF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "SCIENCE", "FEMALE"));
            
            for (let i = 0; i < window.popArchitectureM; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "ARCHITECTURE", "MALE"));
            for (let i = 0; i < window.popArchitectureF; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "ARCHITECTURE", "FEMALE"));

            inOverworldView = true; 
            if (typeof sfx !== 'undefined' && sfx.charge) sfx.charge();
            return false; 
        }
    }
}

// ==========================================
// 4. OVERWORLD -> TRAVEL MENU
// ==========================================
else if (typeof inOverworldView !== 'undefined' && inOverworldView) {
    for(let t = 1; t <= currentLevel; t++) {
        let tx = width/2 - 150 + (t-1)*300;
        let ty = height/2;
        if (dist(mx, my, tx, ty) < 45) {
            if (typeof saveTownData === 'function') saveTownData(viewingTownId);
            if (typeof loadTownData === 'function') loadTownData(t);
            inOverworldView = false;
            inWorldBuildingMenu = true;
            if (typeof sfx !== 'undefined' && sfx.charge) sfx.charge();
            return false;
        }
    }

    if (mx > width/2 - 120 && mx < width/2 + 120 && my > height - 90 && my < height - 40) {
        if (typeof saveTownData === 'function') saveTownData(viewingTownId);
        inOverworldView = false;
        inTravelMenu = true;
        travelDirection = null;
        militaryToBring = 0;
        if (typeof sfx !== 'undefined' && sfx.charge) sfx.charge();
        return false; 
    }
}

// --- NEW TRAVEL MENU HITBOXES ---
else if (inTravelMenu) {
    if (!travelDirection) {
          if (window.northGateBreached && mx > width/2 - 150 && mx < width/2 + 150 && my > 200 && my < 260) {
              travelDirection = "NORTH"; sfx.charge();
          }
          if (mx > width/2 - 150 && mx < width/2 + 150 && my > 320 && my < 380) {
              travelDirection = "SOUTH"; sfx.charge();
          }
      } else {
          // Male Military +/-
          if (mx > width/2 - 120 && mx < width/2 - 95 && my > 270 && my < 300 && window.militaryToBringM > 0) { window.militaryToBringM--; sfx.hitArmor(); }
          if (mx > width/2 + 110 && mx < width/2 + 135 && my > 270 && my < 300 && window.militaryToBringM < window.popMilitaryM) { window.militaryToBringM++; sfx.reload(); }
          
          // Female Military +/-
          if (mx > width/2 - 120 && mx < width/2 - 95 && my > 330 && my < 360 && window.militaryToBringF > 0) { window.militaryToBringF--; sfx.hitArmor(); }
          if (mx > width/2 + 110 && mx < width/2 + 135 && my > 330 && my < 360 && window.militaryToBringF < window.popMilitaryF) { window.militaryToBringF++; sfx.reload(); }

          // DEPART BUTTON
          if (mx > width/2 - 120 && mx < width/2 + 120 && my > height - 90 && my < height - 40) {
              inTravelMenu = false;
              townCitizens = []; // Free memory
              isWin = true; 
              winTimer = 1;
              sfx.charge();
          }
          // BACK BUTTON
          if (mx > width/2 - 50 && mx < width/2 + 50 && my > height - 40 && my < height) {
              travelDirection = null; sfx.charge();
          }
      }
      return false;
            }
        
    



  // --- LEVEL 4 CUTSCENE TAPS ---
  if (typeof inLvl4Cutscene !== 'undefined' && inLvl4Cutscene) {
      if (lvl4Phase === 3) {
          lvl4Phase = 4; sfx.charge();
      } else if (lvl4Phase === 4) {
          // A Choice
          if (mx > width/2 - 320 && mx < width/2 + 320 && my > height/2 - 65 && my < height/2 - 15) {
              lvl4Phase = 5; sfx.charge();
          } 
          // B Choice (Hostile Route)
          else if (mx > width/2 - 240 && mx < width/2 + 240 && my > height/2 + 15 && my < height/2 + 65) {
              inLvl4Cutscene = false;
              for (let e of enemiesList) {
                  if (e.eType === "MILITARY_NEUTRAL") {
                      e.isNeutral = false; e.isFriendly = false; e.state = "CHASE"; e.loseSightTimer = 3500;
                  }
              }
              streakMsgText = "MILITARY AGGROED!"; streakMsgTimer = 90; sfx.charge();
          }
      } else if (lvl4Phase === 5) {
          inLvl4Cutscene = false;
          // Assign them as your permanent allies
          for (let e of enemiesList) {
              if (e.eType === "MILITARY_NEUTRAL") {
                  e.isNeutral = false;
                  e.isFriendly = true;
                  e.baseState = "HOLD_PERIMETER"; 
                  e.holdPos = { x: e.x, y: e.y };
              }
          }
          triggerLvl4Ambush();
          sfx.charge();
      }
      return false;
  }

// V V V V V START HIGHLIGHTING HERE V V V V V 
if (inOverworldView) {
    // Check if clicking a Town Node to manage it
    for(let t = 1; t <= currentLevel; t++) {
        let tx = width/2 - 150 + (t-1)*300;
        let ty = height/2;
        if (dist(mx, my, tx, ty) < 45) {
            saveTownData(viewingTownId);
            loadTownData(t);
            inOverworldView = false;
            inWorldBuildingMenu = true;
            sfx.charge();
            return false;
        }
    }
   // TRAVEL Button (Bottom Right) -> Opens Travel Menu
    if (mx > width - 220 && mx < width - 20 && my > height - 80 && my < height - 30) {
        saveTownData(viewingTownId);
        inOverworldView = false;
        inTravelMenu = true;
        travelDirection = null;
        militaryToBring = 0;
        sfx.charge();
        return false; 
    }
}
// ^ ^ ^ ^ ^ STOP HIGHLIGHTING HERE ^ ^ ^ ^ ^

// --- NEW TRAVEL MENU HITBOXES ---
if (inTravelMenu) {
    if (!travelDirection) {
          if (window.northGateBreached && mx > width/2 - 150 && mx < width/2 + 150 && my > 200 && my < 260) {
              travelDirection = "NORTH"; sfx.charge();
          }
          if (mx > width/2 - 150 && mx < width/2 + 150 && my > 320 && my < 380) {
              travelDirection = "SOUTH"; sfx.charge();
          }
      } else {
          // Male Military +/-
          if (mx > width/2 - 120 && mx < width/2 - 95 && my > 270 && my < 300 && window.militaryToBringM > 0) { window.militaryToBringM--; sfx.hitArmor(); }
          if (mx > width/2 + 110 && mx < width/2 + 135 && my > 270 && my < 300 && window.militaryToBringM < window.popMilitaryM) { window.militaryToBringM++; sfx.reload(); }
          
          // Female Military +/-
          if (mx > width/2 - 120 && mx < width/2 - 95 && my > 330 && my < 360 && window.militaryToBringF > 0) { window.militaryToBringF--; sfx.hitArmor(); }
          if (mx > width/2 + 110 && mx < width/2 + 135 && my > 330 && my < 360 && window.militaryToBringF < window.popMilitaryF) { window.militaryToBringF++; sfx.reload(); }

          // DEPART BUTTON
          if (mx > width/2 - 120 && mx < width/2 + 120 && my > height - 90 && my < height - 40) {
              inTravelMenu = false;
              townCitizens = []; // Free memory
              isWin = true; 
              winTimer = 1;
              sfx.charge();
          }
          // BACK BUTTON
          if (mx > width/2 - 50 && mx < width/2 + 50 && my > height - 40 && my < height) {
              travelDirection = null; sfx.charge();
          }
      }
      return false;
  }




 
	if (inDarchonCall) {
      callPhase++; sfx.charge();
      
      // NEW: Set the timer for 300 frames (5 seconds) every tap
      darchonTalkTimer = 300; 
      
      if (callPhase > 15) { inDarchonCall = false; }
      return false;
  }

  if (isStoryMode && !inStoryRoom && inStoryIntro) {
      inStoryIntro = false; inStoryRoom = true; storyPhase = 1; dadX = -50; return false;
  }

  if (inStoryRoom) {
      if (storyPhase >= 2 && storyPhase < 22) { storyPhase++; } 
      else if (storyPhase >= 22) { inStoryRoom = false; startAtLevel(0); }
      return false;
  }
  
  if (currentLevel === 0 && !killcamMode) {
      if (inUpstairsRoom) {
          if (upstairsPhase === 1) { upstairsPhase = 2; return false; }
          else if (upstairsPhase === 2) { upstairsPhase = 0; return false; } 
          else if (upstairsPhase === 3) { upstairsPhase = 4; return false; }
          else if (upstairsPhase === 4) { upstairsPhase = 5; return false; }
          else if (upstairsPhase === 5) { upstairsPhase = 0; return false; } 

                    if (upstairsPhase === 0) {
              if (!swordPickedUp && dist(player.x, player.y, 150, 0) < 80 && isClickingBtn(mx, my)) {
                  swordPickedUp = true; hasSword = true; meleeUnlocked = true; meleeComboUnlocked = true; upstairsPhase = 1; 
                  if (player) player.isArmed = true; 
                  sfx.charge(); return false;
              }


              if (!tvWatched && dist(player.x, player.y, 0, -200) < 120 && isClickingBtn(mx, my)) {
                  tvWatched = true; upstairsPhase = 3; sfx.charge(); return false;
              }
              if (dist(player.x, player.y, 0, 250) < 80 && isClickingBtn(mx, my)) {
                  startAtLevel(1); return false;
              }
          }
      } else {
          if (prologuePhase >= 4 && prologuePhase <= 5) { prologuePhase++; return false; } 
          else if (prologuePhase === 6) { prologuePhase = 7; return false; }
          if (prologuePhase === 8) { prologuePhase = 9; return false; }
          else if (prologuePhase === 9) { prologuePhase = 10; return false; }
            if (inFarmCutscene) {
      if (farmPhase === 2) {
          farmPhase = 3; sfx.charge();
      } else if (farmPhase === 3) {
          // A Choice
          if (mx > width/2 - 160 && mx < width/2 + 160 && my > height/2 - 65 && my < height/2 - 15) {
              farmPhase = 4; sfx.charge();
          } 
          // B Choice
          else if (mx > width/2 - 210 && mx < width/2 + 210 && my > height/2 + 15 && my < height/2 + 65) {
              inFarmCutscene = false;
              for (let e of enemiesList) {
                  if (e.eType === "FARMER_MALE" || e.eType === "FARMER_FEMALE") {
                      e.isNeutral = false; e.isFriendly = false; e.state = "CHASE";
                  }
              }
              streakMsgText = "FARMERS AGGROED!"; streakMsgTimer = 90; sfx.charge();
          }
      } else if (farmPhase === 4) {
          farmPhase = 5; sfx.charge();
      } else if (farmPhase === 5) {
          // YES Choice
          if (mx > width/2 - 130 && mx < width/2 - 30 && my > height/2 + 15 && my < height/2 + 65) {
              inFarmCutscene = false; triggerBugAmbush(); sfx.charge();
          } 
          // NO Choice
          else if (mx > width/2 + 30 && mx < width/2 + 130 && my > height/2 + 15 && my < height/2 + 65) {
              inFarmCutscene = false; sfx.charge();
          }
      }
      return false;
  }

          if (prologuePhase === 7 && !tabletPickedUp) {
              if (dist(player.x, player.y, 200, -100) < 80 && isClickingBtn(mx, my)) {
                  tabletPickedUp = true; prologuePhase = 8; sfx.charge(); return false;
              }
          }
          if (prologuePhase >= 10) {
              if (dist(player.x, player.y, -400, 0) < 80 && isClickingBtn(mx, my)) {
                  inUpstairsRoom = true; player.x = 0; player.y = 150; player.aimAngle = -HALF_PI;
                  corpses = []; splatters = []; bullets = []; particles = [];
                  clearAllBlood();
				  generateMap(); sfx.charge(); return false;
              }
          }
      }
  }



       if (!started) {
      if (!selectingDifficulty) {
          let startX = width / 2 - 175;
          for (let i = 1; i <= 7; i++) {
            let bx = startX + (i - 1) * 60; let by = height / 2 - 50;
            if (mx >= bx && mx <= bx + 50 && my >= by && my <= by + 50) { pendingLevel = i; pendingStoryMode = false; selectingDifficulty = true; sfx.charge(); return false; }
          }
          
          if (mx > width / 2 - 100 && mx < width / 2 + 100) {
              if (my > height / 2 + 20 && my < height / 2 + 70) { pendingLevel = 1; pendingStoryMode = false; selectingDifficulty = true; sfx.charge(); return false; }
              if (my > height / 2 + 80 && my < height / 2 + 130) { pendingLevel = 1; pendingStoryMode = true; selectingDifficulty = true; sfx.charge(); return false; }
              
              if (localStorage.getItem('urbanTwinStickSave') !== null && my > height / 2 + 140 && my < height / 2 + 190) {
                  started = true;
                  loadGame();
                  if (sfx.bgm && sfx.bgm.paused) sfx.bgm.play().catch(e => console.log(e));
                  if (sfx.ctx && sfx.ctx.state === 'suspended') sfx.ctx.resume();
                  return false;
              }
          }
      } else {
          if (mx > width / 2 - 150 && mx < width / 2 + 150) {
              if (my > height / 2 - 30 && my < height / 2 + 30) { 
                  isHardMode = false; started = true; isStoryMode = pendingStoryMode; 
                  if (isStoryMode) { inStoryIntro = true; introScrollY = height; }
                  startAtLevel(pendingLevel);
                  if (sfx.bgm && sfx.bgm.paused) sfx.bgm.play().catch(e => console.log(e));
                  if (sfx.ctx && sfx.ctx.state === 'suspended') sfx.ctx.resume();
                  return false; 
              }
              if (my > height / 2 + 45 && my < height / 2 + 105) { 
                  isHardMode = true; started = true; isStoryMode = pendingStoryMode; 
                  if (isStoryMode) { inStoryIntro = true; introScrollY = height; }
                  startAtLevel(pendingLevel);
                  if (sfx.bgm && sfx.bgm.paused) sfx.bgm.play().catch(e => console.log(e));
                  if (sfx.ctx && sfx.ctx.state === 'suspended') sfx.ctx.resume();
                  return false; 
              }
          }
          if (mx > width / 2 - 100 && mx < width / 2 + 100 && my > height / 2 + 115 && my < height / 2 + 155) { selectingDifficulty = false; sfx.charge(); return false; }
      }
      return false;
  }

    if (isWin) { 
      if (winTimer > 0) return false; 
      if (currentLevel < 7 || currentLevel === 8) { 
          if (inUpgradeMenu) {
              if (mx > width/2 - 125 && mx < width/2 + 125 && my > height - 70 && my < height - 20) { 
                  if (travelDirection === "NORTH") startAtLevel(5);
                  else if (currentLevel === 8) startAtLevel(2); 
                  else nextLevel(); 
                  return false; 
              }
              handleShopClicks(mx, my);
              return false;
          } else {
              let accMult = max(1, floor((totalShotsFired > 0 ? floor((totalShotsHit / totalShotsFired) * 100) : 0) / 10));
              if (mx > width/2 - 170 && mx < width/2 - 10 && my > height/2 + 90 && my < height/2 + 140) { if (totalShotsFired > 0) score = score * accMult; totalShotsFired = 0; inUpgradeMenu = true; return false; }
              if (mx > width/2 + 10 && mx < width/2 + 170 && my > height/2 + 90 && my < height/2 + 140) { 
                  if (totalShotsFired > 0) score = score * accMult; 
                  totalShotsFired = 0; 
                  if (travelDirection === "NORTH") startAtLevel(5);
                  else if (currentLevel === 8) startAtLevel(2); 
                  else nextLevel(); 
                  return false; 
              }
              return false;
          }
      } else { restartGame(); return false; }
  }

  return false;
}




fill(255, 0, 0); textSize(30); text("PHASE: " + prologuePhase, 50, 50);




function handleDesktop() {
  if (!player) return;
  
  let kDx = 0, kDy = 0;
  if (keyIsDown(65)) kDx -= 1; 
  if (keyIsDown(68)) kDx += 1; 
  if (keyIsDown(87)) kDy -= 1; 
  if (keyIsDown(83)) kDy += 1; 
  
  if (kDx !== 0 || kDy !== 0) {
      let mag = dist(0, 0, kDx, kDy);
      leftStick.active = true;
      leftStick.dx = kDx / mag;
      leftStick.dy = kDy / mag;
      window.isDesktop = true; 
  }
  if (keyIsDown(69) && meleeUnlocked) meleeInputHeld = true; 

  if (window.isDesktop) {
      let worldMouseX = (mouseX / zoom) + camX;
      let worldMouseY = (mouseY / zoom) + camY;
      
      let aimDx = worldMouseX - player.x;
      let aimDy = worldMouseY - player.y;
      let aimMag = dist(0, 0, aimDx, aimDy);
      
      if (aimMag > 0) {
          rightStick.active = true;
          rightStick.dx = aimDx / aimMag;
          rightStick.dy = aimDy / aimMag;
          rightStick.dist = (mouseIsPressed && mouseButton === LEFT) ? 1.0 : 0.0;
      }
  }
}

function mousePressed() {
    if (touches.length === 0) touchStarted();
}

function drawSpeechBubble(x, y, txt) {
    push();
    
    // Check if Darchon is talking
    let isDarchon = txt.startsWith("[TABLET]");
    // Strip the "[TABLET]" tag out so it doesn't show in the actual bubble
    let displayText = isDarchon ? txt.replace("[TABLET] ", "") : txt;

    textFont('sans-serif'); textSize(14); textAlign(CENTER, CENTER); textLeading(18);
    let lines = displayText.split('\n');
    let maxW = 0;
    for (let l of lines) { let w = textWidth(l); if (w > maxW) maxW = w; }
    
    let h = lines.length * 18 + 20;
    let w = maxW + 30;
    let portraitSize = 0;

    // Expand the bubble width if Darchon is talking to fit the image
    if (isDarchon) {
        portraitSize = h; 
        w += portraitSize + 10; 
    }

    fill(255); stroke(0); strokeWeight(2);
    rect(x - w/2, y - h/2 - 10, w, h, 10);
    triangle(x, y + h/2 - 10, x - 10, y + h/2 - 10, x - 20, y + h/2 + 10); 

        // Draw and animate the portrait
    if (isDarchon && darchonFrames.length > 0 && darchonFrames[0] !== undefined) {
        let imgSize = portraitSize - 10;
        let imgX = x - w/2 + 5;
        let imgY = y - h/2 - 5;

        let currentFrame = darchonFrames[0]; // Default to idle

        if (typeof darchonTalkTimer !== 'undefined' && darchonTalkTimer > 0) {
            darchonTalkTimer--;
            
            // Cycle through frames 1, 2, and 3 every 5 frames
            let frameIndex = 1 + floor((frameCount % 15) / 5); 
            if (darchonFrames[frameIndex]) {
                currentFrame = darchonFrames[frameIndex];
            }
        }

        image(currentFrame, imgX, imgY, imgSize, imgSize);
    }


    fill(0); noStroke();
    // Shift text to the right so it doesn't overlap the image
    let textX = isDarchon ? x + (portraitSize / 2) : x;
    text(displayText, textX, y - 10);
    
    pop();
}

// --- NEW HELPER FUNCTIONS FOR CONTEXT PROMPTS ---
function drawPromptBtn(txt) {
    fill(255, 200, 0); stroke(200, 100, 0); strokeWeight(2);
    rect(width/2 - 70, height - 120, 140, 50, 8);
    fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(18); textFont('sans-serif');
    text(txt, width/2, height - 95);
}

function isClickingBtn(mx, my) {
    return (mx > width/2 - 70 && mx < width/2 + 70 && my > height - 120 && my < height - 70);
}

			// ==========================================
// PREVENT MOBILE PULL-TO-REFRESH & SCROLLING
// ==========================================
document.addEventListener('touchmove', function(e) { 
    e.preventDefault(); 
}, { passive: false });

function touchMoved() {
    return false;
}
function saveGame() {
    let state = {
        currentLevel, isStoryMode, score, totalKills,
        smgUnlocked, dualSmgUnlocked, shotgunUnlocked, arUnlocked, rocketLauncherUnlocked, taserUnlocked,
        jetpackUnlocked, meleeUnlocked, jetpackFireExplosion, jetpackDoubleDash, meleeComboUnlocked, meleeFinisherUnlocked: window.meleeFinisherUnlocked,
        ninjaSuitUnlocked, explosiveArmorUnlocked, chemistSuitUnlocked, ninjaOwned: window.ninjaOwned, armorOwned: window.armorOwned, chemistOwned: window.chemistOwned,
        grenadesUnlocked, pGrenadeAmmo, pFlaskAmmo,
        popTotal, popUnassigned, popFarming, popMilitary, popScience, popArchitecture,
        journalRead, tabletPickedUp, swordPickedUp,
        towersDefeated: window.towersDefeated, 
        nm0AmbushCleared: window.nm0AmbushCleared,
                farmXP: window.farmXP || 0, milXP: window.milXP || 0, sciXP: window.sciXP || 0, archXP: window.archXP || 0,
        farmLvl: window.farmLvl || 1, milLvl: window.milLvl || 1, sciLvl: window.sciLvl || 1, archLvl: window.archLvl || 1,

        inTownCutscene, townPhase, townTimer, 
        nm0AmbushActive, nm0AmbushKills, objectiveTimer,
        inPostAmbushCutscene, postAmbushPhase, 
        inWorldBuildingMenu, inOverworldView,
        statVit, statMen, statPhy, statObe, statInt, 
        darchonCallCompleted,
        militaryToBring: window.militaryToBring,
        playerHp: player ? player.hp : 100,
        playerShield: player ? player.shield : 100,
        playerX: player ? player.x : null,
        playerY: player ? player.y : null,
        militaryToBringM: window.militaryToBringM,
militaryToBringF: window.militaryToBringF,

        // --- NEW FOR TOWN PERSISTENCE ---
        townsData: typeof townsData !== 'undefined' ? townsData : null,
        viewingTownId: typeof viewingTownId !== 'undefined' ? viewingTownId : 1
    };
    localStorage.setItem('urbanTwinStickSave', JSON.stringify(state));
    streakMsgText = "GAME SAVED!";
    streakMsgTimer = 90;
}

function loadGame() {
    let saved = localStorage.getItem('urbanTwinStickSave');
    if (saved) {
        let state = JSON.parse(saved);
        isStoryMode = state.isStoryMode;
        
        startAtLevel(state.currentLevel, true); // true = skip hard reset
        
        // --- CRITICAL FIX: Restore flags AFTER startAtLevel so they don't get overwritten! ---
        window.towersDefeated = state.towersDefeated; 
        window.nm0AmbushCleared = state.nm0AmbushCleared;
        nm0AmbushActive = state.nm0AmbushActive || false; 
        nm0AmbushKills = state.nm0AmbushKills || 0; 
        inTownCutscene = state.inTownCutscene || false;
        window.militaryToBringM = state.militaryToBringM || 0;
window.militaryToBringF = state.militaryToBringF || 0;
        score = state.score || 0;
        totalKills = state.totalKills || 0;
        
        smgUnlocked = state.smgUnlocked; dualSmgUnlocked = state.dualSmgUnlocked; shotgunUnlocked = state.shotgunUnlocked; 
        arUnlocked = state.arUnlocked; rocketLauncherUnlocked = state.rocketLauncherUnlocked; taserUnlocked = state.taserUnlocked;
        jetpackUnlocked = state.jetpackUnlocked; meleeUnlocked = state.meleeUnlocked; jetpackFireExplosion = state.jetpackFireExplosion; 
        jetpackDoubleDash = state.jetpackDoubleDash; meleeComboUnlocked = state.meleeComboUnlocked; window.meleeFinisherUnlocked = state.meleeFinisherUnlocked;
        ninjaSuitUnlocked = state.ninjaSuitUnlocked; explosiveArmorUnlocked = state.explosiveArmorUnlocked; chemistSuitUnlocked = state.chemistSuitUnlocked; 
        window.ninjaOwned = state.ninjaOwned; window.armorOwned = state.armorOwned; window.chemistOwned = state.chemistOwned;
        
        grenadesUnlocked = state.grenadesUnlocked; pGrenadeAmmo = state.pGrenadeAmmo; pFlaskAmmo = state.pFlaskAmmo;
        
        popTotal = state.popTotal || 0; popUnassigned = state.popUnassigned || 0; popFarming = state.popFarming || 0; 
        popMilitary = state.popMilitary || 0; popScience = state.popScience || 0; popArchitecture = state.popArchitecture || 0;
        statVit = state.statVit || 1; statMen = state.statMen || 1; statPhy = state.statPhy || 1; statObe = state.statObe || 1; statInt = state.statInt || 1;
        
        if (state.townsData) townsData = state.townsData;
        if (state.viewingTownId) viewingTownId = state.viewingTownId;
        window.farmXP = Number(state.farmXP) || 0; window.milXP = Number(state.milXP) || 0; 
        window.sciXP = Number(state.sciXP) || 0; window.archXP = Number(state.archXP) || 0;
        window.farmLvl = Number(state.farmLvl) || 1; window.milLvl = Number(state.milLvl) || 1; 
        window.sciLvl = Number(state.sciLvl) || 1; window.archLvl = Number(state.archLvl) || 1;
        window.archBarrierReady = false;

        journalRead = state.journalRead; tabletPickedUp = state.tabletPickedUp; swordPickedUp = state.swordPickedUp;
        darchonCallCompleted = state.darchonCallCompleted;
window.militaryToBring = state.militaryToBring || 0;
        townPhase = state.townPhase || 0; townTimer = state.townTimer || 0;
        objectiveTimer = state.objectiveTimer || 0;
        inPostAmbushCutscene = state.inPostAmbushCutscene || false; postAmbushPhase = state.postAmbushPhase || 0;
        inWorldBuildingMenu = state.inWorldBuildingMenu || false; inOverworldView = state.inOverworldView || false;

        if (player) {
            player.hp = state.playerHp || 100;
            player.shield = state.playerShield || 100;
            if (state.playerX !== null && state.playerY !== null) {
                player.x = state.playerX;
                player.y = state.playerY;
            }
        }
    let mult = (window.milLvl >= 2) ? 2 : 1;
    if (window.archLvl >= 2) window.archBarrierReady = true;

        if (smgUnlocked) { player.mags["MACHINE GUN"] = 3; player.weaponAmmo["MACHINE GUN"] = WEAPONS.SMG.maxAmmo; }
        if (dualSmgUnlocked) { player.mags["DUAL SMGS"] = 3; player.weaponAmmo["DUAL SMGS"] = WEAPONS.DUAL_SMG.maxAmmo; }
        if (arUnlocked) { player.mags["ASSAULT RIFLE"] = 3; player.weaponAmmo["ASSAULT RIFLE"] = WEAPONS.ASSAULT_RIFLE.maxAmmo; }
        if (shotgunUnlocked) { player.mags["SHOTGUN"] = 3; player.weaponAmmo["SHOTGUN"] = WEAPONS.SHOTGUN.maxAmmo; }
        if (rocketLauncherUnlocked) { player.mags["ROCKET LAUNCHER"] = 6; player.weaponAmmo["ROCKET LAUNCHER"] = WEAPONS.ROCKET_LAUNCHER.maxAmmo; }

        if (rocketLauncherUnlocked) player.currentWeapon = WEAPONS.ROCKET_LAUNCHER;
        else if (shotgunUnlocked) player.currentWeapon = WEAPONS.SHOTGUN;
        else if (arUnlocked) player.currentWeapon = WEAPONS.ASSAULT_RIFLE;
        else if (dualSmgUnlocked) player.currentWeapon = WEAPONS.DUAL_SMG;
        else if (smgUnlocked) player.currentWeapon = WEAPONS.SMG;
        else player.currentWeapon = WEAPONS.PISTOL;
        
                       // 1. If towers are defeated, physically delete them from the spawned map
        if (window.towersDefeated) {
            for (let i = buildings.length - 1; i >= 0; i--) {
                if (buildings[i].isTower) buildings.splice(i, 1);
            }
            
            // WIPE RANDOM HOSTILES BUT PRESERVE DEPLOYED MILITARY
            enemiesList = enemiesList.filter(e => e.isFriendly && e.isMilitary);
            
            // CALCULATE ACTUAL SURVIVING POPULATION
            let isTownEst = townsData && townsData[currentLevel] && townsData[currentLevel].established;
            let survivorCount = 0;
            
            // ONLY SPAWN SURVIVORS IF THE TOWN ISN'T ESTABLISHED YET
            if (!isTownEst) {
                survivorCount = Math.min(80, window.nm0AmbushCleared ? popTotal : Math.max(0, MAX_KILLS - totalKills));
            }
            
            // RE-SPAWN THE EXACT NUMBER OF ALLIES
            if (survivorCount > 0) {
                let allyType = (currentLevel === 2 && isStoryMode) ? "FEMALE_PISTOL" : "NORMAL";
                for (let i = 0; i < survivorCount; i++) {
                    let ax = player.x + random(-400, 400);
                    let ay = player.y + random(-400, 400);
                    let a = new Character(ax, ay, false, allyType);
                    
                    a.isFriendly = true;
                    a.hp = 300;
                    a.state = nm0AmbushActive ? "CHASE" : "IDLE";
                    
                    if (i === 0) townSpeaker1 = a;
                    if (i === 1) townSpeaker2 = a;
                    
                    enemiesList.push(a);
                }
                
                if (survivorCount === 1) townSpeaker2 = townSpeaker1;
                killcamTarget = {x: townSpeaker1.x, y: townSpeaker1.y};
            }

            // RE-SPAWN AMBUSH HOSTILES IF ACTIVE
                        // RE-SPAWN AMBUSH HOSTILES IF ACTIVE
            if (nm0AmbushActive) {
                let spawnY = (currentLevel === 1) ? 4950 : 1800;
                let aerY = (currentLevel === 1) ? 4900 : 1750;
                
                // Keep the live counter and active spawns perfectly locked
                let activeToSpawn = Math.min(100, nm0AmbushKills);
                window.ambushSpawnsRemaining = Math.max(0, nm0AmbushKills - activeToSpawn);
                
                let remainingStandard = Math.ceil(activeToSpawn * 0.84);
                let remainingArmored = Math.ceil(activeToSpawn * 0.08);
                let remainingAerial = Math.ceil(activeToSpawn * 0.08);
                
                for(let i=0; i<remainingStandard; i++) {
                    let sX = random() > 0.5 ? 600 : -200;
                    let c = new Character(sX + random(-250, 250), spawnY + random(-50, 50), false, "ARMORED_STANDARD");
                    c.isAmbush = true;
                    enemiesList.push(c);
                }
                for(let i=0; i<remainingArmored; i++) {
                    let sX = random() > 0.5 ? 600 : -200;
                    let c = new Character(sX + random(-100, 100), spawnY + random(-50, 50), false, "ARMORED");
                    c.isAmbush = true;
                    enemiesList.push(c);
                }
                for(let i=0; i<remainingAerial; i++) {
                    let sX = random() > 0.5 ? 600 : -200;
                    let c = new Character(sX + random(-300, 300), aerY, false, "AERIAL");
                    c.isAmbush = true;
                    enemiesList.push(c);
                }
                
                for (let e of enemiesList) { 
                    if (!e.isFriendly) { e.state = "CHASE"; e.loseSightTimer = 3500; } 
                }
            }

            // TRIGGER CUTSCENE IF SAVED RIGHT AS TOWERS FELL
            if (!window.nm0AmbushCleared && !nm0AmbushActive && !inTownCutscene) {
                inTownCutscene = true; townPhase = 1; townTimer = 120;
            }
            
            // --- OVERWORLD LOAD STATE CATCH ---
            if (window.towersDefeated && !nm0AmbushActive && !inTownCutscene && !inPostAmbushCutscene && currentLevel > 0) {
                viewingTownId = currentLevel;
                
                if (townsData && townsData[currentLevel] && townsData[currentLevel].established) {
                    inOverworldView = true;
                    inWorldBuildingMenu = false;
                } else if (popTotal > 0) {
                    inWorldBuildingMenu = true;
                    inOverworldView = false;
                }

                // Repopulate the visual civilian sprites
                townCitizens = [];
                for (let i = 0; i < popFarming; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "FARMING"));
                for (let i = 0; i < popMilitary; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "MILITARY"));
                for (let i = 0; i < popScience; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "SCIENCE"));
                for (let i = 0; i < popArchitecture; i++) townCitizens.push(new Citizen(player.x + random(-400, 400), player.y + random(-400, 400), "ARCHITECTURE"));
            }
        }
    }
}

    

function issueSquadCommand(cmd, dir = "NORTH") {
    let allies = enemiesList.filter(e => e.isFriendly && !e.dead);
    
    for (let i = 0; i < allies.length; i++) {
        let ally = allies[i];
        
        // PRE-CALCULATE SLOT: Centers the squad (-2, -1, 0, 1, 2, etc.)
        ally.squadSlot = i - Math.floor(allies.length / 2);
        
        if (cmd === "FOLLOW") {
            ally.baseState = "FOLLOW"; 
        } 
        else if (cmd === "HOLD") {
            ally.baseState = "HOLD_PERIMETER"; 
            ally.holdPos = {x: ally.x, y: ally.y};
        } 
        else if (cmd === "SPREAD") {
            ally.baseState = "SEARCH_DIRECTION";
            ally.searchDir = ["NORTH", "SOUTH", "EAST", "WEST"][i % 4];
        }
        else if (cmd === "SEARCH") {
            ally.baseState = "SEARCH_DIRECTION";
            ally.searchDir = dir; 
        }
    }
    isPaused = false; 
    sfx.charge();
}
function drawMenuBtn(txt, x, y, w, h) {
    fill(255, 200, 0); stroke(200, 100, 0); strokeWeight(2);
    rect(x - w/2, y - h/2, w, h, 8);
    fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(16); textFont('sans-serif');
    text(txt, x, y);
}

function triggerBugAmbush() {
    farmAmbushActive = true;
    window.farmAmbushKills = 500; // Set the total swarm size
    objectiveTimer = 360;
    streakMsgText = "PEST INFESTATION!";
    streakMsgTimer = 120;

    // Mobilize the farmers into a militia!
    for (let e of enemiesList) {
        if (e.eType === "FARMER_MALE" || e.eType === "FARMER_FEMALE") {
            e.isNeutral = false; 
            e.isFriendly = true; 
            e.hp = 300; // Buff their health so they can survive the swarm
            e.baseState = "HOLD_PERIMETER"; // Tell them to hold their ground
            e.holdPos = { x: e.x, y: e.y };
            
            // Upgrade their weapons
            e.currentWeapon = random() > 0.5 ? WEAPONS.SHOTGUN : WEAPONS.ASSAULT_RIFLE;
            e.weaponAmmo[e.currentWeapon.name] = e.currentWeapon.maxAmmo;
        }
    }

    // Spawn the first 50 bugs instantly
    for(let i = 0; i < 50; i++) {
        spawnFarmBug();
    }
}

function spawnFarmBug() {
    if (!farmAmbushActive || isDead || isWin) return;
    
    // 50/50 split between West and North-West spawns
    let isWest = random() > 0.5;
    let sX = isWest ? -1200 + random(-100, 100) : -1000 + random(-100, 100);
    let sY = isWest ? random(-150, 150) : -800 + random(-100, 100);

    let b = new Character(sX, sY, false, "BUG");
    b.state = "CHASE"; 
    b.loseSightTimer = 3000;
    enemiesList.push(b);
}
// --- NEW METER & UPGRADE SYSTEM ---


function checkLevelUps() {
    let req2 = 50; 
    if (window.farmLvl === 1 && window.farmXP >= req2) { 
        window.farmLvl = 2; streakMsgText = "FARMING LEVEL 2!"; streakMsgTimer = 120; sfx.charge(); 
        if (player) { player.maxHp = 125; player.hp += 25; }
        for (let e of enemiesList) if (e.isFriendly) { e.maxHp = (e.maxHp || 300) + 25; e.hp += 25; }
    }
    if (window.milLvl === 1 && window.milXP >= req2) { 
        window.milLvl = 2; streakMsgText = "MILITARY LEVEL 2!"; streakMsgTimer = 120; sfx.charge(); 
        if (player) player.triggerReload(); 
    }
    if (window.sciLvl === 1 && window.sciXP >= req2) { 
        window.sciLvl = 2; streakMsgText = "SCIENCE LEVEL 2!"; streakMsgTimer = 120; 
        chemistSuitUnlocked = true; window.chemistOwned = true; sfx.charge(); 
    }
    if (window.archLvl === 1 && window.archXP >= req2) { 
        window.archLvl = 2; streakMsgText = "ARCHITECTURE LEVEL 2!"; streakMsgTimer = 120; 
        window.archBarrierReady = true; sfx.charge(); 
    }
}

function buildBarrier() {
    if (!window.archBarrierReady) return;
    window.archBarrierReady = false;
    buildings.push({ x: player.x, y: player.y - 20, w: 200, h: 200, isUBarrier: true, hp: 1000, maxHp: 1000, hitFlash: 0 });
    sfx.charge();
}
function updateProductionMeters() {
    if (window.farmLvl === undefined) {
        window.farmXP = 0; window.milXP = 0; window.sciXP = 0; window.archXP = 0;
        window.farmLvl = 1; window.milLvl = 1; window.sciLvl = 1; window.archLvl = 1;
        window.archBarrierReady = false;
    }
    if (currentLevel < 1 || isDead || isWin || isPaused || inTownCutscene || inWorldBuildingMenu) return;
    
    if (frameCount % 60 === 0) {
        // Force them to be numbers so the math never breaks
        let pF = Number(popFarming) || 0;
        let pM = Number(popMilitary) || 0;
        let pS = Number(popScience) || 0;
        let pA = Number(popArchitecture) || 0;

        // Multiplied by 0.001 to dramatically slow down the leveling speed
        let fRate = (pF * (1 + Math.min(5, Math.floor(pF / 10)) * 0.1)) * 0.001;
        let milActive = Math.max(0, pM - ((Number(window.militaryToBringM) || 0) + (Number(window.militaryToBringF) || 0)));
        let mRate = (milActive * (1 + Math.min(5, Math.floor(milActive / 10)) * 0.1)) * 0.001;
        let sRate = (pS * (1 + Math.min(5, Math.floor(pS / 10)) * 0.1)) * 0.001;
        let aRate = (pA * (1 + Math.min(5, Math.floor(pA / 10)) * 0.1)) * 0.001;

        window.farmXP += fRate; window.milXP += mRate; window.sciXP += sRate; window.archXP += aRate;
        checkLevelUps();
    }
}
function triggerLvl4Ambush() {
    nm0AmbushActive = true;
    nm0AmbushKills = 150; 
    window.ambushSpawnsRemaining = 100;
    objectiveTimer = 360;
    streakMsgText = "NM-0 GREY FATIGUE AMBUSH!";
    streakMsgTimer = 120;

    // First initial wave spawn
    for(let i = 0; i < 50; i++) {
        let sX = random() > 0.5 ? -1500 : 1500; 
        let sY = player.y + random(-1000, 1000);
        let e = new Character(sX, sY, false, "NM0_GREY_FATIGUE");
        e.state = "CHASE"; 
        e.loseSightTimer = 2500;
        e.isAmbush = true;
        enemiesList.push(e);
    }
}
