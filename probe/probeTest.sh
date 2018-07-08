#!/bin/bash

#https://unix.stackexchange.com/questions/119126/command-to-display-memory-usage-disk-usage-and-cpu-load

##CONFIG##
USER_ID="5b1818145f2f3b51b3c5b0f4" #Probably not necessary and will probably be removed
IMAGE_TOKEN="5b40f095193cc743cfe8dc22" #Token provided which uniquely identifies image
DESTINATION="http://www.universalcloudmonitoring.com"
PORT=3000 #Port on which app traffic takes place
PING_RATE=3 #how long between probe pings (use at least 1)
#IF on public cloud 
INSTANCE_TYPE="5b1ece31617c3e4c95151ed8"

function send_data (){
	curl --fail --header "Content-Type: application/json" \
	  	--header 'Expect:' \
	  	--request POST \
	  	--data "$1" \
	  	"$DESTINATION/probePost"
	res=$?
	return $res
}

#sends json data via curl to the probePost
while [ true ]; do
	sleep 1
	
	#Gather new data
	memFree=9
    memTotal=9
    MEMORY=9 #Shows memory usage without buff/cache included
    diskSize=9
    diskUsed=9
    DISK=9
    CPU=9
    UUID="sdfklj;asdf"
    TIME=0

	#This is where new data will be extracted and sent
	newData='{"oauthid": "'$USER_ID'",
				"image":"'$IMAGE_TOKEN'",  
				"uuid":"'$UUID'", 
				"cpu":"'$CPU'", 
				"mem":"'$MEMORY'", 
				"disk":"'$DISK'", 
				"time":"'$TIME'",
				"instance_type":"'$INSTANCE_TYPE'"
			}'
	
	send_data "$newData"
done