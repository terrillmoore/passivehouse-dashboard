# Procedures for PassiveHouse Ecovillage Project
<!-- TOC depthFrom:2 updateOnSave:true -->

- [Logging in to influx](#logging-in-to-influx)
- [Dropping a series](#dropping-a-series)
- [Copying data from a database in line format](#copying-data-from-a-database-in-line-format)
	- [On the target system](#on-the-target-system)

<!-- /TOC -->

## Logging in to influx

There are two servers:

- `passivehouse-ecovillage.mcci.io`: this is the one facing the world.
- `staging-ithaca-power.mcci.com`: this is the staging/test server.

Logging in requires several steps:

1. ssh to the server in question
2. change directory to where the `docker-compose.yaml` file lives, `/opt/docker/docker-ttn-dashboard`
3. Launch a bash shell inside the influxdb docker instance.
4. Launch an influx session

Here's the sequence.

```console
$ cd /opt/docker/docker-ttn-dashboard
$ docker-compose exec influxdb /bin/bash
root@987ec158a95e:/# influx
Connected to http://localhost:8086 version 1.7.6
InfluxDB shell version: 1.7.6
Enter an InfluxQL query
>
```

## Dropping a series

You may have a series from a given sensor that is just giving bad data. Do this in two steps:

1. confirm that you have the right things selected
2. drop the data

For step 1, you will say:

```console
> show series on "passivehouse-ecovillage" from "EnvironmentalData"  where displayName =~ /1: Outdoor/
key
---
EnvironmentalData,applicationName=Simple\ sensor,devEUI=0002CC0100000269,devID=outdoor-0002cc0100000269,displayKey=passivehouse-ecovillage.outdoor-0002cc0100000269,displayName=Unit\ 1:\ Outdoors,nodeType=Catena\ 4612,platformType=Catena\ 461x,radioType=Murata
>
```

(In this case, we wanted to drop all the info from the sensor with displayName "Unit 1: Outdoors")

For step 2, you'll first have to select the database, then drop the series.

```console
> use "passivehouse-ecovillage"
Using database passivehouse-ecovillage
> drop series from "EnvironmentalData"  where displayName =~ /1: Outdoor/

>
```

Since `influx` has command history, just hit up-arrow and edit the command.

## Copying data from a database in line format

### On the target system

```console
$ cd /opt/docker/docker-ttn-dashboard
$ docker-compose exec influxdb /bin/bash
root@987ec158a95e:/# influx -import -compressed -path=/var/lib/influxdb/export-290623a.gz
2019/06/24 00:24:29 Processed 100000 lines.  Time elapsed: 21.407490751s.  Points per second (PPS): 56055
...
2019/06/24 00:24:44 Processed 2000000 lines.  Time elapsed: 36.155394541s.  Points per second (PPS): 55316
2019/06/24 00:24:45 Processed 1 commands
2019/06/24 00:24:45 Processed 2069074 inserts
2019/06/24 00:24:45 Failed 0 inserts
root@987ec158a95e:/# exit
```

Note: you need at least 8G in your VM; otherwise you'll get crashes during the import. Things are not well behaved when memory gets exhausted.
