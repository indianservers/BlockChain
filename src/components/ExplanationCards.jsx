import { motion } from "framer-motion";
import { explanationCards } from "../data/content.js";

export default function ExplanationCards() {
  return (
    <section id="basics" className="section-wrap bg-slate-100/70 dark:bg-white/[.035]">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">What is blockchain?</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">A shared record book that is hard to secretly rewrite</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Blockchain starts with a simple promise: many participants can keep the same trusted history without depending completely on one central owner.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {explanationCards.map(({ icon: Icon, title, text }, index) => (
          <motion.article
            key={title}
            className="panel p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.05 }}
          >
            <Icon className="mb-5 text-cyanx" size={28} />
            <h3 className="text-xl font-black">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
