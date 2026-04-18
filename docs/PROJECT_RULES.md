# Project Rules for AI Assistants

> This document defines the coding standards and patterns for the **deco-generator** project. Follow these rules strictly when generating or modifying code.

---

## 1. Feature-Sliced Design (FSD) Architecture

**Philosophy:** Divide by Feature, not by File Type.

### Layer Hierarchy (Low → High)

| Layer | Purpose | Examples |
|-------|---------|----------|
| `shared/` | Reusable generic code | Buttons, Math helpers, Configs, Types |
| `entities/` | Business models & data | User, Image, Session |
| `features/` | User interactions | GenerateImage, UploadToDiscord |
| `widgets/` | Composition of features | ImageGeneratorPanel, HistoryList |
| `pages/` | Composition of widgets | MainScreen |
| `app/` | Global providers, styles, entry point | Providers, GlobalStyles |

### Import Rule
```
✅ High layers CAN import Low layers
❌ Low layers NEVER import High layers
```

---

## 2. Directory Structure

```
/src
├── app/           → Providers, Global Styles, Entry point, apps-registry.ts
├── apps/          → Self-contained app modules (one folder per app)
│   ├── image-generator/  → Image Generator app layout component
│   ├── pose-editor/      → Pose Editor app (stub)
│   └── outfit-editor/    → Outfit Editor app (stub)
├── shared/
│   ├── ui/        → Reusable Dumb UI (Buttons, Panels, Grid)
│   ├── lib/       → Math helpers, formatters (NO React code)
│   ├── config/    → Constants and settings
│   ├── types/     → Shared TypeScript interfaces
│   └── api/       → API client functions
├── entities/      → Business logic (Image types, User interfaces)
├── features/      → Smart components (GenerateButton, PromptInput)
└── widgets/       → Composition (Header, Sidebar, HistoryPanel, etc.)

/api               → Vercel Serverless Functions
├── auth/          → Authentication endpoints
└── *.ts           → Individual API handlers
```

### Apps Layer (`src/apps/`)

Each app is a self-contained folder with its own layout component. Apps are registered in `src/app/apps-registry.ts` as an ordered array — **reordering the array changes the sidebar position** without touching any other logic.

```ts
// src/app/apps-registry.ts
export const APPS = [
  { id: 'image-generator', name: 'Image Generator', icon: Layers },
  { id: 'pose-editor',     name: 'Pose Editor',     icon: PersonStanding },
  { id: 'outfit-editor',   name: 'Outfit Editor',   icon: Shirt },
];
```

The sidebar and header title are driven by this registry. `App.tsx` uses a `switch` on `activeAppId` to render the correct app component.

---

## 3. Logic vs. View Separation

### UI Components (`.tsx`)
- **Dumb.** They only show data and handle clicks.
- No business logic, no calculations, no direct API calls.

```tsx
// ❌ Bad: Logic inside component
<Button onClick={() => { callApi(); setLoading(true); transform(data); }} />

// ✅ Good: Logic extracted to hook
<GenerateButton onClick={handleGenerate} isLoading={isLoading} />
```

### Hooks/Logic (`.ts`)
- **Smart.** They handle algorithms, state, and side effects.
- Name pattern: `use[Feature].ts`

```
useImageGeneration.ts  → Handles generation logic
useDiscordUpload.ts    → Handles Discord integration
```

---

## 4. The Modular-First Mandate

### 150-Line Limit
- Keep files under **150 lines**.
- If a component has too many `useEffect` or `useState`, extract to a custom hook.
- If a file scrolls too long, **split it**.

### File Splitting Patterns
```
// Before: MonolithicComponent.tsx (300 lines)

// After:
MonolithicComponent.tsx        → UI only (~80 lines)
useMonolithicComponent.ts      → Logic hook (~100 lines)
MonolithicComponent.types.ts   → Types (~30 lines)
```

---

