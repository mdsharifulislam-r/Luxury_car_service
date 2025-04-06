import { model, Schema } from "mongoose";
import { DislclamberModel, IDisclamber } from "./disclaimber.interface";
import { DISCLAIMBER_TYPE } from "../../../enums/disclamberType";

const disclaimberSchema = new Schema<IDisclamber,DislclamberModel>({
    content: { type: String, required: true },
    type: { type: String, enum:Object.values(DISCLAIMBER_TYPE), required: true }
},{
    timestamps: true,
})

export const Disclaimber = model('Disclaimber',disclaimberSchema);