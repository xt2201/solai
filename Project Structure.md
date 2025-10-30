Cấu trúc thư mục dự án này được thiết kế để phù hợp với mô hình **Hybrid Architecture** (Web2 Backend, Web3 Frontend/Smart Contracts) của **SolAI**, đảm bảo tính mô đun hóa, dễ quản lý và mở rộng.

## Cấu trúc thư mục dự án đề xuất

```
solai/
├── programs/                 # (Web3) Smart Contracts Solana (Anchor)
│   ├── src/
│   │   └── lib.rs            # Logic Smart Contract (Quản lý User Account, Phí, Ghi Log Hash)
│   └── tests/
│       └── integration.rs    # Kiểm thử Smart Contract
│
├── app/                      # (Web3 Frontend) Giao diện người dùng Website (Next.js/React)
│   ├── src/
│   │   ├── components/       # Các thành phần UI
│   │   │   ├── ChatWindow.tsx           # Chat interface với AI
│   │   │   ├── SolAIChat.tsx            # Main chat component
│   │   │   ├── Dashboard/               # **Dashboard components mới**
│   │   │   │   ├── SystemMetrics.tsx    # System & On-Chain metrics panel
│   │   │   │   ├── MarketSentiment.tsx  # Market analysis & hot topics
│   │   │   │   ├── WalletOverview.tsx   # Personal portfolio & risk score
│   │   │   │   ├── QuickActions.tsx     # Pre-defined prompt buttons
│   │   │   │   └── RecentLogs.tsx       # Latest immutable proof transactions
│   │   ├── pages/            # Các trang web
│   │   │   ├── index.tsx     # Homepage với Dashboard widgets
│   │   │   └── _app.tsx      # App wrapper với providers
│   │   ├── hooks/            # **Custom React hooks**
│   │   │   ├── useDashboardMetrics.ts   # Fetch system metrics
│   │   │   ├── useMarketData.ts         # Fetch market sentiment
│   │   │   └── useWalletData.ts         # Fetch wallet portfolio
│   │   └── styles/
│   │       └── dashboard.module.css     # Dashboard-specific styles
│   └── ...
│
├── api-gateway/              # (Web2 Backend - Node.js/TypeScript) - Cổng API chính & Solana Tx Handler
│   ├── src/
│   │   ├── api/
│   │   │   ├── chat.ts       # Endpoint nhận prompt, gọi Python, và trả về response
│   │   │   ├── accounts.ts   # User account management endpoints
│   │   │   └── dashboard.ts  # **Dashboard endpoints mới**
│   │   │       # - GET /dashboard/metrics        (System metrics)
│   │   │       # - GET /dashboard/market         (Market sentiment)
│   │   │       # - GET /dashboard/recent-logs    (Latest transactions)
│   │   │       # - GET /dashboard/wallet/:addr   (Personal portfolio)
│   │   ├── services/
│   │   │   ├── solana_tx.ts  # Logic ghi hash lên Solana (Trừ phí SOLAI, Ghi Log)
│   │   │   ├── llm_proxy.ts  # Giao tiếp (HTTP Client) với llm-processor/
│   │   │   └── dashboard_service.ts  # **Dashboard data aggregation service**
│   │   └── index.ts          # Server Entry Point (CORS, Routing)
│   └── package.json
│
├── llm-processor/            # (Web2 Backend - Python) - Lớp xử lý AI/RAG/Context
│   ├── src/
│   │   ├── llm/
│   │   │   ├── cerebras_handler.py # Xử lý tương tác với Cerebras API (LLM chính)
│   │   │   └── gemini_handler.py   # Xử lý tương tác với Gemini API (LLM dự phòng/cụ thể)
│   │   ├── rag/
│   │   │   ├── rag_logic.py    # Logic RAG cốt lõi, tích hợp LangSmith Tracing
│   │   │   └── vector_store.py # Tương tác với Pinecone, sử dụng Ollama Embedding
│   │   ├── data_ingestion/
│   │   │   ├── firecrawl_worker.py # Script/Service định kỳ dùng Firecrawl để cập nhật Index
│   │   │   └── indexer_formatter.py # Định dạng dữ liệu thô từ Helius/Indexer
│   │   ├── analytics/          # **Analytics module mới**
│   │   │   ├── market_sentiment.py  # Calculate market sentiment metrics
│   │   │   └── risk_calculator.py   # Calculate portfolio risk scores
│   │   └── main.py             # Server Entry Point cho Python (FastAPI)
│   ├── requirements.txt        # Dependencies Python (langchain, pydantic, firecrawl, etc.)
│   └── Dockerfile              # Containerization cho Python server
│
├── client-sdk/               # Thư viện tương tác (Node.js/TypeScript)
│   ├── src/
│   │   ├── blockchain.ts     # Hàm tương tác Smart Contract Solana (qua Anchor)
│   │   └── api.ts            # Hàm gọi API Gateway
│   └── package.json
│
├── scripts/                  # Các script DevOps/Maintenance
│   ├── deploy_program.sh     # Deploy Smart Contract
│   └── update_rag_index.sh   # Chạy llm-processor/data_ingestion/firecrawl_worker.py
│
└── config/                   # Chứa các file cấu hình
    └── config.yml            # File cấu hình đã cập nhật

```

