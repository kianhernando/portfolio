// KIAN HERNANDO - FINAL PROJECT FOR CMPS2680
// TYPR - A TYPING TEST

// GLOBAL VARIABLES
const wordList = "the of and to a in that is it was he for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place years live me back give most very after thing our just name good sentence man think say great where help through much before line right too means old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should high every near add food between own below plant last keep tree never start eyes light thought head under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk sea began grow took river four carry once book hear stop without second late miss idea enough eat face watch far real almost let girl sometimes cut young talk list song being leave body music color stand sun fish area mark dog horse problem complete room knew since ever piece told usually friends easy heard order red door sure become top ship across today during short better best however low hours products happened whole measure remember early waves reached listen wind rock space covered fast several hold toward five step morning passed true hundred against pattern table slowly money map farm pulled draw voice seen cold cried plan notice sing ground fall town unit figure certain field travel wood fire upon done road half ten fly gave box finally wait correct oh quickly person shown minutes strong verb stars front feel fact inches street decided contain course surface produce ocean class note nothing rest carefully inside wheels stay green known week less machine base ago stood plane system behind ran round boat game force brought warm common explain dry though shape deep thousands yes clear";
const dictionary = wordList.split(" ");

const wordsToDisplay = [];
let wordIndex = 0;

let startTime = null;
let elapsedTime = 0;
let intervalTime = null;

// IF TEST IS TIMER BOOLEAN
let isTimer = false;
let amtTime = 0;

// IF TEST IS FINISHED BOOLEAN
let isDone = false;

// DARK / LIGHT MODE (SET BEFORE PAGE LOADS SO IT DOESN'T FLASH)
if (localStorage.typrTheme === "dark") {
    document.documentElement.classList.add("dark");
}

// TYPING SOUNDS
const spaceSound = new Audio ('sounds/space.wav');
const tabSound = new Audio ('sounds/tab.wav');
const enterSound = new Audio ('sounds/enter.wav');
const deleteSound = new Audio ('sounds/delete.wav');

const alphaSound = [
    new Audio ('sounds/1.wav'),
    new Audio ('sounds/2.wav'),
    new Audio ('sounds/3.wav'),
    new Audio ('sounds/4.wav'),
    new Audio ('sounds/5.wav'),
]

// PLAY A RANDOM SOUND OUT OF THE 5 AUDIO SOURCES
function playAlphaSound() {
    const randomKey = alphaSound[Math.floor(Math.random() * alphaSound.length)];
    // RESET AUDIO TO 0 SEC
    randomKey.currentTime = 0;
    randomKey.play();
}

// SET WORD DISPLAY FUNCTIONS
function getDictionary(array, num) {
    wordsToDisplay.length = 0;

    // COPY THE ARRAY
    let availableWords = [...array];

    for (let i = 0; i < num && availableWords.length > 0; i++) {
        let randomIndex = Math.floor(Math.random() * availableWords.length);
        let random = availableWords[randomIndex];
        // REMOVE WORD FROM COPIED ARRAY FOR DUPLICATES
        availableWords.splice(randomIndex, 1);
        wordsToDisplay.push(random);
        document.getElementById("wordDisplay").innerHTML += '<span class="word">' + random + '</span>' + ' ';
    }
    return wordsToDisplay;
}

function appendWords(num) {
    for (let i = 0; i < num; i++) {
        const words = dictionary[Math.floor(Math.random() * dictionary.length)];
        wordsToDisplay.push(words);
        document.getElementById("wordDisplay").innerHTML += '<span class="word">' + words + '</span> ';
    }
}
// TIME AND RESET FUNCTIONS
function updateTime() {
    const displayTime = document.getElementById("timer");
    const currentTime = Date.now();

    elapsedTime = (currentTime - startTime) / 1000;

    // TIMER MODE COUNTS DOWN, WORD MODE COUNTS UP
    if (isTimer) {
        elapsedTime = Math.min(elapsedTime, amtTime);
        displayTime.textContent = (amtTime - elapsedTime).toFixed(1);

        if (elapsedTime >= amtTime)
            endTest();
    } else {
        displayTime.textContent = elapsedTime.toFixed(1);
    }
}

