// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    struct Product {
        string id;
        string name;
        string location;      // current location
        string destination;
        uint256 quantity;
        string company;
        string notes;
        string status;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    struct HistoryItem {
        uint256 time;
        string location;
        string status;
        string desc;
    }

    mapping(string => Product) private products;
    mapping(string => HistoryItem[]) private productHistory;
    string[] private productIds;

    event ProductCreated(
        string indexed id,
        string name,
        string location,
        string destination,
        uint256 quantity,
        string company,
        string status
    );

    event ProductUpdated(
        string indexed id,
        string newLocation,
        string newStatus,
        uint256 updatedAt
    );

    modifier onlyExistingProduct(string memory _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    function createProduct(
        string memory _id,
        string memory _name,
        string memory _location,
        string memory _destination,
        uint256 _quantity,
        string memory _company,
        string memory _notes
    ) public {
        require(bytes(_id).length > 0, "ID is required");
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_location).length > 0, "Location is required");
        require(bytes(_destination).length > 0, "Destination is required");
        require(_quantity > 0, "Quantity must be > 0");
        require(bytes(_company).length > 0, "Company is required");
        require(!products[_id].exists, "Product already exists");

        uint256 nowTs = block.timestamp;

        products[_id] = Product({
            id: _id,
            name: _name,
            location: _location,
            destination: _destination,
            quantity: _quantity,
            company: _company,
            notes: _notes,
            status: "Dalam Transit",
            createdAt: nowTs,
            updatedAt: nowTs,
            exists: true
        });

        productIds.push(_id);

        string memory initialDesc = string(
            abi.encodePacked(
                unicode"Produk didaftarkan — ",
                _uintToString(_quantity),
                " unit dikirim ke ",
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
                status: "Dalam Transit",
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
            "Dalam Transit"
        );
    }

    function updateProduct(
        string memory _id,
        string memory _newLocation,
        string memory _newStatus
    ) public onlyExistingProduct(_id) {
        require(
            bytes(_newLocation).length > 0 || bytes(_newStatus).length > 0,
            "Location or status required"
        );

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
                abi.encodePacked(unicode"Lokasi → ", _newLocation, unicode" · Status → ", _newStatus)
            );
        } else if (bytes(_newLocation).length > 0) {
            desc = string(abi.encodePacked(unicode"Lokasi → ", _newLocation));
        } else {
            desc = string(abi.encodePacked(unicode"Status → ", _newStatus));
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

    function getProductHistoryCount(string memory _id)
        public
        view
        onlyExistingProduct(_id)
        returns (uint256)
    {
        return productHistory[_id].length;
    }

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

    function getAllProductIds() public view returns (string[] memory) {
        return productIds;
    }

    function getProductCount() public view returns (uint256) {
        return productIds.length;
    }

    function productExists(string memory _id) public view returns (bool) {
        return products[_id].exists;
    }

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