// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/// @title RiskEngine - Multi-factor risk scoring for tokenized assets
/// @notice Calculates a risk score (0-1000) for assets based on land verification, jurisdiction,
///         SPV status, revenue history, and compliance.
/// @dev Weights sum to 100%. Uses UUPS upgradeable pattern.
contract RiskEngine is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice Breakdown of the composite risk score.
    struct RiskScore {
        uint16 overall;
        uint16 landVerificationScore;
        uint16 jurisdictionScore;
        uint16 spvScore;
        uint16 revenueScore;
        uint16 complianceScore;
    }

    address public landRegistry;
    address public spvRegistry;
    address public complianceManager;

    uint16 public landVerificationWeight;
    uint16 public jurisdictionWeight;
    uint16 public spvWeight;
    uint16 public revenueWeight;
    uint16 public complianceWeight;

    mapping(string => uint16) private _jurisdictionScores;
    string[] private _jurisdictions;

    event RiskEngineConfigured(address indexed landRegistry, address indexed spvRegistry, address indexed complianceManager);
    event WeightsUpdated(uint16 lw, uint16 jw, uint16 sw, uint16 rw, uint16 cw);
    event JurisdictionScoreSet(string indexed jurisdiction, uint16 score);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE and UPGRADER_ROLE.
    /// @param landRegistry_ Address of the LandRegistry contract.
    /// @param spvRegistry_ Address of the SPV registry contract.
    /// @param complianceManager_ Address of the compliance manager contract.
    function initialize(
        address admin,
        address landRegistry_,
        address spvRegistry_,
        address complianceManager_
    ) external initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        require(landRegistry_ != address(0), "invalid landRegistry");
        require(spvRegistry_ != address(0), "invalid spvRegistry");
        require(complianceManager_ != address(0), "invalid complianceManager");
        landRegistry = landRegistry_;
        spvRegistry = spvRegistry_;
        complianceManager = complianceManager_;
        landVerificationWeight = 30;
        jurisdictionWeight = 20;
        spvWeight = 20;
        revenueWeight = 15;
        complianceWeight = 15;
        emit RiskEngineConfigured(landRegistry_, spvRegistry_, complianceManager_);
    }

    /// @notice Calculate the full risk score breakdown for an asset.
    /// @param assetId_ The asset ID to evaluate.
    /// @param assetOwner_ The owner of the asset.
    /// @return RiskScore struct with overall and sub-scores.
    function calculateRisk(uint256 assetId_, address assetOwner_) public view returns (RiskScore memory) {
        uint16 lScore = _getLandVerificationScore(assetId_);
        uint16 jScore = _getJurisdictionScore(assetId_);
        uint16 sScore = _getSPVScore(assetId_);
        uint16 rScore = _getRevenueScore(assetOwner_);
        uint16 cScore = _getComplianceScore(assetOwner_);
        uint16 overall = uint16(
            (uint256(lScore) * landVerificationWeight +
             uint256(jScore) * jurisdictionWeight +
             uint256(sScore) * spvWeight +
             uint256(rScore) * revenueWeight +
             uint256(cScore) * complianceWeight) / 100
        );
        return RiskScore(overall, lScore, jScore, sScore, rScore, cScore);
    }

    /// @notice Get the overall risk score (0-1000, higher = safer).
    /// @param assetId_ The asset ID to evaluate.
    /// @param assetOwner_ The owner of the asset.
    /// @return score The composite risk score.
    function getRiskScore(uint256 assetId_, address assetOwner_) external view returns (uint16) {
        RiskScore memory risk = calculateRisk(assetId_, assetOwner_);
        return risk.overall;
    }

    /// @notice Set the weight for each risk factor. Weights must sum to 100.
    /// @param lw_ Land verification weight.
    /// @param jw_ Jurisdiction weight.
    /// @param sw_ SPV weight.
    /// @param rw_ Revenue weight.
    /// @param cw_ Compliance weight.
    function setWeights(uint16 lw_, uint16 jw_, uint16 sw_, uint16 rw_, uint16 cw_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(uint256(lw_) + jw_ + sw_ + rw_ + cw_ == 100, "weights must sum to 100");
        landVerificationWeight = lw_;
        jurisdictionWeight = jw_;
        spvWeight = sw_;
        revenueWeight = rw_;
        complianceWeight = cw_;
        emit WeightsUpdated(lw_, jw_, sw_, rw_, cw_);
    }

    /// @notice Set or update jurisdiction scores.
    /// @param jurisdiction_ Jurisdiction name.
    /// @param score_ Risk score (0-1000) for the jurisdiction.
    function setJurisdictionScore(string calldata jurisdiction_, uint16 score_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(score_ <= 1000, "score out of range");
        if (_jurisdictionScores[jurisdiction_] == 0 && bytes(jurisdiction_).length > 0) {
            _jurisdictions.push(jurisdiction_);
        }
        _jurisdictionScores[jurisdiction_] = score_;
        emit JurisdictionScoreSet(jurisdiction_, score_);
    }

    /// @notice Get the stored score for a jurisdiction.
    /// @param jurisdiction_ Jurisdiction name.
    /// @return score The jurisdiction risk score.
    function getJurisdictionScore(string calldata jurisdiction_) external view returns (uint16) {
        return _jurisdictionScores[jurisdiction_];
    }

    /// @notice Get all registered jurisdictions.
    /// @return Array of jurisdiction strings.
    function getJurisdictions() external view returns (string[] memory) {
        return _jurisdictions;
    }

    /// @notice Land verification sub-score: 100 if verified, 50 if pending, 0 otherwise.
    /// @dev ParcelStatus enum: 0=REGISTERED, 1=PENDING, 2=VERIFIED, 3=DISPUTED, 4=TOKENIZED.
    function _getLandVerificationScore(uint256 assetId_) internal view returns (uint16) {
        (bool success, bytes memory data) = landRegistry.staticcall(
            abi.encodeWithSignature("getParcelStatus(uint256)", assetId_)
        );
        if (!success || data.length == 0) return 0;
        uint8 status = abi.decode(data, (uint8));
        if (status == 2) return 100;
        if (status == 1 || status == 4) return 50;
        return 0;
    }

    /// @notice Jurisdiction sub-score from stored mapping. Defaults to 50 if unset.
    function _getJurisdictionScore(uint256 assetId_) internal view returns (uint16) {
        (bool success, bytes memory data) = landRegistry.staticcall(
            abi.encodeWithSignature("getParcelJurisdiction(uint256)", assetId_)
        );
        if (!success || data.length == 0) return 50;
        string memory jurisdiction = abi.decode(data, (string));
        uint16 stored = _jurisdictionScores[jurisdiction];
        return stored > 0 ? stored : 50;
    }

    /// @notice SPV sub-score: 100 if SPV is verified, 0 otherwise.
    function _getSPVScore(uint256 assetId_) internal view returns (uint16) {
        (bool success, bytes memory data) = landRegistry.staticcall(
            abi.encodeWithSignature("getParcelSPVId(uint256)", assetId_)
        );
        if (!success || data.length == 0) return 0;
        uint256 spvId = abi.decode(data, (uint256));
        if (spvId == 0) return 0;
        (bool spvSuccess, bytes memory spvData) = spvRegistry.staticcall(
            abi.encodeWithSignature("isSPVVerified(uint256)", spvId)
        );
        if (!spvSuccess || spvData.length == 0) return 0;
        bool verified = abi.decode(spvData, (bool));
        return verified ? 100 : 0;
    }

    /// @notice Revenue sub-score: simple proxy based on owner activity.
    function _getRevenueScore(address assetOwner_) internal view returns (uint16) {
        if (assetOwner_ == address(0)) return 0;
        (bool success, bytes memory data) = complianceManager.staticcall(
            abi.encodeWithSignature("getRevenueConsistency(address)", assetOwner_)
        );
        if (!success || data.length == 0) return 50;
        uint8 consistency = abi.decode(data, (uint8));
        if (consistency >= 80) return 100;
        if (consistency >= 50) return 60;
        return 20;
    }

    /// @notice Compliance sub-score based on investor status.
    function _getComplianceScore(address assetOwner_) internal view returns (uint16) {
        if (assetOwner_ == address(0)) return 0;
        (bool success, bytes memory data) = complianceManager.staticcall(
            abi.encodeWithSignature("isInvestorCompliant(address)", assetOwner_)
        );
        if (!success || data.length == 0) return 50;
        bool compliant = abi.decode(data, (bool));
        return compliant ? 100 : 20;
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
