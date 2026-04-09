"use client";

import { useState, useEffect } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/** Templates page — browse and manage email templates */
export default function TemplatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        if (data.success) setTemplates(data.data.templates);
      } catch {
        // Empty state
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Pre-built email templates for quick campaigns</p>
        </div>
      </div>

      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id as string} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name as string}</CardTitle>
                  {template.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{template.category as string}</Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  Created {new Date(template.createdAt as string).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium">No templates yet</h3>
          <p className="text-muted-foreground">
            Templates are created automatically when you save an email design. Generate your first email in a campaign to get started.
          </p>
        </div>
      )}
    </div>
  );
}
