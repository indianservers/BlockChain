const HASH_SEED = 0x9e3779b9;

export function createHash(input) {
  const text = String(input);
  let a = 0x811c9dc5;
  let b = 0x45d9f3b;
  let c = HASH_SEED;

  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    a = Math.imul(a ^ code, 16777619);
    b = Math.imul(b + code + index, 2246822507);
    c = Math.imul(c ^ (code << (index % 8)), 3266489909);
  }

  const chunks = Array.from({ length: 8 }, (_, index) => {
    a = Math.imul(a ^ (b >>> 13), 1597334677);
    b = Math.imul(b ^ (c >>> 16), 3812015801);
    c = Math.imul(c ^ (a >>> 15), 958689917);
    return ((a ^ b ^ c ^ index) >>> 0).toString(16).padStart(8, "0");
  });

  return chunks.join("");
}

export function calculateBlockHash(block) {
  return createHash(`${block.index}|${block.timestamp}|${block.data}|${block.previousHash}|${block.nonce}`);
}

export function createBlock(index, data, previousHash = "0".repeat(64), nonce = index * 17 + 11) {
  const block = {
    index,
    timestamp: new Date(Date.now() + index * 1000).toISOString(),
    data,
    previousHash,
    nonce
  };
  return {
    ...block,
    hash: calculateBlockHash(block)
  };
}

export function createGenesisBlock() {
  return createBlock(0, "Genesis block: first record", "0".repeat(64), 101);
}

export function addBlock(chain, data) {
  const previous = chain[chain.length - 1] ?? createGenesisBlock();
  return [...chain, createBlock(chain.length, data, previous.hash)];
}

export function buildDefaultChain() {
  const chain = [createGenesisBlock()];
  return addBlock(addBlock(chain, "Alice sends 2 tokens to Bob"), "Bob confirms delivery");
}

export function recalculateBlock(block) {
  return {
    ...block,
    hash: calculateBlockHash(block)
  };
}

export function tamperBlock(chain, blockIndex, data) {
  return chain.map(block => {
    if (block.index !== blockIndex) return block;
    return recalculateBlock({ ...block, data });
  });
}

export function repairChain(chain) {
  return chain.reduce((repaired, block, index) => {
    const previousHash = index === 0 ? "0".repeat(64) : repaired[index - 1].hash;
    repaired.push(recalculateBlock({ ...block, index, previousHash }));
    return repaired;
  }, []);
}

export function validateChain(chain) {
  const results = chain.map((block, index) => {
    const expectedPreviousHash = index === 0 ? "0".repeat(64) : chain[index - 1].hash;
    const expectedHash = calculateBlockHash(block);
    const ownHashValid = block.hash === expectedHash;
    const linkValid = block.previousHash === expectedPreviousHash;
    return {
      index,
      valid: ownHashValid && linkValid,
      ownHashValid,
      linkValid,
      expectedHash,
      expectedPreviousHash
    };
  });

  const invalid = results.filter(result => !result.valid);
  return {
    totalBlocks: chain.length,
    validBlocks: results.length - invalid.length,
    invalidBlocks: invalid.length,
    firstBrokenBlock: invalid[0]?.index ?? null,
    results
  };
}

export function hashPreview(hash, size = 10) {
  if (!hash) return "";
  return `${hash.slice(0, size)}...${hash.slice(-6)}`;
}
