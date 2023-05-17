const {
    time,
    loadFixture,
    setCode,
    getStorageAt,
    setStorageAt
} = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Test", function () {
    async function deploy() {
        const multiplier = 5;
        const targetAddress = "0xC8fC9C5872EA26dc43Aa91896005B82fCeCbd03a";
        const year = 3600 * 24 * 365;
        const eth = ethers.utils.parseUnits("1.0", "ether");
        const [owner, user, otherAccount] = await ethers.getSigners();
        const Caller = await ethers.getContractFactory("Caller");
        const caller = await Caller.deploy();
        await caller.deployed();

        const Target = await ethers.getContractFactory("Target");
        let target = await Target.deploy(multiplier);
        await target.deployed();

        let bytecode = await ethers.provider.getCode(target.address);    
        let storage = await getStorageAt(target.address, 0);
        
        await setCode(targetAddress, bytecode);
        await setStorageAt(targetAddress, 0, storage);

        target = await ethers.getContractAt("Target", targetAddress);

        return { caller, target, multiplier, year, eth, owner, user, otherAccount };
    }

    describe("Target", function () {
        describe("Deployment", function () {
            it("Check multiplier", async () => {
                const { target, multiplier } = await loadFixture(deploy);
                expect(multiplier).to.equal(await target.multiplier());
            })
        });

        describe("getNumber", function () {
            it("Check result", async () => {
                const { target, multiplier } = await loadFixture(deploy);
                const number = 5;
                expect(number * multiplier).to.equal(await target.getNumber(number));
            })
        });
    });

    describe("Caller", function () {
        describe("setNumber", function () {
            it("Check setNumber", async () => {
                const { target, caller,  multiplier } = await loadFixture(deploy);
                const number = 5;
                const tx = await caller.setNumber(number);
                await tx.wait();
                expect(await caller.number()).to.equal(number * multiplier);
            })
        });

        describe("Event SetNumber", function () {
            it("Check Event SetNumber", async () => {
                const { caller,  multiplier } = await loadFixture(deploy);
                const number = 5;
                await expect(caller.setNumber(number))
                .emit(caller, "SetNumber")
                .withArgs(number * multiplier);
            })
        });

        describe("lockEth", function () {
            describe("Requires", function () {
                it("Check stake", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    const tx = await caller.lockEth(year, { value: eth });
                    await tx.wait();
                    await expect(caller.lockEth(year, { value: eth }))
                    .rejectedWith("You already have a stake")
                })
            });
            describe("lockEth", function () {
                it("Check statment", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    const tx = await caller.lockEth(year, { value: eth });
                    await tx.wait();
                    const stake = await caller.stakes(owner.address);
                    const now = await time.latest();
                    const expectStake = { value: eth, lockTime: year + now };
                    const returnStake = { value: stake.value, lockTime: stake.lockTime };
                    expect(expectStake).to.deep.equal(returnStake);
                });
                it("Check ether", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    await expect(caller.lockEth(year, { value: eth }))
                    .changeEtherBalances(
                        [owner.address, caller.address],
                        [eth.mul(-1), eth]
                    )
                })
            });
        });

        describe("unlockEth", function () {
            describe("Require1", function () {
                it("Check stake", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    const tx = await caller.lockEth(year, { value: 0 });
                    await tx.wait();
                    await expect(caller.unloclEth())
                    .rejectedWith("You don't have a stake")
                })
            });
            describe("Require2", function () {
                it("Check stake", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    const tx = await caller.lockEth(year, { value: eth });
                    await tx.wait();
                    await expect(caller.unloclEth())
                    .rejectedWith("You can't take out yet a stake")
                })
            });
            describe("unloclEth", function () {
                it("Check statment", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    let tx = await caller.lockEth(year, { value: eth });
                    await tx.wait();
                    await time.increase(year);
                    tx = await caller.unloclEth();
                    await tx.wait();
                    const stake = await caller.stakes(owner.address);
                    const now = await time.latest();
                    const expectStake = { value: 0, lockTime: 0};
                    const returnStake = { value: stake.value, lockTime: stake.lockTime };
                    expect(expectStake).to.deep.equal(returnStake);
                });
                it("Check ether", async () => {
                    const { caller, owner, year, eth } = await loadFixture(deploy);
                    let tx = await caller.lockEth(year, { value: eth });
                    await tx.wait();
                    await time.increase(year);

                    await expect(caller.unloclEth())
                    .changeEtherBalances(
                        [owner.address, caller.address],
                        [eth, eth.mul(-1)]
                    )
                })
            });
        });
    });

    
});
