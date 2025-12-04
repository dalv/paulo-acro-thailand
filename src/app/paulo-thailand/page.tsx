'use client';

import { useState, useMemo } from 'react';

type Session = {
  id: string;
  date: string;
  time: string;
  name: string;
  timeRange: string;
  description: string;
  prereqs: string;
  image: string;
};

const sessions: Session[] = [
  {
    id: 'jan16-afternoon',
    date: 'Jan 16',
    time: 'Friday Afternoon',
    name: 'Hard Flow',
    timeRange: '13:00 - 16:00',
    description: 'Explore challenging washing machine sequences with dynamic transitions. Focus on building stamina and precision through continuous movement patterns.',
    prereqs: 'Comfortable with basic washing machines: Ninja Star, Ballerina',
    image: '/images/hard-flow.jpg',
  },
  {
    id: 'jan16-evening',
    date: 'Jan 16',
    time: 'Friday Evening',
    name: 'Icarian Part I',
    timeRange: '17:00 - 20:00',
    description: 'Refining Icarians - become more comfortable with the foundations of timing, trust, and technique needed for safe and confident pops.',
    prereqs: 'Experience with basic straight throws (bird to bird, throne to throne)',
    image: '/images/castaway.jpg',
  },
  {
    id: 'jan17-morning',
    date: 'Jan 17',
    time: 'Saturday Morning',
    name: 'No Hand Flow',
    timeRange: '10:00 - 13:00',
    description: 'Develop hands-free sequences using the right balance and momentum. Perfect for building creativity and trust in your partnership.',
    prereqs: 'Comfortable with star, side star and basic washing machines',
    image: '/images/no-hands-flow.jpg',
  },
  {
    id: 'jan17-afternoon',
    date: 'Jan 17',
    time: 'Saturday Afternoon',
    name: 'Icarian Part II',
    timeRange: '14:30 - 17:30',
    description: 'Building on Part I, explore variations, catches, and more complicated icarians. For those ready to take their icarian work to the next level.',
    prereqs: 'Consistent strainght throws and experience with bird to throne / throne to bird',
    image: '/images/fronttuck.jpg',
  },
];

// Test session for development - controlled by NEXT_PUBLIC_SHOW_TEST_SESSION env var
const TEST_SESSION: Session = {
  id: 'test-session',
  date: 'Test',
  time: 'Dev Only',
  name: 'Test Session (1€)',
  timeRange: 'N/A',
  description: 'This is a test session for development purposes only. Price: 1 Euro.',
  prereqs: 'None',
  image: '/images/martini.jpg',
};

const SHOW_TEST_SESSION = process.env.NEXT_PUBLIC_SHOW_TEST_SESSION === 'true';
const displaySessions = SHOW_TEST_SESSION ? [...sessions, TEST_SESSION] : sessions;

// Pricing configuration
const PRICING = {
  earlyBird: {
    deadline: new Date('2026-01-02T23:59:59'),
    singleSession: 30,
    fullWeekend: 100,
  },
  regular: {
    singleSession: 35,
    fullWeekend: 120,
  },
};

const FULL_WEEKEND_SESSION_COUNT = 4;

