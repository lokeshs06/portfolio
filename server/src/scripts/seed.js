// Seeds the projects collection from client/src/data.js.
//   npm run seed          -> only inserts if the collection is empty
//   npm run seed -- --reset -> deletes all projects first (careful: removes your admin edits)
import { env } from '../config/env.js'
import { connectDB, disconnectDB } from '../config/db.js'
import { Project } from '../models/Project.js'
import { projects } from '../../../client/src/data.js'

const reset = process.argv.includes('--reset')

await connectDB(env.MONGODB_URI)
try {
  if (reset) {
    const { deletedCount } = await Project.deleteMany({})
    console.log(`Removed ${deletedCount} projects`)
  }
  const existing = await Project.countDocuments()
  if (existing > 0) {
    console.log(`Collection already has ${existing} projects, nothing inserted. Use --reset to start over.`)
  } else {
    const docs = projects.map((p, i) => ({ ...p, order: i, visible: true }))
    await Project.insertMany(docs)
    console.log(`Inserted ${docs.length} projects`)
  }
} finally {
  await disconnectDB()
}
