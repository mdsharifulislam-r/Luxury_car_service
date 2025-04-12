import { DISCLAIMBER_TYPE } from "../../../enums/disclamberType";
import { IDisclamber } from "./disclaimber.interface";
import { Disclaimber } from "./disclaimber.model";

const createDisclaimberToDB = async (data:IDisclamber)=>{
    const exist = await Disclaimber.findOne({type:data.type})
    if(exist){
       return await Disclaimber.findOneAndUpdate({type:data.type},{
            ...data,
        })
    }
    const disclaimber = new Disclaimber(data);
    await disclaimber.save();
    return disclaimber;
}

const getDislaiberByTypes = async (type:DISCLAIMBER_TYPE)=>{
    const disclaimber = await Disclaimber.findOne({type}).lean();
    
    return disclaimber;
}

export const DisclaimberService = {
    createDisclaimberToDB,
    getDislaiberByTypes
}