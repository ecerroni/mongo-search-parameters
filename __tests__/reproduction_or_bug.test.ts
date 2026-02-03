import mongoose, { Document, Schema } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server-core'
import mapMongoOperators from '../src'

jest.setTimeout(60000)

let mongoServer: any
let TestModel: any

interface ITestDoc extends Document {
  name: string
  status: string
  count: number
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)

  const TestSchema = new Schema({
    name: String,
    status: String,
    count: Number,
  })

  TestModel = mongoose.model<ITestDoc>('TestRepro', TestSchema)

  await TestModel.insertMany([
    { name: 'A', status: 'active', count: 10 },
    { name: 'B', status: 'inactive', count: 5 },
    { name: 'C', status: 'active', count: 20 },
    { name: 'D', status: 'deleted', count: 0 },
  ])
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

test('Reproduction: OR operator with array where should NOT return all docs', async () => {
  // Scenario: where is an array, which should be treated as OR
  // If the bug exists, this might be ignored or handled incorrectly, returning all docs
  // The goal is to filter for (status implies 'active') OR (count > 15)
  // Matching: A (active), C (active), C (count > 15). D is deleted, B is inactive count 5.
  // Wait, let's make it clearer.
  // We want to find docs where name is 'A' OR name is 'B'.
  // Should match A and B.

  const result = await mapMongoOperators<ITestDoc>(TestModel, {
    where: [{ name: 'A' }, { name: 'B' }] as any,
  })

  const names = result.map((d: any) => d.name).sort()
  expect(names).toEqual(['A', 'B'])
  expect(result.length).toBe(2)
})

test('Reproduction: Root level OR with array should work and not return all docs', async () => {
  // This was reported as potentially problematic if recursive sanitization fails or if params are dropped incorrectly
  const result = await mapMongoOperators<ITestDoc>(TestModel, {
    OR: [{ name: 'C' } as any, { status: 'deleted' } as any],
  } as any)

  const names = result.map((d: any) => d.name).sort()
  expect(names).toEqual(['C', 'D'])
  expect(result.length).toBe(2)
})

test('Reproduction: OR with invalid field should be sanitized and NOT return all docs', async () => {
  // Scenario: An invalid field inside an OR/array condition.
  // Mongoose "strict" mode usually strips this, resulting in an empty object {}.
  // Without the fix, {} inside an $or matches ALL documents.
  // With the fix, the empty object should be removed from the $or array.

  const result = await mapMongoOperators<ITestDoc>(TestModel, {
    where: [
      { name: 'A' },
      { invalid_field_that_does_not_exist: 'bad_value' }, // This should be stripped
    ] as any,
  })

  // Should continue to match 'A'.
  // If the bug exists, the second condition becomes {} and it returns valid docs + invalid docs (ALL of them)
  const names = result.map((d: any) => d.name).sort()
  expect(names).toEqual(['A'])
  expect(result.length).toBe(1)
})
