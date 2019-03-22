const restify = require('restify');
const config = require('config');
const async = require('async');
const corsMiddleware = require('restify-cors-middleware');
const MongooseConnection = new require('dbf-dbmodels/MongoConnection');
let connection = new MongooseConnection();
var redisManager = require('./Utility/RedisManager');





const server = restify.createServer({
    name: "id-service",
    version: '1.0.0'
}, function (req, res) {});

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
    console.log("Entered getDataThroughRedis");
    // console.log(message);

    let data = await getDataFromRedis(req.params.field).catch(function (error) {
        console.log(error)
    });
    console.log(data);

    res.end(data.toString());
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
    console.log("Entered getDataThroughRedis. field: " + field);
    return new Promise((resolve, reject) => {

        if (!field) {
            reject("getDataThroughRedis - Invalid method parameters.");
        }

        let id_key = `field:${field}`;
        let finalID = 0;

        // check user session in redis
        let redis = new redisManager();
        console.log(id_key);

        redis.GetSession(id_key).then((idData) => {
            console.log(idData);
            if (idData == null) {
                finalID = 1;
                // resolve(finalID);

                redis.SetSessionNonExpire(id_key, finalID).then((data) => {
                    // session created.
                    resolve(finalID);
                }).catch(function (err) {
                    reject(err);
                })

            } else {
                console.log(idData);
                finalID = parseInt(idData) + 1;
                console.log(finalID);
                // resolve(finalID);

                redis.SetSessionNonExpire(id_key, finalID).then((data) => {
                    // session created.
                    resolve(finalID);
                }).catch(function (err) {
                    reject(err);
                })
            }
        }, (err) => {
            reject(err);
        });
    });

    // console.log(value)
}

// var s3 = require('s3');
// var AWS = require('aws-sdk');
// var Client = require('node-rest-client').Client;
// var sizeOf = require('image-size');

// // let redis = new Redis();
// var client = s3.createClient({
//     maxAsyncS3: 20, // this is the default
//     s3RetryCount: 3, // this is the default
//     s3RetryDelay: 1000, // this is the default
//     multipartUploadThreshold: 20971520, // this is the default (20 MB)
//     multipartUploadSize: 15728640, // this is the default (15 MB)
//     s3Options: {
//         accessKeyId: accessKeyId,
//         secretAccessKey: secretAccessKey,
//         // any other options are passed to new AWS.S3()
//         // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
//     },
// });


// const server = restify.createServer({
//     name: "DBF-MediaService",
//     version: '1.0.0'
// }, function (req, res) {

// });
// const cors = corsMiddleware({
//     allowHeaders: ['authorization', 'companyInfo']
// })

// server.pre(cors.preflight);
// server.use(cors.actual);


// process.on('uncaughtException', function (err) {
//     console.error(err);
//     console.log("Node NOT Exiting...");
// });

// server.listen(3312, () => {
//     console.log('%s listening at %s', server.name, server.url);
// });



// server.get('/media/:company/:tenant/createBucketForTenant/:name', splitAction(), permissionManager({
//     permission: 'Media:C',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     // Create params for S3.createBucket
//     var bucketParams = {
//         Bucket: req.params.name,
//         ACL: ACL,
//     };
//     AWS.config.update({
//         accessKeyId: config.S3.accessKeyId,
//         secretAccessKey: config.S3.secretAccessKey
//     });

//     var s3 = new AWS.S3();

//     s3.createBucket(bucketParams, function (err, data) {
//         if (err) {
//             console.log(err, err.stack); // an error occurred
//             var json = {
//                 'IsSuccess': false,
//                 'Data': err.stack
//             };
//             res.send(json);
//             return next();
//         } else {
//             console.log(data); // successful response
//             var json = {
//                 'IsSuccess': true,
//                 'Data': data.Location
//             };
//             res.send(json);
//             return next();
//             /*
//             data = {
//              Location: "/examplebucket"
//             }
//             */
//         }
//     });
// });

// server.get('/media/:company/:tenant/createDefaultBucket', splitAction(), permissionManager({
//     permission: 'Media:C',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {

//     var bucketName = "company" + req.user.company + "tenant" + req.user.tenant;

