# Licensed under the Apache License. See footer for details.

require "cakex"

#-------------------------------------------------------------------------------
task "watch", "watch for source file changes, restart server", -> taskWatch()
task "serve", "start server",                                  -> taskServe()

WatchSpec = "*.js lib/**/* article.md"

mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
taskWatch = ->
  buildArticle()
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

  copyBowerFiles "www/bower"

  taskServe()

#-------------------------------------------------------------------------------
taskServe = ->
  log "restarting server"

  process.env.DEBUG = "loggy:*"
  daemon.start "server", "node", ["server"]

#-------------------------------------------------------------------------------
buildArticle = ->
  coffee "article-build.coffee"

#-------------------------------------------------------------------------------
copyBowerFiles = (dir) ->
  bowerConfig = require "./bower-config"

  log "installing files from bower"
  
  cleanDir dir

  for name, {version, files} of bowerConfig
    unless test "-d", "bower_components/#{name}"
      bower "install #{name}##{version}"
      log ""

  for name, {version, files} of bowerConfig
    for src, dst of files
      src = "bower_components/#{name}/#{src}"

      if dst is "."
        dst = "#{dir}/#{name}"
      else
        dst = "#{dir}/#{name}/#{dst}"

      mkdir "-p", dst

      cp "-R", src, dst

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

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
