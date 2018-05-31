#!/bin/bash
#All of this will eventually be in a loop

#sends json data via curl to the probePost
function send_data (){
	curl --fail --header "Content-Type: application/json" \
	  --header 'Expect:' \
	  --request POST \
	  --data "$1" \
	  http://localhost:3000/probePost
	res=$?
	return $res
}

filename="tempStorage.json"
echo "Reading from Storage:"
fail=0
lineNumber=1
while read -r line
do
    json="$line"
    send_data "$json"

    res=$?

	if test "$res" != "0"; then
	   echo "the curl command failed with: $res"
	   let "fail++"
	else
		#delete lines of data already transfered
		sed -i "$lineNumber"'s/.*//' "$filename"
	fi
	let "lineNumber++"
done < "$filename"
#Clear the deleted lines at the end
sed -i '/^\s*$/d' "$filename"

echo "$fail transfers failed."

#This is where new data will be extracted and sent
newData='{"user":"test", "token":"xyz", "data":["hello", "world"]}'

send_data "$newData"
res=$?

if test "$res" != "0"; then
   echo "the curl command failed with: $res"
   echo $newData >> "tempStorage.json"
fi