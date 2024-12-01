#!/bin/bash

SPECURL=$1

rm -rf src/gen
mkdir -p tmp
SPECFILE=tmp/spec.json
wget --quiet --no-check-certificate $SPECURL -O $SPECFILE
docker run --rm --net=host -u="$(id -u)" -v ${PWD}:/local swaggerapi/swagger-codegen-cli:latest generate \
    -i /local/$SPECFILE \
    -l typescript-angular \
    -o /local/src/gen \
    --additional-properties ngVersion=18.2.0 --additional-properties modelPropertyNaming=original
