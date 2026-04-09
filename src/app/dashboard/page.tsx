"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Users, BarChart3, Plus, Upload, Palette, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalCampaigns: number;
  totalContacts: number;
  avgOpenRate: number;
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: string;
    totalSent: number;
    totalOpened: number;
  }>;
}

/** Dashboard home page with summary stats and quick actions */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch {
        // Use fallback empty state
        setStats({ totalCampaigns: 0, totalContacts: 0, avgOpenRate: 0, recentCampaigns: [] });
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const statusVariant = (status: string) => {
    const map: Record<string, "draft" | "scheduled" | "sending" | "sent" | "failed"> = {
      DRAFT: "draft",
      SCHEDULED: "scheduled",
      SENDING: "sending",
      SENT: "sent",
      FAILED: "failed",
    };
    return map[status] || "draft";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your email platform at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.avgOpenRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/campaigns">
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/contacts">
              <Upload className="mr-2 h-4 w-4" /> Import Contacts
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/brand">
              <Palette className="mr-2 h-4 w-4" /> Edit Brand Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/campaigns/${campaign.id}/edit`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {campaign.totalSent > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {campaign.totalOpened}/{campaign.totalSent} opens
                      </span>
                    )}
                    <Badge variant={statusVariant(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Mail className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p>No campaigns yet. Create your first one!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
