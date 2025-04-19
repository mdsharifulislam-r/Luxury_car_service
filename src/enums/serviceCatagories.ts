import { Category } from "../app/modules/category/category.model";

export enum SERVICE_CATEGORY{
    BESPOKE_CONCIERGE_SERVICES="BESPOKE_CONCIERGE_SERVICES",
    PRIVATE_DRIVERS = "PRIVATE_DRIVERS",
    SECURITY_PERSONAL_MANAGEMENT= "SECURITY_PERSONAL_MANAGEMENT"
}

export const  getCategorysEnumFromDB = async () =>{
    const categorys = await Category.find({status:"active"}).lean();
    const categorysEnum = categorys.map((category: any) => category.enum);
 return categorysEnum;
   
    

}