//     var params = {
//         Bucket: bucketName,
//         /* required */
//     };

//     AWS.config.update({
//         accessKeyId: config.S3.accessKeyId,
//         secretAccessKey: config.S3.secretAccessKey
//     });

//     var s3 = new AWS.S3();

//     s3.headBucket(params, function (err, data) {
//         if (err) {

//             console.log(err, err.stack); // an error occurred because bucket doesn't exist

//             var bucketParams = {
//                 Bucket: bucketName,
//                 /* required */
//                 ACL: ACL,
//             };

//             s3.createBucket(bucketParams, function (err, data) {

//                 if (err) {
//                     console.log(err, err.stack); // an error occurred
//                     var json = {
//                         'IsSuccess': false,
//                         'Error': err.stack
//                     };
//                     res.send(json);
//                     return next();
//                 } else {
//                     console.log(data); // successful response
//                     var json = {
//                         'IsSuccess': true,
//                         'Data': data.Location
//                     };
//                     res.send(json);
//                     return next();
//                     /*
//                     data = {
//                      Location: "/examplebucket"
//                     }
//                     */
//                 }
//             });
//         } else {
//             console.log(data); // successful response
//             var json = {
//                 'IsSuccess': true,
//                 'Data': 'Default bucket already exists'
//             };
//             res.send(json);
//             return next();
//         }
//     });
// });

// server.get('/media/:company/:tenant/listBucketsForTenant', splitAction(), permissionManager({
//     permission: 'Media:R',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {

//     AWS.config.update({
//         accessKeyId: config.S3.accessKeyId,
//         secretAccessKey: config.S3.secretAccessKey
//     });

//     var s3 = new AWS.S3();

//     s3.listBuckets(function (err, data) {
//         if (err) {
//             console.log(err, err.stack); // an error occurred
//             var json = {
//                 'IsSuccess': false,
//                 'Data': err.stack
//             };
//             res.send(json);
//             return next();
//         } else {
//             console.log("Success", data.Buckets); // successful response
//             var json = {
//                 'IsSuccess': true,
//                 'Data': data.Buckets
//             };
//             res.send(json);
//             return next();
//             /*
//             data = {
//              Location: "/examplebucket"
//             }
//             */
//         }
//     });
//     //  // Load the SDK for JavaScript
//     // var AWS = require('aws-sdk');
//     // // Set the region 
//     // AWS.config.loadFromPath('./config'); 
//     // // Create S3 service object
//     // s3 = new AWS.S3({apiVersion: '2006-03-01'});



//     // Create params for S3.createBucket
//     // var bucketParams = {
//     //     Bucket : "testBucket",
//     //     ACL : ACL,
//     // };

//     // var uploader = client.uploadFile(params);
//     // uploader.on('error', function (err) {
//     //     console.error("unable to upload:", err.stack);
//     // });

//     // call S3 to create the bucket
//     // var result = client.listBuckets();
//     // result.on('error', function (err) {
//     //     console.error("No data retrieved:", err.stack);
//     // });
//     // result.on('data', function(data) {

//     //     console.log(data);

//     //     var json = {
//     //         'IsSuccess': true,
//     //         'Data': data
//     //     };
//     //     res.send(json);
//     //     return next();

//     // });
// });

// server.post('/media/:company/:tenant/upload', splitAction(), permissionManager({
//     permission: 'Media:C',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     console.log("========================Entered media service UPLOAD method=============================");
//     if (req.files) {
//         // console.log("req.files"); 
//         // console.log(req.files); 
//         // console.log("req.body"); 
//         // console.log(req.body); 
//         // req.files.Image.name = req.body.file.folderPath + req.files.Image.name;
//         // var bucketName = "company" + req.user.company + "tenant" + req.user.tenant;

//         var company = parseInt(req.user.company);
//         var tenant = parseInt(req.user.tenant);

//         console.log("===================company===================");
//         console.log(company);
//         console.log("===================tenant===================");
//         console.log(tenant);

//         var folderPath = "";
//         if (typeof req.body.folderPath !== 'undefined') {
//             folderPath = req.body.folderPath;
//         }

//         var bucketName = "botmediastorage";
//         if (typeof req.body.bucketName !== 'undefined') {
//             bucketName = req.body.bucketName;
//         }

