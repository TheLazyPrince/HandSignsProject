const images = [  'a.png', 'b.png', 'c.png', 'd.png', 'e.png', 'f.png', 'g.png', 'h.png', 'i.png', 'j.png', 
    'k.png', 'l.png', 'm.png', 'n.png', 'o.png', 'p.png', 'q.png', 'r.png', 's.png', 't.png', 
    'u.png', 'v.png', 'w.png', 'x.png', 'y.png', 'z.png',  'zero.png', 'one.png', 'two.png', 
    'three.png', 'four.png', 'five.png', 'six.png', 'seven.png', 'eight.png', 'nine.png', 'ten.png'];
  
  let currentLetter = ''; 
  const micDefaultImage = "../static/images/wired-outline-188-microphone-recording-hover-recording.png";
  const micRecordingImage = "../static/images/wired-outline-188-microphone-recording-loop-recording.gif"; 
  const micImageElement = document.getElementById('micImage');
  
  // פונקציה להגרלת תמונה אקראית
  function displayImage(imageElement) { 
    const selectedImageSrc = imageElement.src; // הנתיב של התמונה שנבחרה מהגלריה
    const randomImageElement = document.getElementById('randomImage'); 
    randomImageElement.src = selectedImageSrc; 
    randomImageElement.style.display = 'block'; // הצגת התמונה שנבחרה מהגלריה
  }
  
  let matchedIndexes = []; // מערך לשמירת כל האינדקסים של התמונות שבהן הייתה התאמה
  let correctImagePath = ''; // משתנה לשמור את הנתיב של התמונה הנכונה
  let correctImageName = ''; // משתנה לשמור את שם התמונה הנכונה
  function startSpeechRecognition() { 
      // מסתירים את כפתור "הצג תשובה" לפני שמתחילים זיהוי דיבור
      document.getElementById('showAnswerButton').style.display = 'none';
  
      micImageElement.src = micRecordingImage;
      micImageElement.classList.add('gif-image');
      
      // קריאה לשרת להתחלת זיהוי דיבור
      fetch('/speech_recognition') // API להתחלת זיהוי דיבור
      .then(response => response.json())
      .then(data => {
          document.getElementById('speechResult').textContent = data.message; 
          if (data.image) { 
              const imagePath = `/static/images/Hand signs/${data.image}`; 
              const randomImageElement = document.getElementById('randomImage');
  
              const letterFromImage = data.image.split('.')[0]; // לוקחים את החלק הראשון לפני הנקודה
              const selectedImageSrc = galleryImages[selectedIndex].src.split('/').pop().split('.')[0]; // שם התמונה הנבחרת מהגלריה
  
              if (letterFromImage === selectedImageSrc) {
                  console.log("התאמה בין האותות!");
  
                  // הוספת האינדקס למערך ההתאמות
                  if (!matchedIndexes.includes(selectedIndex)) {
                      matchedIndexes.push(selectedIndex);
                  }
  
                  // החלפת התמונה הנבחרת בתמונה מהדיבור
                  randomImageElement.src = imagePath;
                  randomImageElement.style.backgroundColor = 'green';
                  randomImageElement.style.padding = '10px';
                 
                  // סימון התמונה בגלריה עם בורדר ירוק
                  galleryImages[selectedIndex].style.border = '7px solid green';
                  document.getElementById('showAnswerButton').style.display = 'none'; // מסתירים את הכפתור אם הייתה התאמה
              } else { 
                  console.log("אין התאמה."); 
                  randomImageElement.style.backgroundColor = 'red'; // רקע אדום במקרה של אי התאמה
                  randomImageElement.style.padding = '10px';
  
                  // שמירת התמונה הנכונה
                  correctImagePath = imagePath;
  
                  // שמירת שם התמונה הנכונה
                  correctImageName = selectedImageSrc; // שומר את שם התמונה מהגלריה
  
                  document.getElementById('showAnswerButton').style.display = 'block'; // מראים את הכפתור במקרה של חוסר התאמה
              }
          }
          setTimeout(() => {
              micImageElement.src = micDefaultImage; // חזרה לתמונה המקורית
              micImageElement.classList.remove('gif-image'); 
          }, 500);
      })
      .catch(error => { 
          console.error('שגיאה במהלך זיהוי הדיבור:', error); 
          micImageElement.src = micDefaultImage; // חזרה לתמונה המקורית במקרה של שגיאה
      }); 
  }
  
  
  window.onload = function() {
    // קריאה אוטומטית להגרלת התמונה הראשונה בעת טעינת הדף
  };
  
  
  
  let selectedIndex = 0; // התמונה הנבחרת הראשונה
  const galleryImages = document.querySelectorAll('.gallery img');
  
  
  document.getElementById('showAnswerButton').addEventListener('click', function() {
       // חיפוש התמונה המתאימה מהתקייה "hand signs"
       const correctImagePath = `/static/images/Hand signs/${correctImageName}.png`; // עדכן כאן את הסיומת אם זה שונה
  
  // הצגת התמונה הנכונה
  const randomImageElement = document.getElementById('randomImage');
  randomImageElement.src = correctImagePath; // הצגת התמונה הנכונה
  
  });
  
  
  
  // פונקציה לסמן תמונה נבחרת
  function selectImage(index) {
      galleryImages.forEach((img, i) => {
          img.classList.remove('selected'); // הסרת הסימון מכל התמונות
          
          // שמירה על הבורדר הירוק עבור כל התמונות המותאמות
          if (matchedIndexes.includes(i)) {
              img.style.border = '7px solid green'; // השארת הבורדר הירוק על התמונות המותאמות
          } else {
              img.style.border = ''; // איפוס הבורדרים של התמונות שלא התאימו
          }
      });
  
      galleryImages[index].classList.add('selected'); // הוספת הסימון לתמונה הנוכחית
      galleryImages[index].style.border = '5px solid #bacfe9'; // סימון התמונה הנבחרת עם בורדר כחול
  
      const randomImageElement = document.getElementById('randomImage');
      
      // איפוס צבעי הרקע והבורדר של התמונה שמעל המיקרופון
      randomImageElement.style.backgroundColor = ''; 
      randomImageElement.style.padding = '';
      randomImageElement.style.border = ''; 
  
      // הסתרת התמונה שנקלטה מהדיבור
      const speechImageElement = document.getElementById('speechImage');
      speechImageElement.style.display = 'none';
      
      // הצגת התמונה הנבחרת מעל המיקרופון
      randomImageElement.src = galleryImages[index].src; 
      randomImageElement.style.display = 'block'; 
      // מסתירים את כפתור "הצג תשובה" במקרה של בחירה בתמונה חדשה
      document.getElementById('showAnswerButton').style.display = 'none'; 
  }
  
  // עדכון פונקציית displayImage להתאמה ללחיצה עם עכבר
  function displayImage(imageElement) {
      galleryImages.forEach((img, index) => {
          img.classList.remove('selected'); // הסרת הסימון מכל התמונות
          img.style.border = ''; // איפוס הבורדרים של כל התמונות
          if (img === imageElement) {
              selectedIndex = index; // עדכון selectedIndex כדי שמקשי החצים יתחילו מהתמונה שנלחצה
          }
      });
  
      // שמירה על הבורדר הירוק עבור כל התמונות המותאמות
      matchedIndexes.forEach(i => {
          galleryImages[i].style.border = '7px solid green'; // החזרת הבורדר הירוק לתמונות המותאמות
      });
  
      // הוספת סימון לתמונה הנלחצת
      imageElement.classList.add('selected');
      imageElement.style.border = '5px solid #bacfe9'; // סימון התמונה הנלחצת
  
      const randomImageElement = document.getElementById('randomImage');
      
      // איפוס צבעי הרקע והבורדר של התמונה שמעל המיקרופון
      randomImageElement.style.backgroundColor = ''; // הסרת הרקע (הירוק או האדום)
      randomImageElement.style.padding = ''; // הסרת ה-padding
      randomImageElement.style.border = ''; // הסרת הבורדר
  
      // הצגת התמונה הנבחרת מעל המיקרופון
      randomImageElement.src = imageElement.src; 
      randomImageElement.style.display = 'block'; 
      // מסתירים את כפתור "הצג תשובה" במקרה של בחירה בתמונה חדשה
      document.getElementById('showAnswerButton').style.display = 'none'; 
  }
  // האזנה לאירועי מקלדת
  document.addEventListener('keydown', function(event) {
      if (event.key === 'ArrowRight') {
          event.preventDefault(); // מונע את תזוזת המסך
          selectedIndex = (selectedIndex + 1) % galleryImages.length; // מעבר לתמונה הבאה
      } else if (event.key === 'ArrowLeft') {
          event.preventDefault(); // מונע את תזוזת המסך
          selectedIndex = (selectedIndex - 1 + galleryImages.length) % galleryImages.length; // מעבר לתמונה הקודמת
      } else if (event.key === 'ArrowUp') {
          event.preventDefault(); // מונע את תזוזת המסך
          selectedIndex = (selectedIndex - 8 + galleryImages.length) % galleryImages.length; // מעבר לשורה הקודמת
      } else if (event.key === 'ArrowDown') {
          event.preventDefault(); // מונע את תזוזת המסך
          selectedIndex = (selectedIndex + 8) % galleryImages.length; // מעבר לשורה הבאה
      }
  
      selectImage(selectedIndex); // סימון התמונה הנבחרת והצגתה
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

      element:document.querySelector('#micImage'),
      intro: `
                  <div>
                      <p> Click to say the answer</p>
                      <img src="/static/images/letterNumber.png" alt="Example Image" class="intro-image" ">
                  </div>
                  `,
                     position: 'left'
      }
     
    
  ],
     tooltipClass: 'customTooltip'
  })
  document.querySelector('.start-steps').addEventListener('click', function(){

      intro.start();
})