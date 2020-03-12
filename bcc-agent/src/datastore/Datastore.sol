pragma solidity >=0.6.0;

contract Datastore {
    // datastore infomation
    string public _datastoreId;
    uint256 public _currentRowIndex;

    constructor(string memory datastoreId) public {
        _datastoreId = datastoreId;
        _currentRowIndex = 0;
    }

    // datastore schema --------------------------------------------------------
    string[] _colDataType;
    string[] _colName;

    event SchemaChange(
        string datastoreId,
        string operation,
        uint256 colIndex,
        string colDataType,
        string colName
    );

    function newCol(string memory colDataType, string memory colName) public {
        _colDataType.push(colDataType);
        _colName.push(colName);
        emit SchemaChange(
            _datastoreId,
            "newCol",
            _colDataType.length - 1,
            colDataType,
            colName
        );
    }

    function updateColDataType(
        uint256 colIndex,
        string memory colDataType,
        string memory colName
    ) public {
        if (colIndex < _currentRowIndex) {
            _colDataType[colIndex] = colDataType;
            _colName[colIndex] = colName;
        }
        emit SchemaChange(
            _datastoreId,
            "updateColDataType",
            colIndex,
            colDataType,
            colName
        );
    }

    function getColLength() public view returns (uint256 len) {
        len = _colDataType.length;
    }

    function getCol(uint256 colIndex)
        public
        view
        returns (string memory colName, string memory colDataType)
    {
        colName = _colName[colIndex];
        colDataType = _colDataType[colIndex];
    }

    // datastore data

    struct DataRow {
        bool _init;
        bool _revoked;
        mapping(uint256 => string) _colToValueMapping;
    }

    mapping(uint256 => DataRow) private _data;

    event DataChange(
        string datastoreId,
        string operation,
        uint256 rowIndex,
        uint256 colIndex,
        string value,
        uint256 blocktime
    );

    // get next free row index for adding new data row
    function getNewRow() public returns (uint256 rowIndex) {
        rowIndex = _currentRowIndex;
        _data[rowIndex] = DataRow(true, false);
        _currentRowIndex++;
    }

    function newData(uint256 rowIndex, uint256 colIndex, string memory value)
        public
    {
        if (_data[rowIndex]._init != false) {
            _data[rowIndex]._colToValueMapping[colIndex] = value;
            emit DataChange(
                _datastoreId,
                "newData",
                rowIndex,
                colIndex,
                value,
                now
            );
        }
    }

    function updateData(uint256 rowIndex, uint256 colIndex, string memory value)
        public
    {
        if (
            _data[rowIndex]._init != false && _data[rowIndex]._revoked != true
        ) {
            _data[rowIndex]._colToValueMapping[colIndex] = value;
            emit DataChange(
                _datastoreId,
                "updateData",
                rowIndex,
                colIndex,
                value,
                now
            );
        }
    }

    function revokeDataRow(uint256 rowIndex) public {
        if (_data[rowIndex]._init != false) {
            _data[rowIndex]._revoked = true;
            emit DataChange(_datastoreId, "revokeDataRow", 0, 0, "", now);
        }
    }

    function readData(uint256 rowIndex, uint256 colIndex)
        public
        view
        returns (
            string memory colName,
            string memory dataType,
            string memory value,
            bool exist,
            bool revoked
        )
    {
        if (_data[rowIndex]._init != true) {
            colName = "n/a";
            dataType = "n/a";
            value = "n/a";
            exist = false;
            revoked = false;
        } else {
            if (_data[rowIndex]._revoked == true) {
                colName = "n/a";
                dataType = "n/a";
                value = "n/a";
                exist = true;
                revoked = true;
            } else {
                colName = _colName[colIndex];
                dataType = _colDataType[colIndex];
                value = _data[rowIndex]._colToValueMapping[colIndex];
                exist = true;
                revoked = false;
            }
        }
    }

}
