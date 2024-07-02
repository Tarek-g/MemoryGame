const PEXELS_API_KEY = 'YLfmKbWARfRRsE1isLOsTsjmNQv7HmJgInDd8sR7C9m0TVH23KMx4J3D';
let data = [
    { id: 1, text: 'chien', keyword: 'dog' },
    { id: 2, text: 'chat', keyword: 'cat' },
    { id: 3, text: 'oiseau', keyword: 'bird' },
    { id: 4, text: 'poisson', keyword: 'fish' }
];

let gameData = [];
let flippedCards = [];
let matchedPairs = 0;
const matchedColors = {};
let showEnglishWords = false;

async function populateGameData() {
    gameData = [];
    for (let item of data) {
        const imageUrl = await fetchImage(item.keyword, item.text);
        gameData.push({ id: item.id, type: 'text', content: item.text });
        gameData.push({ id: item.id, type: 'image', content: imageUrl });
    }
}

async function fetchImage(keyword, fallbackText) {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${keyword}&per_page=1`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        const data = await response.json();
        if (data.photos.length > 0) {
            return data.photos[0].src.medium;
        } else {
            return fallbackText;
        }
    } catch (error) {
        return fallbackText;
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function initGame() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';
    await populateGameData();
    const shuffledData = shuffle([...gameData]);

    shuffledData.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = item.id;
        card.dataset.type = item.type;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front ${item.type}"></div>
                <div class="card-back" data-content="${item.content}">
                    ${item.type === 'text' ? `<p>${item.content}</p>` : `<img src="${item.content}" alt="image">`}
                </div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gameContainer.appendChild(card);
    });
}

function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flip')) {
        card.classList.add('flip');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.id === card2.dataset.id) {
        matchedPairs++;
        const matchColor = getRandomColor();
        matchedColors[card1.dataset.id] = matchColor;
        card1.style.borderColor = matchColor;
        card2.style.borderColor = matchColor;
        flippedCards = [];

        if (matchedPairs === gameData.length / 2) {
            alert('Vous avez trouvé toutes les paires!');
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
            flippedCards = [];
        }, 1000);
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updateData() {
    const jsonData = document.getElementById('json-data').value;
    try {
        const newData = JSON.parse(jsonData);
        if (Array.isArray(newData) && newData.every(item => item.id && item.text && item.keyword)) {
            data = newData;
            resetGame();
        } else {
            alert('Format JSON invalide. Veuillez vous assurer qu\'il s\'agit d\'un tableau d\'objets avec les propriétés "id", "text" et "keyword".');
        }
    } catch (e) {
        alert('Format JSON invalide. Veuillez vérifier votre saisie.');
    }
}

function resetGame() {
    matchedPairs = 0;
    flippedCards = [];
    initGame();
}

function toggleEnglish() {
    showEnglishWords = !showEnglishWords;
    const button = document.querySelector('.accordion-content button[onclick="toggleEnglish()"]');
    button.textContent = showEnglishWords ? 'Masquer les mots anglais' : 'Afficher les mots anglais';
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const cardInner = card.querySelector('.card-inner');
        const cardBack = card.querySelector('.card-back');
        if (showEnglishWords) {
            if (card.dataset.type === 'image') {
                cardBack.innerHTML = `<p>${data.find(item => item.id == card.dataset.id).keyword}</p>`;
                cardInner.classList.add('flip');
            }
        } else {
            if (card.dataset.type === 'image') {
                cardBack.innerHTML = `<img src="${cardBack.dataset.content}" alt="image">`;
                cardInner.classList.remove('flip');
            }
        }
    });
}

// Accordion functionality
document.addEventListener('DOMContentLoaded', () => {
    const accordionButton = document.querySelector('.accordion-button');
    const accordionContent = document.querySelector('.accordion-content');

    accordionButton.addEventListener('click', () => {
        accordionContent.style.display = accordionContent.style.display === 'block' ? 'none' : 'block';
    });

    // Start the game
    initGame();
});
