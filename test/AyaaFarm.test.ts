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

    /*//////////////////////
          // Dai Transfers      //
          //////////////////////*/

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
});