## 5. Single Source of Truth (SSOT)

### State Management
- ❌ **Never** pass data through 10 layers (Prop Drilling).
- ✅ Use React Context or a global store for shared state.

### Type Definitions
- ❌ **Never** define types inside a component file.
- ✅ Create central type files:
  - `src/shared/types/*.ts` for shared types
  - `src/entities/[entity]/types.ts` for entity-specific types

### Magic Numbers
- ❌ **Never** write raw numbers like `timeout = 5000`.
- ✅ Use config files: `src/shared/config/*.ts`

---

## 6. Compound Components Pattern

Use for complex UI with implicit parent/child communication:
- Tabs, Dropdowns, Accordions, Modals

```tsx
// Usage pattern
<Accordion>
  <Accordion.Item>
    <Accordion.Header>Title</Accordion.Header>
    <Accordion.Content>Content</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

---

## 7. Immutability

**Never mutate state directly.**

```tsx
// ❌ Bad
items[0] = newItem;
state.count++;

// ✅ Good
setItems([newItem, ...items.slice(1)]);
setState(prev => ({ ...prev, count: prev.count + 1 }));
```

---

## 8. API & Serverless Functions

### Location
All serverless functions live in `/api` directory (Vercel convention).

### Structure Pattern
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // 1. CORS headers (if needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 3. Method validation
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // 4. Environment variable validation
  const API_KEY = process.env.MY_API_KEY;
  if (!API_KEY) {
    res.status(500).json({ error: 'API_KEY is not configured' });
    return;
  }
  
  // 5. Business logic
  try {
    // ... implementation
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Naming Convention
- Auth endpoints: `/api/auth/*.ts`
- Feature endpoints: `/api/[feature-name].ts`
- Use kebab-case for filenames: `discord-webhook-url.ts`

---

## 9. Environment Variables

### Naming Convention
- Use `SCREAMING_SNAKE_CASE`
- Prefix by service: `GOOGLE_*`, `DISCORD_*`, `AUTH_*`

### Current Variables
| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `AUTH_SECRET` | JWT signing secret for sessions |
| `DISCORD_WEBHOOK_URL` | Discord webhook for uploads |
| `ADMIN_EMAILS` | Comma-separated admin emails (supports `*@domain.com` wildcards) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account email for Drive API |
| `GOOGLE_PRIVATE_KEY` | Service Account private key (escaped) |
| `TEAM_DRIVE_ROOT_ID` | Root folder ID for team files |

### Access Pattern
```typescript
// ✅ Always validate before use
const API_KEY = process.env.MY_KEY;
if (!API_KEY) {
  throw new Error('MY_KEY is not configured ');
}

// ❌ Never use without validation
const key = process.env.MY_KEY!; // Dangerous assumption
```

### Client-Side Access
- Only variables prefixed with `VITE_` are exposed to the client.
- ❌ **Never** expose secrets to the client.
- ✅ Use serverless functions to proxy secret-dependent requests.

---

## 10. Pre-Code Checklist

Before generating code, answer:
1. **"What FSD layer does this belong to?"**
2. **"What patterns apply to THIS specific file?"**

After generating code, verify:
1. **"Does this code comply with those patterns?"**
2. **"Is this file under 150 lines?"**
3. **"Are there any magic numbers or inline types?"**

---

## 11. AI Assistant Rules

### Build & Test Commands
- **❌ NEVER run build or test commands** (e.g., `npm run build`, `npm test`, `npx tsc`).
- The user will run these commands themselves.
- Focus on code generation and modification only.

### Testing Environment
- **❌ NEVER assume local development testing** (e.g., `npm run dev`, `npm run dev:full`).
- **✅ User ALWAYS tests on production Vercel** - the project uses Git version control with Vercel's automatic deployment pipeline.
- All API routes (`/api/*`) require deployment to Vercel to function.
- When debugging issues, remember that new files must be deployed before they're accessible.

