export function cleanAndParseJson<T = any>(str: string): T {
  let cleaned = str.trim();
  
  // Strip Markdown markers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  cleaned = cleaned.trim();

  // Handle common trailing comma error in LLM JSON outputs
  // e.g. "key": "value", } -> "key": "value" }
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    // If double quote is missing somewhere or nested quotes cause crash,
    // throw structured action to invite repair/fallback cycle.
    throw new Error(`JSON validation failed on text context: ${err.message}. Raw: \n${str}`);
  }
}
