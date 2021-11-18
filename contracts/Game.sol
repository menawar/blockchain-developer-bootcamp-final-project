// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract Game is ERC721 {
  // struct to hold our character's attributes.
  struct CharacterAttributes {
    uint256 characterIndex;
    string name;
    string imageURI;
    uint256 hp;
    uint256 maxHp;
    uint256 attackDamage;
  }

  // The tokenId is the NFTs unique identifier, it's just a number that goes
  // 0, 1, 2, 3, etc.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  CharacterAttributes[] defaultCharacters;

  //mapping for the nft's tokenId => that NFTs attributes.
  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

  // A mapping from an address => the NFTs tokenId. Gives me an ez way
  // to store the owner of the NFT and reference it later.
  mapping(address => uint256) public nftHolders;

  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint256[] memory characterHp,
    uint256[] memory characterAttackDmg
  ) ERC721("Heroes", "HERO") {
    for (uint256 i = 0; i < characterNames.length; i += 1) {
      defaultCharacters.push(
        CharacterAttributes({
          characterIndex: i,
          name: characterNames[i],
          imageURI: characterImageURIs[i],
          hp: characterHp[i],
          maxHp: characterHp[i],
          attackDamage: characterAttackDmg[i]
        })
      );

      CharacterAttributes memory c = defaultCharacters[i];

      // Hardhat's use of console.log() allows up to 4 parameters in any order of following types: uint, string, bool, address
      console.log(
        "Done initializing %s w/ HP %s, img %s",
        c.name,
        c.hp,
        c.imageURI
      );
    }

    // I increment tokenIds here so that my first NFT has an ID of 1.
    _tokenIds.increment();
  }

  // Users would be able to hit this function and get their NFT based on the
  // characterId they send in!
  function mintCharacterNFT(uint256 _characterIndex) external {
    // Get current tokenId (starts at 1 since we incremented in the constructor).
    uint256 newItemId = _tokenIds.current();

    // The magical function! Assigns the tokenId to the caller's wallet address.
    _safeMint(msg.sender, newItemId);

    // We map the tokenId => their character attributes.
    nftHolderAttributes[newItemId] = CharacterAttributes({
      characterIndex: _characterIndex,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp: defaultCharacters[_characterIndex].hp,
      maxHp: defaultCharacters[_characterIndex].maxHp,
      attackDamage: defaultCharacters[_characterIndex].attackDamage
    });

    console.log(
      "Minted NFT w/ tokenId %s and characterIndex %s",
      newItemId,
      _characterIndex
    );

    // Keep an easy way to see who owns what NFT.
    nftHolders[msg.sender] = newItemId;

    // Increment the tokenId for the next person that uses it.
    _tokenIds.increment();
  }
}
