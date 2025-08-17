export interface BillItem {
  name: string
  price: number
  quantity: number
}

export interface SplitResult {
  subtotal?: number
  tax: number
  tip: number
  total: number
  per_person?: number
  tax_per_person: number
  tip_per_person: number
  person_subtotals?: number[]
  person_totals?: number[]
  peopleNames?: string[]
}