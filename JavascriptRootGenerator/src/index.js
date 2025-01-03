const { Web3 } = require('web3');
const { Trie } = require('@ethereumjs/trie');
const RLP = require('rlp');
const { toHex } = require('web3-utils');


async function generateTransactionProof(blockNumber, transactionIndex, rpcUrl) {
  const web3 = new Web3(rpcUrl);

  // Fetch the block details with full transaction objects
  const block = await web3.eth.getBlock(blockNumber, true);
  if (!block) {
    console.error('Block not found!');
    return;
  }

  const { transactions, transactionsRoot } = block;
  console.log('Block Transaction Root:', transactionsRoot);
  console.log('Transactions:', transactions);

  // Create a Merkle Patricia Trie
  const trie = new Trie();

  // Utility function to serialize transaction data
  function serializeTransaction(tx) {
    return RLP.encode([
      toHex(tx.nonce).startsWith('0x') ? tx.nonce : `0x${tx.nonce.toString(16)}`,
      toHex(tx.gasPrice).startsWith('0x') ? tx.gasPrice : `0x${tx.gasPrice.toString(16)}`,
      toHex(tx.gas).startsWith('0x') ? tx.gas : `0x${tx.gas.toString(16)}`,
      tx.to ? tx.to.toLowerCase() : '0x',
      toHex(tx.value).startsWith('0x') ? tx.value : `0x${tx.value.toString(16)}`,
      tx.input,
      toHex(tx.v).startsWith('0x') ? tx.v : `0x${tx.v.toString(16)}`,
      toHex(tx.r).startsWith('0x') ? tx.r : `0x${tx.r.toString(16)}`,
      toHex(tx.s).startsWith('0x') ? tx.s : `0x${tx.s.toString(16)}`,
    ]);
  }

  // Insert each transaction into the Trie
  for (let i = 0; i < transactions.length; i++) {
    const txIndexKey = RLP.encode(i); // Encode the transaction index
    const txValue = serializeTransaction(transactions[i]);

    await trie.put(txIndexKey, txValue);
  }

  // Verify that the computed root matches the block's transactionRoot
  const computedRoot = toHex(trie.root());
  console.log('Computed Transaction Root:', computedRoot);


  // Generate a proof for the specified transaction index
  const txIndexKey = RLP.encode(transactionIndex);
  const proof = await trie.createProof(txIndexKey);

  const txIndexValue = await trie.get(txIndexKey);
    console.log('Transaction Index Value:', toHex(txIndexValue));

  // Convert proof items to hex strings for compatibility with Ethereum
  const proofHex = proof.map(buf => toHex(buf));
  console.log('Generated Proof:', proofHex);

  // Verify the proof
  const value = await trie.verifyProof(trie.root(), txIndexKey, proof);
  const verified = value !== null;

  return {
    proof: proofHex,
    computedRoot,
    verified,
  };
}

// Example Usage
(async () => {
  const blockNumber = 1; // Replace with the desired block number
  const transactionIndex = 0; // Replace with the transaction index to verify
  const rpcUrl = 'http://127.0.0.1:8546'; // Replace with your RPC endpoint

  try {
    const result = await generateTransactionProof(blockNumber, transactionIndex, rpcUrl);
    console.log('Proof Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
