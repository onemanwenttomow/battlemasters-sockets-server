const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server,  {origins: '*:*'});

server.listen(process.env.PORT || 8080, () => console.log("battlemasters socket server up and running!"));

app.get('/', (req, res) => {
    res.json({success: true});
});

let rooms = {};

io.on("connection", (socket) => {
    console.log('socket connection!!!!: ',socket.id);
    socket.emit("news", { hello: "world" });

    socket.on('chosen army', ({imperialArmy, chaosArmy, player, roomId}) => {
        console.log(imperialArmy, chaosArmy,  player);
        console.log("chaosArmy: ", chaosArmy);
        console.log("imperialArmy: ", imperialArmy)
        if (player === 'player1') {
            io.to(rooms[roomId].player2.socketIds[0]).emit("army chosen", {
                imperialArmy,
                chaosArmy
            });
        } else {
            io.to(rooms[roomId].player1.socketIds[0]).emit("army chosen", {
                imperialArmy,
                chaosArmy
            });
        }
    });

    socket.on("check if room exists", ({roomId, player}) => {
        console.log("player in check if room exists", player)
        if (player === 'player1') {
            return;
        }
        console.log("check if room exists: ", roomId);
        console.log("rooms: ", rooms);
        console.log(rooms[roomId]);
        if(rooms[roomId]) {
            rooms[roomId].player2 = {
                socketIds: [socket.id]
            };
        }
        io.to(socket.id).emit("room", rooms);
        if (player) {
            io.to(rooms[roomId].player1.socketIds[0]).emit("player2 joined");
        }
        // socket.emit("room", rooms);
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
        io.to(socket.id).emit("room", rooms);

        // socket.emit("room", rooms);
    });
    socket.on("disconnect", () => {
        console.log("disconnect!!!!", socket.id);
    });
});
