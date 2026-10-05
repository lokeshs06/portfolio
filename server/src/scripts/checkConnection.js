import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

async function check() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in .env')
    process.exit(1)
  }

  console.log('Testing URI:', uri.replace(/:([^@:]+)@/, ':****@'))
  
  const startTime = Date.now()
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    const connectTime = Date.now() - startTime
    console.log(`[STATUS] Successfully connected in ${connectTime}ms`)
    console.log(`[HOST] ${mongoose.connection.host}`)
    console.log(`[TARGET_DB] ${mongoose.connection.name}`)

    const adminDb = mongoose.connection.db.admin()
    const ping = await adminDb.ping()
    console.log(`[PING] OK: ${ping.ok}`)

    const serverStatus = await adminDb.serverStatus()
    console.log(`[VERSION] MongoDB Atlas ${serverStatus.version}`)

    const dbs = await adminDb.listDatabases()
    console.log('[DATABASES]', dbs.databases.map(d => `${d.name} (${(d.sizeOnDisk / 1024).toFixed(1)} KB)`).join(', '))

    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(`[COLLECTIONS in '${mongoose.connection.name}']`, collections.map(c => c.name).join(', ') || '(empty)')

    // Quick write/read/delete test to verify permissions
    const testCol = mongoose.connection.db.collection('__atlas_conn_test__')
    await testCol.insertOne({ test: true, timestamp: new Date() })
    await testCol.findOne({ test: true })
    await testCol.drop()
    console.log('[PERMISSIONS] Read & Write access: Verified successfully')

    await mongoose.disconnect()
    console.log('[RESULT] All checks passed cleanly!')
  } catch (err) {
    console.error('[ERROR] MongoDB Atlas check failed:', err.message)
    if (err.cause) console.error('[CAUSE]', err.cause)
    process.exit(1)
  }
}

check()
