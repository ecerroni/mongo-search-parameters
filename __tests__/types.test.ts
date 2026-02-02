import { FilterOperators, SearchParameters } from '../src'

describe('Types Export', () => {
  it('should allow usage of FilterOperators type', () => {
    const op: FilterOperators = 'gt'
    expect(op).toBe('gt')
  })

  it('should allow usage of SearchParameters type', () => {
    interface MyDoc {
      name: string
      age: number
    }

    const params: SearchParameters<MyDoc> = {
      name: 'John',
      age_gt: 20,
    }

    expect(params.name).toBe('John')
    expect(params.age_gt).toBe(20)
  })
})
