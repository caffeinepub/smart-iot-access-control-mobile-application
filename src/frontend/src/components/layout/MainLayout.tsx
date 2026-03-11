import { Outlet } from "@tanstack/react-router";
import DynamicBackground from "./DynamicBackground";
import Footer from "./Footer";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <DynamicBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
