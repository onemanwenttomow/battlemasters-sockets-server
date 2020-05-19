const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server,  { origins: 'https://jolly-khorana-77c4aa.netlify.app:*' });

server.listen(process.env.PORT || 8080, () => console.log("battlemasters socket server up and running!"));

app.get('/', (req, res) => {
    res.json({success: true});
});

io.on("connection", (socket) => {
    socket.emit("news", { hello: "world" });
    socket.on("my other event", (data) => {
        console.log(data);
    });
});
