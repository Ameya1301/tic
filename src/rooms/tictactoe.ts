import {Room, Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";




class Client2 extends Schema {
    client:Client;
    
    Client2(client){
        this.client = client;
        
    }
}



class Turn extends Schema {
    sid: String;
    
}

export class Game extends Schema {

    @type({ map: Client2 }) userMap = new MapSchema<Client2>();
    @type({ map: Turn }) turnMap = new MapSchema<Turn>();
    // @type(CurrentTurn) turn:CurrentTurn = new CurrentTurn();
    @type("string") CurrentTurn = "";
    @type("number") j = 0;
    @type("boolean") game;

    createPlayer(client: Client){
        

        this.userMap.set(client.sessionId, new Client2(client));
        
             
        
    }


    createTurn(sessionId:string, position: Number){
        console.log("position: ",position);
        console.log(sessionId);
        // check in turn map if position is used or not if used return false else return true
        
        if(this.turnMap.get(position.toString()) === undefined)
        {
            var a = new Turn();
            a.sid = sessionId;
            this.turnMap.set(position.toString(), a);

            
            this.j++;
            console.log("inserted");
        } else {
            return false;
        }
        
        let winner = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        if( this.j>=5)
        {
            
                var x,y,z;

            for(let i = 0; i<8; i++)
            {

                this.turnMap.forEach((value, key)=>{
                    if(winner[i][0].toString() === key)
                    {
                        x = value.sid;
                        console.log(x);
                    }
                    else if(winner[i][1].toString() === key)
                    {
                        y = value.sid;
                        console.log(y);
                    }
                    else if(winner[i][2].toString() === key)
                    {
                        z = value.sid;
                        console.log(z);
                    }


                });
                console.log(x, y, z);
                if(x == y && y == z)
                {
                    console.log("winner");
                    this.game = true;
                    break;
                } 
                else if(this.j>=9) {
                    console.log("draw");
                    this.game = false;
                    break;

                }
            }
        }

       
      
        console.log("\n\n");


      
        
        this.turnMap.forEach((value,key)=> {
            // value.Turn.bin
            // console.log(value);
            console.log("sessionid: ", value.sid);
            console.log("key: ", key);
        });
       
       

        return true;
        
    }

    playNextTurn(currentSessionId: string){
       
        
        this.userMap.forEach( (value, key) => {

            if(currentSessionId !== key){
                this.CurrentTurn = key;
                
            }
        });
    }

    removePlayer(sessionId: string) {
        this.userMap.delete(sessionId);

    }

    
   
    
    startGame(maxClients: number){
        if(maxClients === this.userMap.size)
        {   
            this.CurrentTurn = this.userMap.keys().next().value;
            console.log("Starting current turn: ", this.CurrentTurn);
          
            
        }
      
            
    }
    
   

          
        
        
}
    



/////////////////////////////////////////////////////////////

export class Tictactoe extends Room {
    maxClients = 2;
   
    // const userMap = new MapSchema<Client>();
    onCreate(options) {
        console.log("Room Created");
        this.setState(new Game());

        // let a: Map<string,string> = new Map();
        // a["2"] = "3";
        // a["1"] = "2";
        // console.log(a["2"]);
        
        this.onMessage("move", (client, message) => {
            console.log("from ", client.sessionId , " received: ", message);
            var turn = this.state.createTurn(client.sessionId,message);
            if( turn === true){
                this.state.playNextTurn(client.sessionId);
            } 
            else {
        
            }
           

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