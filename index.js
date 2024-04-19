const express = require('express');
const cors = require("cors");
const app = express();
const port =  3000;

app.use(cors());


app.get('/', (req, res) => {
    res.json({
        name: "Daan Verbeek",
        age: 19
    })
})



app.listen(port, () => {
    console.log(`API Running at port ${port}`)
})
