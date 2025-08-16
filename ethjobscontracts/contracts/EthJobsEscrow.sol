// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract EthJobsEscrow {
  event JobCreated(address indexed employer, address indexed employee, uint256 amount, uint256 deadline);
  event FundsReleased(address indexed employee, uint256 amount);
  event FundsRefunded(address indexed employer, uint256 amount);
  
  address public employer;
  address public employee;
  uint256 public amount;
  uint256 public deadline;
  
  constructor(address _employee, uint256 _deadline) payable {
    require(_employee != address(0), "Invalid employee address");
    require(msg.value > 0, "Must deposit some funds");
    require(_deadline > block.timestamp, "Deadline must be in the future");
    
    employer = msg.sender;
    employee = _employee;
    amount = msg.value;
    deadline = _deadline;
    
    emit JobCreated(employer, employee, amount, deadline);
  }
  
  modifier onlyEmployer() {
    require(msg.sender == employer, "Only employer can call this function");
    _;
  }
  
  function releaseFunds() external onlyEmployer {
    require(amount > 0, "No funds to release");
    
    uint256 amountToSend = amount;
    amount = 0;
    
    (bool success, ) = employee.call{value: amountToSend}("");
    require(success, "Transfer failed");
    
    emit FundsReleased(employee, amountToSend);
  }
  
  function refund() external onlyEmployer {
    require(block.timestamp > deadline, "Deadline has not passed yet");
    require(amount > 0, "No funds to refund");
    
    uint256 amountToRefund = amount;
    amount = 0;
    
    (bool success, ) = employer.call{value: amountToRefund}("");
    require(success, "Transfer failed");
    
    emit FundsRefunded(employer, amountToRefund);
  }
  
  /**
   * @notice Get all contract state in one call
   * @return _employer The employer's address
   * @return _employee The employee's address  
   * @return _amount The amount deposited for the job
   * @return _deadline The deadline timestamp
   * @return _currentTime The current block timestamp
   * @return _isDeadlinePassed Whether the deadline has passed
   * @return _hasFunds Whether there are funds to release/refund
   */
  function viewState() external view returns (
    address _employer,
    address _employee,
    uint256 _amount,
    uint256 _deadline,
    uint256 _currentTime,
    bool _isDeadlinePassed,
    bool _hasFunds
  ) {
    return (
      employer,
      employee,
      amount,
      deadline,
      block.timestamp,
      block.timestamp > deadline,
      amount > 0
    );
  }
  
  /**
   * @notice Prevents anyone from sending ETH directly to the contract
   * @dev Only the constructor can receive funds
   */
  receive() external payable {
    revert("Direct ETH transfers not allowed. Use constructor to deposit funds.");
  }
}