## Giải thích các thư mục chính:

### 1. `programs/` (Lớp Lõi Tin cậy - On-Chain)
* **Mục đích:** Chứa toàn bộ logic hợp đồng thông minh (Smart Contract) chạy trên Solana. Đây là nền tảng của tính phi tập trung và bất biến của ứng dụng.
* **Thành phần chính:**
    * **`lib.rs`:** Định nghĩa các Account và Logic giao dịch (ví dụ: tạo tài khoản người dùng, trừ phí `$SOLAI` khi sử dụng, ghi lại **hash** của phiên tư vấn làm bằng chứng).
* **Công cụ:** **Anchor** (Framework phát triển Solana Program).

### 2. `app/` (Frontend - Web3 User Experience)
* **Mục đích:** Giao diện người dùng cuối, chịu trách nhiệm về trải nghiệm người dùng (UI/UX) và tương tác với ví Solana.
* **Thành phần chính:**
    * **`components/`:** Các thành phần UI tái sử dụng (Chat Window, Nút Kết nối Ví, Hiển thị Phí On-Chain).
    * **`pages/`:** Các trang chính của ứng dụng (trang Chat, Dashboard Phân tích Ví).
* **Công cụ:** **Next.js/React**, **Solana Wallet Adapters**.

### 3. `api-gateway/` (Cổng API chính & Solana Tx Handler)
* **Mục đích:** Đóng vai trò là cổng truy cập công khai duy nhất, quản lý các tác vụ liên quan đến blockchain (trừ phí, ghi log) và làm cầu nối giữa Frontend và Python LLM Processor.
* **Thành phần chính:**
    * **`solana_tx.ts`:** Chứa logic để tương tác với Solana Program (gọi các lệnh trừ phí và gửi hash lên blockchain).
    * **`llm_proxy.ts`:** Xử lý việc chuyển tiếp các yêu cầu của người dùng đến Python Processor và nhận kết quả về.
* **Công cụ:** **Node.js/TypeScript**, **Web3.js/Anchor Client**.

### 4. `llm-processor/` (Lớp Xử lý AI/RAG/Context - Python)
* **Mục đích:** Là trái tim thông minh của hệ thống. Đây là nơi các mô hình AI/RAG phức tạp được thực thi.
* **Thành phần chính:**
    * **`llm/`:** Chứa các hàm giao tiếp và Prompt Engineering cho các LLM chính (Cerebras và Gemini dự phòng).
    * **`rag/`:** Logic cốt lõi của RAG, bao gồm việc tìm kiếm ngữ cảnh từ Pinecone (Vector DB) và theo dõi bằng LangSmith.
    * **`data_ingestion/`:** Xử lý việc thu thập dữ liệu mới từ Web (qua Firecrawl) và chuyển đổi dữ liệu thô của Solana (từ Indexer) thành định dạng văn bản dễ hiểu cho LLM.
* **Công cụ:** **Python**, **FastAPI**, **LangChain/LlamaIndex**, **Ollama**, **Firecrawl SDK**.

### 5. `client-sdk/` (Thư viện Tương tác)
* **Mục đích:** Cung cấp một bộ hàm API đơn giản, được đóng gói để Frontend (`app/`) có thể dễ dàng gọi mà không cần xử lý logic phức tạp của cả API Gateway và Solana Programs.
* **Thành phần chính:**
    * **`blockchain.ts`:** Các hàm đơn giản hóa để gọi các lệnh Smart Contract (ví dụ: `depositFee()`, `getLogTransaction(hash)`).
    * **`api.ts`:** Các hàm gọi HTTP đến các Endpoint của API Gateway.

### 6. `scripts/` (DevOps & Bảo trì)
* **Mục đích:** Chứa các tập lệnh tự động hóa cho quy trình phát triển, triển khai và bảo trì.
* **Thành phần chính:**
    * **`deploy_program.sh`:** Tập lệnh để biên dịch và triển khai Smart Contract lên Solana.
    * **`update_rag_index.sh`:** Tập lệnh để kích hoạt quy trình thu thập dữ liệu mới qua Firecrawl và cập nhật Index RAG.

### 7. `config/` (Cấu hình)
* **Mục đích:** Tập trung hóa tất cả các thông số cấu hình của ứng dụng (API Keys, Endpoints, Tokenomics) vào một nơi duy nhất (`config.yml`).
* **Công cụ:** **YAML**, được đọc bởi cả Node.js và Python.