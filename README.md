#simple testing for fabric network

##startup:
in `/fabric-samples/test-network`:
`./network.sh up createChannel -c mychannel -ca`
`./network.sh deployCC -ccn basic -ccp ../chaincode/flsimulation/ -ccl go`


##run tests:
in `fabric-samples/application-flsimulation`:
`node app.js`