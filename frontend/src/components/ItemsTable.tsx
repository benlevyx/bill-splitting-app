import type { BillItem } from '../types'

interface ItemsTableProps {
  items: BillItem[]
  setItems: (items: BillItem[]) => void
  tax: number
  setTax: (tax: number) => void
  onConfirm: () => void
  onReset: () => void
  onBack: () => void
}

const ItemsTable = ({ items, setItems, tax, setTax, onConfirm, onReset, onBack }: ItemsTableProps) => {
  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'price' || field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: parseFloat(value as string) || 0 }
    } else {
      newItems[index] = { ...newItems[index], [field]: value as string }
    }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { name: '', price: 0, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="items-table">
      <div className="items-header">
        <button onClick={onBack} className="back-btn">
          ←
        </button>
        <h2>Review & Edit Items</h2>
        <button onClick={onReset} className="reset-items-btn">
          Reset to Original
        </button>
      </div>
      
      <div className="items-cards">
        {items.map((item, index) => (
          <div key={index} className="item-card">
            <div className="item-header">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="Item name"
                className="item-name-input"
              />
              <button onClick={() => removeItem(index)} className="delete-btn">
                ×
              </button>
            </div>
            
            <div className="item-details">
              <div className="price-quantity-row">
                <div className="detail-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    step="0.01"
                    className="detail-input"
                  />
                </div>
                
                <div className="detail-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="detail-input"
                  />
                </div>
              </div>
              
              <div className="detail-group">
                <label>Total</label>
                <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="add-item-btn">
        + Add Item
      </button>

      <div className="summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax:</span>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0"
          />
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${(subtotal + tax).toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={onConfirm} 
        className="confirm-btn"
        disabled={items.length === 0 || items.some(item => !item.name || item.price <= 0)}
      >
        Continue to Split
      </button>
    </div>
  )
}

export default ItemsTable