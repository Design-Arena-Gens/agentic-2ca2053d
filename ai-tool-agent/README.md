## AI Tool Agent

A Next.js agentic workspace that orchestrates a handful of lightweight tools to give fast answers without depending on external APIs. The UI presents a chat-style surface while the server-side agent inspects every prompt, chooses a capability, executes it, and returns the reasoning trace alongside the final answer.

### Features

- **Intent detection** that maps prompts to one of five built-in tools (calculator, weather brief, knowledge base, task planner, idea generator).
- **Transparent tool traces** so you can see which capability was selected, the input that was passed, and the output the agent produced.
- **Modern glassmorphism UI** with dark-mode friendly gradients, badges that highlight the available skills, and subtle motion cues.
- **Fully serverless** API endpoint at `POST /api/agent` that accepts `{ "message": string }` and returns `{ reply, steps }` JSON for easy reuse in other clients.

### Running locally

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and drop a prompt such as:

- `Calculate 42 * 19 + 33`
- `What's the weather in Tokyo?`
- `Plan a launch checklist for my MVP`
- `Share ideas for a developer community meetup`

The response includes the assistant message plus a "Tool trace" card that details each operation the agent performed.

### API usage

```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan a launch checklist"}'
```

Sample response:

```json
{
  "reply": "1. Clarify scope -> Break Plan a launch checklist into concrete deliverables...",
  "steps": [
    {
      "id": "...",
      "tool": "task-planner",
      "title": "Task Planner",
      "reasoning": "Translated the request into three actionable milestones...",
      "input": "Plan a launch checklist",
      "output": "1. Clarify scope -> ..."
    }
  ]
}
```

### Deployment

The project is optimized for Vercel. Build locally first to ensure everything compiles:

```bash
npm run build
```

Then deploy with the supplied token:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-2ca2053d
```
