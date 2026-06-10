import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeDollarSign, Boxes, CheckCircle2, GalleryHorizontalEnd, ImagePlus, Play, RefreshCw, ScrollText, ShoppingCart, WalletCards } from "lucide-react";
import { phase8Quiz, tokenStandards } from "../data/phase8.js";
import {
  allowanceOf,
  approveNFTOperator,
  approveTokens,
  burnTokens,
  buyNFT,
  createTokenState,
  deployERC20,
  deployNFTCollection,
  listNFT,
  mintNFT,
  mintTokens,
  tokenWallets,
  transferFrom,
  transferNFT,
  transferTokens
} from "../utils/tokenEngine.js";

export default function Phase8() {
  const [state, setState] = useState(() => loadTokenState());
  const [tokenForm, setTokenForm] = useState({ name: "Learning Token", symbol: "LRN", to: "Alice", amount: 100, from: "Alice", transferTo: "Bob", spender: "Charlie" });
  const [nftForm, setNftForm] = useState({ name: "Learning Collectibles", symbol: "LNFT", owner: "Alice", nftName: "Consensus Badge", transferTo: "Bob", operator: "Marketplace", price: 18 });
  const [selectedNftId, setSelectedNftId] = useState(null);
  const selectedNft = state.nft?.tokens.find(token => token.id === Number(selectedNftId)) ?? state.nft?.tokens[0];
  const allowance = useMemo(() => allowanceOf(state, tokenForm.from, tokenForm.spender), [state, tokenForm.from, tokenForm.spender]);

  useEffect(() => {
    localStorage.setItem("bfv-phase8-state", JSON.stringify(state));
  }, [state]);

  function updateToken(field, value) {
    setTokenForm(current => ({ ...current, [field]: field === "amount" ? Number(value) : value }));
  }

  function updateNft(field, value) {
    setNftForm(current => ({ ...current, [field]: field === "price" ? Number(value) : value }));
  }

  return (
    <>
      <section id="phase8" className="section-wrap bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
              <GalleryHorizontalEnd size={17} /> Phase 8
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">Token Standards & NFT Simulator</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Deploy ERC-20 style tokens, mint NFTs, manage approvals, inspect metadata, and simulate marketplace ownership transfers.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="ERC-20 supply" value={state.erc20?.totalSupply ?? 0} />
            <HeroStat label="NFTs minted" value={state.nft?.tokens.length ?? 0} />
            <HeroStat label="Listings" value={state.marketplace.listings.filter(item => item.active).length} />
            <HeroStat label="Events" value={state.events.length} />
          </div>
        </div>
      </section>

      <section id="fungible-nft" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={Boxes} eyebrow="Fungible vs non-fungible" title="Some tokens are interchangeable. Some are unique." description="ERC-20 style tokens behave like identical units. ERC-721 style NFTs carry unique token IDs, owners, and metadata." />
        <div className="grid gap-5 lg:grid-cols-2">
          <VisualCard title="Fungible token" subtitle="100 LRN = 100 interchangeable units" repeat={12} rounded />
          <VisualCard title="Non-fungible token" subtitle="Each NFT has a unique ID and metadata" repeat={6} />
        </div>
      </section>

      <section id="erc20-lab" className="section-wrap">
        <PhaseTitle icon={BadgeDollarSign} eyebrow="ERC-20 style simulator" title="Deploy, mint, transfer, burn, and approve fungible tokens" description="Track balances, total supply, allowances, and transferFrom behavior." />
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <article className="panel p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Token name" value={tokenForm.name} onChange={value => updateToken("name", value)} />
              <Input label="Symbol" value={tokenForm.symbol} onChange={value => updateToken("symbol", value)} />
            </div>
            <button type="button" onClick={() => setState(current => deployERC20(current, tokenForm))} className="btn-primary mt-4"><Play size={18} /> Deploy ERC-20</button>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Select label="From / owner" value={tokenForm.from} onChange={value => updateToken("from", value)} options={tokenWallets} />
              <Select label="To" value={tokenForm.transferTo} onChange={value => updateToken("transferTo", value)} options={tokenWallets} />
              <Select label="Mint to" value={tokenForm.to} onChange={value => updateToken("to", value)} options={tokenWallets} />
              <Select label="Spender" value={tokenForm.spender} onChange={value => updateToken("spender", value)} options={tokenWallets} />
              <Input label="Amount" type="number" value={tokenForm.amount} onChange={value => updateToken("amount", value)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => mintTokens(current, tokenForm.to, tokenForm.amount))} className="btn-secondary">Mint</button>
              <button type="button" onClick={() => setState(current => transferTokens(current, tokenForm.from, tokenForm.transferTo, tokenForm.amount))} className="btn-secondary">Transfer</button>
              <button type="button" onClick={() => setState(current => burnTokens(current, tokenForm.from, tokenForm.amount))} className="btn-secondary">Burn</button>
              <button type="button" onClick={() => setState(current => approveTokens(current, tokenForm.from, tokenForm.spender, tokenForm.amount))} className="btn-secondary">approve()</button>
              <button type="button" onClick={() => setState(current => transferFrom(current, tokenForm.spender, tokenForm.from, tokenForm.transferTo, tokenForm.amount))} className="btn-secondary">transferFrom()</button>
            </div>
            <p className="mt-4 rounded-lg bg-cyanx/10 p-3 font-black text-cyanx">Allowance {tokenForm.from} → {tokenForm.spender}: {allowance}</p>
          </article>
          <TokenBalances token={state.erc20} />
        </div>
      </section>

      <section id="nft-lab" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ImagePlus} eyebrow="ERC-721 style simulator" title="Deploy collection, mint NFTs, transfer ownership, approve operators" description="NFTs are unique records with token IDs, owners, approvals, and metadata JSON." />
        <div className="grid gap-5 xl:grid-cols-[.82fr_1.18fr]">
          <article className="panel p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Collection name" value={nftForm.name} onChange={value => updateNft("name", value)} />
              <Input label="Symbol" value={nftForm.symbol} onChange={value => updateNft("symbol", value)} />
            </div>
            <button type="button" onClick={() => setState(current => deployNFTCollection(current, nftForm))} className="btn-primary mt-4">Deploy Collection</button>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Select label="Owner" value={nftForm.owner} onChange={value => updateNft("owner", value)} options={tokenWallets} />
              <Input label="NFT name" value={nftForm.nftName} onChange={value => updateNft("nftName", value)} />
              <Select label="Transfer to" value={nftForm.transferTo} onChange={value => updateNft("transferTo", value)} options={tokenWallets} />
              <Select label="Operator" value={nftForm.operator} onChange={value => updateNft("operator", value)} options={tokenWallets} />
              <Input label="Marketplace price" type="number" value={nftForm.price} onChange={value => updateNft("price", value)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setState(current => mintNFT(current, nftForm.owner, { name: nftForm.nftName }))} className="btn-secondary">Mint NFT</button>
              <button type="button" onClick={() => selectedNft && setState(current => transferNFT(current, selectedNft.owner, nftForm.transferTo, selectedNft.id))} className="btn-secondary">Transfer NFT</button>
              <button type="button" onClick={() => selectedNft && setState(current => approveNFTOperator(current, selectedNft.owner, nftForm.operator, true))} className="btn-secondary">Approve Operator</button>
              <button type="button" onClick={() => selectedNft && setState(current => listNFT(current, selectedNft.owner, selectedNft.id, nftForm.price))} className="btn-secondary">List NFT</button>
            </div>
          </article>
          <NFTGallery nft={state.nft} selectedId={selectedNft?.id} onSelect={setSelectedNftId} />
        </div>
      </section>

      <section id="marketplace-metadata" className="section-wrap">
        <PhaseTitle icon={ShoppingCart} eyebrow="Marketplace and metadata" title="List, buy, transfer ownership, and inspect JSON" description="Marketplace flows combine approvals, listing prices, buyer action, fee calculation, and ownership transfer." />
        <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <MarketplacePanel state={state} setState={setState} />
          <MetadataViewer nft={selectedNft} />
        </div>
      </section>

      <section id="token-standards" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={ScrollText} eyebrow="Token standards comparison" title="Different token standards model different ownership patterns" description="The standard shapes what can be minted, transferred, approved, and represented." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tokenStandards.map(([title, text]) => (
            <article key={title} className="panel p-5">
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="phase8-events" className="section-wrap">
        <PhaseTitle icon={ScrollText} eyebrow="Token event log" title="Watch token and NFT events as they happen" description="Deployments, mints, transfers, approvals, listings, and sales emit event-style logs." />
        <EventConsole events={state.events} />
      </section>

      <section id="phase8-practice" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
        <PhaseTitle icon={CheckCircle2} eyebrow="Practice and challenge" title="Deploy, mint, collect, and sell" description="Complete the token/NFT workflow: deploy token, mint tokens, deploy NFT, mint two NFTs, sell one NFT." />
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Phase8Quiz />
          <ChallengePanel challenge={state.challenge} reset={() => setState(createTokenState())} />
        </div>
      </section>
    </>
  );
}

