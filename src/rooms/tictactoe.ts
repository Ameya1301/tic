import {Room, Client, ServerError} from "colyseus";
import { Schema, type, MapSchema, ArraySchema, filter,filterChildren } from "@colyseus/schema";
import {RoomAvailable } from "colyseus.js";
import {updateLobby } from "colyseus";
// require('console-stamp')(console, '[HH:MM:ss.l]');

class Client2 extends Schema {
    client:Client;   
    Client2(client){
        this.client = client; 
    }
}


 class Turn extends Schema {
    sid: String;
    
}

class Temp extends Schema {
    @type("string")name: String;
    client:Client;
    Temp(name,client){
        this.name = name;
        this.client = client;
    }
}

class Data extends Schema{
    client:Client;
    region: number;
    
    
}

export class Game extends Schema {
// Data is the map to store the data received from the client side
//temp is the map who has all the data
    @filterChildren(
        function(client: Client, key: string, value: Temp, root: Game) {
            if(root.dataMap.get(client.sessionId) === undefined)
            {
                console.log("returned false");
                return false;
            }
            
            
            var regionId = root.dataMap.get(client.sessionId).region;
            value = root.tempMap.get(regionId.toString());
            
            console.log("in the filter");
            return true;
            

            //    return this.client.sessionId === client.sessionId; 
        }
        )
        
        @type({ map: Client2 }) userMap = new MapSchema<Client2>();
        @type({ map: Turn }) turnMap = new MapSchema<Turn>();
        // @type(CurrentTurn) turn:CurrentTurn = new CurrentTurn();
        @type("string") CurrentTurn = "";
        @type("string") gameWinner = "";
        @type("number") j = 0;
        @type("string") leftPlayer = "---";
        @type("number") k = 0;
        @type({ map: Temp }) tempMap = new MapSchema<Temp>();
        @type({ map: Data }) dataMap = new MapSchema<Data>();
        
        
        l1 = [];
        l2 = [];
        winningPattern = [];
        
        createPlayer(client: Client){
            this.leftPlayer = "---";
            this.userMap.set(client.sessionId, new Client2(client));
            
            ////////////////////////////////////////////////////////////////////////////////////////////////
            // this.userMap.get(client.sessionId);
            this.tempMap.set('1', new Temp("data1",client));
            this.tempMap.set('2', new Temp("data2",client));
            this.tempMap.set('3', new Temp("data3",client));
            this.tempMap.set('4', new Temp("data4",client));
            
            ////////////////////////////////////////////////////////////////////////////////////////////////
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
        // this.winningPattern.push(3,4,5);
        console.log("Pattern: ",this.winningPattern);
        
        this.l1.sort();
        this.l2.sort();
        if(this.j>=5)
        {
            for(let i = 0; i<winner.length; i++)
            {
                console.log("l1:",this.l1);
                console.log("l2:",this.l2);
                var x = winner[i];
                console.log("X:",x);
                // console.log("value of x array: ", x.every(val => this.l1.includes(val.toString())));
                if(x.every(val => this.l1.toString().includes(val.toString())))
                {
                    console.log("inside the if statemnet");
                    // this.gameWinner = "12345";
                     
                    this.gameWinner = sessionId;
                    console.log("player 1 wins");
                    this.winningPattern = x;
                    console.log("winns:",this.winningPattern);
                    this.j = 100;
                    break;
                }
                if(x.every(val => this.l2.toString().includes(val.toString())))
                {
                    // this.gameWinner = "12345";
                    console.log("player 2 wins");
                    this.gameWinner = sessionId;
                    this.winningPattern.push(x);
                    
                    console.log(this.winningPattern);
                    this.j= 100;
                    break;
                }
                
            }
        }
        
        
        return true;
        
    }
    

    playNextTurn(currentSessionId: string){
        
        this.userMap.forEach( (value, key) => {
        // this.gameWinner = "1234567890";
            if(currentSessionId !== key){
                this.CurrentTurn = key;        
            }

        }); 
        this.k=0;

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
                   this.broadcast("winningPattern",this.state.winningPattern);
                   this.state.playNextTurn(client.sessionId);
                   this.broadcast("turn",this.state.CurrentTurn);
                   
                }
            } 
            else {
                console.log("throwing an error");
                this.state.k += 1;
                // console.log("k:", this.state.k);
                // let that = this;
                // setInterval(function () {that.state.k++}, 1000);
                // console.log("k:",this.state.k);



                // error(400, "custom error for random click");
                // try{
                //     // throw Error("custom error for random click");
                //     throw new ServerError(400, "//////////////////////////////////");
                    
                // }catch(e){
                //     console.log(e);
                // }
            }
           

        });

        this.onMessage("testing", (client, message)=>{
            // console.log('\n\n\n\n\n\n\n\n\nclient:',client);
            console.log("message:",message);
            let data = new Data();
            data.client = client;
            data.region = message;
            // console.log("data:", data);
            this.state.dataMap.set(client.sessionId, data);
            
            // console.log("from map:",this.state.dataMap.get(client.sessionId));
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