import { handleSubscribeDeleted } from "../../../hendlers/handleSubScribtionDeleted"
import { User } from "../user/user.model"
import { Subscription } from "./subscription.model"

const expireUserSubcription = async ()=>{
  const subscriptions = await Subscription.find({ currentPeriodEnd: {$lt: new Date()},status:"active" })
  if(subscriptions.length){
    for(let subsciprtion of subscriptions){
      await Subscription.findOneAndUpdate({_id:subsciprtion._id},{status:"expire"})
      await User.findOneAndUpdate({_id:subsciprtion.user},{subscriptions:null},{new:true})
    }
  }

}

export const SubscriptionService = {
    expireUserSubcription
}