function resetTimer() {
    clearInterval(intervalTime);
    intervalTime = null;
    startTime = null;
    elapsedTime = 0;
    isDone = false;
    document.getElementById("timer").textContent = "0.0";
}

// STOP THE TIME AND SHOW WPM
function endTest() {
    clearInterval(intervalTime);
    intervalTime = null;
    isDone = true;

    const correctWords = document.querySelectorAll(".correct").length;
    const timeInMinutes = elapsedTime / 60;
    const wpm = Math.round (correctWords / timeInMinutes);

    // SET WPM, CLEAR INPUT, FOCUS ON REDO BUTTON
    document.getElementById("wpm").innerHTML = `wpm: ${wpm}`;
    document.getElementById("wordInput").innerHTML = '';
    document.getElementById("redo").focus();
}

function resetDisplay() {
    document.getElementById("wordInput").textContent = '';
    this.document.querySelectorAll("#wordDisplay .word")[wordIndex].classList.add("current");
    document.getElementById("wpm").innerHTML = "wpm: "
}

// DISPLAY WORDS AND RESET GLOBAL INDEX AND TIMER
function displayWords(num) {
    document.getElementById("wordDisplay").innerHTML = '';
    getDictionary(dictionary, num);
    // RESET GLOBAL INDEX
    wordIndex = 0;
    resetTimer();

    // IF BROWSER REFRESH OR HIT REDO, MAINTAIN KEY (THANKS PAUL FOR TEACHING THIS)
    localStorage.setItem("typrWordAmt", num);
    
    // REMOVE ACTIVE CLASS
    document.querySelectorAll("#amtWord .button").forEach(span => {
        span.classList.remove("active");
    });
    
    // ADD ACTIVE CLASS TO PASSED IN ID
    document.querySelector(`#amtWord [id="${num}"]`).classList.add("active");
}

// DISPLAY WORDS FOR TIMER MODE AND SET THE AMOUNT OF TIME
function displayTimed(num) {
    document.getElementById("wordDisplay").innerHTML = '';
    wordsToDisplay.length = 0;
    appendWords(25);
    wordIndex = 0;
    resetTimer();

    amtTime = Number(num);
    document.getElementById("timer").textContent = amtTime.toFixed(1);
    localStorage.setItem("typrTimeAmt", num);

    // REMOVE ACTIVE CLASS
    document.querySelectorAll("#amtTime .button").forEach(span => {
        span.classList.remove("active");
    });

    // ADD ACTIVE CLASS TO PASSED IN ID
    document.querySelector(`#amtTime [id="${num}"]`).classList.add("active");
}

// START A NEW TEST IN THE CURRENT MODE (CHECK FOR LOCAL STORAGE)
function newTest() {
    if (isTimer) {
        displayTimed(localStorage.typrTimeAmt || 30);
    } else {
        displayWords(localStorage.typrWordAmt || 10);
    }
    resetDisplay();
}

// KEYDOWN FUNCTIONS 
function spaceEvent() {
    let text = document.getElementById("wordInput").textContent;

    // SEE IF WORD IS CORRECT OR NOT AFTER HITTING SPACE
    let words = document.querySelectorAll("#wordDisplay .word");

    if (text === wordsToDisplay[wordIndex]) {
        words[wordIndex].classList.remove("current");
        words[wordIndex].classList.add("correct");
    } else {
        words[wordIndex].classList.remove("current");
        words[wordIndex].classList.add("error");
    }
    
    // INCREMENT GLOBAL INDEX
    wordIndex++;

    // COMPLETION CHECK (TIMER MODE NEVER RUNS OUT OF WORDS, ADD MORE)
    if (wordIndex >= wordsToDisplay.length) {
        if (isTimer) {
            appendWords(25);
            words = document.querySelectorAll("#wordDisplay .word");
        } else {
            updateTime();
            endTest();
            return;
        }
    }

    // IF NOT COMPLETE, ADD CURRENT CLASS AND RESET
    words[wordIndex].classList.add("current");
    document.getElementById("wordInput").textContent = '';
}

function typeEvent(key) {
    document.getElementById("wordInput").textContent += key;

    // IF THE LAST WORD IS TYPED CORRECTLY, COMPLETE IT WITHOUT NEEDING SPACE
    if (!isTimer && wordIndex === wordsToDisplay.length - 1 && document.getElementById("wordInput").textContent === wordsToDisplay[wordIndex]) {
        spaceEvent();
    }
}

