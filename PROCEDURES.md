# Procedures for PassiveHouse Ecovillage Project
<!-- TOC depthFrom:2 updateOnSave:true -->

- [Logging in to influx](#logging-in-to-influx)
- [Dropping a series](#dropping-a-series)

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
