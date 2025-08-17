// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// ERC20 interface for PYUSD
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// GitHubVerifier interface
interface IGitHubVerifier {
    function checkIssueStatus(string memory githubIssue) external view returns (bool isPayable);
}

contract EthJobsEscrow {
    // Events
    event JobCreated(uint256 indexed jobId, address indexed employer, address indexed employee, uint256 amount, uint256 deadline, string githubIssue);
    event FundsReleased(uint256 indexed jobId, address indexed employee, uint256 amount);
    event FundsRefunded(uint256 indexed jobId, address indexed employer, uint256 amount);
    event EscrowFunded(uint256 indexed jobId, address indexed employer, uint256 amount);
    
    // PYUSD token address
    address public constant PYUSD_TOKEN = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9;
    
    // Job structure
    struct Job {
        address employer;
        address employee;
        uint256 amount;
        uint256 deadline;
        string githubIssue;
        bool isFunded;
        bool isCompleted;
        bool isRefunded;
    }
    
    // State variables
    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;
    
    // GitHubVerifier contract address
    address public githubVerifierAddress;
    
    constructor() {
        nextJobId = 1;
        githubVerifierAddress = 0xBdfA8353BB214Fe6b52f68C59d7C662464f96C81;
    }
  
  modifier onlyEmployer(uint256 _jobId) {
    require(jobs[_jobId].employer == msg.sender, "Only employer can call this function");
    _;
  }
  
  modifier jobExists(uint256 _jobId) {
    require(_jobId > 0 && _jobId < nextJobId, "Job does not exist");
    _;
  }
  
  modifier onlyWhenFunded(uint256 _jobId) {
    require(jobs[_jobId].isFunded, "Job must be funded first");
    _;
  }
  
  /**
   * @notice Create a new job escrow
   * @param _employee The employee's address
   * @param _deadline The deadline timestamp
   * @param _amount The amount of PYUSD to deposit
   * @param _githubIssue The GitHub issue URL or reference
   * @return jobId The ID of the created job
   */
  function createJob(
    address _employee,
    uint256 _deadline,
    uint256 _amount,
    string memory _githubIssue
  ) external returns (uint256 jobId) {
    require(_employee != address(0), "Invalid employee address");
    require(_amount > 0, "Amount must be greater than 0");
    require(_deadline > block.timestamp, "Deadline must be in the future");
    require(bytes(_githubIssue).length > 0, "GitHub issue cannot be empty");
    
    jobId = nextJobId;
    nextJobId++;
    
    jobs[jobId] = Job({
      employer: msg.sender,
      employee: _employee,
      amount: _amount,
      deadline: _deadline,
      githubIssue: _githubIssue,
      isFunded: false,
      isCompleted: false,
      isRefunded: false
    });
    
    emit JobCreated(jobId, msg.sender, _employee, _amount, _deadline, _githubIssue);
  }
  
  /**
   * @notice Fund a job escrow with PYUSD after approval
   * @param _jobId The ID of the job to fund
   */
  function fundJob(uint256 _jobId) external jobExists(_jobId) onlyEmployer(_jobId) {
    Job storage job = jobs[_jobId];
    require(!job.isFunded, "Job is already funded");
    require(!job.isCompleted, "Job is already completed");
    require(!job.isRefunded, "Job is already refunded");
    
    // Check if employer has approved enough PYUSD
    IERC20 pyusd = IERC20(PYUSD_TOKEN);
    require(
      pyusd.allowance(msg.sender, address(this)) >= job.amount,
      "Insufficient PYUSD allowance"
    );
    
    // Transfer PYUSD from employer to contract
    bool transferSuccess = pyusd.transferFrom(msg.sender, address(this), job.amount);
    require(transferSuccess, "PYUSD transfer failed");
    
    job.isFunded = true;
    emit EscrowFunded(_jobId, msg.sender, job.amount);
  }
  
  /**
   * @notice Release funds to employee when job is completed
   * @param _jobId The ID of the job to release funds for
   */
  function releaseFunds(uint256 _jobId) external jobExists(_jobId) onlyEmployer(_jobId) onlyWhenFunded(_jobId) {
    Job storage job = jobs[_jobId];
    require(!job.isCompleted, "Job is already completed");
    require(!job.isRefunded, "Job is already refunded");
    require(job.amount > 0, "No funds to release");
    
    // Call GitHubVerifier to check if the issue is payable and verified
    require(githubVerifierAddress != address(0), "GitHubVerifier address not set");
    IGitHubVerifier verifier = IGitHubVerifier(githubVerifierAddress);
    bool isPayable = verifier.checkIssueStatus(job.githubIssue);

    require(!isPayable, "GitHub issue is not payable");

    uint256 amountToSend = job.amount;
    job.amount = 0;
    job.isCompleted = true;
    
    // Transfer PYUSD to employee
    bool success = IERC20(PYUSD_TOKEN).transfer(job.employee, amountToSend);
    require(success, "PYUSD transfer failed");
    
    emit FundsReleased(_jobId, job.employee, amountToSend);
  }
  
  /**
   * @notice Refund funds to employer if deadline has passed
   * @param _jobId The ID of the job to refund
   */
  function refund(uint256 _jobId) external jobExists(_jobId) onlyEmployer(_jobId) onlyWhenFunded(_jobId) {
    Job storage job = jobs[_jobId];
    require(block.timestamp > job.deadline, "Deadline has not passed yet");
    require(!job.isCompleted, "Job is already completed");
    require(!job.isRefunded, "Job is already refunded");
    require(job.amount > 0, "No funds to refund");
    
    uint256 amountToRefund = job.amount;
    job.amount = 0;
    job.isRefunded = true;
    
    // Transfer PYUSD back to employer
    bool success = IERC20(PYUSD_TOKEN).transfer(job.employer, amountToRefund);
    require(success, "PYUSD transfer failed");
    
    emit FundsRefunded(_jobId, job.employer, amountToRefund);
  }
  
  /**
   * @notice Get job details
   * @param _jobId The ID of the job
   * @return _employer The employer's address
   * @return _employee The employee's address
   * @return _amount The amount deposited for the job
   * @return _deadline The deadline timestamp
   * @return _githubIssue The GitHub issue URL or reference
   * @return _isFunded Whether the job has been funded
   * @return _isCompleted Whether the job has been completed
   * @return _isRefunded Whether the job has been refunded
   */
  function getJob(uint256 _jobId) external view jobExists(_jobId) returns (
    address _employer,
    address _employee,
    uint256 _amount,
    uint256 _deadline,
    string memory _githubIssue,
    bool _isFunded,
    bool _isCompleted,
    bool _isRefunded
  ) {
    Job storage job = jobs[_jobId];
    return (
      job.employer,
      job.employee,
      job.amount,
      job.deadline,
      job.githubIssue,
      job.isFunded,
      job.isCompleted,
      job.isRefunded
    );
  }
  
  /**
   * @notice Get all job IDs for an employer
   * @param _employer The employer's address
   * @return Array of job IDs
   */
  function getEmployerJobs(address _employer) external view returns (uint256[] memory) {
    uint256[] memory employerJobs = new uint256[](nextJobId - 1);
    uint256 count = 0;
    
    for (uint256 i = 1; i < nextJobId; i++) {
      if (jobs[i].employer == _employer) {
        employerJobs[count] = i;
        count++;
      }
    }
    
    // Resize array to actual count
    assembly {
      mstore(employerJobs, count)
    }
    
    return employerJobs;
  }
  
  /**
   * @notice Get all job IDs for an employee
   * @param _employee The employee's address
   * @return Array of job IDs
   */
  function getEmployeeJobs(address _employee) external view returns (uint256[] memory) {
    uint256[] memory employeeJobs = new uint256[](nextJobId - 1);
    uint256 count = 0;
    
    for (uint256 i = 1; i < nextJobId; i++) {
      if (jobs[i].employee == _employee) {
        employeeJobs[count] = i;
        count++;
      }
    }
    
    // Resize array to actual count
    assembly {
      mstore(employeeJobs, count)
    }
    
    return employeeJobs;
  }
  
  /**
   * @notice Get total number of jobs
   * @return Total count of jobs
   */
  function getTotalJobs() external view returns (uint256) {
    return nextJobId - 1;
  }
  
  /**
   * @notice Get the PYUSD balance of the contract
   */
  function getPYUSDBalance() external view returns (uint256) {
    return IERC20(PYUSD_TOKEN).balanceOf(address(this));
  }
  
  /**
   * @notice Prevents anyone from sending ETH directly to the contract
   * @dev This contract only works with PYUSD tokens
   */
  receive() external payable {
    revert("This contract only accepts PYUSD tokens. ETH transfers not allowed.");
  }
}