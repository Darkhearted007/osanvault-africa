// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title CarbonRetirement - Carbon credit retirement with serialization and beneficiary tracking
/// @notice Provides detailed retirement records with unique serial numbers for carbon credits.
/// @dev Can be used alongside or as an extension to CarbonRegistry for audit-grade retirements.
contract CarbonRetirement is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice A single retirement record with beneficiary and serial number.
    struct Retirement {
        uint256 retirementId;
        address retirer;
        uint256 projectId;
        uint256 amount;
        string serialNumber;
        string beneficiary;
        string reason;
        uint256 timestamp;
        string certificateCID;
    }

    address public carbonRegistry;
    uint256 private _nextRetirementId;
    uint256 private _serialCounter;

    mapping(uint256 => Retirement) private _retirements;
    mapping(address => uint256[]) private _retirementsByRetirer;
    mapping(string => bool) private _usedSerialNumbers;

    event CreditsRetired(
        uint256 indexed retirementId,
        uint256 indexed projectId,
        uint256 amount,
        string serialNumber,
        string beneficiary,
        string reason,
        address indexed retirer,
        string certificateCID
    );
    event CarbonRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, VERIFIER_ROLE, UPGRADER_ROLE.
    /// @param carbonRegistry_ Address of the CarbonRegistry contract.
    function initialize(address admin, address carbonRegistry_) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        require(carbonRegistry_ != address(0), "invalid carbonRegistry");
        carbonRegistry = carbonRegistry_;
    }

    /// @notice Retire credits with beneficiary and reason details.
    /// @param projectId_ The project ID from CarbonRegistry.
    /// @param amount_ Number of credits to retire.
    /// @param beneficiary_ Name or identifier of the beneficiary.
    /// @param reason_ Reason for retirement.
    /// @return retirementId The newly created retirement ID.
    function retireCredits(
        uint256 projectId_,
        uint256 amount_,
        string calldata beneficiary_,
        string calldata reason_
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused returns (uint256 retirementId) {
        require(projectId_ > 0, "invalid projectId");
        require(amount_ > 0, "amount zero");
        require(bytes(beneficiary_).length > 0, "empty beneficiary");

        retirementId = ++_nextRetirementId;
        string memory serialNumber = _generateSerialNumber(projectId_, retirementId);

        _retirements[retirementId] = Retirement({
            retirementId: retirementId,
            retirer: msg.sender,
            projectId: projectId_,
            amount: amount_,
            serialNumber: serialNumber,
            beneficiary: beneficiary_,
            reason: reason_,
            timestamp: block.timestamp,
            certificateCID: ""
        });
        _retirementsByRetirer[msg.sender].push(retirementId);

        (bool success,) = carbonRegistry.call(
            abi.encodeWithSignature("retireCredits(uint256,uint256)", projectId_, amount_)
        );
        require(success, "registry retire failed");

        emit CreditsRetired(retirementId, projectId_, amount_, serialNumber, beneficiary_, reason_, msg.sender, "");
    }

    /// @notice Update the certificate CID for an existing retirement.
    /// @param retirementId_ The retirement ID to update.
    /// @param certificateCID_ IPFS CID of the retirement certificate.
    function setCertificateCID(uint256 retirementId_, string calldata certificateCID_) external onlyRole(VERIFIER_ROLE) {
        require(retirementId_ > 0 && retirementId_ <= _nextRetirementId, "retirement not found");
        require(bytes(certificateCID_).length > 0, "empty CID");
        _retirements[retirementId_].certificateCID = certificateCID_;
    }

    /// @notice Set the CarbonRegistry address.
    /// @param newRegistry_ New CarbonRegistry address.
    function setCarbonRegistry(address newRegistry_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRegistry_ != address(0), "invalid registry");
        emit CarbonRegistryUpdated(carbonRegistry, newRegistry_);
        carbonRegistry = newRegistry_;
    }

    /// @notice Get full retirement details.
    /// @param retirementId_ The retirement ID.
    /// @return The Retirement struct.
    function getRetirement(uint256 retirementId_) external view returns (Retirement memory) {
        require(retirementId_ > 0 && retirementId_ <= _nextRetirementId, "retirement not found");
        return _retirements[retirementId_];
    }

    /// @notice Get all retirement IDs for a given retirer.
    /// @param retirer_ The retirer address.
    /// @return Array of retirement IDs.
    function getRetirementsByRetirer(address retirer_) external view returns (uint256[] memory) {
        return _retirementsByRetirer[retirer_];
    }

    /// @notice Total number of retirements processed.
    /// @return Retirement count.
    function getRetirementCount() external view returns (uint256) {
        return _nextRetirementId;
    }

    /// @notice Check if a given serial number has been used.
    /// @param serialNumber_ The serial number to check.
    /// @return True if already used.
    function isSerialNumberUsed(string calldata serialNumber_) external view returns (bool) {
        return _usedSerialNumbers[serialNumber_];
    }

    /// @notice Generate a unique serial number for a retirement.
    /// @param projectId_ The project ID.
    /// @param retirementId_ The retirement ID.
    /// @return Unique serial number string.
    function _generateSerialNumber(uint256 projectId_, uint256 retirementId_) internal returns (string memory) {
        _serialCounter++;
        string memory serial = string(
            abi.encodePacked(
                "OSV-",
                _toString(projectId_),
                "-",
                _toString(retirementId_),
                "-",
                _toString(_serialCounter),
                "-",
                _toString(block.timestamp)
            )
        );
        _usedSerialNumbers[serial] = true;
        return serial;
    }

    /// @notice Convert uint256 to string.
    function _toString(uint256 value_) internal pure returns (string memory) {
        if (value_ == 0) return "0";
        uint256 temp = value_;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value_ != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value_ % 10)));
            value_ /= 10;
        }
        return string(buffer);
    }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
