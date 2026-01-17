from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/quicktask')

def get_db():
    client = MongoClient(MONGO_URI)
    db_name = MONGO_URI.split('/')[-1].split('?')[0]
    return client[db_name]

def get_tasks_collection():
    """Get tasks collection"""
    db = get_db()
    return db['tasks']
