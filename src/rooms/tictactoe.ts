import {Room, Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";




class Client2 extends Schema {
    client:Client;
    // myTurn:boolean;
    Client2(client){
        this.client = client;
        // this.myTurn = false;
    }
}

// class CurrentTurn extends Schema {
//     turn : string="";
//     CurrentTurn(){
//         this.turn = '';
//     }
// }

class Turn extends Schema {
    sessionId: String;
    // position: Number;

    Turn(sessionId: String){
        this.sessionId = sessionId;
        // this.position = position;
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
    @type("number") j = 0;
   
    Game(){
        for(let i=0; i<9; i++)
        {
            this.gameArr.push(-1);
        }   
    }  
    

    createPlayer(client: Client){
        // console.log(this.turn);

        this.userMap.set(client.sessionId, new Client2(client));
        
        // console.log(this.userMap);
             
        
    }
    createTurn(sessionId:string, position: Number){
        console.log("position: ",position);
        
        // check in turn map if position is used or not if used return false else return true
        
        if(this.turnMap.get(position.toString()) === undefined)
        {
            this.turnMap.set(position.toString(), new Turn(sessionId));
            this.j++;
            console.log("inserted");
        } else {
            return false;
        }

        //game logic (winner/lossser) 


       
        console.log('display key0: ');
        // console.log(this.turnMap);
        console.log("\n\n");


        /////////////////////////////////////////////////////////////
        // printing undefined
        // console.log(this.turnMap[position.toString()]);

        // console.log(this.turnMap[String(position)]);
        
        this.turnMap.forEach((value,key)=> {
            // value.Turn.bin
            console.log(value);
            console.log("sessionid: ", value);
            console.log("key: ", key);
        });
       
        // console.log(this.turnMap.values());
        ////////////////////////////////////////////////////////////

        return true;
        
    }

    playNextTurn(currentSessionId: string){
       
        //Changing the pplayer turn
        this.userMap.forEach( (value, key) => {

            if(currentSessionId !== key){
                this.CurrentTurn = key;
                // console.log(this.CurrentTurn);
            }
        });
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
            console.log("Starting current turn: ", this.CurrentTurn);
            
            
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