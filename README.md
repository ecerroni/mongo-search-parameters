<!-- [![Build Status](https://img.shields.io/travis/ecerroni/mongo-search-parameters/master.svg?style=flat-square)](https://travis-ci.org/ecerroni/mongo-search-parameters) [![Coverage Status](https://img.shields.io/codecov/c/github/ecerroni/mongo-search-parameters/master.svg?style=flat-square)](https://codecov.io/gh/ecerroni/mongo-search-parameters/branch/master)[![npm version](https://badge.fury.io/js/mongo-search-parameters.svg)](https://www.npmjs.com/package/mongo-search-parameters) -->

# Mongo Search parameters

Utility function that maps a JSON object to mongoose operators, works with node 10.

This is useful for forwarding graphql request params to the mongoose model. Similar to how Prisma and Strapi work.

You pass the search parameters and get the back the expected result using for example

```js
    const result = await Test.find({
      where: {
        title_contains: "lore"
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
Mongoose: https://codesandbox.io/s/mongo-search-parameters-mongoose-u2q5i
Apollo Graphql + Mongoose: https://codesandbox.io/s/mongo-search-params-apollo-i8hr5

## Usage

```js
import applySearchParams from 'mongo-search-parameters';
import { mongooseModels } from 'path-to-your-mongoose-models';

const { User } = mongoModels;

// where (object): Define the operators to apply in the query.
const params = { // all fields are optional
  where: {
    name_contains: 'Test',
    age_gt: 21      
  },
  sort: 'name:desc',
  limit: 10
}
// the above query will find all users which names contain (case insensitive) 'Test' and age is greater than 21, sort them by name from Z to A, limit them to just 10 rows if more are returned

export default async () => {
    const categories = await applySearchParams(User, { ...params });
    return categories
}

```

All mongo and mongoose chain methods and options are still allowed.
For example for:
- mongoose you can do `await applySearchParams(User, { ...params }, { age: 1 }).lean()`
- mongo you can do `await applySearchParams(User, { ...params }, { projection: { age: 1 } }).toArray()`

## Supported operators
- [x] where | ne
- [x] where | gt
- [x] where | gte
- [x] where | lt
- [x] where | lte
- [x] where | in
- [x] where | contains
- [x] where | containss
- [x] where | matches
- [x] where | matchess
- [x] limit
- [x] start
- [x] sort

### contains
`name_contains: 'Mark Twain'`: the field name in the db is a string and contains the substring 'Mark Twain'. Mark twain, mark twain, mark Twain, etc. would be returned. It is case insentitive

### containss
`name_contains: 'Mark'`: the field name in the db is a string and contains the substring 'Mark Twain'. Mark Twain, would be returned while mark Twain will not. It is case sensitive

### matches
`name_matches: 'Mark Sculby'`: the field name in the db is a string and matches the substring 'Mark' OR the substring 'Sculby'. Mark Johnson, Vincent Skulby, etc. would be returned. It is case insentitive

### matchess
`name_matchess: 'Mark Sculby'`: the field name in the db is a string and matches the substring 'Mark' OR the substring 'Sculby'. Mark Johnson, Vincent Skulby, etc. would be returned while mark Johnson would not. It is case sentitive

## ne
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
`age_in: [21, 26, 27, 28, 21]`: true if field is contained in the array of values supplied

## TODO
- [x] Add mongodb client compatibility
- [x] Add demo
- [x] Refine search and explain different behaviors
- [ ] Use search indexes when available