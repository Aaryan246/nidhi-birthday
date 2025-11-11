import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "emailjs-com";

export default function LoveyBirthdaySite({ recipient = "Nidhi" }) {
  // small dataset for gallery and balloon messages
  const photos = [
    "pic-1.jpg",
    "pic-2.jpg",
    "pic-4.jpg"
  ];

  const balloonWishes = [
    "May your day be full of giggles! 🎉",  
    "More cake, less worries 🍰",
    "You are loved today and always ❤️",
    "Big hugs & tiny surprises 🤗",
    "May all your dreams twinkle ✨",
  ];

  // state
  const [stage, setStage] = useState("landing"); // landing | message | gallery | interact | end
  const [typingIndex, setTypingIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const messages = [
    `Happy Birthday, ${recipient}! 🎂`,
    `Wishing you a sky full of wishes and a heart full of love. 💖`,
    `You make life sweeter — today we celebrate YOU! 🌸`,
  ];

  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const [popped, setPopped] = useState([]); // popped balloon indexes
  const [floatingWishes, setFloatingWishes] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const [candleBlown, setCandleBlown] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinOpen, setSpinOpen] = useState(false);

  // typing animation for messages
  useEffect(() => {
    setTyped("");
    let idx = 0;
    let charIdx = 0;
    const t = setInterval(() => {
      if (idx >= messages.length) {
        clearInterval(t);
        return;
      }
      const current = messages[idx];
      if (charIdx <= current.length) {
        setTyped(current.slice(0, charIdx));
        charIdx++;
      } else {
        // pause then next message
        idx++;
        charIdx = 0;
      }
    }, 45);
    return () => clearInterval(t);
  }, [typingIndex]);

  // music control
  useEffect(() => {
    if (!audioRef.current) return;
    if (musicOn) audioRef.current.play();
    else audioRef.current.pause();
  }, [musicOn]);

  // confetti simple canvas implementation
  const confettiRef = useRef(null);
  useEffect(() => {
    if (!showConfetti) return;
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const pieces = [];
    for (let i = 0; i < 150; i++)
      pieces.push({
        x: Math.random() * w,
        // start above the viewport for a natural fall
        y: Math.random() * -h,
        r: Math.random() * 6 + 4,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 1,
        c: `hsl(${Math.random() * 360},70%,60%)`,
      });
    let raf;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        // only draw while inside (or slightly beyond) viewport
        if (p.y <= h + 40) {
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.r, p.r, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // NOTE: do NOT reset p.y back to top — let pieces fall off-screen
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
    const t = setTimeout(() => {
      // stop drawing after the timeout — this will trigger cleanup
      setShowConfetti(false);
    }, 5000);
    return () => {
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
      // clear canvas so leftover pixels don't remain visible
      try {
        ctx.clearRect(0, 0, w, h);
      } catch (e) {
        /* ignore if context lost */
      }
    };
  }, [showConfetti]);

  // helper - pop balloon
  function popBalloon(i) {
    if (popped.includes(i)) return;
    setPopped((prev) => [...prev, i]);
    const wish = balloonWishes[i % balloonWishes.length];
    setFloatingWishes((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text: wish },
    ]);
  }

  // handle make a wish (floating up)
  function makeWish(text) {
    if (!text) return;
    setFloatingWishes((prev) => [...prev, { id: Date.now(), text }]);
  }

  const sendWishEmail = (wishText) => {
  emailjs
    .send(
      "service_y78xuzt",      // e.g. service_123abc
      "template_pwqn2ph",     // e.g. template_456xyz
      {
        wish: wishText,
      },
      "ongoVI4FRHR41xtmV"       // e.g. Tz89KxWxyz
    )
    .then(
      (response) => {
        console.log("✅ Email sent!", response.status, response.text);
        alert("Wish sent successfully! 💌");
      },
      (err) => {
        console.error("❌ Failed to send email:", err);
        alert("Oops! Could not send your wish.");
      }
    );
};

  // simple CSS heart background elements
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 relative overflow-hidden font-sans">
      {/* confetti canvas */}
      <canvas
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-40"
      />

      {/* audio (gentle) - replace src with your track in public folder */}
      <audio ref={audioRef} loop src="/song.mp3" />

      {/* floating hearts */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute opacity-30 animate-float`}
            style={{
              left: `${10 + i * 14}%`,
              top: `${8 + i * 10}%`,
              fontSize: `${18 + i * 6}px`,
            }}
          >
            💗
          </div>
        ))}
      </div>

      {/* header controls */}
      <header className="flex justify-between items-center p-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-wide">
          A Sky Full of Wishes
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMusicOn((m) => !m)}
            className="px-3 py-1 bg-white/80 rounded-full shadow"
          >
            {musicOn ? "🔊 Music On" : "🔈 Music Off"}
          </button>
          <button
            onClick={() => setStage("landing")}
            className="px-3 py-1 bg-white/80 rounded-full shadow"
          >
            Home
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* center main content vertically and horizontally */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <AnimatePresence mode="wait">
          {stage === "landing" && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key="landing"
              className="bg-white/60 rounded-2xl p-8 shadow-lg text-center"
            >
              <motion.h2
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="text-4xl font-extrabold mb-2"
              >
                Happy Birthday, {recipient} 🎈
              </motion.h2>
              <p className="mb-6 text-gray-700">
                Click the big button below to open your surprise 💝
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setStage("message");
                  setTyped("");
                  setTypingIndex((t) => t + 1);
                }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-pink-300 hover:bg-pink-400 rounded-full text-white font-semibold shadow-lg"
              >
                Open Your Surprise 🎀
              </motion.button>

              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setStage("gallery")}
                  className="px-4 py-2 bg-white rounded-full shadow"
                >
                  Memory Gallery
                </button>
                <button
                  onClick={() => setStage("interact")}
                  className="px-4 py-2 bg-white rounded-full shadow"
                >
                  Play & Wishes
                </button>
              </div>
            </motion.section>
          )}

          {stage === "message" && (
            <motion.section
              key="message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/60 rounded-2xl p-8 shadow-lg text-center"
            >
              <h2 className="text-3xl font-bold mb-2">
                A Note For {recipient} 💌
              </h2>
              <div className="min-h-[120px] flex items-center justify-center">
                <motion.p
                  className="text-xl text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {typed}
                </motion.p>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setStage("end");
                    setShowConfetti(true);
                  }}
                  className="px-4 py-2 bg-rose-300 rounded-full text-white"
                >
                  Make a Wish ✨
                </button>
                <button
                  onClick={() => setStage("gallery")}
                  className="px-4 py-2 bg-white rounded-full"
                >
                  Open Memories
                </button>
                <button
                  onClick={() => setStage("interact")}
                  className="px-4 py-2 bg-white rounded-full"
                >
                  Play
                </button>
              </div>
            </motion.section>
          )}

          {stage === "gallery" && (
            <motion.section
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/60 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Memory Gallery 📸</h3>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    onClick={() => {
                      setCurrentPhoto(i);
                      setGalleryOpen(true);
                    }}
                    key={i}
                    className="bg-white rounded-lg overflow-hidden shadow cursor-pointer"
                  >
                    <img
                      src={p}
                      alt={`photo-${i}`}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-2 text-sm">Our fav moment #{i + 1}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex gap-3 justify-end">
                <button
                  onClick={() => setStage("landing")}
                  className="px-3 py-1 bg-white rounded"
                >
                  Back
                </button>
              </div>

              <AnimatePresence>
                {galleryOpen && (
                  <motion.div
                    key="modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      className="bg-white rounded-2xl p-4 max-w-3xl w-11/12"
                    >
                      <img
                        src={photos[currentPhoto]}
                        className="w-full h-180 object-cover rounded-lg"
                      />
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm">
                          Caption: a sweet memory 💞
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setGalleryOpen(false)}
                            className="px-3 py-1 bg-rose-100 rounded"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {stage === "interact" && (
            <motion.section
              key="interact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/60 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-3">
                Play & Interactive Fun 🎈
              </h3>

              {/* Balloons */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      onClick={() => popBalloon(i)}
                      className={`w-20 h-28 rounded-t-full rounded-b-md flex items-end justify-center cursor-pointer transform transition-all ${
                        popped.includes(i)
                          ? "scale-75 opacity-30"
                          : "hover:scale-105"
                      }`}
                      style={{
                        background: `linear-gradient(180deg, #fbc2eb, #a6c1ee)`,
                      }}
                    >
                      {!popped.includes(i) && <div className="mb-2">🎈</div>}
                    </div>
                    <div className="mt-2 text-xs">Pop me</div>
                  </div>
                ))}
              </div>

              {/* Spin wheel simplified */}
              <div className="flex gap-4 items-center mb-4">
                {/* Candle blow */}
                <div className="flex-1 bg-white rounded p-4 shadow">
                  <div className="text-sm mb-2">Blow the Candle (click) 🕯️</div>
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 bg-yellow-50 rounded-lg flex items-end justify-center p-2">
                      <div
                        className={`w-10 h-12 bg-white rounded-t-md relative`}
                      >
                        {!candleBlown && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl animate-flicker">
                            🔥
                          </div>
                        )}
                        {candleBlown && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl opacity-0">
                            {" "}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => setCandleBlown(true)}
                        className="px-3 py-1 bg-pink-200 rounded"
                      >
                        Blow!
                      </button>
                      <div className="text-xs mt-2">
                        or click here to make a wish
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* wish input */}
              <WishMaker
                onWish={(t) => {
                  makeWish(t);
                  setShowConfetti(true);
                  sendWishEmail(t);
                }}
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setStage("landing")}
                  className="px-3 py-1 bg-white rounded"
                >
                  Back
                </button>
              </div>
            </motion.section>
          )}

          {stage === "end" && (
            <motion.section
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/60 rounded-2xl p-8 shadow-lg text-center"
            >
              <h2 className="text-3xl font-bold">Make a Wish ✨</h2>
              <p className="mt-3 text-gray-700">
                Type a short wish below and watch it float away.
              </p>
              <div className="mt-4">
                <WishMaker
                  onWish={(t) => {
                    makeWish(t);
                    setShowConfetti(true);
                    sendWishEmail(t);
                  }}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setStage("landing")}
                  className="px-4 py-2 bg-rose-300 text-white rounded"
                >
                  Done
                </button>
              </div>
            </motion.section>
          )}
          </AnimatePresence>
        </div>

        {/* Floating wishes animation layer */}
        <div className="fixed bottom-6 left-6 z-30 flex flex-col gap-2">
          {floatingWishes.map((f, idx) => (
            <FloatingWish
              key={f.id}
              text={f.text}
              onDone={() =>
                setFloatingWishes((prev) => prev.filter((x) => x.id !== f.id))
              }
            />
          ))}
        </div>
      </main>

      
      {/* small footer */}
      <footer className="text-center p-6 text-sm text-gray-500">
        Made with ❤️ — Aaryan
      </footer>
    </div>
  );
}

// WishMaker subcomponent
function WishMaker({ onWish }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2 items-center">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Type your wish..."
        className="px-3 py-2 rounded-lg shadow text-sm flex-1"
      />
      <button
        onClick={() => {
          onWish(val);
          setVal("");
        }}
        className="px-3 py-2 bg-pink-300 rounded-lg text-white"
      >
        Send
      </button>
    </div>
  );
}

// Floating wish - animates upward and fades
function FloatingWish({ text, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      onDone();
    }, 4200);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: -120 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 4 }}
      className="bg-white/90 px-3 py-2 rounded-lg shadow"
    >
      {text}
    </motion.div>
  );
}
