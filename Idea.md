Dựa trên tệp cấu hình `config.yml` được cung cấp, dưới đây là mô tả tổng quan được cập nhật cho Giải pháp **SolAI**, phản ánh chính xác việc lựa chọn **Cerebras** làm LLM chính, sử dụng **SolAI Token** để thanh toán, và tích hợp các công cụ **RAG** tiên tiến.

## 🌐 Mô tả Tổng quan Giải pháp **SolAI** - AI Agent trên Solana - Cố vấn Tài chính và Phân tích DeFi Phi tập trung

**Mục tiêu:** Cung cấp dịch vụ phân tích thị trường, rủi ro danh mục đầu tư, và chiến lược DeFi theo thời gian thực, kết hợp trí tuệ nhân tạo **hiệu suất cao** với sự minh bạch và tốc độ của Solana.

\<hr\>

### I. Kiến trúc Công nghệ (The Hybrid Architecture)

Giải pháp **SolAI** hoạt động dựa trên mô hình lai, tận dụng tốc độ của Solana và sức mạnh tính toán của các dịch vụ AI chuyên biệt:

| Thành phần | Vai trò | Công nghệ Sử dụng | Cấu hình trong YAML |
| :--- | :--- | :--- | :--- |
| **Lớp Trí tuệ (Tập trung)** | Xử lý ngôn ngữ tự nhiên, phân tích dữ liệu on-chain/off-chain phức tạp, và tạo phản hồi nhanh. | **Cerebras LLM** (Mô hình chính: `qwen-3-32b`) | `llm_processor.provider: CEREBRAS` |
| **Lớp Lõi Tin cậy (Phi tập trung)** | Xử lý thanh toán, quản lý quyền truy cập, ghi lại nhật ký bằng chứng **(Immutable Logging)**. | **Solana Blockchain** (Program ID: `So1an4Geni3Progr4mID...`) | `solana.program.id` |
| **Lớp Dữ liệu RAG/Context** | Truy xuất dữ liệu theo ngữ cảnh, xử lý dữ liệu thô Solana, cung cấp thông tin mới từ Web. | **Ollama** (Embedding: `bge-m3`), **Pinecone** (Vector DB), **Helius** (Indexer), **Firecrawl** | `rag`, `ollama_embedding`, `indexer`, `firecrawl` |
| **Giám sát & Debugging** | Theo dõi hoạt động của LLM Chain, tối ưu hóa RAG và Prompting. | **LangSmith** | `global.langsmith.enabled: true` |

\<hr\>

### II. Quy trình Hoạt động Chính (Key Workflow)

1.  **Xác thực & Thanh toán (Solana):**

      * Người dùng kết nối Ví Solana (tài khoản).
      * Sử dụng **SPL Token SOLAI** (hoặc SOL) để nạp tiền vào Program Account trên Solana để trả phí **Pay-per-query**.
      * **Giá trị Solana:** Quản lý số dư, phí dịch vụ **0.5 SOLAI** mỗi truy vấn, và chi phí ghi log siêu nhỏ **(10000 Lamports)** một cách phi tập trung.

2.  **Truy vấn & Xử lý RAG (LLM Processor):**

      * Người dùng đặt câu hỏi (ví dụ: "Phân tích rủi ro của danh mục đầu tư $X$ dựa trên 10 giao dịch gần nhất của tôi.").
      * Backend sử dụng **Helius Indexer** để lấy **10 giao dịch lịch sử** và **5 token** lớn nhất trong ví.
      * **RAG Logic** sử dụng **Ollama** (`bge-m3`) để tạo embeddings cho câu hỏi và tìm kiếm các tài liệu liên quan từ **Pinecone** Index (`solana-defi-docs`).
      * Prompt hoàn chỉnh (Context Data + RAG Documents + Câu hỏi) được gửi tới **Cerebras LLM** (`qwen-3-32b`) để tạo phản hồi hiệu suất cao.

3.  **Ghi Nhật ký Bất biến (Solana):**

      * Phí sử dụng **0.5 SOLAI** được tự động trừ.
      * Một Giao dịch Solana được tạo, ghi lại **Hash của Prompt** và **Hash của Phản hồi cốt lõi** vào chuỗi.
      * **Giá trị Solana:** Cung cấp **bằng chứng không thể chối cãi** (Auditability) về lời khuyên đã nhận.

4.  **Hành động Tức thì & Cập nhật Dữ liệu:**

      * Chatbot có thể đề xuất và tạo ra các giao dịch Solana có thể thực thi ngay lập tức.
      * **Firecrawl** định kỳ thu thập dữ liệu mới từ các nguồn như `docs.jup.ag` và `docs.raydium.io` để cập nhật Index Pinecone, đảm bảo LLM luôn có thông tin mới nhất.

\<hr\>

### III. Mô hình Lưu trữ Dữ liệu (Storage Summary)

