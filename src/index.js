const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const route = require('./routes/route');
const  mongoose  = require('mongoose');
const app = express();

// basically tells the system that you want json to be used.
app.use(bodyParser.json());
// basically tells the system whether you want to use a simple algorithm for shallow parsing (i.e. false) or complex algorithm for deep parsing that can deal with nested objects (i.e. true).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

mongoose.connect("mongodb+srv://sumandev:aBosU15RXTGZYkKq@cluster0.4du2i.mongodb.net/group76database?retryWrites=true&w=majority", {
    useNewUrlParser: true,useUnifiedTopology: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});


