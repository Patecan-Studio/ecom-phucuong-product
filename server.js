const app = require("./src/app");

const PORT = process.env.PORT || 3056;

app.listen(PORT, ()=>{
    console.log(`eCom start with port ${PORT}`);
});


// process.on('SIGINT', ()=> {
//     server.close(() => console.log(`Exit Server Express`))
// });