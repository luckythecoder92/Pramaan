# Graph Report - Pramaan  (2026-11-11)

## Corpus Check
- 110 files · ~26,983 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .db 1, .example 1)

## Summary
- 614 nodes · 1616 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4df1e698`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- qdrant_services.py
- eval_retrieval.py
- test_multitenant.py
- lucide-react
- test_chat_service.py
- chat_service.py
- test_llm_service.py
- documents.py
- AuthContext.tsx
- package.json
- react
- CitationValidationError
- routes/chat.py
- build_context
- compilerOptions
- useSpeechRecognition.ts
- generate_answer
- cn
- vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 35 edges
2. `cn()` - 31 edges
3. `react` - 28 edges
4. `react-router-dom` - 21 edges
5. `useToast()` - 19 edges
6. `getApiErrorMessage()` - 19 edges
7. `useAuth()` - 19 edges
8. `answer_question()` - 18 edges
9. `get_settings()` - 17 edges
10. `run()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `_response()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/chat_service.py → backend/app/schemas/chat.py
- `generate_answer()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/llm_service.py → backend/app/schemas/chat.py
- `_response_schema()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/llm_service.py → backend/app/schemas/chat.py
- `chat()` --uses--> `CitationValidationError`  [INFERRED]
  backend/app/routes/chat.py → backend/app/services/citation_service.py
- `chat()` --uses--> `LLMServiceError`  [INFERRED]
  backend/app/routes/chat.py → backend/app/services/llm_service.py

## Import Cycles
- None detected.

## Communities (22 total, 4 thin omitted)

### Community 0 - "qdrant_services.py"
Cohesion: 0.06
Nodes (26): ask_question(), semantic_search(), QuestionRequest, SearchRequest, generate_embeddings(), generate_query_embedding(), _create_client(), create_collection() (+18 more)

### Community 1 - "eval_retrieval.py"
Cohesion: 0.15
Nodes (18): collapse(), display_document(), format_percent(), is_rate_limit_error(), load_document_rows(), load_questions(), main(), parse_args() (+10 more)

### Community 3 - "test_multitenant.py"
Cohesion: 0.14
Nodes (16): database_session(), get_connection(), init_database(), initialize_database(), create_document(), create_user(), delete_document_record(), ensure_owned_documents() (+8 more)

### Community 4 - "lucide-react"
Cohesion: 0.06
Nodes (57): App(), ButtonLink(), ButtonLinkProps, FeatureCard(), FeatureCardProps, features, Features(), Footer() (+49 more)

### Community 5 - "test_chat_service.py"
Cohesion: 0.24
Nodes (6): LLMAnswer, run(), test_chat_regenerates_once_for_invalid_citation(), test_chat_runs_retrieval_and_context_once(), fake_llm(), test_chat_skips_llm_when_no_context()

### Community 6 - "chat_service.py"
Cohesion: 0.24
Nodes (5): answer_question(), _no_context_response(), _response(), assign_evidence_references(), source_reference_map()

### Community 7 - "test_llm_service.py"
Cohesion: 0.20
Nodes (10): normalize_origin(), Settings, install_fake_groq(), run(), settings(), test_llm_does_not_retry_authentication_errors(), test_llm_parses_structured_answer(), create() (+2 more)

### Community 8 - "documents.py"
Cohesion: 0.06
Nodes (37): get_settings(), get_document(), get_documents(), get_user(), home(), login(), me(), register() (+29 more)

### Community 9 - "AuthContext.tsx"
Cohesion: 0.13
Nodes (29): axios@^1.21.1, AuthContext, AuthContextValue, AuthProvider(), restoreSession(), AuthStatus, RegisterOutcome, api (+21 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (40): dependencies, lucide-react@^1.71.0, react@^19.3.1, react-dom@^19.3.1, react-markdown@^10.1.0, react-router-dom@^7.18.5, remark-gfm@^4.0.1, devDependencies (+32 more)

### Community 11 - "react"
Cohesion: 0.10
Nodes (36): getRedirectTarget(), LoginForm(), RedirectState, RegisterForm(), DocumentUploader(), DocumentUploaderProps, FormField(), FormFieldProps (+28 more)

### Community 12 - "CitationValidationError"
Cohesion: 0.39
Nodes (7): CitationValidationError, validate_citations(), evidence(), test_answerable_response_requires_citation(), test_unanswerable_response_cannot_cite(), test_unknown_citation_is_rejected(), test_valid_citations_resolve_backend_metadata_and_deduplicate()

### Community 13 - "routes/chat.py"
Cohesion: 0.24
Nodes (3): chat(), ChatRequest, test_chat_endpoint_uses_chat_service()

### Community 14 - "build_context"
Cohesion: 0.29
Nodes (5): build_context(), _clean_text(), test_context_builder_excludes_empty_chunks_and_enforces_budget(), test_context_builder_formats_text_and_sources(), test_context_builder_rejects_empty_question()

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+10 more)

### Community 16 - "useSpeechRecognition.ts"
Cohesion: 0.18
Nodes (14): ChatComposer(), ChatComposerProps, describeRecognitionError(), useSpeechRecognition(), UseSpeechRecognitionOptions, getSpeechRecognitionConstructor(), SpeechCapableWindow, SpeechRecognitionAlternative (+6 more)

### Community 17 - "generate_answer"
Cohesion: 0.25
Nodes (4): generate_answer(), _is_permanent_error(), LLMServiceError, _response_schema()

### Community 20 - "cn"
Cohesion: 0.06
Nodes (63): ChatMessageList(), ChatMessageListProps, formatTime(), getSourceDocumentName(), suggestions, CitationPanel(), CitationPanelProps, DocumentSelector() (+55 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `lucide-react`, `AuthContext.tsx`, `package.json`, `useSpeechRecognition.ts`, `cn`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `qdrant_services.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06397306397306397 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `useSpeechRecognition.ts`, `package.json`, `react`, `cn`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `eval_retrieval.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Why does `generate_answer()` connect `generate_answer` to `eval_retrieval.py`, `test_chat_service.py`, `chat_service.py`, `test_llm_service.py`, `documents.py`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `test_multitenant.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13793103448275862 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06049382716049383 - nodes in this community are weakly interconnected._