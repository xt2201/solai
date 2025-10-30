# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in SolAI, please report it by emailing the maintainers. Please do not create public GitHub issues for security vulnerabilities.

## Sensitive Information

This repository follows security best practices:

### ⚠️ NEVER commit these files:
- `config.yml` - Contains API keys and secrets
- `keys/` directory - Contains Solana keypairs
- `.env` files - Environment variables with secrets
- Any file containing private keys or API tokens

### ✅ Safe to commit:
- `config.example.yml` - Template with placeholder values
- Source code that reads from config
- Documentation and guides

## Setup Instructions

1. **Copy the example config:**
   ```bash
   cp config.example.yml config.yml
   ```

2. **Fill in your API keys in `config.yml`:**
   - Cerebras API key: https://cerebras.ai/
   - Gemini API key: https://aistudio.google.com/
   - Pinecone API key: https://pinecone.io/
   - Helius API key: https://helius.dev/
   - Firecrawl API key: https://firecrawl.dev/

3. **Generate Solana keypairs:**
   ```bash
   mkdir -p keys
   solana-keygen new --outfile keys/program_admin.json
   ```

4. **Never share or commit these files!**

## Environment Variables

For production deployments, use environment variables instead of config files:

```bash
export CEREBRAS_API_KEY="your_key"
export GEMINI_API_KEY="your_key"
export PINECONE_API_KEY="your_key"
export HELIUS_API_KEY="your_key"
export FIRECRAWL_API_KEY="your_key"
```

## Smart Contract Security

The Solana program deployed on devnet is for testing purposes only. Before mainnet deployment:

1. Complete a professional security audit
2. Run extensive testing on devnet/testnet
3. Implement proper access controls
4. Set up monitoring and alerting

## API Security

- Rate limiting is implemented on all endpoints
- Authentication required for sensitive operations
- CORS configured for allowed origins only
- Input validation on all user inputs

## Best Practices

1. **Rotate API keys regularly**
2. **Use different keys for dev/staging/production**
3. **Monitor API usage for anomalies**
4. **Keep dependencies updated**
5. **Review audit logs regularly**

## Responsible Disclosure

We appreciate security researchers who responsibly disclose vulnerabilities. We will:

1. Acknowledge receipt within 48 hours
2. Provide regular updates on our progress
3. Credit you in our security advisories (if desired)
4. Work with you to understand and fix the issue

Thank you for helping keep SolAI secure!
