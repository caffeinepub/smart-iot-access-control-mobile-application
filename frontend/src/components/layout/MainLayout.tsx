import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 bg-[url('/assets/generated/background-pattern.dim_1920x1080.png')] opacity-[0.02] bg-cover bg-center pointer-events-none" />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
