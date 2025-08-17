import { useState, useEffect } from 'react'
import type { BillItem, SplitResult } from '../types'

interface ItemSplitProps {
  items: BillItem[]
  tax: number
  peopleCount: number
  setPeopleCount: (count: number) => void
  assignments: boolean[][]
  setAssignments: (assignments: boolean[][]) => void
  onComplete: (result: SplitResult) => void
  onBack: () => void
}

const ItemSplit = ({
  items,
  tax,
  peopleCount,
  setPeopleCount,
  assignments,
  setAssignments,
  onComplete,
  onBack
}: ItemSplitProps) => {
  const [isCalculating, setIsCalculating] = useState(false)
  const [peopleNames, setPeopleNames] = useState<string[]>([])
  const [tipPercentage, setTipPercentage] = useState(18)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [subItemAssignments, setSubItemAssignments] = useState<{ [key: string]: boolean[] }>({})

  useEffect(() => {
    const newAssignments = items.map((_, itemIndex) =>
      Array(peopleCount).fill(false).map((_, personIndex) =>
        assignments[itemIndex]?.[personIndex] || false
      )
    )
    setAssignments(newAssignments)

    // Initialize sub-item assignments
    const newSubAssignments: { [key: string]: boolean[] } = {}
    items.forEach((item, itemIndex) => {
      if (item.quantity > 1) {
        for (let subIndex = 0; subIndex < item.quantity; subIndex++) {
          const key = `${itemIndex}-${subIndex}`
          newSubAssignments[key] = Array(peopleCount).fill(false)
        }
      }
    })
    setSubItemAssignments(newSubAssignments)

    setPeopleNames(Array(peopleCount).fill('').map((_, i) => `Person ${i + 1}`))
  }, [peopleCount, items.length])

  const toggleAssignment = (itemIndex: number, personIndex: number) => {
    const newAssignments = [...assignments]
    newAssignments[itemIndex][personIndex] = !newAssignments[itemIndex][personIndex]
    setAssignments(newAssignments)
  }

  const toggleSubItemAssignment = (itemIndex: number, subIndex: number, personIndex: number) => {
    const key = `${itemIndex}-${subIndex}`
    const newSubAssignments = { ...subItemAssignments }
    if (!newSubAssignments[key]) {
      newSubAssignments[key] = Array(peopleCount).fill(false)
    }
    newSubAssignments[key][personIndex] = !newSubAssignments[key][personIndex]
    setSubItemAssignments(newSubAssignments)
  }

  const updatePersonName = (index: number, name: string) => {
    const newNames = [...peopleNames]
    newNames[index] = name || `Person ${index + 1}`
    setPeopleNames(newNames)
  }

  const toggleExpanded = (itemIndex: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemIndex)) {
      newExpanded.delete(itemIndex)
    } else {
      newExpanded.add(itemIndex)
    }
    setExpandedItems(newExpanded)
  }

  const getEffectiveAssignments = () => {
    return items.map((item, itemIndex) => {
      if (item.quantity > 1 && expandedItems.has(itemIndex)) {
        // For expanded items, combine all sub-item assignments
        const combinedAssignment = Array(peopleCount).fill(0)
        for (let subIndex = 0; subIndex < item.quantity; subIndex++) {
          const key = `${itemIndex}-${subIndex}`
          const subAssignment = subItemAssignments[key] || Array(peopleCount).fill(false)
          subAssignment.forEach((assigned, personIndex) => {
            if (assigned) combinedAssignment[personIndex]++
          })
        }
        return combinedAssignment
      } else {
        // For non-expanded items, use regular assignments
        return assignments[itemIndex]?.map(a => a ? item.quantity : 0) || Array(peopleCount).fill(0)
      }
    })
  }

  const hasUnassignedItems = () => {
    return items.some((item, itemIndex) => {
      if (item.quantity > 1 && expandedItems.has(itemIndex)) {
        // Check if all sub-items are assigned
        for (let subIndex = 0; subIndex < item.quantity; subIndex++) {
          const key = `${itemIndex}-${subIndex}`
          const subAssignment = subItemAssignments[key] || Array(peopleCount).fill(false)
          if (!subAssignment.some(assigned => assigned)) {
            return true
          }
        }
        return false
      } else {
        // Check regular assignment
        return !assignments[itemIndex]?.some(assigned => assigned)
      }
    })
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tipAmount = (subtotal + tax) * (tipPercentage / 100)

  const handleCalculate = async () => {
    if (hasUnassignedItems()) {
      alert('Please assign at least one person to each item.')
      return
    }

    setIsCalculating(true)

    try {
      const response = await fetch('http://localhost:8000/split-by-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          tax,
          tip: tipAmount,
          assignments: getEffectiveAssignments()
        })
      })

      if (!response.ok) throw new Error('Failed to calculate split')

      const result = await response.json()
      onComplete({ ...result, peopleNames })
    } catch (error) {
      console.error('Error calculating split:', error)
      alert('Error calculating split. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="item-split">
      <div className="split-header">
        <button onClick={onBack} className="back-btn">
          ←
        </button>
        <h2>Split by Item</h2>
      </div>

      <div className="people-setup">
        <div className="form-group">
          <label>Number of People:</label>
          <input
            type="number"
            value={peopleCount}
            onChange={(e) => setPeopleCount(parseInt(e.target.value) || 2)}
          />
        </div>

        <div className="form-group">
          <label>Tip Percentage:</label>
          <div className="tip-input-group">
            <input
              type="number"
              value={tipPercentage}
              onChange={(e) => setTipPercentage(parseFloat(e.target.value) || 0)}
              step="0.1"
            />
            <span className="percentage-symbol">%</span>
          </div>
        </div>
      </div>

      <div className="people-names">
        {peopleNames.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => updatePersonName(index, e.target.value)}
            placeholder={`Person ${index + 1}`}
            className="person-name"
          />
        ))}
      </div>

      <div className="assignment-grid">
        <table className="assignment-table">
          <thead>
            <tr>
              <th className="expand-col"></th>
              <th>Item</th>
              <th>Price</th>
              {peopleNames.map((name, index) => (
                <th key={index}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, itemIndex) => (
              <>
                <tr key={itemIndex} className={hasUnassignedItems() && !assignments[itemIndex]?.some(a => a) ? 'unassigned' : ''}>
                  <td className="expand-col">
                    {item.quantity > 1 && (
                      <button
                        className="expand-btn"
                        onClick={() => toggleExpanded(itemIndex)}
                      >
                        {expandedItems.has(itemIndex) ? '−' : '+'}
                      </button>
                    )}
                  </td>
                  <td>{item.name}{item.quantity > 1 && ` (${item.quantity})`}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  {peopleNames.map((_, personIndex) => (
                    <td key={personIndex}>
                      <button
                        className={`assignment-btn ${assignments[itemIndex]?.[personIndex] ? 'assigned' : ''} ${expandedItems.has(itemIndex) ? 'disabled' : ''}`}
                        onClick={() => !expandedItems.has(itemIndex) && toggleAssignment(itemIndex, personIndex)}
                        disabled={expandedItems.has(itemIndex)}
                      >
                        {assignments[itemIndex]?.[personIndex] ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                </tr>
                {item.quantity > 1 && expandedItems.has(itemIndex) && (
                  [...Array(item.quantity)].map((_, subIndex) => (
                    <tr key={`${itemIndex}-${subIndex}`} className="sub-item">
                      <td className="expand-col"></td>
                      <td className="sub-item-name">
                        └ {item.name} #{subIndex + 1}
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      {peopleNames.map((_, personIndex) => (
                        <td key={personIndex}>
                          <button
                            className={`assignment-btn ${subItemAssignments[`${itemIndex}-${subIndex}`]?.[personIndex] ? 'assigned' : ''}`}
                            onClick={() => toggleSubItemAssignment(itemIndex, subIndex, personIndex)}
                          >
                            {subItemAssignments[`${itemIndex}-${subIndex}`]?.[personIndex] ? '✓' : ''}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {hasUnassignedItems() && (
        <div className="warning">
          ⚠️ Please assign at least one person to each item
        </div>
      )}

      <button
        onClick={handleCalculate}
        disabled={isCalculating || hasUnassignedItems()}
        className="calculate-btn"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Split'}
      </button>
    </div>
  )
}

export default ItemSplit