import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Download, 
  Printer, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminTablesView({
  tables = [],
  restaurant,
  onAddTable,
  onDeleteTable,
  onUpdateTableStatus
}) {
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [selectedStandeeTable, setSelectedStandeeTable] = useState('12');
  const [showAddModal, setShowAddModal] = useState(false);

  // Common QR Code URL (points to root customer scan page)
  const commonQrUrl = window.location.origin + '/';

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newTableNum.trim()) {
      onAddTable(newTableNum.trim(), newCapacity);
      setNewTableNum('');
      setShowAddModal(false);
    }
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Top Banner: Common QR Architecture Explainer */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1.5px solid #fde68a',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '8px'
          }}>
            <QrCode size={14} />
            <span>COMMON RESTAURANT QR WORKFLOW</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            One Single Common QR Code for All Tables
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            The QR code printed on every table is identical. The table number is printed prominently <strong>above</strong> the QR code. When scanned, the customer enters their table number to create an active dining session.
          </p>
        </div>

        {/* Quick QR Preview */}
        <div style={{
          background: '#ffffff',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <QRCodeSVG value={commonQrUrl} size={100} level="H" />
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '6px' }}>
            COMMON RESTAURANT QR
          </div>
        </div>
      </div>

      {/* Two Column Layout: Table Status Grid & Printable Standee Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* Left: Table Management & Status List */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Restaurant Tables ({tables.length})</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-time table status and active guest sessions</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              <span>Add Table</span>
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {tables.map((table) => (
                <div
                  key={table.id}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: table.status === 'ORDERING' ? '#fffbeb' : '#ffffff',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 900,
                      border: '1px solid var(--primary-border)'
                    }}>
                      {table.table_number}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                        Table {table.table_number}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Capacity: {table.capacity} guests</span>
                        {table.activeOrdersCount > 0 && (
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            • {table.activeOrdersCount} Active Order(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={table.status}
                      onChange={(e) => onUpdateTableStatus(table.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-medium)',
                        background: table.status === 'AVAILABLE' ? '#dcfce7' : (table.status === 'ORDERING' ? '#fef3c7' : '#fee2e2'),
                        color: table.status === 'AVAILABLE' ? '#15803d' : (table.status === 'ORDERING' ? '#b45309' : '#991b1b'),
                        cursor: 'pointer'
                      }}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ORDERING">Ordering</option>
                      <option value="OCCUPIED">Occupied</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelectedStandeeTable(table.table_number)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px' }}
                      title="Preview Standee for this table"
                    >
                      <QrCode size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTable(table.id)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px 8px' }}
                      title="Delete Table"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Physical Standee Mockup & Generator */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Table Standee Preview</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Print-ready table standee card</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={selectedStandeeTable}
                onChange={(e) => setSelectedStandeeTable(e.target.value)}
                className="input-field"
                style={{ width: '130px', padding: '6px 10px', fontSize: '0.82rem' }}
              >
                {tables.map(t => (
                  <option key={t.id} value={t.table_number}>Table {t.table_number}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handlePrintStandee}
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 12px' }}
              >
                <Printer size={15} />
                <span>Print Standee</span>
              </button>
            </div>
          </div>

          {/* Physical Standee Card Cardboard Mockup */}
          <div style={{
            maxWidth: '340px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
            border: '2px solid #e2e8f0',
            padding: '36px 28px',
            textAlign: 'center',
            position: 'relative',
            background: 'linear-gradient(180deg, #ffffff 0%, #fffbf0 100%)'
          }}>
            {/* Restaurant Logo & Header */}
            {restaurant?.logo && (
              <img
                src={restaurant.logo}
                alt="Logo"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  margin: '0 auto 12px',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
            )}
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {restaurant?.name || 'The Royal Saffron & Grill'}
            </h4>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Contactless Table Dining
            </div>

            {/* Prominent Table Number printed above QR Code */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '14px',
              fontSize: '1.45rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              display: 'inline-block',
              marginBottom: '20px',
              boxShadow: '0 6px 16px rgba(15, 23, 42, 0.25)'
            }}>
              TABLE {selectedStandeeTable}
            </div>

            {/* The Common QR Code */}
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '18px',
              display: 'inline-block',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              marginBottom: '18px'
            }}>
              <QRCodeSVG
                value={commonQrUrl}
                size={160}
                level="H"
                includeMargin={false}
                fgColor="#0f172a"
              />
            </div>

            {/* Instructions */}
            <div style={{
              fontSize: '1rem',
              fontWeight: 900,
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Scan to Order
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Open your phone camera, scan this code, and confirm Table {selectedStandeeTable} on your screen.
            </p>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Add Restaurant Table
            </h3>

            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  Table Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 16"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  Guest Seating Capacity
                </label>
                <select
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="input-field"
                >
                  <option value="2">2 Guests (Couple)</option>
                  <option value="4">4 Guests (Standard)</option>
                  <option value="6">6 Guests (Family)</option>
                  <option value="8">8+ Guests (Party)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
