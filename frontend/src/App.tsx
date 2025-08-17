import { useState } from 'react'
import BillInput from './components/BillInput'
import ItemsTable from './components/ItemsTable'
import SplitSelector from './components/SplitSelector'
import EqualSplit from './components/EqualSplit'
import ItemSplit from './components/ItemSplit'
import Results from './components/Results'
import type { BillItem, SplitResult } from './types'
import './App.css'

function App() {
  const [step, setStep] = useState<'input' | 'items' | 'split' | 'equal' | 'item' | 'results'>('input')
  const [items, setItems] = useState<BillItem[]>([])
  const [originalItems, setOriginalItems] = useState<BillItem[]>([])
  const [originalTax, setOriginalTax] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [tip, setTip] = useState<number>(0)
  const [peopleCount, setPeopleCount] = useState<number>(2)
  const [splitType, setSplitType] = useState<'equal' | 'item'>('equal')
  const [assignments, setAssignments] = useState<boolean[][]>([])
  const [results, setResults] = useState<SplitResult | null>(null)

  const handleBillParsed = (parsedItems: BillItem[], parsedTax?: number) => {
    setItems(parsedItems)
    setOriginalItems([...parsedItems])
    if (parsedTax) {
      setTax(parsedTax)
      setOriginalTax(parsedTax)
    }
    setStep('items')
  }

  const resetToOriginal = () => {
    setItems([...originalItems])
    setTax(originalTax)
  }

  const handleItemsConfirmed = () => {
    setStep('split')
  }

  const handleSplitTypeSelected = (type: 'equal' | 'item') => {
    setSplitType(type)
    setStep(type)
  }

  const handleSplitComplete = (result: SplitResult) => {
    setResults(result)
    setStep('results')
  }

  const goBack = () => {
    switch (step) {
      case 'items':
        setStep('input')
        break
      case 'split':
        setStep('items')
        break
      case 'equal':
      case 'item':
        setStep('split')
        break
      case 'results':
        setStep(splitType)
        break
      default:
        break
    }
  }

  const resetApp = () => {
    setStep('input')
    setItems([])
    setTax(0)
    setTip(0)
    setPeopleCount(2)
    setSplitType('equal')
    setAssignments([])
    setResults(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bill Splitter</h1>
      </header>
      
      <main className="app-main">
        {step === 'input' && (
          <BillInput onBillParsed={handleBillParsed} />
        )}
        
        {step === 'items' && (
          <ItemsTable 
            items={items}
            setItems={setItems}
            tax={tax}
            setTax={setTax}
            onConfirm={handleItemsConfirmed}
            onReset={resetToOriginal}
            onBack={goBack}
          />
        )}
        
        {step === 'split' && (
          <SplitSelector onSplitTypeSelected={handleSplitTypeSelected} onBack={goBack} />
        )}
        
        {step === 'equal' && (
          <EqualSplit
            items={items}
            tax={tax}
            peopleCount={peopleCount}
            setPeopleCount={setPeopleCount}
            onComplete={handleSplitComplete}
            onBack={goBack}
          />
        )}
        
        {step === 'item' && (
          <ItemSplit
            items={items}
            tax={tax}
            peopleCount={peopleCount}
            setPeopleCount={setPeopleCount}
            assignments={assignments}
            setAssignments={setAssignments}
            onComplete={handleSplitComplete}
            onBack={goBack}
          />
        )}
        
        {step === 'results' && results && (
          <Results results={results} splitType={splitType} onReset={resetApp} onBack={goBack} />
        )}
      </main>
    </div>
  )
}

export default App
