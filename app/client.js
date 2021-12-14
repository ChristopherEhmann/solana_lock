
// import the Anchor library
const anchor = require('@project-serum/anchor');
// Read the generated IDL
const idl = require('../target/idl/counter.json')

const { SystemProgram } = anchor.web3; // Added to initialize account
const fs = require('fs');
var path = require('path');

const opts = {
	preflightCommitment: 'recent',
	commitment: 'recent'
};

const PROGRAM_ID = "EoEc5iBooPKP59dygQk95hXVyLq4XEP4eANCFvpF4iQx";

class AnchorClient {
	// you can make an anchor program without a provider
	// then set the provider later with anchor.setProvider
	// you just won't be able to init or makePost until a wallet provider is set up
	constructor(programId, keypair) {
		this.programId = programId;
		this.connection = new anchor.web3.Connection("http://127.0.0.1:8899", 'confirmed');
		console.log('\n\nConnected to', "http://127.0.0.1:8899");
		const wallet = new anchor.Wallet(keypair)
		// maps anchor calls to Phantom direction
		this.provider = new anchor.Provider(this.connection, wallet, opts);
		this.program = new anchor.Program(idl, this.programId, this.provider);
	}

	async initialize() {
		// generate an address (PublciKey) for this new account
		let counter_account = anchor.web3.Keypair.generate(); // blogAccount is type Keypair
		//const utf8encoded = Buffer.from(bio);
		// Execute the RPC call

		const tx = await this.program.rpc.initialize({
			// Pass in all the accounts needed
			accounts: {
				counterAccount: counter_account.publicKey, // publickey for our new account
				authority: this.provider.wallet.publicKey, // publickey of our anchor wallet provider
				systemProgram: SystemProgram.programId // just for Anchor reference
			},
			signers: [counter_account] // acc must sign this Tx, to prove we have the private key too
		});

		console.log(
			`Successfully intialized Counter ID: ${counter_account.publicKey} for user ${this.provider.wallet.publicKey}`
		);
		return counter_account;
	}
	async count(counter_pubkey) {
		const account = await this.program.account.counterAccount.fetch(counter_pubkey);
		console.log(account.counter)
	}
	async count(counter_pubkey) {
		const account = await this.program.account.counterAccount.fetch(counter_pubkey);
		console.log(account.counter)
	}
	async authority(counter_pubkey) {
		const account = await this.program.account.counterAccount.fetch(counter_pubkey);
		console.log(account.authority.toString())
	}

	async increment(counter_account) {
		const tx = await this.program.rpc.increment({
			// Pass in all the accounts needed
			accounts: {
				counterAccount: counter_account.publicKey, // publickey for our new account
				authority: this.provider.wallet.publicKey // publickey of our anchor wallet provider

			},
			signers: [this.provider.wallet.keypair] // acc must sign this Tx, to prove we have the private key too
		});
		console.log(
			`Successfully increased Counter ID: ${counter_account.publicKey} for user ${this.provider.wallet.publicKey}`
		);
	}


}

var args = process.argv.slice(2);
keypair_file = args[1]
const secretKey = Uint8Array.from(require(keypair_file));
const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
client = new AnchorClient(PROGRAM_ID, keypair)

if (args[0] === "initialize") {
	(async () => {
		account = await client.initialize()
		account_path = path.join(path.dirname(keypair_file), path.basename(keypair_file).split(".")[0] + "_counter.json")
		fs.writeFile(account_path, "[" + account.secretKey.toString() + "]", (err) => {
			if (err) {
				throw err;
			}
			console.log("Account is saved.");
		})
	})()
}
else if (args[0] === "increment") {

	account_secretKey = Uint8Array.from(require(args[2]));
	const counter_account = anchor.web3.Keypair.fromSecretKey(account_secretKey);
	client.increment(counter_account)

}
else if (args[0] === "count") {

	pubkey = keypair.publicKey
	client.count(pubkey)
}
else if (args[0] === "authority") {

	pubkey = keypair.publicKey
	client.authority(pubkey)
}

