"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Clock,
  Loader2,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

/** Send configuration page — subject, list selection, schedule, send */
export default function SendCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [contactLists, setContactLists] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSuggestingSubjects, setIsSuggestingSubjects] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);

  // Form state
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [fromName, setFromName] = useState("NAP Solutions");
  const [fromEmail, setFromEmail] = useState("");
  const [contactListId, setContactListId] = useState("");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [subjectSuggestions, setSubjectSuggestions] = useState<Array<{ subject: string; reasoning: string }>>([]);

  useEffect(() => {
    async function load() {
      try {
        const [campaignRes, listsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch("/api/contacts"),
        ]);

        const campaignData = await campaignRes.json();
        const listsData = await listsRes.json();

        if (campaignData.success) {
          const c = campaignData.data.campaign;
          setCampaign(c);
          setSubject(c.subject || "");
          setPreviewText(c.previewText || "");
          setFromName(c.fromName || "NAP Solutions");
          setFromEmail(c.fromEmail || "");
          if (c.contactListId) setContactListId(c.contactListId);
        }

        if (listsData.success) {
          setContactLists(listsData.data.lists);
        }
      } catch {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [campaignId, toast]);

  async function handleSuggestSubjects() {
    if (!campaign?.htmlContent) return;
    setIsSuggestingSubjects(true);
    try {
      const res = await fetch("/api/ai/suggest-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: campaign.htmlContent }),
      });
      const data = await res.json();
      if (data.success && data.data.suggestions) {
        setSubjectSuggestions(data.data.suggestions);
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate suggestions", variant: "destructive" });
    } finally {
      setIsSuggestingSubjects(false);
    }
  }

  async function handleSend() {
    if (!subject || !contactListId) {
      toast({ title: "Missing fields", description: "Subject and contact list are required", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      // Save settings first
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          previewText,
          fromName,
          fromEmail,
          contactListId,
          status: sendMode === "schedule" ? "SCHEDULED" : undefined,
          scheduledAt: sendMode === "schedule" ? `${scheduledDate}T${scheduledTime}` : null,
        }),
      });

      if (sendMode === "now") {
        const res = await fetch(`/api/campaigns/${campaignId}/send`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setSendComplete(true);
          toast({
            title: "Sent!",
            description: `${data.data.sent} emails sent successfully`,
          });
        } else {
          toast({ title: "Send failed", description: data.error, variant: "destructive" });
        }
      } else {
        toast({ title: "Scheduled!", description: "Campaign will send at the scheduled time" });
        router.push("/dashboard/campaigns");
      }
    } catch {
      toast({ title: "Error", description: "Failed to send campaign", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  }

  if (sendComplete) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-bold">Campaign Sent!</h2>
          <p className="mb-6 text-muted-foreground">Your emails are on their way.</p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href={`/dashboard/campaigns/${campaignId}/report`}>View Report</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/campaigns">Back to Campaigns</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/campaigns/${campaignId}/edit`}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Editor
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Send Campaign</h1>
          <p className="text-muted-foreground">Configure and send your email</p>
        </div>
      </div>

      {/* Subject Line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject Line</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Subject</Label>
            <div className="flex gap-2">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter your subject line"
              />
              <Button
                variant="outline"
                onClick={handleSuggestSubjects}
                disabled={isSuggestingSubjects || !campaign?.htmlContent}
              >
                {isSuggestingSubjects ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {subjectSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">AI Suggestions (click to use):</Label>
              {subjectSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full rounded-md border p-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => setSubject(s.subject)}
                >
                  <p className="font-medium">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">{s.reasoning}</p>
                </button>
              ))}
            </div>
          )}

          <div>
            <Label>Preview Text</Label>
            <Input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Shown in inbox preview (optional)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sender Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sender</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>From Name</Label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
          </div>
          <div>
            <Label>From Email</Label>
            <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="verified@yourdomain.com" />
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Contact List</Label>
          <Select value={contactListId} onValueChange={setContactListId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a contact list" />
            </SelectTrigger>
            <SelectContent>
              {contactLists.map((list) => (
                <SelectItem key={list.id as string} value={list.id as string}>
                  {list.name as string} ({(list._count as Record<string, number>)?.contacts || 0} contacts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Send / Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={sendMode === "now" ? "default" : "outline"}
              onClick={() => setSendMode("now")}
            >
              <Send className="mr-2 h-4 w-4" /> Send Now
            </Button>
            <Button
              variant={sendMode === "schedule" ? "default" : "outline"}
              onClick={() => setSendMode("schedule")}
            >
              <Clock className="mr-2 h-4 w-4" /> Schedule
            </Button>
          </div>

          {sendMode === "schedule" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={isSending || !subject || !contactListId}
          >
            {isSending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : sendMode === "now" ? (
              <><Send className="mr-2 h-4 w-4" /> Send Campaign</>
            ) : (
              <><Clock className="mr-2 h-4 w-4" /> Schedule Campaign</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
