import pytest

from app.services.citation_service import CitationValidationError, assign_evidence_references, validate_citations


def evidence():
    return assign_evidence_references([
        {"text": "first", "document_id": "doc-a", "page_number": 2, "chunk_index": 0, "score": 0.9},
        {"text": "second", "document_id": "doc-b", "page_number": 4, "chunk_index": 1, "score": 0.8},
    ])


def test_valid_citations_resolve_backend_metadata_and_deduplicate():
    sources = validate_citations(["S2", "S2", "S1"], evidence(), answerable=True)
    assert [source["document_id"] for source in sources] == ["doc-b", "doc-a"]
    assert sources[0]["page_number"] == 4


def test_unknown_citation_is_rejected():
    with pytest.raises(CitationValidationError, match="Unknown"):
        validate_citations(["S9"], evidence(), answerable=True)


def test_unanswerable_response_cannot_cite():
    with pytest.raises(CitationValidationError, match="unanswerable"):
        validate_citations(["S1"], evidence(), answerable=False)


def test_answerable_response_requires_citation():
    with pytest.raises(CitationValidationError, match="must cite"):
        validate_citations([], evidence(), answerable=True)
