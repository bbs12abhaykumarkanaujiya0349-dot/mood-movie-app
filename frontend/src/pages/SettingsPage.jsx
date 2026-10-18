import React from 'react';
import { Settings, Shield, Bell, Moon } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';

export default function SettingsPage() {
  return (
    <div className="py-12 sm:py-16 text-left">
      <Container size="md">
        <Badge variant="default" size="md" className="mb-3">
          Preferences
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mb-8">
          System Settings
        </h1>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-400" />
                <span>Cinematic Theme</span>
              </h3>
              <p className="text-xs text-slate-400">
                Default system dark theme with custom glassmorphism.
              </p>
            </div>
            <Badge variant="purple" size="sm">Active</Badge>
          </div>

          <div className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Offline Fallback Mode</span>
              </h3>
              <p className="text-xs text-slate-400">
                Automatically fallback to local movie collection when TMDb API is unavailable.
              </p>
            </div>
            <Badge variant="emerald" size="sm">Enabled</Badge>
          </div>
        </div>
      </Container>
    </div>
  );
}
