const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const {Web3} = require("web3");

const rpcUrl = "http://127.0.0.1:8546"; 
const web3 = new Web3(rpcUrl);

async function buildMerkleTreeFromBlock(blockNumber) {
  try {
    // Fetch the block with transaction details
    const block = await web3.eth.getBlock(blockNumber, true);

    if (!block || !block.transactions || block.transactions.length === 0) {
      console.error("No transactions found in the block.");
      return;
    }

    // Extract transaction hashes
    const transactionHashes = block.transactions.map((tx) => tx.hash);

    console.log("Transaction Hashes:", transactionHashes);

    // Generate hashed leaves
    const leaves = transactionHashes.map((hash) => keccak256(hash));
    console.log("Leaves:", leaves.map((leaf) => leaf.toString("hex")));

    // Build the Merkle tree
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    console.log("Merkle Tree:", tree.toString());

    // Get the Merkle root
    const root = tree.getRoot().toString("hex");
    console.log("Merkle Root:", root);

    // Generate a proof for a specific transaction hash (optional)
    const txToProve = transactionHashes[0]; // Example: using the first transaction hash
    const leaf = keccak256(txToProve);
    const proof = tree.getHexProof(leaf);

    console.log("Proof for transaction:", txToProve);
    console.log("Proof:", proof);

    // Verify the proof locally
    const isValid = tree.verify(proof, leaf, tree.getHexRoot());
    console.log("Is the proof valid locally?", isValid);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Replace with the desired block number
const blockNumber = 1;
buildMerkleTreeFromBlock(blockNumber);
