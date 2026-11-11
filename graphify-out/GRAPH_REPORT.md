# Graph Report - Pramaan  (2026-11-11)

## Corpus Check
- 110 files · ~27,119 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .db 1, .example 1)

## Summary
- 615 nodes · 1615 edges · 25 communities (19 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.89)
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
- chat_service.py
- cn
- test_llm_service.py
- documents.py
- AuthContext.tsx
- package.json
- LoginForm.tsx
- DocumentsContext.tsx
- ChatPage.tsx
- ChatMessageList.tsx
- compilerOptions
- useSpeechRecognition.ts
- ToastContext.tsx
- Button.tsx
- DocumentsPage.tsx
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
- `DocumentUploaderProps` --references--> `UploadDocumentResponse`  [EXTRACTED]
  frontend/src/components/documents/DocumentUploader.tsx → frontend/src/types/document.ts
- `RecentDocumentsProps` --references--> `DocumentRecord`  [EXTRACTED]
  frontend/src/components/dashboard/RecentDocuments.tsx → frontend/src/types/document.ts
- `DocumentListProps` --references--> `DocumentRecord`  [EXTRACTED]
  frontend/src/components/documents/DocumentList.tsx → frontend/src/types/document.ts
- `answer_question()` --indirect_call--> `generate_query_embedding()`  [INFERRED]
  backend/app/services/chat_service.py → backend/app/services/embedding_services.py
- `answer_question()` --indirect_call--> `search_chunks()`  [INFERRED]
  backend/app/services/chat_service.py → backend/app/services/qdrant_services.py

## Import Cycles
- None detected.

## Communities (25 total, 6 thin omitted)

### Community 0 - "qdrant_services.py"
Cohesion: 0.06
Nodes (26): ask_question(), semantic_search(), QuestionRequest, SearchRequest, generate_embeddings(), generate_query_embedding(), _create_client(), create_collection() (+18 more)

### Community 1 - "eval_retrieval.py"
Cohesion: 0.14
Nodes (18): collapse(), display_document(), format_percent(), is_rate_limit_error(), load_document_rows(), load_questions(), main(), parse_args() (+10 more)

### Community 3 - "test_multitenant.py"
Cohesion: 0.13
Nodes (17): database_session(), get_connection(), init_database(), initialize_database(), create_document(), create_user(), delete_document_record(), ensure_owned_documents() (+9 more)

### Community 4 - "lucide-react"
Cohesion: 0.08
Nodes (47): App(), ButtonLink(), FeatureCard(), FeatureCardProps, features, Features(), Footer(), Hero() (+39 more)

### Community 5 - "chat_service.py"
Cohesion: 0.07
Nodes (29): chat(), ChatRequest, LLMAnswer, answer_question(), _no_context_response(), _response(), assign_evidence_references(), CitationValidationError (+21 more)

### Community 6 - "cn"
Cohesion: 0.13
Nodes (18): ChatComposerProps, StatCardProps, StatTone, toneStyles, DocumentList(), DocumentListProps, EmptyStateProps, PageHeaderProps (+10 more)

### Community 7 - "test_llm_service.py"
Cohesion: 0.13
Nodes (11): normalize_origin(), Settings, test_chat_endpoint_uses_chat_service(), install_fake_groq(), run(), settings(), test_llm_does_not_retry_authentication_errors(), test_llm_parses_structured_answer() (+3 more)

### Community 8 - "documents.py"
Cohesion: 0.07
Nodes (36): get_settings(), get_document(), get_documents(), get_user(), home(), login(), me(), register() (+28 more)

### Community 9 - "AuthContext.tsx"
Cohesion: 0.12
Nodes (29): AuthContext, AuthContextValue, AuthProvider(), restoreSession(), AuthStatus, RegisterOutcome, api, API_BASE_URL (+21 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, axios@^1.21.1, lucide-react@^1.71.0, react@^19.3.1, react-dom@^19.3.1, react-markdown@^10.1.0, react-router-dom@^7.18.5, remark-gfm@^4.0.1 (+34 more)

### Community 11 - "LoginForm.tsx"
Cohesion: 0.30
Nodes (12): getRedirectTarget(), LoginForm(), RedirectState, RegisterForm(), FormField(), FormFieldProps, inputClasses, useToast() (+4 more)

### Community 12 - "DocumentsContext.tsx"
Cohesion: 0.25
Nodes (13): DocumentSelectorProps, DocumentsContext, DocumentsContextValue, DocumentsProvider(), isPendingStatus(), RefreshOptions, deleteDocument(), listDocuments() (+5 more)

### Community 13 - "ChatPage.tsx"
Cohesion: 0.26
Nodes (13): ChatComposer(), DocumentSelector(), useSpeechSynthesis(), UseSpeechSynthesisOptions, ChatPage(), createMessageId(), toSpeechText(), askDocumentQuestion() (+5 more)

### Community 14 - "ChatMessageList.tsx"
Cohesion: 0.22
Nodes (12): ChatMessageList(), ChatMessageListProps, formatTime(), getSourceDocumentName(), suggestions, CitationPanelProps, MarkdownMessage(), ChatMessage (+4 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+10 more)

### Community 16 - "useSpeechRecognition.ts"
Cohesion: 0.21
Nodes (12): describeRecognitionError(), useSpeechRecognition(), UseSpeechRecognitionOptions, getSpeechRecognitionConstructor(), SpeechCapableWindow, SpeechRecognitionAlternative, SpeechRecognitionConstructor, SpeechRecognitionErrorEvent (+4 more)

### Community 17 - "ToastContext.tsx"
Cohesion: 0.24
Nodes (11): icons, ToastViewport(), ToastViewportProps, variantStyles, createToastId(), ToastContext, ToastContextValue, ToastInput (+3 more)

### Community 18 - "Button.tsx"
Cohesion: 0.31
Nodes (7): ButtonLinkProps, buttonClasses(), ButtonProps, ButtonSize, ButtonVariant, sizeStyles, variantStyles

### Community 20 - "DocumentsPage.tsx"
Cohesion: 0.18
Nodes (23): CitationPanel(), RecentDocuments(), RecentDocumentsProps, StatCard(), DocumentUploader(), DocumentUploaderProps, Button(), EmptyState() (+15 more)

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `cn` to `lucide-react`, `AuthContext.tsx`, `package.json`, `LoginForm.tsx`, `DocumentsContext.tsx`, `ChatPage.tsx`, `ChatMessageList.tsx`, `useSpeechRecognition.ts`, `ToastContext.tsx`, `Button.tsx`, `DocumentsPage.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `qdrant_services.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `cn`, `package.json`, `LoginForm.tsx`, `DocumentsContext.tsx`, `ChatPage.tsx`, `ChatMessageList.tsx`, `ToastContext.tsx`, `Button.tsx`, `DocumentsPage.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `eval_retrieval.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1402116402116402 - nodes in this community are weakly interconnected._
- **Why does `generate_answer()` connect `chat_service.py` to `documents.py`, `eval_retrieval.py`, `test_llm_service.py`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `test_multitenant.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.08252853380158033 - nodes in this community are weakly interconnected._