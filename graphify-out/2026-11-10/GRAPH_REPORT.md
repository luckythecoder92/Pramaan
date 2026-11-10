# Graph Report - Pramaan  (2026-11-10)

## Corpus Check
- 109 files · ~24,675 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .db 1, .example 1, (none) 1)

## Summary
- 582 nodes · 1533 edges · 24 communities (21 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- qdrant_services.py
- generate_answer
- build_context
- test_multitenant.py
- lucide-react
- test_llm_service.py
- test_chat_endpoint.py
- CitationValidationError
- documents.py
- AuthContext.tsx
- package.json
- ChatPage.tsx
- cn
- DashboardPage.tsx
- DocumentsContext.tsx
- compilerOptions
- useSpeechRecognition.ts
- test_chat_service.py
- ToastContext.tsx
- chat_service.py
- react
- vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 35 edges
2. `cn()` - 31 edges
3. `react` - 28 edges
4. `react-router-dom` - 21 edges
5. `useAuth()` - 19 edges
6. `useToast()` - 19 edges
7. `getApiErrorMessage()` - 19 edges
8. `answer_question()` - 18 edges
9. `get_settings()` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `chat()` --uses--> `CitationValidationError`  [INFERRED]
  backend/app/routes/chat.py → backend/app/services/citation_service.py
- `chat()` --uses--> `LLMServiceError`  [INFERRED]
  backend/app/routes/chat.py → backend/app/services/llm_service.py
- `test_chat_endpoint_uses_chat_service()` --indirect_call--> `chat()`  [INFERRED]
  backend/test_chat_endpoint.py → backend/app/routes/chat.py
- `_response()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/chat_service.py → backend/app/schemas/chat.py
- `generate_answer()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/llm_service.py → backend/app/schemas/chat.py

## Import Cycles
- None detected.

## Communities (24 total, 3 thin omitted)

### Community 0 - "qdrant_services.py"
Cohesion: 0.07
Nodes (21): ask_question(), semantic_search(), QuestionRequest, SearchRequest, generate_query_embedding(), _create_client(), create_collection(), _point_id() (+13 more)

### Community 1 - "generate_answer"
Cohesion: 0.24
Nodes (4): generate_answer(), _is_permanent_error(), LLMServiceError, _response_schema()

### Community 2 - "build_context"
Cohesion: 0.23
Nodes (5): build_context(), _clean_text(), test_context_builder_excludes_empty_chunks_and_enforces_budget(), test_context_builder_formats_text_and_sources(), test_context_builder_rejects_empty_question()

### Community 3 - "test_multitenant.py"
Cohesion: 0.10
Nodes (20): database_session(), get_connection(), init_database(), get_document(), get_documents(), get_user(), home(), initialize_database() (+12 more)

### Community 4 - "lucide-react"
Cohesion: 0.08
Nodes (47): App(), ButtonLink(), FeatureCard(), FeatureCardProps, features, Features(), Footer(), Hero() (+39 more)

### Community 5 - "test_llm_service.py"
Cohesion: 0.29
Nodes (9): Settings, install_fake_groq(), run(), settings(), test_llm_does_not_retry_authentication_errors(), test_llm_parses_structured_answer(), create(), test_llm_rejects_invalid_json() (+1 more)

### Community 6 - "test_chat_endpoint.py"
Cohesion: 0.22
Nodes (5): generate_embeddings(), test_chat_endpoint_uses_chat_service(), test_empty_document_does_not_call_provider(), test_empty_query_is_rejected(), test_generate_embeddings_returns_provider_vectors()

### Community 7 - "CitationValidationError"
Cohesion: 0.27
Nodes (9): assign_evidence_references(), CitationValidationError, source_reference_map(), validate_citations(), evidence(), test_answerable_response_requires_citation(), test_unanswerable_response_cannot_cite(), test_unknown_citation_is_rejected() (+1 more)

### Community 8 - "documents.py"
Cohesion: 0.07
Nodes (33): get_settings(), login(), me(), register(), delete_document(), get_documents(), upload_document(), speak() (+25 more)

### Community 9 - "AuthContext.tsx"
Cohesion: 0.08
Nodes (47): getRedirectTarget(), LoginForm(), RedirectState, RegisterForm(), FormField(), FormFieldProps, inputClasses, AuthContext (+39 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, axios@^1.21.1, lucide-react@^1.71.0, react@^19.3.1, react-dom@^19.3.1, react-markdown@^10.1.0, react-router-dom@^7.18.5, remark-gfm@^4.0.1 (+34 more)

### Community 11 - "ChatPage.tsx"
Cohesion: 0.16
Nodes (23): ChatComposer(), ChatComposerProps, ChatMessageList(), ChatMessageListProps, formatTime(), getSourceDocumentName(), suggestions, CitationPanel() (+15 more)

### Community 12 - "cn"
Cohesion: 0.16
Nodes (16): DocumentList(), EmptyState(), EmptyStateProps, Modal(), ModalProps, ModalSize, sizeStyles, PageLoaderProps (+8 more)

### Community 13 - "DashboardPage.tsx"
Cohesion: 0.19
Nodes (17): RecentDocuments(), StatCard(), StatCardProps, StatTone, toneStyles, DocumentUploader(), PageHeader(), PageHeaderProps (+9 more)

### Community 14 - "DocumentsContext.tsx"
Cohesion: 0.19
Nodes (16): DocumentSelectorProps, RecentDocumentsProps, DocumentListProps, DocumentUploaderProps, DocumentsContext, DocumentsContextValue, DocumentsProvider(), isPendingStatus() (+8 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+10 more)

### Community 16 - "useSpeechRecognition.ts"
Cohesion: 0.21
Nodes (12): describeRecognitionError(), useSpeechRecognition(), UseSpeechRecognitionOptions, getSpeechRecognitionConstructor(), SpeechCapableWindow, SpeechRecognitionAlternative, SpeechRecognitionConstructor, SpeechRecognitionErrorEvent (+4 more)

### Community 17 - "test_chat_service.py"
Cohesion: 0.24
Nodes (6): LLMAnswer, run(), test_chat_regenerates_once_for_invalid_citation(), test_chat_runs_retrieval_and_context_once(), fake_llm(), test_chat_skips_llm_when_no_context()

### Community 18 - "ToastContext.tsx"
Cohesion: 0.24
Nodes (11): icons, ToastViewport(), ToastViewportProps, variantStyles, createToastId(), ToastContext, ToastContextValue, ToastInput (+3 more)

### Community 19 - "chat_service.py"
Cohesion: 0.31
Nodes (5): chat(), ChatRequest, answer_question(), _no_context_response(), _response()

### Community 20 - "react"
Cohesion: 0.29
Nodes (8): ButtonLinkProps, buttonClasses(), ButtonProps, ButtonSize, ButtonVariant, sizeStyles, variantStyles, react

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `lucide-react`, `AuthContext.tsx`, `package.json`, `ChatPage.tsx`, `cn`, `DashboardPage.tsx`, `DocumentsContext.tsx`, `useSpeechRecognition.ts`, `ToastContext.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `qdrant_services.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06980392156862746 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `AuthContext.tsx`, `package.json`, `ChatPage.tsx`, `cn`, `DashboardPage.tsx`, `DocumentsContext.tsx`, `ToastContext.tsx`, `react`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `test_multitenant.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09851551956815115 - nodes in this community are weakly interconnected._
- **Why does `generate_answer()` connect `generate_answer` to `documents.py`, `test_chat_service.py`, `chat_service.py`, `test_llm_service.py`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.08252853380158033 - nodes in this community are weakly interconnected._
- **Should `documents.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07374890254609306 - nodes in this community are weakly interconnected._