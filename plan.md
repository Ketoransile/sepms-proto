# Implementation Plan: Smart Entrepreneurial Pitching & Matching System (SEPMS) - Web Exclusive

## 1. System Architecture & Tech Stack (Web-Only)
SEPMS utilizes a modern, decoupled web architecture bridging JavaScript and Python ecosystems.
* **Frontend (Web Client):** Next.js (App Router), React, Tailwind CSS, shadcn/ui for rapid, accessible component design.
* **Backend (Core API):** Node.js, Express.js
* **AI Processing Service:** Python, FastAPI (Standalone microservice)
* **Database:** MongoDB Atlas (Document Store + Vector Search Index)
* **Authentication:** Firebase Authentication (Web SDK - Stateless JWT)
* **Storage:** Cloudinary (Chunked uploads for pitch media and documents)

## 2. Database Schema (MongoDB Atlas)
The AI assistant must initialize these core collections via Mongoose:
* `users`: `_id`, `fullName`, `email`, `role` (Admin, Entrepreneur, Investor), `status`.
* `entrepreneurProfiles`: `userId`, `companyName`, `verified`, `documents` (array).
* `investorProfiles`: `userId`, `preferredSectors` (array), `minInvestment`, `maxInvestment`.
* `submissions` (Pitches): `entrepreneurId`, `title`, `summary`, `sector`, `targetAmount`, `status` (Draft, Submitted, UnderReview, Approved), `documents`.
* `embeddingEntries`: `submissionId`, `vectorKey` (high-dimensional array), `modelVersion`.
* `milestones` & `ledgerEntries`: For tracking the simulated phased investments.

---

## 3. Step-by-Step Web Execution Phases

### Phase 1: Web Infrastructure Setup & Monorepo
**Goal:** Establish the foundational web repositories and database connections. 
* **Step 1.1:** Initialize the Next.js frontend repository with Tailwind CSS and shadcn/ui.
* **Step 1.2:** Initialize the Node.js/Express backend repository.
* **Step 1.3:** Configure MongoDB Atlas and set up Mongoose schemas for all core collections.
* **Step 1.4:** Create the standalone Python FastAPI project for the AI Engine.
* **Step 1.5:** Implement CORS policies securely allowing the Next.js client to talk to the Node API, and the Node API to talk to the FastAPI service.

### Phase 2: Identity & Web Access Management (RBAC)
**Goal:** Secure the platform and route users to role-specific web dashboards.
* **Step 2.1:** Integrate the Firebase Web SDK for Authentication (Email/Password & Google Sign-in).
* **Step 2.2:** Build backend Express middleware to verify Firebase JWTs and extract the user's `role`.
* **Step 2.3:** Create role-based protected routes in Next.js:
  * Unverified users -> `/onboarding` (KYC Document Upload).
  * Verified Entrepreneurs -> `/entrepreneur/dashboard`.
  * Verified Investors -> `/investor/feed`.
  * Admins -> `/admin/oversight`.

### Phase 3: Web-Based Pitch Submission & Storage
**Goal:** Build the interactive, multi-step web form for entrepreneurs.
* **Step 3.1:** Build the Next.js multi-step form components (Problem, Solution, Business Model, Financials) using React Hook Form and Zod for client-side validation.
* **Step 3.2:** Implement a "Save as Draft" feature hitting a `PATCH /api/submissions/:id` endpoint.
* **Step 3.3:** Integrate the Cloudinary Node.js SDK. Build handlers for standard PDF uploads (legal docs) and chunked uploads for larger pitch deck videos.
* **Step 3.4:** Create the final submission review UI before the user triggers the AI analysis.

### Phase 4: AI & Analysis Subsystem (Python FastAPI)
**Goal:** Build the API endpoints that serve the custom-trained machine learning models. 

[Image of machine learning data pipeline]

* **Step 4.1 - OCR & Extraction:** Create an endpoint to receive document URLs, run OCR, and extract text to verify entity names and expiration dates.
* **Step 4.2 - Classification & Scoring:** Integrate the Scikit-learn model to classify document types and generate a "Pitch Completeness Score."
* **Step 4.3 - LLM Fallback:** Implement logic to query the Gemini API *only* if the Scikit-learn confidence score falls below a set threshold (e.g., 75%).
* **Step 4.4 - Semantic Embeddings:** Create an endpoint using the `all-MiniLM-L6-v2` model to generate vector embeddings from the verified web pitch text.
* **Step 4.5 - Audio Generation:** Integrate a TTS library (like Coqui) to generate `.wav` or `.mp3` audio summaries of the pitch text for the investor web dashboard.

### Phase 5: Investor Web Experience & Semantic Matching
**Goal:** Connect the AI vector outputs to the investor's web discovery feed.
* **Step 5.1:** Configure the MongoDB Vector Search Index on the `embeddingEntries` collection.
* **Step 5.2:** Build the recommendation logic in Express. When an investor accesses `/api/matches`, query the Vector Index using their profile preferences to fetch nearest-neighbor pitches.
* **Step 5.3:** Build the `/investor/feed` Next.js page. Display matches as high-quality UI cards featuring the AI Completeness Score, match percentage, and a built-in web audio player for the TTS summary.

### Phase 6: Web Communication & Admin Portals
**Goal:** Finalize platform interactions natively in the browser.
* **Step 6.1 - Messaging:** Build a real-time messaging interface in Next.js (using Socket.io) for secure communication between matched Investors and Entrepreneurs.
* **Step 6.2 - Milestone Tracking:** Build the web UI for entrepreneurs to submit milestone proof, and for investors to simulate the release of funds.
* **Step 6.3 - Admin Dashboard:** Build the Next.js data tables for admins to oversee platform health, manually verify flagged accounts, and review AI audit logs.

### Phase 7: Web Testing & Deployment
**Goal:** Push the web application to production environments.
* **Step 7.1:** Write automated API tests for the Node.js backend using Jest and Supertest.
* **Step 7.2:** Deploy the Next.js frontend to Vercel for optimal edge caching and performance.
* **Step 7.3:** Deploy the Node.js backend to a service like Render or Railway.
* **Step 7.4:** Containerize (Docker) and deploy the Python FastAPI service to a cloud provider that can handle the memory requirements of the embedding models.