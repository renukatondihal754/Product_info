
# Product_info
=======
# Lead Scoring Backend API

AI-powered backend service for B2B lead qualification and scoring using rule-based logic combined with AI reasoning .

## 🚀 Features

- **Product/Offer Management**: Store and manage product details and value propositions
- **CSV Lead Upload**: Bulk import leads from CSV files
- **Hybrid Scoring Pipeline**:
  - Rule-based scoring (max 50 points): Role relevance, industry match, data completeness
  - AI-powered intent classification (max 50 points): Using Google Gemini for contextual analysis
- **Intent Classification**: Automatic classification as High/Medium/Low intent
- **Export Results**: Download scored leads as CSV
- **Production Ready**: Error handling, rate limiting, security headers, Docker support
- **Flexible AI Provider**: Supports both Google Gemini and OpenAI (configurable)

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- **Google Gemini API key** (get it free from https://aistudio.google.com/apikey)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/renukatondihal754/Product_info.git

```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Edit the `.env` file in the root directory and add your Gemini API key:

```env
PORT=3000
NODE_ENV=development

# AI Provider Selection (openai or gemini)
AI_PROVIDER=gemini

# Google Gemini Configuration (ACTIVE)
GEMINI_API_KEY=your_gemini_api_key_here


```

**To get a free Gemini API key:**
1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in `.env` as `GEMINI_API_KEY`

### 4. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:3000`

## 🐳 Docker Setup

### Build and Run with Docker

```bash
# Build the image
docker build -t lead-scoring-api .

# Run the container
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key_here lead-scoring-api
```

### Using Docker Compose

```bash
# Set your API key in .env file first
docker-compose up -d
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### 2. Create Offer/Product
```http
POST /api/offer
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings", "Automated follow-ups"],
  "ideal_use_cases": ["B2B SaaS mid-market", "Enterprise sales teams"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Offer created successfully",
  "data": {
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### 3. Upload Leads CSV
```http
POST /api/leads/upload
Content-Type: multipart/form-data
```

**CSV Format Required:**
```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS,San Francisco,10+ years scaling SaaS companies
John Smith,VP of Sales,TechCorp,Enterprise Software,New York,Sales leader passionate about AI
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/leads/upload \
  -F "file=@leads.csv"
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 2 leads",
  "data": {
    "count": 2,
    "leads": [
      {
        "id": 1,
        "name": "Ava Patel",
        "role": "Head of Growth",
        "company": "FlowMetrics",
        "industry": "B2B SaaS",
        "location": "San Francisco",
        "linkedin_bio": "10+ years scaling SaaS companies",
        "uploadedAt": "2024-01-15T10:31:00.000Z"
      }
    ]
  }
}
```

---

#### 4. Run Scoring Pipeline
```http
POST /api/score
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/score
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully scored 2 leads",
  "data": {
    "count": 2,
    "summary": {
      "high": 1,
      "medium": 1,
      "low": 0
    },
    "leads": [
      {
        "name": "Ava Patel",
        "role": "Head of Growth",
        "company": "FlowMetrics",
        "industry": "B2B SaaS",
        "location": "San Francisco",
        "intent": "High",
        "score": 85,
        "reasoning": "Decision Maker role, Exact ICP match, complete profile, Strong alignment with B2B SaaS mid-market focus"
      }
    ]
  }
}
```

---

#### 5. Get Results
```http
GET /api/results
```

**cURL Example:**
```bash
curl http://localhost:3000/api/results
```

**With Debug Info:**
```bash
curl http://localhost:3000/api/results?debug=true
```

---

#### 6. Export Results as CSV
```http
GET /api/results/export
```

**cURL Example:**
```bash
curl http://localhost:3000/api/results/export -o scored-leads.csv
```

**Browser:**
```
http://localhost:3000/api/results/export
```

---

## 🧮 Scoring Logic

### Rule-Based Layer (Max 50 Points)

1. **Role Relevance (Max 20 points)**
   - Decision Maker (CEO, CTO, Director, VP, etc.): 20 points
   - Influencer (Manager, Lead, Senior, etc.): 10 points
   - Other: 0 points

2. **Industry Match (Max 20 points)**
   - Exact ICP match: 20 points
   - Adjacent industry: 10 points
   - Different industry: 0 points

3. **Data Completeness (Max 10 points)**
   - All fields present: 10 points
   - Missing fields: 0 points

### AI Layer (Max 50 Points)

Uses **Google Gemini 1.5 Flash** to analyze:
- Role-product fit
- Industry alignment
- Professional background
- Potential pain points

**AI Prompt Structure:**
```
Analyze this B2B prospect's buying intent for our product.

PRODUCT/OFFER: [name, value props, ideal use cases]
PROSPECT: [name, role, company, industry, location, bio]

Classify intent (High/Medium/Low) with reasoning.
```

**Intent Mapping:**
- High Intent: 50 points
- Medium Intent: 30 points
- Low Intent: 10 points

**Note:** You can switch to OpenAI by setting `AI_PROVIDER=openai` in your `.env` file and providing an OpenAI API key.

### Final Score

`Total Score = Rule Score (0-50) + AI Score (10-50)`

**Intent Labels:**
- **High**: Score >= 70
- **Medium**: Score 40-69
- **Low**: Score < 40

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Test API Endpoints

Choose the method that works best for your platform:

#### Method 1: Browser (Easiest)
1. Start the server: `npm start`
2. Open your browser to `http://localhost:3000`
3. Use a REST client extension like:
   - **Postman** (Desktop app)
   - **Thunder Client** (VS Code extension)
   - **Insomnia** (Desktop app)

#### Method 2: Command Line Testing

<details>
<summary><b>🐧 Linux / Mac / Git Bash (Click to expand)</b></summary>

```bash
# 1. Create offer
curl -X POST http://localhost:3000/api/offer \
  -H "Content-Type: application/json" \
  -d '{"name":"AI Outreach Automation","value_props":["24/7 outreach","6x more meetings"],"ideal_use_cases":["B2B SaaS mid-market"]}'

# 2. Upload leads
curl -X POST http://localhost:3000/api/leads/upload \
  -F "file=@sample-leads.csv"

# 3. Run scoring
curl -X POST http://localhost:3000/api/score

# 4. Get results
curl http://localhost:3000/api/results

# 5. Export CSV
curl http://localhost:3000/api/results/export -o scored-leads.csv
```
</details>

<details>
<summary><b>🪟 Windows PowerShell (Click to expand)</b></summary>

```powershell
# 1. Create offer
Invoke-RestMethod -Uri http://localhost:3000/api/offer -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"AI Outreach Automation","value_props":["24/7 outreach","6x more meetings"],"ideal_use_cases":["B2B SaaS mid-market"]}'

# 2. Upload leads
Invoke-RestMethod -Uri http://localhost:3000/api/leads/upload -Method POST `
  -Form @{file=Get-Item ".\sample-leads.csv"}

# 3. Run scoring
Invoke-RestMethod -Uri http://localhost:3000/api/score -Method POST

# 4. Get results
Invoke-RestMethod -Uri http://localhost:3000/api/results

# 5. Export CSV
Invoke-WebRequest -Uri http://localhost:3000/api/results/export -OutFile "scored-leads.csv"
```

**Important Notes for Windows:**
- The `-Form` parameter for file uploads requires **PowerShell 7+**. Check your version with `$PSVersionTable.PSVersion`
- If using PowerShell 5.1 (default on Windows), use **Postman**, **Thunder Client**, or **Git Bash** for file uploads
- Alternatively, install PowerShell 7: https://aka.ms/powershell
- Or install real curl: https://curl.se/windows/

</details>

#### Method 3: Quick Health Check

**Linux/Mac/Git Bash:**
```bash
curl http://localhost:3000/api/health
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health
```

**Browser:**
```
http://localhost:3000/api/health
```

---

## 📁 Project Structure

```
lead-scoring-backend/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration and env variables
│   ├── controllers/
│   │   ├── offerController.js     # Offer endpoint handlers
│   │   ├── leadsController.js     # Leads endpoint handlers
│   │   └── scoringController.js   # Scoring endpoint handlers
│   ├── services/
│   │   ├── aiService.js           # AI integration (OpenAI)
│   │   ├── ruleEngine.js          # Rule-based scoring logic
│   │   └── scoringService.js      # Orchestrates scoring pipeline
│   ├── middleware/
│   │   ├── errorHandler.js        # Global error handling
│   │   ├── uploadMiddleware.js    # File upload config (multer)
│   │   └── validator.js           # Request validation
│   ├── utils/
│   │   ├── csvParser.js           # CSV parsing utility
│   │   └── csvExporter.js         # CSV export utility
│   ├── models/
│   │   └── dataStore.js           # In-memory data storage
│   ├── routes/
│   │   └── index.js               # Route definitions
│   └── app.js                     # Express app setup
├── tests/
│   └── ruleEngine.test.js         # Unit tests
├── uploads/                       # Temporary upload directory
├── .env                           # Environment variables
├── .gitignore
├── Dockerfile                     # Docker configuration
├── docker-compose.yml
├── package.json
├── server.js                      # Server entry point
└── README.md
```

---

## 🔐 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for cross-origin requests
- **File Upload Validation**: 
  - Max file size: 5MB
  - Allowed types: CSV only
- **Input Validation**: All endpoints validate input data
- **Error Handling**: No sensitive data exposed in errors

---

## 🚀 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables:
   - `GEMINI_API_KEY` (your Gemini API key)
   - `AI_PROVIDER=gemini`
   - `NODE_ENV=production`
5. Deploy!

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set GEMINI_API_KEY=your_gemini_key_here
railway variables set AI_PROVIDER=gemini
railway variables set NODE_ENV=production

# Deploy
railway up
```

**Alternative: Deploy with OpenAI instead:**
If you want to use OpenAI instead of Gemini, set:
- `AI_PROVIDER=openai`
- `OPENAI_API_KEY=your_openai_key_here`

### Deploy to Vercel (Serverless)

**Note:** Vercel deployment requires modifications for serverless architecture.

---

## 📊 Sample CSV Files

### Sample Leads CSV

Create `sample-leads.csv`:
```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS,San Francisco,10+ years scaling SaaS companies from 0 to IPO
John Martinez,VP of Sales,CloudSync,Enterprise Software,New York,Passionate about AI and automation in sales
Sarah Chen,Marketing Manager,DataViz Inc,Analytics,Boston,Data-driven marketer focused on B2B growth
Michael Brown,Sales Rep,LocalBiz,Retail,Chicago,Entry-level sales professional
Emily White,CTO,TechStart,B2B SaaS,Austin,Technical leader building the future of SaaS
```

---

## 🎯 Usage Example

### Complete Workflow

**Step 1: Start the Server**
```bash
npm start
```

**Step 2-6: Test the API**

<details>
<summary><b>🐧 Linux / Mac / Git Bash</b></summary>

```bash
# 2. Create offer
curl -X POST http://localhost:3000/api/offer \
  -H "Content-Type: application/json" \
  -d '{"name":"AI Outreach Automation","value_props":["24/7 outreach","6x more meetings"],"ideal_use_cases":["B2B SaaS mid-market"]}'

# 3. Upload leads
curl -X POST http://localhost:3000/api/leads/upload \
  -F "file=@sample-leads.csv"

# 4. Run scoring
curl -X POST http://localhost:3000/api/score

# 5. View results
curl http://localhost:3000/api/results | json_pp

# 6. Export to CSV
curl http://localhost:3000/api/results/export -o scored-leads.csv
```
</details>

<details>
<summary><b>🪟 Windows PowerShell</b></summary>

```powershell
# 2. Create offer
Invoke-RestMethod -Uri http://localhost:3000/api/offer -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"AI Outreach Automation","value_props":["24/7 outreach","6x more meetings"],"ideal_use_cases":["B2B SaaS mid-market"]}'

# 3. Upload leads
Invoke-RestMethod -Uri http://localhost:3000/api/leads/upload -Method POST `
  -Form @{file=Get-Item ".\sample-leads.csv"}

# 4. Run scoring
Invoke-RestMethod -Uri http://localhost:3000/api/score -Method POST

# 5. View results
Invoke-RestMethod -Uri http://localhost:3000/api/results | ConvertTo-Json -Depth 10

# 6. Export to CSV
Invoke-WebRequest -Uri http://localhost:3000/api/results/export -OutFile "scored-leads.csv"
```
</details>

---

## 🐛 Troubleshooting

### Gemini API Errors

**Error:** "Gemini client not initialized"
- **Solution:** Ensure `GEMINI_API_KEY` is set in `.env` and `AI_PROVIDER=gemini`

**Error:** "Invalid API key"
- **Solution:** Get a valid API key from https://aistudio.google.com/apikey

**Error:** Rate limit exceeded
- **Solution:** Gemini free tier has rate limits (15 requests/minute). Wait a bit between requests.

### OpenAI API Errors (if using OpenAI)

**Error:** "OpenAI client not initialized"
- **Solution:** Ensure `OPENAI_API_KEY` is set in `.env` and `AI_PROVIDER=openai`

**Error:** Rate limit exceeded
- **Solution:** OpenAI free tier has rate limits. Wait or upgrade plan.

### CSV Upload Issues

**Error:** "CSV must contain columns..."
- **Solution:** Ensure CSV has exact headers: `name,role,company,industry,location,linkedin_bio`

**Error:** "File too large"
- **Solution:** CSV must be under 5MB

### General Issues

**Port already in use:**
```bash
# Change PORT in .env
PORT=3001
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 API Flow Diagram

```
1. POST /offer          → Store product information
2. POST /leads/upload   → Upload and parse CSV
3. POST /score          → Run scoring pipeline
   ├─ Rule Engine       → Calculate 0-50 points
   └─ AI Service        → Get intent + 10-50 points
4. GET /results         → Retrieve scored leads
5. GET /results/export  → Download as CSV
```

---

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `AI_PROVIDER` | No | gemini | AI provider (openai/gemini) |
| `GEMINI_API_KEY` | Yes (if using Gemini) | - | Google Gemini API key |
| `OPENAI_API_KEY` | Yes (if using OpenAI) | - | OpenAI API key |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Max requests per window |

---

## 🎥 Demo Video

Create a Loom video covering:
1. Starting the server
2. Creating an offer (POST /offer)
3. Uploading leads CSV (POST /leads/upload)
4. Running scoring (POST /score)
5. Viewing results (GET /results)
6. Exporting CSV (GET /results/export)
7. Showing the code structure

---

## 🌟 Bonus Features Implemented

✅ CSV Export functionality
✅ Unit tests for rule engine
✅ Docker support with docker-compose
✅ Comprehensive error handling
✅ Rate limiting and security headers
✅ Debug mode for detailed scoring breakdown
✅ Health check endpoint

---

## 📄 License

MIT

---

## 👤 Author

[Your Name]

---

## 🙏 Acknowledgments

- Google for Gemini 1.5 Flash API
- Express.js framework
- Node.js community

---

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for the Backend Engineer Assessment**
>>>>>>> 3ea5f17 (feat: add <describe small logical change>)
