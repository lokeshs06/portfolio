import mongoose from 'mongoose'

export const VISUALS = ['none', 'architecture', 'order-tracker']

const metricSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true, maxlength: 20 },
    label: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { _id: false },
)

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    subtitle: { type: String, trim: true, maxlength: 120, default: '' },
    category: { type: String, required: true, trim: true, maxlength: 30 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    period: { type: String, trim: true, maxlength: 40, default: '' },
    stack: { type: [String], default: [] },
    repoUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    highlights: { type: [String], default: [] },
    metrics: { type: [metricSchema], default: [] },
    visual: { type: String, enum: VISUALS, default: 'none' },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        return ret
      },
    },
  },
)

projectSchema.index({ visible: 1, featured: -1, order: 1 })

export const Project = mongoose.model('Project', projectSchema)
