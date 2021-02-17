import { MongoMemoryServer } from 'mongodb-memory-server-core'
import mapMongoOperators from '../src'
import { docs, docsMultiSort, operators } from './fixtures'

const MongoClient = require('mongodb').MongoClient

jest.setTimeout(60000)

let mongoServer
let db
let client
let Test, TestMultiSort

beforeAll(async () => {
  mongoServer = new MongoMemoryServer({
    binary: {
      version: '4.0.3',
      downloadDir: './__tests__/mongo-bin'
    }
  })
  const mongoUri = await mongoServer.getConnectionString()
  client = await MongoClient.connect(mongoUri)
  db = client.db('test')

  Test = await db.createCollection('Test', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            bsonType: 'string'
          },
          age: {
            bsonType: 'number'
          },
          description: {
            bsonType: 'string'
          }
        }
      }
    }
  })
  Test.insertMany([...docs])
  await Test.ensureIndex({ description: 'text' })
  TestMultiSort = await db.createCollection('TestMultiSort', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            bsonType: 'string'
          },
          age: {
            bsonType: 'number'
          },
          description: {
            bsonType: 'string'
          }
        }
      }
    }
  })
  await TestMultiSort.insertMany([...docsMultiSort])
})

beforeEach(async () => {})

afterEach(async () => {})

afterAll(async () => {
  client.close()
  await mongoServer.stop()
})

test('It should have mongo started', async () => {
  expect(client.isConnected()).toBe(true)
})

test('It should be able to query', async () => {
  const result = await Test.find({}).toArray()
  expect(result).toHaveLength(docs.length)
})

test('It should apply containss modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.containss
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].name).toBe('Lore')
})

test('It should apply matches modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.matches
  }).toArray()
  expect(result).toHaveLength(3)
  expect(result[0].name).toBe('lore')
  expect(result[1].name).toBe('ipsum')
})

test('It should apply matchess modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.matchess
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].name).toBe('ipsum')
  expect(result[1].name).toBe('Lore')
})

test('It should apply contains modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.contains
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].name).toBe('lore')
})

test('It should apply containsIndex modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.containsIndex
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].description).toEqual(
    expect.stringContaining(docs[1].description)
  )
})

test('It should apply containssIndex modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.containssIndex
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].description).toEqual(
    expect.stringMatching(docs[0].description)
  )
})

test('It should apply matchessIndex modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.matchessIndex
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].description).toEqual(
    expect.stringContaining(docs[1].description)
  )
})

test('It should apply matches modifier', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.matches
  }).toArray()
  expect(result).toHaveLength(3)
  expect(result[0].name).toBe('lore')
  expect(result[1].name).toBe('ipsum')
})

test('It should apply gt modifier', async () => {
  const result = await mapMongoOperators(Test, { ...operators.gt }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].age).toBe(6)
})

test('It should apply where on field with no modifiers', async () => {
  const result = await mapMongoOperators(Test, { ...operators.field }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].field).toBe(3)
})

test('It should apply limit operator', async () => {
  const result = await mapMongoOperators(Test, { limit: 2 }).toArray()
  expect(result).toHaveLength(2)
})

test('It should apply sort ASC and limit operator', async () => {
  const result = await mapMongoOperators(Test, {
    limit: 2,
    sort: 'field:asc'
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(1)
  expect(result[1].field).toBe(2)
})

test('It should apply sort DESC and limit operator', async () => {
  const result = await mapMongoOperators(Test, {
    limit: 2,
    sort: 'field:desc'
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(3)
  expect(result[1].field).toBe(2)
})

test('It should apply sort ASC with array of values and limit operator', async () => {
  const result = await mapMongoOperators(TestMultiSort, {
    limit: 2,
    sort: ['field:asc', 'age:desc']
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(1)
  expect(result[1].field).toBe(1)
  expect(result[0].age).toBe(6)
  expect(result[1].age).toBe(5)
})

test('It should apply sort DESC with array of values', async () => {
  const result = await mapMongoOperators(TestMultiSort, {
    sort: ['field:desc', 'age:asc']
  }).toArray()
  expect(result).toHaveLength(docsMultiSort.length)
  expect(result[0].field).toBe(2)
  expect(result[1].field).toBe(1)
  expect(result[0].age).toBe(6)
  expect(result[1].age).toBe(4)
})

test('It should apply sort DESC with array of values and limit operator', async () => {
  const result = await mapMongoOperators(TestMultiSort, {
    limit: 2,
    sort: ['field:desc', 'age:asc']
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(2)
  expect(result[1].field).toBe(1)
  expect(result[0].age).toBe(6)
  expect(result[1].age).toBe(4)
})

test('It should apply more than one modifier in where', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.contains_gte
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].age).toBe(4)
  expect(result[1].age).toBe(6)
  expect(result[0].constructor.name).toBe('Object')
})

test('It should return just one field per row with projection', async () => {
  const result = await mapMongoOperators(
    Test,
    {
      ...operators.contains_gte
    },
    { projection: { age: 1 } }
  ).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].age).toBe(4)
  expect(result[1].age).toBe(6)
  expect(result[0].field).toBe(undefined)
  expect(result[0].name).toBe(undefined)
})

test('It should return what is included in where condition', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.age_in
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].age).toBe(4)
  expect(result[1].age).toBe(5)
})

test('It should return what is NOT included in where condition', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.age_nin
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].age).toBe(6)
})

test('It should return what is included in where condition even if single value', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.age_in_single
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].age).toBe(4)
})

test('It should apply params outside of where', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.standard
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].field).toBe(1)
})

test('It should apply both params outside of where and where', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.mixed
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].field).toBe(3)
})

test('It should apply both params outside of where and where giving where priority', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.mixedPrecedence
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].field).toBe(3)
})

test('It should apply native conditional $or operator', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.conditional.or
  }).toArray()
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(1)
  expect(result[1].field).toBe(3)
})

test('It should apply native conditional $and operator', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.conditional.and
  }).toArray()
  expect(result).toHaveLength(1)
  expect(result[0].field).toBe(1)
  expect(result[0].age).toBe(4)
})
