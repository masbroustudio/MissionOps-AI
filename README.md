# MissionOps AI - Enterprise Intelligent Workflow Automation

MissionOps AI is an enterprise-grade autonomous mission-control platform that transforms high-level business objectives into executable, auditable, human-approved workflows across departments, agent swarms, and backend production systems.

```
+===================================================================+
|                        MISSIONOPS AI [MVP]                        |
|                                                                   |
| [Objective Entry] --> [LLM Router Fallback] --> [Workflow Plan]   |
|                              |                                    |
|                              v                                    |
|              [Multi-Agent Swarm Simulation]                       |
|                              |                                    |
|                              v                                    |
|              [Executive Human Approval Gates]                     |
+===================================================================+
```

## Core Visual Design
The UI utilizes a striking, high-contrast **Neo-Brutalist** design theme:
- Bold, thick black borders with solid offset margins.
- Clean high-contrast color highlights indicating priorities.
- Generous grid layouts and stark, readable system metrics.
- Minimalist, purpose-driven entry hover animations.

## Technical Architecture Overview
- **Core Full-Stack**: React, Next.js App Router, TypeScript, and Tailwind CSS.
- **Resilient AI Routing**: Incorporates a lazy-initialized fallback chain querying Gemini (default), Groq, Cerebras, Sumopod, or Mock Providers.
- **Fail-safe Simulation**: Mock fallback is built directly into the client-side server pipelines. Even without external keys configured, any arbitrary objective is dynamically mapped into a high-fidelity plan!
- **Auditable Security**: Registers structured transaction traces inside an operational Audit Repository mapping to GCP BigQuery.

## Quickstart & Local Installation
1. Install base development libraries:
   ```bash
   npm install
   ```
2. Setup environment variables inside your `.env` or `.env.local` based on `.env.example`.
3. Launch development workspace dev server:
   ```bash
   npm run dev
   ```
4. Access platform on local port: `http://localhost:3000`

## Production GCP Cloud Run Build & Deployment
For high scale deployments:
```bash
# Build the standalone docker container
docker build -t gcr.io/your-project/missionops-ai:latest .

# Deploy container directly to Cloud Run
gcloud run deploy missionops-ai \
  --image gcr.io/your-project/missionops-ai:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
