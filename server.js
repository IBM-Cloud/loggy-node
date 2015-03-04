// Licensed under the Apache License. See footer for details.

//------------------------------------------------------------------------------
// packages/modules we're using
//------------------------------------------------------------------------------

var hapi  = require("hapi")
var cfenv = require("cfenv")

var debug = require("./lib/debug")

var altStackTrace = require("./lib/altStackTrace")

//------------------------------------------------------------------------------
// some debug loggers
//------------------------------------------------------------------------------

var DEBUGinit  = debug.createDebug("loggy:init")
var DEBUGinfo  = debug.createDebug("loggy:info")
var DEBUGserver= debug.createDebug("loggy:server")
var DEBUGexit  = debug.createDebug("loggy:exit")
var DEBUGerror = debug.createDebug("loggy:error")

DEBUGinit("enabling alternate stack trace")
altStackTrace.enable()

DEBUGinit("adding exit handler")
process.on("exit", function(code) {
  DEBUGexit("code: " + code)
})

DEBUGinit("adding uncaught exception handler")
process.on("uncaughtException", function(err) {
  DEBUGerror("exception: " + err.stack)
  process.exit(1)
})

//------------------------------------------------------------------------------
// start of main processing
//------------------------------------------------------------------------------

DEBUGinit("getting application environment")
var appEnv = cfenv.getAppEnv()

DEBUGinit("creating Hapi server")
var server = new hapi.Server()

DEBUGinit("setting host/port for server")
server.connection({host: appEnv.bind, port: appEnv.port})

DEBUGinit("setting up Hapi error handler to debug log and exit")
server.on("request-error", function (request, err) {
  DEBUGerror("exception: " + err.stack)
  process.exit(1)
})

DEBUGinit("setting up route for static files")
server.route({
  method:  "GET",
  path:    "/{param*}",
  handler: { directory: { path: "www" } }
})

DEBUGinit("setting up routes for APIs")
server.route({ method: "GET", path: "/api/memHawg", handler: apiMemHawg })
server.route({ method: "GET", path: "/api/exit0",   handler: apiExit0   })
server.route({ method: "GET", path: "/api/exit1",   handler: apiExit1   })
server.route({ method: "GET", path: "/api/error",   handler: apiError   })

DEBUGserver("starting on: " + appEnv.url)

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
var LOTS = 1000 * 1000 * 1000

function eatMemory() {
  DEBUGinfo("eatMemory: start")
  var x = []
  for (var i=1; i<LOTS; i++) {
    if (0 == i%10000) DEBUGinfo("eatMemory: " + i)
    x[i] = repeat(" " + i, i)
  }
}

//------------------------------------------------------------------------------
function repeat(string, times) {
  var result = ""

  for (var i=0; i<times; i++) {
    result += string
  }

  return result
}

//------------------------------------------------------------------------------
// Copyright 2014 Patrick Mueller
//
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