export default function PauloThailandPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    acroRole: '',
    selectedSessions: [] as string[],
  });

  const isEarlyBird = useMemo(() => {
    return new Date() <= PRICING.earlyBird.deadline;
  }, []);

  const pricing = useMemo(() => {
    const hasTestSession = formData.selectedSessions.includes('test-session');
    const regularSessionCount = hasTestSession
      ? formData.selectedSessions.length - 1
      : formData.selectedSessions.length;
    const sessionCount = formData.selectedSessions.length;
    const isFullWeekend = regularSessionCount === FULL_WEEKEND_SESSION_COUNT;

    const referencePrice = regularSessionCount * PRICING.regular.singleSession + (hasTestSession ? 1 : 0);

    let actualPrice: number;
    let appliedDeal: string | null = null;

    if (isFullWeekend) {
      actualPrice = isEarlyBird ? PRICING.earlyBird.fullWeekend : PRICING.regular.fullWeekend;
      appliedDeal = isEarlyBird ? 'Early Bird Full Weekend' : 'Full Weekend Bundle';
    } else if (regularSessionCount > 0) {
      const perSession = isEarlyBird ? PRICING.earlyBird.singleSession : PRICING.regular.singleSession;
      actualPrice = regularSessionCount * perSession;
      if (isEarlyBird) {
        appliedDeal = 'Early Bird';
      }
    } else {
      actualPrice = 0;
    }

    // Add test session price (1 Euro)
    if (hasTestSession) {
      actualPrice += 1;
    }

    const savings = referencePrice - actualPrice;

    return {
      sessionCount,
      isFullWeekend,
      referencePrice,
      actualPrice,
      savings,
      appliedDeal,
    };
  }, [formData.selectedSessions, isEarlyBird]);

  const handleSessionToggle = (sessionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSessions: prev.selectedSessions.includes(sessionId)
        ? prev.selectedSessions.filter((id) => id !== sessionId)
        : [...prev.selectedSessions, sessionId],
    }));
  };

  const toggleExpanded = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the checkbox
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.acroRole !== '' &&
      formData.selectedSessions.length > 0
    );
  };

  const handleCheckout = async () => {
    if (!isFormValid()) {
      setError('Please fill in all fields and select at least one session');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedSessionDetails = sessions
        .filter((s) => formData.selectedSessions.includes(s.id))
        .map((s) => `${s.date} ${s.time}: ${s.name}`)
        .join(', ');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          acroRole: formData.acroRole,
          selectedSessions: formData.selectedSessions,
          sessionDetails: selectedSessionDetails,
          totalAmount: pricing.actualPrice,
          currency: 'eur',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = url;
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow w-full max-w-2xl mx-auto bg-white shadow-xl min-h-screen sm:min-h-0 sm:my-8 sm:rounded-2xl overflow-hidden">
        
        {/* Hero Header */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src="/images/banner-paulo-thailand.jpg" 
            alt="Acrobatics Workshop" 
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/70 to-emerald-900/70"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="z-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight drop-shadow-lg">
                Paulo from Portugal and Asti
              </h1>
              <p className="text-teal-100 font-medium drop-shadow">Intensive Acro Training</p>
            </div>
          </div>
        </div>
           
        <div className="p-6 sm:p-8">
          {/* Venue Info */}
          <div className="mb-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-100 pb-6 mb-6">
              <a
                href="https://maps.app.goo.gl/oSCpY9NASgY3HbRL6"
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <h2 className="text-2xl font-semibold text-gray-900 group-hover:underline">
                  Sati Yoga
                </h2>
                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1 group-hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Koh Phangan, Thailand
                </p>
              </a>
              <div className="mt-4 sm:mt-0 text-teal-600 font-semibold text-sm bg-teal-50 px-3 py-1 rounded-full inline-block">
                Jan 16 - 17
              </div>
            </div>

            {/* Video Section */}
            <div className="mb-6">
              <div className="flex justify-center">
                <div className="h-[280px] w-full overflow-hidden rounded-xl shadow-lg">
                  <video
                    src="/images/paulo-demo.mov"
                    playsInline
                    autoPlay
                    muted
                    loop
                    className="h-full w-full object-cover object-[50%_55%] sm:object-[50%_65%]"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-3">
              <p>
                Paulo from Portugal and Asti are coming to Koh Phangan for a few days to share their acro experience with the local community.
              </p>
              <p>
                Their workshops offer a challenging yet accessible approach to unlocking common issues with flows and icarians, helping you elevate your practice through technical refinement and playful movement.
              </p>
              <p>
                Sign up below to secure your spot!
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="e.g. Sarah Miller"
            />
          </div>

          <div className="mb-8">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="sarah@example.com"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acro Role
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="acroRole"
                  value="Base"
                  checked={formData.acroRole === 'Base'}
                  onChange={(e) => setFormData({ ...formData, acroRole: e.target.value })}
                  className="w-5 h-5 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                />
                <span className="ml-3 text-gray-700">Base</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="acroRole"
                  value="Flyer"
                  checked={formData.acroRole === 'Flyer'}
                  onChange={(e) => setFormData({ ...formData, acroRole: e.target.value })}
                  className="w-5 h-5 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                />
                <span className="ml-3 text-gray-700">Flyer</span>
              </label>
            </div>
          </div>

          {/* Session Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Sessions</h3>
            
            {/* Pricing Box */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 mb-6">
              {isEarlyBird && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    🎉 EARLY BIRD
                  </span>
                  <span className="text-xs text-teal-700">Book by Jan 2nd!</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`${isEarlyBird ? '' : 'opacity-50'}`}>
                  <div className="font-semibold text-teal-800 mb-1">
                    {isEarlyBird ? '→ ' : ''}Early Bird
                    {isEarlyBird && <span className="text-xs font-normal ml-1">(now!)</span>}
                  </div>
                  <div className="text-teal-700">
                    <span className="font-bold">€{PRICING.earlyBird.fullWeekend}</span> full weekend
                    <span className="text-teal-500 text-xs ml-1 line-through">€{FULL_WEEKEND_SESSION_COUNT * PRICING.regular.singleSession}</span>
                  </div>
                  <div className="text-teal-600">
                    <span className="font-bold">€{PRICING.earlyBird.singleSession}</span>/session
                    <span className="text-teal-500 text-xs ml-1 line-through">€{PRICING.regular.singleSession}</span>
                  </div>
                </div>

                <div className={`${isEarlyBird ? 'opacity-50' : ''}`}>
                  <div className="font-semibold text-gray-600 mb-1">
                    {!isEarlyBird ? '→ ' : ''}Regular
                    {!isEarlyBird && <span className="text-xs font-normal ml-1">(now)</span>}
                    {isEarlyBird && <span className="text-xs font-normal ml-1">(after Jan 2nd)</span>}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-bold">€{PRICING.regular.fullWeekend}</span> full weekend
                    <span className="text-gray-400 text-xs ml-1 line-through">€{FULL_WEEKEND_SESSION_COUNT * PRICING.regular.singleSession}</span>
                  </div>
                  <div className="text-gray-500">
                    <span className="font-bold">€{PRICING.regular.singleSession}</span>/session
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-teal-200 text-xs text-teal-700">
                💡 Best value: Book all 4 sessions and save up to €40!
              </div>
            </div>

            {/* Session Cards with Accordion */}
            <div className="space-y-3">
              {displaySessions.map((session) => {
                const isSelected = formData.selectedSessions.includes(session.id);
                const isExpanded = expandedSessions.has(session.id);
                
                return (
                  <div key={session.id} className="group">
                    <div
                      onClick={() => handleSessionToggle(session.id)}
                      className={`cursor-pointer border rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-teal-50 border-teal-600 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-teal-300'
                      } ${isExpanded ? 'rounded-b-none' : ''}`}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-teal-600 font-bold">
                            {session.date} • {session.time}
                          </div>
                          <div className="font-medium text-gray-900">{session.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{session.timeRange}</div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Details Toggle Button */}
                          <button
                            onClick={(e) => toggleExpanded(session.id, e)}
                            className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-teal-100 transition-colors"
                          >
                            <svg 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                            <span>{isExpanded ? 'Less' : 'Details'}</span>
                          </button>
                          
                          {/* Checkbox */}
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-teal-600 border-teal-600' 
                              : 'border-teal-500 bg-white'
                          }`}>
                            <svg 
                              className={`w-4 h-4 text-white transition-all ${
                                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className={`px-4 pb-4 pt-3 border border-t-0 rounded-b-xl ${
                        isSelected
                          ? 'bg-teal-50/50 border-teal-600'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex gap-4">
                          <img
                            src={session.image}
                            alt={session.name}
                            className="w-24 aspect-square sm:aspect-auto self-start sm:self-stretch object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="space-y-3 flex-1 min-w-0">
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                About this workshop
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {session.description}
                              </p>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Prerequisites
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {session.prereqs}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Total and Payment */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-gray-600 font-medium">Total</span>
                {pricing.appliedDeal && (
                  <div className="text-xs text-teal-600 font-medium">
                    {pricing.appliedDeal} applied!
                  </div>
                )}
              </div>
              <div className="text-right">
                {pricing.savings > 0 && (
                  <div className="text-gray-400 line-through text-sm">
                    €{pricing.referencePrice}
                  </div>
                )}
                <span className="text-2xl font-bold text-teal-700">
                  €{pricing.actualPrice}
                </span>
                {pricing.savings > 0 && (
                  <div className="text-xs text-green-600 font-semibold">
                    You save €{pricing.savings}!
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading || !isFormValid()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span>{loading ? 'Processing...' : 'Proceed to Payment'}</span>
              {!loading && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              )}
            </button>

            {formData.selectedSessions.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please select at least one session
              </p>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-gray-500 text-sm">
            <p className="font-medium mb-2">Cancellation policy</p>
            <p>
              If you are no longer able to attend the workshop, please contact us by email (paulofromportugal.acro@gmail.com) to let us know.
            </p>
            <p className="mt-2">
              If you cancel your reservation on January 10th or later, you can no longer receive a refund. In case we cancel the Workshop, you will get a reimbursement of the amount paid. The refund does not include any travel or any other expenses.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 text-sm">
        © 2025 Paulo from Portugal. All rights reserved.
      </footer>
    </div>
  );
}
