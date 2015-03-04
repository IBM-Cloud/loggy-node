# Licensed under the Apache License. See footer for details.

require "cakex"

#-------------------------------------------------------------------------------
task "watch", "watch for source file changes, restart server", -> taskWatch()
task "serve", "start server",                                  -> taskServe()

WatchSpec = "*.js lib/**/* article.md"

mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
taskWatch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  watch
    files: "Cakefile"
    run: (file) ->
      return unless file == "Cakefile"
      log "Cakefile changed, exiting"
      exit 0

#-------------------------------------------------------------------------------
watchIter = (file) ->
  if (file == "article.md")
    buildArticle()
    return

  taskServe()

#-------------------------------------------------------------------------------
taskServe = ->
  log "restarting server at #{new Date()}"

  process.env.DEBUG = "loggy:*"
  daemon.start "server", "node", ["server"]

#-------------------------------------------------------------------------------
buildArticle = ->
  file    = "article.md"
  content = cat file
  match   = content.match /<!--(.*?)-->/
  title   = "no title specified"
  title   = match[1].trim() if match?

  base = splitExt file

  {code, output} = exec "Markdown.pl #{file}", silent: true
  logError "status Markdown.pl: #{code}" if code isnt 0

  oFile = "tmp/#{base}.html"
  dFile = "tmp/#{base}.dev.html"

  output.to oFile
  log "generated #{oFile}"

  htmlPrefix = htmlPrefixBase.replace("%title%", title)

  "#{htmlPrefix}\n#{output}".to dFile
  log "generated #{dFile}"

#-------------------------------------------------------------------------------
splitExt = (file) ->
    ext = path.extname file
    return file.substr 0, file.length-ext.length

#-------------------------------------------------------------------------------
htmlPrefixBase = """
    <style>
    body {
        margin-left:        5em;
        margin-right:       5em;
        font-size:          120%;
        line-height:        1.4;
        zz-min-width:          740px;
        zz-max-width:          740px;
    }

    p-zzz {
        font-size:          120%;
        line-height:        1.4;
    }

    a, a:visited {
        color:              #2187bb;
    }

    code {
        zz-font-size:          18px;
        zz-line-height:        24px;
    }

    pre {
        margin-left:        1em;
        overflow:           auto;
        background-color:   #EBECE4;
        padding:            0.5em;
        border:             solid thin #CCF;
        font-size:          18px;
        line-height:        24px;
    }

    h1 {
        color:              rgb(33, 135, 187);
        font-family:        Consolas;
        font-size:          42px;
        font-weight:        bold;
    }
    </style>

    <h1>%title%</h1>
"""


#-------------------------------------------------------------------------------
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------------
