import { Model, Types } from "mongoose"

export type IDocument = {
    user_id:Types.ObjectId;
    id_card:{
        front_side:string;
        back_side:string;
    },
    driving_license:{
        front_side:string;
        back_side:string;
    },
    vehicle_registration:{
        front_side:string;
        back_side:string;
    }

}

export type DocumentModel = Model<IDocument>