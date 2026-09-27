import mongoose from 'mongoose'

// Turn any `$`-operator objects in query filters into plain values (NoSQL injection guard)
mongoose.set('sanitizeFilter', true)
mongoose.set('strictQuery', true)

export async function connectDB(uri) {
  await mongoose.connect(uri)
  console.log(`MongoDB connected: ${mongoose.connection.host}`)
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
