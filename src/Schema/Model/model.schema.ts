import { model, Schema } from "mongoose";

export interface IModel {
  name: string;
  brand: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema = new Schema<IModel>(
  {
    name: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ModelSchema.index({ name: 1, brand: 1 }, { unique: true });

export default model<IModel>("Model", ModelSchema);
