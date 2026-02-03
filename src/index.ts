import mongoose, { Document } from 'mongoose'

const validMongoDbIDRegex = new RegExp('^[0-9a-fA-F]{24}$')
const checkForValidMongoDbID = (id: string) => validMongoDbIDRegex.test(id)

const getSafeValue = (value: any): any => {
  if (typeof value === 'string' && checkForValidMongoDbID(value))
    return new mongoose.Types.ObjectId(value)

  if (typeof value === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime()) && date.getTime() > 0) {
      return date.toISOString()
    }
  }

  return value
}

interface FilterOperatorArgs {
  key: string
  value: any
}

const filterOperators: Record<string, (args: FilterOperatorArgs) => any> = {
  gt: ({ key, value }) => ({ [key]: { $gt: getSafeValue(value) } }),
  gte: ({ key, value }) => ({ [key]: { $gte: getSafeValue(value) } }),
  lt: ({ key, value }) => ({ [key]: { $lt: getSafeValue(value) } }),
  lte: ({ key, value }) => ({ [key]: { $lte: getSafeValue(value) } }),
  ir: ({ key, value }) => ({
    [key]: { $gt: getSafeValue(value[0]), $lt: getSafeValue(value[1]) },
  }),
  ire: ({ key, value }) => ({
    [key]: { $gte: getSafeValue(value[0]), $lte: getSafeValue(value[1]) },
  }),
  contains: ({ key, value }) => {
    const params = {
      [key]: {
        $regex: `${value.trim().replace(/\s\s+/g, ' ')}`,
        $options: 'i',
      },
    }
    return params
  },
  containss: ({ key, value }) => {
    const params = {
      [key]: {
        $regex: `${value.trim().replace(/\s\s+/g, ' ')}`,
      },
    }
    return params
  },
  in: ({ key, value }) => {
    if (Array.isArray(value)) {
      return {
        [key]: { $in: [...value.map((v: any) => getSafeValue(v))] },
      }
    }
    return { [key]: { $in: [getSafeValue(value)] } }
  },
  nin: ({ key, value }) => {
    if (Array.isArray(value)) {
      return { [key]: { $nin: [...value.map((v: any) => getSafeValue(v))] } }
    }
    return { [key]: { $nin: [getSafeValue(value)] } }
  },
  // [NOTE]: implement safe value for the following as well
  containsIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`,
          },
        },
        {
          [key]: {
            $regex: `${value.trim().replace(/\s\s+/g, ' ')}`,
            $options: 'i',
          },
        },
      ],
    }
    return params
  },
  containssIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`,
          },
        },
        {
          [key]: {
            $regex: `${value.trim().replace(/\s\s+/g, ' ')}`,
          },
        },
      ],
    }
    return params
  },
  matches: ({ key, value }) => {
    const params = {
      [key]: {
        $regex: `${value
          .trim()
          .replace(/\s\s+/g, ' ')
          .split(' ')
          .map((p: string) => `\\b${p}`)
          .join('|')}`,
        $options: 'i',
      },
    }
    return params
  },
  matchess: ({ key, value }) => {
    const params = {
      [key]: {
        $regex: `${value
          .trim()
          .replace(/\s\s+/g, ' ')
          .split(' ')
          .map((p: string) => `\\b${p}`)
          .join('|')}`,
      },
    }
    return params
  },
  matchesIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`,
          },
        },
        {
          [key]: {
            $regex: `${value
              .trim()
              .replace(/\s\s+/g, ' ')
              .split(' ')
              .map((p: string) => `\\b${p}`)
              .join('|')}`,
            $options: 'i',
          },
        },
      ],
    }
    return params
  },
  matchessIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`,
          },
        },
        {
          [key]: {
            $regex: `${value
              .trim()
              .replace(/\s\s+/g, ' ')
              .split(' ')
              .map((p: string) => `\\b${p}`)
              .join('|')}`,
          },
        },
      ],
    }
    return params
  },
  ne: ({ key, value }) => ({ [key]: { $ne: getSafeValue(value) } }),
}

const filterOperatorsValues = Object.keys(filterOperators)

export type FilterOperators =
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'ir'
  | 'ire'
  | 'contains'
  | 'containss'
  | 'in'
  | 'nin'
  | 'containsIndex'
  | 'containssIndex'
  | 'matches'
  | 'matchess'
  | 'matchesIndex'
  | 'matchessIndex'
  | 'ne'

export type SearchParameters<T> = {
  [K in keyof T]?: T[K]
} & {
  [K in keyof T as `${string & K}_${FilterOperators}`]?: any
} & {
  OR?: SearchParameters<T>[]
}

export interface MongoSearchOptions<T = any> {
  sort?: string | string[]
  limit?: number
  skip?: number
  where?: SearchParameters<T>
  OR?: SearchParameters<T>[]
  [key: string]: any
}

