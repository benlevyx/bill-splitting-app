import { useState } from 'react'
import type { BillItem } from '../types'

interface BillInputProps {
  onBillParsed: (items: BillItem[], tax?: number) => void
}

const BillInput = ({ onBillParsed }: BillInputProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' })
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  const loadingMessages = [
    "🔍 Reading your receipt...",
    "🧾 Scanning for items...",
    "💰 Counting the dollars...",
    "🍽️ Identifying delicious dishes...",
    "📊 Crunching the numbers...",
    "🎯 Spotting those sneaky charges...",
    "🍕 Finding the pizza slices...",
    "💸 Tallying up the damage...",
    "🔢 Doing the math magic...",
    "📋 Building your bill breakdown..."
  ]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setLoadingMessageIndex(0)

    // Cycle through loading messages every 2 seconds
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length)
    }, 2000)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/parse-bill', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Failed to parse bill')
      
      const data = await response.json()
      onBillParsed(data.items, data.tax)
    } catch (error) {
      console.error('Error parsing bill:', error)
      alert('Error parsing bill. Please try manual entry.')
    } finally {
      clearInterval(messageInterval)
      setIsUploading(false)
    }
  }

  const handleManualAdd = () => {
    if (!newItem.name || !newItem.price) return
    
    const item: BillItem = {
      name: newItem.name,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity) || 1
    }
    
    setNewItem({ name: '', price: '', quantity: '1' })
    onBillParsed([item])
  }

  if (manualEntry) {
    return (
      <div className="bill-input">
        <h2>Add Bill Items</h2>
        <div className="manual-entry">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            step="0.01"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          />
          <button onClick={handleManualAdd} disabled={!newItem.name || !newItem.price}>
            Add Item
          </button>
        </div>
        <button onClick={() => setManualEntry(false)} className="secondary">
          Back to Photo Upload
        </button>
      </div>
    )
  }

  return (
    <div className="bill-input">
      <h2>Upload Your Bill</h2>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleFileUpload}
          disabled={isUploading}
          id="bill-upload"
          className="file-input"
        />
        <label htmlFor="bill-upload" className="upload-button">
          {isUploading ? loadingMessages[loadingMessageIndex] : 'Take Photo or Upload Bill'}
        </label>
      </div>
      
      <div className="divider">
        <span>OR</span>
      </div>
      
      <button onClick={() => setManualEntry(true)} className="manual-button">
        Enter Items Manually
      </button>
    </div>
  )
}

export default BillInput