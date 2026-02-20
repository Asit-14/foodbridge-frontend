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
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <span className="text-3xl">🍃</span>
            <span className="text-xl font-bold tracking-tight">FoodBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-white/90 hover:text-white transition">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-white text-primary-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-lg shadow-black/10">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center text-white">
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">Live — reducing waste in real time</span>
          </motion.div>

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
            className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            The intelligent platform connecting restaurants, hostels, and caterers
            with NGOs to redistribute surplus food — safely, efficiently, in real time.
          </motion.p>
          <motion.div
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link to="/register" className="px-8 py-3.5 bg-white text-primary-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-xl shadow-black/20">
              Start Donating
            </Link>
            <Link to="/register" className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition backdrop-blur">
              Join as NGO
            </Link>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 32C840 40 960 48 1080 44C1200 40 1320 24 1380 16L1440 8V80H0Z" fill="white" />
          </svg>
        </div>
      </header>

      {/* ── Impact stats ─────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 text-center">
            {[
              { value: 50000, label: 'Meals Saved', suffix: '+', icon: '🍽️' },
              { value: 200,   label: 'Active NGOs', suffix: '+', icon: '🤝' },
              { value: 500,   label: 'Donors',      suffix: '+', icon: '🏪' },
              { value: 15,    label: 'Cities',       suffix: '',  icon: '🌍' },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mb-4">
                  {stat.icon}
                </div>
                <p className="text-4xl lg:text-5xl font-extrabold text-gray-900 tabular-nums tracking-tight">
                  <CountUp end={stat.value} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />{stat.suffix}
                </p>
                <p className="text-base font-medium text-gray-500 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { step: '01', title: 'Donate', desc: 'Restaurants and caterers list surplus food with details and pickup window.', icon: '📦', color: 'primary' },
              { step: '02', title: 'Match', desc: 'Our engine finds the nearest, most reliable NGO and notifies them instantly.', icon: '🔗', color: 'amber' },
              { step: '03', title: 'Deliver', desc: 'NGO picks up safely, delivers to communities, and logs the impact.', icon: '🚚', color: 'emerald' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">Step {item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-base text-gray-500 mt-3 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">Built for Real Operations</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: '📍', title: 'Geo-Matching', desc: 'Automatically finds the closest available NGO using live location data.' },
              { icon: '⏱️', title: 'Expiry Tracking', desc: 'Real-time countdown timers ensure food is picked up before it expires.' },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Push and in-app alerts the moment a new donation matches your area.' },
              { icon: '🔐', title: 'OTP Verification', desc: 'Secure handoff with one-time codes to confirm every pickup.' },
              { icon: '📊', title: 'Impact Analytics', desc: 'Track meals saved, CO2 reduced, and your contribution to the community.' },
              { icon: '⭐', title: 'Reliability Scores', desc: 'NGO trust system based on delivery history, speed, and consistency.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-5 p-6 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────── */}
      <section className="py-24 lg:py-32 bg-primary-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Ready to make a difference?
          </motion.h2>
          <motion.p
            className="mt-5 text-lg text-white/80 max-w-lg mx-auto leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Join hundreds of donors and NGOs already using FoodBridge to fight food waste and feed communities.
          </motion.p>
          <motion.div
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
          >
            <Link to="/register" className="px-10 py-4 bg-white text-primary-700 rounded-xl text-base font-bold hover:bg-gray-50 transition shadow-lg">
              Get Started Free
            </Link>
            <Link to="/login" className="px-10 py-4 text-white border border-white/30 rounded-xl text-base font-semibold hover:bg-white/10 transition">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🍃</span>
            <span className="font-bold text-sm">FoodBridge</span>
          </div>
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} FoodBridge — Built to fight food waste.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer transition">Privacy</span>
            <span className="hover:text-gray-300 cursor-pointer transition">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
