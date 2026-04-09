import { Loader2 } from "lucide-react";

/** Global loading state shown during page transitions */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-nap-navy" />
    </div>
  );
}
