import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient, models

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key= os.getenv("QDRANT_API_KEY")
)

COLLECTION_NAME = "pramaan documents"

def create_collection():
    if not client.collection_exists(COLLECTION_NAME):

        client.create_collection(
             collection_name=COLLECTION_NAME,
             vectors_config= models.VectorParams(
                 size = 1536,
                 distance = models.Distance.COSINE
             )
        )

    return "COLLECTION_READY"