<!-- [![Build Status](https://img.shields.io/travis/ecerroni/mongo-search-parameters/master.svg?style=flat-square)](https://travis-ci.org/ecerroni/mongo-search-parameters) [![Coverage Status](https://img.shields.io/codecov/c/github/ecerroni/mongo-search-parameters/master.svg?style=flat-square)](https://codecov.io/gh/ecerroni/mongo-search-parameters/branch/master)[![npm version](https://badge.fury.io/js/mongo-search-parameters.svg)](https://www.npmjs.com/package/mongo-search-parameters) -->

# Mongo Search parameters

Utility function that maps a JSON object to mongoose operators, works with node 10.

This is useful for forwarding graphql request params to either the mongoose model or the mongodb collection. Similar to how Prisma and Strapi work.

You pass the collection and the search parameters and get the back the expected result using for example

```js
    const result = await useSearchParams(Test, {
      where: {
        title_contains: "lore",
      }
    });
    res.send(result);
```

## Install
```
npm i mongo-search-parameters
```

OR

```
yarn add mongo-search-parameters
```

## Demo
- Mongoose: https://glitch.com/~mongo-search-parameters-plain
- Apollo Graphql + Mongoose: https://glitch.com/~mongo-search-parameters-with-apollo-server

## Usage

```js
import useSearchParams from 'mongo-search-parameters';
import { mongooseModels } from 'path-to-your-mongoose-models';

const { User } = mongoModels;

// where (object): Define the operators to apply in the query.
const params = { // all fields are optional
  where: {
    name_contains: 'Test',
    age_gt: 21      
  },
  sort: 'name:desc', // it does accept also an array like ['name:desc', 'age:asc']
  limit: 10
}
// the above query will find all users which names contain (case insensitive) 'Test' and age is greater than 21, sort them by name from Z to A, limit them to just 10 rows if more are returned

export default async () => {
    const categories = await useSearchParams(User, { ...params });
    return categories
}

```

All mongo and mongoose chain methods and options are still allowed.
For example for:
- mongoose you can do `await useSearchParams(User, { ...params }, { age: 1 }).lean()`
- mongo you can do `await useSearchParams(User, { ...params }, { projection: { age: 1 } }).toArray()`

## Supported operators
- [x] where | ne
- [x] where | gt
- [x] where | gte
- [x] where | lt
- [x] where | lte
- [x] where | in
- [x] where | nin
- [x] where | contains
- [x] where | containss
- [x] where | matches
- [x] where | matchess
- [x] where | containsIndex
- [x] where | containssIndex
- [x] where | matchesIndex
- [x] where | matchessIndex
- [x] limit
- [x] start
- [x] sort

### contains
`name_contains: 'Mark Twain'`: the field name in the db is a string and contains the substring 'Mark Twain'. Mark twain, mark twain, mark Twain, etc. would be returned. It is case insentitive

### containsIndex
`name_containsIndex: 'Mark Twain'`: like `name_contains` but uses indexes. Do not forget to set a text index on the field `name` and that the MongoDB version you use supports text indexes as well

### containss
`name_contains: 'Mark'`: the field name in the db is a string and contains the substring 'Mark Twain'. Mark Twain, would be returned while mark Twain will not. It is case sensitive

### containssIndex
`name_containssIndex: 'Mark Twain'`: like `name_containss` but uses indexes. Do not forget to set a text index on the field `name` and that the MongoDB version you use supports text indexes as well

### matches
`name_matches: 'Mark Sculby'`: the field name in the db is a string and matches the substring 'Mark' OR the substring 'Sculby'. Mark Johnson, Vincent Skulby, etc. would be returned. It is case insentitive

### matchesIndex
`name_matchesIndex: 'Mark Twain'`: like `name_matches` but uses indexes. Do not forget to set a text index on the field `name` and that the MongoDB version you use supports text indexes as well

### matchess
`name_matchess: 'Mark Sculby'`: the field name in the db is a string and matches the substring 'Mark' OR the substring 'Sculby'. Mark Johnson, Vincent Skulby, etc. would be returned while mark Johnson would not. It is case sentitive

### matchessIndex
`name_matchessIndex: 'Mark Twain'`: like `name_matchess` but uses indexes. Do not forget to set a text index on the field `name` and that the MongoDB version you use supports text indexes as well

### ne
`age_ne: 21`: the field age does not equal to 21. Can be used with any field type.

### gt
`age_gt: 21`: greater than

### gte
`age_gte: 21`: greater than or equal to

### lt
`age_lt: 21`: less than

### lte
`age_lte: 21`: greater than or equal to

### in
`age_in: [21, 26, 27, 28, 21]`: true if field is contained in the array of values supplied. Accepts also single value like `age_in: 21`

### nin
`age_nin: [21]`: true if field is NOT contained in the array of values supplied

## TODO
- [x] Add mongodb client compatibility
- [x] Add demo
- [x] Refine search and explain different behaviors
- [x] Allow to search using text indexes
- [ ] Implement OR operator