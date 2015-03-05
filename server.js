// Licensed under the Apache License. See footer for details.

//------------------------------------------------------------------------------
// packages/modules we're using
//------------------------------------------------------------------------------

var hapi  = require("hapi")
var cfenv = require("cfenv")

var debug         = require("./lib/debug")
var altStackTrace = require("./lib/altStackTrace")

//------------------------------------------------------------------------------
// create some debug loggers; the `debug.createDebug()` function will return
// a new function, which prints the prefix passed in to `debug.createDebug()`,
// and then the string passed to the new function.  Operates much like the
// npm `debug` package, but simpler and less functional.
//------------------------------------------------------------------------------

var DEBUGinit  = debug.createDebug("loggy:init")
var DEBUGinfo  = debug.createDebug("loggy:info")
var DEBUGserver= debug.createDebug("loggy:server")
var DEBUGexit  = debug.createDebug("loggy:exit")
var DEBUGerror = debug.createDebug("loggy:error")

//------------------------------------------------------------------------------
// start logging! For processing at "initialization" time, use the `DEBUGinit()`
// function to make sure all the messages are labeled as occurring during
// initialization
//------------------------------------------------------------------------------

DEBUGinit("application starting")

//------------------------------------------------------------------------------
// enable the altStackTrace module
//------------------------------------------------------------------------------

DEBUGinit("enabling alternate stack trace")
altStackTrace.enable()

//------------------------------------------------------------------------------
// add an exit handler
// - https://iojs.org/api/process.html#process_event_exit
//
// This handler will just print a message, before the process terminates.
// So you know the process terminated.
//------------------------------------------------------------------------------

DEBUGinit("adding exit handler")
process.on("exit", function(code) {
  DEBUGexit("code: " + code)
})

//------------------------------------------------------------------------------
// add an uncaught exception handler
// - https://iojs.org/api/process.html#process_event_uncaughtexception
//
// This handler will print the stack trace (in `err.stack`), and then exit.
// Which will fire the exit handler above, next.
//------------------------------------------------------------------------------

DEBUGinit("adding uncaught exception handler")
process.on("uncaughtException", function(err) {
  DEBUGerror("exception: " + err.stack)
  process.exit(1)
})

//------------------------------------------------------------------------------
// get the application environment from `VCAP_` env vars or local defaults
// - for more info: http://npmjs.org/package/cfenv
//------------------------------------------------------------------------------

DEBUGinit("getting application environment")
var appEnv = cfenv.getAppEnv()

//------------------------------------------------------------------------------
// create the Hapi server
// - for more info: http://hapijs.com/
//------------------------------------------------------------------------------

DEBUGinit("creating Hapi server")
var server = new hapi.Server()

//------------------------------------------------------------------------------
// set up the host/port of the Hapi server
//------------------------------------------------------------------------------

DEBUGinit("setting host/port for server")
server.connection({host: appEnv.bind, port: appEnv.port})

//------------------------------------------------------------------------------
// Hook into Hapi's error events, to work the same as the uncaught exception
// handler above.
// - for more info: http://hapijs.com/api#server-events
//------------------------------------------------------------------------------

DEBUGinit("setting up Hapi error handler to debug log and exit")
server.on("request-error", function (request, err) {
  DEBUGerror("exception: " + err.stack)
  process.exit(1)
})

//------------------------------------------------------------------------------
// set up the route for our static files
//------------------------------------------------------------------------------

DEBUGinit("setting up route for static files")
server.route({
  method:  "GET",
  path:    "/{param*}",
  handler: { directory: { path: "www" } }
})

//------------------------------------------------------------------------------
// set up the routes for our *killer* (heh) APIs
//------------------------------------------------------------------------------

DEBUGinit("setting up routes for APIs")
server.route({ method: "GET", path: "/api/memHawg", handler: apiMemHawg })
server.route({ method: "GET", path: "/api/exit0",   handler: apiExit0   })
server.route({ method: "GET", path: "/api/exit1",   handler: apiExit1   })
server.route({ method: "GET", path: "/api/error",   handler: apiError   })

//------------------------------------------------------------------------------
// log a message BEFORE the server starts listening
//------------------------------------------------------------------------------

DEBUGserver("starting on: " + appEnv.url)

//------------------------------------------------------------------------------
// log a message AFTER the server starts listening
//------------------------------------------------------------------------------

server.start(function() {
  DEBUGserver("started  on: " + appEnv.url)
})

//------------------------------------------------------------------------------
// our API handlers; we'll reply with a JSON object to each, but then do
// something nasty afterwards
//------------------------------------------------------------------------------
function apiMemHawg(request, reply) { reply({}); eatMemory() }
function apiExit0(request, reply)   { reply({}); process.exit(0) }
function apiExit1(request, reply)   { reply({}); process.exit(1) }
function apiError(request, reply)   { reply({}); throw new Error("expected") }

//------------------------------------------------------------------------------
// rando-ish number used during the process of EATING ALL YOUR MEMORY
//------------------------------------------------------------------------------

var LOTS = 1000 * 1000 * 1000

//------------------------------------------------------------------------------
// This function will consume all memory your process has access to.
//------------------------------------------------------------------------------

function eatMemory() {
  DEBUGinfo("eatMemory: start")
  var x = []
  for (var i=1; i<LOTS; i++) {
    if (0 == i%10000) DEBUGinfo("eatMemory: " + i)
    x[i] = repeat(" " + i, i)
  }
}

//------------------------------------------------------------------------------
// utility function to create repetitive strings
//------------------------------------------------------------------------------

function repeat(string, times) {
  var result = ""

  for (var i=0; i<times; i++) {
    result += string
  }

  return result
}

//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
