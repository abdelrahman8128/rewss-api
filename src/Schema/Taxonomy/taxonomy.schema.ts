import { Schema, model, Types } from 'mongoose';

export type EntityType = 'brand' | 'model' | 'category' | 'mall' | 'part';

export interface Taxonomy {
  _id: Types.ObjectId;
  entityType: EntityType;
  code: string;               // ثابت عالميًا (unique) مثل 'toyota', 'corolla', 'sedan'
  parentId?: Types.ObjectId;  // هرمي: model تحت brand، subcategory تحت category
  isActive: boolean;
  // مساحة لحقول غير لغوية (flags, externalIds...):
  meta?: Record<string, unknown>;
}

const TaxonomySchema = new Schema<Taxonomy>({
  entityType: { type: String, required: true, enum: ['brand','model','category','mall','part'], index: true },
  code: { type: String, required: true, unique: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Taxonomy' },
  isActive: { type: Boolean, default: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

TaxonomySchema.index({ entityType: 1, code: 1 });

export const TaxonomyModel = model<Taxonomy>('Taxonomy', TaxonomySchema);
