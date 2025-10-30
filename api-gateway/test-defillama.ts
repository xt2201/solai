import { DefiLlamaClient } from './src/services/defillama';

async function test() {
  console.log('Testing DefiLlama integration...\n');
  
  const client = new DefiLlamaClient();
  
  try {
    console.log('1. Fetching Solana yield pools...');
    const pools = await client.getSolanaYieldPools(10);
    console.log(`   Found ${pools.length} Solana pools with APY > 10%`);
    console.log('   Top 3:');
    pools.slice(0, 3).forEach((pool, i) => {
      console.log(`   ${i + 1}. ${pool.project} - ${pool.symbol}: ${pool.apy.toFixed(2)}% APY, $${(pool.tvlUsd / 1000000).toFixed(2)}M TVL`);
    });
    
    console.log('\n2. Fetching top opportunities...');
    const opportunities = await client.getTopSolanaOpportunities(5);
    console.log(`   Found ${opportunities.length} safe opportunities`);
    opportunities.forEach((opp, i) => {
      console.log(`   ${i + 1}. ${opp.project} - ${opp.symbol}`);
      console.log(`      APY: ${opp.apy.toFixed(2)}% | TVL: $${(opp.tvlUsd / 1000000).toFixed(2)}M | Stablecoin: ${opp.stablecoin}`);
    });
    
    console.log('\n3. Fetching Solana TVL...');
    const tvl = await client.getSolanaTVL();
    console.log(`   Solana Total TVL: $${(tvl / 1000000000).toFixed(2)}B`);
    
    console.log('\n✅ All tests passed!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
