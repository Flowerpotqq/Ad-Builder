import { promises as fs } from "fs";
import path from "path";

export type NormalizedEmailType =
  | "promotional"
  | "welcome"
  | "newsletter"
  | "transactional"
  | "reengagement"
  | "launch"
  | "followup";

export type EmailAgentFile =
  | "marketing.md"
  | "recall.md"
  | "newRelease.md"
  | "onboarding.md"
  | "followup.md";

export interface EmailAgentBundleInput {
  campaignType?: string;
  emailType?: string;
  goal?: string;
  keyMessage?: string;
  additionalNotes?: string;
}

export interface EmailAgentSelection {
  emailType: NormalizedEmailType;
  agentFile: EmailAgentFile;
  exampleFile: string;
}

export interface EmailAgentContextBundle {
  selection: EmailAgentSelection;
  loadedFiles: string[];
  fullContext: string;
  briefContext: string;
  subjectContext: string;
  copyContext: string;
  layoutContext: string;
  htmlContext: string;
  qaContext: string;
}

const EMAIL_AGENT_ROOT = path.join(process.cwd(), "email-agent");
const fileCache = new Map<string, string>();

function normalize(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

function inferEmailType(input: EmailAgentBundleInput): NormalizedEmailType {
  const directType = normalize(input.emailType || input.campaignType);
  if (directType) {
    if (containsAny(directType, ["welcome", "onboard"])) return "welcome";
    if (containsAny(directType, ["newsletter", "digest"])) return "newsletter";
    if (containsAny(directType, ["transactional", "receipt", "confirmation"])) {
      return "transactional";
    }
    if (containsAny(directType, ["reengage", "re-engage", "winback", "win-back"])) {
      return "reengagement";
    }
    if (containsAny(directType, ["launch", "release", "announcement"])) return "launch";
    if (containsAny(directType, ["followup", "follow-up", "reminder", "recall"])) {
      return "followup";
    }
    if (containsAny(directType, ["promo", "promotional", "offer"])) return "promotional";
  }

  const signal = normalize(
    `${input.goal || ""} ${input.keyMessage || ""} ${input.additionalNotes || ""}`
  );

  if (containsAny(signal, ["welcome", "onboard", "first setup", "getting started"])) {
    return "welcome";
  }
  if (containsAny(signal, ["newsletter", "weekly", "monthly", "digest"])) {
    return "newsletter";
  }
  if (
    containsAny(signal, [
      "password reset",
      "receipt",
      "invoice",
      "order confirmation",
      "appointment reminder",
      "transactional",
      "shipping",
    ])
  ) {
    return "transactional";
  }
  if (containsAny(signal, ["launch", "new release", "feature update", "announcement"])) {
    return "launch";
  }
  if (
    containsAny(signal, [
      "re-engage",
      "reengage",
      "win back",
      "winback",
      "inactive",
      "dormant",
      "come back",
      "return",
    ])
  ) {
    return "reengagement";
  }
  if (containsAny(signal, ["follow-up", "follow up", "reminder", "nudge"])) {
    return "followup";
  }

  return "promotional";
}

function selectAgent(
  emailType: NormalizedEmailType,
  input: EmailAgentBundleInput
): EmailAgentFile {
  const signal = normalize(
    `${input.goal || ""} ${input.keyMessage || ""} ${input.additionalNotes || ""}`
  );

  if (containsAny(signal, ["launch", "new release", "feature update", "announcement"])) {
    return "newRelease.md";
  }
  if (containsAny(signal, ["welcome", "onboard", "getting started", "first setup"])) {
    return "onboarding.md";
  }
  if (
    containsAny(signal, [
      "re-engage",
      "reengage",
      "win back",
      "winback",
      "inactive",
      "dormant",
      "return",
    ])
  ) {
    return "followup.md";
  }
  if (containsAny(signal, ["reminder", "follow-up", "follow up", "transactional"])) {
    return "recall.md";
  }

  switch (emailType) {
    case "welcome":
      return "onboarding.md";
    case "transactional":
      return "recall.md";
    case "reengagement":
    case "followup":
      return "followup.md";
    case "launch":
      return "newRelease.md";
    default:
      return "marketing.md";
  }
}

function pickExampleFile(emailType: NormalizedEmailType): string {
  switch (emailType) {
    case "welcome":
      return "examples/welcome.md";
    case "newsletter":
    case "launch":
      return "examples/newsletter.md";
    case "transactional":
      return "examples/transactional.md";
    case "reengagement":
    case "followup":
      return "examples/reengagement.md";
    default:
      return "examples/promo.md";
  }
}

async function readEmailAgentFile(relativePath: string): Promise<string> {
  const cached = fileCache.get(relativePath);
  if (cached) return cached;

  const absolutePath = path.join(EMAIL_AGENT_ROOT, relativePath);
  try {
    const content = await fs.readFile(absolutePath, "utf8");
    fileCache.set(relativePath, content);
    return content;
  } catch {
    const fallback = `[Missing email-agent file: ${relativePath}]`;
    fileCache.set(relativePath, fallback);
    return fallback;
  }
}

async function buildContextDocument(
  contextName: string,
  selection: EmailAgentSelection,
  files: string[]
): Promise<string> {
  const uniqueFiles = uniq(files);
  const lines: string[] = [
    `# Email-Agent Context (${contextName})`,
    `Selected Email Type: ${selection.emailType}`,
    `Selected Agent: ${selection.agentFile}`,
    `Selected Example: ${selection.exampleFile}`,
    "",
  ];

  for (const file of uniqueFiles) {
    const content = await readEmailAgentFile(file);
    lines.push(`<<<FILE:${file}>>>`);
    lines.push(content);
    lines.push(`<<<END_FILE:${file}>>>`);
    lines.push("");
  }

  return lines.join("\n");
}

export async function buildEmailAgentContextBundle(
  input: EmailAgentBundleInput
): Promise<EmailAgentContextBundle> {
  const emailType = inferEmailType(input);
  const agentFile = selectAgent(emailType, input);
  const exampleFile = pickExampleFile(emailType);
  const agentPath = `agents/${agentFile}`;

  const fullFiles = [
    "master-prompt.md",
    "system.md",
    "input-schema.md",
    "output-schema.md",
    "orchestration.md",
    "design-system.md",
    "frameworks.md",
    "components.md",
    "tone.md",
    "guardrails.md",
    "personalization.md",
    "deliverability.md",
    "quality-checklist.md",
    "playbooks/subject-lines.md",
    "playbooks/cta-library.md",
    "playbooks/a-b-testing.md",
    "playbooks/sequence-maps.md",
    agentPath,
    exampleFile,
  ];

  const briefFiles = [
    "system.md",
    "input-schema.md",
    "frameworks.md",
    "tone.md",
    "orchestration.md",
    agentPath,
    exampleFile,
  ];

  const subjectFiles = [
    "system.md",
    "frameworks.md",
    "tone.md",
    "playbooks/subject-lines.md",
    agentPath,
    exampleFile,
  ];

  const copyFiles = [
    "system.md",
    "design-system.md",
    "frameworks.md",
    "components.md",
    "tone.md",
    "playbooks/cta-library.md",
    agentPath,
    exampleFile,
  ];

  const layoutFiles = [
    "system.md",
    "design-system.md",
    "frameworks.md",
    "components.md",
    agentPath,
    exampleFile,
  ];

  const htmlFiles = [
    "system.md",
    "design-system.md",
    "components.md",
    "deliverability.md",
    "guardrails.md",
  ];

  const qaFiles = ["quality-checklist.md", "guardrails.md", "deliverability.md", "system.md"];

  const selection: EmailAgentSelection = {
    emailType,
    agentFile,
    exampleFile,
  };

  const [fullContext, briefContext, subjectContext, copyContext, layoutContext, htmlContext, qaContext] =
    await Promise.all([
      buildContextDocument("full", selection, fullFiles),
      buildContextDocument("brief", selection, briefFiles),
      buildContextDocument("subject", selection, subjectFiles),
      buildContextDocument("copy", selection, copyFiles),
      buildContextDocument("layout", selection, layoutFiles),
      buildContextDocument("html", selection, htmlFiles),
      buildContextDocument("qa", selection, qaFiles),
    ]);

  return {
    selection,
    loadedFiles: uniq([
      ...fullFiles,
      ...briefFiles,
      ...subjectFiles,
      ...copyFiles,
      ...layoutFiles,
      ...htmlFiles,
      ...qaFiles,
    ]),
    fullContext,
    briefContext,
    subjectContext,
    copyContext,
    layoutContext,
    htmlContext,
    qaContext,
  };
}
