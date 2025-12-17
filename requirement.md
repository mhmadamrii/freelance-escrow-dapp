### Client User Flow:

1. **Register/Login**: Connect wallet (e.g., MetaMask) to create or access account.
2. **Post Job**: Describe project, set budget/milestones, and deploy smart contract with escrow terms.
3. **Review Proposals**: View freelancer bids/profiles, select one, and agree on terms (sign contract via wallet).
4. **Fund Escrow**: Deposit funds into smart contract escrow.
5. **Monitor Progress**: Review milestone submissions from freelancer.
6. **Approve/Release**: Verify work, approve milestone to release funds from escrow. If dispute, initiate resolution (e.g., via arbitration DAO).
7. **Rate/Close**: Leave review and close the job.

### Freelancer User Flow:

1. **Register/Login**: Connect wallet to create or access profile (add skills/portfolio).
2. **Browse Jobs**: Search/filter available projects.
3. **Submit Proposal**: Bid on job with quote, timeline, and terms.
4. **Accept Contract**: If selected, sign smart contract via wallet.
5. **Work & Submit**: Complete milestones, upload proof (e.g., IPFS link) to dApp.
6. **Request Payment**: Trigger escrow release upon approval.
7. **Rate/Close**: Leave review and withdraw funds to wallet.

This flow ensures trustless escrow via smart contracts, minimizing disputes through on-chain verification.

### Off-Chain Storage (PostgreSQL + IPFS/TheGraph)

Store these for cost, speed, and searchability:

- Job title, detailed description, requirements
- Freelancer profiles (bio, skills, portfolio links, past reviews text)
- Proposals (detailed text, attachments)
- Reviews and ratings text
- File uploads/proof of work (store on IPFS, keep hash off-chain)
- User messages/chat history
- Search indexes (jobs by category, skills, location, etc.)
- Timestamps and metadata for UI sorting/filtering

### On-Chain Storage (Smart Contracts - Escrow Only)

Store only what's essential for trustless enforcement:

- Job ID (unique identifier linking to off-chain data)
- Client and freelancer wallet addresses
- Escrow amount and token type
- Milestone definitions (amounts, brief descriptions or hashes)
- Current status (e.g., funded, in progress, completed, disputed)
- Hashes of critical off-chain content (e.g., job description hash, milestone submission hash)
- Dispute flags and resolution outcomes (if using on-chain arbitration)
- Events for all state changes (emitted for indexing)

This minimizes gas costs while keeping escrow secure and verifiable.
