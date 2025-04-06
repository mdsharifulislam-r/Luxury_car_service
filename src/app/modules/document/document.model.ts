import { model, Schema } from "mongoose";
import { DocumentModel, IDocument } from "./document.interface";

const documentSchema = new Schema<IDocument,DocumentModel>({
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    id_card: {
        front_side: { type: String },
        back_side: { type: String }
    },
    driving_license: {
        front_side: { type: String },
        back_side: { type: String }
    },
    vehicle_registration: {
        front_side: { type: String },
        back_side: { type: String }
    }
})

export const Documents = model<IDocument,DocumentModel>('Document',documentSchema)