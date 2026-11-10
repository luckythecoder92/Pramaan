import pytest

from app.services.context_service import build_context


def test_context_builder_formats_text_and_sources():
    result = build_context(
        "What is the objective?",
        [
            {
                "text": "The  main\n objective is safety.",
                "document_id": "doc-1",
                "page_number": 2,
                "chunk_index": 0,
                "score": 0.92,
            }
        ],
    )

    assert "[Document: doc-1 | Page: 2 | Chunk: 0]" in result["context"]
    assert "The main objective is safety." in result["context"]
    assert result["sources"] == [
        {"document_id": "doc-1", "page_number": 2, "chunk_index": 0, "score": 0.92}
    ]


def test_context_builder_excludes_empty_chunks_and_enforces_budget():
    result = build_context(
        "Question",
        [
            {"text": "\x00  useful text", "document_id": "doc-1", "page_number": 1, "chunk_index": 0},
            {"text": "second chunk", "document_id": "doc-1", "page_number": 1, "chunk_index": 1},
        ],
        max_characters=60,
    )

    assert "useful text" in result["context"]
    assert result["chunks_used"] == 1


def test_context_builder_rejects_empty_question():
    with pytest.raises(ValueError, match="cannot be empty"):
        build_context("   ", [])