//         var contentType = "";
//         if (typeof req.body.contentType !== 'undefined') {
//             contentType = req.body.contentType;
//         } else if (typeof req.files.Image.type !== 'undefined') {
//             contentType = req.files.Image.type;
//         }

//         var imageName = req.files.Image.name;
//         var imageFullPath = tenant + "/" + company + "/" + folderPath + imageName;

//         var params = {
//             localFile: req.files.Image.path,

//             s3Params: {
//                 Bucket: bucketName,
//                 Key: imageFullPath,
//                 ACL: ACL,
//                 ContentType: contentType
//                 // other options supported by putObject, except Body and ContentLength.
//                 // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
//             },
//         };
//         console.log("params");
//         console.log(params);
//         var uploader = client.uploadFile(params);
//         uploader.on('error', function (err) {
//             console.error("unable to upload:", err.stack);
//         });
//         uploader.on('progress', function () {
//             console.log("progress", uploader.progressMd5Amount,
//                 uploader.progressAmount, uploader.progressTotal);
//         });
//         uploader.on('end', function (resee) {
//             // console.log(resee);
//             const host = config.Services.botServiceProtocol + "://" + config.Services.botServiceHost + "/DBF/API/1.0.0.0/UploadFileService/UploadFile/";
//             const SecurityToken = config.Services.accessToken;

//             var dimensionsWidth = 0;
//             var dimensionsHeight = 0;
//             if (req.files.Image.type === "image/png" || req.files.Image.type === "image/jpeg") {
//                 var dimensions = sizeOf(req.files.Image.path);
//                 dimensionsWidth = dimensions.width;
//                 dimensionsHeight = dimensions.height;
//             }
//             //console.log(dimensions.width, dimensions.height);
//             let args = {
//                 data: {
//                     "company": company,
//                     "tenant": tenant,
//                     "name": imageName,
//                     "url": "https://s3.amazonaws.com/" + bucketName + "/" + imageFullPath,
//                     "folderPath": folderPath,
//                     "size": req.files.Image.size,
//                     "type": contentType,
//                     "width": dimensionsWidth,
//                     "height": dimensionsHeight,
//                     "contentType": contentType
//                 },
//                 headers: {
//                     "Content-Type": "application/json",
//                     "authorization": "Bearer " + SecurityToken
//                 }
//             };
//             let client = new Client();

//             console.log("===================host===================");
//             console.log(host);
//             console.log("===================args===================");
//             console.log(args);

//             client.post(host, args, function (data, response) {
//                 console.log("===================data===================");
//                 console.log(data);

//                 let respond = JSON.parse(data.toString('utf8'));

//                 console.log("===================respond===================");
//                 console.log(respond);

//                 var json = {
//                     'IsSuccess': respond.IsSuccess,
//                     'url': 'https://s3.amazonaws.com/' + bucketName + '/' + imageName
//                 };
//                 res.send(json);
//                 return next();
//             });
//         });
//     } else {
//         var json = {
//             'IsSuccess': false,
//             'reason': 'image file not found'
//         };
//         res.send(json);
//         return next();
//     }
// });

// server.post('/media/:company/:tenant/download', splitAction(), permissionManager({
//     permission: 'Media:R',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     console.log("=======================Entered media service DOWNLOAD method==============================");

//     AWS.config.update({
//         accessKeyId: config.S3.accessKeyId,
//         secretAccessKey: config.S3.secretAccessKey
//     });

//     var S3 = new AWS.S3();

//     const params = {
//         Bucket: 'botmediastorage',
//         Key: req.body.fileName
//     };

//     S3.getObject(params, (err, data) => {
//         if (err) {
//             console.error(err);
//             var json = {
//                 'isSuccess': false,
//                 'reason': 'File downloading has failed',
//                 'data': ''
//             };
//             res.send(json);
//         }

//         try {
//             // console.log(data);
//             // the data comes as Buffer type data from S3. 
//             // That Buffer type data is converted into base64 data from the below line.
//             let encoded = data.Body.toString('base64');

//             var json = {
//                 'contentLength': data.ContentLength,
//                 'contentType': data.ContentType,
//                 'data': encoded,
//                 'isSuccess': true,
//                 'reason': 'File downloaded successfully'
//             };
//             res.send(json);

