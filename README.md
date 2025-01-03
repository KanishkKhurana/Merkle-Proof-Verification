# Merkle Root Verification

**Merkle Root Verification** is a project combining Solidity and JavaScript to generate and verify Merkle roots and proofs. The project leverages [Foundry](https://book.getfoundry.sh/) for Solidity development and Node.js for Merkle tree generation.

## Problem Statement
A smart contract on chain B has to verify an inclusion proof `p` of a message `m` on chain A's stateroot `s`. It is given that stateroot `s` stored on chain B is verified and stored by a trusted party. 

For the sake of simplicity - I will be transactionsRoot of a block instead of stateroot.

## Program Flow
1. User Alice puts transaction `t` on chain A using contract `c1`
2. Chain A now has state `s`
3. Generate merkle proof of transaction inclusion.
4. Contract `c2` on chain B is fed state `s` , transaction `t` and proof `p` by trusted entity 
5. Contract `c2` verifies that transaction `t` is a part of state `s`

## Requirements
-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Node**:  Javascript runtime


## Project Structure

```
/
├── JavascriptRootGenerator/
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── MerkleTree.js
│   │   └── index.js
├── README.md
├── foundry.toml
├── lib/
├── remappings.txt
├── script/
│   └── SimpleStorage.s.sol
├── src/
│   ├── MerkleVerifier.sol
│   └── SimpleStorage.sol
```

1. **JavascriptRootGenerator** - This is a JavaScript project built with node that uses `merkletreejs` and `merkle-patricia-tree` packages to generate merkle proofs from given transactions.
2. **script/SimpleStorage.s.sol** - This contains a dev script to deploy and execute the `SimpleStorage.sol` contract and send 4 transactions.
3. **src/SimpleStorage.sol** - Smart contract to help user send transactions on chain A
4.  **src/MerkleVerifier.sol** - Smart contract to verify inclusion of transaction in the Merkle Patricia Tree with the help of the merkle proof on chain B.


## Setting up Local Blockchains
We will be using 2 local blockchain using [Anvil](https://book.getfoundry.sh/anvil/). To start these chains open 2 terminal shells and type the following -
   
**Shell 1**
```
anvil --no-mining --port 8546
```

💡: `--no-mining` is important so we are able to later put 4 transactions in one block and use  it to generate MPT, proof and even see the valid transactionsRoot

**Shell 2**
```
anvil
```


This will start 2 endpoints on `http://127.0.0.1:8546` and `http://127.0.0.1:8545` respectively.

### Storing Private Key to Execute Scripts
Upon running `Shell 1` you will notice a list of private keys given by Anvil. We will use 1 of them to execute our deployment script. 

To store it properly - 
1. Create a `.env` file in the root directory.
2. Paste the private key here. Your file should look like this - 
```
PRIVATE_KEY=your-private-key
```

Awesome! Now the setup is complete.

## Deploy SimpleStorage.sol on Chain A
1. Open another shell and run the following command -
   ```
   forge script script/SimpleStorage.s.sol:SimpleStorageScript --rpc-url http://127.0.0.1:8546 --broadcast
   ```
  
  Output - 
  ```

[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 1.758366569 gwei

Estimated total gas used for script: 666050

Estimated amount required: 0.00117116005328245 ETH

==========================
⠠ Sequence #1 on anvil-hardhat | Waiting for pending transactions
    ⠄ [Pending] 0x39c1929616bf4f99a166fbe0a0cc77e4b6efb343c4ec10f14fe3bd44f6a8862b
    ⠄ [Pending] 0x9870bf2d87a2739c20f30858a2b37bfdb30fb5f1019094d0b69573efee0f0e01
    ⠄ [Pending] 0x1f293988fd6cdba636dd269d86fb5ce82089fd4497b610182f7875f67bca1f39
    ⠄ [Pending] 0xef6d5929b4be98098d44a56956bef7afef123034cdc8de6002baa463607a6ac5
    ⠴ [00:00:09] [###############################################] 4/4 txes (0.0s)
    ⠴ [00:00:09] [-------------------------------------------] 0/4 receipts (0.0s)
    
```

2. Now, we have to mine the transaction on Chain with port `8546`
To do so, open another shell and run -
```
curl -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[],"id":1}' -H "Content-Type: application/json" http://127.0.0.1:8546    
```

As soon as you execute this, the block will mine and you will be able to see your transaction on `Shell 1` where we are running the first Anvil instance
    

## Generate Merkle Proof using JavaScript
1. In a new shell, run the following -
   ```
   cd JavascriptRootGenerator
   npm i 
   ```
2. Once dependencies are installed, run the following - 
   ```
   node src/index.js
   ```

As the above command runs successfully, you will be able to see -
1. Block transactionsRoot
2. List of transactions in the block
3. Inclusion proofs
4. Local verification of inclusion proofs

### Alternate Execution Flow
You can also use `src/MerkleTree.js` to generate proofs using `merkletreejs` package. 
Simply run `node src/MerkleTree.js` in the same shell. 

Ouput - 
```
Transaction Hashes: [
  '0x2f26a882826c3fff1bc1a43e002e31a9fdb4a5ca8409aeb2b342089c75ef298f',
  '0xead1b3fea791cf327be81e5ca3a6a1b299eb1d908cf68718bcec93e508d2c78e',
  '0x94debd24e059f6b58e5db471fa32394fd76466de5e35f3f500dff447b1aa0466',
  '0x70ba62bc05b444a7bf940f826b5f23662b753730edb349b46cc53ce23112c9b7'
]
Leaves: [
  'c92bda097f45c1dda1ee3f5b5bbd77efd260f5201955fd895bfbad7a841efcf0',
  'd586549164154944709501137e7c66d22ddac8badd8803b37ac8fab32a14678f',
  '207aef649da9a8108d81698176734a6093d98ccc0ef38e3369684c5a62632edc',
  'b37653b2a85c46f9b35042a39a989984f99f725f962a9d8ab8fa9f80274fa53b'
]
Merkle Tree: 
└─ d2e96605814f21ff8bf384bda0591732172147038f3ce74a889700a667f97946
   ├─ e2a4a05f8b9d6d8e31f4e2b89c1ba34dbd541e88e2b3abbcdd1c51b2c5ffb181
   │  ├─ c92bda097f45c1dda1ee3f5b5bbd77efd260f5201955fd895bfbad7a841efcf0
   │  └─ d586549164154944709501137e7c66d22ddac8badd8803b37ac8fab32a14678f
   └─ 0853a40961651a094014485dd7aede5cb2f1334873537a465fcded7201817f47
      ├─ 207aef649da9a8108d81698176734a6093d98ccc0ef38e3369684c5a62632edc
      └─ b37653b2a85c46f9b35042a39a989984f99f725f962a9d8ab8fa9f80274fa53b

Merkle Root: d2e96605814f21ff8bf384bda0591732172147038f3ce74a889700a667f97946
Proof for transaction: 0x2f26a882826c3fff1bc1a43e002e31a9fdb4a5ca8409aeb2b342089c75ef298f
Proof: [
  '0xd586549164154944709501137e7c66d22ddac8badd8803b37ac8fab32a14678f',
  '0x0853a40961651a094014485dd7aede5cb2f1334873537a465fcded7201817f47'
]
Is the proof valid locally? true
```

As the above command runs successfully, you will be able to see -
1. List of transactions
2. Leaves of merkle tree
3. Transaction proof [Important for later]
4. Merkle root [Important for later]
5. Merkle proof [Important for later]
6. Local verification for inclusion proofs


## Deploy MerkleVerifier.sol on Chain B

💡: You will need a private key to deploy smart contract here. To obtain it, head over to `Shell 2` where we instantiated Chain B and copy the private key like we did before. Foundry will request for it on the shell as soon as you run the following commands.

1. Open a new shell and run the following command -
   ```
   forge create src/RootVerifier.sol:MerkleVerifier --interactive --broadcast --rpc-url http://127.0.0.1:8545
   ```

   Output - 
   ```
   [⠊] Compiling...
    No files changed, compilation skipped
    Enter private key:
    Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    Transaction hash: 0xb4d3f171d283cad85bfce08bebe69107f5dca47283cf2bf86b
    ```

## Onchain Inclusion Proof Verification
Now we will start verifying the Merkle Proof for transaction inclusion. 

💡: You will need a private key to deploy smart contract here. To obtain it, head over to `Shell 2` where we instantiated Chain B and copy the private key like we did before. Foundry will request for it on the shell as soon as you run the following commands.


1. In the current shell, run the following command -

    ```
    cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "setStateRoot(bytes32)" "0xd2e96605814f21ff8bf384bda0591732172147038f3ce74a889700a667f97946" --interactive --rpc-url http://127.0.0.1:8545
    ```
    Let's break down this command and understand it -

    1. `cast send` - Sign and publish a transaction
    2. `0x5FbDB2315678afecb367f032d93F642f64180aa3` - Address of the contract we want to interface with. This can be different for you, please ensure you copy this from the previous command where we deploy `MerkleVerifier.sol`
    3. `"setStateRoot(bytes32)"` - We are calling this function within the `MerkleVerifier.sol` smart contract. This will help us set the merkle root. 
    4. `"0xd2e96605814f21ff8bf384bda0591732172147038f3ce74a889700a667f97946"` - This is the Merkle Root obtained from the Javascript code we have executed earlier. Please ensure that you add `0x` to the beginning of the hex merkle proof obtained by running the javascript file.
    5. `--interactive --rpc-url http://127.0.0.1:8545` - Allows us to input private key and send transaction to chain B

    Output - 
    ```
    Enter private key:

    blockHash               0x47856617a79b94295e99ce666dc0d6ee7aa53453974ee5437a8095d17bf9a1fb
    blockNumber             2
    contractAddress         
    cumulativeGasUsed       45058
    effectiveGasPrice       876563160
    from                    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    gasUsed                 45058
    logs                    [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0x49cdb3ad83652f622a15ea6bf86d99158af199d3f7ded7efdbec55579181a629","0xd2e96605814f21ff8bf384bda0591732172147038f3ce74a889700a667f97946"],"data":"0x","blockHash":"0x47856617a79b94295e99ce666dc0d6ee7aa53453974ee5437a8095d17bf9a1fb","blockNumber":"0x2","blockTimestamp":"0x6777c02c","transactionHash":"0x4e798615c23f7e51b3783db02037645941158420fdc69759deb7ab39f242c438","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
    logsBloom               0x40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040020000000000000000000000000000000000000000000080000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000200000000000000000000000000000000000000000000000000010000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    root                    
    status                  1 (success)
    transactionHash         0x4e798615c23f7e51b3783db02037645941158420fdc69759deb7ab39f242c438
    transactionIndex        0
    type                    2
    blobGasPrice            1
    blobGasUsed             
    authorizationList       
    to                      0x5FbDB2315678afecb367f032d93F642f64180aa3
    ```


2. In the same shell, run - 
   ```
   cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "verifyMessage(bytes32, bytes32[])" "0x2f26a882826c3fff1bc1a43e002e31a9fdb4a5ca8409aeb2b342089c75ef298f" "[0xd586549164154944709501137e7c66d22ddac8badd8803b37ac8fab32a14678f,0x0853a40961651a094014485dd7aede5cb2f1334873537a465fcded7201817f47]"  --interactive --rpc-url http://127.0.0.1:8545
   ```
   Let's break down this command and understand it -
   1. `cast send` - Sign and publish a transaction
   2. `0x5FbDB2315678afecb367f032d93F642f64180aa3` - Address of the contract we want to interface with. This can be different for you, please ensure you copy this from the previous command where we deploy `MerkleVerifier.sol`
   3. `"verifyMessage(bytes32, bytes32[])"` - We are calling this function within the `MerkleVerifier.sol` smart contract. This will help us verify the inclusion proof. 
   4. `"0x2f26a882826c3fff1bc1a43e002e31a9fdb4a5ca8409aeb2b342089c75ef298f"` - This is the transaction proof obtained from the Javascript code we have executed earlier.
   5. `"[0xd586549164154944709501137e7c66d22ddac8badd8803b37ac8fab32a14678f,0x0853a40961651a094014485dd7aede5cb2f1334873537a465fcded7201817f47]"` - This is the merkle proof obtained from the Javascript code we have executed earlier.
   6. `--interactive --rpc-url http://127.0.0.1:8545` - Allows us to input private key and send transaction to chain B
   
   Output -
   ```
    Enter private key:

    blockHash               0xedb71b6a903c5eadc3fc78af1454ae63da5c24faeac85187d1aaa174e916e105
    blockNumber             3
    contractAddress         
    cumulativeGasUsed       26193
    effectiveGasPrice       767321900
    from                    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    gasUsed                 26193
    logs                    []
    logsBloom               0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    root                    
    status                  1 (success)
    transactionHash         0xa6e07316691a64e2779572948f30640c62450a69b3e7d7ce9aa5b695e86fa623
    transactionIndex        0
    type                    2
    blobGasPrice            1
    blobGasUsed             
    authorizationList       
    to                      0x5FbDB2315678afecb367f032d93F642f64180aa3

   ```

   Upon decoding this output you can verify that `true` is returned.

   For beginners I also recommend deploying this contract on [remix](https://remix.ethereum.org/) and play with it.

   ## Discussion and Support
   Feel free to contribute to this project by creating issues or opening pull request. 
   


