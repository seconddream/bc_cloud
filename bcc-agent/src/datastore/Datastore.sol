// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract Datastore {
    // datastore infomation
    string public _datastoreId;
    uint256 public nextRowIndex;

    constructor(string memory datastoreId) public {
        _datastoreId = datastoreId;
        nextRowIndex = 0;
    }

    // datastore column schema -------------------------------------------------
    string[] columnNameArray;
    string[] columnDataTypeArray;

    // event to indicate change of schema in this datastore contract
    event ColumnCreated(
        string datastoreId,
        uint256 columnIndex,
        string columnName,
        string columnDataType
    );

    // append new columnum to the schema
    function createColumn(
        string memory columnName,
        string memory columnDataType
    ) public {
        columnNameArray.push(columnName);
        columnDataTypeArray.push(columnDataType);
        emit ColumnCreated(
            _datastoreId,
            columnNameArray.length - 1,
            columnName,
            columnDataType
        );
    }

    // get the current columnum count
    function getColumnCount() public view returns (uint256 count) {
        count = columnNameArray.length;
    }

    // get the columnum name and datatype by columnum index
    function getColumn(uint256 columnIndex)
        public
        view
        returns (string memory columnName, string memory columnDataType)
    {
        columnName = columnNameArray[columnIndex];
        columnDataType = columnDataTypeArray[columnIndex];
    }

    // datastore data ----------------------------------------------------------

    // struck to store a row of data
    struct DataRow {
        bool revoked; // data row revoked
        mapping(uint256 => string) columnToValueMapping; // value columnums
        mapping(uint256 => bool) columnHasValueMapping;
    }

    // data row mapping
    mapping(uint256 => DataRow) private data;

    event DataRowRevoked(string datastoreId, uint256 rowIndex, uint256 t_bc);

    // revoke a row of data
    function revokeDataRow(uint256 rowIndex) public {
        data[rowIndex].revoked = true;
        emit DataRowRevoked(_datastoreId, rowIndex, now);
    }

    event DataWritten(
        string datastoreId,
        uint256 rowIndex,
        uint256 columnIndex,
        string columnName,
        string columnDataType,
        uint256 historyIndex,
        uint256 t_bc
    );

    // update a value in data row
    function writeData(
        uint256 rowIndex,
        uint256 columnIndex,
        string memory value,
        uint256 historyIndex
    ) public {
        if (data[rowIndex].revoked != true) {
            data[rowIndex].columnToValueMapping[columnIndex] = value;
            data[rowIndex].columnHasValueMapping[columnIndex] = true;
            emit DataWritten(
                _datastoreId,
                rowIndex,
                columnIndex,
                columnNameArray[columnIndex],
                columnDataTypeArray[columnIndex],
                historyIndex,
                now
            );
        }
    }

    // read data from a row with columnum index
    function readData(uint256 rowIndex, uint256 columnIndex)
        public
        view
        returns (
            string memory columnName,
            string memory dataType,
            string memory value,
            bool exist,
            bool revoked
        )
    {
        if (data[rowIndex].revoked == true) {
            columnName = "";
            dataType = "";
            value = "";
            exist = false;
            revoked = true;
        } else {
            columnName = columnNameArray[columnIndex];
            dataType = columnDataTypeArray[columnIndex];
            value = data[rowIndex].columnToValueMapping[columnIndex];
            exist = data[rowIndex].columnHasValueMapping[columnIndex];
            revoked = false;
        }

    }

}
