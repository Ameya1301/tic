import { ColyseusTestServer, boot } from "@colyseus/testing";
// import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import gameServer from "./index";
import {Tictactoe, Game} from "./rooms/tictactoe";
require('console-stamp')(console, '[HH:MM:ss.l]');
var colyseus: ColyseusTestServer;




describe("testing your Colyseus app", () => {
   
    beforeAll(async () =>  colyseus = await boot(gameServer,3000));
    afterAll(async () => await colyseus.shutdown());
    beforeEach(async () => await colyseus.cleanup());
    

    it("connecting to a room", async ()=>{    
       
        let room = await colyseus.createRoom<Game>("tictactoe");
        // const client1 = await colyseus.connectTo(room);
        // const client2 = await colyseus.connectTo(room);
        const client1 = await colyseus.connectTo<Game>(room);
        const client2 = await colyseus.connectTo<Game>(room);
        
        expect(client1.sessionId).toEqual(room.clients[0].sessionId);
        expect(client2.sessionId).toEqual(room.clients[1].sessionId);
    }); 


    it("client sending message on the server",async ()=>{
        let room = await colyseus.createRoom<Game>("tictactoe");
        const client1 = await colyseus.connectTo(room);
        const client2 = await colyseus.connectTo(room);
        let i=0;
              
        client1.send("move",String(i));
        const [ client, message ] = await room.waitForMessage("move");
        expect(client.sessionId).toEqual(client1.sessionId);
        expect(String(i)).toEqual(message);
        i++;  
        
        client2.send("move",String(i));
        const [ client3, message3 ] = await room.waitForMessage("move");
        expect(client3.sessionId).toEqual(client2.sessionId);
        expect(String(i)).toEqual(message3);
    });
    
    //not done
    it("client1 wins the game", async ()=>{
        let room = await colyseus.createRoom<Game>("tictactoe");
        const client1 = await colyseus.connectTo(room);
        const client2 = await colyseus.connectTo(room);
        var gameEnd = false;
        let winner = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        
        client1.state.listen("gameWinner",(currentValue, previousValue)=>{
            console.log("from listener of gameWinner: ",currentValue);
            if(currentValue === client1.sessionId)
            {
                console.log("player 1 won the game");
                gameEnd = true;
                console.log("gameend from listener: ",gameEnd);
            }
        });
        
        client1.onMessage('winningPattern',(pattern)=>{
            console.log("Winning pattern: ",pattern);
            for(let i = 0; i<winner.length; i++)
            { 
                var x = winner[i];
                console.log("X:",x);
                if(x.every(val => pattern.toString().includes(val.toString())))
                {
                    console.log("in the if of true");
                    gameEnd = true;
                    break;
                } else {
                    console.log("in the if of false");
                    gameEnd = false;
                }         
            }
        });
        
        
        for(let i=0; i<9; i++)
        { 
            // if(i%2===0)
            if(i%2===0 && gameEnd === false)
            {    
                client1.send("move",i.toString());
                // const [ client, message ] = await room.waitForMessage("move");
                await room.waitForMessage("move");
                // expect(client.sessionId).toEqual(client1.sessionId);
                // expect(i.toString()).toEqual(message);
                
                // } else {
                } else if(i%2!==0 && gameEnd === false) {
                    client2.send("move",i.toString());
                    await room.waitForMessage("move");
                    // const [ client, message ] = await room.waitForMessage("move");
                    // expect(client.sessionId).toEqual(client2.sessionId);
                    // expect(i.toString()).toEqual(message);
                }
                if(i===8 )
                {
                    //delay of 1sec
                    console.log("waiting for 10 sec");
                    await new Promise(f => setTimeout(f, 1000));
                    
                }
            }
            
            expect(gameEnd).toBeTruthy();
            
        });
        
        it("random button click",async ()=>{
            var change;
            
            let room = await colyseus.createRoom<Game>("tictactoe");
            const client1 = await colyseus.connectTo(room);
            const client2 = await colyseus.connectTo(room);
            client1.send("move","1");
            await room.waitForMessage("move");
            client2.send("move","2");
            await room.waitForMessage("move");
            client1.send("move","3");
            await room.waitForMessage("move");
            client1.send("move","4");
            await room.waitForMessage("move");
            client1.send("move","5");
            await room.waitForMessage("move");
            client1.send("move","6");
            await room.waitForMessage("move"); 
          
            
            client1.state.listen('k',(curr)=>{
                // console.log("12345:", curr);
                if(curr >= 1)
                {
                    change = true;    
                } else {
                    change = false;
                } 
            });
            
            // room.state.listen("k",(curr, prev)=>{
            //     console.log("curr-k: ",curr);
                // if(curr >= 1)
                // {
                //     change = true;    
                // } else {
                //     change = false;
                // }
            // });
            await new Promise(f => setTimeout(f, 100));
            expect(change).toBeTruthy();
            
        });
            
        
        
        
        // client2.send("move","3");
        // it("client2 wins the game", async ()=>{
            //     let room = await colyseus.createRoom<Game>("tictactoe");
            //     const client1 = await colyseus.connectTo(room);
            //     const client2 = await colyseus.connectTo(room);
            //     var gameEnd = false;
            
            //     client2.state.listen("gameWinner",(currentValue, previousValue)=>{
    //         console.log("from listener of gameWinner: ",currentValue);
    //         if(currentValue === client1.sessionId)
    //         {
    //             console.log("player 2 won the game");
    //             gameEnd = true;
    //             console.log("gameend from listener: ",gameEnd);                
    //         }
    //     });
        
        
    //     for(let i=0; i<9; i++)
    //     { 
    //         // if(i%2===0)
    //         if(i%2===0 && gameEnd === false)
    //         {    
    //             client2.send("move",i.toString());
    //             // const [ client, message ] = await room.waitForMessage("move");
    //             await room.waitForMessage("move");
    //             // expect(client.sessionId).toEqual(client1.sessionId);
    //             // expect(i.toString()).toEqual(message);
                
    //             // } else {
    //         } else if(i%2!==0 && gameEnd === false) {
    //             client1.send("move",i.toString());
    //             await room.waitForMessage("move");
    //             // const [ client, message ] = await room.waitForMessage("move");
    //             // expect(client.sessionId).toEqual(client2.sessionId);
    //             // expect(i.toString()).toEqual(message);
    //         }
    //         if(i===8 )
    //         {
    //             //delay of 1sec
    //             console.log("waiting for 10 sec");
    //             await new Promise(f => setTimeout(f, 1000));
                
    //         }
    //     }
                            
    //         expect(gameEnd).toBeTruthy();
            
    //     });


    
    
});