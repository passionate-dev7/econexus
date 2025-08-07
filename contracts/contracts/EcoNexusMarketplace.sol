// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IHederaTokenService.sol";
import "./SafeHederaTokenService.sol";

/**
 * @title EcoNexus Marketplace
 * @dev Manages environmental credit trading and ReFi staking pools on Hedera
 */
contract EcoNexusMarketplace is SafeHederaTokenService {
    
    // Credit types
    enum CreditType { Carbon, Biodiversity, Water, Soil }
    
    // Credit listing structure
    struct CreditListing {
        address seller;
        address tokenAddress;
        CreditType creditType;
        uint256 amount;
        uint256 pricePerUnit; // in tinybars
        uint256 minPurchase;
        uint256 vintageYear;
        string zoneId;
        bool active;
    }
    
    // ReFi Pool structure
    struct ReFiPool {
        string name;
        string[] targetZones;
        uint256 totalStaked;
        uint256 apy; // Annual percentage yield (basis points, e.g., 1500 = 15%)
        uint256 minimumStake;
        uint256 lockPeriod; // in seconds
        uint256 createdAt;
        bool active;
    }
    
    // Staking position
    struct StakingPosition {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        uint256 accumulatedRewards;
    }
    
    // State variables
    mapping(uint256 => CreditListing) public listings;
    mapping(uint256 => ReFiPool) public pools;
    mapping(uint256 => mapping(address => StakingPosition)) public stakes;
    mapping(address => mapping(address => uint256)) public creditBalances;
    mapping(string => address) public zoneOwners;
    
    uint256 public nextListingId;
    uint256 public nextPoolId;
    uint256 public platformFee = 200; // 2% in basis points
    address public guardian;
    address public treasury;
    
    // Events
    event ListingCreated(uint256 indexed listingId, address seller, CreditType creditType, uint256 amount, uint256 price);
    event CreditsPurchased(uint256 indexed listingId, address buyer, uint256 amount, uint256 totalCost);
    event PoolCreated(uint256 indexed poolId, string name, uint256 apy, uint256 minimumStake);
    event Staked(uint256 indexed poolId, address staker, uint256 amount);
    event RewardsClaimed(uint256 indexed poolId, address staker, uint256 rewards);
    event Unstaked(uint256 indexed poolId, address staker, uint256 amount);
    event ZoneRegistered(string zoneId, address owner);
    
    modifier onlyGuardian() {
        require(msg.sender == guardian, "Only Guardian can call");
        _;
    }
    
    constructor(address _treasury, address _guardian) {
        treasury = _treasury;
        guardian = _guardian;
    }
    
    /**
     * @dev Register a new conservation zone
     */
    function registerZone(string memory zoneId, address owner) external onlyGuardian {
        require(zoneOwners[zoneId] == address(0), "Zone already registered");
        zoneOwners[zoneId] = owner;
        emit ZoneRegistered(zoneId, owner);
    }
    
    /**
     * @dev Create a new credit listing
     */
    function createListing(
        address tokenAddress,
        CreditType creditType,
        uint256 amount,
        uint256 pricePerUnit,
        uint256 minPurchase,
        uint256 vintageYear,
        string memory zoneId
    ) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerUnit > 0, "Price must be greater than 0");
        require(zoneOwners[zoneId] == msg.sender, "Not zone owner");
        
        uint256 listingId = nextListingId++;
        
        listings[listingId] = CreditListing({
            seller: msg.sender,
            tokenAddress: tokenAddress,
            creditType: creditType,
            amount: amount,
            pricePerUnit: pricePerUnit,
            minPurchase: minPurchase,
            vintageYear: vintageYear,
            zoneId: zoneId,
            active: true
        });
        
        emit ListingCreated(listingId, msg.sender, creditType, amount, pricePerUnit);
        return listingId;
    }
    
    /**
     * @dev Purchase credits from a listing
     */
    function purchaseCredits(uint256 listingId, uint256 amount) external payable {
        CreditListing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(amount >= listing.minPurchase, "Below minimum purchase");
        require(amount <= listing.amount, "Insufficient credits available");
        
        uint256 totalCost = amount * listing.pricePerUnit;
        uint256 fee = (totalCost * platformFee) / 10000;
        uint256 sellerAmount = totalCost - fee;
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Update listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }
        
        // Transfer credits (simplified - would use HTS in production)
        creditBalances[listing.tokenAddress][msg.sender] += amount;
        
        // Transfer payments
        payable(listing.seller).transfer(sellerAmount);
        payable(treasury).transfer(fee);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit CreditsPurchased(listingId, msg.sender, amount, totalCost);
    }
    
    /**
     * @dev Create a new ReFi staking pool
     */
    function createPool(
        string memory name,
        string[] memory targetZones,
        uint256 apy,
        uint256 minimumStake,
        uint256 lockPeriod
    ) external onlyGuardian returns (uint256) {
        require(apy > 0 && apy <= 10000, "Invalid APY"); // Max 100%
        require(minimumStake > 0, "Invalid minimum stake");
        
        uint256 poolId = nextPoolId++;
        
        pools[poolId] = ReFiPool({
            name: name,
            targetZones: targetZones,
            totalStaked: 0,
            apy: apy,
            minimumStake: minimumStake,
            lockPeriod: lockPeriod,
            createdAt: block.timestamp,
            active: true
        });
        
        emit PoolCreated(poolId, name, apy, minimumStake);
        return poolId;
    }
    
    /**
     * @dev Stake HBAR in a ReFi pool
     */
    function stake(uint256 poolId) external payable {
        ReFiPool storage pool = pools[poolId];
        require(pool.active, "Pool not active");
        require(msg.value >= pool.minimumStake, "Below minimum stake");
        
        StakingPosition storage position = stakes[poolId][msg.sender];
        
        // Calculate and store pending rewards if already staking
        if (position.amount > 0) {
            uint256 pendingRewards = calculateRewards(poolId, msg.sender);
            position.accumulatedRewards += pendingRewards;
        }
        
        // Update position
        position.amount += msg.value;
        position.stakedAt = block.timestamp;
        position.lastRewardClaim = block.timestamp;
        
        // Update pool
        pool.totalStaked += msg.value;
        
        emit Staked(poolId, msg.sender, msg.value);
    }
    
    /**
     * @dev Calculate rewards for a staker
     */
    function calculateRewards(uint256 poolId, address staker) public view returns (uint256) {
        ReFiPool memory pool = pools[poolId];
        StakingPosition memory position = stakes[poolId][staker];
        
        if (position.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - position.lastRewardClaim;
        uint256 annualReward = (position.amount * pool.apy) / 10000;
        uint256 reward = (annualReward * timeStaked) / 365 days;
        
        return reward + position.accumulatedRewards;
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards(uint256 poolId) external {
        StakingPosition storage position = stakes[poolId][msg.sender];
        require(position.amount > 0, "No staking position");
        
        uint256 rewards = calculateRewards(poolId, msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        position.lastRewardClaim = block.timestamp;
        position.accumulatedRewards = 0;
        
        payable(msg.sender).transfer(rewards);
        
        emit RewardsClaimed(poolId, msg.sender, rewards);
    }
    
    /**
     * @dev Unstake from a pool
     */
    function unstake(uint256 poolId, uint256 amount) external {
        ReFiPool storage pool = pools[poolId];
        StakingPosition storage position = stakes[poolId][msg.sender];
        
        require(position.amount >= amount, "Insufficient staked amount");
        require(
            block.timestamp >= position.stakedAt + pool.lockPeriod,
            "Still in lock period"
        );
        
        // Claim rewards first
        uint256 rewards = calculateRewards(poolId, msg.sender);
        if (rewards > 0) {
            position.accumulatedRewards = 0;
            payable(msg.sender).transfer(rewards);
        }
        
        // Update position and pool
        position.amount -= amount;
        position.lastRewardClaim = block.timestamp;
        pool.totalStaked -= amount;
        
        // Transfer staked amount back
        payable(msg.sender).transfer(amount);
        
        emit Unstaked(poolId, msg.sender, amount);
    }
    
    /**
     * @dev Get pool statistics
     */
    function getPoolStats(uint256 poolId) external view returns (
        string memory name,
        uint256 totalStaked,
        uint256 apy,
        uint256 participantCount
    ) {
        ReFiPool memory pool = pools[poolId];
        
        // Count participants (simplified - would be tracked separately in production)
        uint256 participants = 0;
        // This is a placeholder - actual implementation would track this
        
        return (pool.name, pool.totalStaked, pool.apy, participants);
    }
    
    /**
     * @dev Update platform fee (governance function)
     */
    function updatePlatformFee(uint256 newFee) external onlyGuardian {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }
    
    // Fallback function to receive HBAR
    receive() external payable {}
}