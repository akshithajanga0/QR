import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Search, ArrowUpRight, DollarSign, Banknote } from 'lucide-react';

export default function AdminPaymentsView({ orders = [], currency = '₹' }) {
  const [search, setSearch] = useState('');

  const paidOrders = orders.filter(o => o.payment_status === 'PAID' || o.status === 'COMPLETED');
  const pendingOrders = orders.filter(o => o.payment_status !== 'PAID' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  const filtered = orders.filter(o => 
    !search || 
    o.table_number.includes(search) || 
    o.order_number.includes(search)
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Search & Overview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search by Order # or Table #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{
            background: '#ffffff',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Settled / Paid: </span>
            <strong style={{ color: '#16a34a' }}>{paidOrders.length} orders</strong>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Pending Settlement: </span>
            <strong style={{ color: '#b45309' }}>{pendingOrders.length} orders</strong>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px' }}>ORDER</th>
                <th style={{ padding: '12px 18px' }}>TABLE</th>
                <th style={{ padding: '12px 18px' }}>PAYMENT METHOD</th>
                <th style={{ padding: '12px 18px' }}>STATUS</th>
                <th style={{ padding: '12px 18px' }}>TIME</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 800 }}>
                    #{ord.order_number}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.82rem'
                    }}>
                      Table {ord.table_number}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ord.payment_method === 'ONLINE' ? <CreditCard size={15} color="#0284c7" /> : <Banknote size={15} color="#16a34a" />}
                      <span>{ord.payment_method === 'ONLINE' ? 'UPI / Online' : 'Cash / Counter'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span className="badge" style={{
                      background: ord.payment_status === 'PAID' ? '#dcfce7' : '#fef3c7',
                      color: ord.payment_status === 'PAID' ? '#15803d' : '#854d0e',
                      border: ord.payment_status === 'PAID' ? '1px solid #86efac' : '1px solid #fde047'
                    }}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                    {currency}{ord.total_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