const buildMongoQuery = (where: any): Record<string, any> => {
  let enhancedParams: Record<string, any> = {}
  const params: Record<string, any> =
    where !== '' &&
    typeof where === 'object' &&
    !Array.isArray(where) &&
    where !== null
      ? Object.keys(where).reduce(
          (obj, key) => {
            if (key === 'OR' && Array.isArray((where as any)[key])) {
              const orConditions = (where as any)[key]
              enhancedParams = {
                ...enhancedParams,
                $or: orConditions.map((condition: any) =>
                  buildMongoQuery(condition),
                ),
              }
              return { ...obj }
            }
            const value = (where as any)[key]
            let withOperator = key.split('_')
            if (withOperator.length > 2) {
              // there are multiple underscores
              withOperator = [
                // get everything including underscores up to filter operator
                key.replace(`_${withOperator[withOperator.length - 1]}`, ''),
                // actual filter operator
                withOperator[withOperator.length - 1],
              ]
            }
            if (withOperator[1] === 'id' && withOperator[2]) {
              withOperator = ['_id', withOperator[2]]
            }
            if (
              withOperator[1] &&
              filterOperatorsValues.includes(withOperator[1])
            ) {
              const operatorResult = filterOperators[withOperator[1]]({
                key: withOperator[0],
                value,
              })
              // Merge operatorResult into enhancedParams
              Object.keys(operatorResult).forEach((rk) => {
                if (
                  typeof operatorResult[rk] === 'object' &&
                  operatorResult[rk] !== null &&
                  !Array.isArray(operatorResult[rk]) &&
                  enhancedParams[rk] &&
                  typeof enhancedParams[rk] === 'object' &&
                  !Array.isArray(enhancedParams[rk])
                ) {
                  enhancedParams[rk] = {
                    ...enhancedParams[rk],
                    ...operatorResult[rk],
                  }
                } else {
                  enhancedParams[rk] = operatorResult[rk]
                }
              })
              return { ...obj }
            }
            if (
              withOperator[1] &&
              !filterOperatorsValues.includes(withOperator[1])
            ) {
              return { ...obj, [key]: (where as any)[key] }
            }
            return { ...obj, [key]: (where as any)[key] }
          },
          {} as Record<string, any>,
        )
      : {}
  return { ...params, ...enhancedParams }
}

const sanitizeParams = (params: any, validFieldNames: string[] | null): any => {
  return Object.keys(params).reduce((o, k) => {
    if (k === '$or' && Array.isArray(params[k])) {
      // Recursively sanitize objects inside $or
      const cleanedOr = params[k]
        .map((cond: any) => sanitizeParams(cond, validFieldNames))
        .filter((cond: any) => Object.keys(cond).length > 0) // Remove empty objects

      if (cleanedOr.length > 0) {
        return { ...o, [k]: cleanedOr }
      }
      return { ...o }
    }
    if (
      !validFieldNames ||
      validFieldNames.includes(k) ||
      (k && k.length && k[0] === '$')
    ) {
      // dollar operators must be included
      return { ...o, [k]: params[k] }
    }
    return { ...o }
  }, {})
}

export default <T extends Document>(
  Collection: any,
  args: MongoSearchOptions<T>,
  projections?: any,
) => {
  const isMongoose = typeof Collection === 'function' && Collection.schema
  const { sort, limit, skip, where = {}, OR, ...rest } = args || {}

  // Support where as array -> treating it as OR
  let queryWhere = where
  let queryOR = OR

  if (Array.isArray(where)) {
    if (!queryOR) queryOR = []
    queryOR = [...queryOR, ...where]
    queryWhere = {}
  }

  let params = { ...rest, ...buildMongoQuery(queryWhere) }
  if (queryOR && Array.isArray(queryOR)) {
    params = { ...params, $or: queryOR.map((o) => buildMongoQuery(o)) }
  }

  // Sanitize input discarding all params that have no corresponding field in the schema [Only for mongoose]!
  const validFieldNames: string[] | null = isMongoose
    ? Object.keys(Collection.schema.tree)
    : null

  // Apply recursive sanitization
  params = sanitizeParams(params, validFieldNames)

  if (sort) {
    const sorting = Array.isArray(sort)
      ? sort.reduce(
          (o, i) => ({
            ...o,
            [i.split(':')[0]]: i.split(':')[1] === 'asc' ? 1 : -1,
          }),
          {} as Record<string, any>,
        )
      : { [sort.split(':')[0]]: sort.split(':')[1] === 'asc' ? 1 : -1 }

    if (skip) {
      if (limit && limit > -1) {
        return Collection.find({ ...params }, projections)
          .sort({ ...sorting })
          .skip(skip)
          .limit(limit)
      }
      return Collection.find({ ...params }, projections)
        .sort({ ...sorting })
        .skip(skip)
    }
    if (limit && limit > -1) {
      return Collection.find({ ...params }, projections)
        .sort({ ...sorting })
        .limit(limit)
    }
    return Collection.find({ ...params }, projections).sort({
      ...sorting,
    })
  }

  if (skip) {
    if (limit && limit > -1) {
      return Collection.find({ ...params }, projections)
        .skip(skip)
        .limit(limit)
    }
    return Collection.find({ ...params }, projections).skip(skip)
  }

  if (limit && limit > -1) {
    return Collection.find({ ...params }, projections).limit(limit)
  }
  return Collection.find({ ...params }, projections)
}
