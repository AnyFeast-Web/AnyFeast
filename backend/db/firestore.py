import firebase_admin
from firebase_admin import credentials, firestore
from core.config import settings

def init_firebase():
    """Initializes the Firebase Admin SDK."""
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully!")
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            raise

init_firebase()
db = firestore.client()
