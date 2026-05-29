export const MISSION_PLAN_SCHEMA_DESCRIPTION = `
{
  "missionId": "string",
  "title": "string",
  "objective": "string",
  "summary": "string",
  "businessRationale": "string",
  "priority": "low | medium | high | critical",
  "status": "draft | planning | pending_approval | active | blocked | completed | failed",
  "kpis": [
    {
      "name": "string",
      "target": "string",
      "measurementMethod": "string"
    }
  ],
  "milestones": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "ownerRole": "string",
      "dueInDays": 30, // number
      "tasks": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "ownerRole": "string",
          "estimatedHours": 10, // number
          "dependencies": ["string"], // list of task IDs
          "requiresApproval": true, // boolean
          "status": "todo | in_progress | pending_approval | blocked | done"
        }
      ]
    }
  ],
  "risks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "severity": "low | medium | high | critical",
      "likelihood": "low | medium | high",
      "mitigation": "string"
    }
  ],
  "agents": [
    {
      "id": "string",
      "name": "string",
      "role": "string",
      "responsibilities": ["string"]
    }
  ],
  "approvalGates": [
    {
      "id": "string",
      "title": "string",
      "approverRole": "string",
      "requiredBefore": "string", // E.g. milestone id or task id
      "riskIfSkipped": "string"
    }
  ],
  "executiveBriefing": {
    "headline": "string",
    "currentStatus": "string",
    "topRisks": ["string"],
    "nextDecisions": ["string"],
    "recommendedActions": ["string"]
  }
}
`;
