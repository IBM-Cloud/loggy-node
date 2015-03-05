<!-- add more logging! -->

> The most effective debugging tool is still careful thought,
> coupled with judiciously placed print statements.
>
> -- Brian Kernighan, "Unix for Beginners" (1979)

It's very often the case that when a Bluemix app doesn't work the way you
expect it to, you don't have any idea **WHY** it doesn't work the way you
expect it to.  How can you diagnose this?  With **logging**.

This article will discuss how to access your logs in Bluemix, discuss some
general logging techniques, and then go in depth on some
logging frameworks/libraries specific to node.js.  If you aren't using node.js,
have no fear that your language runtime provides multiple, elaborate logging
frameworks and libraries - they all do - find them and use them!

The section on node.js logging refers to a GitHub repository
[IBM-Bluemix/loggy-node][], which contains an application you can deploy on
Bluemix that demonstrates some logging techniques.  You can clone that
repo and deploy on Bluemix
by clicking the Deploy to Bluemix button, below.

<p><center>
<a href="https://bluemix.net/deploy?repository=https://github.com/IBM-Bluemix/loggy-node" target="blank">
<img src="http://bluemix.net/deploy/button.png" alt="Bluemix button">
</a>
</center>



accessing your logs using `cf logs`
--------------------------------------------------------------------------------

For more information on the basics of accessing your logs with `cf logs`, refer
to my colleague Ryan Baxter's great article on
"[Accessing Application Logs In Bluemix][ryanb-blog-entry]".  No need to repeat
that info here.

A couple additional notes on the subject of `cf logs`:

*   Make sure you're running the latest version of the `cf` command line tool;
    it is updated fairly frequently.  And the logging componentry in Cloud Foundry
    (and thus Bluemix), and in the `cf` tool, has also been updated a bit over
    the last few months.  

    The latest releases can always be found at
    <https://github.com/cloudfoundry/cli/releases>.  You can check which version
    you currently have installed, by running `cf --version`

