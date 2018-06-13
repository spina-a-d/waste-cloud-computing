#!/bin/bash
#All of this will eventually be in a loop

#sends json data via curl to the probePost
function send_data (){
	curl --fail --header "Content-Type: application/json" \
	  --header 'Expect:' \
	  --request POST \
	  --data "$1" \
	  http://localhost:3000/api
	res=$?
	return $res
}

#This is where new data will be extracted and sent
newData='{"user":"test", "token":"xyz", "data":["hello", "world"]}'

send_data "$newData"
res=$?

if test "$res" != "0"; then
   echo "the curl command failed with: $res"
fi