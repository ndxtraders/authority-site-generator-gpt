import type { ReactNode } from "react";

import type { ConversionConfig } from "@/types/site";

/**
 * `tel:` link built from `conversion.trackingPhone` (E.164), displaying
 * `conversion.displayPhone` unless a custom child is given. Kept separate from
 * `Button` so styling composes via `buttonVariants()` — a real `<a href>` must
 * stay a link, not gain `role="button"` from the Button primitive.
 */
export interface CallLinkProps {
  conversion: ConversionConfig;
  className?: string;
  children?: ReactNode;
}

export default function CallLink({ conversion, className, children }: CallLinkProps) {
  return (
    <a href={`tel:${conversion.trackingPhone}`} className={className}>
      {children ?? conversion.displayPhone}
    </a>
  );
}
