// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract AyahFarm {
  function stakeDai(uint256 amount) public {}

  function unstakeDai(uint256 amount) public {}

  function calYieldTime(address user) public view returns (uint256) {}

  function calYieldTotal(address user) public view returns (uint256) {}

  function withdrawYield() public {}

  function mintNFT(address user, string memory tokenURI) public {}
}
