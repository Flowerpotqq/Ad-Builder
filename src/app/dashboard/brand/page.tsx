"use client";

import { useState, useEffect } from "react";
import { Palette, Loader2, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

/** Brand Settings page with live preview */
export default function BrandSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [primaryColor, setPrimaryColor] = useState("#0e0e2c");
  const [secondaryColor, setSecondaryColor] = useState("#1a1a4e");
  const [accentColor, setAccentColor] = useState("#b8dff0");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#333333");
  const [fontFamily, setFontFamily] = useState("Arial, Helvetica, sans-serif");
  const [fontSizeBase, setFontSizeBase] = useState(16);
  const [logoUrl, setLogoUrl] = useState("");
  const [siteUrl, setSiteUrl] = useState("https://getnapsolutions.com");
  const [brandVoice, setBrandVoice] = useState("SALES_FOCUSED");
  const [ctaStyle, setCtaStyle] = useState("Dark navy background, white bold text, 8px border radius");
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/brand");
        const data = await res.json();
        if (data.success && data.data.brandProfile) {
          const p = data.data.brandProfile;
          setPrimaryColor(p.primaryColor);
          setSecondaryColor(p.secondaryColor);
          setAccentColor(p.accentColor);
          setBackgroundColor(p.backgroundColor);
          setTextColor(p.textColor);
          setFontFamily(p.fontFamily);
          setFontSizeBase(p.fontSizeBase);
          setLogoUrl(p.logoUrl || "");
          setSiteUrl(p.siteUrl);
          setBrandVoice(p.brandVoice);
          setCtaStyle(p.ctaStyle);
          setCustomNotes(p.customNotes || "");
        }
      } catch {
        toast({ title: "Error", description: "Failed to load brand profile", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [toast]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor, secondaryColor, accentColor, backgroundColor, textColor,
          fontFamily, fontSizeBase, logoUrl: logoUrl || null, siteUrl,
          brandVoice, ctaStyle, customNotes: customNotes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Saved!", description: "Brand profile updated successfully" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save brand profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  /** Generate a mini email mockup for live preview */
  function renderPreview() {
    return `
      <div style="max-width: 400px; font-family: ${fontFamily}; background: ${backgroundColor}; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
        <div style="background: ${primaryColor}; padding: 20px; text-align: center;">
          <p style="color: ${accentColor}; font-size: 18px; font-weight: bold; margin: 0;">Your Brand</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: ${primaryColor}; font-size: ${fontSizeBase + 4}px; margin: 0 0 12px;">Sample Headline</h2>
          <p style="color: ${textColor}; font-size: ${fontSizeBase}px; line-height: 1.6; margin: 0 0 20px;">
            This is a preview of how your brand colors and typography will appear in generated emails.
          </p>
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: ${primaryColor}; border-radius: 8px; padding: 12px 24px;">
                <span style="color: #ffffff; font-weight: bold; font-size: 14px;">Call to Action</span>
              </td>
            </tr>
          </table>
        </div>
        <div style="background: ${primaryColor}; padding: 16px; text-align: center;">
          <p style="color: ${accentColor}; font-size: 12px; margin: 0;">${siteUrl}</p>
        </div>
      </div>
    `;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Settings</h1>
          <p className="text-muted-foreground">Configure your brand identity for AI-generated emails</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colors</CardTitle>
              <CardDescription>Define your brand color palette</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                { label: "Primary", value: primaryColor, setter: setPrimaryColor },
                { label: "Secondary", value: secondaryColor, setter: setSecondaryColor },
                { label: "Accent", value: accentColor, setter: setAccentColor },
                { label: "Background", value: backgroundColor, setter: setBackgroundColor },
                { label: "Text", value: textColor, setter: setTextColor },
              ].map((color) => (
                <div key={color.label} className="space-y-1">
                  <Label>{color.label}</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) => color.setter(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border"
                    />
                    <Input
                      value={color.value}
                      onChange={(e) => color.setter(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typography & Voice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial, Helvetica, sans-serif">Arial</SelectItem>
                    <SelectItem value="Georgia, Times New Roman, serif">Georgia</SelectItem>
                    <SelectItem value="Verdana, Geneva, sans-serif">Verdana</SelectItem>
                    <SelectItem value="Trebuchet MS, sans-serif">Trebuchet MS</SelectItem>
                    <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Font Size: {fontSizeBase}px</Label>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={fontSizeBase}
                  onChange={(e) => setFontSizeBase(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Brand Voice</Label>
                <Select value={brandVoice} onValueChange={setBrandVoice}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="CASUAL">Casual</SelectItem>
                    <SelectItem value="SALES_FOCUSED">Sales-focused</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brand Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Logo URL</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
              <div>
                <Label>Website URL</Label>
                <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
              </div>
              <div>
                <Label>CTA Button Style</Label>
                <Input value={ctaStyle} onChange={(e) => setCtaStyle(e.target.value)} />
              </div>
              <div>
                <Label>Custom Notes</Label>
                <Textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Any additional brand guidelines..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
              <CardDescription>See how your brand looks in an email</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="flex justify-center rounded-lg bg-gray-50 p-6"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
