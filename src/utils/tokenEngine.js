import { createHash } from "./blockchainEngine.js";

export const tokenWallets = ["Alice", "Bob", "Charlie", "Marketplace"];

export function createTokenState() {
  return {
    erc20: null,
    nft: null,
    events: [event("SimulatorReady", "Token and NFT simulator initialized.")],
    marketplace: {
      feePercent: 2.5,
      listings: []
    },
    challenge: {
      tokenDeployed: false,
      tokensMinted: false,
      nftDeployed: false,
      twoNftsMinted: false,
      nftSold: false
    }
  };
}

export function deployERC20(state, { name = "Learning Token", symbol = "LRN" } = {}) {
  return {
    ...state,
    erc20: {
      address: contractAddress("ERC20", name),
      name,
      symbol,
      totalSupply: 0,
      balances: Object.fromEntries(tokenWallets.map(wallet => [wallet, 0])),
      allowances: {}
    },
    challenge: { ...state.challenge, tokenDeployed: true },
    events: [event("ERC20Deployed", `${name} (${symbol}) deployed.`), ...state.events]
  };
}

export function mintTokens(state, to, amount) {
  if (!state.erc20) return state;
  const value = Number(amount);
  return updateERC20(state, token => ({
    ...token,
    totalSupply: token.totalSupply + value,
    balances: { ...token.balances, [to]: token.balances[to] + value }
  }), "TokensMinted", `${value} ${state.erc20.symbol} minted to ${to}.`, { tokensMinted: true });
}

export function transferTokens(state, from, to, amount) {
  if (!state.erc20) return state;
  const value = Number(amount);
  if (state.erc20.balances[from] < value) return reject(state, "TransferRejected", `${from} has insufficient balance.`);
  return updateERC20(state, token => ({
    ...token,
    balances: {
      ...token.balances,
      [from]: token.balances[from] - value,
      [to]: token.balances[to] + value
    }
  }), "Transfer", `${from} transferred ${value} ${state.erc20.symbol} to ${to}.`);
}

export function burnTokens(state, from, amount) {
  if (!state.erc20) return state;
  const value = Number(amount);
  if (state.erc20.balances[from] < value) return reject(state, "BurnRejected", `${from} has insufficient balance to burn.`);
  return updateERC20(state, token => ({
    ...token,
    totalSupply: token.totalSupply - value,
    balances: { ...token.balances, [from]: token.balances[from] - value }
  }), "Burn", `${from} burned ${value} ${state.erc20.symbol}.`);
}

export function approveTokens(state, owner, spender, amount) {
  if (!state.erc20) return state;
  const key = allowanceKey(owner, spender);
  return updateERC20(state, token => ({
    ...token,
    allowances: { ...token.allowances, [key]: Number(amount) }
  }), "Approval", `${owner} approved ${spender} to spend ${amount} ${state.erc20.symbol}.`);
}

export function transferFrom(state, spender, owner, to, amount) {
  if (!state.erc20) return state;
  const value = Number(amount);
  const key = allowanceKey(owner, spender);
  const allowance = state.erc20.allowances[key] ?? 0;
  if (allowance < value) return reject(state, "TransferFromRejected", `Allowance is only ${allowance}.`);
  if (state.erc20.balances[owner] < value) return reject(state, "TransferFromRejected", `${owner} has insufficient balance.`);
  return updateERC20(state, token => ({
    ...token,
    allowances: { ...token.allowances, [key]: allowance - value },
    balances: {
      ...token.balances,
      [owner]: token.balances[owner] - value,
      [to]: token.balances[to] + value
    }
  }), "TransferFrom", `${spender} moved ${value} ${state.erc20.symbol} from ${owner} to ${to}.`);
}

export function deployNFTCollection(state, { name = "Learning Collectibles", symbol = "LNFT" } = {}) {
  return {
    ...state,
    nft: {
      address: contractAddress("ERC721", name),
      name,
      symbol,
      nextId: 1,
      tokens: [],
      operatorApprovals: {}
    },
    challenge: { ...state.challenge, nftDeployed: true },
    events: [event("ERC721Deployed", `${name} (${symbol}) collection deployed.`), ...state.events]
  };
}

