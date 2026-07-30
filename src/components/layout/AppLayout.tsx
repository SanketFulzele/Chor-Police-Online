import { Outlet } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";

export function AppLayout() {
  useSocket();

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="particle-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-royal/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-royal/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl" />
      </div>
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
