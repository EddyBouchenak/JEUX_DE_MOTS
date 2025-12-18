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
                    setTimeout(() => content.style.opacity = '1', 10);
                } else {
                    content.style.display = 'none';
                    content.style.opacity = '0';
                }
            });

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

    gameSelect.addEventListener('change', (e) => {
        currentGameMode = e.target.value;
        if (!resultContainer.classList.contains('hidden') && wordInput.value.trim() !== "") {
            checkWord();
        }
    });

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
    const itemHeight = 50;
    const bufferSize = 20;

    function renderWheel() {
        wheelElement.innerHTML = '';
        for (let i = 0; i < 50; i++) {
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
            wordInput.value = text;
            tabs[0].click(); // Switch to checker
            setTimeout(checkWord, 300);
        };
        return div;
    }

    function getNextWord() {
        const footerText = document.querySelector('footer p');

        // --- 1. PRIORITY: FORCING MODE ---
        if (forcingActive) {
            forcingScrollsCount++;

            if (forcingScrollsCount === forcingScrollsNeeded) {
                // IT IS TIME
                const target = forcingTargetWord;

                // DEACTIVATE
                forcingActive = false;
                console.log("FORCING EXECUTED");

                if (footerText && footerText.textContent.endsWith('.')) {
                    footerText.textContent = footerText.textContent.slice(0, -1);
                }

                return target;
            } else {
                // Return RANDOM but AVOID target
                if (wheelData.length > 0) {
                    let randomWord = "";
                    let attempts = 0;
                    do {
                        randomWord = wheelData[Math.floor(Math.random() * wheelData.length)];
                        attempts++;
                    } while (randomWord === forcingTargetWord && attempts < 10);
                    return randomWord;
                }
            }
        }

        // --- 2. VRTX MODE ---
        if (vrtxActive && vrtxTargetWord.length > 0) {

            if (vrtxCurrentIndex >= vrtxTargetWord.length) {
                // FINISHED SPELLING
                if (!fromHotSwap) {
                    vrtxActive = false;
                    console.log("VRTX FINISHED");
                    if (footerText && footerText.textContent.endsWith('.')) {
                        footerText.textContent = footerText.textContent.slice(0, -1);
                    }
                }
                // Fallthrough to random
            } else {
                const targetLetter = vrtxTargetWord[vrtxCurrentIndex];
                vrtxCurrentIndex++;

                const rankObj = (window.WORDS_BY_RANK && window.WORDS_BY_RANK[vrtxTargetRank]) ? window.WORDS_BY_RANK[vrtxTargetRank] : null;
                const candidates = (rankObj && rankObj[targetLetter]) ? rankObj[targetLetter] : null;

                if (candidates && candidates.length > 0) {
                    const filtered = candidates.filter(w => w !== vrtxTargetWord);
                    if (filtered.length > 0) {
                        return filtered[Math.floor(Math.random() * filtered.length)];
                    }
                }
            }
        }

        // --- 3. DEFAULT RANDOM ---
        if (wheelData.length > 0) {
            return wheelData[Math.floor(Math.random() * wheelData.length)];
        }
        return "CHARGEMENT...";
    }

    wheelElement.addEventListener('scroll', () => {
        const scrollTop = wheelElement.scrollTop;
        const scrollHeight = wheelElement.scrollHeight;
        const clientHeight = wheelElement.clientHeight;

        if (scrollTop + clientHeight > scrollHeight - 100) {
            for (let i = 0; i < 10; i++) {
                const word = getNextWord();
                const item = createWheelItem(word);
                wheelElement.appendChild(item);
            }
        }
        updateActiveItem();
    });

    function updateActiveItem() {
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

    // --- VRTX MODE (Bas-Droit) ---
    const vrtxTrigger = document.getElementById('vrtx-trigger');
    const vrtxModal = document.getElementById('vrtx-modal');
    const vrtxWordInput = document.getElementById('vrtx-word');
    const vrtxCounter = document.getElementById('vrtx-counter');
    const rankButtons = document.querySelectorAll('.rank-btn'); // VRTX ranks
    const vrtxOkBtn = document.getElementById('vrtx-ok');

    let vrtxActive = false;
    let vrtxTargetWord = "";
    let vrtxTargetRank = 1;
    let vrtxCurrentIndex = 0;

    let vrtxClickCount = 0;
    let vrtxClickTimer;
    let vrtxLongPressTimer;

    if (vrtxTrigger) {
        vrtxTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            vrtxClickCount++;
            clearTimeout(vrtxClickTimer);
            vrtxClickTimer = setTimeout(() => { vrtxClickCount = 0; }, 500);
            if (vrtxClickCount === 3) {
                openVrtxModal();
                vrtxClickCount = 0;
            }
        });
        vrtxTrigger.addEventListener('mousedown', () => { vrtxLongPressTimer = setTimeout(openVrtxModal, 1500); });
        vrtxTrigger.addEventListener('mouseup', () => clearTimeout(vrtxLongPressTimer));
        vrtxTrigger.addEventListener('mouseleave', () => clearTimeout(vrtxLongPressTimer));
        vrtxTrigger.addEventListener('touchstart', (e) => {
            e.preventDefault();
            vrtxLongPressTimer = setTimeout(openVrtxModal, 1500);
        });
        vrtxTrigger.addEventListener('touchend', () => clearTimeout(vrtxLongPressTimer));
    }

    function openVrtxModal() {
        vrtxModal.classList.remove('hidden');
        vrtxWordInput.value = '';
        vrtxCounter.textContent = '(0)';
        vrtxTargetRank = 1;
        updateRankButtons();
        vrtxWordInput.focus();
    }

    // Close modal helper
    function closeModals() {
        vrtxModal.classList.add('hidden');
        forcingModal.classList.add('hidden');
    }

    vrtxWordInput.addEventListener('input', () => {
        vrtxCounter.textContent = `(${vrtxWordInput.value.trim().length})`;
    });

    rankButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            vrtxTargetRank = parseInt(btn.dataset.rank);
            updateRankButtons();
        });
    });

    function updateRankButtons() {
        rankButtons.forEach(btn => {
            if (parseInt(btn.dataset.rank) === vrtxTargetRank) btn.classList.add('selected');
            else btn.classList.remove('selected');
        });
    }

    function triggerVrtxOk() {
        if (vrtxOkBtn) vrtxOkBtn.click();
    }

    if (vrtxWordInput) {
        vrtxWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerVrtxOk();
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

            if (footerText && !footerText.textContent.endsWith('.')) footerText.textContent += ".";

            const wheelTab = document.querySelector('.tab-btn[data-tab="wheel"]');
            if (wheelTab) wheelTab.click();

            // Note: Hot-Swap removed. Changes will appear after scrolling past buffer.

        } else {
            vrtxActive = false;
            if (footerText && footerText.textContent.endsWith('.')) footerText.textContent = footerText.textContent.slice(0, -1);
        }
        closeModals();
    });


    // --- FORCING MODE (Bas-Gauche) ---
    const forcingTrigger = document.getElementById('forcing-trigger');
    const forcingModal = document.getElementById('forcing-modal');
    const forcingWordInput = document.getElementById('forcing-word');
    const forcingCounter = document.getElementById('forcing-counter');
    const forcingRankButtons = document.querySelectorAll('.forcing-rank-btn');
    const forcingOkBtn = document.getElementById('forcing-ok');

    let forcingActive = false;
    let forcingTargetWord = "";
    let forcingScrollsNeeded = 1;
    let forcingScrollsCount = 0;

    let forcingClickCount = 0;
    let forcingClickTimer;
    let forcingLongPressTimer;

    if (forcingTrigger) {
        forcingTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            forcingClickCount++;
            clearTimeout(forcingClickTimer);
            forcingClickTimer = setTimeout(() => { forcingClickCount = 0; }, 500);
            if (forcingClickCount === 3) {
                openForcingModal();
                forcingClickCount = 0;
            }
        });
        forcingTrigger.addEventListener('mousedown', () => { forcingLongPressTimer = setTimeout(openForcingModal, 1500); });
        forcingTrigger.addEventListener('mouseup', () => clearTimeout(forcingLongPressTimer));
        forcingTrigger.addEventListener('mouseleave', () => clearTimeout(forcingLongPressTimer));
        forcingTrigger.addEventListener('touchstart', (e) => {
            e.preventDefault();
            forcingLongPressTimer = setTimeout(openForcingModal, 1500);
        });
        forcingTrigger.addEventListener('touchend', () => clearTimeout(forcingLongPressTimer));
    }

    function triggerForcingOk() {
        if (forcingOkBtn) forcingOkBtn.click();
    }

    if (forcingWordInput) {
        forcingWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerForcingOk();
        });
    }

    function openForcingModal() {
        forcingModal.classList.remove('hidden');
        forcingWordInput.value = '';
        forcingCounter.textContent = '(0)';
        forcingScrollsNeeded = 1;
        updateForcingRankButtons();
        setTimeout(() => forcingWordInput.focus(), 100);
    }

    if (forcingWordInput) {
        forcingWordInput.addEventListener('input', () => {
            forcingCounter.textContent = `(${forcingWordInput.value.trim().length})`;
        });
    }

    if (forcingRankButtons) {
        forcingRankButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                forcingScrollsNeeded = parseInt(btn.dataset.scrolls);
                updateForcingRankButtons();
            });
        });
    }

    function updateForcingRankButtons() {
        if (forcingRankButtons) {
            forcingRankButtons.forEach(btn => {
                if (parseInt(btn.dataset.scrolls) === forcingScrollsNeeded) btn.classList.add('selected');
                else btn.classList.remove('selected');
            });
        }
    }

    if (forcingOkBtn) {
        forcingOkBtn.addEventListener('click', () => {
            const word = forcingWordInput.value.trim().toUpperCase();
            const footerText = document.querySelector('footer p');
            if (word.length > 0) {
                forcingTargetWord = word;

                // --- CUSTOM WORD SUPPORT ---
                // Add to dictionary so it validates as "VRAI" if checked
                if (!dictionary.has(forcingTargetWord)) {
                    dictionary.add(forcingTargetWord);
                    dictionaryArray.push(forcingTargetWord); // Optional, allows it to appear in random later
                }

                forcingActive = true;
                forcingScrollsCount = 0;
                console.log("FORCING ACTIVATED target:", forcingTargetWord, "at count:", forcingScrollsNeeded);

                if (footerText && !footerText.textContent.endsWith('.')) footerText.textContent += ".";

                // Switch to wheel view
                const wheelTab = document.querySelector('.tab-btn[data-tab="wheel"]');
                if (wheelTab) wheelTab.click();

                // Disable VRTX if active
                if (vrtxActive) {
                    vrtxActive = false;
                    console.log("VRTX OVERRIDDEN");
                }

                // Note: Hot-Swap removed.

            } else {
                forcingActive = false;
                if (footerText && footerText.textContent.endsWith('.')) footerText.textContent = footerText.textContent.slice(0, -1);
            }
            closeModals();
        });
    }

});
