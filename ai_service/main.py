import os
import time
import json
import torch
import psycopg2
from PIL import Image
from dotenv import load_dotenv
from transformers import BlipProcessor, BlipForConditionalGeneration
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'auth_service', '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found.")
    exit(1)
if not PINECONE_API_KEY or not PINECONE_INDEX_NAME:
    print("❌ Error: PINECONE_API_KEY or PINECONE_INDEX not found.")
    exit(1)

# Connect to Database
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

# Load Models
print("🔄 Loading AI Models... (This may take a moment)")
device = "cpu"

# 1. Vision Model (BLIP) for Captioning
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

# 2. Text Embedding Model (all-mpnet-base-v2) for Pinecone
# This maps text to 768-dim vector
embedder = SentenceTransformer('all-mpnet-base-v2')

# 3. Pinecone Client
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

print("✅ AI Models & Pinecone Loaded Successfully!")

def process_image(conn, image_id, image_path):
    cursor = conn.cursor()
    try:
        if not os.path.exists(image_path):
            print(f"⚠️ File not found: {image_path}")
            cursor.execute("UPDATE \"Image\" SET \"aiProcessed\" = true, \"analysis\" = 'File missing' WHERE id = %s", (image_id,))
            conn.commit()
            return

        print(f"🧠 Analyzing Image: {image_path}...")
        start_time = time.time()

        # Load Image
        raw_image = Image.open(image_path).convert('RGB')
        
        # 1. Generate Caption (BLIP)
        inputs = processor(raw_image, return_tensors="pt").to(device)
        with torch.no_grad():
            out = model.generate(**inputs, max_new_tokens=60)
            caption = processor.decode(out[0], skip_special_tokens=True)
        
        # 2. Generate Embedding from CAPTION (Sentence Transformer)
        # We embed the TEXT description so we can search by TEXT query later
        embedding_vector = embedder.encode(caption).tolist() # [768] vector

        # 3. Upsert to Pinecone
        # Determine userId from DB to store as metadata (optional, need query)
        # For fast lookup, we just use image_id as ID
        
        # Fetch metadata from DB? (userId, filename)
        # We need to do a SELECT first if we want userId in metadata.
        cursor.execute("SELECT \"userId\", \"originalName\" FROM \"Image\" WHERE id = %s", (image_id,))
        meta_row = cursor.fetchone()
        user_id, original_name = meta_row if meta_row else ("unknown", "unknown")

        index.upsert(
            vectors=[
                {
                    "id": image_id,
                    "values": embedding_vector,
                    "metadata": {
                        "caption": caption,
                        "userId": user_id,
                        "filename": original_name,
                        "path": image_path
                    }
                }
            ]
        )

        processing_time_ms = int((time.time() - start_time) * 1000)

        # Update DB (Mark as processed, store caption)
        print(f"✅ Analysis Complete: \"{caption}\" -> Pinecone")
        
        # Note: We can still store embedding in Postgres if we want, OR just rely on Pinecone.
        # Storing in Postgres 'embedding' column as backup (it fits 768 floats).
        cursor.execute(
            "UPDATE \"Image\" SET \"aiProcessed\" = true, \"analysis\" = %s, \"embedding\" = %s, \"aiProcessingTime\" = %s WHERE id = %s",
            (caption, embedding_vector, processing_time_ms, image_id)
        )
        conn.commit()

    except Exception as e:
        print(f"❌ Error processing image {image_id}: {e}")
        conn.rollback()
        try:
             cursor.execute("UPDATE \"Image\" SET \"aiProcessed\" = true, \"analysis\" = %s WHERE id = %s", (f"Error: {str(e)}", image_id))
             conn.commit()
        except:
            pass
    finally:
        cursor.close()

def main():
    print("🚀 AI Service Started (Pinecone Enabled). Waiting for images...")
    
    while True:
        conn = get_db_connection()
        if not conn:
            time.sleep(10)
            continue

        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, path FROM \"Image\" WHERE \"aiProcessed\" = false LIMIT 1")
            row = cursor.fetchone()
            cursor.close()

            if row:
                image_id, image_path = row
                process_image(conn, image_id, image_path)
            else:
                time.sleep(2)
        
        except Exception as e:
            print(f"❌ Main Loop Error: {e}")
            time.sleep(5)
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    main()
