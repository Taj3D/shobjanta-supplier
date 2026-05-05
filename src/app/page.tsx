'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Facebook Pixel type declaration
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

// ── Constants ──
const PRICE_PER_JAR = 1050;
const JAR_WEIGHT_KG = 3;
const SHIPPING_INSIDE_JR = 70;
const SHIPPING_OUTSIDE_JR = 130;
const FREE_SHIPPING_MIN_JARS = 2;
const PHONE = '+880 1973-135466';
const WA_NUMBER = '8801973135466';
const FB_PAGE = 'https://www.facebook.com/ShobjantaSupplier';
const WEBSITE_URL = 'https://shobjanta-supplier.vercel.app';

const PRODUCT_IMG = 'https://i.ibb.co/Y4WjrpLD/Whats-App-Image-2026-04-30-at-23-53-16.jpg';
const LOGO_IMG = 'https://i.ibb.co/W4RwVdqy/image-cabe2751.png';
const RICE_GRAINS_IMG = 'https://i.ibb.co/DH8SrkHS/Gemini-Generated-Image-xk3ejaxk3ejaxk3e.png';

// ── Reviews ──
const reviews = [
  {
    name: 'রহিমা বেগম',
    location: 'যশোর সদর',
    rating: 5,
    text: 'প্রথমবার জারের বাসমতি অর্ডার করলাম। চালের ঘ্রাণ এত কড়া যে রান্নার সময় পুরো বাসায় সুগন্ধ ছড়িয়ে পড়ে। জারের বাইরে থেকেই লম্বা দানা দেখা যাচ্ছে। আবার অর্ডার করব!',
  },
  {
    name: 'করিম মিয়া',
    location: 'যশোর কোতোয়ালী',
    rating: 5,
    text: 'খোলা বাজারের চেয়েও সস্তা এবং কোয়ালিটি অনেক ভালো। এয়ারটাইট জারে সিল করা থাকায় পোকা ধরে না। ২ মাস পরেও চাল একদম ফ্রেশ! সবাইকে রেকমেন্ড করি।',
  },
  {
    name: 'নাসরিন আক্তার',
    location: 'ঝিনাইদহ',
    rating: 5,
    text: 'পোলাও রান্না করেছি — হোটেলের মতো একদম লম্বা লম্বা দানা! ডেলিভারিও খুব দ্রুত পেয়েছি। ক্যাশ অন ডেলিভারি থাকায় ঝামেলা ছিল না। ধন্যবাদ সবজান্তা সাপ্লাইয়ার!',
  },
];

// ── Selling Points ──
const sellingPoints = [
  { icon: '🏆', text: 'যশোরে প্রথম জারের বাসমতি' },
  { icon: '🔒', text: 'ফুডগ্রেড এয়ারটাইট জারে সিল করা' },
  { icon: '📏', text: '১০০% লম্বা দানা — জারের বাইরে থেকেই দেখা যায়' },
  { icon: '⏰', text: '৩ কেজির জার — ৬ মাস টেনশন ফ্রি' },
  { icon: '🌿', text: '১ বছরের পুরনো চাল — ঘ্রাণ এত কড়া!' },
  { icon: '🎁', text: 'জার ফ্রি — চাল শেষ হলে ডাল, চিনি রাখতে পারবেন' },
  { icon: '💰', text: 'খোলা বাজারের ভেজাল বাসমতির চেয়েও সস্তা' },
  { icon: '🇵🇰', text: 'সরাসরি পাকিস্তান থেকে আমদানিকৃত' },
];

// ── Helper: get Dhaka midnight ──
function getDhakaMidnight(): number {
  const now = new Date();
  // Get current hour/minute/second in Dhaka timezone directly
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const h = parseInt(parts.find(p => p.type === 'hour')!.value);
  const m = parseInt(parts.find(p => p.type === 'minute')!.value);
  const s = parseInt(parts.find(p => p.type === 'second')!.value);
  // Milliseconds elapsed in the current Dhaka day
  const msElapsed = ((h * 60 + m) * 60 + s) * 1000;
  // Remaining ms until midnight
  return (24 * 60 * 60 * 1000) - msElapsed;
}

