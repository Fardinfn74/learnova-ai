import novaImg from "@/assets/nova-mascot.png";
import { cn } from "@/lib/utils";

export function Nova({
  size = 120,
  float = true,
  glow = true,
  priority = false,
  className,
}: { size?: number; float?: boolean; glow?: boolean; priority?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "relative inline-block",
        float && "animate-float",
        glow && "animate-pulse-glow",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={novaImg}
        alt="Nova, your AI tutor mascot"
        width={size}
        height={size}
        className="select-none pointer-events-none drop-shadow-2xl"
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
