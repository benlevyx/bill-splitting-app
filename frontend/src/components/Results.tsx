import type { SplitResult } from '../types'

interface ResultsProps {
  results: SplitResult
  splitType: 'equal' | 'item'
  onReset: () => void
  onBack: () => void
}

const Results = ({ results, splitType, onReset, onBack }: ResultsProps) => {
  return (
    <div className="results">
      <div className="results-header">
        <button onClick={onBack} className="back-btn">
          ←
        </button>
        <h2>Bill Split Results</h2>
      </div>
      
      {splitType === 'equal' ? (
        <div className="equal-results">
          <div className="result-summary">
            <div className="result-row">
              <span>Subtotal:</span>
              <span>${results.subtotal?.toFixed(2)}</span>
            </div>
            <div className="result-row">
              <span>Tax:</span>
              <span>${results.tax.toFixed(2)}</span>
            </div>
            <div className="result-row">
              <span>Tip:</span>
              <span>${results.tip.toFixed(2)}</span>
            </div>
            <div className="result-row total">
              <span>Total:</span>
              <span>${results.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="per-person-breakdown">
            <h3>Per Person Breakdown</h3>
            <div className="breakdown-item">
              <span>Share of bill:</span>
              <span>${((results.subtotal || 0) / (results.total / (results.per_person || 1))).toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span>Tax:</span>
              <span>${results.tax_per_person.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span>Tip:</span>
              <span>${results.tip_per_person.toFixed(2)}</span>
            </div>
            <div className="breakdown-item total">
              <span>Total per person:</span>
              <span>${results.per_person?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="item-results">
          <div className="person-breakdown">
            {results.person_totals?.map((total, index) => (
              <div key={index} className="person-result">
                <h3>Person {index + 1}</h3>
                <div className="person-details">
                  <div className="detail-row">
                    <span>Items:</span>
                    <span>${results.person_subtotals?.[index].toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Tax:</span>
                    <span>${results.tax_per_person.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Tip:</span>
                    <span>${results.tip_per_person.toFixed(2)}</span>
                  </div>
                  <div className="detail-row total">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grand-total">
            <strong>Grand Total: ${results.total.toFixed(2)}</strong>
          </div>
        </div>
      )}
      
      <button onClick={onReset} className="reset-btn">
        Split Another Bill
      </button>
    </div>
  )
}

export default Results