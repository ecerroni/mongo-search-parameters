export const operators = {
  standard: {
    field: 1,
    age: 4
  },
  mixed: {
    field: { $in: [1, 3] },
    where: { age_gte: 6 }
  },
  mixedPrecedence: {
    field: 2,
    where: { field: 3, age_gte: 6 }
  },
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
  containsIndex: {
    where: {
      description_containsIndex: 'aenean imperdiet'
    }
  },
  containssIndex: {
    where: {
      description_containssIndex: 'Donec quam felis'
    }
  },
  matches: {
    where: {
      name_matches: 'lore ipsum'
    }
  },
  matchess: {
    where: {
      name_matchess: 'Lore ipsum'
    }
  },

  matchesIndex: {
    where: {
      description_matchesIndex: 'aenean imperdiet'
    }
  },
  matchessIndex: {
    where: {
      description_matchessIndex: 'Lore ipsum'
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
  },
  age_in: {
    where: {
      age_in: [4, 5]
    }
  },
  age_nin: {
    where: {
      age_nin: [4, 5]
    }
  },
  age_in_single: {
    where: {
      age_in: 4
    }
  },
  conditional: {
    $or: [
      { field: 1 },
      { field: 3 },
    ]
  }
}

export const docs = [
  {
    field: 1,
    name: 'lore',
    age: 4,
    description:
      'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.'
  },
  {
    field: 2,
    name: 'ipsum',
    age: 5,
    description:
      'Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus.'
  },
  {
    field: 3,
    name: 'Lore',
    age: 6,
    description:
      ' Donec vitae sapien aenean ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo.'
  }
]

export const docsMultiSort = [
  {
    field: 1,
    name: 'lore',
    age: 4,
    description:
      'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.'
  },
  {
    field: 1,
    name: 'ipsum',
    age: 5,
    description:
      'Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus.'
  },
  {
    field: 1,
    name: 'Lore',
    age: 6,
    description:
      ' Donec vitae sapien aenean ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo.'
  },
  {
    field: 2,
    name: 'Lore',
    age: 6,
    description:
      ' Donec vitae sapien aenean ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo.'
  }
]
