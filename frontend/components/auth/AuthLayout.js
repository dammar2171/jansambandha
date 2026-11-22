import BrandPanel from "./BrandPanel";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <BrandPanel />
      <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[500px]">{children}</div>
      </main>
    </div>
  );
}