# MissionOps AI - System Architecture

MissionOps AI utilizes an enterprise logical division to achieve high scalability, fault-tolerance, and easy operational transitions.

```
+-------------------------------------------------------------------+
|                           Next.js UI                              |
|          (React Presentational Views, Neo-Brutalist Layouts)      |
+-------------------+---------------------------+-------------------+
                    |                           |
                    v                           v
         +--------------------+       +--------------------+
         |   Server Pages     |       |    API Endpoints   |
         | (Page Transitions) |       |   (JSON Rest)      |
         +--------------------+       +---------+----------+
                                                |
                                                v
+-----------------------------------------------+-------------------+
|                        MissionOps Service Layer                   |
|  - MissionPlannerService           - WorkflowService              |
|  - AgentOrchestratorService        - ApprovalService              |
|  - BriefingService                 - AuditService                 |
+---------------------------------------+---------------------------+
                                        |
                 +----------------------+--------------------+
                 |                                           |
                 v                                           v
+---------------------------------+         +-------------------------------+
|       LLM Provider Router       |         |     Repositories Abstraction  |
|  - Primary Provider Fallback    |         |  - IMissionRepository         |
|  - Circuit Breakers & Retries   |         |  - IAuditRepository           |
|                                 |         |                               |
|   Providers:                    |         |  Implementations:             |
|   * GeminiProvider (Default)    |         |  * LocalMissionRepository     |
|   * Groq / Cerebras / Sumopod   |         |  * FirestoreMissionRepository |
|   * MockProvider (Fail-safe)    |         |                               |
+---------------------------------+         +-------------------------------+
```

## Layers
1. **Domain Entities**: Pure, standard TypeScript schemas containing strict type interfaces representing tasks, milestones, KPIs, and audit trails.
2. **Operational Repository**: Abstraction interface layers permettant zero-downtime transition from Node local hot-cache data to Google Cloud Firestore Operational levels.
3. **LLM Provider Swarm**: Router integrating G&G, Cerebras, and Sumopod custom completion endpoints, coupled to dynamic structural cleaners and repairs fallback blocks.
4. **Agent Swarm Logic**: Virtual analyst nodes carrying automated work simulation steps, registering structured records inside Analytical BigQuery or Audit databases.