function TokenBalances({ token }) {
  if (!token) return <Empty text="Deploy an ERC-20 token to see balances." />;
  return (
    <article className="panel p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">{token.name}</h3>
          <p className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">{token.address}</p>
        </div>
        <span className="rounded-full bg-cyanx/10 px-3 py-1 text-sm font-black text-cyanx">Supply {token.totalSupply}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(token.balances).map(([wallet, balance]) => (
          <div key={wallet} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <p className="font-black">{wallet}</p>
            <p className="mt-1 text-3xl font-black">{balance}</p>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{token.symbol}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function NFTGallery({ nft, selectedId, onSelect }) {
  if (!nft) return <Empty text="Deploy an NFT collection to open the gallery." />;
  return (
    <article className="panel p-5">
      <div className="mb-5">
        <h3 className="text-2xl font-black">{nft.name}</h3>
        <p className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">{nft.address}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {nft.tokens.map(token => (
          <button key={token.id} type="button" onClick={() => onSelect(token.id)} className={`overflow-hidden rounded-lg border bg-white text-left shadow-soft transition hover:-translate-y-1 dark:bg-slate-900 ${selectedId === token.id ? "border-cyanx ring-4 ring-cyanx/15" : "border-slate-200 dark:border-white/10"}`}>
            <div className="h-32 bg-gradient-to-br from-bluex via-cyanx to-emerald-400" />
            <div className="p-4">
              <h4 className="font-black">{token.metadata.name}</h4>
              <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">Token #{token.id}</p>
              <p className="mt-2 text-sm font-black text-cyanx">Owner: {token.owner}</p>
            </div>
          </button>
        ))}
        {!nft.tokens.length && <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">No NFTs minted yet.</p>}
      </div>
    </article>
  );
}

function MarketplacePanel({ state, setState }) {
  const active = state.marketplace.listings.filter(item => item.active);
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Marketplace listings</h3>
      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">Marketplace fee: {state.marketplace.feePercent}%</p>
      <div className="mt-5 grid gap-3">
        {active.map(listing => (
          <div key={listing.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black">NFT #{listing.tokenId}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Seller: {listing.seller}</p>
              </div>
              <p className="text-2xl font-black">{listing.price}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tokenWallets.filter(wallet => wallet !== listing.seller).map(wallet => (
                <button key={wallet} type="button" onClick={() => setState(current => buyNFT(current, listing.id, wallet))} className="btn-secondary min-h-9 py-1 text-sm">Buy as {wallet}</button>
              ))}
            </div>
          </div>
        ))}
        {!active.length && <Empty text="No active marketplace listings." />}
      </div>
    </article>
  );
}

function MetadataViewer({ nft }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Metadata JSON viewer</h3>
      </div>
      <pre className="max-h-96 overflow-auto p-4 text-sm leading-7 text-slate-100"><code>{JSON.stringify(nft?.metadata ?? { message: "Select or mint an NFT to inspect metadata." }, null, 2)}</code></pre>
    </article>
  );
}

