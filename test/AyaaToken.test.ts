import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("AyaaToken Contract", () => {
  let owner: SignerWithAddress;
  let wuryen: SignerWithAddress;
  let kwakba: SignerWithAddress;

  let ayaaToken: Contract;
  let differentContract: Contract;

  before(async () => {
    const AyaaToken = await ethers.getContractFactory("AyaaToken");
    const DifferentContract = await ethers.getContractFactory("AyaaToken");

    [owner, wuryen, kwakba] = await ethers.getSigners();

    ayaaToken = await AyaaToken.deploy();
    differentContract = await DifferentContract.deploy();
  });

  describe("Init", async () => {
    it("should deploy", async () => {
      expect(ayaaToken).to.be.ok;
    });

    it("has a name", async () => {
      expect(await ayaaToken.name()).to.eq("AyaaToken");
    });

    it("should have no supply after deployment", async () => {
      expect(await ayaaToken.totalSupply()).to.eq(0);
    });
  });

  describe("Test minter role", async () => {
    it("should confirm deployer as owner", async () => {
      let minter = await ayaaToken.MINTER_ROLE();
      await ayaaToken.grantRole(minter, owner.address);
      expect(await ayaaToken.hasRole(minter, owner.address)).to.eq(true);
    });

    it("should mint tokens from owner", async () => {
      // Sanity check
      expect(await ayaaToken.balanceOf(owner.address)).to.eq(0);

      await ayaaToken.mint(owner.address, 100);

      expect(await ayaaToken.totalSupply()).to.eq(100);

      expect(await ayaaToken.balanceOf(owner.address)).to.eq(100);
    });

    it("should revert mint from non-minter", async () => {
      await expect(ayaaToken.connect(wuryen).mint(wuryen.address, 50)).to.be
        .reverted;
    });

    it("should revert transfer from non-admin", async () => {
      let minter = await ayaaToken.MINTER_ROLE();
      await expect(ayaaToken.connect(wuryen).grantRole(minter, wuryen.address))
        .to.be.reverted;
    });
  });
});
