import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import adminService from '../../services/adminService';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dialog state
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 8
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const handleToggleBlock = async (u) => {
    try {
      if (u.status === 'blocked') {
        await adminService.unblockUser(u.id || u._id);
        toast.success(`User ${u.name} unblocked`);
      } else {
        await adminService.blockUser(u.id || u._id);
        toast.success(`User ${u.name} blocked`);
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (u, newRole) => {
    try {
      await adminService.updateUserRole(u.id || u._id, newRole);
      toast.success(`User ${u.name}'s role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    setIsDeleting(true);
    try {
      await adminService.deleteUser(selectedUserForDelete.id || selectedUserForDelete._id);
      toast.success(`User ${selectedUserForDelete.name} deleted`);
      setSelectedUserForDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <Badge variant="rose" size="md" className="mb-2">
          FR-12: User Directory
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
          User Account Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect registered accounts, toggle authorization status, and manage administrative privileges.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#11141e] border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={Search}
          />

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#12151f] text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="All">All Roles</option>
              <option value="admin">Administrator Only</option>
              <option value="user">Standard User Only</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#12151f] text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton count={6} height="52px" className="rounded-xl" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Matched"
          description="Try clearing your search terms or adjusting the role/status filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setRoleFilter('All');
            setStatusFilter('All');
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#11141e] shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-slate-400 border-b border-slate-800 tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id || u.email === currentUser?.email;

                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSelf && <span className="text-[10px] text-amber-400 font-normal">(You)</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={u.role?.toUpperCase()}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs font-semibold rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                        title="Change user role"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={u.status === 'active' ? 'emerald' : 'danger'} size="sm" dot>
                        {u.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(u)}
                          className={u.status === 'blocked' ? 'text-emerald-400' : 'text-amber-400'}
                          title={u.status === 'blocked' ? 'Unblock user' : 'Block user'}
                        >
                          {u.status === 'blocked' ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Unblock</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Ban className="w-3.5 h-3.5" />
                              <span>Block</span>
                            </span>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUserForDelete(u)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Page {page} of {totalPages} ({total} users total)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  leftIcon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  rightIcon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedUserForDelete)}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${selectedUserForDelete?.name}" (${selectedUserForDelete?.email})? All their reviews and history will be purged.`}
        confirmText="Yes, Delete User"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteUser}
        onClose={() => setSelectedUserForDelete(null)}
      />
    </div>
  );
}