function backspaceEvent() {
    document.getElementById("wordInput").textContent = document.getElementById("wordInput").textContent.slice(0, -1);
}

// LOAD WEBPAGE
window.addEventListener("load", function() {   
    
    // PAGE BUTTON LOGIC 
    const wordTitle = document.getElementById('wordTitle');
    const timeTitle = document.getElementById('timeTitle');
    const wordOptions = document.getElementById('amtWord');
    const timeOptions = document.getElementById('amtTime');

    wordTitle.addEventListener('click', function() {
        wordOptions.classList.remove('hidden');
        timeOptions.classList.add('hidden');
        wordTitle.classList.add('active');
        timeTitle.classList.remove('active');
        isTimer = false;
        newTest();
    });

    timeTitle.addEventListener('click', function() {
        timeOptions.classList.remove('hidden');
        wordOptions.classList.add('hidden');
        timeTitle.classList.add('active');
        wordTitle.classList.remove('active');
        isTimer = true;
        newTest();
    });

    // DARK / LIGHT MODE TOGGLE (TEXT SHOWS THE MODE IT SWITCHES TO)
    const theme = document.getElementById('theme');
    theme.textContent = localStorage.typrTheme === "dark" ? "light" : "dark";

    theme.addEventListener('click', function() {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("typrTheme", isDark ? "dark" : "light");
        theme.textContent = isDark ? "light" : "dark";
    });

    // SET DEFAULT DISPLAY
    newTest();

    // BUTTONS TO CHANGE AMOUNT OF WORDS
    this.document.querySelectorAll("#amtWord .button").forEach(span => {
        span.addEventListener('click', event => {
            displayWords(span.id);
            resetDisplay();
        });
    });

    // BUTTONS TO CHANGE AMOUNT OF TIME
    this.document.querySelectorAll("#amtTime .button").forEach(span => {
        span.addEventListener('click', event => {
            displayTimed(span.id);
            resetDisplay();
        });
    });

    // BUTTON TO REDO
    this.document.getElementById("redo").addEventListener('click', event => {
        newTest();
        // REMOVE FOCUS ON THE REDO BUTTON TO ALLOW SHORTCUT AGAIN
        this.document.getElementById("redo").blur();
    });

    // MAIN TYPING LOGIC
    this.document.addEventListener('keydown', event => {
        // RESET SHORTCUT (TAB + ENTER)
        if (event.code === 'Tab') {
            event.preventDefault();

            tabSound.currentTime = 0;
            tabSound.play();

            document.getElementById("redo").focus();
            return;
        }
        
        if (event.code === 'Enter') {
            enterSound.currentTime = 0;
            enterSound.play();
        }

        // IF TEST IS DONE, IGNORE TYPING UNTIL REDO (SPACE SHOULDN'T PRESS THE REDO BUTTON)
        if (isDone) {
            if (event.code === 'Space') {
                event.preventDefault();
            }
            return;
        }

        // CHECK IF PLAYER HAS TYPED OR NOT
        if (!this.document.getElementById("wordInput").textContent) {
            if (event.code === 'Space') {
                event.preventDefault();

                spaceSound.currentTime = 0;
                spaceSound.play();

                return;
            } else if (event.code === 'Backspace') {
                event.preventDefault();

                deleteSound.currentTime = 0;
                deleteSound.play();

                return;
            } else if (event.key.length === 1) {
                playAlphaSound();

                // START THE TEST
                if (!startTime) {
                    startTime = Date.now();
                    intervalTime = setInterval(updateTime, 10);
                }

                typeEvent(event.key);
            }
        } else {
            if (event.code === 'Space') {
                event.preventDefault();

                spaceSound.currentTime = 0;
                spaceSound.play();

                spaceEvent();
            } else if (event.code === 'Backspace') {
                event.preventDefault();

                deleteSound.currentTime = 0;
                deleteSound.play();
                
                backspaceEvent();
            } else if (event.key.length === 1) {
                playAlphaSound();
                
                typeEvent(event.key);
            }
        }
    });
});