//         } catch (error) {
//             console.log(error);
//             var json = {
//                 'isSuccess': false,
//                 'reason': 'File data conversion has failed',
//                 'data': error.message
//             };
//             res.send(json);
//         }
//     })
// });




// server.post('/binary/:company/:tenant/upload', splitAction(), permissionManager({
//     permission: 'Media:C',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     console.log("========================Entered media service BINARY UPLOAD method=============================");
//     if (req.files) {
//         var params = {
//             localFile: req.files.file.path,

//             s3Params: {
//                 Bucket: 'smoothflowbinaries',
//                 Key: req.params.tenant + "/" + req.params.company + "/" + req.files.file.name,
//                 ACL: 'public-read',
//                 // other options supported by putObject, except Body and ContentLength.
//                 // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
//             },
//         };
//         var uploader = client.uploadFile(params);
//         uploader.on('error', function (err) {
//             console.error("unable to upload:", err.stack);
//         });
//         uploader.on('progress', function () {
//             console.log("progress", uploader.progressMd5Amount,
//                 uploader.progressAmount, uploader.progressTotal);
//         });
//         uploader.on('end', function (resee) {
//             res.send({
//                 IsSuccess: true,
//                 'url': "https://s3.amazonaws.com/smoothflowbinaries/" + req.params.tenant + "/" + req.params.company + "/" + req.files.file.name
//             });
//         });
//     } else {
//         var json = {
//             'IsSuccess': false,
//             'reason': 'image file not found'
//         };
//         res.send(json);
//         return next();
//     }
// });



// server.post('/media/:company/:tenant/deleteFile', splitAction(), permissionManager({
//     permission: 'Media:D',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     console.log("===============================Entered media service DELETE method===========================");

//     if (req) {
//         var company = parseInt(req.user.company);
//         var tenant = parseInt(req.user.tenant);

//         console.log("===================company===================");
//         console.log(company);
//         console.log("===================tenant===================");
//         console.log(tenant);
//         console.log("===================request body===================");
//         console.log(req.body);

//         var folderPath = "";
//         if (typeof req.body.file.folderPath !== 'undefined') {
//             folderPath = req.body.file.folderPath;
//         }

//         var bucketName = "botmediastorage";
//         if (typeof req.body.file.bucketName !== 'undefined' && req.body.file.bucketName !== '') {
//             bucketName = req.body.file.bucketName;
//         }

//         var imageName = req.body.file.name;
//         var imageFullPath = tenant + "/" + company + "/" + folderPath + imageName;

//         var params = {
//             Bucket: bucketName,
//             Delete: { // required
//                 Objects: [ // required
//                     {
//                         Key: imageFullPath // required
//                     }
//                 ],
//             },
//         };

//         var deleteResult = client.deleteObjects(params);
//         deleteResult.on('error', function (err) {
//             console.error("unable to delete:", err.stack);
//             var json = {
//                 'IsSuccess': false,
//                 'Error': err.stack
//             };
//             res.send(json);
//             return next();
//         });
//         deleteResult.on('progress', function () {
//             console.log("progress", deleteResult.progressMd5Amount, deleteResult.progressAmount, deleteResult.progressTotal);
//         });
//         deleteResult.on('data', function (data) {
//             console.log(data);
//         });
//         deleteResult.on('end', function () {
//             console.log("end");

//             const host = config.Services.botServiceProtocol + "://" + config.Services.botServiceHost + "/DBF/API/1.0.0.0/UploadFileService/DeleteUploadFileByPathAndName/" + folderPath + "/" + imageName;

//             let args = {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "authorization": req.headers.authorization
//                 }
//             };

//             console.log("===================host===================");
//             console.log(host);
//             console.log("===================args===================");
//             console.log(args);

//             let client = new Client();

//             client.delete(host, args, function (data, response) {
//                 console.log("===================data===================");
//                 console.log(data);

//                 let respond = JSON.parse(data.toString('utf8'));

//                 console.log("===================respond===================");
//                 console.log(respond);

