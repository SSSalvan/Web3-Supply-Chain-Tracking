pragma solidity ^0.8.20;

contract SupplyChain {

    struct Product {
        uint256 id;
        string name;
        string origin;
        string currentLocation;
        string status;
        uint256 createdAt;
        bool exists;
    }

    struct TrackingUpdate {
        string location;
        string status;
        address updatedBy;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => TrackingUpdate[]) private productHistory;

    event ProductCreated(uint256 id, string name, string origin);
    event ProductUpdated(uint256 id, string location, string status);

    modifier productExists(uint256 _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    function createProduct(
        uint256 _id,
        string memory _name,
        string memory _origin
    ) public {
        require(!products[_id].exists, "Product already exists");

        products[_id] = Product({
            id: _id,
            name: _name,
            origin: _origin,
            currentLocation: _origin,
            status: "Created",
            createdAt: block.timestamp,
            exists: true
        });

        productHistory[_id].push(
            TrackingUpdate({
                location: _origin,
                status: "Created",
                updatedBy: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit ProductCreated(_id, _name, _origin);
    }

    function updateProduct(
        uint256 _id,
        string memory _location,
        string memory _status
    ) public productExists(_id) {

        products[_id].currentLocation = _location;
        products[_id].status = _status;

        productHistory[_id].push(
            TrackingUpdate({
                location: _location,
                status: _status,
                updatedBy: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit ProductUpdated(_id, _location, _status);
    }

    function getProduct(uint256 _id)
        public
        view
        productExists(_id)
        returns (
            uint256 id,
            string memory name,
            string memory origin,
            string memory currentLocation,
            string memory status,
            uint256 createdAt
        )
    {
        Product memory p = products[_id];

        return (
            p.id,
            p.name,
            p.origin,
            p.currentLocation,
            p.status,
            p.createdAt
        );
    }

    function getProductHistoryCount(uint256 _id)
        public
        view
        productExists(_id)
        returns (uint256)
    {
        return productHistory[_id].length;
    }

    function getProductHistoryItem(uint256 _id, uint256 _index)
        public
        view
        productExists(_id)
        returns (
            string memory location,
            string memory status,
            address updatedBy,
            uint256 timestamp
        )
    {
        require(_index < productHistory[_id].length, "Invalid history index");

        TrackingUpdate memory update = productHistory[_id][_index];

        return (
            update.location,
            update.status,
            update.updatedBy,
            update.timestamp
        );
    }
}