export function mintNFT(state, owner, metadata) {
  if (!state.nft) return state;
  const token = {
    id: state.nft.nextId,
    owner,
    approvedOperator: "",
    metadata: {
      name: metadata?.name || `Learning NFT #${state.nft.nextId}`,
      description: metadata?.description || "A simulated NFT for blockchain learning.",
      image: metadata?.image || "gradient-blue-cyan",
      attributes: metadata?.attributes || [{ trait_type: "Phase", value: "Token Standards" }]
    }
  };
  const tokens = [...state.nft.tokens, token];
  return {
    ...state,
    nft: { ...state.nft, nextId: state.nft.nextId + 1, tokens },
    challenge: { ...state.challenge, twoNftsMinted: tokens.length >= 2 },
    events: [event("NFTMinted", `${token.metadata.name} minted to ${owner}.`), ...state.events]
  };
}

export function transferNFT(state, from, to, tokenId, operator = from) {
  if (!state.nft) return state;
  const token = state.nft.tokens.find(item => item.id === Number(tokenId));
  if (!token) return reject(state, "NFTTransferRejected", "NFT not found.");
  const approved = token.owner === operator || token.approvedOperator === operator || state.nft.operatorApprovals[approvalKey(token.owner, operator)];
  if (token.owner !== from || !approved) return reject(state, "NFTTransferRejected", `${operator} is not approved to transfer NFT #${tokenId}.`);
  return updateNFT(state, nft => ({
    ...nft,
    tokens: nft.tokens.map(item => item.id === Number(tokenId) ? { ...item, owner: to, approvedOperator: "" } : item)
  }), "NFTTransfer", `NFT #${tokenId} transferred from ${from} to ${to}.`);
}

export function approveNFTOperator(state, owner, operator, approved = true) {
  if (!state.nft) return state;
  return updateNFT(state, nft => ({
    ...nft,
    operatorApprovals: { ...nft.operatorApprovals, [approvalKey(owner, operator)]: approved }
  }), "OperatorApproval", `${owner} ${approved ? "approved" : "revoked"} ${operator} as operator.`);
}

export function listNFT(state, owner, tokenId, price) {
  const token = state.nft?.tokens.find(item => item.id === Number(tokenId));
  if (!token || token.owner !== owner) return reject(state, "ListingRejected", "Only owner can list this NFT.");
  const listing = { id: crypto.randomUUID(), tokenId: Number(tokenId), seller: owner, price: Number(price), active: true };
  return {
    ...state,
    marketplace: { ...state.marketplace, listings: [listing, ...state.marketplace.listings] },
    events: [event("NFTListed", `${owner} listed NFT #${tokenId} for ${price} tokens.`), ...state.events]
  };
}

export function buyNFT(state, listingId, buyer) {
  const listing = state.marketplace.listings.find(item => item.id === listingId && item.active);
  if (!listing) return reject(state, "BuyRejected", "Active listing not found.");
  const fee = Number((listing.price * state.marketplace.feePercent / 100).toFixed(2));
  const transferred = transferNFT(state, listing.seller, buyer, listing.tokenId, listing.seller);
  return {
    ...transferred,
    marketplace: {
      ...transferred.marketplace,
      listings: transferred.marketplace.listings.map(item => item.id === listingId ? { ...item, active: false, buyer, fee } : item)
    },
    challenge: { ...transferred.challenge, nftSold: true },
    events: [event("NFTSold", `${buyer} bought NFT #${listing.tokenId}. Marketplace fee: ${fee}.`), ...transferred.events]
  };
}

export function allowanceOf(state, owner, spender) {
  return state.erc20?.allowances[allowanceKey(owner, spender)] ?? 0;
}

function updateERC20(state, updater, eventName, message, challengePatch = {}) {
  return {
    ...state,
    erc20: updater(state.erc20),
    challenge: { ...state.challenge, ...challengePatch },
    events: [event(eventName, message), ...state.events]
  };
}

function updateNFT(state, updater, eventName, message) {
  return {
    ...state,
    nft: updater(state.nft),
    events: [event(eventName, message), ...state.events]
  };
}

function reject(state, name, message) {
  return {
    ...state,
    events: [event(name, message), ...state.events]
  };
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}

function contractAddress(type, seed) {
  return `0x${createHash(`${type}:${seed}:${Date.now()}:${Math.random()}`).slice(0, 40)}`;
}

function allowanceKey(owner, spender) {
  return `${owner}->${spender}`;
}

function approvalKey(owner, operator) {
  return `${owner}->${operator}`;
}