//                 var json = {
//                     'IsSuccess': respond.IsSuccess
//                 };
//                 res.send(json);
//                 return next();
//             });
//         });
//     } else {
//         var json = {
//             'IsSuccess': false,
//             'reason': 'image file not found'
//         };
//         res.send(json);
//         return next();
//     }
// });

// server.get('/media/:company/:tenant/checkForBucket', splitAction(), permissionManager({
//     permission: 'Media:R',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     var bucketName = "company" + req.user.company + "tenant" + req.user.tenant;

//     var params = {
//         Bucket: bucketName /* required */
//     };

//     AWS.config.update({
//         accessKeyId: config.S3.accessKeyId,
//         secretAccessKey: config.S3.secretAccessKey
//     });

//     var s3 = new AWS.S3();

//     s3.headBucket(params, function (err, data) {
//         if (err) {
//             console.log(err, err.stack); // an error occurred
//             var json = {
//                 'IsSuccess': false,
//                 'reason': err.stack
//             };
//             res.send(json);
//             return next();
//         } else {
//             console.log(data); // successful response
//             var json = {
//                 'IsSuccess': true,
//                 'data': data
//             };
//             res.send(json);
//             return next();
//         }
//     });
// });

// server.post('/media/:company/:tenant/createFolder', splitAction(), permissionManager({
//     permission: 'Media:C',
//     permissionName: 'MediaService'
// }), workSpaceManager(), function (req, res, next) {
//     if (req.body.folder) {

//         var company = parseInt(req.user.company);
//         var tenant = parseInt(req.user.tenant);

//         var bucketName = "company" + req.user.company + "tenant" + req.user.tenant;

//         var folderName = req.body.folder.folderPath + req.body.folder.name + "/";
//         console.log(bucketName);
//         console.log(folderName);


//         // params = {Bucket: myBucket, Key: myKey, Body: data };

//         var params = {
//             Bucket: bucketName,
//             Key: folderName,
//             ACL: ACL
//         };

//         AWS.config.update({
//             accessKeyId: config.S3.accessKeyId,
//             secretAccessKey: config.S3.secretAccessKey
//         });

//         var s3 = new AWS.S3();

//         s3.putObject(params, function (err, data) {
//             if (err) {
//                 console.log("Error creating the folder: ", err);
//                 var json = {
//                     'IsSuccess': false,
//                     'Error': err.stack
//                 };
//                 res.send(json);
//                 return next();
//             } else {
//                 console.log("Successfully created a folder on S3");

//                 // const host = config.Services.botServiceProtocol + "://" + config.Services.botServiceHost + "/DBF/API/1.0.0.0/UploadFileService/CreateFolder";
//                 const host = config.Services.botServiceProtocol + "://" + config.Services.botServiceHost + "/DBF/API/1.0.0.0/UploadFileService/CreateFolder/";
//                 const SecurityToken = config.Services.accessToken;
//                 // var dimensions = sizeOf(req.files.Image.path);
//                 //console.log(dimensions.width, dimensions.height);
//                 let args = {
//                     data: {
//                         "company": company,
//                         "tenant": tenant,
//                         "name": req.body.folder.name,
//                         "url": "https://s3.amazonaws.com/" + bucketName + "/" + folderName,
//                         "folderPath": req.body.folder.folderPath,
//                         "size": "",
//                         "type": "Folder",
//                         "width": 0,
//                         "height": 0,
//                         "contentType": "Folder"
//                     },
//                     headers: {
//                         "Content-Type": "application/json",
//                         "authorization": "Bearer " + SecurityToken
//                     }
//                 };


//                 let client = new Client();
//                 console.log(args);
//                 console.log(host);
//                 console.log(SecurityToken);
//                 client.post(host, args, function (data, response) {
//                     console.log(data);
//                     let respond = JSON.parse(data.toString('utf8'));
//                     console.log(respond);
//                     var json = {
//                         'IsSuccess': respond.IsSuccess,
//                         'url': 'https://s3.amazonaws.com/' + bucketName + "/" + folderName
//                     };
//                     res.send(json);
//                     return next();
//                 });
//             }
//         });
//     } else {
//         var json = {
//             'IsSuccess': false,
//             'reason': 'image file not found'
//         };
//         res.send(json);
//         return next();
//     }
// });