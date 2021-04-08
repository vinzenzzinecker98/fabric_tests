cd test-network
./network.sh up createChannel -c mychannel -ca
./network.sh deployCC -ccn basic -ccp ../chaincode/flsimulation/ -ccl go
