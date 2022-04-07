import { Client, LobbyRoom, updateLobby } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { matchMaker } from "colyseus";

class Client2 extends Schema {
    client:Client;   
    Client2(client){
        this.client = client; 
        // console.log(this.client);
    }

    // send(key, message) {
    //     this.client.send(key,message);
    // }
}


export class CustomLobby extends LobbyRoom {
    // @type("string") id = new ArraySchema<string>();
    users:Map<string, Client> = new Map();
    j=0;

    
    async onCreate(options) {
        console.log('lobby created',options);
        //
        // This is just a demonstration
        // on how to call `updateLobby` from your Room
        //
        console.log();
       
    this.onMessage('id',(client, message)=>{
        console.log("received from client: ",message);
        
    });
    this.maxClients = 4;
    
    // this.broadcast("temp",{'message':'hi'});
    
    this.clock.setTimeout(() => {
      this.setMetadata({
        customData: "Hello world!"
      }).then(() => updateLobby(this));
    }, 500);
    console.log("updateLobby: ",updateLobby);
  }


    async onJoin(client, options) {
        // console.log("\n\n\n\n\n\n\nfrom on join: ",client);
        this.users.set(client.sessionId,client);
        // console.log("\n\n\n\n\n\n\nfrom after on join: ",this.users.get(client.sessionId).sessionId);
    //    console.log(this.rooms);
        
        if(this.maxClients === this.users.size)
        {
            let room = await matchMaker.createRoom("tictactoe",{});
            console.log("room:\n",room);
            
            
            this.setSeatReservationTime(1000);
            console.log(this.users.size);
            console.log(this.users.keys());   
            for (let key of this.users){
                let client = key[1];
                if(this.j%2 === 0)
                {
                    // setTimeout()
                    let reservation = await matchMaker.reserveSeatFor(room,{});
                    console.log("reservation:\n", reservation);
                    client.send('reservation',reservation);
                }
                this.j++;
            }

            this.j=0;
            room = await matchMaker.createRoom("tictactoe",{});
            for (let key of this.users){
                let client = key[1];
                if(this.j%2 !== 0)
                {
                    // setTimeout()
                    let reservation = await matchMaker.reserveSeatFor(room,{});
                    console.log("reservation:\n", reservation);
                    client.send('reservation',reservation);
                }
                this.j++;
            }

            // for( let value in this.users) {
            //     console.log("value from for in : ",value);
            // }

            // this.users.forEach((value, key)=> {
            //     // console.log("value //////////////////////////////////////\n\n\n\n",value);
            //     console.log("Player:",key);
                 
                // console.log(value.client);
                    // console.log(typeof(value));
                    
                //    value.send('reservation', reservation);
                    // value.client.send('reservation',reservation);
                    // value.send('reservation',reservation);
                
                // }
                // this.j++;
            // });
            
            console.log("hence can start the game");
        }
        // console.log(client.sessionId, " has joined");
        // this.broadcast("temp",{'message':'hi'});

  };

  onLeave(client) {
      console.log(client.sessionId," is leaving");
  }

}