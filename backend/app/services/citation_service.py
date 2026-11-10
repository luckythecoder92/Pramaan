from collections.abc import Sequence
from typing import Any


class CitationValidationError(ValueError):
    """Raised when the model returns untrusted or unsupported citations."""


def assign_evidence_references(chunks: Sequence[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Create request-scoped source IDs from retrieval output, never from model output."""
    evidence: dict[str, dict[str, Any]] = {}
    for index, chunk in enumerate(chunks, start=1):
        if not str(chunk.get("text") or "").strip():
            continue
        reference = f"S{index}"
        evidence[reference] = {
            "document_id": chunk.get("document_id"),
            "page_number": chunk.get("page_number"),
            "chunk_index": chunk.get("chunk_index"),
            "score": chunk.get("score"),
        }
    return evidence


def source_reference_map(evidence: dict[str, dict[str, Any]]) -> dict[tuple[object, object, object], str]:
    return {
        (item["document_id"], item["page_number"], item["chunk_index"]): reference
        for reference, item in evidence.items()
    }


def validate_citations(cited_source_refs: Sequence[str], evidence: dict[str, dict[str, Any]], answerable: bool) -> list[dict[str, Any]]:
    """Resolve citations exclusively from backend-owned evidence metadata."""
    if not answerable and cited_source_refs:
        raise CitationValidationError("An unanswerable response must not include citations")
    if answerable and not cited_source_refs:
        raise CitationValidationError("An answerable response must cite retrieved evidence")

    sources: list[dict[str, Any]] = []
    seen: set[str] = set()
    for reference in cited_source_refs:
        if reference not in evidence:
            raise CitationValidationError(f"Unknown citation reference: {reference}")
        if reference in seen:
            continue
        sources.append(dict(evidence[reference]))
        seen.add(reference)
    return sources
