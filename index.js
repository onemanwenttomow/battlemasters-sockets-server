const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server,  { origins: 'localhost:3000 https://jolly-khorana-77c4aa.netlify.app:*' });

server.listen(process.env.PORT || 8080, () => console.log("battlemasters socket server up and running!"));

app.get('/', (req, res) => {
    res.json({success: true});
});

let rooms = {};

io.on("connection", (socket) => {
    console.log('socket connection!!!!: ',socket.id);
    socket.emit("news", { hello: "world" });

    socket.on("check if room exists", ({roomId}) => {
        console.log("check if room exists: ", roomId);
        console.log(rooms[roomId]);
        if(rooms[roomId]) {
            rooms[roomId].player2 = {
                socketIds: [socket.id]
            };
        }
        socket.emit("room", rooms);
    });

    socket.on("new room", ({roomId}) => {
        console.log(roomId);
        if (!rooms.roomId) {
            rooms[roomId] = {
                'player1': {
                    socketIds: [socket.id]
                }
            };
        }
        console.log("rooms: ", rooms);
        socket.emit("room", rooms);
    });
    socket.on("disconnect", () => {
        console.log("disconnect!!!!", socket.id);
    });
});
