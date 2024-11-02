let recognizedLetters = [];
let currentIndex = 0; // משתנה לעקוב אחר מיקום ההתאמה הנוכחית

function resetImagesOpacity() {
const imagesContainer = document.querySelector('.images');
if (imagesContainer) {
const images = imagesContainer.querySelectorAll('img');
images.forEach((img, index) => {
    if (index === 0) {
        img.style.opacity = '1'; // התמונה הראשונה נשארת עם opacity 1
        img.style.backgroundColor = 'transparent'; // הרקע שקוף
    } else {
        img.style.opacity = '0.4'; // כל שאר התמונות מקבלות opacity 0.4
        img.style.backgroundColor = 'transparent'; // הרקע שקוף
    }
});
}   
}


function getLettersFromImages(predictedLetter) {
    const imagesContainer = document.querySelector('.images');
    if (imagesContainer) {
        const images = imagesContainer.querySelectorAll('img');
        
        // המרה של החיזוי לאותיות גדולות
        const upperPredictedLetter = predictedLetter.toUpperCase();

        // נתחיל לבדוק מהתמונה הנוכחית ואילך
        for (let i = currentIndex; i < images.length; i++) {
            const img = images[i];
            const imageName = img.src.split('/').pop(); // מקבל את שם הקובץ
            const letter = imageName.split('.')[0].trim().toUpperCase(); // מפריד את שם הקובץ מהסיומת וממיר לאותיות גדולות

            // אם האות מהתמונה הנוכחית שווה לחיזוי
            if (letter === upperPredictedLetter) {
                 img.style.opacity = '1'; // קביעת opacity ל-1 עבור התמונה המתאימה
                // אם זיהינו את האות הקודמת
                if (i === currentIndex) {
                    recognizedLetters.push(letter); // הוספה למערך של אותיות שזוהו
                    currentIndex++; // התקדמות לאות הבאה
                    updateImageStyles(); // עדכון הסגנון של התמונות
                    break; // יוצאים מהלולאה
                }
            } else if (i === currentIndex) {
                // אם לא זיהינו את האות הנוכחית, נתקדם לאות הבאה
                break; // יוצאים מהלולאה
            }
        }
    } else {
        console.log('No images found.');
    }
}

function predict() {
    fetch('/predict') // API for the GET request
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // עדכון הטקסט של החיזוי
            const predictedLetter = data.trim();
            document.getElementById('predictionText').textContent = ` ${predictedLetter}`;

            // קריאה לפונקציה שמעדכנת את התמונות לפי החיזוי
            getLettersFromImages(predictedLetter);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function updateImageStyles() {
const imagesContainer = document.querySelector('.images');
if (imagesContainer) {
const images = imagesContainer.querySelectorAll('img');

images.forEach((img, index) => {

if (index < currentIndex) {
    img.style.padding = '5px'; // מוסיף padding לתמונה שזוהתה
    img.style.backgroundColor = 'green'; // מגדיר רקע ירוק
   
} else if (index === currentIndex) {
    img.style.opacity = '1'; // התמונה שמחכה לחיזוי עם opacity 1
    img.style.backgroundColor = 'transparent'; // הרקע שקוף
} else {
    img.style.opacity = '0.4'; // שאר התמונות ב-opacity 0.4
    img.style.backgroundColor = 'transparent'; // הרקע שקוף
}
});
}
}

// הפעלת פונקציית החיזוי כל שנייה
setInterval(predict, 1500);

function startIntro() {
    const intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: document.querySelector('.images'), // הפעלת ה-Intro.js על כל התמונה
                intro: `
                    <div>
                        <p>Try to sign your name with your hands </p>
                        <img src="/static/images/handTranspare.png" alt="Example Image" class="intro-image">
                    </div>
                `
            }
        ],
        tooltipClass: 'customTooltip'
    });
    intro.start(); // מתחיל את ה-Intro.js
}