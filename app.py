from flask import Flask, render_template, Response, jsonify, request
import cv2
import mediapipe as mp
import numpy as np
from tensorflow.keras.models import load_model
import speech_recognition as sr
from PIL import Image
import os
import random
import base64

app = Flask(__name__)
classes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
           'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
           'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
           'U', 'V', 'W', 'X', 'Y', 'Z']
# הגדרות Mediapipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands()
mp_drawing = mp.solutions.drawing_utils

# טעינת המודל שלך
model = load_model(r"hand sign model cnn tensorflow\hand_landmarks.h5")  # מסלול המודל שהעלית

recognizer = sr.Recognizer()

word_to_number = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "zero": 0,
    "ten": 10
}
# פתיחת המצלמה
camera = cv2.VideoCapture(0)
def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # המרה של הפריים מ-BGR ל-RGB עבור Mediapipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # זיהוי ידיים בפריים
            results = hands.process(frame_rgb)

            # ציור תווי הידיים על הפריים
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # קידוד הפריים לפורמט JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # החזרת התמונה כזרם
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/voice-learning')
def voiceLearning():
    return render_template('learningByAudio.html')

@app.route('/learning-letters')
def learningletters():
    return render_template('learningLetter.html')

@app.route('/test')
def test():
    return render_template('selfTest.html')

@app.route('/practicing')
def practicing():
    return render_template('practice.html')


@app.route('/learningName')
def learningName():
    return render_template('learningName.html')

@app.route('/cardGame')
def cardGame():
    return render_template('cardGame.html')

@app.route('/learning')
def learning():
    return render_template('learning.html')


@app.route('/video_feed')
def video_feed():
    # החזרת זרם וידאו
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/predict', methods=['POST', 'GET'])
def predict():
    success, frame = camera.read()
    if not success:
        return 'strange thing'
    else:
        # המרה של הפריים מ-BGR ל-RGB עבור Mediapipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # זיהוי ידיים בפריים
        results = hands.process(frame_rgb)

        # ציור תווי הידיים על הפריים
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # איסוף נקודות המפתח של היד
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    landmarks.append([landmark.x, landmark.y, landmark.z])

                # הפיכת הנקודות למערך NumPy והוספת מימד חדש
                input_data = np.array(landmarks).reshape(1, 21, 3)

                # חיזוי ה-class על ידי המודל
                prediction = model.predict(input_data)
                predicted_class = np.argmax(prediction, axis=1)[0]

                # הצגת התו המתאים לפי החיזוי
                predicted_character = classes[predicted_class]
            return (f'{predicted_character}')
        else:
            return  predicted_character

    # בדיקה שהקורדינטות הן מערך עם ערכים
    if not isinstance(coordinates, list) or len(coordinates) == 0:
        return jsonify({'error': 'Invalid input format. Expected a list of coordinates.'}), 400

    # המרה של הקורדינטות למערך NumPy בצורה המתאימה למודל
    input_data = np.array([coordinates], dtype=np.float32)
    print("Input data for model:", input_data)  # לוג - הדפסת המערך שנשלח למודל

    try:
        # הפעלת המודל על הקורדינטות
        prediction = model.predict(input_data)
        print("Model prediction:", prediction)  # לוג - הדפסת תוצאות החיזוי של המודל

        # הנחה שהמודל מחזיר אינדקס עם ההסתברות הגבוהה ביותר
        index = np.argmax(prediction)
        print("Predicted index:", index)  # לוג - הדפסת האינדקס המנובא
        
        return jsonify({'index': int(index)})
    
    except Exception as e:
        print("Error during prediction:", e)  # לוג - הדפסת שגיאה אם יש
        return jsonify({'error': 'Prediction failed'}), 500

# @app.route('/speech_recognition')
# def speech_recognition():
#     try:
#         # שימוש במיקרופון כמקור קול
#         with sr.Microphone() as source:
#             print("תגיד משהו...")
#             audio = recognizer.listen(source,timeout=5, phrase_time_limit=10)

