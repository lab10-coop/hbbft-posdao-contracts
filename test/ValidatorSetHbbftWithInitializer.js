/*
 * tests initialization with the InitializerHbbft contract.
 * init params for a single initial validator were created with hbbft_config_generator.
 * For this test to succeed, the following check had to be disabled in all the indirectly initialized contracts:
 * require(_getCurrentBlockNumber() == 0 || msg.sender == _admin()
 * Doing so when deploying to a new chain is safe, as long as the following check is in place:
 * require(!isInitialized());
 */

const ValidatorSetHbbft = artifacts.require('ValidatorSetHbbft');
const StakingHbbft = artifacts.require('StakingHbbft');
const BlockRewardHbbft = artifacts.require('BlockRewardHbbft');
const RandomHbbft = artifacts.require('RandomHbbft');
const TxPermissionHbbft = artifacts.require('TxPermissionHbbft');
const CertifierHbbft = artifacts.require('CertifierHbbft');
const Registry = artifacts.require('Registry');
const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');
const KeyGenHistory = artifacts.require('KeyGenHistory');
const InitializerHbbft = artifacts.require('InitializerHbbft');

const BN = web3.utils.BN;

const fp = require('lodash/fp');
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('InitializerHbbft', async accounts => {
  let owner;
  let initialValidators;
  let stakingAddresses;
  let publicKeys;
  let internetAddresses;
  let parts;
  let acks;

  let validatorSetHbbft;
  let keyGenHistory;
  let stakingHbbft;
  let blockRewardHbbft;
  let randomHbbft;
  let txPermissionHbbft;
  let certifierHbbft;
  let registry;

  beforeEach(async () => {
    owner = accounts[0];

    validatorSetHbbft = await ValidatorSetHbbft.new();
    validatorSetHbbft = await AdminUpgradeabilityProxy.new(validatorSetHbbft.address, owner, []);
    validatorSetHbbft = await ValidatorSetHbbft.at(validatorSetHbbft.address);

    keyGenHistory = await KeyGenHistory.new();
    keyGenHistory = await AdminUpgradeabilityProxy.new(keyGenHistory.address, owner, []);
    keyGenHistory = await KeyGenHistory.at(keyGenHistory.address);

    stakingHbbft = await StakingHbbft.new();
    stakingHbbft = await AdminUpgradeabilityProxy.new(stakingHbbft.address, owner, []);
    stakingHbbft = await StakingHbbft.at(stakingHbbft.address);

    blockRewardHbbft = await BlockRewardHbbft.new();
    blockRewardHbbft = await AdminUpgradeabilityProxy.new(blockRewardHbbft.address, owner, []);
    blockRewardHbbft = await BlockRewardHbbft.at(blockRewardHbbft.address);

    randomHbbft = await RandomHbbft.new();
    randomHbbft = await AdminUpgradeabilityProxy.new(randomHbbft.address, owner, []);
    randomHbbft = await RandomHbbft.at(randomHbbft.address);

    txPermissionHbbft = await TxPermissionHbbft.new();
    txPermissionHbbft = await AdminUpgradeabilityProxy.new(txPermissionHbbft.address, owner, []);
    txPermissionHbbft = await TxPermissionHbbft.at(txPermissionHbbft.address);

    certifierHbbft = await CertifierHbbft.new();
    certifierHbbft = await AdminUpgradeabilityProxy.new(certifierHbbft.address, owner, []);
    certifierHbbft = await CertifierHbbft.at(certifierHbbft.address);

    registry = await Registry.new(certifierHbbft.address, owner);

    initialValidators = ["0x4df6caf91bd4bb9605af00983c4f7d996d685182"];
    stakingAddresses = [accounts[50]];
    parts = [[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,174,28,106,54,163,159,31,51,106,171,186,94,88,116,4,194,166,83,39,70,25,6,95,82,141,82,169,15,70,174,230,228,26,65,189,189,147,233,39,241,139,199,221,143,129,27,69,195,1,0,0,0,0,0,0,0,153,0,0,0,0,0,0,0,4,122,61,232,239,85,7,195,8,6,172,118,64,24,246,226,198,227,117,228,90,136,189,171,187,173,149,72,126,10,236,253,160,94,114,106,229,106,135,71,20,111,107,74,51,174,152,207,174,16,168,233,34,244,20,239,1,55,36,37,90,82,132,149,131,23,80,42,167,35,13,98,56,3,20,126,241,116,186,207,154,51,172,59,75,142,109,50,103,112,128,123,108,88,180,240,10,200,205,121,50,19,96,107,237,111,173,68,23,57,133,224,127,8,216,7,81,94,250,105,145,218,121,228,132,210,70,141,144,105,56,185,166,220,141,140,172,34,221,51,85,248,85,37,106,85,53,122,190,111,152,71,156]];
    acks = [[[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,145,0,0,0,0,0,0,0,4,55,113,62,249,58,152,217,238,188,82,34,84,250,211,105,22,212,167,211,159,38,133,100,216,228,37,254,67,242,80,224,129,178,18,182,9,11,140,100,85,137,18,205,213,242,196,232,76,16,45,206,109,15,104,19,39,138,253,131,107,47,35,176,253,194,69,36,236,83,35,31,139,16,37,34,169,142,231,40,154,34,20,247,132,86,70,212,216,36,207,61,134,226,92,10,12,251,7,142,65,150,125,90,109,237,126,215,55,151,61,211,201,0,38,78,153,185,125,2,117,73,98,131,135,236,229,178,91,47,193,130,232,125,83,7,145,223,235,209,73,247,230,239,14]]];
    publicKeys = ["0x4a42f5f378fd4312563eb0d61c78c13673fe765f327b36cb10b095271f623b5bbed28f171ee299470de5d86b10ce03b6994a74379f166c0b9c7892bb27028351"];

    for (let i = 0; i < publicKeys.length; i++) {
      publicKeys[i] = publicKeys[i].trim();
    }
    internetAddresses = ["0x00000000000000000000000000000001"];

    let publicKeysSplit = fp.flatMap(x => [x.substring(0, 66), '0x' + x.substring(66, 130)])(publicKeys);
    let stakingParams = [web3.utils.toWei('1', 'ether'), web3.utils.toWei('1', 'ether'), 80, 10]; // delegatorMinStake, candidateMinStake, stakingFixedEpochDuration, stakingWithdrawDisallowPeriod
    let blockReward = web3.utils.toWei('1', 'ether');

    let initializerHbbft = await InitializerHbbft.new(
      [
        validatorSetHbbft.address,
        blockRewardHbbft.address,
        randomHbbft.address,
        stakingHbbft.address,
        txPermissionHbbft.address,
        certifierHbbft.address,
        keyGenHistory.address
      ],
      owner,
      initialValidators,
      stakingAddresses,
      stakingParams,
      publicKeysSplit,
      internetAddresses,
      parts,
      acks,
      blockReward
    );
  });

  describe('initialize()', async () => {
    it('should initialize successfully', async () => {
      // if initialization doesn't succeed, this test will fail already in the preparation phase
    });
  });

  describe('validator_data()', async () => {
    it('should return the correct number of validators', async () => {
      const validators = await validatorSetHbbft.getValidators();
      validators.length.should.be.equal(1);
    });

    it('should return the correct public key for validators', async () => {
      const validators = await validatorSetHbbft.getValidators();
      (await validatorSetHbbft.publicKeyByStakingAddress(stakingAddresses[0])).should.be.equal(publicKeys[0]);
    });
  });
});
