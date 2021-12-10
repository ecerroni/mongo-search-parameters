const filterOperators = {
  ne: ({ key, value }) => ({ [key]: { $ne: value } }),
  gt: ({ key, value }) => ({ [key]: { $gt: value } }),
  gte: ({ key, value }) => ({ [key]: { $gte: value } }),
  lt: ({ key, value }) => ({ [key]: { $lt: value } }),
  lte: ({ key, value }) => ({ [key]: { $lte: value } }),
  in: ({ key, value }) => {
    if (Array.isArray(value)) {
      return { [key]: { $in: [...value] } }
    }
    return { [key]: { $in: [value] } }
  },
  nin: ({ key, value }) => {
    if (Array.isArray(value)) {
      return { [key]: { $nin: [...value] } }
    }
    return { [key]: { $nin: [value] } }
  },
  contains: ({ key, value }) => {
    const params = {
      [key]: {
        $regex: `${value.trim().replace(/\s\s+/g, ' ')}`,
        $options: 'i'
      }
    }
    return params
  },
  containss: ({ key, value }) => {
    const params = {
      [key]: {
        $regex: `${value.trim().replace(/\s\s+/g, ' ')}`
      }
    }
    return params
  },
  containsIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`
          }
        },
        {
          [key]: {
            $regex: `${value.trim().replace(/\s\s+/g, ' ')}`,
            $options: 'i'
          }
        }
      ]
    }
    return params
  },
  containssIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`
          }
        },
        {
          [key]: {
            $regex: `${value.trim().replace(/\s\s+/g, ' ')}`
          }
        }
      ]
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
          .map(p => `\\b${p}`)
          .join('|')}`,
        $options: 'i'
      }
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
          .map(p => `\\b${p}`)
          .join('|')}`
      }
    }
    return params
  },
  matchesIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`
          }
        },
        {
          [key]: {
            $regex: `${value
              .trim()
              .replace(/\s\s+/g, ' ')
              .split(' ')
              .map(p => `\\b${p}`)
              .join('|')}`,
            $options: 'i'
          }
        }
      ]
    }
    return params
  },
  matchessIndex: ({ key, value }) => {
    const params = {
      $and: [
        {
          $text: {
            $search: `${value.trim().replace(/\s\s+/g, ' ')}`
          }
        },
        {
          [key]: {
            $regex: `${value
              .trim()
              .replace(/\s\s+/g, ' ')
              .split(' ')
              .map(p => `\\b${p}`)
              .join('|')}`
          }
        }
      ]
    }
    return params
  }
}

const filterOperatorsValues = Object.keys(filterOperators)

export default (Collection, args, projections) => {
  const isMongoose = typeof Collection === 'function'
  const { sort, limit, skip, where = {}, ...rest } = args || {}
  let enhancedParams = {}
  let params =
    where !== '' &&
    typeof where === 'object' &&
    !Array.isArray(where) &&
    where !== null
      ? Object.keys(where).reduce((obj, key) => {
          const value = where[key]
          let withOperator = key.split('_')
          if (withOperator[1] === 'id' && withOperator[2]) {
            withOperator = ['_id', withOperator[2]]
          }
          if (
            withOperator[1] &&
            filterOperatorsValues.includes(withOperator[1])
          ) {
            enhancedParams = {
              ...enhancedParams,
              ...filterOperators[withOperator[1]]({
                key: withOperator[0],
                value
              })
            }
            return { ...obj }
          }
          if (
            withOperator[1] &&
            !filterOperatorsValues.includes(withOperator[1])
          ) {
            return { ...obj, [key]: where[key] }
          }
          return { ...obj, [key]: where[key] }
        }, {})
      : {}
  params = { ...rest, ...params }
  // Sanitize input discarding all params that have no corresponding field in the schema [Only for mongoose]!
  const validFieldNames = isMongoose
    ? Object.keys(Collection.schema.tree)
    : [...Object.keys(params)]
  params = Object.keys(params).reduce((o, k) => {
    if (validFieldNames.includes(k) || (k && k.length && k[0] === '$')) {
      // dollar operators must be included
      return { ...o, [k]: params[k] }
    }
    return { ...o }
  }, {})
  if (sort) {
    const sorting = Array.isArray(sort)
      ? sort.reduce(
          (o, i) => ({
            ...o,
            [i.split(':')[0]]: i.split(':')[1] === 'asc' ? 1 : -1
          }),
          {}
        )
      : { [sort.split(':')[0]]: sort.split(':')[1] === 'asc' ? 1 : -1 }

    if (skip) {
      if (limit && limit > -1) {
        return Collection.find({ ...params, ...enhancedParams }, projections)
          .sort({ ...sorting })
          .skip(skip)
          .limit(limit)
      }
      return Collection.find({ ...params, ...enhancedParams }, projections)
        .sort({ ...sorting })
        .skip(skip)
    }
    if (limit && limit > -1) {
      return Collection.find({ ...params, ...enhancedParams }, projections)
        .sort({ ...sorting })
        .limit(limit)
    }
    return Collection.find({ ...params, ...enhancedParams }, projections).sort({
      ...sorting
    })
  }

  if (skip) {
    if (limit && limit > -1) {
      return Collection.find({ ...params, ...enhancedParams }, projections)
        .skip(skip)
        .limit(limit)
    }
    return Collection.find({ ...params, ...enhancedParams }, projections).skip(
      skip
    )
  }

  if (limit && limit > -1) {
    return Collection.find({ ...params, ...enhancedParams }, projections).limit(
      limit
    )
  }
  return Collection.find({ ...params, ...enhancedParams }, projections)
}
