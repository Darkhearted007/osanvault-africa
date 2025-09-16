const SOLANA_RPC = 'https://api.devnet.solana.com';
const WALLET = '7rDzXgyZhNEZT9KFoNowL7fo8cbdryg8RnVUhuN2MjXd';
const REAL_ESTATE_API_KEY = 'secreta239076407a38bfd574d6ecccfce78d6c11bc9db7a0ed84407be8ba92daca581dcd4803fff73f41a';

async function fetchWalletData() {
  try {
    const solana = await import('@solana/web3.js');
    const spl = await import('@solana/spl-token');
    const connection = new solana.Connection(SOLANA_RPC);

    const publicKey = new solana.PublicKey(WALLET);
    const balance = await connection.getBalance(publicKey);
    document.getElementById('sol-balance').innerText = (balance/1e9).toFixed(4) + ' SOL';

    // NET token balance (assumes known mint)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {mint: new solana.PublicKey(WALLET)});
    let netBalance = 0;
    tokenAccounts.value.forEach(acc => { netBalance += acc.account.data.parsed.info.tokenAmount.uiAmount; });
    document.getElementById('net-balance').innerText = netBalance + ' NET';
  } catch (err) {
    console.error(err);
  }
}

async function fetchProperties() {
  try {
    const res = await fetch('https://api.example.com/properties?key=' + REAL_ESTATE_API_KEY);
    const data = await res.json();
    const container = document.getElementById('properties');
    container.innerHTML = '';
    data.properties.slice(0,20).forEach(p => {
      container.innerHTML += `<div><h3>${p.name}</h3><p>${p.description}</p><p>Price: $${p.price}</p><p>Fraction: ${p.fraction}%</p></div>`;
    });
  } catch (err) {
    console.error(err);
    document.getElementById('properties').innerText = 'Failed to load properties.';
  }
}

async function fetchTokenAudit() {
  const wallet = document.getElementById('audit-wallet').value;
  const res = await fetch('https://osanvaultafrica.com/token-audit/' + wallet);
  const data = await res.json();
  document.getElementById('audit-results').innerText = JSON.stringify(data, null, 2);
}

window.onload = () => {
  fetchWalletData();
  fetchProperties();
};
