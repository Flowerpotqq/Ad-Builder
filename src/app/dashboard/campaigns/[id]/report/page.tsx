"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Eye, MousePointer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Campaign report page with stats and event log */
export default function CampaignReportPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [campaignRes, eventsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(`/api/campaigns/${campaignId}/events`),
        ]);
        const campaignData = await campaignRes.json();
        const eventsData = await eventsRes.json();

        if (campaignData.success) setCampaign(campaignData.data.campaign);
        if (eventsData.success) setEvents(eventsData.data.events);
      } catch {
        // Use empty state
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [campaignId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <div className="text-center text-muted-foreground">Campaign not found</div>;
  }

  const totalSent = (campaign.totalSent as number) || 0;
  const totalOpened = (campaign.totalOpened as number) || 0;
  const totalClicked = (campaign.totalClicked as number) || 0;
  const totalBounced = (campaign.totalBounced as number) || 0;
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/campaigns"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{campaign.name as string}</h1>
          <p className="text-muted-foreground">Campaign Report</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
            <p className="text-xs text-muted-foreground">{totalOpened} opens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate}%</div>
            <p className="text-xs text-muted-foreground">{totalClicked} clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bounces</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBounced}</div>
          </CardContent>
        </Card>
      </div>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Contact</th>
                    <th className="pb-2 font-medium">Event</th>
                    <th className="pb-2 font-medium">Details</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id as string} className="border-b last:border-0">
                      <td className="py-2">{(event.contact as Record<string, string>)?.email || "-"}</td>
                      <td className="py-2">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                          event.type === "OPENED" ? "border-[#1f6feb]/45 bg-[#1f6feb]/18 text-[#79c0ff]" :
                          event.type === "CLICKED" ? "border-[#238636]/45 bg-[#238636]/16 text-[#3fb950]" :
                          event.type === "BOUNCED" ? "border-[#da3633]/45 bg-[#da3633]/16 text-[#ff7b72]" :
                          event.type === "SENT" ? "border-border bg-secondary text-foreground/85" :
                          "border-[#9e6a03]/45 bg-[#9e6a03]/18 text-[#d29922]"
                        }`}>
                          {event.type as string}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{(event.metadata as string) || "-"}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(event.timestamp as string).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">No events recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

