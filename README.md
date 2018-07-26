# Monitoring and Visualizing Cost and Waste in Cloud Computing

## Goals
The goal of this project is to provide a universal solution to the problem of monitoring and visualizing waste in cloud computing.

## Setup
Setup is broken into two separate sections.  To setup the probe one can download the probe via the service, auto-generated for the linked-account's deployment.

### Probe
The probe should be configured with the configuration instructions in the provided configuration file.  It should be included in any cloud deployment.

To include the probe in a crontab one should open crontab with:
`sudo crontab -e`
And add two lines below the comments as:
`SHELL=/bin/bash`
`@reboot cd /home/path/to/probe && ./probe.bash`

If logging is desired a log file can be created and pointed to like this instead:
`@reboot cd /home/path/to/probe && ./probe.bash >> /var/log/somelogfile.log 2>&1`

Using the `cd` command before running the probe is essential because the `probe.bash` file needs to access local storage.

Once the crontab is saved it can be checked for correctness with `sudo crontab -l` to list the current crontab.  

Create an image of the newly modified Virtual Machine.  New Virtual Machines spawned from this image with the probe and crontab will automatically send data to the service.

### Server
The server uses NodeJS and should be setup using the appropriate steps.  Ensure NodeJS and npm are installed on the machine running the server.  `cd` into the `cloudComputeCostWaste` directory and run `npm install`.  After this is run, the server can be started with `npm start`.  If it is desirable to run the server without a terminal open, one option is the pm2 library.  Then the server is started with `pm2 start npm -- start`.

## Future Work

* Expansion of the monitored utilization statistics to include for example: Network Utilization and the inclusion of this in the cost calculation.
* The inclusion of an API in order to deliver data to users in a manually processable format.
* The optimization of the data processing.
* Reorganization of the user interface such that it is more user-friendly.
* Account for variations in Billing Time Units for public cloud providers.
