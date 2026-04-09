"use client";

import React from "react";

/** Shared props for all ad templates */
export interface AdTemplateProps {
  headline: string;
  subtext: string;
  ctaText: string;
  hook?: string;
  urgencyLine?: string;
  statOrProof?: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    cta: string;
  };
  format: string; // square | story | vertical | spark
  logoUrl?: string;
  brandName?: string;
}

/** Get dimensions based on format */
function getDimensions(format: string) {
  switch (format) {
    case "story":
    case "vertical":
      return { width: 1080, height: 1920 };
    case "spark":
      return { width: 1080, height: 600 };
    default:
      return { width: 1080, height: 1080 }; // square, carousel
  }
}

/** Stat Card — large number/metric + context + CTA */
export function StatCard({ headline, subtext, ctaText, statOrProof, colors, format, brandName }: AdTemplateProps) {
  const { width, height } = getDimensions(format);
  return (
    <div style={{ width, height, background: colors.background, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px", fontFamily: "Arial, sans-serif", position: "relative" }}>
      {brandName && (
        <div style={{ position: "absolute", top: 40, left: 40, color: colors.accent, fontSize: 24, fontWeight: "bold" }}>{brandName}</div>
      )}
      <div style={{ color: colors.accent, fontSize: 120, fontWeight: "bold", lineHeight: 1 }}>
        {statOrProof || "24/7"}
      </div>
      <h1 style={{ color: colors.text, fontSize: 56, fontWeight: "bold", textAlign: "center", margin: "24px 0 16px", lineHeight: 1.2 }}>
        {headline}
      </h1>
      <p style={{ color: colors.text, fontSize: 28, textAlign: "center", opacity: 0.8, marginBottom: 48 }}>
        {subtext}
      </p>
      <div style={{ background: colors.cta, padding: "20px 48px", borderRadius: 12, color: colors.background, fontSize: 24, fontWeight: "bold" }}>
        {ctaText}
      </div>
    </div>
  );
}

/** Service Card — icon concept + title + description + CTA */
export function ServiceCard({ headline, subtext, ctaText, colors, format, brandName }: AdTemplateProps) {
  const { width, height } = getDimensions(format);
  return (
    <div style={{ width, height, background: colors.background, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px", fontFamily: "Arial, sans-serif", position: "relative" }}>
      {brandName && (
        <div style={{ position: "absolute", top: 40, left: 40, color: colors.accent, fontSize: 24, fontWeight: "bold" }}>{brandName}</div>
      )}
      <div style={{ width: 120, height: 120, borderRadius: "50%", background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
        <span style={{ fontSize: 60, color: colors.background }}>★</span>
      </div>
      <h1 style={{ color: colors.text, fontSize: 52, fontWeight: "bold", textAlign: "center", marginBottom: 16, lineHeight: 1.2 }}>
        {headline}
      </h1>
      <p style={{ color: colors.text, fontSize: 26, textAlign: "center", opacity: 0.8, marginBottom: 48, maxWidth: 800 }}>
        {subtext}
      </p>
      <div style={{ background: colors.cta, padding: "20px 48px", borderRadius: 12, color: colors.background, fontSize: 24, fontWeight: "bold" }}>
        {ctaText}
      </div>
    </div>
  );
}

/** Testimonial Card — quote + attribution + brand footer */
export function TestimonialCard({ headline, subtext, ctaText, colors, format, brandName }: AdTemplateProps) {
  const { width, height } = getDimensions(format);
  return (
    <div style={{ width, height, background: colors.background, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "80px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ color: colors.accent, fontSize: 80, lineHeight: 1 }}>&ldquo;</div>
      <div>
        <p style={{ color: colors.text, fontSize: 44, fontStyle: "italic", lineHeight: 1.4, marginBottom: 32 }}>
          {headline}
        </p>
        <p style={{ color: colors.text, fontSize: 24, opacity: 0.7 }}>— {subtext}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: colors.accent, fontSize: 24, fontWeight: "bold" }}>{brandName}</span>
        <div style={{ background: colors.cta, padding: "16px 36px", borderRadius: 12, color: colors.background, fontSize: 22, fontWeight: "bold" }}>
          {ctaText}
        </div>
      </div>
    </div>
  );
}

/** Promo Card — offer + savings + urgency + CTA */
export function PromoCard({ headline, subtext, ctaText, urgencyLine, colors, format, brandName }: AdTemplateProps) {
  const { width, height } = getDimensions(format);
  return (
    <div style={{ width, height, background: `linear-gradient(135deg, ${colors.background}, ${colors.accent}20)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px", fontFamily: "Arial, sans-serif", position: "relative" }}>
      {brandName && (
        <div style={{ position: "absolute", top: 40, left: 40, color: colors.accent, fontSize: 24, fontWeight: "bold" }}>{brandName}</div>
      )}
      <h1 style={{ color: colors.text, fontSize: 64, fontWeight: "bold", textAlign: "center", lineHeight: 1.1, marginBottom: 20 }}>
        {headline}
      </h1>
      <p style={{ color: colors.text, fontSize: 28, textAlign: "center", opacity: 0.8, marginBottom: 40 }}>
        {subtext}
      </p>
      <div style={{ background: colors.cta, padding: "22px 56px", borderRadius: 12, color: colors.background, fontSize: 26, fontWeight: "bold", marginBottom: 24 }}>
        {ctaText}
      </div>
      {urgencyLine && (
        <p style={{ color: colors.accent, fontSize: 22, fontWeight: "bold" }}>{urgencyLine}</p>
      )}
    </div>
  );
}

/** Problem/Solution Card — two-column split */
export function ProblemSolution({ headline, subtext, ctaText, colors, format, brandName }: AdTemplateProps) {
  const { width, height } = getDimensions(format);
  const isVertical = format === "story" || format === "vertical";
  return (
    <div style={{ width, height, display: "flex", flexDirection: isVertical ? "column" : "row", fontFamily: "Arial, sans-serif", position: "relative" }}>
      {/* Problem side */}
      <div style={{ flex: 1, background: "#f0f0f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px" }}>
        <p style={{ color: "#999", fontSize: 20, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Before</p>
        <p style={{ color: "#666", fontSize: 32, textAlign: "center", lineHeight: 1.4 }}>{headline}</p>
      </div>
      {/* Solution side */}
      <div style={{ flex: 1, background: colors.background, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px" }}>
        <p style={{ color: colors.accent, fontSize: 20, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>After</p>
        <p style={{ color: colors.text, fontSize: 32, textAlign: "center", lineHeight: 1.4, marginBottom: 32 }}>{subtext}</p>
        <div style={{ background: colors.cta, padding: "16px 36px", borderRadius: 12, color: colors.background, fontSize: 22, fontWeight: "bold" }}>
          {ctaText}
        </div>
      </div>
      {brandName && (
        <div style={{ position: "absolute", top: 20, right: 20, color: colors.accent, fontSize: 18, fontWeight: "bold" }}>{brandName}</div>
      )}
    </div>
  );
}

/** Before/After Card — split screen comparison */
export function BeforeAfter({ headline, subtext, ctaText, colors, format, brandName }: AdTemplateProps) {
  const { width, height } = getDimensions(format);
  return (
    <div style={{ width, height, background: colors.background, display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "40px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: colors.accent, fontSize: 24, fontWeight: "bold" }}>{brandName}</span>
      </div>
      {/* Split content */}
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1, background: "#333", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#ff6b6b", fontSize: 18, textTransform: "uppercase", marginBottom: 8 }}>Without Us</p>
            <p style={{ color: "#fff", fontSize: 28 }}>{headline}</p>
          </div>
        </div>
        <div style={{ flex: 1, background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: colors.background, fontSize: 18, textTransform: "uppercase", marginBottom: 8 }}>With Us</p>
            <p style={{ color: colors.background, fontSize: 28 }}>{subtext}</p>
          </div>
        </div>
      </div>
      {/* CTA */}
      <div style={{ padding: "40px 60px", display: "flex", justifyContent: "center" }}>
        <div style={{ background: colors.cta, padding: "18px 44px", borderRadius: 12, color: colors.background, fontSize: 22, fontWeight: "bold" }}>
          {ctaText}
        </div>
      </div>
    </div>
  );
}

/** Template component map for dynamic rendering */
export const adTemplateMap: Record<string, React.ComponentType<AdTemplateProps>> = {
  StatCard,
  ServiceCard,
  TestimonialCard,
  PromoCard,
  ProblemSolution,
  BeforeAfter,
};
