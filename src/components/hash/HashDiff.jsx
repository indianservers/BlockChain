export default function HashDiff({ previousHash, currentHash }) {
  return (
    <p className="break-all rounded-lg bg-slate-950 p-4 font-mono text-sm font-black leading-7 text-slate-200">
      {currentHash.split("").map((char, index) => {
        const changed = previousHash && previousHash[index] !== char;
        return (
          <span key={`${char}-${index}`} className={changed ? "rounded bg-cyanx/25 text-cyanx" : ""}>
            {char}
          </span>
        );
      })}
    </p>
  );
}