#         # המרה של קול לטקסט באנגלית
#         text = recognizer.recognize_google(audio, language="en-US")
#         print(f"המחשב שמע: {text}")

#         if text.lower().startswith("letter ") or text.lower().startswith("number "):
#             character = text.split()[1].lower()
#             # נתיב לתיקייה עם תמונות האותיות והמספרים
#             image_folder = r"C:\Users\shall\OneDrive - Holon Institute of Technology\שולחן העבודה\html\static\Hand signs"
#             image_path = os.path.join(image_folder, f"{character}.png")
#             print(image_path)
#             try:
#                 # בדיקה אם הקובץ קיים
#                 if os.path.exists(image_path):
#                     if text.lower().startswith("letter "):
#                         return jsonify({ "image": f"{character}.png"})
#                     elif text.lower().startswith("number "):
#                         if character in word_to_number:
#                             # number = word_to_number[character]
#                             return jsonify({ "image": f"{character}.png"})
#                         else:
#                             return jsonify({"message": f"לא הצלחנו לזהות את המספר: {character}"})
#                 else:
#                     return jsonify({"message": f"לא נמצאה תמונה עבור {character}"})
#             except OSError:
#                 return jsonify({"message": "בעיה בטעינת התמונה"})
#         else:
#             return jsonify({"message": "לא הצלחנו לזהות רק אות או מספר"})
#     except sr.UnknownValueError:
#         return jsonify({"message": "לא הצלחתי להבין מה אמרת"})
#     except sr.RequestError as e:
#         return jsonify({"message": f"בעיה בהתחברות לשירות הזיהוי: {e}"})

@app.route('/speech_recognition', methods=['GET'])
def speech_recognition():
    try:
        while True:
            with sr.Microphone() as source:
                print("תגיד משהו...")
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
            text = recognizer.recognize_google(audio, language="en-US")
            print(f"המחשב שמע: {text}")
            if text.lower().startswith("letter "):
                character = text.split()[1].lower()
                image_folder = r"static\images\hand sign none"
                image_path = os.path.join(image_folder, f"{character}.png")
                print(image_path)
                if os.path.exists(image_path):
                    return jsonify({ "image": f"{character}.png"})
                else:
                    return jsonify({"message": f"לא נמצאה תמונה עבור האות {character}"})
            elif text.lower().startswith("number "):
                character = text.split()[1].lower()
                image_folder = r"static\images\hand sign none"
                image_path = os.path.join(image_folder, f"{character}.png")
                print(image_path)
                if os.path.exists(image_path):
                    return jsonify({ "image": f"{character}.png"})
                else:
                    return jsonify({"message": f"לא נמצאה תמונה עבור המספר {character}"})
            else:
                print("לא הצלחנו לזהות רק אות או מספר")
                return jsonify({"message": "לא הצלחנו לזהות רק אות או מספר"})
    except sr.UnknownValueError:
        return jsonify({"message": "לא הצלחתי להבין מה אמרת"})
    except sr.RequestError as e:
        return jsonify({"message": f"בעיה בהתחברות לשירות הזיהוי: {e}"})

letter_to_image = {
    'a': 'static/images/Hand signs/a.png',
    'b': 'static/images/Hand signs/b.png',
    'c': 'static/images/Hand signs/c.png',
    'd': 'static/images/Hand signs/d.png',
    'e': 'static/images/Hand signs/e.png',
    'f': 'static/images/Hand signs/f.png',
    'g': 'static/images/Hand signs/g.png',
    'h': 'static/images/Hand signs/h.png',
    'i': 'static/images/Hand signs/i.png',
    'j': 'static/images/Hand signs/j.png',
    'k': 'static/images/Hand signs/k.png',
    'l': 'static/images/Hand signs/l.png',
    'm': 'static/images/Hand signs/m.png',
    'n': 'static/images/Hand signs/n.png',
    'o': 'static/images/Hand signs/o.png',
    'p': 'static/images/Hand signs/p.png',
    'q': 'static/images/Hand signs/q.png',
    'r': 'static/images/Hand signs/r.png',
    's': 'static/images/Hand signs/s.png',
    't': 'static/images/Hand signs/t.png',
    'u': 'static/images/Hand signs/u.png',
    'v': 'static/images/Hand signs/v.png',
    'w': 'static/images/Hand signs/w.png',
    'x': 'static/images/Hand signs/x.png',
    'y': 'static/images/Hand signs/y.png',
    'z': 'static/images/Hand signs/z.png'
}

