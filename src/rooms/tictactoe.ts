import {Room, Client, ServerError} from "colyseus";
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
    @type("string") gameWinner = "";
    @type("number") j = 0;
    @type("string") leftPlayer = "---";
    l1 = [];
    l2 = [];

    

    createPlayer(client: Client){
        
        this.leftPlayer = "---";
        this.userMap.set(client.sessionId, new Client2(client));
        
             
        
    }
   

    createTurn(sessionId:string, position: Number){

        
        var c = 0;
        this.userMap.forEach((value , key)=>{
            if(key === sessionId)
            {
                if(c === 0)
                {
                    this.l1.push(position);
                    
                } else {
                    this.l2.push(position);  
                }
            }
            c++;
        });

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

        this.l1.sort();
        this.l2.sort();
        if(this.j>=5)
        {
        for(let i = 0; i<8; i++)
            {
                console.log("l1:",this.l1);
                console.log("l2:",this.l2);
                var x = winner[i];
                console.log("X:",x);
                 if(x.every(val => this.l1.includes(val)))
                 {
                     console.log("player 1 wins");
                     this.gameWinner = sessionId;
                     this.j = 100;
                     break;
                 }
                 if(x.every(val => this.l2.includes(val)))
                 {
                     console.log("player 2 wins");
                     this.gameWinner = sessionId;
                     this.j= 100;
                     break;
                 }

            }
        }
        
        // if( this.j>=5)
        // {
            
        //         var x,y,z;

        //     for(let i = 0; i<8; i++)
        //     {

        //         this.turnMap.forEach((value, key)=>{
        //             if(winner[i][0].toString() === key)
        //             {
        //                 x = value.sid;
        //                 console.log(x);
        //             }
        //             else if(winner[i][1].toString() === key)
        //             {
        //                 y = value.sid;
        //                 console.log(y);
        //             }
        //             else if(winner[i][2].toString() === key)
        //             {
        //                 z = value.sid;
        //                 console.log(i, z);
        //             }


        //         });
        //         console.log(x, y, z);
                
        //         if(x === y && y === z )
        //         {
        //             console.log("winner");


                    
        //             this.j = 100;
        //             break;
        //         } 
                
        //         // else if(this.j>=9) {
        //         //     console.log("draw");
                    
        //         //     break;

        //         // }
        //     }
        // }

       
      
        console.log("\n\n");
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
       
        }
              
    }
       
}
    
/////////////////////////////////////////////////////////////

export class Tictactoe extends Room {
    maxClients = 2;
   
    
    onCreate(options) {
        console.log("Room Created");
        this.setState(new Game());

     
        
        this.onMessage("move", (client, message) => {
            console.log("from ", client.sessionId , " received: ", message);
            if(client.sessionId === this.state.CurrentTurn)
            {
                var turn = this.state.createTurn(client.sessionId,message);
                if( turn === true){
               
                   this.broadcast("l1", this.state.l1);
                   this.broadcast("l2", this.state.l2);
                   this.state.playNextTurn(client.sessionId);
                   this.broadcast("turn",this.state.CurrentTurn);
                }
            } 
            else {
                // throw new ServerError(400, "custom error for random click");
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
        // console.log(client.sessionId, " is has left");
        // this.state.playNextTurn(client.sessionId);
        
                
                    this.state.leftPlayer = client.sessionId;       
                          
       
        this.broadcast("left", this.state.leftPlayer);
        this.state.removePlayer(client.sessionId); 
       
     }

     onDispose () {
        console.log("Dispose tictactoe");
    }
}

