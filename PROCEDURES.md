# Procedures for PassiveHouse Ecovillage Project
<!-- TOC depthFrom:2 updateOnSave:true -->

- [Logging in to influx](#logging-in-to-influx)
- [Dropping a series](#dropping-a-series)
- [Copying data from a database in line format](#copying-data-from-a-database-in-line-format)
	- [On the source system](#on-the-source-system)
	- [On the target system](#on-the-target-system)
- [Deleting spurious data (a few points from a sensor)](#deleting-spurious-data-a-few-points-from-a-sensor)
	- [Confirm the data to be dropped](#confirm-the-data-to-be-dropped)

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

Since `influx` has command history, just hit up-arrow and edit the commands; or cut and paste from here (bearing in mind that you have to adjust the series name for the data to be dropped).

## Copying data from a database in line format

### On the source system

```console
$ docker-compose exec influxdb /bin/bash
root@5d9dbaba4905:/# influx_inspect export -datadir /var/lib/influxdb/data -out /var/lib/influxdb/export-20190623a.gz -waldir /var/lib/influxdb/wal -database passivehouse-ecovillage -compress
root@5d9dbaba4905:/# <control-D>
$ ls -lh /var/opt/docker/passivehouse-ecovillage/influxdb/export-20190623a.gz
-rw-r--r-- 1 root root 24M Jun 23 23:07 /var/opt/docker/passivehouse-ecovillage/influxdb/export-20190623a.gz
$
```

Copy the file to the target system.

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

## Deleting spurious data (a few points from a sensor)

There are a number of ways to do this; the simpler way is less flexible.

In this example, we observe that a sensor failed, and the last few temperature data points before it stopped transmitting are bogus.

We are OK with eliminating all the data from that device at the point of failure.

In this example, the data is in database `soil_water_data`, and the measurement is (confusingly) also called `soil_water_data`.

### Confirm the data to be dropped

We'll start by showing some of the points for the sensor for the time range of interest.

Using grafana, find the time range of interest.

Convert the time to UTC.  In this case, the time on the dashboard was 13:00 to 14:00 EDT, so the time range in UTC was 17:00 to 18:00.

Log into the server, and go to the influx prompt.

```console
$ cd /opt/docker/docker-ttn-dashboard
$ docker-compose exec influxdb /bin/bash
root@987ec158a95e:/# influx
Connected to http://localhost:8086 version 1.7.6
InfluxDB shell version: 1.7.6
Enter an InfluxQL query
>
```

Then use a "SELECT" query to view the data.

```sql
> select "t" from "soil_water_data".."soil_water_data" where ("devID" = 'test-44') and time > '2019-07-06T17:20:00Z'
name: soil_water_data
time                t
----                -
1562433648857705150 26.01171875
1562434008839798171 25.72265625
1562434368825602738 25.0625
1562434920836159489 -128
>
```

We observe that we don't need to drop all of these, so we refine the time:

```sql
> select "t" from "soil_water_data".."soil_water_data" where ("devID" = 'test-44') and time > '2019-07-06T17:30:00Z'
name: soil_water_data
time                t
----                -
1562434368825602738 25.0625
1562434920836159489 -128
> select "t" from "soil_water_data".."soil_water_data" where ("devID" = 'test-44') and time > '2019-07-06T17:33:00Z'
name: soil_water_data
time                t
----                -
1562434920836159489 -128
>
```

Next, we will use the `DELETE` command to remove the data. We must deal with an inconsistency doing so. The `SELECT` command allows you to select any database from within the query. The `DELETE` command does not. So first we must select a default database using `USE`, and then we can delete the data of interest.

```sql
> use "soil_water_data"
Using database soil_water_data
> delete from "soil_water_data" where ("devID" = 'test-44') AND time > '2019-07-06T17:33:00Z'
>
```

After this, refresh the window in Grafana, and the data should be gone.

_**Remember:**_ there is no undo. It is best to practice with a staging database if you have one.
