import { Document, Schema, model } from 'mongoose';


export interface IBrandTranslation extends Document {
    brandId: string; // Reference to the brand
    lang: string; // Language code (e.g., 'en', 'ar')
    displayName: string; // Translated display name
    createdAt: Date;
    updatedAt: Date;
}

const BrandTranslationSchema = new Schema({
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
        index: true,
    },
    lang: { type: String, index: true, required: true },  // ar | en | ...
    displayName: { type: String, required: true },
    
    },
    {
         timestamps: true 
    }
);
  
BrandTranslationSchema.index({ brandId: 1, lang: 1 }, { unique: true });
BrandTranslationSchema.index({ lang: 1, displayName: 1 }, { unique: true });
BrandTranslationSchema.index({ lang: 1, slug: 1 }, { unique: true });



export default model<IBrandTranslation>('BrandTranslation', BrandTranslationSchema);
