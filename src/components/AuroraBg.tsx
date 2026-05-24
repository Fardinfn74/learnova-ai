export function AuroraBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-aurora-1 opacity-30 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full bg-aurora-2 opacity-25 blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />
      <div className="absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-aurora-3 opacity-25 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />
    </div>
  );
}