| Vị trí Lưu trữ | Loại Dữ liệu | Mục đích | Cấu hình Liên quan |
| :--- | :--- | :--- | :--- |
| **Solana Blockchain (On-Chain)** | Hash của Prompt/Completion, Hồ sơ thanh toán (SOLAI), Metadata mô hình. | **Minh bạch, Bất biến, Quản lý Trustless.** | `solana.tokenomics` |
| **Pinecone Vector DB (Off-Chain)** | Embeddings của tài liệu DeFi (được tạo bởi **Ollama**), Dữ liệu đã làm sạch từ **Firecrawl**. | **Truy vấn ngữ cảnh RAG hiệu quả.** | `rag.vector_db` |
| **Indexer (Helius)** | Dữ liệu giao dịch Solana thô, Trạng thái ví theo thời gian thực. | **Cung cấp dữ liệu structured cho Context Generation.** | `indexer` |

\<hr\>

### IV. Giá trị Cốt lõi (Core Value)

Giải pháp **SolAI** tận dụng kiến trúc lai để đạt được:

1.  **Tốc độ & Hiệu suất LLM:** Sử dụng **Cerebras LLM** cho khả năng suy luận nhanh, kết hợp với RAG cục bộ/tối ưu hóa (Ollama) để cung cấp phản hồi gần như tức thì.
2.  **Độ tin cậy Web3:** Cung cấp **Bảo hiểm Tranh chấp** thông qua việc ghi log bất biến trên Solana.
3.  **Hệ thống Phân tích Sâu:** Kết hợp dữ liệu lịch sử On-Chain (Indexer) và thông tin Web mới nhất (Firecrawl) để cung cấp lời khuyên chi tiết, có căn cứ.

<hr>

### V. Dashboard Homepage - Trải nghiệm Người dùng Toàn diện (Comprehensive User Experience)

Dashboard Homepage được thiết kế để cung cấp **giá trị ngay lập tức** và thể hiện sự **độc đáo** của việc tích hợp Solana, bao gồm 3 phần chính:

#### 1. Các Chỉ số Tổng quan về Hệ thống & On-Chain (System & On-Chain Metrics) 📊

**Mục đích:** Tăng độ tin cậy thông qua tính minh bạch và hiển thị hiệu suất hệ thống.

| Chỉ số | Mô tả | Nguồn dữ liệu |
|:---|:---|:---|
| **Trạng thái Ví** | Hiển thị Connected/Disconnected với Public Key (4 chữ số đầu + 4 chữ số cuối) | Wallet Adapter |
| **Số dư $SOLAI$ / $SOL$** | Token khả dụng trong ví hoặc Program Account để trả phí | Solana RPC + Program Account |
| **Chi phí On-Chain** | Chi phí trung bình/truy vấn (≈ $0.000005 USD) - **Nhấn mạnh chi phí cực thấp** | Static config + Real-time SOL price |
| **Tổng Lời khuyên Đã Ghi** | Số giao dịch ghi log phản hồi trên blockchain (Immutable Logs) | Program Account State |
| **Phiên bản LLM** | Model ID đang sử dụng (VD: `qwen-3-32b`) | Config endpoint |

#### 2. Phân tích Thị trường Solana Nổi bật (Featured Solana Analysis) 🔍

**Mục đích:** Thu hút người dùng mới bằng các phân tích mẫu và điểm nóng hệ sinh thái.

| Thành phần | Mô tả | Nguồn dữ liệu |
|:---|:---|:---|
| **Sentiment On-Chain** | Chỉ số tổng hợp (Rất lạc quan/Trung lập/Thận trọng) từ giao dịch gần đây | Helius + Mock Analytics |
| **Dự đoán Volatility** | Chỉ số rủi ro ngắn hạn cho SOL/ecosystem | Market Overview API |
| **Top 3 Hot Topics DeFi** | Các loại hình được SolAI phân tích nhiều nhất 24h qua (Liquid Staking, DEX Aggregators, Lending) | Platform Stats API |
| **Immutable Proof Teaser** | Giao dịch log mới nhất với thời gian, hash TX (link Explorer), và tóm tắt nội dung | Recent Logs API |

#### 3. Khu vực Cá nhân hóa & Tương tác Nhanh (Personalized & Quick Action) ✨

**Mục đích:** Tạo trải nghiệm cá nhân hóa và khuyến khích tương tác ngay lập tức.

| Tính năng | Mô tả | Nguồn dữ liệu |
|:---|:---|:---|
| **Tổng Giá trị Tài sản (TVL)** | Tổng SOL + SPL Tokens với tùy chọn Ẩn/Hiện | Wallet Analysis API + Helius |
| **Phân bổ Tài sản** | Biểu đồ tròn SOL vs Stablecoins vs Others | Wallet Analysis API |
| **Risk Score** | Chỉ số 1-100 dựa trên Staking/Lending/LP exposure | Wallet Analysis API |
| **Quick Action Prompts** | 3 nút gợi ý: "Phân tích rủi ro", "Tối ưu Yield", "Giải thích Gas fees" | Pre-defined prompts |

**Kiến trúc Technical:**
- **Frontend:** Dashboard components sử dụng React hooks để fetch data real-time
- **Backend APIs:** Thêm 4 endpoints mới: `/dashboard/metrics`, `/dashboard/market-sentiment`, `/dashboard/recent-logs`, `/dashboard/wallet-overview/:wallet`
- **Caching:** Redis cache cho market data (TTL 60s), wallet data (TTL 30s)
- **Real-time Updates:** WebSocket hoặc polling mỗi 10s cho metrics động