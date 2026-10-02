import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Search, 
  Image as ImageIcon,
  Sparkles,
  Utensils
} from 'lucide-react';

export default function AdminMenuView({
  categories = [],
  menuItems = [],
  currency = '₹',
  onSaveItem,
  onDeleteItem,
  onToggleAvailability,
  onAddCategory,
  onDeleteCategory
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null); // null means closed, {} means new
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      dietary: 'VEG',
      is_available: 1,
      is_special: 0,
      is_popular: 0,
      addons: []
    });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    onSaveItem(editingItem);
    setEditingItem(null);
  };

  const handleAddAddonField = () => {
    setEditingItem({
      ...editingItem,
      addons: [...(editingItem.addons || []), { name: '', price: 0 }]
    });
  };

  const handleRemoveAddonField = (idx) => {
    const updated = [...(editingItem.addons || [])];
    updated.splice(idx, 1);
    setEditingItem({ ...editingItem, addons: updated });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
            style={{ width: '180px', fontSize: '0.88rem' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-secondary btn-sm"
          >
            Manage Categories
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>

      {/* Menu Items Table / Cards */}
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
                <th style={{ padding: '12px 18px' }}>DISH</th>
                <th style={{ padding: '12px 18px' }}>CATEGORY</th>
                <th style={{ padding: '12px 18px' }}>PRICE</th>
                <th style={{ padding: '12px 18px' }}>STATUS</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const cat = categories.find(c => c.id === item.category_id);

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Dish Name & Image */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className={item.dietary === 'VEG' ? 'veg-indicator' : 'non-veg-indicator'} />
                            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                              {item.name}
                            </span>
                            {item.is_special ? <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>SPECIAL</span> : null}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 18px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      {cat?.name || 'General'}
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 18px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {currency}{item.price}
                    </td>

                    {/* Quick Availability Toggle */}
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item.id, !item.is_available)}
                        style={{
                          background: item.is_available ? '#dcfce7' : '#fee2e2',
                          color: item.is_available ? '#15803d' : '#991b1b',
                          border: 'none',
                          borderRadius: 'var(--radius-full)',
                          padding: '4px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {item.is_available ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{item.is_available ? 'Available' : 'SOLD OUT'}</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px' }}
                          title="Edit Food Item"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 10px' }}
                          title="Delete Food Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Item Modal */}
      {editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
              {editingItem.id ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>

            <form onSubmit={handleSaveModal}>
              {/* Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  Food Item Name
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Chicken Dum Biryani"
                />
              </div>

              {/* Category & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={editingItem.category_id}
                    onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                    className="input-field"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    Price ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="input-field"
                    placeholder="249"
                  />
                </div>
              </div>

              {/* Dietary & Availability */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    Dietary Type
                  </label>
                  <select
                    value={editingItem.dietary || 'VEG'}
                    onChange={(e) => setEditingItem({ ...editingItem, dietary: e.target.value })}
                    className="input-field"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    Initial Availability
                  </label>
                  <select
                    value={editingItem.is_available ? '1' : '0'}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.value === '1' ? 1 : 0 })}
                    className="input-field"
                  >
                    <option value="1">Available in Kitchen</option>
                    <option value="0">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="input-field"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="input-field"
                  placeholder="Rich aromatic basmati rice..."
                />
              </div>

              {/* Addons Builder */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Customization Add-ons
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAddonField}
                    className="btn btn-subtle btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  >
                    + Add Add-on
                  </button>
                </div>

                {editingItem.addons?.map((addon, aIdx) => (
                  <div key={aIdx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="text"
                      placeholder="Addon name (e.g. Extra Raita)"
                      value={addon.name}
                      onChange={(e) => {
                        const updated = [...editingItem.addons];
                        updated[aIdx].name = e.target.value;
                        setEditingItem({ ...editingItem, addons: updated });
                      }}
                      className="input-field"
                      style={{ flex: 2, padding: '8px', fontSize: '0.82rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Extra Price"
                      value={addon.price}
                      onChange={(e) => {
                        const updated = [...editingItem.addons];
                        updated[aIdx].price = e.target.value;
                        setEditingItem({ ...editingItem, addons: updated });
                      }}
                      className="input-field"
                      style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAddonField(aIdx)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px 10px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Restaurant Categories
            </h3>

            {/* Existing Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Category Form */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="New Category Name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.86rem', padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCatName.trim()) {
                    onAddCategory(newCatName.trim());
                    setNewCatName('');
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                Add
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
