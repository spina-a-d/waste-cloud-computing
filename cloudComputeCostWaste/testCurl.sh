#!/bin/bash

#set number of CPUs to check for
function CPU_usage(){
	TOTAL_CPU_USAGE=0
	TOTAL_CPU=$(grep -c ^processor /proc/cpuinfo)
	declare -a 'range=({'"0..$TOTAL_CPU"'})'
	let "TOTAL_CPU=$TOTAL_CPU - 1"

	declare -a PREV_TOTAL=( $(for i in ${range[@]}; do echo 0; done) )
	declare -a PREV_IDLE=( $(for i in ${range[@]}; do echo 0; done) )

	for i in {1..3}; do
	    SUM=0
	    CPU=(`cat /proc/stat | grep '^cpu '`) # Get the total CPU statistics.
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

	    # Wait before checking again.
	    declare -a 'range=({'"1..$TOTAL_CPU"'})'
	    for i in ${range[@]};do 
	        CPU=(`cat /proc/stat | grep "^cpu$i "`) # Get the total CPU statistics.
	        unset CPU[0]                            # Discard the "cpu" prefix.
	        IDLE=${CPU[4]}                          # Get the idle CPU time.

	        # Calculate the total CPU time.
	        TOTAL=0
	        for VALUE in "${CPU[@]}"; do
	            let "TOTAL=$TOTAL+$VALUE"
	        done

	        # Calculate the CPU usage since we last checked.
	        let "DIFF_IDLE=$IDLE-${PREV_IDLE[$i]}"
	        let "DIFF_TOTAL=$TOTAL-${PREV_TOTAL[$i]}"
	        let "DIFF_USAGE=(1000*($DIFF_TOTAL-$DIFF_IDLE)/($DIFF_TOTAL+5))/10"
	        let "SUM=$SUM+$DIFF_USAGE"

	        # Remember the total and idle CPU times for the next check.
	        PREV_TOTAL[$i]="$TOTAL"
	        PREV_IDLE[$i]="$IDLE"
	    done
	    let "SUM=$SUM/($TOTAL_CPU+1)"
	    let "TOTAL_CPU_USAGE=$TOTAL_CPU_USAGE+$SUM"
	    sleep 1
	done  
	return $TOTAL_CPU_USAGE
}

function send_data (){
	curl --fail --header "Content-Type: application/json" \
	  	--header 'Expect:' \
	  	--request POST \
	  	--data "$1" \
	  	http://localhost:3000/probePost
	res=$?
	return $res
}

#sends json data via curl to the probePost
while [ true ]; do
	sleep 1
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

	memFree=$(awk '/MemFree/ {printf( "%f\n", $2)}' /proc/meminfo)
    memTotal=$(awk '/MemTotal/ {printf( "%f\n", $2 )}' /proc/meminfo)
    MEMORY=$(awk "BEGIN {printf \"%.2f\",(${memTotal}-${memFree})/${memTotal}*100}")
    diskSize=$(df --output=size -B 1 "$PWD" |tail -n 1)
    diskUsed=$(df --output=used -B 1 "$PWD" |tail -n 1)
    DISK=$(awk "BEGIN {printf \"%.2f\",${diskUsed}/${diskSize}*100}")
    CPU=$(CPU_usage)
    echo "$CPU"
	#This is where new data will be extracted and sent
	newData='{"cpu":"$CPU", "mem":"$MEMORY", "disk: $DISK"}'

	send_data "$newData"
	res=$?

	if test "$res" != "0"; then
	   echo "the curl command failed with: $res"
	   echo $newData >> "tempStorage.json"
	fi
	:
done