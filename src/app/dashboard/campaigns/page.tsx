"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Copy, Trash2, Edit, BarChart3, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

/** Campaign list page with creation, search, filter, and pagination */
export default function CampaignsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New campaign modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("PROMOTIONAL");
  const [isCreating, setIsCreating] = useState(false);

  async function loadCampaigns() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/campaigns?${params}`);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data.campaigns);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load campaigns", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [page, statusFilter]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: newType }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewModal(false);
        setNewName("");
        router.push(`/dashboard/campaigns/${data.data.campaign.id}/edit`);
      }
    } catch {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/campaigns/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Duplicated!", description: "Campaign duplicated as draft" });
        loadCampaigns();
      }
    } catch {
      toast({ title: "Error", description: "Failed to duplicate", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: "Campaign removed" });
      loadCampaigns();
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  }

  const statusVariant = (status: string) => {
    const map: Record<string, "draft" | "scheduled" | "sending" | "sent" | "failed"> = {
      DRAFT: "draft", SCHEDULED: "scheduled", SENDING: "sending", SENT: "sent", FAILED: "failed",
    };
    return map[status] || "draft";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your email campaigns</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadCampaigns()}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <Card key={campaign.id as string} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{campaign.name as string}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(campaign.createdAt as string).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant(campaign.status as string)}>
                    {campaign.status as string}
                  </Badge>
                </div>

                {(campaign.totalSent as number) > 0 && (
                  <div className="mb-3 flex gap-4 text-sm text-muted-foreground">
                    <span>Sent: {campaign.totalSent as number}</span>
                    <span>Opens: {campaign.totalOpened as number}</span>
                    <span>Clicks: {campaign.totalClicked as number}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(campaign.id as string)}>
                    <Copy className="mr-1 h-3 w-3" /> Duplicate
                  </Button>
                  {(campaign.status as string) === "SENT" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/campaigns/${campaign.id}/report`}>
                        <BarChart3 className="mr-1 h-3 w-3" /> Report
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(campaign.id as string)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium">No campaigns yet</h3>
          <p className="mb-4 text-muted-foreground">Create your first AI-powered email campaign</p>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* New Campaign Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>Give your campaign a name and choose a type</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g., Spring Promotion 2026"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                  <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
