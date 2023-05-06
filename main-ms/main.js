const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const { log } = require('console');

const packageDefinitionUser = protoLoader
    .loadSync(path.join(__dirname, '../protos/users.proto'));

const userProto = grpc.loadPackageDefinition(packageDefinitionUser);

const userStub = new userProto.UserService('0.0.0.0:50051',
    grpc.credentials.createInsecure());


const app = express()
app.use(express.json())

const restPort = 5000;

app.get('/', (req, res) => {
    res.send('Welcome to Songa API!')
})

// function processAsync(user) {
    
// }

app.listen(restPort, ()=> {
    log(`Songa API is listening on port ${restPort}`)
})