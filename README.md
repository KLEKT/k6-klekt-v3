# K6 Load Tetsing source

This project contains templates for load test stuits and orchestration scripts for deploying to various cloud environments.

## Running locally

Either configure the docker compose file with the parameters you need and run 
```
docker-compose up
```
Or straight up run this command with the script you want to run
```
$ docker run --rm -i grafana/k6 run - <./tests/script.js
```

k6 offers some useful options for looping and concurrency of scripts which are documented here: [https://k6.io/docs/get-started/running-k6/#using-options](https://k6.io/docs/get-started/running-k6/#using-options)

## Deploying to the cloud
### Azure

TO DO

### AWS

TO DO