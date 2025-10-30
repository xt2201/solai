import { getSolanaService } from './src/services/solana';

async function testDevWallet() {
  console.log('🔍 Testing Dev Wallet Integration...\n');
  
  const solanaService = getSolanaService();
  
  // Test 1: Load dev wallet keypair
  console.log('1️⃣ Loading dev wallet keypair...');
  const devKeypair = (solanaService as any).devKeypair;
  if (!devKeypair) {
    console.error('❌ Failed to load dev wallet keypair from config');
    return;
  }
  console.log(`✅ Dev wallet loaded: ${devKeypair.publicKey.toBase58()}\n`);
  
  // Test 2: Check balance
  console.log('2️⃣ Checking dev wallet balance...');
  const balance = await solanaService.getBalance(devKeypair.publicKey.toBase58());
  console.log(`💰 Balance: ${balance.lamports / 1_000_000_000} SOL (${balance.lamports} lamports)\n`);
  
  // Test 3: Request airdrop if balance is low
  if (balance.lamports < 500_000_000) { // Less than 0.5 SOL
    console.log('3️⃣ Requesting devnet airdrop (1 SOL)...');
    try {
      const signature = await solanaService.requestAirdrop(
        devKeypair.publicKey.toBase58(),
        1
      );
      console.log(`✅ Airdrop signature: ${signature}`);
      console.log('⏳ Waiting 10 seconds for confirmation...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const newBalance = await solanaService.getBalance(devKeypair.publicKey.toBase58());
      console.log(`💰 New balance: ${newBalance.lamports / 1_000_000_000} SOL\n`);
    } catch (error: any) {
      console.error(`❌ Airdrop failed: ${error.message}\n`);
    }
  }
  
  // Test 4: Get transaction history
  console.log('4️⃣ Fetching transaction history...');
  const txSigs = await solanaService.getTransactionSignatures(
    devKeypair.publicKey.toBase58(),
    5
  );
  console.log(`📝 Found ${txSigs.length} transactions`);
  if (txSigs.length > 0) {
    console.log('Recent transactions:');
    for (const sig of txSigs.slice(0, 3)) {
      console.log(`  - ${sig.signature} (slot: ${sig.slot})`);
    }
  }
  console.log('');
  
  // Test 5: Network info
  console.log('5️⃣ Getting network info...');
  const networkInfo = await solanaService.getNetworkInfo();
  if (networkInfo) {
    console.log(`🌐 Network Info:`);
    console.log(`  - Cluster: ${networkInfo.cluster}`);
    console.log(`  - Epoch: ${networkInfo.epoch}`);
    console.log(`  - Slot: ${networkInfo.slot}`);
    console.log(`  - Version: ${networkInfo.version}`);
    console.log(`  - Total supply: ${(networkInfo.totalSupply / 1_000_000_000).toFixed(2)} SOL`);
    console.log(`  - Circulating supply: ${(networkInfo.circulatingSupply / 1_000_000_000).toFixed(2)} SOL`);
  }
  console.log('');
  
  console.log('✅ All tests completed!');
}

testDevWallet().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
