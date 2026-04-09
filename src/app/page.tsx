import Link from "next/link";
import { Sparkles, ArrowRight, Mail, Palette, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Landing page - redirects authenticated users to dashboard */
export default function HomePage() {
  return (
    <div className="nap-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 lg:px-8">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-nap-blue to-nap-cyan">
              <Sparkles className="h-5 w-5 text-nap-navy" />
            </div>
            <div className="text-brand-ink">
              <p className="text-base font-semibold tracking-tight">NAP Email Platform</p>
              <p className="text-xs text-muted-foreground">Built by NAP Solutions</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/campaigns">View Campaigns</Link>
          </Button>
        </header>

        <section className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-brand-ink md:text-5xl text-balance">
              Design, write, and send on-brand campaigns from one focused workspace.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              AI-assisted copy generation, brand controls, and delivery tracking in a single NAP-styled platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard/brand">Edit Brand Settings</Link>
              </Button>
            </div>
          </div>

          <Card className="nap-panel">
            <CardContent className="p-5">
              <p className="mb-4 text-sm font-semibold text-brand-ink">Core capabilities</p>
              <div className="space-y-3">
                {[
                  { icon: Sparkles, title: "AI Generation", desc: "Claude-assisted briefs and email drafts." },
                  { icon: Palette, title: "Brand Consistency", desc: "Reusable palette, typography, and voice controls." },
                  { icon: Mail, title: "One-Click Send", desc: "Campaign delivery with list and sender config." },
                  { icon: BarChart3, title: "Performance Reporting", desc: "Open, click, and bounce visibility." },
                ].map((feature) => (
                  <div key={feature.title} className="rounded-md border border-border bg-secondary/35 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <feature.icon className="h-4 w-4 text-brand-ink" />
                      <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
