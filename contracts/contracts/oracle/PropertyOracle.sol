// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../libraries/Errors.sol";

/// @title PropertyOracle — on-chain property valuation infrastructure
/// @notice Authorized appraisers push valuations (NGN primary, USD secondary) with an IPFS
///         appraisal report hash for audit trail. Valuations expire after MAX_VALUATION_AGE.
///         Historical valuations are stored for regulatory and ESG reporting.
contract PropertyOracle is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ─── Constants ─────────────────────────────────────────────────────────
    uint256 public constant MAX_VALUATION_AGE = 365 days;

    // ─── Data ──────────────────────────────────────────────────────────────
    struct Valuation {
        uint256 valueNgn;      // Nigerian Naira (primary), no decimals — raw NGN amount
        uint256 valueUsd;      // USD, 18 decimals (e.g. 1 USD = 1e18)
        uint256 timestamp;
        address appraiser;
        bytes32 reportHash;    // IPFS/Arweave CID of full appraisal report
    }

    mapping(uint256 => Valuation)   public latestValuation;
    mapping(uint256 => Valuation[]) private _history;

    // ─── Events ────────────────────────────────────────────────────────────
    event ValuationUpdated(
        uint256 indexed propertyId,
        uint256 valueNgn,
        uint256 valueUsd,
        address indexed appraiser,
        bytes32 reportHash
    );

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);
    }

    // ─── Valuation Submission ──────────────────────────────────────────────

    /// @notice Push a new valuation for a property. Both values cannot be zero.
    function updateValuation(
        uint256 propertyId,
        uint256 valueNgn,
        uint256 valueUsd,
        bytes32 reportHash
    ) external onlyRole(ORACLE_ROLE) {
        if (valueNgn == 0 && valueUsd == 0) revert Errors.InvalidValuation();

        Valuation memory v = Valuation({
            valueNgn:   valueNgn,
            valueUsd:   valueUsd,
            timestamp:  block.timestamp,
            appraiser:  msg.sender,
            reportHash: reportHash
        });

        latestValuation[propertyId] = v;
        _history[propertyId].push(v);

        emit ValuationUpdated(propertyId, valueNgn, valueUsd, msg.sender, reportHash);
    }

    // ─── Batch Submission ──────────────────────────────────────────────────

    function updateValuationBatch(
        uint256[] calldata propertyIds,
        uint256[] calldata valuesNgn,
        uint256[] calldata valuesUsd,
        bytes32[] calldata reportHashes
    ) external onlyRole(ORACLE_ROLE) {
        uint256 len = propertyIds.length;
        if (len != valuesNgn.length || len != valuesUsd.length || len != reportHashes.length) {
            revert Errors.ArrayLengthMismatch();
        }
        for (uint256 i = 0; i < len; i++) {
            if (valuesNgn[i] == 0 && valuesUsd[i] == 0) revert Errors.InvalidValuation();
            Valuation memory v = Valuation({
                valueNgn:   valuesNgn[i],
                valueUsd:   valuesUsd[i],
                timestamp:  block.timestamp,
                appraiser:  msg.sender,
                reportHash: reportHashes[i]
            });
            latestValuation[propertyIds[i]] = v;
            _history[propertyIds[i]].push(v);
            emit ValuationUpdated(propertyIds[i], valuesNgn[i], valuesUsd[i], msg.sender, reportHashes[i]);
        }
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function getLatestValuation(uint256 propertyId) external view returns (Valuation memory) {
        return latestValuation[propertyId];
    }

    function isValuationFresh(uint256 propertyId) external view returns (bool) {
        Valuation storage v = latestValuation[propertyId];
        return v.timestamp != 0 && (block.timestamp - v.timestamp) <= MAX_VALUATION_AGE;
    }

    function getValuationHistory(uint256 propertyId) external view returns (Valuation[] memory) {
        return _history[propertyId];
    }

    function getValuationHistoryLength(uint256 propertyId) external view returns (uint256) {
        return _history[propertyId].length;
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
