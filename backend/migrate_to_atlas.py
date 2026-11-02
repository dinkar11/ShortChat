import pymongo
import sys

LOCAL_URI = "mongodb://localhost:27017/test"

def migrate(atlas_uri):
    try:
        src_client = pymongo.MongoClient(LOCAL_URI, serverSelectionTimeoutMS=5000)
        dst_client = pymongo.MongoClient(atlas_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        dst_client.admin.command('ping')
        print("Connected to MongoDB Atlas successfully!")
        
        src_db = src_client['test']
        # Extract target db name from URI or default to chatflow_db
        dst_db = dst_client.get_default_database('chatflow_db')
        
        collections = ['users', 'posts', 'chat_sessions', 'messages', 'user_tokens']
        for col_name in collections:
            docs = list(src_db[col_name].find())
            if docs:
                dst_db[col_name].delete_many({})
                dst_db[col_name].insert_many(docs)
                print(f"Migrated {len(docs)} documents into collection '{col_name}'")
            else:
                print(f"Collection '{col_name}' is empty.")
                
        print("\nAll data successfully migrated to your MongoDB Atlas cluster!")
    except Exception as e:
        print("Migration failed:", e)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        migrate(sys.argv[1])
    else:
        print("Usage: python migrate_to_atlas.py <atlas_uri>")

