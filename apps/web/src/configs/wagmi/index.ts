import { createConfig, http } from 'wagmi';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