function EventConsole({ events }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="border-b border-white/10 px-4 py-3 text-white">
        <h3 className="font-black">Token event console</h3>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-sm">
        {events.map(event => (
          <div key={event.id} className="mb-3 text-slate-200">
            <span className="text-cyanx">[{event.time}]</span> <span className="text-emerald-300">{event.name}</span> {event.message}
          </div>
        ))}
      </div>
    </article>
  );
}

function Phase8Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(() => Number(localStorage.getItem("bfv-phase8-quiz") || 0));
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const question = phase8Quiz[index];

  function choose(option) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(current => {
        const next = current + 1;
        localStorage.setItem("bfv-phase8-quiz", String(next));
        return next;
      });
    }
  }

  return (
    <article className="panel p-6">
      <div className="mb-4 flex justify-between text-sm font-black text-slate-500 dark:text-slate-400">
        <span>{done ? "Complete" : `Question ${index + 1} of ${phase8Quiz.length}`}</span>
        <span>Score: {score}</span>
      </div>
      {done ? (
        <>
          <h3 className="text-3xl font-black">Phase 8 score: {score}/{phase8Quiz.length}</h3>
          <button type="button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); localStorage.setItem("bfv-phase8-quiz", "0"); }} className="btn-primary mt-6">Restart</button>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-black">{question.question}</h3>
          <div className="mt-5 grid gap-3">
            {question.options.map(option => {
              const correct = selected && option === question.answer;
              const wrong = selected === option && option !== question.answer;
              return <button key={option} type="button" onClick={() => choose(option)} className={`rounded-lg border p-4 text-left font-bold transition ${correct ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : wrong ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200" : "border-slate-200 bg-slate-50 hover:border-cyanx dark:border-white/10 dark:bg-white/5"}`}>{option}</button>;
            })}
          </div>
          <p className={`mt-4 min-h-7 font-black ${selected === question.answer ? "text-emerald-600" : "text-red-500"}`}>{selected ? (selected === question.answer ? "Correct." : `Correct answer: ${question.answer}.`) : ""}</p>
          <button type="button" disabled={!selected} onClick={() => { if (index === phase8Quiz.length - 1) setDone(true); else { setIndex(current => current + 1); setSelected(null); } }} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </>
      )}
    </article>
  );
}

