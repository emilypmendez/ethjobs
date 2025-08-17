// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract GitHubVerifier is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Mapping to store verification results
    mapping(string => bool) public verifiedIssues;
    mapping(bytes32 => string) public requestToIssue;

    // Events
    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event IssueVerified(string indexed githubIssue, bool isPayable);
    event VerificationRequested(bytes32 indexed requestId, string githubIssue);

    // Errors
    error UnexpectedRequestID(bytes32 requestId);
    error InvalidGitHubIssue();

    // Hardcoded Chainlink Functions parameters
    uint64 public constant SUBSCRIPTION_ID = 5464;
    uint32 public constant GAS_LIMIT = 300000;
    bytes32 public constant DON_ID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    constructor(
        address router
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Send a request to verify a GitHub issue
     * @param githubIssue The GitHub issue URL to verify
     * @return requestId The ID of the sent request
     */
    function verifyGitHubIssue(
        string memory githubIssue
    ) external onlyOwner returns (bytes32 requestId) {
        if (bytes(githubIssue).length == 0) {
            revert InvalidGitHubIssue();
        }

        // JavaScript source code that will be executed by Chainlink Functions
        string memory source = "let githubUrl = args[0]; if (!githubUrl){ throw new Error('Need Github Issue link') } const apiResponse = await Functions.makeHttpRequest({ url: `https://www.ethjobs.cc/api/github?url=${githubUrl}` }) if(apiResponse.error) { console.log('Error with API Call') throw new Error('Request failed') } let response = apiResponse.data; if(response.isPayable){ console.log('we can pay') } return Functions.encodeString(response.isPayable);";

        // Create the request
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        
        // Set the GitHub issue URL as an argument
        string[] memory args = new string[](1);
        args[0] = githubIssue;
        req.setArgs(args);

        // Send the request using hardcoded parameters
        requestId = _sendRequest(
            req.encodeCBOR(),
            SUBSCRIPTION_ID,
            GAS_LIMIT,
            DON_ID
        );

        // Store the request details
        s_lastRequestId = requestId;
        requestToIssue[requestId] = githubIssue;

        emit VerificationRequested(requestId, githubIssue);
        return requestId;
    }

    /**
     * @notice Send a pre-encoded CBOR request
     * @param request CBOR-encoded request data
     * @return requestId The ID of the sent request
     */
    function sendRequestCBOR(
        bytes memory request
    ) external onlyOwner returns (bytes32 requestId) {
        s_lastRequestId = _sendRequest(
            request,
            SUBSCRIPTION_ID,
            GAS_LIMIT,
            DON_ID
        );
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error and update verification status
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        s_lastResponse = response;
        s_lastError = err;

        // Get the GitHub issue URL for this request
        string memory githubIssue = requestToIssue[requestId];
        
        if (err.length > 0) {
            // If there was an error, revert with the error message
            string memory errorMessage = abi.decode(err, (string));
            revert(errorMessage);
        }

        // Decode the response to get the string value
        string memory responseString = abi.decode(response, (string));
        
        // Convert string "true"/"false" to boolean
        // The response should be either "true" or "false" as a string
        bool isPayable;
        if (keccak256(abi.encodePacked(responseString)) == keccak256(abi.encodePacked("true"))) {
            isPayable = true;
        } else if (keccak256(abi.encodePacked(responseString)) == keccak256(abi.encodePacked("false"))) {
            isPayable = false;
        } else {
            // If the response is neither "true" nor "false", revert with an error
            revert("Invalid response: expected 'true' or 'false' string");
        }
        
        verifiedIssues[githubIssue] = isPayable;
        emit IssueVerified(githubIssue, isPayable);

        emit Response(requestId, s_lastResponse, s_lastError);
    }

    /**
     * @notice Check if a GitHub issue is payable
     * @param githubIssue The GitHub issue URL to check
     * @return isPayable Whether the issue is payable
     */
    function checkIssueStatus(string memory githubIssue) external view returns (bool isPayable) {
        // Get the boolean value from the mapping
        isPayable = verifiedIssues[githubIssue];
    }

    /**
     * @notice Check if a GitHub issue has been verified
     * @param githubIssue The GitHub issue URL to check
     * @return hasBeenVerified Whether the issue has been verified
     */
    function isIssueVerified(string memory githubIssue) external view returns (bool hasBeenVerified) {
        // Check if the issue exists in the verifiedIssues mapping
        // If it exists, it has been verified (even if the result was false)
        hasBeenVerified = verifiedIssues[githubIssue] != false || 
                         (bytes(requestToIssue[s_lastRequestId]).length > 0 && 
                          keccak256(abi.encodePacked(requestToIssue[s_lastRequestId])) == keccak256(abi.encodePacked(githubIssue)));
    }

    /**
     * @notice Get the last verification result
     * @return lastIssue The last verified GitHub issue
     * @return lastResult Whether the last issue was payable
     */
    function getLastVerification() external view returns (string memory lastIssue, bool lastResult) {
        lastIssue = requestToIssue[s_lastRequestId];
        lastResult = verifiedIssues[lastIssue];
    }

    /**
     * @notice Clear the last request data (useful for testing)
     */
    function clearLastRequest() external onlyOwner {
        delete s_lastRequestId;
        delete s_lastResponse;
        delete s_lastError;
    }
}
