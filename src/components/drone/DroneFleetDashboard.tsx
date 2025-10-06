'use client';

import {
  Battery,
  Calendar,
  Filter,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import DroneRegistrationForm from './DroneRegistrationForm';
import { useDroneStore } from '@/src/lib/stores/drone';
import type { Drone, DroneFilters, DroneStatus } from '@/src/types/drone';

const statusColors: Record<DroneStatus, string> = {
  available: 'bg-green-100 text-green-800',
  'in-flight': 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  charging: 'bg-purple-100 text-purple-800',
  offline: 'bg-gray-100 text-gray-800',
  reserved: 'bg-orange-100 text-orange-800',
};

const statusIcons: Record<DroneStatus, React.ReactNode> = {
  available: <Zap className="w-4 h-4" />,
  'in-flight': <MapPin className="w-4 h-4" />,
  maintenance: <Settings className="w-4 h-4" />,
  charging: <Battery className="w-4 h-4" />,
  offline: <div className="w-4 h-4 rounded-full bg-gray-400" />,
  reserved: <Calendar className="w-4 h-4" />,
};

interface DroneCardProps {
  drone: Drone;
  onEdit: (drone: Drone) => void;
  onDelete: (id: string) => void;
}

function DroneCard({ drone, onEdit, onDelete }: DroneCardProps) {
  const { updateDroneStatus } = useDroneStore();

  const handleStatusChange = async (newStatus: DroneStatus) => {
    try {
      await updateDroneStatus(drone.id, newStatus);
    } catch (error) {
      console.error('Error updating drone status:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {drone.model}
            </h3>
            <p className="text-sm text-gray-600">{drone.manufacturer}</p>
            <p className="text-xs text-gray-500 mt-1">
              S/N: {drone.serialNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[drone.status]
              }`}
            >
              {statusIcons[drone.status]}
              <span className="ml-1 capitalize">
                {drone.status.replace('-', ' ')}
              </span>
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Flight Time</p>
            <p className="text-sm font-medium">
              {drone.totalFlightTime.toFixed(1)}h
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Flights</p>
            <p className="text-sm font-medium">{drone.totalFlights}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Battery</p>
            <p className="text-sm font-medium">
              {drone.specifications.batteryCapacity}mAh
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Max Speed</p>
            <p className="text-sm font-medium">
              {drone.specifications.maxSpeed}km/h
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <select
            value={drone.status}
            onChange={(e) => handleStatusChange(e.target.value as DroneStatus)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="available">Available</option>
            <option value="in-flight">In Flight</option>
            <option value="maintenance">Maintenance</option>
            <option value="charging">Charging</option>
            <option value="offline">Offline</option>
            <option value="reserved">Reserved</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(drone)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(drone.id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DroneFleetDashboard() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DroneStatus | 'all'>('all');

  const {
    drones,
    stats,
    isLoading,
    getDrones,
    deleteDrone,
    calculateStats,
    searchDrones,
    setFilters,
  } = useDroneStore();

  useEffect(() => {
    getDrones();
    calculateStats();
  }, [getDrones, calculateStats]);

  useEffect(() => {
    if (searchQuery) {
      searchDrones(searchQuery);
    } else {
      const filters: DroneFilters = {};
      if (statusFilter !== 'all') {
        filters.status = [statusFilter];
      }
      setFilters(filters);
    }
  }, [searchQuery, statusFilter, searchDrones, setFilters]);

  const handleDeleteDrone = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this drone?')) {
      try {
        await deleteDrone(id);
        calculateStats();
      } catch (error) {
        console.error('Error deleting drone:', error);
      }
    }
  };

  const handleEditDrone = (drone: Drone) => {
    // TODO: Open edit modal
    console.log('Edit drone:', drone);
  };

  const filteredDrones = drones.filter((drone) => {
    const matchesSearch = searchQuery
      ? drone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drone.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drone.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === 'all' || drone.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (showRegistrationForm) {
    return (
      <DroneRegistrationForm
        onSuccess={() => {
          setShowRegistrationForm(false);
          getDrones();
          calculateStats();
        }}
        onCancel={() => setShowRegistrationForm(false)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drone Fleet</h1>
            <p className="text-gray-600 mt-1">
              Manage your drone fleet and monitor operations
            </p>
          </div>
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Drone
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Drones"
              value={stats.total}
              icon={<div className="w-6 h-6 bg-blue-600 rounded" />}
              color="bg-blue-100"
            />
            <StatsCard
              title="Available"
              value={stats.available}
              icon={<Zap className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
            />
            <StatsCard
              title="In Flight"
              value={stats.inFlight}
              icon={<MapPin className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
            />
            <StatsCard
              title="Maintenance Due"
              value={stats.maintenanceDue}
              icon={<Settings className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-100"
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drones by model, manufacturer, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as DroneStatus | 'all')
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in-flight">In Flight</option>
                <option value="maintenance">Maintenance</option>
                <option value="charging">Charging</option>
                <option value="offline">Offline</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drone Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDrones.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-300 rounded" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No drones found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first drone to the fleet'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Drone
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrones.map((drone) => (
            <DroneCard
              key={drone.id}
              drone={drone}
              onEdit={handleEditDrone}
              onDelete={handleDeleteDrone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
