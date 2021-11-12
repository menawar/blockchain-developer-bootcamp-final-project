import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@openzeppelin/test-helpers";

chai.use(solidity);

describe("AyaaFarm Contract", () => {
  let res: any;

  let owner: SignerWithAddress;
  let wuryen: SignerWithAddress;
  let kwakba: SignerWithAddress;
  let isaac: SignerWithAddress;
  let esther: SignerWithAddress;
  let agnes: SignerWithAddress;

  let ayaaFarm: Contract;
  let mockDai: Contract;
  let ayaaToken: Contract;

  const daiAmount: BigNumber = ethers.utils.parseEther("25000");

  before(async () => {
    const AyaaFarm = await ethers.getContractFactory("AyaaFarm");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const AyaaToken = await ethers.getContractFactory("AyaaToken");
    [owner, wuryen, kwakba, isaac, esther, agnes] = await ethers.getSigners();

    mockDai = await MockERC20.deploy("MockDai", "mDAI");
    ayaaToken = await AyaaToken.deploy();

    await Promise.all([
      mockDai.mint(owner.address, daiAmount),
      mockDai.mint(wuryen.address, daiAmount),
      mockDai.mint(kwakba.address, daiAmount),
      mockDai.mint(isaac.address, daiAmount),
      mockDai.mint(esther.address, daiAmount),
      mockDai.mint(agnes.address, daiAmount),
    ]);

    let ayaaFarmParams: Array<string | BigNumber> = [
      mockDai.address,
      ayaaToken.address,
    ];

    // AyaaFarm Contract deployment
    ayaaFarm = await AyaaFarm.deploy(...ayaaFarmParams);
  });

  describe("Init", async () => {
    it("should deploy contracts", async () => {
      expect(ayaaFarm).to.be.ok;
      expect(ayaaToken).to.be.ok;
      expect(mockDai).to.be.ok;
    });

    it("should return name", async () => {
      expect(await ayaaFarm.name()).to.eq("Ayaa Farm");
      expect(await mockDai.name()).to.eq("MockDai");
      expect(await ayaaToken.name()).to.eq("AyaaToken");
    });

    it("should show mockDai balance", async () => {
      expect(await mockDai.balanceOf(owner.address)).to.eq(daiAmount);
    });
  });

  describe("Staking", async () => {
    it("should stake and update mapping", async () => {
      let toTransfer = ethers.utils.parseEther("100");
      await mockDai.connect(wuryen).approve(ayaaFarm.address, toTransfer);

      expect(await ayaaFarm.isStaking(wuryen.address)).to.eq(false);

      expect(await ayaaFarm.connect(wuryen).stakeDai(toTransfer)).to.be.ok;

      expect(await ayaaFarm.stakingBalance(wuryen.address)).to.eq(toTransfer);

      expect(await ayaaFarm.isStaking(wuryen.address)).to.eq(true);
    });

    it("should remove dai from user", async () => {
      res = await mockDai.balanceOf(wuryen.address);
      expect(Number(res)).to.be.lessThan(Number(daiAmount));
    });

    it("should update balance with multiple stakes", async () => {
      let toTransfer = ethers.utils.parseEther("100");
      await mockDai.connect(agnes).approve(ayaaFarm.address, toTransfer);
      await ayaaFarm.connect(agnes).stakeDai(toTransfer);
    });

    it("should revert stake with zero as staked amount", async () => {
      await expect(ayaaFarm.connect(kwakba).stakeDai(0)).to.be.revertedWith(
        "You cannot stake zero tokens"
      );
    });

    it("should revert stake without allowance", async () => {
      let toTransfer = ethers.utils.parseEther("50");
      await expect(
        ayaaFarm.connect(kwakba).stakeDai(toTransfer)
      ).to.be.revertedWith("transfer amount exceeds allowance");
    });

    it("should revert with not enough funds", async () => {
      let toTransfer = ethers.utils.parseEther("1000000");
      await mockDai.approve(ayaaFarm.address, toTransfer);

      await expect(
        ayaaFarm.connect(kwakba).stakeDai(toTransfer)
      ).to.be.revertedWith("You cannot stake zero tokens");
    });
  });
  describe("Unstaking", async () => {
    it("should unstake balance from user", async () => {
      res = await ayaaFarm.stakingBalance(wuryen.address);
      expect(Number(res)).to.be.greaterThan(0);

      let toTransfer = ethers.utils.parseEther("100");
      await ayaaFarm.connect(wuryen).unstakeDai(toTransfer);
      res = await ayaaFarm.stakingBalance(wuryen.address);
      expect(Number(res)).to.eq(0);
    });

    it("should remove staking status", async () => {
      expect(await ayaaFarm.isStaking(wuryen.address)).to.eq(false);
    });

    it("should transfer ownership", async () => {
      let minter = await ayaaToken.MINTER_ROLE();
      await ayaaToken.grantRole(minter, ayaaFarm.address);

      expect(await ayaaToken.hasRole(minter, ayaaFarm.address)).to.eq(true);
    });
  });
});
