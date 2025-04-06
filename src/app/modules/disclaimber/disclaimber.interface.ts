import e from "cors";
import { DISCLAIMBER_TYPE } from "../../../enums/disclamberType";
import { Model } from "mongoose";

export type IDisclamber = {
    content:string;
    type:DISCLAIMBER_TYPE;
}

export type DislclamberModel = Model<IDisclamber>