// ── Helper: format countdown ──
function formatCountdown(ms: number) {
  if (ms <= 0) return { hours: '০০', minutes: '০০', seconds: '০০' };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const toBn = (n: number) => n.toString().padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
  return { hours: toBn(h), minutes: toBn(m), seconds: toBn(s) };
}

// ── Helper: price to Bengali ──
function toBnNum(n: number): string {
  return n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
}

// ── Star Component ──
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'star-gold' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Main Page Component ──
export default function Home() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formHoneypot, setFormHoneypot] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [shippingOption, setShippingOption] = useState<'inside' | 'outside'>('inside');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  const [productVisible, setProductVisible] = useState(false);
  const orderFormRef = useRef<HTMLDivElement>(null);

  // ── Countdown timer (client-only to avoid hydration mismatch) ──
  useEffect(() => {
    const tick = () => setCountdown(getDhakaMidnight());
    tick(); // set initial value immediately
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Exit intent popup ──
  useEffect(() => {
    if (exitPopupShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitPopupShown) {
        setShowExitPopup(true);
        setExitPopupShown(true);
      }
    };

    document.addEventListener('mouseout', handleMouseLeave);
    return () => document.removeEventListener('mouseout', handleMouseLeave);
  }, [exitPopupShown]);

  // ── Intersection Observer for product view ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !productVisible) {
            setProductVisible(true);
            if (typeof window !== 'undefined' && window.fbq) {
              window.fbq('track', 'ViewContent', {
                content_name: 'পাকিস্তানি বাসমতি চাল জার',
                content_category: 'Food & Groceries',
                content_ids: ['basmati-jar-3kg'],
                value: PRICE_PER_JAR,
                currency: 'BDT',
              });
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const productCard = document.getElementById('product-card');
    if (productCard) observer.observe(productCard);

    return () => observer.disconnect();
  }, [productVisible]);

  // ── Scroll to order form ──
  const scrollToOrder = useCallback(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: 'পাকিস্তানি বাসমতি চাল জার',
        content_category: 'Food & Groceries',
        value: PRICE_PER_JAR,
        currency: 'BDT',
      });
    }
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── Calculate totals ──
  const getShipping = (qty: number, option: 'inside' | 'outside') => {
    if (qty >= FREE_SHIPPING_MIN_JARS) return 0;
    return option === 'inside' ? SHIPPING_INSIDE_JR : SHIPPING_OUTSIDE_JR;
  };

    const shippingCost = getShipping(formQuantity, shippingOption);
  const subtotal = formQuantity * PRICE_PER_JAR;
  const total = subtotal + shippingCost;

  // ── Form validation ──
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formName.trim().length < 2) errors.name = 'নাম কমপক্ষে ২ অক্ষরের হতে হবে';
    if (!/^01[3-9]\d{8}$/.test(formPhone)) errors.phone = 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)';
    if (formAddress.trim().length < 10) errors.address = 'সম্পূর্ণ ঠিকানা দিন';
    if (formQuantity < 1) errors.quantity = 'কমপক্ষে ১টি জার অর্ডার করুন';
    if (formHoneypot) {
      // Bot detected — show fake success to deceive bots
      setSubmitSuccess(true);
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Form submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Track FB Pixel events
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'পাকিস্তানি বাসমতি চাল জার',
          num_items: formQuantity,
          value: total,
          currency: 'BDT',
        });
        window.fbq('track', 'Lead', {
          content_name: 'পাকিস্তানি বাসমতি চাল জার',
          value: total,
          currency: 'BDT',
        });
        window.fbq('track', 'Contact', {
          content_name: 'পাকিস্তানি বাসমতি চাল জার',
        });
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          address: formAddress,
          quantity: formQuantity,
          shipping: shippingCost,
          total,
          honeypot: formHoneypot,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Purchase', {
            content_name: 'পাকিস্তানি বাসমতি চাল জার',
            num_items: formQuantity,
            value: total,
            currency: 'BDT',
          });
        }
        // Open WhatsApp with order details
        const msg = encodeURIComponent(
          `🛒 নতুন অর্ডার\n` +
          `━━━━━━━━━━━━━━━\n` +
          `👤 নাম: ${formName}\n` +
          `📱 ফোন: ${formPhone}\n` +
          `📍 ঠিকানা: ${formAddress}\n` +
          `📦 পরিমাণ: ${formQuantity}টি জার (${formQuantity * JAR_WEIGHT_KG} কেজি)\n` +
          `💰 মূল্য: ৳${toBnNum(subtotal)}\n` +
          `🚚 ডেলিভারি: ${shippingCost === 0 ? 'ফ্রি' : '৳' + toBnNum(shippingCost)}\n` +
          `━━━━━━━━━━━━━━━\n` +
          `✅ মোট: ৳${toBnNum(total)}\n` +
          `💳 পেমেন্ট: ক্যাশ অন ডেলিভারি`
        );
        window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
      } else {
        const fieldErrors: Record<string, string> = {};
        data.errors?.forEach((err: { field: string; message: string }) => {
          fieldErrors[err.field] = err.message;
        });
        setFormErrors(fieldErrors);
      }
    } catch {
      setFormErrors({ server: 'নেটওয়ার্কে সমস্যা হয়েছে, আবার চেষ্টা করুন' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { hours, minutes, seconds } = formatCountdown(countdown ?? 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffaf5' }}>
      {/* ═══════ 1. TOP BAR ═══════ */}
      <div className="bg-[#1e293b] text-white text-xs sm:text-sm py-2 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a href={`tel:${PHONE}`} className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {PHONE}
            </a>
            <a href="mailto:conceptbd.net@gmail.com" className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              conceptbd.net@gmail.com
            </a>
          </div>
          <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            Website
          </a>
          <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </a>
        </div>
      </div>

      {/* ═══════ 2. HEADER ═══════ */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <img src={LOGO_IMG} alt="সবজান্তা সাপ্লাইয়ার" className="w-full h-full object-contain rounded-full" draggable={false} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#1e293b]">সবজান্তা সাপ্লাইয়ার</h1>
              <p className="text-[10px] sm:text-xs text-[#64748b]">FinTaxEdgeTV</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#dcfce7] text-[#16a34a] px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            ক্যাশ অন ডেলিভারি
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ═══════ 3. COUNTDOWN TIMER ═══════ */}
        <div className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white py-3 px-4 countdown-pulse">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm sm:text-base font-bold mb-2">🔥 অফার শেষ আজ রাত ১২টায়!</p>
            <div className="flex justify-center gap-2 sm:gap-4">
              {[
                { label: 'ঘণ্টা', value: hours },
                { label: 'মিনিট', value: minutes },
                { label: 'সেকেন্ড', value: seconds },
              ].map((item) => (
                <div key={item.label} className="bg-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2 min-w-[60px] sm:min-w-[80px]">
                  <div className="text-xl sm:text-3xl font-bold font-mono">{item.value}</div>
                  <div className="text-[10px] sm:text-xs opacity-90">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ 4. HERO SECTION ═══════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src={RICE_GRAINS_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" draggable={false} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 text-center">
            <div className="inline-block bg-[#fef3c7] text-[#92400e] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4">
              🌾 পাকিস্তান থেকে সরাসরি আমদানিকৃত
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1e293b] leading-tight mb-4">
              সরাসরি পাকিস্তান থেকে
              <br />
              <span className="text-[#16a34a]">১০০% লম্বা দানা বাসমতি চাল</span>
              <br />
              এখন আপনার ঘরে
            </h2>
            <p className="text-sm sm:text-lg text-[#475569] max-w-2xl mx-auto mb-6 leading-relaxed">
              বাজারের খোলা চাল কেনার ২ মাস পর ঘ্রাণ শেষ, পোকা ধরে, দানা ভেঙে যায়।
              আমাদের <strong className="text-[#1e293b]">১ বছরের পুরনো, ফুডগ্রেড এয়ারটাইট জারে</strong> সিল করা চাল —
              খুললেই ঘ্রাণ ছড়িয়ে পড়বে, <strong className="text-[#16a34a]">৬ মাস পর্যন্ত টেনশন-ফ্রি!</strong>
            </p>
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              এখনই অর্ডার করুন
            </button>
          </div>
        </section>

        {/* ═══════ 5. OFFER BANNER ═══════ */}
        <section className="bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white py-6 sm:py-8 px-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm sm:text-base opacity-90 mb-1">৳৩৫০/কেজি মাত্র!</p>
              <h3 className="text-3xl sm:text-5xl font-extrabold">৩ কেজির জার মাত্র ৳১০৫০</h3>
              <p className="text-sm sm:text-base mt-2 opacity-90">২ জার নিলে <span className="font-bold underline">ফ্রি ডেলিভারি!</span></p>
            </div>
            <button
              onClick={scrollToOrder}
              className="bg-white text-[#16a34a] font-bold px-6 py-3 rounded-full hover:bg-[#f0fdf4] transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              অর্ডার করুন →
            </button>
          </div>
        </section>

        {/* ═══════ 6. SELLING POINTS ═══════ */}
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1e293b] mb-6">
            কেন সবজান্তার বাসমতি সেরা?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {sellingPoints.map((point, i) => (
              <div key={i} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow border border-[#e2e8f0]">
                <div className="text-2xl sm:text-3xl mb-2">{point.icon}</div>
                <p className="text-xs sm:text-sm font-medium text-[#1e293b]">{point.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ 7. PRODUCT CARD ═══════ */}
        <section id="product-card" className="max-w-5xl mx-auto px-4 pb-8 sm:pb-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e2e8f0] max-w-2xl mx-auto">
            {/* Product Image */}
            <div className="relative aspect-square max-h-[350px] sm:max-h-[400px] bg-gradient-to-b from-[#f0fdf4] to-white">
              <img src={PRODUCT_IMG} alt="পাকিস্তানি বাসমতি চাল জার" className="absolute inset-0 w-full h-full object-contain p-4" draggable={false} fetchPriority="high" />
              {/* Price Badge */}
              <div className="absolute top-4 left-4 bg-[#dc2626] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                ৳{toBnNum(PRICE_PER_JAR)}
              </div>
              {/* Weight Badge */}
              <div className="absolute top-4 right-4 bg-[#16a34a] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                {toBnNum(JAR_WEIGHT_KG)} কেজি জার
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e293b] mb-2">
                পাকিস্তানি বাসমতি চাল — এয়ারটাইট জার
              </h3>
              <p className="text-sm text-[#64748b] mb-4">১০০% লম্বা দানা | ১ বছরের পুরনো চাল | ফুডগ্রেড জারে সিল করা</p>

              {/* Price Section */}
              <div className="flex items-end gap-3 mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#dc2626]">৳{toBnNum(PRICE_PER_JAR)}</span>
                <span className="text-lg text-[#94a3b8] line-through mb-1">৳{toBnNum(1500)}</span>
                <span className="bg-[#fef3c7] text-[#92400e] text-xs px-2 py-0.5 rounded-full font-semibold mb-1">৩০% ছাড়</span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {[
                  '✅ যশোরে প্রথম জারের বাসমতি',
                  '✅ ৬ মাস টেনশন ফ্রি',
                  '✅ জার ফ্রি — পরে ব্যবহার করুন',
                  '✅ খোলা বাজারের চেয়ে সস্তা',
                ].map((feat, i) => (
                  <p key={i} className="text-sm text-[#1e293b]">{feat}</p>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-semibold text-[#475569]">পরিমাণ:</span>
                <div className="flex items-center gap-0 border-2 border-[#e2e8f0] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-lg font-bold text-[#475569] hover:bg-[#f1f5f9] transition-colors active:bg-[#e2e8f0]"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-lg font-bold text-[#1e293b] min-w-[40px] text-center">
                    {toBnNum(quantity)}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="px-4 py-2 text-lg font-bold text-[#475569] hover:bg-[#f1f5f9] transition-colors active:bg-[#e2e8f0]"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-[#64748b]">জার ({toBnNum(quantity * JAR_WEIGHT_KG)} কেজি)</span>
              </div>

              {/* Shipping Info */}
              <div className="bg-[#f8fafc] rounded-lg p-3 mb-4 text-xs sm:text-sm text-[#475569]">
                <p>🚚 যশোর ও আশেপাশে: ৳{toBnNum(SHIPPING_INSIDE_JR)} | সারা বাংলাদেশ: ৳{toBnNum(SHIPPING_OUTSIDE_JR)}</p>
                <p className="text-[#16a34a] font-semibold mt-1">🎉 ২ জার নিলে ফ্রি ডেলিভারি!</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setFormQuantity(quantity);
                    scrollToOrder();
                  }}
                  className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 sm:py-4 rounded-xl text-base sm:text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  🛒 অর্ডার করুন
                </button>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('আসসালামু আলাইকুম। বাসমতি চালের জার সম্পর্কে জানতে চাই।')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 sm:py-4 rounded-xl text-sm sm:text-base transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white font-semibold py-3 sm:py-4 rounded-xl text-sm sm:text-base transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  কল করুন
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 7.5 PRODUCT GALLERY ═══════ */}
        <section className="max-w-5xl mx-auto px-4 pb-8 sm:pb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1e293b] mb-2">
            আমাদের বাসমতি চাল কেমন?
          </h3>
          <p className="text-center text-sm text-[#64748b] mb-6 sm:mb-8">কাছ থেকে দেখুন — ১০০% লম্বা দানা, ১ বছরের পুরনো</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm bg-white">
              <div className="relative aspect-square">
                <img src={PRODUCT_IMG} alt="পাকিস্তানি বাসমতি চাল জার — প্যাকেজিং" className="absolute inset-0 w-full h-full object-contain p-3" draggable={false} loading="lazy" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs sm:text-sm font-semibold">🫙 এয়ারটাইট জারে সিল করা — ৩ কেজি</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm bg-white">
              <div className="relative aspect-square">
                <img src={RICE_GRAINS_IMG} alt="পাকিস্তানি বাসমতি চালের দানা — কাছ থেকে দেখুন" className="absolute inset-0 w-full h-full object-cover" draggable={false} loading="lazy" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs sm:text-sm font-semibold">🍚 ১০০% লম্বা দানা — হোটেল কোয়ালিটি</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 8. CUSTOMER REVIEWS ═══════ */}
        <section className="bg-white py-8 sm:py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1e293b] mb-2">
              ক্রেতাদের মতামত
            </h3>
            <p className="text-center text-sm text-[#64748b] mb-6 sm:mb-8">আমাদের সন্তুষ্ট গ্রাহকদের কথা</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review, i) => (
                <div key={i} className="bg-[#fffaf5] rounded-xl p-4 sm:p-5 shadow-sm border border-[#e2e8f0] hover:shadow-md transition-shadow">
                  <Stars rating={review.rating} />
                  <p className="text-sm text-[#1e293b] mt-3 mb-3 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-xs font-bold">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1e293b]">{review.name}</p>
                      <p className="text-xs text-[#94a3b8]">{review.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 8.5 FAQ + TRUST ═══════ */}
        <section className="max-w-5xl mx-auto px-4 pb-8 sm:pb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1e293b] mb-6">
            সচরাচর জিজ্ঞাসা
          </h3>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { q: 'চালটি কি আসলেই পাকিস্তান থেকে আসা?', a: 'হ্যাঁ, আমরা সরাসরি পাকিস্তান থেকে ১ বছরের পুরনো বাসমতি চাল আমদানি করি। প্রতিটি জারে সিল করা থাকে।' },
              { q: 'ডেলিভারি কতদিনে পাব?', a: 'যশোর ও আশেপাশে ১-২ দিনে, সারা বাংলাদেশে ২-৫ দিনের মধ্যে পৌঁছে যাবে।' },
              { q: 'পেমেন্ট কীভাবে করব?', a: 'ক্যাশ অন ডেলিভারি (COD) — চাল হাতে পেয়ে টাকা দেবেন। বিকাশ/নগদও সুবিধা আছে।' },
              { q: 'জারের চাল কি পোকা ধরবে না?', a: 'ফুডগ্রেড এয়ারটাইট জারে সিল করা থাকায় কমপক্ষে ৬ মাস পর্যন্ত পোকা ধরে না এবং চাল একদম ফ্রেশ থাকে।' },
              { q: 'ফেরত দেওয়ার সুবিধা আছে?', a: 'পণ্য পৌঁছানোর পর কোনো সমস্যা হলে ৭ দিনের মধ্যে ফেরত দেওয়া যাবে। তবে সিল ভাঙা জার ফেরত নেওয়া হয় না।' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-sm sm:text-base font-semibold text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-[#64748b] group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-[#475569] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="text-center p-3 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="text-2xl mb-1">🚚</div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#1e293b]">সারা বাংলাদেশে ডেলিভারি</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#1e293b]">১০০% অরিজিনাল গ্যারান্টি</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="text-2xl mb-1">💳</div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#1e293b]">ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>
        </section>

        {/* ═══════ 9. ORDER FORM ═══════ */}
        <section ref={orderFormRef} className="max-w-5xl mx-auto px-4 py-8 sm:py-12" id="order-form">
          <div className="relative bg-white rounded-2xl shadow-lg p-5 sm:p-8 max-w-xl mx-auto border border-[#e2e8f0]">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1e293b] mb-1">
              📝 অর্ডার করুন
            </h3>
            <p className="text-center text-sm text-[#64748b] mb-6">ফর্ম পূরণ করুন, আমরা দ্রুত ডেলিভারি দেব</p>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-xl font-bold text-[#16a34a] mb-2">অর্ডার সফল হয়েছে!</h4>
                <p className="text-sm text-[#475569] mb-4">
                  WhatsApp এ অর্ডার ডিটেইলস পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।
                </p>
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormName('');
                    setFormPhone('');
                    setFormAddress('');
                    setFormQuantity(1);
                    setShippingOption('inside');
                    setFormErrors({});
                  }}
                  className="text-[#16a34a] font-semibold underline text-sm"
                >
                  নতুন অর্ডার করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>
                    ভরাট করবেন না
                    <input type="text" value={formHoneypot} onChange={(e) => setFormHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#1e293b] mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="পূর্ণ নাম লিখুন"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm ${formErrors.name ? 'border-[#dc2626]' : 'border-[#e2e8f0]'} focus:border-[#16a34a] focus:outline-none transition-colors bg-[#fffaf5]`}
                  />
                  {formErrors.name && <p className="text-xs text-[#dc2626] mt-1">{formErrors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#1e293b] mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="০১XXXXXXXXX"
                    maxLength={11}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm ${formErrors.phone ? 'border-[#dc2626]' : 'border-[#e2e8f0]'} focus:border-[#16a34a] focus:outline-none transition-colors bg-[#fffaf5]`}
                  />
                  {formErrors.phone && <p className="text-xs text-[#dc2626] mt-1">{formErrors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-[#1e293b] mb-1">সম্পূর্ণ ঠিকানা *</label>
                  <textarea
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="বাসা/ফ্ল্যাট নং, রোড, এলাকা, উপজেলা, জেলা"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm resize-none ${formErrors.address ? 'border-[#dc2626]' : 'border-[#e2e8f0]'} focus:border-[#16a34a] focus:outline-none transition-colors bg-[#fffaf5]`}
                  />
                  {formErrors.address && <p className="text-xs text-[#dc2626] mt-1">{formErrors.address}</p>}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-[#1e293b] mb-1">জারের সংখ্যা *</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-0 border-2 border-[#e2e8f0] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFormQuantity((q) => Math.max(1, q - 1))}
                        className="px-4 py-2.5 text-lg font-bold text-[#475569] hover:bg-[#f1f5f9] transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2.5 text-lg font-bold text-[#1e293b] min-w-[40px] text-center">
                        {toBnNum(formQuantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormQuantity((q) => Math.min(20, q + 1))}
                        className="px-4 py-2.5 text-lg font-bold text-[#475569] hover:bg-[#f1f5f9] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-[#64748b]">জার ({toBnNum(formQuantity * JAR_WEIGHT_KG)} কেজি)</span>
                  </div>
                </div>

                {/* Shipping Option */}
                <div>
                  <label className="block text-sm font-semibold text-[#1e293b] mb-2">ডেলিভারি এলাকা *</label>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === 'inside' ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e2e8f0] bg-white'}`}>
                      <input
                        type="radio"
                        name="shipping"
                        value="inside"
                        checked={shippingOption === 'inside'}
                        onChange={() => setShippingOption('inside')}
                        className="accent-[#16a34a]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1e293b]">যশোর ও আশেপাশে</p>
                        <p className="text-xs text-[#64748b]">৳{toBnNum(SHIPPING_INSIDE_JR)}</p>
                      </div>
                    </label>
                    <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === 'outside' ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e2e8f0] bg-white'}`}>
                      <input
                        type="radio"
                        name="shipping"
                        value="outside"
                        checked={shippingOption === 'outside'}
                        onChange={() => setShippingOption('outside')}
                        className="accent-[#16a34a]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1e293b]">সারা বাংলাদেশ</p>
                        <p className="text-xs text-[#64748b]">৳{toBnNum(SHIPPING_OUTSIDE_JR)}</p>
                      </div>
                    </label>
                  </div>
                  {formQuantity >= FREE_SHIPPING_MIN_JARS && (
                    <p className="text-xs text-[#16a34a] font-semibold mt-2">🎉 ২+ জার অর্ডারে ডেলিভারি ফ্রি!</p>
                  )}
                </div>

                {/* Total Preview */}
                <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748b]">চালের মূল্য ({toBnNum(formQuantity)} × ৳{toBnNum(PRICE_PER_JAR)})</span>
                    <span className="font-semibold text-[#1e293b]">৳{toBnNum(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748b]">ডেলিভারি চার্জ</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-[#16a34a]' : 'text-[#1e293b]'}`}>
                      {shippingCost === 0 ? 'ফ্রি!' : '৳' + toBnNum(shippingCost)}
                    </span>
                  </div>
                  <div className="border-t-2 border-[#e2e8f0] pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-[#1e293b]">মোট</span>
                    <span className="text-xl font-extrabold text-[#dc2626]">৳{toBnNum(total)}</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-2 text-center">💳 পেমেন্ট: ক্যাশ অন ডেলিভারি (COD)</p>
                </div>

                {/* Server Error */}
                {formErrors.server && (
                  <p className="text-sm text-[#dc2626] text-center bg-[#fef2f2] p-3 rounded-xl">{formErrors.server}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      প্রসেসিং...
                    </span>
                  ) : (
                    '✅ অর্ডার নিশ্চিত করুন'
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ═══════ 10. CONTACT SECTION ═══════ */}
        <section className="bg-[#1e293b] text-white py-8 sm:py-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-6">যোগাযোগ করুন</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
              <a href={`tel:${PHONE}`} className="flex items-center justify-center gap-2 text-sm sm:text-base hover:text-[#f59e0b] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {PHONE}
              </a>
              <a href="mailto:conceptbd.net@gmail.com" className="flex items-center justify-center gap-2 text-sm sm:text-base hover:text-[#f59e0b] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                conceptbd.net@gmail.com
              </a>
              <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm sm:text-base hover:text-[#f59e0b] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                shobjanta-supplier.vercel.app
              </a>
              <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm sm:text-base hover:text-[#f59e0b] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook Page
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════ 11. FOOTER ═══════ */}
      <footer className="bg-[#0f172a] text-white py-4 px-4 text-center pb-20 sm:pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative w-8 h-8">
              <img src={LOGO_IMG} alt="সবজান্তা সাপ্লাইয়ার" className="w-full h-full object-contain rounded-full" draggable={false} />
            </div>
            <span className="font-bold text-sm text-white">সবজান্তা সাপ্লাইয়ার</span>
          </div>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            © {new Date().getFullYear()} সবজান্তা সাপ্লাইয়ার | FinTaxEdgeTV | সর্বস্বত্ব সংরক্ষিত
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href={`tel:${PHONE}`} className="text-[#94a3b8] hover:text-[#f59e0b] transition-colors text-xs">{PHONE}</a>
            <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] hover:text-[#f59e0b] transition-colors text-xs">shobjanta-supplier.vercel.app</a>
            <a href="mailto:conceptbd.net@gmail.com" className="text-[#94a3b8] hover:text-[#f59e0b] transition-colors text-xs">conceptbd.net@gmail.com</a>
          </div>
        </div>
      </footer>

      {/* ═══════ 12. FLOATING WHATSAPP BUTTON ═══════ */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('আসসালামু আলাইকুম। বাসমতি চালের জার সম্পর্কে জানতে চাই।')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all float-bounce"
        aria-label="WhatsApp এ যোগাযোগ করুন"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      {/* ═══════ 13. STICKY BOTTOM CTA ═══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#f59e0b] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-[#1e293b]">পাকিস্তানি বাসমতি চাল</p>
            <p className="text-xs text-[#64748b]">৩ কেজি মাত্র ৳{toBnNum(PRICE_PER_JAR)}</p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-6 py-3 rounded-full text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            🛒 আজই অর্ডার করুন
          </button>
        </div>
      </div>

      {/* ═══════ 14. EXIT INTENT POPUP ═══════ */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExitPopup(false)} />
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl fade-in-up">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] transition-colors"
              aria-label="বন্ধ করুন"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="text-5xl mb-4">🎁</div>
              <h4 className="text-xl font-bold text-[#1e293b] mb-2">একটু দাঁড়ান!</h4>
              <p className="text-sm text-[#475569] mb-2">
                আজই অর্ডার করুন এবং পান
              </p>
              <p className="text-2xl font-extrabold text-[#dc2626] mb-4">
                ২ জার নিলে ফ্রি ডেলিভারি!
              </p>
              <p className="text-xs text-[#64748b] mb-6">
                পাকিস্তানি বাসমতি চাল ৳১০৫০/জার — সীমিত সময়ের অফার
              </p>
              <button
                onClick={() => {
                  setShowExitPopup(false);
                  scrollToOrder();
                }}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-xl text-base shadow-md transition-all transform hover:scale-[1.02] active:scale-95"
              >
                🔥 এখনই অর্ডার করুন
              </button>
              <button
                onClick={() => setShowExitPopup(false)}
                className="mt-3 text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors"
              >
                না, ধন্যবাদ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
