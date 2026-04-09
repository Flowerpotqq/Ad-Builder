"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  Monitor,
  Smartphone,
  Copy,
  Save,
  Send,
  Undo2,
  Wand2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

/** Quick optimization actions available in the sidebar */
const optimizationActions = [
  { label: "Make more sales-focused", instruction: "Make the copy more sales-focused and persuasive" },
  { label: "Shorten this email", instruction: "Shorten the email content while keeping the key message" },
  { label: "Strengthen the CTA", instruction: "Make the call-to-action more compelling and urgent" },
  { label: "Make tone more urgent", instruction: "Add urgency to the tone without being pushy" },
  { label: "Simplify language", instruction: "Simplify the language for broader readability" },
  { label: "Add a PS section", instruction: "Add a compelling PS (postscript) section after the footer before the unsubscribe" },
];

/** Dual-pane email editor with AI generation and live preview */
export default function CampaignEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const campaignId = params.id as string;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // State
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [editMode, setEditMode] = useState(false);

  // Brief form state
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Refinement state
  const [refineInstruction, setRefineInstruction] = useState("");
  const [refineSection, setRefineSection] = useState("all");

  // Send settings
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");

  // Version history
  const [versions, setVersions] = useState<Array<{ id: string; version: number; instruction: string | null; createdAt: string; htmlContent: string }>>([]);

  /** Load the campaign on mount */
  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        const data = await res.json();
        if (data.success) {
          const c = data.data.campaign;
          setCampaign(c);
          setHtmlContent(c.htmlContent || "");
          setSubject(c.subject || "");
          setPreviewText(c.previewText || "");
          setVersions(c.versions || []);
        }
      } catch {
        toast({ title: "Error", description: "Failed to load campaign", variant: "destructive" });
      }
    }
    loadCampaign();
  }, [campaignId, toast]);

  /** Update iframe preview when HTML changes */
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent, previewMode]);

  /** Auto-save draft every 30 seconds */
  const saveDraft = useCallback(async () => {
    if (!htmlContent) return;
    setIsSaving(true);
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent, subject, previewText }),
      });
    } catch {
      // Silent fail for auto-save
    } finally {
      setIsSaving(false);
    }
  }, [campaignId, htmlContent, subject, previewText]);

  useEffect(() => {
    if (htmlContent) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(saveDraft, 30000);
    }
    return () => clearTimeout(autoSaveTimer.current);
  }, [htmlContent, saveDraft]);

  /** Generate email via AI */
  async function handleGenerate() {
    if (!goal || !audience || !keyMessage || !ctaText) {
      toast({ title: "Missing fields", description: "Please fill in all campaign brief fields", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, audience, keyMessage, ctaText, additionalNotes }),
      });

      const data = await res.json();
      if (data.success) {
        setHtmlContent(data.data.htmlContent);
        // Save version
        await fetch(`/api/campaigns/${campaignId}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ htmlContent: data.data.htmlContent, instruction: "Initial generation" }),
        });
        toast({ title: "Email generated!", description: "Your email is ready in the preview panel" });
      } else {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate email", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  /** Refine email via AI */
  async function handleRefine(instruction: string) {
    if (!htmlContent) {
      toast({ title: "No email to refine", description: "Generate an email first", variant: "destructive" });
      return;
    }

    setIsRefining(true);
    try {
      const res = await fetch("/api/ai/refine-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent,
          instruction,
          section: refineSection !== "all" ? refineSection : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setHtmlContent(data.data.htmlContent);
        await fetch(`/api/campaigns/${campaignId}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ htmlContent: data.data.htmlContent, instruction }),
        });
        toast({ title: "Email updated!", description: `Applied: ${instruction}` });
      } else {
        toast({ title: "Refinement failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to refine email", variant: "destructive" });
    } finally {
      setIsRefining(false);
    }
  }

  /** Copy HTML to clipboard */
  function handleCopyHtml() {
    navigator.clipboard.writeText(htmlContent);
    toast({ title: "Copied!", description: "HTML copied to clipboard" });
  }

  /** Manual save */
  async function handleSave() {
    setIsSaving(true);
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent, subject, previewText }),
      });
      toast({ title: "Saved!", description: "Campaign draft saved successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  /** Undo to previous version */
  async function handleUndo() {
    if (versions.length < 2) return;
    const previousVersion = versions[1]; // Second most recent
    if (previousVersion) {
      setHtmlContent(previousVersion.htmlContent);
      toast({ title: "Undone", description: "Reverted to previous version" });
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* LEFT PANEL — AI Controls */}
      <div className="scrollbar-subtle w-[400px] shrink-0 overflow-y-auto rounded-lg border bg-card p-4 shadow-[0_8px_20px_rgba(13,30,68,0.08)]">
        {/* Campaign Brief */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Campaign Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Input
                id="goal"
                placeholder="e.g., Drive sign-ups for our new service"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Local service businesses"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="keyMessage">Key Message</Label>
              <Textarea
                id="keyMessage"
                placeholder="e.g., Our AI tools can 3x your leads in 30 days"
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="ctaText">CTA Button Text</Label>
              <Input
                id="ctaText"
                placeholder="e.g., Get Started Free"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate Email</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Optimization Actions */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4" />
              Optimize
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mb-3">
              <Label>Target Section</Label>
              <Select value={refineSection} onValueChange={setRefineSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire email</SelectItem>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="hero">Hero section</SelectItem>
                  <SelectItem value="body">Body content</SelectItem>
                  <SelectItem value="cta">CTA button</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {optimizationActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 text-xs"
                  onClick={() => handleRefine(action.instruction)}
                  disabled={isRefining || !htmlContent}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <Label>Custom Instruction</Label>
              <Textarea
                placeholder="Tell Claude what to change..."
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                rows={2}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (refineInstruction) handleRefine(refineInstruction);
                }}
                disabled={isRefining || !htmlContent || !refineInstruction}
              >
                {isRefining ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Applying...</>
                ) : (
                  "Apply Change"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Send Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4" />
              Send Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Enter subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="previewText">Preview Text</Label>
              <Input
                id="previewText"
                placeholder="Shown in inbox preview"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(`/dashboard/campaigns/${campaignId}/send`)}
              disabled={!htmlContent}
            >
              <Send className="mr-2 h-4 w-4" />
              Configure Send
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL — Preview */}
      <div className="flex flex-1 flex-col rounded-lg border bg-card shadow-[0_8px_20px_rgba(13,30,68,0.08)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="mr-1 h-4 w-4" /> Desktop
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="mr-1 h-4 w-4" /> Mobile
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {versions.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleUndo}>
                <Undo2 className="mr-1 h-4 w-4" /> Undo
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleCopyHtml} disabled={!htmlContent}>
              <Copy className="mr-1 h-4 w-4" /> Copy HTML
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || !htmlContent}>
              {isSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              Save Draft
            </Button>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="flex flex-1 items-start justify-center overflow-auto bg-muted p-4">
          {htmlContent ? (
            <iframe
              ref={iframeRef}
              className="rounded-md border border-border bg-card shadow-[0_4px_14px_rgba(13,30,68,0.1)]"
              style={{
                width: previewMode === "desktop" ? "600px" : "375px",
                minHeight: "600px",
                height: "100%",
                transition: "width 0.3s ease",
              }}
              sandbox="allow-same-origin"
              title="Email preview"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">No email yet</h3>
              <p className="max-w-sm text-sm">
                Fill in the campaign brief on the left and click &quot;Generate Email&quot; to create your AI-powered email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
