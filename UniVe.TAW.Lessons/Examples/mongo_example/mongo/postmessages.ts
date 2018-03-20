/**
 *  Simple HTTP REST server + MongoDB (Mongoose)
 * 
 *  Post and get simple text messages. Each message has a text content, a list of tags
 *  and an associated timestamp
 *  All the posted messages are stored in a MongoDB collection
 * 
 * 
 *  Endpoints          Attributes          Method        Description
 * 
 *     /                  -                  GET         Returns the version and a list of available endpoints
 *     /messages        ?tags=               GET         Returns all the posted messages, optionally filtered by tags
 *                      ?skip=n
 *                      ?limit=m
 *     /messages          -                  POST        Post a new message
 *     /messages        ?id=<id>             DELETE      Delete a message by id
 *     /tags              -                  GET         Get a list of tags
 * 
 * 
 * ------------------------------------------------------------------------------------ 
 *  To install the required modules:
 *  $ npm install
 * 
 *  To compile:
 *  $ npm run compile
 * 
 *  To run:
 *  $ node run start
 * 
 *  To manually inspect the database:
 *  > use postmessages
 *  > show collections
 *  > db.messages.find( {} )
 *  
 *  to delete all the messages:
 *  > db.messages.deleteMany( {} )
 * 
 */


import http = require('http');                // HTTP module
import url = require('url');                  // url module is used to parse the query section of the URL
import fs = require('fs');                    // filesystem module
import colors = require('colors');
colors.enabled = true;


import mongoose = require('mongoose');
import {Message} from './Message';
import * as message from './Message';




var server = http.createServer( function( req, res ) {

    // This function will be invoked asynchronously for every incoming connection

    console.log("New connection".inverse);
    console.log("REQUEST:")
    console.log("     URL: ".red + req.url );
    console.log("  METHOD: ".red + req.method );
    console.log(" Headers: ".red + JSON.stringify( req.headers ) );

    var body: string = "";

    req.on("data", function( chunk ) {
        body = body + chunk;

    }).on("end", function() {
        console.log("Request end");

        var respond = function( status_code: number, response_data: Object ) : void {
            res.writeHead(status_code, { "Content-Type": "application/json" });
            res.write(JSON.stringify(response_data), "utf-8");
            res.end();
        }


        if( req.url == "/" && req.method=="GET") {
            return respond(200, { api_version: "1.0", endpoints: [ "/messages", "/tags" ] });
        }

        else if( req.url.search( "/messages" )!=-1 && req.method == "GET" ) {

            var query = url.parse( req.url, true /* true=parse query string*/).query;
            console.log(" Query: ".red + JSON.stringify(query));

            var filter = {};
            if( query.tags ) {
                filter = { tags: {$all: query.tags } };
            }
            console.log("Using filter: " + JSON.stringify(filter) );

            query.skip = parseInt( query.skip || "0" ) || 0;
            query.limit = parseInt( query.limit || "20" ) || 20;

            message.getModel().find( filter ).skip( query.skip ).limit( query.limit ).then( (documents) => {
                return respond( 200, documents );
            }).catch( (reason) => {
                return respond(404, { error: true, errormessage: "DB error:"+reason });
            })
        }
        else if( req.url == "/messages" && req.method == "POST" ) {
             console.log("Received: " + body);

             try {
                 var recvmessage = JSON.parse(body);
                 recvmessage.timestamp = new Date();

                 if( message.isMessage( recvmessage ) ) {

                    message.getModel().create( recvmessage ).then( ( data ) => {
                        respond(200,  { error: false, errormessage: "", id: data._id } );
                    }).catch((reason) => {
                        return respond(404, { error: true, errormessage: "DB error"+reason });
                    } )

                 } else {
                    return respond(404, { error: true, errormessage: "Data is not a valid Message" });
                 }
             } catch( e ) {
                return respond(404, { error: true, errormessage: "JSON parse failed" });
            }
        }
        else if( req.url == "/tags" && req.method == "GET" ) {
            message.getModel().distinct("tags").then( (taglist) => {
                return respond( 200, taglist );
            }).catch( (reason)=>{
                return respond(404, { error: true, errormessage: "DB error"+reason });
            })
        }
        else if( req.url.search( "/messages" )!=-1 && req.method == "DELETE" ) {
            var query = url.parse( req.url, true /* true=parse query string*/).query;
            console.log(" Query: ".red + JSON.stringify(query));
            message.getModel().deleteOne( {_id: query.id } ).then( ()=> {
                return respond( 200, {error:false, errormessage:""} );
            }).catch( (reason)=> {
                return respond(404, { error: true, errormessage: "DB error"+reason });
            })
        }
        else {
            return respond(404, { error: true, errormessage: "Invalid endpoint/method" });
        }

    });

});



/*
*/
mongoose.connect( 'mongodb://localhost:27017/postmessage' ).then( 
    function onconnected() {

        console.log("Connected to MongoDB");

        message.getModel().count({}).then(
            ( count ) => {
                if( count == 0 ) {
                    console.log("Adding some test data into the database");
                    var m1 = message
                      .getModel()
                      .create({
                        tags: ["Tag1", "Tag2", "Tag3"],
                        content: "Post 1",
                        timestamp: new Date()
                      });
                    var m2 = message
                      .getModel()
                      .create({
                        tags: ["Tag1", "Tag5"],
                        content: "Post 2",
                        timestamp: new Date()
                      });
                    var m3 = message
                      .getModel()
                      .create({
                        tags: ["Tag6", "Tag10"],
                        content: "Post 3",
                        timestamp: new Date()
                      });

                    Promise.all([m1, m2, m3])
                      .then(function() {
                        console.log("Messages saved");
                      })
                      .catch(function(reason) {
                        console.log("Unable to save: " + reason);
                      });

                }
            }
        )
        server.listen( 8080, function() {
            console.log("HTTP Server started on port 8080");
        });


    },
    function onrejected() {
        console.log("Unable to connecto to MongoDB");
    }
)