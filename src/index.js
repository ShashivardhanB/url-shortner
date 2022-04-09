const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const  mongoose  = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://sumandev:aBosU15RXTGZYkKq@cluster0.4du2i.mongodb.net/group76database?retryWrites=true&w=majority", {
    useNewUrlParser: true,useUnifiedTopology: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});



