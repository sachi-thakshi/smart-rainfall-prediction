export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-surface">
      <div
        className="mx-auto flex min-h-screen w-full flex-col overflow-hidden bg-surface"
      >
        {children}
      </div>
    </div>
  );
}