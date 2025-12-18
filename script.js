document.addEventListener('DOMContentLoaded', () => {

    // --- Tabs Handling ---
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.dataset.tab === 'checker' ? 'checker-view' : 'wheel-view';
            tabContents.forEach(content => {
                if (content.id === targetId) {
                    content.style.display = 'block';
                    // Trigger reflow/anim
                    setTimeout(() => content.style.opacity = '1', 10);
                } else {
                    content.style.display = 'none';
                    content.style.opacity = '0';
                }
            });

            // Initialize wheel if switching to it and empty
            if (targetId === 'wheel-view' && wheelData.length === 0) {
                initWheelData();
                renderWheel();
            }
        });
    });

    // --- Checker Logic ---
    const wordInput = document.getElementById('wordInput');
    const checkBtn = document.getElementById('checkBtn');
    const randomBtn = document.getElementById('randomBtn');
    const resultContainer = document.getElementById('result');
    const tilesContainer = document.getElementById('tiles');
    const message = document.getElementById('message');
    const scoreContainer = document.getElementById('score');
    const pointsValue = document.getElementById('pointsValue');
    const gameSelect = document.getElementById('gameSelect');

    let dictionary = new Set();
    let dictionaryArray = [];
    let isDictionaryLoaded = false;
    let currentGameMode = 'scrabble';

    // Scrabble points
    const scrabblePoints = {
        'A': 1, 'E': 1, 'I': 1, 'N': 1, 'O': 1, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'L': 1,
        'D': 2, 'M': 2, 'G': 2,
        'B': 3, 'C': 3, 'P': 3,
        'F': 4, 'H': 4, 'V': 4,
        'J': 8, 'Q': 8,
        'K': 10, 'W': 10, 'X': 10, 'Y': 10, 'Z': 10
    };

    const gameConfig = {
        'scrabble': { showPoints: true, pointsTable: scrabblePoints, name: 'Scrabble', lengthBonus: false },
        'scrabble_duplicate': { showPoints: true, pointsTable: scrabblePoints, name: 'Scrabble Duplicate', lengthBonus: false },
        'wordfeud': { showPoints: true, pointsTable: scrabblePoints, name: 'Wordfeud', lengthBonus: false },
        'wwf': { showPoints: true, pointsTable: scrabblePoints, name: 'Words With Friends', lengthBonus: false },
        'ruzzle': { showPoints: true, pointsTable: scrabblePoints, name: 'Ruzzle', lengthBonus: true },
        'bananagrams': { showPoints: false, name: 'Bananagrams' },
        'boggle': { showPoints: false, name: 'Boggle' },
        'motus': { showPoints: false, name: 'Motus / SUTOM' },
        'cemantix': { showPoints: false, name: 'Cémantix / Contexto' },
        'wordle': { showPoints: false, name: 'Wordle' }
    };

    // Game Mode Event
    gameSelect.addEventListener('change', (e) => {
        currentGameMode = e.target.value;
        if (!resultContainer.classList.contains('hidden') && wordInput.value.trim() !== "") {
            checkWord();
        }
    });

    // Load Dictionary
    fetch('dictionary.txt')
        .then(response => {
            if (!response.ok) throw new Error("Impossible de charger le dictionnaire.");
            return response.text();
        })
        .then(text => {
            const words = text.split(/\r?\n/);
            words.forEach(word => {
                if (word.trim()) {
                    const cleanWord = word.trim().toUpperCase();
                    dictionary.add(cleanWord);
                    dictionaryArray.push(cleanWord);
                }
            });
            isDictionaryLoaded = true;
            console.log('Dictionnaire chargé :', dictionary.size, 'mots');
        })
        .catch(err => {
            console.error(err);
            message.textContent = "Erreur de chargement du dictionnaire.";
            message.classList.add('invalid');
            resultContainer.classList.remove('hidden');
        });

    function getWordPoints(word, mode) {
        const config = gameConfig[mode];
        if (!config || !config.showPoints) return 0;

        let points = 0;
        const table = config.pointsTable || scrabblePoints;

        for (let char of word) {
            points += table[char] || 0;
        }

        if (config.lengthBonus) {
            const len = word.length;
            let lengthBonus = 0;
            if (len === 5) lengthBonus = 5;
            else if (len === 6) lengthBonus = 10;
            else if (len === 7) lengthBonus = 15;
            else if (len === 8) lengthBonus = 20;
            else if (len >= 9) lengthBonus = 25;
            points += lengthBonus;
        }

        return points;
    }

    function displayTiles(word) {
        tilesContainer.innerHTML = '';
        const config = gameConfig[currentGameMode];
        const showPoints = config ? config.showPoints : false;
        const table = config ? (config.pointsTable || scrabblePoints) : scrabblePoints;

        word.split('').forEach((char, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = char;
            tile.style.animationDelay = `${index * 0.05}s`;

            if (showPoints) {
                const pointsSpan = document.createElement('span');
                pointsSpan.className = 'points';
                pointsSpan.textContent = table[char] || 0;
                tile.appendChild(pointsSpan);
            }
            tilesContainer.appendChild(tile);
        });
    }

    function checkWord() {
        if (!isDictionaryLoaded) {
            alert("Le dictionnaire n'est pas encore chargé. Veuillez patienter.");
            return;
        }
        const rawWord = wordInput.value.trim();
        if (!rawWord) return;
        const word = rawWord.toUpperCase();

        resultContainer.classList.remove('hidden');
        message.className = 'message';
        scoreContainer.classList.add('hidden');

        displayTiles(word);

        if (dictionary.has(word)) {
            message.textContent = "Valide au " + (gameConfig[currentGameMode]?.name || "Jeu");
            message.classList.add('valid');
            if (gameConfig[currentGameMode]?.showPoints) {
                const points = getWordPoints(word, currentGameMode);
                pointsValue.textContent = points;
                scoreContainer.classList.remove('hidden');
            }
        } else {
            message.textContent = "Mot Invalide";
            message.classList.add('invalid');
        }
    }

    function getRandomWord() {
        if (!isDictionaryLoaded || dictionaryArray.length === 0) return "";
        const randomIndex = Math.floor(Math.random() * dictionaryArray.length);
        return dictionaryArray[randomIndex];
    }

    randomBtn.addEventListener('click', () => {
        if (!isDictionaryLoaded) {
            alert("Le dictionnaire charge encore...");
            return;
        }
        const word = getRandomWord();
        wordInput.value = word;
        checkWord();
    });

    checkBtn.addEventListener('click', checkWord);
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkWord();
    });


    // --- Word Wheel Logic ---
    const wheelElement = document.getElementById('infinite-wheel');
    const selectedWordDisplay = document.getElementById('selected-word-display');
    let wheelData = [];

    function initWheelData() {
        // Flatten WORDS_BY_RANK from data.js
        if (typeof WORDS_BY_RANK !== 'undefined') {
            for (let rank in WORDS_BY_RANK) {
                const lettersObject = WORDS_BY_RANK[rank];
                for (let letter in lettersObject) {
                    const wordsForLetter = lettersObject[letter];
                    wheelData = wheelData.concat(wordsForLetter);
                }
            }
            // Shuffle
            wheelData.sort(() => Math.random() - 0.5);
            console.log("Roue chargée avec", wheelData.length, "mots");
        } else {
            console.error("WORDS_BY_RANK non défini. Vérifiez data.js");
            selectedWordDisplay.textContent = "Erreur data.js";
        }
    }

    // Infinite scroll implementation
    const itemHeight = 50; // approx height + margin
    const bufferSize = 20; // items to render at once

    function renderWheel() {
        wheelElement.innerHTML = '';
        // Create initial buffer
        for (let i = 0; i < 50; i++) { // Start with 50 items
            const item = createWheelItem(wheelData[i % wheelData.length]);
            wheelElement.appendChild(item);
        }
        updateActiveItem();
    }

    function createWheelItem(text) {
        const div = document.createElement('div');
        div.className = 'wheel-item';
        div.textContent = text;
        div.onclick = () => {
            // Center this item
            // This is complex, simplified for now: just verify
            wordInput.value = text;
            tabs[0].click(); // Switch to checker
            setTimeout(checkWord, 300);
        };
        return div;
    }

    // Infinite Loop Logic
    wheelElement.addEventListener('scroll', () => {
        const scrollTop = wheelElement.scrollTop;
        const scrollHeight = wheelElement.scrollHeight;
        const clientHeight = wheelElement.clientHeight;

        // If near bottom, append more items
        if (scrollTop + clientHeight > scrollHeight - 100) {
            // Append 10 more random items
            for (let i = 0; i < 10; i++) {
                // Use getNextWord logic (defined below or hoisted)
                // Since getNextWord is defined later in file, we rely on hoisting/scope.
                // Wait, function declarations are hoisted, but my getNextWord is inside DOMContentLoaded.
                // It should be fine as long as it's defined in the same scope.
                // However, I just added it at the END of the scope.
                // So I need to call it effectively.
                const word = getNextWord();
                const item = createWheelItem(word);
                wheelElement.appendChild(item);
            }
        }

        updateActiveItem();
    });
    function updateActiveItem() {
        // Find item in center
        const center = wheelElement.scrollTop + (wheelElement.clientHeight / 2);
        const items = document.querySelectorAll('.wheel-item');

        let closest = null;
        let minDiff = Infinity;

        items.forEach(item => {
            const itemCenter = item.offsetTop + (item.offsetHeight / 2);
            const diff = Math.abs(center - itemCenter);

            item.classList.remove('active');

            if (diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        });

        if (closest) {
            closest.classList.add('active');
            selectedWordDisplay.textContent = closest.textContent;
        }
    }

    // --- VRTX MODE LOGIC ---
    const vrtxTrigger = document.getElementById('vrtx-trigger');
    const vrtxModal = document.getElementById('vrtx-modal');
    const vrtxWordInput = document.getElementById('vrtx-word');
    const vrtxCounter = document.getElementById('vrtx-counter');
    const rankButtons = document.querySelectorAll('.rank-btn');
    const vrtxOkBtn = document.getElementById('vrtx-ok');

    let vrtxActive = false;
    let vrtxTargetWord = "";
    let vrtxTargetRank = 1;
    let vrtxCurrentIndex = 0;

    // Trigger Logic
    let clickCount = 0;
    let clickTimer;
    let longPressTimer;

    // Triple Click
    vrtxTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 500);

        if (clickCount === 3) {
            openVrtxModal();
            clickCount = 0;
        }
    });

    // Long Press
    vrtxTrigger.addEventListener('mousedown', () => {
        longPressTimer = setTimeout(openVrtxModal, 1500);
    });
    vrtxTrigger.addEventListener('mouseup', () => clearTimeout(longPressTimer));
    vrtxTrigger.addEventListener('mouseleave', () => clearTimeout(longPressTimer));

    // Touch support for mobile
    vrtxTrigger.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent ghost clicks
        longPressTimer = setTimeout(openVrtxModal, 1500);
    });
    vrtxTrigger.addEventListener('touchend', () => clearTimeout(longPressTimer));

    function openVrtxModal() {
        vrtxModal.classList.remove('hidden');
        vrtxWordInput.value = '';
        vrtxCounter.textContent = '(0)';
        vrtxTargetRank = 1;
        updateRankButtons();
        vrtxWordInput.focus();
    }

    function closeVrtxModal() {
        vrtxModal.classList.add('hidden');
    }

    // Modal Interactions
    vrtxWordInput.addEventListener('input', () => {
        const text = vrtxWordInput.value.trim();
        vrtxCounter.textContent = `(${text.length})`;
    });

    rankButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            vrtxTargetRank = parseInt(btn.dataset.rank);
            updateRankButtons();
        });
    });

    function updateRankButtons() {
        rankButtons.forEach(btn => {
            if (parseInt(btn.dataset.rank) === vrtxTargetRank) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    vrtxOkBtn.addEventListener('click', () => {
        const word = vrtxWordInput.value.trim().toUpperCase();
        const footerText = document.querySelector('footer p');

        if (word.length > 0) {
            vrtxTargetWord = word;
            vrtxActive = true;
            vrtxCurrentIndex = 0;
            console.log("VRTX ACTIVATED:", vrtxTargetWord, "Rank:", vrtxTargetRank);

            // Visual confirmation
            if (footerText && !footerText.textContent.endsWith('.')) {
                footerText.textContent += ".";
            }

            // Switch to Wheel Tab
            const wheelTab = document.querySelector('.tab-btn[data-tab="wheel"]');
            if (wheelTab) wheelTab.click();

        } else {
            vrtxActive = false;
            // Remove confirmation
            if (footerText && footerText.textContent.endsWith('.')) {
                footerText.textContent = footerText.textContent.slice(0, -1);
            }
        }
        closeVrtxModal();
    });

    // --- Forcing Logic Injected into Wheel ---
    // Override the append logic scroll handler

    // Remove old listener to avoid double binding if re-run (not needed here but good practice)
    // Actually we just added to the existing script, so we need to modify the scroll listener logic above.
    // Instead of replacing the WHOLE listener which is hard, I will modify the `createWheelItem` logic or creating `getNextWord`.

    function getNextWord() {
        if (vrtxActive && vrtxTargetWord.length > 0) {
            // Get current target letter
            // Loop index if it exceeds word length
            const targetLetter = vrtxTargetWord[vrtxCurrentIndex % vrtxTargetWord.length];
            vrtxCurrentIndex++; // Advance for next time

            // Find candidates
            // WORDS_BY_RANK[rank][letter]
            // Safe access
            const rankObj = (window.WORDS_BY_RANK && window.WORDS_BY_RANK[vrtxTargetRank]) ? window.WORDS_BY_RANK[vrtxTargetRank] : null;
            const candidates = (rankObj && rankObj[targetLetter]) ? rankObj[targetLetter] : null;

            if (candidates && candidates.length > 0) {
                // Filter out the target word itself to keep the secret
                const filtered = candidates.filter(w => w !== vrtxTargetWord);
                if (filtered.length > 0) {
                    const randomIdx = Math.floor(Math.random() * filtered.length);
                    return filtered[randomIdx];
                }
            }
            // Fallback if no candidate found (e.g. rare letter at specific rank): return random
        }

        // Default Random
        if (wheelData.length > 0) {
            const randomIdx = Math.floor(Math.random() * wheelData.length);
            return wheelData[randomIdx];
        }
        return "CHARGEMENT...";
    }

    // We need to Monkey Patch or modify the Scroll Listener to use `getNextWord()`
    // Since I cannot allow multiple replace calls easily on the same block logic without context,
    // I will replace the scroll listener block entirely.

    // Re-attaching scroll listener with new logic
    wheelElement.onscroll = null; // Clear old one if any (though addEventListener stacks)
    // Actually, to be safe, I'm just defining a new function that handles the appending and replacing the old scroll logic block in the file.

});
