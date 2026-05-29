# MissionOps AI - Google Cloud Run Integration & Deployment Notes

Core system container configuration details for running full-stack MissionOps on Google Cloud Run.

## Architecture Guidelines
1. **Stateless Autoscaling**: Cloud Run containers scale down to 0 when idle. Operational database states should reside in Cloud Firestore, while analytics telemetry dispatches to BigQuery.
2. **Standard Port routing**: Port 3000 mapping is recommended or default to standard container variable `$PORT` injected by GCP infrastructure.
3. **Secrets Mapping**: Mount Google Secret Manager API Keys as environment variables directly inside the Cloud Run service definition console or using gcloud CLI.

## Deployment Command
```bash
gcloud run deploy missionops-ai \
  --image gcr.io/your-project-id/missionops-ai:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=secrets/GEMINI_API_KEY:latest"
```
