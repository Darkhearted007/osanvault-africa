// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PropertyNFT — ERC-1155 fractional property tokens
/// @notice Each token ID represents one SPV property; holders own fractions
contract PropertyNFT is ERC1155, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE      = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE       = keccak256("ADMIN_ROLE");
    bytes32 public constant URI_MANAGER_ROLE = keccak256("URI_MANAGER_ROLE");

    struct PropertyInfo {
        uint256 totalSupply;
        uint256 maxSupply;
        string  name;
        string  location;
        string  jurisdiction;
        string  legalDocCID;
        uint256 createdAt;
        bool    exists;
    }

    uint256 public propertyCount;
    mapping(uint256 => PropertyInfo) private _properties;
    mapping(uint256 => string)       private _uris;

    event PropertyCreated(
        uint256 indexed id,
        string  name,
        uint256 maxSupply,
        string  location,
        string  jurisdiction,
        string  uri,
        string  legalDoc
    );
    event TokensMinted(uint256 indexed propertyId, address indexed to, uint256 amount);
    event MetadataUpdated(uint256 indexed propertyId, string newURI);

    constructor(address admin) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE,         admin);
        _grantRole(MINTER_ROLE,        admin);
        _grantRole(URI_MANAGER_ROLE,   admin);
    }

    function createProperty(
        string calldata name,
        uint256         maxSupply,
        string calldata location,
        string calldata jurisdiction,
        string calldata metadataURI,
        string calldata legalDocCID
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        uint256 id = ++propertyCount;
        _properties[id] = PropertyInfo({
            totalSupply:  0,
            maxSupply:    maxSupply,
            name:         name,
            location:     location,
            jurisdiction: jurisdiction,
            legalDocCID:  legalDocCID,
            createdAt:    block.timestamp,
            exists:       true
        });
        _uris[id] = metadataURI;
        emit PropertyCreated(id, name, maxSupply, location, jurisdiction, metadataURI, legalDocCID);
        return id;
    }

    function mint(
        address to,
        uint256 propertyId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        PropertyInfo storage p = _properties[propertyId];
        require(p.exists, "PropertyNFT: property does not exist");
        require(p.totalSupply + amount <= p.maxSupply, "PropertyNFT: exceeds max supply");
        p.totalSupply += amount;
        _mint(to, propertyId, amount, "");
        emit TokensMinted(propertyId, to, amount);
    }

    function mintBatch(
        address          to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(ids.length == amounts.length, "PropertyNFT: length mismatch");
        for (uint256 i = 0; i < ids.length; i++) {
            PropertyInfo storage p = _properties[ids[i]];
            require(p.exists, "PropertyNFT: property does not exist");
            require(p.totalSupply + amounts[i] <= p.maxSupply, "PropertyNFT: exceeds max supply");
            p.totalSupply += amounts[i];
        }
        _mintBatch(to, ids, amounts, "");
    }

    function updatePropertyURI(
        uint256         propertyId,
        string calldata newURI
    ) external onlyRole(URI_MANAGER_ROLE) {
        require(_properties[propertyId].exists, "PropertyNFT: property does not exist");
        _uris[propertyId] = newURI;
        emit MetadataUpdated(propertyId, newURI);
    }

    function getProperty(uint256 propertyId) external view returns (PropertyInfo memory) {
        return _properties[propertyId];
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _uris[tokenId];
    }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
