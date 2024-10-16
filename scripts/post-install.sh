#!/usr/bin/env bash

installSimplyCode() {
    local sSourceDir sTargetDir

    readonly sSourceDir="${npm_config_local_prefix}/node_modules/simplycode/www"
    readonly sTargetDir="${npm_config_local_prefix}/simplycode"

    cp -a  "${sSourceDir}/js" "${sTargetDir}"
    cp -a  "${sSourceDir}/hope" "${sTargetDir}"
    cp -a  "${sSourceDir}/simply" "${sTargetDir}"
    cp -f  "${sSourceDir}/index.html" "${sTargetDir}"
}

if [[ ${BASH_SOURCE[0]} != "${0}" ]]; then
    export -f installSimplyCode
else
    installSimplyCode
    exit $?
fi
