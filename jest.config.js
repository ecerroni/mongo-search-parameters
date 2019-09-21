module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/scripts/testMock.js',
    '\\.(css|less)$': '<rootDir>/scripts/testMock.js'
  }
}
