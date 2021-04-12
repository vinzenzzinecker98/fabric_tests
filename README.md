# simple testing for fabric network

## startup:
execute my startup script `bash inititiate.sh` or run
in `/fabric-samples/test-network` the following commands:
`./network.sh up createChannel -c mychannel -ca`
`./network.sh deployCC -ccn basic -ccp ../chaincode/flsimulation/ -ccl go`


## run tests:
in `fabric-samples/application-flsimulation`:
install dependencies: `npm install`
Run the testing application: `node app.js`

For more detailled console ouput set the flag `logging = true`
