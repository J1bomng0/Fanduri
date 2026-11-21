// ---------- Sounds ----------
// One recording per string, played at the pitch of the OPEN chord.
// Put your own recordings in the /sounds folder.
var sounds = {
    a: "./sounds/simi1.mp3",
    s: "./sounds/simi2.mp3",
    d: "./sounds/simi3.mp3"
};
var stringIndex = { a: 0, s: 1, d: 2 };

// ---------- Chords ----------
// For every chord: how many semitones each string (a, s, d) is raised
// compared to the open sound. Pressing a fret raises the pitch, so we
// just play the same recording faster. Edit these numbers to match your
// real panduri tuning / fingerings.
var chords = {
    G:  [0, 0, 0],   // open (nothing pressed)
    C:  [5, 5, 5],
    D:  [7, 7, 7],
    Em: [9, 8, 9],
    Am: [2, 1, 2]
};
var chordKeys = { KeyJ: "C", KeyK: "D", KeyL: "Em", Semicolon: "Am" };

var currentChord = "G";
var heldChords = [];                       // chords currently pressed, last = newest

var sun = document.querySelector(".sun");
var chordLabel = document.getElementById("chordName");

// ---------- Strings: mouse / touch ----------
var buttons = document.querySelectorAll(".fanduri");
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var key = this.dataset.key;        // "a", "s" or "d"
        makeSound(key);
        btnAnimation(key);
    });
}

// ---------- Chords: mouse / touch (hold) ----------
var chordButtons = document.querySelectorAll(".chord");
for (var j = 0; j < chordButtons.length; j++) {
    var cb = chordButtons[j];
    cb.addEventListener("pointerdown", function (e) { e.preventDefault(); pressChord(this.dataset.chord); });
    cb.addEventListener("pointerup",     function () { releaseChord(this.dataset.chord); });
    cb.addEventListener("pointerleave",  function () { releaseChord(this.dataset.chord); });
    cb.addEventListener("pointercancel", function () { releaseChord(this.dataset.chord); });
}

// ---------- Keyboard (physical keys, works with any keyboard layout) ----------
var codeToKey = { KeyA: "a", KeyS: "s", KeyD: "d" };

document.addEventListener("keydown", function (e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (chordKeys[e.code]) { pressChord(chordKeys[e.code]); return; }
    var key = codeToKey[e.code];
    if (!key) return;                      // ignore every other key
    makeSound(key);
    btnAnimation(key);
});

document.addEventListener("keyup", function (e) {
    if (chordKeys[e.code]) releaseChord(chordKeys[e.code]);
});

window.addEventListener("blur", function () {  // don't leave a chord stuck
    heldChords = [];
    setChord("G");
});

// ---------- Chord logic ----------
function pressChord(name) {
    heldChords = heldChords.filter(function (c) { return c !== name; });
    heldChords.push(name);
    setChord(name);
}

function releaseChord(name) {
    heldChords = heldChords.filter(function (c) { return c !== name; });
    setChord(heldChords.length ? heldChords[heldChords.length - 1] : "G");
}

function setChord(name) {
    currentChord = name;
    chordLabel.textContent = name;
    for (var k = 0; k < chordButtons.length; k++) {
        var isHeld = heldChords.indexOf(chordButtons[k].dataset.chord) !== -1;
        chordButtons[k].classList.toggle("held", isHeld);
    }
}

// ---------- Sound ----------
function makeSound(key) {
    if (!sounds[key]) return;
    var semitones = chords[currentChord][stringIndex[key]];
    var simi = new Audio(sounds[key]);     // new Audio each time lets fast notes overlap
    simi.preservesPitch = false;           // change pitch together with speed
    simi.mozPreservesPitch = false;
    simi.webkitPreservesPitch = false;
    simi.playbackRate = Math.pow(2, semitones / 12);
    simi.play();
}

// ---------- Animation ----------
function btnAnimation(currentKey) {
    var activeBtn = document.querySelector("." + currentKey);
    if (!activeBtn) return;

    activeBtn.classList.remove("vibrate");  // restart the wobble on rapid presses
    void activeBtn.offsetWidth;
    activeBtn.classList.add("pressed", "vibrate");

    sun.classList.remove("pulse");          // Borjgali pulse
    void sun.getBoundingClientRect();
    sun.classList.add("pulse");

    setTimeout(function () { activeBtn.classList.remove("pressed"); }, 100);
    setTimeout(function () { activeBtn.classList.remove("vibrate"); }, 500);
}