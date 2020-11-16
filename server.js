const path = require('path');
const express = require('express');
const http =require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const {userJoin ,getCurrentUser,userLeave ,getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName ='ChatCord Bot';
// Set static folder
app.use(express.static(path.join(__dirname,'public')));


// Run when client connect
io.on('connection',socket=>{

    socket.on('joinRoom',({username,room})=>{
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // console.log('New WS Connection...');
    // socket.emit send to the user
    // Welcome current user 
    socket.emit('message',formatMessage(botName,'Wellcome to the chatCord'))

    // Broadcast when a user connects
    // to room 
    socket.broadcast
    .to(user.room)
    .emit(
        'message',
        formatMessage(botName,`${user.username} has joined the chat`)
        );
    // Send users and room info
    
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
        });
    });
 
    // To all users
    //io.emit();
    // Send users and room info 



    // Listen for chatMessage.
    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);

        console.log(msg);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    // Runs when client disconnects
    socket.on('disconnect',()=>{
        const user =userLeave(socket.id);
        if(user){
        io.to(user.room).emit(
            'message',
             formatMessage(botName,`${user.username} has left the chat `));
        
        //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
        }
    });
})

const PORT= process.env.PORT||3000;

server.listen(PORT,()=> console.log(`Server running on port ${PORT}`));
