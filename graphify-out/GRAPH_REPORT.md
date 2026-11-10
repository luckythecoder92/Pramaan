# Graph Report - Pramaan  (2026-11-10)

## Corpus Check
- 110 files · ~26,752 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .db 1, .example 1, (none) 1)

## Summary
- 609 nodes · 1608 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- qdrant_services.py
- eval_retrieval.py
- getApiErrorMessage
- test_multitenant.py
- lucide-react
- test_llm_service.py
- CitationPanel.tsx
- chat_service.py
- documents.py
- AuthContext.tsx
- package.json
- ChatPage.tsx
- DocumentList.tsx
- DashboardPage.tsx
- DocumentsContext.tsx
- compilerOptions
- useSpeechRecognition.ts
- ToastContext.tsx
- cn
- vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 35 edges
2. `cn()` - 31 edges
3. `react` - 28 edges
4. `react-router-dom` - 21 edges
5. `useToast()` - 19 edges
6. `useAuth()` - 19 edges
7. `getApiErrorMessage()` - 19 edges
8. `answer_question()` - 18 edges
9. `run()` - 17 edges
10. `get_settings()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `semantic_search()` --uses--> `SearchRequest`  [INFERRED]
  backend/app/routes/search.py → backend/app/schemas/search.py
- `chat()` --uses--> `LLMServiceError`  [INFERRED]
  backend/app/routes/chat.py → backend/app/services/llm_service.py
- `DocumentListProps` --references--> `DocumentRecord`  [EXTRACTED]
  frontend/src/components/documents/DocumentList.tsx → frontend/src/types/document.ts
- `generate_answer()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/llm_service.py → backend/app/schemas/chat.py
- `_response_schema()` --uses--> `LLMAnswer`  [INFERRED]
  backend/app/services/llm_service.py → backend/app/schemas/chat.py

## Import Cycles
- None detected.

## Communities (22 total, 3 thin omitted)

### Community 0 - "qdrant_services.py"
Cohesion: 0.06
Nodes (25): ask_question(), semantic_search(), QuestionRequest, generate_embeddings(), generate_query_embedding(), _create_client(), create_collection(), _point_id() (+17 more)

### Community 1 - "eval_retrieval.py"
Cohesion: 0.15
Nodes (18): collapse(), display_document(), format_percent(), is_rate_limit_error(), load_document_rows(), load_questions(), main(), parse_args() (+10 more)

### Community 2 - "getApiErrorMessage"
Cohesion: 0.26
Nodes (8): useSpeechSynthesis(), UseSpeechSynthesisOptions, ALLOWED_AUDIO_TYPES, synthesizeSpeech(), TranscribeResponse, extractDetail(), getApiErrorMessage(), isRecord()

### Community 3 - "test_multitenant.py"
Cohesion: 0.12
Nodes (17): database_session(), get_connection(), init_database(), initialize_database(), create_document(), create_user(), delete_document_record(), ensure_owned_documents() (+9 more)

### Community 4 - "lucide-react"
Cohesion: 0.07
Nodes (58): App(), getRedirectTarget(), LoginForm(), RedirectState, RegisterForm(), ButtonLink(), FeatureCard(), FeatureCardProps (+50 more)

### Community 5 - "test_llm_service.py"
Cohesion: 0.14
Nodes (13): Settings, generate_answer(), _is_permanent_error(), LLMServiceError, _response_schema(), install_fake_groq(), run(), settings() (+5 more)

### Community 6 - "CitationPanel.tsx"
Cohesion: 0.36
Nodes (6): CitationPanel(), Modal(), ModalProps, ModalSize, sizeStyles, formatScore()

### Community 7 - "chat_service.py"
Cohesion: 0.08
Nodes (25): chat(), LLMAnswer, answer_question(), _no_context_response(), _response(), assign_evidence_references(), CitationValidationError, source_reference_map() (+17 more)

### Community 8 - "documents.py"
Cohesion: 0.06
Nodes (38): get_settings(), get_document(), get_documents(), get_user(), home(), login(), me(), register() (+30 more)

### Community 9 - "AuthContext.tsx"
Cohesion: 0.14
Nodes (28): axios@^1.21.1, AuthContext, AuthContextValue, AuthProvider(), restoreSession(), AuthStatus, RegisterOutcome, API_BASE_URL (+20 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (41): dependencies, lucide-react@^1.71.0, react@^19.3.1, react-dom@^19.3.1, react-markdown@^10.1.0, react-router-dom@^7.18.5, remark-gfm@^4.0.1, devDependencies (+33 more)

### Community 11 - "ChatPage.tsx"
Cohesion: 0.17
Nodes (20): ChatComposer(), ChatComposerProps, ChatMessageList(), ChatMessageListProps, formatTime(), getSourceDocumentName(), suggestions, CitationPanelProps (+12 more)

### Community 12 - "DocumentList.tsx"
Cohesion: 0.29
Nodes (8): RecentDocuments(), DocumentList(), DocumentListProps, describeStatus(), StatusBadge(), StatusBadgeProps, StatusDescriptor, formatDate()

### Community 13 - "DashboardPage.tsx"
Cohesion: 0.28
Nodes (15): StatCard(), DocumentUploader(), Button(), EmptyState(), EmptyStateProps, PageHeader(), PageHeaderProps, useDocuments() (+7 more)

### Community 14 - "DocumentsContext.tsx"
Cohesion: 0.22
Nodes (15): DocumentSelectorProps, RecentDocumentsProps, DocumentUploaderProps, DocumentsContext, DocumentsContextValue, DocumentsProvider(), isPendingStatus(), RefreshOptions (+7 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+10 more)

### Community 16 - "useSpeechRecognition.ts"
Cohesion: 0.21
Nodes (12): describeRecognitionError(), useSpeechRecognition(), UseSpeechRecognitionOptions, getSpeechRecognitionConstructor(), SpeechCapableWindow, SpeechRecognitionAlternative, SpeechRecognitionConstructor, SpeechRecognitionErrorEvent (+4 more)

### Community 18 - "ToastContext.tsx"
Cohesion: 0.24
Nodes (11): icons, ToastViewport(), ToastViewportProps, variantStyles, createToastId(), ToastContext, ToastContextValue, ToastInput (+3 more)

### Community 20 - "cn"
Cohesion: 0.13
Nodes (17): ButtonLinkProps, DocumentSelector(), StatCardProps, StatTone, toneStyles, buttonClasses(), ButtonProps, ButtonSize (+9 more)

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `cn` to `getApiErrorMessage`, `lucide-react`, `CitationPanel.tsx`, `AuthContext.tsx`, `package.json`, `ChatPage.tsx`, `DashboardPage.tsx`, `DocumentsContext.tsx`, `useSpeechRecognition.ts`, `ToastContext.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `qdrant_services.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06386066763425254 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `CitationPanel.tsx`, `package.json`, `ChatPage.tsx`, `DocumentList.tsx`, `DashboardPage.tsx`, `ToastContext.tsx`, `cn`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `eval_retrieval.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Why does `generate_answer()` connect `test_llm_service.py` to `documents.py`, `eval_retrieval.py`, `chat_service.py`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `test_multitenant.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06955736224028906 - nodes in this community are weakly interconnected._