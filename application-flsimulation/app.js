

'use strict';
var hash = require('crypto-js/sha256');
var Stopwatch = require('statman-stopwatch');

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js');
const channelName = 'mychannel';

// important: here the provided chaincode name has to match the name given when deploying the chaincode (-ccn flag!)
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

// provide here the different numbers of runs that you wand to evaluate, for example [1,10] to evaluate One round and then evaluate 10 rounds of training
const evaluate=[1,2,3,4,5,8];
const logging = false;





async function main() {
	try {
		
		// build connection to the running Fabric network
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
    //register user to sign the transactions (Org1 is used, could also be Org2 obviously)
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);


			//Start value for the simulation
			var value = 'abcdefgah';
			if(logging) console.log('\n--> Submit Transaction: set, sets the value on position 1');
      
      //store the start value in the ledger (I will always use position 2, can be any position, as long as it is always the same)
			let result = await contract.submitTransaction('set', 2, value);
			if(logging) console.log('*** Result: committed');
			if (`${result}` !== '') {
				if (`${result}`== value)
				if(logging) console.log(`*** successfully sumbitted: ${result.toString()}`);
				else
				if(logging) console.log(`*** unexpected return value:  ${result.toString()}`)
			}
			
			//Check whether the value was successfully submitted
			if(logging) console.log('\n--> Evaluate Transaction: Get, get value on position 1');
			result = await contract.evaluateTransaction('get', 2);
			if(logging) console.log(`*** Result: ${result.toString()}`);

						
			
			//for each specified number of rounds
			for (let rounds of evaluate)
			{
     //start the time for the evaluation
				let sw = new Stopwatch(true);
				console.log("Running...");
				//Run the specified amount of times
				for (let i=0;i<rounds;i++){
        
					  if(logging) console.log(`round: ${i}`)
                                              
						//GET the value currently stored on the blockchain
						if(logging) console.log('\n--> Evaluate Transaction: Get, get value on position 1');
						let res = await contract.evaluateTransaction('get', 2);
						if(logging) console.log(`*** Got: ${res.toString()}`);
						
						//HASH the retrieved value	using the CryptoJS Library				
						let next = hash(res.toString());                		
						if(logging) console.log(`***** Hashing: The hash of  "${res.toString()}" is "${next}"`);
							

						// SET the value on the ledger (this produces a transaction on the blockchain network)					
						if(logging) console.log(`\n--> Submit Transaction: set, sets the value on position 1 to be ${next}`);
						let check = await contract.submitTransaction('set', 2, next);
						if (`${check}` !== '') {
							if (`${check}`== next)
							if(logging) console.log(`*** successfully sumbitted: ${check.toString()}`);
							else
							if(logging) console.log(`*** unexpected return value:  ${check.toString()}`)
							}
				}
      //stop the timer
			sw.stop();
      //log the evaluated time to console
			console.log(`Runtime with ${rounds} rounds: ${sw.read()} ms`);
		}
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();


// pre-requisites:
// - fabric-sample two organization test-network setup with two peers, ordering service,
//   and 2 certificate authorities
//         ./network.sh up createChannel -ca
// - Be sure that node.js is installed
//         node -v
// - npm installed code dependencies
//         npm install
// - to run this test application
//         node app.js

// NOTE: If you see  kind an error like these:
/*
    2020-08-07T20:23:17.590Z - error: [DiscoveryService]: send[mychannel] - Channel:mychannel received discovery error:access denied
    ******** FAILED to run the application: Error: DiscoveryService: mychannel error: access denied

   OR

   Failed to register user : Error: fabric-ca request register failed with errors [[ { code: 20, message: 'Authentication failure' } ]]
   ******** FAILED to run the application: Error: Identity not found in wallet: appUser
*/
// Delete the /fabric-samples/asset-transfer-basic/application-javascript/wallet directory
// and retry this application.
//
// The certificate authority must have been restarted and the saved certificates for the
// admin and application user are not valid. Deleting the wallet store will force these to be reset
// with the new certificate authority.
//
