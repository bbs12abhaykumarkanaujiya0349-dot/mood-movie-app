import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/navbar/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0b10] text-slate-100 selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar />
      <main className="flex-1 flex flex-col pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
