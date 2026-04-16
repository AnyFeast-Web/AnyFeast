import os
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    if not firebase_admin._apps:
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(base_dir, "..", "serviceAccountKey.json")
            cred = credentials.Certificate(os.path.normpath(json_path))
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully!")
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            raise

init_firebase()
db = firestore.client()