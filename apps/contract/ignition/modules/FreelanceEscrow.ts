import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const FreelanceEscrowModule = buildModule('FreelanceEscrowModule', (m) => {
  // Deploy FreelanceEscrow contract
  const freelanceEscrow = m.contract('FreelanceEscrow');

  return { freelanceEscrow };
});

export default FreelanceEscrowModule;
