# Licensed under the Apache License. See footer for details.

require "cakex"

#-------------------------------------------------------------------------------
main = ->
  file    = "article.md"
  content = cat file
  match   = content.match /<!--(.*?)-->/
  title   = "no title specified"
  title   = match[1].trim() if match?

  base = splitExt file

  log "building article ..."
  log "running Markdown"
  {code, output} = exec "Markdown.pl #{file}", silent: true
  logError "status Markdown.pl: #{code}" if code isnt 0

  oFile = "tmp/#{base}.raw.html"
  dFile = "#{base}.html"
  wFile = "www/#{base}.html"

  output.to oFile
  log "generated #{oFile}"

  htmlPrefix = htmlPrefixBase.replace("%title%", title)

  "#{htmlPrefix}\n#{output}".to dFile
  log "generated #{dFile}"

  rm wFile if test "-f", wFile
  cp dFile, wFile
  log "generated #{wFile}"

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

blockquote {
  font-weight:        bold;
  font-style:         italic;
  border-left:        thin solid #000;
  padding-left:       1em;
}}

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
main()

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
