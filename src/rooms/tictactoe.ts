import {Room, Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";


class Client2 extends Schema {
    client:Client;
    client2(client){
        this.client = client;
    }
}

// class CurrentTurn extends Schema {
//     turn : string="";
//     CurrentTurn(){
//         this.turn = '';
//     }
// }

class Turn extends Schema {
    sessionId: string;
    position: number;

    Turn(sessionId,position){
        this.sessionId= sessionId;
        this.position = position;
    }
}

export class Game extends Schema {
    @type([ "number" ]) gameArr = new ArraySchema<number>();
    // @type("string")  turn;
    // userMap:Map<string,Client>;
    @type({ map: Client2 }) userMap = new MapSchema<Client2>();
    @type({ map: Turn }) turnMap = new MapSchema<Turn>();
    // @type(CurrentTurn) turn:CurrentTurn = new CurrentTurn();
    
    
    Game(){
        for(let i=0; i<9; i++)
        {
            this.gameArr.push(-1);
        }   
    }  
    

    

    createPlayer(client: Client){
        // console.log(this.turn);

        // console.log(this.userMap);
        this.userMap.set(client.sessionId, new Client2(client));
        
    }

    removePlayer(sessionId: string) {
        this.userMap.delete(sessionId);

    }

    
    // addToArray() {
    //     let t = new Turn('sessionid',4);
    //     console.log(this.turnMap);
    //     this.turnMap.set('123', new Turn('111',12));

    //     this.turnMap.set("test2",t);
    //     // this.turn+=1;
    // }
    
    startGame(maxClients: number){
        
        // console.log(this.turn);
        // if(maxClients === this.userMap.size)
        // {
        //     console.log("game can start");

            // this.turn.turn = this.userMap.keys[0];
            // console.log(this.turn);
            // // where to set
            // this.turn = this.userMap.keys[1];
            // if(this.turn.turn === this.userMap.keys[1])
            //     this.turn.turn = this.userMap.keys[0];
            // else if(this.turn.turn === this.userMap.keys[0])
            //     this.turn.turn = this.userMap.keys[1];
            
            
    }
          
        // var i=0;
        // var intervalID = setInterval( () => {
        //     i+=1;
        //     let t = new Turn('sessionid',4);
        //     console.log("Startgame: ",this.turnMap);
        //     this.turnMap.set(i.toString(), new Turn('111',12));
        // }, 2000);
        
}
    



/////////////////////////////////////////////////////////////

export class Tictactoe extends Room {
    maxClients = 2;
   
    // const userMap = new MapSchema<Client>();
    onCreate(options) {
        console.log("Room Created");
        this.setState(new Game());
        
        this.onMessage("position", (client, message) => {
            console.log("from ", client.sessionId , " received: ", message);
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        
        client.send("joined Successfully");
        console.log(client.sessionId, ' has joined');
        this.state.createPlayer(client);
        this.state.startGame(this.maxClients);
        
    }

    onLeave (client: Client, consented: boolean) {
        this.state.removePlayer(client.sessionId); 
       
     }

     onDispose () {
        console.log("Dispose tictactoe");
    }
}