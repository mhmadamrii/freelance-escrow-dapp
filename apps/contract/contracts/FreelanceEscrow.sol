// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import "hardhat/console.sol";

/**
 * @title FreelanceEscrow
 * @author mhmadamrii (0xfaidev.three)
 * @notice Trustless escrow for freelance jobs with milestone-based payments and ERC20 support
 */
contract FreelanceEscrow {
  using SafeERC20 for IERC20;

  enum JobStatus {
    Created,
    Funded,
    InProgress,
    Completed,
    Disputed,
    Resolved,
    Cancelled
  }

  struct Milestone {
    uint256 amount;
    bytes32 descriptionHash; // hash of off-chain milestone description
    bytes32 submissionHash; // hash of submitted work (IPFS, etc.)
    bool submitted;
    bool approved;
  }

  struct Job {
    uint256 jobId;
    address client;
    address freelancer;
    address arbiter; // Address that can resolve disputes
    address token; // address(0) for ETH, otherwise ERC20
    uint256 totalAmount;
    JobStatus status;
    bytes32 jobHash; // hash of job description stored off-chain
    uint256 fundedAmount;
    uint256 releasedAmount;
    Milestone[] milestones;
  }

  uint256 public nextJobId;
  mapping(uint256 => Job) public jobs;

  event JobCreated(
    uint256 indexed jobId,
    address indexed client,
    address token,
    uint256 totalAmount
  );
  event FreelancerAssigned(uint256 indexed jobId, address indexed freelancer);
  event JobFunded(uint256 indexed jobId, uint256 amount);
  event MilestoneSubmitted(
    uint256 indexed jobId,
    uint256 milestoneIndex,
    bytes32 submissionHash
  );
  event MilestoneApproved(
    uint256 indexed jobId,
    uint256 milestoneIndex,
    uint256 amount
  );
  event JobCompleted(uint256 indexed jobId);
  event DisputeRaised(uint256 indexed jobId, address raiser);
  event DisputeResolved(
    uint256 indexed jobId,
    uint256 clientRefund,
    uint256 freelancerPayment
  );
  event JobCancelled(uint256 indexed jobId);

  modifier onlyClient(uint256 _jobId) {
    require(msg.sender == jobs[_jobId].client, 'Not client');
    _;
  }

  modifier onlyFreelancer(uint256 _jobId) {
    require(msg.sender == jobs[_jobId].freelancer, 'Not freelancer');
    _;
  }

  modifier onlyArbiter(uint256 _jobId) {
    require(msg.sender == jobs[_jobId].arbiter, 'Not arbiter');
    _;
  }

  modifier jobExists(uint256 _jobId) {
    require(_jobId < nextJobId, 'Job does not exist');
    _;
  }

  function createJob(
    address _token,
    uint256 _totalAmount,
    address _arbiter,
    bytes32 _jobHash,
    uint256[] calldata _milestoneAmounts,
    bytes32[] calldata _milestoneHashes
  ) external returns (uint256 jobId) {
    require(
      _milestoneAmounts.length == _milestoneHashes.length,
      'Milestone mismatch'
    );
    require(_milestoneAmounts.length > 0, 'No milestones');

    uint256 sum;
    for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
      sum += _milestoneAmounts[i];
    }
    require(sum == _totalAmount, 'Amounts do not sum to total');

    Job storage job = jobs[nextJobId];
    job.jobId = nextJobId;
    job.client = msg.sender;
    job.token = _token;
    job.arbiter = _arbiter;
    job.totalAmount = _totalAmount;
    job.status = JobStatus.Created;
    job.jobHash = _jobHash;

    for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
      job.milestones.push(
        Milestone({
          amount: _milestoneAmounts[i],
          descriptionHash: _milestoneHashes[i],
          submissionHash: bytes32(0),
          submitted: false,
          approved: false
        })
      );
    }

    emit JobCreated(nextJobId, msg.sender, _token, _totalAmount);
    nextJobId++;
    return job.jobId;
  }

  function assignFreelancer(
    uint256 _jobId,
    address _freelancer
  ) external jobExists(_jobId) onlyClient(_jobId) {
    Job storage job = jobs[_jobId];
    require(job.status == JobStatus.Created, 'Invalid status');
    require(_freelancer != address(0), 'Invalid freelancer');

    job.freelancer = _freelancer;
    emit FreelancerAssigned(_jobId, _freelancer);
  }

  function fundJob(
    uint256 _jobId
  ) external payable jobExists(_jobId) onlyClient(_jobId) {
    Job storage job = jobs[_jobId];
    require(job.freelancer != address(0), 'No freelancer assigned');
    require(job.status == JobStatus.Created, 'Already funded');

    if (job.token == address(0)) {
      require(msg.value == job.totalAmount, 'Incorrect funding amount');
    } else {
      require(msg.value == 0, 'Do not send ETH for token job');
      IERC20(job.token).safeTransferFrom(
        msg.sender,
        address(this),
        job.totalAmount
      );
    }

    job.fundedAmount = job.totalAmount;
    job.status = JobStatus.Funded;

    emit JobFunded(_jobId, job.totalAmount);
  }

  function submitMilestone(
    uint256 _jobId,
    uint256 _milestoneIndex,
    bytes32 _submissionHash
  ) external jobExists(_jobId) onlyFreelancer(_jobId) {
    Job storage job = jobs[_jobId];
    require(
      job.status == JobStatus.Funded || job.status == JobStatus.InProgress,
      'Invalid status'
    );
    require(_milestoneIndex < job.milestones.length, 'Invalid milestone index');

    Milestone storage m = job.milestones[_milestoneIndex];
    require(!m.submitted, 'Already submitted');

    m.submissionHash = _submissionHash;
    m.submitted = true;
    job.status = JobStatus.InProgress;

    emit MilestoneSubmitted(_jobId, _milestoneIndex, _submissionHash);
  }

  function approveMilestone(
    uint256 _jobId,
    uint256 _milestoneIndex
  ) external jobExists(_jobId) onlyClient(_jobId) {
    Job storage job = jobs[_jobId];
    require(
      job.status == JobStatus.Funded || job.status == JobStatus.InProgress,
      'Invalid status'
    );
    require(_milestoneIndex < job.milestones.length, 'Invalid milestone index');

    console.log("Approving Job ID:", _jobId);
    console.log("Current Released Amount:", job.releasedAmount);
    console.log("Milestone Amount:", job.milestones[_milestoneIndex].amount);

    Milestone storage m = job.milestones[_milestoneIndex];
    require(m.submitted, 'Not submitted');
    require(!m.approved, 'Already approved');

    m.approved = true;
    job.releasedAmount += m.amount;

    if (job.token == address(0)) {
      payable(job.freelancer).transfer(m.amount);
    } else {
      IERC20(job.token).safeTransfer(job.freelancer, m.amount);
    }

    emit MilestoneApproved(_jobId, _milestoneIndex, m.amount);

    if (job.releasedAmount == job.totalAmount) {
      job.status = JobStatus.Completed;
      emit JobCompleted(_jobId);
    }
  }

  function raiseDispute(uint256 _jobId) external jobExists(_jobId) {
    Job storage job = jobs[_jobId];
    require(
      msg.sender == job.client || msg.sender == job.freelancer,
      'Not participant'
    );
    require(
      job.status != JobStatus.Completed && job.status != JobStatus.Resolved,
      'Already closed'
    );

    job.status = JobStatus.Disputed;
    emit DisputeRaised(_jobId, msg.sender);
  }

  function resolveDispute(
    uint256 _jobId,
    uint256 _clientRefund,
    uint256 _freelancerPayment
  ) external jobExists(_jobId) onlyArbiter(_jobId) {
    Job storage job = jobs[_jobId];
    require(job.status == JobStatus.Disputed, 'Not disputed');

    uint256 remaining = job.fundedAmount - job.releasedAmount;
    require(
      _clientRefund + _freelancerPayment <= remaining,
      'Amounts exceed remaining funds'
    );

    job.status = JobStatus.Resolved;
    job.releasedAmount += _freelancerPayment; // Consider resolved payment as released

    if (job.token == address(0)) {
      if (_clientRefund > 0) payable(job.client).transfer(_clientRefund);
      if (_freelancerPayment > 0)
        payable(job.freelancer).transfer(_freelancerPayment);
    } else {
      if (_clientRefund > 0)
        IERC20(job.token).safeTransfer(job.client, _clientRefund);
      if (_freelancerPayment > 0)
        IERC20(job.token).safeTransfer(job.freelancer, _freelancerPayment);
    }

    emit DisputeResolved(_jobId, _clientRefund, _freelancerPayment);
  }

  function cancelJob(
    uint256 _jobId
  ) external jobExists(_jobId) onlyClient(_jobId) {
    Job storage job = jobs[_jobId];
    require(job.status == JobStatus.Created, 'Cannot cancel');

    job.status = JobStatus.Cancelled;
    emit JobCancelled(_jobId);
  }
}
