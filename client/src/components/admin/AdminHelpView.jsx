import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Check, History, ArrowRight } from 'lucide-react';

export default function AdminHelpView({
  helpRequests = [],
  onUpdateStatus,
  isUpdating
}) {
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'HISTORY'

  const activeList = helpRequests.filter(h => ['PENDING', 'WAITER_INFORMED', 'BEING_HANDLED'].includes(h.status));
  const historyList = helpRequests.filter(h => ['COMPLETED', 'CANCELLED'].includes(h.status));

  const displayList = activeTab === 'ACTIVE' ? activeList : historyList;

  return (
    <div style={{ padding: '24px' }}>
      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'ACTIVE' ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: activeTab === 'ACTIVE' ? 'var(--primary-light)' : '#ffffff',
              color: activeTab === 'ACTIVE' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bell size={16} />
            <span>Active Requests ({activeList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'HISTORY' ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: activeTab === 'HISTORY' ? 'var(--primary-light)' : '#ffffff',
              color: activeTab === 'HISTORY' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={16} />
            <span>Completed History ({historyList.length})</span>
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          💡 Customer table assistance requests are managed centrally here by the Admin.
        </div>
      </div>

      {/* Requests List */}
      {displayList.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)'
        }}>
          <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 12px' }} />
          <h3>{activeTab === 'ACTIVE' ? 'No pending help requests' : 'No request history recorded yet'}</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            {activeTab === 'ACTIVE' ? 'All table assistance needs are fully fulfilled.' : 'Completed table requests will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {displayList.map((req) => {
            const timeFormatted = new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: req.status === 'PENDING' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '14px 18px',
                  background: req.status === 'PENDING' ? '#fffbeb' : 'var(--bg-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '1rem',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-xs)'
                    }}>
                      TABLE {req.table_number}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {timeFormatted}
                    </span>
                  </div>

                  {req.status === 'PENDING' && (
                    <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                      🔴 PENDING
                    </span>
                  )}
                  {req.status === 'WAITER_INFORMED' && (
                    <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>
                      🟡 WAITER INFORMED
                    </span>
                  )}
                  {req.status === 'BEING_HANDLED' && (
                    <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>
                      🔵 BEING HANDLED
                    </span>
                  )}
                  {req.status === 'COMPLETED' && (
                    <span className="badge" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                      🟢 COMPLETED
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '18px', flex: 1 }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Request Type:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {req.request_type}
                    </div>
                  </div>

                  {req.message ? (
                    <div style={{
                      background: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      💬 <strong>Customer Note:</strong> "{req.message}"
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No additional text note provided.
                    </div>
                  )}
                </div>

                {/* Workflow Action Buttons */}
                <div style={{
                  padding: '14px 18px',
                  background: '#fafafa',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '10px'
                }}>
                  {req.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onUpdateStatus(req.id, 'WAITER_INFORMED')}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 800 }}
                    >
                      <Bell size={16} />
                      <span>INFORM WAITER</span>
                    </button>
                  )}

                  {req.status === 'WAITER_INFORMED' && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus(req.id, 'BEING_HANDLED')}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, padding: '9px', fontSize: '0.84rem', fontWeight: 700 }}
                      >
                        Waiter at Table
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus(req.id, 'COMPLETED')}
                        className="btn btn-success btn-sm"
                        style={{ flex: 1, padding: '9px', fontSize: '0.84rem', fontWeight: 800 }}
                      >
                        <Check size={16} />
                        <span>MARK COMPLETED</span>
                      </button>
                    </>
                  )}

                  {req.status === 'BEING_HANDLED' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onUpdateStatus(req.id, 'COMPLETED')}
                      className="btn btn-success"
                      style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 800 }}
                    >
                      <CheckCircle2 size={16} />
                      <span>MARK COMPLETED</span>
                    </button>
                  )}

                  {req.status === 'COMPLETED' && (
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '0.82rem',
                      color: '#15803d',
                      fontWeight: 700
                    }}>
                      ✓ Resolved {req.completed_at ? new Date(req.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
