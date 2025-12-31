import { useState, useEffect } from 'react';
import { useFeatures } from '../context/FeatureContext';
import UpgradePrompt from '../components/UpgradePrompt';
import { shiftsApi, usersApi, jobsApi } from '../services/api';

function SchedulingPage() {
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const [shifts, setShifts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    jobId: '',
    userId: '',
    shiftDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    notes: '',
  });

  useEffect(() => {
    if (hasFeature('SHIFT_SCHEDULING')) {
      loadData();
    }
  }, [hasFeature]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, workersRes, jobsRes] = await Promise.all([
        shiftsApi.getAll(),
        usersApi.getAll(),
        jobsApi.getAll(),
      ]);
      
      setShifts(shiftsRes.data || []);
      setWorkers(workersRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await shiftsApi.create({
        jobId: formData.jobId,
        userId: formData.userId,
        shiftDate: formData.shiftDate,
        startTime: new Date(`${formData.shiftDate}T${formData.startTime}`),
        endTime: new Date(`${formData.shiftDate}T${formData.endTime}`),
        notes: formData.notes,
      });
      setShowModal(false);
      setFormData({
        jobId: '',
        userId: '',
        shiftDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00',
        notes: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to create shift:', err);
      alert('Failed to create shift');
    }
  };

  const handleDeleteShift = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this shift?')) return;
    try {
      await shiftsApi.delete(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const getShiftsForDate = (date) => {
    return shifts.filter(s => {
      const shiftDate = new Date(s.shiftDate);
      return shiftDate.toDateString() === date.toDateString();
    });
  };

  const openModalForDate = (date) => {
    setFormData({ ...formData, shiftDate: date.toISOString().split('T')[0] });
    setShowModal(true);
  };

  if (featuresLoading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading...</div>;
  }

  if (!hasFeature('SHIFT_SCHEDULING')) {
    return <UpgradePrompt feature="SHIFT_SCHEDULING" requiredPlan="Professional" />;
  }

  const weekDates = getWeekDates();

  const selectStyle = {
    width: '100%',
    padding: '14px',
    background: '#2a2a3d',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  };

  const optionStyle = {
    background: '#2a2a3d',
    color: '#fff',
    padding: '10px',
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: '#2a2a3d',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '5px' }}>
            📅 Shift Scheduling
          </h1>
          <p style={{ color: '#888' }}>Click on any day to create a shift</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: 'white',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ➕ Create Shift
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>📋</span>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>{shifts.length}</p>
            <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>Total Shifts</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #a855f7', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>👷</span>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>{workers.length}</p>
            <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>Workers</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #22c55e', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>🏗️</span>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>{jobs.length}</p>
            <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>Job Sites</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>⏰</span>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>{shifts.filter(s => s.status === 'SCHEDULED').length}</p>
            <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>Upcoming</p>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigateWeek(-1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          ← Previous Week
        </button>
        <h3 style={{ color: '#fff', fontSize: '20px' }}>
          {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>
        <button
          onClick={() => navigateWeek(1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading shifts...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {weekDates.map((date, idx) => {
            const dayShifts = getShiftsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={idx}
                onClick={() => openModalForDate(date)}
                style={{
                  background: isToday ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: isToday ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '15px',
                  minHeight: '180px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a855f7';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(168, 85, 247, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isToday ? '#a855f7' : 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p style={{ color: isToday ? '#a855f7' : '#fff', fontSize: '28px', fontWeight: '700', margin: '5px 0 0 0' }}>
                    {date.getDate()}
                  </p>
                </div>
                
                {dayShifts.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>No shifts</p>
                    <p style={{ color: '#a855f7', fontSize: '24px', margin: '10px 0 0 0', opacity: 0.4 }}>+</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayShifts.map(shift => (
                      <div
                        key={shift.id}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.1))',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '11px',
                          position: 'relative',
                        }}
                      >
                        <button
                          onClick={(e) => handleDeleteShift(shift.id, e)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '12px',
                            opacity: 0.6,
                          }}
                        >
                          ✕
                        </button>
                        <p style={{ color: '#a855f7', fontWeight: '600', margin: 0 }}>{shift.user?.name || 'Unassigned'}</p>
                        <p style={{ color: '#ccc', margin: '3px 0 0 0', fontSize: '10px' }}>{shift.job?.name}</p>
                        <p style={{ color: '#888', margin: '3px 0 0 0', fontSize: '10px' }}>
                          🕐 {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #252538 0%, #1e1e2f 100%)',
              borderRadius: '24px',
              padding: '35px',
              width: '100%',
              maxWidth: '480px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>📅 Create New Shift</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#888', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateShift}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>🏗️ Job Site</label>
                <select
                  value={formData.jobId}
                  onChange={e => setFormData({ ...formData, jobId: e.target.value })}
                  required
                  style={selectStyle}
                >
                  <option value="" style={optionStyle}>Select a job site</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id} style={optionStyle}>{job.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>👷 Worker</label>
                <select
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  required
                  style={selectStyle}
                >
                  <option value="" style={optionStyle}>Select a worker</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id} style={optionStyle}>{worker.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>📆 Date</label>
                <input
                  type="date"
                  value={formData.shiftDate}
                  onChange={e => setFormData({ ...formData, shiftDate: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>🕐 Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>🕐 End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>📝 Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: '#ccc', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                >
                  ✅ Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulingPage;