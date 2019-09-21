import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server-core'
import mapMongoOperators from '../src'

jest.setTimeout(60000)

let mongoServer
let Test

const operators = {
  field: {
    where: {
      field: 3
    }
  },
  contains: {
    where: {
      name_contains: 'lore'
    }
  },
  containss: {
    where: {
      name_containss: 'Lore'
    }
  },
  gt: {
    where: {
      age_gt: 5
    }
  },
  contains_gte: {
    where: {
      name_contains: 'lore',
      age_gte: 4
    }
  }
}

const docs = [
  {
    field: 1,
    name: 'lore',
    age: 4
  },
  {
    field: 2,
    name: 'ipsum',
    age: 5
  },
  {
    field: 3,
    name: 'Lore',
    age: 6
  }
]

beforeAll(async () => {
  mongoServer = new MongoMemoryServer({
    binary: {
      version: '4.0.3',
      downloadDir: './__tests__/mongo-bin'
    }
  })
  const mongoUri = await mongoServer.getConnectionString()
  await mongoose.connect(mongoUri, {}, err => {
    if (err) console.error(err)
  })
  Test = await mongoose.model(
    'Test',
    new mongoose.Schema({
      name: String,
      age: Number,
      field: Number
    })
  )
  await Test.insertMany([...docs])
})

beforeEach(async () => {})

afterEach(async () => {})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

test('It should have mongo started', async () => {
  expect(mongoose.connection.readyState).toBe(1)
})

test('It should be able to query', async () => {
  const result = await Test.find({}).lean()
  expect(result).toHaveLength(docs.length)
})

test('It should apply containss modifier', async () => {
  const result = await mapMongoOperators(Test, { ...operators.containss })
  expect(result).toHaveLength(1)
  expect(result[0].name).toBe('Lore')
  expect(result[0].constructor.name).toBe('model')
}),
  test('It should apply contains modifier', async () => {
    const result = await mapMongoOperators(Test, { ...operators.contains })
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('lore')
    expect(result[0].constructor.name).toBe('model')
  })

test('It should apply gt modifier', async () => {
  const result = await mapMongoOperators(Test, { ...operators.gt })
  expect(result).toHaveLength(1)
  expect(result[0].age).toBe(6)
  expect(result[0].constructor.name).toBe('model')
})

test('It should apply where on field with no modifiers', async () => {
  const result = await mapMongoOperators(Test, { ...operators.field })
  expect(result).toHaveLength(1)
  expect(result[0].field).toBe(3)
  expect(result[0].constructor.name).toBe('model')
})

test('It should apply limit operator', async () => {
  const result = await mapMongoOperators(Test, { limit: 2 })
  expect(result).toHaveLength(2)
  expect(result[0].constructor.name).toBe('model')
})

test('It should apply sort ASC and limit operator', async () => {
  const result = await mapMongoOperators(Test, { limit: 2, sort: 'field:asc' })
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(1)
  expect(result[1].field).toBe(2)
  expect(result[0].constructor.name).toBe('model')
})

test('It should apply sort DESC and limit operator', async () => {
  const result = await mapMongoOperators(Test, { limit: 2, sort: 'field:desc' })
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(3)
  expect(result[1].field).toBe(2)
  expect(result[0].constructor.name).toBe('model')
})

test('It should apply sort DESC and limit operator with lean', async () => {
  const result = await mapMongoOperators(Test, {
    limit: 2,
    sort: 'field:desc'
  }).lean()
  expect(result).toHaveLength(2)
  expect(result[0].field).toBe(3)
  expect(result[1].field).toBe(2)
  expect(result[0].constructor.name).toBe('Object')
})

test('It should apply more than one modifier in where', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.contains_gte
  })
  expect(result).toHaveLength(2)
  expect(result[0].age).toBe(4)
  expect(result[1].age).toBe(6)
  expect(result[0].constructor.name).toBe('model')
})
test('It should return just one field per row with select', async () => {
  const result = await mapMongoOperators(Test, {
    ...operators.contains_gte
  }).select('age')
  expect(result).toHaveLength(2)
  expect(result[0].age).toBe(4)
  expect(result[1].age).toBe(6)
  expect(result[0].field).toBe(undefined)
  expect(result[0].name).toBe(undefined)
  expect(result[0].constructor.name).toBe('model')
})

test('It should return just one field per row with { age: 1 }', async () => {
  const result = await mapMongoOperators(
    Test,
    {
      ...operators.contains_gte
    },
    { age: 1 }
  )
  expect(result).toHaveLength(2)
  expect(result[0].age).toBe(4)
  expect(result[1].age).toBe(6)
  expect(result[0].field).toBe(undefined)
  expect(result[0].name).toBe(undefined)
  expect(result[0].constructor.name).toBe('model')
})
