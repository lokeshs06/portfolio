// Usage: npm run hash-password
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH. The password itself is never stored.
import bcrypt from 'bcryptjs'
import readline from 'node:readline/promises'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const password = process.argv[2] ?? (await rl.question('Admin password (min 10 characters): '))
rl.close()

if (!password || password.length < 10) {
  console.error('Use at least 10 characters.')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log('\nADMIN_PASSWORD_HASH=' + hash)
console.log('\nIn a .env file, wrap it in single quotes because it contains $ signs.')
