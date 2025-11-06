'use client';

import { useState, useEffect } from 'react';

interface TeamMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'BASIC';
  isActive: boolean;
  createdAt: string;
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  maxMembers: number;
  isActive: boolean;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // TODO: Replace with actual user ID from auth
  const currentUserId = 1;

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/dashboard/teams?userId=${currentUserId}`);
      const data = await response.json();
      setTeams(data.teams || []);
      if (data.teams && data.teams.length > 0) {
        setSelectedTeam(data.teams[0]);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/dashboard/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          maxMembers: parseInt(formData.get('maxMembers') as string) || 5,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const addMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/dashboard/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          role: formData.get('role') || 'BASIC',
          requesterId: currentUserId,
        }),
      });

      if (response.ok) {
        setShowAddMemberModal(false);
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const updateMemberRole = async (memberId: number, newRole: string) => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(
        `/api/dashboard/teams/${selectedTeam.id}/members/${memberId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: newRole,
            requesterId: currentUserId,
          }),
        }
      );

      if (response.ok) {
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!selectedTeam) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `/api/dashboard/teams/${selectedTeam.id}/members/${memberId}?requesterId=${currentUserId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'DEVELOPER':
        return 'bg-green-100 text-green-800';
      case 'BASIC':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No teams yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Team List Sidebar */}
          <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Teams</h2>
            <div className="space-y-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedTeam?.id === team.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{team.name}</div>
                  <div className="text-sm text-gray-500">
                    {team.members.length}/{team.maxMembers} members
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Team Details */}
          <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
            {selectedTeam && (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                      {selectedTeam.description && (
                        <p className="text-gray-600 mt-1">{selectedTeam.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        selectedTeam.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedTeam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedTeam.members.length}/{selectedTeam.maxMembers} members
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    + Add Member
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {member.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{member.userName}</div>
                          <div className="text-sm text-gray-500">{member.userEmail}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.role === 'OWNER' ? (
                          <span className={`px-3 py-1 rounded text-sm ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                        ) : (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.id, e.target.value)}
                              className={`px-3 py-1 rounded text-sm border ${getRoleBadgeColor(member.role)}`}
                            >
                              <option value="BASIC">BASIC</option>
                              <option value="DEVELOPER">DEVELOPER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Team</h2>
            <form onSubmit={createTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Engineering Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Members</label>
                <input
                  type="number"
                  name="maxMembers"
                  min="5"
                  max="10000"
                  defaultValue="5"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={addMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="member@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" className="w-full px-3 py-2 border rounded">
                  <option value="BASIC">Basic</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
