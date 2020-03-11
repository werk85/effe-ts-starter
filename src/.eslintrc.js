const path = require('path')

module.exports = {
  extends: [
    'werk85/react'
  ],
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json')
  }
}
