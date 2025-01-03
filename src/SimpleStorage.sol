// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract SimpleStorage {
    // Event to notify when a string is added
    event StringAdded(string indexed newString, uint256 index);

    string[] public strings;

    // Add a string to the array
    function addToString(string memory _data) public {
        strings.push(_data);
        emit StringAdded(_data, strings.length - 1); // Emit event after adding the string
    }

    // Get the number of strings in the array (optional helper)
    function getStringCount() public view returns (uint256) {
        return strings.length;
    }

    // Get a string at a specific index
    function getStringAt(uint256 index) public view returns (string memory) {
        require(index < strings.length, "Index out of bounds");
        return strings[index];
    }
}
