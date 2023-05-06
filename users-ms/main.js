const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/users.proto'));

const usersProto = grpc.loadPackageDefinition(packageDefinition);

const USERS = [
    { id: 1, username: 'john', password: 'changeme' },
]

function findUser(call, callback) {
    let user = USERS.find(n => n.id == call.request.id);

    if (user) {
        callback(null, user);
    }
    else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "User not found!"
        });
    }
}

const server = new grpc.Server();
server.addService(usersProto.UserService.service, { find: findUser });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
});
