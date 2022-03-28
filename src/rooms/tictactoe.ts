import {Room, Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
var j =0;


class Client2 extends Schema {
    client:Client;
    myTurn:boolean;
    Client2(client){
        this.client = client;
        this.myTurn = false;
    }
}

// class CurrentTurn extends Schema {
//     turn : string="";
//     CurrentTurn(){
//         this.turn = '';
//     }
// }

class Turn extends Schema {
    // sessionId: string;
    position: number;

    Turn( position){
        // this.sessionId = sessionId;
        this.position = position;
    }
}

export class Game extends Schema {
    @type([ "number" ]) gameArr = new ArraySchema<number>();
    // @type("string")  turn;
    // userMap:Map<string,Client>;
    //session ID - client obj
    @type({ map: Client2 }) userMap = new MapSchema<Client2>();
    @type({ map: Turn }) turnMap = new MapSchema<Turn>();
    // @type(CurrentTurn) turn:CurrentTurn = new CurrentTurn();
     @type("string") CurrentTurn = "";
    
    
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
        if(maxClients === this.userMap.size)
        {   
            this.CurrentTurn = this.userMap.keys().next().value;
           
            
            // this.turnMap.clear();
           
            

           

        }

   
        
        //set turn session id

        // 

        // console.log(this.turn);
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
    
   


    playTurn(){
        
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
        
        this.onMessage("move", (client, message) => {
            console.log("from ", client.sessionId , " received: ", message);
           
            console.log(this.state.turnMap.forEach((value, key)=> {
                console.log(value.position);
                console.log(key);
            }));

            console.log("j: ",j);
            // this.state.turnMap.set(j , new Turn(message));
            this.state.turnMap[j] = new Turn(message);
        
            j++;

            console.log(this.state.turnMap.get(j-1));

            
            
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        
        client.send("joined Successfully",client);
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