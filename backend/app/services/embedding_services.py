
import os
import voyageai

from dotenv import load_dotenv

load_dotenv()

client = voyageai.Client(
    api_key=os.getenv("VOYAGE_API_KEY")
)

MODEL = "voyage-4-lite"

EMBEDDING_DIMENSION = 1024


def generate_embeddings(chunks: list[str]):

    if not chunks:
        return []

    response = client.embed(
        texts=chunks,
        model=MODEL,
        input_type="document",
        output_dimension=EMBEDDING_DIMENSION
    )

    return [item for item in response.embeddings]


def generate_query_embedding(query: str):

    if not query.strip():
        raise ValueError("Query cannot be empty")

    response = client.embed(
        texts=[query],
        model=MODEL,
        input_type="query",
        output_dimension=EMBEDDING_DIMENSION
    )

    return response.embeddings[0]
