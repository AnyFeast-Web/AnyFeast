import os
import firebase_admin
from firebase_admin import credentials, firestore

print("Starting duplication check...")

CRED_PATH = 'c:/Desktop/nutritionist-app-new/backend/firebase-credentials.json'
if not os.path.exists(CRED_PATH):
    CRED_PATH = 'c:/Desktop/nutritionist-app-new/backend/serviceAccountKey.json'

print(f"Using credentials from: {CRED_PATH}")

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized.")
    except Exception as e:
        print(f"Failed to init Firebase: {e}")
        exit(1)

db = firestore.client()
COLLECTION = "ingredients"

def find_duplicates():
    print("Fetching ingredients...")
    try:
        docs = db.collection(COLLECTION).stream()
        ingredients = []
        for doc in docs:
            d = doc.to_dict()
            d['id'] = doc.id
            ingredients.append(d)
        
        print(f"Total ingredients found: {len(ingredients)}")
        
        # Check by name
        name_map = {}
        duplicates = []
        
        for ing in ingredients:
            name = ing.get('name', '').strip().lower()
            if not name: continue
            
            if name in name_map:
                name_map[name].append(ing)
            else:
                name_map[name] = [ing]
                
        for name, items in name_map.items():
            if len(items) > 1:
                print(f"\nDuplicate found: '{name}'")
                for item in items:
                    print(f"  - ID: {item['id']}, Calories: {item.get('calories')}")
                duplicates.append((name, items))
                
        return duplicates
    except Exception as e:
        print(f"Query failed: {e}")
        return []

def cleanup_duplicates(duplicates):
    for name, items in duplicates:
        # Keep the first one, delete the rest
        to_delete = items[1:]
        for item in to_delete:
            print(f"Deleting duplicate of '{name}': {item['id']}")
            try:
                db.collection(COLLECTION).document(item['id']).delete()
                print("Deleted.")
            except Exception as e:
                print(f"Delete failed: {e}")

if __name__ == "__main__":
    dupes = find_duplicates()
    if dupes:
        cleanup_duplicates(dupes)
    else:
        print("No duplicates found.")
