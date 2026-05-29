# Google Secret Manager Mapping Guidelines

To prevent committing API keys of Gemini, Groq, Cerebras, or Sumopod into source logs or version control, use Google Secret Manager.

## Environment Secret Resolution
1. Store values securely inside Secret Manager:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `CEREBRAS_API_KEY`
   - `SUMOPOD_API_KEY`

2. Bind Secret Manager values directly inside Cloud Run container settings:
   ```yaml
   spec:
     containers:
       - image: gcr.io/project/missionops
         env:
           - name: GEMINI_API_KEY
             valueFrom:
               secretKeyRef:
                 name: GEMINI_API_KEY
                 version: "latest"
   ```