# משתנים גלובליים לאחסון שם המשתמש וכתובות התמונות
user_name = ""
image_urls = []



@app.route('/save_name', methods=['POST', 'GET'])
def save_name():
    global user_name, image_urls  # הוספת המערך לכתובות התמונות
    
    # אם המשתמש לוחץ על כפתור 'clear'
    if request.method == 'POST' and 'action' in request.form and request.form['action'] == 'clear':
        user_name = ""  # נקה את השם
        image_urls = []  # נקה את המערך של כתובות התמונות
        return render_template('learningName.html', images=None)  # הצג את הדף בלי תמונות

    # אם המשתמש לוחץ על כפתור 'save'
    elif request.method == 'POST' and 'action' in request.form and request.form['action'] == 'save':
        user_name = request.form['username'].lower()  # קבלת השם מהטופס והמרתו לאותיות קטנות
        
        # יצירת מערך של כתובות תמונות לפי הסדר
        image_urls = []
        for letter in user_name:
            if letter in letter_to_image:
                image_urls.append(letter_to_image[letter])  # הוספת התמונה למערך לפי הסדר
        
        return render_template('learningName.html', images=image_urls)  # הצגת התמונות ב-HTML

    # במקרה של GET (כאשר הדף מרוענן)
    else:
        user_name = ""  # איפוס השם
        image_urls = []  # איפוס התמונות
        return render_template('learningName.html', images=None)  # הצגת הדף ריק

@app.route('/capture')
def capture():
    success, frame = camera.read()
    if not success:
        return jsonify({'error': 'Failed to capture image from camera'}), 500
    else:
        # המרה של הפריים מ-BGR ל-RGB עבור Mediapipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # זיהוי ידיים בפריים
        results = hands.process(frame_rgb)

        # ציור תווי הידיים על הפריים גם אם אין ידיים
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # איסוף נקודות המפתח של היד
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    landmarks.append([landmark.x, landmark.y, landmark.z])

                # הפיכת הנקודות למערך NumPy והוספת מימד חדש
                input_data = np.array(landmarks).reshape(1, 21, 3)

                # חיזוי ה-class על ידי המודל
                prediction = model.predict(input_data)
                predicted_class = np.argmax(prediction, axis=1)[0]

                # הצגת התו המתאים לפי החיזוי
                predicted_character = classes[predicted_class]

                # ציור התו על התמונה
                cv2.putText(frame, predicted_character, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # המרה בחזרה ל-BGR כדי להציג את התמונה
        ret, buffer = cv2.imencode('.jpg', frame)
        
        img_str = base64.b64encode(buffer).decode('utf-8')  # המרת התמונה לבסיס 64 להצגה ב-HTML
        # החזרת התמונה והתחזית ללקוח
        return jsonify({'image': img_str, 'prediction': predicted_character if results.multi_hand_landmarks else 'לא נמצאה יד'})

@app.route('/random_character', methods=['GET'])
def random_character_endpoint():
    global random_character
    random_character = random.choice(classes)  # גרילה של אות אקראית חדשה
    return jsonify({'random_character': random_character})

@app.route('/check_prediction', methods=['POST'])
def check_prediction():
    data = request.get_json()
    predicted_character = data.get('predicted_character')
    
    if predicted_character == random_character:
        result = 'correct'
    else:
        result = 'uncorrect'
    
    return jsonify({'result': result})

@app.route('/video_feed_pilot')
def video_feed_pilot():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)