// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract PropertyNFT is ERC1155, ERC1155Supply, ERC1155URIStorage, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 private _nextTokenId;

    struct Property {
        string name;
        string location;
        string jurisdiction;
        uint256 totalShares;
        uint256 availableShares;
        bool verified;
        bool active;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => address) public propertyManager;

    event PropertyCreated(
        uint256 indexed tokenId,
        string name,
        string location,
        uint256 totalShares,
        address indexed manager
    );
    event SharesMinted(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed recipient
    );
    event PropertyVerified(uint256 indexed tokenId);
    event PropertyStatusChanged(uint256 indexed tokenId, bool active);

    constructor(address admin, address minter, address manager, address pauser, string memory uri_)
        ERC1155(uri_)
    {
        require(admin != address(0), "invalid admin");
        require(minter != address(0), "invalid minter");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(MANAGER_ROLE, manager);
        _grantRole(PAUSER_ROLE, pauser);
    }

    function createProperty(
        string calldata name_,
        string calldata location_,
        string calldata jurisdiction_,
        uint256 totalShares_,
        string calldata uri_
    )
        external
        onlyRole(MANAGER_ROLE)
        whenNotPaused
        returns (uint256 tokenId)
    {
        require(bytes(name_).length > 0, "empty name");
        require(totalShares_ > 0, "zero shares");
        require(totalShares_ <= 1_000_000_000 * 1e18, "too many shares");

        tokenId = ++_nextTokenId;

        properties[tokenId] = Property({
            name: name_,
            location: location_,
            jurisdiction: jurisdiction_,
            totalShares: totalShares_,
            availableShares: totalShares_,
            verified: false,
            active: true
        });

        propertyManager[tokenId] = msg.sender;
        _setURI(tokenId, uri_);

        emit PropertyCreated(tokenId, name_, location_, totalShares_, msg.sender);
    }

    function mintShares(
        uint256 tokenId_,
        uint256 amount_,
        address recipient_
    )
        external
        onlyRole(MINTER_ROLE)
        whenNotPaused
    {
        require(tokenId_ > 0 && tokenId_ <= _nextTokenId, "property not found");
        require(properties[tokenId_].active, "property inactive");
        require(recipient_ != address(0), "invalid recipient");
        require(amount_ > 0, "amount zero");
        require(amount_ <= properties[tokenId_].availableShares, "insufficient shares");

        properties[tokenId_].availableShares -= amount_;
        _mint(recipient_, tokenId_, amount_, "");

        emit SharesMinted(tokenId_, amount_, recipient_);
    }

    function verifyProperty(uint256 tokenId_) external onlyRole(MANAGER_ROLE) {
        require(tokenId_ > 0 && tokenId_ <= _nextTokenId, "property not found");
        require(!properties[tokenId_].verified, "already verified");
        properties[tokenId_].verified = true;
        emit PropertyVerified(tokenId_);
    }

    function setPropertyStatus(uint256 tokenId_, bool active_) external onlyRole(MANAGER_ROLE) {
        require(tokenId_ > 0 && tokenId_ <= _nextTokenId, "property not found");
        properties[tokenId_].active = active_;
        emit PropertyStatusChanged(tokenId_, active_);
    }

    function setMetadata(uint256 tokenId_, string calldata uri_)
        external
        onlyRole(MANAGER_ROLE)
    {
        require(tokenId_ > 0 && tokenId_ <= _nextTokenId, "property not found");
        _setURI(tokenId_, uri_);
    }

    function getPropertyCount() external view returns (uint256) {
        return _nextTokenId;
    }

    function getProperty(uint256 tokenId_)
        external
        view
        returns (Property memory)
    {
        require(tokenId_ > 0 && tokenId_ <= _nextTokenId, "property not found");
        return properties[tokenId_];
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
