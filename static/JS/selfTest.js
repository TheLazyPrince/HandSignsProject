let predictedCharacter = '';
let countdown;
let correctCount = 0;
let wrongCount = 0;
let totalGuesses = 0;
let errors = [];

window.onload = function() {
    showEntryPopup(); // הצגת פופ-אפ בכניסה
    document.getElementById('startContainer').style.display = 'block'; 
    document.getElementById('startButton').onclick = startTest;
};

function showEntryPopup() {
    document.getElementById('entryPopup').style.display = 'block';
}

function closeEntryPopup() {
    document.getElementById('entryPopup').style.display = 'none';
}

function startTest() {
    document.getElementById('startContainer').style.display = 'none';
    getRandomCharacter();
    startCountdown();
}

// פונקציית הגרלה מעודכנת שתגריל גם אותיות וגם מספרים
function getRandomCharacter() {
    const randomType = Math.random() < 0.5 ? 'letter' : 'number'; // קובע אם להגריל אות או מספר
    const randomCharElement = document.getElementById('randomCharacter');
    const titleElement = document.getElementById('title-letter'); // ייצוג הכותרת

    if (randomType === 'letter') {
        fetch('/random_character') // בקשה מהשרת להגריל אות
        .then(response => response.json())
        .then(data => {
            randomCharElement.innerText = data.random_character;
            randomCharElement.style.display = 'block';
            titleElement.innerText = 'Letter'; // עדכון הכותרת בהתאם לאות
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        const randomNumber = Math.floor(Math.random() * 11); // הגרלת מספר בין 0 ל-10
        randomCharElement.innerText = randomNumber;
        randomCharElement.style.display = 'block';
        titleElement.innerText = 'Number'; // עדכון הכותרת בהתאם למספר
    }
}

function startCountdown() {
    let timeLeft =5; // זמן התחלתי של 5 שניות

    updateTimerStyle(timeLeft);

    countdowni = setInterval(function() {
        // עדכון הטיימר לתצוגה
        document.getElementById('timer').innerText = timeLeft; // הצגת השניות הנותרות

        timeLeft -= 1;
        updateTimerStyle(timeLeft);

        // עצירת הספירה כאשר הזמן נגמר
        if (timeLeft < 0) {
            clearInterval(countdowni);
            captureImage(); // קריאה לפונקציה לצילום
           
        }

    }, 1000);
}




function updateTimerStyle(timeLeft) {
    const timerElement = document.getElementById('timer');
    if (timeLeft <= 1) {
        timerElement.className = 'low';
    } else if (timeLeft <= 3) {
        timerElement.className = 'medium';
    } else {
        timerElement.className = 'high';
        console.log(timeLeft)
        console.log("high")
    }
}

function captureImage() {
    fetch('/capture')
    .then(response => response.json())
    .then(data => {
        if (data.image) {
            let capturedImage = document.getElementById('capturedImage');
            capturedImage.src = 'data:image/jpeg;base64,' + data.image;
            capturedImage.style.display = 'none';
            predictedCharacter = data.prediction; // חיזוי מהמודל
            document.getElementById('predictionResult').innerText = predictedCharacter;
            sendPrediction();
        } else {
            alert("שגיאה בעת צילום התמונה");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function sendPrediction() {
    const correctCharacter = document.getElementById('randomCharacter').innerText; // הערך הנכון מההגרלה

    fetch('/check_prediction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ predicted_character: predictedCharacter })
    })
    .then(response => response.json())
    .then(data => {
        if (correctCharacter === predictedCharacter) {
            correctCount++;
            document.getElementById('correctCount').innerText = correctCount;
        } else {
            wrongCount++;
            document.getElementById('wrongCount').innerText = wrongCount;

            // שמירת תמונה ונתונים על הטעות
            errors.push({
                image: document.getElementById('capturedImage').src,
                correctCharacter: correctCharacter, // הערך שהוגרל
                predictedCharacter: predictedCharacter // הערך שנחזה
            });
        }

        totalGuesses++;
        if (totalGuesses >= 3) {
            showEndGamePopup();
        } else {
            
            startCountdown();
            getRandomCharacter();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function showEndGamePopup() {
    grade(); // הצגת הציון הכולל

    const errorsContainer = document.querySelector('.errors-container');
    errorsContainer.innerHTML = ''; // ניקוי טעויות קודמות

    errors.forEach((error, index) => {
        const errorElement = `
            <div>
                <p style="font-size: 22px"><strong>Mismatch ${index + 1}:</strong></p>
                <img src="${error.image}" alt="Error Image" style="width: 120px; height: 120px; border: 5px solid  #bcd4f4c6 ">
                <div style="background-color: #f0f8ff; border-radius: 10px; margin-top: 2px;">
                    <p style="font-size: 18px">Expected: <strong>${error.correctCharacter}</strong></p>
                    <p  style="font-size: 18px">Predicted: <strong>${error.predictedCharacter}</strong></p>
                </div>
            </div>
        `;
        errorsContainer.innerHTML += errorElement;
    });

    document.getElementById('endGamePopup').style.display = 'block';
}

function grade() {
    const correctCount = parseInt(document.getElementById('correctCount').innerText);
    const totalQuestions = 3;
    const score = Math.round((correctCount / totalQuestions) * 100);
    document.getElementById('scoreDisplay').innerText = ` ${score}%`;

    let imageUrl = '';
    
    if (score == 100) {
        imageUrl = '/static/images/excellent.png'; // תמונה עבור 100%
    } else if (score >= 80 && score < 100) {
        imageUrl = '/static/images/good.png'; // תמונה עבור 80% ומעלה
    } else if (score >= 50 && score <= 70 ) {
        imageUrl = '/static/images/fine.png'; // תמונה עבור 50% ומעלה
    } else {
        imageUrl = '/static/images/bad.png'; // תמונה עבור פחות מ-50%
    }

    const resultImage = document.getElementById('resultImage');
    resultImage.src = imageUrl;
    resultImage.style.display = 'block';
}

function finishGame() {
    resetGame();
    document.getElementById('endGamePopup').style.display = 'none';
}

function resetGame() {
    correctCount = 0;
    wrongCount = 0;
    totalGuesses = 0;
    errors = []; // נקה את רשימת הטעויות
    document.getElementById('correctCount').innerText = correctCount;
    document.getElementById('wrongCount').innerText = wrongCount;
    document.getElementById('capturedImage').style.display = 'none';
    document.getElementById('randomCharacter').style.display = 'none';
    document.getElementById('timer').innerText = '5';
    document.getElementById('timer').className = '';
    document.getElementById('startContainer').style.display = 'block';
}
