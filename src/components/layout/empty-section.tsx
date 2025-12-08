export function EmptySection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center h-[240px] bg-foreground/5 rounded-md">
      <div className="text-foreground/50 text-sm">{children}</div>
    </div>
  );
}
