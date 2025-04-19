import { Socket } from "socket.io";

const setAndGetLiveLocation = (socket:Socket)=>{
    socket.on('location', (user_id:string,latitude:number,longitude:number) => {
        
        socket.emit(`liveLocation::${user_id}`, {latitude,longitude});
    })
}

export const locationHelper = {setAndGetLiveLocation}