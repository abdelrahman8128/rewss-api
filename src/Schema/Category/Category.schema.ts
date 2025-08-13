import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index:true,
        },
               
      
    },
    {
        timestamps: true,
        
    }
);


export default model<ICategory>('Category', CategorySchema);