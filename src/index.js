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
  contains: ({ key, value }) => {
    const words = value.split(' ')
    let params = {}
    words.forEach(word => {
      params = { ...params, [key]: { $regex: `${word}`, $options: 'i' } }
    })
    return params
  },
  containss: ({ key, value }) => {
    const words = value.split(' ')
    let params = {}
    words.forEach(word => {
      params = { ...params, [key]: { $regex: `${word}` } }
    })
    return params
  }
}

const filterOperatorsValues = Object.keys(filterOperators)

export default (Collection, args, projections) => {
  const isMongoose = typeof Collection === 'function'
  const { sort, limit, start, where = {} } = args || {}
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
  // Sanitize input discarding all params that have no corresponding field in the schema [Only for mongoose]!
  const validFieldNames = isMongoose
    ? Object.keys(Collection.schema.tree)
    : [...Object.keys(params)]
  params = Object.keys(params).reduce((o, k) => {
    if (validFieldNames.includes(k)) {
      return { ...o, [k]: params[k] }
    }
    return { ...o }
  }, {})
  if (sort) {
    const sorting = sort.split(':')
    if (!isMongoose) {
      sorting[1] = sorting[1] === 'asc' ? 1 : -1
    }
    if (start) {
      if (limit && limit > -1) {
        return Collection.find({ ...params, ...enhancedParams }, projections)
          .sort({ [sorting[0]]: sorting[1] })
          .skip(start)
          .limit(limit)
      }
      return Collection.find({ ...params, ...enhancedParams }, projections)
        .sort({ [sorting[0]]: sorting[1] })
        .skip(start)
    }
    if (limit && limit > -1) {
      return Collection.find({ ...params, ...enhancedParams }, projections)
        .sort({ [sorting[0]]: sorting[1] })
        .limit(limit)
    }
    return Collection.find({ ...params, ...enhancedParams }, projections).sort({
      [sorting[0]]: sorting[1]
    })
  }

  if (start) {
    if (limit && limit > -1) {
      return Collection.find({ ...params, ...enhancedParams }, projections)
        .skip(start)
        .limit(limit)
    }
    return Collection.find({ ...params, ...enhancedParams }, projections).skip(
      start
    )
  }

  if (limit && limit > -1) {
    return Collection.find({ ...params, ...enhancedParams }, projections).limit(
      limit
    )
  }
  return Collection.find({ ...params, ...enhancedParams }, projections)
}
