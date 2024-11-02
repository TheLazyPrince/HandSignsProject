let selectedImage = null;  // משתנה לתמונה שנבחרה
let selectedLetter = '';   // משתנה לאות שנבחרה מהתמונה
let timerInterval; // משתנה עבור הטיימר
const timerDisplay = document.getElementById('digitalTimer'); // הכנס את אלמנט ה-HTML של התצוגה של הטיימר

// משתנים נוספים
let isCorrect = false; // משתנה המצב
let correctTimeLimit = 5; // גבול הזמן להצלחה
let wrongTimeLimit = 10; // גבול הזמן לכישלון
let elapsedSeconds = 0; // משתנה לספירת השניות שחלפו

let selectedIndex = -1; // משתנה לשמירת האינדקס של התמונה שנבחרה
const images = document.querySelectorAll('.gallery img');
const selectedImageElement = document.getElementById('selectedImage');

// הפונקציה שמבצעת את החיזוי
function predict() {
    fetch('/predict')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('predictionText').textContent = ` ${data}`;

            // אם יש תמונה שנבחרה, נתחיל לבדוק את ההתאמה
            if (selectedImage) {
                checkPrediction(data);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// פונקציה לעדכון הטיימר
function updateTimer() {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // פורמט דקה:שנייה
    timerDisplay.textContent = `Timer ${displayTime}`; // עדכון התצוגה
}

// פונקציה להתחלת הטיימר
function startTimer() {
    elapsedSeconds = 0; // אפס את השניות
    clearInterval(timerInterval); // עצור טיימר קיים (אם יש)
    timerInterval = setInterval(() => {
        elapsedSeconds++; // הגדל את השניות
        updateTimer(); // עדכון התצוגה
    }, 1000); // עדכון כל שנייה
}

// פונקציה לאיפוס הטיימר
function resetTimer() {
    clearInterval(timerInterval); // עצור את הטיימר
    elapsedSeconds = 0; // אפס את השניות
    timerDisplay.textContent = "Timer 0:00"; // אפס את התצוגה
}

// פונקציה לבדיקת החיזוי מול התמונה שנבחרה והזמן שעבר
function checkPrediction(prediction) {
    if (prediction.toLowerCase() === selectedLetter.toLowerCase()) {
        isCorrect = true; // התשובה נכונה

        // עדכון הבורדר על התמונה הנבחרת בהתאם לתוצאה
        if (elapsedSeconds <= correctTimeLimit) {
            matchedBorders[selectedIndex] = "7px solid green"; // שמור בורדר ירוק
        } else if (elapsedSeconds <= wrongTimeLimit) {
            matchedBorders[selectedIndex] = "7px solid yellow"; // שמור בורדר צהוב
        } else {
            matchedBorders[selectedIndex] = "7px solid red"; // שמור בורדר אדום
        }

        // עדכון הבורדר של התמונה בגלריה
        selectedImage.style.border = matchedBorders[selectedIndex];

        clearInterval(timerInterval); // עצירת החיזוי לאחר ההתאמה
    } else {
        if (isCorrect) {
            // אם התשובה האחרונה הייתה נכונה, אל תשנה את הצבע
            return;
        }
    }
}



let matchedBorders = new Array(images.length).fill(''); // מערך לשמירת בורדרים לכל תמונה

function selectImage(index) {
    // אם יש תמונה נבחרת, יש לאפס את גבול הבורדר שלה
    if (selectedImage) {
        selectedImage.style.border = ""; // מחק את הבורדר השחור
    }

    selectedIndex = index; // עדכון האינדקס הנבחר

    // אם האינדקס תקין, נבחרת התמונה
    if (selectedIndex >= 0 && selectedIndex < images.length) {
        selectedImage = images[selectedIndex]; // הגדרת התמונה הנבחרת
        selectedImage.style.border = "5px solid black"; // גבול שחור
        selectedImageElement.src = selectedImage.src; // העתקת ה-src של התמונה שנבחרה
        selectedImageElement.style.display = "block"; // הצגת התמונה הנבחרת
        
        // חילוץ האות או המספר משם התמונה
        const srcParts = selectedImage.src.split('/');
        const fileName = srcParts[srcParts.length - 1].split('.')[0];
        selectedLetter = fileName; // עדכון האות הנבחרת
        
        // התחלת הטיימר
        startTimer(); // התחלת הטיימר
        setInterval(predict, 1000); // קריאת הפונקציה predict כל שנייה

        // עדכון הבורדרים של כל התמונות בגלריה
        images.forEach((img, i) => {
            if (matchedBorders[i]) {
                img.style.border = matchedBorders[i]; // החזרת הבורדר המותאם
            }
        });
    }
}


// ניווט בין התמונות באמצעות מקשי החיצים
document.addEventListener('keydown', function(event) {
    event.preventDefault(); // מונע את תזוזת המסך
    if (event.key === 'ArrowRight') {
        selectedIndex = (selectedIndex + 1) % images.length; // מעבר לתמונה הבאה
    } else if (event.key === 'ArrowLeft') {
        selectedIndex = (selectedIndex - 1 + images.length) % images.length; // מעבר לתמונה הקודמת
    } else if (event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 8 + images.length) % images.length; // מעבר לשורה הקודמת
    } else if (event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 8) % images.length; // מעבר לשורה הבאה
    }

    selectImage(selectedIndex); // סימון התמונה הנבחרת והצגתה
});

// הוספת אירוע לחיצה על התמונות
images.forEach(image => {
    image.addEventListener('click', () => {
        // אם לחצת שוב על אותה תמונה, לאפס את הצבע שלה ולבטל את הבחירה
        if (selectedImage === image) {
            selectedImage.style.border = ""; // גבול ברירת המחדל
            selectedImage = null;
            matchedBorders[selectedIndex] = ''; // מחק את הבורדר המותאם
            return; // יציאה מהפונקציה
        }

        // הגדרת התמונה הנבחרת החדשה
        selectImage(Array.from(images).indexOf(image)); // בחר את התמונה על ידי האינדקס
    });
});
const intro= introJs();

    intro.setOptions({
        steps:[
        {

            element:document.querySelector('.gallery'),
          
            intro: `
                    <div>
                        <p> Click on one sign to learn</p>
                        <img src="/static/images/piselect.gif" alt="Example Image" class="intro-image">
                    </div>
                    `,
                           position: 'right'
        },
        {

        element:document.querySelector('#digitalTimer'),
        intro: `
                    <div>
                        <p> The timer will show you how long it took you to learn the letter.</p>
                        <img src="/static/images/colors.png" alt="Example Image" class="intro-image" style="width:300px;">
                    </div>
                    `
        },
        {
        element:document.querySelector('#camera'),
        intro: 
        `
                    <div>
                        <p> Try to mimic its shape using the camera</p>
                        <img src="/static/images/hand.png" alt="Example Image" class="intro-image" style="width:200px;">
                    </div>
                    `,position: 'left'
        }
      
    ],
       tooltipClass: 'customTooltip'
    })
    document.querySelector('.start-steps').addEventListener('click', function(){

        intro.start();
})