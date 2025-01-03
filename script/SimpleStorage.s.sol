// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpleStorageScript is Script {
    SimpleStorage public simplestorage;

    function setUp() public {}

    function run() public {

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        simplestorage = new SimpleStorage();

        simplestorage.addToString("Hello");
        simplestorage.addToString("World");
        simplestorage.addToString("!");

        vm.stopBroadcast();
    }
}