*   The general pattern for lines from `cf logs` is as follows, with a column number
    legend above it.

                 1         2         3         4         5
        12345678901234567890123456789012345678901234567890
        -----------------------------------------------------------
        2015-03-05T09:20:00.17-0500 [App/0]      OUT <message here>

    You can partition the message into 4 pieces - timestamp, component that
    generated the message, stream the message was written to, and the
    message itself.

    In the message above, the component that generated the message was your
    application (eg, `[App/<instance #>]`), and the message was written to
    stdout.

    There's a lot of stuff there; you might want to cut some of it out.  You can
    do that by filtering the output with a unix `cut` command.  Here's a script
    that lets you do some customization yourself, with "fields" named as shell
    variables:

    <noscript>
      <a href="https://gist.github.com/pmuellr/5e5cc10c19b71d9599a1#file-cf-log-cut">
        see this gist
      </a>
    </noscript>
    <script
      src="https://gist.github.com/pmuellr/5e5cc10c19b71d9599a1.js?file=cf-log-cut">
    </script>

    You'll also end up seeing `[RTR/nnn]` messages in your logs, which are basically
    the same kind of thing you'd see from a web server log.  Often these aren't
    useful, and ... THEY ARE VERY LOOOOOOOONG.
    You can elide them with `grep`, as this script does:

    <noscript>
      <a href="https://gist.github.com/pmuellr/5e5cc10c19b71d9599a1#file-cf-log-no-rtr">
        see this gist
      </a>
    </noscript>
    <script
      src="https://gist.github.com/pmuellr/5e5cc10c19b71d9599a1.js?file=cf-log-no-rtr">
    </script>

    Putting that all together, you might want to run `cf logs` using this command
    instead:

        cf logs [app-name] | cf-log-no-rtr | cf-log-cut

    With these techniques, you can go from this:

        2015-03-05T14:42:54.46-0500 [RTR/0]      OUT [host].mybluemix.net - [05/03/2015:19:42:54 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.74 Safari/537.36" 75.126.70.46:15114 x_forwarded_for:"-" vcap_request_id:9a0cf781-ca3b-43c1-6f36-b6e8f4414984 response_time:0.008147682 app_id:[app-id]
        2015-03-05T14:43:14.60-0500 [API/8]      OUT Updated app with guid [app-id] ({"state"=>"STARTED"})
        2015-03-05T14:43:14.62-0500 [DEA/14]     OUT Starting app instance (index 0) with guid [app-id]
        2015-03-05T14:43:14.84-0500 [DEA/126]    OUT Stopping app instance (index 0) with guid [app-id]
        2015-03-05T14:43:14.84-0500 [DEA/126]    OUT Stopped app instance (index 0) with guid [app-id]
        2015-03-05T14:43:32.77-0500 [App/0]      OUT loggy:init: enabling alternate stack trace
        2015-03-05T14:43:32.79-0500 [App/0]      OUT loggy:init: setting up routes for APIs
        2015-03-05T14:43:32.79-0500 [App/0]      OUT loggy:server: starting on: https://[host].mybluemix.net
        2015-03-05T14:43:32.80-0500 [App/0]      OUT loggy:server: started  on: https://[host].mybluemix.net
        2015-03-05T14:44:10.49-0500 [RTR/0]      OUT [host].mybluemix.net - [05/03/2015:19:44:10 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.74 Safari/537.36" 75.126.70.42:54721 x_forwarded_for:"-" vcap_request_id:44c7efdf-9a88-451c-4308-cd6bb03af666 response_time:0.005201182 app_id:[app-id]  

    to this:

        14:43:14 Updated app with guid [app-id] ({"state"=>"STARTED"})
        14:43:14 Starting app instance (index 0) with guid [app-id]
        14:43:14 Stopping app instance (index 0) with guid [app-id]
        14:43:14 Stopped app instance (index 0) with guid [app-id]
        14:43:32 loggy:init: enabling alternate stack trace
        14:43:32 loggy:init: setting up routes for APIs
        14:43:32 loggy:server: starting on: https://[host].mybluemix.net
        14:43:32 loggy:server: started  on: https://[host].mybluemix.net  



accessing your logs using a third party service
--------------------------------------------------------------------------------

Again, Ryan Baxter's great article on
"[Accessing Application Logs In Bluemix][ryanb-blog-entry]" provides all the
info you'll need to hook up a 3rd party logging service to collect your app's
logs.



general logging techniques
--------------------------------------------------------------------------------

*   **find a logging framework / library that works for you**

    There are many for all the programming runtime environments out there.  Google
    "logging" and your language name, then **START READING AND EXPERIMENTING**.
    You can probably find something off-the-shelf that suits your application,
    but if not, you can always write a simple one yourself.  Just always seems that
    those "simple" ones become complex, at which point you should have used some
    nice off-the-shelf component.

*   **errors often occur during initialization**

    So, add lots of logging during initialization.  Initialization only happens
    once in your app - well, once per each app instance started.  But, that's
    not often, so **GO CRAZY**.

*   **log conditions at process termination, if possible**

    Many programming language runtimes provide a way to get a "hook" to process
    termination, so you can clean up after yourself, log some messages, etc.
    **TAKE ADVANTAGE OF THIS**.  Below, I'll show using the hooks in node.js to
    adding some logging when your process ends (usually).



logging frameworks/libraries specific to node.js
--------------------------------------------------------------------------------

*   **`console.log()` &amp; family**

    The `printf()` of the node.js world.  But there's more!  Check out
    the [console docs][] for all the capabilities.

*   **the `debug` package**

    The [debug package][] provides some really nice looking output, when
    you run it from a terminal.  It's also pretty easy to use, and allows you
    to determine which debug loggers should print via an environment variable.

    Unfortunately, it doesn't work so well when not attached to a terminal, like
    the way your app runs on Cloud Foundry.  It prints out ANOTHER time-stamp
    in the output.  So I don't use it.  However, I liked the interface so much
    I copied it into my
    [super-simple debug logger][loggy-debug]
    included with the sample application.

*   **the `winston` package**

    The [winston package][] is sort of the Log4J of the JavaScript world; if
    you're coming from Java, and have used one of the standard logging libraries,
    you will feel right at home with winston.

*   **the `bunyan` package**

    The [bunyan package][] provides an interesting twist to the logging world;
    rather than just print *messages*, it prints *objects*, as JSON.  This of
    course helps solve the age-old question of "*how do I provide richer, more
    precise data in my log messages*".  The price you pay is that you will
    likely need to use a filter to provide something readable to humans.  A
    command-line filter is provided with the bunyan package.

*   **thousands of others packages ...**

    [6508 packages][], to be precise (at the time of this writing).  You might
    like the search results better at [node-modules.com][] though.



sample app showing off some logging
--------------------------------------------------------------------------------

As mentioned above, several times, I put together a little sample application
that does a lot of logging, available at the GitHub repository
[IBM-Bluemix/loggy-node][].  The application presents a web page with
buttons on it that will end up killing the server.  This is so you can see
what actually happens when your server dies.

Let's walk through some of the bits:

*   **[`server.js`](https://github.com/IBM-Bluemix/loggy-node/blob/master/server.js)**

    This is the main program of the application.  It's heavily commented, so
    there's no need to go into details here, but here are some interesting
    points:

    * Make it easy to log a message, eg, the `DEBUGinit()` et al functions.
    * Do a lot of logging during initialization.
    * Set up global exit and error handlers that log messages.
    * Log a message right **BEFORE** your server starts, and right **AFTER**
      your server starts.  In those messages, print at least the port your
      server is bound to, or the complete URL if available.

*   **[`lib/altStackTrace.js`](https://github.com/IBM-Bluemix/loggy-node/blob/master/lib/altStackTrace.js)**

    The V8 JavaScript engine has a really cool feature that allows you to
    generate your own formatted stack trace.  See the
    [JavaScriptStackTraceApi wiki page][JavaScriptStackTraceApi] for more
    information.  This is just eye candy, in this case, but you may find some
    other interesting use for it.

*   **[`lib/debug.js`](https://github.com/IBM-Bluemix/loggy-node/blob/master/lib/debug.js)**

    This is my super-simple module that acts kind of like the npm `debug` package.
    Couldn't be simpler.  In a separate module, because you know you'll be
    using this in more than one module.



what the sample app logs
--------------------------------------------------------------------------------

Last bit is to show you what it logs, when you press the buttons in the app.
I'll show the cut/non-RTR log as demonstrated previously, with the time
also elided.


*   **button "have the process exit with status 0"**

        loggy:init: application starting
        loggy:init: enabling alternate stack trace
        loggy:init: adding exit handler
        loggy:init: adding uncaught exception handler
        loggy:init: getting application environment
        loggy:init: creating Hapi server
        loggy:init: setting host/port for server
        loggy:init: setting up Hapi error handler to debug log and exit
        loggy:init: setting up route for static files
        loggy:init: setting up routes for APIs
        loggy:server: starting on: https://loggy-node-pjm.mybluemix.net
        loggy:server: started  on: https://loggy-node-pjm.mybluemix.net
        loggy:exit: code: 0
        App instance exited with guid ... payload: {...}

    Note that the `payload` bit in the last message often contains juicy bits
    of information.  In this case, there wasn't much, besides
    `exit_status"=>0`, which is what we expected.


*   **button "have the process exit with status 1"**

    Same as above, only this time, the `payload` bit in the last message
    contains `exit_status"=>1`, which, again, is what we expected.

*   **button "throw an uncaught exception"**

    This time there are some more interesting messages:

        loggy:error: exception: Error: Uncaught error: expected
          server.js:145:                                        apiError()
          node_modules/hapi/lib/handler.js:94:                  internals.handler()
          node_modules/hapi/lib/handler.js:28:                  <anon>()
          node_modules/hapi/lib/protect.js:56:                  internals.Protect.run()
          node_modules/hapi/lib/handler.js:22:                  exports.execute()
          node_modules/hapi/lib/request.js:321:                 <anon>()
          node_modules/hapi/node_modules/items/lib/index.js:35: iterate()
          node_modules/hapi/node_modules/items/lib/index.js:27: done()
          node_modules/hapi/node_modules/hoek/lib/index.js:781: <anon>()
          node.js:376:                                          tickDomainCallback()
        loggy:exit: code: 1

    Look at that **GORGEOUS** stack trace, courtesy the `altStackTrace` module!

    The payload still has `exit_status"=>1`, because our uncaught exception
    handler calls `process.exit(1)`.

*   **button "consume all memory"**

    In this case, there won't be **ANY** of our logging messages, because there's
    no way to "hook" out of memory conditions in node.js.  Be wary of any
    programming language runtime that offers such a thing.  How much work can
    you do in an "out of memory" handler if ... you have no memory.  Yeah, not
    much.

    What you will see is the `App instance exited` message, with something new
    in the `payload`: `"exit_description"=>"out of memory"`.  Neat!  Cloud
    Foundry was able to figure out we were out of memory, and told us via the
    exit message.

    I should note that while testing the "consume all memory" button, I didn't
    **ALWAYS** see the `out of memory` description.  Most of the time, but not
    all the time.  When you run out of memory, things get weird.



<!-- ======================================================================= -->
[JavaScriptStackTraceApi]:     https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
[process-exit]:                https://iojs.org/api/process.html#process_event_exit
[process-error]:               https://iojs.org/api/process.html#process_event_uncaughtexception
[node-modules.com]:            http://node-modules.com/search?q=log
[loggy-debug]:                 https://github.com/IBM-Bluemix/loggy-node/blob/master/lib/debug.js
[debug package]:               https://www.npmjs.com/package/debug
[winston package]:             https://www.npmjs.com/package/winston
[bunyan package]:              https://www.npmjs.com/package/bunyan
[6508 packages]:               https://www.npmjs.com/search?q=log
[console docs]:                https://iojs.org/api/console.html#console_console
[ryanb-blog-entry]:            https://developer.ibm.com/bluemix/2014/10/29/accessing-application-logs-bluemix/
[cf-releases]:                 https://github.com/cloudfoundry/cli/releases
[IBM-Bluemix/loggy-node]:      https://github.com/IBM-Bluemix/loggy-node
[cf-doc-log-management]:       http://docs.cloudfoundry.org/devguide/services/log-management.html
[bluemix-blog-log-management]: https://amanoblog.wordpress.com/2014/08/12/using-3rd-party-log-management-service-for-bluemix-application/
