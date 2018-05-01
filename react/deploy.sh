#!/bin/bash

set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUCKET=${1:-"dev.zenbrewism.com"}

cd $DIR
npm run build
aws s3 sync $DIR/build s3://$BUCKET/
cd -