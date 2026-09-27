"""
MongoDB database connection
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import MONGO_URI, MONGO_DBNAME
import logging

from typing import Optional, Dict


logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DBNAME]


async def get_user_by_email(email: str) -> Optional[Dict]:
    return await db.store.find_one({"email": email})


async def create_indexes():
    """Create MongoDB indexes"""
    try:
        await db.store.create_index("email", unique=True)
        await db.files.create_index("email")
        await db.chat_history.create_index("email")
        await db.doctors.create_index("specialization")
        await db.doctors.create_index("city")
        await db.medicine_catalog.create_index("name")
        await db.medicine_catalog.create_index([("active", 1), ("is_demo", 1)])
        await db.medicine_orders.create_index([("email", 1), ("created_at", -1)])
        logger.info("Database indexes created")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


def close_connection():
    """Close database connection"""
    client.close()
