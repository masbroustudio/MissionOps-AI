# LLM Multi-Provider setup

MissionOps AI supports a resilient chain of generative AI providers.

## Key Ordering Configuration
Define the prioritary resolution order using `LLM_PROVIDER_ORDER`:
```env
LLM_PROVIDER_ORDER=gemini,groq,cerebras,sumopod,mock
```

## Key Mapping
1. **Gemini (Default)**:
   - `GEMINI_API_KEY`: Required for standard operation.
   - `GEMINI_MODEL`: Defaults to `gemini-3.5-flash`.
2. **Groq**:
   - `GROQ_API_KEY`: Groq API authorization.
   - `GROQ_MODEL`: Recommended `llama-3.3-70b-versatile`.
3. **Cerebras**:
   - `CEREBRAS_API_KEY`: Cerebras Wafer-Scale API authorization key.
   - `CEREBRAS_MODEL`: Recommended `llama3.1-70b`.
4. **Sumopod**:
   - `SUMOPOD_API_KEY`: Custom enterprise server token.
   - `SUMOPOD_BASE_URL`: Endpoint router.
   - `SUMOPOD_MODEL`: Custom client models.
5. **MockProvider**: Fully virtual fallback with offline metrics templates. No keys needed.
