import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Send, Users, UserPlus } from 'lucide-react';
import Register from './Register';

// Import environment variables
const { VITE_API_BASE_URL } = import.meta.env;

const Dashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(null); // Track when snapshot was taken
  const [showRegister, setShowRegister] = useState(false); // Track register page visibility

  const API_BASE_URL = VITE_API_BASE_URL;
  console.log('Dashboard - VITE_API_BASE_URL:', VITE_API_BASE_URL);
  console.log('Dashboard - API_BASE_URL:', API_BASE_URL);



  const fetchPatients = async (filterType) => {
    // Check if we already have a snapshot for today/tomorrow
    const currentDate = new Date().toDateString();
    const snapshotKey = `snapshot_${filterType}_${currentDate}`;
    
    // Try to load from localStorage first
    const savedSnapshot = localStorage.getItem(snapshotKey);
    if (savedSnapshot) {
      try {
        const snapshot = JSON.parse(savedSnapshot);
        setPatients(snapshot.data || []);
        setFilter(filterType);
        setSnapshotDate(new Date(snapshot.timestamp));
        console.log(`Loaded snapshot from ${new Date(snapshot.timestamp).toLocaleString()}: ${snapshot.data.length} patients`);
        return; // Use cached data, don't fetch new
      } catch (e) {
        console.error('Failed to parse snapshot:', e);
      }
    }

    // If no snapshot exists, fetch from server
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      
      // Map filter types to correct API endpoints
      switch (filterType) {
        case 'today':
          endpoint = `${API_BASE_URL}/users/birthday/today`;
          break;
        case 'tomorrow':
          endpoint = `${API_BASE_URL}/users/birthday/tomorrow`;
          break;
        default:
          throw new Error('Invalid filter type');
      }

      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success) {
        setPatients(result.data || []);
        setFilter(filterType);
        const timestamp = new Date();
        setSnapshotDate(timestamp);
        
        // Save snapshot to localStorage
        localStorage.setItem(snapshotKey, JSON.stringify({
          data: result.data,
          timestamp: timestamp.toISOString(),
          count: result.data.length
        }));
        
        console.log(`Created new snapshot: ${result.data.length} patients at ${timestamp.toLocaleString()}`);
      } else {
        setError(result.message || 'Failed to fetch patients');
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to connect to server. Please check if the backend is running.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Send patient data to WhatsApp template backend endpoint, mapping date of birth
  const sendGreetings = async () => {
    if (patients.length === 0) {
      alert('No patients to send greetings to.');
      return;
    }
    try {
      // Prepare the payload for the backend as { patients: [...] } with Contact and Param fields
      const whatsappPayload = patients.map((patient) => ({
        Contact: patient.mobile, // Use the formatted mobile with country code
        Param: patient.name
      }));
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patients: whatsappPayload }),
      });
      const result = await response.json();
      if (result.success) {
        // Show a summary of WhatsApp API results for each patient
        const successCount = result.results.filter(r => r.success).length;
        const failCount = result.results.length - successCount;
        let message = `WhatsApp API: ${successCount} sent, ${failCount} failed.`;
        if (failCount > 0) {
          message += '\nFailed: ' + result.results.filter(r => !r.success).map(r => r.patient.Name || r.patient.Contact).join(', ');
        }
        alert(message);
      } else {
        alert(result.error || 'Failed to send greetings.');
      }
    } catch (error) {
      alert('Error sending greetings.');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAge = (age) => {
    if (!age) return 'N/A';
    return `${age} years old`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600">Manage patient birthday greetings for your hospital</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-1 gap-6">
          {/* Filter Buttons */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Birthday Filters
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => fetchPatients('today')}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && filter === 'today' ? 'Loading...' : 'Today'}
              </button>
              <button
                onClick={() => fetchPatients('tomorrow')}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && filter === 'tomorrow' ? 'Loading...' : 'Tomorrow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ...existing code... (Template Form removed) */}

      {/* Patients List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              {filter === 'today' ? "Today's Birthdays" : filter === 'tomorrow' ? "Tomorrow's Birthdays" : 'Patient Birthdays'}
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {patients.length}
              </span>
              {snapshotDate && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Snapshot: {snapshotDate.toLocaleTimeString()}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {/* Admin Register Button */}
            {user && user.userId === 'admin' && (
              <button
                onClick={() => setShowRegister(!showRegister)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <UserPlus size={20} />
                {showRegister ? 'Hide Register' : 'Register User'}
              </button>
            )}
            {patients.length > 0 && (
              <button
                onClick={sendGreetings}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Send size={20} />
                Send Greetings ({patients.length})
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patients...</p>
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 w-16">S.No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">UHID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mobile</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date of Birth</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Gender</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr key={patient.uhid || index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-blue-50 transition-colors`}>
                    <td className="text-center py-3 px-4 text-gray-600 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{patient.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.uhid || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {patient.mobile ? (
                        <span className="font-mono text-sm font-medium text-gray-800">
                          {patient.mobile}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(patient.dob)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatAge(patient.age)}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.gender || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Patients Found</h4>
            <p className="text-gray-500">
              {filter ? `No patients have birthdays ${filter}.` : 'Click Today or Tomorrow to filter patients.'}
            </p>
          </div>
        )}
      </div>

      {/* Register Form for Admin */}
      {showRegister && user && user.userId === 'admin' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus className="text-purple-600" size={20} />
            Register New User
          </h3>
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
