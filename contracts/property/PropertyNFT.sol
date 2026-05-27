// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract PropertyNFT is ERC1155, ERC1155Supply, ERC1155URIStorage, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant URI_MANAGER_ROLE = keccak256("URI_MANAGER_ROLE");

    uint256 public propertyCount;

    struct PropertyInfo {
        uint256 totalSupply;
        uint256 maxSupply;
        string name;
        string location;
        string jurisdiction;
        string legalDocCID;
        uint256 createdAt;
        bool exists;
    }

    mapping(uint256 => PropertyInfo) public properties;

    event PropertyCreated(uint256 indexed id, string name, uint256 maxSupply, string location, string jurisdiction, string uri, string legalDoc);
    event TokensMinted(uint256 indexed propertyId, address indexed to, uint256 amount);
    event MetadataUpdated(uint256 indexed propertyId, string newURI);

    constructor(address admin) ERC1155("") {
        require(admin != address(0), "invalid admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(URI_MANAGER_ROLE, admin);
    }

    function createProperty(string calldata name, uint256 maxSupply, string calldata location, string calldata jurisdiction, string calldata metadataURI, string calldata legalDocCID)
        external onlyRole(ADMIN_ROLE) returns (uint256)
    {
        require(bytes(name).length > 0, "name empty");
        require(maxSupply > 0, "max supply zero");
        require(bytes(jurisdiction).length > 0, "jurisdiction empty");
        propertyCount++;
        properties[propertyCount] = PropertyInfo(0, maxSupply, name, location, jurisdiction, legalDocCID, block.timestamp, true);
        _setURI(propertyCount, metadataURI);
        emit PropertyCreated(propertyCount, name, maxSupply, location, jurisdiction, metadataURI, legalDocCID);
        return propertyCount;
    }

    function mint(address to, uint256 propertyId, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(properties[propertyId].exists, "not found");
        require(amount > 0, "amount zero");
        require(to != address(0), "invalid recipient");
        require(properties[propertyId].totalSupply + amount <= properties[propertyId].maxSupply, "exceeds max supply");
        properties[propertyId].totalSupply += amount;
        _mint(to, propertyId, amount, "");
        emit TokensMinted(propertyId, to, amount);
    }

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(ids.length == amounts.length, "length mismatch");
        require(to != address(0), "invalid recipient");
        for (uint256 i = 0; i < ids.length; i++) {
            require(properties[ids[i]].exists, "not found");
            require(properties[ids[i]].totalSupply + amounts[i] <= properties[ids[i]].maxSupply, "exceeds max supply");
            properties[ids[i]].totalSupply += amounts[i];
        }
        _mintBatch(to, ids, amounts, "");
        for (uint256 i = 0; i < ids.length; i++) emit TokensMinted(ids[i], to, amounts[i]);
    }

    function updatePropertyURI(uint256 propertyId, string calldata newURI) external onlyRole(URI_MANAGER_ROLE) {
        require(properties[propertyId].exists, "not found");
        _setURI(propertyId, newURI);
        emit MetadataUpdated(propertyId, newURI);
    }

    function getProperty(uint256 propertyId) external view returns (PropertyInfo memory) {
        require(properties[propertyId].exists, "not found");
        return properties[propertyId];
    }

    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}