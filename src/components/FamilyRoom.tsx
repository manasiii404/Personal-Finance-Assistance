import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, UserPlus, Shield, Eye, Edit3, Trash2, LogOut, X, ChevronRight, Home } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import apiService from '../services/api';
import { useAlerts } from '../contexts/AlertContext';
import { FamilyDataDashboard } from './FamilyDataDashboard';

interface FamilyMember {
    id: string;
    userId: string;
    role: 'CREATOR' | 'MEMBER';
    permissions: 'VIEW_ONLY' | 'VIEW_EDIT';
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface Family {
    id: string;
    name: string;
    roomCode: string;
    creatorId: string;
    creator: {
        id: string;
        name: string;
        email: string;
    };
    members: FamilyMember[];
}

export const FamilyRoom: React.FC = () => {
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [myJoinRequests, setMyJoinRequests] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [joinPermission, setJoinPermission] = useState<'VIEW_ONLY' | 'VIEW_EDIT'>('VIEW_ONLY');
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<'VIEW_ONLY' | 'VIEW_EDIT'>('VIEW_ONLY');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const { socket, isConnected, joinFamilyRoom } = useSocket();
    const { addAlert } = useAlerts();

    useEffect(() => {
        loadAllFamilies();
        loadPendingRequests();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('family:join-request', () => {
            addAlert({ type: 'info', title: 'New Join Request', message: 'A new member wants to join your family!' });
            loadPendingRequests();
        });

        socket.on('family:request-accepted', () => {
            addAlert({ type: 'success', title: 'Request Accepted', message: 'You have been accepted to the family!' });
            loadAllFamilies();
        });

        socket.on('family:request-rejected', () => {
            addAlert({ type: 'error', title: 'Request Rejected', message: 'Your join request was rejected' });
        });

        socket.on('family:member-joined', (data: any) => {
            addAlert({ type: 'success', title: 'New Member', message: `${data.member.user.name} joined the family` });
            loadAllFamilies();
        });

        socket.on('family:member-left', (data: any) => {
            addAlert({ type: 'info', title: 'Member Left', message: `${data.userName} left the family` });
            loadAllFamilies();
        });

        socket.on('family:permission-changed', (data: any) => {
            addAlert({ type: 'info', title: 'Permissions Updated', message: `Your permissions: ${data.permissions}` });
            loadAllFamilies();
        });

        socket.on('family:member-updated', () => {
            loadAllFamilies();
        });

        socket.on('family:removed', (data: any) => {
            addAlert({ type: 'error', title: 'Removed', message: `You were removed from ${data.familyName}` });
            setSelectedFamily(null);
            loadAllFamilies();
        });

        socket.on('family:deleted', (data: any) => {
            addAlert({ type: 'error', title: 'Family Deleted', message: `"${data.familyName}" has been deleted` });
            setSelectedFamily(null);
            loadAllFamilies();
        });

        return () => {
            socket.off('family:join-request');
            socket.off('family:request-accepted');
            socket.off('family:request-rejected');
            socket.off('family:member-joined');
            socket.off('family:member-left');
            socket.off('family:permission-changed');
            socket.off('family:member-updated');
            socket.off('family:removed');
            socket.off('family:deleted');
        };
    }, [socket, isConnected, addAlert]);

    useEffect(() => {
        if (selectedFamily && isConnected) {
            joinFamilyRoom(selectedFamily.id);
        }
    }, [selectedFamily, isConnected, joinFamilyRoom]);

    useEffect(() => {
        loadAllFamilies();
        loadPendingRequests();
        loadMyJoinRequests();
    }, []);

    const loadAllFamilies = async () => {
        try {
            const response = await apiService.getMyFamily();
            if (response.data && response.data.family) {
                // For now, we only support one family, but structure supports multiple
                setFamilies([response.data.family]);
            } else {
                setFamilies([]);
            }
        } catch (error: any) {
            console.error('Error loading families:', error);
        }
    };

    const loadPendingRequests = async () => {
        try {
            const response = await apiService.getPendingRequests();
            setPendingRequests(response.data || []);
        } catch (error: any) {
            console.error('Error loading pending requests:', error);
        }
    };

    const loadMyJoinRequests = async () => {
        try {
            const response = await apiService.getMyJoinRequests();
            setMyJoinRequests(response.data || []);
        } catch (error: any) {
            console.error('Error loading my join requests:', error);
        }
    };

    const handleCreateFamily = async () => {
        if (!familyName.trim()) {
            addAlert({ type: 'error', title: 'Error', message: 'Please enter a family name' });
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.createFamily(familyName);
            setFamilies([...families, response.data]);
            setSelectedFamily(response.data);
            setShowCreateModal(false);
            setFamilyName('');
            addAlert({ type: 'success', title: 'Success', message: 'Family room created successfully!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to create family' });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinFamily = async () => {
        if (!roomCode.trim()) {
            addAlert({ type: 'error', title: 'Error', message: 'Please enter a room code' });
            return;
        }

        setLoading(true);
        try {
            await apiService.joinFamily(roomCode.toUpperCase(), joinPermission);
            setShowJoinModal(false);
            setRoomCode('');
            setJoinPermission('VIEW_ONLY'); // Reset to default
            loadMyJoinRequests(); // Refresh join requests
            addAlert({ type: 'success', title: 'Request Sent', message: 'Waiting for approval...' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to join family' });
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        setLoading(true);
        try {
            await apiService.acceptRequest(requestId);
            loadPendingRequests();
            loadAllFamilies();
            addAlert({ type: 'success', title: 'Accepted', message: 'Member added to family!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to accept request' });
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        setLoading(true);
        try {
            await apiService.rejectRequest(requestId);
            loadPendingRequests();
            addAlert({ type: 'info', title: 'Rejected', message: 'Request rejected' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to reject request' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePermissions = async (memberId: string, permissions: 'VIEW_ONLY' | 'VIEW_EDIT') => {
        setLoading(true);
        try {
            await apiService.updateMemberPermissions(memberId, permissions);
            loadAllFamilies();
            addAlert({ type: 'success', title: 'Updated', message: 'Permissions updated!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to update permissions' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        setLoading(true);
        try {
            await apiService.removeMember(memberId);
            loadAllFamilies();
            addAlert({ type: 'success', title: 'Removed', message: 'Member removed' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to remove member' });
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveFamily = async () => {
        if (!confirm('Are you sure you want to leave this family?')) return;

        setLoading(true);
        try {
            await apiService.leaveFamily();
            setSelectedFamily(null);
            loadAllFamilies();
            addAlert({ type: 'success', title: 'Left Family', message: 'You left the family' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to leave family' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFamily = async (familyId: string) => {
        if (!confirm('Are you sure you want to delete this family? This action cannot be undone.')) return;

        setLoading(true);
        try {
            await apiService.deleteFamily(familyId);
            setSelectedFamily(null);
            loadAllFamilies();
            addAlert({ type: 'success', title: 'Deleted', message: 'Family deleted successfully' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to delete family' });
        } finally {
            setLoading(false);
        }
    };

    const copyRoomCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        addAlert({ type: 'success', title: 'Copied', message: 'Room code copied to clipboard!' });
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const isCreator = (family: Family) => {
        return family.members.some(m => m.status === 'ACCEPTED' && m.role === 'CREATOR');
    };

    const getUserPermissions = (family: Family): 'VIEW_ONLY' | 'VIEW_EDIT' => {
        const currentUser = family.members.find(m => m.status === 'ACCEPTED');
        return currentUser?.permissions || 'VIEW_ONLY';
    };

    // Main view - show all families
    if (!selectedFamily) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Family Rooms
                        </h1>
                        <p className="text-gray-600">Create or join family rooms to collaborate on finances</p>
                    </div>

                    {/* Create/Join Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="group relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">Create Family Room</h2>
                                <p className="text-gray-600 mb-6">Start a new family room and invite members to join</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Create Room
                                </button>
                            </div>
                        </div>

                        <div className="group relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-green-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <UserPlus className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">Join Family Room</h2>
                                <p className="text-gray-600 mb-6">Enter a room code to request joining a family</p>
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Join Room
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* My Join Requests */}
                    {myJoinRequests.length > 0 && (
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Join Requests</h2>
                            <div className="space-y-3">
                                {myJoinRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{request.family.name}</h3>
                                                <p className="text-sm text-gray-600">Room Code: {request.family.roomCode}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {request.status === 'PENDING' && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-semibold">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                                {request.status === 'ACCEPTED' && (
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold">
                                                        ✓ Accepted
                                                    </span>
                                                )}
                                                {request.status === 'REJECTED' && (
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-semibold">
                                                        ✗ Rejected
                                                    </span>
                                                )}
                                                {request.permissions && request.status === 'ACCEPTED' && (
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${request.permissions === 'VIEW_EDIT'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {request.permissions === 'VIEW_EDIT' ? 'View & Edit' : 'View Only'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* My Families List */}
                    {families.length > 0 && (
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Family Rooms</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {families.map((family) => {
                                    const userPerms = getUserPermissions(family);
                                    const creator = isCreator(family);
                                    return (
                                        <div
                                            key={family.id}
                                            onClick={() => setSelectedFamily(family)}
                                            className="group relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all duration-300 hover:shadow-lg"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{family.name}</h3>
                                                    <p className="text-sm text-gray-600">Code: {family.roomCode}</p>
                                                </div>
                                                <ChevronRight className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {creator && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Creator
                                                    </span>
                                                )}
                                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${userPerms === 'VIEW_EDIT'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {userPerms === 'VIEW_EDIT' ? (
                                                        <><Edit3 className="w-3 h-3" /> View & Edit</>
                                                    ) : (
                                                        <><Eye className="w-3 h-3" /> View Only</>
                                                    )}
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                                    {family.members.filter(m => m.status === 'ACCEPTED').length} Members
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Modals */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Create Family Room</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={familyName}
                                    onChange={(e) => setFamilyName(e.target.value)}
                                    placeholder="Enter family name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleCreateFamily}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Room'}
                                </button>
                            </div>
                        </div>
                    )}

                    {showJoinModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Join Family Room</h3>
                                    <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character room code"
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-2xl text-center tracking-widest uppercase"
                                />

                                {/* Permission Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Your Access Level</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setJoinPermission('VIEW_ONLY')}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${joinPermission === 'VIEW_ONLY'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Eye className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-800">View Only</div>
                                            <div className="text-xs text-gray-600 mt-1">See family data</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setJoinPermission('VIEW_EDIT')}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${joinPermission === 'VIEW_EDIT'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Edit3 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-800">View & Edit</div>
                                            <div className="text-xs text-gray-600 mt-1">Share your data</div>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleJoinFamily}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? 'Joining...' : 'Send Request'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Selected family view
    const userPermissions = getUserPermissions(selectedFamily);
    const creator = isCreator(selectedFamily);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedFamily(null)}
                    className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                >
                    <Home className="w-5 h-5" />
                    Back to All Rooms
                </button>

                {/* Header with Permission Badge */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            {selectedFamily.name}
                        </h1>
                        <p className="text-gray-600">Created by {selectedFamily.creator.name}</p>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 ${userPermissions === 'VIEW_EDIT'
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        }`}>
                        {userPermissions === 'VIEW_EDIT' ? (
                            <><Edit3 className="w-5 h-5" /> View & Edit Access</>
                        ) : (
                            <><Eye className="w-5 h-5" /> View Only Access</>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Room Code Card */}
                    <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-purple-100 text-sm mb-2">Room Code</p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-5xl font-mono font-bold text-white tracking-wider">
                                            {selectedFamily.roomCode}
                                        </span>
                                        <button
                                            onClick={() => copyRoomCode(selectedFamily.roomCode)}
                                            className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-110"
                                        >
                                            {copiedCode ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </div>
                                {creator && <Shield className="w-12 h-12 text-yellow-300" />}
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests (Creator Only) */}
                    {creator && pendingRequests.length > 0 && (
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                Pending Requests ({pendingRequests.length})
                            </h3>
                            <div className="space-y-4">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-800">{request.user.name}</p>
                                                <p className="text-sm text-gray-600">{request.user.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowPermissionModal(true);
                                                    }}
                                                    disabled={loading}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    disabled={loading}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Family Members */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                            Family Members ({selectedFamily.members.filter(m => m.status === 'ACCEPTED').length})
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {selectedFamily.members.filter(m => m.status === 'ACCEPTED').map((member) => (
                                <div key={member.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {member.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{member.user.name}</p>
                                                <p className="text-sm text-gray-600">{member.user.email}</p>
                                            </div>
                                        </div>
                                        {member.role === 'CREATOR' && (
                                            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-semibold">
                                                Creator
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            {member.permissions === 'VIEW_ONLY' ? (
                                                <><Eye className="w-4 h-4 text-blue-600" /> <span className="text-gray-700">View Only</span></>
                                            ) : (
                                                <><Edit3 className="w-4 h-4 text-green-600" /> <span className="text-gray-700">View & Edit</span></>
                                            )}
                                        </div>

                                        {creator && member.role !== 'CREATOR' && (
                                            <div className="flex gap-2">
                                                <select
                                                    value={member.permissions}
                                                    onChange={(e) => handleUpdatePermissions(member.id, e.target.value as any)}
                                                    disabled={loading}
                                                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                                                >
                                                    <option value="VIEW_ONLY">View Only</option>
                                                    <option value="VIEW_EDIT">View & Edit</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    disabled={loading}
                                                    className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Family Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                            {!creator && (
                                <button
                                    onClick={handleLeaveFamily}
                                    disabled={loading}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Leave Family
                                </button>
                            )}
                            {creator && (
                                <button
                                    onClick={() => handleDeleteFamily(selectedFamily.id)}
                                    disabled={loading}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete Family
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Family Financial Data Dashboard */}
                    <FamilyDataDashboard familyId={selectedFamily.id} permissions={userPermissions} />
                </div>

                {/* Permission Selection Modal */}
                {showPermissionModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Grant Permissions</h3>
                                <button onClick={() => setShowPermissionModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">Select permissions for {selectedRequest.user.name}</p>
                            <div className="space-y-3 mb-6">
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                                    <input
                                        type="radio"
                                        name="permission"
                                        value="VIEW_ONLY"
                                        checked={selectedPermission === 'VIEW_ONLY'}
                                        onChange={(e) => setSelectedPermission(e.target.value as any)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">View Only</p>
                                        <p className="text-sm text-gray-600">Can see all data but cannot edit</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                                    <input
                                        type="radio"
                                        name="permission"
                                        value="VIEW_EDIT"
                                        checked={selectedPermission === 'VIEW_EDIT'}
                                        onChange={(e) => setSelectedPermission(e.target.value as any)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">View & Edit</p>
                                        <p className="text-sm text-gray-600">Can see and edit all data</p>
                                    </div>
                                </label>
                            </div>
                            <button
                                onClick={handleAcceptRequest}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Accepting...' : 'Accept & Add Member'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
