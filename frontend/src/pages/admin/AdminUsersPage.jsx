import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Shield } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function AdminUsersPage() {
  const mockUsers = [
    { id: 'u1', name: 'Admin Account', email: 'admin@moodie.app', role: 'admin', date: '2026-01-10' },
    { id: 'u2', name: 'Demo Student', email: 'student@mca.edu', role: 'user', date: '2026-02-14' },
    { id: 'u3', name: 'Cinema Enthusiast', email: 'film.lover@gmail.com', role: 'user', date: '2026-03-01' }
  ];

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <Badge variant="rose" size="md" className="mb-3">
            FR-12: User Management
          </Badge>
          <h1 className="text-3xl font-extrabold text-white">Application Users</h1>
          <p className="text-sm text-slate-400 mt-1">Manage user accounts and role assignments.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#11141e]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                  <td className="px-6 py-4 text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'admin' ? 'rose' : 'default'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{u.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
