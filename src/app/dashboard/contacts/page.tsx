"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Upload, Users, Search, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactList {
  id: string;
  name: string;
  createdAt: string;
  _count: { contacts: number };
}

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  tags: string[];
}

/** Contacts page with list management and CSV import */
export default function ContactsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lists, setLists] = useState<ContactList[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [search, setSearch] = useState("");

  // New list modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);

  async function loadLists() {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.success) {
        setLists(data.data.lists);
        if (data.data.lists.length > 0 && !selectedList) {
          setSelectedList(data.data.lists[0].id);
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to load contact lists", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadContacts(listId: string) {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/contacts/${listId}?${params}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data.contacts);
      }
    } catch {
      // Silent fail
    }
  }

  useEffect(() => { loadLists(); }, []);
  useEffect(() => { if (selectedList) loadContacts(selectedList); }, [selectedList, search]);

  async function handleCreateList() {
    if (!newListName.trim()) return;
    setIsCreatingList(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewListModal(false);
        setNewListName("");
        loadLists();
        toast({ title: "Created!", description: "Contact list created" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create list", variant: "destructive" });
    } finally {
      setIsCreatingList(false);
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedList) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      // Simple CSV parsing (header row + data rows)
      const lines = text.split("\n").filter((l) => l.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const emailIdx = headers.findIndex((h) => h === "email");
      const firstNameIdx = headers.findIndex((h) => h.includes("first"));
      const lastNameIdx = headers.findIndex((h) => h.includes("last"));

      if (emailIdx === -1) {
        toast({ title: "Invalid CSV", description: "CSV must have an 'email' column", variant: "destructive" });
        return;
      }

      const contacts = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          email: cols[emailIdx],
          firstName: firstNameIdx >= 0 ? cols[firstNameIdx] : undefined,
          lastName: lastNameIdx >= 0 ? cols[lastNameIdx] : undefined,
        };
      }).filter((c) => c.email && c.email.includes("@"));

      const res = await fetch(`/api/contacts/${selectedList}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Import complete!",
          description: `Imported ${data.data.imported} contacts (${data.data.skipped} skipped)`,
        });
        loadLists();
        loadContacts(selectedList);
      }
    } catch {
      toast({ title: "Error", description: "Failed to import CSV", variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteList(listId: string) {
    if (!confirm("Delete this list and all its contacts?")) return;
    try {
      await fetch(`/api/contacts/${listId}`, { method: "DELETE" });
      if (selectedList === listId) setSelectedList(null);
      loadLists();
      toast({ title: "Deleted", description: "Contact list removed" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your contact lists and subscribers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewListModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> New List
          </Button>
          <Button disabled={!selectedList || isImporting} onClick={() => fileInputRef.current?.click()}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Lists sidebar */}
        <div className="space-y-2">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Contact Lists</h3>
          {lists.length > 0 ? (
            lists.map((list) => (
              <div
                key={list.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedList === list.id ? "border-primary bg-primary/5" : "hover:bg-secondary/60"
                }`}
                onClick={() => setSelectedList(list.id)}
              >
                <div>
                  <p className="font-medium text-sm">{list.name}</p>
                  <p className="text-xs text-muted-foreground">{list._count.contacts} contacts</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No lists yet</p>
          )}
        </div>

        {/* Contacts table */}
        <div className="lg:col-span-3">
          {selectedList ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Contacts</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contacts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Email</th>
                          <th className="pb-2 font-medium">First Name</th>
                          <th className="pb-2 font-medium">Last Name</th>
                          <th className="pb-2 font-medium">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="border-b last:border-0">
                            <td className="py-2">{contact.email}</td>
                            <td className="py-2">{contact.firstName || "-"}</td>
                            <td className="py-2">{contact.lastName || "-"}</td>
                            <td className="py-2">
                              {contact.tags.length > 0 ? contact.tags.join(", ") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p>No contacts in this list. Import a CSV to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Select a contact list or create a new one
            </div>
          )}
        </div>
      </div>

      {/* New List Modal */}
      <Dialog open={showNewListModal} onOpenChange={setShowNewListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contact List</DialogTitle>
            <DialogDescription>Name your new contact list</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>List Name</Label>
            <Input
              placeholder="e.g., Newsletter Subscribers"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListModal(false)}>Cancel</Button>
            <Button onClick={handleCreateList} disabled={isCreatingList || !newListName.trim()}>
              {isCreatingList ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

