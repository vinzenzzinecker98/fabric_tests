# testing for a Hyperledger Fabric blockchain network

This repository contains the code for executing a simulation using the Hyperledger Fabric sample network.

# how to run:

## install dependencies
install dependencies like instructed here: https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html. Additionally npm and nodejs are required for the simulaion to run


## start the test network:

execute my startup script `bash initiate.sh` or run
in `/test-network` the following commands:
`./network.sh up createChannel -c mychannel -ca`
`./network.sh deployCC -ccn basic -ccp ../chaincode/flsimulation/ -ccl go`

## run tests:
in `/application-flsimulation`:
install all dependencies by executing `npm install`.
To run the testing application: `node app.js`.
For more detailled console ouput set the flag `logging = true`.

## cleanup
To shutdown the network you can execute `./network.sh down` in `/test-network` to shut down the docker containers running the fabric network. Also delete the `/application-flsimulation/wallet` directory (as this generated folder may cause problems when running the next time).
Alternatively, execute `bash dispose.sh`