function ChallengePanel({ challenge, reset }) {
  const rows = [
    ["Deploy token", challenge.tokenDeployed],
    ["Mint tokens", challenge.tokensMinted],
    ["Deploy NFT", challenge.nftDeployed],
    ["Mint 2 NFTs", challenge.twoNftsMinted],
    ["Sell 1 NFT", challenge.nftSold]
  ];
  return (
    <article className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-black">Challenge checklist</h3>
        <button type="button" onClick={reset} className="btn-secondary"><RefreshCw size={18} /> Reset</button>
      </div>
      <div className="mt-5 grid gap-3">
        {rows.map(([label, done]) => (
          <div key={label} className={`flex items-center gap-3 rounded-lg p-4 font-black ${done ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300"}`}>
            {done ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            {label}
          </div>
        ))}
      </div>
    </article>
  );
}

function VisualCard({ title, subtitle, repeat, rounded }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{subtitle}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {Array.from({ length: repeat }, (_, index) => (
          <div key={index} className={`${rounded ? "rounded-full" : "rounded-lg"} grid h-14 w-14 place-items-center bg-gradient-to-br from-bluex to-cyanx font-black text-white`}>
            {rounded ? "$" : `#${index + 1}`}
          </div>
        ))}
      </div>
    </article>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5">
      <p className="text-sm font-black uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input type={type} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5" />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-semibold dark:border-white/10 dark:bg-white/5">
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Empty({ text }) {
  return <div className="panel grid min-h-48 place-items-center p-5 text-center font-bold text-slate-500 dark:text-slate-400">{text}</div>;
}

function PhaseTitle({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
        <Icon size={17} /> {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function loadTokenState() {
  try {
    const stored = JSON.parse(localStorage.getItem("bfv-phase8-state") || "null");
    return stored?.events ? stored : createTokenState();
  } catch {
    return createTokenState();
  }
}
