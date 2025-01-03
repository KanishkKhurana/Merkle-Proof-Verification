// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleVerifier {
    bytes32 public verifiedStateRoot; // Stores the trusted state root (Merkle root)

    // Event to emit when a state root is updated
    event StateRootUpdated(bytes32 indexed newStateRoot);

    // Function to update the state root (called by a trusted entity)
    function setStateRoot(bytes32 _stateRoot) external {
        verifiedStateRoot = _stateRoot;
        emit StateRootUpdated(_stateRoot);
    }

    // Verify inclusion of a leaf in the Merkle tree with the stored root
    function verifyMessage(
        bytes32 leaf, 
        bytes32[] calldata proof
    ) external view returns (bool) {
        return MerkleProof.verify(proof, verifiedStateRoot, leaf);
    }
}