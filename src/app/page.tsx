import Link from "next/link";
import { Sparkles, ArrowRight, Mail, Palette, BarChart3, Zap } from "lucide-react";

/** Landing page — redirects authenticated users to dashboard */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nap-navy via-nap-navy-light to-nap-navy">
      {/* Hero */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <Sparkles className="h-8 w-8 text-nap-blue" />
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
          NAP Email Platform
        </h1>
        <p className="mb-8 max-w-lg text-lg text-nap-blue">
          Design, write, and send beautiful emails with AI.
          Claude-powered generation, brand-consistent styling,
          one-click sending.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-nap-navy transition-colors hover:bg-nap-blue"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            View Campaigns
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid max-w-4xl gap-6 md:grid-cols-4">
          {[
            { icon: Sparkles, title: "AI Generation", desc: "Claude writes your emails" },
            { icon: Palette, title: "Brand Consistent", desc: "Automatic brand styling" },
            { icon: Mail, title: "One-Click Send", desc: "Resend API integration" },
            { icon: BarChart3, title: "Full Analytics", desc: "Opens, clicks, bounces" },
          ].map((feature) => (
            <div key={feature.title} className="rounded-lg bg-white/5 p-4 text-left">
              <feature.icon className="mb-2 h-5 w-5 text-nap-blue" />
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-white/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
