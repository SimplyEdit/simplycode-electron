#!/usr/bin/env bash
current_pwd=`pwd`

if [[ ${INIT_CWD} != ${current_pwd} ]]; then
  exit 0; # Skip posinstall when we are installed as a dependancy
fi


installSimplyEdit() {
    local sSourceDir sTargetDir

    readonly sSourceDir="${npm_config_local_prefix}/node_modules/simplyedit"
    readonly sTargetDir="${npm_config_local_prefix}/simplycode"

    mkdir -p \
        "${sTargetDir}/js/" \
        "${sTargetDir}/hope/" \
        "${sTargetDir}/simply/" \

    cp -a "${sSourceDir}/js/"* "${sTargetDir}/js"
    cp -a "${sSourceDir}/hope/"* "${sTargetDir}/hope"
    cp -a "${sSourceDir}/simply/"* "${sTargetDir}/simply"
}

installSimplyView() {
    local sSourceDir sTargetDir

    readonly sSourceDir="${npm_config_local_prefix}/node_modules/simplyview"
    readonly sTargetDir="${npm_config_local_prefix}/simplycode"
    cp -a "${sSourceDir}/dist/simply.everything.js"* "${sTargetDir}/js/simply.everything.js"
}

installCodeMirror() {
    sSourceDir="${npm_config_local_prefix}/node_modules"
    sTargetDir="${npm_config_local_prefix}/simplycode/js"

    mkdir -p \
        "${sTargetDir}/codemirror/lib/" \
        "${sTargetDir}/codemirror/mode/css/" \
        "${sTargetDir}/codemirror/mode/htmlmixed/" \
        "${sTargetDir}/codemirror/mode/javascript/" \
        "${sTargetDir}/codemirror/mode/xml/" \
        "${sTargetDir}/codemirror/theme/"

    cp -f "${sSourceDir}/codemirror/lib/codemirror.css" "${sTargetDir}/codemirror/lib/codemirror.css"
    cp -f "${sSourceDir}/codemirror/lib/codemirror.js" "${sTargetDir}/codemirror/lib/codemirror.js"
    cp -f "${sSourceDir}/codemirror/mode/css/css.js" "${sTargetDir}/codemirror/mode/css/css.js"
    cp -f "${sSourceDir}/codemirror/mode/htmlmixed/htmlmixed.js" "${sTargetDir}/codemirror/mode/htmlmixed/htmlmixed.js"
    cp -f "${sSourceDir}/codemirror/mode/javascript/javascript.js" "${sTargetDir}/codemirror/mode/javascript/javascript.js"
    cp -f "${sSourceDir}/codemirror/mode/xml/xml.js" "${sTargetDir}/codemirror/mode/xml/xml.js"
    cp -f "${sSourceDir}/codemirror/theme/base16-dark.css" "${sTargetDir}/codemirror/theme/base16-dark.css"
}

installSimplyCode() {
    local sSourceDir sTargetDir

    readonly sSourceDir="${npm_config_local_prefix}/node_modules/simplycode"
    readonly sTargetDir="${npm_config_local_prefix}/simplycode"

    cp -a  "${sSourceDir}/assets" "${sTargetDir}"
    cp -f  "${sSourceDir}/generated.html" "${sTargetDir}/index.html"
}

if [[ ${BASH_SOURCE[0]} != "${0}" ]]; then
    export -f installSimplyEdit
    export -f installSimplyView
    export -f installCodeMirror
    export -f installSimplyCode
else
    installSimplyEdit
    installSimplyView
    installCodeMirror
    installSimplyCode
    exit $?
fi
