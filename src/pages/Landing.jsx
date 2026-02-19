import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-emerald-600 to-emerald-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="text-3xl">🍃</span>
            <span className="text-xl font-bold">FoodBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-white/90 hover:text-white transition">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2 bg-white text-primary-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-lg shadow-black/10">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32 text-center text-white">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Every Meal Matters.<br />
            <span className="text-emerald-200">Zero Waste. Full Plates.</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            The intelligent platform connecting restaurants, hostels, and caterers
            with NGOs to redistribute surplus food — safely, efficiently, in real time.
          </motion.p>
          <motion.div
            className="mt-10 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link to="/register" className="px-8 py-3 bg-white text-primary-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-xl shadow-black/20">
              Start Donating
            </Link>
            <Link to="/register" className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/20 transition backdrop-blur">
              Join as NGO
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ── Impact stats ─────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 50000, label: 'Meals Saved', suffix: '+', icon: '🍽️' },
            { value: 200,   label: 'Active NGOs', suffix: '+', icon: '🤝' },
            { value: 500,   label: 'Donors',      suffix: '+', icon: '🏪' },
            { value: 15,    label: 'Cities',       suffix: '',  icon: '🌍' },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                <CountUp end={stat.value} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />{stat.suffix}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Donate', desc: 'Restaurants and caterers list surplus food with details and pickup window.', icon: '📦' },
              { step: '02', title: 'Match', desc: 'Our engine finds the nearest, most reliable NGO and notifies them instantly.', icon: '🔗' },
              { step: '03', title: 'Deliver', desc: 'NGO picks up safely, delivers to communities, and logs the impact.', icon: '🚚' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl">{item.icon}</span>
                <p className="text-xs font-bold text-primary-500 mt-4">STEP {item.step}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <p>🍃 FoodBridge &copy; {new Date().getFullYear()} — Built to fight food waste.</p>
      </footer>
    </div>
  );
}
