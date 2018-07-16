#!/bin/bash

##CONFIG##
USER_ID=5b1818145f2f3b51b3c5b0f4
IMAGE_TOKEN=5b461dea998e275f28faba88
DESTINATION="http://www.universalcloudmonitoring.com"
PORT=3000
PING_RATE=5
INSTANCE_TYPE=5b1ecf3c6bcc0a4d5d81aab7

##CODE - Do not modify##
function CPU_usage(){
	TOTAL_CPU_USAGE=0
	TOTAL_CPU=$(grep -c ^processor /proc/cpuinfo) #set number of CPUs to check for
	declare -a 'range=({'"0..$TOTAL_CPU"'})'
	let "TOTAL_CPU=$TOTAL_CPU - 1"

	#declare array of size TOTAL_CPU to store values (eg. 8 cpus makes arrays of size 8)
	declare -a PREV_TOTAL=( $(for i in ${range[@]}; do echo 0; done) )
	declare -a PREV_IDLE=( $(for i in ${range[@]}; do echo 0; done) )

	for i in {1..3}; do
	    SUM=0
	    CPU=(`cat /proc/stat | grep '^cpu '`) # Get the total CPU statistics.
        cat /proc/stat | grep "^cpu"	    
        unset CPU[0]                          # Discard the "cpu" prefix.
	    IDLE=${CPU[4]}                        # Get the idle CPU time.

	    # Calculate the total CPU time.
	    TOTAL=0
	    for VALUE in "${CPU[@]}"; do
	        let "TOTAL=$TOTAL+$VALUE"
	    done
	    # Calculate the CPU usage since we last checked.
	    let "DIFF_IDLE=$IDLE-${PREV_IDLE[0]}"
	    let "DIFF_TOTAL=$TOTAL-${PREV_TOTAL[0]}"
	    let "DIFF_USAGE=(1000*($DIFF_TOTAL-$DIFF_IDLE)/($DIFF_TOTAL+5))/10"
	    let "SUM=$SUM+$DIFF_USAGE"

	    # Remember the total and idle CPU times for the next check.
	    PREV_TOTAL[0]="$TOTAL"
	    PREV_IDLE[0]="$IDLE"
        if test "$TOTAL_CPU" != "0"; then
	        # Wait before checking again.
	        declare -a 'range=({'"1..$TOTAL_CPU"'})'
	        for j in ${range[@]};do 
	            CPU=(`cat /proc/stat | grep "^cpu$j "`) # Get the total CPU statistics.
                echo $CPU
	            unset CPU[0]                            # Discard the "cpu" prefix.
	            IDLE=${CPU[4]}                          # Get the idle CPU time.

	            # Calculate the total CPU time
	            TOTAL=0
	            for VALUE in "${CPU[@]}"; do
	                let "TOTAL=$TOTAL+$VALUE"
	            done

	            # Calculate the CPU usage since we last checked.
	            let "DIFF_IDLE=$IDLE-${PREV_IDLE[$j]:-0}"
	            let "DIFF_TOTAL=$TOTAL-${PREV_TOTAL[$j]:-0}"
	            let "DIFF_USAGE=(1000*($DIFF_TOTAL-$DIFF_IDLE)/($DIFF_TOTAL+5))/10"
	            let "SUM=$SUM+$DIFF_USAGE"
                echo "This should not be seen"
	            # Remember the total and idle CPU times for the next check.
	            PREV_TOTAL[$j]="$TOTAL"
	            PREV_IDLE[$j]="$IDLE"
	        done
        fi
	    let "SUM=$SUM/($TOTAL_CPU+1)"
	    let "TOTAL_CPU_USAGE=$TOTAL_CPU_USAGE+$SUM"
	    let "SLEEP_TIME=($1-1)/3"
	    sleep "$SLEEP_TIME"
	done  
	let "TOTAL_CPU_USAGE=$TOTAL_CPU_USAGE/3"
	return $TOTAL_CPU_USAGE
}

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
	filename="tempStorage.json"
	fail=0
	lineNumber=1
	while read -r line
	do
	    json="$line"
	    send_data "$json"

	    res=$?

		if test "$res" != "0"; then
		   let "fail++"
		else
			#delete lines of data already transfered
			sed -i "$lineNumber"'s/.*//' "$filename"
		fi
		let "lineNumber++"
	done < "$filename"
	#Clear the deleted lines at the end
	sed -i '/^\s*$/d' "$filename"

	#Gather new data
	memFree=$(awk '/MemFree/ {printf( "%f\n", $2)}' /proc/meminfo)
    memTotal=$(awk '/MemTotal/ {printf( "%f\n", $2 )}' /proc/meminfo)
    MEMORY=$(free -m | awk 'NR==2{printf "%.2f",$3*100/$2 }') #Shows memory usage without buff/cache included
    diskSize=$(df --output=size -B 1 "$PWD" |tail -n 1)
    diskUsed=$(df --output=used -B 1 "$PWD" |tail -n 1)
    DISK=$(awk "BEGIN {printf \"%.2f\",${diskUsed}/${diskSize}*100}")
    CPU_usage "$PING_RATE"
    CPU=$?
    UUID=$(dmidecode | grep -i uuid | awk '{print $2}' | tr '[:upper:]' '[:lower:]')
    TIME=$(date +%s)

	#This is where new data will be extracted and sent
	newData='{"oauthid": "'$USER_ID'", 
				"app":"'$APP_TOKEN'", 
				"image":"'$IMAGE_TOKEN'",  
				"uuid":"'$UUID'", 
				"cpu":"'$CPU'", 
				"mem":"'$MEMORY'", 
				"disk":"'$DISK'", 
				"time":"'$TIME'",
				"instance_type":"'$INSTANCE_TYPE'"
			}'
	
	send_data "$newData"
	res=$?
if test "$res" != "0"; then
	   echo $newData >> "tempStorage.json"
	fi
	
	:
done
