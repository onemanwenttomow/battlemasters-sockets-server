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

    socket.on('start game', ({roomId, army, player}) => {
        const otherPlayer = getOtherPlayer(player);
        army === 'Imperial' ?
            army = 'Chaos' :
            army = 'Imperial';
        for (let room in rooms) {
            if (room === roomId) {
                io.to(rooms[roomId][otherPlayer].socketIds[0]).emit("startgame", {army});
            }
        }
    });

    socket.on('chosen army', ({imperialArmy, chaosArmy, player, roomId}) => {
        const otherPlayer = getOtherPlayer(player);
        io.to(rooms[roomId][otherPlayer].socketIds[0]).emit("army chosen", {
            imperialArmy,
            chaosArmy
        });
    });

    socket.on("check if room exists", ({roomId, player}) => {
        if (player === 'player1') {
            return;
        }
        if (rooms[roomId]) {
            rooms[roomId].player2 = {
                socketIds: [socket.id]
            };
        }
        io.to(socket.id).emit("room", rooms);
        if (rooms[roomId]) {
            io.to(rooms[roomId].player1.socketIds[0]).emit("player2 joined");
        }
    });

    socket.on("new room", ({roomId}) => {
        if (!rooms.roomId) {
            rooms[roomId] = {
                'player1': {
                    socketIds: [socket.id]
                }
            };
        }
        io.to(socket.id).emit("room", rooms);
    });

    socket.on('new socket id', ({player, roomId}) => {
        rooms[roomId][player] = {
            socketIds: [socket.id]
        };
    });

    socket.on('tile drag start', ({id, player, roomId}) => {
        const otherPlayer = getOtherPlayer(player);
        io.to(rooms[roomId][otherPlayer].socketIds[0]).emit("other player picked up tile", {id});
    });

    socket.on('tile drag end', ({id, player, roomId, row, col}) => {
        console.log("tile drag end: ", id, player, roomId, row, col);
        const otherPlayer = getOtherPlayer(player);
        io.to(rooms[roomId][otherPlayer].socketIds[0]).emit("other player dropped tile", {id, row, col});
    });

    socket.on('allExtraPiecesAddedToBoard', ({player, roomId}) => {
        console.log("player, roomId in allExtraPiecesAddedToBoard", player, roomId);
        const otherPlayer = getOtherPlayer(player);
        // io.emit("allExtraPiecesAddedToBoard");
        io.to(rooms[roomId][otherPlayer].socketIds[0]).emit("allExtraPiecesAddedToBoard");
    });


    socket.on("disconnect", () => {
        console.log("disconnect!!!!", socket.id);
    });
});

function getOtherPlayer(player) {
    player === 'player1' ?
        player = 'player2':
        player = 'player1';
    return player;
}
