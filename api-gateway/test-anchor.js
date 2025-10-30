const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function test() {
  try {
    // Load IDL
    const idl = JSON.parse(fs.readFileSync('./src/idl/solai_program.json', 'utf-8'));
    console.log('IDL loaded, version:', idl.version);
    console.log('Instructions:', idl.instructions.map(i => i.name));
    console.log('Accounts:', idl.accounts.map(a => a.name));
    console.log('Types:', idl.types?.length || 0);
    
    // Load wallet
    process.env.ANCHOR_WALLET = '../keys/program_admin.json';
    const provider = anchor.AnchorProvider.local('https://api.devnet.solana.com');
    console.log('Provider created, wallet:', provider.wallet.publicKey.toBase58());
    
    // Create program
    const programId = new PublicKey('8pMVJamgnZKWmYJQQ8gvPaT7UFVg5BAr3Rg5HY8epYyh');
    const program = new anchor.Program(idl, programId, provider);
    console.log('Program created successfully!');
    console.log('Has account:', !!program.account);
    console.log('Has methods:', !!program.methods);
    
    if (program.account) {
      console.log('Account keys:', Object.keys(program.account));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
