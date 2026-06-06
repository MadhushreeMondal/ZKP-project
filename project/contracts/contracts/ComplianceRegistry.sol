// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Groth16Verifier.sol";

/**
 * @title ComplianceRegistry
 * @notice Stores agricultural compliance verification results on-chain.
 *         Only crop, proof hash, verification status, and timestamp are stored.
 *         Private farmer data is never written to the blockchain.
 */
contract ComplianceRegistry {
    Groth16Verifier public immutable verifier;

    struct ComplianceRecord {
        string crop;
        bytes32 proofHash;
        bool verified;
        uint256 timestamp;
    }

    ComplianceRecord[] public records;
    mapping(bytes32 => uint256) public proofHashToIndex;

    event ComplianceSubmitted(
        uint256 indexed recordId,
        string crop,
        bytes32 proofHash,
        bool verified,
        uint256 timestamp
    );

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
    }

    function submitCompliance(
        string calldata crop,
        bytes32 proofHash,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[7] calldata pubSignals
    ) external returns (bool verified, uint256 recordId) {
        require(proofHashToIndex[proofHash] == 0, "Proof already submitted");
        require(bytes(crop).length > 0, "Crop required");

        verified = verifier.verifyProof(a, b, c, pubSignals);
        require(verified, "Invalid ZKP proof");

        records.push(
            ComplianceRecord({
                crop: crop,
                proofHash: proofHash,
                verified: verified,
                timestamp: block.timestamp
            })
        );

        recordId = records.length;
        proofHashToIndex[proofHash] = recordId;

        emit ComplianceSubmitted(recordId, crop, proofHash, verified, block.timestamp);
    }

    function getRecordCount() external view returns (uint256) {
        return records.length;
    }

    function getRecord(uint256 recordId)
        external
        view
        returns (
            string memory crop,
            bytes32 proofHash,
            bool verified,
            uint256 timestamp
        )
    {
        require(recordId > 0 && recordId <= records.length, "Invalid record");
        ComplianceRecord storage rec = records[recordId - 1];
        return (rec.crop, rec.proofHash, rec.verified, rec.timestamp);
    }

    function getAllRecords()
        external
        view
        returns (
            string[] memory crops,
            bytes32[] memory proofHashes,
            bool[] memory verifiedFlags,
            uint256[] memory timestamps
        )
    {
        uint256 count = records.length;
        crops = new string[](count);
        proofHashes = new bytes32[](count);
        verifiedFlags = new bool[](count);
        timestamps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            crops[i] = records[i].crop;
            proofHashes[i] = records[i].proofHash;
            verifiedFlags[i] = records[i].verified;
            timestamps[i] = records[i].timestamp;
        }
    }
}
