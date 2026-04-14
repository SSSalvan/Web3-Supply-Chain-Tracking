// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    // defines the available user roles in the system
    enum Role {
        None,
        Admin,
        Manufacturer,
        Distributor
    }

    // stores the main data for each product in the supply chain
    struct Product {
        string id;
        string name;
        string location;
        string destination;
        uint256 quantity;
        string company;
        string notes;
        string status;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    // stores one history record for a product update
    struct HistoryItem {
        uint256 time;
        string location;
        string status;
        string desc;
    }

    // maps product id to its main product data
    mapping(string => Product) private products;

    // maps product id to its full update history
    mapping(string => HistoryItem[]) private productHistory;

    // stores all registered product ids
    string[] private productIds;

    // maps each wallet address to its assigned role
    mapping(address => Role) public userRoles;

    // emitted when an admin assigns or changes a user's role
    event UserRoleUpdated(address indexed user, Role indexed role);

    // emitted when a new product is created
    event ProductCreated(
        string indexed id,
        string name,
        string location,
        string destination,
        uint256 quantity,
        string company,
        string status
    );

    // emitted when a product location or status is updated
    event ProductUpdated(
        string indexed id,
        string newLocation,
        string newStatus,
        uint256 updatedAt
    );

    // sets the deployer as the first admin
    constructor() {
        userRoles[msg.sender] = Role.Admin;
        emit UserRoleUpdated(msg.sender, Role.Admin);
    }

    // restricts access to admin only
    modifier onlyAdmin() {
        require(userRoles[msg.sender] == Role.Admin, "Only admin");
        _;
    }

    // restricts access to admin or manufacturer only
    modifier onlyAdminOrManufacturer() {
        Role r = userRoles[msg.sender];
        require(
            r == Role.Admin || r == Role.Manufacturer,
            "Only admin or manufacturer"
        );
        _;
    }

    // restricts updates to admin manufacturer or distributor
    modifier onlyAuthorizedUpdater() {
        Role r = userRoles[msg.sender];
        require(
            r == Role.Admin || r == Role.Manufacturer || r == Role.Distributor,
            "Not authorized to update"
        );
        _;
    }

    // ensures the product exists before continuing
    modifier onlyExistingProduct(string memory _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    // assigns or changes the role of a wallet address
    function setUserRole(address _user, Role _role) external onlyAdmin {
        require(_user != address(0), "Invalid address");
        userRoles[_user] = _role;
        emit UserRoleUpdated(_user, _role);
    }

    // returns the role of the caller
    function getMyRole() external view returns (Role) {
        return userRoles[msg.sender];
    }

    // returns the role name of a specific wallet as text
    function getRoleName(address _user) external view returns (string memory) {
        return _roleToString(userRoles[_user]);
    }

    // creates a new product in the supply chain
    function createProduct(
        string memory _id,
        string memory _name,
        string memory _location,
        string memory _destination,
        uint256 _quantity,
        string memory _company,
        string memory _notes
    ) public onlyAdminOrManufacturer {
        require(bytes(_id).length > 0, "ID is required");
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_location).length > 0, "Location is required");
        require(bytes(_destination).length > 0, "Destination is required");
        require(_quantity > 0, "Quantity must be > 0");
        require(bytes(_company).length > 0, "Company is required");
        require(!products[_id].exists, "Product already exists");

        uint256 nowTs = block.timestamp;
        string memory initialStatus = "Menunggu";

        products[_id] = Product({
            id: _id,
            name: _name,
            location: _location,
            destination: _destination,
            quantity: _quantity,
            company: _company,
            notes: _notes,
            status: initialStatus,
            createdAt: nowTs,
            updatedAt: nowTs,
            exists: true
        });

        productIds.push(_id);

        string memory initialDesc = string(
            abi.encodePacked(
                unicode"Produk didaftarkan — ",
                _uintToString(_quantity),
                " unit menuju ",
                _destination,
                " (",
                _company,
                ")"
            )
        );

        productHistory[_id].push(
            HistoryItem({
                time: nowTs,
                location: _location,
                status: initialStatus,
                desc: initialDesc
            })
        );

        emit ProductCreated(
            _id,
            _name,
            _location,
            _destination,
            _quantity,
            _company,
            initialStatus
        );
    }

    // updates the location and or status of an existing product
    function updateProduct(
        string memory _id,
        string memory _newLocation,
        string memory _newStatus
    ) public onlyExistingProduct(_id) onlyAuthorizedUpdater {
        require(
            bytes(_newLocation).length > 0 || bytes(_newStatus).length > 0,
            "Location or status required"
        );

        if (bytes(_newStatus).length > 0) {
            _validateStatusForRole(userRoles[msg.sender], _newStatus);
        }

        Product storage p = products[_id];
        uint256 nowTs = block.timestamp;

        string memory finalLocation = bytes(_newLocation).length > 0
            ? _newLocation
            : p.location;

        string memory finalStatus = bytes(_newStatus).length > 0
            ? _newStatus
            : p.status;

        string memory desc;
        if (bytes(_newLocation).length > 0 && bytes(_newStatus).length > 0) {
            desc = string(
                abi.encodePacked(
                    unicode"Lokasi → ",
                    _newLocation,
                    unicode" · Status → ",
                    _newStatus,
                    " (",
                    _roleToString(userRoles[msg.sender]),
                    ")"
                )
            );
        } else if (bytes(_newLocation).length > 0) {
            desc = string(
                abi.encodePacked(
                    unicode"Lokasi → ",
                    _newLocation,
                    " (",
                    _roleToString(userRoles[msg.sender]),
                    ")"
                )
            );
        } else {
            desc = string(
                abi.encodePacked(
                    unicode"Status → ",
                    _newStatus,
                    " (",
                    _roleToString(userRoles[msg.sender]),
                    ")"
                )
            );
        }

        p.location = finalLocation;
        p.status = finalStatus;
        p.updatedAt = nowTs;

        productHistory[_id].push(
            HistoryItem({
                time: nowTs,
                location: finalLocation,
                status: finalStatus,
                desc: desc
            })
        );

        emit ProductUpdated(_id, finalLocation, finalStatus, nowTs);
    }

    // returns the main details of one product
    function getProduct(string memory _id)
        public
        view
        onlyExistingProduct(_id)
        returns (
            string memory id,
            string memory name,
            string memory location,
            string memory destination,
            uint256 quantity,
            string memory company,
            string memory notes,
            string memory status,
            uint256 createdAt,
            uint256 updatedAt
        )
    {
        Product memory p = products[_id];
        return (
            p.id,
            p.name,
            p.location,
            p.destination,
            p.quantity,
            p.company,
            p.notes,
            p.status,
            p.createdAt,
            p.updatedAt
        );
    }

    // returns how many history records a product has
    function getProductHistoryCount(string memory _id)
        public
        view
        onlyExistingProduct(_id)
        returns (uint256)
    {
        return productHistory[_id].length;
    }

    // returns one specific history record by index
    function getProductHistoryItem(string memory _id, uint256 _index)
        public
        view
        onlyExistingProduct(_id)
        returns (
            uint256 time,
            string memory location,
            string memory status,
            string memory desc
        )
    {
        require(_index < productHistory[_id].length, "Invalid history index");
        HistoryItem memory h = productHistory[_id][_index];
        return (h.time, h.location, h.status, h.desc);
    }

    // returns all product ids in the system
    function getAllProductIds() public view returns (string[] memory) {
        return productIds;
    }

    // returns the total number of registered products
    function getProductCount() public view returns (uint256) {
        return productIds.length;
    }

    // checks whether a product id already exists
    function productExists(string memory _id) public view returns (bool) {
        return products[_id].exists;
    }

    // validates whether a role is allowed to use a given status
    function _validateStatusForRole(Role _role, string memory _status) internal pure {
        if (_role == Role.Admin) {
            require(_isValidAnyStatus(_status), "Invalid admin status");
            return;
        }

        if (_role == Role.Manufacturer) {
            require(
                _equals(_status, "Menunggu") ||
                    _equals(_status, "Di Gudang") ||
                    _equals(_status, "Siap Diambil"),
                "Manufacturer cannot set this status"
            );
            return;
        }

        if (_role == Role.Distributor) {
            require(
                _equals(_status, "Diambil Distributor") ||
                    _equals(_status, "Dalam Transit") ||
                    _equals(_status, "Terkirim"),
                "Distributor cannot set this status"
            );
            return;
        }

        revert("Role not allowed");
    }

    // checks whether a status is one of the 6 valid system statuses
    function _isValidAnyStatus(string memory _status) internal pure returns (bool) {
        return
            _equals(_status, "Menunggu") ||
            _equals(_status, "Di Gudang") ||
            _equals(_status, "Siap Diambil") ||
            _equals(_status, "Diambil Distributor") ||
            _equals(_status, "Dalam Transit") ||
            _equals(_status, "Terkirim");
    }

    // converts a role enum into its text label
    function _roleToString(Role _role) internal pure returns (string memory) {
        if (_role == Role.Admin) return "Admin";
        if (_role == Role.Manufacturer) return "Manufacturer";
        if (_role == Role.Distributor) return "Distributor";
        return "None";
    }

    // compares two strings for equality
    function _equals(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    // converts a uint256 number into a string
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}