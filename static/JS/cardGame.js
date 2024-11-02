let firstSelected = null;
let secondSelected = null;
let matchesCount = 0; // תמיד מתחילים עם 0 התאמות

function handleImageClick(event) {
    const clickedImage = event.target;

    // אם לוחצים על תמונה שכבר מותאמת, לא לאפשר לחיצה נוספת
    if (clickedImage.classList.contains('matched')) {
        return;
    }

    // אם לוחצים על אותה תמונה שנבחרה כבר, הסר את הבחירה
    if (clickedImage === firstSelected) {
        firstSelected.classList.remove('selected');
        firstSelected = null;
        return; // סיום הפונקציה כדי לא להמשיך בפעולות נוספות
    }

    // אם כבר נבחרו שתי תמונות, אפס את הבחירה הקודמת
    if (firstSelected && secondSelected) {
        resetSelection(); // אפס בחירה כדי לאפשר לחיצות נוספות
    }

    // הוסף מחלקה 'selected' לתמונה שנבחרה
    if (!firstSelected) {
        firstSelected = clickedImage;
        firstSelected.classList.add('selected');
    } else if (!secondSelected) {
        secondSelected = clickedImage;
        secondSelected.classList.add('selected');

        // בדוק התאמה בין ה-`alt` של התמונות
        if (firstSelected.alt === secondSelected.alt) {
            firstSelected.classList.remove('selected');
            firstSelected.classList.add('matched');
            secondSelected.classList.remove('selected');
            secondSelected.classList.add('matched');
            
            matchesCount++; // העלה את מספר ההתאמות
            console.log("Number of matches: ", matchesCount); // הצג את כמות ההתאמות בקונסול
            firstSelected = null;
            secondSelected = null; // אפס כדי להמשיך לבחירה הבאה

            if (matchesCount === 10) { // הצג פופ אפ אם כל ההתאמות הושלמו
                showPopup();
            }
        } else {
            setTimeout(resetSelection, 1000); // אם אין התאמה, אפס אחרי שנייה
        }
    }
}

// פונקציה לאיפוס בחירה (לא מוחקת את ה-matched)
function resetSelection() {
    if (firstSelected) firstSelected.classList.remove('selected');
    if (secondSelected) secondSelected.classList.remove('selected');
    firstSelected = null;
    secondSelected = null;
}

// הוסף מאזיני אירועים לכל התמונות
document.querySelectorAll('#lettersGallery img, #handSignGallery img').forEach(img => {
    img.addEventListener('click', handleImageClick); // מאזין אחד לשתי הגלריות
});

// פונקציה לערבב תמונות
function shuffleGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    const images = Array.from(gallery.children);
    const positions = Array.from({ length: images.length }, (_, index) => index);
    positions.sort(() => Math.random() - 0.5);

    gallery.innerHTML = '';
    positions.forEach(pos => {
        gallery.appendChild(images[pos]);
    });
}

// פונקציה שמציגה את הפופ אפ כשהמשתמש סיים את כל ההתאמות
function showPopup() {
    const popup = document.getElementById('congratulationsPopup');
    popup.style.display = 'block'; // הצג את הפופ אפ
}

// פונקציה לסגירת הפופ אפ ואיפוס המשחק
function closePopup() {
    const popup = document.getElementById('congratulationsPopup');
    popup.style.display = 'none'; // הסתר את הפופ אפ
    matchesCount = 0; // אפס את מספר ההתאמות
    console.log("Matches count reset to 0 after closing the popup."); // הדפסת כמות ההתאמות לאחר האיפוס

    // הסר את המחלקה 'matched' מכל התמונות
    document.querySelectorAll('.matched').forEach(img => {
        img.classList.remove('matched');
    });

    // ערבב מחדש את הגלריות
    shuffleGallery('lettersGallery');
    shuffleGallery('handSignGallery');
}

// קרא לפונקציה כשדף נטען
window.onload = function() {
    matchesCount = 0; // אפס את מספר ההתאמות בכל טעינה מחדש של הדף
    shuffleGallery('lettersGallery');
    shuffleGallery('handSignGallery');
    console.log("Game reset on page load. Matches count: ", matchesCount);
};

const intro = introJs();
        intro.setOptions({
            steps: [
                {
                    element: document.querySelector('#lettersGallery'), // הפעלת ה-Intro.js על כל התמונה
                    intro: `
                        <div>
                            <p>Click on letter to match </p>
                            <img src="/static/images/letterClick.gif" alt="Example Image" class="intro-image">
                        </div>
                    `,
                     position: 'right'
                },
                {
                    element: document.querySelector('#handSignGallery'), // הפעלת ה-Intro.js על כל התמונה
                    intro: `
                        <div>
                            <p>Click on hand to match </p>
                            <img src="/static/images/handClick.gif" alt="Example Image" class="intro-image">
                        </div>
                    `,
                     position: 'left'
                }
            ],
            tooltipClass: 'customTooltip'
        });
        intro.start(); // מתחיל את ה-Intro.js
  