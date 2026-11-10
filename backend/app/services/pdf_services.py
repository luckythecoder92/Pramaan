from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def extract_text(file_path:str)->str:
    reader = PdfReader(file_path)

    pages_text = []

    for pages in reader.pages:
        text = pages.extract_text() or ""
        pages_text.append(text)

    return "\n".join(pages_text)

def split_text(text:str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 700,
        chunk_overlap = 100,
        length_function = len,
        separators= ["\n\n", "\n", " ", ""]
    )

    chunks = splitter.split_text(text)

    return chunks


def page_numbers_for_chunks(file_path: str, chunks: list[str]) -> list[int | None]:
    """Map existing chunks to their source pages without changing chunking behavior."""
    reader = PdfReader(file_path)
    pages = [page.extract_text() or "" for page in reader.pages]
    page_starts = []
    offset = 0
    for page in pages:
        page_starts.append(offset)
        offset += len(page) + 1

    full_text = "\n".join(pages)
    cursor = 0
    page_numbers = []
    for chunk in chunks:
        position = full_text.find(chunk, cursor)
        if position < 0:
            position = full_text.find(chunk)
        if position < 0:
            page_numbers.append(None)
            continue
        page_number = next(
            (index + 1 for index, start in enumerate(page_starts[1:]) if position < start),
            len(pages),
        )
        page_numbers.append(page_number)
        cursor = position + max(1, len(chunk) - 100)
    return page_numbers
