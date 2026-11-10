from pathlib import Path
from uuid import uuid4
from app.services.embedding_services import generate_embeddings
from app.services.pdf_services import extract_text, page_numbers_for_chunks, split_text
from app.services.auth_service import get_current_user
from app.services.qdrant_services import create_collection, delete_document_vectors, store_chunks
from app.services.supabase_repository_service import create_document, delete_document_record, get_owned_document, list_documents, update_document
from app.services.storage_service import delete_pdf, upload_pdf
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException


router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_path = UPLOAD_DIR / f"{uuid4().hex}.pdf"
    size = 0

    try:
        with file_path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)

                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File exceeds 10 MB limit"
                    )

                destination.write(chunk)

        if size == 0:
            file_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )
        extracted_text = extract_text(str(file_path))
        chunks = split_text(extracted_text)
        document_id = str(uuid4())
        storage_path = f"{current_user['id']}/{document_id}/{Path(file.filename).name}"

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No extractable text was found in the PDF"
            )

        page_numbers = page_numbers_for_chunks(str(file_path), chunks)

        chunk_metadata = []

        for index, chunk in enumerate(chunks):

            metadata = {
                "chunk_id": f"{document_id}_{index}",
                "document_id": document_id,
                "source_name": file.filename,
                "chunk_index": index,
                "page_number": page_numbers[index],
                "user_id": current_user["id"],
            }

            chunk_metadata.append(metadata)

        try:
            await upload_pdf(storage_path, file_path.read_bytes())
            await create_document(document_id, current_user["id"], file.filename, storage_path)
            create_collection()
            embeddings = generate_embeddings(chunks)
            stored_chunks = store_chunks(document_id, current_user["id"], chunks, embeddings, chunk_metadata)
            try:
                await update_document(current_user["id"], document_id, {"chunk_count": stored_chunks, "status": "ready"})
            except Exception:
                delete_document_vectors(current_user["id"], document_id)
                raise
        except Exception as error:
            try:
                await delete_pdf(storage_path)
                await delete_document_record(current_user["id"], document_id)
            except Exception:
                pass
            raise HTTPException(
                status_code=502,
                detail="Document processing could not store vectors"
            ) from error

        return {
              "message": "Document uploaded and processed",
              "document_id":document_id,
              "filename": file.filename,
              "size_bytes": size,
              "text_length": len(extracted_text),
              "text_chunks": len(chunks),
              "stored_chunks": stored_chunks,
              "chunks_preview": chunks[:3]
          }

    except Exception:
        file_path.unlink(missing_ok=True)
        raise

    finally:
        await file.close()


@router.get("/api/v1/documents")
async def get_documents(current_user: dict = Depends(get_current_user)):
    return {"success": True, "documents": await list_documents(current_user["id"])}


@router.delete("/api/v1/documents/{document_id}")
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    document = await get_owned_document(current_user["id"], document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        delete_document_vectors(current_user["id"], document_id)
        await delete_pdf(document["storage_path"])
        await delete_document_record(current_user["id"], document_id)
    except Exception as error:
        raise HTTPException(status_code=502, detail="Unable to delete document") from error
    return {"success": True, "document_id": document_id}
