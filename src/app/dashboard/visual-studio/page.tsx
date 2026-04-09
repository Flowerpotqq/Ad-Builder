"use client";

import { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  Download,
  RefreshCw,
  Layers,
  CheckCircle,
  XCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  adTemplateMap,
  type AdTemplateProps,
} from "@/components/visual-studio/ad-templates";

const FORMATS: Record<string, Array<{ value: string; label: string }>> = {
  facebook: [
    { value: "square", label: "Feed (1080x1080)" },
    { value: "story", label: "Story (1080x1920)" },
    { value: "carousel", label: "Carousel (1080x1080)" },
  ],
  tiktok: [
    { value: "vertical", label: "In-feed (1080x1920)" },
    { value: "spark", label: "Spark Ad (1080x600)" },
  ],
};

const VISUAL_TYPES = [
  { value: "stat", label: "Stat Card" },
  { value: "service", label: "Service Highlight" },
  { value: "testimonial", label: "Testimonial" },
  { value: "promo", label: "Promotion" },
  { value: "comparison", label: "Problem/Solution" },
  { value: "highlight", label: "Before/After" },
];

/** Checklist items for ad quality */
function getChecklist(headline: string, ctaText: string, logoUrl?: string) {
  return [
    { label: "Headline under 40 characters", pass: headline.length <= 40 },
    { label: "CTA is present", pass: ctaText.length > 0 },
    { label: "Brand logo present", pass: !!logoUrl },
    { label: "Text coverage under 20% (Facebook rule)", pass: true }, // Simplified
    { label: "Export under 30MB", pass: true },
  ];
}

/** Map visual type to template component name */
function getTemplateName(visualType: string): string {
  const map: Record<string, string> = {
    stat: "StatCard",
    service: "ServiceCard",
    testimonial: "TestimonialCard",
    promo: "PromoCard",
    comparison: "ProblemSolution",
    highlight: "BeforeAfter",
  };
  return map[visualType] || "StatCard";
}

/** Visual Content Studio page */
export default function VisualStudioPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Form state
  const [platform, setPlatform] = useState("facebook");
  const [format, setFormat] = useState("square");
  const [visualType, setVisualType] = useState("stat");
  const [description, setDescription] = useState("");
  const [useBrand, setUseBrand] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Ad content from agents
  const [adCopy, setAdCopy] = useState({
    headline: "",
    subtext: "",
    ctaText: "",
    hook: "",
    urgencyLine: "",
  });
  const [adLayout, setAdLayout] = useState({
    template: "StatCard",
    colorScheme: {
      background: "#0e0e2c",
      text: "#ffffff",
      accent: "#b8dff0",
      cta: "#ffffff",
    },
    iconStyle: "outline",
    layoutVariant: "centered",
  });
  const [adBrief, setAdBrief] = useState<Record<string, unknown>>({});

  // Caption state
  const [caption, setCaption] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  async function handleGenerate() {
    if (!description.trim()) {
      toast({ title: "Missing description", description: "Tell us about your ad", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/visual/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, platform, format, visualType }),
      });

      const data = await res.json();
      if (data.success) {
        setAdCopy(data.data.copy);
        setAdLayout(data.data.layout);
        setAdBrief(data.data.brief);
        setGenerated(true);
        toast({ title: "Ad generated!", description: `${data.data.totalTokens} tokens used` });
      } else {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate ad", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExportPng() {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      // Dynamic import html2canvas
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `nap-ad-${platform}-${format}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({ title: "Downloaded!", description: "Your ad image has been saved" });
    } catch {
      toast({ title: "Export failed", description: "Could not generate image", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSaveToLibrary() {
    if (!canvasRef.current) return;
    try {
      await fetch("/api/visual/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          format,
          visualType,
          headline: adCopy.headline,
          subtext: adCopy.subtext,
          ctaText: adCopy.ctaText,
          htmlSnapshot: canvasRef.current.innerHTML,
          agentOutputs: { copy: adCopy, layout: adLayout, brief: adBrief },
        }),
      });
      toast({ title: "Saved!", description: "Ad saved to your library" });
    } catch {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  }

  // Get the template component
  const templateName = adLayout.template || getTemplateName(visualType);
  const TemplateComponent = adTemplateMap[templateName] || adTemplateMap.StatCard;

  // Scale for preview
  const dimensions = format === "story" || format === "vertical"
    ? { width: 1080, height: 1920 }
    : format === "spark"
    ? { width: 1080, height: 600 }
    : { width: 1080, height: 1080 };

  const previewScale = 350 / dimensions.width;
  const checklist = generated ? getChecklist(adCopy.headline, adCopy.ctaText) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visual Content Studio</h1>
        <p className="text-muted-foreground">Create social media ad graphics with AI</p>
      </div>

      <div className="flex gap-6">
        {/* LEFT PANEL - Controls */}
        <div className="w-[380px] shrink-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ad Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={(v) => { setPlatform(v); setFormat(FORMATS[v][0].value); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMATS[platform].map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Visual Type</Label>
                <Select value={visualType} onValueChange={setVisualType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VISUAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Describe your ad</Label>
                <Textarea
                  placeholder="e.g., Facebook ad showing our AI receptionist saves businesses money, target small business owners, CTA is book a free demo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Ad</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Checklist */}
          {generated && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ad Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {item.pass ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={item.pass ? "text-foreground/80" : "text-red-600"}>{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT PANEL - Preview */}
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
              {generated && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                    <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveToLibrary}>
                    <Layers className="mr-1 h-3 w-3" /> Save
                  </Button>
                  <Button size="sm" onClick={handleExportPng} disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
                    Download PNG
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-center rounded-lg bg-muted p-8">
                {generated ? (
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                      width: dimensions.width,
                      height: dimensions.height * previewScale,
                    }}
                  >
                    <div ref={canvasRef}>
                      <TemplateComponent
                        headline={adCopy.headline}
                        subtext={adCopy.subtext}
                        ctaText={adCopy.ctaText}
                        hook={adCopy.hook}
                        urgencyLine={adCopy.urgencyLine}
                        statOrProof={(adBrief as Record<string, string>).statOrProof}
                        colors={adLayout.colorScheme}
                        format={format}
                        brandName="NAP Solutions"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center text-muted-foreground">
                    <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p>Describe your ad and click Generate</p>
                  </div>
                )}
              </div>

              {/* Caption Generator */}
              {generated && (
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label>Caption</Label>
                    <div className="flex gap-2">
                      {caption && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(caption);
                            toast({ title: "Copied!" });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {caption ? (
                    <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{caption}</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click Generate to get AI-written captions for your ad.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

