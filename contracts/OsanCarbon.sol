// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFeeRouter {
    function distributeFees(address token, uint256 amount) external;
}

contract OsanCarbon is ERC1155, ERC1155Supply, ERC1155URIStorage, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY_PER_PROJECT = 10_000_000 * 1e18;
    uint256 private _nextProjectId;

    struct Project {
        string name;
        string methodology;
        string region;
        uint256 vintage;
        uint256 totalIssued;
        bool verified;
        address verifier;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => address) public projectVerifier;

    IFeeRouter public feeRouter;
    IERC20 public feeToken;
    uint256 public retirementFeePerCredit;

    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        string methodology,
        string region,
        uint256 vintage,
        address indexed verifier
    );
    event CreditsIssued(
        uint256 indexed projectId,
        uint256 amount,
        address indexed recipient
    );
    event CreditsRetired(
        uint256 indexed projectId,
        uint256 amount,
        address indexed retirer,
        address indexed holder,
        string reason
    );
    event ProjectVerified(uint256 indexed projectId, address indexed verifier);
    event FeeConfigUpdated(
        address indexed feeRouter,
        address indexed feeToken,
        uint256 feePerCredit
    );

    constructor(
        address admin,
        address verifier,
        string memory uri_
    )
        ERC1155(uri_)
    {
        require(admin != address(0), "invalid admin");
        require(verifier != address(0), "invalid verifier");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, verifier);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createProject(
        string calldata name_,
        string calldata methodology_,
        string calldata region_,
        uint256 vintage_,
        string calldata uri_
    )
        external
        onlyRole(VERIFIER_ROLE)
        whenNotPaused
        returns (uint256 projectId)
    {
        projectId = ++_nextProjectId;
        projects[projectId] = Project({
            name: name_,
            methodology: methodology_,
            region: region_,
            vintage: vintage_,
            totalIssued: 0,
            verified: false,
            verifier: msg.sender
        });
        projectVerifier[projectId] = msg.sender;

        _setURI(projectId, uri_);

        emit ProjectCreated(projectId, name_, methodology_, region_, vintage_, msg.sender);
    }

    function verifyProject(uint256 projectId_)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(!projects[projectId_].verified, "already verified");
        require(projectVerifier[projectId_] == msg.sender, "not project verifier");

        projects[projectId_].verified = true;
        emit ProjectVerified(projectId_, msg.sender);
    }

    function issueCredits(
        uint256 projectId_,
        uint256 amount_,
        address recipient_
    )
        external
        onlyRole(VERIFIER_ROLE)
        whenNotPaused
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(projects[projectId_].verified, "project not verified");
        require(recipient_ != address(0), "invalid recipient");
        require(amount_ > 0, "amount zero");

        uint256 newTotal = projects[projectId_].totalIssued + amount_;
        require(newTotal <= MAX_SUPPLY_PER_PROJECT, "exceeds project cap");

        projects[projectId_].totalIssued = newTotal;
        _mint(recipient_, projectId_, amount_, "");

        emit CreditsIssued(projectId_, amount_, recipient_);
    }

    function retireCredits(
        uint256 projectId_,
        uint256 amount_,
        string calldata reason_
    )
        external
        whenNotPaused
    {
        _retireCredits(msg.sender, projectId_, amount_, reason_);
    }

    function retireCreditsFrom(
        address holder_,
        uint256 projectId_,
        uint256 amount_,
        string calldata reason_
    )
        external
        whenNotPaused
    {
        require(
            holder_ == msg.sender || isApprovedForAll(holder_, msg.sender),
            "not approved"
        );
        _retireCredits(holder_, projectId_, amount_, reason_);
    }

    function _retireCredits(
        address holder_,
        uint256 projectId_,
        uint256 amount_,
        string calldata reason_
    )
        internal
    {
        require(amount_ > 0, "amount zero");
        require(balanceOf(holder_, projectId_) >= amount_, "insufficient balance");

        _burn(holder_, projectId_, amount_);

        _collectFee(amount_);

        emit CreditsRetired(projectId_, amount_, msg.sender, holder_, reason_);
    }

    function _collectFee(uint256 creditAmount) internal {
        if (retirementFeePerCredit == 0) return;
        if (address(feeRouter) == address(0)) return;

        uint256 totalFee = creditAmount * retirementFeePerCredit;
        if (totalFee == 0) return;

        if (feeToken.balanceOf(msg.sender) >= totalFee) {
            feeToken.safeTransferFrom(msg.sender, address(this), totalFee);
            feeToken.approve(address(feeRouter), totalFee);
            feeRouter.distributeFees(address(feeToken), totalFee);
        }
    }

    function setMetadata(uint256 projectId_, string calldata uri_)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(projectVerifier[projectId_] == msg.sender, "not project verifier");

        _setURI(projectId_, uri_);
    }

    function setFeeConfig(
        address feeRouter_,
        address feeToken_,
        uint256 feePerCredit_
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(feeRouter_ != address(0), "invalid feeRouter");
        require(feeToken_ != address(0), "invalid feeToken");

        feeRouter = IFeeRouter(feeRouter_);
        feeToken = IERC20(feeToken_);
        retirementFeePerCredit = feePerCredit_;

        emit FeeConfigUpdated(feeRouter_, feeToken_, feePerCredit_);
    }

    function getProject(uint256 projectId_)
        external
        view
        returns (Project memory)
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return projects[projectId_];
    }

    function getProjectCount() external view returns (uint256) {
        return _nextProjectId;
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        override(ERC1155, ERC1155Supply)
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }

    function uri(uint256 tokenId)
        public
        view
        override(ERC1155, ERC1155URIStorage)
        returns (string memory)
    {
        return ERC1155URIStorage.uri(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
