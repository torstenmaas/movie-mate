import { randomBytes } from 'crypto'

function gen(size = 32) {
  return randomBytes(size).toString('base64url')
}

const access = gen(32)
const refresh = gen(32)

// Output with labels
console.log('Generated JWT secrets:')
console.log(`- ACCESS (JWT_SECRET):        ${access}`)
console.log(`- REFRESH (JWT_REFRESH_SECRET): ${refresh}`)
