const restify = require('restify');
const config = require('config');
const async = require('async');
const corsMiddleware = require('restify-cors-middleware');
const MongooseConnection = new require('dbf-dbmodels/MongoConnection');
let connection = new MongooseConnection();
var redisManager = require('./Utility/RedisManager');
const IDData = require('dbf-dbmodels/Models/IDData').IDData;
const uuid = require('uuid');
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');



const server = restify.createServer({
    name: "id-service",
    version: '1.0.0'
}, function (req, res) { });

const cors = corsMiddleware({})

server.pre(cors.preflight);
server.use(cors.actual);

server.use(restify.plugins.queryParser({
    mapParams: true
}));
server.use(restify.plugins.bodyParser({
    mapParams: true
}));
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

server.listen(3645, () => {
    console.log('%s listening at %s', server.name, server.url);
});



server.get('/', (req, res) => {
    res.end(JSON.stringify({
        name: "DBF ID Service",
        version: '1.0.0'
    }))
});


server.get('/DBF/IDService/main/:field', async function (req, res) {
    console.log("\n=============== Entered getDataThroughRedis ===============");
    // console.log(message);

    if (req.params.field === undefined || req.params.field === '') {
        console.log("ISSUE: Field not entered!");
        let jsonString = messageFormatter.FormatMessage(undefined, "Please enter the field details", false, undefined);
        res.end(jsonString);
    }
    else {
        let data = await getDataFromRedis(req.params.field).catch(function (error) {
            console.log("Error occurred: " + error)
            let jsonString = messageFormatter.FormatMessage(undefined, "Error occurred while getting ID", false, undefined);
            res.end(jsonString);
        });
        console.log("Return data: " + data);
        res.end(data.toString());
    }
});


// const getDataThroughRedis = async function (field) {
//     console.log("Entered getDataThroughRedis");
//     // console.log(message);

//     let botData = await getDataFromRedis(field).catch(function (error) {
//         console.log(error)
//     });
//     console.log(botData);

//     return botData;
// }

let getDataFromRedis = (field) => {
    console.log("Entered getDataFromRedis function. Field: " + field);

    return new Promise((resolve, reject) => {

        // if (!field) {
        //     reject("getDataThroughRedis - Invalid method parameters.");
        // }

        let finalID = 0;
        let id_key = `field:${field}`;
        console.log("id_key: " + id_key);

        // check user session in redis
        let redis = new redisManager();

        redis.GetSession(id_key).then((idData) => {
            console.log("idData: " + idData);

            if (idData == null) {
                console.log("No ID data retrieved from redis");
                
                finalID = 1000;                
                console.log("New ID: " + finalID);

                redis.SetSessionNonExpire(id_key, finalID).then((data) => {
                    // session created.
                    // save data in DB as a backup method
                    let recordID = uuid.v1();

                    let IDRecord = {
                        recordID: recordID,
                        field: field,
                        record: finalID
                    };

                    IDData.findOneAndUpdate({
                        'recordID': recordID
                    }, IDRecord, {
                            upsert: true
                        }, function (err, _IDRecordResult) {
                            if (err) {
                                console.log("Error occurred while saving ID record data: " + err);
                            } else {
                                console.log("Successfully saved ID record data");
                            }
                        });

                    resolve(finalID);
                }).catch(function (err) {
                    reject(err);
                })
            } else {
                console.log("ID data retrieved from redis: " + idData);
                
                finalID = parseInt(idData) + 1;
                console.log("New ID: " + finalID);

                redis.SetSessionNonExpire(id_key, finalID).then((data) => {
                    // session created.
                    // save data in DB as a backup method
                    let recordID = uuid.v1();

                    let IDRecord = {
                        recordID: recordID,
                        field: field,
                        record: finalID
                    };

                    IDData.findOneAndUpdate({
                        'recordID': recordID
                    }, IDRecord, {
                            upsert: true
                        }, function (err, _IDRecordResult) {
                            if (err) {
                                console.log("Error occurred while saving ID record data: " + err);
                            } else {
                                console.log("Successfully saved ID record data");
                            }
                        });

                    resolve(finalID);
                }).catch(function (err) {
                    reject(err);
                })
            }
        }, (err) => {
            reject(err);
        });
    });
}