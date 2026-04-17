import logo from "@/assets/staffarc-logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function BrandLogo({ size = 32, withWordmark = true, className }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={logo}
        alt="StaffArc logo"
        width={size}
        height={size}
        className="object-contain drop-shadow-[0_2px_8px_hsl(var(--primary)/0.4)]"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="text-lg font-semibold tracking-tight">
          Staff<span className="text-gradient-brand">Arc</span>
        </span>
      )}
    </div>
  );
}
